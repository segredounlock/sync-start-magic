
Restaurar sincronização Suporte Website ↔ Telegram

Objetivo:
Fazer o sistema voltar a funcionar como antes: a mesma conversa de suporte aparecer no Telegram e também no painel/site, usando a mesma conta do usuário.

Diagnóstico encontrado:
- O painel web atual lê e grava mensagens em `support_messages`.
- O bot do Telegram ainda usa a lógica antiga em vários pontos, gravando só em `support_tickets.message` / `admin_reply`.
- Resultado: o ticket existe dos dois lados, mas o histórico não fica realmente unificado.

O que vou ajustar:
1. Unificar a conversa no banco
- Tratar `support_tickets` apenas como metadados do ticket.
- Tratar `support_messages` como fonte única do histórico.

2. Telegram → Website/Painel
- Quando o usuário mandar mensagem ou foto no bot, o sistema:
  - encontra/cria o ticket correto em `support_tickets`
  - grava cada mensagem em `support_messages`
  - mantém `support_tickets.updated_at/status` sincronizados
- Assim a mensagem passa a aparecer imediatamente no painel principal e no chat do site.

3. Website/Painel → Telegram
- Quando cliente ou admin enviar mensagem pelo site/painel, o sistema:
  - grava em `support_messages`
  - dispara o envio correspondente para o Telegram do outro lado
- Isso vale para:
  - resposta do admin no painel
  - mensagem do cliente no site
  - imagens/anexos suportados

4. Evitar duplicação e loops
- Marcar origem da mensagem (`telegram`, `web_client`, `web_admin`, `system`) na lógica de envio
- Não reenviar para o outro canal uma mensagem que já veio de lá
- Preservar mensagens de sistema apenas no painel quando fizer sentido

5. Corrigir busca do ticket no bot
- Hoje parte da resposta do admin no Telegram depende de nome/username no texto da notificação.
- Vou trocar para usar identificação confiável do ticket/chat vinculado, para não quebrar quando houver nomes repetidos.

Arquivos que devem entrar na implementação:
- `supabase/functions/telegram-bot/index.ts`
- `src/pages/AdminSupport.tsx`
- `src/pages/ClientSupport.tsx`
- `src/components/support/SupportChatWidget.tsx`
- possivelmente `supabase/functions/telegram-notify/index.ts` se já existir utilidade para centralizar envio

Ajustes de backend necessários:
- Provavelmente adicionar campos de rastreio em `support_messages` para origem/sincronização, se ainda não existirem.
- Revisar políticas/RLS para continuar permitindo:
  - cliente ver apenas seus tickets
  - admin/suporte ver e responder tudo
- Não mexer no Bate-papo social (`chat_messages`) se o objetivo for restaurar apenas o Suporte.

Resultado esperado após a correção:
- Usuário fala no Telegram → aparece no painel/site.
- Usuário fala no site → aparece no Telegram.
- Admin responde no painel → usuário recebe no Telegram e vê no site.
- Histórico fica único e consistente em ambos os lados.

Detalhe técnico importante:
Hoje a sincronização que “parecia existir” está quebrada porque existem dois modelos de conversa concorrendo:
- modelo novo: `support_messages`
- modelo legado: campos agregados em `support_tickets`
A correção é fazer todo o fluxo usar o modelo novo como fonte oficial.

Validação depois da implementação:
- criar ticket pelo site e responder pelo Telegram
- criar ticket pelo Telegram e responder pelo painel
- testar envio de texto e imagem
- confirmar que nenhuma mensagem duplica
- conferir atualização em tempo real no painel principal
