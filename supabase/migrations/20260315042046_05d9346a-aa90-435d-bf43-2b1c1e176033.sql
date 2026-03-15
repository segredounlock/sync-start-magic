
CREATE OR REPLACE FUNCTION public.export_schema_info()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  funcs jsonb;
  policies jsonb;
  triggers jsonb;
  enums jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Get all public functions with their source
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', p.proname,
    'args', pg_get_function_arguments(p.oid),
    'return_type', pg_get_function_result(p.oid),
    'language', l.lanname,
    'source', pg_get_functiondef(p.oid)
  )), '[]'::jsonb)
  INTO funcs
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  JOIN pg_language l ON p.prolang = l.oid
  WHERE n.nspname = 'public'
    AND p.prokind = 'f';

  -- Get all RLS policies on public tables
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'table', pol.tablename,
    'name', pol.policyname,
    'command', pol.cmd,
    'permissive', pol.permissive,
    'roles', pol.roles,
    'using', pol.qual,
    'with_check', pol.with_check
  )), '[]'::jsonb)
  INTO policies
  FROM pg_policies pol
  WHERE pol.schemaname = 'public';

  -- Get all triggers on public tables
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', t.tgname,
    'table', c.relname,
    'function', p.proname,
    'timing', CASE WHEN t.tgtype & 2 = 2 THEN 'BEFORE' ELSE 'AFTER' END,
    'events', CASE
      WHEN t.tgtype & 4 = 4 THEN 'INSERT'
      WHEN t.tgtype & 8 = 8 THEN 'DELETE'
      WHEN t.tgtype & 16 = 16 THEN 'UPDATE'
      ELSE 'UNKNOWN'
    END
  )), '[]'::jsonb)
  INTO triggers
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  JOIN pg_namespace n ON c.relnamespace = n.oid
  JOIN pg_proc p ON t.tgfoid = p.oid
  WHERE n.nspname = 'public'
    AND NOT t.tgisinternal;

  -- Get all custom enums
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'name', t.typname,
    'values', (SELECT jsonb_agg(e.enumlabel ORDER BY e.enumsortorder) FROM pg_enum e WHERE e.enumtypid = t.oid)
  )), '[]'::jsonb)
  INTO enums
  FROM pg_type t
  JOIN pg_namespace n ON t.typnamespace = n.oid
  WHERE n.nspname = 'public'
    AND t.typtype = 'e';

  result := jsonb_build_object(
    'functions', funcs,
    'rls_policies', policies,
    'triggers', triggers,
    'enums', enums,
    'exported_at', now()
  );

  RETURN result;
END;
$$;
