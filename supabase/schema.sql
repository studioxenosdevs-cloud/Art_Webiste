-- 1. Create Tables
create table if not exists public.artworks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  medium text not null,
  dimensions text not null,
  price_pkr integer not null,
  status text not null default 'available',
  image_url text,
  description text,
  created_at timestamptz default now() not null
);

create table if not exists public.inquiries (
  id uuid default gen_random_uuid() primary key,
  artwork_id uuid references public.artworks(id) on delete set null,
  customer_name text not null,
  phone text not null,
  message text,
  created_at timestamptz default now() not null
);

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  author_name text not null,
  rating numeric not null check (rating >= 1 and rating <= 5),
  comment text,
  avatar_url text,
  created_at timestamptz default now() not null
);

-- 2. Enable Row Level Security
alter table public.artworks enable row level security;
alter table public.inquiries enable row level security;
alter table public.reviews enable row level security;

-- 3. Artworks Policies
create policy "Public can view artworks"
  on public.artworks for select using (true);

create policy "Admins can insert/update/delete artworks"
  on public.artworks for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4. Reviews Policies
create policy "Public can view reviews"
  on public.reviews for select using (true);

create policy "Admins can insert/update/delete reviews"
  on public.reviews for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Public can submit inquiries"
  on public.inquiries for insert
  with check (true);

create policy "Admins can view and manage inquiries"
  on public.inquiries for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Example: create a specific admin user (run in Supabase SQL editor)
-- Replace or remove this block if you prefer to create users via the Supabase dashboard.
-- This will insert `zel@gmail.com` with the provided password if the email does not already exist.
--
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
--
-- INSERT INTO auth.users (
--   instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
--   recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
--   created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
-- )
-- SELECT
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'zel@gmail.com', -- Admin Email (provided)
--   crypt('zel_brush verify', gen_salt('bf')), -- Admin Password (provided)
--   now(), now(), now(),
--   '{"provider":"email","providers":["email"]}',
--   '{"name":"Admin"}',
--   now(), now(), '', '', '', ''
-- WHERE NOT EXISTS (
--   SELECT 1 FROM auth.users WHERE email = 'zel@gmail.com'
-- );