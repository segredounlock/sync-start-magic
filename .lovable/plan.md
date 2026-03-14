

# Corrigir domínio na Edge Function `og-store`

## Problema
A Edge Function `og-store` usa o domínio `recargas-brasil-v2.lovable.app` para o redirect e meta tags `og:url`, mas o domínio correto é `recargasbrasill.com`.

## Correção

**Arquivo:** `supabase/functions/og-store/index.ts`

Alterar a linha do `spaUrl` de:
```typescript
const spaUrl = `https://recargas-brasil-v2.lovable.app/loja/${slug}`;
```
Para:
```typescript
const spaUrl = `https://recargasbrasill.com/loja/${slug}`;
```

Isso corrige tanto o redirect (`meta http-equiv="refresh"`) quanto as meta tags `og:url` para usar o domínio correto.

