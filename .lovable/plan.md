

## Problema

As notificações (toasts) estão aparecendo no topo da tela no desktop, em vez do centro. Isso acontece porque o componente `<Toaster>` do Sonner está configurado com `position="top-center"`, e o container do Sonner posiciona os toasts no topo — a tentativa de sobrescrever com `position: "fixed"` no `randomStyle()` de cada toast individual não consegue escapar do container pai do Sonner.

Além disso, o arquivo `useCrud.ts` e `usePixDeposit.ts` usam `toast` importado diretamente do Sonner (sem `randomStyle()`), então esses toasts nunca receberiam o posicionamento centralizado.

## Solução

1. **Reposicionar o container do Sonner via CSS** — Adicionar estilos globais no `index.css` para mover o container `[data-sonner-toaster]` para o centro vertical da tela (`top: 50%; transform: translateY(-50%)`), mantendo centralizado horizontalmente.

2. **Simplificar o `randomStyle()`** — Remover o `position: fixed` e `top/left/transform` do `randomStyle()`, já que o posicionamento será controlado pelo container. Manter apenas o `zIndex`.

3. **Atualizar `useCrud.ts`** — Trocar a importação de `toast` do Sonner para usar `styledToast` do `@/lib/toast`, garantindo consistência visual.

4. **Atualizar `usePixDeposit.ts`** — Mesma troca para garantir que todos os toasts passem pelo sistema centralizado.

## Arquivos a editar

- `src/index.css` — Adicionar regra CSS para `[data-sonner-toaster]` centralizar verticalmente
- `src/lib/toast.tsx` — Simplificar `randomStyle()` 
- `src/hooks/useCrud.ts` — Trocar `toast` por `styledToast`
- `src/hooks/usePixDeposit.ts` — Trocar `toast` por `styledToast`

