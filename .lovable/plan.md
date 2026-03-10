

# Plano: Log detalhado de precificação na Edge Function `recarga-express`

## Situação atual

A linha 418 já tem um log básico: `pricing: role=X apiCost=X chargedCost=X catalogValue=X`. Falta informação sobre **qual regra** foi aplicada (global vs personalizada), o tipo da regra (fixo/margem) e os valores da regra.

## Alteração

**Arquivo**: `supabase/functions/recarga-express/index.ts` (linhas 381-418)

Adicionar uma variável `pricingSource` que rastreia qual regra foi usada, e expandir o `console.log` final com detalhes completos:

- Dentro de cada branch (`admin`, `revendedor`, `cliente`, fallback), registrar:
  - `pricingSource`: `"reseller_pricing_rules"` ou `"pricing_rules"` ou `"api_default"`
  - `ruleDetails`: tipo da regra, valor da regra, custo base

- Substituir o log da linha 418 por algo como:
```
pricing: role=revendedor | source=reseller_pricing_rules | tipo=fixo | regra_valor=25.50 | custo_base=22.00 | apiCost=21.50 | chargedCost=25.50 | catalogValue=30 | userId=abc | resellerId=null
```

Isso permite identificar imediatamente no log qual tabela foi consultada, se a regra é fixa ou margem, e qual o valor aplicado — facilitando debug sem precisar replicar a lógica manualmente.

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `supabase/functions/recarga-express/index.ts` | Adicionar tracking de `pricingSource` e `ruleDetails` em cada branch de pricing, expandir log |

