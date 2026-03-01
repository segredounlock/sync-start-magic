
-- Add slug column for short URLs
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Add store customization columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_logo_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_primary_color text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_secondary_color text;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles (slug) WHERE slug IS NOT NULL;

-- Create storage bucket for store logos
INSERT INTO storage.buckets (id, name, public) VALUES ('store-logos', 'store-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to store logos
CREATE POLICY "Store logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'store-logos');

-- Allow authenticated users to upload their own logo
CREATE POLICY "Users can upload their own store logo"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to update their own logo
CREATE POLICY "Users can update their own store logo"
ON storage.objects FOR UPDATE
USING (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own logo
CREATE POLICY "Users can delete their own store logo"
ON storage.objects FOR DELETE
USING (bucket_id = 'store-logos' AND auth.uid()::text = (storage.foldername(name))[1]);
