-- Allow authenticated users to read fee config keys
DROP POLICY IF EXISTS "Authenticated can view fee config" ON public.system_config;
CREATE POLICY "Authenticated can view fee config"
  ON public.system_config
  FOR SELECT
  TO authenticated
  USING (key IN ('taxaTipo', 'taxaValor'));