
## Issue

The avatar dropdown menu ("Sair da conta") is being overlapped by the RecargasTicker and dashboard cards because the parent header/container likely has a stacking context that limits the z-index effectiveness.

## Fix

1. **In `src/pages/RevendedorPainel.tsx`** (lines 928-934):
   - Increase z-index on the backdrop from `z-30` to `z-50`
   - Increase z-index on the dropdown from `z-40` to `z-[60]`
   - Add `relative z-50` to the parent `<div className="relative">` wrapper around the avatar button to establish a proper stacking context above the ticker and cards
