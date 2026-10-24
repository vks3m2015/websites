# Kahaniya

Stories are published immediately. There is no moderation yet.

1. Create a Supabase project. In the SQL editor, run `supabase/schema.sql`.
   (Already ran the older version? Run `supabase/migration-remove-moderation.sql` instead.)
2. Authentication > Sign In / Providers > Email: keep email + password on, and turn OFF "Confirm email" for now (add it later).
3. Copy `.env.example` to `.env.local` and fill in the three keys (project URL, publishable key, secret key).
4. `npm install` then `npm run dev`.
5. Deploy to Vercel and add the same three environment variables.

Removing a bad story: Supabase > Table Editor > stories > delete the row.

Not included yet: moderation, Cloudflare Turnstile, sign-up rate limits, email verification, a privacy policy page.
