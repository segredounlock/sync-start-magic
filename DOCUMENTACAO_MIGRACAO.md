# 📦 Documentação Completa — Recargas Brasil v2

> **Última atualização:** 2026-03-02  
> **Propósito:** Documentar TUDO necessário para migração, restauração e manutenção do sistema.

---

## 🏗️ Arquitetura Geral

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilização | Tailwind CSS + shadcn/ui + Framer Motion |
| Backend | Supabase (Lovable Cloud) |
| Edge Functions | Deno (Supabase Edge Functions) |
| Pagamentos | Mercado Pago, PushinPay, VirtualPay, EfiPay, MisticPay |
| Bot | Telegram Bot API |
| Armazenamento | Supabase Storage (avatars, store-logos, broadcast-images, chat-audio) |

---

## 📁 Estrutura de Arquivos

### Páginas (`src/pages/`)
| Arquivo | Descrição |
|---------|-----------|
| `Auth.tsx` | Login, cadastro e recuperação de senha |
| `ResetPassword.tsx` | Redefinição de senha via link |
| `Principal.tsx` | Painel Master (admin completo) |
| `AdminDashboard.tsx` | Painel Admin/Revendedor (visão alternativa) |
| `RevendedorPainel.tsx` | Painel do revendedor |
| `ClientePortal.tsx` | Portal do cliente final |
| `LandingPage.tsx` | Página pública inicial |
| `RecargaPublica.tsx` | Loja pública de recarga (por slug do revendedor) |
| `TelegramMiniApp.tsx` | Mini app do Telegram |
| `NotFound.tsx` | Página 404 |

### Componentes (`src/components/`)
| Arquivo | Descrição |
|---------|-----------|
| `AnimatedCheck.tsx` | Animação de check (sucesso) |
| `AnimatedCounter.tsx` | Contadores animados (valores monetários) |
| `AnimatedIcon.tsx` | Ícones com animação |
| `AnimatedPage.tsx` | Wrapper de página com transição |
| `BackupSection.tsx` | Seção de backup (export/import/GitHub) |
| `BannersManager.tsx` | Gerenciador de banners promocionais |
| `BrandedQRCode.tsx` | QR Code personalizado com logo |
| `BroadcastForm.tsx` | Formulário de envio de broadcast |
| `BroadcastProgress.tsx` | Progresso de envio de broadcast |
| `FloatingPoll.tsx` | Enquete flutuante para usuários |
| `MobileBottomNav.tsx` | Navegação inferior mobile |
| `NotificationBell.tsx` | Sino de notificações admin |
| `PinProtection.tsx` | Proteção por PIN no painel master |
| `PollManager.tsx` | Gerenciador de enquetes (admin) |
| `PopupBanner.tsx` | Banner popup promocional |
| `PromoBanner.tsx` | Banner promocional inline |
| `ProtectedRoute.tsx` | Rota protegida por autenticação |
| `RealtimeDashboard.tsx` | Dashboard com dados em tempo real |
| `RecargasTicker.tsx` | Ticker de recargas recentes |
| `Skeleton.tsx` | Loading skeletons |
| `SplashScreen.tsx` | Tela de splash animada |
| `ThemeToggle.tsx` | Alternador light/dark mode |

### Chat (`src/components/chat/`)
| Arquivo | Descrição |
|---------|-----------|
| `ChatPage.tsx` | Página principal do chat (layout split) |
| `ChatWindow.tsx` | Janela de conversa |
| `ConversationList.tsx` | Lista de conversas |
| `MessageBubble.tsx` | Bolha de mensagem (texto/áudio/imagem) |
| `EmojiPicker.tsx` | Seletor de emojis e reações |
| `AudioRecorder.tsx` | Gravador de áudio |
| `NewChatModal.tsx` | Modal para iniciar nova conversa |

### Hooks (`src/hooks/`)
| Arquivo | Descrição |
|---------|-----------|
| `useAuth.tsx` | Autenticação e controle de roles |
| `useBackgroundPaymentMonitor.ts` | Monitor de pagamentos em background |
| `useChat.ts` | Lógica do chat (mensagens, conversas, realtime) |
| `useNotifications.ts` | Notificações do sistema |
| `useTheme.tsx` | Controle de tema (light/dark) |

