
CREATE OR REPLACE FUNCTION public.get_sales_tools_enabled()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(value = 'true', true)
  FROM public.system_config
  WHERE key = 'salesToolsEnabled'
  LIMIT 1;
$$;
