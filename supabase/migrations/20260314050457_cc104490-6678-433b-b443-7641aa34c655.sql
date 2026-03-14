CREATE POLICY "Authenticated can view sent notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (status IN ('sent', 'completed'));