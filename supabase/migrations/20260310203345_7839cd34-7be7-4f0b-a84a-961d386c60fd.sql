
-- ==========================================
-- FIX 4: pricing_rules - Restrict SELECT to admins only
-- ==========================================

DROP POLICY IF EXISTS "Authenticated can view pricing rules" ON public.pricing_rules;

-- Now only admins can see pricing_rules (the ALL policy already covers admin access)

-- ==========================================
-- FIX 5: poll_votes - Restrict SELECT to own votes only
-- ==========================================

-- Remove the blanket "Authenticated can view poll votes" policy
DROP POLICY IF EXISTS "Authenticated can view poll votes" ON public.poll_votes;

-- The existing "Users can view own votes" and "Admins can view all votes" policies remain

-- ==========================================
-- FIX 6: follows - Restrict to involved users only
-- ==========================================

DROP POLICY IF EXISTS "Authenticated can view follows" ON public.follows;

CREATE POLICY "Users can view own follows"
ON public.follows
FOR SELECT
TO authenticated
USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Admin access for follows
CREATE POLICY "Admins can view all follows"
ON public.follows
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));
