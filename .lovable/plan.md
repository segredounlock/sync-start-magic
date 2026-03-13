

# Adicionar toolbar de formatação no campo de mensagem do Broadcast

## Contexto
O Telegram usa `parse_mode: "HTML"` nos broadcasts. Precisamos de uma toolbar flutuante (estilo WhatsApp) que aparece ao selecionar texto no textarea, permitindo aplicar formatação HTML.

## Implementação

### Arquivo: `src/components/BroadcastForm.tsx`

1. **Toolbar flutuante**: Criar uma barra que aparece ao selecionar texto no textarea com os botões:
   - **B** (Negrito) → envolve com `<b>...</b>`
   - **I** (Itálico) → envolve com `<i>...</i>`
   - **S** (Tachado) → envolve com `<s>...</s>`
   - **<>** (Código) → envolve com `<code>...</code>`
   - **" "** (Citação) → envolve com `<blockquote>...</blockquote>`
   - **🔗** (Link) → envolve com `<a href="URL">...</a>` (prompt para URL)

2. **Lógica**:
   - Detectar `onSelect` / `onMouseUp` no textarea para capturar `selectionStart` e `selectionEnd`
   - Posicionar a toolbar acima da seleção usando coordenadas do textarea
   - Ao clicar num botão, substituir o texto selecionado pela versão com tags HTML
   - Esconder toolbar ao clicar fora ou quando não há seleção

3. **Preview**: A prévia do Telegram já exibe o texto — atualizar para renderizar as tags HTML visualmente (converter `<b>` em `<strong>`, etc.) usando `dangerouslySetInnerHTML` com sanitização básica (apenas tags permitidas pelo Telegram).

### Estilo
- Toolbar escura com cantos arredondados (igual à imagem de referência)
- Ícones brancos, hover com destaque
- Posição `absolute` relativa ao container do textarea

