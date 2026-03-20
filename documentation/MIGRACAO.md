# 📋 Checklist de Migração

## 1. Preparação (No ambiente atual)

- [ ] Exportar backup completo (BD + código) via painel admin
- [ ] Sincronizar código com GitHub
- [ ] Anotar todas as secrets configuradas em `system_config`
- [ ] Exportar schema info via `export_schema_info()` RPC
- [ ] Fazer download do ZIP de backup

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
  - `SUPABASE_DB_URL`
  - `LOVABLE_API_KEY`

## 3. Banco de Dados

### 3.1 Tabelas (criar na ordem)
- [ ] Tabelas sem FK: `operadoras`, `system_config`, `bot_settings`, `notifications`, `login_attempts`, `banners`, `polls`, `support_templates`
- [ ] `profiles` (FK para auth.users)
- [ ] Tabelas com FK para profiles: `user_roles`, `saldos`, `recargas`, `transactions`, `referral_commissions`, etc.
- [ ] Tabelas de chat: `chat_conversations`, `chat_members`, `chat_messages`, `chat_message_reads`, `chat_reactions`
- [ ] Tabelas de suporte: `support_tickets`, `support_messages`
- [ ] Demais tabelas

### 3.2 Funções (criar todas)
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
- [ ] Testar acesso por role (admin, revendedor, cliente)

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

- [ ] Deploy das 29 edge functions
- [ ] Verificar `verify_jwt` para webhooks:
  - `telegram-bot` → false
  - `pix-webhook` → false
  - `auth-email-hook` → false
  - `og-store` → false
  - `client-register` → false

## 6. Dados

- [ ] Restaurar backup via `backup-restore`
- [ ] Verificar integridade:
  - Profiles existem para todos os auth.users?
  - Saldos existem para todos os profiles?
  - User_roles existem para todos os profiles?
- [ ] Reconfigurar configs:
  - Gateway de pagamento
  - Webhook do Telegram
  - Chaves VAPID

## 7. Validação

- [ ] Testar login/cadastro
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
