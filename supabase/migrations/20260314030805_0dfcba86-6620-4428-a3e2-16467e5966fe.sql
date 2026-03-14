
CREATE POLICY "Authenticated can read pricing rules"
ON public.pricing_rules
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);
