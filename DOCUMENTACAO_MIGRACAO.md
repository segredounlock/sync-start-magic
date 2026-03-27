# 📦 Documentação Completa — Recargas Brasil v2

> **Última atualização:** 2026-03-27  
> **Versão:** 2.4  
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

## 🔄 Principais Mudanças v2.4

### Cargo `revendedor` Restaurado
- Usuários sem vínculo de rede (`reseller_id = NULL`) recebem automaticamente `revendedor`
- ~1.085 usuários existentes sem vínculo receberam o cargo via INSERT em massa
- Trigger `handle_new_user` atualizado para auto-assign
- Usuários com indicação continuam recebendo apenas `usuario`
- Primeiro usuário (admin master) recebe `admin` + `usuario` + `revendedor`

### Raspadinha Refatorada
- **Sorteio mutuamente exclusivo** — single roll com faixas cumulativas (era multi-roll acumulativo)
- **Distribuição cúbica** — `Math.pow(Math.random(), 3)` favorece valores menores
- **Chance total: ~3,3%** (era ~8,7%)
- **Tier 1:** 2% — R$0,10 a R$1,00
- **Tier 2:** 1% — R$1,00 a R$5,00
- **Tier 3:** 0,3% — R$3,00 a R$15,00
- Proteção contra 3 valores iguais em derrotas
- Melhor suporte a touch no iOS Safari

### masterAdminId — Auto-Criação e Verificação
- **Auto-criação:** O trigger `handle_new_user` cria automaticamente a chave `masterAdminId` em `system_config` quando o **primeiro usuário** se cadastra (sem nenhum admin existente)
- **Em migrações:** Verificar se a chave existe após restauração — sem ela, ninguém acessa `/principal`
- **Fallback:** Edge functions `admin-toggle-role` e `admin-delete-user` têm fallback hardcoded (`f5501acc-...`)
- **Sem fallback:** `MasterOnlyRoute.tsx` consulta apenas `system_config` — se ausente, bloqueia acesso total ao `/principal`
- **Correção manual:** `INSERT INTO system_config (key, value) VALUES ('masterAdminId', 'UUID') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;`

### Outras
- **200 migrations** — Contagem atualizada
- **Roles do sistema:** `admin`, `usuario`, `revendedor`, `suporte`

---

## 🔄 Mudanças Anteriores

### Admin Master (v2.3)
- **Cargo exclusivo** com acesso total e irrevogável ao sistema
- **`masterAdminId`** salvo em `system_config` — primeiro usuário é auto-promovido
- **`MasterOnlyRoute.tsx`** protege `/principal` — verifica `user.id === masterAdminId`
- **Proteção de cargo** — nenhum outro admin pode remover o cargo do admin master
- **Sub-menu de decisão** ao atribuir cargo admin: "Admin com acesso ao Principal" ou "Admin comum"

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
