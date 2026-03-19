UPDATE reseller_base_pricing_rules 
SET regra_valor = CASE valor_recarga
  WHEN 20 THEN 10.50
  WHEN 25 THEN 11.50
  WHEN 30 THEN 12.50
  WHEN 35 THEN 14.50
  WHEN 40 THEN 16.50
  WHEN 50 THEN 19.50
  WHEN 60 THEN 22.50
  WHEN 70 THEN 25.50
END,
updated_at = now()
WHERE user_id = 'dee05f2d-29b8-4590-9873-eb5aeb42ce59'
  AND operadora_id = 'eea6f6cc-6cd8-49ab-8e62-38278e25f570'
  AND valor_recarga IN (20, 25, 30, 35, 40, 50, 60, 70);