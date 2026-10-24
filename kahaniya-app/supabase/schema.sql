-- Kahaniya schema v3 (Supabase / Postgres) -- stories publish immediately, no moderation yet.
-- Accounts use Supabase Auth (email + password, stored hashed in auth.users).
-- Story = title + one text body. Headings are lines starting with "## " inside the body.
-- The author link lives in a SEPARATE table that nobody can read directly.
-- For a database that already has the v2 schema, run migration-remove-moderation.sql instead.

create type story_status as enum ('pending', 'approved', 'rejected', 'flagged');

create table stories (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 3 and 80),
  body        text not null check (char_length(body) between 100 and 20000),
  pen_name    text check (pen_name is null or char_length(pen_name) <= 30),  -- null = Anonymous
  status      story_status not null default 'approved',  -- kept so moderation can be added later
  created_at  timestamptz not null default now()
);

-- Hidden link between a story and its writer
create table story_authors (
  story_id  uuid primary key references stories(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade
);
create index story_authors_author on story_authors (author_id);
create index stories_status_created on stories (status, created_at desc);

-- ---------- Writer actions (the only way to create, edit or delete stories) ----------
-- Flood protection: max 3 submissions per hour per account.

create or replace function submit_story(p_title text, p_body text, p_pen_name text)
returns uuid language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); sid uuid;
begin
  if uid is null then raise exception 'sign in required'; end if;
  if (select count(*) from story_authors a join stories s on s.id = a.story_id
      where a.author_id = uid and s.created_at > now() - interval '1 hour') >= 3 then
    raise exception 'submission limit reached, try again later';
  end if;
  insert into stories(title, body, pen_name, status)
  values (p_title, p_body, nullif(trim(p_pen_name), ''), 'approved')
  returning id into sid;
  insert into story_authors(story_id, author_id) values (sid, uid);
  return sid;
end $$;

-- Editing updates the live story
create or replace function edit_story(p_id uuid, p_title text, p_body text, p_pen_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from story_authors where story_id = p_id and author_id = auth.uid()) then
    raise exception 'not your story';
  end if;
  update stories set title = p_title, body = p_body, pen_name = nullif(trim(p_pen_name), '')
  where id = p_id;
end $$;

create or replace function delete_story(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from story_authors where story_id = p_id and author_id = auth.uid()) then
    raise exception 'not your story';
  end if;
  delete from stories where id = p_id;
end $$;

-- Writer's own list; pen_name null means Anonymous
create or replace function my_stories()
returns table (id uuid, title text, body text, pen_name text, status story_status, created_at timestamptz)
language sql security definer set search_path = public as $$
  select s.id, s.title, s.body, s.pen_name, s.status, s.created_at
  from stories s join story_authors a on a.story_id = s.id
  where a.author_id = auth.uid()
  order by s.created_at desc;
$$;

-- When an account is deleted, its stories are deleted too
create or replace function delete_stories_of_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from stories where id in (select story_id from story_authors where author_id = old.id);
  return old;
end $$;

create trigger trg_delete_user_stories before delete on auth.users
for each row execute function delete_stories_of_user();

-- ---------- Row level security ----------
alter table stories enable row level security;
alter table story_authors enable row level security;

-- Public can only read stories. All writes go through the functions above.
create policy "public reads approved" on stories
  for select to anon, authenticated using (status = 'approved');

revoke insert, update, delete on stories from anon, authenticated;

-- story_authors has NO policies: nobody can read it directly.
-- Only the security definer functions above can use it.

revoke all on function submit_story, edit_story, delete_story, my_stories from public, anon;
grant execute on function submit_story, edit_story, delete_story, my_stories to authenticated;

-- Still needed in the Next.js app (not in SQL):
--  * Cloudflare Turnstile on sign up and on submit, checked in a server route
--  * rate limit on sign-ups per visitor (hashed IP + daily salt)
--  * add email verification later in Supabase Auth settings
