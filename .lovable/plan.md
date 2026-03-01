

## Plano: Corrigir flash do banner promocional

### Problema

O estado inicial do `bannerConfig` em `RevendedorPainel.tsx` define `enabled: true` por padrão. Quando a página carrega, o banner aparece imediatamente. Logo depois, o `useEffect` busca a configuração real do banco e, se o banner estiver desativado, atualiza para `enabled: false` — causando o efeito de "aparece e some".

### Correção

**Arquivo: `src/pages/RevendedorPainel.tsx`**

1. Alterar o estado inicial de `bannerConfig.enabled` de `true` para `false` (linha 138)
2. Assim o banner só aparece **depois** que o banco confirmar que está ativado — eliminando o flash

Mudança de 1 linha: `{ enabled: true, ...}` → `{ enabled: false, ...}`

