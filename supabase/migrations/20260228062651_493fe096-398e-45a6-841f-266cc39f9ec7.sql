-- Allow public/anon access to profiles by slug (needed for public store page)
CREATE POLICY "Public can view profiles by slug"
  ON public.profiles FOR SELECT
  USING (slug IS NOT NULL AND active = true);

-- Allow public/anon to read user_roles (needed to verify revendedor role on public store)
CREATE POLICY "Public can view revendedor roles"
  ON public.user_roles FOR SELECT
  USING (true);

-- Allow public/anon to read saldos (needed for public store to check balance before recarga)
CREATE POLICY "Public can view saldos"
  ON public.saldos FOR SELECT
  USING (true);