

# Proteção do campo `is_blocked` no banco de dados

## Problema
A policy "Users can update own conversations" permite que qualquer participante altere **qualquer coluna**, incluindo `is_blocked`. Um usuário comum poderia chamar a API diretamente e bloquear/desbloquear salas.

## Solução
Adicionar um `WITH CHECK` na policy de UPDATE para usuários comuns que garanta que o valor de `is_blocked` não foi alterado. Apenas a policy de admin (que já existe) permitirá alterar esse campo.

## Implementação

**1 migration SQL:**

```sql
DROP POLICY IF EXISTS "Users can update own conversations" ON public.chat_conversations;

CREATE POLICY "Users can update own conversations"
ON public.chat_conversations
FOR UPDATE
TO authenticated
USING (
  (type = 'direct' AND (auth.uid() = participant_1 OR auth.uid() = participant_2))
  OR
  (type = 'group' AND is_chat_member(id, auth.uid()))
)
WITH CHECK (
  NOT (is_blocked IS DISTINCT FROM (
    SELECT c.is_blocked FROM public.chat_conversations c WHERE c.id = chat_conversations.id
  ))
);
```

Isso compara o novo valor de `is_blocked` com o valor atual. Se for diferente, o UPDATE é rejeitado — a menos que passe pela policy de admin (`has_role(auth.uid(), 'admin')`), que não tem essa restrição.

**Nenhuma alteração de código frontend necessária** — o botão de cadeado já é exibido apenas para admins.

