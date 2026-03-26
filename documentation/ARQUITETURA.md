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
                    │ PostgreSQL  │ ← 42 tabelas + RLS
                    │ Auth        │ ← JWT + Roles
                    │ Storage     │ ← 8 buckets
                    │ Realtime    │ ← WebSocket
                    │ Edge Funcs  │ ← 32 funções Deno
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
├── documentation/           # 12 arquivos de documentação técnica
├── public/
│   └── sw-push.js          # Service Worker para push notifications
├── src/
│   ├── assets/             # Assets estáticos
│   ├── components/         # Componentes React
│   │   ├── chat/           # Componentes de chat (10 arquivos)
│   │   ├── settings/       # Abas de configurações (4 arquivos)
│   │   ├── support/        # Suporte ao cliente (4 arquivos)
│   │   └── ui/             # Componentes de UI base (5 arquivos)
│   ├── hooks/              # Custom hooks (18 arquivos)
│   ├── integrations/
│   │   └── supabase/       # Client e types (auto-gerado)
│   ├── lib/                # Utilitários e helpers (14 arquivos)
│   ├── pages/              # Páginas da aplicação (16+ arquivos)
│   │   └── docs/           # Documentação interna (2 arquivos)
│   ├── styles/             # Estilos globais
│   ├── types/              # Tipos TypeScript globais
│   ├── AppRoot.tsx         # Root da aplicação (router)
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos base + Tailwind
├── supabase/
│   ├── config.toml         # Configuração do Supabase
│   ├── functions/          # 31 Edge Functions
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
│   └── migrations/         # SQL migrations
├── index.html              # HTML entry
├── vite.config.ts          # Configuração Vite + PWA + Source Hash Plugin
├── tailwind.config.ts      # Configuração Tailwind
├── tsconfig.json           # TypeScript config
└── package.json            # Dependências
```

## Fluxo de Dados

### Autenticação
```
Usuário → Auth.tsx → Supabase Auth → JWT Token
  → handle_new_user trigger → profiles + saldos + user_roles
  → ProtectedRoute verifica role → Redireciona para painel correto
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
