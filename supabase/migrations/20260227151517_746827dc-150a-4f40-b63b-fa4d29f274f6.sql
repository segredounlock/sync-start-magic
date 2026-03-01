
-- Tabela de regras de precificação por valor de recarga
CREATE TABLE public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operadora_id UUID NOT NULL REFERENCES public.operadoras(id) ON DELETE CASCADE,
  valor_recarga NUMERIC NOT NULL,
  custo NUMERIC NOT NULL DEFAULT 0,
  tipo_regra TEXT NOT NULL DEFAULT 'fixo' CHECK (tipo_regra IN ('fixo', 'margem')),
  regra_valor NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(operadora_id, valor_recarga)
);

-- Enable RLS
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins full access on pricing_rules"
ON public.pricing_rules
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Everyone can read pricing rules (needed for recharge flow)
CREATE POLICY "Everyone can read pricing_rules"
ON public.pricing_rules
FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_pricing_rules_updated_at
BEFORE UPDATE ON public.pricing_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
