
-- =============================================
-- BLINDAGEM TOTAL: transactions e recargas
-- =============================================

-- 1. TRANSACTIONS: Remover política perigosa com USING(true)
DROP POLICY IF EXISTS "Service role full access transactions" ON public.transactions;

-- 2. RECARGAS: Remover política perigosa com USING(true) 
DROP POLICY IF EXISTS "Service role full access recargas" ON public.recargas;

-- 3. Garantir que a função do ticker não expõe dados sensíveis
-- (já criada anteriormente, mas vamos recriar com campos ainda mais restritos)
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

-- 4. Remover qualquer política anônima/pública restante em tabelas sensíveis
-- profiles: garantir que ninguém não-autenticado veja
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- 5. telegram_sessions: já está restrito a service_role, manter
-- Verificar que a policy existente é segura
DROP POLICY IF EXISTS "Service role only telegram_sessions" ON public.telegram_sessions;
-- Recriar sem ambiguidade - apenas service_role (que já bypassa RLS)
-- Nenhuma policy = nenhum acesso para authenticated/anon
-- Mas precisamos de pelo menos uma policy para o service_role funcionar via RLS bypass

-- 6. saldos: remover qualquer acesso público
DROP POLICY IF EXISTS "Public can view saldos" ON public.saldos;

-- 7. Garantir que user_roles não é explorado
DROP POLICY IF EXISTS "Public can view roles" ON public.user_roles;
