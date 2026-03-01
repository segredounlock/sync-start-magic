
-- Fix: Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Resellers can view client profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Resellers can view client profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profiles.id AND p.reseller_id = auth.uid()));
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- system_config
DROP POLICY IF EXISTS "Admins can view config" ON public.system_config;
DROP POLICY IF EXISTS "Admins can manage config" ON public.system_config;

CREATE POLICY "Admins can view config" ON public.system_config FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage config" ON public.system_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- notifications
DROP POLICY IF EXISTS "Admins can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can manage notifications" ON public.notifications;

CREATE POLICY "Admins can view notifications" ON public.notifications FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- broadcast_progress
DROP POLICY IF EXISTS "Admins can view broadcast_progress" ON public.broadcast_progress;
DROP POLICY IF EXISTS "Admins can manage broadcast_progress" ON public.broadcast_progress;

CREATE POLICY "Admins can view broadcast_progress" ON public.broadcast_progress FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage broadcast_progress" ON public.broadcast_progress FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- telegram_users
DROP POLICY IF EXISTS "Admins can view all telegram_users" ON public.telegram_users;
DROP POLICY IF EXISTS "Admins can manage telegram_users" ON public.telegram_users;

CREATE POLICY "Admins can view all telegram_users" ON public.telegram_users FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage telegram_users" ON public.telegram_users FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- pricing_rules
DROP POLICY IF EXISTS "Authenticated can view pricing rules" ON public.pricing_rules;
DROP POLICY IF EXISTS "Admins can manage pricing rules" ON public.pricing_rules;

CREATE POLICY "Authenticated can view pricing rules" ON public.pricing_rules FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage pricing rules" ON public.pricing_rules FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- bot_settings
DROP POLICY IF EXISTS "Admins can view bot_settings" ON public.bot_settings;
DROP POLICY IF EXISTS "Admins can manage bot_settings" ON public.bot_settings;

CREATE POLICY "Admins can view bot_settings" ON public.bot_settings FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage bot_settings" ON public.bot_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- saldos
DROP POLICY IF EXISTS "Users can view own saldo" ON public.saldos;
DROP POLICY IF EXISTS "Admins can view all saldos" ON public.saldos;
DROP POLICY IF EXISTS "Admins can insert saldos" ON public.saldos;
DROP POLICY IF EXISTS "Admins can update saldos" ON public.saldos;
DROP POLICY IF EXISTS "Resellers can view client saldos" ON public.saldos;
DROP POLICY IF EXISTS "Revendedores can update client saldos" ON public.saldos;

CREATE POLICY "Users can view own saldo" ON public.saldos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all saldos" ON public.saldos FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert saldos" ON public.saldos FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update saldos" ON public.saldos FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Resellers can view client saldos" ON public.saldos FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = saldos.user_id AND p.reseller_id = auth.uid()));
CREATE POLICY "Revendedores can update client saldos" ON public.saldos FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = saldos.user_id AND p.reseller_id = auth.uid()));

-- reseller_config
DROP POLICY IF EXISTS "Users can view own config" ON public.reseller_config;
DROP POLICY IF EXISTS "Users can manage own config" ON public.reseller_config;
DROP POLICY IF EXISTS "Admins can view all reseller config" ON public.reseller_config;

CREATE POLICY "Users can view own config" ON public.reseller_config FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own config" ON public.reseller_config FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reseller config" ON public.reseller_config FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- reseller_pricing_rules
DROP POLICY IF EXISTS "Users can view own reseller pricing" ON public.reseller_pricing_rules;
DROP POLICY IF EXISTS "Users can manage own reseller pricing" ON public.reseller_pricing_rules;

CREATE POLICY "Users can view own reseller pricing" ON public.reseller_pricing_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reseller pricing" ON public.reseller_pricing_rules FOR ALL USING (auth.uid() = user_id);

-- operadoras
DROP POLICY IF EXISTS "Anyone can view active operadoras" ON public.operadoras;
DROP POLICY IF EXISTS "Admins can manage operadoras" ON public.operadoras;

CREATE POLICY "Anyone can view active operadoras" ON public.operadoras FOR SELECT USING (true);
CREATE POLICY "Admins can manage operadoras" ON public.operadoras FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- recargas
DROP POLICY IF EXISTS "Users can view own recargas" ON public.recargas;
DROP POLICY IF EXISTS "Users can insert own recargas" ON public.recargas;
DROP POLICY IF EXISTS "Admins can view all recargas" ON public.recargas;
DROP POLICY IF EXISTS "Resellers can view client recargas" ON public.recargas;
DROP POLICY IF EXISTS "Service role can manage recargas" ON public.recargas;

CREATE POLICY "Users can view own recargas" ON public.recargas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recargas" ON public.recargas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all recargas" ON public.recargas FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Resellers can view client recargas" ON public.recargas FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = recargas.user_id AND p.reseller_id = auth.uid()));
CREATE POLICY "Service role can manage recargas" ON public.recargas FOR ALL USING (true) WITH CHECK (true);

-- transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Resellers can view client transactions" ON public.transactions;
DROP POLICY IF EXISTS "Service role can manage transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Resellers can view client transactions" ON public.transactions FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = transactions.user_id AND p.reseller_id = auth.uid()));
CREATE POLICY "Service role can manage transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- telegram_sessions
DROP POLICY IF EXISTS "Service role can manage telegram_sessions" ON public.telegram_sessions;

CREATE POLICY "Service role can manage telegram_sessions" ON public.telegram_sessions FOR ALL USING (true) WITH CHECK (true);
