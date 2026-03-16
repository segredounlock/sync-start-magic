
-- Table for per-reseller deposit fees
CREATE TABLE public.reseller_deposit_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL DEFAULT 'fixo',
  fee_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reseller_id)
);

ALTER TABLE public.reseller_deposit_fees ENABLE ROW LEVEL SECURITY;

-- Reseller can manage their own fee config
CREATE POLICY "Resellers can manage own deposit fees"
ON public.reseller_deposit_fees
FOR ALL
TO authenticated
USING (auth.uid() = reseller_id)
WITH CHECK (auth.uid() = reseller_id);

-- Admins can manage all
CREATE POLICY "Admins can manage all deposit fees"
ON public.reseller_deposit_fees
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Members of a network can read their reseller's fee
CREATE POLICY "Network members can view reseller fee"
ON public.reseller_deposit_fees
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.reseller_id = reseller_deposit_fees.reseller_id
  )
);

-- RPC to get fee config for a user (resolves reseller fee or global fallback)
CREATE OR REPLACE FUNCTION public.get_deposit_fee_for_user(_user_id UUID)
RETURNS TABLE(fee_type TEXT, fee_value NUMERIC)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _reseller_id UUID;
BEGIN
  -- Get user's reseller
  SELECT p.reseller_id INTO _reseller_id FROM public.profiles p WHERE p.id = _user_id;

  -- Try reseller-specific fee
  IF _reseller_id IS NOT NULL THEN
    RETURN QUERY
      SELECT rdf.fee_type, rdf.fee_value
      FROM public.reseller_deposit_fees rdf
      WHERE rdf.reseller_id = _reseller_id AND rdf.fee_value > 0;
    IF FOUND THEN RETURN; END IF;
  END IF;

  -- Fallback to global system_config
  RETURN QUERY
    SELECT
      COALESCE((SELECT sc.value FROM public.system_config sc WHERE sc.key = 'taxaTipo'), 'fixo') AS fee_type,
      COALESCE(
        CAST(REPLACE((SELECT sc.value FROM public.system_config sc WHERE sc.key = 'taxaValor'), ',', '.') AS NUMERIC),
        0
      ) AS fee_value;
END;
$$;
