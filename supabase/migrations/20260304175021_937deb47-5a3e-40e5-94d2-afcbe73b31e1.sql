
INSERT INTO public.chat_conversations (id, participant_1, participant_2, type, name, icon, category, description, is_blocked, is_private, last_message_text, last_message_at)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000000',
  NULL,
  'group',
  'Atualizações do Sistema',
  '📢',
  'INFORMAÇÕES',
  'Novidades, atualizações e melhorias do sistema',
  false,
  false,
  NULL,
  now()
)
ON CONFLICT (id) DO NOTHING;
