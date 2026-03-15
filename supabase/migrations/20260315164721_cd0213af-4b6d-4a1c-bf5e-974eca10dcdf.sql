DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;

CREATE POLICY "Users can view own conversations"
  ON public.chat_conversations
  FOR SELECT
  TO authenticated
  USING (
    (type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2))
    OR
    (type = 'group' AND (
      is_chat_member(id, auth.uid())
      OR (is_private IS DISTINCT FROM true)
    ))
  );