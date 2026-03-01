
-- Allow revendedores to update their own saldo (for recarga deduction)
CREATE POLICY "Users can update own saldo" ON public.saldos FOR UPDATE USING (auth.uid() = user_id);
