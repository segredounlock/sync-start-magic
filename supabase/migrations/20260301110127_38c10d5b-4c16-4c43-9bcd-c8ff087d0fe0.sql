
-- Add missing reseller_config table
CREATE TABLE public.reseller_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);

ALTER TABLE public.reseller_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own config" ON public.reseller_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own config" ON public.reseller_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reseller config" ON public.reseller_config FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE TRIGGER update_reseller_config_updated_at BEFORE UPDATE ON public.reseller_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
