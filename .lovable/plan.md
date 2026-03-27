

# Remover Rotas de Compatibilidade /index e /index.html

## Alteração
No `src/AppRoot.tsx`, remover estas duas linhas de rota:

```tsx
<Route path="/index" element={<Navigate to="/" replace />} />
<Route path="/index.html" element={<Navigate to="/" replace />} />
```

A rota `/auth` → `/login` será mantida pois ainda pode ser útil.

## Arquivo afetado
- `src/AppRoot.tsx` — remover 2 linhas

