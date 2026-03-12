

## Problema

A verificação de integridade compara `SOURCE_PATHS` (122 arquivos) contra `getKnownPaths()` (somente arquivos capturados por `import.meta.glob`). Mas o glob só captura `/src/**/*.{tsx,ts,css}` e `/public/sw-push.js` -- ele nao consegue incluir arquivos de configuracao na raiz (`tailwind.config.ts`, `vite.config.ts`, etc.), Edge Functions (imports Deno), nem `supabase/config.toml`.

Resultado: 37 arquivos aparecem como "faltando" mesmo existindo no projeto.

## Solucao

Separar os arquivos em duas categorias na verificacao de integridade:

1. **Verificaveis** (src/, public/sw-push.js) -- checados contra o glob
2. **Externos** (config raiz, edge functions, supabase/) -- listados como "nao verificaveis no cliente" mas incluidos no backup

### Alteracoes

**`src/lib/sourceManifest.ts`** -- sem alteracao (manter como esta)

**`src/components/BackupSection.tsx`** -- ajustar `runIntegrityCheck`:
- Dividir `effectivePaths` em dois grupos: os que comecam com `src/` ou `public/` (verificaveis via glob) e o resto (externos)
- Checar somente os verificaveis contra `getKnownPaths()`
- Exibir resultado separado: "X/Y arquivos verificados OK" + "Z arquivos externos (incluidos no backup, nao verificaveis no cliente)"
- Na UI, mostrar os externos em uma secao informativa (cinza/azul) em vez de vermelho

Isso elimina os falsos negativos sem remover nenhum arquivo do backup.

