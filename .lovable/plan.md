

# Corrigir Build do auth-email-hook (Tela Branca pós-sync)

## Problema
O `deno.json` do `auth-email-hook` não declara as dependências `@lovable.dev/webhooks-js` e `@lovable.dev/email-js`. O Deno no espelho não consegue resolver esses imports `npm:`, quebrando o deploy da edge function.

## Correção

### `supabase/functions/auth-email-hook/deno.json`
Adicionar `nodeModulesDir` e mapa de imports:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "npm:react@18.3.1",
    "types": ["npm:@types/react@18.3.1"]
  },
  "nodeModulesDir": "auto",
  "imports": {
    "@lovable.dev/webhooks-js": "npm:@lovable.dev/webhooks-js",
    "@lovable.dev/email-js": "npm:@lovable.dev/email-js"
  }
}
```

### Nenhuma outra alteração necessária
- O código do `index.ts` já usa `npm:` prefix nos imports — está correto
- A tela branca do espelho por falta de dados/RPCs já foi resolvida nas migrations anteriores
- O espelho precisa de **Publish** após cada sync para aplicar migrations no banco

## Resultado
- Edge function `auth-email-hook` deploya sem erro no espelho
- 1 arquivo alterado: `supabase/functions/auth-email-hook/deno.json`

