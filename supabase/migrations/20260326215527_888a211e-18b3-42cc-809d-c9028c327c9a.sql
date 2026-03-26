DROP POLICY IF EXISTS "Public can read branding configs" ON public.system_config;
CREATE POLICY "Public can read branding configs" ON public.system_config
  FOR SELECT TO anon, authenticated
  USING (key = ANY (ARRAY['siteTitle','siteName','siteSubtitle','seasonalTheme','siteLogo']));

INSERT INTO public.system_config (key, value)
VALUES ('siteLogo', NULL)
ON CONFLICT (key) DO NOTHING;