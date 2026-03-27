UPDATE system_config SET value = '2', updated_at = now() WHERE key = 'scratchTier1Chance';
UPDATE system_config SET value = '1', updated_at = now() WHERE key = 'scratchTier2Chance';
UPDATE system_config SET value = '0.3', updated_at = now() WHERE key = 'scratchTier3Chance';
UPDATE system_config SET value = '5.00', updated_at = now() WHERE key = 'scratchTier2Max';
UPDATE system_config SET value = '15.00', updated_at = now() WHERE key = 'scratchTier3Max';
UPDATE system_config SET value = '3.00', updated_at = now() WHERE key = 'scratchTier3Min';