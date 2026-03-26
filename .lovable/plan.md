

# Forçar novo commit para testar sync

## Alteração
Adicionar um comentário de timestamp no `.github/workflows/sync-mirror.yml` para gerar um diff e disparar o GitHub Action.

## Arquivo: `.github/workflows/sync-mirror.yml`
Adicionar na linha 1: `# Sync test: 2026-03-26T4`

## Após publicar
Verificar em **github.com/segredounlock/recargas-brasil-v2/actions** se o job passou ✅

