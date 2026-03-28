-- Drop and recreate the view WITHOUT security_invoker so it runs as the view owner (bypasses RLS)
-- This is safe because the view only exposes non-sensitive columns
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public AS
  SELECT id, nome, avatar_url, slug, bio, verification_badge,
         store_name, store_logo_url, store_primary_color, store_secondary_color,
         active, last_seen_at, created_at
  FROM public.profiles;