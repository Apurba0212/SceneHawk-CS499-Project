-- 2026-11-06: the query half of the pipeline.
--
-- Adds what the website needs to answer a request from the two tables:
--   * films.search_tsv     full-text index over title, description and genres
--                          (the description match, no embedding model needed)
--   * match_films(...)     one function the website calls: genre filter,
--                          feeling match, description match, combined score
--   * row level security   so the public anon key can only call the function,
--                          never read or write the tables directly
--
-- Run once in the Supabase SQL editor, after schema.sql. Safe to re-run.
-- The tables are filled by scripts/12_score_reviews.py (film_feelings) and
-- scripts/13_build_descriptions.py (film_keywords).

-- ---------------------------------------------------------------------------
-- 1. Description search index
-- ---------------------------------------------------------------------------
-- array_to_string is only STABLE, so it can't sit in a generated column. This
-- small wrapper is safe to mark IMMUTABLE: it joins text with a fixed space.
create or replace function genres_text(g text[]) returns text
language sql immutable parallel safe
as $$ select coalesce(array_to_string(g, ' '), '') $$;

alter table films add column if not exists search_tsv tsvector
    generated always as (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(overview, '')), 'B') ||
        setweight(to_tsvector('english', genres_text(genres)), 'C')
    ) stored;

create index if not exists films_search_idx on films using gin (search_tsv);
create index if not exists film_keywords_keyword_idx on film_keywords (keyword);

-- ---------------------------------------------------------------------------
-- 2. match_films - the whole query step in one call
--
-- p_feelings      feelings the user wants, already mapped onto the 28
-- p_avoid         feelings the user asked to avoid ("not scary")
-- p_story_terms   lower-case story words ("heist", "space", "father")
-- p_genres        TMDB genre names to keep (any of them); empty = no filter
-- p_not_genres    TMDB genre names to drop ("not horror")
-- p_feeling_weight  0..1, how much the feeling match counts vs the story match
-- p_k             how many films to return
--
-- Feeling scores are divided by the best score any film has for that feeling,
-- so a weak model's low probabilities still rank films sensibly. These are
-- retrieval scores, not quality ratings.
-- ---------------------------------------------------------------------------
create or replace function match_films(
    p_feelings       text[]  default '{}',
    p_avoid          text[]  default '{}',
    p_story_terms    text[]  default '{}',
    p_genres         text[]  default '{}',
    p_not_genres     text[]  default '{}',
    p_feeling_weight real    default 0.5,
    p_k              integer default 6
)
returns table (
    tmdb_id         integer,
    title           text,
    year            integer,
    genres          text[],
    overview        text,
    vote_average    real,
    review_count    integer,
    feeling_score   real,
    story_score     real,
    score           real,
    feelings        jsonb,
    evidence        text,
    evidence_feeling text,
    low_confidence  boolean,
    genre_relaxed   boolean,
    model_version   text
)
language plpgsql stable security definer
set search_path = public
as $$
#variable_conflict use_column
declare
    q        tsquery;
    relaxed  boolean := false;
    w        real := least(greatest(coalesce(p_feeling_weight, 0.5), 0), 1);
    k        integer := least(greatest(coalesce(p_k, 6), 1), 25);
    want     text[] := coalesce(p_feelings, '{}');
    avoid    text[] := coalesce(p_avoid, '{}');
    keep     text[] := coalesce(p_genres, '{}');
    drop_g   text[] := coalesce(p_not_genres, '{}');
    terms    text[];
