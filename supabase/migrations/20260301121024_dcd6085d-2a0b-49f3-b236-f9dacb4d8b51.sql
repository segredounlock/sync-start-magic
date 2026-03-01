
-- Revert: remove auto role assignment from handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.saldos (user_id, tipo, valor)
  VALUES (NEW.id, 'revenda', 0);
  
  INSERT INTO public.saldos (user_id, tipo, valor)
  VALUES (NEW.id, 'pessoal', 0);
  
  RETURN NEW;
END;
$function$;

-- Remove the role that was incorrectly auto-assigned to sonsmarcas
DELETE FROM public.user_roles WHERE user_id = '3013a843-08f3-400a-8d86-a92cb996c9db' AND role = 'revendedor';
