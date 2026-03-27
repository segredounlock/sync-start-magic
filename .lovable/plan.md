

# Remover Timeout de Segurança do AuthProvider

## O que será removido
O `Promise.race` com timeout de 5 segundos no `src/hooks/useAuth.tsx` que força estado "sem sessão" quando o `getSession()` demora.

## Alteração
No `src/hooks/useAuth.tsx`, substituir o bloco `Promise.race` por uma chamada direta:

```ts
// DE:
const result = await Promise.race([
  supabase.auth.getSession(),
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("getSession timeout")), 5000)
  ),
]);

// PARA:
const result = await supabase.auth.getSession();
```

Remover também o `try/catch` associado ao timeout (o comentário "Timeout or error"), simplificando o fluxo de hidratação.

