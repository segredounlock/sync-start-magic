

## Problema

O administrador **já consegue** editar mensagens de outros usuários a qualquer momento. Porém, ao editar suas **próprias mensagens**, existe um limite de 10 minutos — o mesmo que usuários normais.

O comportamento correto é: **admin pode editar qualquer mensagem (própria ou de terceiros) sem limite de tempo**.

## Plano

**Arquivo:** `src/components/chat/MessageBubble.tsx` (linhas 101-105)

Ajustar a lógica de `canEdit` para que, quando o usuário for admin, não haja restrição de tempo nem para mensagens próprias:

```tsx
// Atual:
const canEditOwn = isOwn && message.type === "text" && !message.is_deleted && onEdit &&
  (Date.now() - new Date(message.created_at).getTime()) < 10 * 60 * 1000;
const canEditAdmin = isCurrentUserAdmin && !isOwn && message.type === "text" && !message.is_deleted && onEdit;
const canEdit = canEditOwn || canEditAdmin;

// Novo:
const isTextEditable = message.type === "text" && !message.is_deleted && !!onEdit;
const canEditOwn = isOwn && isTextEditable &&
  (isCurrentUserAdmin || (Date.now() - new Date(message.created_at).getTime()) < 10 * 60 * 1000);
const canEditAdmin = isCurrentUserAdmin && !isOwn && isTextEditable;
const canEdit = canEditOwn || canEditAdmin;
```

Isso permite que o admin edite suas próprias mensagens a qualquer momento, enquanto usuários normais continuam com o limite de 10 minutos.

Nenhuma alteração no backend (`useChat.ts`) é necessária — ele já suporta edição sem limite para admins.

