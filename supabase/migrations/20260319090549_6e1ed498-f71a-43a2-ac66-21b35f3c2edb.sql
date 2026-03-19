CREATE TABLE public.reseller_base_pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  operadora_id UUID NOT NULL REFERENCES public.operadoras(id) ON DELETE CASCADE,
  valor_recarga NUMERIC NOT NULL,
  custo NUMERIC NOT NULL DEFAULT 0,
  tipo_regra TEXT NOT NULL DEFAULT 'fixo',
  regra_valor NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, operadora_id, valor_recarga)
);

ALTER TABLE public.reseller_base_pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all reseller base pricing"
ON public.reseller_base_pricing_rules
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own reseller base pricing"
ON public.reseller_base_pricing_rules
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Clients can view reseller base pricing"
ON public.reseller_base_pricing_rules
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.reseller_id = reseller_base_pricing_rules.user_id
  )
);

CREATE TRIGGER update_reseller_base_pricing_rules_updated_at
BEFORE UPDATE ON public.reseller_base_pricing_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();