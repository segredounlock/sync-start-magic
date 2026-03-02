

## Investigacao: `custo_api` vindo como R$ 0,00 no telegram-bot

### Causa raiz

O problema está na linha 1203 do `telegram-bot/index.ts`:

```typescript
const custoApi = Number(orderData.cost || 0);
```

O campo `cost` **não existe** na resposta da API de recarga (`/recharges`). O `cost` (custo da API) é uma propriedade do **catálogo**, não do pedido. A resposta do pedido contém `status`, `carrier`, `_id`, etc., mas não `cost`.

No `recarga-express`, isso funciona porque o `apiCost` é extraído do catálogo **antes** de fazer a recarga (via `valueObj.cost`). O telegram-bot não faz isso.

### Solução

Salvar o `custo_api` (v.cost do catálogo) na sessão do Telegram, junto com o custo do usuário, e usá-lo na hora de gravar a recarga.

**Arquivo:** `supabase/functions/telegram-bot/index.ts`

1. **Na seleção do valor (linha ~1037-1042):** Ao montar os botões, já temos `v.cost` (custo API). Salvar esse valor na sessão junto com `userCost`. Alterar o `callback_data` ou a sessão para incluir o custo API.

2. **Na etapa `rec_val_` (linha ~1052-1074):** Buscar o `v.cost` real do catálogo (que já é carregado ali na linha 1060-1062) e salvar na sessão como `custo_api`.

3. **Na confirmação `rconfirm_yes` (linha ~1162):** Ler `custo_api` da sessão e usar na inserção em vez de `orderData.cost`.

### Mudancas concretas

**Passo 1** — No handler `rec_val_` (~linha 1060-1073), após buscar o catálogo, extrair o custo API real:

```typescript
const carrier = catalog.find((c: any) => c.carrierId === carrierId);
const carrierName = carrier?.name || carrierId;
// Extrair custo API do catálogo
const valueObj = carrier?.values?.find((v: any) => v.valueId === valueId);
const apiCost = Number(valueObj?.cost || 0);
```

E adicionar `api_cost: apiCost` na sessão salva.

**Passo 2** — Na confirmação `rconfirm_yes` (~linha 1162), ler da sessão:

```typescript
const { telefone, carrier_id: carrierId, value_id: valueId, valor: cost, user_id: userId, api_cost: apiCostFromSession } = confirmSession.data || {};
```

**Passo 3** — Na inserção (~linha 1203), usar o valor da sessão:

```typescript
const custoApi = Number(apiCostFromSession || orderData.cost || 0);
```

Tambem corrigir o `valorFacial` para buscar do catálogo se `orderData.value` não existir.

### Resumo tecnico

| O que | Antes | Depois |
|---|---|---|
| `custo_api` | `orderData.cost` (sempre 0) | Vem da sessão, extraído do catálogo |
| Arquivos alterados | 1 | `telegram-bot/index.ts` |
| Risco | Nenhum — apenas adiciona dado à sessão existente |

