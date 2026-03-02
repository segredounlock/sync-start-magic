
-- Table to track per-user message read receipts
CREATE TABLE public.chat_message_reads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

-- Enable RLS
ALTER TABLE public.chat_message_reads ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view reads in own conversations"
ON public.chat_message_reads FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_messages m
    JOIN chat_conversations c ON c.id = m.conversation_id
    WHERE m.id = chat_message_reads.message_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
      OR c.type = 'group'
    )
  )
);

CREATE POLICY "Users can insert own reads"
ON public.chat_message_reads FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reads"
ON public.chat_message_reads FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Index for fast lookups
CREATE INDEX idx_chat_message_reads_message ON public.chat_message_reads(message_id);
CREATE INDEX idx_chat_message_reads_user ON public.chat_message_reads(user_id);

-- Add to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_message_reads;
