
-- Add last_seen_at column to profiles for "last seen" tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone DEFAULT NULL;
