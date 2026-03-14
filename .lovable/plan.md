

## Plano: Validação de custo mínimo no recarga-express

### Problema
Recargas estão sendo concluídas com `custo = 0` para o revendedor, causando prejuízo real (R$ 114 identificados).

### Solução
Adicionar duas validações no `recarga-express/index.ts` logo após o cálculo do `chargedCost` (linha 533), **antes** do débito de saldo:

1. **Bloquear custo zero**: Se `chargedCost <= 0`, usar `apiCost` como fallback obrigatório
2. **Bloquear custo abaixo da API**: Se `chargedCost < apiCost`, forçar `chargedCost = apiCost` e logar warning

### Mudança técnica

**Arquivo:** `supabase/functions/recarga-express/index.ts`

Após a linha do `console.log` de pricing (linha 533), inserir:

```typescript
// Safety: never allow cost below API cost (prevents loss)
if (chargedCost <= 0 || chargedCost < apiCost) {
  console.warn(`PRICING SAFETY: chargedCost=${chargedCost} is below apiCost=${apiCost} for user=${userId} operator=${resolvedOperator} amount=${resolvedAmount}. Forcing apiCost as minimum.`);
  chargedCost = apiCost;
  pricingSource += "(safety_floor)";
}
```

Isso garante que **nenhuma recarga será processada com custo zero ou abaixo do custo real da API**, independente de misconfigurações nas pricing_rules.

### Impacto
- Zero risco de prejuízo por regras mal configuradas
- Comportamento transparente via logs (fácil de auditar)
- Não bloqueia a recarga — apenas corrige o preço para o mínimo seguro

