

## Diagnóstico: Preços incorretos no site

### Problema raiz

A tabela `pricing_rules` tem regras criadas automaticamente pelo `sync-catalog` com `regra_valor = 0` e `tipo_regra = 'fixo'`. Isso significa "o admin ainda não definiu um preço de revenda". Porém o código interpreta literalmente como "preço = R$ 0".

**Dados atuais da Claro no banco:**

```text
Valor  │ custo (API) │ regra_valor │ tipo_regra
─────────────────────────────────────────────────
R$ 20  │   10        │   12        │ fixo  ← admin definiu → Paga R$ 12 ✓
R$ 25  │   11        │   13        │ fixo  ← admin definiu → Paga R$ 13 ✓
R$ 30  │   11        │   13        │ fixo  ← admin definiu → Paga R$ 13 ✓
R$ 35  │   14        │    0        │ fixo  ← NÃO definido  → Paga R$ 0  ✗
R$ 40  │   16        │    0        │ fixo  ← NÃO definido  → Paga R$ 0  ✗
R$ 50  │   17        │    0        │ fixo  ← NÃO definido  → Paga R$ 0  ✗
```

Quando `regra_valor = 0`, o sistema deveria usar o campo `custo` (custo real da API) como fallback, e não cobrar R$ 0.

O screenshot mostra "Paga R$ 20,00" (valor facial) para todos — isso indica que o catálogo está vindo do fallback da API sem regras aplicadas, OU o cache está desatualizado.

### Correção

Adicionar fallback em **todos os pontos** que calculam o custo do revendedor: quando `tipo_regra === 'fixo'` e `regra_valor === 0`, usar `custo` em vez de 0.

**Fórmula atual (bugada):**
```typescript
cost = rule.tipo_regra === "fixo" ? Number(rule.regra_valor) : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100);
```

**Fórmula corrigida:**
```typescript
cost = rule.tipo_regra === "fixo"
  ? (Number(rule.regra_valor) > 0 ? Number(rule.regra_valor) : Number(rule.custo))
  : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100);
```

### Arquivos a alterar

1. **`src/pages/RevendedorPainel.tsx`** — linha 161-163 (catálogo do site)
2. **`supabase/functions/telegram-bot/index.ts`** — linhas 882 e 1248-1250 (cálculo no bot)
3. **`supabase/functions/telegram-miniapp/index.ts`** — linha dentro do `applyRule` (mini app)
4. **`supabase/functions/recarga-express/index.ts`** — mesma fórmula no processamento de recarga

### Impacto

- Preços da Claro R$ 35/40/50 passarão a mostrar o custo real (R$ 14/16/17 respectivamente)
- Valores que o admin JÁ definiu (R$ 20→12, R$ 25→13, R$ 30→13) continuam iguais
- Correção consistente em todos os 4 canais (site, bot, mini app, recarga)

