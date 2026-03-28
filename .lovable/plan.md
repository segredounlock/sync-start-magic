

# Corrigir Erros de Build do LicenseManager no Espelho

## Problema
O espelho nao tem a tabela `licenses` no banco de dados. Como o `types.ts` e gerado automaticamente a partir do banco, `supabase.from("licenses")` causa erro de TypeScript no espelho porque `"licenses"` nao e um nome de tabela valido nos tipos dele. O Lovable do espelho tentou "corrigir" sozinho e acabou mexendo em `src/types/index.ts`, `UserRecargasModal.tsx`, `RevendedorPainel.tsx` etc., criando mais problemas.

## Solucao
Fazer o `LicenseManager.tsx` usar queries "untyped" para a tabela `licenses`, evitando dependencia dos tipos gerados. Trocar:

```typescript
supabase.from("licenses")
```

Por:

```typescript
(supabase as any).from("licenses")
```

Isso em **3 locais**: `fetchLicenses`, `handleToggle` e `handleDelete`. Com isso, mesmo que o espelho nao tenha a tabela `licenses` nos tipos, o TypeScript nao reclama. E como o componente so renderiza o conteudo no dominio principal, as queries nunca serao executadas no espelho.

## Alteracoes
1. **`src/components/LicenseManager.tsx`** -- Usar `(supabase as any).from("licenses")` nos 3 locais de query

## Resultado
- Build compila sem erros tanto no servidor principal quanto no espelho
- Nenhum outro arquivo precisa ser alterado
- O espelho do usuario precisara reverter as mudancas que o Lovable de la fez nos tipos/componentes (ou aguardar o proximo sync forcar)

