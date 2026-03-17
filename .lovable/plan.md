

## Plan: Add "Suporte" to the desktop sidebar

### Problem
The "Suporte" tab only appears in the mobile bottom navigation (inside "Mais"). The desktop sidebar's `menuItems` array does not include it, so there's no way to access support tickets on desktop.

### Change

**File: `src/pages/RevendedorPainel.tsx`** (1 edit)

Add the "Suporte" entry to the `menuItems` array (after "raspadinha", line ~851):

```typescript
{ key: "suporte", label: "Suporte", icon: Headphones, color: "text-teal-400" },
```

This will make "Suporte" appear in the desktop sidebar alongside all other menu items. No other changes needed — the tab content rendering (`tab === "suporte"`) already exists.

