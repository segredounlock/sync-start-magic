
-- Add telegram_id to profiles for bot linking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_telegram_id ON public.profiles(telegram_id) WHERE telegram_id IS NOT NULL;
