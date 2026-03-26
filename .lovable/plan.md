

# Evitar que sync-mirror.yml rode no repo espelho

## Problema
Quando o `recargas-brasil-v2` espelha para `sync-start-magic`, o arquivo `sync-mirror.yml` é copiado junto. O GitHub Actions do `sync-start-magic` tenta executar esse workflow, causando erros e emails de falha.

## Solução
Adicionar uma condição `if` no job para que o workflow **só execute no repo de origem**. O arquivo continuará existindo no espelho, mas nunca será executado lá.

## Alteração

**`.github/workflows/sync-mirror.yml`** — adicionar condição no job:

```yaml
jobs:
  mirror:
    runs-on: ubuntu-latest
    if: github.repository == 'segredounlock/recargas-brasil-v2'
    steps:
      ...
```

Com isso:
- ✅ No `recargas-brasil-v2` → workflow executa normalmente
- ✅ No `sync-start-magic` → workflow é ignorado (skip), sem erro, sem email