begin
    -- Story words: letters and digits only, so user text can't break the query.
    select coalesce(array_agg(distinct t), '{}') into terms
      from unnest(coalesce(p_story_terms, '{}')) as t
     where t ~ '^[a-z0-9]{2,30}$';
    if cardinality(terms) > 0 then
        -- OR the words together: a film matching some of them still counts.
        q := to_tsquery('english', array_to_string(terms, ' | '));
    end if;

    -- Genre filter loosens when it would leave too few films.
    if cardinality(keep) > 0 and (
        select count(*) from films f
         where f.genres && keep and not (f.genres && drop_g)
    ) < k then
        relaxed := true;
        keep := '{}';
    end if;

    return query
    with cand as (
        select f.* from films f
         where (cardinality(keep) = 0 or f.genres && keep)
           and not (f.genres && drop_g)
    ),
    best as (       -- the top score any film has, per feeling
        select ff.feeling, max(ff.score) as m
          from film_feelings ff group by ff.feeling
    ),
    feel as (
        select ff.tmdb_id,
               avg(ff.score / nullif(b.m, 0)) filter (where ff.feeling = any (want))  as want_s,
               avg(ff.score / nullif(b.m, 0)) filter (where ff.feeling = any (avoid)) as avoid_s
          from film_feelings ff join best b using (feeling)
         where ff.tmdb_id in (select c.tmdb_id from cand c)
         group by ff.tmdb_id
    ),
    story as (
        select c.tmdb_id,
               case when q is null then 0
                    else ts_rank_cd(c.search_tsv, q, 32) end as fts,
               (select count(*) from film_keywords kw
                 where kw.tmdb_id = c.tmdb_id and kw.keyword = any (terms))::real
                 / greatest(cardinality(terms), 1) as kw_s
          from cand c
    ),
    story_n as (
        select s.tmdb_id,
               0.8 * coalesce(s.fts / nullif(max(s.fts) over (), 0), 0)
             + 0.2 * s.kw_s as s_score
          from story s
    ),
    scored as (
        -- A film scored from 1-3 reviews is pulled toward 0, so it can't top
        -- the feeling ranking on one lucky review: x 0.25 at 1 review,
        -- 0.77 at 10, 0.91 at 30.
        select c.*,
               (coalesce(fe.want_s, 0)  * c.review_count / (c.review_count + 3.0))::real as f_score,
               (coalesce(fe.avoid_s, 0) * c.review_count / (c.review_count + 3.0))::real as a_score,
               coalesce(sn.s_score, 0)::real as s_score
          from cand c
          left join feel fe on fe.tmdb_id = c.tmdb_id
          left join story_n sn on sn.tmdb_id = c.tmdb_id
    ),
    ranked as (
        select s.*,
               (case
                  when cardinality(want) = 0 and cardinality(terms) = 0 then 0
                  when cardinality(want) = 0 then s.s_score
                  when cardinality(terms) = 0 then s.f_score
                  else w * s.f_score + (1 - w) * s.s_score
                end - 0.5 * s.a_score)::real as total
          from scored s
    ),
    top as (
        select r.* from ranked r
         order by r.total desc, r.vote_count desc nulls last
         limit k
    )
    select t.tmdb_id, t.title, t.year, t.genres, t.overview, t.vote_average,
           t.review_count,
           round(t.f_score::numeric, 3)::real,
           round(t.s_score::numeric, 3)::real,
           round(greatest(t.total, 0)::numeric, 3)::real,
           -- The film's scores for the requested feelings, or its top 3.
           coalesce((
               select jsonb_object_agg(x.feeling, round(x.score::numeric, 3))
                 from (select ff.feeling, ff.score from film_feelings ff
                        where ff.tmdb_id = t.tmdb_id
                          and (cardinality(want) = 0 or ff.feeling = any (want))
                        order by ff.score desc limit 3) x
           ), '{}'::jsonb),
           ev.snippet,
           ev.feeling,
           t.review_count < 20,
           relaxed,
           ev.model_version
      from top t
      left join lateral (
          -- Quote the review the model was surest about for the best feeling.
          select ff.feeling, ff.model_version,
                 left(regexp_replace(r.text, '\s+', ' ', 'g'), 280) as snippet
            from film_feelings ff
            left join reviews r on r.review_id = ff.evidence_review_id
           where ff.tmdb_id = t.tmdb_id
             and (cardinality(want) = 0 or ff.feeling = any (want))
           order by ff.score desc
           limit 1
      ) ev on true
     order by t.total desc, t.vote_count desc nulls last;
end;
$$;

-- How many films the feelings table covers - for the website's health check.
create or replace function search_status()
returns table (films integer, films_with_feelings integer, model_version text)
language sql stable security definer
set search_path = public
as $$
    select (select count(*)::int from films),
           (select count(distinct tmdb_id)::int from film_feelings),
           (select max(model_version) from film_feelings)
$$;

-- ---------------------------------------------------------------------------
-- 3. Lock the tables, open the two functions
--
-- With RLS on and no policies, the anon and authenticated roles can't read or
-- write any row. The scripts connect as the database owner, which RLS doesn't
-- apply to, so they keep working. The functions run as their owner (security
-- definer), so the website gets search results without table access.
-- ---------------------------------------------------------------------------
alter table feelings      enable row level security;
alter table films         enable row level security;
alter table reviews       enable row level security;
alter table review_labels enable row level security;
alter table film_feelings enable row level security;
alter table film_keywords enable row level security;

revoke all on function match_films(text[], text[], text[], text[], text[], real, integer) from public;
revoke all on function search_status() from public;
grant execute on function match_films(text[], text[], text[], text[], text[], real, integer) to anon, authenticated;
grant execute on function search_status() to anon, authenticated;
