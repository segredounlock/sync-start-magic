-- Allow admins to update recargas (needed for refund status change)
CREATE POLICY "Admins can update recargas"
ON public.recargas
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));