

# Investigação: Falso Positivo do `sourceManifest.ts`

## O que descobri

O alerta de "1 arquivo faltando" na verificação de integridade é um **falso positivo causado por dessincronia entre duas listas**:

1. **`SOURCE_PATHS`** (hardcoded, ~120+ arquivos) — lista fixa no código de `BackupSection.tsx`
2. **`knownPaths`** (dinâmico) — gerado pelo `import.meta.glob` no build do Vite

### Como funciona a verificação
```text
effectivePaths (SOURCE_PATHS ou DB)
        ↓
Para cada arquivo em effectivePaths:
  → Está em knownPaths (glob)?
    SIM → found++
    NÃO → missing.push(arquivo)
```

### Causa raiz
O `import.meta.glob` captura apenas `src/**/*.{tsx,ts,css}` e `public/sw-push.js`. Porém `SOURCE_PATHS` inclui arquivos fora desse escopo como `tailwind.config.ts`, `vite.config.ts`, `package.json`, `README.md`, edge functions em `supabase/functions/`, etc.

Esses arquivos **existem no projeto** mas **não são capturados pelo glob**, então aparecem como "faltando" — um falso positivo.

O `sourceManifest.ts` em si provavelmente está OK (está dentro de `src/`). O arquivo faltando real pode ser outro que foi adicionado recentemente ao projeto mas não à lista `SOURCE_PATHS`, ou vice-versa.

## Correção proposta

### 1. Separar verificação por escopo
No `runIntegrityCheck`, já existe separação entre `verifiablePaths` (src/ e public/) e `externalPaths`. Mas os `externalPaths` não são contados como "encontrados" — eles são simplesmente ignorados. O problema é que arquivos **verificáveis** que estão em `SOURCE_PATHS` mas não no glob geram falso positivo.

### 2. Sincronizar `SOURCE_PATHS` automaticamente
Em vez de hardcoded, usar `getKnownPaths()` como fonte primária e apenas complementar com os caminhos externos (configs, edge functions).

### Mudanças concretas

**Arquivo: `src/components/BackupSection.tsx`**
- Na função `runIntegrityCheck`: inverter a lógica — verificar quais arquivos do glob **não estão** em `SOURCE_PATHS` (novos) e quais de `SOURCE_PATHS` não estão no glob (removidos ou externos)
- Tratar `externalPaths` como "não verificáveis" em vez de "faltando"
- Resultado: zero falsos positivos

**Arquivo: `src/lib/sourceManifest.ts`**
- Expandir o glob para incluir arquivos de config na raiz (`/*.{ts,js,json}`)
- Ou adicionar função `getExternalPaths()` para listar caminhos fora do escopo do glob

### Resultado esperado
- Verificação de integridade mostra **0 faltando** quando todos os arquivos reais existem
- Arquivos externos (configs, edge functions) aparecem como "não verificáveis" em vez de "faltando"
- Novos arquivos adicionados ao projeto são detectados automaticamente

