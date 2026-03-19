

## Corrigir preços customizados não sendo exibidos no Painel do Revendedor

### Problema

O usuário `ferreiragreg180@gmail.com` (Neverland-Recargas) tem preços customizados pelo administrador na tabela `reseller_base_pricing_rules` (ex: CLARO R$20 → custo R$11,50), mas o painel está exibindo os preços globais (R$14,30).

**Causa raiz**: A função `fetchCatalog` no `RevendedorPainel.tsx` (linha 207-260) busca apenas `reseller_pricing_rules` (margens próprias do revendedor) e `pricing_rules` (global). Ela **nunca consulta** `reseller_base_pricing_rules` (custos base customizados pelo admin). Como Neverland-Recargas não tem nenhuma entrada em `reseller_pricing_rules`, o sistema cai no fallback global.

### Hierarquia correta de preços (que já funciona no `recarga-express` e `MeusPrecos`)

1. `reseller_pricing_rules` — margem definida pelo próprio revendedor
2. `reseller_base_pricing_rules` — custo base customizado pelo admin
3. `pricing_rules` com margem padrão global — fallback
4. `pricing_rules` direto — último fallback

### Correção

**Arquivo**: `src/pages/RevendedorPainel.tsx` — função `fetchCatalog` (~linhas 207-260)

1. Adicionar fetch de `reseller_base_pricing_rules` para o `pricingUserId` no `Promise.all`
2. Na resolução de preço de cada valor, aplicar a hierarquia correta:
   - Se tem `reseller_pricing_rules` → usa como preço final
   - Senão, se tem `reseller_base_pricing_rules` → usa `regra_valor` como custo
   - Senão → usa `pricing_rules` global (com ou sem margem padrão)

### Impacto

- Neverland-Recargas e os outros 2 usuários com preços customizados passarão a ver R$11,50 (CLARO R$20) em vez de R$14,30
- Nenhum outro usuário é afetado (quem não tem `reseller_base_pricing_rules` continua vendo preço global)
- A cobrança real na `recarga-express` já usa a hierarquia correta — esta correção alinha o frontend

