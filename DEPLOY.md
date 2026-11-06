# Deploying SceneHawk

Right now there is **one** deployable piece: the Next.js website. The Python
half of the repo is data-collection scripts (`chatbot/scripts/`) and a training
notebook that runs in Colab — neither is a service, so neither is deployed.

The website runs with no API keys, degrading to deterministic fallbacks
(see [AGENTS.md](AGENTS.md)).

## Website → Vercel

1. Import this repo in Vercel. It auto-detects Next.js at the root;
   `chatbot/` is excluded by [.vercelignore](.vercelignore). Leave the Root
   Directory as the repo root.
2. No environment variables are required to build. `/chat` needs
   `SUPABASE_URL` and `SUPABASE_ANON_KEY` (below). See
   [.env.example](.env.example) for the optional ones.
3. Deploy.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

## The /chat page: feelings search on Supabase

`/chat` answers from two Supabase tables. Nothing else is deployed: the trained
model runs once, offline, and its output is the feelings table.

```
reviews ─▶ feelings model (Colab GPU) ─▶ film_feelings   ─┐
films   ─▶ keywords (laptop)          ─▶ film_keywords   ─┼─▶ match_films() ◀── /api/chat (Vercel)
films   ─▶ full-text index (Postgres)  ─▶ films.search_tsv ─┘
```

The model is ~330 MB plus PyTorch, which doesn't fit in a Vercel function, so
it never runs on Vercel. Rerun step 3 whenever the model is retrained.

### One-time setup

1. **Database.** In the Supabase SQL editor, run
   [chatbot/db/schema.sql](chatbot/db/schema.sql) (if not done already), then
   [chatbot/db/migrations/2026-11-06_search.sql](chatbot/db/migrations/2026-11-06_search.sql).
   The migration is safe to re-run. It also turns on row level security, so
   the public key can't read or change the tables.
2. **Description table.** From `chatbot/`, with `SUPABASE_DB_URL` in
   `chatbot/.env`:
   ```bash
   pip install -r requirements.txt
   python scripts/13_build_descriptions.py
   ```
3. **Feelings table.** Open
   [chatbot/notebooks/fill_feelings_table.ipynb](chatbot/notebooks/fill_feelings_table.ipynb)
   in Colab and Run all (T4 GPU, about 15 minutes). It loads the model saved in
   Google Drive by `train_feelings.ipynb` and runs
   `scripts/12_score_reviews.py`.
4. **Vercel.** Project > Settings > Environment Variables, add
   `SUPABASE_URL` and `SUPABASE_ANON_KEY` (Supabase > Project Settings > API),
   then redeploy. `CHATBOT_URL` is no longer used and can be deleted.
5. **Check.** `GET /api/chat` on the deployed site should return
   `{"status":"ok","films":…,"films_with_feelings":…,"model_version":"…"}`.

The request and response shapes are in
[chatbot/docs/api-contract.md](chatbot/docs/api-contract.md).
