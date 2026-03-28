
CREATE TABLE public.license_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL DEFAULT 'validation',
  license_id text NULL,
  mirror_name text NULL,
  domain text NULL,
  ip_address text NULL,
  result text NOT NULL DEFAULT 'unknown',
  reason text NULL,
  details jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_license_logs_created ON public.license_logs (created_at DESC);
CREATE INDEX idx_license_logs_event ON public.license_logs (event_type);
CREATE INDEX idx_license_logs_result ON public.license_logs (result);

ALTER TABLE public.license_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view license logs"
ON public.license_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'master'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.license_logs;
