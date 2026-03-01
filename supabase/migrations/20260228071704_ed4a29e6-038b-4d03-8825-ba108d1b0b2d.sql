
-- Add 'tipo' column to saldos table to separate personal vs reseller balance
ALTER TABLE public.saldos ADD COLUMN tipo text NOT NULL DEFAULT 'revenda';

-- Drop the existing unique constraint on user_id if any, and create a new unique on (user_id, tipo)
-- First check: the current trigger creates one saldo per user. We need to allow two rows per user.
-- Remove any unique index on user_id alone
DO $$
BEGIN
  -- Drop unique constraint if exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'saldos_user_id_key' AND conrelid = 'public.saldos'::regclass) THEN
    ALTER TABLE public.saldos DROP CONSTRAINT saldos_user_id_key;
  END IF;
END $$;

-- Add unique constraint on (user_id, tipo) to prevent duplicates
ALTER TABLE public.saldos ADD CONSTRAINT saldos_user_id_tipo_unique UNIQUE (user_id, tipo);

-- Create personal balance (tipo='pessoal') for all users who are admin or revendedor
INSERT INTO public.saldos (user_id, valor, tipo)
SELECT ur.user_id, 0, 'pessoal'
FROM public.user_roles ur
WHERE ur.role IN ('admin', 'revendedor')
ON CONFLICT (user_id, tipo) DO NOTHING;

-- Update the handle_new_user function to create 'revenda' saldo by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', ''), NEW.email);
  
  INSERT INTO public.saldos (user_id, valor, tipo) VALUES (NEW.id, 0, 'revenda');
  RETURN NEW;
END;
$function$;

-- Function to ensure personal saldo exists when a user gets a role
CREATE OR REPLACE FUNCTION public.ensure_personal_saldo()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role IN ('admin', 'revendedor') THEN
    INSERT INTO public.saldos (user_id, valor, tipo)
    VALUES (NEW.user_id, 0, 'pessoal')
    ON CONFLICT (user_id, tipo) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Trigger to auto-create personal saldo when role is assigned
CREATE TRIGGER on_role_assigned
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_personal_saldo();
