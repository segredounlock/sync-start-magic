

# Plano: Corrigir deleção de regras de precificação no sync do frontend

## Problema encontrado

O sistema tem **duas sincronizações** de catálogo:

1. **Edge Function `sync-catalog`** (a cada 30 min) — já corrigida, preserva regras órfãs
2. **Frontend `Principal.tsx`** (ao abrir o painel master) — **ainda deleta regras órfãs** na linha 420

Quando o admin abre o painel principal, o sync frontend apaga as `pricing_rules` de valores ausentes na API, destruindo as customizações (`tipo_regra` e `regra_valor`). Quando o valor retorna, uma regra nova é criada com valores padrão (fixo/0).

As regras são usadas corretamente em todos os canais (admin, revendedor, cliente, bot Telegram, Mini App) via `recarga-express` e `telegram-miniapp`. O problema é exclusivamente na **deleção durante o sync**.

## Correção

### `src/pages/Principal.tsx` (linhas 413-424)

Remover o bloco que deleta regras órfãs, substituindo por log informativo (mesmo comportamento da edge function):

```typescript
// Antes:
// Clean up orphan pricing_rules for values no longer in API
const { data: existingRules } = await supabase.from("pricing_rules")...
  await supabase.from("pricing_rules").delete().eq("id", rule.id);

// Depois:
// Orphan pricing_rules: keep them so admin customizations are preserved
const { data: existingRules } = await supabase.from("pricing_rules")...
  console.log(`[Sync] Regra órfã preservada: ${nome} R$${rule.valor_recarga}`);
```

Apenas 1 arquivo alterado. Todas as regras de precificação (globais e por revendedor) passarão a ser preservadas em todos os cenários de sync.

