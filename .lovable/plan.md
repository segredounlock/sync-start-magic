

## Plano: Atualizar preços personalizados para margem de R$ 0,50

### Situação Atual

| Usuário | Email | Regras | Exemplo atual (CLARO R$20) |
|---------|-------|--------|---------------------------|
| Recargas Brasil | ericaferreiradutra@icloud.com | 20 | custo R$11 → paga R$10,50 (margem -R$0,50) |
| João Victor Peral | sanperal002@gmail.com | 18 | custo R$11 → paga R$10,50 (margem -R$0,50) |
| Neverland - Recargas | ferreiragreg180@gmail.com | 18 | custo R$11 → paga R$10,50 (margem -R$0,50) |

Alguns valores estão com margem **negativa** (abaixo do custo global), outros com +R$0,50.

### Ação

Uma única query UPDATE que ajusta todas as 56 regras dos 3 usuários para `regra_valor = custo_global + 0.50`:

```sql
UPDATE reseller_pricing_rules rpr
SET regra_valor = pr.custo + 0.50, updated_at = now()
FROM pricing_rules pr
WHERE pr.operadora_id = rpr.operadora_id
  AND pr.valor_recarga = rpr.valor_recarga
  AND rpr.user_id IN (
    'd74ea4f9-e831-4b14-a48f-75ef2d6ac5d3',
    '6c137356-238a-413d-bc75-924c35d55eb6',
    'dee05f2d-29b8-4590-9873-eb5aeb42ce59'
  );
```

### Resultado

| Operadora | Valor | Custo Global | Novo Preço (regra_valor) | Margem |
|-----------|-------|-------------|--------------------------|--------|
| CLARO | R$20 | R$11 | R$11,50 | +R$0,50 |
| CLARO | R$25 | R$12 | R$12,50 | +R$0,50 |
| TIM | R$15 | R$7 | R$7,50 | +R$0,50 |
| VIVO | R$15 | R$11 | R$11,50 | +R$0,50 |
| ... | ... | ... | ... | +R$0,50 |

Todos os 3 usuários passarão a pagar **custo global + R$ 0,50** em todas as operadoras. Nenhuma alteração de código necessária.

