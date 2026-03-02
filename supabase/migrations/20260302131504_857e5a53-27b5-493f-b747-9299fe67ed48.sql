-- Add is_pinned column to chat_messages
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false;

-- Add pinned_at timestamp
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS pinned_at timestamptz DEFAULT null;

-- Add pinned_by
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS pinned_by uuid DEFAULT null;