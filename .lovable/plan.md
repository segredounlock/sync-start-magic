

## Diagnóstico

O erro de build **não tem relação com ambiente de produção vs desenvolvimento**. O problema é que o glob pattern no `sourceManifest.ts` inclui arquivos `.md` (como `README.md`), e o Vite tenta analisá-los como JavaScript, causando o erro.

## Solução

Remover `.md` do glob pattern em `src/lib/sourceManifest.ts`:

```typescript
'/*.{ts,js,json,html}',  // sem .md
```

Apenas essa linha precisa ser alterada. Uma mudança de 1 linha.

