

# Corrigir Preços Incorretos: Limpar e Proteger reseller_pricing_rules

## Problema Confirmado

Encontrei **34 usuários com cargo "usuario"** que têm regras em `reseller_pricing_rules` (incluindo o Vitinho com 15 regras). O "Meus Preços" foi projetado para revendedores definirem preços de venda para sua rede, mas usuários comuns também configuraram -- e o sistema usa essas regras para cobrar DELES na hora da recarga (linha 772-780 do `recarga-express`).

Exemplo do Vitinho: ele configurou `regra_valor = 15` para TIM R$20, achando que era o preço de venda para sua rede. Mas quando ELE faz uma recarga, o sistema cobra R$15 dele (em vez do custo base real).

## Plano

### 1. Limpar regras de usuários comuns (Migração SQL)

Deletar todas as entradas em `reseller_pricing_rules` para usuários com role "usuario" que **não têm ninguém na rede** (nenhum perfil com `reseller_id` apontando para eles). São regras inúteis que só causam cobrança errada.

Para usuários "usuario" que TÊM rede (funcionam como mini-revendedores), manter as regras pois elas servem para precificar a rede deles.

### 2. Corrigir lógica de cobrança no recarga-express

No bloco `else` (linha 734-799 do `recarga-express/index.ts`), quando um "usuario" faz recarga:

- Se ele tem `reseller_id` (está na rede de alguém), usar o preço do revendedor dele (não as próprias regras)
- Só usar `reseller_pricing_rules` do próprio usuário se ele **tem membros na rede** (ou seja, funciona como revendedor)

Lógica atual (problemática):
1. Verifica `client_pricing_rules` via reseller
2. Se não achou, usa `reseller_pricing_rules` do PRÓPRIO usuário ← **ERRO**

Lógica corrigida:
1. Verifica `client_pricing_rules` via reseller
2. Se tem `reseller_id`, usa preço do revendedor (`reseller_pricing_rules` do reseller)
3. Só usa regras próprias se o usuário tem rede própria

### 3. Esconder "Meus Preços" para quem não tem rede

No `RevendedorPainel.tsx`, só mostrar o menu "Meus Preços" se o usuário tem pelo menos 1 membro na rede (ou é admin/revendedor). Usuários sem rede não precisam desse recurso.

## Arquivos Modificados

1. **Migração SQL** -- Deletar regras órfãs de usuários sem rede
2. **supabase/functions/recarga-express/index.ts** -- Corrigir lógica de cobrança no bloco else
3. **src/pages/RevendedorPainel.tsx** -- Condicionar exibição do menu "Meus Preços"

## Resultado

- Todos os 34 usuários sem rede terão suas regras removidas
- Cobranças futuras usarão o preço correto (custo base do admin ou preço global)
- "Meus Preços" só aparece para quem realmente precisa

