-- Allow all authenticated users to read banner config from system_config
CREATE POLICY "Authenticated users can read banner config"
ON public.system_config
FOR SELECT
USING (key IN ('bannerEnabled', 'bannerTitle', 'bannerSubtitle', 'bannerLink'));