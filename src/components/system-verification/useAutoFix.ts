import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CONFIG_DEFAULTS } from "./constants";
import { SOLUTIONS } from "./solutions";
import type { CheckCategory, CheckStatus } from "./types";

export function useAutoFix(
  results: CheckCategory[] | null,
  setResults: (fn: (prev: CheckCategory[] | null) => CheckCategory[] | null) => void,
) {
  const [fixing, setFixing] = useState<string | null>(null);
  const [fixLog, setFixLog] = useState<{ action: string; result: string; time: Date }[]>([]);

  const logFix = useCallback((action: string, result: string) => {
    setFixLog(prev => [...prev, { action, result, time: new Date() }]);
  }, []);

  const auditFix = useCallback(async (action: string, detail: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          admin_id: user.id,
          action: "system_fix",
          target_type: "system_verification",
          target_id: action,
          details: { action, detail, fixed_at: new Date().toISOString() },
        });
      }
    } catch { /* silent */ }
  }, []);

  const fixBucket = useCallback(async (bucketName: string) => {
    setFixing(bucketName);
    try {
      const isPublic = bucketName !== "login-selfies";
      const { error } = await supabase.storage.createBucket(bucketName, { public: isPublic });
      if (error) throw error;
      setResults(prev => prev?.map(cat => cat.id === "storage" ? {
        ...cat,
        items: cat.items.map(i => i.name === bucketName ? { ...i, status: "ok" as CheckStatus, detail: "✓ Criado agora", solutionKey: undefined } : i),
        status: cat.items.filter(i => i.name !== bucketName && i.status === "error").length > 0 ? "error" as CheckStatus : "ok" as CheckStatus,
        summary: cat.items.filter(i => i.name !== bucketName && i.status === "error").length > 0
          ? `${cat.items.filter(i => i.name !== bucketName && i.status === "error").length} bucket(s) faltando`
          : "Todos os buckets OK",
      } : cat) || null);
      logFix(`Criar bucket: ${bucketName}`, "✅ Sucesso");
      await auditFix("create_bucket", bucketName);
    } catch (err: any) {
      logFix(`Criar bucket: ${bucketName}`, `❌ Erro: ${err.message}`);
    } finally {
      setFixing(null);
    }
  }, [setResults, logFix, auditFix]);

  const fixConfig = useCallback(async (key: string) => {
    setFixing(key);
    try {
      const defaultVal = CONFIG_DEFAULTS[key] ?? "";
      const { error } = await supabase.from("system_config").upsert(
        { key, value: defaultVal },
        { onConflict: "key" }
      );
      if (error) throw error;
      setResults(prev => prev?.map(cat => {
        if (cat.id !== "config" && cat.id !== "payment") return cat;
        return {
          ...cat,
          items: cat.items.map(i => i.name === key ? { ...i, status: "ok" as CheckStatus, detail: `✓ Inicializado: "${defaultVal || "(vazio)"}"`, solutionKey: undefined } : i),
        };
      }) || null);
      logFix(`Inicializar config: ${key}`, `✅ Valor: "${defaultVal || "(vazio)"}"`);
      await auditFix("init_config", `${key}=${defaultVal}`);
    } catch (err: any) {
      logFix(`Inicializar config: ${key}`, `❌ Erro: ${err.message}`);
    } finally {
      setFixing(null);
    }
  }, [setResults, logFix, auditFix]);

  const fixAll = useCallback(async () => {
    if (!results) return;
    for (const cat of results) {
      for (const item of cat.items) {
        if (!item.solutionKey || !SOLUTIONS[item.solutionKey]?.fixable) continue;
        if (item.status === "ok") continue;
        if (item.solutionKey === "bucket:missing") await fixBucket(item.name);
        if (item.solutionKey === "config:missing") await fixConfig(item.name);
      }
    }
  }, [results, fixBucket, fixConfig]);

  const fixableCount = results
    ? results.reduce((s, c) => s + c.items.filter(i => i.status !== "ok" && i.solutionKey && SOLUTIONS[i.solutionKey]?.fixable).length, 0)
    : 0;

  return { fixing, fixLog, fixBucket, fixConfig, fixAll, fixableCount };
}
