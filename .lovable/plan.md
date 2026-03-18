

## Enviar mensagem para Erica (Recargas Brasil)

### Situação
- Usuária: **Erica Ferreira Dutra** (Recargas Brasil)
- Telegram ID: `6363075028`
- Atraso confirmado: depósito de R$ 50,00 levou ~16 minutos para confirmar (19:48 → 20:04)
- Depósito de R$ 15,00 expirou sem pagamento

**Observação:** Este perfil (d74ea4f9) é o mesmo que aparece como "Recargas Brasil" — possivelmente sua própria conta admin.

### Plano
Enviar mensagem via `telegram-notify` Edge Function com a mesma abordagem usada para a Maiara, adaptada com o valor correto (R$ 50,00).

### Mensagem
```
Olá Erica! 👋

Aqui é da equipe Recargas Brasil.

Informamos que nosso sistema passou por uma lentidão temporária,
e por isso o seu PIX de R$ 50,00 demorou alguns minutos a mais
para ser confirmado. Pedimos desculpas pelo transtorno!

✅ Trabalhamos com seriedade e transparência. Todo pagamento
confirmado é creditado automaticamente no seu saldo.

📢 Temos um grupo de suporte onde você pode tirar dúvidas
e acompanhar novidades em tempo real.

💬 Se precisar de qualquer ajuda, estamos à disposição!

Atenciosamente,
🇧🇷 Equipe Recargas Brasil
```

### Execução
Chamar a Edge Function `telegram-notify` com `chat_id: "6363075028"` e a mensagem acima.

