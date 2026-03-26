-- Add siteUrl to system_config with default value (idempotent)
INSERT INTO public.system_config (key, value) VALUES ('siteUrl', 'https://recargasbrasill.com')
ON CONFLICT (key) DO NOTHING;

-- Add siteUrl to the RLS policy so authenticated users can read it
CREATE POLICY "Authenticated can view site url"
ON public.system_config
FOR SELECT
TO authenticated
USING (key = 'siteUrl');