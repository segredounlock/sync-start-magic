

# Corrigir diagnóstico do mirror — repo errado

## Problema
O painel está buscando workflow runs do repo **selecionado** (`sync-start-magic` = destino), mas o workflow `sync-mirror.yml` existe no repo **de origem** (o repo conectado ao Lovable). Por isso mostra "Falhou" no painel mas "Sucesso" no GitHub.

O diagnóstico também mostra origem e destino iguais (`sync-start-magic` / `sync-start-magic`), o que está incorreto.

## Solução

### 1. Identificar o repo de origem
O repo de origem é o conectado ao Lovable (provavelmente `segredounlock/recargas-brasil-v2`). Precisamos:
- Buscar o repo de origem da tabela `system_config` ou detectá-lo da lista de repos
- Diferenciar claramente entre **repo origem** (onde está o workflow) e **repo destino** (mirror)

### 2. Alterar `BackupSection.tsx`
- Na função `loadWorkflowRuns`, buscar runs do **repo de origem** (não do `selectedRepo` quando este for o destino)
- Atualizar o diagnóstico para mostrar os repos corretos:
  - Repo origem: o repo do Lovable (onde o workflow vive)
  - Mirror destino: `sync-start-magic`
- Adicionar lógica para identificar qual repo é a origem vs destino

### 3. Alterar as funções de trigger e logs
- `triggerWorkflow` e `loadWorkflowLogs` também precisam apontar para o repo de origem

### Arquivo a alterar
- `src/components/BackupSection.tsx` — corrigir repo usado nas chamadas de workflow runs/logs/trigger

