

## Plano: Redesign das Métricas do Relatório de Lucro

Substituir o gráfico de barras horizontais (Recharts) por um **ranking visual com cards individuais** por revendedor — mais moderno e legível.

### O que muda

**1. Substituir o BarChart por um Ranking Visual** (linhas 3260-3279)
- Remover o `<BarChart>` do Recharts
- Criar um ranking estilo "leaderboard" com cards individuais para cada revendedor (top 15)
- Cada card mostra:
  - Posição (#1, #2, #3 com medalhas dourada/prata/bronze)
  - Nome do revendedor
  - Barra de progresso proporcional ao maior lucro (visual de preenchimento)
  - Valores de Vendas e Lucro lado a lado
  - Badge de margem (%)
- Top 3 com destaque visual (borda gradiente, fundo mais vibrante)

**2. Summary Cards — Mais visuais** (linhas 3238-3258)
- Adicionar mini barra de progresso colorida sob cada KPI
- Valor do lucro com cor condicional (verde positivo, vermelho negativo)
- Ícones com fundo mais vibrante

### Arquivo
- `src/pages/Principal.tsx` — seção `view === "relatorios"`, linhas ~3238-3279

### Segurança
- Apenas alterações visuais no JSX/CSS
- Nenhuma modificação em lógica de dados, queries ou estado

