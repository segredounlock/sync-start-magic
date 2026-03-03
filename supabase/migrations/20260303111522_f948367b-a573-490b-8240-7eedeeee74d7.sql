CREATE OR REPLACE FUNCTION public.get_notif_config(_key text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT value FROM public.system_config WHERE key = _key LIMIT 1;
$$;