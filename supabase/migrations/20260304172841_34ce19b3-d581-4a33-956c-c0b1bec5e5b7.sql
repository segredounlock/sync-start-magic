-- Recompute and persist conversation preview from latest non-deleted message
CREATE OR REPLACE FUNCTION public.sync_chat_conversation_preview(_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_msg RECORD;
  v_sender_name TEXT;
  v_preview TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.chat_conversations c
    WHERE c.id = _conversation_id
      AND (
        ((c.type = 'direct') AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid()))
        OR c.type = 'group'
        OR public.has_role(auth.uid(), 'admin')
      )
  ) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  SELECT m.id, m.sender_id, m.content, m.type, m.created_at
  INTO v_msg
  FROM public.chat_messages m
  WHERE m.conversation_id = _conversation_id
    AND m.is_deleted = false
  ORDER BY m.created_at DESC
  LIMIT 1;

  IF v_msg.id IS NULL THEN
    UPDATE public.chat_conversations
    SET last_message_text = NULL,
        last_message_at = NULL,
        updated_at = now()
    WHERE id = _conversation_id;
    RETURN;
  END IF;

  SELECT COALESCE(NULLIF(p.nome, ''), split_part(COALESCE(p.email, ''), '@', 1), 'Usuário')
  INTO v_sender_name
  FROM public.profiles p
  WHERE p.id = v_msg.sender_id;

  IF v_msg.type = 'audio' THEN
    v_preview := COALESCE(v_sender_name, 'Usuário') || ': 🎤 Áudio';
  ELSIF v_msg.type = 'image' THEN
    v_preview := COALESCE(v_sender_name, 'Usuário') || ': 📷 Imagem';
  ELSE
    v_preview := COALESCE(v_sender_name, 'Usuário') || ': ' || COALESCE(v_msg.content, 'Nova conversa');
  END IF;

  UPDATE public.chat_conversations
  SET last_message_text = CASE WHEN length(v_preview) > 100 THEN left(v_preview, 100) || '…' ELSE v_preview END,
      last_message_at = v_msg.created_at,
      updated_at = now()
  WHERE id = _conversation_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_chat_conversation_preview(uuid) TO authenticated;