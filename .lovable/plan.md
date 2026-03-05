

## Pull-to-Refresh apenas no PWA instalado

### O que será feito
Implementar pull-to-refresh que funciona **apenas quando o app está instalado como PWA** (modo standalone), ignorando o gesto no navegador normal.

### Implementação

1. **Criar `src/components/PullToRefresh.tsx`**
   - Detectar modo standalone via `window.matchMedia('(display-mode: standalone)')` ou `navigator.standalone` (iOS)
   - Se não for standalone, o componente não faz nada
   - Escutar `touchstart`, `touchmove`, `touchend`
   - Ativar apenas quando `scrollY === 0` e arraste > 80px
   - Mostrar indicador visual (spinner com ícone de refresh) durante o gesto
   - Ao soltar, executar `window.location.reload()`
   - CSS: `overscroll-behavior-y: none` apenas no modo standalone

2. **Adicionar no `App.tsx`**
   - Inserir `<PullToRefresh />` dentro do layout principal, antes das rotas

3. **CSS em `index.css`**
   - Media query `@media (display-mode: standalone)` para aplicar `overscroll-behavior-y: none` no body, evitando conflito com o comportamento nativo do Chrome

