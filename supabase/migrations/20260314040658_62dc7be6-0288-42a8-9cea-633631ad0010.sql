
-- Update function to generate 6-digit numeric referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Update existing codes to 6-digit numeric
UPDATE public.profiles
SET referral_code = LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0')
WHERE referral_code IS NOT NULL;
