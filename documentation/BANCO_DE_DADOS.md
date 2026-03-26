# 🗄️ Banco de Dados — 42 Tabelas + 1 View

> **Última atualização:** 2026-03-26 | **Versão:** v2.2

## Tabelas Core

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `profiles` | Perfis de usuários | id, nome, email, telefone, avatar_url, slug, store_name, reseller_id, active, verification_badge, bio, referral_code, telegram_id, telegram_username, whatsapp_number, store_logo_url, store_primary_color, store_secondary_color, last_seen_at |
| `user_roles` | Roles dos usuários | user_id, role (admin/usuario) |
| `saldos` | Saldos financeiros | user_id, tipo (revenda/pessoal), valor |

## Tabelas de Negócio

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `operadoras` | Operadoras de telefonia | nome, valores (jsonb), ativo |
| `recargas` | Histórico de recargas | user_id, telefone, operadora, valor, custo, custo_api, status, external_id, completed_at |
| `transactions` | Transações financeiras | user_id, amount, type, status, payment_id, metadata, module, delay_notified, telegram_notified |
| `pricing_rules` | Precificação global | operadora_id, valor_recarga, custo, tipo_regra, regra_valor |
| `reseller_pricing_rules` | Precificação por revendedor | user_id, operadora_id, valor_recarga, custo, set_by_admin |
| `reseller_base_pricing_rules` | Preço base do revendedor | user_id, operadora_id, valor_recarga, custo |
| `reseller_config` | Config individual do revendedor | user_id, key, value |
| `reseller_deposit_fees` | Taxa de depósito por revendedor | reseller_id, fee_type, fee_value |
| `client_pricing_rules` | Preço por cliente específico | reseller_id, client_id, operadora_id, valor_recarga, lucro |
| `disabled_recharge_values` | Valores desabilitados | operadora_id, valor, disabled_by |
| `referral_commissions` | Comissões de indicação | user_id, referred_user_id, amount, type (direct/indirect), recarga_id |
| `scratch_cards` | Raspadinhas | user_id, card_date, is_scratched, is_won, prize_amount |

## Tabelas de Configuração

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `system_config` | Config global (key/value) | key, value |
| `bot_settings` | Config do bot Telegram | key, value |

## Tabelas de Comunicação

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `notifications` | Broadcasts enviados | title, message, image_url, buttons, sent_count, failed_count, message_effect_id |
| `broadcast_messages` | Mensagens individuais de broadcast | notification_id, telegram_id, message_id |
| `broadcast_progress` | Progresso de envio | notification_id, status, sent_count, failed_count, total_users, speed_per_second, estimated_completion |
| `admin_notifications` | Notificações internas admin | user_id, message, type, amount, is_read, user_nome, user_email, status |
| `banners` | Banners promocionais | title, subtitle, link, icon_url, type, enabled, position |
| `polls` | Enquetes | question, options (jsonb), active, created_by, expires_at, allow_multiple |
| `poll_votes` | Votos nas enquetes | poll_id, user_id, option_index |

## Tabelas de Chat

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `chat_conversations` | Conversas | type (direct/group), participant_1, participant_2, name, is_blocked, is_private, category, icon, description, last_message_text, last_message_at |
| `chat_members` | Membros de grupo | conversation_id, user_id |
| `chat_messages` | Mensagens | conversation_id, sender_id, content, type, image_url, audio_url, reply_to_id, is_pinned, is_deleted, is_delivered, is_read, pinned_by, deleted_by, edited_by |
| `chat_message_reads` | Leituras de mensagem | message_id, user_id, read_at |
| `chat_reactions` | Reações emoji | message_id, user_id, emoji |

## Tabelas Telegram

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `telegram_users` | Usuários do bot | telegram_id, first_name, username, is_blocked, is_registered, block_reason |
| `telegram_sessions` | Sessões do bot | chat_id (PK), step, data (jsonb) |
| `terms_acceptance` | Aceite de termos | telegram_id, accepted_at |

## Tabelas de Segurança

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `login_attempts` | Tentativas de login | email, ip_address, success |
| `login_fingerprints` | Fingerprints de dispositivo | user_id, fingerprint_hash, user_agent, ip_address, latitude, longitude, selfie_url, canvas_hash, webgl_renderer, platform, screen_resolution, timezone, language, device_memory, hardware_concurrency, touch_support, color_depth, pixel_ratio, installed_plugins, raw_data |
| `banned_devices` | Dispositivos banidos | fingerprint_hash, ip_address, reason, original_user_id, active, user_agent_pattern, original_user_email, original_user_nome, banned_by |
| `audit_logs` | Logs de auditoria | admin_id, action, target_type, target_id, details |

## Tabelas de Suporte

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `support_tickets` | Tickets de suporte | user_id, subject, message, department, priority, status, assigned_to, telegram_chat_id, telegram_username, telegram_first_name, admin_reply, image_url |
| `support_messages` | Mensagens de suporte | ticket_id, sender_id, message, sender_role, image_url, origin, is_read |
| `support_templates` | Templates de resposta | title, content, category, shortcut, variables, usage_count |

## Tabelas de Sistema

| Tabela | Descrição | Colunas principais |
|--------|-----------|-------------------|
| `push_subscriptions` | Inscrições push web | user_id, endpoint, p256dh, auth |
| `update_history` | Histórico de atualizações | version, results, tables_restored, total_records, backup_by, backup_date, tables_skipped, tables_failed, applied_by, previous_version |
| `follows` | Seguidores | follower_id, following_id |

## Views

| View | Descrição |
|------|-----------|
| `profiles_public` | Dados públicos dos perfis (id, nome, avatar_url, slug, bio, verification_badge, store_name, store_logo_url, store_primary_color, store_secondary_color, active, last_seen_at, created_at) |

---

## Funções do Banco (RPC) — 36 funções

| Função | Descrição | Segurança |
|--------|-----------|-----------|
| `has_role(_user_id, _role)` | Verifica se usuário tem role | SECURITY DEFINER |
| `has_verification_badge(_user_id)` | Verifica badge de verificação | SECURITY DEFINER |
| `increment_saldo(p_user_id, p_tipo, p_amount)` | Incrementa/decrementa saldo | SECURITY DEFINER |
| `claim_transaction(p_tx_id, p_from_status, p_to_status)` | Transição atômica de status | SECURITY DEFINER |
| `get_network_members(_user_id, _filter)` | Membros da rede (v1) | SECURITY DEFINER |
| `get_network_members_v2(_user_id, _filter)` | Membros da rede com stats completos | SECURITY DEFINER |
| `get_network_stats(_user_id)` | Estatísticas da rede (direto/indireto) | SECURITY DEFINER |
| `get_recargas_ranking(_limit)` | Ranking de recargas | SECURITY DEFINER |
| `get_operator_stats()` | Estatísticas por operadora (24h) | SECURITY DEFINER |
| `get_ticker_recargas()` | Últimas 200 recargas para ticker | SECURITY DEFINER |
| `get_public_reseller_pricing(_slug)` | Preços públicos por slug (5 níveis) | SECURITY DEFINER |
| `get_public_store_by_slug(_slug)` | Dados da loja por slug | SECURITY DEFINER |
| `get_deposit_fee_for_user(_user_id)` | Taxa de depósito do usuário | SECURITY DEFINER |
| `get_unread_counts(_user_id, _conversation_ids)` | Contagem de não lidas | SECURITY DEFINER |
| `get_follow_counts(_user_id)` | Contagem de seguidores | SECURITY DEFINER |
| `get_poll_vote_counts(_poll_id)` | Contagem de votos | SECURITY DEFINER |
| `get_scratch_recent_winners()` | Últimos ganhadores raspadinha | SECURITY DEFINER |
| `get_scratch_top_winners()` | Top ganhadores raspadinha | SECURITY DEFINER |
| `get_user_recargas_count(_user_id)` | Total de recargas do user | SECURITY DEFINER |
| `get_user_by_referral_code(_code)` | Busca user por código | SECURITY DEFINER |
| `get_user_verification_badge(_user_id)` | Badge do usuário | SECURITY DEFINER |
| `get_user_reseller_id(_user_id)` | Reseller ID do usuário | SECURITY DEFINER |
| `get_maintenance_mode()` | Verifica modo manutenção | SECURITY DEFINER |
| `get_chat_enabled()` | Verifica se chat está ativo | SECURITY DEFINER |
| `get_chat_new_conv_filter()` | Filtro de nova conversa | SECURITY DEFINER |
| `get_seasonal_theme()` | Tema sazonal atual | SECURITY DEFINER |
| `get_sales_tools_enabled()` | Ferramentas de venda ativas | SECURITY DEFINER |
| `get_require_referral_code()` | Obrigar código de indicação | SECURITY DEFINER |
| `get_notif_config(_key)` | Config de notificação | SECURITY DEFINER |
| `export_schema_info()` | Exporta schema completo (admin only) | SECURITY DEFINER |
| `get_public_tables()` | Lista tabelas públicas | SECURITY DEFINER |
| `is_conversation_participant(...)` | Verifica participante | SECURITY DEFINER |
| `is_chat_member(...)` | Verifica membro do chat | SECURITY DEFINER |
| `sync_chat_conversation_preview(...)` | Atualiza preview da conversa | SECURITY DEFINER |
| `cleanup_old_login_attempts()` | Limpa tentativas antigas (>30d) | SECURITY DEFINER |
| `generate_unique_slug(p_nome, p_user_id)` | Gera slug único | SECURITY DEFINER |

