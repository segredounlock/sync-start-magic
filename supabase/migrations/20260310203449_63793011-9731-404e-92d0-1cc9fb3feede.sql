
-- Re-add authenticated SELECT on profiles (needed by 17+ code files)
-- but NULL out telegram_bot_token for non-owners via a trigger approach
-- Actually, column-level RLS isn't possible, so we re-add the policy
-- and protect the most sensitive field (telegram_bot_token) by migrating it to reseller_config

CREATE POLICY "Authenticated can view any profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Migrate existing telegram_bot_tokens to reseller_config
INSERT INTO public.reseller_config (user_id, key, value)
SELECT id, 'telegram_bot_token', telegram_bot_token
FROM public.profiles
WHERE telegram_bot_token IS NOT NULL AND telegram_bot_token != ''
ON CONFLICT DO NOTHING;

-- Clear telegram_bot_token from profiles table
UPDATE public.profiles SET telegram_bot_token = NULL WHERE telegram_bot_token IS NOT NULL;
