
-- Add new columns to support_tickets
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS department text NOT NULL DEFAULT 'support',
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz;

-- Create support_messages table
CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_role text NOT NULL DEFAULT 'client',
  message text NOT NULL,
  image_url text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can manage all messages
CREATE POLICY "Admins can manage support_messages" ON public.support_messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS: Support role can manage messages
CREATE POLICY "Support can manage support_messages" ON public.support_messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'suporte'))
  WITH CHECK (public.has_role(auth.uid(), 'suporte'));

-- RLS: Users can insert messages on their own tickets
CREATE POLICY "Users can insert own ticket messages" ON public.support_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );

-- RLS: Users can view messages on their own tickets
CREATE POLICY "Users can view own ticket messages" ON public.support_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );

-- RLS: Users can update read status on messages they received
CREATE POLICY "Users can mark messages as read" ON public.support_messages
  FOR UPDATE TO authenticated
  USING (
    sender_id != auth.uid() AND
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  )
  WITH CHECK (
    sender_id != auth.uid() AND
    EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  );

-- Enable realtime for support_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;

-- Create support_templates table
CREATE TABLE public.support_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  shortcut text,
  category text NOT NULL DEFAULT 'general',
  variables jsonb DEFAULT '[]'::jsonb,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.support_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage support_templates" ON public.support_templates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create settings table for support_enabled flag
INSERT INTO public.system_config (key, value)
VALUES ('support_enabled', 'true')
ON CONFLICT DO NOTHING;
