import { useState, useRef, useEffect } from "react";
import { InfoCard } from "@/components/InfoCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, Upload, Database, Loader2, CheckCircle2, AlertTriangle,
  Github, RefreshCw, FolderSync, ArrowDownToLine, ArrowUpFromLine,
  FileArchive, Shield, Clock, HardDrive, ChevronDown, ChevronRight, X,
  Eye, EyeOff, Save, Code2, PackageCheck, UploadCloud, Info, Fingerprint, Hash,
  Play, Terminal, ExternalLink, XCircle, CircleDot, GitBranch, Zap,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatFullDateTimeBR, formatDateFullBR } from "@/lib/timezone";
import { styledToast as toast } from "@/lib/toast";
import JSZip from "jszip";
import { getKnownPaths, getFileHashes } from "@/lib/sourceManifest";
import MirrorSyncPanel from "@/components/MirrorSyncPanel";
import SystemVerification from "@/components/SystemVerification";

// Tables are now discovered dynamically by the edge functions
// This constant is only used for display fallback
const TABLES_LABEL = "dinâmico";

const SOURCE_PATHS = [
  // Core
  "src/AppRoot.tsx","src/main.tsx","src/index.css","src/styles/app.css","src/vite-env.d.ts",
  // Pages
  "src/pages/AdminDashboard.tsx","src/pages/AdminSupport.tsx","src/pages/Auth.tsx","src/pages/ChatApp.tsx",
  "src/pages/ClientePortal.tsx","src/pages/ClientSupport.tsx","src/pages/DocsRede.tsx",
  "src/pages/InstallApp.tsx","src/pages/LandingPage.tsx","src/pages/MaintenancePage.tsx",
  "src/pages/NotFound.tsx","src/pages/Principal.tsx","src/pages/PublicProfile.tsx",
  "src/pages/RecargaPublica.tsx","src/pages/RegrasPage.tsx","src/pages/ResetPassword.tsx",
  "src/pages/RevendedorPainel.tsx","src/pages/TelegramMiniApp.tsx","src/pages/UserProfile.tsx",
  // Pages docs
  "src/pages/docs/DocsRedeComponents.tsx","src/pages/docs/docsRedeData.ts",
  // Components
  "src/components/AnimatedCheck.tsx","src/components/AnimatedCounter.tsx",
  "src/components/AnimatedIcon.tsx","src/components/AnimatedPage.tsx",
  "src/components/AntifraudSection.tsx","src/components/AtualizacoesSection.tsx","src/components/AuditTab.tsx",
  "src/components/BackupSection.tsx","src/components/BankDashboard.tsx","src/components/BannersManager.tsx",
  "src/components/BrandedQRCode.tsx","src/components/BroadcastForm.tsx","src/components/BroadcastProgress.tsx",
  "src/components/ChatRoomManager.tsx","src/components/ClientPricingModal.tsx",
  "src/components/DashboardSection.tsx","src/components/FloatingMenuIcon.tsx","src/components/FloatingPoll.tsx",
  "src/components/ImageCropper.tsx","src/components/InfoCard.tsx",
  "src/components/InstallWizard.tsx",
  "src/components/MeusPrecos.tsx","src/components/MinhaRede.tsx","src/components/MirrorSyncPanel.tsx",
  "src/components/MasterOnlyRoute.tsx","src/components/MobileBottomNav.tsx",
  "src/components/NetworkCommissionConfig.tsx","src/components/NotificationBell.tsx",
  "src/components/PasswordStrengthMeter.tsx","src/components/PinProtection.tsx",
  "src/components/PollManager.tsx","src/components/PopupBanner.tsx","src/components/ProfileTab.tsx",
  "src/components/PromoBanner.tsx","src/components/ProtectedRoute.tsx","src/components/PullToRefresh.tsx",
  "src/components/RealtimeDashboard.tsx","src/components/RecargaReceipt.tsx","src/components/RecargasTicker.tsx",
  "src/components/RedesSection.tsx","src/components/ResellerFeeConfig.tsx",
  "src/components/SaquesSection.tsx","src/components/ScratchCanvas.tsx","src/components/ScratchCard.tsx",
  "src/components/SeasonalEffects.tsx","src/components/Skeleton.tsx","src/components/SlideBanner.tsx",
  "src/components/SplashScreen.tsx","src/components/SupportAdminSelector.tsx","src/components/SystemVerification.tsx",
  "src/components/TextFormatToolbar.tsx","src/components/ThemeToggle.tsx",
  "src/components/TopRankingPodium.tsx","src/components/UpdatePrompt.tsx",
  "src/components/VerificationBadge.tsx",
  // Settings components
  "src/components/settings/NotificationsTab.tsx","src/components/settings/PixKeyTab.tsx",
  "src/components/settings/PixelAdsTab.tsx","src/components/settings/SupportTab.tsx",
  // Support components
  "src/components/support/FloatingSupportButton.tsx","src/components/support/SupportChatWidget.tsx",
  "src/components/support/SupportSkeletons.tsx","src/components/support/SupportTemplates.tsx",
  // UI components
  "src/components/ui/Currency.tsx","src/components/ui/IntVal.tsx","src/components/ui/StatusBadge.tsx",
  "src/components/ui/KpiCard.tsx","src/components/ui/index.ts",
  // Chat components
  "src/components/chat/AudioRecorder.tsx","src/components/chat/ChatPage.tsx","src/components/chat/ChatWindow.tsx",
  "src/components/chat/ConversationList.tsx","src/components/chat/EmojiPicker.tsx",
  "src/components/chat/MentionDropdown.tsx","src/components/chat/MessageBubble.tsx",
  "src/components/chat/MessageInfoModal.tsx","src/components/chat/NewChatModal.tsx",
  "src/components/chat/UserRecargasModal.tsx",
  // Hooks
  "src/hooks/useAsync.ts","src/hooks/useAuth.tsx","src/hooks/useBackgroundPaymentMonitor.ts",
  "src/hooks/useCacheCleanup.ts","src/hooks/useChat.ts","src/hooks/useCrud.ts",
  "src/hooks/useDisabledValues.ts","src/hooks/useFeePreview.ts",
  "src/hooks/useInactivityTimeout.ts","src/hooks/useNotificationSound.ts",
  "src/hooks/useNotifications.ts","src/hooks/usePixDeposit.ts","src/hooks/usePresence.ts",
  "src/hooks/usePushNotifications.ts","src/hooks/useSeasonalTheme.ts",
  "src/hooks/useSiteLogo.ts","src/hooks/useSiteName.ts","src/hooks/useSupportAdminId.ts",
  "src/hooks/useSupportChannels.ts","src/hooks/useTheme.tsx","src/hooks/useTypingIndicator.ts",
  // Libs
  "src/lib/auditLog.ts","src/lib/confirm.tsx","src/lib/currencyMask.ts",
  "src/lib/deviceFingerprint.ts","src/lib/domain.ts","src/lib/fetchAll.ts","src/lib/inputValidation.ts",
  "src/lib/passwordValidation.ts","src/lib/payment.ts",
  "src/lib/reservedNames.ts","src/lib/sessionGuard.ts","src/lib/sounds.ts","src/lib/sourceManifest.ts",
  "src/lib/timezone.ts","src/lib/toast.tsx","src/lib/utils.ts",
  // Types
  "src/types/index.ts",
  // Integrations
  "src/integrations/supabase/client.ts","src/integrations/supabase/types.ts",
  // Config
  "tailwind.config.ts","tsconfig.json","tsconfig.node.json","vite.config.ts",
  "postcss.config.js","index.html","package.json","README.md",
  // PWA
  "public/sw-push.js",
  // Edge Functions
  "supabase/functions/admin-create-user/index.ts","supabase/functions/admin-delete-user/index.ts",
  "supabase/functions/admin-reset-password/index.ts","supabase/functions/admin-toggle-email-verify/index.ts",
  "supabase/functions/admin-toggle-role/index.ts",
  "supabase/functions/auth-email-hook/index.ts","supabase/functions/auth-email-hook/deno.json",
  "supabase/functions/backup-export/index.ts","supabase/functions/backup-restore/index.ts",
  "supabase/functions/ban-device/index.ts","supabase/functions/check-device/index.ts",
  "supabase/functions/check-pending-pix/index.ts",
  "supabase/functions/cleanup-stuck-broadcasts/index.ts",
  "supabase/functions/client-register/index.ts","supabase/functions/collect-pending-debts/index.ts",
  "supabase/functions/create-pix/index.ts","supabase/functions/delete-broadcast/index.ts",
  "supabase/functions/efi-setup/index.ts","supabase/functions/expire-pending-deposits/index.ts",
  "supabase/functions/github-sync/index.ts","supabase/functions/init-mirror/index.ts",
  "supabase/functions/og-store/index.ts",
  "supabase/functions/pix-webhook/index.ts",
  "supabase/functions/recarga-express/index.ts","supabase/functions/scratch-card/index.ts",
  "supabase/functions/send-broadcast/index.ts","supabase/functions/send-push/index.ts",
  "supabase/functions/sync-catalog/index.ts","supabase/functions/sync-pending-recargas/index.ts",
  "supabase/functions/telegram-bot/index.ts","supabase/functions/telegram-miniapp/index.ts",
  "supabase/functions/telegram-notify/index.ts","supabase/functions/telegram-setup/index.ts",
  "supabase/functions/vapid-setup/index.ts",
  // Email templates
  "supabase/functions/_shared/email-templates/signup.tsx",
  "supabase/functions/_shared/email-templates/recovery.tsx",
  "supabase/functions/_shared/email-templates/magic-link.tsx",
  "supabase/functions/_shared/email-templates/invite.tsx",
  "supabase/functions/_shared/email-templates/email-change.tsx",
  "supabase/functions/_shared/email-templates/reauthentication.tsx",
  // Supabase config
  "supabase/config.toml",
  // GitHub Actions
  ".github/workflows/sync-mirror.yml",
  // Documentation
  "ALTERACOES.md","DOCUMENTACAO_MIGRACAO.md",
  "documentation/README.md","documentation/ARQUITETURA.md","documentation/BANCO_DE_DADOS.md",
  "documentation/EDGE_FUNCTIONS.md","documentation/COMPONENTES.md","documentation/AUTENTICACAO.md",
  "documentation/PAGAMENTOS.md","documentation/CHAT.md","documentation/TELEGRAM.md",
  "documentation/BACKUP.md","documentation/MIGRACAO.md","documentation/STORAGE.md",
  "documentation/SECRETS.md","documentation/MIRROR_SYNC.md","documentation/AUDITORIA.md",
];

