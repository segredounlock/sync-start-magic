-- Allow all authenticated users to see poll votes (for counting)
CREATE POLICY "Authenticated can view poll votes" ON public.poll_votes FOR SELECT
  USING (auth.uid() IS NOT NULL);