## Triggers

| Trigger | Tabela | Descrição |
|---------|--------|-----------|
| `handle_new_user` | `auth.users` (AFTER INSERT) | Cria profile + saldos + role automaticamente |
| `generate_referral_code` | `profiles` (BEFORE INSERT) | Gera código de indicação 6 dígitos |
| `update_updated_at_column` | Várias tabelas | Atualiza updated_at automaticamente |

## Realtime

Tabelas com Realtime habilitado:
- `chat_conversations`
- `chat_messages`
- `chat_reactions`

## Storage Buckets (8)

| Bucket | Público | Uso |
|--------|---------|-----|
| `avatars` | ✅ | Fotos de perfil |
| `store-logos` | ✅ | Logos das lojas |
| `broadcast-images` | ✅ | Imagens de broadcasts |
| `chat-audio` | ✅ | Áudios do chat |
| `chat-images` | ✅ | Imagens do chat |
| `receipts` | ✅ | Comprovantes |
| `email-assets` | ✅ | Assets de email |
| `login-selfies` | ❌ | Selfies de login (privado) |

---

## SQL Completo para Criação Manual

> **Uso:** Este SQL pode ser executado no Lovable Cloud → Run SQL para criar o schema completo do zero (ex: projeto espelho com banco vazio).
> **Ordem:** As tabelas são criadas na ordem correta de dependência.

### 1. Extensões

```sql
CREATE EXTENSION IF NOT EXISTS unaccent;
```

### 2. Tabelas sem dependências

```sql
-- operadoras
CREATE TABLE IF NOT EXISTS public.operadoras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  valores jsonb NOT NULL DEFAULT '[]'::jsonb,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.operadoras ENABLE ROW LEVEL SECURITY;

-- system_config
CREATE TABLE IF NOT EXISTS public.system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- bot_settings
CREATE TABLE IF NOT EXISTS public.bot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  image_url text,
  buttons jsonb DEFAULT '[]'::jsonb,
  message_effect_id text,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- login_attempts
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address text,
  success boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- banners
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '',
  icon_url text,
  type text NOT NULL DEFAULT 'banner',
  enabled boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- polls
CREATE TABLE IF NOT EXISTS public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  active boolean NOT NULL DEFAULT false,
  allow_multiple boolean NOT NULL DEFAULT false,
  total_votes integer NOT NULL DEFAULT 0,
  created_by uuid NOT NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

-- support_templates
CREATE TABLE IF NOT EXISTS public.support_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  shortcut text,
  variables jsonb DEFAULT '[]'::jsonb,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_templates ENABLE ROW LEVEL SECURITY;

-- telegram_users
CREATE TABLE IF NOT EXISTS public.telegram_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint NOT NULL,
  first_name text,
  username text,
  is_blocked boolean NOT NULL DEFAULT false,
  is_registered boolean NOT NULL DEFAULT false,
  block_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

-- telegram_sessions
CREATE TABLE IF NOT EXISTS public.telegram_sessions (
  chat_id text PRIMARY KEY,
  step text NOT NULL DEFAULT 'idle',
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

-- terms_acceptance
CREATE TABLE IF NOT EXISTS public.terms_acceptance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text NOT NULL,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;

-- banned_devices
CREATE TABLE IF NOT EXISTS public.banned_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_hash text,
  ip_address text,
  user_agent_pattern text,
  reason text NOT NULL DEFAULT 'Golpe/Fraude',
  original_user_id uuid,
  original_user_email text,
  original_user_nome text,
  banned_by uuid NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.banned_devices ENABLE ROW LEVEL SECURITY;

-- update_history
CREATE TABLE IF NOT EXISTS public.update_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  tables_restored integer NOT NULL DEFAULT 0,
  tables_skipped integer NOT NULL DEFAULT 0,
  tables_failed integer NOT NULL DEFAULT 0,
  total_records integer NOT NULL DEFAULT 0,
  applied_by uuid,
  applied_at timestamptz NOT NULL DEFAULT now(),
  previous_version text,
  backup_date text,
  backup_by text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.update_history ENABLE ROW LEVEL SECURITY;

-- push_subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- admin_notifications
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_nome text,
  user_email text,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
```

### 3. Tabela profiles (depende de auth.users)

```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  email text,
  nome text,
  telefone text,
  avatar_url text,
  slug text NOT NULL,
  store_name text,
  store_logo_url text,
  store_primary_color text,
  store_secondary_color text,
  reseller_id uuid REFERENCES public.profiles(id),
  active boolean NOT NULL DEFAULT true,
  verification_badge text,
  bio text,
  referral_code text,
  telegram_id bigint,
  telegram_username text,
  whatsapp_number text,
  last_seen_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### 4. Tabelas que dependem de profiles

```sql
-- user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- saldos
CREATE TABLE IF NOT EXISTS public.saldos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL DEFAULT 'revenda',
  valor numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, tipo)
);
ALTER TABLE public.saldos ENABLE ROW LEVEL SECURITY;

-- recargas
CREATE TABLE IF NOT EXISTS public.recargas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  telefone text NOT NULL,
  operadora text,
  valor numeric NOT NULL DEFAULT 0,
  custo numeric NOT NULL DEFAULT 0,
  custo_api numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  external_id text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recargas ENABLE ROW LEVEL SECURITY;

-- transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'deposit',
  status text NOT NULL DEFAULT 'pending',
  payment_id text,
  metadata jsonb,
  module text,
  delay_notified boolean DEFAULT false,
  telegram_notified boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- pricing_rules
CREATE TABLE IF NOT EXISTS public.pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operadora_id uuid NOT NULL REFERENCES public.operadoras(id),
  valor_recarga numeric NOT NULL,
  custo numeric NOT NULL DEFAULT 0,
  tipo_regra text NOT NULL DEFAULT 'fixo',
  regra_valor numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

