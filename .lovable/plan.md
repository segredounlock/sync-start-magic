

## Auditoria Completa do Sistema Recargas Brasil

Fiz uma revisão completa de toda a arquitetura: rotas, autenticação, edge functions, RLS, triggers, banco de dados e fluxo de negócio. Aqui está o diagnóstico:

---

### Arquitetura Geral

O sistema tem 3 roles: **admin**, **revendedor**, **cliente**.

```text
Rotas:
  /               → LandingPage (público)
  /login          → Auth (login/cadastro)
  /principal      → Principal (admin only) — painel master
  /admin          → AdminDashboard (admin + revendedor)
  /painel         → RevendedorPainel (revendedor + admin)
  /loja/:slug     → ClientePortal (público → login → painel cliente)
  /recarga        → RecargaPublica (público)
  /miniapp        → TelegramMiniApp (público)

Edge Functions:
  recarga-express  → proxy da API Poeki (catálogo, recarga, consulta operadora)
  create-pix       → criar cobrança PIX (6 gateways)
  pix-webhook      → webhook de confirmação de pagamento
  telegram-bot     → bot Telegram
  client-register  → registro de cliente via loja
  admin-create-user, admin-delete-user, admin-toggle-role
  telegram-notify, telegram-setup, telegram-miniapp
  send-broadcast, cleanup-stuck-broadcasts
  backup-export, backup-restore
  github-sync
```

---

### Problemas Encontrados

#### 1. RLS: Policies "USING (true)" em recargas e transactions (WARN do linter)
As policies `Service role can manage recargas` e `Service role can manage transactions` usam `USING (true) WITH CHECK (true)` no comando ALL. Isso é **intencional** para o service role (edge functions), mas o linter alerta porque qualquer usuário autenticado poderia potencialmente explorar isso. Na prática, como as edge functions usam service_role_key, o risco real é baixo, mas idealmente essas policies deveriam ter `TO service_role` em vez de `TO authenticated`.

**Correção**: Alterar essas 2 policies para aplicar apenas ao role `service_role` do Postgres.

#### 2. Revendedores NÃO conseguem ver recargas dos clientes via RLS
A tabela `recargas` só tem policies para:
- `Users can view own recargas` (user_id = auth.uid())  
- `Admins can view all recargas`

**Faltando**: Revendedores não conseguem ver recargas dos seus clientes. O `AdminDashboard` usa `fetchAllRows("recargas")` que vai retornar vazio para revendedores (a menos que sejam admin).

**Correção**: Adicionar policy para revendedores verem recargas de seus clientes.

#### 3. Revendedores NÃO conseguem ver transactions dos clientes
Mesmo problema: só admin e own user podem ver. Revendedores ficam sem dados de transações dos clientes.

**Correção**: Adicionar policy para revendedores verem transactions dos seus clientes.

#### 4. Falta gateway de pagamento configurada
O `system_config` não tem `paymentModule` configurado. Isso significa que depósitos PIX vão falhar com "Nenhuma gateway de pagamento configurada".

**Ação necessária**: Configurar via painel Admin → Pagamentos.

#### 5. Auth: Signup público sem role atribuída
Quando alguém se cadastra via `/login`, o trigger `handle_new_user` cria profile + saldos, mas **não atribui nenhuma role**. O `Auth.tsx` redireciona para `/painel` quando `user && !role`, mas o `ProtectedRoute` de `/painel` exige `["revendedor", "admin"]`.

**Resultado**: Usuário novo fica preso — redireciona para `/painel` mas é bloqueado por não ter role. O ProtectedRoute o manda de volta para `/login`, criando loop.

**Correção**: Ou atribuir role padrão no signup, ou criar rota para usuários sem role.

#### 6. `recarga-express` auth usa `getClaims` que pode não existir
O método `supabase.auth.getClaims(token)` não é parte da API padrão do supabase-js. Isso foi a causa do erro 401 anterior. Vejo que já foi corrigido na versão atual, mas vale monitorar.

#### 7. Saldo tipo "pessoal" vs "revenda" pode confundir
Admin e revendedor no painel `/painel` usam `saldo_tipo = "pessoal"`, mas clientes usam "revenda". O `handle_new_user` cria ambos. Está consistente, mas a lógica em `RevendedorPainel.tsx` linha 192 verifica `(role === "admin" || role === "revendedor") && !isClientMode ? "pessoal" : "revenda"` — OK.

#### 8. Realtime habilitado para as tabelas certas
`transactions`, `recargas`, `broadcast_progress` estão no realtime. O `RevendedorPainel` escuta mudanças em `recargas` para notificar conclusão — OK.

#### 9. CORS headers inconsistentes
Algumas edge functions usam headers CORS curtos (`authorization, x-client-info, apikey, content-type`) e outras usam a versão completa com `x-supabase-client-platform-*`. As que usam headers curtos podem falhar em navegadores novos.

**Afetadas**: `telegram-bot`, `admin-toggle-role`, `client-register`

**Correção**: Padronizar CORS headers em todas as edge functions.

---

### Resumo de Ações Necessárias

| # | Problema | Severidade | Correção |
|---|----------|-----------|----------|
| 1 | RLS permissiva em recargas/transactions | Media | Restringir policies ao service_role |
| 2 | Revendedor sem acesso a recargas dos clientes | Alta | Adicionar RLS policy |
| 3 | Revendedor sem acesso a transactions dos clientes | Alta | Adicionar RLS policy |
| 4 | Gateway de pagamento não configurada | Media | Configurar no painel |
| 5 | Loop de redirect para usuários sem role | Alta | Tratar no Auth.tsx/ProtectedRoute |
| 6 | CORS inconsistentes nas edge functions | Baixa | Padronizar headers |

### O que está funcionando bem
- Trigger `handle_new_user` criando profile + saldos automaticamente
- Sistema de precificação (global + revendedor) com 3 camadas
- Consulta automática de operadora integrada
- Bot Telegram com cache de token
- PIX webhook com suporte a 6 gateways
- Registro de cliente via loja do revendedor
- Backup/restore funcional
- Broadcast via Telegram

Deseja que eu implemente as correções listadas acima?

