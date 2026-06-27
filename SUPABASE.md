# Connecting Supabase (optional cloud sync)

By default Annual Plan runs entirely in your browser. Turning on Supabase lets
each partner prep on their own device: you both enter the same short meeting
code and the app keeps the two of you in sync.

If the two environment variables below are not set, the app simply skips all of
this and works offline as before.

## 1. Create the project

1. Go to https://supabase.com and sign in (a free account is plenty).
2. Click **New project**. Pick any name, set a database password (save it
   somewhere), choose a region near you, and create it. Give it a minute to
   finish provisioning.

## 2. Create the database tables

1. In the project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in,
   and click **Run**. You should see "Success".

This makes one `meetings` table and two functions, locked down so only someone
with a meeting code can read or write that code's plan.

## 3. Get your keys

1. Open **Project Settings** (gear icon) > **API**.
2. Copy the **Project URL** (looks like `https://abcd1234.supabase.co`).
3. Copy the **anon public** key (a long string under "Project API keys"). This
   key is safe to ship in a browser app.

## 4. Add the keys to the app

1. Copy `.env.example` to a new file named `.env.local` in the project root.
2. Fill in your two values:

   ```
   VITE_SUPABASE_URL=https://abcd1234.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-anon-key...
   ```

3. Restart the dev server (`npm run dev`). `.env.local` is gitignored, so your
   keys never get committed.

## 5. Use it

- On the setup screen you'll now see a **Meeting code**. One of you starts a
  plan with the code; the other types that same code into their own setup
  screen to join. A small badge in the header shows the code and whether you're
  synced. Tap it to copy the code.
- Prep done on either device merges together. Refreshes and reconnects never
  lose work.

## Deploying

When you host the app (Vercel, Netlify, Cloudflare Pages, etc.), add the same
two variables in the host's environment settings so the deployed build can
reach Supabase.

## A note on the security model

There are no accounts. The meeting code is the only key, so treat it like a
shared password: anyone who has it can open that plan. The table is otherwise
sealed off, so a code can't be guessed by listing the database.
