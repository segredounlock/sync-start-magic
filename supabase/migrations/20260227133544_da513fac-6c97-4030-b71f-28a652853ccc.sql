
-- Key-value config table for system settings (API keys, payment module, site title, etc.)
CREATE TABLE public.system_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write config
CREATE POLICY "Admins can view config"
ON public.system_config
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert config"
ON public.system_config
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update config"
ON public.system_config
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete config"
ON public.system_config
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default values
INSERT INTO public.system_config (key, value) VALUES
  ('siteTitle', 'Recargas Brasil'),
  ('apiBaseURL', 'https://express.poeki.dev/api'),
  ('apiKey', ''),
  ('paymentModule', 'virtualpay'),
  ('mercadoPagoModo', 'prod'),
  ('mercadoPagoKeyTest', ''),
  ('mercadoPagoKeyProd', ''),
  ('virtualPayClientId', ''),
  ('virtualPayClientSecret', ''),
  ('pushinPayToken', '')
ON CONFLICT (key) DO NOTHING;
