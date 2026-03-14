
-- Generate short referral codes for existing users that don't have one
-- Format: 6 character alphanumeric code
UPDATE public.profiles
SET referral_code = LOWER(SUBSTR(MD5(id::text || EXTRACT(EPOCH FROM now())::text), 1, 6))
WHERE referral_code IS NULL;

-- Create function to auto-generate referral_code on new profiles
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := LOWER(SUBSTR(MD5(NEW.id::text || EXTRACT(EPOCH FROM now())::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trg_generate_referral_code ON public.profiles;
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Create RPC to resolve referral_code to user_id (public, for anonymous access)
CREATE OR REPLACE FUNCTION public.get_user_by_referral_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id FROM public.profiles WHERE referral_code = _code LIMIT 1;
$$;
