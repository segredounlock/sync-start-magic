

# Plano: Unificar lógica de recarga do bot via Edge Function `recarga-express`

## Problema atual

O bot Telegram (linhas 1266-1339) chama a API Recarga Express **diretamente** (`fetch("https://express.poeki.dev/api/v1/recharges")`), duplicando toda a lógica que já existe na Edge Function `recarga-express`. Isso causa:

- **Sem polling de status** no bot (o site faz até 3 tentativas de 5s)
- **Sem notificação Telegram** pós-recarga (a Edge Function envia, o bot não)
- **Lógica de pricing duplicada** (ambos calculam custos com regras diferentes)
- **Risco de divergência** futura quando uma lógica for atualizada e a outra não

## Solução

Substituir a chamada direta à API externa no handler `rconfirm_yes` por uma chamada interna à Edge Function `recarga-express` (action: `recharge`). A Edge Function já faz tudo: resolve IDs, aplica pricing, debita saldo, salva recarga, faz polling e notifica.

## Alterações

### 1. `supabase/functions/telegram-bot/index.ts` — Handler `rconfirm_yes` (linhas 1251-1340)

Substituir todo o bloco de processamento de recarga por:

```typescript
// Em vez de chamar a API diretamente, chamar a Edge Function recarga-express
const rechargeResp = await fetch(
  `${Deno.env.get("SUPABASE_URL")}/functions/v1/recarga-express`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({
      action: "recharge",
      carrierId,
      phoneNumber: telefone,
      valueId,
      saldo_tipo: "revenda",
    }),
  }
);
const rechargeResult = await rechargeResp.json();
```

**O que muda no handler:**
- Remove: busca manual de API Key, `fetch` direto à Poeki, dedução de saldo, insert em `recargas`
- Mantém: leitura da session, mensagem de "processando", formatação da resposta de sucesso/erro
- A Edge Function já retorna `localBalance`, `cost`, e dados do pedido — basta usar esses valores na mensagem

### 2. Autenticação na chamada interna

A Edge Function `recarga-express` valida o token via `getClaims` para extrair o `userId`. Como o bot não tem um token de usuário, usaremos o **service role key** e precisaremos passar o `userId` explicitamente.

**Adicionar suporte a `user_id` override na Edge Function** quando chamado com service role:
- Se o header Authorization contém o service role key, aceitar um campo `user_id` no body
- Caso contrário, continuar usando o `userId` extraído do token

### 3. `supabase/functions/recarga-express/index.ts` — Suporte a service role

Adicionar no início da função (após validação de auth):

```typescript
// Se chamado com service role, aceitar user_id do body
let userId: string;
if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
  const body = await req.json();
  userId = body.user_id;
  if (!userId) throw new Error("user_id obrigatório para service role");
} else {
  // Fluxo normal via getClaims
}
```

### 4. Limpeza do código legado no bot

- Remover handler `confirm_` legado (linhas 1342-1383) — usa lógica antiga sem API
- Manter `fetchCatalog()` pois é usado para listar operadoras e valores no menu

## Resumo dos benefícios

- **Comportamento idêntico**: polling de status, pricing, notificações — tudo centralizado
- **Menos código no bot**: ~80 linhas removidas
- **Manutenção única**: qualquer mudança na lógica de recarga só precisa ser feita na Edge Function

## Arquivos alterados

| Arquivo | Tipo |
|---|---|
| `supabase/functions/telegram-bot/index.ts` | Simplificar handler `rconfirm_yes`, remover handler `confirm_` legado |
| `supabase/functions/recarga-express/index.ts` | Adicionar suporte a chamada via service role com `user_id` no body |

