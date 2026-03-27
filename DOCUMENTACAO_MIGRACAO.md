# 📦 Documentação Completa — Recargas Brasil v2

> **Última atualização:** 2026-03-27  
> **Versão:** 2.3  
> **Propósito:** Documentar TUDO necessário para migração, restauração e manutenção do sistema.

> ⚠️ **Este arquivo é um resumo.** A documentação completa e detalhada está na pasta `documentation/`.

---

## 🏗️ Arquitetura Geral

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Estilização | Tailwind CSS + shadcn/ui + Framer Motion |
| Backend | Supabase (Lovable Cloud) |
| Edge Functions | Deno — 33 funções |
| Banco de Dados | PostgreSQL — 45 tabelas com RLS |
| Pagamentos | Mercado Pago, PushinPay, VirtualPay, EfiPay, MisticPay |
| Bot | Telegram Bot API |
| Armazenamento | Supabase Storage — 8 buckets |
| PWA | vite-plugin-pwa + Service Worker |
| Espelhamento | GitHub Actions — sync automático para repo mirror |

---

## 📖 Documentação Detalhada

Consulte a pasta `documentation/` para guias completos:

| Documento | Descrição |
|-----------|-----------|
| [README.md](documentation/README.md) | Índice geral e changelog |
| [ARQUITETURA.md](documentation/ARQUITETURA.md) | Arquitetura, estrutura de pastas, fluxos |
| [BANCO_DE_DADOS.md](documentation/BANCO_DE_DADOS.md) | 45 tabelas, ~38 funções, triggers, RLS |
| [EDGE_FUNCTIONS.md](documentation/EDGE_FUNCTIONS.md) | 33 Edge Functions |
| [COMPONENTES.md](documentation/COMPONENTES.md) | Componentes, páginas, hooks, libs |
| [AUTENTICACAO.md](documentation/AUTENTICACAO.md) | Auth, roles, Admin Master, segurança, migração de senhas |
| [PAGAMENTOS.md](documentation/PAGAMENTOS.md) | Gateways PIX, taxas, webhooks |
| [CHAT.md](documentation/CHAT.md) | Chat realtime, áudio, reações |
| [TELEGRAM.md](documentation/TELEGRAM.md) | Bot, mini app, broadcasts |
| [BACKUP.md](documentation/BACKUP.md) | Backup com SQL direto, restore, GitHub sync |
| [MIGRACAO.md](documentation/MIGRACAO.md) | Checklist completo de migração |
| [STORAGE.md](documentation/STORAGE.md) | 8 buckets e políticas |
| [SECRETS.md](documentation/SECRETS.md) | Secrets e variáveis de ambiente |
| [MIRROR_SYNC.md](documentation/MIRROR_SYNC.md) | Sistema de espelhamento automático |

---

## 🔄 Principais Mudanças v2.3

### Admin Master
- **Cargo exclusivo** com acesso total e irrevogável ao sistema
- **`masterAdminId`** salvo em `system_config` — primeiro usuário é auto-promovido
- **`MasterOnlyRoute.tsx`** protege `/principal` — verifica `user.id === masterAdminId`
- **Proteção de cargo** — nenhum outro admin pode remover o cargo do admin master
- **Sub-menu de decisão** ao atribuir cargo admin: "Admin com acesso ao Principal" ou "Admin comum"

### Novas Features
- **Cargo `suporte`** — Novo role para agentes de suporte
- **PIN com blur** — Dígitos do PIN ficam desfocados após digitação
- **Animação soft-pulse** — Ícone Live no ticker com animação contínua
- **URLs dinâmicas** — `domain.ts` usa `window.location.origin` (white-label ready)
- **Branding dinâmico** — `useSiteName`, `useSiteLogo` leem de `system_config`

### Sistema de Espelhamento (Mirror Sync) — v2.2
- **GitHub Actions** sincroniza automaticamente código para repo espelho a cada push
- **Isolamento de ambiente** — `.env` e `config.toml` removidos antes do push
- **Proteção contra execução no destino** — `if: github.repository` no workflow
- **Cada espelho tem backend independente** com seus próprios secrets do Lovable Cloud

### Backup com SQL Direto (v2.1)
- **Export:** Usa `SUPABASE_DB_URL` para query direta em `auth.users`, capturando `encrypted_password` (bcrypt hash)
- **Restore:** INSERT SQL direto preserva UUID original + senha + metadados + `auth.identities`
- **Resultado:** Migração completa — usuários fazem login com a mesma senha

### Cobertura de Dados
- 45 tabelas do schema `public` (inclui mirror tables)
- `auth.users` com senhas criptografadas
- `auth.identities` para provider email
- Dados do Telegram (telegram_users, telegram_sessions, terms_acceptance)
- Campos telegram_id e telegram_username em profiles

---

## ⚠️ REGRA DE MANUTENÇÃO

> Sempre que uma nova tabela, componente, hook ou edge function for criada/modificada:
> 1. `supabase/functions/backup-export/index.ts` — fallback de tabelas
> 2. `supabase/functions/backup-restore/index.ts` — knownOrder
> 3. `src/components/BackupSection.tsx` — SOURCE_PATHS
> 4. `documentation/` — atualizar docs relevantes
> 5. `.github/workflows/sync-mirror.yml` — verificar se novos arquivos sensíveis precisam ser excluídos

---

*Documento mantido por: Sistema Recargas Brasil v2*
