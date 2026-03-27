# 🏗️ Arquitetura do Sistema

## Visão Geral

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌────────┐  │
│  │  Pages  │ │Components│ │   Hooks   │ │  Libs  │  │
│  └────┬────┘ └────┬─────┘ └─────┬─────┘ └───┬────┘  │
│       └───────────┴──────┬──────┴────────────┘       │
│                          │                           │
│              Supabase Client SDK                     │
└──────────────────────────┬───────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Supabase   │
                    │   Cloud     │
                    ├─────────────┤
                    │ PostgreSQL  │ ← 45 tabelas + RLS
                    │ Auth        │ ← JWT + Roles
                    │ Storage     │ ← 8 buckets
                    │ Realtime    │ ← WebSocket
                    │ Edge Funcs  │ ← 33 funções Deno
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼────┐  ┌───▼────┐  ┌───▼─────┐
         │Telegram │  │  PIX   │  │ Recarga │
         │Bot API  │  │Gateway │  │   API   │
         └─────────┘  └────────┘  └─────────┘
```

## Estrutura de Pastas

```
/
├── .github/
│   └── workflows/
│       └── sync-mirror.yml # Espelhamento automático para repo mirror
├── documentation/           # 13 arquivos de documentação técnica
├── public/
│   └── sw-push.js          # Service Worker para push notifications
├── src/
│   ├── assets/             # Assets estáticos
│   ├── components/         # Componentes React
│   │   ├── chat/           # Componentes de chat (10 arquivos)
│   │   ├── settings/       # Abas de configurações (4 arquivos)
│   │   ├── support/        # Suporte ao cliente (4 arquivos)
│   │   └── ui/             # Componentes de UI base (5 arquivos)
│   ├── hooks/              # Custom hooks (20 arquivos)
│   ├── integrations/
│   │   └── supabase/       # Client e types (auto-gerado)
│   ├── lib/                # Utilitários e helpers (15 arquivos)
│   │   └── domain.ts       # URLs dinâmicas (white-label)
│   ├── pages/              # Páginas da aplicação (16+ arquivos)
│   │   └── docs/           # Documentação interna (2 arquivos)
│   ├── styles/             # Estilos globais
│   ├── types/              # Tipos TypeScript globais
│   ├── AppRoot.tsx         # Root da aplicação (router)
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos base + Tailwind
├── supabase/
│   ├── config.toml         # Configuração do Supabase
│   ├── functions/          # 33 Edge Functions
│   │   ├── _shared/        # Templates de email compartilhados
│   │   │   └── email-templates/  # 6 templates (signup, recovery, etc.)
│   │   ├── admin-create-user/
│   │   ├── admin-delete-user/
│   │   ├── admin-reset-password/
│   │   ├── admin-toggle-email-verify/
│   │   ├── admin-toggle-role/
│   │   ├── auth-email-hook/
│   │   ├── backup-export/      # SQL direto para auth.users
│   │   ├── backup-restore/     # SQL direto para auth.users
│   │   ├── ban-device/
│   │   ├── check-device/
│   │   ├── check-pending-pix/
│   │   ├── cleanup-stuck-broadcasts/
│   │   ├── client-register/
│   │   ├── collect-pending-debts/
│   │   ├── create-pix/
│   │   ├── delete-broadcast/
│   │   ├── efi-setup/
│   │   ├── expire-pending-deposits/
│   │   ├── github-sync/
│   │   ├── init-mirror/        # Inicializa ambiente espelho
│   │   ├── og-store/
│   │   ├── pix-webhook/
│   │   ├── recarga-express/
│   │   ├── scratch-card/
│   │   ├── send-broadcast/
│   │   ├── send-push/
│   │   ├── sync-catalog/
│   │   ├── sync-pending-recargas/
│   │   ├── telegram-bot/
│   │   ├── telegram-miniapp/
│   │   ├── telegram-notify/
│   │   ├── telegram-setup/
│   │   └── vapid-setup/
│   └── migrations/         # SQL migrations (200+ arquivos)
├── index.html              # HTML entry
├── vite.config.ts          # Configuração Vite + PWA + Source Hash Plugin
├── tailwind.config.ts      # Configuração Tailwind
├── tsconfig.json           # TypeScript config
└── package.json            # Dependências
```

## Componentes de Proteção de Rota

| Componente | Descrição |
|-----------|-----------|
| `ProtectedRoute.tsx` | Protege rotas por auth + role (admin, usuario) |
| `MasterOnlyRoute.tsx` | Protege `/principal` — apenas admin master (valida `masterAdminId` em `system_config`) |

## URLs Dinâmicas (White-Label)

O arquivo `src/lib/domain.ts` fornece URLs dinâmicas usando `window.location.origin`:
- `getBaseUrl()` — retorna o domínio atual
- `buildUrl(path)` — constrói URL completa com o domínio atual
- `fixExternalUrl(url)` — substitui domínios lovable.app pelo domínio atual

Isso permite que o sistema funcione em qualquer domínio sem alterações de código.

## Fluxo de Dados

### Autenticação
```
Usuário → Auth.tsx → Supabase Auth → JWT Token
  → handle_new_user trigger → profiles + saldos + user_roles
  → ProtectedRoute verifica role → Redireciona para painel correto
  → MasterOnlyRoute (para /principal) → Verifica masterAdminId
```

### Recarga
```
Usuário seleciona operadora/valor → Verifica saldo
  → Deduz saldo (increment_saldo) → Cria recarga (status: pending)
  → Edge Function recarga-express → API externa
  → Atualiza status → Notifica admin
```

### Depósito PIX
```
Usuário solicita depósito → Edge Function create-pix
  → Gateway (MP/PushinPay/etc) → Retorna QR Code
  → Monitor em background verifica status
  → pix-webhook recebe confirmação → Credita saldo
```

### Backup Completo
```
Admin clica "Exportar" → Edge Function backup-export
  → SQL direto: SELECT * FROM auth.users (com encrypted_password)
  → Supabase SDK: SELECT * FROM cada tabela pública
  → JSZip: gera ZIP com auth/ + database/ + schema/ + config/
  → Download do ZIP
```

### Restauração Completa
```
Admin faz upload do ZIP → Edge Function backup-restore
  → SQL direto: INSERT INTO auth.users (UUID + senha preservados)
  → SQL direto: INSERT INTO auth.identities (provider email)
  → Supabase SDK: UPSERT em cada tabela na ordem de dependência
  → Retorna relatório (criados, pulados, falhas)
```

### Espelhamento (Mirror Sync)
```
Lovable push → GitHub (recargas-brasil-v2)
  → GitHub Actions: sync-mirror.yml
  → Remove .env e config.toml
  → Force push → sync-start-magic
  → Lovable do espelho detecta e sincroniza
```
> Detalhes completos em [MIRROR_SYNC.md](./MIRROR_SYNC.md)
