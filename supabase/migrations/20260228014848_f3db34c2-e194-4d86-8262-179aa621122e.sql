
-- Create reseller_config table for individual gateway configs
CREATE TABLE public.reseller_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key text NOT NULL,
  value text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);

-- Enable RLS
ALTER TABLE public.reseller_config ENABLE ROW LEVEL SECURITY;

-- Users can read their own config
CREATE POLICY "Users can view own reseller_config"
ON public.reseller_config
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own config
CREATE POLICY "Users can insert own reseller_config"
ON public.reseller_config
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own config
CREATE POLICY "Users can update own reseller_config"
ON public.reseller_config
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own config
CREATE POLICY "Users can delete own reseller_config"
ON public.reseller_config
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all configs
CREATE POLICY "Admins can view all reseller_config"
ON public.reseller_config
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_reseller_config_updated_at
BEFORE UPDATE ON public.reseller_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
