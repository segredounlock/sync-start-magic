
-- Function to auto-generate a unique slug from email
CREATE OR REPLACE FUNCTION public.generate_default_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  -- Only set slug if it's null
  IF NEW.slug IS NULL THEN
    -- Extract username from email, clean it
    base_slug := lower(regexp_replace(split_part(COALESCE(NEW.email, 'loja'), '@', 1), '[^a-z0-9]', '-', 'g'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- Ensure minimum length
    IF length(base_slug) < 3 THEN
      base_slug := base_slug || '-loja';
    END IF;
    
    final_slug := base_slug;
    
    -- Check uniqueness and append counter if needed
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug AND id != NEW.id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger on INSERT to auto-generate slug
DROP TRIGGER IF EXISTS auto_generate_slug ON public.profiles;
CREATE TRIGGER auto_generate_slug
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_default_slug();

-- Backfill existing profiles that have no slug
DO $$
DECLARE
  r RECORD;
  base_slug TEXT;
  final_slug TEXT;
  counter INT;
BEGIN
  FOR r IN SELECT id, email FROM public.profiles WHERE slug IS NULL LOOP
    base_slug := lower(regexp_replace(split_part(COALESCE(r.email, 'loja'), '@', 1), '[^a-z0-9]', '-', 'g'));
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    IF length(base_slug) < 3 THEN
      base_slug := base_slug || '-loja';
    END IF;
    final_slug := base_slug;
    counter := 0;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter;
    END LOOP;
    UPDATE public.profiles SET slug = final_slug WHERE id = r.id;
  END LOOP;
END;
$$;
