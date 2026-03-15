

# Plano: Implementar Geração de Comissões de Referência no Fluxo de Recarga

## Problema Encontrado

A tabela `referral_commissions` está **vazia**. A Edge Function `recarga-express` nunca grava comissões após uma recarga bem-sucedida. O dashboard "Minha Rede" lê dessa tabela para exibir lucros diretos e indiretos, mas os dados nunca são gerados.

## O que será implementado

### 1. Adicionar lógica de comissão na Edge Function `recarga-express`

Após cada recarga completada (status `completed`) nos dois fluxos (`recharge` e `public-recharge`), calcular e inserir comissões:

- **Comissão Direta**: Quando o usuário que fez a recarga tem `reseller_id`, o revendedor direto recebe comissão. O lucro é `chargedCost - apiCost` (a diferença entre o que foi cobrado do cliente e o custo real da API).
- **Comissão Indireta**: Se o revendedor direto também tem um `reseller_id` (é sub-revendedor de alguém), o revendedor "avô" recebe uma comissão indireta configurável.

A lógica será inserida logo após o `insert` na tabela `recargas`, dentro dos cases `recharge` e `public-recharge`.

### 2. Configuração de comissão indireta

Usar `system_config` com chaves:
- `indirectCommissionEnabled` (true/false)
- `indirectCommissionPercent` (porcentagem sobre o lucro direto, ex: 10)

### 3. Fluxo de cálculo

```text
Recarga completada (cliente C, revendedor R, avô A)
│
├─ Lucro direto = chargedCost - apiCost
│  └─ INSERT referral_commissions (user_id=R, referred_user_id=C, type='direct', amount=lucro)
│
└─ Se R tem reseller_id = A e comissão indireta ativa:
   └─ Comissão indireta = lucro_direto * indirectCommissionPercent/100
      └─ INSERT referral_commissions (user_id=A, referred_user_id=C, type='indirect', amount=comissão)
```

### 4. Migração de banco de dados

Inserir configurações padrão de comissão indireta na `system_config`:
- `indirectCommissionEnabled` = `true`
- `indirectCommissionPercent` = `10`

### Arquivos modificados

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/recarga-express/index.ts` | Adicionar função `generateCommissions()` + chamadas nos cases `recharge` e `public-recharge` |
| Migração SQL | Inserir configs de comissão indireta |

### Segurança

- Comissões são geradas server-side (Edge Function com service role) -- sem risco de manipulação pelo cliente
- A tabela `referral_commissions` já tem RLS adequado (admin full, user view own)
- Comissão só é gerada quando `finalStatus === "completed"` e `lucro > 0`

