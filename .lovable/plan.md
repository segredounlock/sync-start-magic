

# Proteger Arquivos de Licenciamento do Sync para Espelhos

## Contexto
O sistema de licenciamento que vamos criar tem duas partes:
- **LicenseGate** (validação/bloqueio) — DEVE ir para os espelhos
- **LicenseManager** (painel de gestão) e **license-generate** (geração de licenças) — NÃO DEVEM ir para os espelhos, pois são exclusivos do servidor principal

## O que proteger

| Arquivo | Vai pro espelho? |
|---------|:---:|
| `src/components/LicenseGate.tsx` | SIM — bloqueia espelhos sem licença |
| `src/components/LicenseManager.tsx` | NAO — painel de gestão exclusivo seu |
| `supabase/functions/license-generate/index.ts` | NAO — só o principal gera licenças |
| `supabase/functions/license-validate/index.ts` | SIM — espelhos precisam chamar validação (mas chamam no SEU servidor, não no deles) |
| Tabela `licenses` (migration) | NAO precisa existir no espelho |

## Como bloquear

### 1. Atualizar o workflow do GitHub Actions
No `.github/workflows/sync-mirror.yml`, na etapa "Preparar para mirror", adicionar remoção dos arquivos exclusivos:

```yaml
- name: Preparar para mirror
  run: |
    git config user.name "sync-bot"
    git config user.email "sync@bot.com"
    rm -f .env
    rm -f supabase/config.toml
    # Remover arquivos exclusivos do servidor principal
    rm -rf src/components/LicenseManager.tsx
    rm -rf supabase/functions/license-generate/
    git add -A
    git commit -m "chore: prepare mirror sync (remove env-specific files)" --allow-empty
```

### 2. Atualizar protected_paths no github-sync (Edge Function)
O sistema de smart-sync já suporta `protected_paths`. Adicionar os caminhos do licenciamento à lista padrão:

```typescript
const protectedPaths: string[] = body.protected_paths || [
  ".env",
  "supabase/config.toml",
  ".github/workflows/",
  "src/components/LicenseManager.tsx",        // NOVO
  "supabase/functions/license-generate/",      // NOVO
];
```

### 3. Atualizar o MirrorSyncPanel
No painel de sincronização, garantir que os `protected_paths` enviados incluam os novos caminhos.

### 4. Implementar o sistema de licenciamento completo

**Migration SQL** — tabela `licenses` com RLS (só admin)

**Edge Functions:**
- `license-generate/index.ts` — gera JWT assinado, salva na tabela (exclusivo principal)
- `license-validate/index.ts` — valida licença (pública, chamada pelos espelhos no SEU servidor)

**Componentes:**
- `LicenseGate.tsx` — wrapper no AppRoot que bloqueia app sem licença válida; detecta servidor principal via `masterAdminId` e bypassa
- `LicenseManager.tsx` — painel CRUD de licenças no `/principal` (não vai pro espelho)

**Configuração:**
- Secret `LICENSE_SIGNING_SECRET` — chave HMAC para assinar licenças

**Integração:**
- `AppRoot.tsx` — envolver rotas com `LicenseGate`
- `Principal.tsx` — adicionar seção de Licenças

## Resultado
- O espelho recebe o `LicenseGate` (que bloqueia sem licença)
- O espelho NÃO recebe o `LicenseManager` nem o `license-generate` (não pode gerar licenças)
- O workflow do GitHub e o smart-sync garantem a proteção em ambos os métodos de sincronização

## Arquivos a criar/alterar
1. **Migration SQL** — tabela `licenses`
2. `supabase/functions/license-generate/index.ts` — nova (protegida)
3. `supabase/functions/license-validate/index.ts` — nova (pública)
4. `src/components/LicenseGate.tsx` — novo
5. `src/components/LicenseManager.tsx` — novo (protegido)
6. `src/AppRoot.tsx` — envolver com LicenseGate
7. `src/pages/Principal.tsx` — adicionar seção Licenças
8. `.github/workflows/sync-mirror.yml` — adicionar remoção dos arquivos exclusivos
9. `supabase/functions/github-sync/index.ts` — atualizar protected_paths padrão
10. **Secret** `LICENSE_SIGNING_SECRET`

