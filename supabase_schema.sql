-- Zelbrush master Supabase schema. Safe to run repeatedly in a fresh project.
-- The frontend uses camelCase models, while this schema intentionally exposes
-- snake_case columns through PostgREST.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.artworks (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  description text not null default '',
  category text not null default 'sufi' check (category in ('sufi', 'calligraphy', 'nature', 'custom')),
  medium text not null default '',
  dimensions text not null default '',
  price_pkr integer not null default 0 check (price_pkr >= 0),
  status text not null default 'available' check (status in ('available', 'sold')),
  image_url text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  artwork_id uuid references public.artworks(id) on delete set null,
  artwork_title text not null default '',
  customer_name text not null,
  email text,
  phone text not null,
  shipping_address text not null,
  custom_framing boolean not null default false,
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'completed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default 'Anonymous',
  comment text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  avatar_url text,
  image_url text,
  is_approved boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.timeline (
  id uuid primary key default gen_random_uuid(),
  step_number text not null,
  sort_order integer not null unique check (sort_order >= 0),
  title text not null,
  subtitle text,
  description text not null,
  badge text,
  accent text,
  icon_name text,
  image_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- This fixed text key is intentional: the settings screen upserts id = 'admin'.
create table if not exists public.settings (
  id text primary key default 'admin',
  notification_email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_artworks_updated_at on public.artworks;
create trigger set_artworks_updated_at before update on public.artworks for each row execute function public.set_updated_at();
drop trigger if exists set_inquiries_updated_at on public.inquiries;
create trigger set_inquiries_updated_at before update on public.inquiries for each row execute function public.set_updated_at();
drop trigger if exists set_reviews_updated_at on public.reviews;
create trigger set_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
drop trigger if exists set_timeline_updated_at on public.timeline;
create trigger set_timeline_updated_at before update on public.timeline for each row execute function public.set_updated_at();
drop trigger if exists set_settings_updated_at on public.settings;
create trigger set_settings_updated_at before update on public.settings for each row execute function public.set_updated_at();

create index if not exists artworks_created_at_idx on public.artworks (created_at desc);
create index if not exists artworks_category_idx on public.artworks (category);
create index if not exists artworks_status_idx on public.artworks (status);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_artwork_id_idx on public.inquiries (artwork_id);
create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists reviews_approved_created_at_idx on public.reviews (is_approved, created_at desc);
create index if not exists timeline_sort_order_idx on public.timeline (sort_order);

alter table public.artworks enable row level security;
alter table public.inquiries enable row level security;
alter table public.reviews enable row level security;
alter table public.timeline enable row level security;
alter table public.settings enable row level security;

-- Recreate policies so the script can be re-run after policy changes.
drop policy if exists "Public can read artworks" on public.artworks;
create policy "Public can read artworks" on public.artworks for select using (true);
drop policy if exists "Authenticated users manage artworks" on public.artworks;
create policy "Authenticated users manage artworks" on public.artworks for all to authenticated using (true) with check (true);

drop policy if exists "Public can read inquiries" on public.inquiries;
drop policy if exists "Authenticated users read inquiries" on public.inquiries;
create policy "Authenticated users read inquiries" on public.inquiries for select to authenticated using (true);
drop policy if exists "Public can submit inquiries" on public.inquiries;
create policy "Public can submit inquiries" on public.inquiries for insert with check (true);
drop policy if exists "Authenticated users manage inquiries" on public.inquiries;
create policy "Authenticated users manage inquiries" on public.inquiries for all to authenticated using (true) with check (true);

drop policy if exists "Public can read reviews" on public.reviews;
drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews" on public.reviews for select using (is_approved = true or auth.role() = 'authenticated');
drop policy if exists "Public can submit reviews" on public.reviews;
create policy "Public can submit reviews" on public.reviews for insert with check (is_approved = false);
drop policy if exists "Authenticated users manage reviews" on public.reviews;
create policy "Authenticated users manage reviews" on public.reviews for all to authenticated using (true) with check (true);

drop policy if exists "Public can read timeline" on public.timeline;
create policy "Public can read timeline" on public.timeline for select using (true);
drop policy if exists "Authenticated users manage timeline" on public.timeline;
create policy "Authenticated users manage timeline" on public.timeline for all to authenticated using (true) with check (true);

drop policy if exists "Authenticated users read settings" on public.settings;
drop policy if exists "Public can read settings" on public.settings;
create policy "Authenticated users read settings" on public.settings for select to authenticated using (true);
drop policy if exists "Authenticated users manage settings" on public.settings;
create policy "Authenticated users manage settings" on public.settings for all to authenticated using (true) with check (true);

-- The application uploads artwork images to this public bucket.
insert into storage.buckets (id, name, public)
values ('artworks', 'artworks', true)
on conflict (id) do update set public = excluded.public;
drop policy if exists "Public can view artwork images" on storage.objects;
create policy "Public can view artwork images" on storage.objects for select using (bucket_id = 'artworks');
drop policy if exists "Authenticated users manage artwork images" on storage.objects;
create policy "Authenticated users manage artwork images" on storage.objects for all to authenticated using (bucket_id = 'artworks') with check (bucket_id = 'artworks');

insert into public.settings (id, notification_email)
values ('admin', null)
on conflict (id) do nothing;

insert into public.timeline (step_number, sort_order, title, subtitle, description, badge, accent, icon_name, image_url)
values
  ('01', 1, 'Concept & Spiritual Sketch', 'Vision & Sacred Geometry', 'Every piece begins with a dialogue. We explore the sacred verses, emotional resonance, and space palette — translating devotion into balanced sketches.', 'Phase 1 · Ideation', 'from-violet-100 to-violet-200/50', 'PencilRuler', ''),
  ('02', 2, 'Handcrafted Painting & 24k Gold Leafing', 'Devotional Craftsmanship', 'The sketch comes alive through layered archival acrylics, Sufi textured strokes, and illumination with genuine 24k gold leaf applied with surgical precision.', 'Phase 2 · Masterwork', 'from-amber-100 to-amber-200/50', 'Brush', ''),
  ('03', 3, 'Museum-Grade Framing & Curation', 'Preservation & Elegance', 'Completed masterworks receive protective archival UV isolation coats and are set into bespoke handcrafted floating frames tailored to highlight each silhouette.', 'Phase 3 · Framing', 'from-violet-200/60 to-violet-300/40', 'Frame', ''),
  ('04', 4, 'Insured White-Glove Global Delivery', 'To Your Sacred Space', 'Packaged in custom reinforced timber crates with humidity resistance, dispatched worldwide with tracked white-glove courier and signed authenticity seal.', 'Phase 4 · Delivery', 'from-emerald-100 to-emerald-200/50', 'Sparkles', '')
on conflict (sort_order) do nothing;

notify pgrst, 'reload schema';
