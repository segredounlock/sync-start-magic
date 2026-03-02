import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Upload, Database, Loader2, CheckCircle2, AlertTriangle,
  Github, RefreshCw, FolderSync, ArrowDownToLine, ArrowUpFromLine,
  FileArchive, Shield, Clock, HardDrive, ChevronDown, ChevronRight, X,
  Eye, EyeOff, Save, Code2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JSZip from "jszip";

const TABLES = [
  "operadoras", "system_config", "bot_settings", "notifications", "broadcast_progress",
  "telegram_users", "telegram_sessions", "profiles", "user_roles", "saldos",
  "pricing_rules", "reseller_pricing_rules", "reseller_config", "transactions", "recargas",
  "admin_notifications", "banners", "polls", "poll_votes",
  "chat_conversations", "chat_messages", "chat_message_reads", "chat_reactions",
];

type TabKey = "dados" | "github";

export default function BackupSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("dados");
  const [includeDb, setIncludeDb] = useState(true);
  const [includeSource, setIncludeSource] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState("");
  const [importing, setImporting] = useState(false);
  const [restoreResult, setRestoreResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // GitHub sync
  const [repos, setRepos] = useState<any[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStage, setSyncStage] = useState("");
  const [syncLog, setSyncLog] = useState<{ path: string; status: "ok" | "error" | "pending"; error?: string }[]>([]);
  const syncLogRef = useRef<HTMLDivElement>(null);

  // GitHub PAT
  const [githubPat, setGithubPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [savingPat, setSavingPat] = useState(false);
  const [patLoaded, setPatLoaded] = useState(false);

  useEffect(() => {
    const loadPat = async () => {
      const { data } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "githubPat")
        .maybeSingle();
      if (data?.value) setGithubPat(data.value);
      setPatLoaded(true);
    };
    loadPat();
  }, []);

  const saveGithubPat = async () => {
    setSavingPat(true);
    try {
      const { error } = await supabase
        .from("system_config")
        .upsert({ key: "githubPat", value: githubPat }, { onConflict: "key" });
      if (error) throw error;
      toast.success("GitHub PAT salvo!");
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
    setSavingPat(false);
  };

  const loadRepos = async () => {
    setLoadingRepos(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-sync?action=list-repos`,
        { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Erro" })); throw new Error(err.error || `HTTP ${resp.status}`); }
      const data = await resp.json();
      setRepos(data);
      if (data.length > 0 && !selectedRepo) setSelectedRepo(data[0].full_name);
      toast.success(`${data.length} repositórios encontrados`);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
    setLoadingRepos(false);
  };

  const handleGitHubSync = async () => {
    if (!selectedRepo) { toast.error("Selecione um repositório"); return; }
    if (!window.confirm(`Enviar TODOS os arquivos do projeto para ${selectedRepo}?\n\nInclui: páginas, componentes, hooks, libs, edge functions, configs`)) return;
    setSyncing(true); setSyncResult(null); setSyncProgress(0); setSyncStage("Coletando arquivos..."); setSyncLog([]);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");
      const allPaths = SOURCE_PATHS;
      const files: { path: string; content: string }[] = [];
      for (let i = 0; i < allPaths.length; i++) {
        setSyncStage(`Coletando ${i + 1}/${allPaths.length}...`);
        setSyncProgress(Math.round((i / allPaths.length) * 20));
        try {
          const r = await fetch(new URL(`/${allPaths[i]}`, window.location.origin).href);
          if (r.ok) { const text = await r.text(); if (text && text.length > 10) files.push({ path: allPaths[i], content: text }); }
        } catch { /* skip */ }
      }
      if (files.length === 0) throw new Error("Nenhum arquivo coletado");
      setSyncStage(`${files.length} arquivos coletados. Enviando...`); setSyncProgress(20);
      const initialLog = files.map(f => ({ path: f.path, status: "pending" as const }));
      setSyncLog(initialLog);
      const repo = repos.find((r: any) => r.full_name === selectedRepo);
      const targetBranch = repo?.default_branch || "main";
      const BATCH_SIZE = 5;
      const totalBatches = Math.ceil(files.length / BATCH_SIZE);
      let allResults: any[] = [];
      for (let b = 0; b < totalBatches; b++) {
        const batchFiles = files.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
        setSyncStage(`Lote ${b + 1}/${totalBatches} (${Math.min((b + 1) * BATCH_SIZE, files.length)}/${files.length})`);
        setSyncProgress(20 + Math.round((b / totalBatches) * 75));
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-sync?action=sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ repo: selectedRepo, branch: targetBranch, files: batchFiles }),
        });
        const result = await resp.json();
        if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
        const batchResults = result.results || [];
        allResults = [...allResults, ...batchResults];
        setSyncLog(prev => {
          const updated = [...prev];
          for (const r of batchResults) { const idx = updated.findIndex(l => l.path === r.path); if (idx >= 0) updated[idx] = { path: r.path, status: r.status === "ok" ? "ok" : "error", error: r.error }; }
          return updated;
        });
        setTimeout(() => { syncLogRef.current?.scrollTo({ top: syncLogRef.current.scrollHeight, behavior: "smooth" }); }, 100);
      }
      const okCount = allResults.filter(r => r.status === "ok").length;
      const errCount = allResults.filter(r => r.status !== "ok").length;
      setSyncProgress(100);
      setSyncStage(`Concluído! ${okCount} enviados${errCount > 0 ? `, ${errCount} erros` : ""}`);
      setSyncResult({ repo: selectedRepo, branch: targetBranch, results: allResults });
      toast.success(`${okCount} arquivos sincronizados com GitHub!`);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); setSyncStage(`Erro: ${err.message}`); }
    setSyncing(false);
  };

  const SOURCE_PATHS = [
    // Core
    "src/App.tsx","src/main.tsx","src/index.css","src/vite-env.d.ts",
    // Pages
    "src/pages/AdminDashboard.tsx","src/pages/Auth.tsx","src/pages/ChatApp.tsx",
    "src/pages/ClientePortal.tsx","src/pages/LandingPage.tsx","src/pages/NotFound.tsx",
    "src/pages/Principal.tsx","src/pages/RecargaPublica.tsx","src/pages/RevendedorPainel.tsx",
    "src/pages/ResetPassword.tsx","src/pages/TelegramMiniApp.tsx",
    // Components
    "src/components/AnimatedCheck.tsx","src/components/AnimatedIcon.tsx","src/components/AnimatedPage.tsx",
    "src/components/AnimatedCounter.tsx","src/components/BackupSection.tsx","src/components/BrandedQRCode.tsx",
    "src/components/BroadcastForm.tsx","src/components/BroadcastProgress.tsx",
    "src/components/BannersManager.tsx","src/components/FloatingPoll.tsx",
    "src/components/ImageCropper.tsx","src/components/MobileBottomNav.tsx",
    "src/components/NotificationBell.tsx","src/components/PinProtection.tsx",
    "src/components/PollManager.tsx","src/components/PopupBanner.tsx",
    "src/components/PromoBanner.tsx","src/components/ProtectedRoute.tsx",
    "src/components/RealtimeDashboard.tsx","src/components/RecargaReceipt.tsx",
    "src/components/RecargasTicker.tsx","src/components/Skeleton.tsx",
    "src/components/SplashScreen.tsx","src/components/ThemeToggle.tsx",
    "src/components/VerificationBadge.tsx",
    // Chat components
    "src/components/chat/ChatPage.tsx","src/components/chat/ChatWindow.tsx",
    "src/components/chat/ConversationList.tsx","src/components/chat/MessageBubble.tsx",
    "src/components/chat/EmojiPicker.tsx","src/components/chat/AudioRecorder.tsx",
    "src/components/chat/NewChatModal.tsx","src/components/chat/MessageInfoModal.tsx",
    "src/components/ChatRoomManager.tsx",
    // Hooks
    "src/hooks/useAuth.tsx","src/hooks/useBackgroundPaymentMonitor.ts",
    "src/hooks/useChat.ts","src/hooks/useNotifications.ts","src/hooks/usePresence.ts",
    "src/hooks/useTheme.tsx",
    // Libs
    "src/lib/fetchAll.ts","src/lib/payment.ts","src/lib/sounds.ts","src/lib/utils.ts",
    // Integrations
    "src/integrations/supabase/client.ts","src/integrations/supabase/types.ts",
    // Config
    "tailwind.config.ts","tsconfig.json","tsconfig.node.json","vite.config.ts",
    "postcss.config.js","index.html","package.json","README.md",
    // Edge Functions
    "supabase/functions/admin-create-user/index.ts","supabase/functions/admin-delete-user/index.ts",
    "supabase/functions/admin-toggle-role/index.ts",
    "supabase/functions/backup-export/index.ts","supabase/functions/backup-restore/index.ts",
    "supabase/functions/client-register/index.ts","supabase/functions/create-pix/index.ts",
    "supabase/functions/cleanup-stuck-broadcasts/index.ts","supabase/functions/efi-setup/index.ts",
    "supabase/functions/github-sync/index.ts","supabase/functions/pix-webhook/index.ts",
    "supabase/functions/recarga-express/index.ts","supabase/functions/send-broadcast/index.ts",
    "supabase/functions/telegram-bot/index.ts","supabase/functions/telegram-miniapp/index.ts",
    "supabase/functions/telegram-notify/index.ts","supabase/functions/telegram-setup/index.ts",
    // Supabase config
    "supabase/config.toml",
  ];

  const handleExport = async () => {
    if (!includeDb && !includeSource) { toast.error("Selecione pelo menos uma opção"); return; }
    setExporting(true); setExportProgress(0); setExportStage("Iniciando...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");

      const zip = new JSZip();
      let totalSteps = 0;
      let currentStep = 0;
      if (includeDb) totalSteps += 1; // DB export = 1 step (edge function handles it)
      if (includeSource) totalSteps += SOURCE_PATHS.length;

      // 1. Database export via edge function
      if (includeDb) {
        setExportStage("Exportando banco de dados...");
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-export`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ includeDatabase: true }),
        });
        if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Erro" })); throw new Error(err.error || `HTTP ${resp.status}`); }
        // The edge function returns a ZIP with database/ folder — extract and re-add to our ZIP
        const dbZipData = await resp.arrayBuffer();
        const dbZip = await JSZip.loadAsync(dbZipData);
        for (const [path, file] of Object.entries(dbZip.files)) {
          if (!file.dir) {
            const content = await file.async("uint8array");
            zip.file(path, content);
          }
        }
        currentStep++;
        setExportProgress(Math.round((currentStep / totalSteps) * 100));
      }

      // 2. Source code via fetch
      if (includeSource) {
        const sourceFolder = zip.folder("source");
        let fetched = 0;
        for (const filePath of SOURCE_PATHS) {
          setExportStage(`Coletando ${fetched + 1}/${SOURCE_PATHS.length}: ${filePath.split("/").pop()}`);
          try {
            const r = await fetch(new URL(`/${filePath}`, window.location.origin).href);
            if (r.ok) {
              const text = await r.text();
              if (text && text.length > 10) {
                sourceFolder!.file(filePath, text);
              }
            }
          } catch { /* skip */ }
          fetched++;
          currentStep++;
          setExportProgress(Math.round((currentStep / totalSteps) * 100));
        }
      }

      // Update backup-info
      zip.file("backup-info.json", JSON.stringify({
        version: "2.0",
        created_at: new Date().toISOString(),
        include_database: includeDb,
        include_source: includeSource,
        source_files: includeSource ? SOURCE_PATHS.length : 0,
        tables: includeDb ? TABLES : [],
      }, null, 2));

      setExportStage("Gerando ZIP...");
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-recargas-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setExportProgress(100);
      setExportStage("Concluído!");
      toast.success(`Backup exportado! ${includeDb ? "BD + " : ""}${includeSource ? "Código" : ""}`);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); setExportStage(""); }
    setExporting(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".zip")) { toast.error("Selecione um arquivo .zip"); return; }
    if (!window.confirm("⚠️ A restauração vai SOBRESCREVER os dados atuais.\n\nContinuar?")) { if (fileInputRef.current) fileInputRef.current.value = ""; return; }
    setImporting(true); setRestoreResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");
      const arrayBuffer = await file.arrayBuffer();
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-restore`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: arrayBuffer,
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
      setRestoreResult(result);
      toast.success("Backup restaurado com sucesso!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "dados", label: "Dados", icon: Database },
    { key: "github", label: "GitHub", icon: Github },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Header with stats */}
      <div className="flex items-center gap-3 p-4 rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-500/25 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Shield className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Backup & Sync</h2>
          <p className="text-xs text-muted-foreground">{TABLES.length} tabelas · {new Date().toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1.5 rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === t.key
                ? "bg-white/[0.08] text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            }`}>
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "dados" && (
          <motion.div key="dados" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-4">
            {/* Quick Actions Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Export Card */}
              <button onClick={handleExport} disabled={exporting}
                className="relative group rounded-2xl p-4 backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.07] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(245,158,11,0.08)] transition-all text-left disabled:opacity-60">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/5">
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> : <ArrowDownToLine className="h-4 w-4 text-amber-400" />}
                </div>
              <p className="text-sm font-semibold text-foreground">{exporting ? "Gerando..." : "Exportar"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Baixar backup .zip</p>
              </button>

              {/* Import Card */}
              <button onClick={() => fileInputRef.current?.click()} disabled={importing}
                className="relative group rounded-2xl p-4 backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.07] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(239,68,68,0.08)] transition-all text-left disabled:opacity-60">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mb-3 shadow-lg shadow-red-500/5">
                  {importing ? <Loader2 className="h-4 w-4 animate-spin text-red-400" /> : <ArrowUpFromLine className="h-4 w-4 text-red-400" />}
                </div>
                <p className="text-sm font-semibold text-foreground">{importing ? "Restaurando..." : "Restaurar"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Importar backup .zip</p>
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept=".zip" onChange={handleImport} className="hidden" />

            {/* Export progress */}
            <AnimatePresence>
              {exporting && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl backdrop-blur-xl bg-primary/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-4 space-y-3 overflow-hidden">
                  <p className="text-sm font-semibold text-foreground">{exportStage}</p>
                  <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${exportProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right font-mono">{exportProgress}%</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tables info */}
            <div className="rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-4">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Tabelas no backup</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TABLES.map(t => (
                  <span key={t} className="text-[10px] font-mono px-2 py-1 rounded-lg bg-white/[0.05] text-muted-foreground shadow-[inset_0_1px_0px_rgba(255,255,255,0.04)]">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Include DB toggle */}
            <button onClick={() => setIncludeDb(!includeDb)}
              className="flex items-center gap-3 w-full p-3.5 rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.06] transition-all text-left">
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                includeDb ? "bg-primary border-primary" : "border-muted-foreground/40"
              }`}>
                {includeDb && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Incluir banco de dados</p>
                <p className="text-[11px] text-muted-foreground">Usuários, saldos, recargas, configs</p>
              </div>
            </button>

            {/* Include Source toggle */}
            <button onClick={() => setIncludeSource(!includeSource)}
              className="flex items-center gap-3 w-full p-3.5 rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.06] transition-all text-left">
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                includeSource ? "bg-primary border-primary" : "border-muted-foreground/40"
              }`}>
                {includeSource && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" /> Incluir código-fonte
                </p>
                <p className="text-[11px] text-muted-foreground">Páginas, componentes, hooks, edge functions</p>
              </div>
            </button>

            {/* Restore Result */}
            <AnimatePresence>
              {restoreResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl backdrop-blur-xl bg-emerald-500/[0.06] shadow-[inset_0_1px_1px_rgba(52,211,153,0.1),0_0_20px_rgba(16,185,129,0.06)] p-4 space-y-3 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Restaurado com sucesso
                    </p>
                    <button onClick={() => setRestoreResult(null)} className="text-destructive hover:text-destructive/80">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {restoreResult.backup_date ? new Date(restoreResult.backup_date).toLocaleString("pt-BR") : "—"}</span>
                    <span>{restoreResult.backup_by || "—"}</span>
                  </div>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {restoreResult.results?.map((r: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1">
                        <span className="text-foreground font-mono">{r.table}</span>
                        <span className={`font-medium ${
                          r.status === "restored" ? "text-emerald-400" :
                          r.status === "skipped" ? "text-muted-foreground" :
                          r.status === "error" ? "text-red-400" : "text-amber-400"
                        }`}>
                          {r.status === "restored" ? `${r.count} registros` :
                           r.status === "skipped" ? "pulado" :
                           r.status === "empty" ? "vazio" : r.error || "erro"}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {activeTab === "github" && (
          <motion.div key="github" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
            {/* GitHub PAT Config */}
            <div className="rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-4 space-y-2">
              <label className="block text-xs font-semibold text-foreground uppercase tracking-wider">GitHub PAT (Personal Access Token)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPat ? "text" : "password"}
                    value={githubPat}
                    onChange={e => setGithubPat(e.target.value)}
                    placeholder="ghp_..."
                    className="w-full px-3 py-2 pr-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  />
                  <button type="button" onClick={() => setShowPat(!showPat)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPat ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <button onClick={saveGithubPat} disabled={savingPat}
                  className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5">
                  {savingPat ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Salvar
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">Gere em <a href="https://github.com/settings/tokens" target="_blank" rel="noopener" className="underline hover:text-foreground">github.com/settings/tokens</a> com escopo <code className="bg-white/[0.06] px-1 rounded">repo</code></p>
            </div>

            {/* Load repos */}
            <button onClick={loadRepos} disabled={loadingRepos}
              className="w-full py-3 rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.07] text-foreground font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loadingRepos ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {loadingRepos ? "Carregando..." : repos.length > 0 ? "Atualizar repositórios" : "Carregar repositórios"}
            </button>

            {repos.length > 0 && (
              <>
                <select value={selectedRepo} onChange={e => setSelectedRepo(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none">
                  {repos.map((r: any) => (
                    <option key={r.full_name} value={r.full_name}>
                      {r.full_name} {r.private ? "🔒" : "🌐"} ({r.default_branch})
                    </option>
                  ))}
                </select>

                {!syncing && (
                  <div className="rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] p-3">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Projeto completo:</span>{" "}
                      9 páginas · 10 componentes · 3 hooks · 3 libs · 14 edge functions · configs
                    </p>
                  </div>
                )}

                {!syncing ? (
                  <button onClick={handleGitHubSync} disabled={!selectedRepo}
                    className="w-full py-3 rounded-2xl bg-foreground text-background font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                    <FolderSync className="h-4 w-4" /> Sincronizar tudo
                  </button>
                ) : (
                  <div className="rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground">{syncStage}</p>
                    <div className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${syncProgress}%` }} transition={{ duration: 0.3 }} />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-right font-mono">{syncProgress}%</p>
                    {syncLog.length > 0 && (
                      <div ref={syncLogRef} className="max-h-44 overflow-y-auto space-y-0.5 rounded-xl p-2 bg-white/[0.02]">
                        {syncLog.map((item, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] py-0.5">
                            <span className="text-foreground font-mono truncate max-w-[220px]">{item.path.split("/").pop()}</span>
                            <span className={`font-medium flex-shrink-0 ml-2 ${
                              item.status === "ok" ? "text-emerald-400" : item.status === "error" ? "text-red-400" : "text-muted-foreground"
                            }`}>
                              {item.status === "ok" ? "✓" : item.status === "error" ? "✗" : "…"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <AnimatePresence>
              {syncResult && !syncing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl backdrop-blur-xl bg-emerald-500/[0.06] shadow-[inset_0_1px_1px_rgba(52,211,153,0.1),0_0_20px_rgba(16,185,129,0.06)] p-4 space-y-2 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Sincronizado
                    </p>
                    <button onClick={() => setSyncResult(null)} className="text-destructive hover:text-destructive/80"><X className="h-4 w-4" /></button>
                  </div>
                  <p className="text-xs text-muted-foreground">{syncResult.repo} · branch: {syncResult.branch}</p>
                  <div className="flex gap-3 text-xs">
                    <span className="text-emerald-400 font-medium">{syncResult.results?.filter((r: any) => r.status === "ok").length} enviados</span>
                    {syncResult.results?.filter((r: any) => r.status !== "ok").length > 0 && (
                      <span className="text-red-400 font-medium">{syncResult.results?.filter((r: any) => r.status !== "ok").length} erros</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
