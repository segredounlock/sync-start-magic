
CREATE POLICY "Admins can insert reseller_pricing_rules"
ON public.reseller_pricing_rules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update reseller_pricing_rules"
ON public.reseller_pricing_rules
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete reseller_pricing_rules"
ON public.reseller_pricing_rules
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
