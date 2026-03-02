-- Add verification badge column to profiles
ALTER TABLE public.profiles ADD COLUMN verification_badge text DEFAULT NULL;

-- Valid values: 'verificado', 'diamante', 'top', 'elite', or NULL (no badge)