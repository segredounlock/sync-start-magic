
-- 1. Create SECURITY DEFINER function to get user's verification badge
CREATE OR REPLACE FUNCTION public.get_user_verification_badge(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT verification_badge FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

-- 2. Drop the problematic policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 3. Recreate without self-referencing subquery
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (
  (auth.uid() = id)
  AND (NOT (verification_badge IS DISTINCT FROM public.get_user_verification_badge(auth.uid())))
);
