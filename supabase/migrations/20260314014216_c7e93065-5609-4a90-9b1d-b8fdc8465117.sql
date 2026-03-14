
-- CORREÇÃO 14: transactions INSERT - forçar status pending
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

CREATE POLICY "Users can insert own transactions"
ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- CORREÇÃO 15: chat_reactions INSERT - verificar participação
DROP POLICY IF EXISTS "Users can add reactions" ON public.chat_reactions;

CREATE POLICY "Users can add reactions"
ON public.chat_reactions
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.chat_messages m
    WHERE m.id = message_id
      AND is_conversation_participant(m.conversation_id, auth.uid())
  )
);
