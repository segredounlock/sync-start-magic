
CREATE POLICY "Clients can view reseller pricing"
ON public.reseller_pricing_rules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.reseller_id = reseller_pricing_rules.user_id
  )
);
