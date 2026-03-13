

## Plano: Corrigir notificação prematura e horário errado no comprovante

### Problemas identificados

1. **Notificação Telegram enviada mesmo quando a recarga está pendente**: Em `recarga-express/index.ts` (linha 575-589), a notificação Telegram com `type: "recarga_completed"` é enviada **incondicionalmente**, mesmo quando `isCompleted` é `false` e o status é "pending". Resultado: o usuário recebe um comprovante com "Recarga Concluída" antes da confirmação real.

2. **Horário errado no comprovante Telegram (Satori)**: Em `telegram-notify/index.ts` (linhas 94-98), o `toLocaleDateString` não especifica `timeZone: "America/Sao_Paulo"`, então usa UTC do servidor Deno — exibindo "13/03/26, 00:47" em vez de "12/03/2026, 21:47:35" (horário de Brasília).

### Correções

**Arquivo 1: `supabase/functions/recarga-express/index.ts`**
- Envolver o bloco de notificação Telegram (linhas 575-590) em `if (isCompleted) { ... }` para que só envie quando a recarga for realmente confirmada pela API.
- Recargas pendentes serão notificadas posteriormente pelo `sync-pending-recargas` quando forem concluídas.

**Arquivo 2: `supabase/functions/telegram-notify/index.ts`**
- Linhas 94-98: Adicionar `timeZone: "America/Sao_Paulo"` nas chamadas `toLocaleDateString` para `dateStr` e `nowStr`.
- Alterar formato para incluir segundos e ano completo (4 dígitos), ficando consistente com o formato "12/03/2026, 21:47:35" usado no restante do sistema.

### Resultado
- Usuários só recebem comprovante "Recarga Concluída" quando a API confirma de fato
- Recargas pendentes não geram notificação prematura — a notificação virá quando o `sync-pending-recargas` detectar a conclusão
- Horários exibidos corretamente no fuso de Brasília

