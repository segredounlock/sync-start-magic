

## Correção: efeito shimmer faltando no privado e grupo

### Problema identificado

No `useChat.ts` (linha 236), ao carregar o perfil do usuário logado para cache, apenas o campo `nome` é buscado:

```typescript
supabase.from("profiles").select("nome").eq("id", user.id)
```

O `verification_badge` **não é incluído** nessa consulta inicial. Quando o usuário envia uma mensagem, o dado otimista usa `senderCache.get(user.id)?.verification_badge`, que pode estar `null` se o perfil do próprio usuário ainda não foi carregado via `enrichMessages` (ex: conversa nova sem mensagens anteriores).

Além disso, o resultado dessa query é salvo em `cachedNome.current` mas **não** no `senderCache`, então mesmo buscando `verification_badge` aqui, o senderCache não teria o dado.

### Correção

**`src/hooks/useChat.ts` — linha 236:**

Expandir a query para incluir `avatar_url` e `verification_badge`, e popular o `senderCache` com esses dados:

```typescript
supabase.from("profiles").select("nome, avatar_url, verification_badge").eq("id", user.id).maybeSingle().then(({ data }) => {
  if (data?.nome) cachedNome.current = data.nome;
  if (data) {
    senderCache.set(user.id, {
      nome: data.nome,
      avatar_url: data.avatar_url,
      verification_badge: data.verification_badge,
    });
  }
});
```

### Impacto
- 1 arquivo alterado, ~5 linhas
- Garante que mensagens próprias sempre tenham o `verification_badge` disponível para o efeito shimmer, tanto em chats privados quanto em grupos

