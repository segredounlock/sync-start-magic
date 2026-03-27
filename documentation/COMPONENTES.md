# 🧩 Componentes, Páginas, Hooks e Libs

## Páginas (`src/pages/`) — 16+ arquivos

| Arquivo | Rota | Descrição |
|---------|------|-----------|
| `Auth.tsx` | `/auth` | Login, cadastro e recuperação de senha |
| `ResetPassword.tsx` | `/reset-password` | Redefinição de senha via link |
| `Principal.tsx` | `/principal` | Painel Master (admin master exclusivo, protegido por MasterOnlyRoute) |
| `AdminDashboard.tsx` | `/admin` | Painel Admin |
| `RevendedorPainel.tsx` | `/revendedor` | Painel do revendedor |
| `ClientePortal.tsx` | `/cliente` | Portal do cliente final |
| `LandingPage.tsx` | `/` | Página pública inicial |
| `RecargaPublica.tsx` | `/r/:slug` | Loja pública de recarga |
| `PublicProfile.tsx` | `/p/:slug` | Perfil público do revendedor |
| `ChatApp.tsx` | `/chat` | Aplicativo de chat |
| `AdminSupport.tsx` | `/admin-suporte` | Painel de suporte admin |
| `ClientSupport.tsx` | `/suporte` | Suporte do cliente |
| `TelegramMiniApp.tsx` | `/telegram` | Mini app do Telegram |
| `InstallApp.tsx` | `/instalar` | Página de instalação PWA |
| `RegrasPage.tsx` | `/regras` | Regras do sistema |
| `DocsRede.tsx` | `/docs/rede` | Documentação técnica da rede |
| `UserProfile.tsx` | `/perfil/:id` | Perfil de usuário |
| `MaintenancePage.tsx` | — | Página de manutenção |
| `NotFound.tsx` | `*` | Página 404 |

## Componentes Principais (`src/components/`) — ~65 arquivos

### Core
| Arquivo | Descrição |
|---------|-----------|
| `AnimatedCheck.tsx` | Animação de check (sucesso) |
| `AnimatedCounter.tsx` | Contadores animados para valores monetários |
| `AnimatedIcon.tsx` | Ícones com animação de entrada |
| `AnimatedPage.tsx` | Wrapper de página com transição fade |
| `ProtectedRoute.tsx` | Rota protegida por auth + role |
| `MasterOnlyRoute.tsx` | Rota exclusiva do Admin Master (valida `masterAdminId` em `system_config`) |
| `MobileBottomNav.tsx` | Navegação inferior mobile |
| `FloatingMenuIcon.tsx` | Menu flutuante |
| `PullToRefresh.tsx` | Pull to refresh mobile |
| `SplashScreen.tsx` | Tela de splash animada |
| `ThemeToggle.tsx` | Alternador light/dark mode |
| `Skeleton.tsx` | Loading skeletons |
| `SeasonalEffects.tsx` | Efeitos sazonais (neve, confete, etc.) |
| `UpdatePrompt.tsx` | Prompt de atualização PWA |
| `ImageCropper.tsx` | Cropper de imagens |
| `TextFormatToolbar.tsx` | Toolbar de formatação de texto |
| `InfoCard.tsx` | Card informativo reutilizável |

