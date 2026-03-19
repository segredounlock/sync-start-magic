-- Remove redundant policy that checks revendedor role (already covered by "Authenticated can read pricing rules")
DROP POLICY IF EXISTS "Admins and resellers can read pricing rules" ON public.pricing_rules;

-- Update handle_new_user trigger to always assign 'usuario' role
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _reseller_id uuid;
BEGIN
  _reseller_id := (NEW.raw_user_meta_data->>'reseller_id')::uuid;

  INSERT INTO public.profiles (id, email, nome, reseller_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    _reseller_id
  );

  INSERT INTO public.saldos (user_id, tipo, valor) VALUES (NEW.id, 'revenda', 0);
  INSERT INTO public.saldos (user_id, tipo, valor) VALUES (NEW.id, 'pessoal', 0);

  -- Always assign 'usuario' role for new users (clients registered via store also get 'usuario')
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');

  RETURN NEW;
END;
$function$;