

## Verificação de Valores Nulos em Recargas

### Resultado da Consulta ao Banco

A consulta retornou que **todas as 382 recargas possuem `valor > 0`**. Nenhuma recarga com `valor = 0` ou `valor = null` foi encontrada. O problema relatado pelo cliente HUGOAGAPE2015 provavelmente é de outra natureza (confusão com a interface ou visualização).

### Plano Preventivo

Mesmo sem dados problemáticos no momento, vou adicionar fallbacks nos 5 arquivos que exibem `r.valor`, para proteção contra dados futuros ou importações:

**Arquivos a alterar:**

1. **`src/pages/RevendedorPainel.tsx`** — 4 pontos onde exibe `fmt(r.valor)` (lista, tabela, modal de detalhes)
2. **`src/pages/Principal.tsx`** — 3 pontos onde exibe `fmt(r.valor)` (últimas recargas, cards, tabela)
3. **`src/components/RealtimeDashboard.tsx`** — 1 ponto no CreditsFeed
4. **`src/components/chat/UserRecargasModal.tsx`** — 2 pontos (lista e modal)
5. **`src/components/RecargaReceipt.tsx`** — 1 ponto no comprovante

**Abordagem:**

Criar uma função helper simples reutilizável:

```typescript
// Em cada arquivo ou em lib/utils.ts
const safeValor = (r: { valor: number; custo: number }) => 
  (r.valor > 0 ? r.valor : r.custo) || 0;
```

Substituir todas as ocorrências de `r.valor` em contextos de exibição por `safeValor(r)`, garantindo que se `valor` for 0 ou null, o sistema use `custo` como fallback (valor debitado do revendedor).

**Escopo**: Alteração puramente cosmética/defensiva, sem impacto em lógica de negócio ou cálculos financeiros.

