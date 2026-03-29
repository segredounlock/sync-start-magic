import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Loader2, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronRight, RefreshCw, Wrench, Eye, Copy, Info,
  ClipboardList, FileText,
} from "lucide-react";
import { useVerificationRunner } from "./system-verification/useVerificationRunner";
import { useAutoFix } from "./system-verification/useAutoFix";
import { SOLUTIONS } from "./system-verification/solutions";
import type { CheckStatus } from "./system-verification/types";

/* ─── Helpers ─── */
const statusIcon = (status: CheckStatus) => {
  const map = {
    ok: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />,
    info: <Info className="h-3.5 w-3.5 text-blue-400 shrink-0" />,
    error: <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />,
  };
  return map[status];
};
const statusColor = (s: CheckStatus) =>
  s === "ok" ? "text-emerald-400" : s === "warning" ? "text-amber-400" : s === "info" ? "text-blue-400" : "text-red-400";
const statusBg = (s: CheckStatus) =>
  s === "ok" ? "bg-emerald-500/15" : s === "warning" ? "bg-amber-500/15" : s === "info" ? "bg-blue-500/15" : "bg-red-500/15";
const riskBadge = (level?: "low" | "medium" | "high") => {
  if (!level) return null;
  const map = { low: "🟢 Baixo", medium: "🟡 Médio", high: "🔴 Alto" };
  return <span className="text-[9px] text-muted-foreground ml-1">Risco: {map[level]}</span>;
};

