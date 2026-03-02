

## Plano: Renomear métricas do Dashboard para maior clareza

### O que será alterado

Os 6 cards do Dashboard principal e os cards do detalhe do revendedor terão seus nomes e subtítulos reescritos para que qualquer pessoa entenda imediatamente o que cada número representa, sem precisar de explicação.

### Mudanças propostas

**Dashboard Principal (6 cards):**

| Atual | Novo Nome | Subtítulo Atual → Novo |
|-------|-----------|----------------------|
| Recargas Hoje | Recargas Hoje | "X concluídas" → "X concluídas de Y solicitadas" |
| Vendas Hoje | Vendas Hoje (Cobrado) | "Custo API: X • Lucro: X" → "Valor cobrado dos revendedores hoje" |
| Saldo Total | Saldo dos Revendedores | "X revendedores ativos" → sem alteração |
| Vendas do Mês | Vendas do Mês (Cobrado) | "Custo API: X • Lucro: X" → "Cobrado dos revendedores neste mês" |
| Lucro Acumulado | Lucro Total (Histórico) | "X recargas • Custo API: X" → "Vendas - Custo API de todas as recargas" |
| Faturamento Total | Faturamento Total (Cobrado) | "Custo API: X • Lucro: X" → "Total cobrado de todos os tempos" |

**Detalhe do Revendedor (7 cards):**

| Atual | Novo Nome |
|-------|-----------|
| Saldo Atual | Saldo Disponível |
| Total Vendas | Cobrado pelo Sistema |
| Custo Total | Custo da Operadora (API) |
| Seu Lucro (Admin) | Seu Lucro (Cobrado - Custo API) |
| Lucro do Revenda | Lucro do Revendedor (Preço Final - Cobrado) |
| Total Depositado | Total de Depósitos |

### Arquivo editado

- `src/pages/Principal.tsx` — apenas alteração de strings nos labels e subtítulos dos cards

### Detalhes técnicos

Todas as mudanças são cosméticas (strings de texto). Nenhuma lógica de cálculo será alterada. Os valores continuam sendo calculados da mesma forma, apenas os rótulos ficam mais descritivos para facilitar a leitura.

