

## Analysis

The deposit confirmation happens in `supabase/functions/pix-webhook/index.ts`. When a PIX payment is confirmed (status "paid"), the webhook:
1. Updates the transaction to "completed"
2. Credits the user's balance
3. Sends a Telegram notification

But it does **not** send a PWA push notification. The `send-push` function already exists and is used in `sync-pending-recargas` for recharges. We just need to add the same pattern to the pix-webhook.

## Plan

### 1. Add push notification to `pix-webhook/index.ts`

After the Telegram notification block (around line 354), add a fire-and-forget call to `send-push` with:
- **Title**: `✅ Depósito Confirmado`
- **Body**: `Depósito de R$ XX,XX confirmado! Saldo atualizado.`
- **user_ids**: `[tx.user_id]`

This follows the exact same pattern already used in `sync-pending-recargas/index.ts` for recharge notifications:

```typescript
// Push notification (PWA) for deposit confirmed
const baseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
fetch(`${baseUrl}/functions/v1/send-push`, {
  method: "POST",
  headers: { 
    "Content-Type": "application/json",
    Authorization: `Bearer ${serviceKey}` 
  },
  body: JSON.stringify({
    title: "✅ Depósito Confirmado",
    body: `Depósito de R$ ${Number(tx.amount).toFixed(2).replace(".", ",")} confirmado! Saldo atualizado.`,
    user_ids: [tx.user_id],
  }),
}).catch(() => {});
```

This is a single-file change -- only `supabase/functions/pix-webhook/index.ts` needs to be edited.

