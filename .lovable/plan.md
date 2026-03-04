

## Diagnóstico: Scroll bloqueado na seção "Últimas Recargas"

### Causa raiz

O problema está no `useEffect` de inicialização do Telegram Mini App (linhas 138-141):

```javascript
document.documentElement.style.height = "100%";
document.body.style.height = "100%";
document.body.style.overflow = "hidden";
```

Combinado com o handler `preventDoubleTap` (linhas 158-161) que chama `e.preventDefault()` em eventos `touchend` rápidos (< 300ms), o que pode cancelar o scroll inercial (momentum scroll) no iOS/Telegram WebView.

O container de conteúdo (`flex-1 overflow-y-auto pb-20`, linha 887) deveria permitir scroll interno, mas dois fatores o impedem:
1. O `body.overflow = "hidden"` junto com `height: 100%` no html/body pode restringir a cadeia de layout flex
2. O `preventDoubleTap` no `touchend` interfere com o gesto de scroll natural, especialmente em toques rápidos consecutivos

### Plano de correção

**1. Ajustar o container principal e remover restrições desnecessárias**

No `useEffect` de inicialização (~linha 138-141):
- Manter `overflow: hidden` no body (necessário para evitar bounce do Telegram)
- Adicionar `touch-action: manipulation` ao container de conteúdo para permitir scroll sem zoom
- Garantir que o container principal use `h-screen` com `overflow: hidden` e o container de conteúdo tenha `overflow-y: auto` com `-webkit-overflow-scrolling: touch`

**2. Corrigir o handler preventDoubleTap**

No handler `preventDoubleTap` (~linha 158-161):
- Verificar se o evento não está dentro do container de conteúdo scrollável antes de chamar `preventDefault()`
- Alternativa mais simples: usar CSS `touch-action: manipulation` no container e remover o handler JavaScript de double-tap, pois `touch-action: manipulation` já previne double-tap zoom nativamente

**3. Adicionar CSS de suporte ao scroll**

No container de conteúdo (linha 887):
- Adicionar `style={{ WebkitOverflowScrolling: 'touch' }}` e `touch-action: pan-y` para garantir scroll suave no WebView do Telegram/iOS
- Adicionar classe `scrollbar-hide` (já existente no CSS)

### Arquivos afetados
- `src/pages/TelegramMiniApp.tsx` — ajustar useEffect de zoom e classes do container de conteúdo

