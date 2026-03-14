CREATE OR REPLACE FUNCTION public.get_operator_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  now24h timestamptz := now() - interval '24 hours';
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT jsonb_agg(row_to_json(stats)::jsonb)
  INTO result
  FROM (
    SELECT
      INITCAP(LOWER(TRIM(r.operadora))) AS operadora,
      COUNT(*) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400) AS recent_count,
      COALESCE((
        SELECT AVG(sub.diff) FROM (
          SELECT EXTRACT(EPOCH FROM (r2.completed_at - r2.created_at)) AS diff
          FROM public.recargas r2
          WHERE r2.status = 'completed'
            AND r2.completed_at IS NOT NULL
            AND INITCAP(LOWER(TRIM(r2.operadora))) = INITCAP(LOWER(TRIM(r.operadora)))
            AND EXTRACT(EPOCH FROM (r2.completed_at - r2.created_at)) > 0
            AND EXTRACT(EPOCH FROM (r2.completed_at - r2.created_at)) < 86400
          ORDER BY r2.completed_at DESC
          LIMIT 3
        ) sub
      ), 0) AS avg_recent,
      COALESCE((
        SELECT MIN(sub.diff) FROM (
          SELECT EXTRACT(EPOCH FROM (r2.completed_at - r2.created_at)) AS diff
          FROM public.recargas r2
          WHERE r2.status = 'completed'
            AND r2.completed_at IS NOT NULL
            AND INITCAP(LOWER(TRIM(r2.operadora))) = INITCAP(LOWER(TRIM(r.operadora)))
            AND EXTRACT(EPOCH FROM (r2.completed_at - r2.created_at)) > 0
            AND EXTRACT(EPOCH FROM (r2.completed_at - r2.created_at)) < 86400
          ORDER BY r2.completed_at DESC
          LIMIT 3
        ) sub
      ), 0) AS min_recent,
      COALESCE(MIN(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND r.created_at >= now24h AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400), 0) AS min_24h,
      COALESCE(AVG(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND r.created_at >= now24h AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400), 0) AS avg_24h,
      COALESCE(MAX(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND r.created_at >= now24h AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400), 0) AS max_24h,
      COUNT(*) FILTER (WHERE r.status = 'pending') AS pending_count
    FROM public.recargas r
    WHERE r.created_at >= now24h
      AND r.operadora IS NOT NULL
      AND TRIM(r.operadora) != ''
    GROUP BY INITCAP(LOWER(TRIM(r.operadora)))
  ) stats;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;