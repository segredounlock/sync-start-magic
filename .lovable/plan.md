
# Inserir a última mensagem do broadcast do Telegram em Novidades

## O que encontrei
- A última mensagem do broadcast do Telegram já foi sincronizada para o grupo interno de chat `Atualizações do Sistema`.
- Ela não foi criada na tabela `notifications`, por isso não apareceu na seção `Novidades`.
- O schema atual de `notifications` aceita os campos básicos já usados no bot, então o problema não parece ser coluna obrigatória faltando.
- O fluxo do bot hoje já tenta inserir em `notifications`, mas precisa ficar mais robusto e também permitir corrigir esse caso pendente.

## Plano de correção
### 1. Corrigir o item que faltou agora
- Inserir a última mensagem enviada pelo bot na tabela `notifications`.
- Usar um título limpo baseado na própria mensagem:
  - `📢 ⬇️ AVISO IMPORTANTE ⬇️`
- Manter o conteúdo completo da mensagem para aparecer corretamente em `Novidades`.

### 2. Blindar o sync do `telegram-bot`
No trecho que sincroniza broadcast para chat + novidades:
- manter o insert em `notifications`
- registrar erro detalhado se falhar
- validar o resultado do insert
- separar melhor os blocos de erro para que uma falha em `notifications` não masque o restante do fluxo

### 3. Evitar duplicação futura
- Antes de inserir em `notifications`, verificar se já existe uma notificação muito recente com mesmo título/mensagem.
- Isso evita duplicar avisos quando o bot for reenviado ou reprocessado.

### 4. Preservar compatibilidade
- Não mexer na `AtualizacoesSection`
- Não alterar filtros visuais nem realtime do frontend
- Não mudar RLS nem estrutura da tabela
- Não tocar nos filtros de storage nem em outras funções

## Resultado esperado
- A mensagem `⬇️ AVISO IMPORTANTE ⬇️` passa a aparecer em `Novidades`.
- Próximos broadcasts do Telegram ficam sincronizados com muito menos risco de sumir.
- Correção com baixo risco, concentrada só no fluxo do bot + backfill do item faltante.

## Detalhes técnicos
- Arquivo principal: `supabase/functions/telegram-bot/index.ts`
- Dados confirmados:
  - a mensagem existe em `chat_messages`
  - ela não existe entre as notificações mais recentes em `notifications`
- Ajuste recomendado no fluxo:
  1. extrair texto
  2. montar título
  3. checar duplicidade
  4. inserir notificação
  5. logar sucesso/erro com contexto suficiente

