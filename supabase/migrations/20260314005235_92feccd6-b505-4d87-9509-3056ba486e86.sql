-- Revert view to security_invoker to satisfy linter and avoid bypassing all profile RLS
ALTER VIEW public.profiles_public SET (security_invoker = on);

-- Public-safe store lookup via SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.get_public_store_by_slug(_slug text)
RETURNS TABLE (
  id uuid,
  nome text,
  store_name text,
  store_logo_url text,
  store_primary_color text,
  store_secondary_color text,
  active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.nome,
    p.store_name,
    p.store_logo_url,
    p.store_primary_color,
    p.store_secondary_color,
    p.active
  FROM public.profiles p
  WHERE p.slug = _slug
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_public_store_by_slug(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_store_by_slug(text) TO anon, authenticated;