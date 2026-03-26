# 📚 Documentação Completa — Recargas Brasil v2

> **Última atualização:** 2026-03-26  
> **Versão:** 2.2  
> **Propósito:** Documentação completa do sistema para migração, restauração e manutenção.

---

## 📖 Índice de Documentos

| Documento | Descrição |
|-----------|-----------|
| [ARQUITETURA.md](./ARQUITETURA.md) | Arquitetura geral, stack tecnológico e estrutura de pastas |
| [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md) | Todas as 42 tabelas, RLS policies, funções e triggers |
| [EDGE_FUNCTIONS.md](./EDGE_FUNCTIONS.md) | Todas as 32 Edge Functions com descrição e autenticação |
| [COMPONENTES.md](./COMPONENTES.md) | Todos os componentes, páginas, hooks e libs |
| [AUTENTICACAO.md](./AUTENTICACAO.md) | Sistema de auth, roles, hierarquia e segurança |
| [PAGAMENTOS.md](./PAGAMENTOS.md) | Gateways de pagamento, PIX, webhooks |
| [CHAT.md](./CHAT.md) | Sistema de chat, realtime, áudio, reações |
| [TELEGRAM.md](./TELEGRAM.md) | Bot Telegram, mini app, broadcasts |
| [BACKUP.md](./BACKUP.md) | Sistema de backup, restore, auth users, GitHub sync |
| [MIGRACAO.md](./MIGRACAO.md) | Checklist completo de migração passo a passo |
| [STORAGE.md](./STORAGE.md) | Buckets de armazenamento e políticas |
| [SECRETS.md](./SECRETS.md) | Variáveis de ambiente e secrets necessárias |
| [MIRROR_SYNC.md](./MIRROR_SYNC.md) | Sistema de espelhamento automático com GitHub Actions |

---

## 🏗️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Estilização | Tailwind CSS + Framer Motion |
| Backend | Supabase (Lovable Cloud) |
| Edge Functions | Deno (Supabase Edge Functions) — 32 funções |
| Banco de Dados | PostgreSQL com RLS — 42 tabelas |
| Pagamentos | Mercado Pago, PushinPay, VirtualPay, EfiPay, MisticPay |
| Bot | Telegram Bot API |
| Armazenamento | Supabase Storage — 8 buckets |
| PWA | vite-plugin-pwa + Service Worker |
| Email | Lovable Auth Email Hook + React Email |
| Espelhamento | GitHub Actions (sync automático para repo espelho) |

---

## 🔄 Changelog Recente

### v2.2 (2026-03-26)
- **Sistema de espelhamento (Mirror Sync)** — Sincronização automática via GitHub Actions para repo espelho
- **Isolamento de ambiente** — `.env` e `config.toml` removidos automaticamente antes do push para espelho
- **Proteção contra execução no destino** — Condição `if: github.repository` no workflow
- **Documentação do mirror** — Novo documento `MIRROR_SYNC.md` com guia completo
- **32 Edge Functions** — Contagem corrigida (inclui `github-sync`)
- **Documentação de secrets** — Lovable Cloud provisiona automaticamente todos os 6 secrets base

### v2.1 (2026-03-25)
- **Backup auth.users com SQL direto** — Exporta `encrypted_password` (bcrypt hash) via `SUPABASE_DB_URL`
- **Restauração completa de auth.users** — INSERT SQL direto preserva UUID original + senha + metadados
- **Identities restore** — Insere `auth.identities` para provider email durante restauração
- **Fallback Admin API** — Se `SUPABASE_DB_URL` indisponível, usa Admin API como fallback

### v2.0 (2026-03-20)
- Documentação completa do sistema
- Sistema de backup com export/restore/GitHub sync
- 42 tabelas com RLS completo
- 29 Edge Functions

---

*Documento mantido por: Sistema Recargas Brasil v2*
