CREATE POLICY "Authenticated can view support status"
ON public.system_config
FOR SELECT
TO authenticated
USING (key = 'supportEnabled');