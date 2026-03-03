-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view seasonal theme" ON public.system_config;

-- Create a security definer function that only returns the seasonal theme value
CREATE OR REPLACE FUNCTION public.get_seasonal_theme()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT value FROM public.system_config WHERE key = 'seasonalTheme' LIMIT 1;
$$;