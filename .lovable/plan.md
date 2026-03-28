

# Corrigir Sincronização de Broadcasts do Telegram com Novidades

## Problema
Broadcasts enviados pelo bot do Telegram não estão aparecendo na seção "Novidades". A mensagem "⬇️ AVISO IMPORTANTE ⬇️" sobre instabilidade foi enviada pelo bot mas **não foi inserida na tabela `notifications`**.

O código de sincronização (linha 835 do `telegram-bot/index.ts`) já existe, mas o erro é silenciado pelo `catch` na linha 845, então não sabemos o motivo exato da falha.

## Causa provável
A tabela `notifications` pode ter colunas obrigatórias (como `type` ou `recipient_type`) que não estão sendo preenchidas no insert do bot. Ou a RLS está bloqueando o insert mesmo com service_role (improvável).

## Correção

### 1. Verificar schema da tabela notifications
Conferir quais colunas são obrigatórias e garantir que o insert do bot preenche todas.

### 2. Atualizar o insert no `telegram-bot/index.ts`
No bloco de sincronização (linhas 830-841), garantir que todos os campos obrigatórios estão sendo preenchidos. Adicionar campos como `type: 'broadcast'` ou `recipient_type` se necessários.

### 3. Melhorar o log de erro
Trocar o `catch` genérico por um log mais detalhado que mostre exatamente o erro do Supabase, para facilitar debug futuro.

### Trecho atual (linha 835-841):
```ts
await supabase.from('notifications').insert({
  title: `📢 ${notifTitle}`,
  message: broadcastText,
  status: 'sent',
  sent_count: sent,
  failed_count: failed,
});
```

### O que será adicionado:
- Campos obrigatórios que possam estar faltando
- Log detalhado do erro em caso de falha
- Nenhuma alteração no frontend ou em outras tabelas

## Impacto
- Apenas a edge function `telegram-bot` será atualizada
- Zero risco de quebrar funcionalidades existentes
- Broadcasts futuros pelo bot aparecerão nas Novidades

