# 🔍 Auditoria Completa — Recargas Brasil v2

> **Data da auditoria:** 2026-03-28  
> **Versão do sistema:** 2.7  

---

## 📊 Resumo Geral

| Métrica | Quantidade |
|---------|-----------|
| Páginas | 18 (+2 docs) |
| Componentes | 76 |
| Hooks customizados | 21 |
| Libs utilitárias | 16 |
| Edge Functions | 36 |
| Tabelas no banco | 47 |
| Migrations SQL | 210+ |
| Buckets de Storage | 8 |
| Funções PostgreSQL | 39 |
| Triggers | 20 |
| Tabelas com Realtime | 20 |
| Email templates | 6 |

---

## 📄 Páginas (`src/pages/`) — 18 arquivos

### Públicas
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `LandingPage.tsx` | Página pública inicial |
| `/auth` | `Auth.tsx` | Login, cadastro e recuperação de senha |
| `/reset-password` | `ResetPassword.tsx` | Redefinição de senha via link |
| `/r/:slug` | `RecargaPublica.tsx` | Loja pública de recarga |
| `/p/:slug` | `PublicProfile.tsx` | Perfil público do revendedor |
| `/telegram` | `TelegramMiniApp.tsx` | Mini app do Telegram |
| `/instalar` | `InstallApp.tsx` | Página de instalação PWA |
| `/regras` | `RegrasPage.tsx` | Regras do sistema |
| `/docs/rede` | `DocsRede.tsx` | Documentação técnica da rede |

### Autenticadas
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/painel` | `RevendedorPainel.tsx` | Painel do revendedor |
| `/cliente` | `ClientePortal.tsx` | Portal do cliente final |
| `/chat` | `ChatApp.tsx` | Aplicativo de chat |
| `/suporte` | `ClientSupport.tsx` | Suporte do cliente |
| `/perfil/:id` | `UserProfile.tsx` | Perfil de usuário |

### Admin / Master
| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/admin` | `AdminDashboard.tsx` | Painel Admin |
| `/principal` | `Principal.tsx` | Painel Master (protegido por MasterOnlyRoute) |
| `/admin-suporte` | `AdminSupport.tsx` | Painel de suporte admin |

### Especiais
| Arquivo | Descrição |
|---------|-----------|
| `MaintenancePage.tsx` | Página de manutenção (modo manutenção) |
| `NotFound.tsx` | Página 404 |

---

## 🧩 Componentes — 76 arquivos

### Core (17)
`AnimatedCheck`, `AnimatedCounter`, `AnimatedIcon`, `AnimatedPage`, `ProtectedRoute`, `MasterOnlyRoute`, `MobileBottomNav`, `FloatingMenuIcon`, `PullToRefresh`, `SplashScreen`, `ThemeToggle`, `Skeleton`, `SeasonalEffects`, `UpdatePrompt`, `ImageCropper`, `TextFormatToolbar`, `InfoCard`

### Admin (19)
`BackupSection`, `SystemVerification`, `DashboardSection`, `RealtimeDashboard`, `BankDashboard`, `AuditTab`, `BannersManager`, `BroadcastForm`, `BroadcastProgress`, `PollManager`, `AntifraudSection`, `AtualizacoesSection`, `SaquesSection`, `NotificationBell`, `ChatRoomManager`, `NetworkCommissionConfig`, `ResellerFeeConfig`, `SupportAdminSelector`, `MirrorSyncPanel`

### Revendedor (5)
`MinhaRede`, `RedesSection`, `MeusPrecos`, `ClientPricingModal`, `ProfileTab`

### Cliente (4)
`RecargaReceipt`, `RecargasTicker`, `TopRankingPodium`, `BrandedQRCode`

### Gamificação (6)
`ScratchCard`, `ScratchCanvas`, `FloatingPoll`, `PopupBanner`, `PromoBanner`, `SlideBanner`

### Segurança e Licenciamento (6)
`PinProtection`, `PasswordStrengthMeter`, `VerificationBadge`, `InstallWizard`, `LicenseGate`, `LicenseManager`

