

## Problema: Preços Exclusivos Não São Aplicados para Usuários da Rede

### Diagnóstico

O `ClientPricingModal` salva corretamente na tabela `client_pricing_rules`. Porém, a Edge Function `recarga-express` **só consulta essa tabela para o role "cliente"** (linha 691):

```text
Edge Function — fluxo atual:
  if (userRole === "cliente" && resellerId) → checa client_pricing_rules ✅
  else (userRole === "usuario")            → NÃO checa client_pricing_rules ❌
```

Os membros da rede têm role **"usuario"** (não "cliente"), e o `resellerId` só é resolvido para "cliente" (linha 563). Resultado: os preços exclusivos são salvos mas nunca lidos.

### Plano de Correção

**Arquivo**: `supabase/functions/recarga-express/index.ts`

**Mudança 1** (~linha 561-570): Resolver `resellerId` para TODOS os usuários que tenham `reseller_id` no perfil, não apenas "cliente":

```text
// ANTES: só resolve para "cliente"
if (userRole === "cliente") { resellerId = profile.reseller_id }

// DEPOIS: resolve para qualquer role
resellerId = profile.reseller_id (para todos os usuários)
```

**Mudança 2** (~linha 734-761): No bloco `else` que trata "usuario", adicionar verificação de `client_pricing_rules` antes das regras existentes:

```text
// ANTES (bloco else para "usuario"):
1. reseller_pricing_rules(own)
2. reseller_base_pricing_rules(own)
3. pricing_rules(global)

// DEPOIS:
1. client_pricing_rules (se tiver resellerId) ← NOVO
2. reseller_pricing_rules(own)
3. reseller_base_pricing_rules(own)
4. pricing_rules(global)
```

A lógica do `client_pricing_rules` para "usuario" segue o mesmo padrão do "cliente" (linha 716): `chargedCost = resolvedBase + clientRule.lucro`.

### Resultado Esperado

Quando o revendedor define R$ 16 de lucro para a recarga de R$ 20 (custo base R$ 11), o membro da rede pagará R$ 11 + R$ 16 = **R$ 27** ao fazer a recarga — independente do role ser "usuario" ou "cliente".

