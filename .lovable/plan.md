

## Problema

O PullToRefresh usa `window.scrollY > 0` para decidir se ativa o gesto, mas no chat a rolagem acontece dentro de um container interno (div com overflow-y), não na janela. Resultado: `window.scrollY` fica sempre 0 dentro do chat, e qualquer deslizar para baixo aciona o pull-to-refresh por engano, recarregando a página.

## Solução

Desativar o PullToRefresh quando o usuário está na rota `/chat`. Duas mudanças:

1. **`src/components/PullToRefresh.tsx`** — Usar `useLocation()` do react-router e retornar `null` se a rota atual começa com `/chat`. Isso elimina completamente o conflito sem precisar mexer na lógica do chat.

2. **Alternativa complementar** (mais robusta): No `onTouchStart`, além de checar `window.scrollY`, verificar se o toque originou dentro de um container scrollável que não está no topo. Isso protege qualquer outra página com containers internos de scroll.

A abordagem principal (rota `/chat`) é simples e resolve o problema imediatamente.

