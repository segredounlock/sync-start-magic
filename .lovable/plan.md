

# Corrigir: Nome/Logo do Site Não Atualiza Após Salvar

## Problema
O hook `useSiteName` (e `useSiteLogo`) usa cache em memória com TTL de 5 minutos. Quando o admin salva um novo nome em "Configurações Gerais", o cache não é invalidado — os componentes continuam mostrando o valor antigo.

## Solução
Adicionar funções de invalidação de cache nos hooks e chamá-las após salvar.

### 1. `src/hooks/useSiteName.ts`
Exportar função `invalidateSiteNameCache()` que:
- Limpa o `memoryCache` (seta `null`)
- Remove `cached_site_name` do localStorage

### 2. `src/hooks/useSiteLogo.ts`
Exportar função `invalidateSiteLogoCache()` que:
- Limpa o `memoryCache` (seta `null`)
- Remove `cached_site_logo` do localStorage

### 3. `src/pages/Principal.tsx`
Na função `saveGlobalConfig`, após o upsert com sucesso:
- Chamar `invalidateSiteNameCache()`
- Chamar `invalidateSiteLogoCache()`
- Forçar re-render disparando um evento customizado (`window.dispatchEvent(new Event("site-branding-updated"))`)

### 4. Nos hooks, escutar o evento
Adicionar listener para `"site-branding-updated"` que refaz o fetch do banco, ignorando o cache.

## Resultado
- Admin salva nome → todos os componentes atualizam imediatamente
- Admin faz upload de logo → mesma coisa
- Sem necessidade de recarregar a página

## Arquivos
1. `src/hooks/useSiteName.ts` — adicionar invalidação + listener de evento
2. `src/hooks/useSiteLogo.ts` — adicionar invalidação + listener de evento
3. `src/pages/Principal.tsx` — chamar invalidação após salvar

