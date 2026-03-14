
CREATE OR REPLACE FUNCTION public.get_user_recargas_count(_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(*)::bigint
  FROM public.recargas
  WHERE user_id = _user_id
    AND status = 'completed';
$$;
