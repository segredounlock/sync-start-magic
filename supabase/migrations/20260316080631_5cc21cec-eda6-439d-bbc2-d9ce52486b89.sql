CREATE POLICY "Authenticated can view commission config"
ON public.system_config
FOR SELECT
TO authenticated
USING (key = ANY (ARRAY['directCommissionPercent'::text, 'indirectCommissionPercent'::text, 'directCommissionEnabled'::text, 'indirectCommissionEnabled'::text]));