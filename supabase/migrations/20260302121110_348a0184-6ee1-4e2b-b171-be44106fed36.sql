
-- Step 1: Add columns
ALTER TABLE public.chat_conversations ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'direct';
ALTER TABLE public.chat_conversations ADD COLUMN IF NOT EXISTS name text;

-- Step 2: Make participant_2 nullable
ALTER TABLE public.chat_conversations ALTER COLUMN participant_2 DROP NOT NULL;

-- Step 3: Insert the general room
INSERT INTO public.chat_conversations (id, type, name, participant_1, participant_2, last_message_text, last_message_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'group',
  'Bate-papo Geral',
  '00000000-0000-0000-0000-000000000000',
  NULL,
  'Bem-vindo ao bate-papo geral!',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Update RLS policies for group support
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;
CREATE POLICY "Users can view own conversations"
  ON public.chat_conversations FOR SELECT
  TO authenticated
  USING (
    (type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2))
    OR type = 'group'
  );

DROP POLICY IF EXISTS "Users can update own conversations" ON public.chat_conversations;
CREATE POLICY "Users can update own conversations"
  ON public.chat_conversations FOR UPDATE
  TO authenticated
  USING (
    (type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2))
    OR type = 'group'
  );

DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.chat_messages;
CREATE POLICY "Users can view messages in own conversations"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = chat_messages.conversation_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
      OR c.type = 'group'
    )
  ));

DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.chat_messages;
CREATE POLICY "Users can send messages in own conversations"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = chat_messages.conversation_id
      AND (
        (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
        OR c.type = 'group'
      )
    )
  );

DROP POLICY IF EXISTS "Recipients can mark messages as read" ON public.chat_messages;
CREATE POLICY "Recipients can mark messages as read"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM chat_conversations c
    WHERE c.id = chat_messages.conversation_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
      OR c.type = 'group'
    )
  ));

DROP POLICY IF EXISTS "Users can view reactions in own conversations" ON public.chat_reactions;
CREATE POLICY "Users can view reactions in own conversations"
  ON public.chat_reactions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM chat_messages m
    JOIN chat_conversations c ON c.id = m.conversation_id
    WHERE m.id = chat_reactions.message_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
      OR c.type = 'group'
    )
  ));
