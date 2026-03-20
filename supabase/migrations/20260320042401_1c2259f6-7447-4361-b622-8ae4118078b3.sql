
-- Tabela para armazenar fingerprints de dispositivos a cada login
CREATE TABLE public.login_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fingerprint_hash text NOT NULL,
  ip_address text,
  user_agent text,
  platform text,
  screen_resolution text,
  timezone text,
  language text,
  canvas_hash text,
  webgl_renderer text,
  installed_plugins text,
  touch_support boolean DEFAULT false,
  device_memory integer,
  hardware_concurrency integer,
  color_depth integer,
  pixel_ratio numeric,
  latitude numeric,
  longitude numeric,
  geolocation_accuracy numeric,
  raw_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Tabela para banimentos de dispositivos/IPs/fingerprints
CREATE TABLE public.banned_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash text,
  ip_address text,
  user_agent_pattern text,
  reason text NOT NULL DEFAULT 'Golpe/Fraude',
  banned_by uuid NOT NULL,
  original_user_id uuid,
  original_user_email text,
  original_user_nome text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX idx_login_fingerprints_user ON public.login_fingerprints(user_id);
CREATE INDEX idx_login_fingerprints_hash ON public.login_fingerprints(fingerprint_hash);
CREATE INDEX idx_login_fingerprints_ip ON public.login_fingerprints(ip_address);
CREATE INDEX idx_banned_devices_hash ON public.banned_devices(fingerprint_hash) WHERE active = true;
CREATE INDEX idx_banned_devices_ip ON public.banned_devices(ip_address) WHERE active = true;

-- RLS
ALTER TABLE public.login_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_devices ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver/gerenciar fingerprints
CREATE POLICY "Admins can manage login_fingerprints"
  ON public.login_fingerprints FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem ver/gerenciar banimentos
CREATE POLICY "Admins can manage banned_devices"
  ON public.banned_devices FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
