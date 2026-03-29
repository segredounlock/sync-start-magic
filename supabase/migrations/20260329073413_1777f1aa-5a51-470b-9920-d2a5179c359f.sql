CREATE OR REPLACE FUNCTION public.get_installation_status()
RETURNS TABLE (
  install_completed boolean,
  has_master_admin boolean,
  license_key_present boolean,
  license_status text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    EXISTS (
      SELECT 1
      FROM public.system_config
      WHERE key = 'install_completed' AND value = 'true'
    ) AS install_completed,
    EXISTS (
      SELECT 1
      FROM public.system_config
      WHERE key = 'masterAdminId' AND COALESCE(value, '') <> ''
    ) AS has_master_admin,
    EXISTS (
      SELECT 1
      FROM public.system_config
      WHERE key = 'license_key' AND COALESCE(value, '') <> ''
    ) AS license_key_present,
    (
      SELECT value
      FROM public.system_config
      WHERE key = 'license_status'
      LIMIT 1
    ) AS license_status;
END;
$$;

REVOKE ALL ON FUNCTION public.get_installation_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_installation_status() TO anon, authenticated;