export default function SystemVerification() {
  const { running, progress, stage, results, setResults, runVerification } = useVerificationRunner();
  const { fixing, fixLog, fixBucket, fixConfig, fixAll, fixableCount } = useAutoFix(results, setResults);

  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);
  const [showLog, setShowLog] = useState(false);

  const copyText = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(id);
    setTimeout(() => setCopiedSql(null), 2000);
  }, []);

  const overall = results
    ? results.some(c => c.status === "error") ? "error"
    : results.some(c => c.status === "warning") ? "warning"
    : "ok" : null;

  const totalChecks = results ? results.reduce((s, c) => s + c.items.length, 0) : 0;
  const passedChecks = results ? results.reduce((s, c) => s + c.items.filter(i => i.status === "ok").length, 0) : 0;
  const issueCount = results ? results.reduce((s, c) => s + c.items.filter(i => i.status === "error" || i.status === "warning").length, 0) : 0;

  return (
    <div className="space-y-4">
      {/* ─── Action button ─── */}
      <button
        onClick={runVerification}
        disabled={running}
        className="w-full relative group rounded-2xl p-4 bg-card border border-border shadow-sm hover:bg-muted/60 hover:shadow-md hover:border-emerald-500/30 transition-all text-left disabled:opacity-60"
      >
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500/25 to-teal-500/25 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            {running ? <Loader2 className="h-5 w-5 animate-spin text-emerald-400" /> : <ShieldCheck className="h-5 w-5 text-emerald-400" />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">
              {running ? "Verificando Sistema..." : "Verificar Integridade do Sistema"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {running ? stage : "Tabelas, colunas, RLS, funções, storage, espelhos e mais"}
            </p>
          </div>
          {!running && <RefreshCw className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />}
        </div>
        {running && (
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        )}
      </button>

      {/* ─── Results ─── */}
      <AnimatePresence>
        {results && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Overall score */}
            <div className={`rounded-2xl p-4 border shadow-sm ${
              overall === "ok" ? "bg-emerald-500/5 border-emerald-500/20"
              : overall === "warning" ? "bg-amber-500/5 border-amber-500/20"
              : "bg-red-500/5 border-red-500/20"
            }`}>
              <div className="flex items-center gap-3">
                {overall === "ok" ? <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                : overall === "warning" ? <AlertTriangle className="h-6 w-6 text-amber-400" />
                : <XCircle className="h-6 w-6 text-red-400" />}
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    {overall === "ok" ? "Sistema 100% Operacional ✅"
                    : overall === "warning" ? "Sistema com Avisos ⚠️"
                    : "Problemas Detectados ❌"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {passedChecks}/{totalChecks} OK · {results.length} categorias
                    {issueCount > 0 && ` · ${issueCount} problema(s)`}
                    {fixableCount > 0 && ` · ${fixableCount} corrigível(is)`}
                  </p>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-3 flex gap-2">
                {fixableCount > 0 && (
                  <button
                    onClick={fixAll}
                    disabled={!!fixing}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    {fixing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wrench className="h-3.5 w-3.5" />}
                    Corrigir {fixableCount} item(ns)
                  </button>
                )}
                {fixLog.length > 0 && (
                  <button
                    onClick={() => setShowLog(!showLog)}
                    className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground text-xs font-semibold transition-colors"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    Log ({fixLog.length})
                  </button>
                )}
              </div>

              {/* Fix log */}
              <AnimatePresence>
                {showLog && fixLog.length > 0 && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-2 p-2.5 rounded-lg bg-muted/30 border border-border space-y-1 max-h-40 overflow-y-auto">
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">📋 Histórico de Correções</p>
                      {fixLog.map((log, i) => (
                        <div key={i} className="flex items-start gap-2 text-[10px]">
                          <span className="text-muted-foreground shrink-0">{log.time.toLocaleTimeString("pt-BR")}</span>
                          <span className="text-foreground">{log.action}</span>
                          <span className={log.result.startsWith("✅") ? "text-emerald-400" : "text-red-400"}>{log.result}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Category cards — sorted by severity: error → warning → ok */}
            {[...results].sort((a, b) => {
              const priority = (s: CheckStatus) => s === "error" ? 0 : s === "warning" ? 1 : s === "info" ? 2 : 3;
              return priority(a.status) - priority(b.status);
            }).map(cat => {
              const catIssues = cat.items.filter(i => i.status === "error" || i.status === "warning").length;
              const catFixable = cat.items.filter(i => i.status !== "ok" && i.solutionKey && SOLUTIONS[i.solutionKey]?.fixable).length;
              return (
                <div key={cat.id} className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-muted/40 transition-colors text-left"
                  >
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${statusBg(cat.status)}`}>
                      <cat.icon className={`h-4 w-4 ${statusColor(cat.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{cat.label}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{cat.summary}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBg(cat.status)} ${statusColor(cat.status)}`}>
                        {cat.status === "ok" ? "OK" : cat.status === "warning" ? "AVISO" : cat.status === "info" ? "INFO" : "ERRO"}
                      </span>
                      {catFixable > 0 && (
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                          {catFixable}🔧
                        </span>
                      )}
                      {expandedCat === cat.id ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedCat === cat.id && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="border-t border-border px-3 py-2 space-y-1 max-h-80 overflow-y-auto">
                          {/* Category-level fix all */}
                          {catFixable > 0 && (
                            <button
                              onClick={async () => {
                                for (const item of cat.items) {
                                  if (item.status === "ok" || !item.solutionKey || !SOLUTIONS[item.solutionKey]?.fixable) continue;
                                  if (item.solutionKey === "bucket:missing") await fixBucket(item.name);
                                  if (item.solutionKey === "config:missing") await fixConfig(item.name);
                                }
                              }}
                              className="w-full mb-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold transition-colors"
                            >
                              <Wrench className="h-3 w-3" />
                              Corrigir {catFixable} item(ns) desta categoria
                            </button>
                          )}

                          {cat.items.map(item => {
                            const solution = item.solutionKey ? SOLUTIONS[item.solutionKey] : null;
                            const itemKey = `${cat.id}-${item.name}`;
                            return (
                              <div key={item.name} className="py-1">
                                <div className="flex items-center gap-2">
                                  {statusIcon(item.status)}
                                  <span className="text-xs text-foreground font-mono truncate flex-1">{item.name}</span>
                                  <span className={`text-[10px] shrink-0 ${statusColor(item.status)}`}>{item.detail}</span>

                                  {solution && item.status !== "ok" && (
                                    <div className="flex items-center gap-1 shrink-0 ml-1">
                                      {solution.fixable ? (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.solutionKey === "bucket:missing") fixBucket(item.name);
                                            if (item.solutionKey === "config:missing") fixConfig(item.name);
                                          }}
                                          disabled={fixing === item.name}
                                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[10px] font-semibold transition-colors disabled:opacity-50"
                                        >
                                          {fixing === item.name ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wrench className="h-3 w-3" />}
                                          {item.solutionKey === "bucket:missing" ? "Criar" : "Inicializar"}
                                        </button>
                                      ) : (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowSolution(showSolution === itemKey ? null : itemKey);
                                          }}
                                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 text-[10px] font-semibold transition-colors"
                                        >
                                          <Eye className="h-3 w-3" />
                                          Solução
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Solution panel */}
                                <AnimatePresence>
                                  {showSolution === itemKey && solution && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                      <div className="mt-1.5 ml-5 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15 space-y-1.5">
                                        <div className="flex items-center gap-1">
                                          <FileText className="h-3 w-3 text-blue-400" />
                                          <span className="text-[11px] font-semibold text-blue-400">Como resolver</span>
                                          {riskBadge(solution.riskLevel)}
                                        </div>
                                        <p className="text-[11px] text-blue-300">{solution.instruction}</p>
                                        {solution.sqlHint && (
                                          <div className="relative">
                                            <pre className="bg-muted/50 rounded p-2 text-[10px] font-mono text-foreground/70 overflow-x-auto whitespace-pre-wrap">
                                              {solution.sqlHint.replace(/TABELA/g, item.name.split(".")[0] || item.name)}
                                            </pre>
                                            <button
                                              onClick={() => copyText(solution.sqlHint!.replace(/TABELA/g, item.name.split(".")[0] || item.name), itemKey)}
                                              className="absolute top-1 right-1 p-1 rounded bg-muted hover:bg-muted/80"
                                            >
                                              <Copy className={`h-3 w-3 ${copiedSql === itemKey ? "text-emerald-400" : "text-muted-foreground"}`} />
                                            </button>
                                            {copiedSql === itemKey && (
                                              <span className="absolute top-1 right-7 text-[9px] text-emerald-400">Copiado!</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
