

# Plano: Remover comando /recarga e atalho de texto livre no bot Telegram

## Problema
O cliente digitou `21992560846 100` diretamente no bot. Como o valor R$100 não existia no catálogo da Claro, o `executeRecarga` pegou o primeiro carrier que tinha R$100 (TIM), resultando em recarga na operadora errada. O fluxo por botões (`menu_recarga`) já resolve isso corretamente, pois o usuário escolhe a operadora primeiro.

## O que será feito
1. **Remover o comando `/recarga`** — quando digitado, ao invés de pedir "TELEFONE VALOR", redirecionar para o menu de seleção de operadoras (`menu_recarga`).
2. **Remover o atalho de texto livre** (`TELEFONE VALOR` sem comando) — o quick match `^(\d{10,11})\s+([\d.,]+)$` será removido.
3. **Atualizar a mensagem de ajuda** — remover referências ao atalho de texto.

## Detalhes técnicos (Edge Function `telegram-bot/index.ts`)

### Alteração 1 — `/recarga` redireciona para menu de operadoras (linha ~532-533)
Ao invés de chamar `handleRecarga`, enviar a mensagem com seleção de operadoras (mesmo fluxo do callback `menu_recarga`).

### Alteração 2 — Remover quick match de texto livre (linhas ~547-553)
O bloco `else` que faz `text.match(/^(\d{10,11})\s+([\d.,]+)$/)` e chama `executeRecarga` será removido. Texto não reconhecido exibirá apenas a ajuda.

### Alteração 3 — Remover função `handleRecarga` (linhas ~790-800)
Função não mais necessária.

### Alteração 4 — Atualizar `handleAjuda` (linha ~1595)
Remover referência ao atalho `telefone valor`.

