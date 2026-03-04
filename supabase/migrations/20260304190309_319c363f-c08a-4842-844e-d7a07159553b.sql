-- Backfill chat_members from existing chat_messages for group conversations
INSERT INTO public.chat_members (conversation_id, user_id)
SELECT DISTINCT m.conversation_id, m.sender_id
FROM public.chat_messages m
JOIN public.chat_conversations c ON c.id = m.conversation_id
WHERE c.type = 'group'
ON CONFLICT (conversation_id, user_id) DO NOTHING;