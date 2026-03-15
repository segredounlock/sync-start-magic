

# Plano: Resetar Usuários Bloqueados do Telegram

## O que será feito

1. **Resetar todos os 20 usuários** marcados como `is_blocked = true` na tabela `telegram_users`, voltando para `is_blocked = false` e limpando o `block_reason`
2. Isso permitirá que o próximo broadcast tente enviar para todos, e o sistema automaticamente re-marcará os que realmente bloquearam o bot

## Detalhes técnicos

- Executar `UPDATE telegram_users SET is_blocked = false, block_reason = NULL WHERE is_blocked = true`
- Nenhuma alteração de código necessária -- o `send-broadcast` já marca automaticamente quem retornar erro 403 como bloqueado

## Resultado esperado

- Todos os 685+ usuários receberão tentativa de envio no próximo broadcast
- Os que realmente bloquearam o bot serão re-identificados e marcados automaticamente
- Você terá um retrato fiel de quem está ativo e quem não está

