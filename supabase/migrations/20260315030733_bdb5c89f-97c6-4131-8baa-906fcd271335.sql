
CREATE TABLE public.client_pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL,
  client_id uuid NOT NULL,
  operadora_id uuid NOT NULL REFERENCES public.operadoras(id) ON DELETE CASCADE,
  valor_recarga numeric NOT NULL,
  lucro numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reseller_id, client_id, operadora_id, valor_recarga)
);

ALTER TABLE public.client_pricing_rules ENABLE ROW LEVEL SECURITY;

-- Resellers can manage pricing for their own clients
CREATE POLICY "Resellers can manage own client pricing"
ON public.client_pricing_rules
FOR ALL
TO authenticated
USING (auth.uid() = reseller_id)
WITH CHECK (auth.uid() = reseller_id);

-- Admins full access
CREATE POLICY "Admins can manage all client pricing"
ON public.client_pricing_rules
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Clients can view their own pricing
CREATE POLICY "Clients can view own pricing"
ON public.client_pricing_rules
FOR SELECT
TO authenticated
USING (auth.uid() = client_id);

-- Trigger for updated_at
CREATE TRIGGER update_client_pricing_rules_updated_at
  BEFORE UPDATE ON public.client_pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
