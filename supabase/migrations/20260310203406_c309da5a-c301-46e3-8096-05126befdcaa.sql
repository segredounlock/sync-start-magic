
-- Fix SECURITY DEFINER view by setting it to SECURITY INVOKER
ALTER VIEW public.profiles_public SET (security_invoker = on);
