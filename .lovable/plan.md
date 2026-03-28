

# Atualização Completa do Sistema de Backup, Sincronização e Documentação

## Problema Identificado

O sistema de backup e a documentação estão desatualizados. Faltam tabelas, componentes, edge functions e arquivos recentes que foram adicionados ao projeto.

## O que está faltando

### 1. Tabelas ausentes nos fallbacks de backup
- `licenses` e `license_logs` — não estão em `candidateTables` (export) nem em `knownOrder` (restore)

### 2. Arquivos ausentes no SOURCE_PATHS (BackupSection.tsx)
- `src/components/InstallWizard.tsx`
- `src/components/LicenseGate.tsx`
- `src/components/LicenseManager.tsx`
- `supabase/functions/license-generate/index.ts`
- `supabase/functions/license-validate/index.ts`
- `supabase/functions/license-check-server/index.ts`

### 3. Documentação desatualizada
- `documentation/EDGE_FUNCTIONS.md` — diz "33 Funções", são 36
- `documentation/COMPONENTES.md` — falta InstallWizard, LicenseGate, LicenseManager
- `documentation/BACKUP.md` — diz "45 tabelas", falta licenses/license_logs (47 tabelas)
- `DOCUMENTACAO_MIGRACAO.md` — contagens desatualizadas

---

## Plano de Implementação

### Arquivo 1: `supabase/functions/backup-export/index.ts`
- Adicionar `licenses` e `license_logs` ao array `candidateTables`

### Arquivo 2: `supabase/functions/backup-restore/index.ts`
- Adicionar `licenses` e `license_logs` ao array `knownOrder` (antes de `mirror_*`)
- Adicionar `license_logs` ao `profileFkTables` se necessário (não tem FK para profiles, então não precisa)

### Arquivo 3: `src/components/BackupSection.tsx`
- Adicionar ao SOURCE_PATHS:
  - `src/components/InstallWizard.tsx`
  - `src/components/LicenseGate.tsx`
  - `src/components/LicenseManager.tsx`
  - `supabase/functions/license-generate/index.ts`
  - `supabase/functions/license-validate/index.ts`
  - `supabase/functions/license-check-server/index.ts`

### Arquivo 4: `documentation/EDGE_FUNCTIONS.md`
- Atualizar título para "36 Funções"
- Adicionar seção "Funções de Licenciamento" com:
  - `license-generate` — Gerar licença para espelho
  - `license-validate` — Validar licença (chamada pelo espelho)
  - `license-check-server` — Verificação server-side de licença

### Arquivo 5: `documentation/COMPONENTES.md`
- Adicionar na seção "Segurança":
  - `InstallWizard.tsx` — Assistente de instalação para espelhos
  - `LicenseGate.tsx` — Gate de validação de licença
  - `LicenseManager.tsx` — Gerenciador de licenças (admin master)

### Arquivo 6: `documentation/BACKUP.md`
- Atualizar contagens: 47 tabelas, 36 Edge Functions, 209+ migrations
- Adicionar `licenses` e `license_logs` à lista de tabelas
- Atualizar versão do backup para 3.5

### Arquivo 7: `DOCUMENTACAO_MIGRACAO.md`
- Atualizar contagens gerais (47 tabelas, 36 edge functions, 209+ migrations)
- Versão 2.6 com changelog das atualizações de backup

### Detalhes Técnicos
- Nenhuma migration SQL necessária
- Nenhuma alteração de RLS
- Apenas atualização de listas estáticas e documentação
- O `get_public_tables()` RPC já descobre tabelas dinamicamente, mas os fallbacks precisam estar completos