-- reseller_pricing_rules
CREATE TABLE IF NOT EXISTS public.reseller_pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  operadora_id uuid NOT NULL REFERENCES public.operadoras(id),
  valor_recarga numeric NOT NULL,
  custo numeric NOT NULL DEFAULT 0,
  tipo_regra text NOT NULL DEFAULT 'fixo',
  regra_valor numeric NOT NULL DEFAULT 0,
  set_by_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reseller_pricing_rules ENABLE ROW LEVEL SECURITY;

-- reseller_base_pricing_rules
CREATE TABLE IF NOT EXISTS public.reseller_base_pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  operadora_id uuid NOT NULL REFERENCES public.operadoras(id),
  valor_recarga numeric NOT NULL,
  custo numeric NOT NULL DEFAULT 0,
  tipo_regra text NOT NULL DEFAULT 'fixo',
  regra_valor numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reseller_base_pricing_rules ENABLE ROW LEVEL SECURITY;

-- reseller_config
CREATE TABLE IF NOT EXISTS public.reseller_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key text NOT NULL,
  value text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reseller_config ENABLE ROW LEVEL SECURITY;

-- reseller_deposit_fees
CREATE TABLE IF NOT EXISTS public.reseller_deposit_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL REFERENCES public.profiles(id),
  fee_type text NOT NULL DEFAULT 'fixo',
  fee_value numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reseller_id)
);
ALTER TABLE public.reseller_deposit_fees ENABLE ROW LEVEL SECURITY;

-- client_pricing_rules
CREATE TABLE IF NOT EXISTS public.client_pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reseller_id uuid NOT NULL,
  client_id uuid NOT NULL,
  operadora_id uuid NOT NULL REFERENCES public.operadoras(id),
  valor_recarga numeric NOT NULL,
  lucro numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.client_pricing_rules ENABLE ROW LEVEL SECURITY;

-- disabled_recharge_values
CREATE TABLE IF NOT EXISTS public.disabled_recharge_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operadora_id uuid NOT NULL REFERENCES public.operadoras(id),
  valor numeric NOT NULL,
  disabled_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.disabled_recharge_values ENABLE ROW LEVEL SECURITY;

-- referral_commissions
CREATE TABLE IF NOT EXISTS public.referral_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  recarga_id uuid REFERENCES public.recargas(id),
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'direct',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_commissions ENABLE ROW LEVEL SECURITY;

-- scratch_cards
CREATE TABLE IF NOT EXISTS public.scratch_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  card_date date NOT NULL DEFAULT CURRENT_DATE,
  is_scratched boolean NOT NULL DEFAULT false,
  is_won boolean NOT NULL DEFAULT false,
  prize_amount numeric NOT NULL DEFAULT 0,
  scratched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.scratch_cards ENABLE ROW LEVEL SECURITY;

-- follows
CREATE TABLE IF NOT EXISTS public.follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id)
);
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- poll_votes
CREATE TABLE IF NOT EXISTS public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id),
  user_id uuid NOT NULL,
  option_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id, option_index)
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- broadcast_messages
CREATE TABLE IF NOT EXISTS public.broadcast_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id),
  telegram_id bigint NOT NULL,
  message_id bigint NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;

-- broadcast_progress
CREATE TABLE IF NOT EXISTS public.broadcast_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL REFERENCES public.notifications(id),
  status text NOT NULL DEFAULT 'pending',
  total_users integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  blocked_count integer NOT NULL DEFAULT 0,
  current_batch integer NOT NULL DEFAULT 0,
  total_batches integer NOT NULL DEFAULT 0,
  speed_per_second numeric NOT NULL DEFAULT 0,
  estimated_completion timestamptz,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.broadcast_progress ENABLE ROW LEVEL SECURITY;

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- login_fingerprints
CREATE TABLE IF NOT EXISTS public.login_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fingerprint_hash text NOT NULL,
  user_agent text,
  ip_address text,
  latitude numeric,
  longitude numeric,
  geolocation_accuracy numeric,
  selfie_url text,
  canvas_hash text,
  webgl_renderer text,
  platform text,
  screen_resolution text,
  timezone text,
  language text,
  device_memory numeric,
  hardware_concurrency numeric,
  touch_support boolean,
  color_depth numeric,
  pixel_ratio numeric,
  installed_plugins text,
  raw_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.login_fingerprints ENABLE ROW LEVEL SECURITY;

-- support_tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id),
  telegram_chat_id text NOT NULL,
  telegram_username text,
  telegram_first_name text,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  department text NOT NULL DEFAULT 'support',
  admin_reply text,
  image_url text,
  assigned_to uuid,
  replied_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- support_messages
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id),
  sender_id uuid NOT NULL,
  message text NOT NULL,
  sender_role text NOT NULL DEFAULT 'client',
  image_url text,
  origin text NOT NULL DEFAULT 'web',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
```

### 5. Tabelas de Chat

```sql
-- chat_conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'direct',
  participant_1 uuid NOT NULL,
  participant_2 uuid,
  name text,
  category text DEFAULT '',
  description text DEFAULT '',
  icon text DEFAULT '💬',
  is_blocked boolean DEFAULT false,
  is_private boolean DEFAULT false,
  last_message_text text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- chat_members
CREATE TABLE IF NOT EXISTS public.chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id),
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;

-- chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id),
  sender_id uuid NOT NULL,
  content text,
  type text NOT NULL DEFAULT 'text',
  image_url text,
  audio_url text,
  reply_to_id uuid REFERENCES public.chat_messages(id),
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  is_delivered boolean NOT NULL DEFAULT false,
  delivered_at timestamptz,
  is_pinned boolean NOT NULL DEFAULT false,
  pinned_at timestamptz,
  pinned_by uuid,
  is_deleted boolean NOT NULL DEFAULT false,
  deleted_by uuid,
  edited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- chat_message_reads
CREATE TABLE IF NOT EXISTS public.chat_message_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id),
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);
ALTER TABLE public.chat_message_reads ENABLE ROW LEVEL SECURITY;

-- chat_reactions
CREATE TABLE IF NOT EXISTS public.chat_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.chat_messages(id),
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;
```

### 6. View profiles_public

```sql
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
  id, nome, avatar_url, slug, bio, verification_badge,
  store_name, store_logo_url, store_primary_color, store_secondary_color,
  active, last_seen_at, created_at
FROM public.profiles;
```

### 7. Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;
```

### 8. Funções RPC (todas SECURITY DEFINER)

> **Nota:** O código completo de cada função está disponível na seção `<db-functions>` do contexto do sistema ou via `export_schema_info()` (admin only). Abaixo estão as funções essenciais para o funcionamento:

