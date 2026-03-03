

## Diagnóstico: Recargas travadas em "pending"

### Problema identificado

A API externa (express.poeki.dev) processa recargas de forma assíncrona. Quando o pedido é criado via `POST /recharges`, a API retorna imediatamente com status inicial (geralmente diferente de "feita"/"concluida"). O sistema salva como `pending` e **depende de polling posterior** para atualizar.

**Causas raiz das recargas travadas:**

1. **Sem webhook configurado**: A edge function não envia `webhookUrl` na maioria dos casos (o param é opcional e raramente passado pelo frontend). A API externa não tem como notificar proativamente quando a recarga é concluída.

2. **Polling limitado e frágil**: O polling client-side (a cada 30s) só funciona enquanto o usuário está com a tela aberta. Se o usuário fecha o app, o polling para e a recarga fica "pending" para sempre.

3. **order-status busca apenas 50 pedidos**: A consulta `GET /me/orders?page=1&limit=50` pode não encontrar pedidos mais antigos se houver volume alto, fazendo o `find` retornar `null` e a recarga nunca ser atualizada.

4. **Sem atualização automática server-side**: Não existe nenhum cron/job que verifique periodicamente as recargas pending no banco e consulte seus status na API externa.

### Dados atuais
- **19 recargas pending** vs **63 completed** (23% das recargas ficam travadas)
- Recargas pending vão desde 01/03 até 03/03

### Plano de correção

#### 1. Criar cron job para resolver recargas pending (server-side)
Criar uma edge function `sync-pending-recargas` que:
- Busca todas as recargas com `status = 'pending'` e `external_id` não nulo
- Para cada uma, consulta a API externa via `/me/orders` (paginando se necessário)
- Atualiza o status local para `completed` ou `falha` conforme resposta da API
- Se uma recarga pending tem mais de 24h e não é encontrada na API, marca como `falha`

#### 2. Registrar a function como cron (a cada 5 minutos)
Usar `pg_cron` ou invocar via Supabase scheduled functions para executar automaticamente.

#### 3. Melhorar o polling no momento da criação
Na action `recharge`, após criar o pedido, usar polling server-side curto (3 tentativas com 5s de intervalo) antes de retornar ao cliente, para tentar capturar recargas que completam rapidamente.

#### 4. Aumentar o limit do order-status
Mudar o `limit=50` para `limit=200` na busca de orders, e implementar paginação se necessário.

### Detalhes técnicos

**Nova edge function `sync-pending-recargas/index.ts`:**
- Autenticação via service_role (sem JWT do usuário)
- Busca recargas pending do banco
- Agrupa por lotes para não sobrecarregar a API
- Atualiza status e dispara notificação Telegram para as concluídas

**Modificações em `recarga-express/index.ts`:**
- No case `recharge`: após salvar como pending, fazer 2-3 tentativas de polling com `await sleep(5000)` antes de retornar
- No case `order-status`: aumentar limit para 200 e implementar busca paginada

**Config em `supabase/config.toml`:**
- Adicionar `[functions.sync-pending-recargas]` com `verify_jwt = false`

