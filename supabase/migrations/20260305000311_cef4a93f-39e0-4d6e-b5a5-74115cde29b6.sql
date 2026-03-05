
CREATE OR REPLACE FUNCTION public.get_operator_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result jsonb;
  now24h timestamptz := now() - interval '24 hours';
BEGIN
  -- Requires authenticated user
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT jsonb_agg(row_to_json(stats)::jsonb)
  INTO result
  FROM (
    SELECT
      INITCAP(LOWER(TRIM(r.operadora))) AS operadora,
      COUNT(*) AS recent_count,
      COALESCE(AVG(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))), 0) AS avg_recent,
      COALESCE(MIN(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))), 0) AS min_24h,
      COALESCE(AVG(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))), 0) AS avg_24h,
      COALESCE(MAX(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))), 0) AS max_24h
    FROM public.recargas r
    WHERE r.status = 'completed'
      AND r.completed_at IS NOT NULL
      AND r.created_at >= now24h
      AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0
      AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400
    GROUP BY INITCAP(LOWER(TRIM(r.operadora)))
  ) stats;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;
