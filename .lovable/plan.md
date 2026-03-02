

## Correção retroativa das 5 recargas com custo_api = 0

### Problema duplo identificado
1. **`custo_api`** salvo como 0 (já corrigido para futuras recargas)
2. **`valor`** salvo como o preço do revendedor em vez do valor facial real

### Correções via SQL

Atualizar os 5 registros com os valores corretos:

```sql
-- Claro R$35 (preço final 15.60, custo API 12.00)
UPDATE recargas SET custo_api = 12.00, valor = 35 WHERE id = 'd10ec4ab-70ce-4e20-8735-2bbd76fb2fbb';

-- TIM R$40 (preço final 17.00, custo API 14.00)
UPDATE recargas SET custo_api = 14.00, valor = 40 WHERE id = 'eefe74f2-8fc5-49b2-a2ba-feb7c9b5c14f';

-- TIM R$20 (preço final 9.30, custo API 8.00)
UPDATE recargas SET custo_api = 8.00, valor = 20 WHERE id = '7c84bc9c-87a1-4be8-bf14-cd4d6f515cc7';

-- TIM R$20 (preço final 9.30, custo API 8.00)
UPDATE recargas SET custo_api = 8.00, valor = 20 WHERE id = '76201471-def4-4746-9e96-36e3091fb345';

-- Claro R$40 (preço final 16.50, custo API 14.00)
UPDATE recargas SET custo_api = 14.00, valor = 40 WHERE id = '8d9628f2-58f0-451e-8166-abaa0ca0afdd';
```

### Bug adicional no telegram-bot: campo `valor`

O `valorFacial` na linha ~1203 do telegram-bot usa `orderData.value || orderData.valor || cost`. Como a API não retorna `value`/`valor`, cai no fallback `cost` (preço do revendedor). Precisa buscar o valor facial do catálogo na sessão, da mesma forma que fizemos com `api_cost`.

**Correção**: salvar o valor facial real do catálogo na sessão (handler `rec_val_`) e usá-lo na inserção.

### Arquivos
- Migração SQL para corrigir os 5 registros
- `supabase/functions/telegram-bot/index.ts` — salvar `valor_facial` na sessão e usar na inserção

