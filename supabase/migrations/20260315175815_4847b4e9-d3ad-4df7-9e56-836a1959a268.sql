
INSERT INTO public.system_config (key, value) VALUES
  ('scratchTier1Chance', '5'),
  ('scratchTier1Min', '0.10'),
  ('scratchTier1Max', '1.00'),
  ('scratchTier2Chance', '3'),
  ('scratchTier2Min', '1.00'),
  ('scratchTier2Max', '10.00'),
  ('scratchTier3Chance', '1'),
  ('scratchTier3Min', '10.00'),
  ('scratchTier3Max', '100.00')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
