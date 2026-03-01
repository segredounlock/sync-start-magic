

## Análise dos Nomes Atuais

Olhando o dashboard na imagem, os cards atuais são:

| Atual | Problema |
|-------|----------|
| **Cobrado Hoje** | "Cobrado" aparece 3x, confuso |
| **Cobrado Mês** | Igual ao de cima, só muda o período |
| **Cobrado Total** | Mesma palavra de novo |
| **Lucro Total** | OK, mas sem contexto de período |
| **Recargas Hoje** | Claro ✓ |
| **Saldo Total** | Claro ✓ |
| **Saldo Provedor** | Claro ✓ |

## Proposta de Renomeação

| Atual | Novo Nome | Motivo |
|-------|-----------|--------|
| Cobrado Hoje | **Vendas Hoje** | Indica que é o que foi vendido/cobrado dos revendedores no dia |
| Cobrado Mês | **Vendas do Mês** | Consistente com "Vendas Hoje" |
| Cobrado Total | **Faturamento Total** | Diferencia do "Vendas" e indica o acumulado geral |
| Lucro Total | **Lucro Acumulado** | Indica que é o lucro de todo o período |
| Recargas Hoje | Sem mudança | Já está claro |
| Saldo Total | Sem mudança | Já está claro |
| Saldo Provedor | Sem mudança | Já está claro |

## Também no Dashboard em Tempo Real

O card "Cobrado Total" do `RealtimeDashboard.tsx` será renomeado para **"Vendas Hoje"** (já que mostra só o dia).

## Alterações

- **`src/pages/Principal.tsx`**: Renomear labels dos 4 cards de métricas
- **`src/components/RealtimeDashboard.tsx`**: Renomear "Cobrado Total" para "Vendas Hoje"

