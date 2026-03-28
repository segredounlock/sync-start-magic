

# Atualização: Cores de Botões, Canal de Notícias e Configuração

## Novidades da API do Telegram

A API do Telegram Bot agora suporta **estilos de cor nos botões inline**:
- `"primary"` — Azul (padrão)
- `"success"` — Verde
- `"danger"` — Vermelho

Também suporta `icon_custom_emoji_id` para colocar um emoji customizado antes do texto do botão (requer Telegram Premium do bot owner).

## O que será feito

### 1. Adicionar seletor de cor por botão no BroadcastForm
**Arquivo:** `src/components/BroadcastForm.tsx`
- Cada botão do broadcast ganha um seletor de estilo (Azul/Verde/Vermelho)
- Interface `BroadcastButton` passa a incluir `style?: "primary" | "success" | "danger"`
- Preview atualizado para refletir a cor escolhida
- Máximo de botões continua 2

### 2. Enviar o style na API do Telegram
**Arquivo:** `supabase/functions/send-broadcast/index.ts`
- No `reply_markup.inline_keyboard`, incluir `style` em cada botão quando definido
- Compatível: bots que não suportam simplesmente ignoram o campo

**Arquivo:** `supabase/functions/telegram-bot/index.ts`
- Mesma lógica para broadcasts enviados pelo bot

### 3. Adicionar campo "Canal de Notícias" na aba Bot
**Arquivo:** `src/pages/AdminDashboard.tsx`
- Na seção "Links" da aba Bot, adicionar um campo para o link/username do canal (ex: `@CREDITOSO`)
- Salvar em `system_config` com key `telegramNewsChannel`

### 4. Enviar broadcast também para o canal
**Arquivo:** `supabase/functions/send-broadcast/index.ts`
- Após enviar para todos os usuários, buscar `telegramNewsChannel` em `system_config`
- Se configurado, enviar a mesma mensagem para o canal (com imagem, botões e tudo)

**Arquivo:** `supabase/functions/telegram-bot/index.ts`
- Mesma lógica: após broadcast do bot, replicar para o canal configurado

### 5. Atualizar configData no AdminDashboard/Principal
- Adicionar `telegramNewsChannel` ao objeto `configData`
- Incluir no `fetchConfig` e no `saveConfig`

## Resumo das alterações

| Arquivo | Mudança |
|---------|---------|
| `BroadcastForm.tsx` | Seletor de cor por botão + preview colorido |
| `send-broadcast/index.ts` | Incluir `style` nos botões + enviar para canal |
| `telegram-bot/index.ts` | Incluir `style` nos botões + enviar para canal |
| `AdminDashboard.tsx` | Campo "Canal de Notícias" na aba Bot |
| `Principal.tsx` | Mesmo campo na aba Bot (se existir) |

## Impacto
- Zero risco de quebra — `style` é ignorado por clientes antigos
- Canal recebe as mesmas mensagens dos broadcasts
- Admin configura tudo pelo painel, sem editar código
- Revendedores podem ter canal próprio via `reseller_config`

