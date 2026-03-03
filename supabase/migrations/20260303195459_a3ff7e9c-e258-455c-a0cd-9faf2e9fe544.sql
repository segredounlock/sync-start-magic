
-- Function to check if user has a verification badge
CREATE OR REPLACE FUNCTION public.has_verification_badge(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND verification_badge IS NOT NULL
      AND verification_badge != ''
  )
$$;

-- Allow badge holders to update any message (edit/delete)
CREATE POLICY "Badge holders can update messages"
ON public.chat_messages
FOR UPDATE
TO authenticated
USING (public.has_verification_badge(auth.uid()));

-- Allow badge holders to delete messages (soft delete via update)
-- Note: The system uses soft delete (is_deleted=true), which is an UPDATE operation
-- But if hard delete is ever needed:
CREATE POLICY "Badge holders can delete messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (public.has_verification_badge(auth.uid()));
