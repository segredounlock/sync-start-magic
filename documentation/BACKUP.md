# 📦 Sistema de Backup

## Visão Geral

O sistema de backup (v3.5) cobre 4 áreas:
1. **Banco de dados** — Todas as 47 tabelas do schema `public`
2. **Autenticação** — Todos os usuários de `auth.users` com senhas criptografadas
3. **Código fonte** — Todos os 210+ arquivos do projeto
4. **GitHub Sync** — Sincronização com repositório GitHub

## Backup de Dados (Export)

### Edge Function: `backup-export`
- Exporta todas as tabelas em formato ZIP
- Cada tabela gera um arquivo JSON dentro de `database/`
- Exporta `auth.users` via SQL direto (inclui `encrypted_password`)
- Inclui `backup-info.json` com metadados
- Descoberta dinâmica de tabelas via `get_public_tables()`
- Paginação automática para tabelas grandes (>1000 rows)
- Opção de exportar schema (funções, RLS, triggers, enums)

### Exportação de Auth Users

O sistema usa **SQL direto** via `SUPABASE_DB_URL` para acessar `auth.users`, capturando campos que a Admin API não retorna:

| Campo | Admin API | SQL Direto |
|-------|:---------:|:----------:|
| id (UUID) | ✅ | ✅ |
| email | ✅ | ✅ |
| encrypted_password | ❌ | ✅ |
| email_confirmed_at | ✅ | ✅ |
| raw_user_meta_data | ✅ | ✅ |
| raw_app_meta_data | ❌ | ✅ |
| aud, role, instance_id | ❌ | ✅ |
| is_sso_user | ❌ | ✅ |

### Estrutura do ZIP
```
backup-YYYY-MM-DD.zip
├── backup-info.json        # Metadados (data, autor, versão, tabelas, contagem auth)
├── auth/
│   └── users.json          # Usuários com encrypted_password, UUID, metadados
├── database/
│   ├── profiles.json
│   ├── user_roles.json
│   ├── saldos.json
│   ├── operadoras.json
│   ├── recargas.json
│   ├── telegram_users.json
│   ├── telegram_sessions.json
│   ├── terms_acceptance.json
│   ├── mirror_sync_state.json
│   ├── mirror_file_state.json
│   ├── mirror_sync_logs.json
│   ├── licenses.json
│   ├── license_logs.json
│   ├── ... (47 tabelas)
│   └── update_history.json
├── schema/ (opcional)
│   ├── functions.sql       # Todas as funções SQL (~38 funções)
│   ├── rls-policies.json   # Políticas RLS
│   ├── triggers.json       # Triggers
│   ├── enums.json          # Enums customizados
│   └── full-schema.json    # Schema completo
├── config/ (opcional)
│   ├── env-template.env    # Template de variáveis
│   ├── secrets-list.json   # Lista de secrets necessárias
│   └── system-config.json  # Config do sistema (valores sensíveis redactados)
└── source/ (opcional)
    ├── src/
    ├── supabase/
    └── ...
```

### Flags de Export

| Flag | Default | Descrição |
|------|---------|-----------|
| `includeDatabase` | `true` | Exportar tabelas do schema public |
| `includeAuth` | `true` | Exportar auth.users via SQL direto |
| `includeSchema` | `false` | Exportar schema (funções, RLS, triggers, config) |

## Restauração (Restore)

### Edge Function: `backup-restore`

#### Restauração de Auth Users (SQL Direto)
1. Conecta ao PostgreSQL via `SUPABASE_DB_URL`
2. Lê `auth/users.json` do ZIP
3. Para cada usuário não existente:
   - INSERT direto em `auth.users` com UUID original + `encrypted_password`
   - INSERT em `auth.identities` para provider email
4. `ON CONFLICT (id) DO NOTHING` — não sobrescreve usuários existentes
5. Fallback para Admin API se `SUPABASE_DB_URL` não disponível

**Resultado:** Usuários migrados fazem login com a mesma senha, sem precisar resetar.

#### Restauração Segura (Safe Restore)
Modo `?mode=safe` para ambientes espelhos:
- Ignora `auth.users`, `system_config` e `bot_settings`
- Usa `INSERT ... ON CONFLICT DO NOTHING` para demais tabelas
- Preserva dados existentes no banco de destino

#### Restauração de Tabelas
- Restaura tabelas na ordem correta de dependência
- Valida foreign keys (filtra registros órfãos)
- Upsert com tratamento de conflitos
- Restauração em lotes de 100

### Ordem de Restauração
1. **Auth users** (via SQL direto — antes de tudo)
2. `operadoras`, `system_config`, `bot_settings` (sem FK)
3. `notifications`, `broadcast_progress`, `broadcast_messages`
4. `telegram_users`, `telegram_sessions`, `terms_acceptance`
5. `profiles` (filtra por auth.users existentes)
6. `user_roles`, `saldos` (dependem de profiles)
7. `pricing_rules`, `reseller_*` (dependem de operadoras/profiles)
8. `recargas`, `transactions` (dependem de profiles)
9. `chat_*`, `support_*` (dependem de profiles)
10. `mirror_*` (tabelas de espelhamento)
11. Demais tabelas

### Conflict Targets Especiais

| Tabela | Conflict Target |
|--------|----------------|
| `system_config` | `key` |
| `bot_settings` | `key` |
| `telegram_sessions` | `chat_id` |
| `saldos` | `user_id,tipo` |
| Demais tabelas | `id` |

## Backup de Código Fonte

### Coleta de Arquivos
O `BackupSection.tsx` mantém lista explícita de todos os arquivos (`SOURCE_PATHS`) e também usa `sourceManifest.ts` para descoberta dinâmica via Vite plugin.

### Categorias Cobertas
- Páginas (16+ arquivos)
- Componentes (~65 arquivos, inclui `MasterOnlyRoute.tsx`)
- Hooks (20 arquivos)
- Libs (15 arquivos)
- Types e integrations
- Edge Functions (33 funções)
- Email templates (6 templates)
- Configs raiz (vite, tailwind, tsconfig, etc.)
- Documentação (13 arquivos)

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
> 4. `documentation/` — atualizar docs relevantes

## Segurança

- Apenas admins podem exportar/importar backups (verificação de role)
- `encrypted_password` é hash bcrypt — não é reversível
- Valores sensíveis em `system_config` são redactados no export de schema
- ZIP deve ser protegido pois contém hashes de senha

## Mirror Sync como Backup de Código

O sistema de [espelhamento automático](./MIRROR_SYNC.md) via GitHub Actions mantém uma cópia atualizada do código-fonte no repositório espelho (`sync-start-magic`). Isso funciona como um **backup em tempo real** do código:

- ✅ Cada push no `main` é automaticamente espelhado (36 Edge Functions)
- ✅ O espelho tem seu próprio backend independente
- ✅ Código pode ser restaurado a partir do espelho se necessário
- ⚠️ Apenas código é espelhado — dados do banco e storage **não** são sincronizados
- ⚠️ **Migrations NÃO são aplicadas automaticamente** no espelho — verificar se o schema foi criado após o primeiro sync (ver [MIRROR_SYNC.md](./MIRROR_SYNC.md))

### Verificando Schema do Espelho

Use o `backup-export` no projeto espelho para verificar se o schema está correto:
- Se a exportação retornar 0 tabelas, o banco está vazio e as migrations precisam ser aplicadas
- Compare a contagem de tabelas (deve ser 47) com o projeto de origem
