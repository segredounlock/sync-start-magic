

## Problema Identificado

O filtro "Revendedor" ja existe no codigo (linha 1463 do Principal.tsx), mas esta **oculto** porque a logica `.filter(f => f.key === "todos" || f.count > 0)` esconde tabs com contagem zero. Como nenhum usuario tem o role "revendedor" no banco (so existem "admin" e "usuario"), o tab nao aparece.

## Plano

### 1. Mostrar o filtro "Revendedor" sempre visivel
- Remover a condicao que oculta tabs com count 0 para os roles principais (revendedor, usuario, cliente)
- Manter oculto apenas "Sem funcao" quando count for 0

### 2. Garantir que o botao "+ Novo Revendedor" crie usuarios com role "revendedor"
- Verificar se o modal de criacao esta atribuindo o role correto ao criar novos revendedores
- Se necessario, corrigir para que o role "revendedor" seja atribuido corretamente

### Alteracoes
- **Arquivo**: `src/pages/Principal.tsx` — linha 1467: ajustar filtro para sempre mostrar "Revendedor" mesmo com count 0

