
-- =====================================================
-- LICENSE HARDENING: RLS + anti-tampering policies
-- =====================================================

-- 1. Protect license-related keys in system_config from authenticated users
-- Only service_role (edge functions) can modify these keys
-- The existing "Admins can manage config" policy allows ALL for admins,
-- but we want to BLOCK even admins from changing license keys via client SDK.
-- We add a restrictive policy that denies UPDATE on license keys.

-- First, we need to handle this carefully:
-- The existing "Admins can manage config" is permissive ALL.
-- To block license keys, we add a RESTRICTIVE policy for UPDATE.

CREATE POLICY "Restrict license key updates"
ON public.system_config
AS RESTRICTIVE
FOR UPDATE
TO authenticated
USING (
  key NOT IN (
    'license_key', 'license_master_url', 'license_status', 
    'license_expires_at', 'license_validated_at', 'masterProjectUrl', 'install_secret'
  )
)
WITH CHECK (
  key NOT IN (
    'license_key', 'license_master_url', 'license_status', 
    'license_expires_at', 'license_validated_at', 'masterProjectUrl', 'install_secret'
  )
);

-- 2. Add is_license_valid() check to critical tables
-- These are RESTRICTIVE policies: even if other permissive policies allow access,
-- these must ALSO pass. On the master, is_license_valid() returns true naturally.

-- recargas: block SELECT and INSERT if license invalid
CREATE POLICY "License gate on recargas select"
ON public.recargas
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (is_license_valid());

CREATE POLICY "License gate on recargas insert"
ON public.recargas
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (is_license_valid());

-- transactions: block SELECT and INSERT if license invalid
CREATE POLICY "License gate on transactions select"
ON public.transactions
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (is_license_valid());

CREATE POLICY "License gate on transactions insert"
ON public.transactions
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (is_license_valid());

-- saldos: block SELECT if license invalid
CREATE POLICY "License gate on saldos select"
ON public.saldos
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (is_license_valid());

-- profiles: block SELECT if license invalid
CREATE POLICY "License gate on profiles select"
ON public.profiles
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (is_license_valid());

-- pricing_rules: block SELECT if license invalid
CREATE POLICY "License gate on pricing_rules select"
ON public.pricing_rules
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (is_license_valid());

-- operadoras: block SELECT for authenticated if license invalid
-- (public/anon access stays open for public store pages)
CREATE POLICY "License gate on operadoras select"
ON public.operadoras
AS RESTRICTIVE
FOR SELECT
TO authenticated
USING (is_license_valid());
