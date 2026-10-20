-- Run this in Supabase SQL Editor to add the owner-only gym management area.
-- These tables intentionally have no public read policy because they contain member contact details.

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

alter table public.members enable row level security;
alter table public.visitors enable row level security;

create policy "owner manages members" on public.members for all to authenticated
  using (public.is_gym_owner()) with check (public.is_gym_owner());
create policy "owner manages visitors" on public.visitors for all to authenticated
  using (public.is_gym_owner()) with check (public.is_gym_owner());
