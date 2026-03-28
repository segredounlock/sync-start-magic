-- Allow authenticated users to read license-related config keys
-- This is needed so LicenseGate on mirrors can read license_key and license_master_url
CREATE POLICY "Authenticated can view license config"
ON public.system_config
FOR SELECT
TO authenticated
USING (key IN ('license_key', 'license_master_url'));