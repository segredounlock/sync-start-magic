CREATE POLICY "Authenticated can view support admin config"
ON public.system_config
FOR SELECT
TO authenticated
USING (key IN ('supportAdminTelegramId', 'supportAdminUserId'));