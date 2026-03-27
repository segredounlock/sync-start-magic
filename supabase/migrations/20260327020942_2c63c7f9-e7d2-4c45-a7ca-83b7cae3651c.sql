
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _reseller_id uuid;
  _nome text;
  _slug text;
  _has_any_admin boolean;
BEGIN
  _reseller_id := (NEW.raw_user_meta_data->>'reseller_id')::uuid;
  _nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  _slug := public.generate_unique_slug(_nome, NEW.id);

  INSERT INTO public.profiles (id, email, nome, reseller_id, slug)
  VALUES (
    NEW.id,
    NEW.email,
    _nome,
    _reseller_id,
    _slug
  );

  INSERT INTO public.saldos (user_id, tipo, valor) VALUES (NEW.id, 'revenda', 0);
  INSERT INTO public.saldos (user_id, tipo, valor) VALUES (NEW.id, 'pessoal', 0);

  -- Check if any admin exists in the system
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) INTO _has_any_admin;

  IF _has_any_admin THEN
    -- Normal flow: assign 'usuario' role
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');
  ELSE
    -- First user ever: make them admin + master
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario')
      ON CONFLICT DO NOTHING;
    -- Save as master admin
    INSERT INTO public.system_config (key, value)
    VALUES ('masterAdminId', NEW.id::text)
    ON CONFLICT (key) DO UPDATE SET value = NEW.id::text, updated_at = now();
  END IF;

  RETURN NEW;
END;
$function$;