### Chat (10)
`ChatPage`, `ChatWindow`, `ConversationList`, `MessageBubble`, `EmojiPicker`, `AudioRecorder`, `NewChatModal`, `MentionDropdown`, `MessageInfoModal`, `UserRecargasModal`

### Settings (4)
`NotificationsTab`, `PixKeyTab`, `PixelAdsTab`, `SupportTab`

### Support (4)
`FloatingSupportButton`, `SupportChatWidget`, `SupportSkeletons`, `SupportTemplates`

### UI (5)
`Currency`, `IntVal`, `KpiCard`, `StatusBadge`, `index.ts`

---

## 🪝 Hooks — 21 arquivos

| Hook | Descrição |
|------|-----------|
| `useAuth` | Autenticação, sessão, roles e permissões |
| `useAsync` | Wrapper para operações assíncronas |
| `useBackgroundPaymentMonitor` | Monitor de pagamentos PIX em background |
| `useCacheCleanup` | Limpeza de cache PWA |
| `useChat` | Lógica completa do chat |
| `useCrud` | Operações CRUD genéricas |
| `useDisabledValues` | Valores de recarga desabilitados |
| `useFeePreview` | Preview de taxas de depósito |
| `useInactivityTimeout` | Timeout por inatividade |
| `useNotificationSound` | Sons de notificação |
| `useNotifications` | Notificações admin (realtime + polling) |
| `usePixDeposit` | Fluxo de depósito PIX |
| `usePresence` | Presença online do usuário |
| `usePushNotifications` | Push notifications web (VAPID) |
| `useSeasonalTheme` | Tema sazonal |
| `useSiteLogo` | Logo dinâmico do site |
| `useSiteName` | Nome dinâmico do site |
| `useSupportAdminId` | ID do admin de suporte |
| `useSupportChannels` | Canais de suporte |
| `useTheme` | Tema light/dark |
| `useTypingIndicator` | Indicador de digitação no chat |

---

## 📚 Libs — 16 arquivos

`auditLog`, `confirm`, `currencyMask`, `deviceFingerprint`, `domain`, `fetchAll`, `inputValidation`, `passwordValidation`, `payment`, `reservedNames`, `sessionGuard`, `sounds`, `sourceManifest`, `timezone`, `toast`, `utils`

---

## ⚡ Edge Functions — 36 funções

### Administrativas (5)
`admin-create-user`, `admin-delete-user`, `admin-reset-password`, `admin-toggle-email-verify`, `admin-toggle-role`

### Pagamento (6)
`create-pix`, `pix-webhook`, `check-pending-pix`, `collect-pending-debts`, `efi-setup`, `expire-pending-deposits`

### Recarga (3)
`recarga-express`, `sync-catalog`, `sync-pending-recargas`

### Backup (3)
`backup-export`, `backup-restore`, `github-sync`

### Telegram (4)
`telegram-bot`, `telegram-miniapp`, `telegram-notify`, `telegram-setup`

### Comunicação (4)
`send-broadcast`, `delete-broadcast`, `cleanup-stuck-broadcasts`, `send-push`

### Segurança (2)
`ban-device`, `check-device`

### Licenciamento (3)
`license-generate`, `license-validate`, `license-check-server`

### Sistema (6)
`auth-email-hook`, `client-register`, `init-mirror`, `og-store`, `scratch-card`, `vapid-setup`

---

## 🗄️ Banco de Dados — 47 tabelas

### Tabelas Core
`profiles`, `user_roles`, `saldos`, `operadoras`, `system_config`, `bot_settings`

### Recargas e Transações
`recargas`, `transactions`, `pricing_rules`, `reseller_pricing_rules`, `reseller_base_pricing_rules`, `reseller_config`, `reseller_deposit_fees`, `disabled_recharge_values`, `client_pricing_rules`, `referral_commissions`

### Chat
`chat_conversations`, `chat_members`, `chat_messages`, `chat_message_reads`, `chat_reactions`