```sql
-- generate_unique_slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(p_nome text, p_user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  base_slug text;
  candidate text;
  counter int := 0;
BEGIN
  base_slug := lower(unaccent(coalesce(p_nome, 'user')));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
  IF base_slug = '' THEN base_slug := 'user'; END IF;
  base_slug := left(base_slug, 30);
  candidate := base_slug;
  LOOP
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE slug = candidate AND id != p_user_id) THEN
      RETURN candidate;
    END IF;
    counter := counter + 1;
    candidate := base_slug || '-' || counter;
  END LOOP;
END;
$$;

-- has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- has_verification_badge
CREATE OR REPLACE FUNCTION public.has_verification_badge(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND verification_badge IS NOT NULL AND verification_badge != '')
$$;

-- increment_saldo
CREATE OR REPLACE FUNCTION public.increment_saldo(p_user_id uuid, p_tipo text, p_amount numeric)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE new_val numeric;
BEGIN
  UPDATE public.saldos SET valor = valor + p_amount, updated_at = now()
  WHERE user_id = p_user_id AND tipo = p_tipo RETURNING valor INTO new_val;
  IF new_val IS NULL THEN
    INSERT INTO public.saldos (user_id, tipo, valor) VALUES (p_user_id, p_tipo, p_amount) ON CONFLICT DO NOTHING;
    new_val := p_amount;
  END IF;
  RETURN COALESCE(new_val, 0);
END;
$$;

-- claim_transaction
CREATE OR REPLACE FUNCTION public.claim_transaction(p_tx_id uuid, p_from_status text, p_to_status text, p_metadata jsonb DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE rows_affected integer;
BEGIN
  IF p_metadata IS NOT NULL THEN
    UPDATE public.transactions SET status = p_to_status, updated_at = now(), metadata = p_metadata WHERE id = p_tx_id AND status = p_from_status;
  ELSE
    UPDATE public.transactions SET status = p_to_status, updated_at = now() WHERE id = p_tx_id AND status = p_from_status;
  END IF;
  GET DIAGNOSTICS rows_affected = ROW_COUNT;
  RETURN rows_affected > 0;
END;
$$;

-- is_conversation_participant
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = _conversation_id AND (
      (c.type = 'direct' AND (c.participant_1 = _user_id OR c.participant_2 = _user_id))
      OR (c.type = 'group' AND EXISTS (SELECT 1 FROM public.chat_members cm WHERE cm.conversation_id = c.id AND cm.user_id = _user_id))
    )
  )
$$;

-- is_chat_member
CREATE OR REPLACE FUNCTION public.is_chat_member(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.chat_members WHERE conversation_id = _conversation_id AND user_id = _user_id)
$$;

-- generate_referral_code (trigger function)
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- update_updated_at_column (trigger function)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- handle_new_user (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _reseller_id uuid;
  _nome text;
  _slug text;
BEGIN
  _reseller_id := (NEW.raw_user_meta_data->>'reseller_id')::uuid;
  _nome := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  _slug := public.generate_unique_slug(_nome, NEW.id);
  INSERT INTO public.profiles (id, email, nome, reseller_id, slug) VALUES (NEW.id, NEW.email, _nome, _reseller_id, _slug);
  INSERT INTO public.saldos (user_id, tipo, valor) VALUES (NEW.id, 'revenda', 0);
  INSERT INTO public.saldos (user_id, tipo, valor) VALUES (NEW.id, 'pessoal', 0);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');
  RETURN NEW;
END;
$$;

-- get_maintenance_mode
CREATE OR REPLACE FUNCTION public.get_maintenance_mode()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE(value = 'true', false) FROM public.system_config WHERE key = 'maintenanceMode' LIMIT 1;
$$;

-- get_chat_enabled
CREATE OR REPLACE FUNCTION public.get_chat_enabled()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE(value = 'true', false) FROM public.system_config WHERE key = 'chat_enabled' LIMIT 1;
$$;

-- get_seasonal_theme
CREATE OR REPLACE FUNCTION public.get_seasonal_theme()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT value FROM public.system_config WHERE key = 'seasonalTheme' LIMIT 1;
$$;

-- get_sales_tools_enabled
CREATE OR REPLACE FUNCTION public.get_sales_tools_enabled()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE(value = 'true', true) FROM public.system_config WHERE key = 'salesToolsEnabled' LIMIT 1;
$$;

-- get_require_referral_code
CREATE OR REPLACE FUNCTION public.get_require_referral_code()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE(value = 'true', true) FROM public.system_config WHERE key = 'requireReferralCode' LIMIT 1;
$$;

-- get_chat_new_conv_filter
CREATE OR REPLACE FUNCTION public.get_chat_new_conv_filter()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE(value, 'admin_badge') FROM public.system_config WHERE key = 'chat_new_conv_filter' LIMIT 1;
$$;

-- get_notif_config
CREATE OR REPLACE FUNCTION public.get_notif_config(_key text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT value FROM public.system_config WHERE key = _key LIMIT 1;
$$;

-- get_user_by_referral_code
CREATE OR REPLACE FUNCTION public.get_user_by_referral_code(_code text)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT id FROM public.profiles WHERE referral_code = _code LIMIT 1;
$$;

-- get_user_verification_badge
CREATE OR REPLACE FUNCTION public.get_user_verification_badge(_user_id uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT verification_badge FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

-- get_user_reseller_id
CREATE OR REPLACE FUNCTION public.get_user_reseller_id(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT reseller_id FROM public.profiles WHERE id = _user_id LIMIT 1;
$$;

-- get_user_recargas_count
CREATE OR REPLACE FUNCTION public.get_user_recargas_count(_user_id uuid)
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COUNT(*)::bigint FROM public.recargas WHERE user_id = _user_id AND status = 'completed';
$$;

-- get_follow_counts
CREATE OR REPLACE FUNCTION public.get_follow_counts(_user_id uuid)
RETURNS TABLE(followers_count bigint, following_count bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT
    (SELECT COUNT(*) FROM public.follows WHERE following_id = _user_id) as followers_count,
    (SELECT COUNT(*) FROM public.follows WHERE follower_id = _user_id) as following_count;
$$;

-- get_poll_vote_counts
CREATE OR REPLACE FUNCTION public.get_poll_vote_counts(_poll_id uuid)
RETURNS TABLE(option_index integer, vote_count bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT pv.option_index, COUNT(*)::bigint as vote_count FROM public.poll_votes pv WHERE pv.poll_id = _poll_id GROUP BY pv.option_index;
$$;

-- get_unread_counts
CREATE OR REPLACE FUNCTION public.get_unread_counts(_user_id uuid, _conversation_ids uuid[])
RETURNS TABLE(conversation_id uuid, unread_count bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT m.conversation_id, COUNT(*)::bigint as unread_count
  FROM public.chat_messages m
  WHERE m.conversation_id = ANY(_conversation_ids) AND m.sender_id != _user_id
    AND NOT EXISTS (SELECT 1 FROM public.chat_message_reads r WHERE r.message_id = m.id AND r.user_id = _user_id)
    AND m.is_deleted = false
  GROUP BY m.conversation_id;
$$;

-- get_deposit_fee_for_user
CREATE OR REPLACE FUNCTION public.get_deposit_fee_for_user(_user_id uuid)
RETURNS TABLE(fee_type text, fee_value numeric) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _reseller_id UUID;
BEGIN
  SELECT p.reseller_id INTO _reseller_id FROM public.profiles p WHERE p.id = _user_id;
  IF _reseller_id IS NOT NULL THEN
    RETURN QUERY SELECT rdf.fee_type, rdf.fee_value FROM public.reseller_deposit_fees rdf WHERE rdf.reseller_id = _reseller_id AND rdf.fee_value > 0;
    IF FOUND THEN RETURN; END IF;
  END IF;
  RETURN QUERY SELECT
    COALESCE((SELECT sc.value FROM public.system_config sc WHERE sc.key = 'taxaTipo'), 'fixo') AS fee_type,
    COALESCE(CAST(REPLACE((SELECT sc.value FROM public.system_config sc WHERE sc.key = 'taxaValor'), ',', '.') AS NUMERIC), 0) AS fee_value;
END;
$$;

-- get_public_store_by_slug
CREATE OR REPLACE FUNCTION public.get_public_store_by_slug(_slug text)
RETURNS TABLE(id uuid, nome text, store_name text, store_logo_url text, store_primary_color text, store_secondary_color text, active boolean, avatar_url text, verification_badge text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT p.id, p.nome, p.store_name, p.store_logo_url, p.store_primary_color, p.store_secondary_color, p.active, p.avatar_url, p.verification_badge
  FROM public.profiles p WHERE p.slug = _slug LIMIT 1;
$$;

-- get_recargas_ranking
CREATE OR REPLACE FUNCTION public.get_recargas_ranking(_limit integer DEFAULT 20)
RETURNS TABLE(user_id uuid, nome text, avatar_url text, verification_badge text, total_recargas bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT r.user_id, COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usuário') AS nome,
    p.avatar_url, p.verification_badge, COUNT(*)::bigint AS total_recargas
  FROM public.recargas r JOIN public.profiles p ON p.id = r.user_id WHERE r.status = 'completed'
  GROUP BY r.user_id, p.nome, p.email, p.avatar_url, p.verification_badge ORDER BY total_recargas DESC LIMIT _limit;
$$;

-- get_ticker_recargas
CREATE OR REPLACE FUNCTION public.get_ticker_recargas()
RETURNS TABLE(id uuid, telefone text, operadora text, valor numeric, status text, created_at timestamptz, user_id uuid)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT r.id, r.telefone, r.operadora, r.valor, r.status, r.created_at, r.user_id FROM public.recargas r ORDER BY r.created_at DESC LIMIT 200;
$$;

-- get_scratch_recent_winners
CREATE OR REPLACE FUNCTION public.get_scratch_recent_winners()
RETURNS TABLE(nome text, avatar_url text, verification_badge text, prize_amount numeric, card_date text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usuário') AS nome,
    p.avatar_url, p.verification_badge, sc.prize_amount, sc.card_date::text
  FROM public.scratch_cards sc JOIN public.profiles p ON p.id = sc.user_id
  WHERE sc.is_won = true AND sc.is_scratched = true ORDER BY sc.scratched_at DESC NULLS LAST LIMIT 5;
$$;

-- get_scratch_top_winners
CREATE OR REPLACE FUNCTION public.get_scratch_top_winners()
RETURNS TABLE(nome text, avatar_url text, verification_badge text, prize_amount numeric, card_date text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usuário') AS nome,
    p.avatar_url, p.verification_badge, sc.prize_amount, sc.card_date::text
  FROM public.scratch_cards sc JOIN public.profiles p ON p.id = sc.user_id
  WHERE sc.is_won = true AND sc.is_scratched = true ORDER BY sc.prize_amount DESC LIMIT 5;
$$;

-- get_public_tables
CREATE OR REPLACE FUNCTION public.get_public_tables()
RETURNS TABLE(table_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT t.table_name::text FROM information_schema.tables t WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE' ORDER BY t.table_name;
$$;

-- cleanup_old_login_attempts
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  DELETE FROM public.login_attempts WHERE created_at < now() - interval '30 days';
$$;

-- sync_chat_conversation_preview
CREATE OR REPLACE FUNCTION public.sync_chat_conversation_preview(_conversation_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_msg RECORD; v_sender_name TEXT; v_preview TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.chat_conversations c WHERE c.id = _conversation_id AND (
    ((c.type = 'direct') AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
    OR c.type = 'group' OR public.has_role(auth.uid(), 'admin')
  )) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT m.id, m.sender_id, m.content, m.type, m.created_at INTO v_msg
  FROM public.chat_messages m WHERE m.conversation_id = _conversation_id AND m.is_deleted = false ORDER BY m.created_at DESC LIMIT 1;
  IF v_msg.id IS NULL THEN
    UPDATE public.chat_conversations SET last_message_text = NULL, last_message_at = NULL, updated_at = now() WHERE id = _conversation_id;
    RETURN;
  END IF;
  SELECT COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usuário') INTO v_sender_name FROM public.profiles p WHERE p.id = v_msg.sender_id;
  IF v_msg.type = 'audio' THEN v_preview := COALESCE(v_sender_name, 'Usuário') || ': 🎤 Áudio';
  ELSIF v_msg.type = 'image' THEN v_preview := COALESCE(v_sender_name, 'Usuário') || ': 📷 Imagem';
  ELSE v_preview := COALESCE(v_sender_name, 'Usuário') || ': ' || COALESCE(v_msg.content, 'Nova conversa');
  END IF;
  UPDATE public.chat_conversations SET last_message_text = CASE WHEN length(v_preview) > 100 THEN left(v_preview, 100) || '…' ELSE v_preview END,
    last_message_at = v_msg.created_at, updated_at = now() WHERE id = _conversation_id;
END;
$$;

-- get_network_members
CREATE OR REPLACE FUNCTION public.get_network_members(_user_id uuid, _filter text DEFAULT 'active')
RETURNS TABLE(id uuid, nome text, email text, avatar_url text, active boolean, created_at timestamptz, total_recargas bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  RETURN QUERY SELECT p.id, p.nome, p.email, p.avatar_url, p.active, p.created_at,
    (SELECT COUNT(*) FROM public.recargas r WHERE r.user_id = p.id AND r.status = 'completed')::bigint AS total_recargas
  FROM public.profiles p WHERE p.reseller_id = _user_id AND (
    _filter = 'all' OR (_filter = 'active' AND p.active = true) OR (_filter = 'inactive' AND p.active = false)
  ) ORDER BY p.created_at DESC;
END;
$$;

-- get_network_members_v2
CREATE OR REPLACE FUNCTION public.get_network_members_v2(_user_id uuid, _filter text DEFAULT 'active')
RETURNS TABLE(id uuid, nome text, email text, avatar_url text, active boolean, created_at timestamptz, total_recargas bigint, role text, saldo_revenda numeric, saldo_pessoal numeric, direct_network bigint, indirect_network bigint, direct_profit numeric, indirect_profit numeric)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  RETURN QUERY SELECT p.id, p.nome, p.email, p.avatar_url, p.active, p.created_at,
    (SELECT COUNT(*) FROM public.recargas r WHERE r.user_id = p.id AND r.status = 'completed')::bigint AS total_recargas,
    COALESCE((SELECT ur.role FROM public.user_roles ur WHERE ur.user_id = p.id ORDER BY CASE ur.role WHEN 'admin' THEN 1 WHEN 'revendedor' THEN 2 WHEN 'cliente' THEN 3 ELSE 4 END LIMIT 1), 'usuario') AS role,
    COALESCE((SELECT s.valor FROM public.saldos s WHERE s.user_id = p.id AND s.tipo = 'revenda'), 0) AS saldo_revenda,
    COALESCE((SELECT s.valor FROM public.saldos s WHERE s.user_id = p.id AND s.tipo = 'pessoal'), 0) AS saldo_pessoal,
    (SELECT COUNT(*) FROM public.profiles p2 WHERE p2.reseller_id = p.id)::bigint AS direct_network,
    (SELECT COUNT(*) FROM public.profiles p3 WHERE p3.reseller_id IN (SELECT p4.id FROM public.profiles p4 WHERE p4.reseller_id = p.id))::bigint AS indirect_network,
    COALESCE((SELECT SUM(rc.amount) FROM public.referral_commissions rc WHERE rc.user_id = _user_id AND rc.referred_user_id = p.id AND rc.type = 'direct'), 0) AS direct_profit,
    COALESCE((SELECT SUM(rc.amount) FROM public.referral_commissions rc WHERE rc.user_id = _user_id AND rc.referred_user_id = p.id AND rc.type = 'indirect'), 0) AS indirect_profit
  FROM public.profiles p WHERE p.reseller_id = _user_id AND (
    _filter = 'all' OR (_filter = 'active' AND p.active = true) OR (_filter = 'inactive' AND p.active = false)
  ) ORDER BY p.created_at DESC;
END;
$$;

-- get_network_stats
CREATE OR REPLACE FUNCTION public.get_network_stats(_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE result jsonb; direct_count bigint; direct_profit numeric; indirect_count bigint; indirect_profit numeric;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT COUNT(*) INTO direct_count FROM public.profiles WHERE reseller_id = _user_id;
  SELECT COALESCE(SUM(amount), 0) INTO direct_profit FROM public.referral_commissions WHERE user_id = _user_id AND type = 'direct';
  SELECT COUNT(*) INTO indirect_count FROM public.profiles p2 WHERE p2.reseller_id IN (SELECT id FROM public.profiles WHERE reseller_id = _user_id);
  SELECT COALESCE(SUM(amount), 0) INTO indirect_profit FROM public.referral_commissions WHERE user_id = _user_id AND type = 'indirect';
  result := jsonb_build_object('direct_count', direct_count, 'indirect_count', indirect_count, 'total_count', direct_count + indirect_count, 'direct_profit', direct_profit, 'indirect_profit', indirect_profit, 'total_profit', direct_profit + indirect_profit);
  RETURN result;
END;
$$;

-- get_operator_stats
CREATE OR REPLACE FUNCTION public.get_operator_stats()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE result jsonb; now24h timestamptz := now() - interval '24 hours';
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT jsonb_agg(row_to_json(final_stats)::jsonb) INTO result FROM (
    SELECT base.operadora, base.recent_count, base.min_24h, base.avg_24h, base.max_24h, base.pending_count,
      COALESCE(recent.avg_recent, 0) AS avg_recent, COALESCE(recent.min_recent, 0) AS min_recent
    FROM (
      SELECT INITCAP(LOWER(TRIM(r.operadora))) AS operadora,
        COUNT(*) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400) AS recent_count,
        COALESCE(MIN(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400), 0) AS min_24h,
        COALESCE(AVG(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400), 0) AS avg_24h,
        COALESCE(MAX(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400), 0) AS max_24h,
        COUNT(*) FILTER (WHERE r.status = 'pending') AS pending_count
      FROM public.recargas r WHERE r.created_at >= now24h AND r.operadora IS NOT NULL AND TRIM(r.operadora) != ''
      GROUP BY INITCAP(LOWER(TRIM(r.operadora)))
    ) base LEFT JOIN LATERAL (
      SELECT AVG(sub.diff) AS avg_recent, MIN(sub.diff) AS min_recent FROM (
        SELECT EXTRACT(EPOCH FROM (r3.completed_at - r3.created_at)) AS diff FROM public.recargas r3
        WHERE r3.status = 'completed' AND r3.completed_at IS NOT NULL AND INITCAP(LOWER(TRIM(r3.operadora))) = base.operadora
          AND EXTRACT(EPOCH FROM (r3.completed_at - r3.created_at)) > 0 AND EXTRACT(EPOCH FROM (r3.completed_at - r3.created_at)) < 86400
        ORDER BY r3.completed_at DESC LIMIT 3
      ) sub
    ) recent ON true
  ) final_stats;
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;

-- get_public_reseller_pricing
CREATE OR REPLACE FUNCTION public.get_public_reseller_pricing(_slug text)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _user_id uuid; _result json; _dm_enabled boolean := false; _dm_type text := 'fixo'; _dm_value numeric := 0;
BEGIN
  SELECT id INTO _user_id FROM public.profiles WHERE slug = _slug AND active = true LIMIT 1;
  IF _user_id IS NULL THEN RETURN '[]'::json; END IF;
  SELECT COALESCE((SELECT value = 'true' FROM public.system_config WHERE key = 'defaultMarginEnabled' LIMIT 1), false),
    COALESCE((SELECT value FROM public.system_config WHERE key = 'defaultMarginType' LIMIT 1), 'fixo'),
    COALESCE((SELECT NULLIF(REPLACE(value, ',', '.'), '')::numeric FROM public.system_config WHERE key = 'defaultMarginValue' LIMIT 1), 0)
  INTO _dm_enabled, _dm_type, _dm_value;
  SELECT json_agg(row_to_json(t)) INTO _result FROM (
    SELECT o.nome AS operadora_nome, pr.valor_recarga,
      CASE
        WHEN rpr.id IS NOT NULL THEN CASE WHEN rpr.tipo_regra = 'fixo' THEN COALESCE(NULLIF(rpr.regra_valor, 0), rpr.custo) ELSE COALESCE(rpr.custo, 0) * (1 + COALESCE(rpr.regra_valor, 0) / 100) END
        WHEN rbpr.id IS NOT NULL THEN CASE WHEN rbpr.tipo_regra = 'fixo' THEN COALESCE(NULLIF(rbpr.regra_valor, 0), rbpr.custo) ELSE COALESCE(rbpr.custo, 0) * (1 + COALESCE(rbpr.regra_valor, 0) / 100) END
        WHEN _dm_enabled AND _dm_value > 0 THEN CASE WHEN _dm_type = 'percentual' THEN COALESCE(pr.custo, 0) * (1 + _dm_value / 100) ELSE COALESCE(pr.custo, 0) + _dm_value END
        ELSE CASE WHEN pr.tipo_regra = 'fixo' THEN COALESCE(NULLIF(pr.regra_valor, 0), pr.custo) ELSE COALESCE(pr.custo, 0) * (1 + COALESCE(pr.regra_valor, 0) / 100) END
      END AS preco_cliente
    FROM public.pricing_rules pr
    JOIN public.operadoras o ON o.id = pr.operadora_id AND o.ativo = true
    LEFT JOIN public.reseller_pricing_rules rpr ON rpr.user_id = _user_id AND rpr.operadora_id = pr.operadora_id AND rpr.valor_recarga = pr.valor_recarga
    LEFT JOIN public.reseller_base_pricing_rules rbpr ON rbpr.user_id = _user_id AND rbpr.operadora_id = pr.operadora_id AND rbpr.valor_recarga = pr.valor_recarga
    WHERE NOT EXISTS (SELECT 1 FROM public.disabled_recharge_values drv WHERE drv.operadora_id = pr.operadora_id AND drv.valor = pr.valor_recarga)
    ORDER BY o.nome, pr.valor_recarga
  ) t WHERE t.preco_cliente > 0;
  RETURN COALESCE(_result, '[]'::json);
END;
$$;

-- export_schema_info
CREATE OR REPLACE FUNCTION public.export_schema_info()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE result jsonb; funcs jsonb; policies jsonb; triggers jsonb; enums jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Not authorized'; END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', p.proname, 'args', pg_get_function_arguments(p.oid), 'return_type', pg_get_function_result(p.oid), 'language', l.lanname, 'source', pg_get_functiondef(p.oid))), '[]'::jsonb) INTO funcs
  FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid JOIN pg_language l ON p.prolang = l.oid WHERE n.nspname = 'public' AND p.prokind = 'f';
  SELECT COALESCE(jsonb_agg(jsonb_build_object('table', pol.tablename, 'name', pol.policyname, 'command', pol.cmd, 'permissive', pol.permissive, 'roles', pol.roles, 'using', pol.qual, 'with_check', pol.with_check)), '[]'::jsonb) INTO policies
  FROM pg_policies pol WHERE pol.schemaname = 'public';
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', t.tgname, 'table', c.relname, 'function', p.proname, 'timing', CASE WHEN t.tgtype & 2 = 2 THEN 'BEFORE' ELSE 'AFTER' END, 'events', CASE WHEN t.tgtype & 4 = 4 THEN 'INSERT' WHEN t.tgtype & 8 = 8 THEN 'DELETE' WHEN t.tgtype & 16 = 16 THEN 'UPDATE' ELSE 'UNKNOWN' END)), '[]'::jsonb) INTO triggers
  FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid JOIN pg_proc p ON t.tgfoid = p.oid WHERE n.nspname = 'public' AND NOT t.tgisinternal;
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', t.typname, 'values', (SELECT jsonb_agg(e.enumlabel ORDER BY e.enumsortorder) FROM pg_enum e WHERE e.enumtypid = t.oid))), '[]'::jsonb) INTO enums
  FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typtype = 'e';
  result := jsonb_build_object('functions', funcs, 'rls_policies', policies, 'triggers', triggers, 'enums', enums, 'exported_at', now());
  RETURN result;
END;
$$;
```

