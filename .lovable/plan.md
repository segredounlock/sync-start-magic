

# Melhorar Tamanho e Espaçamento do Dashboard Mobile

## Problema
Na tela inicial (Dashboard) do mobile, os elementos como botões de ação rápida, KPIs, textos e ícones estão pequenos e parecem distantes/comprimidos, dificultando a interação em telas touch.

## Solução
Aumentar tamanhos de fonte, ícones, padding e espaçamento dos componentes principais do `DashboardSection.tsx` para telas mobile (viewport ~430px).

## Alterações no `src/components/DashboardSection.tsx`

1. **Saudação**: Aumentar de `text-2xl` para `text-3xl` no nome do usuário; data de `text-xs` para `text-sm`

2. **Card de Saldo**: Aumentar padding de `p-5` para `p-6`, valor do saldo de `text-2xl` para `text-3xl`, ícone Wallet de `h-8 w-8` para `h-10 w-10`, botão Depositar de `py-2 text-sm` para `py-2.5 text-base`

3. **Quick Actions (Recarregar, Minha Rede, etc.)**:
   - Ícone container de `w-10 h-10` para `w-12 h-12`
   - Ícone de `h-5 w-5` para `h-6 w-6`
   - Label de `text-sm` para `text-base`
   - Sub-label de `text-[10px]` para `text-xs`
   - Padding de `p-4` para `p-5`

4. **KPI Cards (Lucro, Vendas, etc.)**:
   - Padding de `p-4` para `p-5`
   - Ícone container de `w-8 h-8` para `w-10 h-10`
   - Ícone de `h-4 w-4` para `h-5 w-5`
   - Label de `text-xs` para `text-sm`
   - Valor de `text-2xl` para `text-3xl`

5. **Relatório de Desempenho**:
   - Título de `text-lg` para `text-xl`
   - Subtítulo de `text-xs` para `text-sm`
   - Filtros (Hoje/Mês/Outro) de `text-xs` para `text-sm`, padding de `px-3 py-1.5` para `px-4 py-2`

6. **Espaçamento geral**: de `space-y-5` para `space-y-6`

## Resultado Esperado
- Botões e cards maiores e mais fáceis de tocar no mobile
- Textos mais legíveis sem precisar se aproximar da tela
- Layout mais "respirado" e profissional em telas pequenas

