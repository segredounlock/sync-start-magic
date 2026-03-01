-- Enable realtime for key tables used in the Mini App
ALTER PUBLICATION supabase_realtime ADD TABLE public.saldos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recargas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;