

# Fix: Telegram Mini App showing wrong cost for reseller's own recharges

## Problem

In `supabase/functions/telegram-miniapp/index.ts` (lines 217-222), the pricing lookup for a "usuario" role loads **their own** `reseller_pricing_rules` as `resellerRules`. Then at lines 266-268, `applyRule(rRule)` returns `regra_valor` — which is the user's **selling price** to clients, NOT their purchase cost.

Example for Vitinho (R$30 Claro recharge):
- His `reseller_pricing_rules.regra_valor` = selling price (e.g. R$22)
- Global admin price (`pricing_rules`) = actual cost (e.g. R$11)
- Mini App shows R$22 as cost → "Saldo insuficiente" with R$14.34 balance
- Should show R$11 as cost → sufficient balance

The `RevendedorPainel.tsx` already handles this correctly (lines 242-258): when NOT in client mode, it skips the user's own reseller rules and uses `baseRules` or `globalRules`.

## Fix

**File: `supabase/functions/telegram-miniapp/index.ts`** (lines 213-275)

Replicate the same logic as `RevendedorPainel`:
1. Load `reseller_base_pricing_rules` for the user (admin-set custom costs)
2. Load `defaultMargin` config
3. For pricing resolution:
   - If user is "cliente" with a reseller → use reseller's `reseller_pricing_rules` (selling price = client's cost) — **this is correct already**
   - If user is "usuario"/"revendedor" → **skip their own** `reseller_pricing_rules` and use:
     1. `reseller_base_pricing_rules` (admin custom cost) if exists
     2. Default margin applied to API cost (if enabled)
     3. Global `pricing_rules` as fallback
   - Set `userCost` = resolved cost (what the user actually pays)
   - Keep `reseller_pricing_rules` available for display as "selling price" if needed

The key change is on line 217: only load `reseller_pricing_rules` from the **reseller** (not from the user themselves) when role is "cliente". For "usuario", use global/base rules instead.

```text
Current (broken):
  pricingUserId = (cliente && resellerId) ? resellerId : user_id
  → loads user's OWN selling prices as their cost

Fixed:
  if cliente → load reseller's rules (correct)
  if usuario → load base_pricing_rules + global rules only
  → shows admin-defined cost as their actual cost
```

## Impact

- Fixes "Saldo insuficiente" false positive in Telegram Mini App
- Aligns Mini App pricing with RevendedorPainel and recarga-express behavior
- No changes needed to recarga-express (backend already resolves cost correctly)

