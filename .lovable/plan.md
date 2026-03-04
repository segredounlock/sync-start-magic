

## Problema

O badge de mensagens não lidas (ex: 126, 13) aparece na lista de conversas, mas ao abrir a conversa ele não zera. Isso acontece porque:

1. O `fetchConversations()` não é chamado novamente após marcar as mensagens como lidas
2. O estado local `conversations` mantém o `unread_count` antigo até o próximo refresh

## Solução

### 1. Zerar unread_count localmente ao selecionar conversa (`ChatApp.tsx`)
Quando o usuário clica numa conversa, atualizar imediatamente o estado local da lista de conversas para zerar o `unread_count` daquela conversa, sem esperar o banco.

### 2. Refetch conversations após marcar como lido (`useChat.ts`)
Após inserir os read receipts no `useMessages`, disparar um callback para que a lista de conversas seja atualizada com a contagem correta do banco.

### Arquivos a editar

- **`src/pages/ChatApp.tsx`** — Ao selecionar uma conversa (`onSelect`), zerar imediatamente o `unread_count` no estado local da lista de conversas antes de abrir o chat. Isso dá feedback visual instantâneo.

- **`src/hooks/useChat.ts`** — No `useMessages`, após inserir os read receipts com sucesso, chamar um callback opcional (ou usar o canal realtime existente) para triggar um refetch das conversas. Alternativamente, como já existe um listener realtime em `chat_conversations`, basta fazer um `update` no `updated_at` da conversa após marcar como lido para triggar o refetch automático.

### Detalhes técnicos

1. Em `ChatApp.tsx`, criar uma função wrapper para `setActiveConversationId` que também modifica o array `conversations` (via o hook) zerando o unread_count da conversa selecionada — feedback imediato.

2. Em `useChat.ts` (`useMessages`), após o upsert dos read receipts, fazer um touch na conversa:
```sql
UPDATE chat_conversations SET updated_at = now() WHERE id = _conversation_id
```
Isso fará o listener realtime de `chat_conversations` disparar e o `fetchConversations()` será chamado automaticamente, trazendo a contagem zerada do banco.

