
-- Correção 1: license_logs — trocar role 'master' (inexistente) por 'admin'
DROP POLICY "Admins can view license logs" ON public.license_logs;
CREATE POLICY "Admins can view license logs" ON public.license_logs
FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Correção 2: broadcast-images — restringir DELETE a admins
DROP POLICY IF EXISTS "Authenticated can delete broadcast images" ON storage.objects;
CREATE POLICY "Admins can delete broadcast images" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'broadcast-images' AND has_role(auth.uid(), 'admin'));

-- Correção 3: receipts — restringir DELETE/UPDATE ao dono
DROP POLICY IF EXISTS "Authenticated users can delete receipts" ON storage.objects;
CREATE POLICY "Users can delete own receipts" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Authenticated users can update receipts" ON storage.objects;
CREATE POLICY "Users can update own receipts" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'receipts' AND (auth.uid())::text = (storage.foldername(name))[1]);
