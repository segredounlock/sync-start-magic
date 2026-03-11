
-- Fix polls: drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "Admins can manage polls" ON public.polls;
DROP POLICY IF EXISTS "Authenticated can view active polls" ON public.polls;

CREATE POLICY "Admins can manage polls"
ON public.polls FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view active polls"
ON public.polls FOR SELECT
TO public
USING (auth.uid() IS NOT NULL AND active = true);

-- Fix poll_votes: drop restrictive policies, recreate as permissive
DROP POLICY IF EXISTS "Admins can view all votes" ON public.poll_votes;
DROP POLICY IF EXISTS "Users can insert own vote" ON public.poll_votes;
DROP POLICY IF EXISTS "Users can view own votes" ON public.poll_votes;

CREATE POLICY "Admins can view all votes"
ON public.poll_votes FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own vote"
ON public.poll_votes FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own votes"
ON public.poll_votes FOR SELECT
TO public
USING (auth.uid() = user_id);
