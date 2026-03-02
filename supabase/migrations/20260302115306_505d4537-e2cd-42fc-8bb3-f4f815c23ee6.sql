
-- Chat conversations (1-to-1)
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 uuid NOT NULL,
  participant_2 uuid NOT NULL,
  last_message_text text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Chat messages
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text,
  type text NOT NULL DEFAULT 'text', -- text, audio, image
  audio_url text,
  image_url text,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  is_delivered boolean NOT NULL DEFAULT false,
  delivered_at timestamptz,
  reply_to_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Message reactions (emoji)
CREATE TABLE public.chat_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Indexes
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at DESC);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_conversations_p1 ON public.chat_conversations(participant_1);
CREATE INDEX idx_chat_conversations_p2 ON public.chat_conversations(participant_2);
CREATE INDEX idx_chat_reactions_message ON public.chat_reactions(message_id);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;

-- RLS: chat_conversations - users can see their own conversations
CREATE POLICY "Users can view own conversations"
ON public.chat_conversations FOR SELECT
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can create conversations"
ON public.chat_conversations FOR INSERT
WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Users can update own conversations"
ON public.chat_conversations FOR UPDATE
USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

CREATE POLICY "Admins can manage all conversations"
ON public.chat_conversations FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- RLS: chat_messages - users can see messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
ON public.chat_messages FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.chat_conversations c
  WHERE c.id = conversation_id
  AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
));

CREATE POLICY "Users can send messages in own conversations"
ON public.chat_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can update own messages"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = sender_id);

CREATE POLICY "Admins can manage all messages"
ON public.chat_messages FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow message recipient to mark as read
CREATE POLICY "Recipients can mark messages as read"
ON public.chat_messages FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.chat_conversations c
  WHERE c.id = conversation_id
  AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
));

-- RLS: chat_reactions
CREATE POLICY "Users can view reactions in own conversations"
ON public.chat_reactions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.chat_messages m
  JOIN public.chat_conversations c ON c.id = m.conversation_id
  WHERE m.id = message_id
  AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
));

CREATE POLICY "Users can add reactions"
ON public.chat_reactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own reactions"
ON public.chat_reactions FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reactions"
ON public.chat_reactions FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_chat_conversations_updated_at
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;

-- Add chat_enabled to system_config
INSERT INTO public.system_config (key, value) VALUES ('chat_enabled', 'true')
ON CONFLICT DO NOTHING;

-- Storage bucket for chat audio
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-audio', 'chat-audio', true)
ON CONFLICT DO NOTHING;

-- Storage policies for chat-audio bucket
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-audio' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view chat audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-audio');

CREATE POLICY "Users can delete own audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-audio' AND auth.uid()::text = (storage.foldername(name))[1]);
