
-- Referral commissions table to track earnings from network
CREATE TABLE public.referral_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  recarga_id uuid REFERENCES public.recargas(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'indirect')),
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own commissions
CREATE POLICY "Users can view own commissions"
ON public.referral_commissions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all commissions
CREATE POLICY "Admins can manage commissions"
ON public.referral_commissions FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::text))
WITH CHECK (has_role(auth.uid(), 'admin'::text));

-- Add referral_code to profiles for sharing
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- RPC to get network stats for a reseller
CREATE OR REPLACE FUNCTION public.get_network_stats(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  direct_count bigint;
  direct_profit numeric;
  indirect_count bigint;
  indirect_profit numeric;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Direct clients (reseller_id = me)
  SELECT COUNT(*) INTO direct_count
  FROM public.profiles WHERE reseller_id = _user_id;

  -- Direct profit from commissions
  SELECT COALESCE(SUM(amount), 0) INTO direct_profit
  FROM public.referral_commissions
  WHERE user_id = _user_id AND type = 'direct';

  -- Indirect clients (clients of my clients)
  SELECT COUNT(*) INTO indirect_count
  FROM public.profiles p2
  WHERE p2.reseller_id IN (
    SELECT id FROM public.profiles WHERE reseller_id = _user_id
  );

  -- Indirect profit from commissions
  SELECT COALESCE(SUM(amount), 0) INTO indirect_profit
  FROM public.referral_commissions
  WHERE user_id = _user_id AND type = 'indirect';

  result := jsonb_build_object(
    'direct_count', direct_count,
    'indirect_count', indirect_count,
    'total_count', direct_count + indirect_count,
    'direct_profit', direct_profit,
    'indirect_profit', indirect_profit,
    'total_profit', direct_profit + indirect_profit
  );

  RETURN result;
END;
$$;

-- RPC to get network members list
CREATE OR REPLACE FUNCTION public.get_network_members(_user_id uuid, _filter text DEFAULT 'active')
RETURNS TABLE(id uuid, nome text, email text, avatar_url text, active boolean, created_at timestamptz, total_recargas bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.nome,
    p.email,
    p.avatar_url,
    p.active,
    p.created_at,
    (SELECT COUNT(*) FROM public.recargas r WHERE r.user_id = p.id AND r.status = 'completed')::bigint AS total_recargas
  FROM public.profiles p
  WHERE p.reseller_id = _user_id
    AND (
      _filter = 'all'
      OR (_filter = 'active' AND p.active = true)
      OR (_filter = 'inactive' AND p.active = false)
    )
  ORDER BY p.created_at DESC;
END;
$$;
