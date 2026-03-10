DROP POLICY IF EXISTS "Users can update own conversations" ON public.chat_conversations;

CREATE POLICY "Users can update own conversations"
ON public.chat_conversations
FOR UPDATE
TO authenticated
USING (
  (type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2))
  OR
  (type = 'group' AND is_chat_member(id, auth.uid()))
)
WITH CHECK (
  NOT (is_blocked IS DISTINCT FROM (
    SELECT c.is_blocked FROM public.chat_conversations c WHERE c.id = chat_conversations.id
  ))
);