

## Plano: Sincronização completa de preços e valores com a API

### Problema atual
A sincronização existente em `fetchPricingData` (Principal.tsx) tem limitações:
1. **Custo da API só é atualizado se estava zerado** (linha 382: `if (Number(existingRule.custo) === 0)`) — se a API mudar o preço, o sistema não reflete
2. **Valores removidos da API não são desativados** — se a API remove um valor (ex: R$20 da TIM), ele continua aparecendo no sistema
3. **`operadoras.valores`** é atualizado com os valores da API, mas as `pricing_rules` órfãs permanecem

### O que será feito

**Arquivo: `src/pages/Principal.tsx`** — alterar `fetchPricingData`:

1. **Sempre atualizar o custo da API** nas `pricing_rules` (remover a condição `custo === 0`). O campo `custo` representa o custo real da API; o campo `regra_valor` (definido pelo admin) permanece intocado.

2. **Sincronizar valores disponíveis**: após processar o catálogo da API, para cada operadora:
   - Atualizar `operadoras.valores` com **apenas** os valores retornados pela API
   - Inserir na tabela `disabled_recharge_values` os valores que existiam localmente mas foram removidos da API (auto-desativar)
   - Remover de `disabled_recharge_values` valores que voltaram à API (auto-reativar)

3. **Limpar pricing_rules órfãs**: remover regras globais cujo `valor_recarga` não existe mais no catálogo da API para aquela operadora.

### Detalhes técnicos

```text
API retorna:        TIM → [15, 20, 30]
Local tinha:        TIM → [15, 20, 25, 30]

Resultado da sync:
  - operadoras.valores = [15, 20, 30]
  - pricing_rules para TIM/25 → removida
  - disabled_recharge_values TIM/25 → inserido (auto-desativado)
  - custo de todos os valores → atualizado com valor da API
```

### Resultado
- Qualquer alteração de preço ou disponibilidade na API principal será refletida automaticamente no sistema toda vez que o admin abrir a seção de Precificação
- Sem necessidade de ação manual — o sistema se mantém sincronizado

