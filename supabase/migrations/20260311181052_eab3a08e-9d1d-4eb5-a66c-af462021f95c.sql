
-- Create a security definer function to get aggregated vote counts for a poll
-- This allows all authenticated users to see total counts without exposing individual votes
CREATE OR REPLACE FUNCTION public.get_poll_vote_counts(_poll_id uuid)
RETURNS TABLE(option_index integer, vote_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pv.option_index, COUNT(*)::bigint as vote_count
  FROM public.poll_votes pv
  WHERE pv.poll_id = _poll_id
  GROUP BY pv.option_index;
$$;
