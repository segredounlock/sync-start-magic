

# Devolver R$ 7,70 ao Vitinho

## Resumo
Creditar R$ 7,70 no saldo de revenda do Vitinho e registrar no audit_logs.

## Plano

### 1. Migração SQL
Executar uma migração que:
- Chama `increment_saldo` para adicionar R$ 7,70 ao saldo de revenda do Vitinho (`eb565a68-d0f8-43da-8633-bb6a3d2ecb75`)
- Insere um registro em `audit_logs` documentando a devolução com os detalhes das 4 recargas afetadas (IDs, valores cobrados, preços corretos, diferenças)

### 2. Notificação admin
Insere uma entrada em `admin_notifications` informando que a devolução foi processada.

## Detalhes Técnicos

```sql
-- Creditar R$ 7,70 no saldo de revenda
SELECT increment_saldo(
  'eb565a68-d0f8-43da-8633-bb6a3d2ecb75'::uuid,
  'revenda',
  7.70
);

-- Registrar auditoria
INSERT INTO audit_logs (admin_id, action, target_type, target_id, details)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'refund_pricing_bug',
  'saldo',
  'eb565a68-d0f8-43da-8633-bb6a3d2ecb75',
  '{"motivo": "Sobrecobrança por reseller_pricing_rules órfãs", "valor_devolvido": 7.70, "recargas": [...]}'
);
```

Nenhum arquivo de código será alterado. Apenas uma migração SQL.

