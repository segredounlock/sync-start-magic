

## Problema Encontrado: Safety Floor Sobrescrevendo Preço Customizado

### Diagnóstico

Para o usuário `ferreiragreg180` (role=`usuario`) fazendo recarga CLARO R$70:

```text
1. reseller_base_pricing_rules: regra_valor=25, custo=23 (tipo=fixo)
   → applyRule retorna R$ 25,00 ✅

2. Safety Floor calcula:
   - apiCost = R$ 23,00
   - Global pricing_rules: regra_valor=26, custo=23 (tipo=fixo)
   - floor = max(23, 26) = R$ 26,00

3. chargedCost=25 < floor=26
   → FORÇADO para R$ 26,00 ❌
```

O safety floor foi projetado para proteger o admin de vender abaixo do preço global. Mas quando o **admin deliberadamente** define um preço customizado MENOR que o global em `reseller_base_pricing_rules`, essa proteção se torna um bug.

### Correção

**Arquivo**: `supabase/functions/recarga-express/index.ts` (linhas 768-799)

Quando o `pricingSource` for `reseller_base_pricing_rules` (preço definido pelo admin), o safety floor deve usar apenas o `apiCost` como piso, não o preço global. A lógica é: se o admin definiu um preço customizado, ele sabe o que está fazendo.

```text
Fluxo corrigido:
  - Se pricingSource contém "reseller_base_pricing_rules":
    floor = apiCost (R$ 23,00) → chargedCost R$ 25 > 23 ✅ mantém R$ 25
  - Se pricingSource é outro (margem padrão, fallback global):
    floor = max(apiCost, globalPrice) → mantém proteção normal
```

### Resumo da mudança

Modificar o bloco de safety floor (~linha 772-778) para pular a elevação ao preço global quando a fonte de precificação for `reseller_base_pricing_rules`, preservando apenas o piso do custo da API.