### Admin
| Arquivo | Descrição |
|---------|-----------|
| `BackupSection.tsx` | Backup completo (DB + Auth + código + GitHub sync) |
| `DashboardSection.tsx` | Dashboard de métricas |
| `RealtimeDashboard.tsx` | Dashboard com dados em tempo real |
| `BankDashboard.tsx` | Dashboard financeiro |
| `AuditTab.tsx` | Aba de auditoria |
| `BannersManager.tsx` | Gerenciador de banners |
| `BroadcastForm.tsx` | Formulário de broadcast |
| `BroadcastProgress.tsx` | Progresso de envio |
| `PollManager.tsx` | Gerenciador de enquetes |
| `AntifraudSection.tsx` | Seção antifraude |
| `AtualizacoesSection.tsx` | Seção de atualizações |
| `SaquesSection.tsx` | Seção de saques |
| `NotificationBell.tsx` | Sino de notificações admin |
| `ChatRoomManager.tsx` | Gerenciador de salas de chat |
| `NetworkCommissionConfig.tsx` | Config de comissões da rede |
| `ResellerFeeConfig.tsx` | Config de taxas do revendedor |
| `SupportAdminSelector.tsx` | Seletor de admin de suporte |
| `MirrorSyncPanel.tsx` | Painel de sincronização espelho |

### Revendedor
| Arquivo | Descrição |
|---------|-----------|
| `MinhaRede.tsx` | Gerenciador "Minha Rede" |
| `RedesSection.tsx` | Seção de redes |
| `MeusPrecos.tsx` | Tabela de preços do revendedor |
| `ClientPricingModal.tsx` | Modal de preço por cliente |
| `ProfileTab.tsx` | Aba de perfil |

### Cliente
| Arquivo | Descrição |
|---------|-----------|
| `RecargaReceipt.tsx` | Comprovante de recarga |
| `RecargasTicker.tsx` | Ticker de recargas recentes (com animação soft-pulse no ícone Live) |
| `TopRankingPodium.tsx` | Pódio de ranking |
| `BrandedQRCode.tsx` | QR Code personalizado |

### Gamificação
| Arquivo | Descrição |
|---------|-----------|
| `ScratchCard.tsx` | Componente de raspadinha |
| `ScratchCanvas.tsx` | Canvas da raspadinha |
| `FloatingPoll.tsx` | Enquete flutuante |
| `PopupBanner.tsx` | Banner popup |
| `PromoBanner.tsx` | Banner promocional |
| `SlideBanner.tsx` | Banner deslizante |

### Segurança
| Arquivo | Descrição |
|---------|-----------|
| `PinProtection.tsx` | Proteção por PIN (dígitos com efeito blur) |
| `PasswordStrengthMeter.tsx` | Medidor de força de senha |
| `VerificationBadge.tsx` | Badge de verificação |

### Chat (`src/components/chat/`) — 10 arquivos
| Arquivo | Descrição |
|---------|-----------|
| `ChatPage.tsx` | Layout principal do chat |
| `ChatWindow.tsx` | Janela de conversa |
| `ConversationList.tsx` | Lista de conversas |
| `MessageBubble.tsx` | Bolha de mensagem |
| `EmojiPicker.tsx` | Seletor de emojis |
| `AudioRecorder.tsx` | Gravador de áudio |
| `NewChatModal.tsx` | Modal nova conversa |
| `MentionDropdown.tsx` | Dropdown de menções |
| `MessageInfoModal.tsx` | Info da mensagem |
| `UserRecargasModal.tsx` | Modal recargas do usuário |

### Settings (`src/components/settings/`) — 4 arquivos
| Arquivo | Descrição |
|---------|-----------|
| `NotificationsTab.tsx` | Config de notificações |
| `PixKeyTab.tsx` | Chave PIX |
| `PixelAdsTab.tsx` | Pixel de anúncios |
| `SupportTab.tsx` | Config de suporte |

### Support (`src/components/support/`) — 4 arquivos
| Arquivo | Descrição |
|---------|-----------|
| `FloatingSupportButton.tsx` | Botão flutuante de suporte |
| `SupportChatWidget.tsx` | Widget de chat de suporte |
| `SupportSkeletons.tsx` | Skeletons de suporte |
| `SupportTemplates.tsx` | Templates de resposta |

### UI (`src/components/ui/`) — 5 arquivos
| Arquivo | Descrição |
|---------|-----------|
| `Currency.tsx` | Formatador de moeda |
| `IntVal.tsx` | Formatador de inteiro |
| `KpiCard.tsx` | Card de KPI |
| `StatusBadge.tsx` | Badge de status |
| `index.ts` | Barrel exports |

