-- Function to get top winners (Hall da Fama)
CREATE OR REPLACE FUNCTION public.get_scratch_top_winners()
RETURNS TABLE(nome text, prize_amount numeric, card_date text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    LEFT(COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usr'), 3) || '***' AS nome,
    sc.prize_amount,
    sc.card_date::text
  FROM public.scratch_cards sc
  JOIN public.profiles p ON p.id = sc.user_id
  WHERE sc.is_won = true AND sc.is_scratched = true
  ORDER BY sc.prize_amount DESC
  LIMIT 5;
$$;

-- Function to get recent winners (Últimos Prêmios)
CREATE OR REPLACE FUNCTION public.get_scratch_recent_winners()
RETURNS TABLE(nome text, prize_amount numeric, card_date text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    LEFT(COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usr'), 3) || '***' AS nome,
    sc.prize_amount,
    sc.card_date::text
  FROM public.scratch_cards sc
  JOIN public.profiles p ON p.id = sc.user_id
  WHERE sc.is_won = true AND sc.is_scratched = true
  ORDER BY sc.scratched_at DESC NULLS LAST
  LIMIT 5;
$$;