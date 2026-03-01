
-- Create a SECURITY DEFINER function to check roles without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Drop the recursive policy on user_roles
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Recreate it using the security definer function
CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Fix policies on other tables that reference user_roles directly

-- operadoras
DROP POLICY IF EXISTS "Admins can manage operadoras" ON public.operadoras;
CREATE POLICY "Admins can manage operadoras"
ON public.operadoras
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- pricing_rules
DROP POLICY IF EXISTS "Admins can manage pricing rules" ON public.pricing_rules;
CREATE POLICY "Admins can manage pricing rules"
ON public.pricing_rules
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- saldos
DROP POLICY IF EXISTS "Admins can insert saldos" ON public.saldos;
CREATE POLICY "Admins can insert saldos"
ON public.saldos
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update saldos" ON public.saldos;
CREATE POLICY "Admins can update saldos"
ON public.saldos
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can view all saldos" ON public.saldos;
CREATE POLICY "Admins can view all saldos"
ON public.saldos
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- recargas
DROP POLICY IF EXISTS "Admins can view all recargas" ON public.recargas;
CREATE POLICY "Admins can view all recargas"
ON public.recargas
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions"
ON public.transactions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- system_config
DROP POLICY IF EXISTS "Admins can manage config" ON public.system_config;
CREATE POLICY "Admins can manage config"
ON public.system_config
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- bot_settings
DROP POLICY IF EXISTS "Admins can manage bot_settings" ON public.bot_settings;
CREATE POLICY "Admins can manage bot_settings"
ON public.bot_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- reseller_config
DROP POLICY IF EXISTS "Admins can view all reseller config" ON public.reseller_config;
CREATE POLICY "Admins can view all reseller config"
ON public.reseller_config
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
