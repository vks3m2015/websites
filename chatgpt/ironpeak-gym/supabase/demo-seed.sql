-- Demo seed data for Iron Peak.
-- Run this after running schema.sql in Supabase SQL Editor.

-- Clear demo data so the script can be re-run safely.
TRUNCATE TABLE public.gallery_images, public.membership_plans, public.facilities, public.gym_equipment,
  public.services, public.trainers, public.opening_hours, public.visitors, public.members, public.gym_settings
  RESTART IDENTITY CASCADE;

DELETE FROM private.gym_owners WHERE email IN ('demo@ironpeak.fit', 'OWNER_EMAIL@example.com');

INSERT INTO private.gym_owners (email)
VALUES ('demo@ironpeak.fit');

INSERT INTO public.gym_settings (
  id,
  name,
  description,
  phone,
  email,
  address,
  hero_image
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Iron Peak',
  'The training ground for people who are ready to feel stronger, move better, and show up for themselves.',
  '+91 98765 43210',
  'hello@ironpeak.fit',
  '12 Peak Avenue, Bengaluru, Karnataka',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  hero_image = EXCLUDED.hero_image;

INSERT INTO public.opening_hours (day, opens, closes, sort_order)
VALUES
  ('Monday', '06:00', '22:00', 1),
  ('Tuesday', '06:00', '22:00', 2),
  ('Wednesday', '06:00', '22:00', 3),
  ('Thursday', '06:00', '22:00', 4),
  ('Friday', '06:00', '21:00', 5),
  ('Saturday', '08:00', '18:00', 6),
  ('Sunday', '08:00', '14:00', 7);

INSERT INTO public.trainers (name, role, bio, image_url, sort_order)
VALUES
  ('Aarav Nair', 'Strength Coach', 'Helps members build foundational strength and improve technique with confidence.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80', 1),
  ('Meera Shah', 'Conditioning Coach', 'Transforms endurance and mobility with structured conditioning circuits and recovery cues.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80', 2),
  ('Karan Bose', 'Athletic Performance', 'Focuses on explosive power, agility work, and sports-inspired performance progress.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80', 3),
  ('Nisha Rao', 'Personal Trainer', 'Builds personalized plans for beginners, busy professionals, and advanced lifters.', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80', 4);

INSERT INTO public.services (title, description, sort_order)
VALUES
  ('Strength training', 'Progressive lifting plans designed for long-term muscle and power gains.', 1),
  ('Functional fitness', 'Movement-based sessions to improve mobility, stability, and everyday strength.', 2),
  ('Personal coaching', 'One-to-one programming and accountability for measurable results.', 3),
  ('Group classes', 'Energetic classes focused on conditioning, endurance, and community.', 4);

INSERT INTO public.gym_equipment (title, sort_order)
VALUES
  ('Squat racks', 1),
  ('Dumbbells & kettlebells', 2),
  ('Treadmills', 3),
  ('Adjustable benches', 4),
  ('Strength machines', 5);

INSERT INTO public.facilities (title, sort_order)
VALUES
  ('Dedicated strength area', 1),
  ('Cardio zone', 2),
  ('Functional training space', 3),
  ('Changing rooms & showers', 4),
  ('Members lounge', 5);

INSERT INTO public.membership_plans (name, price, period, description, sort_order)
VALUES
  ('START', '₹1,499', 'month', 'Open gym access for new members.', 1),
  ('BUILD', '₹2,299', 'month', 'Gym access plus group classes.', 2),
  ('PEAK', '₹3,499', 'month', 'Unlimited access with coaching support.', 3),
  ('TEAM', '₹4,999', 'month', 'Best for couples and small training groups.', 4);

INSERT INTO public.gallery_images (image_url, caption, sort_order)
VALUES
  ('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80', 'Strength zone', 1),
  ('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=900&q=80', 'Cardio area', 2),
  ('https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=900&q=80', 'Functional training', 3),
  ('https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=900&q=80', 'Weight room', 4),
  ('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=900&q=80', 'Coach support', 5);

INSERT INTO public.members (
  name,
  mobile,
  join_date,
  plan_name,
  plan_expiry,
  amount_paid,
  payment_date,
  notes
)
VALUES
  ('Rohan Mehta', '9876501234', '2026-09-01', 'START', '2026-10-01', 1499, '2026-09-01', 'Prefers morning sessions.'),
  ('Sneha Verma', '9876502345', '2026-09-05', 'BUILD', '2026-10-05', 2299, '2026-09-05', 'Interested in mobility work.'),
  ('Arjun Patil', '9876503456', '2026-08-20', 'PEAK', '2026-09-30', 3499, '2026-08-20', 'On coaching plan and tracking strength.'),
  ('Priya Nair', '9876504567', '2026-09-10', 'START', '2026-10-10', 1499, '2026-09-10', 'New member, wants beginner guidance.'),
  ('Vikram Iyer', '9876505678', '2026-09-15', 'TEAM', '2026-10-15', 4999, '2026-09-15', 'Plans to train with partner.' );

INSERT INTO public.visitors (
  name,
  mobile,
  visit_date,
  purpose,
  follow_up_date,
  notes
)
VALUES
  ('Dev Kapoor', '9000011111', '2026-09-18', 'Gym enquiry', '2026-09-25', 'Asked about beginner-friendly routines.'),
  ('Sonia Menon', '9000012222', '2026-09-19', 'Trial session', '2026-09-26', 'Wants to try strength training.'),
  ('Farhan Ali', '9000013333', '2026-09-20', 'Membership inquiry', '2026-09-27', 'Asked about pricing and timings.'),
  ('Aisha Khan', '9000014444', '2026-09-21', 'Personal training', '2026-09-28', 'Interested in coaching and nutrition support.'),
  ('Nikhil Das', '9000015555', '2026-09-22', 'Gym enquiry', '2026-09-29', 'Planning to start in the next two weeks.');
