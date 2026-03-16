

# Diagrama Visual da Cadeia de Indicação

## Objetivo
Adicionar um diagrama visual explicativo dentro da seção "Comissões da Rede" no Painel Principal, mostrando a hierarquia Avô → Pai → Cliente e como as comissões fluem.

## Implementação

**Arquivo**: `src/pages/Principal.tsx`

**Localização**: Logo após o header "Comissões da Rede" (linha ~3420) e antes dos cards de Comissão Direta/Indireta.

**Componente**: Um bloco visual inline com 3 nós conectados por setas, usando Tailwind puro (sem biblioteca externa):

```text
┌──────────┐      ┌──────────┐      ┌──────────┐
│   Avô    │ ───> │   Pai    │ ───> │ Cliente  │
│ (Quem    │      │ (Revend. │      │ (Faz a   │
│ indicou  │      │ imediato)│      │ recarga) │
│ o pai)   │      │          │      │          │
└──────────┘      └──────────┘      └──────────┘
     ↑                  ↑
  Comissão           Comissão
  Indireta            Direta
  (10% do lucro)    (100% do lucro)
```

**Design**:
- 3 cards/círculos horizontais com ícones (Users) conectados por setas (ArrowRight)
- Labels abaixo de cada nó explicando o papel
- Setas de comissão apontando para cima indicando quem recebe qual comissão
- Valores dinâmicos lidos de `globalConfig` (directCommissionPercent e indirectCommissionPercent)
- Estilo glass-card com cores temáticas (purple para Avô, primary para Pai, emerald para Cliente)
- Responsivo: horizontal em desktop, vertical em mobile

**Mudanças**:
1. Inserir o diagrama entre linhas 3420-3422 (após o subtitle, antes do card de Comissão Direta)
2. Sem novas dependências ou imports necessários

