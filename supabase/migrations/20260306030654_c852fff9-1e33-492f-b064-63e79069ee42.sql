
-- Add bio column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT '';

-- Create follows table
CREATE TABLE public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id)
);

-- Enable RLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone authenticated can view follows
CREATE POLICY "Authenticated can view follows"
  ON public.follows FOR SELECT
  TO authenticated
  USING (true);

-- RLS: Users can follow (insert own)
CREATE POLICY "Users can follow"
  ON public.follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

-- RLS: Users can unfollow (delete own)
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- RLS: Allow any authenticated user to view public profiles (for profile page)
CREATE POLICY "Authenticated can view any profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Function to get follower/following counts
CREATE OR REPLACE FUNCTION public.get_follow_counts(_user_id uuid)
RETURNS TABLE(followers_count bigint, following_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (SELECT COUNT(*) FROM public.follows WHERE following_id = _user_id) as followers_count,
    (SELECT COUNT(*) FROM public.follows WHERE follower_id = _user_id) as following_count;
$$;