### 9. Triggers

```sql
-- Trigger: handle_new_user (em auth.users)
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: generate_referral_code (em profiles)
CREATE OR REPLACE TRIGGER generate_referral_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();

-- Trigger: update_updated_at (em várias tabelas)
-- Aplicar em: profiles, operadoras, system_config, bot_settings, pricing_rules, reseller_pricing_rules,
-- reseller_base_pricing_rules, reseller_config, reseller_deposit_fees, client_pricing_rules, recargas,
-- transactions, notifications, broadcast_progress, banners, polls, chat_conversations, chat_messages,
-- support_tickets, support_templates, telegram_users, telegram_sessions, banned_devices, saldos
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'profiles','operadoras','system_config','bot_settings','pricing_rules','reseller_pricing_rules',
    'reseller_base_pricing_rules','reseller_config','reseller_deposit_fees','client_pricing_rules',
    'recargas','transactions','notifications','broadcast_progress','banners','polls',
    'chat_conversations','chat_messages','support_tickets','support_templates',
    'telegram_users','telegram_sessions','banned_devices','saldos'
  ])
  LOOP
    EXECUTE format('CREATE OR REPLACE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', tbl, tbl);
  END LOOP;
END;
$$;
```

### 10. RLS Policies (Completas)

> **Nota:** Abaixo estão TODAS as RLS policies. Execute após criar as tabelas e funções.

