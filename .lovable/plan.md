

## Plano: Sincronizar operadoras locais com o catálogo da API

### Problema
A Claro foi removida do catálogo da API externa, mas a tabela local `operadoras` ainda a marca como `ativo = true`. O painel do revendedor usa a tabela local para montar o catálogo, por isso a Claro continua aparecendo.

### Solução em 2 partes

**Parte 1 — Correção imediata: Desativar a Claro no banco**
- Executar `UPDATE operadoras SET ativo = false WHERE nome = 'Claro'` para remover imediatamente.

**Parte 2 — Sincronização automática no Principal.tsx**
O painel Principal (`/principal`) já faz fetch do catálogo da API na seção de Precificação. Adicionar lógica para:
1. Após buscar o catálogo da API, comparar os nomes das operadoras retornadas com as operadoras locais ativas.
2. Operadoras locais que **não existem** no catálogo da API serão automaticamente marcadas como `ativo = false`.
3. Operadoras que **voltarem** ao catálogo serão reativadas (`ativo = true`).

Isso acontecerá toda vez que o admin principal abrir a seção de Precificação — sem necessidade de ação manual.

**Arquivo alterado:** `src/pages/Principal.tsx` (dentro da função `loadPricingData` que já faz fetch do catálogo)

### Resultado
- Claro desaparece imediatamente do sistema
- Futuras remoções/adições de operadoras pela API serão refletidas automaticamente

