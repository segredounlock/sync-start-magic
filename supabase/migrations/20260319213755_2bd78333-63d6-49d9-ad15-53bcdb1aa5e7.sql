CREATE OR REPLACE FUNCTION public.get_public_reseller_pricing(_slug text)
 RETURNS json
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid;
  _result json;
  _dm_enabled boolean := false;
  _dm_type text := 'fixo';
  _dm_value numeric := 0;
BEGIN
  SELECT id INTO _user_id
  FROM public.profiles
  WHERE slug = _slug AND active = true
  LIMIT 1;

  IF _user_id IS NULL THEN
    RETURN '[]'::json;
  END IF;

  SELECT COALESCE(MAX(CASE WHEN key = 'defaultMarginEnabled' AND value = 'true' THEN true ELSE false END), false),
         COALESCE(MAX(CASE WHEN key = 'defaultMarginType' THEN value END), 'fixo'),
         COALESCE(MAX(CASE WHEN key = 'defaultMarginValue' THEN NULLIF(REPLACE(value, ',', '.'), '')::numeric END), 0)
  INTO _dm_enabled, _dm_type, _dm_value
  FROM public.system_config
  WHERE key IN ('defaultMarginEnabled', 'defaultMarginType', 'defaultMarginValue');

  SELECT json_agg(row_to_json(t)) INTO _result
  FROM (
    SELECT
      o.nome AS operadora_nome,
      pr.valor_recarga,
      CASE
        WHEN rpr.id IS NOT NULL THEN
          CASE
            WHEN rpr.tipo_regra = 'fixo' THEN COALESCE(NULLIF(rpr.regra_valor, 0), rpr.custo)
            ELSE COALESCE(rpr.custo, 0) * (1 + COALESCE(rpr.regra_valor, 0) / 100)
          END
        WHEN rbpr.id IS NOT NULL THEN
          CASE
            WHEN rbpr.tipo_regra = 'fixo' THEN COALESCE(NULLIF(rbpr.regra_valor, 0), rbpr.custo)
            ELSE COALESCE(rbpr.custo, 0) * (1 + COALESCE(rbpr.regra_valor, 0) / 100)
          END
        WHEN _dm_enabled AND _dm_value > 0 THEN
          CASE
            WHEN _dm_type = 'percentual' THEN COALESCE(pr.custo, 0) * (1 + _dm_value / 100)
            ELSE COALESCE(pr.custo, 0) + _dm_value
          END
        ELSE
          CASE
            WHEN pr.tipo_regra = 'fixo' THEN COALESCE(NULLIF(pr.regra_valor, 0), pr.custo)
            ELSE COALESCE(pr.custo, 0) * (1 + COALESCE(pr.regra_valor, 0) / 100)
          END
      END AS preco_cliente
    FROM public.pricing_rules pr
    JOIN public.operadoras o
      ON o.id = pr.operadora_id
     AND o.ativo = true
    LEFT JOIN public.reseller_pricing_rules rpr
      ON rpr.user_id = _user_id
     AND rpr.operadora_id = pr.operadora_id
     AND rpr.valor_recarga = pr.valor_recarga
    LEFT JOIN public.reseller_base_pricing_rules rbpr
      ON rbpr.user_id = _user_id
     AND rbpr.operadora_id = pr.operadora_id
     AND rbpr.valor_recarga = pr.valor_recarga
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.disabled_recharge_values drv
      WHERE drv.operadora_id = pr.operadora_id
        AND drv.valor = pr.valor_recarga
    )
    ORDER BY o.nome, pr.valor_recarga
  ) t
  WHERE t.preco_cliente > 0;

  RETURN COALESCE(_result, '[]'::json);
END;
$function$;