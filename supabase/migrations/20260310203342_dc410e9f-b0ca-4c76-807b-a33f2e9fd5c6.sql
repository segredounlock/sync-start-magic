
-- ==========================================
-- FIX 3: Chat - Add membership check for group conversations
-- ==========================================

-- chat_conversations: Replace the policy that allows any authenticated to see all groups
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;

CREATE POLICY "Users can view own conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (
  (type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2))
  OR
  (type = 'group' AND EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.conversation_id = chat_conversations.id AND cm.user_id = auth.uid()
  ))
);

-- chat_conversations: Also fix UPDATE policy for groups
DROP POLICY IF EXISTS "Users can update own conversations" ON public.chat_conversations;

CREATE POLICY "Users can update own conversations"
ON public.chat_conversations
FOR UPDATE
TO authenticated
USING (
  (type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2))
  OR
  (type = 'group' AND EXISTS (
    SELECT 1 FROM public.chat_members cm
    WHERE cm.conversation_id = chat_conversations.id AND cm.user_id = auth.uid()
  ))
);

-- chat_messages: Replace SELECT policy to require membership for groups
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.chat_messages;

CREATE POLICY "Users can view messages in own conversations"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
      OR
      (c.type = 'group' AND EXISTS (
        SELECT 1 FROM public.chat_members cm
        WHERE cm.conversation_id = c.id AND cm.user_id = auth.uid()
      ))
    )
  )
);

-- chat_messages: Fix INSERT policy for groups too
DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.chat_messages;

CREATE POLICY "Users can send messages in own conversations"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
      OR
      (c.type = 'group' AND EXISTS (
        SELECT 1 FROM public.chat_members cm
        WHERE cm.conversation_id = c.id AND cm.user_id = auth.uid()
      ))
    )
  )
);

-- chat_messages: Fix UPDATE policy "Recipients can mark messages as read"
DROP POLICY IF EXISTS "Recipients can mark messages as read" ON public.chat_messages;

CREATE POLICY "Recipients can mark messages as read"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = chat_messages.conversation_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
      OR
      (c.type = 'group' AND EXISTS (
        SELECT 1 FROM public.chat_members cm
        WHERE cm.conversation_id = c.id AND cm.user_id = auth.uid()
      ))
    )
  )
);

-- chat_reactions: Fix SELECT policy
DROP POLICY IF EXISTS "Users can view reactions in own conversations" ON public.chat_reactions;

CREATE POLICY "Users can view reactions in own conversations"
ON public.chat_reactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_messages m
    JOIN public.chat_conversations c ON c.id = m.conversation_id
    WHERE m.id = chat_reactions.message_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
      OR
      (c.type = 'group' AND EXISTS (
        SELECT 1 FROM public.chat_members cm
        WHERE cm.conversation_id = c.id AND cm.user_id = auth.uid()
      ))
    )
  )
);

-- chat_message_reads: Fix SELECT policy
DROP POLICY IF EXISTS "Users can view reads in own conversations" ON public.chat_message_reads;

CREATE POLICY "Users can view reads in own conversations"
ON public.chat_message_reads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_messages m
    JOIN public.chat_conversations c ON c.id = m.conversation_id
    WHERE m.id = chat_message_reads.message_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
      OR
      (c.type = 'group' AND EXISTS (
        SELECT 1 FROM public.chat_members cm
        WHERE cm.conversation_id = c.id AND cm.user_id = auth.uid()
      ))
    )
  )
);
