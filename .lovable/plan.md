

## Plano: Renomear "Recarga" para "Créditos Entregues"

**Alteração única** no arquivo `src/pages/Principal.tsx`, linha 3344:

Trocar `"Recarga"` por `"Créditos Entregues"` no array de KPIs do relatório.

```tsx
// De:
{ label: "Recarga", value: fmt(totalRecarga), ... }

// Para:
{ label: "Créditos Entregues", value: fmt(totalRecarga), ... }
```

Isso deixará claro que o valor exibido representa a soma dos créditos faciais entregues aos clientes finais, não o valor cobrado.

