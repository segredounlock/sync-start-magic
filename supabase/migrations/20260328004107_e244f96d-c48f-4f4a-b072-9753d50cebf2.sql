
-- Create licenses table for mirror licensing system
CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key text UNIQUE NOT NULL,
  mirror_name text NOT NULL,
  mirror_domain text,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  max_users integer DEFAULT 100,
  features jsonb DEFAULT '["all"]'::jsonb,
  last_heartbeat_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

-- Only admins can manage licenses
CREATE POLICY "Only admins can manage licenses"
  ON public.licenses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add updated_at trigger
CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
