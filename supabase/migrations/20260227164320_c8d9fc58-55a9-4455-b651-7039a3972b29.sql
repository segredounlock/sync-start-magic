
CREATE TABLE public.telegram_sessions (
  chat_id text PRIMARY KEY,
  step text NOT NULL DEFAULT 'idle',
  data jsonb DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

-- Only accessed by edge functions with service_role, no policies needed
