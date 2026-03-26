
-- Allow anonymous and authenticated users to read branding configs from system_config
CREATE POLICY "Public can read branding configs"
ON public.system_config FOR SELECT
TO anon, authenticated
USING (key IN ('siteTitle', 'siteName', 'siteSubtitle', 'seasonalTheme'));
