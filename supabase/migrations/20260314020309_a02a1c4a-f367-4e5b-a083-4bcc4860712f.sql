
-- CORREÇÃO: Restaurar acesso a campos públicos de profiles para autenticados
-- Isso é necessário para chat, followers, listagens, etc.
-- A coluna telegram_bot_token já foi removida da tabela, então não há mais risco
CREATE POLICY "Authenticated can view basic profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);
