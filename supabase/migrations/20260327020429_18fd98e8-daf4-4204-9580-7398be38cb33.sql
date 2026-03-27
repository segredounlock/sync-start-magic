
-- Insert masterAdminId into system_config
INSERT INTO public.system_config (key, value)
VALUES ('masterAdminId', 'f5501acc-79f3-460f-bc3e-493280ea84f0')
ON CONFLICT (key) DO NOTHING;

-- Allow authenticated users to read masterAdminId
CREATE POLICY "Authenticated can view master admin config"
ON public.system_config
FOR SELECT
TO authenticated
USING (key = 'masterAdminId');
