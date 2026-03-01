
-- 1. FIX profiles: restrict SELECT to own profile, reseller's clients, and admins
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Resellers can view client profiles"
ON public.profiles FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = profiles.id AND p.reseller_id = auth.uid()
));

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 2. FIX system_config: restrict SELECT to admins only
DROP POLICY IF EXISTS "Authenticated users can view config" ON public.system_config;

CREATE POLICY "Admins can view config"
ON public.system_config FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 3. FIX user_roles: restrict SELECT to own roles + admins
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- 4. FIX notifications: restrict to admins only
DROP POLICY IF EXISTS "Authenticated can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated can manage notifications" ON public.notifications;

CREATE POLICY "Admins can view notifications"
ON public.notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage notifications"
ON public.notifications FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 5. FIX broadcast_progress: restrict to admins only
DROP POLICY IF EXISTS "Authenticated can view broadcast_progress" ON public.broadcast_progress;
DROP POLICY IF EXISTS "Authenticated can manage broadcast_progress" ON public.broadcast_progress;

CREATE POLICY "Admins can view broadcast_progress"
ON public.broadcast_progress FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage broadcast_progress"
ON public.broadcast_progress FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 6. FIX telegram_users: restrict to own record + admins
DROP POLICY IF EXISTS "Authenticated can view telegram_users" ON public.telegram_users;
DROP POLICY IF EXISTS "Authenticated can manage telegram_users" ON public.telegram_users;

CREATE POLICY "Admins can view all telegram_users"
ON public.telegram_users FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage telegram_users"
ON public.telegram_users FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- 7. FIX pricing_rules: restrict to authenticated only (not public)
DROP POLICY IF EXISTS "Anyone can view pricing rules" ON public.pricing_rules;

CREATE POLICY "Authenticated can view pricing rules"
ON public.pricing_rules FOR SELECT
USING (auth.uid() IS NOT NULL);

-- 8. FIX reseller_pricing_rules: remove public access
DROP POLICY IF EXISTS "Anyone can view reseller pricing" ON public.reseller_pricing_rules;

-- 9. FIX bot_settings: restrict to admins only
DROP POLICY IF EXISTS "Authenticated can view bot_settings" ON public.bot_settings;

CREATE POLICY "Admins can view bot_settings"
ON public.bot_settings FOR SELECT
USING (has_role(auth.uid(), 'admin'));
