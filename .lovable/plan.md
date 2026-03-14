

## Plano: Desconto do custo API dos revendedores com saldo suficiente

### Dados confirmados

| Revendedor | Saldo Atual | Custo API (débito) | Saldo Final |
|---|---|---|---|
| yagoalmirantesdaserra | R$ 20,70 | R$ 17,00 | R$ 3,70 |
| lucasgabriel305jj | R$ 16,95 | R$ 16,00 | R$ 0,95 |

### Ações

1. **Atualizar saldo** de cada revendedor na tabela `saldos` (tipo = 'revenda'), subtraindo o `custo_api`
2. **Atualizar campo `custo`** nas recargas correspondentes (de 0 para o valor do `custo_api`), corrigindo o registro histórico
3. **Registrar audit_log** para cada desconto, documentando a correção administrativa

### SQL (via insert tool)

```sql
-- 1. Descontar saldo yagoalmirantesdaserra
UPDATE saldos SET valor = valor - 17 WHERE user_id = '39b3977b-bc42-461b-8489-09ef0f7bf4e6' AND tipo = 'revenda';

-- 2. Descontar saldo lucasgabriel305jj
UPDATE saldos SET valor = valor - 16 WHERE user_id = 'd8c4d2a2-454a-4779-a19e-719f9b6eabeb' AND tipo = 'revenda';

-- 3. Corrigir custo nas recargas
UPDATE recargas SET custo = 17 WHERE id = '4dfb3f5f-5cab-4d00-9b1d-0f9f5d348b3c';
UPDATE recargas SET custo = 16 WHERE id = 'aa63c82d-8ce2-4bf3-80a8-5851a182223d';
```

Nenhum saldo ficará negativo.

