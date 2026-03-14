

# Plano: Enviar notificação de atualização da Raspadinha via Telegram

## Mensagem proposta

**Título:** 🎰 Raspadinha Atualizada!

**Mensagem (HTML):**
```
🎰 <b>Raspadinha Atualizada!</b>

Novidades na sua raspadinha diária:

✅ Agora com <b>múltiplos níveis de prêmio</b> — mais chances de ganhar!
🎁 Prêmios vão de centavos a valores maiores
⚡ Ganhos são creditados automaticamente no seu saldo

Acesse agora e raspe a sua! 🍀
```

**Efeito sugerido:** Confete 🎉 (`5046509860389126442`)

## Destinatários
- **635 usuários** registrados e ativos no Telegram

## Execução
1. Inserir registro na tabela `notifications` com título, mensagem e efeito de confete
2. Criar registro em `broadcast_progress` vinculado à notificação
3. Invocar a Edge Function `send-broadcast` com o ID da notificação e do progresso para disparar o envio

## Arquivos alterados
Nenhum — apenas operações no banco de dados e invocação de função existente.

