-- 1. Create profiles table if it doesn't exist (with is_admin flag)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 4. Allow admins to manage news (CREATE)
CREATE POLICY "Admins can create news" ON public.news
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

-- 5. Allow admins to manage news (UPDATE)
CREATE POLICY "Admins can update news" ON public.news
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

-- 6. Allow admins to manage news (DELETE)
CREATE POLICY "Admins can delete news" ON public.news
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.is_admin = true
  )
);

-- 7. Allow anyone to read news (public)
CREATE POLICY "Anyone can read news" ON public.news
FOR SELECT
TO anon, authenticated
USING (true);

-- 8. INSERT your admin user (replace with your actual user UUID from auth.users)
-- Get your UUID from Supabase Dashboard > Authentication > Users, then run:
-- INSERT INTO public.profiles (id, is_admin) VALUES ('YOUR_USER_UUID_HERE', true)
-- ON CONFLICT (id) DO UPDATE SET is_admin = true;
