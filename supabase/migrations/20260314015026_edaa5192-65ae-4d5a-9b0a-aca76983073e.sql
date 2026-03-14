
-- CORREÇÃO 16: recargas INSERT - forçar status pending
DROP POLICY IF EXISTS "Users can insert own recargas" ON public.recargas;

CREATE POLICY "Users can insert own recargas"
ON public.recargas
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- CORREÇÃO 17: Remover coluna telegram_bot_token de profiles
-- Token já vive isolado em reseller_config
ALTER TABLE public.profiles DROP COLUMN IF EXISTS telegram_bot_token;