### Suporte
`support_tickets`, `support_messages`, `support_templates`

### Telegram
`telegram_users`, `telegram_sessions`, `terms_acceptance`

### Notificações e Broadcast
`notifications`, `broadcast_progress`, `broadcast_messages`, `admin_notifications`, `push_subscriptions`

### Gamificação e Social
`polls`, `poll_votes`, `scratch_cards`, `banners`, `follows`

### Segurança
`login_attempts`, `login_fingerprints`, `banned_devices`, `audit_logs`

### Licenciamento
`licenses`, `license_logs`

### Mirror/Espelhamento
`mirror_sync_state`, `mirror_file_state`, `mirror_sync_logs`

### Histórico
`update_history`

### Views
`profiles_public` — View pública de perfis (sem dados sensíveis)

---

## 🗂️ Storage — 8 Buckets

| Bucket | Público | Uso |
|--------|---------|-----|
| `avatars` | ✅ | Fotos de perfil |
| `store-logos` | ✅ | Logos de loja |
| `chat-images` | ✅ | Imagens do chat |
| `chat-audio` | ✅ | Áudios do chat |
| `broadcast-images` | ✅ | Imagens de broadcast |
| `receipts` | ✅ | Comprovantes |
| `email-assets` | ✅ | Assets de email |
| `login-selfies` | ❌ | Selfies de login (privado) |

---

## 🔐 Segurança

### Hierarquia de Roles
1. **Admin Master** — Acesso total, `/principal`, protegido contra alteração
2. **Admin** — Gestão de usuários, config, backup
3. **Suporte** — Acesso a tickets de suporte
4. **Revendedor** — Gestão de rede, preços, clientes
5. **Usuário** — Acesso básico (cargo padrão)

### Proteções Implementadas
- ✅ RLS em todas as 47 tabelas
- ✅ `MasterOnlyRoute` para rota `/principal`
- ✅ `ProtectedRoute` com verificação de roles
- ✅ PIN com blur para segurança
- ✅ Timeout de inatividade
- ✅ Device fingerprint + banimento
- ✅ Medidor de força de senha
- ✅ Guard de sessão (multi-tab)
- ✅ Auditoria de ações administrativas
- ✅ Licenciamento com blindagem anti-bypass (4 camadas)

### Gateways de Pagamento (5)
Mercado Pago, PushinPay, VirtualPay, EfiPay, MisticPay

---

## 📧 Email Templates — 6

`signup`, `recovery`, `magic-link`, `invite`, `email-change`, `reauthentication`

---

## 🔄 Funções PostgreSQL — 39

Funções SECURITY DEFINER para:
- Roles: `has_role`, `has_verification_badge`
- Chat: `is_conversation_participant`, `is_chat_member`, `get_unread_counts`, `sync_chat_conversation_preview`
- Rede: `get_network_members`, `get_network_members_v2`, `get_network_stats`
- Ranking: `get_recargas_ranking`, `get_ticker_recargas`
- Saldo: `increment_saldo`, `claim_transaction`
- Loja: `get_public_store_by_slug`, `get_public_reseller_pricing`
- Config: `get_maintenance_mode`, `get_chat_enabled`, `get_seasonal_theme`, `get_notif_config`, `get_chat_new_conv_filter`, `get_require_referral_code`, `get_sales_tools_enabled`
- Social: `get_follow_counts`, `get_user_recargas_count`, `get_user_verification_badge`
- Raspadinha: `get_scratch_top_winners`, `get_scratch_recent_winners`
- Operadoras: `get_operator_stats`
- Licença: `is_license_valid`
- Backup: `get_public_tables`, `export_schema_info`
- Slugs: `generate_unique_slug`, `generate_referral_code`
- Outros: `get_deposit_fee_for_user`, `get_user_reseller_id`, `get_user_by_referral_code`, `handle_new_user`, `update_updated_at_column`, `cleanup_old_login_attempts`

---

## ⏱️ Triggers — 20

