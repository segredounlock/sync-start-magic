
CREATE OR REPLACE FUNCTION public.get_public_reseller_pricing(_slug text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      o.nome AS operadora_nome,
      pr.valor_recarga,
      COALESCE(
        -- Priority 1: reseller_pricing_rules (network margins)
        (SELECT rpr.regra_valor FROM public.reseller_pricing_rules rpr
         WHERE rpr.user_id = _user_id AND rpr.operadora_id = pr.operadora_id AND rpr.valor_recarga = pr.valor_recarga
         LIMIT 1),
        -- Priority 2: reseller_base_pricing_rules (admin-customized cost)
        (SELECT rbpr.regra_valor FROM public.reseller_base_pricing_rules rbpr
         WHERE rbpr.user_id = _user_id AND rbpr.operadora_id = pr.operadora_id AND rbpr.valor_recarga = pr.valor_recarga
         LIMIT 1),
        -- Priority 3: global pricing_rules regra_valor
        pr.regra_valor
      ) AS preco_cliente
    FROM public.pricing_rules pr
    JOIN public.operadoras o ON o.id = pr.operadora_id AND o.ativo = true
    WHERE NOT EXISTS (
      SELECT 1 FROM public.disabled_recharge_values drv
      WHERE drv.operadora_id = pr.operadora_id AND drv.valor = pr.valor_recarga
    )
    ORDER BY o.nome, pr.valor_recarga
  ) t
  WHERE t.preco_cliente > 0;

  RETURN COALESCE(_result, '[]'::json);
END;
$function$;
