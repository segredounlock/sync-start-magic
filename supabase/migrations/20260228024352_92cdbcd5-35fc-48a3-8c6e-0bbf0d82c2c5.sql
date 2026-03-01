
-- Reseller-specific pricing rules
CREATE TABLE public.reseller_pricing_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  operadora_id uuid NOT NULL REFERENCES public.operadoras(id) ON DELETE CASCADE,
  valor_recarga numeric NOT NULL,
  custo numeric NOT NULL DEFAULT 0,
  tipo_regra text NOT NULL DEFAULT 'fixo',
  regra_valor numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, operadora_id, valor_recarga)
);

-- Enable RLS
ALTER TABLE public.reseller_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own reseller_pricing_rules"
  ON public.reseller_pricing_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reseller_pricing_rules"
  ON public.reseller_pricing_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reseller_pricing_rules"
  ON public.reseller_pricing_rules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reseller_pricing_rules"
  ON public.reseller_pricing_rules FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reseller_pricing_rules"
  ON public.reseller_pricing_rules FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow anon/public to read reseller pricing (needed for public store page)
CREATE POLICY "Public can read reseller_pricing_rules"
  ON public.reseller_pricing_rules FOR SELECT
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_reseller_pricing_rules_updated_at
  BEFORE UPDATE ON public.reseller_pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
