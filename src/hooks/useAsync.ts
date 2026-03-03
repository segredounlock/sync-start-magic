import { useState, useCallback, useRef } from "react";

interface UseAsyncOptions {
  /** Number of retries on failure (default: 0) */
  retries?: number;
  /** Timeout in ms (default: 15000) */
  timeout?: number;
  /** Show initial loading only on first call */
  initialOnly?: boolean;
}

interface UseAsyncReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

/**
 * Hook global de loading resiliente.
 * Encapsula o padrão repetido de loading/error/retry com timeout.
 *
 * @example
 * const { execute, loading, error, data } = useAsync(async () => {
 *   const { data } = await supabase.from("recargas").select("*");
 *   return data;
 * }, { retries: 2, timeout: 10000 });
 */
export function useAsync<T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const { retries = 0, timeout = 15000, initialOnly = false } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // If initialOnly and already ran, don't show loading
    const showLoading = !initialOnly || !hasRun.current;
    if (showLoading) setLoading(true);
    setError(null);

    let lastError: string | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await Promise.race([
          asyncFn(...args),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), timeout)
          ),
        ]);
        setData(result);
        hasRun.current = true;
        setLoading(false);
        return result;
      } catch (err: any) {
        lastError = err?.message || "Erro desconhecido";
        if (attempt < retries) {
          // Exponential backoff: 1s, 2s, 4s...
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
      }
    }

    setError(lastError);
    setLoading(false);
    hasRun.current = true;
    return null;
  }, [asyncFn, retries, timeout, initialOnly]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    hasRun.current = false;
  }, []);

  return { data, loading, error, execute, reset };
}
