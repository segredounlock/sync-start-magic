-- ═══ FIX 1: Badge holders should NOT be able to delete/modify OTHER users' messages ═══
DROP POLICY IF EXISTS "Badge holders can delete messages in own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Badge holders can update messages in own conversations" ON public.chat_messages;

CREATE POLICY "Badge holders can pin messages in own conversations"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  has_verification_badge(auth.uid()) 
  AND is_conversation_participant(conversation_id, auth.uid())
)
WITH CHECK (
  has_verification_badge(auth.uid()) 
  AND is_conversation_participant(conversation_id, auth.uid())
  AND (NOT (content IS DISTINCT FROM (SELECT m.content FROM chat_messages m WHERE m.id = chat_messages.id)))
  AND (NOT (sender_id IS DISTINCT FROM (SELECT m.sender_id FROM chat_messages m WHERE m.id = chat_messages.id)))
);

CREATE POLICY "Badge holders can soft-delete messages in own conversations"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  has_verification_badge(auth.uid()) 
  AND is_conversation_participant(conversation_id, auth.uid())
)
WITH CHECK (
  has_verification_badge(auth.uid()) 
  AND is_conversation_participant(conversation_id, auth.uid())
  AND is_deleted = true
  AND deleted_by = auth.uid()
);

-- ═══ FIX 2: Restrict profiles access ═══
DROP POLICY IF EXISTS "Authenticated can view basic profiles" ON public.profiles;

CREATE POLICY "Authenticated can view profiles in own network"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR reseller_id = auth.uid()
  OR id = (SELECT p.reseller_id FROM public.profiles p WHERE p.id = auth.uid())
  OR has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.type = 'direct' AND (
      (c.participant_1 = auth.uid() AND c.participant_2 = profiles.id)
      OR (c.participant_2 = auth.uid() AND c.participant_1 = profiles.id)
    )
  )
  OR EXISTS (
    SELECT 1 FROM public.chat_members cm1
    JOIN public.chat_members cm2 ON cm1.conversation_id = cm2.conversation_id
    WHERE cm1.user_id = auth.uid() AND cm2.user_id = profiles.id
  )
);

-- ═══ FIX 3: Restrict pricing rules ═══
DROP POLICY IF EXISTS "Authenticated can read pricing rules" ON public.pricing_rules;

CREATE POLICY "Admins and resellers can read pricing rules"
ON public.pricing_rules
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'revendedor')
  OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role != 'usuario')
)