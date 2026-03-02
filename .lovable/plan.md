

## Diagnóstico

O bot fica pedindo e-mail repetidamente porque a função `createAccountAndLink` tem um bug na **linha 614**: ela referencia a variável `session` que **não existe** naquele escopo. O erro nos logs confirma:

```
ReferenceError: session is not defined
    at createAccountAndLink (telegram-bot/index.ts:691:18)
```

### O que acontece:
1. Usuário digita o e-mail
2. O bot tenta criar a conta via `createAccountAndLink`
3. A função crasheia na linha 614 ao tentar ler `session.data?.telegram_username`
4. O `telegram_id` nunca é salvo no perfil
5. O bot não reconhece o usuário como vinculado e pede e-mail de novo

## Correção

Alterar a função `createAccountAndLink` para receber o `telegram_username` como parâmetro (já disponível no `session.data` do chamador) em vez de tentar acessar `session` diretamente.

### Alterações:

**Arquivo: `supabase/functions/telegram-bot/index.ts`**

1. Mudar a assinatura de `createAccountAndLink` para incluir `telegramUsername: string`
2. Na **linha 614**, trocar `session.data?.telegram_username` por `telegramUsername`
3. No chamador (`handleEmailStep`, linha 542), passar `session.data?.telegram_username || ""` como argumento

Isso resolve tanto o crash quanto o loop de pedir e-mail.

