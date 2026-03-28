

# Pontos que ainda usam `profiles` em vez de `profiles_public`

## Análise

Classifiquei todos os 25 arquivos que usam `.from("profiles")` em 3 categorias:

### Categoria 1 — Leitura do PRÓPRIO perfil (funciona OK via RLS)
Estes leem `auth.uid() = id`, então o RLS permite:
- `ProfileTab.tsx` — lê bio, slug, nome, email, referral_code do próprio user
- `ChatWindow.tsx` — lê próprio nome/badge
- `DashboardSection.tsx` — lê próprio referral_code + conta clientes
- `NotificationsTab.tsx` — atualiza próprio telegram_id
- `SupportChatWidget.tsx` — lê próprio telegram_id
- `ClientSupport.tsx` — lê próprio telegram_id
- `Principal.tsx` (avatar) — lê próprio avatar_url
- `AdminDashboard.tsx` (avatar) — lê próprio avatar_url

### Categoria 2 — Painéis de ADMIN (funciona OK via RLS de admin)
Admins têm policy ALL, então funciona:
- `Principal.tsx` (listagem de revendedores, badges)
- `AdminDashboard.tsx` (recargas, transações)
- `AdminSupport.tsx` (perfis de remetentes)
- `AuditTab.tsx` (perfis de admins)
- `SaquesSection.tsx` (perfis de saques)
- `RedesSection.tsx` (perfis de revendedores)
- `AntifraudSection.tsx` (perfis de fraude)
- `SupportAdminSelector.tsx` (admins)
- `RealtimeDashboard.tsx` (admin view)
- `UserRecargasModal.tsx` (admin modifica badges)

### Categoria 3 — Leitura de OUTROS perfis por usuário COMUM (PROBLEMA)
Estes falham silenciosamente para não-admins:

1. **`src/components/chat/MessageInfoModal.tsx`** — "Visto por" nas mensagens do chat. Busca `nome, avatar_url, verification_badge` de quem leu a mensagem. Usuários comuns não conseguem ver os nomes → aparece vazio ou falha.

2. **`src/hooks/useNotifications.ts`** — Nome do remetente nas notificações. Busca `nome, email` de outros usuários para exibir quem gerou a notificação. Usuários comuns veem "Usuário" em vez do nome real.

## Plano de correção

### Arquivo 1: `src/components/chat/MessageInfoModal.tsx`
- Trocar `.from("profiles")` por `.from("profiles_public")`
- Ajustar select para `id, nome, avatar_url, verification_badge` (campos disponíveis na view)

### Arquivo 2: `src/hooks/useNotifications.ts`
- Trocar `.from("profiles")` por `.from("profiles_public")`
- Ajustar select para `nome` apenas (email não está na view pública, mas nome é suficiente para exibição)
- Ajustar fallback: `{ nome: data?.nome || null, email: null }`

### Nenhuma alteração de banco necessária
A view `profiles_public` já expõe `id, nome, avatar_url, verification_badge` — tudo que esses 2 componentes precisam.

