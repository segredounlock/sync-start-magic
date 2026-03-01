

## Correção: Saldo não atualiza em tempo real na tela de detalhe do revendedor

### Problema
Quando o admin altera o saldo de um revendedor (via modal "Gerenciar Saldo"), o `fetchData()` atualiza a lista `revendedores`, mas o `selectedRev` (estado separado) continua com o valor antigo. O saldo só aparece correto após recarregar a página.

### Solução
Adicionar um `useEffect` em `Principal.tsx` que sincroniza o `selectedRev` sempre que a lista `revendedores` muda. Se o revendedor selecionado existir na lista atualizada, atualiza o estado com os dados novos (incluindo saldo).

```typescript
useEffect(() => {
  if (selectedRev) {
    const updated = revendedores.find(r => r.id === selectedRev.id);
    if (updated) setSelectedRev(updated);
  }
}, [revendedores]);
```

Isso resolve tanto a atualização após ação no modal quanto via realtime (que já chama `fetchData()`).

### Arquivo afetado
- `src/pages/Principal.tsx` — adicionar ~5 linhas após o `useEffect` de realtime

