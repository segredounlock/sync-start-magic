

## Bug: Preços personalizados não funcionam para usuários com role "usuario"

### Causa Raiz

Na Edge Function `recarga-express`, a função `hasCustomPricing()` (linha 632-649) **ignora completamente** usuários com role "usuario":

```text
hasCustomPricing():
  ├─ admin/revendedor → verifica reseller_pricing_rules do userId ✅
  ├─ cliente + resellerId → verifica regras do reseller ✅
  └─ usuario (else) → return false ❌  ← BUG AQUI
```

Quando `hasCustomPricing()` retorna `false`, e a Margem Padrão Global está ativa, o sistema aplica a margem global **sobrescrevendo** os preços personalizados que o admin definiu para esses usuários.

O bloco `else` (linha 717-732) que resolve o preço para "usuario" até verifica a `reseller_pricing_rules`, mas nunca é alcançado porque a margem global já foi aplicada antes.

### Correção

**Arquivo:** `supabase/functions/recarga-express/index.ts`

1. **Corrigir `hasCustomPricing()`** — Adicionar verificação para role "usuario": se o usuário possui regras em `reseller_pricing_rules`, retornar `true` para que a margem global não sobrescreva seus preços personalizados.

```text
hasCustomPricing() corrigido:
  ├─ admin/revendedor → verifica reseller_pricing_rules do userId ✅
  ├─ cliente + resellerId → verifica regras do reseller ✅
  └─ usuario (novo!) → verifica reseller_pricing_rules do userId ✅
```

A mudança é simples: remover o `return false` final e adicionar uma verificação genérica para qualquer role que tenha regras na `reseller_pricing_rules`.

### Impacto
- Os 3 usuários identificados (Recargas Brasil, João Victor, Neverland) passarão a ter seus preços personalizados respeitados
- Nenhum outro fluxo é afetado — admin, revendedor e cliente continuam funcionando como antes