type TabKey = "dados" | "github" | "atualizacao" | "verificacao";

export default function BackupSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("dados");
  const [includeDb, setIncludeDb] = useState(true);
  const [includeSource, setIncludeSource] = useState(true);
  const [includeSchema, setIncludeSchema] = useState(false);
  const [includeAuth, setIncludeAuth] = useState(true);
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
  const [sourceRepo, setSourceRepo] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStage, setSyncStage] = useState("");
  const [syncLog, setSyncLog] = useState<{ path: string; status: "ok" | "error" | "pending"; error?: string }[]>([]);
  const syncLogRef = useRef<HTMLDivElement>(null);

  // GitHub Actions
  const [workflowRuns, setWorkflowRuns] = useState<any[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [triggeringWorkflow, setTriggeringWorkflow] = useState(false);
  const [selectedRunLogs, setSelectedRunLogs] = useState<any>(null);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showActionsPanel, setShowActionsPanel] = useState(false);
  const [initMirrorLoading, setInitMirrorLoading] = useState(false);
  const [initMirrorResult, setInitMirrorResult] = useState<any>(null);

  // Update system
  const [updateExporting, setUpdateExporting] = useState(false);
  const [updateExportProgress, setUpdateExportProgress] = useState(0);
  const [updateExportStage, setUpdateExportStage] = useState("");
  const [updateImporting, setUpdateImporting] = useState(false);
  const [updateImportProgress, setUpdateImportProgress] = useState(0);
  const [updateImportStage, setUpdateImportStage] = useState("");
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  // Pending update state (used by confirmModal)
  const [pendingUpdateFile, setPendingUpdateFile] = useState<File | null>(null);
  const [pendingManifest, setPendingManifest] = useState<any>(null);

  // Update history
  const [updateHistory, setUpdateHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Generic confirmation modal (unified for all confirmations)
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    details?: string[];
    icon?: "sync" | "restore" | "update" | "safe";
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });
  // GitHub PAT
  const [githubPat, setGithubPat] = useState("");
  const [showPat, setShowPat] = useState(false);
  const [savingPat, setSavingPat] = useState(false);
  const [patLoaded, setPatLoaded] = useState(false);

  // Dynamic source paths manifest
  const [dynamicPaths, setDynamicPaths] = useState<string[] | null>(null);

  // Integrity check
  const [integrityChecking, setIntegrityChecking] = useState(false);
  const [integrityProgress, setIntegrityProgress] = useState(0);
  const [integrityStage, setIntegrityStage] = useState("");
  const [integrityResult, setIntegrityResult] = useState<{
    missing: string[];
    found: number;
    total: number;
    external: string[];
    verifiable: number;
    fingerprint: string;
    hashes: Record<string, string>;
    newFiles?: string[];
  } | null>(null);
  const [showChecksums, setShowChecksums] = useState(false);

  // Effective paths: dynamic from DB if available, otherwise hardcoded fallback
  const effectivePaths = dynamicPaths || SOURCE_PATHS;

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
    const loadManifest = async () => {
      const { data } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "source_paths_manifest")
        .maybeSingle();
      if (data?.value) {
        try {
          const paths = JSON.parse(data.value);
          if (Array.isArray(paths) && paths.length > 0) {
            setDynamicPaths(paths);
            console.log(`[Backup] Manifesto dinâmico carregado: ${paths.length} arquivos`);
          }
        } catch { /* fallback to hardcoded */ }
      }
    };
    const loadSourceRepo = async () => {
      const { data } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "githubSourceRepo")
        .maybeSingle();
      if (data?.value) setSourceRepo(data.value);
    };
    loadPat();
    loadManifest();
    loadSourceRepo();
  }, []);

  // Load current system version + update history
  useEffect(() => {
    const loadVersion = async () => {
      const { data } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "system_version")
        .maybeSingle();
      setCurrentVersion(data?.value || "1.0.0");
    };
    const loadHistory = async () => {
      const { data } = await supabase
        .from("update_history")
        .select("*")
        .order("applied_at", { ascending: false })
        .limit(20);
      if (data) setUpdateHistory(data);
    };
    loadVersion();
    loadHistory();
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
      // Auto-detect source repo (the one with sync-mirror.yml, or the largest/main one)
      if (!sourceRepo && data.length > 0) {
        // Try to find a repo that is NOT sync-start-magic (the mirror)
        const nonMirror = data.find((r: any) => !r.full_name.includes("sync-start-magic"));
        if (nonMirror) {
          setSourceRepo(nonMirror.full_name);
          // Save to system_config for persistence
          await supabase.from("system_config").upsert({ key: "githubSourceRepo", value: nonMirror.full_name }, { onConflict: "key" });
        }
      }
      toast.success(`${data.length} repositórios encontrados`);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
    setLoadingRepos(false);
  };

  const handleGitHubSync = async () => {
    if (!selectedRepo) { toast.error("Selecione um repositório"); return; }
    setConfirmModal({
      open: true,
      title: "Sincronizar com GitHub",
      description: `Enviar todos os arquivos do projeto para o repositório ${selectedRepo}?`,
      details: ["Páginas e componentes", "Hooks e bibliotecas", "Edge Functions", "Configurações"],
      icon: "sync",
      onConfirm: () => { setConfirmModal(prev => ({ ...prev, open: false })); executeGitHubSync(); },
    });
  };

  const executeGitHubSync = async () => {
    setSyncing(true); setSyncResult(null); setSyncProgress(0); setSyncStage("Coletando arquivos..."); setSyncLog([]);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");
      const allPaths = effectivePaths;
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

  // For Actions, always use the SOURCE repo (where workflow lives), not the mirror destination
  const actionsRepo = sourceRepo || selectedRepo;

  const loadWorkflowRuns = async (repo?: string) => {
    const targetRepo = repo || actionsRepo;
    if (!targetRepo) { toast.error("Configure o repositório de origem"); return; }
    setLoadingRuns(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-sync?action=workflow-runs&repo=${encodeURIComponent(targetRepo)}`,
        { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Erro" })); throw new Error(err.error || `HTTP ${resp.status}`); }
      const data = await resp.json();
      setWorkflowRuns(data);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
    setLoadingRuns(false);
  };

  const loadWorkflowLogs = async (runId: number) => {
    if (!actionsRepo) return;
    setLoadingLogs(true);
    setSelectedRunLogs(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-sync?action=workflow-logs&repo=${encodeURIComponent(actionsRepo)}&run_id=${runId}`,
        { headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Erro" })); throw new Error(err.error || `HTTP ${resp.status}`); }
      const data = await resp.json();
      setSelectedRunLogs(data);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
    setLoadingLogs(false);
  };

  const triggerWorkflow = async () => {
    if (!actionsRepo) { toast.error("Configure o repositório de origem"); return; }
    setTriggeringWorkflow(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");
      const repo = repos.find((r: any) => r.full_name === actionsRepo);
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-sync?action=trigger-workflow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ repo: actionsRepo, branch: repo?.default_branch || "main" }),
        }
      );
      if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Erro" })); throw new Error(err.error || `HTTP ${resp.status}`); }
      toast.success("Workflow disparado! Aguarde alguns segundos e atualize o status.");
      setTimeout(() => loadWorkflowRuns(), 5000);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
    setTriggeringWorkflow(false);
  };

  const initMirror = async () => {
    setInitMirrorLoading(true);
    setInitMirrorResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/init-mirror`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
      setInitMirrorResult(result);
      toast.success("Espelho inicializado com sucesso!");
    } catch (err: any) {
      toast.error(`Erro: ${err.message}`);
    }
    setInitMirrorLoading(false);
  };

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === "completed") {
      if (conclusion === "success") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      if (conclusion === "failure") return <XCircle className="h-4 w-4 text-red-400" />;
      return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    }
    if (status === "in_progress") return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
    if (status === "queued") return <CircleDot className="h-4 w-4 text-muted-foreground" />;
    return <CircleDot className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusLabel = (status: string, conclusion: string | null) => {
    if (status === "completed") {
      if (conclusion === "success") return "Sucesso";
      if (conclusion === "failure") return "Falhou";
      if (conclusion === "cancelled") return "Cancelado";
      return conclusion || "Concluído";
    }
    if (status === "in_progress") return "Em execução";
    if (status === "queued") return "Na fila";
    return status;
  };



  const handleExport = async () => {
    if (!includeDb && !includeSource && !includeSchema && !includeAuth) { toast.error("Selecione pelo menos uma opção"); return; }
    const t0 = performance.now();
    console.log("[Backup] export started");
    setExporting(true); setExportProgress(0); setExportStage("Iniciando...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");

      const zip = new JSZip();
      let totalSteps = 0;
      let currentStep = 0;
      if (includeDb) totalSteps += 1; // DB export = 1 step (edge function handles it)
      if (includeSource) totalSteps += effectivePaths.length;

      // 1. Database export via edge function
      if (includeDb) {
        setExportStage("Exportando banco de dados...");
        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-export`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: JSON.stringify({ includeDatabase: true, includeSchema, includeAuth }),
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
        for (const filePath of effectivePaths) {
          setExportStage(`Coletando ${fetched + 1}/${effectivePaths.length}: ${filePath.split("/").pop()}`);
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

      // 3. Documentation files
      if (includeSchema) {
        const docsFolder = zip.folder("documentation");
        const docFiles = ["DOCUMENTACAO_MIGRACAO.md", "ALTERACOES.md", "README.md"];
        for (const docFile of docFiles) {
          try {
            const r = await fetch(new URL(`/${docFile}`, window.location.origin).href);
            if (r.ok) {
              const text = await r.text();
              if (text && text.length > 10) docsFolder!.file(docFile, text);
            }
          } catch { /* skip */ }
        }
      }

      // Update backup-info
      zip.file("backup-info.json", JSON.stringify({
        version: "3.0",
        created_at: new Date().toISOString(),
        include_database: includeDb,
        include_source: includeSource,
        include_schema: includeSchema,
        include_auth: includeAuth,
        source_files: includeSource ? effectivePaths.length : 0,
        tables: "dynamic",
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
      console.log(`[Backup] export completed in ${(performance.now() - t0).toFixed(0)}ms`);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); setExportStage(""); }
    setExporting(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".zip")) { toast.error("Selecione um arquivo .zip"); return; }
    setConfirmModal({
      open: true,
      title: "Restaurar Backup",
      description: "A restauração vai sobrescrever os dados atuais do banco de dados.",
      details: ["Todos os dados serão substituídos", "Esta ação não pode ser desfeita"],
      icon: "restore",
      onConfirm: () => { setConfirmModal(prev => ({ ...prev, open: false })); executeImport(file, false); },
    });
  };

  const safeFileInputRef = useRef<HTMLInputElement>(null);
  const handleSafeImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".zip")) { toast.error("Selecione um arquivo .zip"); return; }
    setConfirmModal({
      open: true,
      title: "Restauração Segura",
      description: "Apenas dados novos serão adicionados. Usuários e configurações existentes NÃO serão alterados.",
      details: ["auth.users não será tocado", "system_config e bot_settings serão ignorados", "Registros existentes não serão sobrescritos"],
      icon: "safe",
      onConfirm: () => { setConfirmModal(prev => ({ ...prev, open: false })); executeImport(file, true); },
    });
  };

  const executeImport = async (file: File, safeMode: boolean) => {
    setImporting(true); setRestoreResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");
      const arrayBuffer = await file.arrayBuffer();
      const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-restore${safeMode ? "?mode=safe" : ""}`;
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: arrayBuffer,
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
      setRestoreResult(result);
      toast.success(safeMode ? "Restauração segura concluída!" : "Backup restaurado com sucesso!");
    } catch (err: any) { toast.error(`Erro: ${err.message}`); }
    setImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (safeFileInputRef.current) safeFileInputRef.current.value = "";
  };

  // === UPDATE SYSTEM HANDLERS ===
  const handleUpdateExport = async () => {
    setUpdateExporting(true); setUpdateExportProgress(0); setUpdateExportStage("Iniciando pacote de atualização...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");

      const zip = new JSZip();
      const totalSteps = 1 + effectivePaths.length; // DB + source files
      let currentStep = 0;

      // 1. Database export
      setUpdateExportStage("Exportando banco de dados...");
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-export`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ includeDatabase: true, includeAuth: true }),
      });
      if (!resp.ok) { const err = await resp.json().catch(() => ({ error: "Erro" })); throw new Error(err.error || `HTTP ${resp.status}`); }
      const dbZipData = await resp.arrayBuffer();
      const dbZip = await JSZip.loadAsync(dbZipData);
      for (const [path, file] of Object.entries(dbZip.files)) {
        if (!file.dir) {
          const content = await file.async("uint8array");
          zip.file(path, content);
        }
      }
      currentStep++;
      setUpdateExportProgress(Math.round((currentStep / totalSteps) * 100));

      // 2. Source code
      const sourceFolder = zip.folder("source");
      let fetched = 0;
      for (const filePath of effectivePaths) {
        setUpdateExportStage(`Coletando ${fetched + 1}/${effectivePaths.length}: ${filePath.split("/").pop()}`);
        try {
          const r = await fetch(new URL(`/${filePath}`, window.location.origin).href);
          if (r.ok) {
            const text = await r.text();
            if (text && text.length > 10) sourceFolder!.file(filePath, text);
          }
        } catch { /* skip */ }
        fetched++;
        currentStep++;
        setUpdateExportProgress(Math.round((currentStep / totalSteps) * 100));
      }

      // 3. Generate update manifest with effectivePaths included for dynamic discovery
      const version = currentVersion || "1.0.0";
      zip.file("update-manifest.json", JSON.stringify({
        version,
        created_at: new Date().toISOString(),
        tables: "dynamic",
        source_files: effectivePaths.length,
        source_paths: effectivePaths,
        type: "full-update",
      }, null, 2));

      setUpdateExportStage("Gerando pacote ZIP...");
      const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `atualizacao-v${version}-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setUpdateExportProgress(100);
      setUpdateExportStage("Pacote de atualização gerado!");
      toast.success(`Pacote de atualização v${version} exportado!`);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); setUpdateExportStage(""); }
    setUpdateExporting(false);
  };

  // Step 1: Read manifest and show confirmation
  const handleUpdateImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".zip")) { toast.error("Selecione um arquivo .zip"); return; }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const manifestFile = zip.file("update-manifest.json");
      if (!manifestFile) throw new Error("Pacote inválido: falta update-manifest.json");
      const manifest = JSON.parse(await manifestFile.async("string"));

      // Count DB files
      let dbTableCount = 0;
      for (const [path] of Object.entries(zip.files)) {
        if (path.startsWith("database/") && path.endsWith(".json")) dbTableCount++;
      }
      manifest._dbTableCount = dbTableCount;

      setPendingUpdateFile(file);
      setPendingManifest(manifest);
      // Show confirmation via the unified confirmModal
      setConfirmModal({
        open: true,
        title: "Confirmar Atualização",
        description: `Aplicar pacote v${manifest.version} com ${dbTableCount} tabelas e ${manifest.source_files || 0} arquivos fonte?`,
        details: [
          `Versão do pacote: v${manifest.version}`,
          `Data de criação: ${formatFullDateTimeBR(manifest.created_at)}`,
          `${dbTableCount} tabelas · ${manifest.source_files || 0} arquivos fonte`,
          `Versão atual: ${currentVersion || "1.0.0"}`,
        ],
        icon: "update",
        onConfirm: () => {
          setConfirmModal(prev => ({ ...prev, open: false }));
          confirmAndApplyUpdate();
        },
      });
    } catch (err: any) {
      toast.error(`Erro ao ler pacote: ${err.message}`);
    }
    if (updateFileInputRef.current) updateFileInputRef.current.value = "";
  };

  const confirmAndApplyUpdate = async () => {
    if (!pendingUpdateFile || !pendingManifest) return;
    const file = pendingUpdateFile;
    const manifest = pendingManifest;
    setPendingUpdateFile(null);
    setPendingManifest(null);

    setUpdateImporting(true); setUpdateResult(null); setUpdateImportProgress(0); setUpdateImportStage("Lendo pacote...");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão expirada");

      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);

      setUpdateImportStage(`Pacote v${manifest.version}. Restaurando banco...`);
      setUpdateImportProgress(20);

      const dbZip = new JSZip();
      const backupInfoFile = zip.file("backup-info.json");
      if (backupInfoFile) dbZip.file("backup-info.json", await backupInfoFile.async("uint8array"));

      let hasDbFiles = false;
      for (const [path, zipFile] of Object.entries(zip.files)) {
        if (path.startsWith("database/") && !zipFile.dir) {
          dbZip.file(path, await zipFile.async("uint8array"));
          hasDbFiles = true;
        }
      }

      let restoreResults: any = null;
      if (hasDbFiles) {
        const dbBlob = await dbZip.generateAsync({ type: "arraybuffer" });
        setUpdateImportStage("Enviando dados para restauração...");
        setUpdateImportProgress(40);

        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-restore`, {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}`, apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          body: dbBlob,
        });
        const result = await resp.json();
        if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
        restoreResults = result;
        setUpdateImportProgress(80);
      }

      // Save source_paths from manifest to system_config for dynamic discovery on this site
      if (manifest.source_paths && Array.isArray(manifest.source_paths)) {
        setUpdateImportStage("Salvando manifesto de arquivos...");
        await supabase.from("system_config").upsert(
          { key: "source_paths_manifest", value: JSON.stringify(manifest.source_paths) },
          { onConflict: "key" }
        );
      }

      // Update system version
      const previousVersion = currentVersion || "1.0.0";
      const newVersion = incrementVersion(manifest.version);
      setUpdateImportStage("Atualizando versão do sistema...");
      await supabase.from("system_config").upsert({ key: "system_version", value: newVersion }, { onConflict: "key" });
      setCurrentVersion(newVersion);

      // Save to update_history
      const results = restoreResults?.results || [];
      const tablesRestored = results.filter((r: any) => r.status === "restored").length;
      const tablesSkipped = results.filter((r: any) => r.status === "skipped" || r.status === "empty" || r.status === "skipped_fk").length;
      const tablesFailed = results.filter((r: any) => r.status === "error").length;
      const totalRecords = results.filter((r: any) => r.status === "restored").reduce((sum: number, r: any) => sum + (r.count || 0), 0);

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("update_history").insert({
        version: newVersion,
        previous_version: previousVersion,
        backup_date: manifest.created_at,
        backup_by: restoreResults?.backup_by || manifest.created_by || null,
        results: results,
        tables_restored: tablesRestored,
        tables_skipped: tablesSkipped,
        tables_failed: tablesFailed,
        total_records: totalRecords,
        applied_by: user?.id || null,
      });

      // Reload history
      const { data: historyData } = await supabase
        .from("update_history")
        .select("*")
        .order("applied_at", { ascending: false })
        .limit(20);
      if (historyData) setUpdateHistory(historyData);

      setUpdateImportProgress(100);
      setUpdateImportStage("Atualização concluída!");
      setUpdateResult({
        from_version: previousVersion,
        to_version: newVersion,
        manifest,
        restore: restoreResults,
      });
      toast.success(`Sistema atualizado para v${newVersion}!`);
    } catch (err: any) { toast.error(`Erro: ${err.message}`); setUpdateImportStage(`Erro: ${err.message}`); }
    setUpdateImporting(false);
  };

  const cancelUpdate = () => {
    setConfirmModal(prev => ({ ...prev, open: false }));
    setPendingUpdateFile(null);
    setPendingManifest(null);
  };

  const runIntegrityCheck = async () => {
    setIntegrityChecking(true);
    setIntegrityResult(null);
    setShowChecksums(false);
    setIntegrityProgress(0);
    setIntegrityStage("Carregando manifesto...");

    await new Promise(r => setTimeout(r, 300));
    const knownPaths = getKnownPaths();
    const fileHashes = getFileHashes();
    setIntegrityProgress(10);
    setIntegrityStage("Coletando hashes...");

    // Use knownPaths (glob) as source of truth for verifiable files
    // SOURCE_PATHS external items are "not verifiable", never "missing"
    const knownSet = new Set(knownPaths);
    const sourceSet = new Set(effectivePaths);

    // Verifiable = all files found by glob (real files in src/ and public/)
    const verifiablePaths = knownPaths.filter(p => p.startsWith("src/") || p.startsWith("public/"));
    // External = SOURCE_PATHS items outside glob scope (configs, edge functions, docs)
    const externalPaths = effectivePaths.filter(p => !p.startsWith("src/") && !p.startsWith("public/"));
    // New files = in glob but NOT in SOURCE_PATHS (recently added, not yet cataloged)
    const newFiles = knownPaths.filter(p => !sourceSet.has(p));
    // Missing = in SOURCE_PATHS AND verifiable scope, but NOT in glob (truly missing)
    const missing = effectivePaths.filter(p =>
      (p.startsWith("src/") || p.startsWith("public/")) && !knownSet.has(p)
    );

    await new Promise(r => setTimeout(r, 200));
    setIntegrityProgress(30);
    setIntegrityStage("Verificando arquivos...");

    let found = 0;
    const verifiedHashes: Record<string, string> = {};
    const step = 60 / Math.max(verifiablePaths.length, 1);
    for (let i = 0; i < verifiablePaths.length; i++) {
      const filePath = verifiablePaths[i];
      found++;
      verifiedHashes[filePath] = fileHashes[filePath] || "--------";
      if (i % 10 === 0 || i === verifiablePaths.length - 1) {
        setIntegrityProgress(30 + Math.round(step * (i + 1)));
        setIntegrityStage(`Verificando ${i + 1}/${verifiablePaths.length}...`);
        await new Promise(r => setTimeout(r, 15));
      }
    }

    setIntegrityProgress(92);
    setIntegrityStage("Calculando fingerprint...");
    await new Promise(r => setTimeout(r, 250));

    const sortedHashValues = Object.keys(verifiedHashes).sort().map(k => verifiedHashes[k]).join("");
    let fp = 0x811c9dc5;
    for (let i = 0; i < sortedHashValues.length; i++) {
      fp ^= sortedHashValues.charCodeAt(i);
      fp = Math.imul(fp, 0x01000193);
    }
    const fingerprint = (fp >>> 0).toString(16).padStart(8, "0");

    setIntegrityProgress(100);
    setIntegrityStage("Concluído!");
    await new Promise(r => setTimeout(r, 200));

    setIntegrityResult({
      missing, found, total: verifiablePaths.length + externalPaths.length,
      external: externalPaths, verifiable: verifiablePaths.length,
      fingerprint, hashes: verifiedHashes,
      newFiles: newFiles.length > 0 ? newFiles : undefined,
    });
    if (missing.length === 0) {
      const extra = newFiles.length > 0 ? ` · ${newFiles.length} novo(s)` : "";
      toast.success(`✅ Integridade OK! ${found}/${verifiablePaths.length} · Fingerprint: ${fingerprint}${extra}`);
    } else {
      toast.error(`⚠️ ${missing.length} arquivo(s) realmente faltando!`);
    }
    setIntegrityChecking(false);
  };

  const incrementVersion = (v: string): string => {
    const parts = v.split(".").map(Number);
    parts[2] = (parts[2] || 0) + 1;
    return parts.join(".");
  };

  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: "dados", label: "Dados", icon: Database },
    { key: "github", label: "GitHub", icon: Github },
    { key: "atualizacao", label: "Atualização", icon: PackageCheck },
    { key: "verificacao", label: "Verificar", icon: Shield },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Info Card - Backup */}
      <InfoCard title="Ferramentas do Sistema" items={[
        { icon: Download, iconColor: "text-primary", label: "Exportar", description: "gera um arquivo ZIP com todos os dados do banco e código-fonte." },
        { icon: Upload, iconColor: "text-success", label: "Restaurar", description: "importa um backup anterior para restaurar dados e configurações." },
        { icon: Github, iconColor: "text-warning", label: "GitHub Sync", description: "sincroniza o código-fonte com um repositório GitHub automaticamente." },
        { icon: Shield, iconColor: "text-emerald-400", label: "Verificar", description: "audita a integridade completa do sistema: tabelas, RLS, funções, pagamentos." },
      ]} />

      {/* Header with stats */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-500/25 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Shield className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Ferramentas</h2>
          <p className="text-xs text-muted-foreground">Backup, Sync & Verificação · {formatDateFullBR(new Date())}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-0.5 p-1 rounded-2xl bg-card border border-border shadow-sm">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
              activeTab === t.key
                ? "bg-primary/10 text-foreground shadow-sm border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Export Card */}
              <button onClick={handleExport} disabled={exporting}
                className="relative group rounded-2xl p-4 bg-card border border-border shadow-sm hover:bg-muted/60 hover:shadow-md hover:border-amber-500/30 transition-all text-left disabled:opacity-60">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/5">
                  {exporting ? <Loader2 className="h-4 w-4 animate-spin text-amber-400" /> : <ArrowDownToLine className="h-4 w-4 text-amber-400" />}
                </div>
              <p className="text-sm font-semibold text-foreground">{exporting ? "Gerando..." : "Exportar"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Baixar backup .zip</p>
              </button>

              {/* Import Card */}
              <button onClick={() => fileInputRef.current?.click()} disabled={importing}
                className="relative group rounded-2xl p-4 bg-card border border-border shadow-sm hover:bg-muted/60 hover:shadow-md hover:border-red-500/30 transition-all text-left disabled:opacity-60">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mb-3 shadow-lg shadow-red-500/5">
                  {importing ? <Loader2 className="h-4 w-4 animate-spin text-red-400" /> : <ArrowUpFromLine className="h-4 w-4 text-red-400" />}
                </div>
                <p className="text-sm font-semibold text-foreground">{importing ? "Restaurando..." : "Restaurar"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Importar backup .zip</p>
              </button>

              {/* Safe Import Card */}
              <button onClick={() => safeFileInputRef.current?.click()} disabled={importing}
                className="relative group rounded-2xl p-4 bg-card border border-border shadow-sm hover:bg-muted/60 hover:shadow-md hover:border-emerald-500/30 transition-all text-left disabled:opacity-60">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/5">
                  {importing ? <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> : <Shield className="h-4 w-4 text-emerald-400" />}
                </div>
                <p className="text-sm font-semibold text-foreground">{importing ? "Restaurando..." : "Restauração Segura"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Só adiciona novos dados</p>
              </button>
            </div>

            <input ref={fileInputRef} type="file" accept=".zip" onChange={handleImport} className="hidden" />
            <input ref={safeFileInputRef} type="file" accept=".zip" onChange={handleSafeImport} className="hidden" />

            {/* Export progress */}
            <AnimatePresence>
              {exporting && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl bg-primary/10 border border-primary/20 p-4 space-y-3 overflow-hidden">
                  <p className="text-sm font-semibold text-foreground">{exportStage}</p>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${exportProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right font-mono">{exportProgress}%</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Integrity Check */}
            <div className="rounded-2xl bg-card border border-border shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${integrityChecking ? "bg-primary/20" : "bg-muted/30"} transition-colors`}>
                    <Shield className={`h-3.5 w-3.5 ${integrityChecking ? "text-primary animate-pulse" : "text-muted-foreground"} transition-colors`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Verificação de Integridade</p>
                    <p className="text-[10px] text-muted-foreground">Checksums SHA-256 de cada arquivo</p>
                  </div>
                </div>
                <button onClick={runIntegrityCheck} disabled={integrityChecking}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-60">
                  {integrityChecking ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  {integrityChecking ? "Verificando..." : "Verificar"}
                </button>
              </div>

              {/* Scanning progress bar */}
              <AnimatePresence>
                {integrityChecking && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="space-y-1.5 overflow-hidden">
                    <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${integrityProgress}%` }} transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{ backgroundSize: "200% 100%", animation: "shimmer 1.5s ease-in-out infinite" }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground font-medium">{integrityStage}</p>
                      <p className="text-[10px] font-mono text-primary">{integrityProgress}%</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {integrityResult && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="space-y-2.5">

                    {/* Summary card */}
                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }}
                      className={`rounded-xl p-3 border ${integrityResult.missing.length === 0
                        ? "bg-emerald-500/[0.08] border-emerald-500/20"
                        : "bg-amber-500/[0.08] border-amber-500/20"}`}>
                      <div className="flex items-center gap-2.5">
                        <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}>
                          {integrityResult.missing.length === 0 ? (
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                              <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
                            </div>
                          )}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground">
                            {integrityResult.found}/{integrityResult.verifiable} verificáveis OK
                            {integrityResult.missing.length > 0 && (
                              <span className="text-amber-400 ml-1">· {integrityResult.missing.length} faltando</span>
                            )}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Fingerprint className="h-3 w-3 text-primary/70" />
                            <p className="text-[10px] font-mono text-primary font-semibold tracking-wide">{integrityResult.fingerprint}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Missing files */}
                    {integrityResult.missing.length > 0 && (
                      <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
                        className="max-h-40 overflow-y-auto rounded-xl bg-red-500/[0.06] border border-red-500/20 p-2.5 space-y-1">
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1">Arquivos faltantes:</p>
                        {integrityResult.missing.map((f, i) => (
                          <motion.p key={f} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.03 }}
                            className="text-[10px] font-mono text-red-300/80 truncate">❌ {f}</motion.p>
                        ))}
                      </motion.div>
                    )}

                    {/* Expandable checksums */}
                    {Object.keys(integrityResult.hashes).length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                        className="rounded-xl bg-muted/30 border border-border overflow-hidden">
                        <button onClick={() => setShowChecksums(!showChecksums)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-muted/60 transition-colors group">
                          <Hash className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                          <motion.div animate={{ rotate: showChecksums ? 90 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </motion.div>
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">
                            Checksums individuais ({Object.keys(integrityResult.hashes).length})
                          </p>
                        </button>
                        <AnimatePresence>
                          {showChecksums && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden">
                              <div className="max-h-60 overflow-y-auto px-3 pb-3 space-y-px">
                                {Object.entries(integrityResult.hashes).sort(([a], [b]) => a.localeCompare(b)).map(([file, hash], i) => (
                                  <motion.div key={file}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: Math.min(i * 0.012, 0.8) }}
                                    className="flex items-center justify-between gap-2 py-1 px-1.5 rounded-md hover:bg-muted/60 transition-colors group/row">
                                    <p className="text-[10px] font-mono text-foreground/60 group-hover/row:text-foreground/80 truncate flex-1 transition-colors">
                                      {file.split("/").pop()}
                                      <span className="text-foreground/30 ml-1 hidden sm:inline">{file.split("/").slice(0, -1).join("/")}/</span>
                                    </p>
                                    <p className="text-[10px] font-mono text-primary/70 group-hover/row:text-primary shrink-0 transition-colors">{hash}</p>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}

                    {/* External files */}
                    {integrityResult.external.length > 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                        className="rounded-xl bg-blue-500/[0.06] border border-blue-500/20 p-2.5 space-y-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Info className="h-3 w-3 text-blue-400" />
                          <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">
                            {integrityResult.external.length} arquivos externos (incluídos no backup)
                          </p>
                        </div>
                        <p className="text-[10px] text-blue-300/70">
                          Configs, Edge Functions e arquivos Supabase não são verificáveis no cliente, mas são incluídos normalmente no backup/sync.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tables info */}
            <div className="rounded-2xl bg-card border border-border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Tabelas no backup</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-muted/50 text-muted-foreground border border-border/50">
                  🔄 Descoberta automática — todas as tabelas do schema public
                </span>
              </div>
            </div>

            {/* Include DB toggle */}
            <button onClick={() => setIncludeDb(!includeDb)}
              className="flex items-center gap-3 w-full p-3.5 rounded-2xl bg-card border border-border shadow-sm hover:bg-muted/60 transition-all text-left">
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
              className="flex items-center gap-3 w-full p-3.5 rounded-2xl bg-card border border-border shadow-sm hover:bg-muted/60 transition-all text-left">
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

            {/* Include Schema toggle */}
            <button onClick={() => setIncludeSchema(!includeSchema)}
              className="flex items-center gap-3 w-full p-3.5 rounded-2xl bg-card border border-border shadow-sm hover:bg-muted/60 transition-all text-left">
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                includeSchema ? "bg-primary border-primary" : "border-muted-foreground/40"
              }`}>
                {includeSchema && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Incluir schema completo
                </p>
                <p className="text-[11px] text-muted-foreground">Funções SQL, RLS policies, triggers, enums, configs, documentação</p>
              </div>
            </button>

            {/* Include Auth toggle */}
            <button onClick={() => setIncludeAuth(!includeAuth)}
              className="flex items-center gap-3 w-full p-3.5 rounded-2xl bg-card border border-border shadow-sm hover:bg-muted/60 transition-all text-left">
              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                includeAuth ? "bg-primary border-primary" : "border-muted-foreground/40"
              }`}>
                {includeAuth && <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Fingerprint className="h-3.5 w-3.5" /> Incluir dados de autenticação
                </p>
                <p className="text-[11px] text-muted-foreground">Emails, metadados, datas de login (senhas não são exportadas)</p>
              </div>
            </button>

            {/* Restore Result */}
            <AnimatePresence>
              {restoreResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-3 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Restaurado com sucesso
                    </p>
                    <button onClick={() => setRestoreResult(null)} className="text-destructive hover:text-destructive/80">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {restoreResult.backup_date ? formatFullDateTimeBR(restoreResult.backup_date) : "—"}</span>
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

            {/* ══════════ SEÇÃO 1: Configuração ══════════ */}
            <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-foreground">Configuração</p>
                    <p className="text-xs text-muted-foreground">Token de acesso e repositório GitHub</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {/* PAT Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider">GitHub PAT (Personal Access Token)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPat ? "text" : "password"}
                        value={githubPat}
                        onChange={e => setGithubPat(e.target.value)}
                        placeholder="ghp_..."
                        className="w-full px-3 py-2.5 pr-9 rounded-xl bg-muted/50 border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                      />
                      <button type="button" onClick={() => setShowPat(!showPat)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPat ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <button onClick={saveGithubPat} disabled={savingPat}
                      className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5">
                      {savingPat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gere em <a href="https://github.com/settings/tokens" target="_blank" rel="noopener" className="underline hover:text-foreground">github.com/settings/tokens</a> com escopos{" "}
                    <code className="bg-muted/50 px-1.5 py-0.5 rounded border border-border/50 text-xs">repo</code> e{" "}
                    <code className="bg-muted/50 px-1.5 py-0.5 rounded border border-border/50 text-xs">workflow</code>
                  </p>
                </div>

                {/* Repo selector inline */}
                <div className="space-y-2">
                  <button onClick={loadRepos} disabled={loadingRepos}
                    className="w-full py-3 rounded-xl bg-muted/50 border border-border hover:bg-muted/80 text-foreground font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loadingRepos ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    {loadingRepos ? "Carregando..." : repos.length > 0 ? "Atualizar repositórios" : "Carregar repositórios"}
                  </button>

                  {repos.length > 0 && (
                    <div className="relative">
                      <select value={selectedRepo} onChange={e => setSelectedRepo(e.target.value)}
                        className="w-full py-2.5 px-3 pl-9 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none appearance-none">
                        {repos.map((r: any) => (
                          <option key={r.full_name} value={r.full_name}>
                            {r.full_name} ({r.default_branch}) {r.private ? "• privado" : "• público"}
                          </option>
                        ))}
                      </select>
                      <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ══════════ SEÇÃO 2: Sincronização ══════════ */}
            {repos.length > 0 && (
              <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center">
                      <FolderSync className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground">Sincronização</p>
                      <p className="text-xs text-muted-foreground">Enviar código-fonte completo para o GitHub</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {/* Project stats */}
                  {!syncing && (() => {
                    const pages = effectivePaths.filter(p => p.startsWith("src/pages/")).length;
                    const components = effectivePaths.filter(p => p.startsWith("src/components/")).length;
                    const hooks = effectivePaths.filter(p => p.startsWith("src/hooks/")).length;
                    const libs = effectivePaths.filter(p => p.startsWith("src/lib/")).length;
                    const edgeFns = effectivePaths.filter(p => p.startsWith("supabase/functions/")).length;
                    const configs = effectivePaths.filter(p => !p.startsWith("src/") && !p.startsWith("supabase/functions/") && !p.startsWith("public/")).length;
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-center">
                          <p className="text-xl font-bold text-foreground">{pages}</p>
                          <p className="text-xs text-muted-foreground font-medium">Páginas</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-center">
                          <p className="text-xl font-bold text-foreground">{components}</p>
                          <p className="text-xs text-muted-foreground font-medium">Componentes</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-center">
                          <p className="text-xl font-bold text-foreground">{edgeFns}</p>
                          <p className="text-xs text-muted-foreground font-medium">Edge Functions</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-center">
                          <p className="text-xl font-bold text-foreground">{hooks}</p>
                          <p className="text-xs text-muted-foreground font-medium">Hooks</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-center">
                          <p className="text-xl font-bold text-foreground">{libs}</p>
                          <p className="text-xs text-muted-foreground font-medium">Libs</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 border border-border/50 p-3 text-center">
                          <p className="text-xl font-bold text-foreground">{configs}</p>
                          <p className="text-xs text-muted-foreground font-medium">Configs</p>
                        </div>
                      </div>
                    );
                  })()}

                  <p className="text-xs text-muted-foreground text-center font-mono">{effectivePaths.length} arquivos no total</p>

                  {/* Sync button */}
                  {!syncing ? (
                    <button onClick={handleGitHubSync} disabled={!selectedRepo}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                      <FolderSync className="h-4 w-4" /> Sincronizar tudo
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">{syncStage}</p>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <motion.div className="h-full bg-gradient-to-r from-primary to-amber-400 rounded-full"
                          initial={{ width: 0 }} animate={{ width: `${syncProgress}%` }} transition={{ duration: 0.3 }} />
                      </div>
                      <p className="text-[11px] text-muted-foreground text-right font-mono">{syncProgress}%</p>
                      {syncLog.length > 0 && (
                        <div ref={syncLogRef} className="max-h-44 overflow-y-auto space-y-0.5 rounded-xl p-2 bg-muted/30">
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
                </div>
              </div>
            )}

            {/* Sync Result */}
            <AnimatePresence>
              {syncResult && !syncing && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-2 overflow-hidden">
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

            {/* ══════════ SEÇÃO 3: GitHub Actions ══════════ */}
            <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
              <button onClick={() => { setShowActionsPanel(!showActionsPanel); if (!showActionsPanel && workflowRuns.length === 0 && actionsRepo) loadWorkflowRuns(); }}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-bold text-foreground">GitHub Actions</p>
                    <p className="text-xs text-muted-foreground">Status do mirror, logs e trigger manual</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {workflowRuns.length > 0 && (() => {
                    const latest = workflowRuns[0];
                    return (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        latest.conclusion === "success" ? "bg-emerald-500/10 text-emerald-400" :
                        latest.conclusion === "failure" ? "bg-red-500/10 text-red-400" :
                        latest.status === "in_progress" ? "bg-blue-500/10 text-blue-400" : "bg-muted text-muted-foreground"
                      }`}>
                        {getStatusLabel(latest.status, latest.conclusion)}
                      </span>
                    );
                  })()}
                  {showActionsPanel ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              </button>

              <AnimatePresence>
                {showActionsPanel && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => loadWorkflowRuns()} disabled={loadingRuns || !actionsRepo}
                          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-semibold bg-muted/50 border border-border/50 text-foreground hover:bg-muted transition-all disabled:opacity-50">
                          {loadingRuns ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                          Atualizar
                        </button>
                        <button onClick={triggerWorkflow} disabled={triggeringWorkflow || !actionsRepo}
                          className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm font-semibold bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition-all disabled:opacity-50">
                          {triggeringWorkflow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                          Trigger Manual
                        </button>
                      </div>

                      {!actionsRepo && (
                        <p className="text-sm text-muted-foreground text-center py-3">Carregue os repositórios acima primeiro para detectar o repo de origem</p>
                      )}

                      {/* Mirror diagnostic info */}
                      {actionsRepo && (
                        <div className="rounded-xl bg-blue-500/[0.06] border border-blue-500/20 p-4 space-y-3">
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                            <Info className="h-4 w-4" /> Diagnóstico do Mirror
                          </p>
                          <div className="space-y-2 text-sm">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                              <span className="text-muted-foreground">Repositório de origem:</span>
                              <a href={`https://github.com/${actionsRepo}`} target="_blank" rel="noopener noreferrer"
                                className="font-mono text-emerald-400 text-xs hover:underline break-all">{actionsRepo}</a>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                              <span className="text-muted-foreground">Mirror (destino):</span>
                              <span className="font-mono text-foreground text-xs break-all">{selectedRepo || "segredounlock/sync-start-magic"}</span>
                            </div>
                            <div className="border-t border-border/30 pt-2.5 mt-2.5 space-y-2">
                              <p className="text-xs font-bold text-muted-foreground">✅ Checklist para o sync funcionar:</p>
                              <p className="text-xs text-muted-foreground">1. O secret <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-bold">GH_TOKEN</code> deve existir em <strong className="text-foreground">{actionsRepo}</strong> → Settings → Secrets → Actions</p>
                              <p className="text-xs text-muted-foreground">2. O token deve ter escopo <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-bold">repo</code> com acesso ao repositório destino</p>
                              <p className="text-xs text-muted-foreground">3. O workflow <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-bold">sync-mirror.yml</code> deve existir no repo de origem</p>
                            </div>
                          </div>
                          <a href={`https://github.com/${actionsRepo}/settings/secrets/actions`} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors mt-1">
                            <ExternalLink className="h-3.5 w-3.5" /> Abrir Secrets do repositório
                          </a>
                        </div>
                      )}

                      {/* Sincronização Inteligente */}
                      <MirrorSyncPanel
                        mirrorRepo={selectedRepo || "segredounlock/sync-start-magic"}
                        sourceRepo={actionsRepo}
                      />

                      {/* Inicializar Espelho */}
                      <div className="rounded-xl bg-amber-500/[0.06] border border-amber-500/20 p-4 space-y-3">
                        <p className="text-sm font-bold text-amber-400 flex items-center gap-2">
                          <Zap className="h-4 w-4" /> Inicializar Espelho
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Insere configs essenciais, verifica RPCs e valida se o backend do espelho está pronto para uso.
                          Usa <strong className="text-foreground">ON CONFLICT DO NOTHING</strong> — dados existentes não são alterados.
                        </p>
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/15 p-3 space-y-1">
                          <p className="text-xs font-semibold text-amber-400">⚠️ Importante:</p>
                          <p className="text-xs text-muted-foreground">Sincronizar código ≠ espelho funcional. O backend precisa de <strong className="text-foreground">Publish</strong> para aplicar migrations SQL.</p>
                        </div>
                        <button
                          onClick={initMirror}
                          disabled={initMirrorLoading}
                          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl text-sm font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all disabled:opacity-50"
                        >
                          {initMirrorLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                          {initMirrorLoading ? "Verificando..." : "Inicializar e Diagnosticar"}
                        </button>

                        {/* Readiness badge */}
                        {initMirrorResult?.readiness && (
                          <div className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-bold ${
                            initMirrorResult.readiness === "ready"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : initMirrorResult.readiness === "partial"
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              : "bg-red-500/10 border-red-500/20 text-red-400"
                          }`}>
                            {initMirrorResult.readiness === "ready" ? <CheckCircle2 className="h-5 w-5" /> :
                             initMirrorResult.readiness === "partial" ? <AlertTriangle className="h-5 w-5" /> :
                             <XCircle className="h-5 w-5" />}
                            {initMirrorResult.readiness === "ready" ? "Espelho Pronto para Uso" :
                             initMirrorResult.readiness === "partial" ? "Espelho Parcial — itens pendentes" :
                             "Espelho com Problemas — precisa de Publish"}
                          </div>
                        )}

                        {/* Issues */}
                        {initMirrorResult?.issues?.length > 0 && (
                          <div className="space-y-1">
                            {initMirrorResult.issues.map((issue: string, i: number) => (
                              <p key={i} className="text-xs text-red-400 flex items-start gap-1.5">
                                <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {issue}
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Health checks */}
                        {initMirrorResult?.health?.length > 0 && (
                          <div className="space-y-1 rounded-lg bg-muted/30 border border-border/50 p-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Checklist do Backend</p>
                            {initMirrorResult.health.map((h: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-sm py-0.5">
                                <span className="font-mono text-foreground/80">{h.key}</span>
                                <span className={`text-xs font-semibold ${h.ok ? "text-emerald-400" : "text-red-400"}`}>
                                  {h.ok ? "✓" : "✗"} {h.detail}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Step results */}
                        {initMirrorResult?.results && (
                          <div className="space-y-1.5 mt-2">
                            {initMirrorResult.results.map((r: any, i: number) => (
                              <div key={i} className={`flex items-start gap-2 text-xs rounded-lg p-2.5 ${
                                r.status === "ok" ? "bg-emerald-500/10 text-emerald-400" :
                                r.status === "skipped" ? "bg-muted/30 text-muted-foreground" :
                                "bg-red-500/10 text-red-400"
                              }`}>
                                {r.status === "ok" ? <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" /> :
                                 r.status === "skipped" ? <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" /> :
                                 <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />}
                                <div>
                                  <span className="font-semibold">{r.step}:</span> {r.detail}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Workflow runs list */}
                      {workflowRuns.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Últimas execuções</p>
                          <div className="max-h-72 overflow-y-auto space-y-2">
                            {workflowRuns.map((run: any) => (
                              <div key={run.id} className={`rounded-xl p-3.5 border transition-all cursor-pointer hover:bg-muted/40 ${
                                selectedRunLogs?.jobs?.[0]?.id && run.id === workflowRuns.find((r: any) => selectedRunLogs.jobs.some((j: any) => true))?.id
                                  ? "bg-violet-500/[0.06] border-violet-500/20"
                                  : "bg-muted/20 border-border/50"
                              }`}
                                onClick={() => loadWorkflowLogs(run.id)}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    {getStatusIcon(run.status, run.conclusion)}
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-foreground truncate">{run.name}</p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><GitBranch className="h-3 w-3" />{run.head_branch}</span>
                                        <span className="font-mono">#{run.run_number}</span>
                                        <span className="font-mono">{run.head_sha}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0 ml-3">
                                    <p className={`text-xs font-bold ${
                                      run.conclusion === "success" ? "text-emerald-400" :
                                      run.conclusion === "failure" ? "text-red-400" :
                                      run.status === "in_progress" ? "text-blue-400" : "text-muted-foreground"
                                    }`}>{getStatusLabel(run.status, run.conclusion)}</p>
                                    <p className="text-xs text-muted-foreground">{formatFullDateTimeBR(run.created_at)}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Log viewer */}
                      <AnimatePresence>
                        {loadingLogs && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" /> Carregando logs...
                          </motion.div>
                        )}
                        {selectedRunLogs && !loadingLogs && (
                          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className="space-y-2">
                            {/* Jobs */}
                            {selectedRunLogs.jobs?.map((job: any) => (
                              <div key={job.id} className="rounded-xl bg-muted/30 border border-border/50 p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                                    {getStatusIcon(job.status, job.conclusion)}
                                    {job.name}
                                  </p>
                                  {job.conclusion === "success" && <span className="text-[10px] text-emerald-400 font-semibold">✓ Passou</span>}
                                  {job.conclusion === "failure" && <span className="text-[10px] text-red-400 font-semibold">✗ Falhou</span>}
                                </div>
                                {/* Steps */}
                                <div className="space-y-0.5">
                                  {job.steps?.map((step: any) => (
                                    <div key={step.number} className="flex items-center gap-2 text-[10px] py-0.5">
                                      <span className={`w-3.5 text-center ${
                                        step.conclusion === "success" ? "text-emerald-400" :
                                        step.conclusion === "failure" ? "text-red-400" :
                                        step.conclusion === "skipped" ? "text-muted-foreground" : "text-blue-400"
                                      }`}>
                                        {step.conclusion === "success" ? "✓" : step.conclusion === "failure" ? "✗" : step.conclusion === "skipped" ? "⊘" : "…"}
                                      </span>
                                      <span className="text-foreground/80">{step.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* Raw log */}
                            {selectedRunLogs.log && (
                              <div className="rounded-xl bg-black/40 border border-border/50 overflow-hidden">
                                <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Terminal className="h-3 w-3" /> Log de execução
                                  </p>
                                  <button onClick={() => setSelectedRunLogs(null)} className="text-muted-foreground hover:text-foreground">
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                <pre className="p-3 text-[10px] font-mono text-emerald-300/80 max-h-48 overflow-y-auto whitespace-pre-wrap break-all leading-relaxed">
                                  {selectedRunLogs.log}
                                </pre>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {workflowRuns.length === 0 && !loadingRuns && selectedRepo && (
                        <p className="text-[11px] text-muted-foreground text-center py-2">Nenhuma execução encontrada</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === "atualizacao" && (
          <motion.div key="atualizacao" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
            {/* Version info */}
            <div className="rounded-2xl bg-card border border-border shadow-sm p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/10 flex items-center justify-center shadow-lg shadow-blue-500/5">
                <Info className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Versão atual: <span className="font-mono text-primary">{currentVersion || "..."}</span></p>
                <p className="text-[11px] text-muted-foreground">Gere um pacote para migrar ou aplicar uma atualização</p>
              </div>
            </div>

            {/* Export / Import Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button onClick={handleUpdateExport} disabled={updateExporting}
                className="relative group rounded-2xl p-4 bg-card border border-border shadow-sm hover:bg-muted/60 hover:shadow-md hover:border-blue-500/30 transition-all text-left disabled:opacity-60">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/5">
                  {updateExporting ? <Loader2 className="h-4 w-4 animate-spin text-blue-400" /> : <ArrowDownToLine className="h-4 w-4 text-blue-400" />}
                </div>
                <p className="text-sm font-semibold text-foreground">{updateExporting ? "Gerando..." : "Gerar Pacote"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Exportar atualização</p>
              </button>

              <button onClick={() => updateFileInputRef.current?.click()} disabled={updateImporting}
                className="relative group rounded-2xl p-4 bg-card border border-border shadow-sm hover:bg-muted/60 hover:shadow-md hover:border-emerald-500/30 transition-all text-left disabled:opacity-60">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/5">
                  {updateImporting ? <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> : <UploadCloud className="h-4 w-4 text-emerald-400" />}
                </div>
                <p className="text-sm font-semibold text-foreground">{updateImporting ? "Aplicando..." : "Aplicar Atualização"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Importar pacote .zip</p>
              </button>
            </div>

            <input ref={updateFileInputRef} type="file" accept=".zip" onChange={handleUpdateImport} className="hidden" />

            {/* Export Progress */}
            <AnimatePresence>
              {updateExporting && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4 space-y-3 overflow-hidden">
                  <p className="text-sm font-semibold text-foreground">{updateExportStage}</p>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${updateExportProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right font-mono">{updateExportProgress}%</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Import Progress */}
            <AnimatePresence>
              {updateImporting && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-3 overflow-hidden">
                  <p className="text-sm font-semibold text-foreground">{updateImportStage}</p>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${updateImportProgress}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right font-mono">{updateImportProgress}%</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Update Result */}
            <AnimatePresence>
              {updateResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 space-y-3 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Atualização Aplicada
                    </p>
                    <button onClick={() => setUpdateResult(null)} className="text-destructive hover:text-destructive/80">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">v{updateResult.from_version} → v{updateResult.to_version}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {updateResult.manifest?.created_at ? formatFullDateTimeBR(updateResult.manifest.created_at) : "—"}</span>
                  </div>
                  {updateResult.restore?.results && (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {updateResult.restore.results.map((r: any, i: number) => (
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
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Update History */}
            <div className="rounded-2xl bg-card border border-border shadow-sm p-4 space-y-3">
              <button onClick={() => setShowHistory(!showHistory)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Histórico de Atualizações</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground font-mono">{updateHistory.length} registros</span>
                  {showHistory ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    {updateHistory.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground py-2">Nenhuma atualização aplicada ainda.</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {updateHistory.map((h: any) => (
                          <div key={h.id} className="rounded-xl bg-muted/40 border border-border/50 p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-foreground font-mono">
                                {h.previous_version ? `v${h.previous_version} → ` : ""}v{h.version}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {formatFullDateTimeBR(h.applied_at)}
                              </span>
                            </div>
                            <div className="flex gap-3 text-[10px]">
                              <span className="text-emerald-400">✓ {h.tables_restored} restauradas</span>
                              {h.tables_skipped > 0 && <span className="text-muted-foreground">⊘ {h.tables_skipped} puladas</span>}
                              {h.tables_failed > 0 && <span className="text-red-400">✗ {h.tables_failed} erros</span>}
                              <span className="text-blue-400">{h.total_records} registros</span>
                            </div>
                            {h.backup_date && (
                              <p className="text-[10px] text-muted-foreground">
                                Pacote de {formatDateFullBR(h.backup_date)}
                                {h.backup_by ? ` por ${h.backup_by}` : ""}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* How it works */}
            <div className="rounded-2xl bg-card border border-border shadow-sm p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Como funciona</p>
              <div className="space-y-1.5 text-[11px] text-muted-foreground">
                <p>📦 <b className="text-foreground">Gerar Pacote</b> — Exporta banco de dados + código-fonte como um ZIP versionado</p>
                <p>🔄 <b className="text-foreground">Aplicar Atualização</b> — Importa o ZIP e restaura os dados via upsert inteligente (sem apagar dados existentes)</p>
                <p>🔢 <b className="text-foreground">Versão</b> — Incrementada automaticamente a cada atualização aplicada</p>
                <p>📋 <b className="text-foreground">Histórico</b> — Cada atualização é registrada com versão, data e resultado</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unified Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 pb-4 text-center">
                <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${
                  confirmModal.icon === "restore"
                    ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-amber-500/10"
                    : confirmModal.icon === "update"
                    ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 shadow-blue-500/10"
                    : confirmModal.icon === "safe"
                    ? "bg-gradient-to-br from-emerald-500/20 to-green-500/20 shadow-emerald-500/10"
                    : "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-emerald-500/10"
                }`}>
                  {confirmModal.icon === "restore" ? (
                    <AlertTriangle className="h-6 w-6 text-amber-400" />
                  ) : confirmModal.icon === "update" ? (
                    <PackageCheck className="h-6 w-6 text-blue-400" />
                  ) : confirmModal.icon === "safe" ? (
                    <Shield className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <Github className="h-6 w-6 text-emerald-400" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground">{confirmModal.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{confirmModal.description}</p>
              </div>

              {/* Details */}
              {confirmModal.details && confirmModal.details.length > 0 && (
                <div className="mx-6 mb-4 p-3.5 rounded-xl bg-muted/50 border border-border/30">
                  <div className="space-y-2">
                    {confirmModal.details.map((detail, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                          confirmModal.icon === "restore" ? "bg-amber-400/70" : confirmModal.icon === "update" ? "bg-blue-400/70" : "bg-emerald-400/70"
                        }`} />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-6 pt-2 flex gap-3">
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                  className="flex-1 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    confirmModal.icon === "restore"
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25"
                      : confirmModal.icon === "safe"
                      ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg hover:shadow-emerald-500/25"
                      : confirmModal.icon === "update"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/25"
                      : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25"
                  }`}
                >
                  {confirmModal.icon === "restore" ? (
                    <><Upload className="h-4 w-4" /> Restaurar</>
                  ) : confirmModal.icon === "update" ? (
                    <><PackageCheck className="h-4 w-4" /> Aplicar</>
                  ) : confirmModal.icon === "safe" ? (
                    <><Shield className="h-4 w-4" /> Restauração Segura</>
                  ) : (
                    <><FolderSync className="h-4 w-4" /> Sincronizar</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "verificacao" && (
          <motion.div key="verificacao" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
            <SystemVerification />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
