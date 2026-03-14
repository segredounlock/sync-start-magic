
-- ============================================================
-- CORREÇÃO 9: chat_messages - Users can update own messages
-- Adicionar WITH CHECK para impedir alteração de sender_id
-- ============================================================
DROP POLICY IF EXISTS "Users can update own messages" ON public.chat_messages;

CREATE POLICY "Users can update own messages"
ON public.chat_messages
FOR UPDATE
TO public
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

-- ============================================================
-- CORREÇÃO 10: profiles - Limpar telegram_bot_token da tabela profiles
-- O token já está em reseller_config (isolado). Manter o campo mas
-- garantir que policies não o exponham. Vamos recriar policies de
-- SELECT que outros usuários usam, limitando o que eles veem.
-- A abordagem: criar uma função SECURITY DEFINER que retorna
-- apenas campos públicos de um perfil.
-- ============================================================

-- Criar policy que restringe "Resellers can view client profiles" 
-- Não podemos restringir colunas via RLS, mas podemos confiar na 
-- view profiles_public. Vamos deixar a policy como está (revendedor 
-- precisa ver email/telefone dos seus clientes para contato).
-- O problema real é telegram_bot_token em profiles. Vamos limpar o campo.
-- O token já vive em reseller_config, então profiles.telegram_bot_token
-- pode ser nulificado para todos (dados já migrados).

-- Nulificar telegram_bot_token em profiles (já está em reseller_config)
UPDATE public.profiles SET telegram_bot_token = NULL WHERE telegram_bot_token IS NOT NULL;
