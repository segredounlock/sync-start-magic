DROP POLICY IF EXISTS "Resellers can view client profiles" ON public.profiles;

CREATE POLICY "Resellers can view client profiles"
ON public.profiles
FOR SELECT
USING (reseller_id = auth.uid());