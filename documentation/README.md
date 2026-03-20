# 📚 Documentação Completa — Recargas Brasil v2

> **Última atualização:** 2026-03-20  
> **Versão:** 2.0  
> **Propósito:** Documentação completa do sistema para migração, restauração e manutenção.

---

## 📖 Índice de Documentos

| Documento | Descrição |
|-----------|-----------|
| [ARQUITETURA.md](./ARQUITETURA.md) | Arquitetura geral, stack tecnológico e estrutura de pastas |
| [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md) | Todas as 42 tabelas, RLS policies, funções e triggers |
| [EDGE_FUNCTIONS.md](./EDGE_FUNCTIONS.md) | Todas as 29 Edge Functions com descrição e autenticação |
| [COMPONENTES.md](./COMPONENTES.md) | Todos os componentes, páginas, hooks e libs |
| [AUTENTICACAO.md](./AUTENTICACAO.md) | Sistema de auth, roles, hierarquia e segurança |
| [PAGAMENTOS.md](./PAGAMENTOS.md) | Gateways de pagamento, PIX, webhooks |
| [CHAT.md](./CHAT.md) | Sistema de chat, realtime, áudio, reações |
| [TELEGRAM.md](./TELEGRAM.md) | Bot Telegram, mini app, broadcasts |
| [BACKUP.md](./BACKUP.md) | Sistema de backup, restore, GitHub sync |
| [MIGRACAO.md](./MIGRACAO.md) | Checklist completo de migração passo a passo |
| [STORAGE.md](./STORAGE.md) | Buckets de armazenamento e políticas |
| [SECRETS.md](./SECRETS.md) | Variáveis de ambiente e secrets necessárias |

---

## 🏗️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 |
| Estilização | Tailwind CSS + Framer Motion |
| Backend | Supabase (Lovable Cloud) |
| Edge Functions | Deno (Supabase Edge Functions) — 29 funções |
| Banco de Dados | PostgreSQL com RLS — 42 tabelas |
| Pagamentos | Mercado Pago, PushinPay, VirtualPay, EfiPay, MisticPay |
| Bot | Telegram Bot API |
| Armazenamento | Supabase Storage — 8 buckets |
| PWA | vite-plugin-pwa + Service Worker |
| Email | Lovable Auth Email Hook + React Email |

---

*Documento mantido por: Sistema Recargas Brasil v2*
