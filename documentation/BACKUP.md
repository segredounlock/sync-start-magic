# 📦 Sistema de Backup

## Visão Geral

O sistema de backup cobre 3 áreas:
1. **Banco de dados** — Todas as 42 tabelas
2. **Código fonte** — Todos os 172+ arquivos do projeto
3. **GitHub Sync** — Sincronização com repositório GitHub

## Backup de Dados (Export)

### Edge Function: `backup-export`
- Exporta todas as tabelas em formato ZIP
- Cada tabela gera um arquivo JSON dentro de `database/`
- Inclui `backup-info.json` com metadados
- Descoberta dinâmica de tabelas via `get_public_tables()`
- Paginação automática para tabelas grandes (>1000 rows)

### Estrutura do ZIP
```
backup-YYYY-MM-DD.zip
├── backup-info.json        # Metadados (data, autor, versão)
├── database/
│   ├── profiles.json
│   ├── user_roles.json
│   ├── saldos.json
│   ├── operadoras.json
│   ├── recargas.json
│   ├── ... (42 tabelas)
│   └── update_history.json
└── source/                 # Código fonte (opcional)
    ├── src/
    ├── supabase/
    └── ...
```

## Restauração (Restore)

### Edge Function: `backup-restore`
- Recebe ZIP do backup
- Restaura tabelas na ordem correta de dependência
- Valida foreign keys (filtra registros órfãos)
- Upsert com tratamento de conflitos
- Restauração em lotes de 100

### Ordem de Restauração
1. `operadoras`, `system_config`, `bot_settings` (sem FK)
2. `profiles` (filtra por auth.users existentes)
3. `user_roles`, `saldos` (dependem de profiles)
4. `pricing_rules`, `reseller_*` (dependem de operadoras/profiles)
5. `recargas`, `transactions` (dependem de profiles)
6. `chat_*`, `support_*` (dependem de profiles)
7. Demais tabelas

## Backup de Código Fonte

### Coleta de Arquivos
O `BackupSection.tsx` mantém lista explícita de todos os arquivos (`SOURCE_PATHS`) e também usa `sourceManifest.ts` para descoberta dinâmica via Vite plugin.

### Categorias Cobertas
- Páginas (16 arquivos)
- Componentes (~60 arquivos)
- Hooks (18 arquivos)
- Libs (14 arquivos)
- Types e integrations
- Edge Functions (29 funções)
- Email templates (6 templates)
- Configs raiz (vite, tailwind, tsconfig, etc.)
- Documentação

### Hash de Integridade
O `sourceHashPlugin` no `vite.config.ts` calcula SHA-256 de cada arquivo fonte, permitindo verificar integridade no backup.

## GitHub Sync

### Edge Function: `github-sync`
- Lista repositórios do usuário (via GitHub PAT)
- Envia arquivos em lotes de 5 para o repositório
- Cria ou atualiza arquivos via GitHub Contents API

### Configuração
1. Salvar GitHub PAT em `system_config` (key: `githubPat`)
2. Selecionar repositório
3. Clicar em "Sincronizar"

### Limitação
⚠️ Coleta de arquivos via `fetch()` do browser — funciona apenas no ambiente de desenvolvimento (Vite dev server serve .tsx/.ts). Não funciona em produção.

## Manutenção

> **REGRA:** Sempre que uma nova tabela, componente, hook ou edge function for criada, atualizar:
> 1. `supabase/functions/backup-export/index.ts` — fallback de tabelas
> 2. `supabase/functions/backup-restore/index.ts` — knownOrder
> 3. `src/components/BackupSection.tsx` — SOURCE_PATHS
