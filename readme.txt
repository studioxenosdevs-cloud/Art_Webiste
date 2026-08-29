================================================================================
           SUPABASE MIGRATION & NEW ACCOUNT SETUP CHECKLIST
================================================================================

--------------------------------------------------------------------------------
STEP 1: DATABASE SCHEMA & POLICIES (Run in Supabase SQL Editor)
--------------------------------------------------------------------------------
Open Supabase Dashboard -> SQL Editor -> New Query. Paste and run the following:

-- 1. Create Public Tables
CREATE TABLE IF NOT EXISTS public.artworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  medium TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  price_pkr INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available',
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artwork_id UUID REFERENCES public.artworks(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  avatar_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: Artworks
CREATE POLICY "Public view artworks" 
  ON public.artworks FOR SELECT USING (true);
CREATE POLICY "Admin manage artworks" 
  ON public.artworks FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- 4. RLS Policies: Inquiries
CREATE POLICY "Public submit inquiries" 
  ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage inquiries" 
  ON public.inquiries FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');

-- 5. RLS Policies: Reviews
CREATE POLICY "Public view approved reviews" 
  ON public.reviews FOR SELECT 
  USING (is_approved = TRUE OR auth.role() = 'authenticated');
CREATE POLICY "Public submit reviews" 
  ON public.reviews FOR INSERT WITH CHECK (is_approved = FALSE);
CREATE POLICY "Admin manage reviews" 
  ON public.reviews FOR ALL 
  USING (auth.role() = 'authenticated') 
  WITH CHECK (auth.role() = 'authenticated');


--------------------------------------------------------------------------------
STEP 2: CREATE STORAGE BUCKET & STORAGE POLICIES
--------------------------------------------------------------------------------
1. Go to Storage -> New Bucket.
2. Name: artworks
3. Public Bucket: TOGGLE TO ON (Public).
4. Save bucket.

5. Open SQL Editor and run these policies to enable file uploads/viewing:

CREATE POLICY "Public View Storage Artworks" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'artworks');

CREATE POLICY "Admin Upload Storage Artworks" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'artworks' AND auth.role() = 'authenticated');

CREATE POLICY "Admin Delete Storage Artworks" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'artworks' AND auth.role() = 'authenticated');


--------------------------------------------------------------------------------
STEP 3: CREATE ADMIN USER ACCOUNT
--------------------------------------------------------------------------------
1. Go to Authentication -> Users.
2. Click "Add User" -> "Create User".
3. Enter Email (e.g., admin@studioxenos.com or zel@gmail.com).
4. Set Password.
5. Check "Auto Confirm User?" -> ENABLED.
6. Click "Create User".


--------------------------------------------------------------------------------
STEP 4: UPDATE PROJECT ENVIRONMENT VARIABLES (.env.local)
--------------------------------------------------------------------------------
1. Copy API Credentials from Supabase Settings -> API.
2. Open .env.local in your local code directory:

VITE_SUPABASE_URL=https://your-new-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key_here

*IMPORTANT*: Ensure VITE_SUPABASE_URL contains ONLY the domain name base. 
Do NOT include /rest/v1 or trailing slashes (/).


--------------------------------------------------------------------------------
STEP 5: RESTART DEVELOPMENT SERVER
--------------------------------------------------------------------------------
1. In your terminal, stop the running app: Ctrl + C
2. Restart Vite server to reload environment variables:
   npm run dev
================================================================================