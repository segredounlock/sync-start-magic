

## Plano: Adicionar "Raspadinha" ao menu lateral (desktop sidebar)

### Problema
O item "Raspadinha" foi adicionado apenas na navegação mobile (bottom nav), mas não aparece no menu lateral do desktop (sidebar).

### Solução
Adicionar o item `{ key: "raspadinha", label: "Raspadinha", icon: Ticket }` ao array `menuItems` no arquivo `src/pages/RevendedorPainel.tsx`, logo após "Atualizações" (linha 745). Isso fará com que o item apareça tanto no sidebar desktop quanto no menu mobile (bottom sheet), mantendo consistência.

### Arquivo alterado
- `src/pages/RevendedorPainel.tsx` — adicionar entrada no array `menuItems` (1 linha)

