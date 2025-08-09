# DigPikasoClone - Ready-to-deploy Package

This package contains a frontend (React + Tailwind) and backend (Vercel serverless)
plus Supabase SQL scripts to run a Pikaso-like AI image generator using:
- Firebase Authentication (Web)
- Supabase (Storage + Postgres)
- Gemini Pro (Google AI) for image generation

IMPORTANT: This package does **not** contain any secrets. You must paste your rotated keys
into the `.env` entries before deploying. See `.env.example`.

## Quick steps (no-code)
1. Create a new GitHub repo named `digpikasoclone` (public or private).
2. Upload the contents of this folder, or use Git to push (instructions below).
3. In Vercel, import the repository and add Environment Variables (see `.env.example`).
4. Deploy.
5. In Supabase, run `db/schema.sql` in SQL Editor.
6. In Supabase Storage create a public bucket named `images`.
7. In Vercel, enable Cron (or use a scheduler) to call `/api/resetCredits` daily (midnight UTC).

## Git push (if using terminal)
```bash
cd digpikasoclone
git init
git add .
git commit -m "Initial commit - DigPikasoClone"
git remote add origin https://github.com/<your-username>/digpikasoclone.git
git branch -M main
git push -u origin main
```

## Files of interest
- `/frontend` - React app (run `npm install` and `npm run dev` locally)
- `/backend/api` - Vercel functions (`generate.js`, `resetCredits.js`)
- `/db/schema.sql` - Supabase table creation SQL
- `.env.example` - environment variables to set in Vercel

## After deployment
- Paste your Firebase config into the frontend `.env` values (see `.env.example`).
- Paste Supabase keys and Gemini API key into Vercel env.
- Test signup and first generation.

## Security notes
- NEVER commit service_role keys or API keys to public repos.
- Rotate any keys you already posted publicly.
