

## Fix: Lucro Padrão mostrando R$ 0.00 no ClientPricingModal

### Problem
The `ClientPricingModal` calculates `baseCost` using only global `pricing_rules`, ignoring the reseller's custom base cost from `reseller_base_pricing_rules`. For CLARO R$20:
- Global `regra_valor` = R$ 11.00 (used as baseCost)
- Reseller's sale price (`reseller_pricing_rules.regra_valor`) = R$ 10.50
- Result: 10.50 - 11.00 = -0.50, clamped to 0

The real baseCost should be R$ 8.50 (from `reseller_base_pricing_rules`), giving profit = 10.50 - 8.50 = **R$ 2.00**.

### Fix (1 file)

**`src/components/ClientPricingModal.tsx`**
1. Add `reseller_base_pricing_rules` to the parallel fetch query
2. Mirror the baseCost calculation logic from `M