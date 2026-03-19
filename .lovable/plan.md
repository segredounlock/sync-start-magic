

## Problem

The public profile page (`/p/:slug`) shows no prices because the RPC `get_public_reseller_pricing` only looks at `reseller_pricing_rules` (the reseller's custom network margins). Most users rely on the global `pricing_rules` table or `reseller_base_pricing_rules` for their pricing, so the query returns empty.

## Solution

Recreate the `get_public_reseller_pricing` RPC to follow the same pricing hierarchy used elsewhere in the system:

1. **Priority 1**: `reseller_pricing_rules` (user's own custom pricing for their network)
2. **Priority 2**: `reseller_base_pricing_rules` (admin-customized base cost for this user) — compute price as `regra_valor` (the selling price)
3. **Priority 3**: `pricing_rules` (global admin pricing) — use `regra_valor` as the margin

The function should return the final customer-facing price for each carrier/value combination, filtering only active carriers and non-disabled values.

## Changes

### 1. Database Migration — Recreate `get_public_reseller_pricing`

New logic:
- Find the user by slug
- For each active operadora + valor_recarga, resolve the price using the hierarchy above
- Exclude disabled values from `disabled_recharge_values`
- Return `operadora_nome`, `valor_recarga`, and the computed `preco_cliente` (what the customer pays)

### 2. Frontend Update — `src/pages/PublicProfile.tsx`

- Update the pricing display to use the new return format (`preco_cliente` instead of computing from `regra_valor`/`tipo_regra`)
- Remove the `computePrice` function since the RPC now returns the final price directly

## Technical Detail

```sql
-- Pseudocode for the new RPC
FOR each pricing_rules row (active operadora, not disabled):
  1. Check reseller_pricing_rules for user → use regra_valor as price
  2. Else check reseller_base_pricing_rules → use regra_valor as price  
  3. Else use pricing_rules.regra_valor (global) applied to valor_recarga
  Return (operadora_nome, valor_recarga, preco_cliente)
```

