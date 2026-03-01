-- Add dedicated completed_at column for accurate processing time tracking
ALTER TABLE public.recargas ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone;

-- Backfill: for already completed recargas, set completed_at = updated_at where diff > 0
UPDATE public.recargas 
SET completed_at = updated_at 
WHERE status = 'completed' 
  AND completed_at IS NULL 
  AND updated_at > created_at 
  AND EXTRACT(EPOCH FROM (updated_at - created_at)) > 0
  AND EXTRACT(EPOCH FROM (updated_at - created_at)) < 86400;

-- Create trigger to auto-set completed_at when status changes to completed
CREATE OR REPLACE FUNCTION public.set_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') AND NEW.completed_at IS NULL THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_completed_at
BEFORE UPDATE ON public.recargas
FOR EACH ROW
EXECUTE FUNCTION public.set_completed_at();