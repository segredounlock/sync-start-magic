

## Redesenho da Landing Page

A Landing Page atual já tem uma base sólida (glassmorphism, partículas, typed text, mock dashboard). O redesenho manterá o estilo **dark premium** e focará em polir o visual e layout.

### Mudancas planejadas

**1. Hero Section**
- Reorganizar para layout mais impactante: badge animado no topo, headline maior com gradiente mais rico, subtítulo com opacidade progressiva
- Substituir o mock dashboard por um "phone frame" estilizado contendo as mesmas métricas -- mais moderno e contextual para um app de recargas
- CTAs com efeito de borda animada (RGB sutil) e micro-interações mais refinadas

**2. Stats Strip**
- Transformar de grid simples para cards individuais com bordas glassmorphism e ícones com glow animado
- Adicionar separadores verticais entre stats no desktop
- Animação de contagem nos números ao entrar no viewport

**3. Features Section**
- Trocar de lista vertical para grid 2x3 com cards maiores
- Cada card com ícone grande, gradiente de fundo sutil, e hover com elevação + borda primary
- Remover as setas laterais, usar layout centrado

**4. CTA Section**
- Fundo com gradiente mesh mais elaborado
- Counter "10k+" com animação de contagem real
- Adicionar depoimentos/trust badges (ícones de operadoras: Vivo, Claro, Tim, Oi)

**5. Footer**
- Mais completo: logo, links, redes sociais placeholder
- Divisor com gradiente sutil

### Arquivo a editar
- `src/pages/LandingPage.tsx` -- reescrita completa do componente mantendo as mesmas dependências (framer-motion, lucide-react, ThemeToggle)

### Detalhes técnicos
- Manter todas as classes CSS existentes (`glass`, `glass-card`, `glow-primary`, `shimmer-letters`)
- Usar `whileInView` do framer-motion para animações ao scroll
- Manter navegação para `/login` nos CTAs
- Sem novas dependências

