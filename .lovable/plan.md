

## Diagnóstico Confirmado

Exatamente isso. O código atual trata todos os usuários igual — prioriza `reseller_pricing_rules` (preço de VENDA para a rede) sobre `reseller_base_pricing_rules` (CUSTO real do usuário). Para um "usuario" que não tem rede, o que importa é o custo que o admin definiu para ele (`reseller_base_pricing_rules`), não o preço de venda.

```text
Lógica ATUAL (bugada para usuario):
  1. reseller_pricing_rules  ← preço de VENDA (ex: R$ 28,00) ❌ mostra isso
  2. reseller_base_pricing_rules ← custo real (ex: R$ 11,50)
  3. margem padrão global
  4. pricing_rules global

  Edge Function cobra: reseller_base_pricing_rules → R$ 11,50
  UI mostra: reseller_pricing_rules → R$ 28,00
  → CONFLITO ❌

Lógica CORRIGIDA (quando NÃO é client mode):
  1. reseller_base_pricing_rules ← custo real (ex: R$ 11,50) ✅
  2. margem padrão global
  3. pricing_rules global
  (reseller_pricing_rules só usado em client mode)
```

## Plano

### Arquivo: `src/pages/RevendedorPainel.tsx` — função `fetchCatalog` (~linhas 235-260)

Inverter a prioridade quando `isClientMode = false`:

- **Se `isClientMode = true`** (cliente vendo loja): manter ordem atual — `reseller_pricing_rules` → `reseller_base_pricing_rules` → margem global → global
- **Se `isClientMode = false`** (usuario/revendedor vendo seu painel): pular `reseller_pricing_rules` — usar `reseller_base_pricing_rules` → margem global → global

Isso alinha a exibição do catálogo com a lógica de cobrança da Edge Function `recarga-express`, que já usa `reseller_base_pricing_rules` como custo real.

