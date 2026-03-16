

# Mover Diagrama de Comissões para "Meus Preços"

## Contexto
O diagrama da cadeia de indicação (Avô → Revendedor → Cliente) está atualmente no Painel Principal (admin). O usuário corretamente observou que essa informação pertence ao painel do revendedor, na seção "Meus Preços", pois é lá que o dono da rede define seus lucros e precificações.

## Mudanças

### 1. Remover diagrama do Principal.tsx
- Remover o bloco do diagrama visual (linhas ~3423-3494) da seção "Comissões da Rede" no Painel Principal
- Manter os controles de configuração de comissão (Direta/Indireta) que são funções administrativas

### 2. Adicionar diagrama no MeusPrecos.tsx
- Inserir o diagrama visual logo após o header "Meus Preços" e o info badge, antes das tabs de operadoras
- Buscar os valores de `directCommissionPercent` e `indirectCommissionPercent` do `system_config` (já faz fetch de configs na mesma query)
- Adicionar imports de `Users`, `ArrowRight`, `ArrowDown`, `Smartphone` do lucide-react
- Manter tooltips com hover e design responsivo idêntico ao atual
- O diagrama será colapsável (toggle mostrar/ocultar) para não ocupar espaço permanente

### 3. Adaptar dados
- Estender o fetch existente em `MeusPrecos` para também buscar as keys `directCommissionPercent` e `indirectCommissionPercent` do `system_config`
- Usar esses valores dinâmicos nos badges do diagrama

## Arquivos afetados
- `src/pages/Principal.tsx` — remover diagrama
- `src/components/MeusPrecos.tsx` — adicionar diagrama com tooltips

