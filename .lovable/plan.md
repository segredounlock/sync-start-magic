

## Problema Identificado

O cliente está vendo o **custo interno da API** ("Paga R$ X") na tabela de preços do Telegram Mini App. Isso acontece porque:

1. O edge function `telegram-miniapp` retorna `cost` (custo do fornecedor) e `userCost` (preço com regra de pricing)
2. Quando não há regra de pricing do revendedor, `userCost` = `apiCost` (custo do fornecedor), que é diferente do valor de face
3. O frontend compara `faceValue !== displayCost` → mostra "Paga R$ X" expondo o custo interno

**Exemplo**: Recarga de R$ 20,00 custa R$ 19,50 na API. O cliente vê "R$ 20,00 / Paga R$ 19,50" — isso é o custo interno, não deveria aparecer.

## Solução

### 1. Edge Function `telegram-miniapp` — Lógica de preço por role

Para **clientes** (role `cliente`): se não há regra de pricing personalizada, `userCost` deve ser igual ao `faceValue` (valor de face), não ao custo da API. O cliente paga o valor cheio a menos que o revendedor defina um preço diferente.

Para **revendedores**: manter o comportamento atual (mostra custo real).

### 2. Frontend `TelegramMiniApp.tsx` — Sem mudança necessária

A lógica `hasDiff` já funciona corretamente — o problema é que o backend envia dados errados para clientes.

### Arquivos alterados
- `supabase/functions/telegram-miniapp/index.ts` — Ajustar `userCost` para clientes sem regra de pricing: usar `faceValue` em vez de `apiCost`

