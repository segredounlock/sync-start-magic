
-- Step 1: Update recargas referencing lowercase operadora names
UPDATE recargas SET operadora = 'Claro' WHERE lower(operadora) = 'claro';
UPDATE recargas SET operadora = 'TIM' WHERE lower(operadora) = 'tim';
UPDATE recargas SET operadora = 'VIVO' WHERE lower(operadora) = 'vivo';

-- Step 2: Move reseller_pricing_rules from lowercase to capitalized operadora IDs
UPDATE reseller_pricing_rules SET operadora_id = 'eea6f6cc-6cd8-49ab-8e62-38278e25f570'
WHERE operadora_id = 'f6597eb3-b1e6-42d2-b244-2517b73f9a09'
AND NOT EXISTS (
  SELECT 1 FROM reseller_pricing_rules rp2 
  WHERE rp2.operadora_id = 'eea6f6cc-6cd8-49ab-8e62-38278e25f570' 
  AND rp2.valor_recarga = reseller_pricing_rules.valor_recarga
  AND rp2.user_id = reseller_pricing_rules.user_id
);
UPDATE reseller_pricing_rules SET operadora_id = '84fa272d-bac2-44a6-afa1-b9e59eea9042'
WHERE operadora_id = '407a108c-026b-43da-a3a1-b5be1dad282f'
AND NOT EXISTS (
  SELECT 1 FROM reseller_pricing_rules rp2 
  WHERE rp2.operadora_id = '84fa272d-bac2-44a6-afa1-b9e59eea9042' 
  AND rp2.valor_recarga = reseller_pricing_rules.valor_recarga
  AND rp2.user_id = reseller_pricing_rules.user_id
);
UPDATE reseller_pricing_rules SET operadora_id = '417323fa-0f0c-409e-afc0-b5b55aafa685'
WHERE operadora_id = '4a3df71f-65b5-429c-9533-e4454734190b'
AND NOT EXISTS (
  SELECT 1 FROM reseller_pricing_rules rp2 
  WHERE rp2.operadora_id = '417323fa-0f0c-409e-afc0-b5b55aafa685' 
  AND rp2.valor_recarga = reseller_pricing_rules.valor_recarga
  AND rp2.user_id = reseller_pricing_rules.user_id
);
DELETE FROM reseller_pricing_rules WHERE operadora_id IN (
  'f6597eb3-b1e6-42d2-b244-2517b73f9a09',
  '407a108c-026b-43da-a3a1-b5be1dad282f',
  '4a3df71f-65b5-429c-9533-e4454734190b'
);

-- Step 3: Delete lowercase pricing_rules
DELETE FROM pricing_rules WHERE operadora_id IN (
  'f6597eb3-b1e6-42d2-b244-2517b73f9a09',
  '407a108c-026b-43da-a3a1-b5be1dad282f',
  '4a3df71f-65b5-429c-9533-e4454734190b'
);

-- Step 4: Delete lowercase disabled_recharge_values
DELETE FROM disabled_recharge_values WHERE operadora_id IN (
  'f6597eb3-b1e6-42d2-b244-2517b73f9a09',
  '407a108c-026b-43da-a3a1-b5be1dad282f',
  '4a3df71f-65b5-429c-9533-e4454734190b'
);

-- Step 5: Delete the lowercase operadoras
DELETE FROM operadoras WHERE id IN (
  'f6597eb3-b1e6-42d2-b244-2517b73f9a09',
  '407a108c-026b-43da-a3a1-b5be1dad282f',
  '4a3df71f-65b5-429c-9533-e4454734190b'
);

-- Step 6: Unique index on lowercase nome to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS operadoras_nome_lower_unique ON operadoras (lower(nome));
