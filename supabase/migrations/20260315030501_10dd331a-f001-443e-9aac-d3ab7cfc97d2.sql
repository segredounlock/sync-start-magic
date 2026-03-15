
CREATE OR REPLACE FUNCTION public.get_network_members_v2(_user_id uuid, _filter text DEFAULT 'active')
RETURNS TABLE(
  id uuid,
  nome text,
  email text,
  avatar_url text,
  active boolean,
  created_at timestamptz,
  total_recargas bigint,
  role text,
  saldo_revenda numeric,
  saldo_pessoal numeric,
  direct_network bigint,
  indirect_network bigint,
  direct_profit numeric,
  indirect_profit numeric
)
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
    (SELECT COUNT(*) FROM public.recargas r WHERE r.user_id = p.id AND r.status = 'completed')::bigint AS total_recargas,
    COALESCE(
      (SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = p.id ORDER BY 
        CASE ur.role WHEN 'admin' THEN 1 WHEN 'revendedor' THEN 2 WHEN 'cliente' THEN 3 ELSE 4 END
      LIMIT 1),
      'usuario'
    ) AS role,
    COALESCE((SELECT s.valor FROM public.saldos s WHERE s.user_id = p.id AND s.tipo = 'revenda'), 0) AS saldo_revenda,
    COALESCE((SELECT s.valor FROM public.saldos s WHERE s.user_id = p.id AND s.tipo = 'pessoal'), 0) AS saldo_pessoal,
    (SELECT COUNT(*) FROM public.profiles p2 WHERE p2.reseller_id = p.id)::bigint AS direct_network,
    (SELECT COUNT(*) FROM public.profiles p3 WHERE p3.reseller_id IN (SELECT p4.id FROM public.profiles p4 WHERE p4.reseller_id = p.id))::bigint AS indirect_network,
    COALESCE((SELECT SUM(rc.amount) FROM public.referral_commissions rc WHERE rc.user_id = _user_id AND rc.referred_user_id = p.id AND rc.type = 'direct'), 0) AS direct_profit,
    COALESCE((SELECT SUM(rc.amount) FROM public.referral_commissions rc WHERE rc.user_id = _user_id AND rc.referred_user_id = p.id AND rc.type = 'indirect'), 0) AS indirect_profit
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
