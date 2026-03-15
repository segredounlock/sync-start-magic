

## Auditoria da Conta + Correção do Fluxo de Depósitos

### Diagnóstico da Conta (Thiago - thiago13otvp@gmail.com)

**Situação**: O depósito de R$ 20,00 (payment_id: `019ceec3...`) foi criado as 20:51 BRT e o webhook do PixGo so confirmou as 21:28 BRT -- **37 minutos de atraso**. Nesse intervalo, o saldo nao foi creditado. Agora o deposito ja consta como `completed` e o saldo atual e R$ 20,40.

**Causa raiz**: O sistema depende 100% do webhook do PixGo para confirmar depositos. Se o PixGo atrasa ou falha em chamar o webhook, o deposito fica pendente indefinidamente (ate expirar em 30 min).

### Bugs Encontrados

1. **Sem polling ativo no servidor** -- O polling do frontend so le o banco local. Nao existe nenhuma Edge Function que consulte a API do PixGo ativamente para verificar se depositos pendentes ja foram pagos.

2. **RLS bloqueia margem para nao-admins** -- A tabela `system_config` so permite leitura por admins (exceto chaves `room_images_*`). Revendedores comuns que acessam o site **nao conseguem ler** `defaultMarginEnabled/Type/Value`, fazendo a margem global nao funcionar no frontend para eles.

### Plano de Implementacao

#### 1. Nova Edge Function: `check-pending-pix`
Funcao que consulta a API do PixGo para verificar o status de depositos pendentes e credita o saldo automaticamente quando pagos.

- Busca transacoes `status=pending, type=deposit` com menos de 30 minutos
- Para cada uma com gateway `pixgo`, consulta `https://pixgo.org/api/v1/payment/{payment_id}`
- Se `completed`, executa a mesma logica do `pix-webhook`: atualiza status, credita saldo, envia notificacoes
- Cron job a cada 2 minutos

#### 2. Corrigir RLS do `system_config`
Adicionar uma policy SELECT que permita usuarios autenticados lerem as chaves de margem padrao:

```sql
CREATE POLICY "Authenticated can view margin config"
ON public.system_config FOR SELECT
TO authenticated
USING (key IN ('defaultMarginEnabled', 'defaultMarginType', 'defaultMarginValue'));
```

#### 3. Ajustar expiracão para nao conflitar
Aumentar o timeout do `expire-pending-deposits` de 30 para 45 minutos, garantindo que a funcao de polling tenha tempo de verificar antes da expiracao.

### Arquivos Modificados
- `supabase/functions/check-pending-pix/index.ts` (novo)
- `supabase/functions/expire-pending-deposits/index.ts` (ajuste timeout)
- Migracao SQL (nova policy RLS)
- Cron job SQL (INSERT via insert tool)

