

## Remover animação shimmer do SilverIceBadge

O efeito de "sombra passando" é causado pelo `motion.div` com `className="absolute inset-0"` nas linhas 173-178 do `SilverIceBadge` em `src/components/TopRankingPodium.tsx`. Esse div anima um gradiente linear da esquerda para a direita sobre o ícone da medalha.

### Alteração

**`src/components/TopRankingPodium.tsx`** — Remover o bloco `motion.div` com `absolute inset-0` (linhas 173-178) dentro do `SilverIceBadge`, mantendo apenas o ícone `<Medal>`.

