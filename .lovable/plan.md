

# Restaurar sync-mirror.yml no projeto

## Problema
O arquivo `.github/workflows/sync-mirror.yml` foi deletado do Lovable, e como existe sync bidirecional, ele também foi removido do repo `recargas-brasil-v2` no GitHub — quebrando o espelhamento automático para `sync-start-magic`.

## Solução
Recriar o arquivo `.github/workflows/sync-mirror.yml` com a configuração correta que já estava funcionando.

## Arquivo a criar

**`.github/workflows/sync-mirror.yml`**

```yaml
name: Sync to Mirrors

on:
  workflow_dispatch:
  push:
    branches:
      - main

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Configurar git
        run: |
          git config user.name "sync-bot"
          git config user.email "sync@bot.com"

      - name: Sync mirror
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
        run: |
          git remote remove mirror_update || true
          git remote add mirror_update https://x-access-token:${GH_TOKEN}@github.com/segredounlock/sync-start-magic.git
          git push mirror_update HEAD:main --force
```

## Resultado
- O workflow volta a existir no repo de origem (`recargas-brasil-v2`)
- Cada push no `main` dispara o espelhamento automático para `sync-start-magic`
- O `workflow_dispatch` permite trigger manual pelo painel

