CREATE POLICY "Anyone can view seasonal theme"
ON public.system_config
FOR SELECT
USING (key = 'seasonalTheme');