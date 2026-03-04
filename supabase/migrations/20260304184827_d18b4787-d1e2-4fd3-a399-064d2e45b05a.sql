
-- Table to persist group chat members
CREATE TABLE public.chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view members of group conversations they belong to
CREATE POLICY "Users can view group members"
  ON public.chat_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_conversations c
      WHERE c.id = chat_members.conversation_id
        AND (c.type = 'group' OR c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );

-- Users can insert themselves as members
CREATE POLICY "Users can join groups"
  ON public.chat_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can manage all members
CREATE POLICY "Admins can manage members"
  ON public.chat_members FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for member count updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_members;
