

# Diagnóstico: Sync via GitHub Actions (repo → repo) não funciona

## O que está acontecendo

Você tem **duas** formas de sync:

1. **Sync manual (BackupSection)** — Edge function `github-sync` envia arquivos diretamente via API do GitHub → **funciona** ✅
2. **Sync automático (GitHub Actions)** — Workflow `sync-mirror.yml` no repo do Lovable faz `git push` para `sync-start-magic` → **não funciona** ❌

## Por que o workflow não funciona

O workflow `sync-mirror.yml` existe no código do Lovable, mas ele **roda no GitHub Actions do repositório conectado ao Lovable** (provavelmente `segredounlock/recargas-brasil-v2`).

Para funcionar, o secret **`GH_TOKEN`** precisa estar configurado **no repositório de origem** (onde o workflow roda), não no destino.

### Checklist de verificação

| Item | Onde verificar |
|------|---------------|
| `GH_TOKEN` configurado? | GitHub → `recargas-brasil-v2` → Settings → Secrets → Actions |
| Token tem permissão no repo destino? | O token precisa ter acesso a `sync-start-magic` (escopo `repo`) |
| Workflow está sendo disparado? | GitHub → `recargas-brasil-v2` → Actions → ver se há runs |

## Problema provável

O `GH_TOKEN` que você configurou recentemente foi salvo na **system_config do banco** (para a edge function usar), mas **não no GitHub Secrets** do repositório `recargas-brasil-v2`. São lugares diferentes:

- **system_config** → usado pela edge function `github-sync` (sync manual) ✅
- **GitHub Secrets** → usado pelo GitHub Actions workflow ❌ ← provavelmente falta aqui

## Solução

### Passo 1 — Verificar GitHub Secrets
1. Ir em `github.com/segredounlock/recargas-brasil-v2/settings/secrets/actions`
2. Verificar se existe o secret **`GH_TOKEN`**
3. Se não existir, criar com o mesmo token que você gerou

### Passo 2 — Verificar se o workflow roda
1. Ir em `github.com/segredounlock/recargas-brasil-v2/actions`
2. Ver se há execuções do workflow "Sync to Mirrors"
3. Se houver falhas, olhar o log de erro

### Passo 3 — Adicionar painel de diagnóstico (implementação)
Para facilitar a depuração, adicionar no painel GitHub Actions do BackupSection:
- Mostrar o **repo de origem** (o conectado ao Lovable) e o **repo destino** (mirror)
- Botão para verificar se o workflow existe no repo de origem
- Exibir status da última execução com link direto pro log

### Arquivos a alterar
- **`src/components/BackupSection.tsx`** — adicionar info sobre repo de origem vs destino no painel de Actions

