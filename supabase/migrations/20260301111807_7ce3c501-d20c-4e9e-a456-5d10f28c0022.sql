
-- Fix #1: Restrict "Service role can manage" policies to service_role only
DROP POLICY IF EXISTS "Service role can manage recargas" ON public.recargas;
CREATE POLICY "Service role can manage recargas"
  ON public.recargas FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage transactions" ON public.transactions;
CREATE POLICY "Service role can manage transactions"
  ON public.transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix #2: Revendedores can view recargas of their clients
CREATE POLICY "Resellers can view client recargas"
  ON public.recargas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = recargas.user_id
        AND p.reseller_id = auth.uid()
    )
  );

-- Fix #3: Revendedores can view transactions of their clients
CREATE POLICY "Resellers can view client transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = transactions.user_id
        AND p.reseller_id = auth.uid()
    )
  );

-- Also: Revendedores can view saldos of their clients
CREATE POLICY "Resellers can view client saldos"
  ON public.saldos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = saldos.user_id
        AND p.reseller_id = auth.uid()
    )
  );
