

# Ajustar workflow de sync

## Problema
O workflow usa `secrets.SYNC_UPDATERECARGASBRASIL` mas o secret no GitHub pode estar salvo como `GH_TOKEN`. Além disso, o nome do repositório em maiúsculas pode causar problemas — GitHub URLs são case-sensitive.

## Alterações no `.github/workflows/sync-mirror.yml`

1. **Trocar o secret** de `SYNC_UPDATERECARGASBRASIL` para `GH_TOKEN`
2. **Converter o nome do repo para minúsculas** na URL: `updaterecargasbrasil` em vez de `UPDATERECARGASBRASIL`
3. **Atualizar timestamp** para forçar novo push

```yaml
# Sync test: 2026-03-26T3
name: Sync to Mirrors

on:
  push:
    branches: [main]

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Sync UPDATERECARGASBRASIL
        run: |
          git remote add mirror_update https://x-access-token:${{ secrets.GH_TOKEN }}@github.com/segredounlock/updaterecargasbrasil.git
          git push mirror_update main --force
```

## Importante
- Confirme que o secret no GitHub (Settings → Secrets → Actions) se chama exatamente **GH_TOKEN**
- Se o repositório foi criado como `UPDATERECARGASBRASIL` (maiúsculas), o GitHub geralmente aceita minúsculas na URL, mas o ideal é usar o nome exato como aparece no GitHub

