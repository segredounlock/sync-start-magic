
-- Drop RESTRICTIVE license gate policies
DROP POLICY IF EXISTS "License gate on recargas insert" ON public.recargas;
DROP POLICY IF EXISTS "License gate on recargas select" ON public.recargas;
DROP POLICY IF EXISTS "License gate on transactions insert" ON public.transactions;
DROP POLICY IF EXISTS "License gate on transactions select" ON public.transactions;
DROP POLICY IF EXISTS "License gate on pricing_rules select" ON public.pricing_rules;
DROP POLICY IF EXISTS "License gate on operadoras select" ON public.operadoras;
DROP POLICY IF EXISTS "License gate on saldos select" ON public.saldos;
DROP POLICY IF EXISTS "License gate on profiles select" ON public.profiles;

-- Drop the is_license_valid function
DROP FUNCTION IF EXISTS public.is_license_valid();

-- Drop get_installation_status function (no longer needed)
DROP FUNCTION IF EXISTS public.get_installation_status();
