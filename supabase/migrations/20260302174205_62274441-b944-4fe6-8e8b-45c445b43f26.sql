
CREATE TABLE public.update_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  previous_version text,
  backup_date text,
  backup_by text,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  tables_restored integer NOT NULL DEFAULT 0,
  tables_skipped integer NOT NULL DEFAULT 0,
  tables_failed integer NOT NULL DEFAULT 0,
  total_records integer NOT NULL DEFAULT 0,
  applied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.update_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage update_history"
ON public.update_history FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view update_history"
ON public.update_history FOR SELECT
USING (has_role(auth.uid(), 'admin'));
