

## Problema Identificado

Na função `fetchCatalog` do `RevendedorPainel.tsx` (linhas 151-152), a comparação de regras de preço usa `===` entre `r.valor_recarga` (que pode vir como string do banco) e `v` (número do array `valores`):

```typescript
// ATUAL — pode falhar: "20" === 20 → false
const resellerRule = opResellerRules.find((r: any) => r.valor_recarga === v);
const globalRule = opGlobalRules.find((r) => r.valor_recarga === v);
```

Quando nenhuma regra é encontrada, o custo cai no fallback `: v` (linha 158), fazendo o "Paga" mostrar o mesmo valor da recarga.

Comparando com `Principal.tsx` (linha 436), lá os dados são convertidos com `Number(r.valor_recarga)` antes do uso — mas no painel do revendedor isso não acontece.

## Correção

**Arquivo:** `src/pages/RevendedorPainel.tsx`

Alterar as comparações nas linhas 151-152 para usar `Number()`:

```typescript
const resellerRule = opResellerRules.find((r: any) => Number(r.valor_recarga) === v);
const globalRule = opGlobalRules.find((r) => Number(r.valor_recarga) === v);
```

Isso garante que a regra de preço customizada (reseller ou global) será corretamente localizada e aplicada, exibindo o valor correto no "Paga R$".

