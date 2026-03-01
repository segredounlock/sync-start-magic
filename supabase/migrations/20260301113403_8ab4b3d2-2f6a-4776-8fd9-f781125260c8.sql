
-- Add missing columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS telefone TEXT;

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS telegram_notified BOOLEAN DEFAULT FALSE;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
