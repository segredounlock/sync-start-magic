UPDATE reseller_base_pricing_rules
SET custo = pr.custo
FROM pricing_rules pr
WHERE reseller_base_pricing_rules.user_id = '6c137356-238a-413d-bc75-924c35d55eb6'
  AND reseller_base_pricing_rules.operadora_id = 'eea6f6cc-6cd8-49ab-8e62-38278e25f570'
  AND pr.operadora_id = reseller_base_pricing_rules.operadora_id
  AND pr.valor_recarga = reseller_base_pricing_rules.valor_recarga;