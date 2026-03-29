
-- Remove license_logs from realtime (no IF EXISTS support)
ALTER PUBLICATION supabase_realtime DROP TABLE public.license_logs;
