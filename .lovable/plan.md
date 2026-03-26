

# Atualizar workflow para suportar múltiplos mirrors

## O que mudar

### 1. Renomear secret
- Usar `SYNC_UPDATERECARGASBRASIL` em vez de `SYNC_TOKEN` para organização

### 2. Atualizar `.github/workflows/sync-mirror.yml`
- Trocar referência de `secrets.SYNC_TOKEN` para `secrets.SYNC_UPDATERECARGASBRASIL`
- Estruturar para facilitar adição de novos mirrors no futuro

### Arquivo final

```yaml
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
          git remote add mirror_update https://x-access-token:${{ secrets.SYNC_UPDATERECARGASBRASIL }}@github.com/segredounlock/UPDATERECARGASBRASIL.git
          git push mirror_update main --force
```

### Para adicionar novos clientes no futuro
1. Criar PAT com acesso ao repo do cliente
2. Adicionar secret `SYNC_NOMECLIENTE` no repo `recargas-brasil-v2`
3. Adicionar novo step no workflow com o remote correspondente

