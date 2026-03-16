

## Entendimento do Problema

Atualmente, a **taxa de depósito** (taxaTipo + taxaValor) é uma configuração **global única** armazenada em `system_config`, gerenciada exclusivamente pelo administrador. Isso significa que **todos os usuários** pagam a mesma taxa, independente de qual rede pertencem.

O correto seria: **cada dono de rede (revendedor) configura a taxa que seus membros pagam** nos depósitos PIX.

## Como funciona hoje

1. Admin configura `taxaTipo` e `taxaValor` em `system_config` (Painel Principal e AdminDashboard)
2. Hook `useFeePre