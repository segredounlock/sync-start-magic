-- Add telegram notification tracking to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS telegram_notified boolean NOT NULL DEFAULT false;

-- Index for quick lookup of unnotified completed transactions
CREATE INDEX IF NOT EXISTS idx_transactions_unnotified 
  ON public.transactions (user_id, status, telegram_notified) 
  WHERE status = 'completed' AND telegram_notified = false;