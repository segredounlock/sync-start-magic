
-- 1. Remove all reseller links (make everyone independent)
UPDATE public.profiles SET reseller_id = NULL WHERE reseller_id IS NOT NULL;

-- 2. Clear all referral commissions
DELETE FROM public.referral_commissions;

-- 3. Reset "pessoal" (commission) balances to 0
UPDATE public.saldos SET valor = 0, updated_at = now() WHERE tipo = 'pessoal' AND valor != 0;

-- 4. Ensure all users who had reseller_id have at least 'usuario' role
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'usuario'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
)
ON CONFLICT DO NOTHING;
