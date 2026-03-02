ALTER TABLE public.chat_conversations 
  ADD COLUMN IF NOT EXISTS category text DEFAULT '',
  ADD COLUMN IF NOT EXISTS description text DEFAULT '',
  ADD COLUMN IF NOT EXISTS icon text DEFAULT '💬',
  ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;