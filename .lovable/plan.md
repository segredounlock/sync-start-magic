

# Corrigir sender_role do Admin no Suporte via Telegram

## Problema
Quando o admin responde pelo Telegram no fluxo de suporte, a mensagem é salva com `sender_role: "client"` porque o `handleSupportMessage` sempre usa esse valor fixo (linha 2063). O admin deveria aparecer como "admin".

## Causa Raiz
A função `handleSupportMessage` em `telegram-bot/index.ts` hardcoda `sender_role: "client"` sem verificar se o remetente é um admin.

## Solução

**Arquivo:** `supabase/functions/telegram-bot/index.ts`

Na função `handleSupportMessage`, antes de inserir na `support_messages`:

1. Verificar se o `user` (linked user) tem role "admin" na tabela `user_roles`
2. Se sim, usar `sender_role: "admin"`, senão manter `"client"`

Alteração na área da linha ~2058-2066:

```ts
// Determine sender role
let senderRole = "client";
if (user?.id) {
  const { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (roleData) senderRole = "admin";
}

const { error: msgError } = await supabase.from("support_messages").insert({
  ticket_id: ticketId,
  sender_id: senderId,
  sender_role: senderRole,
  message: messageText,
  image_url: imageUrl,
  origin: "telegram",
});
```

Isso garante que quando um admin responde pelo Telegram via sessão de suporte, a mensagem aparece corretamente como "admin" no widget de suporte.

