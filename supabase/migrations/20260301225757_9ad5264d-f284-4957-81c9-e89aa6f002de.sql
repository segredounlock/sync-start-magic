
-- Drop restrictive SELECT policies on saldos and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Users can view own saldo" ON public.saldos;
DROP POLICY IF EXISTS "Admins can view all saldos" ON public.saldos;
DROP POLICY IF EXISTS "Resellers can view client saldos" ON public.saldos;
DROP POLICY IF EXISTS "Admins can update saldos" ON public.saldos;
DROP POLICY IF EXISTS "Admins can insert saldos" ON public.saldos;
DROP POLICY IF EXISTS "Revendedores can update client saldos" ON public.saldos;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Users can view own saldo" ON public.saldos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all saldos" ON public.saldos FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Resellers can view client saldos" ON public.saldos FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = saldos.user_id AND p.reseller_id = auth.uid()));
CREATE POLICY "Admins can update saldos" ON public.saldos FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert saldos" ON public.saldos FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Revendedores can update client saldos" ON public.saldos FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = saldos.user_id AND p.reseller_id = auth.uid()));
