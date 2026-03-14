
-- ============================================================
-- CORREÇÃO 6: profiles "Users can view chat participant profiles"
-- Corrigir branch de grupo: exigir que o profile alvo seja membro do mesmo grupo
-- ============================================================
DROP POLICY IF EXISTS "Users can view chat participant profiles" ON public.profiles;

CREATE POLICY "Users can view chat participant profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE (
      (c.type = 'direct' AND (
        (c.participant_1 = auth.uid() AND c.participant_2 = profiles.id)
        OR (c.participant_2 = auth.uid() AND c.participant_1 = profiles.id)
      ))
      OR (c.type = 'group' AND is_chat_member(c.id, auth.uid()) AND is_chat_member(c.id, profiles.id))
    )
  )
);

-- ============================================================
-- CORREÇÃO 7: transactions UPDATE - Remover policy pública
-- Transações devem ser atualizadas apenas por service_role/edge functions
-- ============================================================
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;

-- ============================================================
-- CORREÇÃO 8: chat_messages "Recipients can mark messages as read"
-- Restringir para só permitir alterar is_read e read_at
-- ============================================================
DROP POLICY IF EXISTS "Recipients can mark messages as read" ON public.chat_messages;

CREATE POLICY "Recipients can mark messages as read"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  is_conversation_participant(conversation_id, auth.uid())
  AND sender_id != auth.uid()
)
WITH CHECK (
  is_conversation_participant(conversation_id, auth.uid())
  AND sender_id != auth.uid()
  AND sender_id = (SELECT m.sender_id FROM public.chat_messages m WHERE m.id = chat_messages.id)
  AND content IS NOT DISTINCT FROM (SELECT m.content FROM public.chat_messages m WHERE m.id = chat_messages.id)
  AND conversation_id IS NOT DISTINCT FROM (SELECT m.conversation_id FROM public.chat_messages m WHERE m.id = chat_messages.id)
);
