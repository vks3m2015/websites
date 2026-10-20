-- Run this in Supabase: SQL Editor. Then create the owner under Authentication > Users.

create table if not exists public.gym_settings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  phone text default '',
  email text default '',
  address text default '',
  hero_image text default ''
);

create table if not exists public.opening_hours (
  id uuid primary key default gen_random_uuid(),
  day text not null,
  opens text not null,
  closes text not null,
  sort_order integer default 0
);

create table if not exists public.trainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text default '',
  bio text default '',
  image_url text default '',
  sort_order integer default 0
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  sort_order integer default 0
);

create table if not exists public.gym_equipment (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order integer default 0
);

create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  sort_order integer default 0
);

create table if not exists public.membership_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text default '',
  period text default 'month',
  description text default '',
  sort_order integer default 0
);

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text default '',
  sort_order integer default 0
);

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null,
  join_date date not null default current_date,
  plan_name text not null default 'Standard',
  plan_expiry date not null,
  amount_paid numeric(10,2) not null default 0,
  payment_date date not null default current_date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile text not null default '',
  visit_date date not null default current_date,
  purpose text not null default 'Gym enquiry',
  follow_up_date date,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists members_plan_expiry_idx on public.members (plan_expiry);
create index if not exists members_payment_date_idx on public.members (payment_date);
create index if not exists visitors_visit_date_idx on public.visitors (visit_date);

alter table public.gym_settings enable row level security;
alter table public.opening_hours enable row level security;
alter table public.trainers enable row level security;
alter table public.services enable row level security;
alter table public.gym_equipment enable row level security;
alter table public.facilities enable row level security;
alter table public.membership_plans enable row level security;
alter table public.gallery_images enable row level security;
alter table public.members enable row level security;
alter table public.visitors enable row level security;

-- Only the designated owner can write. Replace this email before running the script.
create schema if not exists private;

create table if not exists private.gym_owners (
  email text primary key
);

insert into private.gym_owners (email)
values ('OWNER_EMAIL@example.com')
on conflict do nothing;

create or replace function public.is_gym_owner()
returns boolean
language sql
security definer
set search_path = private, public
as $$
  select exists (
    select 1
    from private.gym_owners
    where email = (auth.jwt() ->> 'email')
  );
$$;

revoke all on table private.gym_owners from anon, authenticated;
grant execute on function public.is_gym_owner() to anon, authenticated;

-- Anyone can see published content. Only the designated owner may make changes.
create policy "public read settings" on public.gym_settings for select using (true);
create policy "owner writes settings" on public.gym_settings for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

create policy "public read hours" on public.opening_hours for select using (true);
create policy "owner writes hours" on public.opening_hours for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

create policy "public read trainers" on public.trainers for select using (true);
create policy "owner writes trainers" on public.trainers for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

create policy "public read services" on public.services for select using (true);
create policy "owner writes services" on public.services for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

create policy "public read equipment" on public.gym_equipment for select using (true);
create policy "owner writes equipment" on public.gym_equipment for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

create policy "public read facilities" on public.facilities for select using (true);
create policy "owner writes facilities" on public.facilities for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

create policy "public read plans" on public.membership_plans for select using (true);
create policy "owner writes plans" on public.membership_plans for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

create policy "public read gallery" on public.gallery_images for select using (true);
create policy "owner writes gallery" on public.gallery_images for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

create policy "owner manages members" on public.members for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());
create policy "owner manages visitors" on public.visitors for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

insert into public.gym_settings (id, name, description, phone, email, address)
values ('00000000-0000-0000-0000-000000000001', 'Iron Peak', 'The training ground for people ready to feel stronger.', '', '', '')
on conflict (id) do nothing;

insert into public.gym_equipment (title, sort_order)
values
  ('Squat racks', 1),
  ('Dumbbells & kettlebells', 2),
  ('Treadmills', 3),
  ('Adjustable benches', 4),
  ('Strength machines', 5),
  ('Exercise bikes', 6),
  ('Battle ropes', 7),
  ('Resistance bands', 8);

insert into public.facilities (title, sort_order)
values
  ('Dedicated strength area', 1),
  ('Cardio zone', 2),
  ('Functional training space', 3),
  ('Personal training', 4),
  ('Changing rooms & showers', 5),
  ('Members lounge', 6);