### Libs (`src/lib/`)
| Arquivo | Descrição |
|---------|-----------|
| `fetchAll.ts` | Fetch com paginação automática (>1000 rows) |
| `payment.ts` | Criação de PIX e verificação de status |
| `sounds.ts` | Sons do sistema |
| `utils.ts` | Utilidades gerais (cn, formatadores) |

---

## 🗄️ Banco de Dados — Tabelas (22 tabelas)

### Tabelas Core
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `profiles` | Perfis de usuários (nome, email, telefone, avatar, slug, loja) | ✅ |
| `user_roles` | Roles dos usuários (admin, revendedor, cliente, usuario) | ✅ |
| `saldos` | Saldos dos usuários (tipo: revenda, pessoal) | ✅ |

### Tabelas de Negócio
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `operadoras` | Operadoras de telefonia (Claro, Vivo, TIM, etc.) | ✅ |
| `recargas` | Histórico de recargas realizadas | ✅ |
| `transactions` | Transações financeiras (depósitos, pagamentos) | ✅ |
| `pricing_rules` | Regras de precificação global | ✅ |
| `reseller_pricing_rules` | Regras de precificação por revendedor | ✅ |
| `reseller_config` | Configurações individuais do revendedor (gateway) | ✅ |

### Tabelas de Configuração
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `system_config` | Configurações globais do sistema (API, gateway, etc.) | ✅ |
| `bot_settings` | Configurações do bot Telegram | ✅ |

### Tabelas de Comunicação
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `notifications` | Broadcasts/notificações enviadas | ✅ |
| `broadcast_progress` | Progresso de envio de broadcasts | ✅ |
| `admin_notifications` | Notificações internas do admin | ✅ |
| `banners` | Banners promocionais | ✅ |
| `polls` | Enquetes | ✅ |
| `poll_votes` | Votos nas enquetes | ✅ |

### Tabelas de Chat
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `chat_conversations` | Conversas 1-a-1 entre usuários | ✅ |
| `chat_messages` | Mensagens do chat (texto, áudio, imagem) | ✅ |
| `chat_reactions` | Reações (emojis) nas mensagens | ✅ |

### Tabelas Telegram
| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `telegram_users` | Usuários do bot Telegram | ✅ |
| `telegram_sessions` | Sessões ativas do bot | ✅ |

---

## ⚡ Edge Functions (16 funções)

| Função | Descrição | Auth |
|--------|-----------|------|
| `admin-create-user` | Criar usuário (admin only) | JWT + admin role |
| `admin-delete-user` | Deletar usuário (admin only) | JWT + admin role |
| `admin-toggle-role` | Alterar role de usuário | JWT + admin role |
| `backup-export` | Exportar backup completo em ZIP | JWT + admin role |
| `backup-restore` | Restaurar backup de ZIP | JWT + admin role |
| `cleanup-stuck-broadcasts` | Limpar broadcasts travados | JWT |
| `client-register` | Auto-registro de cliente via link de revendedor | Public |
| `create-pix` | Gerar cobrança PIX (multi-gateway) | JWT |
| `github-sync` | Sincronizar código com GitHub | JWT + admin role |
| `pix-webhook` | Receber webhooks de pagamento PIX | Public (webhook) |
| `recarga-express` | Integração com API de recarga | JWT |
| `send-broadcast` | Enviar broadcast via Telegram | JWT + admin role |
| `telegram-bot` | Webhook do bot Telegram | Public (webhook) |
| `telegram-miniapp` | API do mini app Telegram | Public |
| `telegram-notify` | Enviar notificação via Telegram | JWT |
| `telegram-setup` | Configurar webhook do bot | JWT + admin role |

---

## 🔐 Sistema de Autenticação

### Hierarquia de Roles
```
admin (master) → acesso total ao sistema
  └── revendedor → gerencia clientes, preços, gateway próprio
        └── cliente → vinculado a um revendedor
              └── usuario → cadastro pendente de aprovação
```

