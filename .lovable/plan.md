

# Resultado da Verificação: Mini App, Site e Página Pública

## Mini App (TelegramMiniApp.tsx) — SEM ERRO
- Usa `userCost` (custo real) para validar saldo na tela de confirmação
- Envia `valueId` para a Edge Function `recarga-express`, que recalcula o custo no servidor
- Tudo correto

## Site / Painel do Revendedor (RevendedorPainel.tsx) — SEM ERRO
- Resolve `pricing_rules` e `reseller_pricing_rules` ao carregar o catálogo
- `selectedValue.cost` já contém o custo real do revendedor
- Validação de saldo e cobrança estão corretos

## Página Pública de Recarga (RecargaPublica.tsx) — BUG ENCONTRADO

**Problema:** A página pública (`/r/:slug`) faz a recarga diretamente pelo banco de dados, sem passar pela Edge Function `recarga-express`. Isso causa:

1. **Validação de saldo errada** — compara `saldo < selectedValor` (valor de face, ex: R$ 20) em vez do custo real (ex: R$ 12)
2. **Cobrança errada** — insere `custo: selectedValor` e debita o valor facial do saldo do revendedor
3. **Sem integração com API** — não envia a recarga para o provedor externo (RecargaExpress API), apenas marca como "completed" no banco

Esse fluxo parece ser legado e não foi atualizado quando o sistema migrou para a arquitetura unificada via `recarga-express`.

## Correção Proposta

Alterar `RecargaPublica.tsx` para usar a Edge Function `recarga-express` (mesma lógica do Mini App e Painel), que:
- Resolve o custo real via regras de preço
- Valida saldo corretamente no servidor
- Envia a recarga para a API do provedor
- Debita o valor correto do saldo

Isso alinha todos os 4 canais (Painel, Mini App, Bot Telegram, Página Pública) na mesma arquitetura.

