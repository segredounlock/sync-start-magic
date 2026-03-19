

## Configurar margem de R$0,50 para ericaferreiradutra@icloud.com

### Situação atual

O usuário `ericaferreiradutra@icloud.com` (ID: `d74ea4f9...`) já tem entradas em `reseller_base_pricing_rules`, mas com custo base = preço global (ex: CLARO R$20 → custo 11, regra_valor 11.50). O objetivo é que o custo base seja o **custo API** + R$0,50, como mostra a foto (CLARO R$20 → custo 8, preço 8.50).

Também faltam os valores novos da CLARO (90, 100, 120, 150).

### Mudanças no banco de dados

**Atualizar as 8 regras CLARO existentes** e **inserir 4 novas**:

| Recarga | Custo API | Novo regra_valor (API + 0,50) |
|---------|-----------|-------------------------------|
| R$ 20   | 8         | **8,50**                      |
| R$ 25   | 9         | **9,50**                      |
| R$ 30   | 10        | **10,50**                     |
| R$ 35   | 12        | **12,50**                     |
| R$ 40   | 14        | **14,50**                     |
| R$ 50   | 17        | **17,50**                     |
| R$ 60   | 20        | **20,50**                     |
| R$ 70   | 23        | **23,50**                     |
| R$ 90   | 29        | **29,50** (novo)              |
| R$ 100  | 32        | **32,50** (novo)              |
| R$ 120  | 37        | **37,50** (novo)              |
| R$ 150  | 44        | **44,50** (novo)              |

Mesma lógica para **TIM** (já existem 7 valores, faltam alguns) e **VIVO** (já existem 4 valores) — atualizar custo para API cost e regra_valor para API cost + 0,50.

### Implementação

Uma migration SQL que:
1. Atualiza os `custo` e `regra_valor` de todas as entradas CLARO/TIM/VIVO existentes para este usuário
2. Insere as 4 novas entradas CLARO (90, 100, 120, 150) com a margem de R$0,50

### Detalhes técnicos

- Tabela: `reseller_base_pricing_rules`
- User ID: `d74ea4f9-e831-4b14-a48f-75ef2d6ac5d3`
- Operadoras: CLARO (`eea6f6cc...`), TIM (`84fa272d...`), VIVO (`417323fa...`)
- O campo `custo` recebe o custo API real; `regra_valor` recebe custo API + 0,50

