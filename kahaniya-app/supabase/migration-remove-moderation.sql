-- Run ONCE in the Supabase SQL Editor if you already ran the v2 schema.
-- Removes moderation and makes stories go live immediately. Existing stories stay.

-- 1. Moderator permissions and policies
drop policy if exists "moderators read all" on stories;
drop policy if exists "moderators update status" on stories;
revoke update on stories from authenticated, anon;

-- 2. Auto-flagging and the moderator tables
drop trigger if exists trg_flag_story on stories;
drop function if exists flag_story();
drop function if exists story_headings(text);
drop table if exists moderation_flags;
drop table if exists moderators;

-- 3. Review columns are no longer used
alter table stories drop column if exists reviewed_at;
alter table stories drop column if exists reviewed_by;

-- 4. New stories default to published; publish anything already waiting
alter table stories alter column status set default 'approved';
update stories set status = 'approved' where status = 'pending';

-- 5. Writer functions without the review step
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

create or replace function edit_story(p_id uuid, p_title text, p_body text, p_pen_name text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from story_authors where story_id = p_id and author_id = auth.uid()) then
    raise exception 'not your story';
  end if;
  update stories set title = p_title, body = p_body, pen_name = nullif(trim(p_pen_name), '')
  where id = p_id;
end $$;