### Trigger Automática (`handle_new_user`)
Ao criar conta, automaticamente:
1. Cria perfil em `profiles`
2. Cria 2 saldos (revenda + pessoal) em `saldos`
3. Atribui role `usuario` em `user_roles`

### Função de Segurança (`has_role`)
```sql
-- Security definer para evitar recursão infinita em RLS
public.has_role(_user_id uuid, _role text) → boolean
```

---

## 💳 Gateways de Pagamento

| Gateway | Chaves necessárias |
|---------|-------------------|
| Mercado Pago | `mercadoPagoKeyProd`, `mercadoPagoKeyTest`, `mercadoPagoModo` |
| PushinPay | `pushinPayToken` |
| VirtualPay | `virtualPayClientId`, `virtualPayClientSecret`, `virtualPayPlatformId` |
| EfiPay | `efiPayClientId`, `efiPayClientSecret`, `efiPayPixKey`, `efiPaySandbox` |
| MisticPay | `misticPayClientId`, `misticPayClientSecret` |

**Config global:** `system_config` (key/value)  
**Config por revendedor:** `reseller_config` (user_id + key/value)

---

## 📦 Storage Buckets

| Bucket | Público | Uso |
|--------|---------|-----|
| `avatars` | ✅ | Fotos de perfil dos usuários |
| `store-logos` | ✅ | Logos das lojas dos revendedores |
| `broadcast-images` | ✅ | Imagens dos broadcasts |
| `chat-audio` | ✅ | Áudios do chat |

---

## 🔄 Realtime

Tabelas com Realtime habilitado:
- `chat_conversations`
- `chat_messages`
- `chat_reactions`

---

## 🛡️ Secrets (Variáveis de Ambiente)

| Secret | Descrição |
|--------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave anônima |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (admin) |
| `SUPABASE_DB_URL` | URL direta do PostgreSQL |
| `LOVABLE_API_KEY` | Chave do Lovable AI Gateway |

**Frontend (.env):**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## 📋 Checklist de Migração

### 1. Preparação
- [ ] Exportar backup completo (BD + código) via painel admin
- [ ] Sincronizar código com GitHub
- [ ] Anotar todas as secrets configuradas

### 2. Novo Ambiente
- [ ] Criar projeto Supabase novo
- [ ] Configurar variáveis de ambiente (.env)
- [ ] Configurar secrets nas edge functions

### 3. Banco de Dados
- [ ] Executar migrations SQL (criar tabelas na ordem correta)
- [ ] Criar funções: `handle_new_user`, `has_role`, `update_updated_at_column`
- [ ] Criar trigger: `handle_new_user` em `auth.users`
- [ ] Configurar todas as RLS policies
- [ ] Habilitar Realtime nas tabelas de chat

### 4. Storage
- [ ] Criar buckets: `avatars`, `store-logos`, `broadcast-images`, `chat-audio`
- [ ] Configurar políticas de storage (público para leitura)

### 5. Edge Functions
- [ ] Deploy das 16 edge functions
- [ ] Configurar `verify_jwt = false` para webhooks no config.toml

### 6. Dados
- [ ] Restaurar backup via edge function `backup-restore`
- [ ] Verificar integridade: profiles, saldos, user_roles
- [ ] Reconfigurar webhook do Telegram bot

### 7. Validação
- [ ] Testar login/cadastro
- [ ] Testar recarga
- [ ] Testar depósito PIX
- [ ] Testar chat
- [ ] Testar broadcasts
- [ ] Testar bot Telegram

---

## ⚠️ LEMBRETE IMPORTANTE

> **Sempre que uma nova tabela, componente, hook ou edge function for criada/modificada, o sistema de backup DEVE ser atualizado nos 3 arquivos:**
> 1. `supabase/functions/backup-export/index.ts` — lista de tabelas
> 2. `supabase/functions/backup-restore/index.ts` — ordem de restauração
> 3. `src/components/BackupSection.tsx` — TABLES + SOURCE_PATHS

---

*Documento mantido por: Sistema Recargas Brasil v2*
