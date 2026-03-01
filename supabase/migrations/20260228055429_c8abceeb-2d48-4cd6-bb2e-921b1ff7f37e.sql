
-- 1. Add 'cliente' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'cliente';

-- 2. Add reseller_id to profiles (FK to profiles.id)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reseller_id uuid REFERENCES public.profiles(id);

-- 3. Update has_role function to also handle 'cliente' (already works, no change needed)

-- 4. RLS: Revendedores can view profiles of their clients
CREATE POLICY "Resellers can view their clients profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  reseller_id = auth.uid()
);

-- 5. RLS: Revendedores can view saldos of their clients
CREATE POLICY "Resellers can view client saldos"
ON public.saldos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = saldos.user_id
    AND profiles.reseller_id = auth.uid()
  )
);

-- 6. RLS: Revendedores can update saldos of their clients (credit balance)
CREATE POLICY "Resellers can update client saldos"
ON public.saldos
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = saldos.user_id
    AND profiles.reseller_id = auth.uid()
  )
);

-- 7. RLS: Revendedores can view recargas of their clients
CREATE POLICY "Resellers can view client recargas"
ON public.recargas
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = recargas.user_id
    AND profiles.reseller_id = auth.uid()
  )
);

-- 8. RLS: Revendedores can view transactions of their clients
CREATE POLICY "Resellers can view client transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = transactions.user_id
    AND profiles.reseller_id = auth.uid()
  )
);

-- 9. RLS: Clientes can view reseller_config of their reseller (for gateway config)
CREATE POLICY "Clients can view reseller config"
ON public.reseller_config
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.reseller_id = reseller_config.user_id
  )
);

-- 10. RLS: Clientes can view reseller_pricing_rules of their reseller
CREATE POLICY "Clients can view reseller pricing rules"
ON public.reseller_pricing_rules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.reseller_id = reseller_pricing_rules.user_id
  )
);
