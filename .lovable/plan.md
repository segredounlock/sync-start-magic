

## Atualizar preços globais da CLARO para todos os usuários

### Situação atual
- CLARO tem 8 valores: 20, 25, 30, 35, 40, 50, 60, 70
- Preços globais atuais (regra_valor): R$14,30 / R$15,60 / R$16,90 / R$19,50 / R$22,10 / R$26,00 / R$29,90 / R$33,80
- O usuário quer que TODOS vejam os preços da screenshot (iguais aos custos customizados dos 3 usuários)

### Mudanças necessárias

**1. Adicionar novos valores à operadora CLARO**
- Valores atuais: [20, 25, 30, 35, 40, 50, 60, 70]
- Novos valores a adicionar: **90, 100, 120, 150**

**2. Atualizar `pricing_rules` existentes** (regra_valor → novo preço global)

| Recarga | Custo API | Preço Atual | Novo Preço |
|---------|-----------|-------------|------------|
| R$ 20   | R$ 8      | R$ 14,30    | **R$ 11**  |
| R$ 25   | R$ 9      | R$ 15,60    | **R$ 12**  |
| R$ 30   | R$ 10     | R$ 16,90    | **R$ 13**  |
| R$ 35   | R$ 12     | R$ 19,50    | **R$ 15**  |
| R$ 40   | R$ 14     | R$ 22,10    | **R$ 17**  |
| R$ 50   | R$ 17     | R$ 26,00    | **R$ 20**  |
| R$ 60   | R$ 20     | R$ 29,90    | **R$ 23**  |
| R$ 70   | R$ 23     | R$ 33,80    | **R$ 26**  |

**3. Criar novas `pricing_rules`** para os valores novos

| Recarga | Custo (estimado) | Preço Global |
|---------|-----------------|--------------|
| R$ 90   | R$ 29           | **R$ 33**    |
| R$ 100  | R$ 32           | **R$ 36**    |
| R$ 120  | R$ 37           | **R$ 41**    |
| R$ 150  | R$ 44           | **R$ 48**    |

### Implementação

- Uma migration SQL que:
  1. Atualiza `operadoras.valores` para incluir os 4 novos valores
  2. Atualiza os 8 `pricing_rules` existentes com os novos preços
  3. Insere 4 novas `pricing_rules` para 90, 100, 120, 150

### Impacto

- Todos os usuários sem preço customizado passarão a ver os novos preços (mais baixos)
- Os 3 usuários com `reseller_base_pricing_rules` continuam com seus preços customizados
- A margem do admin será reduzida (ex: R$20 passa de R$6,30 para R$3,00)
- O `sync-catalog` pode sobrescrever os valores 90/100/120/150 se eles não existirem na API externa — se isso acontecer, serão desativados automaticamente

