#!/usr/bin/env python3
"""Step 13 - fill the description table (film_keywords).

For each film, picks the words that best describe its story: the top TF-IDF
terms of its description plus its genres. The website's description match
uses these together with the full-text index on films (search_tsv, added by
db/migrations/2026-11-06_search.sql), so no embedding model or API key is
needed. The embedding column stays empty for now.

No GPU and no model: runs in a few seconds on a laptop.

Run:
  python scripts/13_build_descriptions.py              # read films from Supabase, write keywords
  python scripts/13_build_descriptions.py --dry-run    # print a sample, write nothing
  python scripts/13_build_descriptions.py --films data/films_starter.json --dry-run

Needs: scikit-learn, psycopg2-binary, python-dotenv, SUPABASE_DB_URL.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent      # chatbot/
TOP_K = 10
WORD = re.compile(r"^[a-z][a-z0-9]{2,29}$")       # what the website sends as story words


def connect():
    import psycopg2
    url = os.environ.get("SUPABASE_DB_URL")
    if not url:
        sys.exit("SUPABASE_DB_URL is not set (chatbot/.env or the environment).")
    return psycopg2.connect(url)


def read_films(args):
    if args.films:
        rows = json.loads(Path(args.films).read_text(encoding="utf-8"))
        return [(r["tmdb_id"], r.get("overview") or "", r.get("genres") or []) for r in rows]
    conn = connect()
    with conn, conn.cursor() as cur:
        cur.execute("select tmdb_id, coalesce(overview, ''), coalesce(genres, '{}') from films")
        rows = cur.fetchall()
    conn.close()
    return rows


def keywords(films):
    from sklearn.feature_extraction.text import TfidfVectorizer

    # Words in at least 2 descriptions and at most 5% of them: specific enough
    # to say something about the story, common enough to be matched by a user.
    vec = TfidfVectorizer(stop_words="english", lowercase=True, min_df=2, max_df=0.05,
                          token_pattern=r"(?u)\b[a-zA-Z][a-zA-Z0-9]{2,}\b")
    tfidf = vec.fit_transform([o for _, o, _ in films])
    vocab = vec.get_feature_names_out()

    out = []
    for i, (tmdb, _, genres) in enumerate(films):
        row = tfidf.getrow(i)
        order = row.data.argsort()[::-1][:TOP_K]
        words = [vocab[row.indices[j]] for j in order]
        # Genres as words too ("science fiction" -> science, fiction).
        for g in genres:
            words += g.lower().split()
        seen = []
        for w in words:
            if WORD.match(w) and w not in seen:
                seen.append(w)
        out.extend((tmdb, w) for w in seen)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--films", help="read films from this JSON instead of Supabase")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    try:
        from dotenv import load_dotenv
        load_dotenv(ROOT / ".env")
    except ImportError:
        pass

    films = read_films(args)
    rows = keywords(films)
    print(f"{len(films)} films -> {len(rows)} keywords")
    sample = {}
    for tmdb, w in rows:
        sample.setdefault(tmdb, []).append(w)
    for tmdb in list(sample)[:3]:
        print(f"  {tmdb}: {', '.join(sample[tmdb])}")

    if args.dry_run:
        print("dry run: nothing written")
        return

    from psycopg2.extras import execute_values
    conn = connect()
    with conn, conn.cursor() as cur:
        cur.execute("delete from film_keywords")      # rebuilt from scratch each run
        execute_values(cur, "insert into film_keywords (tmdb_id, keyword) values %s",
                       rows, page_size=5000)
    conn.close()
    print("film_keywords written")


if __name__ == "__main__":
    main()
