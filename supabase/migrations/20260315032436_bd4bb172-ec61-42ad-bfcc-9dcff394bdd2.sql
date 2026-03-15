ALTER TABLE public.client_pricing_rules
ADD CONSTRAINT client_pricing_rules_unique_rule
UNIQUE (reseller_id, client_id, operadora_id, valor_recarga);