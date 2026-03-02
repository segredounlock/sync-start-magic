
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Authenticated can view recargas" ON public.recargas;

-- Add back user-specific SELECT (PERMISSIVE)
CREATE POLICY "Users can view own recargas"
  ON public.recargas FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admin access (PERMISSIVE)
CREATE POLICY "Admins can view all recargas"
  ON public.recargas FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Reseller access (PERMISSIVE)
CREATE POLICY "Resellers can view client recargas"
  ON public.recargas FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = recargas.user_id AND p.reseller_id = auth.uid()
  ));

-- Security definer function for ticker (returns limited columns, no sensitive data)
CREATE OR REPLACE FUNCTION public.get_ticker_recargas()
RETURNS TABLE (
  id uuid,
  telefone text,
  operadora text,
  valor numeric,
  status text,
  created_at timestamptz,
  user_id uuid
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.telefone, r.operadora, r.valor, r.status, r.created_at, r.user_id
  FROM public.recargas r
  ORDER BY r.created_at DESC
  LIMIT 200;
$$;
