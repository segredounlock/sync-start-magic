
-- Table to track disabled recharge values per carrier
CREATE TABLE public.disabled_recharge_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operadora_id uuid NOT NULL REFERENCES public.operadoras(id) ON DELETE CASCADE,
  valor numeric NOT NULL,
  disabled_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(operadora_id, valor)
);

ALTER TABLE public.disabled_recharge_values ENABLE ROW LEVEL SECURITY;

-- Only admins can manage disabled values
CREATE POLICY "Admins can manage disabled_recharge_values"
  ON public.disabled_recharge_values
  FOR ALL
  TO public
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- All authenticated users can read (to filter in catalog)
CREATE POLICY "Authenticated can view disabled values"
  ON public.disabled_recharge_values
  FOR SELECT
  TO authenticated
  USING (true);
