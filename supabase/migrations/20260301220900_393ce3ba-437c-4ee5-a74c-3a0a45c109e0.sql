
-- Table for persistent admin notifications
CREATE TABLE public.admin_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL DEFAULT 'info',
  message text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  user_id text,
  user_nome text,
  user_email text,
  status text NOT NULL DEFAULT 'new',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin_notifications"
ON public.admin_notifications FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view admin_notifications"
ON public.admin_notifications FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Index for faster queries
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications (created_at DESC);
CREATE INDEX idx_admin_notifications_is_read ON public.admin_notifications (is_read) WHERE is_read = false;
