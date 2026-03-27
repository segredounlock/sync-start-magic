-- 1. Remove the overly broad policy that exposes ALL profile data to every authenticated user
DROP POLICY IF EXISTS "Authenticated can view basic profiles" ON public.profiles;