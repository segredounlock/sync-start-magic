# 📦 Documentação Completa — Recargas Brasil v2

> **Última atualização:** 2026-03-25  
> **Versão:** 2.1  
> **Propósito:** Documentar TUDO necessário para migração, restauração e manutenção do sistema.

> ⚠️ **Este arquivo é um resumo.** A documentação completa e detalhada está na pasta `documentation/`.

---

## 🏗️ Arquitetura Geral

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Estilização | Tailwind CSS + shadcn/ui + Framer Motion |
| Backend | Supabase (Lovable Cloud) |
| Edge Functions | Deno — 31 funções |
| Banco de Dados | PostgreSQL — 42 tabelas com RLS |
| Pagamentos | Mercado Pago, PushinPay, VirtualPay, EfiPay, MisticPay |
| Bot | Telegram Bot API |
| Armazenamento | Supabase Storage — 8 buckets |
| PWA | vite-plugin-pwa + Service Worker |

---

## 📖 Documentação Detalhada

Consulte a pasta `documentation/` para guias completos:

| Documento | Descrição |
|-----------|-----------|
| [README.md](documentation/README.md) | Índice geral e changelog |
| [ARQUITETURA.md](documentation/ARQUITETURA.md) | Arquitetura, estrutura de pastas, fluxos |
| [BANCO_DE_DADOS.md](documentation/BANCO_DE_DADOS.md) | 42 tabelas, 35 funções, triggers, RLS |
| [EDGE_FUNCTIONS.md](documentation/EDGE_FUNCTIONS.md) | 31 Edge Functions |
| [COMPONENTES.md](documentation/COMPONENTES.md) | Componentes, páginas, hooks, libs |
| [AUTENTICACAO.md](documentation/AUTENTICACAO.md) | Auth, roles, segurança, migração de senhas |
| [PAGAMENTOS.md](documentation/PAGAMENTOS.md) | Gateways PIX, taxas, webhooks |
| [CHAT.md](documentation/CHAT.md) | Chat realtime, áudio, reações |
| [TELEGRAM.md](documentation/TELEGRAM.md) | Bot, mini app, broadcasts |
| [BACKUP.md](documentation/BACKUP.md) | Backup com SQL direto, restore, GitHub sync |
| [MIGRACAO.md](documentation/MIGRACAO.md) | Checklist completo de migração |
| [STORAGE.md](documentation/STORAGE.md) | 8 buckets e políticas |
| [SECRETS.md](documentation/SECRETS.md) | Secrets e variáveis de ambiente |

---

## 🔄 Principais Mudanças v2.1

### Backup com SQL Direto
- **Export:** Usa `SUPABASE_DB_URL` para query direta em `auth.users`, capturando `encrypted_password` (bcrypt hash)
- **Restore:** INSERT SQL direto preserva UUID original + senha + metadados + `auth.identities`
- **Resultado:** Migração completa — usuários fazem login com a mesma senha

### Cobertura de Dados
- 42 tabelas do schema `public`
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

---

*Documento mantido por: Sistema Recargas Brasil v2*
