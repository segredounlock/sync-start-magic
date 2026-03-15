

# Plano: Backup Completo para Migração

## Objetivo
Aprimorar o sistema de backup para incluir **tudo** necessário para recriar o projeto em outra plataforma — SQL migrations, funções do banco, RLS policies, documentação e config — além dos dados e código-fonte que já são exportados.

## O que será adicionado ao ZIP de backup

O backup atual já exporta:
- `database/` — dados de todas as tabelas
- `source/` — código-fonte (componentes, hooks, pages, edge functions)
- `backup-info.json` — metadados

**Novas pastas/arquivos no ZIP:**

1. **`migrations/`** — Todos os ~120 arquivos SQL de migrations (ordem cronológica)
2. **`documentation/DOCUMENTACAO_MIGRACAO.md`** — Documentação completa de migração
3. **`documentation/ALTERACOES.md`** — Histórico de alterações
4. **`documentation/README.md`** — README do projeto
5. **`schema/functions.sql`** — Dump de todas as funções do banco (via RPC `get_public_tables` + queries)
6. **`schema/rls-policies.json`** — Exportação das RLS policies ativas
7. **`config/supabase-config.toml`** — Config do Supabase (verify_jwt, etc.)
8. **`config/env-template.env`** — Template das variáveis de ambiente necessárias
9. **`config/secrets-list.json`** — Lista dos secrets necessários (sem valores)

## Alterações Técnicas

### 1. Edge Function `backup-export/index.ts`
- Adicionar exportação das SQL migrations (ler arquivos do ZIP source ou listar via RPC)
- Exportar funções do banco via query `pg_proc` ou `information_schema.routines`
- Exportar RLS policies via query `pg_policies`
- Incluir documentação e configs no ZIP

### 2. `BackupSection.tsx`
- Adicionar checkbox "Incluir schema completo (migrations, RLS, funções)" 
- Adicionar os arquivos de documentação (`DOCUMENTACAO_MIGRACAO.md`, `ALTERACOES.md`, `README.md`) na coleta de source
- Mostrar no progresso as etapas adicionais

### 3. Nova RPC `export_schema_info` (migration SQL)
- Função que retorna: funções do banco, RLS policies, triggers, tipos enum
- Usada pelo edge function para gerar o dump do schema

## Fluxo de Migração com o Backup

```text
1. Admin exporta backup completo (novo)
2. Sincroniza código com GitHub  
3. Na nova plataforma:
   a. Importa repo do GitHub (código pronto)
   b. Abre ZIP → executa migrations/ em ordem
   c. Restaura dados via database/
   d. Configura secrets conforme config/secrets-list.json
   e. Segue checklist do DOCUMENTACAO_MIGRACAO.md
```

## Resumo das mudanças
- 1 nova migration SQL (criar RPC `export_schema_info`)
- 1 edge function editada (`backup-export`)
- 1 componente editado (`BackupSection.tsx`)
- Documentação e migrations incluídos automaticamente no ZIP

