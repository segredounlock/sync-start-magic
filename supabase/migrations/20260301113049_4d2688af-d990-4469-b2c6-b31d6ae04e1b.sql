
-- Create telegram_sessions table for bot onboarding flow
CREATE TABLE public.telegram_sessions (
  chat_id TEXT PRIMARY KEY,
  step TEXT NOT NULL DEFAULT 'idle',
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

-- Service role can manage sessions (bot uses service role key)
CREATE POLICY "Service role can manage telegram_sessions"
  ON public.telegram_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
