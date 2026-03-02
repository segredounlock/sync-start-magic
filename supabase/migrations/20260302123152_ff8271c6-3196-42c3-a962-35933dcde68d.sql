-- Allow authenticated users to see basic profile info of users they share a conversation with
CREATE POLICY "Users can view chat participant profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE (
      (c.type = 'direct' AND (
        (c.participant_1 = auth.uid() AND c.participant_2 = profiles.id) OR
        (c.participant_2 = auth.uid() AND c.participant_1 = profiles.id)
      ))
      OR
      (c.type = 'group')
    )
  )
);