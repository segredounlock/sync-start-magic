CREATE OR REPLACE FUNCTION public.get_require_referral_code()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(value = 'true', true)
  FROM public.system_config
  WHERE key = 'requireReferralCode'
  LIMIT 1;
$function$;