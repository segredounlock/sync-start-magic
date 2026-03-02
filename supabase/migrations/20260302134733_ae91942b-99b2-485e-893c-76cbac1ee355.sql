
-- Add columns to track admin actions on messages
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS deleted_by uuid DEFAULT NULL;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS edited_by uuid DEFAULT NULL;
