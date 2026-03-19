
CREATE OR REPLACE FUNCTION public.get_public_reseller_pricing(_slug text)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _result json;
BEGIN
  SELECT id INTO _user_id FROM public.profiles WHERE slug = _slug AND active = true LIMIT 1;
  IF _user_id IS NULL THEN
    RETURN '[]'::json;
  END IF;

  SELECT json_agg(row_to_json(t)) INTO _result
  FROM (
    SELECT 
      o.id as operadora_id,
      o.nome as operadora_nome,
      rp.valor_recarga,
      rp.regra_valor,
      rp.tipo_regra
    FROM public.reseller_pricing_rules rp
    JOIN public.operadoras o ON o.id = rp.operadora_id AND o.ativo = true
    WHERE rp.user_id = _user_id
    ORDER BY o.nome, rp.valor_recarga
  ) t;

  RETURN COALESCE(_result, '[]'::json);
END;
$$;
