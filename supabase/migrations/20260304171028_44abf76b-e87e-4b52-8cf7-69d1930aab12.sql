CREATE OR REPLACE FUNCTION public.get_chat_new_conv_filter()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(value, 'admin_badge') FROM public.system_config WHERE key = 'chat_new_conv_filter' LIMIT 1;
$$;