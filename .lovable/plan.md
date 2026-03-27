

# Atualizar Sistema de Backup + Documentação Completa

## Parte 1 — Sincronizar Backup com Sistema Atual

### 1.1 `src/components/BackupSection.tsx` — SOURCE_PATHS
Adicionar arquivo faltante:
- `src/components/MasterOnlyRoute.tsx`

### 1.2 `supabase/functions/backup-export/index.ts` — fallback de tabelas
Verificar que a lista `candidateTables` está completa (atualmente já inclui mirror tables). Sem alteração necessaria, pois a descoberta e dinamica via `get_public_tables()`.

### 1.3 `supabase/functions/backup-restore/index.ts` — knownOrder
A lista `knownOrder` ja inclui todas as tabelas conhecidas incluindo mirror. Sem alteracao necessaria.

### Resumo Backup: apenas adicionar `MasterOnlyRoute.tsx` ao SOURCE_PATHS.

---

## Parte 2 — Atualizar Toda a Documentação

### 2.1 `documentation/README.md`
- Versao 2.3 (2026-03-27)
- 33 Edge Functions (adicionar `init-mirror`)
- 198 migrations
- 45 tabelas (inclui mirror tables)
- Changelog v2.3: Admin Master, MasterOnlyRoute, PIN com blur, animacao soft-pulse, domain.ts dinamico, remocao aba Cliente

### 2.2 `documentation/ARQUITETURA.md`
- 33 Edge Functions (nao 32)
- 198 migrations (nao 187)
- Adicionar `init-mirror/` na listagem de pastas
- Adicionar `MasterOnlyRoute` na descricao de fluxo de auth

### 2.3 `documentation/AUTENTICACAO.md`
- Adicionar secao **Admin Master** explicando:
  - `masterAdminId` em `system_config`
  - `MasterOnlyRoute.tsx` protege `/principal`
  - Primeiro usuario auto-promovido a admin master
  - Admin master nao pode ter cargo removido
  - Admin normal so tem acesso ao `/admin` se tiver permissao `allowPrincipal`
- Adicionar role `suporte` na hierarquia
- PIN com efeito de blur nos digitos

### 2.4 `documentation/COMPONENTES.md`
- Adicionar `MasterOnlyRoute.tsx` na listagem de componentes Core
- Adicionar `SupportAdminSelector.tsx` se faltante
- Atualizar contagens

### 2.5 `documentation/EDGE_FUNCTIONS.md`
- Titulo: 33 Funcoes (nao 32)
- Adicionar `init-mirror` na secao Sistema com descricao: "Inicializa ambiente espelho (seeding config + health check)"

### 2.6 `documentation/BACKUP.md`
- Atualizar versao para 3.3
- Mencionar `MasterOnlyRoute.tsx` no SOURCE_PATHS
- Atualizar contagem para 33 edge functions e 198 migrations

### 2.7 `DOCUMENTACAO_MIGRACAO.md` (raiz)
- Atualizar para v2.3
- 33 Edge Functions, 198 migrations, 45 tabelas
- Adicionar Admin Master na secao de principais mudancas

### 2.8 `documentation/MIGRACAO.md`
- Atualizar contagens: 33 edge functions, 45 tabelas, ~38 funcoes SQL

---

## Arquivos Alterados (9 arquivos)
1. `src/components/BackupSection.tsx` — adicionar 1 path
2. `documentation/README.md` — v2.3 + contagens
3. `documentation/ARQUITETURA.md` — contagens + init-mirror
4. `documentation/AUTENTICACAO.md` — Admin Master + PIN blur
5. `documentation/COMPONENTES.md` — MasterOnlyRoute
6. `documentation/EDGE_FUNCTIONS.md` — 33 funcoes + init-mirror
7. `documentation/BACKUP.md` — contagens atualizadas
8. `documentation/MIGRACAO.md` — contagens
9. `DOCUMENTACAO_MIGRACAO.md` — v2.3 + Admin Master

