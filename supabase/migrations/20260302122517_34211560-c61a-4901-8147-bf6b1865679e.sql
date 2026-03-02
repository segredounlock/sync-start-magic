
-- telegram_sessions: negar acesso total para authenticated/anon
-- service_role já bypassa RLS automaticamente
CREATE POLICY "Deny all access telegram_sessions"
  ON public.telegram_sessions FOR ALL TO authenticated
  USING (false)
  WITH CHECK (false);
