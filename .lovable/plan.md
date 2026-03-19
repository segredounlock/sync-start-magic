

# Plano: Reimplementar Configuração de Comissões da Rede

## Situação Atual

A funcionalidade **já existe** inline no arquivo `src/pages/Principal.tsx` (linhas 3507-3600), dentro da aba "Rede" das Configurações do admin. Porém está embutida diretamente no mega-arquivo Principal.tsx (~5187 linhas), sem validação robusta, sem estado de loading/saving dedicado, e sem feedback visual claro de salvamento.

## O que será feito

### 1. Criar componente dedicado `NetworkCommissionConfig.tsx`

**Arquivo:** `src/components/NetworkCommissionConfig.tsx`

Componente standalone com:
- Estado próprio de loading (ao buscar config) e saving (ao salvar)
- Busca as 4 chaves do `system_config` ao montar: `directCommissionEnabled`, `directCommissionPercent`, `indirectCommissionEnabled`, `indirectCommissionPercent`
- Toggles para ativar/desativar cada comissão
- Inputs numéricos com validação (min 0, max 100, sem negativos)
- Botão "Salvar" explícito com feedback visual (toast de sucesso/erro)
- Upsert idempotente no `system_config` (cria a chave se não existir)
- Card de resumo explicativo no topo
- Layout organizado com cards separados para direta e indireta

### 2. Substituir o bloco inline em Principal.tsx

Remover as linhas 3507-3600 do Principal.tsx e substituir por:
```tsx
<NetworkCommissionConfig />
```

### 3. Localização na tela

Painel Admin → Configurações → aba **Rede** → seção "Configurações de Comissão da Rede" (mesma posição atual, mas agora como componente dedicado e mais completo).

### Chaves utilizadas (sem alteração)
- `directCommissionEnabled` (padrão: `"true"`)
- `directCommissionPercent` (padrão: `"100"`)
- `indirectCommissionEnabled` (padrão: `"true"`)
- `indirectCommissionPercent` (padrão: `"10"`)

### Compatibilidade
Nenhuma mudança no banco de dados. Mesmas chaves do `system_config` já usadas pela Edge Function `recarga-express`.

