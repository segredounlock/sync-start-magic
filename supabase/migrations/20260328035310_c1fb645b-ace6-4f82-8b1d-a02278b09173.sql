
-- Allow authenticated users to read install and license tracking keys from system_config
DROP POLICY IF EXISTS "Authenticated can view install config" ON public.system_config;
CREATE POLICY "Authenticated can view install config"
ON public.system_config
FOR SELECT
TO authenticated
USING (key = ANY(ARRAY[
  'install_completed',
  'install_domain',
  'license_validated_at',
  'license_expires_at'
]));
