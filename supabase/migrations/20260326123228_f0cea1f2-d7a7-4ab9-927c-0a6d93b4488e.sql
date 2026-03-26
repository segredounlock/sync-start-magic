
-- Mirror sync state (per-mirror metadata)
CREATE TABLE public.mirror_sync_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mirror_id text NOT NULL,
  mirror_repo text NOT NULL,
  source_repo text NOT NULL DEFAULT '',
  last_synced_commit text,
  last_sync_at timestamptz,
  total_files integer DEFAULT 0,
  synced_files integer DEFAULT 0,
  pending_files integer DEFAULT 0,
  conflict_files integer DEFAULT 0,
  protected_paths jsonb DEFAULT '[ ".env", "supabase/config.toml", ".github/workflows/" ]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mirror_id)
);

ALTER TABLE public.mirror_sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mirror_sync_state" ON public.mirror_sync_state
  FOR ALL TO public USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Mirror file state (per-file tracking)
CREATE TABLE public.mirror_file_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mirror_id text NOT NULL,
  file_path text NOT NULL,
  source_hash text,
  mirror_hash text,
  status text NOT NULL DEFAULT 'pending',
  action text,
  last_synced_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(mirror_id, file_path)
);

ALTER TABLE public.mirror_file_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mirror_file_state" ON public.mirror_file_state
  FOR ALL TO public USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Mirror sync logs (audit trail)
CREATE TABLE public.mirror_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mirror_id text NOT NULL,
  sync_type text NOT NULL DEFAULT 'incremental',
  files_sent integer DEFAULT 0,
  files_skipped integer DEFAULT 0,
  files_failed integer DEFAULT 0,
  conflicts_detected integer DEFAULT 0,
  duration_ms integer,
  error_message text,
  details jsonb DEFAULT '[]'::jsonb,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.mirror_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage mirror_sync_logs" ON public.mirror_sync_logs
  FOR ALL TO public USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