| Trigger | Tabela | Função |
|---------|--------|--------|
| `update_*_updated_at` | 18 tabelas | `update_updated_at_column` |
| `trg_generate_referral_code` | `profiles` | `generate_referral_code` |

Tabelas com trigger `updated_at`: `bot_settings`, `broadcast_progress`, `chat_conversations`, `chat_messages`, `client_pricing_rules`, `licenses`, `notifications`, `operadoras`, `polls`, `pricing_rules`, `profiles`, `recargas`, `reseller_base_pricing_rules`, `reseller_config`, `reseller_pricing_rules`, `saldos`, `system_config`, `telegram_users`, `transactions`

---

## 📡 Realtime — 20 tabelas

Tabelas com publicação `supabase_realtime` ativa:
`admin_notifications`, `audit_logs`, `broadcast_progress`, `chat_conversations`, `chat_members`, `chat_message_reads`, `chat_messages`, `chat_reactions`, `license_logs`, `notifications`, `poll_votes`, `polls`, `profiles`, `recargas`, `saldos`, `support_messages`, `support_tickets`, `telegram_users`, `transactions`, `user_roles`

---

## 🌐 PWA

- Service Worker para push notifications (`sw-push.js`)
- `vite-plugin-pwa` para offline/install
- `InstallApp.tsx` — Página de instalação
- `UpdatePrompt.tsx` — Prompt de atualização
- `useCacheCleanup` — Limpeza automática de cache

---

## 🪞 Espelhamento (Mirror)

- GitHub Actions (`sync-mirror.yml`) para sync automático
- Edge Function `init-mirror` para seeding de config
- Edge Function `github-sync` para sync incremental inteligente
- 3 tabelas de controle: `mirror_sync_state`, `mirror_file_state`, `mirror_sync_logs`
- Proteção de paths sensíveis (`.env`, `config.toml`, workflows)
- Sistema de licenciamento obrigatório para espelhos

---

## 📦 Backup & Ferramentas v3.5

- Export: 47 tabelas + auth.users (SQL direto) + schema + código fonte
- Restore: Ordem de dependência + validação FK + upsert em lotes
- Safe mode: Ignora auth/config em ambientes espelho
- GitHub Sync: Envio em lotes para repositório GitHub
- Source backup: 215+ arquivos com hash SHA-256
- **Verificação de Integridade**: 9 categorias (tabelas, RLS, funções SQL, edge functions, storage, config, realtime, triggers, pagamentos)

---

---

## 🔧 Correções RLS Aplicadas — 2026-03-28

### Correção 1: `license_logs` — Policy com role inexistente
- **Problema:** Policy usava `has_role(auth.uid(), 'master')`, mas o role `master` não existe no sistema
- **Impacto:** Nenhum admin conseguia visualizar os logs de licenciamento
- **Correção:** Trocado para `has_role(auth.uid(), 'admin')`
- **Risco de quebra:** Zero — corrige algo que já não funcionava

### Correção 2: `broadcast-images` — DELETE aberto
- **Problema:** Qualquer usuário autenticado podia deletar imagens de broadcast
- **Impacto:** Risco de exclusão maliciosa de imagens de notificações
- **Correção:** DELETE restrito a admins via `has_role(auth.uid(), 'admin')`
- **Risco de quebra:** Zero — apenas admins gerenciam broadcasts

### Correção 3: `receipts` — DELETE/UPDATE sem restrição de dono
- **Problema:** Qualquer autenticado podia deletar/atualizar comprovantes de qualquer usuário
- **Impacto:** Risco de manipulação de comprovantes alheios
- **Correção:** DELETE e UPDATE restritos ao dono via `(auth.uid())::text = (storage.foldername(name))[1]`
- **Risco de quebra:** Zero — o frontend nunca faz delete/update de receipts

### O que NÃO foi alterado
- `chat_members` — grupos funcionam como canais obrigatórios, sem opção de sair
- Filtros de path no storage
- Nenhum componente frontend
- Nenhuma edge function
- Nenhuma tabela de dados

---

*Auditoria realizada em 2026-03-28 — Recargas Brasil v2.6*
