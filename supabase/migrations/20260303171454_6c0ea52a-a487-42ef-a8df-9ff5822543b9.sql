
CREATE OR REPLACE FUNCTION public.get_unread_counts(_user_id uuid, _conversation_ids uuid[])
RETURNS TABLE(conversation_id uuid, unread_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT m.conversation_id, COUNT(*)::bigint as unread_count
  FROM public.chat_messages m
  WHERE m.conversation_id = ANY(_conversation_ids)
    AND m.sender_id != _user_id
    AND m.is_read = false
  GROUP BY m.conversation_id;
$$;
