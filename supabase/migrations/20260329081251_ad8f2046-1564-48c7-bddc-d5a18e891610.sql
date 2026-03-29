
-- ══════════════════════════════════════════════════════════
-- CLEANUP: Remove all license-related RLS policies and DB objects
-- This migration ensures both main server and mirrors are clean
-- ══════════════════════════════════════════════════════════

-- 1. Drop license-related policies on system_config
DROP POLICY IF EXISTS "Authenticated can view license config" ON public.system_config;
DROP POLICY IF EXISTS "Authenticated can view install config" ON public.system_config;
DROP POLICY IF EXISTS "Authenticated can view license status" ON public.system_config;
DROP POLICY IF EXISTS "Restrict license key updates" ON public.system_config;

-- 2. Drop license table policies (in case tables still exist on mirrors)
DROP POLICY IF EXISTS "Admins can view license logs" ON public.license_logs;
DROP POLICY IF EXISTS "Only admins can manage licenses" ON public.licenses;

-- 3. Drop license tables (idempotent, safe for mirrors)
DROP TABLE IF EXISTS public.license_logs CASCADE;
DROP TABLE IF EXISTS public.licenses CASCADE;

-- 4. Drop license-related functions (if any remain)
DROP FUNCTION IF EXISTS public.is_license_valid();
DROP FUNCTION IF EXISTS public.get_installation_status();

-- 5. Clean license-related data from system_config
DELETE FROM public.system_config WHERE key IN (
  'license_key', 'license_master_url', 'license_status',
  'license_expires_at', 'license_validated_at', 'masterProjectUrl',
  'install_secret', 'license_start_date', 'license_grace_days'
);

-- 6. Re-create a clean install config policy (without license keys)
CREATE POLICY "Authenticated can view install config"
  ON public.system_config
  FOR SELECT
  TO authenticated
  USING (key IN ('install_completed', 'install_domain'));
