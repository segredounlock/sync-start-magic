

# Plano: Renderizar HTML formatado na seção Novidades

## Problema
As tags HTML (`<b>`, `<i>`, etc.) aparecem como texto puro nas mensagens da seção Novidades.

## Solução
Usar a função `renderTelegramHtml` já existente em `TextFormatToolbar.tsx` para sanitizar e renderizar o HTML permitido, e trocar `{item.message}` por `dangerouslySetInnerHTML`.

## Alteração

### `src/components/AtualizacoesSection.tsx`
1. Importar `renderTelegramHtml` de `@/components/TextFormatToolbar`
2. Substituir `{item.message}` por `dangerouslySetInnerHTML={{ __html: renderTelegramHtml(item.message) }}` no div da mensagem (linha ~113)

