

## Atualizar Preço Global da CLARO

O objetivo é atualizar a coluna `regra_valor` na tabela `pricing_rules` para a operadora CLARO, igualando aos valores "Preço Final" mostrados na foto.

### Valores a serem aplicados

| Recarga | Custo API | Preço Final (novo `regra_valor`) |
|---------|-----------|----------------------------------|
| R$ 20   | 11.00     | **14.30** |
| R$ 25   | 12.00     | **15.60** |
| R$ 30   | 13.00     | **16.90** |
| R$ 35   | 15.00     | **19.50** |
| R$ 40   | 17.00     | **22.10** |
| R$ 50   | 20.00     | **26.00** |
| R$ 60   | 23.00     | **29.90** |
| R$ 70   | 26.00     | **33.80** |

### Execução

Usar o insert tool para executar UPDATE na tabela `pricing_rules`, atualizando `regra_valor` para cada `valor_recarga` da CLARO (filtrando pelo `operadora_id` da CLARO).

### Impacto

- Todos os usuários **sem** regra customizada (`reseller_base_pricing_rules`) passarão a pagar esses novos preços.
- Os 3 usuários com preço customizado (Érica, Neverland, João Victor) **não são afetados** — continuam usando seus custos base próprios.
- O safety floor será atualizado automaticamente, já que ele usa o preço global como piso mínimo.

