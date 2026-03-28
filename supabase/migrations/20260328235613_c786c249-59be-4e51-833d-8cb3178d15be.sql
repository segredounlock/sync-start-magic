
CREATE OR REPLACE FUNCTION public.get_table_columns_info()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
BEGIN
  IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'table_name', c.table_name,
    'column_name', c.column_name,
    'data_type', c.data_type,
    'is_nullable', c.is_nullable,
    'column_default', c.column_default
  )), '[]'::jsonb)
  INTO result
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
  ORDER BY c.table_name, c.ordinal_position;

  RETURN result;
END;
$$;
