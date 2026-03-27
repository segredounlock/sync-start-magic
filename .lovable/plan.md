

# Adicionar Descrição e Texto Inicial do Bot Telegram

## Problema
Quando alguém abre o bot pela primeira vez, a tela está quase vazia — só mostra "O que este bot pode fazer?" com uma linha genérica. Não há descrição rica nem texto de boas-vindas.

## Solução
Adicionar chamadas às APIs `setMyDescription` e `setMyShortDescription` do Telegram na função `telegram-setup`, que já roda ao configurar o bot.

## Alteração

**Arquivo:** `supabase/functions/telegram-setup/index.ts`

Após o bloco de `setMyCommands` (linha ~84), adicionar duas chamadas:

1. **`setMyShortDescription`** — texto curto que aparece no perfil do bot (160 chars):
   - Ex: `"Recargas de celular com os melhores preços do Brasil! 📱💰"`

2. **`setMyDescription`** — texto longo que aparece na tela inicial antes do /start (512 chars):
   - Ex: `"🇧🇷 Recargas Brasil — Bot Oficial\n\n📱 Recargas de celular para todas as operadoras\n💰 Melhores preços do mercado\n⚡ Recarga instantânea\n🔒 Pagamento seguro via PIX\n\n✅ Clique em INICIAR para começar!"`

Ambas as chamadas seguem o mesmo padrão `fetch` já usado para `setMyCommands`. Erros não-fatais (apenas logados).

