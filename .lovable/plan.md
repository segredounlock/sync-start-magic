

# Proteger o backend do espelho durante o sync

## Problema
O projeto **não tem `.gitignore`**. O arquivo `.env` (com credenciais deste backend) é commitado e enviado via `git push --force` para o espelho. Isso **sobrescreve** o `.env` do espelho, fazendo ele apontar para o backend errado.

O mesmo vale para `supabase/config.toml` que contém o `project_id` deste projeto.

## Solução

### 1. Criar `.gitignore`
Adicionar um `.gitignore` na raiz que ignore o `.env` para que ele não seja versionado e não sobrescreva o do espelho.

```
.env
node_modules/
```

### 2. Remover `.env` do tracking do Git
O workflow precisa remover o `.env` do commit antes de fazer o push, já que o Lovable auto-gera e commita o `.env`. Adicionar um step no workflow:

```yaml
- name: Remover arquivos específicos do ambiente
  run: |
    git rm --cached .env || true
    git commit -m "chore: remove env from mirror" --allow-empty
```

### 3. Alternativa mais segura (recomendada)
Em vez de alterar o tracking, o workflow pode **excluir** os arquivos sensíveis antes do push:

```yaml
- name: Preparar para mirror
  run: |
    rm -f .env
    rm -f supabase/config.toml
    git add -A
    git commit -m "chore: prepare mirror sync" --allow-empty

- name: Sync mirror
  env:
    GH_TOKEN: ${{ secrets.GH_TOKEN }}
  run: |
    git remote remove mirror_update || true
    git remote add mirror_update https://x-access-token:${GH_TOKEN}@github.com/segredounlock/sync-start-magic.git
    git push mirror_update HEAD:main --force
```

Isso garante que:
- ✅ O `.env` do espelho **não é sobrescrito** (ele mantém suas próprias credenciais do Lovable Cloud)
- ✅ O `supabase/config.toml` do espelho **não é sobrescrito** (mantém seu próprio `project_id`)
- ✅ Todo o código-fonte é sincronizado normalmente

### Arquivo alterado
- `.github/workflows/sync-mirror.yml` — adicionar step para remover `.env` e `config.toml` antes do push

