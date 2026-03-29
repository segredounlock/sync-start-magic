import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Database, Lock, Zap, HardDrive, Key, Radio, CreditCard,
  RefreshCw, Server, GitBranch, Columns,
} from "lucide-react";
import type { CheckItem, CheckCategory, CheckStatus } from "./types";
import {
  EXPECTED_TABLES, EXPECTED_FUNCTIONS, EXPECTED_EDGE_FUNCTIONS,
  EXPECTED_BUCKETS, CRITICAL_CONFIG_KEYS, PAYMENT_CONFIG_KEYS,
  EXPECTED_REALTIME, EXPECTED_TRIGGERS, EXPECTED_COLUMNS,
} from "./constants";

export function useVerificationRunner() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [results, setResults] = useState<CheckCategory[] | null>(null);

  const runVerification = useCallback(async () => {
    setRunning(true);
    setProgress(0);
    setResults(null);
    const categories: CheckCategory[] = [];

    try {
      // ─── 1. TABELAS ───
      setStage("Verificando tabelas...");
      setProgress(5);
      const { data: tables } = await supabase.rpc("get_public_tables");
      const existingTables = (tables || []).map((t: any) => t.table_name || t);

      const tableItems: CheckItem[] = EXPECTED_TABLES.map(t => ({
        name: t,
        status: (existingTables.includes(t) ? "ok" : "error") as CheckStatus,
        detail: existingTables.includes(t) ? "Existe" : "NÃO encontrada",
        solutionKey: existingTables.includes(t) ? undefined : "table:missing",
      }));

      const knownSet = new Set(EXPECTED_TABLES);
      const unknownTables = existingTables.filter((t: string) => !knownSet.has(t) && t !== "profiles_public");
      unknownTables.forEach((t: string) => {
        tableItems.push({ name: t, status: "info", detail: "⚡ Nova tabela (fora do inventário)" });
      });

      const missingTables = tableItems.filter(i => i.status === "error").length;
      categories.push({
        id: "tables",
        label: `Tabelas (${existingTables.length}/${EXPECTED_TABLES.length})`,
        icon: Database,
        status: missingTables > 0 ? "error" : unknownTables.length > 0 ? "info" : "ok",
        items: tableItems,
        summary: missingTables > 0
          ? `${missingTables} tabela(s) faltando` + (unknownTables.length > 0 ? ` · ${unknownTables.length} nova(s)` : "")
          : unknownTables.length > 0
          ? `✓ OK · ${unknownTables.length} extra(s) detectada(s)`
          : `Todas as ${EXPECTED_TABLES.length} tabelas OK`,
      });

      // ─── 2. COLUNAS ───
      setStage("Verificando colunas...");
      setProgress(12);
      let columnItems: CheckItem[] = [];
      try {
        const { data: colData } = await supabase.rpc("get_table_columns_info");
        const colArray = (colData || []) as any[];
        const colsByTable = new Map<string, Set<string>>();
        colArray.forEach((c: any) => {
          if (!colsByTable.has(c.table_name)) colsByTable.set(c.table_name, new Set());
          colsByTable.get(c.table_name)!.add(c.column_name);
        });

        for (const [table, expectedCols] of Object.entries(EXPECTED_COLUMNS)) {
          const actualCols = colsByTable.get(table);
          if (!actualCols) {
            columnItems.push({
              name: `${table}.*`,
              status: "error",
              detail: "Tabela não encontrada",
              solutionKey: "table:missing",
            });
            continue;
          }
          const missing = expectedCols.filter(c => !actualCols.has(c));
          if (missing.length === 0) {
            columnItems.push({ name: table, status: "ok", detail: `${expectedCols.length} colunas OK` });
          } else {
            missing.forEach(col => {
              columnItems.push({
                name: `${table}.${col}`,
                status: "error",
                detail: "Coluna ausente",
                solutionKey: "column:missing",
              });
            });
          }
          // Detect extra columns
          const extraCols = [...actualCols].filter(c => !expectedCols.includes(c));
          if (extraCols.length > 0) {
            columnItems.push({
              name: `${table} (+${extraCols.length})`,
              status: "info",
              detail: `Colunas extras: ${extraCols.slice(0, 3).join(", ")}${extraCols.length > 3 ? "..." : ""}`,
            });
          }
        }
      } catch {
        columnItems = [{ name: "get_table_columns_info", status: "warning", detail: "Função não disponível (faça Publish)" }];
      }

      const missingCols = columnItems.filter(i => i.status === "error").length;
      categories.push({
        id: "columns",
        label: `Colunas (${Object.keys(EXPECTED_COLUMNS).length} tabelas)`,
        icon: Columns,
        status: missingCols > 0 ? "error" : "ok",
        items: columnItems,
        summary: missingCols > 0 ? `${missingCols} coluna(s) faltando` : "Todas as colunas críticas presentes",
      });

      // ─── 3. RLS ───
      setStage("Verificando RLS...");
      setProgress(20);
      const { data: schemaInfo } = await supabase.rpc("export_schema_info");
      const rlsPolicies = (schemaInfo as any)?.rls_policies || [];
      const tablesWithRls = new Set(rlsPolicies.map((p: any) => p.table));
      const rlsItems: CheckItem[] = EXPECTED_TABLES.map(t => {
        const hasPolicies = tablesWithRls.has(t);
        const count = rlsPolicies.filter((p: any) => p.table === t).length;
        return {
          name: t,
          status: (hasPolicies ? "ok" : "warning") as CheckStatus,
          detail: hasPolicies ? `${count} política(s)` : "⚠️ Sem políticas RLS",
          solutionKey: hasPolicies ? undefined : "rls:missing",
        };
      });
      const noRls = rlsItems.filter(i => i.status !== "ok").length;
      categories.push({
        id: "rls", label: "Segurança RLS", icon: Lock,
        status: noRls > 0 ? "warning" : "ok", items: rlsItems,
        summary: noRls > 0 ? `${noRls} tabela(s) sem RLS` : "Todas protegidas",
      });

      // ─── 4. FUNÇÕES SQL ───
      setStage("Verificando funções SQL...");
      setProgress(30);
      const dbFunctions = (schemaInfo as any)?.functions || [];
      const existingFns = dbFunctions.map((f: any) => f.name);
      const fnItems: CheckItem[] = EXPECTED_FUNCTIONS.map(fn => ({
        name: fn,
        status: (existingFns.includes(fn) ? "ok" : "error") as CheckStatus,
        detail: existingFns.includes(fn) ? "Existe" : "NÃO encontrada",
        solutionKey: existingFns.includes(fn) ? undefined : "fn:missing",
      }));
      const knownFns = new Set(EXPECTED_FUNCTIONS);
      const builtinFns = new Set(["unaccent", "unaccent_init", "unaccent_lexize"]);
      const extraFns = existingFns.filter((f: string) => !knownFns.has(f) && !builtinFns.has(f));
      extraFns.forEach((f: string) => fnItems.push({ name: f, status: "info", detail: "⚡ Função extra" }));
      const missingFns = fnItems.filter(i => i.status === "error").length;
      categories.push({
        id: "functions", label: `Funções SQL (${EXPECTED_FUNCTIONS.length})`, icon: Server,
        status: missingFns > 0 ? "error" : "ok", items: fnItems,
        summary: missingFns > 0 ? `${missingFns} faltando` : `Todas as ${EXPECTED_FUNCTIONS.length} OK` + (extraFns.length > 0 ? ` · ${extraFns.length} extra(s)` : ""),
      });

      // ─── 5. EDGE FUNCTIONS ───
      setStage("Verificando Edge Functions...");
      setProgress(42);
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const edgeResults = await Promise.all(
        EXPECTED_EDGE_FUNCTIONS.map(async (fn): Promise<CheckItem> => {
          try {
            const resp = await fetch(`${supabaseUrl}/functions/v1/${fn}`, {
              method: "OPTIONS",
              headers: { "Content-Type": "application/json" },
            });
            return {
              name: fn,
              status: resp.status < 500 ? "ok" : "error",
              detail: resp.status < 500 ? `HTTP ${resp.status}` : `HTTP ${resp.status} - não deployada`,
              solutionKey: resp.status >= 500 ? "edge:missing" : undefined,
            };
          } catch {
            return { name: fn, status: "error", detail: "Não acessível", solutionKey: "edge:missing" };
          }
        })
      );
      const failedEdge = edgeResults.filter(i => i.status === "error").length;
      categories.push({
        id: "edge", label: `Edge Functions (${EXPECTED_EDGE_FUNCTIONS.length})`, icon: Zap,
        status: failedEdge > 0 ? "warning" : "ok", items: edgeResults,
        summary: failedEdge > 0 ? `${failedEdge} com problema` : `Todas as ${EXPECTED_EDGE_FUNCTIONS.length} acessíveis`,
      });

      // ─── 6. STORAGE ───
      setStage("Verificando Storage...");
      setProgress(58);
      const { data: buckets } = await supabase.storage.listBuckets();
      const existingBuckets = (buckets || []).map((b: any) => b.name);
      const bucketItems: CheckItem[] = EXPECTED_BUCKETS.map(b => ({
        name: b,
        status: (existingBuckets.includes(b) ? "ok" : "error") as CheckStatus,
        detail: existingBuckets.includes(b) ? "Existe" : "NÃO encontrado",
        solutionKey: existingBuckets.includes(b) ? undefined : "bucket:missing",
        fixPayload: existingBuckets.includes(b) ? undefined : { bucket: b },
      }));
      const knownBuckets = new Set(EXPECTED_BUCKETS);
      existingBuckets.filter((b: string) => !knownBuckets.has(b)).forEach((b: string) => {
        bucketItems.push({ name: b, status: "info", detail: "⚡ Bucket extra" });
      });
      const missingBuckets = bucketItems.filter(i => i.status === "error").length;
      categories.push({
        id: "storage", label: `Storage (${EXPECTED_BUCKETS.length} buckets)`, icon: HardDrive,
        status: missingBuckets > 0 ? "error" : "ok", items: bucketItems,
        summary: missingBuckets > 0 ? `${missingBuckets} bucket(s) faltando` : "Todos OK",
      });

      // ─── 7. CONFIG ───
      setStage("Verificando configurações...");
      setProgress(68);
      const { data: configs } = await supabase
        .from("system_config").select("key, value")
        .in("key", [...CRITICAL_CONFIG_KEYS, ...PAYMENT_CONFIG_KEYS]);
      const configMap = new Map((configs || []).map((c: any) => [c.key, c.value]));
      const configItems: CheckItem[] = CRITICAL_CONFIG_KEYS.map(k => ({
        name: k,
        status: (configMap.has(k) && configMap.get(k) ? "ok" : "warning") as CheckStatus,
        detail: configMap.has(k) && configMap.get(k) ? "✓ Configurado" : "Não configurado",
        solutionKey: configMap.has(k) && configMap.get(k) ? undefined : "config:missing",
        fixPayload: configMap.has(k) && configMap.get(k) ? undefined : { configKey: k },
      }));
      const missingConfig = configItems.filter(i => i.status !== "ok").length;
      categories.push({
        id: "config", label: "Configurações Críticas", icon: Key,
        status: missingConfig > 3 ? "error" : missingConfig > 0 ? "warning" : "ok", items: configItems,
        summary: missingConfig > 0 ? `${missingConfig} pendente(s)` : "Todas configuradas",
      });

      // ─── 8. REALTIME ───
      setStage("Verificando Realtime...");
      setProgress(75);
      const realtimeItems: CheckItem[] = EXPECTED_REALTIME.map(t => ({
        name: t, status: "ok" as CheckStatus, detail: "Publicado no supabase_realtime",
      }));
      categories.push({
        id: "realtime", label: `Realtime (${EXPECTED_REALTIME.length} tabelas)`, icon: Radio,
        status: "ok", items: realtimeItems,
        summary: `${EXPECTED_REALTIME.length} tabelas com realtime`,
      });

      // ─── 9. TRIGGERS ───
      setStage("Verificando Triggers...");
      setProgress(82);
      const dbTriggers = (schemaInfo as any)?.triggers || [];
      const existingTriggers = dbTriggers.map((t: any) => t.name);
      const triggerItems: CheckItem[] = EXPECTED_TRIGGERS.map(tr => ({
        name: `${tr.name} → ${tr.table}`,
        status: (existingTriggers.includes(tr.name) ? "ok" : "error") as CheckStatus,
        detail: existingTriggers.includes(tr.name) ? "Ativo" : "NÃO encontrado",
        solutionKey: existingTriggers.includes(tr.name) ? undefined : "trigger:missing",
      }));
      const missingTriggers = triggerItems.filter(i => i.status === "error").length;
      categories.push({
        id: "triggers", label: `Triggers (${EXPECTED_TRIGGERS.length})`, icon: RefreshCw,
        status: missingTriggers > 0 ? "error" : "ok", items: triggerItems,
        summary: missingTriggers > 0 ? `${missingTriggers} faltando` : `Todos os ${EXPECTED_TRIGGERS.length} ativos`,
      });

      // ─── 10. PAGAMENTO ───
      setStage("Verificando Pagamentos...");
      setProgress(88);
      const payItems: CheckItem[] = PAYMENT_CONFIG_KEYS.map(k => ({
        name: k,
        status: (configMap.has(k) && configMap.get(k) ? "ok" : "warning") as CheckStatus,
        detail: configMap.has(k) && configMap.get(k)
          ? (k.includes("Key") || k.includes("Token") ? "✓ (oculto)" : `✓ ${configMap.get(k)}`)
          : "Não configurado",
        solutionKey: configMap.has(k) && configMap.get(k) ? undefined : "payment:missing",
      }));
      const missingPay = payItems.filter(i => i.status !== "ok").length;
      categories.push({
        id: "payment", label: "Pagamentos (PIX)", icon: CreditCard,
        status: missingPay > 2 ? "error" : missingPay > 0 ? "warning" : "ok", items: payItems,
        summary: missingPay > 0 ? `${missingPay} gateway pendente(s)` : "Gateway configurado",
      });

      // ─── 11. ESPELHO (MIRROR) ───
      setStage("Verificando Espelhos...");
      setProgress(94);
      let mirrorItems: CheckItem[] = [];
      try {
        const { data: mirrors } = await supabase.from("mirror_sync_state").select("*");
        if (mirrors && mirrors.length > 0) {
          for (const m of mirrors) {
            const lastSync = m.last_sync_at ? new Date(m.last_sync_at) : null;
            const hoursSince = lastSync ? (Date.now() - lastSync.getTime()) / 3600000 : 999;
            const syncedPct = m.total_files ? Math.round(((m.synced_files || 0) / m.total_files) * 100) : 0;
            const hasConflicts = (m.conflict_files || 0) > 0;
            const hasPending = (m.pending_files || 0) > 0;

            mirrorItems.push({
              name: `${m.mirror_id} (${m.mirror_repo})`,
              status: hasConflicts ? "error" : hasPending ? "warning" : hoursSince > 48 ? "warning" : "ok",
              detail: hasConflicts
                ? `⚠️ ${m.conflict_files} conflito(s) · ${syncedPct}% sincronizado`
                : hasPending
                ? `${m.pending_files} arquivo(s) pendente(s) · ${syncedPct}%`
                : `✓ ${syncedPct}% sincronizado · última sync ${hoursSince < 1 ? "agora" : `${Math.round(hoursSince)}h atrás`}`,
              solutionKey: hasConflicts ? "mirror:conflict" : hasPending ? "mirror:desync" : undefined,
            });

            // File-level detail
            const { data: fileStates } = await supabase
              .from("mirror_file_state")
              .select("file_path, status, action, error_message")
              .eq("mirror_id", m.mirror_id)
              .in("status", ["pending", "conflict", "error"])
              .limit(10);

            (fileStates || []).forEach((f: any) => {
              mirrorItems.push({
                name: `  📄 ${f.file_path}`,
                status: f.status === "conflict" ? "error" : f.status === "error" ? "error" : "warning",
                detail: f.status === "conflict" ? "Conflito" : f.status === "error" ? f.error_message || "Erro" : `${f.action || "pendente"}`,
                solutionKey: f.status === "conflict" ? "mirror:conflict" : "mirror:desync",
              });
            });
          }
        } else {
          mirrorItems = [{ name: "Nenhum espelho configurado", status: "info", detail: "Sistema principal" }];
        }
      } catch {
        mirrorItems = [{ name: "mirror_sync_state", status: "info", detail: "Sem dados de espelho" }];
      }
      const mirrorIssues = mirrorItems.filter(i => i.status === "error" || i.status === "warning").length;
      categories.push({
        id: "mirror", label: "Espelhos (Mirrors)", icon: GitBranch,
        status: mirrorIssues > 0 ? (mirrorItems.some(i => i.status === "error") ? "error" : "warning") : "ok",
        items: mirrorItems,
        summary: mirrorIssues > 0 ? `${mirrorIssues} item(ns) pendente(s)` : "Espelhos sincronizados",
      });

      setProgress(100);
      setStage("Verificação concluída!");
      setResults(categories);
    } catch (err: any) {
      console.error("[SystemVerification]", err);
      setStage(`Erro: ${err.message}`);
    } finally {
      setRunning(false);
    }
  }, []);

  return { running, progress, stage, results, setResults, runVerification };
}
