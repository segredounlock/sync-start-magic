
CREATE POLICY "Authenticated can view room image config"
ON public.system_config
FOR SELECT
USING (auth.uid() IS NOT NULL AND key LIKE 'room_images_%');
