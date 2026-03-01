import { supabase } from "@/integrations/supabase/client";

/**
 * Fetch all rows from a Supabase table, paginating in batches to bypass the 1000-row default limit.
 */
export async function fetchAllRows<T = any>(
  table: string,
  options?: {
    select?: string;
    filters?: (query: any) => any;
    orderBy?: { column: string; ascending?: boolean };
    batchSize?: number;
  }
): Promise<T[]> {
  const batchSize = options?.batchSize || 1000;
  let allData: T[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    let query = (supabase.from(table as any) as any).select(options?.select || "*");
    if (options?.filters) query = options.filters(query);
    if (options?.orderBy) query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? false });
    query = query.range(from, from + batchSize - 1);

    const { data, error } = await query;
    if (error) throw error;

    const rows = (data || []) as T[];
    allData = allData.concat(rows);

    if (rows.length < batchSize) {
      hasMore = false;
    } else {
      from += batchSize;
    }
  }

  return allData;
}
