import { useState, useCallback, useRef, useEffect, MutableRefObject } from "react";

interface UseAsyncOptions {
  /** Number of retries on failure (default: 0) */
  retries?: number;
  /** Timeout in ms (default: 15000) */
  timeout?: number;
  /** Show loading only on first call (default: false) */
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
 * Hook global de loading resiliente com retry e timeout.
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

/**
 * Hook para fetch principal com loading resiliente e padrão initialOnly.
 * Loading só aparece no primeiro fetch; chamadas subsequentes são silenciosas.
 * Timeout de 20s garante que loading nunca trava.
 */
export function useResilientFetch(options: { timeout?: number } = {}) {
  const { timeout = 20000 } = options;
  const [loading, setLoading] = useState(false);
  const hasLoaded = useRef(false);

  // Safety net: ensure loading never stays true forever
  useEffect(() => {
    const safety = setTimeout(() => {
      if (!hasLoaded.current) {
        hasLoaded.current = true;
        setLoading(false);
      }
    }, 10000);
    return () => clearTimeout(safety);
  }, []);

  const runFetch = useCallback(async (fn: () => Promise<void>) => {
    if (!hasLoaded.current) setLoading(true);
    try {
      await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), timeout)
        ),
      ]);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      hasLoaded.current = true;
      setLoading(false);
    }
  }, [timeout]);

  return { loading, runFetch };
}

/**
 * Função utilitária (não-hook) para wrapping seguro de operações async.
 * Garante que setLoading(false) e loadedRef.current = true sempre executam.
 *
 * @example
 * const fetchRecargas = useCallback(async () => {
 *   await guardedFetch(recargasLoaded, setRecargasLoading, async () => {
 *     const { data } = await supabase.from("recargas").select("*");
 *     setRecargas(data || []);
 *   });
 * }, []);
 */
export async function guardedFetch(
  loadedRef: MutableRefObject<boolean>,
  setLoading: (v: boolean) => void,
  fn: () => Promise<void>,
  options?: { timeout?: number }
): Promise<void> {
  const timeout = options?.timeout || 20000;
  if (!loadedRef.current) setLoading(true);
  try {
    await Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), timeout)
      ),
    ]);
  } catch (err) {
    console.error("guardedFetch error:", err);
  } finally {
    loadedRef.current = true;
    setLoading(false);
  }
}
