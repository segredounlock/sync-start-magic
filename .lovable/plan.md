

## Diagnóstico e Correção

### Problema raiz
A Edge Function `sync-pending-recargas` não mapeia o status `expirada` retornado pela API externa. Apenas `falha`, `cancelada` e `cancelled` são tratados como falha. Pedidos expirados ficam presos em `pending` para sempre.

### Plano

**1. Corrigir o mapeamento de status na sync function**

Em `supabase/functions/sync-pending-recargas/index.ts`, adicionar `expirada` e `expired` à lista de status mapeados para `falha`:

```typescript
// Antes:
if (apiStatus === "falha" || apiStatus === "cancelada" || apiStatus === "cancelled")

// Depois:
if (apiStatus === "falha" || apiStatus === "cancelada" || apiStatus === "cancelled" || apiStatus === "expirada" || apiStatus === "expired")
```

**2. Corrigir manualmente o pedido preso**

Executar migração SQL para:
- Atualizar o status do pedido `ace98bbd-...` para `falha`
- Estornar R$ 12,30 ao saldo do usuário `0899d920-...`

```sql
UPDATE recargas SET status = 'falha', updated_at = now() WHERE id = 'ace98bbd-4625-4966-802a-60fcf434be14';
UPDATE saldos SET valor = valor + 12.30 WHERE user_id = '0899d920-2f0f-4609-9f9f-318d3566738c' AND tipo = 'revenda';
```

**3. Verificar se há outros pedidos presos**

Consultar se existem mais recargas `pending` antigas que também podem estar nessa situação.

### Arquivos alterados
- `supabase/functions/sync-pending-recargas/index.ts` (adicionar status `expirada`/`expired`)
- Nova migração SQL (correção manual do pedido + estorno)

