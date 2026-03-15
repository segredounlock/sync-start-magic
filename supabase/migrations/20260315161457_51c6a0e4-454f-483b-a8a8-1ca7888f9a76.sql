DROP POLICY IF EXISTS "Authenticated can view sent notifications" ON public.notifications;
CREATE POLICY "Authenticated can view notifications" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);