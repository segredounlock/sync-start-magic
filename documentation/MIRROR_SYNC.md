# 🔄 Sistema de Espelhamento (Mirror Sync)

> **Última atualização:** 2026-03-26

## Visão Geral

O sistema mantém uma cópia espelhada do código-fonte em um repositório separado via GitHub Actions. O espelho possui seu **próprio backend** (Lovable Cloud independente) e **não compartilha** credenciais com o projeto de origem.

```
┌──────────────┐     push main     ┌──────────────────┐
│   Lovable    │ ───────────────►  │  GitHub Actions   │
│  (Origem)    │                   │  sync-mirror.yml  │
└──────────────┘                   └────────┬─────────┘
                                            │
                                   Remove .env e config.toml
                                            │
                                   ┌────────▼─────────┐
                                   │  Repo Espelho     │
                                   │ (sync-start-magic)│
                                   │  Backend próprio  │
                                   └──────────────────┘
```

## Como Funciona

### Workflow: `.github/workflows/sync-mirror.yml`

```yaml
name: Sync to Mirrors

on:
  workflow_dispatch:        # Trigger manual
  push:
    branches: [main]        # Trigger automático a cada push

jobs:
  mirror:
    runs-on: ubuntu-latest
    if: github.repository == 'segredounlock/recargas-brasil-v2'  # ← SÓ executa na origem
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false

      - name: Preparar para mirror
        run: |
          git config user.name "sync-bot"
          git config user.email "sync@bot.com"
          rm -f .env                      # ← Remove credenciais do backend de origem
          rm -f supabase/config.toml      # ← Remove project_id de origem
          git add -A
          git commit -m "chore: prepare mirror sync (remove env-specific files)" --allow-empty

      - name: Sync mirror
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
        run: |
          git remote remove mirror_update || true
          git remote add mirror_update https://x-access-token:${GH_TOKEN}@github.com/segredounlock/sync-start-magic.git
          git push mirror_update HEAD:main --force
```

### Fluxo Detalhado

1. **Lovable push** → Código é commitado no repo `recargas-brasil-v2` no GitHub
2. **GitHub Actions dispara** → Workflow `sync-mirror.yml` inicia
3. **Condição `if`** → Verifica que está no repo de origem (evita execução no espelho)
4. **Preparação** → Remove `.env` e `supabase/config.toml` do commit
5. **Force push** → Envia código limpo para `sync-start-magic`
6. **Lovable do espelho** → Detecta push e sincroniza automaticamente

## O que é Sincronizado vs Protegido

### ✅ Sincronizado (código)
- `src/` — Todo o código-fonte React/TypeScript
- `supabase/functions/` — Todas as 32 Edge Functions
- `supabase/migrations/` — Todas as migrações SQL
- `public/` — Assets públicos
- `documentation/` — Documentação completa
- `.github/workflows/` — Workflows (mas não executam no espelho)
- Configs: `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, etc.

### 🔒 Protegido (removido antes do push)
- `.env` — Credenciais do backend (VITE_SUPABASE_URL, etc.)
- `supabase/config.toml` — project_id do Supabase

### 🔄 Auto-gerado em cada ambiente
- `src/integrations/supabase/types.ts` — Gerado pelo Lovable Cloud baseado no schema
- `src/integrations/supabase/client.ts` — Gerado automaticamente

> **Nota:** O `types.ts` sincronizado é seguro pois ambos os ambientes têm o mesmo schema (mesmas migrations). Cada Lovable Cloud regenera automaticamente quando detecta mudanças.

## Requisitos

### No GitHub do repo de origem (`recargas-brasil-v2`)

| Requisito | Descrição |
|-----------|-----------|
| Secret `GH_TOKEN` | Personal Access Token com escopos `repo` e `workflow` |
| Permissão no espelho | O token deve ter acesso de escrita ao repo `sync-start-magic` |

### No projeto espelho (`sync-start-magic`)

| Requisito | Descrição |
|-----------|-----------|
| Lovable Cloud próprio | Backend independente com suas próprias credenciais |
| `.env` próprio | Gerado automaticamente pelo Lovable Cloud do espelho |
| `supabase/config.toml` próprio | Gerado com o project_id do espelho |
| Migrations aplicadas | As migrations SQL são sincronizadas e aplicadas automaticamente |

## Segurança

### Por que remover `.env`?
O `.env` contém `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_SUPABASE_PROJECT_ID`. Se fosse copiado, o espelho apontaria para o backend **errado** (o da origem).

### Por que remover `config.toml`?
O `config.toml` contém o `project_id` do Supabase. Se fosse copiado, conflitaria com o projeto do espelho.

### Por que `persist-credentials: false`?
Evita que o checkout use credenciais do GITHUB_TOKEN padrão ao invés do `GH_TOKEN` customizado que tem permissão no repo espelho.

### Por que `if: github.repository`?
O workflow é copiado para o espelho junto com o código. Sem essa condição, o GitHub Actions do espelho tentaria executar o workflow, causando:
- ❌ Erros de permissão (o espelho não tem `GH_TOKEN`)
- ❌ Emails de falha do GitHub
- ❌ Potencial loop de sincronização

## Secrets do Backend

Cada projeto Lovable Cloud provisiona automaticamente:

| Secret | Origem | Espelho |
|--------|--------|---------|
| `SUPABASE_URL` | ✅ Auto | ✅ Auto |
| `SUPABASE_ANON_KEY` | ✅ Auto | ✅ Auto |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Auto | ✅ Auto |
| `SUPABASE_DB_URL` | ✅ Auto | ✅ Auto |
| `SUPABASE_PUBLISHABLE_KEY` | ✅ Auto | ✅ Auto |
| `LOVABLE_API_KEY` | ✅ Auto | ✅ Auto |

Cada ambiente tem seus **próprios valores** — não são compartilhados.

## Configuração Manual no Espelho

Após o primeiro sync, o espelho precisa de configurações adicionais no banco:

1. **Realtime** — Habilitar nas tabelas: `chat_conversations`, `chat_messages`, `chat_reactions`
2. **Storage** — Criar os 8 buckets (avatars, store-logos, broadcast-images, chat-audio, chat-images, receipts, email-assets, login-selfies)
3. **Dados iniciais** — Inserir configs em `system_config` (gateway de pagamento, etc.)
4. **Primeiro admin** — Criar usuário e atribuir role `admin` em `user_roles`

## Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| Espelho aponta para backend errado | `.env` foi copiado | Verificar que o workflow remove `.env` antes do push |
| Workflow falha no espelho | Falta condição `if` | Adicionar `if: github.repository == 'segredounlock/recargas-brasil-v2'` |
| Emails de erro do GitHub | Workflow executou no espelho | Verificar condição `if` no job |
| Types desatualizados no espelho | Schema divergiu | Aplicar migrations pendentes no espelho |
| Edge Functions não funcionam | Secrets não configurados | Verificar que o Lovable Cloud do espelho está ativo |
