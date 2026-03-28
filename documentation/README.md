# 📚 Documentação Completa — Recargas Brasil v2

> **Última atualização:** 2026-03-28  
> **Versão:** 2.6  
> **Propósito:** Documentação completa do sistema para migração, restauração e manutenção.

---

## 📖 Índice de Documentos

| Documento | Descrição |
|-----------|-----------|
| [ARQUITETURA.md](./ARQUITETURA.md) | Arquitetura geral, stack tecnológico e estrutura de pastas |
| [BANCO_DE_DADOS.md](./BANCO_DE_DADOS.md) | Todas as 45 tabelas, RLS policies, funções e triggers |
| [EDGE_FUNCTIONS.md](./EDGE_FUNCTIONS.md) | Todas as 33 Edge Functions com descrição e autenticação |
| [COMPONENTES.md](./COMPONENTES.md) | Todos os componentes, páginas, hooks e libs |
| [AUTENTICACAO.md](./AUTENTICACAO.md) | Sistema de auth, roles, hierarquia, Admin Master e segurança |
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
| Edge Functions | Deno (Supabase Edge Functions) — 33 funções |
| Banco de Dados | PostgreSQL com RLS — 45 tabelas |
| Pagamentos | Mercado Pago, PushinPay, VirtualPay, EfiPay, MisticPay |
| Bot | Telegram Bot API |
| Armazenamento | Supabase Storage — 8 buckets |
| PWA | vite-plugin-pwa + Service Worker |
| Email | Lovable Auth Email Hook + React Email |
| Espelhamento | GitHub Actions (sync automático para repo espelho) |
| Migrations | 201+ SQL migrations |
| Armazenamento | Supabase Storage — 8 buckets |
| PWA | vite-plugin-pwa + Service Worker |
| Email | Lovable Auth Email Hook + React Email |
| Espelhamento | GitHub Actions (sync automático para repo espelho) |

---

## 🔄 Changelog Recente

### v2.5 (2026-03-28)
- **Auto-confirm de e-mail ativado** — Novos usuários entram direto sem precisar confirmar e-mail
- **Confirmação de e-mails pendentes** — Todos os usuários existentes com e-mail não confirmado foram confirmados
- **Correção duplicação no suporte** — `useRef` adicionado para evitar envio duplicado ao pressionar Enter rápido
- **Auditoria RLS corrigida** — `user_roles` policy corrigida de `TO public` para `TO authenticated`; `profiles` SELECT restrito a dono + admin + reseller
- **Raspadinha refatorada** — Chance total reduzida para ~1.6%, distribuição cúbica, proteção contra valores iguais
- **Backup v3.4** — Versão atualizada, candidateTables e knownOrder completos
- **201+ migrations** — Contagem atualizada

### v2.4 (2026-03-27)
- **Cargo `revendedor` restaurado** — Usuários sem vínculo de rede (`reseller_id = NULL`) recebem automaticamente o cargo `revendedor` ao se cadastrar
  - ~1.085 usuários existentes sem vínculo receberam o cargo via INSERT em massa
  - Trigger `handle_new_user` atualizado: se `_reseller_id IS NULL`, insere `revendedor` além de `usuario`
  - Usuários com indicação (vínculo de rede) continuam recebendo apenas `usuario`
  - Primeiro usuário (admin master) recebe `admin` + `usuario` + `revendedor`
- **Raspadinha refatorada** — Lógica de sorteio completamente reescrita:
  - Sorteio mutuamente exclusivo (single roll) com faixas cumulativas
  - Distribuição cúbica dentro de cada tier (favorece valores menores)
  - Chance total de ganhar reduzida para ~3,3% (era ~8,7%)
  - Tier 1: 2% (R$0,10–R$1,00), Tier 2: 1% (R$1,00–R$5,00), Tier 3: 0,3% (R$3,00–R$15,00)
  - Proteção contra valores iguais em derrotas
  - Melhor suporte a touch no iOS Safari
- **200 migrations** — Contagem atualizada

### v2.3 (2026-03-27)
- **Admin Master** — Novo cargo exclusivo com acesso total via `MasterOnlyRoute`
  - `masterAdminId` salvo em `system_config`
  - Primeiro usuário do sistema é auto-promovido a Admin Master
  - Admin Master não pode ter cargo removido por nenhum outro admin
  - `/principal` protegido exclusivamente por `MasterOnlyRoute.tsx`
- **Cargo `suporte`** — Novo role para agentes de suporte com acesso a tickets
- **PIN com blur** — Dígitos do PIN ficam desfocados imediatamente após digitação
- **Animação soft-pulse** — Ícone de celular no ticker Live com animação contínua
- **URLs dinâmicas** — `src/lib/domain.ts` usa `window.location.origin` (white-label)
- **Branding dinâmico** — `useSiteName`, `useSiteLogo` leem de `system_config`
- **33 Edge Functions** — Adicionada `init-mirror`
- **45 tabelas** — Inclui mirror tables (`mirror_sync_state`, `mirror_file_state`, `mirror_sync_logs`)

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
