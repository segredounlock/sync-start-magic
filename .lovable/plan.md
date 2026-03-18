

## Enviar Mensagem Direta no Telegram

### Situação

Identifiquei a usuária: **Maiara Vitoria Alves do Nascimento** (Telegram ID: `5330912097`). Porém, não há uma edge function dedicada para envio de mensagens diretas pelo admin — o bot existente (`telegram-bot`) é voltado para receber webhooks.

### Plano

**1. Criar edge function `telegram-send-dm/index.ts`**

Uma função simples que recebe `chat_id` e `text`, e envia via Telegram Bot API usando o token do `system_config`.

**2. Enviar a mensagem para a Maiara**

Após deploy, chamar a função com a seguinte mensagem:

```
Olá Maiara! 👋

Aqui é da equipe Recargas Brasil.

Gostaríamos de informar que nosso sistema passou por uma lentidão
temporária, e por isso o seu PIX de R$ 20,00 não foi confirmado
de forma imediata. Pedimos desculpas pelo transtorno!

✅ Trabalhamos com seriedade e transparência. Todo pagamento
confirmado é creditado automaticamente no seu saldo.

📢 Temos um grupo de suporte onde você pode tirar dúvidas
e acompanhar novidades em tempo real.

💬 Se precisar de qualquer ajuda, estamos à disposição!

Atenciosamente,
🇧🇷 Equipe Recargas Brasil
```

### Arquivo criado

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/telegram-send-dm/index.ts` | Edge function para enviar mensagens diretas via bot do Telegram |

Essa função ficará disponível para uso futuro sempre que precisar enviar mensagens individuais a usuários.

