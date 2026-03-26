# 📋 Checklist de Migração

## 1. Preparação (No ambiente atual)

- [ ] Exportar backup completo (BD + Auth + Código) via painel admin
- [ ] Marcar checkbox "Incluir dados de autenticação" no export
- [ ] Marcar checkbox "Incluir schema" para exportar funções e RLS
- [ ] Sincronizar código com GitHub
- [ ] Anotar todas as secrets configuradas em `system_config`
- [ ] Fazer download do ZIP de backup
- [ ] Verificar que `auth/users.json` contém `encrypted_password` para todos os usuários

## 2. Novo Ambiente

- [ ] Criar novo projeto (Lovable ou Supabase)
- [ ] Configurar variáveis de ambiente:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_PROJECT_ID`
- [ ] Configurar secrets nas edge functions:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_DB_URL` ← **Essencial para restauração com senhas**
  - `LOVABLE_API_KEY`

## 3. Banco de Dados

### 3.1 Tabelas (criar na ordem)
- [ ] Tabelas sem FK: `operadoras`, `system_config`, `bot_settings`, `notifications`, `login_attempts`, `banners`, `polls`, `support_templates`
- [ ] `profiles` (FK para auth.users)
- [ ] Tabelas com FK para profiles: `user_roles`, `saldos`, `recargas`, `transactions`, `referral_commissions`, etc.
- [ ] Tabelas de chat: `chat_conversations`, `chat_members`, `chat_messages`, `chat_message_reads`, `chat_reactions`
- [ ] Tabelas de suporte: `support_tickets`, `support_messages`
- [ ] Tabelas Telegram: `telegram_users`, `telegram_sessions`, `terms_acceptance`
- [ ] Demais tabelas

### 3.2 Funções (criar todas — 35 funções)
- [ ] `has_role` (SECURITY DEFINER)
- [ ] `has_verification_badge`
- [ ] `increment_saldo`
- [ ] `claim_transaction`
- [ ] `handle_new_user` (trigger)
- [ ] `generate_unique_slug`
- [ ] `generate_referral_code` (trigger)
- [ ] `update_updated_at_column` (trigger)
- [ ] `get_network_members_v2`
- [ ] `get_network_stats`
- [ ] `get_recargas_ranking`
- [ ] `get_operator_stats`
- [ ] `get_ticker_recargas`
- [ ] `get_public_reseller_pricing`
- [ ] `get_public_store_by_slug`
- [ ] `get_deposit_fee_for_user`
- [ ] `get_unread_counts`
- [ ] `get_follow_counts`
- [ ] `get_poll_vote_counts`
- [ ] `get_scratch_recent_winners`
- [ ] `get_scratch_top_winners`
- [ ] `get_user_recargas_count`
- [ ] `get_user_by_referral_code`
- [ ] `get_maintenance_mode`
- [ ] `get_chat_enabled`
- [ ] `get_seasonal_theme`
- [ ] `get_sales_tools_enabled`
- [ ] `get_require_referral_code`
- [ ] `get_notif_config`
- [ ] `get_chat_new_conv_filter`
- [ ] `export_schema_info`
- [ ] `get_public_tables`
- [ ] `is_conversation_participant`
- [ ] `is_chat_member`
- [ ] `sync_chat_conversation_preview`
- [ ] `cleanup_old_login_attempts`
- [ ] `get_user_verification_badge`
- [ ] `get_user_reseller_id`

### 3.3 RLS Policies
- [ ] Configurar RLS em TODAS as 42 tabelas
- [ ] Testar acesso por role (admin, usuario)

### 3.4 Realtime
- [ ] Habilitar realtime: `chat_conversations`, `chat_messages`, `chat_reactions`

### 3.5 View
- [ ] Criar view `profiles_public`

## 4. Storage

