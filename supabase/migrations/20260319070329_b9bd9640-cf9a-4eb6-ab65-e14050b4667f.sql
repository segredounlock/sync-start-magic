
-- Function to generate a unique slug from a name
CREATE OR REPLACE FUNCTION public.generate_unique_slug(p_nome text, p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_slug text;
  candidate text;
  counter int := 0;
BEGIN
  -- Create base slug from name: lowercase, remove accents, replace spaces with hyphens, remove special chars
  base_slug := lower(unaccent(coalesce(p_nome, 'user')));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  
  -- If empty after cleaning, use 'user'
  IF base_slug = '' THEN
    base_slug := 'user';
  END IF;
  
  -- Truncate to 30 chars
  base_slug := left(base_slug, 30);
  
  candidate := base_slug;
  
  -- Check uniqueness and append number if needed
  LOOP
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE slug = candidate AND id != p_user_id) THEN
      RETURN candidate;
    END IF;
    counter := counter + 1;
    candidate := base_slug || '-' || counter;
  END LOOP;
END;
$$;

-- Enable unaccent extension if not already enabled
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Generate slugs for all users who don't have one
UPDATE profiles
SET slug = public.generate_unique_slug(nome, id),
    updated_at = now()
WHERE slug IS NULL;

-- Make slug NOT NULL with a unique constraint going forward
ALTER TABLE profiles ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_slug_unique ON profiles (slug);

-- Update handle_new_user to auto-generate slug on signup
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

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');

  RETURN NEW;
END;
$function$;
