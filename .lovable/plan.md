

## Análise dos Horários nas "Últimas Recargas"

Os horários exibidos na tela (18:03, 18:02, 17:59, etc.) são da coluna `created_at` — ou seja, a **hora em que a recarga foi pedida/solicitada**, e não a hora em que foi concluída.

A tabela `recargas` possui um campo `completed_at` que registra quando a recarga foi efetivamente concluída, mas ele não está sendo usado na exibição.

### Plano

**Atualizar a exibição de horário nas "Últimas Recargas"** para mostrar o horário mais relevante conforme o status:

1. **Recargas concluídas** → mostrar `completed_at` (hora da conclusão), com fallback para `created_at` caso `completed_at` seja nulo
2. **Recargas pendentes** → mostrar `created_at` (hora do pedido)
3. **Recargas com falha** → mostrar `created_at` (hora do pedido)

Opcionalmente, adicionar um label indicativo para clareza:
- "Concluída às 18:03" vs "Pedida às 18:03"

### Arquivos a alterar

- **`src/pages/RevendedorPainel.tsx`** — Na seção "Últimas Recargas" (linha ~1834) e na aba "Histórico" (linhas ~1965, ~2004, ~2075), trocar `r.created_at` por lógica condicional que use `r.completed_at` quando disponível e o status for "completed"/"concluida".

- **`src/pages/Principal.tsx`** — Mesma lógica na seção de últimas recargas do painel admin.

- **`src/pages/TelegramMiniApp.tsx`** — Mesma lógica no mini app do Telegram.

