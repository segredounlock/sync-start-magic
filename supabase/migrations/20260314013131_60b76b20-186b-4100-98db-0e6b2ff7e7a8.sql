
-- ============================================================
-- CORREÇÃO 1: profiles SELECT - Remover policy que expõe TUDO
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can view any profile" ON public.profiles;

-- ============================================================
-- CORREÇÃO 2: profiles UPDATE - Bloquear alteração de reseller_id
-- Criar função auxiliar para validar
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_reseller_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT reseller_id FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

-- Recriar policy de UPDATE do próprio perfil com proteção de reseller_id
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND NOT (verification_badge IS DISTINCT FROM get_user_verification_badge(auth.uid()))
  AND NOT (reseller_id IS DISTINCT FROM get_user_reseller_id(auth.uid()))
);

-- ============================================================
-- CORREÇÃO 3: chat_members INSERT - Bloquear auto-join em privados
-- ============================================================
DROP POLICY IF EXISTS "Users can join groups" ON public.chat_members;

CREATE POLICY "Users can join public groups"
ON public.chat_members
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id
      AND c.type = 'group'
      AND (c.is_private IS NULL OR c.is_private = false)
  )
);

-- ============================================================
-- CORREÇÃO 4: pricing_rules SELECT - Restringir a admins + próprio reseller
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can read pricing rules" ON public.pricing_rules;

CREATE POLICY "Admins and resellers can read pricing rules"
ON public.pricing_rules
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'revendedor')
);

-- ============================================================
-- CORREÇÃO 5: chat_messages - Scoped badge holder policies
-- ============================================================
DROP POLICY IF EXISTS "Badge holders can update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Badge holders can delete messages" ON public.chat_messages;

CREATE POLICY "Badge holders can update messages in own conversations"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  has_verification_badge(auth.uid())
  AND is_conversation_participant(conversation_id, auth.uid())
);

CREATE POLICY "Badge holders can delete messages in own conversations"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (
  has_verification_badge(auth.uid())
  AND is_conversation_participant(conversation_id, auth.uid())
);
