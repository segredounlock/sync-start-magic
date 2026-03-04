

## Diagnóstico: Painel "Nova Recarga" travado no loading (skeleton infinito)

### Causa Raiz Identificada

O problema está na interação entre `useResilientFetch` e `fetchData` no `RevendedorPainel.tsx`:

1. **`useResilientFetch()`** inicializa `loading = true` (linha 82 do `useAsync.ts`)
2. **`fetchData`** tem um guard `if (!user) return;` que sai sem chamar `runFetch`
3. Se o `user` ainda for `null` no momento do primeiro `useEffect` (linhas 318-333), `runFetch` nunca é chamado
4. Como `runFetch` nunca executa, `hasLoaded.current` permanece `false` e `loading` permanece `true` **para sempre**
5. Resultado: os cards "Recargas Hoje" e "Total" ficam com `SkeletonValue` infinitamente

Isso acontece especialmente quando:
- O `AuthProvider` ainda não resolveu a sessão no momento do primeiro render
- O componente é lazy-loaded via `Suspense` e o `useEffect` dispara antes do `user` estar disponível

### Plano de Correção

#### 1. Corrigir `fetchData` para sinalizar loading=false mesmo sem user

No `RevendedorPainel.tsx`, alterar a função `fetchData` para que, quando `user` for null, ainda assim marque o loading como concluído:

```typescript
const fetchData = useCallback(async () => {
  if (!user) {
    // Sem user, não há dados para buscar - desabilitar loading
    return;
  }
  await runFetch(async () => { /* ...existing code... */ });
}, [user, runFetch]);
```

A correção real precisa estar no `useEffect` que chama `fetchData`, garantindo que se `user` não existir, o estado de loading é desativado.

#### 2. Adicionar safety net no `useResilientFetch`

Modificar o hook para aceitar uma dependência de "readiness" ou adicionar um timeout de segurança que desativa o loading após X segundos mesmo sem `runFetch` ser chamado:

```typescript
// Em useResilientFetch, adicionar timeout de segurança
useEffect(() => {
  const safety = setTimeout(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      setLoading(false);
    }
  }, 10000); // 10s safety net
  return () => clearTimeout(safety);
}, []);
```

#### 3. Garantir que o useEffect reaja à mudança de `user`

O `useEffect` na linha 318-333 tem `[fetchData, fetchCatalog]` como dependências. Como `fetchData` depende de `user`, quando `user` mudar o efeito re-executa. **Porém**, na primeira execução (user=null), `fetchData` retorna sem chamar `runFetch`.

A correção principal: no `useEffect`, se `user` for null, forçar `loading = false`:

```typescript
useEffect(() => {
  if (!user) return; // Don't fetch without user, but loading stays managed by runFetch
  fetchData();
  fetchCatalog();
  // ...banners fetch...
}, [fetchData, fetchCatalog]);
```

Mas isso não resolve porque `loading` começa `true`. A correção correta é **inicializar `loading` como `false` no `useResilientFetch`** e só ativar na primeira chamada de `runFetch`:

```typescript
export function useResilientFetch(options = {}) {
  const [loading, setLoading] = useState(false); // Antes era true
  // ...
  const runFetch = useCallback(async (fn) => {
    if (!hasLoaded.current) setLoading(true); // Ativa loading apenas quando realmente inicia
    // ...
  }, [timeout]);
}
```

#### 4. Corrigir erro de build no telegram-bot

Verificar e corrigir o erro de parse em `supabase/functions/telegram-bot/index.ts` que está impedindo o deploy das edge functions.

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useAsync.ts` | Mudar `useState(true)` para `useState(false)` no `useResilientFetch` e adicionar timeout de segurança |
| `src/pages/RevendedorPainel.tsx` | Ajustar o `useEffect` de carregamento para não depender de `runFetch` ter sido chamado para exibir conteúdo |
| `supabase/functions/telegram-bot/index.ts` | Investigar/corrigir erro de parse na linha 1481 |

### Impacto

- **Zero breaking changes**: a interface continua com skeletons durante o carregamento real
- **Resolve o travamento**: loading nunca fica stuck porque começa como `false` e só ativa quando há fetch real
- **Safety net**: timeout de 10s garante que mesmo em falha de rede o UI destranca

