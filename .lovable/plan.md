

## Plano: Manter indicador "gravando áudio" ativo durante toda a gravação

### Problema

O `sendTyping(myNome, "recording")` é chamado **uma única vez** ao clicar no botão do microfone (linha 771 do ChatWindow). Como o typing indicator tem timeout de 4 segundos, o status "gravando áudio" desaparece rapidamente enquanto o usuário continua gravando. O outro participante vê o indicador por ~4s e depois some.

### Solução

Passar a função `sendTyping` para o `AudioRecorder` e criar um intervalo interno que reenvia o sinal `"recording"` a cada 2.5 segundos enquanto a gravação estiver ativa — mantendo o indicador visível durante toda a duração, como no WhatsApp.

### Alterações

**`src/components/chat/AudioRecorder.tsx`:**
- Adicionar prop `onTypingPing?: () => void`
- Dentro do `useEffect` de gravação, criar `setInterval` que chama `onTypingPing()` a cada 2500ms
- Limpar o intervalo no cleanup e ao parar a gravação

**`src/components/chat/ChatWindow.tsx`:**
- Passar `onTypingPing={() => sendTyping(myNome, "recording")}` para o `<AudioRecorder />`
- Manter o `sendStopTyping()` existente no `onCancel` e `onSend`

### Impacto
- Indicador "gravando áudio..." permanece visível para o outro usuário durante toda a gravação
- ~10 linhas adicionadas no total

