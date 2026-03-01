

## Sugestões de Melhoria nos Nomes - Admin Dashboard

Analisando os 6 cards da seção "Performance Financeira & Operacional":

| Atual | Sugestão | Motivo |
|-------|----------|--------|
| **Resultado Financeiro** | **Lucro do Período** | "Resultado" é vago; "Lucro do Período" já diz exatamente o que é |
| **Cobrado Revend.** (sub-label) | **Vendas Revend.** | Mantém consistência com as renomeações já feitas no dashboard principal |
| **Total Depositado** | **Depósitos Recebidos** | "Recebidos" deixa claro que é dinheiro que entrou |
| **Saldo em Carteiras** | **Saldo dos Revendedores** | Mais direto — diz de quem é o saldo |
| **Passivo do Sistema** (sub-label) | **Dinheiro a devolver** | "Passivo" é termo contábil; nem todo mundo entende |
| **Volume de Recargas** | Sem mudança | Já está claro |
| **Usuários Únicos** | **Revendedores Cadastrados** | Mais específico ao contexto do sistema |
| **Ticket Médio** | **Valor Médio por Recarga** | Explica melhor o que o número representa |

## Alterações

- **`src/pages/AdminDashboard.tsx`**: Renomear os labels dos 6 cards e sub-labels conforme tabela acima

