

# Sync automático entre dois repositórios GitHub

## Objetivo
Criar um GitHub Action no repo `segredounlock/recargas-brasil-v2` que, a cada push na branch `main`, espelha automaticamente para `segredounlock/UPDATERECARGASBRASIL`.

## O que fazer

### 1. Criar Personal Access Token (PAT)
- Ir em GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
- Criar token com permissão **Contents (Read & Write)** para o repo `UPDATERECARGASBRASIL`
- Copiar o token gerado

### 2. Adicionar o token como Secret no repo principal
- Ir em `segredounlock/recargas-brasil-v2` → Settings → Secrets and variables → Actions
- Criar secret chamado `SYNC_TOKEN` com o valor do PAT

### 3. Criar o workflow no repo principal
Criar o arquivo `.github/workflows/sync-mirror.yml` no repo `recargas-brasil-v2`:

```yaml
name: Sync to UPDATERECARGASBRASIL

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

      - name: Push to mirror
        run: |
          git remote add mirror https://x-access-token:${{ secrets.SYNC_TOKEN }}@github.com/segredounlock/UPDATERECARGASBRASIL.git
          git push mirror main --force
```

## Fluxo resultante

```text
Lovable (este projeto)
   ↓ push automático
recargas-brasil-v2 (GitHub)
   ↓ GitHub Action automático
UPDATERECARGASBRASIL (GitHub)
   ↓ pull automático
Outro projeto Lovable conectado a UPDATERECARGASBRASIL
```

## Observações
- A sincronização é **unidirecional**: deste projeto → outro projeto
- Usa `--force` para garantir que o mirror fique idêntico
- O código, edge functions e migrations são sincronizados
- Banco de dados, secrets e storage de cada projeto permanecem **independentes**
- Este workflow precisa ser criado **diretamente no GitHub**, não pelo Lovable

## Passos do usuário
1. Criar o PAT no GitHub
2. Adicionar como secret `SYNC_TOKEN` no repo `recargas-brasil-v2`
3. Criar o arquivo `.github/workflows/sync-mirror.yml` com o conteúdo acima
4. Conectar o outro projeto Lovable ao repo `UPDATERECARGASBRASIL`
5. Pronto — cada alteração aqui será espelhada automaticamente

