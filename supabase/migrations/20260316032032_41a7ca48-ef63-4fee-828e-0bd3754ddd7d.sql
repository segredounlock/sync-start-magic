-- Confirmar transação paga manualmente (comprovante Nubank verificado)
UPDATE transactions 
SET status = 'completed', 
    updated_at = now(),
    metadata = metadata || '{"confirmed_by":"admin_manual","confirmed_at":"2026-03-16T03:20:00Z"}'::jsonb
WHERE id = 'd233150b-f9df-4743-9d47-d257062d9460' AND status = 'pending';

-- Creditar R$50 no saldo de revenda
SELECT increment_saldo('c576348a-95ae-4877-9003-0e4d363be2b8'::uuid, 'revenda', 50);