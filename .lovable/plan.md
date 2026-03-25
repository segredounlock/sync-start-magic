

# Devolver R$ 7,70 ao Vitinho

## Ação

Executar uma migração SQL que:

1. Credita R$ 7,70 no saldo de revenda do Vitinho (`eb565a68-d0f8-43da-8633-bb6a3d2ecb75`) usando `increment_saldo`
2. Registra a ação no `audit_logs` com detalhes das 4 recargas afetadas

## SQL

```sql
SELECT increment_saldo('eb565a68-d0f8-43da-8633-bb6a3d2ecb75'::uuid, 'revenda', 7.70);

INSERT INTO audit_logs (admin_id, action, target_type, target_id, details)
VALUES (
  'f5501acc-79f3-460f-bc3e-493280ea84f0',
  'refund_pricing_bug',
  'saldo',
  'eb565a68-d0f8-43da-8633-bb6a3d2ecb75',
  '{"motivo":"Devolução por sobrecobrança de reseller_pricing_rules órfãs","valor_devolvido":7.70,"saldo_tipo":"revenda","recargas_afetadas":4}'::jsonb
);
```

Saldo atual: R$ 6,64 → Novo saldo: R$ 14,34

Nenhum arquivo de código será alterado.

