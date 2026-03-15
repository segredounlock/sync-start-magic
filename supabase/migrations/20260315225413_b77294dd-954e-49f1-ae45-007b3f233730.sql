
CREATE OR REPLACE FUNCTION public.get_recargas_ranking(_limit integer DEFAULT 20)
RETURNS TABLE(
  user_id uuid,
  nome text,
  avatar_url text,
  verification_badge text,
  total_recargas bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    r.user_id,
    COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usuário') AS nome,
    p.avatar_url,
    p.verification_badge,
    COUNT(*)::bigint AS total_recargas
  FROM public.recargas r
  JOIN public.profiles p ON p.id = r.user_id
  WHERE r.status = 'completed'
  GROUP BY r.user_id, p.nome, p.email, p.avatar_url, p.verification_badge
  ORDER BY total_recargas DESC
  LIMIT _limit;
$$;
