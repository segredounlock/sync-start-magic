

# Auditoria Completa do Sistema de Backup

## Resultado Geral: 3 problemas encontrados

---

## 1. SOURCE_PATHS no BackupSection.tsx

### Arquivos presentes no projeto mas FALTANDO no SOURCE_PATHS:

| Arquivo | Status |
|---------|--------|
| `supabase/functions/backup-restore/index.ts` | **FALTANDO** -- a edge function de restore existe mas nao esta na lista |
| `supabase/functions/admin-reset-password/index.ts` | **FALTANDO** |

Todos os demais arquivos (pages, components, hooks, libs, edge functions, email templates, docs) estao corretamente listados.

### Arquivos no SOURCE_PATHS que NAO existem no projeto:

| Arquivo | Status |
|---------|--------|
| `public/manifest.webmanifest` | Nao confirmado -- pode existir mas nao aparece na listagem de arquivos do projeto |

---

## 2. backup-restore knownOrder vs Tabelas Reais

### Tabelas no banco que FALTAM no knownOrder do restore:

| Tabela | Status |
|--------|--------|
| `support_tickets` | Presente no banco, **JA esta** no knownOrder |
| `profiles_public` | E uma VIEW, nao tabela -- nao precisa estar |

O knownOrder inclui `telegram_users`, `telegram_sessions`, `terms_acceptance` que podem nao existir mais como tabelas fisicas, mas isso nao causa erro (sao simplesmente ignorados se nao existirem no ZIP).

**Conclusao**: O knownOrder do restore esta correto para todas as 42+ tabelas.

---

## 3. backup-export candidateTables (fallback)

O fallback do export tambem esta alinhado com as tabelas reais. Nenhuma tabela faltante.

---

## 4. Edge Functions: config.toml vs Diretorio

| Edge Function | No diretorio | No config.toml |
|---------------|:---:|:---:|
| admin-create-user | OK | OK |
| admin-delete-user | OK | OK |
| admin-reset-password | OK | **FALTANDO** |
| admin-toggle-email-verify | OK | OK |
| admin-toggle-role | OK | OK |
| auth-email-hook | OK | OK |
| backup-export | OK | OK |
| backup-restore | OK | OK |
| ban-device | OK | **FALTANDO** |
| check-device | OK | **FALTANDO** |
| check-pending-pix | OK | OK |
| cleanup-stuck-broadcasts | OK | OK |
| client-register | OK | OK |
| collect-pending-debts | OK | OK |
| create-pix | OK | OK |
| delete-broadcast | OK | **FALTANDO** |
| efi-setup | OK | OK |
| expire-pending-deposits | OK | OK |
| github-sync | OK | OK |
| og-store | OK | OK |
| pix-webhook | OK | OK |
| recarga-express | OK | OK |
| scratch-card | OK | **FALTANDO** |
| send-broadcast | OK | OK |
| send-push | OK | OK |
| sync-catalog | OK | OK |
| sync-pending-recargas | OK | **FALTANDO** |
| telegram-bot | OK | OK |
| telegram-miniapp | OK | OK |
| telegram-notify | OK | OK |
| telegram-setup | OK | OK |
| vapid-setup | OK | OK |
| bootstrap-admin | No config.toml | **NAO existe no diretorio** |

Nota: as 6 functions faltando no config.toml ja deployam com `verify_jwt = false` por padrao no Lovable Cloud, entao nao e um problema critico. O `bootstrap-admin` esta no config.toml mas nao existe como pasta -- deve ser removido.

---

## Plano de Correcao

### Arquivo 1: `src/components/BackupSection.tsx`
Adicionar ao array SOURCE_PATHS:
- `"supabase/functions/backup-restore/index.ts"`
- `"supabase/functions/admin-reset-password/index.ts"`

### Arquivo 2: `supabase/config.toml`
- Remover a entrada `[functions.bootstrap-admin]` (funcao nao existe)
- Opcionalmente adicionar as 6 functions faltantes (ban-device, check-device, delete-broadcast, scratch-card, sync-pending-recargas, admin-reset-password), mas nao e obrigatorio

Nenhuma alteracao necessaria no backup-export ou backup-restore -- ambos estao corretos.

