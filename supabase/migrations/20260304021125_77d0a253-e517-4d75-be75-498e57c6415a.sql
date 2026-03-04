
-- Fix user_roles: restrict SELECT to own roles + admin
DROP POLICY IF EXISTS "Authenticated can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));
