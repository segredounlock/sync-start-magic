# 💬 Sistema de Chat

## Tipos de Conversa

| Tipo | Descrição |
|------|-----------|
| `direct` | Conversa 1-a-1 entre dois usuários |
| `group` | Grupo com múltiplos membros |

## Funcionalidades

- ✅ Mensagens de texto com formatação
- ✅ Envio de imagens (bucket: `chat-images`)
- ✅ Gravação e envio de áudio (bucket: `chat-audio`)
- ✅ Reações com emojis
- ✅ Responder mensagem (reply)
- ✅ Fixar mensagem (pin)
- ✅ Deletar mensagem (soft delete)
- ✅ Editar mensagem
- ✅ Indicador de digitação
- ✅ Status de leitura (read receipts)
- ✅ Status de entrega (delivered)
- ✅ Menções (@username)
- ✅ Grupos públicos e privados
- ✅ Categorias de grupo
- ✅ Bloqueio de conversa

## Realtime

Tabelas com realtime habilitado:
- `chat_conversations` — novas conversas e atualizações
- `chat_messages` — novas mensagens em tempo real
- `chat_reactions` — reações em tempo real

## Configurações Admin

| Config (system_config) | Descrição |
|------------------------|-----------|
| `chat_enabled` | Ativa/desativa chat globalmente |
| `chat_new_conv_filter` | Filtro para criar novas conversas (admin_badge, all) |

## RLS Policies

- Usuários só veem conversas em que participam
- Usuários só enviam mensagens em conversas que participam
- Admins têm acesso total (ALL)
- Badge holders podem deletar/editar mensagens em suas conversas
- Grupos públicos são visíveis para todos os autenticados
