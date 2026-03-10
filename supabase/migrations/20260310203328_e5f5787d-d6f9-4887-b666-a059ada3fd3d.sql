
-- ==========================================
-- FIX 1: Profiles - Block verification_badge self-update
-- ==========================================

-- Drop the permissive "Users can update own profile" and recreate with WITH CHECK
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND (
    verification_badge IS NOT DISTINCT FROM (SELECT p.verification_badge FROM public.profiles p WHERE p.id = auth.uid())
  )
);

-- ==========================================
-- FIX 2: Profiles - Create safe public view hiding sensitive columns
-- ==========================================

-- Create a view that only exposes non-sensitive columns
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
  id, nome, avatar_url, slug, bio, verification_badge,
  store_name, store_logo_url, store_primary_color, store_secondary_color,
  active, last_seen_at, created_at
FROM public.profiles;

-- Replace the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated can view any profile" ON public.profiles;

-- Now only allow full profile SELECT for: own profile, admins, resellers (their clients), chat participants
-- The existing policies "Users can view own profile", "Admins can view all profiles", 
-- "Resellers can view client profiles", and "Users can view chat participant profiles" already cover these cases.
-- So we just needed to DROP the blanket "Authenticated can view any profile" policy.

-- Grant SELECT on the public view to authenticated users
GRANT SELECT ON public.profiles_public TO authenticated;
GRANT SELECT ON public.profiles_public TO anon;
