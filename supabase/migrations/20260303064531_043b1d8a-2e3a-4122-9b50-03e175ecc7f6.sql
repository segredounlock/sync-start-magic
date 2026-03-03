-- Grant execute on public RPCs to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_seasonal_theme() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_maintenance_mode() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_chat_enabled() TO authenticated;