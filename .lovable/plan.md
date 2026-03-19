

## Plano: Crédito automático de comissão no saldo pessoal

### Problema
Quando uma recarga é concluída, o sistema registra a comissão na tabela `referral_commissions` mas **não credita** o valor no saldo `pessoal` do beneficiário. O saldo de Comissões permanece R$ 0,00.

### Solução
Adicionar duas chamadas `increment_saldo` na função `generateCommissions` dentro de `supabase/functions/recarga-express/index.ts`:

1. **Comissão direta (após linha 110):** creditar `directAmount` no saldo `pessoal` do reseller
2. **Comissão indireta (após linha 142):** creditar `indirectAmount` no saldo `pessoal` do "avô"

### Onde o saldo aparece na interface
- **Painel do Revendedor** → aba Carteira → card "Comissões"
- **Minha Rede** → métricas de lucratividade
- **Saques** → saldo disponível para saque

### Detalhes técnicos

**Arquivo:** `supabase/functions/recarga-express/index.ts`

Após cada insert em `referral_commissions`, adicionar:
```typescript
await adminClient.rpc("increment_saldo", {
  p_user_id: resellerId, // ou grandparentId
  p_tipo: "pessoal",
  p_amount: directAmount, // ou indirectAmount
});
```

A RPC `increment_saldo` já existe e é atômica (SECURITY DEFINER), garantindo integridade financeira.

**Nenhuma migration de banco necessária.**

