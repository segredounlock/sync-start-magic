
CREATE TABLE public.terms_acceptance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_terms_acceptance_telegram_id ON public.terms_acceptance (telegram_id);

ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on terms_acceptance"
  ON public.terms_acceptance
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
