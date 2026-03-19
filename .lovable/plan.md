

## Problem

When `sync-catalog` syncs a **new recharge value** from the API (e.g., CLARO R$35), it creates a `pricing_rules` entry (global) but does **NOT** create entries in `reseller_base_pricing_rules` for the 3 users with custom pricing (Érica, Neverland, João Victor).

**Result**: Those users would see the **global admin price** instead of the expected **custo + R$0.50** margin for the new value.

## Solution

Modify the `sync-catalog` Edge Function to automatically propagate new pricing rules to all users who have existing `reseller_base_pricing_rules` entries.

### How it works

After inserting a **new** `pricing_rules` entry for a carrier/value pair, the function will:

1. Query all distinct `user_id` values from `reseller_base_pricing_rules` that already have rules for that `operadora_id`
2. For each user, check if they already have a rule for the new `valor_recarga`
3. If not, insert a new `reseller_base_pricing_rules` entry with:
   - `custo` = API cost (same as global)
   - `tipo_regra` = `'fixo'`
   - `regra_valor` = `custo + 0.50` (matching the existing margin pattern)

### File Changed

**`supabase/functions/sync-catalog/index.ts`** — Add ~20 lines after the new `pricing_rules` insert block (around line 120) to auto-create `reseller_base_pricing_rules` for users who already have custom pricing on the same carrier.

### Key Detail

The margin of R$0.50 will be calculated dynamically based on each user's **average existing margin** for that carrier, rather than hardcoding R$0.50. This makes it work correctly even if different users have different margins in the future.