```sql
-- ============ operadoras ============
CREATE POLICY "Admins can manage operadoras" ON public.operadoras FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active operadoras" ON public.operadoras FOR SELECT USING (true);

-- ============ system_config ============
CREATE POLICY "Admins can manage config" ON public.system_config FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view config" ON public.system_config FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view commission config" ON public.system_config FOR SELECT TO authenticated USING (key = ANY(ARRAY['directCommissionPercent','indirectCommissionPercent','directCommissionEnabled','indirectCommissionEnabled']));
CREATE POLICY "Authenticated can view fee config" ON public.system_config FOR SELECT TO authenticated USING (key = ANY(ARRAY['taxaTipo','taxaValor']));
CREATE POLICY "Authenticated can view margin config" ON public.system_config FOR SELECT TO authenticated USING (key = ANY(ARRAY['defaultMarginEnabled','defaultMarginType','defaultMarginValue']));
CREATE POLICY "Authenticated can view room image config" ON public.system_config FOR SELECT USING (auth.uid() IS NOT NULL AND key ~~ 'room_images_%');
CREATE POLICY "Authenticated can view site url" ON public.system_config FOR SELECT TO authenticated USING (key = 'siteUrl');
CREATE POLICY "Authenticated can view support status" ON public.system_config FOR SELECT TO authenticated USING (key = 'supportEnabled');

-- ============ bot_settings ============
CREATE POLICY "Admins can manage bot_settings" ON public.bot_settings FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view bot_settings" ON public.bot_settings FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ============ notifications ============
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view notifications" ON public.notifications FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- ============ login_attempts ============
CREATE POLICY "Admins can manage login_attempts" ON public.login_attempts FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert login_attempts" ON public.login_attempts FOR INSERT WITH CHECK (true);

-- ============ banners ============
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view banners" ON public.banners FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============ polls ============
CREATE POLICY "Admins can manage polls" ON public.polls FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view active polls" ON public.polls FOR SELECT USING (auth.uid() IS NOT NULL AND active = true);

-- ============ support_templates ============
CREATE POLICY "Admins can manage support_templates" ON public.support_templates FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============ telegram_users ============
CREATE POLICY "Admins can manage telegram_users" ON public.telegram_users FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all telegram_users" ON public.telegram_users FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ============ telegram_sessions ============
CREATE POLICY "Deny all access telegram_sessions" ON public.telegram_sessions FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- ============ terms_acceptance ============
CREATE POLICY "Service role full access on terms_acceptance" ON public.terms_acceptance FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============ banned_devices ============
CREATE POLICY "Admins can manage banned_devices" ON public.banned_devices FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============ update_history ============
CREATE POLICY "Admins can manage update_history" ON public.update_history FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view update_history" ON public.update_history FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ============ push_subscriptions ============
CREATE POLICY "Service role full access" ON public.push_subscriptions FOR SELECT TO service_role USING (true);
CREATE POLICY "Users can manage their own subscriptions" ON public.push_subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ admin_notifications ============
CREATE POLICY "Admins can manage admin_notifications" ON public.admin_notifications FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============ profiles ============
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Resellers can view client profiles" ON public.profiles FOR SELECT TO authenticated USING (reseller_id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

-- ============ user_roles ============
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- ============ saldos ============
CREATE POLICY "Admins can insert saldos" ON public.saldos FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update saldos" ON public.saldos FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all saldos" ON public.saldos FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Resellers can view client saldos" ON public.saldos FOR SELECT USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = saldos.user_id AND p.reseller_id = auth.uid()));
CREATE POLICY "Revendedores can update client saldos" ON public.saldos FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = saldos.user_id AND p.reseller_id = auth.uid()));
CREATE POLICY "Users can view own saldo" ON public.saldos FOR SELECT USING (auth.uid() = user_id);

-- ============ recargas ============
CREATE POLICY "Admins can view all recargas" ON public.recargas FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Resellers can view client recargas" ON public.recargas FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = recargas.user_id AND p.reseller_id = auth.uid()));
CREATE POLICY "Users can insert own recargas" ON public.recargas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Users can view own recargas" ON public.recargas FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ transactions ============
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Resellers can view client transactions" ON public.transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = transactions.user_id AND p.reseller_id = auth.uid()));
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND status = 'pending');
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ pricing_rules ============
CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can read pricing rules" ON public.pricing_rules FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

-- ============ reseller_pricing_rules ============
CREATE POLICY "Admins can manage all reseller pricing" ON public.reseller_pricing_rules FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all reseller pricing" ON public.reseller_pricing_rules FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients can view reseller pricing" ON public.reseller_pricing_rules FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.reseller_id = reseller_pricing_rules.user_id));
CREATE POLICY "Users can manage own pricing" ON public.reseller_pricing_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own reseller pricing" ON public.reseller_pricing_rules FOR SELECT USING (auth.uid() = user_id);

-- ============ reseller_base_pricing_rules ============
CREATE POLICY "Admins can manage all reseller base pricing" ON public.reseller_base_pricing_rules FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients can view reseller base pricing" ON public.reseller_base_pricing_rules FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.reseller_id = reseller_base_pricing_rules.user_id));
CREATE POLICY "Users can view own reseller base pricing" ON public.reseller_base_pricing_rules FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ reseller_deposit_fees ============
CREATE POLICY "Admins can manage all deposit fees" ON public.reseller_deposit_fees FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Network members can view reseller fee" ON public.reseller_deposit_fees FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.reseller_id = reseller_deposit_fees.reseller_id));
CREATE POLICY "Resellers can manage own deposit fees" ON public.reseller_deposit_fees FOR ALL TO authenticated USING (auth.uid() = reseller_id) WITH CHECK (auth.uid() = reseller_id);

-- ============ client_pricing_rules ============
CREATE POLICY "Admins can manage all client pricing" ON public.client_pricing_rules FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients can view own pricing" ON public.client_pricing_rules FOR SELECT TO authenticated USING (auth.uid() = client_id);
CREATE POLICY "Resellers can manage own client pricing" ON public.client_pricing_rules FOR ALL TO authenticated USING (auth.uid() = reseller_id) WITH CHECK (auth.uid() = reseller_id);

-- ============ referral_commissions ============
CREATE POLICY "Admins can manage commissions" ON public.referral_commissions FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can view own commissions" ON public.referral_commissions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ scratch_cards ============
CREATE POLICY "Admins can manage scratch cards" ON public.scratch_cards FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own scratch card" ON public.scratch_cards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can scratch own card" ON public.scratch_cards FOR UPDATE TO authenticated USING (auth.uid() = user_id AND is_scratched = false) WITH CHECK (auth.uid() = user_id AND is_scratched = true);
CREATE POLICY "Users can view own scratch cards" ON public.scratch_cards FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ follows ============
CREATE POLICY "Admins can view all follows" ON public.follows FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can follow" ON public.follows FOR INSERT TO authenticated WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow" ON public.follows FOR DELETE TO authenticated USING (auth.uid() = follower_id);
CREATE POLICY "Users can view own follows" ON public.follows FOR SELECT TO authenticated USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- ============ poll_votes ============
CREATE POLICY "Admins can view all votes" ON public.poll_votes FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own vote" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own votes" ON public.poll_votes FOR SELECT USING (auth.uid() = user_id);

-- ============ broadcast_messages ============
CREATE POLICY "Admins can manage broadcast_messages" ON public.broadcast_messages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============ broadcast_progress ============
CREATE POLICY "Admins can manage broadcast_progress" ON public.broadcast_progress FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view broadcast_progress" ON public.broadcast_progress FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- ============ audit_logs ============
CREATE POLICY "Admins can manage audit_logs" ON public.audit_logs FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- ============ login_fingerprints ============
CREATE POLICY "Admins can manage login_fingerprints" ON public.login_fingerprints FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own fingerprints" ON public.login_fingerprints FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ support_tickets ============
CREATE POLICY "Admins can manage support_tickets" ON public.support_tickets FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============ support_messages ============
CREATE POLICY "Admins can manage support_messages" ON public.support_messages FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Support can manage support_messages" ON public.support_messages FOR ALL TO authenticated USING (has_role(auth.uid(), 'suporte')) WITH CHECK (has_role(auth.uid(), 'suporte'));
CREATE POLICY "Users can insert own ticket messages" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = support_messages.ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can mark messages as read" ON public.support_messages FOR UPDATE TO authenticated USING (sender_id <> auth.uid() AND EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = support_messages.ticket_id AND t.user_id = auth.uid())) WITH CHECK (sender_id <> auth.uid() AND EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = support_messages.ticket_id AND t.user_id = auth.uid()));
CREATE POLICY "Users can view own ticket messages" ON public.support_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM support_tickets t WHERE t.id = support_messages.ticket_id AND t.user_id = auth.uid()));

-- ============ chat_conversations ============
CREATE POLICY "Admins can manage all conversations" ON public.chat_conversations FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create conversations" ON public.chat_conversations FOR INSERT WITH CHECK (auth.uid() = participant_1);
CREATE POLICY "Users can update own conversations" ON public.chat_conversations FOR UPDATE TO authenticated USING (((type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2)) OR (type = 'group' AND is_chat_member(id, auth.uid())))) WITH CHECK (NOT (is_blocked IS DISTINCT FROM (SELECT c.is_blocked FROM chat_conversations c WHERE c.id = chat_conversations.id)));
CREATE POLICY "Users can view own conversations" ON public.chat_conversations FOR SELECT TO authenticated USING (((type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2)) OR (type = 'group' AND (is_chat_member(id, auth.uid()) OR is_private IS DISTINCT FROM true))));

-- ============ chat_members ============
CREATE POLICY "Admins can manage members" ON public.chat_members FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can join public groups" ON public.chat_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM chat_conversations c WHERE c.id = chat_members.conversation_id AND c.type = 'group' AND (c.is_private IS NULL OR c.is_private = false)));
CREATE POLICY "Users can view group members" ON public.chat_members FOR SELECT TO authenticated USING (is_conversation_participant(conversation_id, auth.uid()));

-- ============ chat_messages ============
CREATE POLICY "Admins can manage all messages" ON public.chat_messages FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Badge holders can delete messages in own conversations" ON public.chat_messages FOR DELETE TO authenticated USING (has_verification_badge(auth.uid()) AND is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "Badge holders can update messages in own conversations" ON public.chat_messages FOR UPDATE TO authenticated USING (has_verification_badge(auth.uid()) AND is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "Recipients can mark messages as read" ON public.chat_messages FOR UPDATE TO authenticated USING (is_conversation_participant(conversation_id, auth.uid()) AND sender_id <> auth.uid()) WITH CHECK (is_conversation_participant(conversation_id, auth.uid()) AND sender_id <> auth.uid() AND sender_id = (SELECT m.sender_id FROM chat_messages m WHERE m.id = chat_messages.id) AND NOT (content IS DISTINCT FROM (SELECT m.content FROM chat_messages m WHERE m.id = chat_messages.id)) AND NOT (conversation_id IS DISTINCT FROM (SELECT m.conversation_id FROM chat_messages m WHERE m.id = chat_messages.id)));
CREATE POLICY "Users can send messages in own conversations" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id AND is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "Users can update own messages" ON public.chat_messages FOR UPDATE USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can view messages in own conversations" ON public.chat_messages FOR SELECT TO authenticated USING (is_conversation_participant(conversation_id, auth.uid()));

-- ============ chat_message_reads ============
CREATE POLICY "Users can insert own reads" ON public.chat_message_reads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own reads" ON public.chat_message_reads FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ chat_reactions ============
CREATE POLICY "Admins can manage all reactions" ON public.chat_reactions FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can add reactions" ON public.chat_reactions FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM chat_messages m WHERE m.id = chat_reactions.message_id AND is_conversation_participant(m.conversation_id, auth.uid())));
CREATE POLICY "Users can remove own reactions" ON public.chat_reactions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view reactions in own conversations" ON public.chat_reactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM chat_messages m WHERE m.id = chat_reactions.message_id AND is_conversation_participant(m.conversation_id, auth.uid())));

-- ============ reseller_config ============
CREATE POLICY "Admins can manage reseller_config" ON public.reseller_config FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can manage own config" ON public.reseller_config FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ disabled_recharge_values ============
CREATE POLICY "Admins can manage disabled values" ON public.disabled_recharge_values FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view disabled values" ON public.disabled_recharge_values FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
```

