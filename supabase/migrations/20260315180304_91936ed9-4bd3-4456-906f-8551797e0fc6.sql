
DROP FUNCTION IF EXISTS public.get_scratch_top_winners();
DROP FUNCTION IF EXISTS public.get_scratch_recent_winners();

CREATE FUNCTION public.get_scratch_top_winners()
 RETURNS TABLE(nome text, avatar_url text, verification_badge text, prize_amount numeric, card_date text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usuário') AS nome,
    p.avatar_url,
    p.verification_badge,
    sc.prize_amount,
    sc.card_date::text
  FROM public.scratch_cards sc
  JOIN public.profiles p ON p.id = sc.user_id
  WHERE sc.is_won = true AND sc.is_scratched = true
  ORDER BY sc.prize_amount DESC
  LIMIT 5;
$$;

CREATE FUNCTION public.get_scratch_recent_winners()
 RETURNS TABLE(nome text, avatar_url text, verification_badge text, prize_amount numeric, card_date text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usuário') AS nome,
    p.avatar_url,
    p.verification_badge,
    sc.prize_amount,
    sc.card_date::text
  FROM public.scratch_cards sc
  JOIN public.profiles p ON p.id = sc.user_id
  WHERE sc.is_won = true AND sc.is_scratched = true
  ORDER BY sc.scratched_at DESC NULLS LAST
  LIMIT 5;
$$;
