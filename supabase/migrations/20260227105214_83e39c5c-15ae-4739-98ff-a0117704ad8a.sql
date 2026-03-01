
-- Add contact fields to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS whatsapp_number text;

-- Create operadoras catalog table
CREATE TABLE public.operadoras (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  valores numeric[] NOT NULL DEFAULT '{}',
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.operadoras ENABLE ROW LEVEL SECURITY;

-- Only admins can manage operadoras
CREATE POLICY "Admins can manage operadoras"
  ON public.operadoras FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Everyone authenticated can view active operadoras
CREATE POLICY "Authenticated users can view operadoras"
  ON public.operadoras FOR SELECT
  USING (true);

-- Insert default operadoras
INSERT INTO public.operadoras (nome, valores) VALUES
  ('Vivo', ARRAY[10, 15, 20, 25, 30, 35, 40, 50, 100]),
  ('Claro', ARRAY[10, 15, 20, 25, 30, 35, 40, 50, 100]),
  ('TIM', ARRAY[10, 15, 20, 25, 30, 35, 40, 50, 100]),
  ('Oi', ARRAY[10, 15, 20, 25, 30, 35, 40, 50, 100]);
