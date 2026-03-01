
-- Create banners table for multiple promotional banners (max 3)
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position INTEGER NOT NULL DEFAULT 1 CHECK (position >= 1 AND position <= 3),
  type TEXT NOT NULL DEFAULT 'banner' CHECK (type IN ('banner', 'popup', 'slide')),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint on position
CREATE UNIQUE INDEX idx_banners_position ON public.banners (position);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Admins can manage banners
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL
  USING (has_role(auth.uid(), 'admin'::text))
  WITH CHECK (has_role(auth.uid(), 'admin'::text));

-- Anyone authenticated can view enabled banners
CREATE POLICY "Authenticated can view banners" ON public.banners FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Seed 3 banner slots
INSERT INTO public.banners (position, type, title, subtitle, link, enabled) VALUES
  (1, 'banner', '', '', '', false),
  (2, 'banner', '', '', '', false),
  (3, 'popup', '', '', '', false);

-- Migrate existing banner config from system_config
DO $$
DECLARE
  v_enabled TEXT;
  v_title TEXT;
  v_subtitle TEXT;
  v_link TEXT;
BEGIN
  SELECT value INTO v_enabled FROM public.system_config WHERE key = 'bannerEnabled';
  SELECT value INTO v_title FROM public.system_config WHERE key = 'bannerTitle';
  SELECT value INTO v_subtitle FROM public.system_config WHERE key = 'bannerSubtitle';
  SELECT value INTO v_link FROM public.system_config WHERE key = 'bannerLink';
  
  IF v_enabled IS NOT NULL THEN
    UPDATE public.banners SET
      enabled = (v_enabled = 'true'),
      title = COALESCE(v_title, ''),
      subtitle = COALESCE(v_subtitle, ''),
      link = COALESCE(v_link, '')
    WHERE position = 1;
  END IF;
END $$;