- [ ] Criar buckets:
  - `avatars` (público)
  - `store-logos` (público)
  - `broadcast-images` (público)
  - `chat-audio` (público)
  - `chat-images` (público)
  - `receipts` (público)
  - `email-assets` (público)
  - `login-selfies` (privado)
- [ ] Configurar políticas de storage

## 5. Edge Functions

- [ ] Deploy das 32 edge functions
- [ ] Verificar `verify_jwt` para webhooks:
  - `telegram-bot` → false
  - `pix-webhook` → false
  - `auth-email-hook` → false
  - `og-store` → false
  - `client-register` → false

## 6. Dados

### 6.1 Restauração de Auth Users
- [ ] Verificar que `SUPABASE_DB_URL` está configurado no novo ambiente
- [ ] Restaurar backup via `backup-restore`
- [ ] Verificar log: "Auth users restore: X created, Y skipped, Z failed"
- [ ] Confirmar que UUIDs foram preservados (mesmo ID do ambiente anterior)
- [ ] Testar login de um usuário existente com senha antiga

### 6.2 Restauração de Dados
- [ ] Verificar integridade:
  - Profiles existem para todos os auth.users?
  - Saldos existem para todos os profiles?
  - User_roles existem para todos os profiles?
  - Dados do Telegram preservados? (telegram_id, telegram_username em profiles)
  - telegram_users, telegram_sessions, terms_acceptance restaurados?
- [ ] Reconfigurar configs:
  - Gateway de pagamento ativo
  - Webhook do Telegram
  - Chaves VAPID

## 7. Validação

- [ ] Testar login com senha existente (sem reset)
- [ ] Testar cadastro de novo usuário
- [ ] Testar recuperação de senha
- [ ] Testar depósito PIX (todos os gateways)
- [ ] Testar recarga
- [ ] Testar chat (mensagem, áudio, imagem)
- [ ] Testar broadcasts
- [ ] Testar bot Telegram
- [ ] Testar push notifications
- [ ] Testar backup/restore
- [ ] Testar GitHub sync
- [ ] Testar raspadinha
- [ ] Testar suporte

## 8. Limitações Conhecidas

| Limitação | Impacto | Workaround |
|-----------|---------|------------|
| Storage files não são migrados | Avatars, logos, áudios perdidos | Re-upload manual ou migrar via API |
| `auth.identities` pode falhar se provider diferente | SSO users podem precisar re-autenticar | Verificar manualmente |
| Sem `SUPABASE_DB_URL` | Senhas perdidas, UUIDs novos | Usuários usam "Esqueci senha" |

---

## 9. Migração para Projeto Espelho (Mirror)

Se o destino for um projeto espelho com Lovable Cloud próprio:

### 9.1 Código (Automático)
- [ ] O workflow `sync-mirror.yml` sincroniza automaticamente a cada push
- [ ] `.env` e `config.toml` são removidos antes do push (isolamento de ambiente)
- [ ] O espelho recebe seus próprios secrets do Lovable Cloud automaticamente

### 9.2 Banco de Dados
- [ ] As migrations SQL são sincronizadas via código e aplicadas automaticamente
- [ ] O `types.ts` é regenerado pelo Lovable Cloud do espelho baseado no schema

### 9.3 Configuração Manual no Espelho
- [ ] Habilitar Realtime nas tabelas: `chat_conversations`, `chat_messages`, `chat_reactions`
- [ ] Criar os 8 storage buckets com suas políticas
- [ ] Configurar gateway de pagamento em `system_config`
- [ ] Configurar bot Telegram (token + webhook)
- [ ] Gerar chaves VAPID via `vapid-setup`
- [ ] Criar primeiro usuário admin
- [ ] Definir PIN master

### 9.4 Dados
- [ ] Usar backup-export/restore para migrar dados entre ambientes
- [ ] Ou iniciar com banco limpo (novo ambiente)

> Detalhes completos em [MIRROR_SYNC.md](./MIRROR_SYNC.md)
