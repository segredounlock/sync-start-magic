
-- Drop the restrictive SELECT policies and recreate as permissive
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Create permissive SELECT policy so authenticated users can see roles
CREATE POLICY "Authenticated can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (true);
