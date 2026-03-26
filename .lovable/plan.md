

# Corrigir workflow sync-mirror.yml para usar GH_TOKEN corretamente

## Problema
O GitHub Actions está usando `github-actions[bot]` em vez do seu token pessoal. O formato `x-access-token:${{ secrets.GH_TOKEN }}` não está funcionando — precisa usar `https://$GH_TOKEN@github.com/...` diretamente.

## Alteração

**Arquivo: `.github/workflows/sync-mirror.yml`**

Alterar o step "Sync mirror" para:
1. Passar `GH_TOKEN` como variável de ambiente via `env:`
2. Usar `https://$GH_TOKEN@github.com/...` no remote (sem `x-access-token:`)

```yaml
- name: Sync mirror
  env:
    GH_TOKEN: ${{ secrets.GH_TOKEN }}
  run: |
    git remote remove mirror_update || true
    git remote add mirror_update https://$GH_TOKEN@github.com/segredounlock/sync-start-magic.git
    git push mirror_update HEAD:main --force
```

Também atualizar o timestamp na linha 1 para forçar um novo commit e disparar o workflow.

