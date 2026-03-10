
-- Create a security definer function to check chat membership without triggering RLS
CREATE OR REPLACE FUNCTION public.is_chat_member(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_members
    WHERE conversation_id = _conversation_id
      AND user_id = _user_id
  )
$$;

-- Also create a function to check if user is participant in a conversation (direct or group member)
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = _conversation_id
    AND (
      (c.type = 'direct' AND (c.participant_1 = _user_id OR c.participant_2 = _user_id))
      OR
      (c.type = 'group' AND EXISTS (
        SELECT 1 FROM public.chat_members cm
        WHERE cm.conversation_id = c.id AND cm.user_id = _user_id
      ))
    )
  )
$$;

-- Fix chat_conversations policies using the security definer function
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chat_conversations;

CREATE POLICY "Users can view own conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (
  (type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2))
  OR
  (type = 'group' AND public.is_chat_member(id, auth.uid()))
);

DROP POLICY IF EXISTS "Users can update own conversations" ON public.chat_conversations;

CREATE POLICY "Users can update own conversations"
ON public.chat_conversations
FOR UPDATE
TO authenticated
USING (
  (type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2))
  OR
  (type = 'group' AND public.is_chat_member(id, auth.uid()))
);

-- Fix chat_members SELECT policy to use security definer function
DROP POLICY IF EXISTS "Users can view group members" ON public.chat_members;

CREATE POLICY "Users can view group members"
ON public.chat_members
FOR SELECT
TO authenticated
USING (
  public.is_conversation_participant(conversation_id, auth.uid())
);

-- Fix chat_messages policies using security definer function
DROP POLICY IF EXISTS "Users can view messages in own conversations" ON public.chat_messages;

CREATE POLICY "Users can view messages in own conversations"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (
  public.is_conversation_participant(conversation_id, auth.uid())
);

DROP POLICY IF EXISTS "Users can send messages in own conversations" ON public.chat_messages;

CREATE POLICY "Users can send messages in own conversations"
ON public.chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND public.is_conversation_participant(conversation_id, auth.uid())
);

DROP POLICY IF EXISTS "Recipients can mark messages as read" ON public.chat_messages;

CREATE POLICY "Recipients can mark messages as read"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (
  public.is_conversation_participant(conversation_id, auth.uid())
);

-- Fix chat_reactions SELECT policy
DROP POLICY IF EXISTS "Users can view reactions in own conversations" ON public.chat_reactions;

CREATE POLICY "Users can view reactions in own conversations"
ON public.chat_reactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_messages m
    WHERE m.id = chat_reactions.message_id
    AND public.is_conversation_participant(m.conversation_id, auth.uid())
  )
);

-- Fix chat_message_reads SELECT policy
DROP POLICY IF EXISTS "Users can view reads in own conversations" ON public.chat_message_reads;

CREATE POLICY "Users can view reads in own conversations"
ON public.chat_message_reads
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_messages m
    WHERE m.id = chat_message_reads.message_id
    AND public.is_conversation_participant(m.conversation_id, auth.uid())
  )
);

-- Fix the "Users can view chat participant profiles" policy on profiles that also causes recursion
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
      OR (c.type = 'group' AND public.is_chat_member(c.id, auth.uid()))
    )
  )
);
