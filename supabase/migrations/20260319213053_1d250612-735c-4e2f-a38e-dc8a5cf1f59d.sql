
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
      sub.operadora_nome,
      sub.valor_recarga,
      sub.preco_cliente
    FROM (
      SELECT
        o.nome AS operadora_nome,
        pr.valor_recarga,
        CASE
          WHEN rpr.id IS NOT NULL THEN
            CASE WHEN rpr.tipo_regra = 'percentual'
              THEN pr.valor_recarga - (pr.valor_recarga * rpr.regra_valor / 100)
              ELSE pr.valor_recarga - rpr.regra_valor
            END
          WHEN rbpr.id IS NOT NULL THEN
            CASE WHEN rbpr.tipo_regra = 'percentual'
              THEN pr.valor_recarga - (pr.valor_recarga * rbpr.regra_valor / 100)
              ELSE pr.valor_recarga - rbpr.regra_valor
            END
          ELSE
            CASE WHEN pr.tipo_regra = 'percentual'
              THEN pr.valor_recarga - (pr.valor_recarga * pr.regra_valor / 100)
              ELSE pr.valor_recarga - pr.regra_valor
            END
        END AS preco_cliente
      FROM public.pricing_rules pr
      JOIN public.operadoras o ON o.id = pr.operadora_id AND o.ativo = true
      LEFT JOIN public.reseller_pricing_rules rpr
        ON rpr.user_id = _user_id AND rpr.operadora_id = pr.operadora_id AND rpr.valor_recarga = pr.valor_recarga
      LEFT JOIN public.reseller_base_pricing_rules rbpr
        ON rbpr.user_id = _user_id AND rbpr.operadora_id = pr.operadora_id AND rbpr.valor_recarga = pr.valor_recarga
      WHERE NOT EXISTS (
        SELECT 1 FROM public.disabled_recharge_values drv
        WHERE drv.operadora_id = pr.operadora_id AND drv.valor = pr.valor_recarga
      )
    ) sub
    WHERE sub.preco_cliente > 0
    ORDER BY sub.operadora_nome, sub.valor_recarga
  ) t;

  RETURN COALESCE(_result, '[]'::json);
END;
$function$;
