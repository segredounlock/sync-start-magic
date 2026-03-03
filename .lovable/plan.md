

## Plano: Corrigir preview de resposta mostrando "Áudio" para imagens

### Problema
Na `MessageBubble.tsx` linha 470, o preview de resposta (reply) usa:
```typescript
{message.reply_to.content || "🎤 Áudio"}
```
Quando `content` é null (caso de imagens e áudios), **sempre** mostra "🎤 Áudio", mesmo quando a mensagem original era uma imagem. É o bug mostrado na screenshot (círculo amarelo).

### Correção
Substituir o fallback fixo por verificação do `type`, igual já é feito corretamente em outros locais (ChatWindow linhas 512 e 648):

**`src/components/chat/MessageBubble.tsx` linha 470:**
```typescript
// De:
{message.reply_to.content || "🎤 Áudio"}
// Para:
{message.reply_to.content || (message.reply_to.type === "audio" ? "🎤 Áudio" : "📷 Imagem")}
```

Também adicionar thumbnail da imagem no preview de resposta para melhor contexto visual.

### Impacto
- Correção de 1 linha principal
- Preview de resposta passa a mostrar o ícone/texto correto para cada tipo de mensagem

