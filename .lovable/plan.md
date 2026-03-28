

# Corrigir Problemas de Sincronizacao no Espelho

## Problema
O espelho recebeu erros de build porque:
1. `Principal.tsx` importa `LicenseManager` via `lazy()`, mas o sync remove `LicenseManager.tsx` -- resultado: erro de modulo nao encontrado
2. O Lovable do espelho tentou corrigir sozinho e criou um `LicenseManager` falso, alem de mexer em tipos de outros arquivos (`BannersManager`, `UserRecargasModal`, `AntifraudSection`, etc.)

## Solucao

### Estrategia: Enviar um `LicenseManager.tsx` stub para o espelho
Em vez de remover `LicenseManager.tsx` no sync, vamos **parar de remove-lo** e fazer com que ele **detecte automaticamente** se esta no servidor principal ou no espelho:
- No servidor principal (`recargasbrasill.com`): mostra o painel completo de gestao de licencas (comportamento atual)
- No espelho: mostra mensagem "Este recurso esta disponivel apenas no servidor principal"

Isso elimina o erro de build sem precisar modificar `Principal.tsx` e sem precisar de logica condicional no sync.

### Alteracoes

1. **`src/components/LicenseManager.tsx`** -- Adicionar verificacao de dominio no inicio do componente. Se nao for `recargasbrasill.com`, renderizar uma mensagem informativa. Se for, renderizar o painel completo (codigo atual).

2. **`.github/workflows/sync-mirror.yml`** -- Remover a linha `rm -f src/components/LicenseManager.tsx` para que o espelho receba o componente.

3. **`supabase/functions/github-sync/index.ts`** -- Remover `src/components/LicenseManager.tsx` da lista de `protectedPaths`.

A edge function `license-generate/` continua sendo removida do espelho -- mesmo que alguem acesse o `LicenseManager` no espelho, ele nao tera o backend para gerar licencas.

## Resultado
- Espelho compila sem erros
- O componente existe mas e inutil no espelho (sem backend + mensagem informativa)
- Servidor principal continua funcionando normalmente
- Nenhuma alteracao em `Principal.tsx`

