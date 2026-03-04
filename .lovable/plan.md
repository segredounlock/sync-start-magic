

## Plano: Filtro configuravel de usuarios no "Nova Conversa"

### Problema atual
O modal "Nova Conversa" filtra apenas admins (`user_roles.role = 'admin'`). O usuario quer que apareçam **admins + usuarios com selo de verificação**, e que isso seja configuravel no Painel Principal (aba Bate-papo).

### Alterações

**1. Adicionar configuração `chat_new_conv_filter` na `system_config`**

Nova chave na tabela `system_config`:
- `chat_new_conv_filter` com valores possiveis: `"admin_badge"` (padrão - só admins e usuarios com selo), `"admin_only"` (só admins), `"all"` (todos)

**2. Atualizar `ChatRoomManager.tsx`** (aba Bate-papo no Principal)

Adicionar um seletor/toggle na seção de configurações do chat:
- "Quem aparece em Nova Conversa": opções Admin + Selo (padrão), Apenas Admins, Todos
- Salva na `system_config` com chave `chat_new_conv_filter`

**3. Atualizar `NewChatModal.tsx`**

Alterar a lógica de `fetchUsers`:
- Carregar a config `chat_new_conv_filter` da `system_config`
- Se `"admin_badge"` (padrão): buscar admins via `user_roles` + perfis com `verification_badge IS NOT NULL`, excluindo o proprio usuario
- Se `"admin_only"`: manter logica atual (só admins)
- Se `"all"`: buscar todos os perfis ativos

A query combinará os dois conjuntos (admins + badged users) e removerá duplicatas.

### Arquivos afetados
- `src/components/chat/NewChatModal.tsx` — lógica de filtro dinâmico
- `src/components/ChatRoomManager.tsx` — UI de configuração

