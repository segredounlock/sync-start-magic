

## Plano: Adicionar tooltip no card "Saldo dos Revendedores"

Alterar o campo `sub` do card de Saldo na linha 1270 de `Principal.tsx` para incluir uma descrição mais clara explicando a origem do valor.

**Alteração:**
- Linha 1270: Mudar o `sub` de `` `${activeCount} revendedores ativos` `` para `` `Soma dos saldos de revenda de todos os ${allUsers.length} usuários` ``

Isso deixa claro para o admin que o valor exibido é a soma total dos saldos de todos os usuários, não apenas dos revendedores.

