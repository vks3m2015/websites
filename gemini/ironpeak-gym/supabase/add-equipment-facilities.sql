-- Run this once in Supabase SQL Editor for an existing project.
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

alter table public.gym_equipment enable row level security;
alter table public.facilities enable row level security;

create policy "public read equipment" on public.gym_equipment for select using (true);
create policy "owner writes equipment" on public.gym_equipment for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());
create policy "public read facilities" on public.facilities for select using (true);
create policy "owner writes facilities" on public.facilities for all to authenticated using (public.is_gym_owner()) with check (public.is_gym_owner());

insert into public.gym_equipment (title, sort_order) values
  ('Squat racks', 1), ('Dumbbells & kettlebells', 2), ('Treadmills', 3),
  ('Adjustable benches', 4), ('Strength machines', 5), ('Exercise bikes', 6),
  ('Battle ropes', 7), ('Resistance bands', 8);
insert into public.facilities (title, sort_order) values
  ('Dedicated strength area', 1), ('Cardio zone', 2), ('Functional training space', 3),
  ('Personal training', 4), ('Changing rooms & showers', 5), ('Members lounge', 6);
