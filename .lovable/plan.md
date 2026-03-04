

## Plano: Limpar comprovante Telegram para cliente final + botão de compartilhar nativo

### Contexto
O comprovante enviado no Telegram é para o **cliente final** do revendedor. Portanto, informações internas (saldo, cobrado, nome "Recargas Brasil") devem ser removidas. Além disso, o botão "Compartilhar" deve abrir o menu nativo do Telegram para encaminhar a imagem diretamente para WhatsApp ou outros apps.

### Alterações na Edge Function `telegram-notify/index.ts`

**1. Imagem do comprovante — remover campos desnecessários:**
- Remover "Recargas Brasil" do cabeçalho (linha 146)
- Manter apenas o título "Comprovante de Recarga"
- Remover a linha `row("💲", "Cobrado", ...)` — já não existe na imagem atual, mas existe no **caption texto** (linha 344)
- Remover `novo_saldo` da imagem (não exibir saldo do revendedor ao cliente)
- Manter apenas: Telefone, Operadora, Valor da Recarga, Data/Hora, ID do Pedido, badge "Recarga Concluída"

**2. Caption texto — limpar também:**
- Remover linha `💰 Cobrado:` (linha 344)
- Remover linha `💳 Novo saldo:` (linha 346)
- Manter apenas: Telefone, Operadora, Valor da Recarga

**3. Botão de compartilhar — usar `forward` nativo do Telegram:**
- Substituir o `inline_keyboard` com `switch_inline_query` (que não funciona bem para imagens) por um botão que usa a API `forwardMessage` ou, mais eficaz, simplesmente **não incluir inline keyboard** e confiar no botão nativo de "Encaminhar" do Telegram
- **Alternativa melhor**: Usar `reply_markup` com um botão `callback_data` que instrui o bot a reenviar a mensagem via `copyMessage` para um contato escolhido — porém isso é complexo
- **Solução prática**: Remover o `reply_markup` com `switch_inline_query` (que abre inline query, não share nativo). Em vez disso, enviar a foto **sem** reply_markup — o Telegram já possui nativamente o botão de encaminhar/compartilhar em qualquer mensagem. O cliente pode tocar na imagem → menu de 3 pontos → Encaminhar → escolher WhatsApp/contato

### Detalhes técnicos

| Item | Ação |
|------|------|
| Linha 143-146 | Remover "Recargas Brasil", manter só "Comprovante de Recarga" |
| Linha 185 (imagem) | Manter valor da recarga |
| Remover da imagem | `novo_saldo` (não exibir) |
| Linha 344 (caption) | Remover "Cobrado" |
| Linha 346 (caption) | Remover "Novo saldo" |
| Linhas 274-278 | Remover `reply_markup` inline keyboard |
| Footer da imagem | Manter "Comprovante gerado em..." (sem "Recargas Brasil") |

O compartilhamento nativo do Telegram (encaminhar mensagem) já permite enviar para WhatsApp via "Compartilhar" no menu de opções da mensagem — não é necessário um botão customizado.

