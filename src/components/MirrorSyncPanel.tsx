import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, AlertTriangle, RefreshCw, Shield,
  ChevronDown, ChevronRight, X, Clock, Hash, GitBranch,
  ArrowUpFromLine, Eye, FileWarning, FolderSync,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getFileHashes } from "@/lib/sourceManifest";
import { formatFullDateTimeBR } from "@/lib/timezone";
import { styledToast as toast } from "@/lib/toast";

interface MirrorSyncPanelProps {
  mirrorRepo: string;
  sourceRepo: string;
}

interface FileState {
  file_path: string;
  source_hash: string | null;
  mirror_hash: string | null;
  status: string;
  action: string | null;
  error_message: string | null;
}

interface SyncLog {
  id: string;
  mirror_id: string;
  sync_type: string;
  files_sent: number;
  files_skipped: number;
  files_failed: number;
  conflicts_detected: number;
  duration_ms: number | null;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

interface HealthCheck {
  key: string;
  ok: boolean;
  detail: string;
}

interface ReconcileResult {
  summary: { total: number; synced: number; pending: number; conflict: number; protected: number; new_files: number; modified: number };
}

export default function MirrorSyncPanel({ mirrorRepo, sourceRepo }: MirrorSyncPanelProps) {
  const mirrorId = mirrorRepo.split("/").pop() || mirrorRepo;

  const [reconciling, setReconciling] = useState(false);
  const [reconcileResult, setReconcileResult] = useState<ReconcileResult | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  const [pendingFiles, setPendingFiles] = useState<FileState[]>([]);
  const [conflictFiles, setConflictFiles] = useState<FileState[]>([]);
  const [showPending, setShowPending] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [mirrorReadiness, setMirrorReadiness] = useState<string | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const [protectedPaths, setProtectedPaths] = useState<string[]>([".env", "supabase/config.toml", ".github/workflows/"]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apikey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Sessão expirada");
    return session;
  };

  // Load mirror state on mount
  useEffect(() => {
    loadMirrorState();
  }, [mirrorRepo]);

  const loadMirrorState = async () => {
    try {
      // Load protected paths from mirror_sync_state
      const { data: stateData } = await supabase
        .from("mirror_sync_state" as any)
        .select("*")
        .eq("mirror_id", mirrorId)
        .maybeSingle();
      if (stateData) {
        const pp = (stateData as any).protected_paths;
        if (Array.isArray(pp)) setProtectedPaths(pp);
      }

      // Load pending & conflict files
      const { data: fileData } = await supabase
        .from("mirror_file_state" as any)
        .select("*")
        .eq("mirror_id", mirrorId)
        .in("status", ["pending", "conflict"])
        .order("file_path");
      if (fileData) {
        setPendingFiles((fileData as any[]).filter(f => f.status === "pending"));
        setConflictFiles((fileData as any[]).filter(f => f.status === "conflict"));
      }

      // Load sync logs
      const { data: logData } = await supabase
        .from("mirror_sync_logs" as any)
        .select("*")
        .eq("mirror_id", mirrorId)
        .order("started_at", { ascending: false })
        .limit(10);
      if (logData) setSyncLogs(logData as any[]);
    } catch { /* first load, tables may be empty */ }
  };

  const loadHealth = async () => {
    setLoadingHealth(true);
    try {
      const session = await getSession();
      const resp = await fetch(
        `${supabaseUrl}/functions/v1/github-sync?action=mirror-status&mirror_id=${encodeURIComponent(mirrorId)}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${session.access_token}`, apikey },
        }
      );
      const data = await resp.json();
      if (data.health) setHealthChecks(data.health);
      if (data.readiness) setMirrorReadiness(data.readiness);
    } catch { /* ignore */ }
    setLoadingHealth(false);
  };

  const handleReconcile = async () => {
    setReconciling(true);
    setReconcileResult(null);
    try {
      const session = await getSession();
      const sourceHashes = getFileHashes();

      const resp = await fetch(
        `${supabaseUrl}/functions/v1/github-sync?action=reconcile&mirror_id=${encodeURIComponent(mirrorId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey },
          body: JSON.stringify({
            source_hashes: sourceHashes,
            protected_paths: protectedPaths,
            mirror_repo: mirrorRepo,
            source_repo: sourceRepo,
          }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
      setReconcileResult(result);
      toast.success(`Análise concluída: ${result.summary.pending} pendentes, ${result.summary.conflict} conflitos`);
      await loadMirrorState();
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
    setReconciling(false);
  };

  const handleSmartSync = async () => {
    setSyncing(true);
    setSyncProgress(0);
    try {
      const session = await getSession();
      const sourceHashes = getFileHashes();

      const resp = await fetch(
        `${supabaseUrl}/functions/v1/github-sync?action=smart-sync&mirror_id=${encodeURIComponent(mirrorId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey },
          body: JSON.stringify({
            source_hashes: sourceHashes,
            mirror_repo: mirrorRepo,
          }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
      setSyncProgress(100);
      toast.success(`Sincronização concluída! ${result.files_sent} enviados, ${result.files_failed} falhas`);
      await loadMirrorState();
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
    setSyncing(false);
  };

  const handleForceSync = async (filePath: string) => {
    try {
      const session = await getSession();
      const sourceHashes = getFileHashes();

      const resp = await fetch(
        `${supabaseUrl}/functions/v1/github-sync?action=smart-sync&mirror_id=${encodeURIComponent(mirrorId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey },
          body: JSON.stringify({
            source_hashes: sourceHashes,
            mirror_repo: mirrorRepo,
            force_files: [filePath],
          }),
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
      toast.success(`${filePath} sincronizado!`);
      await loadMirrorState();
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
  };

  const totalPending = pendingFiles.length;
  const totalConflicts = conflictFiles.length;

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center">
            <GitBranch className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Sincronização Inteligente</p>
            <p className="text-xs text-muted-foreground">Análise de diferenças e sync incremental</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats cards */}
        {reconcileResult && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{reconcileResult.summary.synced}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Sincronizados</p>
            </div>
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-center">
              <p className="text-xl font-bold text-amber-400">{reconcileResult.summary.pending}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Pendentes</p>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center">
              <p className="text-xl font-bold text-red-400">{reconcileResult.summary.conflict}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Conflitos</p>
            </div>
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-center">
              <p className="text-xl font-bold text-blue-400">{reconcileResult.summary.protected}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Protegidos</p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleReconcile}
            disabled={reconciling}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-semibold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
          >
            {reconciling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
            Analisar Diferenças
          </button>
          <button
            onClick={handleSmartSync}
            disabled={syncing || totalPending === 0}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
            Sync Pendentes ({totalPending})
          </button>
        </div>

        {/* Sync progress */}
        {syncing && (
          <div className="space-y-2">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                initial={{ width: 0 }} animate={{ width: `${syncProgress}%` }} transition={{ duration: 0.3 }} />
            </div>
            <p className="text-[11px] text-muted-foreground text-right font-mono">{syncProgress}%</p>
          </div>
        )}

        {/* Pending files list */}
        {totalPending > 0 && (
          <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 overflow-hidden">
            <button onClick={() => setShowPending(!showPending)}
              className="w-full flex items-center justify-between p-3 hover:bg-amber-500/10 transition-colors">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                <FileWarning className="h-3.5 w-3.5" /> {totalPending} arquivo(s) pendente(s)
              </span>
              {showPending ? <ChevronDown className="h-3.5 w-3.5 text-amber-400" /> : <ChevronRight className="h-3.5 w-3.5 text-amber-400" />}
            </button>
            <AnimatePresence>
              {showPending && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="max-h-48 overflow-y-auto border-t border-amber-500/10">
                    {pendingFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 text-[11px] hover:bg-amber-500/5">
                        <span className="font-mono text-foreground/80 truncate max-w-[60%]">{f.file_path}</span>
                        <span className="text-amber-400 font-medium">{f.action || "update"}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Conflicts list */}
        {totalConflicts > 0 && (
          <div className="rounded-xl bg-red-500/[0.06] border border-red-500/20 overflow-hidden">
            <button onClick={() => setShowConflicts(!showConflicts)}
              className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 transition-colors">
              <span className="text-xs font-bold text-red-400 flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5" /> {totalConflicts} conflito(s)
              </span>
              {showConflicts ? <ChevronDown className="h-3.5 w-3.5 text-red-400" /> : <ChevronRight className="h-3.5 w-3.5 text-red-400" />}
            </button>
            <AnimatePresence>
              {showConflicts && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="max-h-48 overflow-y-auto border-t border-red-500/10">
                    {conflictFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 text-[11px] hover:bg-red-500/5">
                        <div className="min-w-0">
                          <p className="font-mono text-foreground/80 truncate">{f.file_path}</p>
                          <div className="flex gap-2 text-[10px] text-muted-foreground mt-0.5">
                            <span>Origem: {f.source_hash?.slice(0, 8)}…</span>
                            <span>Mirror: {f.mirror_hash?.slice(0, 8)}…</span>
                          </div>
                        </div>
                        <button onClick={() => handleForceSync(f.file_path)}
                          className="text-[10px] font-semibold text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-500/10 shrink-0 ml-2">
                          Forçar
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Protected paths */}
        <div className="rounded-xl bg-muted/30 border border-border/50 p-3 space-y-1.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-3 w-3" /> Caminhos protegidos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {protectedPaths.map((p, i) => (
              <span key={i} className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded-md text-foreground/70">{p}</span>
            ))}
          </div>
        </div>

        {/* Sync history */}
        {syncLogs.length > 0 && (
          <div className="rounded-xl bg-muted/20 border border-border/50 overflow-hidden">
            <button onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
              <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" /> Histórico de sincronizações
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-mono">{syncLogs.length}</span>
                {showHistory ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </button>
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="max-h-48 overflow-y-auto border-t border-border/30 divide-y divide-border/20">
                    {syncLogs.map((log) => (
                      <div key={log.id} className="px-3 py-2 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-foreground font-medium">
                            {log.sync_type === "full" ? "Completo" : "Incremental"}
                          </span>
                          <span className="text-muted-foreground">{formatFullDateTimeBR(log.started_at)}</span>
                        </div>
                        <div className="flex gap-3 mt-0.5">
                          <span className="text-emerald-400">✓ {log.files_sent}</span>
                          {log.files_skipped > 0 && <span className="text-muted-foreground">⊘ {log.files_skipped}</span>}
                          {log.files_failed > 0 && <span className="text-red-400">✗ {log.files_failed}</span>}
                          {log.conflicts_detected > 0 && <span className="text-amber-400">⚠ {log.conflicts_detected}</span>}
                          {log.duration_ms && <span className="text-blue-400">{(log.duration_ms / 1000).toFixed(1)}s</span>}
                        </div>
                        {log.error_message && <p className="text-red-400 mt-0.5">{log.error_message}</p>}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
