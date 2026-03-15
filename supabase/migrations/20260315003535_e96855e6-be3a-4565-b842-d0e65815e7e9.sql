CREATE POLICY "Authenticated can view margin config"
ON public.system_config FOR SELECT
TO authenticated
USING (key IN ('defaultMarginEnabled', 'defaultMarginType', 'defaultMarginValue'));