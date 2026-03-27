DROP POLICY IF EXISTS "Authenticated can view profiles in own network" ON public.profiles;

CREATE POLICY "Authenticated can view basic profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL)