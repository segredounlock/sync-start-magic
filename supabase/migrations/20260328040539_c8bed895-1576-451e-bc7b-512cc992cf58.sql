
-- Function to check if the license is valid (server-side, for RLS)
CREATE OR REPLACE FUNCTION public.is_license_valid()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (
      SELECT 
        sc_status.value = 'valid' 
        AND sc_expires.value IS NOT NULL 
        AND sc_expires.value::timestamptz > now()
      FROM public.system_config sc_status
      LEFT JOIN public.system_config sc_expires ON sc_expires.key = 'license_expires_at'
      WHERE sc_status.key = 'license_status'
    ),
    false
  );
$$;

-- RLS policy for system_config: allow reading install_secret only via server functions
-- (already restricted to admins, but adding explicit deny for install_secret to non-admin)

-- Add policy on system_config to hide install_secret from authenticated reads
CREATE POLICY "Block install_secret from non-admin reads"
ON public.system_config
FOR SELECT
TO authenticated
USING (
  key != 'install_secret' OR has_role(auth.uid(), 'admin')
);

-- Add license_status to the list of viewable keys for authenticated users  
CREATE POLICY "Authenticated can view license status"
ON public.system_config
FOR SELECT
TO authenticated
USING (key = 'license_status');
