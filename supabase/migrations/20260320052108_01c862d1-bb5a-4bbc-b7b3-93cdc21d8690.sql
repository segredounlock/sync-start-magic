
-- Add selfie_url column to login_fingerprints
ALTER TABLE public.login_fingerprints ADD COLUMN IF NOT EXISTS selfie_url text DEFAULT NULL;

-- Create private bucket for login selfies
INSERT INTO storage.buckets (id, name, public)
VALUES ('login-selfies', 'login-selfies', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: Only admins can read login selfies
CREATE POLICY "Admins can read login selfies"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'login-selfies'
  AND public.has_role(auth.uid(), 'admin')
);

-- RLS: Service role inserts (edge function uses service role, no policy needed for service_role)
-- But allow authenticated service-level insert for edge function fallback
CREATE POLICY "Service role can insert login selfies"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'login-selfies');
