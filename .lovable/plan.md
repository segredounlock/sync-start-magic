

# Trocar ícone do FAB "Saldo" de "+" para "$"

O botão FAB central da navegação inferior do Mini App atualmente usa o ícone `Plus` (+). Você quer que seja um cifrão ($).

## Alteração

**Arquivo:** `src/pages/TelegramMiniApp.tsx`

**Linha 2571** — Trocar o ícone `Plus` por `DollarSign` na definição do item de navegação do FAB:

```tsx
// De:
{ id: "deposito", icon: Plus, label: "Saldo", isFab: true }

// Para:
{ id: "deposito", icon: DollarSign, label: "Saldo", isFab: true }
```

Verificar se `DollarSign` já está importado do `lucide-react` (provavelmente sim, pois é usado em outras partes do arquivo). Caso contrário, adicionar ao import.

