

## Plano: Corrigir preços personalizados no Bot do Telegram e Mini App

### Problema
O bot do Telegram usa uma resolução simplificada de valores (`v.value || v.cost`) ao buscar o catálogo da API, enquanto o site e o Mini App usam uma lógica mais robusta que tenta múltiplos campos (`value`, `faceValue`, `amount`, `rechargeValue`, e até parsing de `label`). Quando `v.value` é `0` ou ausente, o bot usa `v.cost` como face value, que **não corresponde** ao `valor_recarga` salvo nas `pricing_rules` / `reseller_pricing_rules`. Resultado: a regra personalizada não é encontrada e o preço fica no valor padrão da API.

### Causa raiz
- **Bot** (linha 1096): `const faceValue = v.value || v.cost;` — simplificado demais
- **Mini App** (telegram-miniapp): tem lógica robusta com fallback chain (`value → faceValue → amount → rechargeValue → label parsing`)
- **Site** (RevendedorPainel/Principal): mesma lógica robusta

O `valor_recarga` salvo na tabela de pricing é baseado no valor resolvido pela lógica robusta do site. Quando o bot usa uma lógica diferente, o `find()` na linha 1084 falha.

### Alteração

**`supabase/functions/telegram-bot/index.ts`**

1. Adicionar uma função helper `resolveValue(v)` que replique a mesma lógica de resolução do Mini App:
```typescript
function resolveValue(v: any): number {
  return (Number(v?.value) > 0 ? Number(v.value) : 0) ||
    (Number(v?.faceValue) > 0 ? Number(v.faceValue) : 0) ||
    (Number(v?.amount) > 0 ? Number(v.amount) : 0) ||
    (Number(v?.rechargeValue) > 0 ? Number(v.rechargeValue) : 0) ||
    (() => {
      const label = String(v?.label || "").replace(/,/g, ".");
      const nums = label.match(/\d+(?:\.\d{1,2})?/g);
      if (!nums?.length) return Number(v?.cost) || 0;
      const parsed = Number(nums[nums.length - 1]);
      return Number.isFinite(parsed) && parsed > 0 ? parsed : Number(v?.cost) || 0;
    })();
}
```

2. Substituir todas as ocorrências de `v.value || v.cost` por `resolveValue(v)` no fluxo de recarga (linhas ~1081, 1096, 1110).

O Mini App (`telegram-miniapp`) **já tem** a lógica correta implementada, então não precisa de alteração.

### Resultado esperado
Claro exibirá R$ 15,50 no bot (igual ao site), pois a regra personalizada da `ericaferreiradutra` será encontrada corretamente pelo `valor_recarga` correspondente.

