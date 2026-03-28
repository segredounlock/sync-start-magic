

# Corrigir Sombra Escura na Coroa do Pódio

## Problema
Quando o efeito de brilho (stroke animado) passa pela coroa, aparece uma sombra escura/preta momentânea. Isso acontece porque o `drop-shadow` no SVG overlay cria uma sombra baseada no path — e durante a animação do `strokeDashoffset`, o browser renderiza a sombra do stroke visível como uma mancha escura.

## Correção
No componente `GoldFloatingCrown` (linha ~110-132 de `TopRankingPodium.tsx`):

1. **Remover o `drop-shadow` do SVG overlay** — é ele que gera a sombra preta durante a animação do stroke
2. **Adicionar `stroke="none"` explícito** no ícone `Crown` do Lucide para garantir zero artefato
3. **Mover o glow dourado** para o container da coroa como `box-shadow`, não como `filter` no SVG

### Alteração no código
```tsx
// Crown — forçar sem stroke
<Crown
  className="absolute inset-0 w-full h-full text-yellow-400"
  fill="currentColor"
  stroke="none"
  strokeWidth={0}
/>

// SVG overlay — REMOVER o drop-shadow do filter
<svg
  viewBox="0 0 24 24"
  className="absolute inset-0 w-full h-full pointer-events-none"
  // sem filter aqui
>
```

## Impacto
- Apenas visual na coroa do 1º lugar
- O brilho animado (stroke gradient) continua funcionando
- A sombra preta desaparece
- Zero risco de quebra

