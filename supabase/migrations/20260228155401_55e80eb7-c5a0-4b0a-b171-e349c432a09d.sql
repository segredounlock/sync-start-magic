
-- 1. Recreate the trigger on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Fix orphaned users: insert missing profiles
INSERT INTO public.profiles (id, nome, email)
SELECT au.id, COALESCE(au.raw_user_meta_data->>'nome', ''), au.email
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- 3. Fix orphaned users: insert missing saldos
INSERT INTO public.saldos (user_id, valor, tipo)
SELECT au.id, 0, 'revenda'
FROM auth.users au
LEFT JOIN public.saldos s ON s.user_id = au.id AND s.tipo = 'revenda'
WHERE s.id IS NULL;
