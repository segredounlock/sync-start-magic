
-- Fix 1: Restrict user_roles admin policy to authenticated only
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
CREATE POLICY "Only admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::text))
WITH CHECK (has_role(auth.uid(), 'admin'::text));

-- Fix 2: Replace profiles reseller policy with more restrictive version
DROP POLICY IF EXISTS "Resellers can view client profiles" ON public.profiles;
CREATE POLICY "Resellers can view client profiles"
ON public.profiles FOR SELECT TO authenticated
USING (reseller_id = auth.uid());
