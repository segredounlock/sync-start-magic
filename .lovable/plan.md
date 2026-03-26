

# Sistema Avançado de Sincronização com Mirrors

## Visão Geral
Substituir o sync "enviar tudo sempre" por um sistema inteligente baseado em hashes, estado por espelho e reconciliação automática. O sistema já possui hashes SHA-256 via Vite plugin (`sourceHashPlugin`) — vamos aproveitá-los.

## Arquitetura

```text
┌─────────────────┐        ┌──────────────────────┐
│  Origem (este)   │        │  DB: mirror_sync_log │
│                  │───────▶│  - mirror_id         │
│  sourceHashes    │        │  - file_path         │
│  (build-time)    │        │  - source_hash       │
│                  │        │  - mirror_hash       │
│                  │        │  - status (synced/    │
│                  │        │    pending/conflict)  │
│                  │        │  - last_synced_at     │
└─────────────────┘        └──────────────────────┘
                                     │
                            ┌────────▼─────────┐
                            │  Reconciliation   │
                            │  Engine (edge fn) │
                            │  - diff hashes    │
                            │  - skip protected │
                            │  - detect conflicts│
                            │  - sync pending   │
                            └──────────────────┘
```

## Alterações

### 1. Nova tabela `mirror_sync_state`
Armazena o estado de cada espelho independentemente.

```sql
CREATE TABLE mirror_sync_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mirror_id text NOT NULL,           -- ex: "sync-start-magic"
  mirror_repo text NOT NULL,         -- ex: "segredounlock/sync-start-magic"
  source_repo text NOT NULL,
  last_synced_commit text,
  last_sync_at timestamptz,
  total_files integer DEFAULT 0,
  synced_files integer DEFAULT 0,
  pending_files integer DEFAULT 0,
  conflict_files integer DEFAULT 0,
  protected_paths jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mirror_id)
);

CREATE TABLE mirror_file_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mirror_id text NOT NULL,
  file_path text NOT NULL,
  source_hash text,
  mirror_hash text,
  status text NOT NULL DEFAULT 'pending',  -- synced | pending | conflict | protected
  action text,                              -- create | update | delete | skip
  last_synced_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mirror_id, file_path)
);

CREATE TABLE mirror_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mirror_id text NOT NULL,
  sync_type text NOT NULL DEFAULT 'incremental', -- full | incremental
  files_sent integer DEFAULT 0,
  files_skipped integer DEFAULT 0,
  files_failed integer DEFAULT 0,
  conflicts_detected integer DEFAULT 0,
  duration_ms integer,
  error_message text,
  details jsonb DEFAULT '[]',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);
```

RLS: apenas admins (ALL com `has_role(auth.uid(), 'admin')`).

### 2. Edge Function `github-sync` — Novas actions

Adicionar 3 novas actions à edge function existente:

**`?action=reconcile&mirror_id=X`** (POST)
- Recebe `{ source_hashes, protected_paths }` no body
- Para cada arquivo no espelho (via GitHub API tree), calcula hash do conteúdo
- Compara source_hash vs mirror_hash
- Atualiza `mirror_file_state` com status correto
- Retorna resumo: `{ new: N, modified: N, conflict: N, synced: N, protected: N }`

**`?action=smart-sync&mirror_id=X`** (POST)
- Lê `mirror_file_state` WHERE status IN ('pending')
- Envia apenas os arquivos pendentes (incremental)
- Após envio bem-sucedido, atualiza status para 'synced' e mirror_hash
- Registra em `mirror_sync_logs`
- Retry automático (até 3x por arquivo)

**`?action=mirror-status&mirror_id=X`** (GET)
- Retorna estado completo do espelho: total, synced, pending, conflicts
- Lista de conflitos com hashes de ambos os lados

### 3. Caminhos protegidos (nunca sincronizar)

Lista default gravada em `mirror_sync_state.protected_paths`:
```json
[".env", "supabase/config.toml", ".github/workflows/"]
```
O motor de reconciliação marca esses como `status: 'protected'` e nunca os envia.

### 4. UI em `BackupSection.tsx`

Substituir/expandir a seção "Diagnóstico do Mirror" com painel completo:

- **Dashboard do Mirror**: cards com total/synced/pending/conflicts
- **Lista de pendências**: tabela com arquivo, ação (create/update), hash diff
- **Lista de conflitos**: com opção de "Forçar sync" ou "Ignorar"
- **Botão "Analisar Diferenças"**: chama reconcile, mostra resultado
- **Botão "Sincronizar Pendentes"**: chama smart-sync (apenas o que falta)
- **Histórico de syncs**: últimas 10 sincronizações com duração e resultado
- **Gerenciar caminhos protegidos**: adicionar/remover paths protegidos

### 5. Fluxo completo

1. Admin clica "Analisar Diferenças"
2. Frontend envia `source_hashes` (do Vite plugin, já disponível via `getFileHashes()`) + `protected_paths`
3. Edge function compara com conteúdo atual no GitHub do espelho
4. Resultado mostra: 15 synced, 3 pending, 1 conflict, 4 protected
5. Admin clica "Sincronizar Pendentes" → envia apenas os 3 arquivos
6. Conflitos ficam listados para resolução manual

### Arquivos alterados/criados
1. **Migration SQL** — 3 novas tabelas + RLS
2. **`supabase/functions/github-sync/index.ts`** — 3 novas actions (reconcile, smart-sync, mirror-status)
3. **`src/components/BackupSection.tsx`** — painel avançado de mirrors

### Resultado
- Sincronização incremental (envia só o que mudou)
- Cada espelho com controle próprio no banco de dados
- Zero sobrescrita de paths protegidos (.env, config.toml, workflows)
- Detecção de conflitos com resolução manual
- Auditoria completa com histórico de syncs
- Escalável para múltiplos espelhos

