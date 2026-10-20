# Iron Peak — single-gym website

## Implementation plan

1. **Content model:** Supabase holds one gym profile, public site content, and owner-only member and visitor records. The dashboard calculates active memberships, plans expiring within seven days, and current-month recorded membership payments.
2. **Website:** Next.js App Router renders a fast, responsive public site. It has graceful sample content before a database is connected.
3. **Owner dashboard:** `/admin` uses Supabase Auth. It edits the gym profile and adds/removes each content collection. Saves are immediately written to Postgres and appear on the public site on its next load.
4. **Images:** Create a public `gym-images` bucket in Supabase Storage, upload images, and paste their public URLs into the dashboard. The next enhancement would add drag-and-drop uploads directly in the dashboard.
5. **Launch:** Deploy the repository to Vercel, add the two environment variables there, and use the Vercel URL as the live website.

## Setup

1. Create a Supabase project.
2. In its SQL Editor, run [`supabase/schema.sql`](supabase/schema.sql). For an existing project, run [`supabase/add-member-management.sql`](supabase/add-member-management.sql) as well.
3. In `supabase/schema.sql`, replace `OWNER_EMAIL@example.com` with the gym owner’s actual email, then run the script. In **Authentication → Users**, create that same email/password account.
4. Copy `.env.local.example` to `.env.local` and add the project URL and anon key from **Project Settings → API**.
5. Install Node.js 20+, run `npm install`, then `npm run dev`.
6. Push to GitHub and import the repository in Vercel. Add the same environment variables in Vercel's project settings.

## Important production hardening

The supplied policy limits edits to the email registered in `private.gym_owners`. Also configure Supabase email confirmation and a strong owner password. Do not put a Supabase service-role key in this app.
