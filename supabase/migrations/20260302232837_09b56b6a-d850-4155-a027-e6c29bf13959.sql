-- Remove triggers that use net.http_post() which doesn't exist in this project
DROP TRIGGER IF EXISTS push_notify_new_user ON public.profiles;
DROP TRIGGER IF EXISTS push_notify_deposit ON public.transactions;
DROP TRIGGER IF EXISTS push_notify_recarga ON public.recargas;

-- Drop the functions that depend on net schema
DROP FUNCTION IF EXISTS public.notify_push_on_new_user();
DROP FUNCTION IF EXISTS public.notify_push_on_deposit();
DROP FUNCTION IF EXISTS public.notify_push_on_recarga();