

## Corrigir Loop de fetchData retornando 0 users

### Problemas Identificados

**Bug 1 — Log mostra 0 users por stale closure**
Na linha 714, o `console.log` usa `revendedores.length` diretamente, mas `revendedores` é capturado no momento da criação do `useCallback` (que depende apenas de `[runFetch, user?.id]`). Então o log sempre mostra o valor antigo (0 na primeira chamada), mesmo que `setRevendedores(list)` tenha sido chamado com dados válidos. Isso não é o loop em si, mas confunde o diagnóstico.

**Bug 2 — Realtime causa loop de re-fetches**
O `fetchData` depende de `runFetch` e `user?.id`. Cada vez que `fetchData` executa e atualiza `revendedores` via `setRevendedores`, isso causa re-render. O `useResilientFetch` retorna um novo `runFetch` a cada render? Não — `runFetch` é memoizado com `useCallback`. Porém, o realtime channel no `useEffect` (linha 784-806) depende de `[fetchData, fetchAnalytics]`. Quando `fetchData` muda (se `user?.id` mudar, por exemplo), o canal é recriado, o que gera um novo subscribe e pode disparar eventos pendentes.

O verdadeiro loop: Realtime está ouvindo `profiles`, `saldos`, `user_roles`. Cada `fetchData` faz `setRevendedores` → re-render. Se qualquer dado muda no banco (ou até o próprio fetch provoca um update como `last_seen_at`), o realtime dispara `debouncedFetchData` a cada 2s, criando um ciclo contínuo a cada ~15s (debounce 2s + fetch ~1.4s).

Olhando o padrão dos logs: chamadas a cada 5-15 segundos, consistente com realtime triggers debounced.

### Correções

1. **Corrigir o log stale** — Mover o `console.log` para dentro do `runFetch` callback, usando `list.length` em vez de `revendedores.length`.

2. **Adicionar guard no realtime** — Usar um `dataFetchInFlightRef` para evitar fetches sobrepostos e ignorar eventos realtime enquanto um fetch está em andamento.

3. **Aumentar debounce do realtime** — Subir de 2s para 5s para reduzir frequência de refetches em cascata.

### Arquivos Alterados

- `src/pages/Principal.tsx` — Linhas ~670-715 (fetchData) e ~784-806 (realtime useEffect)

### Impacto

- O log passará a mostrar o número correto de users
- Fetches repetitivos por realtime serão reduzidos drasticamente
- Nenhuma funcionalidade existente é alterada