### 11. Storage Buckets

> Criar via Lovable Cloud → Storage ou via SQL:

```sql
INSERT INTO storage.buckets (id, name, public) VALUES
  ('avatars', 'avatars', true),
  ('store-logos', 'store-logos', true),
  ('broadcast-images', 'broadcast-images', true),
  ('chat-audio', 'chat-audio', true),
  ('chat-images', 'chat-images', true),
  ('receipts', 'receipts', true),
  ('email-assets', 'email-assets', true),
  ('login-selfies', 'login-selfies', false)
ON CONFLICT (id) DO NOTHING;
```

### 12. Dados Iniciais (system_config)

```sql
INSERT INTO public.system_config (key, value) VALUES
  ('maintenanceMode', 'false'),
  ('chat_enabled', 'true'),
  ('seasonalTheme', ''),
  ('salesToolsEnabled', 'true'),
  ('requireReferralCode', 'false'),
  ('supportEnabled', 'true'),
  ('chat_new_conv_filter', 'admin_badge'),
  ('siteUrl', ''),
  ('defaultMarginEnabled', 'false'),
  ('defaultMarginType', 'fixo'),
  ('defaultMarginValue', '0'),
  ('taxaTipo', 'fixo'),
  ('taxaValor', '0'),
  ('directCommissionEnabled', 'false'),
  ('directCommissionPercent', '0'),
  ('indirectCommissionEnabled', 'false'),
  ('indirectCommissionPercent', '0')
ON CONFLICT (key) DO NOTHING;
```
