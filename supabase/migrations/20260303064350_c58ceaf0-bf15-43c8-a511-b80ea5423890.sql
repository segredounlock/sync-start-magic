-- Secure RPC for maintenance mode (public access needed)
CREATE OR REPLACE FUNCTION public.get_maintenance_mode()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(value = 'true', false)
  FROM public.system_config
  WHERE key = 'maintenanceMode'
  LIMIT 1;
$$;

-- Secure RPC for chat_enabled (authenticated access)
CREATE OR REPLACE FUNCTION public.get_chat_enabled()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(value = 'true', false)
  FROM public.system_config
  WHERE key = 'chat_enabled'
  LIMIT 1;
$$;