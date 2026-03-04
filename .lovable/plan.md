

## Trocar posições dos badges na lista de conversas

### Alteração em `src/components/chat/ConversationList.tsx`:

1. **Badge esquerdo (sobre o avatar)**: Substituir o `onlineCount` pelo `unread_count` da conversa — mostrará a contagem de mensagens não lidas sobre o avatar
2. **Badge direito (ao lado do texto)**: Remover completamente o badge de `unread_count` que aparece à direita
3. Remover o import/uso de `useGroupPresence` se não for mais necessário

Resultado: apenas um badge por conversa, posicionado sobre o avatar, mostrando mensagens não lidas.

