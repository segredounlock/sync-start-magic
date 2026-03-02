
-- Fix recargas: ALL policies are RESTRICTIVE which means NO permissive = access denied for everyone
-- Need to make SELECT policies PERMISSIVE and add one for all authenticated users (for live ticker)

-- Drop existing RESTRICTIVE SELECT policies
DROP POLICY IF EXISTS "Users can view own recargas" ON public.recargas;
DROP POLICY IF EXISTS "Admins can view all recargas" ON public.recargas;
DROP POLICY IF EXISTS "Resellers can view client recargas" ON public.recargas;

-- Re-create as PERMISSIVE so they use OR logic
CREATE POLICY "Authenticated can view recargas"
  ON public.recargas FOR SELECT TO authenticated
  USING (true);

-- Also fix transactions: same RESTRICTIVE-only issue
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Resellers can view client transactions" ON public.transactions;

-- Users see own, admins see all
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Resellers can view client transactions"
  ON public.transactions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = transactions.user_id AND p.reseller_id = auth.uid()
  ));
