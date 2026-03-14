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

  SELECT jsonb_agg(row_to_json(final_stats)::jsonb)
  INTO result
  FROM (
    SELECT
      base.operadora,
      base.recent_count,
      base.min_24h,
      base.avg_24h,
      base.max_24h,
      base.pending_count,
      COALESCE(recent.avg_recent, 0) AS avg_recent,
      COALESCE(recent.min_recent, 0) AS min_recent
    FROM (
      SELECT
        INITCAP(LOWER(TRIM(r.operadora))) AS operadora,
        COUNT(*) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400) AS recent_count,
        COALESCE(MIN(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400), 0) AS min_24h,
        COALESCE(AVG(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400), 0) AS avg_24h,
        COALESCE(MAX(EXTRACT(EPOCH FROM (r.completed_at - r.created_at))) FILTER (WHERE r.status = 'completed' AND r.completed_at IS NOT NULL AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) > 0 AND EXTRACT(EPOCH FROM (r.completed_at - r.created_at)) < 86400), 0) AS max_24h,
        COUNT(*) FILTER (WHERE r.status = 'pending') AS pending_count
      FROM public.recargas r
      WHERE r.created_at >= now24h
        AND r.operadora IS NOT NULL
        AND TRIM(r.operadora) != ''
      GROUP BY INITCAP(LOWER(TRIM(r.operadora)))
    ) base
    LEFT JOIN LATERAL (
      SELECT
        AVG(sub.diff) AS avg_recent,
        MIN(sub.diff) AS min_recent
      FROM (
        SELECT EXTRACT(EPOCH FROM (r3.completed_at - r3.created_at)) AS diff
        FROM public.recargas r3
        WHERE r3.status = 'completed'
          AND r3.completed_at IS NOT NULL
          AND INITCAP(LOWER(TRIM(r3.operadora))) = base.operadora
          AND EXTRACT(EPOCH FROM (r3.completed_at - r3.created_at)) > 0
          AND EXTRACT(EPOCH FROM (r3.completed_at - r3.created_at)) < 86400
        ORDER BY r3.completed_at DESC
        LIMIT 3
      ) sub
    ) recent ON true
  ) final_stats;

  RETURN COALESCE(result, '[]'::jsonb);
END;
$$;