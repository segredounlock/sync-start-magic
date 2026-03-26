

# Testar sync com novo token

## Alteração
Atualizar o comentário de timestamp no workflow para forçar um novo commit/push.

## Arquivo
`.github/workflows/sync-mirror.yml` — mudar o comentário de `# Sync test: 2026-03-26` para `# Sync test: 2026-03-26T2` para gerar um diff.

## Após publicar
Verificar em `github.com/segredounlock/recargas-brasil-v2/actions` se o job passou ✅

