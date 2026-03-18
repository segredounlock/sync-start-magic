

## Problema

Atualmente, revendedores podem definir `regra_valor` (preço final) **abaixo** do custo global definido pelo admin. Isso significa que o lucro do admin (margem global) pode ser ignorado. O "safety floor" no backend só impede venda abaixo do custo da API (`custo`), não abaixo do preço com margem do admin.

**Exemplo:**
- API custo: R$ 11,00
- Admin define regra global: R$ 13,00 (lucro admin = R$ 2,00)
- Revendedor define: R$ 11,50 → Admin perde R$ 1,50 do seu lucro

## Solução

Garantir que o preço do revendedor SEMPRE seja **igual ou acima** do preço global do admin. O revendedor só pode adicionar margem em cima, nunca reduzir.

### 1. Frontend — `MeusPrecos.tsx`

- Impedir que o campo "lucro" aceite valores negativos (já faz `Math.max(0, profit)` na exibição, mas não no salvamento)
- No `saveRule`, validar que `profit >= 0` antes de salvar
- Mostrar mensagem clara: "Seu preço não pode ser inferior ao preço base"

### 2. Backend — `recarga-express/index.ts`

- Atualizar o safety floor para usar o **preço global do admin** como piso mínimo, não apenas o `custo` da API
- Lógica: se `chargedCost < globalRulePrice`, forçar `chargedCost = globalRulePrice`
- Isso protege contra manipulação direta no banco

### 3. Correção dos dados existentes

- Executar UPDATE para corrigir as 70 regras dos outros 7 revendedores que possam ter preços abaixo do global:
```sql
UPDATE reseller_pricing_rules rpr
SET regra_valor = GREATEST(rpr.regra_valor, pr.regra_valor),
    updated_at = now()
FROM pricing_rules pr
WHERE pr.operadora_id = rpr.operadora_id
  AND pr.valor_recarga = rpr.valor_recarga
  AND rpr.regra_valor < pr.regra_valor;
```

### Arquivos modificados

| Arquivo | Mudança |
|---------|---------|
| `src/components/MeusPrecos.tsx` | Validação de lucro >= 0 no save, UI feedback |
| `supabase/functions/recarga-express/index.ts` | Safety floor usando preço global como mínimo |
| Migração SQL | Corrigir dados existentes abaixo do preço global |

### Resultado

- Revendedores veem o preço base do admin e só podem adicionar margem positiva
- Backend rejeita qualquer tentativa de cobrar abaixo do preço global
- Dados existentes corrigidos automaticamente