---

## Hooks (`src/hooks/`) — 20 arquivos

| Hook | Descrição |
|------|-----------|
| `useAuth.tsx` | Autenticação, sessão, roles e permissões (realtime role changes) |
| `useAsync.ts` | Wrapper para operações assíncronas |
| `useBackgroundPaymentMonitor.ts` | Monitor de pagamentos PIX em background |
| `useCacheCleanup.ts` | Limpeza de cache PWA |
| `useChat.ts` | Lógica completa do chat (mensagens, realtime, typing) |
| `useCrud.ts` | Operações CRUD genéricas com Supabase |
| `useDisabledValues.ts` | Valores de recarga desabilitados |
| `useFeePreview.ts` | Preview de taxas de depósito |
| `useInactivityTimeout.ts` | Timeout por inatividade (segurança) |
| `useNotificationSound.ts` | Sons de notificação |
| `useNotifications.ts` | Notificações admin (realtime + polling com deduplicação) |
| `usePixDeposit.ts` | Fluxo de depósito PIX |
| `usePresence.ts` | Presença online do usuário (Supabase Presence) |
| `usePushNotifications.ts` | Push notifications web (VAPID) |
| `useSeasonalTheme.ts` | Tema sazonal (natal, carnaval, etc.) |
| `useSiteLogo.ts` | Logo dinâmico do site (lê de system_config key: siteLogo) |
| `useSiteName.ts` | Nome dinâmico do site (lê de system_config key: siteName) |
| `useSupportAdminId.ts` | ID do admin de suporte (lê de system_config) |
| `useSupportChannels.ts` | Canais de suporte |
| `useTheme.tsx` | Tema light/dark |
| `useTypingIndicator.ts` | Indicador de digitação no chat |

### Deduplicação de Notificações (`useNotifications.ts`)

O sistema utiliza múltiplas camadas para evitar notificações duplicadas:

1. **`knownIds` (Set)** — IDs já processados são armazenados em memória
2. **`addNotification`** — Verifica `knownIds` antes de adicionar
3. **INSERT vs UPDATE** — Recargas:
   - INSERT: cria notificação + toast "Processando" + som
   - UPDATE com ID conhecido: atualiza silenciosamente, toast apenas para status final (concluída/falha)
   - UPDATE com ID novo: cria notificação + toast (caso INSERT perdido)
4. **Polling fallback** — A cada 15s, busca eventos perdidos com verificação de `knownIds`
5. **Reconnect** — Na troca de visibilidade da aba, reconecta canais + poll imediato

---

## Libs (`src/lib/`) — 15 arquivos

| Lib | Descrição |
|-----|-----------|
| `auditLog.ts` | Registrar ações de auditoria |
| `confirm.tsx` | Modal de confirmação |
| `currencyMask.ts` | Máscara de moeda BRL |
| `deviceFingerprint.ts` | Coleta de fingerprint do dispositivo |
| `domain.ts` | URLs dinâmicas via `window.location.origin` (white-label) |
| `fetchAll.ts` | Fetch com paginação automática (>1000 rows) |
| `inputValidation.ts` | Validação de inputs (telefone, email) |
| `passwordValidation.ts` | Validação de força de senha |
| `payment.ts` | Criação de PIX e verificação de status |
| `reservedNames.ts` | Lista de nomes reservados (slugs) |
| `sessionGuard.ts` | Guarda de sessão (multi-tab) |
| `sounds.ts` | Sons do sistema (notificação, sucesso, erro) |
| `sourceManifest.ts` | Manifesto de arquivos fonte para backup |
| `timezone.ts` | Formatação de datas em BRT |
| `toast.tsx` | Toast notifications estilizados |
| `utils.ts` | Utilidades gerais (cn, formatadores) |
