
DROP FUNCTION public.get_public_store_by_slug(text);

CREATE FUNCTION public.get_public_store_by_slug(_slug text)
 RETURNS TABLE(id uuid, nome text, store_name text, store_logo_url text, store_primary_color text, store_secondary_color text, active boolean, avatar_url text, verification_badge text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    p.id,
    p.nome,
    p.store_name,
    p.store_logo_url,
    p.store_primary_color,
    p.store_secondary_color,
    p.active,
    p.avatar_url,
    p.verification_badge
  FROM public.profiles p
  WHERE p.slug = _slug
  LIMIT 1;
$function$;
