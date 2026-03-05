

## Plano: Corrigir botão "+" de nova conversa no mobile

### Problema identificado
O botão "+" para iniciar nova conversa no chat mobile pode estar com problemas de responsividade ao toque. Possíveis causas:

1. **Área de toque pequena** — o botão atual tem apenas `p-2.5` (~40x40px), que pode ser difícil de acertar em telas menores
2. **Possível conflito de eventos** — o handler `preventZoom` (touchmove) e `touchAction: "pan-y"` podem estar interferindo em alguns dispositivos
3. **Modal sem feedback de erro** — se a lista de usuários falha ao carregar, o usuário não vê nenhum erro

### Alterações

**1. `src/pages/ChatApp.tsx`** — Aumentar área de toque do botão "+" no mobile
- Linha 113: Aumentar padding do botão de `p-2.5` para `p-3` e adicionar `min-w-[44px] min-h-[44px]` para garantir área mínima de 44x44px (padrão Apple de acessibilidade)
- Adicionar `touch-action: manipulation` no botão para evitar delay de 300ms em mobile

**2. `src/components/chat/NewChatModal.tsx`** — Melhorar feedback de erro
- Adicionar tratamento de erro no `fetchUsers` para mostrar mensagem ao usuário caso a consulta falhe
- Adicionar um botão "Tentar novamente" se a lista não carregar
- Garantir que o modal feche corretamente ao tocar fora

