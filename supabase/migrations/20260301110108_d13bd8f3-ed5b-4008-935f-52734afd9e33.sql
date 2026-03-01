
-- =============================================
-- PROFILES
-- =============================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  telegram_id BIGINT,
  telegram_username TEXT,
  whatsapp_number TEXT,
  telegram_bot_token TEXT,
  slug TEXT UNIQUE,
  store_name TEXT,
  store_logo_url TEXT,
  store_primary_color TEXT,
  store_secondary_color TEXT,
  reseller_id UUID REFERENCES public.profiles(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- USER_ROLES
-- =============================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'revendedor', 'cliente')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- =============================================
-- SALDOS
-- =============================================
CREATE TABLE public.saldos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL DEFAULT 'revenda',
  valor NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, tipo)
);

ALTER TABLE public.saldos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saldo" ON public.saldos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all saldos" ON public.saldos FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update saldos" ON public.saldos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert saldos" ON public.saldos FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Revendedores can update client saldos" ON public.saldos FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = saldos.user_id AND p.reseller_id = auth.uid()
  )
);

-- =============================================
-- TRANSACTIONS
-- =============================================
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'deposit',
  status TEXT NOT NULL DEFAULT 'pending',
  module TEXT,
  payment_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- OPERADORAS
-- =============================================
CREATE TABLE public.operadoras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  valores JSONB NOT NULL DEFAULT '[]'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.operadoras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active operadoras" ON public.operadoras FOR SELECT USING (true);
CREATE POLICY "Admins can manage operadoras" ON public.operadoras FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- =============================================
-- RECARGAS
-- =============================================
CREATE TABLE public.recargas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  telefone TEXT NOT NULL,
  operadora TEXT,
  valor NUMERIC NOT NULL DEFAULT 0,
  custo NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  external_id TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recargas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recargas" ON public.recargas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all recargas" ON public.recargas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert own recargas" ON public.recargas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage recargas" ON public.recargas FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- SYSTEM_CONFIG
-- =============================================
CREATE TABLE public.system_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view config" ON public.system_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage config" ON public.system_config FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- =============================================
-- PRICING_RULES
-- =============================================
CREATE TABLE public.pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operadora_id UUID NOT NULL REFERENCES public.operadoras(id) ON DELETE CASCADE,
  valor_recarga NUMERIC NOT NULL,
  custo NUMERIC NOT NULL DEFAULT 0,
  tipo_regra TEXT NOT NULL DEFAULT 'fixo' CHECK (tipo_regra IN ('fixo', 'margem')),
  regra_valor NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(operadora_id, valor_recarga)
);

ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing rules" ON public.pricing_rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- =============================================
-- RESELLER_PRICING_RULES
-- =============================================
CREATE TABLE public.reseller_pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operadora_id UUID NOT NULL REFERENCES public.operadoras(id) ON DELETE CASCADE,
  valor_recarga NUMERIC NOT NULL,
  custo NUMERIC NOT NULL DEFAULT 0,
  tipo_regra TEXT NOT NULL DEFAULT 'fixo' CHECK (tipo_regra IN ('fixo', 'margem')),
  regra_valor NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, operadora_id, valor_recarga)
);

ALTER TABLE public.reseller_pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reseller pricing" ON public.reseller_pricing_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view reseller pricing" ON public.reseller_pricing_rules FOR SELECT USING (true);
CREATE POLICY "Users can manage own reseller pricing" ON public.reseller_pricing_rules FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- TELEGRAM_USERS
-- =============================================
CREATE TABLE public.telegram_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  first_name TEXT,
  username TEXT,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  block_reason TEXT,
  is_registered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view telegram_users" ON public.telegram_users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can manage telegram_users" ON public.telegram_users FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- NOTIFICATIONS (broadcast)
-- =============================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT,
  buttons JSONB DEFAULT '[]'::jsonb,
  message_effect_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view notifications" ON public.notifications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can manage notifications" ON public.notifications FOR ALL USING (auth.uid() IS NOT NULL);

-- =============================================
-- BROADCAST_PROGRESS
-- =============================================
CREATE TABLE public.broadcast_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  total_users INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  blocked_count INTEGER NOT NULL DEFAULT 0,
  current_batch INTEGER NOT NULL DEFAULT 0,
  total_batches INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  speed_per_second NUMERIC NOT NULL DEFAULT 0,
  estimated_completion TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.broadcast_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view broadcast_progress" ON public.broadcast_progress FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can manage broadcast_progress" ON public.broadcast_progress FOR ALL USING (auth.uid() IS NOT NULL);

-- Enable realtime for broadcast_progress
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recargas;

-- =============================================
-- BOT_SETTINGS
-- =============================================
CREATE TABLE public.bot_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view bot_settings" ON public.bot_settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage bot_settings" ON public.bot_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- =============================================
-- STORAGE: broadcast-images bucket
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('broadcast-images', 'broadcast-images', true);

CREATE POLICY "Anyone can view broadcast images" ON storage.objects FOR SELECT USING (bucket_id = 'broadcast-images');
CREATE POLICY "Authenticated can upload broadcast images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'broadcast-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can delete broadcast images" ON storage.objects FOR DELETE USING (bucket_id = 'broadcast-images' AND auth.uid() IS NOT NULL);

-- =============================================
-- STORAGE: avatars bucket
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- =============================================
-- STORAGE: store-logos bucket
-- =============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('store-logos', 'store-logos', true);

CREATE POLICY "Anyone can view store logos" ON storage.objects FOR SELECT USING (bucket_id = 'store-logos');
CREATE POLICY "Authenticated can upload store logos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'store-logos' AND auth.uid() IS NOT NULL);

-- =============================================
-- TRIGGER: auto update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_saldos_updated_at BEFORE UPDATE ON public.saldos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recargas_updated_at BEFORE UPDATE ON public.recargas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operadoras_updated_at BEFORE UPDATE ON public.operadoras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reseller_pricing_updated_at BEFORE UPDATE ON public.reseller_pricing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_telegram_users_updated_at BEFORE UPDATE ON public.telegram_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_broadcast_progress_updated_at BEFORE UPDATE ON public.broadcast_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bot_settings_updated_at BEFORE UPDATE ON public.bot_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- AUTO-CREATE profile + saldo on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  
  INSERT INTO public.saldos (user_id, tipo, valor)
  VALUES (NEW.id, 'revenda', 0);
  
  INSERT INTO public.saldos (user_id, tipo, valor)
  VALUES (NEW.id, 'pessoal', 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
