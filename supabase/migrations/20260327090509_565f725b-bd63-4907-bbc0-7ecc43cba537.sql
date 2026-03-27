-- Remove the overly broad group chat member lookup from profiles policy
-- Keep only direct chat participants (which require mutual participation)
DROP POLICY IF EXISTS "Authenticated can view profiles in own network" ON public.profiles;

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
)