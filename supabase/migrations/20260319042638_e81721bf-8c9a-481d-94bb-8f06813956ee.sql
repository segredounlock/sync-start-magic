DROP POLICY "Resellers can manage own pricing" ON public.reseller_pricing_rules;
CREATE POLICY "Users can manage own pricing"
ON public.reseller_pricing_rules
FOR ALL
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);