CREATE POLICY "Authenticated users can read pricing rules"
ON public.pricing_rules
FOR SELECT
TO authenticated
USING (true);