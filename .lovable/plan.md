

# Adicionar seção "Broadcasts Interrompidos" na página Principal

## Problema
A tela de Broadcast atual (image-403) mostra apenas o histórico simples. Falta a seção "Broadcasts Interrompidos" (image-404) que exibe broadcasts com status `cancelled` ou `failed` com progresso visual, estatísticas e botões de **Retomar** / **Excluir**.

## Correção

### Arquivo: `src/pages/Principal.tsx`

1. **Buscar broadcasts interrompidos**: No `fetchBroadcastHistory`, fazer uma query separada na tabela `broadcast_progress` filtrando por `status IN ('cancelled', 'failed')` onde `(sent_count + failed_count) < total_users`. Armazenar em novo state `interruptedBroadcasts`.

2. **Renderizar seção "Broadcasts Interrompidos"** entre o header e o histórico:
   - Título com ícone `AlertTriangle` e descrição
   - Para cada broadcast interrompido, exibir:
     - Título da notificação (join com `notifications`)
     - Badges de status (Interrompido/Falhou) em cores correspondentes
     - Botões **Retomar** (chama `send-broadcast` com `resume_progress_id`) e **Excluir** (deleta da `broadcast_progress`)
     - Barra de progresso com percentual
     - Grid 4 colunas: Enviados (verde), Falhas (vermelho), Bloqueados (laranja), Total (azul/primary)
     - Info de "Restantes: X usuários" e "Batch X/Y"
     - Mensagem de erro se existir

3. **Buscar dados com join**: Query `broadcast_progress` com select incluindo `notification:notifications(title)` para obter o título.

4. **Ação Excluir**: Delete do registro na `broadcast_progress` e refresh da lista.

### Estilo
- Seguir o padrão `glass-card rounded-2xl` existente
- Badges: `bg-orange-500/15 text-orange-400` para interrompido, `bg-red-500/15 text-red-400` para falhou
- Stats grid com cores iguais ao `BroadcastProgress` component existente
- Barra de progresso com gradiente orange→red

