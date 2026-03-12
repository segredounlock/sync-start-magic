import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/BackupSection.tsx");import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false, "VITE_SUPABASE_PROJECT_ID": "xtkqyjruyuydlbvwduuy", "VITE_SUPABASE_PUBLISHABLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0a3F5anJ1eXV5ZGxidndkdXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNTMxMDQsImV4cCI6MjA4NzkyOTEwNH0.D2xNWCtfrGNINevXyIJ_weW78PSIzBEb5xmE0iMtZxA", "VITE_SUPABASE_URL": "https://xtkqyjruyuydlbvwduuy.supabase.co"};import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

let prevRefreshReg;
let prevRefreshSig;

if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react-swc can't detect preamble. Something is wrong."
    );
  }

  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/BackupSection.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useRef = __vite__cjsImport3_react["useRef"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { Upload, Database, Loader2, CheckCircle2, AlertTriangle, Github, RefreshCw, FolderSync, ArrowDownToLine, ArrowUpFromLine, Shield, Clock, HardDrive, ChevronDown, ChevronRight, X, Eye, EyeOff, Save, Code2, PackageCheck, UploadCloud, Info } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { supabase } from "/src/integrations/supabase/client.ts";
import { formatFullDateTimeBR, formatDateFullBR } from "/src/lib/timezone.ts";
import { styledToast as toast } from "/src/lib/toast.tsx";
import __vite__cjsImport9_jszip from "/node_modules/.vite/deps/jszip.js?v=c18f1d6a"; const JSZip = __vite__cjsImport9_jszip.__esModule ? __vite__cjsImport9_jszip.default : __vite__cjsImport9_jszip;
// Tables are now discovered dynamically by the edge functions
// This constant is only used for display fallback
const TABLES_LABEL = "dinâmico";
const SOURCE_PATHS = [
    // Core
    "src/App.tsx",
    "src/main.tsx",
    "src/index.css",
    "src/vite-env.d.ts",
    // Pages
    "src/pages/AdminDashboard.tsx",
    "src/pages/Auth.tsx",
    "src/pages/ChatApp.tsx",
    "src/pages/ClientePortal.tsx",
    "src/pages/LandingPage.tsx",
    "src/pages/NotFound.tsx",
    "src/pages/Principal.tsx",
    "src/pages/RecargaPublica.tsx",
    "src/pages/RevendedorPainel.tsx",
    "src/pages/MaintenancePage.tsx",
    "src/pages/ResetPassword.tsx",
    "src/pages/TelegramMiniApp.tsx",
    "src/pages/UserProfile.tsx",
    "src/pages/InstallApp.tsx",
    // Components
    "src/components/AnimatedCheck.tsx",
    "src/components/AnimatedIcon.tsx",
    "src/components/AnimatedPage.tsx",
    "src/components/AnimatedCounter.tsx",
    "src/components/AuditTab.tsx",
    "src/components/BackupSection.tsx",
    "src/components/BrandedQRCode.tsx",
    "src/components/BroadcastForm.tsx",
    "src/components/BroadcastProgress.tsx",
    "src/components/BannersManager.tsx",
    "src/components/FloatingPoll.tsx",
    "src/components/ImageCropper.tsx",
    "src/components/MobileBottomNav.tsx",
    "src/components/NotificationBell.tsx",
    "src/components/PinProtection.tsx",
    "src/components/PollManager.tsx",
    "src/components/PopupBanner.tsx",
    "src/components/ProfileTab.tsx",
    "src/components/PromoBanner.tsx",
    "src/components/ProtectedRoute.tsx",
    "src/components/PullToRefresh.tsx",
    "src/components/RealtimeDashboard.tsx",
    "src/components/RecargaReceipt.tsx",
    "src/components/RecargasTicker.tsx",
    "src/components/Skeleton.tsx",
    "src/components/SplashScreen.tsx",
    "src/components/ThemeToggle.tsx",
    "src/components/VerificationBadge.tsx",
    "src/components/SeasonalEffects.tsx",
    // Chat components
    "src/components/chat/ChatPage.tsx",
    "src/components/chat/ChatWindow.tsx",
    "src/components/chat/ConversationList.tsx",
    "src/components/chat/MessageBubble.tsx",
    "src/components/chat/EmojiPicker.tsx",
    "src/components/chat/AudioRecorder.tsx",
    "src/components/chat/NewChatModal.tsx",
    "src/components/chat/MessageInfoModal.tsx",
    "src/components/chat/UserRecargasModal.tsx",
    "src/components/chat/MentionDropdown.tsx",
    "src/components/ChatRoomManager.tsx",
    // Hooks
    "src/hooks/useAuth.tsx",
    "src/hooks/useAsync.ts",
    "src/hooks/useBackgroundPaymentMonitor.ts",
    "src/hooks/useCacheCleanup.ts",
    "src/hooks/useChat.ts",
    "src/hooks/useCrud.ts",
    "src/hooks/useNotifications.ts",
    "src/hooks/usePixDeposit.ts",
    "src/hooks/usePresence.ts",
    "src/hooks/useTheme.tsx",
    "src/hooks/useTypingIndicator.ts",
    "src/hooks/usePushNotifications.ts",
    "src/hooks/useSeasonalTheme.ts",
    // Libs
    "src/lib/auditLog.ts",
    "src/lib/confirm.tsx",
    "src/lib/fetchAll.ts",
    "src/lib/payment.ts",
    "src/lib/sounds.ts",
    "src/lib/timezone.ts",
    "src/lib/toast.tsx",
    "src/lib/utils.ts",
    // Types
    "src/types/index.ts",
    // Integrations
    "src/integrations/supabase/client.ts",
    "src/integrations/supabase/types.ts",
    // Config
    "tailwind.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "vite.config.ts",
    "postcss.config.js",
    "index.html",
    "package.json",
    "README.md",
    // PWA
    "public/sw-push.js",
    // Edge Functions
    "supabase/functions/admin-create-user/index.ts",
    "supabase/functions/admin-delete-user/index.ts",
    "supabase/functions/admin-toggle-role/index.ts",
    "supabase/functions/auth-email-hook/index.ts",
    "supabase/functions/backup-export/index.ts",
    "supabase/functions/backup-restore/index.ts",
    "supabase/functions/client-register/index.ts",
    "supabase/functions/create-pix/index.ts",
    "supabase/functions/cleanup-stuck-broadcasts/index.ts",
    "supabase/functions/efi-setup/index.ts",
    "supabase/functions/expire-pending-deposits/index.ts",
    "supabase/functions/github-sync/index.ts",
    "supabase/functions/pix-webhook/index.ts",
    "supabase/functions/recarga-express/index.ts",
    "supabase/functions/send-broadcast/index.ts",
    "supabase/functions/sync-pending-recargas/index.ts",
    "supabase/functions/send-push/index.ts",
    "supabase/functions/telegram-bot/index.ts",
    "supabase/functions/telegram-miniapp/index.ts",
    "supabase/functions/telegram-notify/index.ts",
    "supabase/functions/telegram-setup/index.ts",
    "supabase/functions/vapid-setup/index.ts",
    // Email templates
    "supabase/functions/_shared/email-templates/signup.tsx",
    "supabase/functions/_shared/email-templates/recovery.tsx",
    "supabase/functions/_shared/email-templates/magic-link.tsx",
    "supabase/functions/_shared/email-templates/invite.tsx",
    "supabase/functions/_shared/email-templates/email-change.tsx",
    "supabase/functions/_shared/email-templates/reauthentication.tsx",
    // Supabase config
    "supabase/config.toml"
];
export default function BackupSection() {
    _s();
    const [activeTab, setActiveTab] = useState("dados");
    const [includeDb, setIncludeDb] = useState(true);
    const [includeSource, setIncludeSource] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);
    const [exportStage, setExportStage] = useState("");
    const [importing, setImporting] = useState(false);
    const [restoreResult, setRestoreResult] = useState(null);
    const fileInputRef = useRef(null);
    // GitHub sync
    const [repos, setRepos] = useState([]);
    const [loadingRepos, setLoadingRepos] = useState(false);
    const [selectedRepo, setSelectedRepo] = useState("");
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState(null);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncStage, setSyncStage] = useState("");
    const [syncLog, setSyncLog] = useState([]);
    const syncLogRef = useRef(null);
    // Update system
    const [updateExporting, setUpdateExporting] = useState(false);
    const [updateExportProgress, setUpdateExportProgress] = useState(0);
    const [updateExportStage, setUpdateExportStage] = useState("");
    const [updateImporting, setUpdateImporting] = useState(false);
    const [updateImportProgress, setUpdateImportProgress] = useState(0);
    const [updateImportStage, setUpdateImportStage] = useState("");
    const [updateResult, setUpdateResult] = useState(null);
    const [currentVersion, setCurrentVersion] = useState(null);
    const updateFileInputRef = useRef(null);
    // Pending update state (used by confirmModal)
    const [pendingUpdateFile, setPendingUpdateFile] = useState(null);
    const [pendingManifest, setPendingManifest] = useState(null);
    // Update history
    const [updateHistory, setUpdateHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    // Generic confirmation modal (unified for all confirmations)
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        description: "",
        onConfirm: ()=>{}
    });
    // GitHub PAT
    const [githubPat, setGithubPat] = useState("");
    const [showPat, setShowPat] = useState(false);
    const [savingPat, setSavingPat] = useState(false);
    const [patLoaded, setPatLoaded] = useState(false);
    // Dynamic source paths manifest
    const [dynamicPaths, setDynamicPaths] = useState(null);
    // Integrity check
    const [integrityChecking, setIntegrityChecking] = useState(false);
    const [integrityResult, setIntegrityResult] = useState(null);
    // Effective paths: dynamic from DB if available, otherwise hardcoded fallback
    const effectivePaths = dynamicPaths || SOURCE_PATHS;
    useEffect(()=>{
        const loadPat = async ()=>{
            const { data } = await supabase.from("system_config").select("value").eq("key", "githubPat").maybeSingle();
            if (data?.value) setGithubPat(data.value);
            setPatLoaded(true);
        };
        const loadManifest = async ()=>{
            const { data } = await supabase.from("system_config").select("value").eq("key", "source_paths_manifest").maybeSingle();
            if (data?.value) {
                try {
                    const paths = JSON.parse(data.value);
                    if (Array.isArray(paths) && paths.length > 0) {
                        setDynamicPaths(paths);
                        console.log(`[Backup] Manifesto dinâmico carregado: ${paths.length} arquivos`);
                    }
                } catch  {}
            }
        };
        loadPat();
        loadManifest();
    }, []);
    // Load current system version + update history
    useEffect(()=>{
        const loadVersion = async ()=>{
            const { data } = await supabase.from("system_config").select("value").eq("key", "system_version").maybeSingle();
            setCurrentVersion(data?.value || "1.0.0");
        };
        const loadHistory = async ()=>{
            const { data } = await supabase.from("update_history").select("*").order("applied_at", {
                ascending: false
            }).limit(20);
            if (data) setUpdateHistory(data);
        };
        loadVersion();
        loadHistory();
    }, []);
    const saveGithubPat = async ()=>{
        setSavingPat(true);
        try {
            const { error } = await supabase.from("system_config").upsert({
                key: "githubPat",
                value: githubPat
            }, {
                onConflict: "key"
            });
            if (error) throw error;
            toast.success("GitHub PAT salvo!");
        } catch (err) {
            toast.error(`Erro: ${err.message}`);
        }
        setSavingPat(false);
    };
    const loadRepos = async ()=>{
        setLoadingRepos(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessão expirada");
            const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-sync?action=list-repos`, {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                }
            });
            if (!resp.ok) {
                const err = await resp.json().catch(()=>({
                        error: "Erro"
                    }));
                throw new Error(err.error || `HTTP ${resp.status}`);
            }
            const data = await resp.json();
            setRepos(data);
            if (data.length > 0 && !selectedRepo) setSelectedRepo(data[0].full_name);
            toast.success(`${data.length} repositórios encontrados`);
        } catch (err) {
            toast.error(`Erro: ${err.message}`);
        }
        setLoadingRepos(false);
    };
    const handleGitHubSync = async ()=>{
        if (!selectedRepo) {
            toast.error("Selecione um repositório");
            return;
        }
        setConfirmModal({
            open: true,
            title: "Sincronizar com GitHub",
            description: `Enviar todos os arquivos do projeto para o repositório ${selectedRepo}?`,
            details: [
                "Páginas e componentes",
                "Hooks e bibliotecas",
                "Edge Functions",
                "Configurações"
            ],
            icon: "sync",
            onConfirm: ()=>{
                setConfirmModal((prev)=>({
                        ...prev,
                        open: false
                    }));
                executeGitHubSync();
            }
        });
    };
    const executeGitHubSync = async ()=>{
        setSyncing(true);
        setSyncResult(null);
        setSyncProgress(0);
        setSyncStage("Coletando arquivos...");
        setSyncLog([]);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessão expirada");
            const allPaths = effectivePaths;
            const files = [];
            for(let i = 0; i < allPaths.length; i++){
                setSyncStage(`Coletando ${i + 1}/${allPaths.length}...`);
                setSyncProgress(Math.round(i / allPaths.length * 20));
                try {
                    const r = await fetch(new URL(`/${allPaths[i]}`, window.location.origin).href);
                    if (r.ok) {
                        const text = await r.text();
                        if (text && text.length > 10) files.push({
                            path: allPaths[i],
                            content: text
                        });
                    }
                } catch  {}
            }
            if (files.length === 0) throw new Error("Nenhum arquivo coletado");
            setSyncStage(`${files.length} arquivos coletados. Enviando...`);
            setSyncProgress(20);
            const initialLog = files.map((f)=>({
                    path: f.path,
                    status: "pending"
                }));
            setSyncLog(initialLog);
            const repo = repos.find((r)=>r.full_name === selectedRepo);
            const targetBranch = repo?.default_branch || "main";
            const BATCH_SIZE = 5;
            const totalBatches = Math.ceil(files.length / BATCH_SIZE);
            let allResults = [];
            for(let b = 0; b < totalBatches; b++){
                const batchFiles = files.slice(b * BATCH_SIZE, (b + 1) * BATCH_SIZE);
                setSyncStage(`Lote ${b + 1}/${totalBatches} (${Math.min((b + 1) * BATCH_SIZE, files.length)}/${files.length})`);
                setSyncProgress(20 + Math.round(b / totalBatches * 75));
                const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/github-sync?action=sync`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                    },
                    body: JSON.stringify({
                        repo: selectedRepo,
                        branch: targetBranch,
                        files: batchFiles
                    })
                });
                const result = await resp.json();
                if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
                const batchResults = result.results || [];
                allResults = [
                    ...allResults,
                    ...batchResults
                ];
                setSyncLog((prev)=>{
                    const updated = [
                        ...prev
                    ];
                    for (const r of batchResults){
                        const idx = updated.findIndex((l)=>l.path === r.path);
                        if (idx >= 0) updated[idx] = {
                            path: r.path,
                            status: r.status === "ok" ? "ok" : "error",
                            error: r.error
                        };
                    }
                    return updated;
                });
                setTimeout(()=>{
                    syncLogRef.current?.scrollTo({
                        top: syncLogRef.current.scrollHeight,
                        behavior: "smooth"
                    });
                }, 100);
            }
            const okCount = allResults.filter((r)=>r.status === "ok").length;
            const errCount = allResults.filter((r)=>r.status !== "ok").length;
            setSyncProgress(100);
            setSyncStage(`Concluído! ${okCount} enviados${errCount > 0 ? `, ${errCount} erros` : ""}`);
            setSyncResult({
                repo: selectedRepo,
                branch: targetBranch,
                results: allResults
            });
            toast.success(`${okCount} arquivos sincronizados com GitHub!`);
        } catch (err) {
            toast.error(`Erro: ${err.message}`);
            setSyncStage(`Erro: ${err.message}`);
        }
        setSyncing(false);
    };
    const handleExport = async ()=>{
        if (!includeDb && !includeSource) {
            toast.error("Selecione pelo menos uma opção");
            return;
        }
        setExporting(true);
        setExportProgress(0);
        setExportStage("Iniciando...");
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
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token}`,
                        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                    },
                    body: JSON.stringify({
                        includeDatabase: true
                    })
                });
                if (!resp.ok) {
                    const err = await resp.json().catch(()=>({
                            error: "Erro"
                        }));
                    throw new Error(err.error || `HTTP ${resp.status}`);
                }
                // The edge function returns a ZIP with database/ folder — extract and re-add to our ZIP
                const dbZipData = await resp.arrayBuffer();
                const dbZip = await JSZip.loadAsync(dbZipData);
                for (const [path, file] of Object.entries(dbZip.files)){
                    if (!file.dir) {
                        const content = await file.async("uint8array");
                        zip.file(path, content);
                    }
                }
                currentStep++;
                setExportProgress(Math.round(currentStep / totalSteps * 100));
            }
            // 2. Source code via fetch
            if (includeSource) {
                const sourceFolder = zip.folder("source");
                let fetched = 0;
                for (const filePath of effectivePaths){
                    setExportStage(`Coletando ${fetched + 1}/${effectivePaths.length}: ${filePath.split("/").pop()}`);
                    try {
                        const r = await fetch(new URL(`/${filePath}`, window.location.origin).href);
                        if (r.ok) {
                            const text = await r.text();
                            if (text && text.length > 10) {
                                sourceFolder.file(filePath, text);
                            }
                        }
                    } catch  {}
                    fetched++;
                    currentStep++;
                    setExportProgress(Math.round(currentStep / totalSteps * 100));
                }
            }
            // Update backup-info
            zip.file("backup-info.json", JSON.stringify({
                version: "2.0",
                created_at: new Date().toISOString(),
                include_database: includeDb,
                include_source: includeSource,
                source_files: includeSource ? effectivePaths.length : 0,
                tables: "dynamic"
            }, null, 2));
            setExportStage("Gerando ZIP...");
            const blob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `backup-recargas-${new Date().toISOString().slice(0, 10)}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            setExportProgress(100);
            setExportStage("Concluído!");
            toast.success(`Backup exportado! ${includeDb ? "BD + " : ""}${includeSource ? "Código" : ""}`);
        } catch (err) {
            toast.error(`Erro: ${err.message}`);
            setExportStage("");
        }
        setExporting(false);
    };
    const handleImport = async (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith(".zip")) {
            toast.error("Selecione um arquivo .zip");
            return;
        }
        setConfirmModal({
            open: true,
            title: "Restaurar Backup",
            description: "A restauração vai sobrescrever os dados atuais do banco de dados.",
            details: [
                "Todos os dados serão substituídos",
                "Esta ação não pode ser desfeita"
            ],
            icon: "restore",
            onConfirm: ()=>{
                setConfirmModal((prev)=>({
                        ...prev,
                        open: false
                    }));
                executeImport(file);
            }
        });
    };
    const executeImport = async (file)=>{
        setImporting(true);
        setRestoreResult(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessão expirada");
            const arrayBuffer = await file.arrayBuffer();
            const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-restore`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                },
                body: arrayBuffer
            });
            const result = await resp.json();
            if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
            setRestoreResult(result);
            toast.success("Backup restaurado com sucesso!");
        } catch (err) {
            toast.error(`Erro: ${err.message}`);
        }
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    // === UPDATE SYSTEM HANDLERS ===
    const handleUpdateExport = async ()=>{
        setUpdateExporting(true);
        setUpdateExportProgress(0);
        setUpdateExportStage("Iniciando pacote de atualização...");
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
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                    apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                },
                body: JSON.stringify({
                    includeDatabase: true
                })
            });
            if (!resp.ok) {
                const err = await resp.json().catch(()=>({
                        error: "Erro"
                    }));
                throw new Error(err.error || `HTTP ${resp.status}`);
            }
            const dbZipData = await resp.arrayBuffer();
            const dbZip = await JSZip.loadAsync(dbZipData);
            for (const [path, file] of Object.entries(dbZip.files)){
                if (!file.dir) {
                    const content = await file.async("uint8array");
                    zip.file(path, content);
                }
            }
            currentStep++;
            setUpdateExportProgress(Math.round(currentStep / totalSteps * 100));
            // 2. Source code
            const sourceFolder = zip.folder("source");
            let fetched = 0;
            for (const filePath of effectivePaths){
                setUpdateExportStage(`Coletando ${fetched + 1}/${effectivePaths.length}: ${filePath.split("/").pop()}`);
                try {
                    const r = await fetch(new URL(`/${filePath}`, window.location.origin).href);
                    if (r.ok) {
                        const text = await r.text();
                        if (text && text.length > 10) sourceFolder.file(filePath, text);
                    }
                } catch  {}
                fetched++;
                currentStep++;
                setUpdateExportProgress(Math.round(currentStep / totalSteps * 100));
            }
            // 3. Generate update manifest with effectivePaths included for dynamic discovery
            const version = currentVersion || "1.0.0";
            zip.file("update-manifest.json", JSON.stringify({
                version,
                created_at: new Date().toISOString(),
                tables: "dynamic",
                source_files: effectivePaths.length,
                source_paths: effectivePaths,
                type: "full-update"
            }, null, 2));
            setUpdateExportStage("Gerando pacote ZIP...");
            const blob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE"
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `atualizacao-v${version}-${new Date().toISOString().slice(0, 10)}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            setUpdateExportProgress(100);
            setUpdateExportStage("Pacote de atualização gerado!");
            toast.success(`Pacote de atualização v${version} exportado!`);
        } catch (err) {
            toast.error(`Erro: ${err.message}`);
            setUpdateExportStage("");
        }
        setUpdateExporting(false);
    };
    // Step 1: Read manifest and show confirmation
    const handleUpdateImport = async (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.endsWith(".zip")) {
            toast.error("Selecione um arquivo .zip");
            return;
        }
        try {
            const arrayBuffer = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);
            const manifestFile = zip.file("update-manifest.json");
            if (!manifestFile) throw new Error("Pacote inválido: falta update-manifest.json");
            const manifest = JSON.parse(await manifestFile.async("string"));
            // Count DB files
            let dbTableCount = 0;
            for (const [path] of Object.entries(zip.files)){
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
                    `Versão atual: ${currentVersion || "1.0.0"}`
                ],
                icon: "update",
                onConfirm: ()=>{
                    setConfirmModal((prev)=>({
                            ...prev,
                            open: false
                        }));
                    confirmAndApplyUpdate();
                }
            });
        } catch (err) {
            toast.error(`Erro ao ler pacote: ${err.message}`);
        }
        if (updateFileInputRef.current) updateFileInputRef.current.value = "";
    };
    const confirmAndApplyUpdate = async ()=>{
        if (!pendingUpdateFile || !pendingManifest) return;
        const file = pendingUpdateFile;
        const manifest = pendingManifest;
        setPendingUpdateFile(null);
        setPendingManifest(null);
        setUpdateImporting(true);
        setUpdateResult(null);
        setUpdateImportProgress(0);
        setUpdateImportStage("Lendo pacote...");
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
            for (const [path, zipFile] of Object.entries(zip.files)){
                if (path.startsWith("database/") && !zipFile.dir) {
                    dbZip.file(path, await zipFile.async("uint8array"));
                    hasDbFiles = true;
                }
            }
            let restoreResults = null;
            if (hasDbFiles) {
                const dbBlob = await dbZip.generateAsync({
                    type: "arraybuffer"
                });
                setUpdateImportStage("Enviando dados para restauração...");
                setUpdateImportProgress(40);
                const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backup-restore`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
                    },
                    body: dbBlob
                });
                const result = await resp.json();
                if (!resp.ok) throw new Error(result.error || `HTTP ${resp.status}`);
                restoreResults = result;
                setUpdateImportProgress(80);
            }
            // Save source_paths from manifest to system_config for dynamic discovery on this site
            if (manifest.source_paths && Array.isArray(manifest.source_paths)) {
                setUpdateImportStage("Salvando manifesto de arquivos...");
                await supabase.from("system_config").upsert({
                    key: "source_paths_manifest",
                    value: JSON.stringify(manifest.source_paths)
                }, {
                    onConflict: "key"
                });
            }
            // Update system version
            const previousVersion = currentVersion || "1.0.0";
            const newVersion = incrementVersion(manifest.version);
            setUpdateImportStage("Atualizando versão do sistema...");
            await supabase.from("system_config").upsert({
                key: "system_version",
                value: newVersion
            }, {
                onConflict: "key"
            });
            setCurrentVersion(newVersion);
            // Save to update_history
            const results = restoreResults?.results || [];
            const tablesRestored = results.filter((r)=>r.status === "restored").length;
            const tablesSkipped = results.filter((r)=>r.status === "skipped" || r.status === "empty" || r.status === "skipped_fk").length;
            const tablesFailed = results.filter((r)=>r.status === "error").length;
            const totalRecords = results.filter((r)=>r.status === "restored").reduce((sum, r)=>sum + (r.count || 0), 0);
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
                applied_by: user?.id || null
            });
            // Reload history
            const { data: historyData } = await supabase.from("update_history").select("*").order("applied_at", {
                ascending: false
            }).limit(20);
            if (historyData) setUpdateHistory(historyData);
            setUpdateImportProgress(100);
            setUpdateImportStage("Atualização concluída!");
            setUpdateResult({
                from_version: previousVersion,
                to_version: newVersion,
                manifest,
                restore: restoreResults
            });
            toast.success(`Sistema atualizado para v${newVersion}!`);
        } catch (err) {
            toast.error(`Erro: ${err.message}`);
            setUpdateImportStage(`Erro: ${err.message}`);
        }
        setUpdateImporting(false);
    };
    const cancelUpdate = ()=>{
        setConfirmModal((prev)=>({
                ...prev,
                open: false
            }));
        setPendingUpdateFile(null);
        setPendingManifest(null);
    };
    const runIntegrityCheck = async ()=>{
        setIntegrityChecking(true);
        setIntegrityResult(null);
        const missing = [];
        let found = 0;
        for (const filePath of effectivePaths){
            try {
                const r = await fetch(new URL(`/${filePath}`, window.location.origin).href, {
                    method: "HEAD"
                });
                if (r.ok) {
                    found++;
                } else {
                    missing.push(filePath);
                }
            } catch  {
                missing.push(filePath);
            }
        }
        setIntegrityResult({
            missing,
            found,
            total: effectivePaths.length
        });
        if (missing.length === 0) {
            toast.success(`✅ Integridade OK! Todos os ${found} arquivos encontrados.`);
        } else {
            toast.error(`⚠️ ${missing.length} arquivo(s) faltando no backup!`);
        }
        setIntegrityChecking(false);
    };
    const incrementVersion = (v)=>{
        const parts = v.split(".").map(Number);
        parts[2] = (parts[2] || 0) + 1;
        return parts.join(".");
    };
    const tabs = [
        {
            key: "dados",
            label: "Dados",
            icon: Database
        },
        {
            key: "github",
            label: "GitHub",
            icon: Github
        },
        {
            key: "atualizacao",
            label: "Atualização",
            icon: PackageCheck
        }
    ];
    return /*#__PURE__*/ _jsxDEV(motion.div, {
        initial: {
            opacity: 0,
            y: 12
        },
        animate: {
            opacity: 1,
            y: 0
        },
        className: "space-y-5",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex items-center gap-3 p-4 rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500/25 to-orange-500/25 flex items-center justify-center shadow-lg shadow-amber-500/10",
                        children: /*#__PURE__*/ _jsxDEV(Shield, {
                            className: "h-5 w-5 text-amber-400"
                        }, void 0, false, {
                            fileName: "/dev-server/src/components/BackupSection.tsx",
                            lineNumber: 689,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/BackupSection.tsx",
                        lineNumber: 688,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        children: [
                            /*#__PURE__*/ _jsxDEV("h2", {
                                className: "text-lg font-bold text-foreground",
                                children: "Backup & Sync"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 692,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-xs text-muted-foreground",
                                children: [
                                    "Tabelas dinâmicas · ",
                                    formatDateFullBR(new Date())
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 693,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BackupSection.tsx",
                        lineNumber: 691,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/BackupSection.tsx",
                lineNumber: 687,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex gap-1 p-1.5 rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
                children: tabs.map((t)=>/*#__PURE__*/ _jsxDEV("button", {
                        onClick: ()=>setActiveTab(t.key),
                        className: `flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${activeTab === t.key ? "bg-white/[0.08] text-foreground shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"}`,
                        children: [
                            /*#__PURE__*/ _jsxDEV(t.icon, {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 706,
                                columnNumber: 13
                            }, this),
                            t.label
                        ]
                    }, t.key, true, {
                        fileName: "/dev-server/src/components/BackupSection.tsx",
                        lineNumber: 700,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "/dev-server/src/components/BackupSection.tsx",
                lineNumber: 698,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                mode: "wait",
                children: [
                    activeTab === "dados" && /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            x: -12
                        },
                        animate: {
                            opacity: 1,
                            x: 0
                        },
                        exit: {
                            opacity: 0,
                            x: 12
                        },
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "grid grid-cols-2 gap-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: handleExport,
                                        disabled: exporting,
                                        className: "relative group rounded-2xl p-4 backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.07] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(245,158,11,0.08)] transition-all text-left disabled:opacity-60",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/5",
                                                children: exporting ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                    className: "h-4 w-4 animate-spin text-amber-400"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 721,
                                                    columnNumber: 32
                                                }, this) : /*#__PURE__*/ _jsxDEV(ArrowDownToLine, {
                                                    className: "h-4 w-4 text-amber-400"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 721,
                                                    columnNumber: 94
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 720,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm font-semibold text-foreground",
                                                children: exporting ? "Gerando..." : "Exportar"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 723,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] text-muted-foreground mt-0.5",
                                                children: "Baixar backup .zip"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 724,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 718,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>fileInputRef.current?.click(),
                                        disabled: importing,
                                        className: "relative group rounded-2xl p-4 backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.07] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(239,68,68,0.08)] transition-all text-left disabled:opacity-60",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "h-10 w-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mb-3 shadow-lg shadow-red-500/5",
                                                children: importing ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                    className: "h-4 w-4 animate-spin text-red-400"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 731,
                                                    columnNumber: 32
                                                }, this) : /*#__PURE__*/ _jsxDEV(ArrowUpFromLine, {
                                                    className: "h-4 w-4 text-red-400"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 731,
                                                    columnNumber: 92
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 730,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm font-semibold text-foreground",
                                                children: importing ? "Restaurando..." : "Restaurar"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 733,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] text-muted-foreground mt-0.5",
                                                children: "Importar backup .zip"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 734,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 728,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 716,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("input", {
                                ref: fileInputRef,
                                type: "file",
                                accept: ".zip",
                                onChange: handleImport,
                                className: "hidden"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 738,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                children: exporting && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    animate: {
                                        opacity: 1,
                                        height: "auto"
                                    },
                                    exit: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    className: "rounded-2xl backdrop-blur-xl bg-primary/[0.06] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-4 space-y-3 overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-sm font-semibold text-foreground",
                                            children: exportStage
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 745,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden",
                                            children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                className: "h-full bg-gradient-to-r from-primary to-amber-400 rounded-full",
                                                initial: {
                                                    width: 0
                                                },
                                                animate: {
                                                    width: `${exportProgress}%`
                                                },
                                                transition: {
                                                    duration: 0.3
                                                }
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 747,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 746,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-[11px] text-muted-foreground text-right font-mono",
                                            children: [
                                                exportProgress,
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 750,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                    lineNumber: 743,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 741,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-4 space-y-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(Shield, {
                                                        className: "h-4 w-4 text-muted-foreground"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 759,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xs font-semibold text-foreground uppercase tracking-wider",
                                                        children: "Verificação de Integridade"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 760,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 758,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: runIntegrityCheck,
                                                disabled: integrityChecking,
                                                className: "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-60",
                                                children: [
                                                    integrityChecking ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                        className: "h-3 w-3 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 764,
                                                        columnNumber: 40
                                                    }, this) : /*#__PURE__*/ _jsxDEV(RefreshCw, {
                                                        className: "h-3 w-3"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 764,
                                                        columnNumber: 87
                                                    }, this),
                                                    integrityChecking ? "Verificando..." : "Verificar"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 762,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 757,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-[11px] text-muted-foreground",
                                        children: "Compara os arquivos do projeto com o SOURCE_PATHS para garantir que nenhum arquivo fique fora do backup."
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 768,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                        children: integrityResult && /*#__PURE__*/ _jsxDEV(motion.div, {
                                            initial: {
                                                opacity: 0,
                                                height: 0
                                            },
                                            animate: {
                                                opacity: 1,
                                                height: "auto"
                                            },
                                            exit: {
                                                opacity: 0,
                                                height: 0
                                            },
                                            className: "space-y-2 overflow-hidden",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        integrityResult.missing.length === 0 ? /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                                            className: "h-4 w-4 text-emerald-400"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 776,
                                                            columnNumber: 25
                                                        }, this) : /*#__PURE__*/ _jsxDEV(AlertTriangle, {
                                                            className: "h-4 w-4 text-amber-400"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 778,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                            className: "text-xs font-semibold text-foreground",
                                                            children: [
                                                                integrityResult.found,
                                                                "/",
                                                                integrityResult.total,
                                                                " arquivos encontrados",
                                                                integrityResult.missing.length > 0 && ` · ${integrityResult.missing.length} faltando`
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 780,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 774,
                                                    columnNumber: 21
                                                }, this),
                                                integrityResult.missing.length > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "max-h-40 overflow-y-auto rounded-xl bg-red-500/[0.06] border border-red-500/20 p-2.5 space-y-1",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                            className: "text-[10px] font-semibold text-red-400 uppercase tracking-wider mb-1",
                                                            children: "Arquivos faltantes:"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 787,
                                                            columnNumber: 25
                                                        }, this),
                                                        integrityResult.missing.map((f)=>/*#__PURE__*/ _jsxDEV("p", {
                                                                className: "text-[10px] font-mono text-red-300/80 truncate",
                                                                children: [
                                                                    "❌ ",
                                                                    f
                                                                ]
                                                            }, f, true, {
                                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                lineNumber: 789,
                                                                columnNumber: 27
                                                            }, this))
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 786,
                                                    columnNumber: 23
                                                }, this),
                                                integrityResult.missing.length === 0 && /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 p-2.5",
                                                    children: /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-[10px] text-emerald-400 font-medium",
                                                        children: "✅ Todos os arquivos estão cobertos pelo backup. Nenhum arquivo faltando."
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 795,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 794,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 772,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 770,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 756,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center gap-2 mb-3",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(HardDrive, {
                                                className: "h-4 w-4 text-muted-foreground"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 806,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs font-semibold text-foreground uppercase tracking-wider",
                                                children: "Tabelas no backup"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 807,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 805,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex flex-wrap gap-1.5",
                                        children: /*#__PURE__*/ _jsxDEV("span", {
                                            className: "text-[10px] font-mono px-2 py-1 rounded-lg bg-white/[0.05] text-muted-foreground shadow-[inset_0_1px_0px_rgba(255,255,255,0.04)]",
                                            children: "🔄 Descoberta automática — todas as tabelas do schema public"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 810,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 809,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 804,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: ()=>setIncludeDb(!includeDb),
                                className: "flex items-center gap-3 w-full p-3.5 rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.06] transition-all text-left",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: `h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${includeDb ? "bg-primary border-primary" : "border-muted-foreground/40"}`,
                                        children: includeDb && /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                            className: "h-3.5 w-3.5 text-primary-foreground"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 822,
                                            columnNumber: 31
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 819,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm font-medium text-foreground",
                                                children: "Incluir banco de dados"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 825,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] text-muted-foreground",
                                                children: "Usuários, saldos, recargas, configs"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 826,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 824,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 817,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: ()=>setIncludeSource(!includeSource),
                                className: "flex items-center gap-3 w-full p-3.5 rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/[0.06] transition-all text-left",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: `h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${includeSource ? "bg-primary border-primary" : "border-muted-foreground/40"}`,
                                        children: includeSource && /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                            className: "h-3.5 w-3.5 text-primary-foreground"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 836,
                                            columnNumber: 35
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 833,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm font-medium text-foreground flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(Code2, {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 840,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Incluir código-fonte"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 839,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] text-muted-foreground",
                                                children: "Páginas, componentes, hooks, edge functions"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 842,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 838,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 831,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                children: restoreResult && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    animate: {
                                        opacity: 1,
                                        height: "auto"
                                    },
                                    exit: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    className: "rounded-2xl backdrop-blur-xl bg-emerald-500/[0.06] shadow-[inset_0_1px_1px_rgba(52,211,153,0.1),0_0_20px_rgba(16,185,129,0.06)] p-4 space-y-3 overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-sm font-semibold text-emerald-400 flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 853,
                                                            columnNumber: 23
                                                        }, this),
                                                        " Restaurado com sucesso"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 852,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setRestoreResult(null),
                                                    className: "text-destructive hover:text-destructive/80",
                                                    children: /*#__PURE__*/ _jsxDEV(X, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 856,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 855,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 851,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex gap-4 text-xs text-muted-foreground",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(Clock, {
                                                            className: "h-3 w-3"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 860,
                                                            columnNumber: 63
                                                        }, this),
                                                        " ",
                                                        restoreResult.backup_date ? formatFullDateTimeBR(restoreResult.backup_date) : "—"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 860,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    children: restoreResult.backup_by || "—"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 861,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 859,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "space-y-1 max-h-40 overflow-y-auto",
                                            children: restoreResult.results?.map((r, i)=>/*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex items-center justify-between text-xs py-1",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "text-foreground font-mono",
                                                            children: r.table
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 866,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: `font-medium ${r.status === "restored" ? "text-emerald-400" : r.status === "skipped" ? "text-muted-foreground" : r.status === "error" ? "text-red-400" : "text-amber-400"}`,
                                                            children: r.status === "restored" ? `${r.count} registros` : r.status === "skipped" ? "pulado" : r.status === "empty" ? "vazio" : r.error || "erro"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 867,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 865,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 863,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                    lineNumber: 849,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 847,
                                columnNumber: 13
                            }, this)
                        ]
                    }, "dados", true, {
                        fileName: "/dev-server/src/components/BackupSection.tsx",
                        lineNumber: 714,
                        columnNumber: 11
                    }, this),
                    activeTab === "github" && /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            x: 12
                        },
                        animate: {
                            opacity: 1,
                            x: 0
                        },
                        exit: {
                            opacity: 0,
                            x: -12
                        },
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-4 space-y-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("label", {
                                        className: "block text-xs font-semibold text-foreground uppercase tracking-wider",
                                        children: "GitHub PAT (Personal Access Token)"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 889,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "relative flex-1",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                        type: showPat ? "text" : "password",
                                                        value: githubPat,
                                                        onChange: (e)=>setGithubPat(e.target.value),
                                                        placeholder: "ghp_...",
                                                        className: "w-full px-3 py-2 pr-9 rounded-xl bg-white/[0.05] border border-white/[0.08] text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 892,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("button", {
                                                        type: "button",
                                                        onClick: ()=>setShowPat(!showPat),
                                                        className: "absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                                                        children: showPat ? /*#__PURE__*/ _jsxDEV(EyeOff, {
                                                            className: "h-3.5 w-3.5"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 900,
                                                            columnNumber: 32
                                                        }, this) : /*#__PURE__*/ _jsxDEV(Eye, {
                                                            className: "h-3.5 w-3.5"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 900,
                                                            columnNumber: 69
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 899,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 891,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: saveGithubPat,
                                                disabled: savingPat,
                                                className: "px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5",
                                                children: [
                                                    savingPat ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                        className: "h-3.5 w-3.5 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 905,
                                                        columnNumber: 32
                                                    }, this) : /*#__PURE__*/ _jsxDEV(Save, {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 905,
                                                        columnNumber: 83
                                                    }, this),
                                                    "Salvar"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 903,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 890,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-[10px] text-muted-foreground",
                                        children: [
                                            "Gere em ",
                                            /*#__PURE__*/ _jsxDEV("a", {
                                                href: "https://github.com/settings/tokens",
                                                target: "_blank",
                                                rel: "noopener",
                                                className: "underline hover:text-foreground",
                                                children: "github.com/settings/tokens"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 909,
                                                columnNumber: 72
                                            }, this),
                                            " com escopo ",
                                            /*#__PURE__*/ _jsxDEV("code", {
                                                className: "bg-white/[0.06] px-1 rounded",
                                                children: "repo"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 909,
                                                columnNumber: 234
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 909,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 888,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: loadRepos,
                                disabled: loadingRepos,
                                className: "w-full py-3 rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.07] text-foreground font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                                children: [
                                    loadingRepos ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                        className: "h-4 w-4 animate-spin"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 915,
                                        columnNumber: 31
                                    }, this) : /*#__PURE__*/ _jsxDEV(RefreshCw, {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 915,
                                        columnNumber: 78
                                    }, this),
                                    loadingRepos ? "Carregando..." : repos.length > 0 ? "Atualizar repositórios" : "Carregar repositórios"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 913,
                                columnNumber: 13
                            }, this),
                            repos.length > 0 && /*#__PURE__*/ _jsxDEV(_Fragment, {
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "relative",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("select", {
                                                value: selectedRepo,
                                                onChange: (e)=>setSelectedRepo(e.target.value),
                                                className: "w-full py-2.5 px-3 pl-9 rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none appearance-none",
                                                children: repos.map((r)=>/*#__PURE__*/ _jsxDEV("option", {
                                                        value: r.full_name,
                                                        children: [
                                                            r.full_name,
                                                            " (",
                                                            r.default_branch,
                                                            ") ",
                                                            r.private ? "• privado" : "• público"
                                                        ]
                                                    }, r.full_name, true, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 925,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 922,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV(Github, {
                                                className: "absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 930,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV(ChevronDown, {
                                                className: "absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 931,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 921,
                                        columnNumber: 17
                                    }, this),
                                    !syncing && (()=>{
                                        const pages = effectivePaths.filter((p)=>p.startsWith("src/pages/")).length;
                                        const components = effectivePaths.filter((p)=>p.startsWith("src/components/")).length;
                                        const hooks = effectivePaths.filter((p)=>p.startsWith("src/hooks/")).length;
                                        const libs = effectivePaths.filter((p)=>p.startsWith("src/lib/")).length;
                                        const edgeFns = effectivePaths.filter((p)=>p.startsWith("supabase/functions/")).length;
                                        const configs = effectivePaths.filter((p)=>!p.startsWith("src/") && !p.startsWith("supabase/functions/") && !p.startsWith("public/")).length;
                                        return /*#__PURE__*/ _jsxDEV("div", {
                                            className: "rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] p-3",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-xs text-muted-foreground",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "font-semibold text-foreground",
                                                            children: "Projeto completo:"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 944,
                                                            columnNumber: 25
                                                        }, this),
                                                        " ",
                                                        pages,
                                                        " páginas · ",
                                                        components,
                                                        " componentes · ",
                                                        hooks,
                                                        " hooks · ",
                                                        libs,
                                                        " libs · ",
                                                        edgeFns,
                                                        " edge functions",
                                                        configs > 0 ? ` · ${configs} configs` : ""
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 943,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-[10px] text-muted-foreground/70 mt-1 font-mono",
                                                    children: [
                                                        effectivePaths.length,
                                                        " arquivos total"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 947,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 942,
                                            columnNumber: 21
                                        }, this);
                                    })(),
                                    !syncing ? /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: handleGitHubSync,
                                        disabled: !selectedRepo,
                                        className: "w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(FolderSync, {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 955,
                                                columnNumber: 21
                                            }, this),
                                            " Sincronizar tudo"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 953,
                                        columnNumber: 19
                                    }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                        className: "rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-4 space-y-3",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm font-semibold text-foreground",
                                                children: syncStage
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 959,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden",
                                                children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                    className: "h-full bg-gradient-to-r from-primary to-amber-400 rounded-full",
                                                    initial: {
                                                        width: 0
                                                    },
                                                    animate: {
                                                        width: `${syncProgress}%`
                                                    },
                                                    transition: {
                                                        duration: 0.3
                                                    }
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 961,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 960,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] text-muted-foreground text-right font-mono",
                                                children: [
                                                    syncProgress,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 964,
                                                columnNumber: 21
                                            }, this),
                                            syncLog.length > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                                ref: syncLogRef,
                                                className: "max-h-44 overflow-y-auto space-y-0.5 rounded-xl p-2 bg-white/[0.02]",
                                                children: syncLog.map((item, i)=>/*#__PURE__*/ _jsxDEV("div", {
                                                        className: "flex items-center justify-between text-[11px] py-0.5",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                className: "text-foreground font-mono truncate max-w-[220px]",
                                                                children: item.path.split("/").pop()
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                lineNumber: 969,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                className: `font-medium flex-shrink-0 ml-2 ${item.status === "ok" ? "text-emerald-400" : item.status === "error" ? "text-red-400" : "text-muted-foreground"}`,
                                                                children: item.status === "ok" ? "✓" : item.status === "error" ? "✗" : "…"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                lineNumber: 970,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, i, true, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 968,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 966,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 958,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true),
                            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                children: syncResult && !syncing && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    animate: {
                                        opacity: 1,
                                        height: "auto"
                                    },
                                    exit: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    className: "rounded-2xl backdrop-blur-xl bg-emerald-500/[0.06] shadow-[inset_0_1px_1px_rgba(52,211,153,0.1),0_0_20px_rgba(16,185,129,0.06)] p-4 space-y-2 overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-sm font-semibold text-emerald-400 flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 990,
                                                            columnNumber: 23
                                                        }, this),
                                                        " Sincronizado"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 989,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setSyncResult(null),
                                                    className: "text-destructive hover:text-destructive/80",
                                                    children: /*#__PURE__*/ _jsxDEV(X, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 992,
                                                        columnNumber: 120
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 992,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 988,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: [
                                                syncResult.repo,
                                                " · branch: ",
                                                syncResult.branch
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 994,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex gap-3 text-xs",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "text-emerald-400 font-medium",
                                                    children: [
                                                        syncResult.results?.filter((r)=>r.status === "ok").length,
                                                        " enviados"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 996,
                                                    columnNumber: 21
                                                }, this),
                                                syncResult.results?.filter((r)=>r.status !== "ok").length > 0 && /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "text-red-400 font-medium",
                                                    children: [
                                                        syncResult.results?.filter((r)=>r.status !== "ok").length,
                                                        " erros"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 998,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 995,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                    lineNumber: 986,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 984,
                                columnNumber: 13
                            }, this)
                        ]
                    }, "github", true, {
                        fileName: "/dev-server/src/components/BackupSection.tsx",
                        lineNumber: 886,
                        columnNumber: 11
                    }, this),
                    activeTab === "atualizacao" && /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            x: 12
                        },
                        animate: {
                            opacity: 1,
                            x: 0
                        },
                        exit: {
                            opacity: 0,
                            x: -12
                        },
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-4 flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-600/10 flex items-center justify-center shadow-lg shadow-blue-500/5",
                                        children: /*#__PURE__*/ _jsxDEV(Info, {
                                            className: "h-4 w-4 text-blue-400"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1012,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1011,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm font-semibold text-foreground",
                                                children: [
                                                    "Versão atual: ",
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "font-mono text-primary",
                                                        children: currentVersion || "..."
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1015,
                                                        columnNumber: 84
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1015,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] text-muted-foreground",
                                                children: "Gere um pacote para migrar ou aplicar uma atualização"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1016,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1014,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1010,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "grid grid-cols-2 gap-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: handleUpdateExport,
                                        disabled: updateExporting,
                                        className: "relative group rounded-2xl p-4 backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.07] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(59,130,246,0.08)] transition-all text-left disabled:opacity-60",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center mb-3 shadow-lg shadow-blue-500/5",
                                                children: updateExporting ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                    className: "h-4 w-4 animate-spin text-blue-400"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1025,
                                                    columnNumber: 38
                                                }, this) : /*#__PURE__*/ _jsxDEV(ArrowDownToLine, {
                                                    className: "h-4 w-4 text-blue-400"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1025,
                                                    columnNumber: 99
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1024,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm font-semibold text-foreground",
                                                children: updateExporting ? "Gerando..." : "Gerar Pacote"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1027,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] text-muted-foreground mt-0.5",
                                                children: "Exportar atualização"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1028,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1022,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>updateFileInputRef.current?.click(),
                                        disabled: updateImporting,
                                        className: "relative group rounded-2xl p-4 backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.07] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_20px_rgba(16,185,129,0.08)] transition-all text-left disabled:opacity-60",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/5",
                                                children: updateImporting ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                    className: "h-4 w-4 animate-spin text-emerald-400"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1034,
                                                    columnNumber: 38
                                                }, this) : /*#__PURE__*/ _jsxDEV(UploadCloud, {
                                                    className: "h-4 w-4 text-emerald-400"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1034,
                                                    columnNumber: 102
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1033,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm font-semibold text-foreground",
                                                children: updateImporting ? "Aplicando..." : "Aplicar Atualização"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1036,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] text-muted-foreground mt-0.5",
                                                children: "Importar pacote .zip"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1037,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1031,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1021,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("input", {
                                ref: updateFileInputRef,
                                type: "file",
                                accept: ".zip",
                                onChange: handleUpdateImport,
                                className: "hidden"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1041,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                children: updateExporting && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    animate: {
                                        opacity: 1,
                                        height: "auto"
                                    },
                                    exit: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    className: "rounded-2xl backdrop-blur-xl bg-blue-500/[0.06] shadow-[inset_0_1px_1px_rgba(59,130,246,0.1)] p-4 space-y-3 overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-sm font-semibold text-foreground",
                                            children: updateExportStage
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1048,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden",
                                            children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                className: "h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full",
                                                initial: {
                                                    width: 0
                                                },
                                                animate: {
                                                    width: `${updateExportProgress}%`
                                                },
                                                transition: {
                                                    duration: 0.3
                                                }
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1050,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1049,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-[11px] text-muted-foreground text-right font-mono",
                                            children: [
                                                updateExportProgress,
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1053,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                    lineNumber: 1046,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1044,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                children: updateImporting && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    animate: {
                                        opacity: 1,
                                        height: "auto"
                                    },
                                    exit: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    className: "rounded-2xl backdrop-blur-xl bg-emerald-500/[0.06] shadow-[inset_0_1px_1px_rgba(16,185,129,0.1)] p-4 space-y-3 overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-sm font-semibold text-foreground",
                                            children: updateImportStage
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1063,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden",
                                            children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                className: "h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full",
                                                initial: {
                                                    width: 0
                                                },
                                                animate: {
                                                    width: `${updateImportProgress}%`
                                                },
                                                transition: {
                                                    duration: 0.3
                                                }
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1065,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1064,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-[11px] text-muted-foreground text-right font-mono",
                                            children: [
                                                updateImportProgress,
                                                "%"
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1068,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                    lineNumber: 1061,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1059,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                children: updateResult && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    animate: {
                                        opacity: 1,
                                        height: "auto"
                                    },
                                    exit: {
                                        opacity: 0,
                                        height: 0
                                    },
                                    className: "rounded-2xl backdrop-blur-xl bg-emerald-500/[0.06] shadow-[inset_0_1px_1px_rgba(52,211,153,0.1),0_0_20px_rgba(16,185,129,0.06)] p-4 space-y-3 overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-sm font-semibold text-emerald-400 flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                                            className: "h-4 w-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 1080,
                                                            columnNumber: 23
                                                        }, this),
                                                        " Atualização Aplicada"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1079,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setUpdateResult(null),
                                                    className: "text-destructive hover:text-destructive/80",
                                                    children: /*#__PURE__*/ _jsxDEV(X, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1083,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1082,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1078,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex gap-4 text-xs text-muted-foreground",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "font-mono",
                                                    children: [
                                                        "v",
                                                        updateResult.from_version,
                                                        " → v",
                                                        updateResult.to_version
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1087,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(Clock, {
                                                            className: "h-3 w-3"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 1088,
                                                            columnNumber: 63
                                                        }, this),
                                                        " ",
                                                        updateResult.manifest?.created_at ? formatFullDateTimeBR(updateResult.manifest.created_at) : "—"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1088,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1086,
                                            columnNumber: 19
                                        }, this),
                                        updateResult.restore?.results && /*#__PURE__*/ _jsxDEV("div", {
                                            className: "space-y-1 max-h-40 overflow-y-auto",
                                            children: updateResult.restore.results.map((r, i)=>/*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex items-center justify-between text-xs py-1",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "text-foreground font-mono",
                                                            children: r.table
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 1094,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: `font-medium ${r.status === "restored" ? "text-emerald-400" : r.status === "skipped" ? "text-muted-foreground" : r.status === "error" ? "text-red-400" : "text-amber-400"}`,
                                                            children: r.status === "restored" ? `${r.count} registros` : r.status === "skipped" ? "pulado" : r.status === "empty" ? "vazio" : r.error || "erro"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                                            lineNumber: 1095,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1093,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1091,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                    lineNumber: 1076,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1074,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "rounded-2xl backdrop-blur-xl bg-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)] p-4 space-y-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>setShowHistory(!showHistory),
                                        className: "flex items-center justify-between w-full",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(Clock, {
                                                        className: "h-4 w-4 text-muted-foreground"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1116,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xs font-semibold text-foreground uppercase tracking-wider",
                                                        children: "Histórico de Atualizações"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1117,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1115,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-[10px] text-muted-foreground font-mono",
                                                        children: [
                                                            updateHistory.length,
                                                            " registros"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1120,
                                                        columnNumber: 19
                                                    }, this),
                                                    showHistory ? /*#__PURE__*/ _jsxDEV(ChevronDown, {
                                                        className: "h-3.5 w-3.5 text-muted-foreground"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1121,
                                                        columnNumber: 34
                                                    }, this) : /*#__PURE__*/ _jsxDEV(ChevronRight, {
                                                        className: "h-3.5 w-3.5 text-muted-foreground"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1121,
                                                        columnNumber: 98
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1119,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1114,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                        children: showHistory && /*#__PURE__*/ _jsxDEV(motion.div, {
                                            initial: {
                                                opacity: 0,
                                                height: 0
                                            },
                                            animate: {
                                                opacity: 1,
                                                height: "auto"
                                            },
                                            exit: {
                                                opacity: 0,
                                                height: 0
                                            },
                                            className: "overflow-hidden",
                                            children: updateHistory.length === 0 ? /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] text-muted-foreground py-2",
                                                children: "Nenhuma atualização aplicada ainda."
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1128,
                                                columnNumber: 23
                                            }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                                className: "space-y-2 max-h-60 overflow-y-auto",
                                                children: updateHistory.map((h)=>/*#__PURE__*/ _jsxDEV("div", {
                                                        className: "rounded-xl bg-white/[0.03] p-3 space-y-1.5",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center justify-between",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs font-semibold text-foreground font-mono",
                                                                        children: [
                                                                            h.previous_version ? `v${h.previous_version} → ` : "",
                                                                            "v",
                                                                            h.version
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                        lineNumber: 1134,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-[10px] text-muted-foreground",
                                                                        children: formatFullDateTimeBR(h.applied_at)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                        lineNumber: 1137,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                lineNumber: 1133,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex gap-3 text-[10px]",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-emerald-400",
                                                                        children: [
                                                                            "✓ ",
                                                                            h.tables_restored,
                                                                            " restauradas"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                        lineNumber: 1142,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    h.tables_skipped > 0 && /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-muted-foreground",
                                                                        children: [
                                                                            "⊘ ",
                                                                            h.tables_skipped,
                                                                            " puladas"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                        lineNumber: 1143,
                                                                        columnNumber: 56
                                                                    }, this),
                                                                    h.tables_failed > 0 && /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-red-400",
                                                                        children: [
                                                                            "✗ ",
                                                                            h.tables_failed,
                                                                            " erros"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                        lineNumber: 1144,
                                                                        columnNumber: 55
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-blue-400",
                                                                        children: [
                                                                            h.total_records,
                                                                            " registros"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                        lineNumber: 1145,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                lineNumber: 1141,
                                                                columnNumber: 29
                                                            }, this),
                                                            h.backup_date && /*#__PURE__*/ _jsxDEV("p", {
                                                                className: "text-[10px] text-muted-foreground",
                                                                children: [
                                                                    "Pacote de ",
                                                                    formatDateFullBR(h.backup_date),
                                                                    h.backup_by ? ` por ${h.backup_by}` : ""
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                                lineNumber: 1148,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, h.id, true, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1132,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1130,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1126,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1124,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1113,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "rounded-2xl backdrop-blur-xl bg-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] p-4 space-y-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-xs font-semibold text-foreground uppercase tracking-wider",
                                        children: "Como funciona"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1164,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "space-y-1.5 text-[11px] text-muted-foreground",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                children: [
                                                    "📦 ",
                                                    /*#__PURE__*/ _jsxDEV("b", {
                                                        className: "text-foreground",
                                                        children: "Gerar Pacote"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1166,
                                                        columnNumber: 23
                                                    }, this),
                                                    " — Exporta banco de dados + código-fonte como um ZIP versionado"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1166,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                children: [
                                                    "🔄 ",
                                                    /*#__PURE__*/ _jsxDEV("b", {
                                                        className: "text-foreground",
                                                        children: "Aplicar Atualização"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1167,
                                                        columnNumber: 23
                                                    }, this),
                                                    " — Importa o ZIP e restaura os dados via upsert inteligente (sem apagar dados existentes)"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1167,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                children: [
                                                    "🔢 ",
                                                    /*#__PURE__*/ _jsxDEV("b", {
                                                        className: "text-foreground",
                                                        children: "Versão"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1168,
                                                        columnNumber: 23
                                                    }, this),
                                                    " — Incrementada automaticamente a cada atualização aplicada"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1168,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                children: [
                                                    "📋 ",
                                                    /*#__PURE__*/ _jsxDEV("b", {
                                                        className: "text-foreground",
                                                        children: "Histórico"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                                        lineNumber: 1169,
                                                        columnNumber: 23
                                                    }, this),
                                                    " — Cada atualização é registrada com versão, data e resultado"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                                lineNumber: 1169,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1165,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1163,
                                columnNumber: 13
                            }, this)
                        ]
                    }, "atualizacao", true, {
                        fileName: "/dev-server/src/components/BackupSection.tsx",
                        lineNumber: 1008,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/BackupSection.tsx",
                lineNumber: 712,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                children: confirmModal.open && /*#__PURE__*/ _jsxDEV(motion.div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm",
                    onClick: ()=>setConfirmModal((prev)=>({
                                ...prev,
                                open: false
                            })),
                    children: /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            scale: 0.9,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            scale: 1,
                            y: 0
                        },
                        exit: {
                            opacity: 0,
                            scale: 0.9,
                            y: 20
                        },
                        transition: {
                            type: "spring",
                            damping: 25,
                            stiffness: 300
                        },
                        onClick: (e)=>e.stopPropagation(),
                        className: "w-full max-w-md rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "p-6 pb-4 text-center",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: `mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${confirmModal.icon === "restore" ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 shadow-amber-500/10" : confirmModal.icon === "update" ? "bg-gradient-to-br from-blue-500/20 to-indigo-500/20 shadow-blue-500/10" : "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-emerald-500/10"}`,
                                        children: confirmModal.icon === "restore" ? /*#__PURE__*/ _jsxDEV(AlertTriangle, {
                                            className: "h-6 w-6 text-amber-400"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1204,
                                            columnNumber: 21
                                        }, this) : confirmModal.icon === "update" ? /*#__PURE__*/ _jsxDEV(PackageCheck, {
                                            className: "h-6 w-6 text-blue-400"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1206,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ _jsxDEV(Github, {
                                            className: "h-6 w-6 text-emerald-400"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1208,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1196,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("h3", {
                                        className: "text-lg font-bold text-foreground",
                                        children: confirmModal.title
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1211,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-sm text-muted-foreground mt-1.5 leading-relaxed",
                                        children: confirmModal.description
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1212,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1195,
                                columnNumber: 15
                            }, this),
                            confirmModal.details && confirmModal.details.length > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                className: "mx-6 mb-4 p-3.5 rounded-xl bg-muted/50 border border-border/30",
                                children: /*#__PURE__*/ _jsxDEV("div", {
                                    className: "space-y-2",
                                    children: confirmModal.details.map((detail, i)=>/*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center gap-2.5 text-sm text-muted-foreground",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: `h-1.5 w-1.5 rounded-full flex-shrink-0 ${confirmModal.icon === "restore" ? "bg-amber-400/70" : confirmModal.icon === "update" ? "bg-blue-400/70" : "bg-emerald-400/70"}`
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1221,
                                                    columnNumber: 25
                                                }, this),
                                                detail
                                            ]
                                        }, i, true, {
                                            fileName: "/dev-server/src/components/BackupSection.tsx",
                                            lineNumber: 1220,
                                            columnNumber: 23
                                        }, this))
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                    lineNumber: 1218,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1217,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "p-6 pt-2 flex gap-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>setConfirmModal((prev)=>({
                                                    ...prev,
                                                    open: false
                                                })),
                                        className: "flex-1 py-3 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-all duration-200",
                                        children: "Cancelar"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1233,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: confirmModal.onConfirm,
                                        className: `flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${confirmModal.icon === "restore" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-lg hover:shadow-amber-500/25" : confirmModal.icon === "update" ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-500/25" : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25"}`,
                                        children: confirmModal.icon === "restore" ? /*#__PURE__*/ _jsxDEV(_Fragment, {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(Upload, {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1250,
                                                    columnNumber: 23
                                                }, this),
                                                " Restaurar"
                                            ]
                                        }, void 0, true) : confirmModal.icon === "update" ? /*#__PURE__*/ _jsxDEV(_Fragment, {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(PackageCheck, {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1252,
                                                    columnNumber: 23
                                                }, this),
                                                " Aplicar"
                                            ]
                                        }, void 0, true) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(FolderSync, {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BackupSection.tsx",
                                                    lineNumber: 1254,
                                                    columnNumber: 23
                                                }, this),
                                                " Sincronizar"
                                            ]
                                        }, void 0, true)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BackupSection.tsx",
                                        lineNumber: 1239,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BackupSection.tsx",
                                lineNumber: 1232,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BackupSection.tsx",
                        lineNumber: 1186,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/components/BackupSection.tsx",
                    lineNumber: 1179,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/components/BackupSection.tsx",
                lineNumber: 1177,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/BackupSection.tsx",
        lineNumber: 685,
        columnNumber: 5
    }, this);
}
_s(BackupSection, "+HTssebOZSt+MjrjZ8zHDaTG0kI=");
_c = BackupSection;
var _c;
$RefreshReg$(_c, "BackupSection");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/BackupSection.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/BackupSection.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhY2t1cFNlY3Rpb24udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgbW90aW9uLCBBbmltYXRlUHJlc2VuY2UgfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IHtcbiAgRG93bmxvYWQsIFVwbG9hZCwgRGF0YWJhc2UsIExvYWRlcjIsIENoZWNrQ2lyY2xlMiwgQWxlcnRUcmlhbmdsZSxcbiAgR2l0aHViLCBSZWZyZXNoQ3csIEZvbGRlclN5bmMsIEFycm93RG93blRvTGluZSwgQXJyb3dVcEZyb21MaW5lLFxuICBGaWxlQXJjaGl2ZSwgU2hpZWxkLCBDbG9jaywgSGFyZERyaXZlLCBDaGV2cm9uRG93biwgQ2hldnJvblJpZ2h0LCBYLFxuICBFeWUsIEV5ZU9mZiwgU2F2ZSwgQ29kZTIsIFBhY2thZ2VDaGVjaywgVXBsb2FkQ2xvdWQsIEluZm8sXG59IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSBcIkAvaW50ZWdyYXRpb25zL3N1cGFiYXNlL2NsaWVudFwiO1xuaW1wb3J0IHsgZm9ybWF0RnVsbERhdGVUaW1lQlIsIGZvcm1hdERhdGVGdWxsQlIgfSBmcm9tIFwiQC9saWIvdGltZXpvbmVcIjtcbmltcG9ydCB7IHN0eWxlZFRvYXN0IGFzIHRvYXN0IH0gZnJvbSBcIkAvbGliL3RvYXN0XCI7XG5pbXBvcnQgSlNaaXAgZnJvbSBcImpzemlwXCI7XG5cbi8vIFRhYmxlcyBhcmUgbm93IGRpc2NvdmVyZWQgZHluYW1pY2FsbHkgYnkgdGhlIGVkZ2UgZnVuY3Rpb25zXG4vLyBUaGlzIGNvbnN0YW50IGlzIG9ubHkgdXNlZCBmb3IgZGlzcGxheSBmYWxsYmFja1xuY29uc3QgVEFCTEVTX0xBQkVMID0gXCJkaW7Dom1pY29cIjtcblxuY29uc3QgU09VUkNFX1BBVEhTID0gW1xuICAvLyBDb3JlXG4gIFwic3JjL0FwcC50c3hcIixcInNyYy9tYWluLnRzeFwiLFwic3JjL2luZGV4LmNzc1wiLFwic3JjL3ZpdGUtZW52LmQudHNcIixcbiAgLy8gUGFnZXNcbiAgXCJzcmMvcGFnZXMvQWRtaW5EYXNoYm9hcmQudHN4XCIsXCJzcmMvcGFnZXMvQXV0aC50c3hcIixcInNyYy9wYWdlcy9DaGF0QXBwLnRzeFwiLFxuICBcInNyYy9wYWdlcy9DbGllbnRlUG9ydGFsLnRzeFwiLFwic3JjL3BhZ2VzL0xhbmRpbmdQYWdlLnRzeFwiLFwic3JjL3BhZ2VzL05vdEZvdW5kLnRzeFwiLFxuICBcInNyYy9wYWdlcy9QcmluY2lwYWwudHN4XCIsXCJzcmMvcGFnZXMvUmVjYXJnYVB1YmxpY2EudHN4XCIsXCJzcmMvcGFnZXMvUmV2ZW5kZWRvclBhaW5lbC50c3hcIixcInNyYy9wYWdlcy9NYWludGVuYW5jZVBhZ2UudHN4XCIsXG4gIFwic3JjL3BhZ2VzL1Jlc2V0UGFzc3dvcmQudHN4XCIsXCJzcmMvcGFnZXMvVGVsZWdyYW1NaW5pQXBwLnRzeFwiLFwic3JjL3BhZ2VzL1VzZXJQcm9maWxlLnRzeFwiLFwic3JjL3BhZ2VzL0luc3RhbGxBcHAudHN4XCIsXG4gIC8vIENvbXBvbmVudHNcbiAgXCJzcmMvY29tcG9uZW50cy9BbmltYXRlZENoZWNrLnRzeFwiLFwic3JjL2NvbXBvbmVudHMvQW5pbWF0ZWRJY29uLnRzeFwiLFwic3JjL2NvbXBvbmVudHMvQW5pbWF0ZWRQYWdlLnRzeFwiLFxuICBcInNyYy9jb21wb25lbnRzL0FuaW1hdGVkQ291bnRlci50c3hcIixcInNyYy9jb21wb25lbnRzL0F1ZGl0VGFiLnRzeFwiLFwic3JjL2NvbXBvbmVudHMvQmFja3VwU2VjdGlvbi50c3hcIixcInNyYy9jb21wb25lbnRzL0JyYW5kZWRRUkNvZGUudHN4XCIsXG4gIFwic3JjL2NvbXBvbmVudHMvQnJvYWRjYXN0Rm9ybS50c3hcIixcInNyYy9jb21wb25lbnRzL0Jyb2FkY2FzdFByb2dyZXNzLnRzeFwiLFxuICBcInNyYy9jb21wb25lbnRzL0Jhbm5lcnNNYW5hZ2VyLnRzeFwiLFwic3JjL2NvbXBvbmVudHMvRmxvYXRpbmdQb2xsLnRzeFwiLFxuICBcInNyYy9jb21wb25lbnRzL0ltYWdlQ3JvcHBlci50c3hcIixcInNyYy9jb21wb25lbnRzL01vYmlsZUJvdHRvbU5hdi50c3hcIixcbiAgXCJzcmMvY29tcG9uZW50cy9Ob3RpZmljYXRpb25CZWxsLnRzeFwiLFwic3JjL2NvbXBvbmVudHMvUGluUHJvdGVjdGlvbi50c3hcIixcbiAgXCJzcmMvY29tcG9uZW50cy9Qb2xsTWFuYWdlci50c3hcIixcInNyYy9jb21wb25lbnRzL1BvcHVwQmFubmVyLnRzeFwiLFwic3JjL2NvbXBvbmVudHMvUHJvZmlsZVRhYi50c3hcIixcbiAgXCJzcmMvY29tcG9uZW50cy9Qcm9tb0Jhbm5lci50c3hcIixcInNyYy9jb21wb25lbnRzL1Byb3RlY3RlZFJvdXRlLnRzeFwiLFwic3JjL2NvbXBvbmVudHMvUHVsbFRvUmVmcmVzaC50c3hcIixcbiAgXCJzcmMvY29tcG9uZW50cy9SZWFsdGltZURhc2hib2FyZC50c3hcIixcInNyYy9jb21wb25lbnRzL1JlY2FyZ2FSZWNlaXB0LnRzeFwiLFxuICBcInNyYy9jb21wb25lbnRzL1JlY2FyZ2FzVGlja2VyLnRzeFwiLFwic3JjL2NvbXBvbmVudHMvU2tlbGV0b24udHN4XCIsXG4gIFwic3JjL2NvbXBvbmVudHMvU3BsYXNoU2NyZWVuLnRzeFwiLFwic3JjL2NvbXBvbmVudHMvVGhlbWVUb2dnbGUudHN4XCIsXG4gIFwic3JjL2NvbXBvbmVudHMvVmVyaWZpY2F0aW9uQmFkZ2UudHN4XCIsXCJzcmMvY29tcG9uZW50cy9TZWFzb25hbEVmZmVjdHMudHN4XCIsXG4gIC8vIENoYXQgY29tcG9uZW50c1xuICBcInNyYy9jb21wb25lbnRzL2NoYXQvQ2hhdFBhZ2UudHN4XCIsXCJzcmMvY29tcG9uZW50cy9jaGF0L0NoYXRXaW5kb3cudHN4XCIsXG4gIFwic3JjL2NvbXBvbmVudHMvY2hhdC9Db252ZXJzYXRpb25MaXN0LnRzeFwiLFwic3JjL2NvbXBvbmVudHMvY2hhdC9NZXNzYWdlQnViYmxlLnRzeFwiLFxuICBcInNyYy9jb21wb25lbnRzL2NoYXQvRW1vamlQaWNrZXIudHN4XCIsXCJzcmMvY29tcG9uZW50cy9jaGF0L0F1ZGlvUmVjb3JkZXIudHN4XCIsXG4gIFwic3JjL2NvbXBvbmVudHMvY2hhdC9OZXdDaGF0TW9kYWwudHN4XCIsXCJzcmMvY29tcG9uZW50cy9jaGF0L01lc3NhZ2VJbmZvTW9kYWwudHN4XCIsXG4gIFwic3JjL2NvbXBvbmVudHMvY2hhdC9Vc2VyUmVjYXJnYXNNb2RhbC50c3hcIixcInNyYy9jb21wb25lbnRzL2NoYXQvTWVudGlvbkRyb3Bkb3duLnRzeFwiLFxuICBcInNyYy9jb21wb25lbnRzL0NoYXRSb29tTWFuYWdlci50c3hcIixcbiAgLy8gSG9va3NcbiAgXCJzcmMvaG9va3MvdXNlQXV0aC50c3hcIixcInNyYy9ob29rcy91c2VBc3luYy50c1wiLFwic3JjL2hvb2tzL3VzZUJhY2tncm91bmRQYXltZW50TW9uaXRvci50c1wiLFxuICBcInNyYy9ob29rcy91c2VDYWNoZUNsZWFudXAudHNcIixcInNyYy9ob29rcy91c2VDaGF0LnRzXCIsXCJzcmMvaG9va3MvdXNlQ3J1ZC50c1wiLFwic3JjL2hvb2tzL3VzZU5vdGlmaWNhdGlvbnMudHNcIixcbiAgXCJzcmMvaG9va3MvdXNlUGl4RGVwb3NpdC50c1wiLFwic3JjL2hvb2tzL3VzZVByZXNlbmNlLnRzXCIsXG4gIFwic3JjL2hvb2tzL3VzZVRoZW1lLnRzeFwiLFwic3JjL2hvb2tzL3VzZVR5cGluZ0luZGljYXRvci50c1wiLFwic3JjL2hvb2tzL3VzZVB1c2hOb3RpZmljYXRpb25zLnRzXCIsXCJzcmMvaG9va3MvdXNlU2Vhc29uYWxUaGVtZS50c1wiLFxuICAvLyBMaWJzXG4gIFwic3JjL2xpYi9hdWRpdExvZy50c1wiLFwic3JjL2xpYi9jb25maXJtLnRzeFwiLFwic3JjL2xpYi9mZXRjaEFsbC50c1wiLFwic3JjL2xpYi9wYXltZW50LnRzXCIsXCJzcmMvbGliL3NvdW5kcy50c1wiLFxuICBcInNyYy9saWIvdGltZXpvbmUudHNcIixcInNyYy9saWIvdG9hc3QudHN4XCIsXCJzcmMvbGliL3V0aWxzLnRzXCIsXG4gIC8vIFR5cGVzXG4gIFwic3JjL3R5cGVzL2luZGV4LnRzXCIsXG4gIC8vIEludGVncmF0aW9uc1xuICBcInNyYy9pbnRlZ3JhdGlvbnMvc3VwYWJhc2UvY2xpZW50LnRzXCIsXCJzcmMvaW50ZWdyYXRpb25zL3N1cGFiYXNlL3R5cGVzLnRzXCIsXG4gIC8vIENvbmZpZ1xuICBcInRhaWx3aW5kLmNvbmZpZy50c1wiLFwidHNjb25maWcuanNvblwiLFwidHNjb25maWcubm9kZS5qc29uXCIsXCJ2aXRlLmNvbmZpZy50c1wiLFxuICBcInBvc3Rjc3MuY29uZmlnLmpzXCIsXCJpbmRleC5odG1sXCIsXCJwYWNrYWdlLmpzb25cIixcIlJFQURNRS5tZFwiLFxuICAvLyBQV0FcbiAgXCJwdWJsaWMvc3ctcHVzaC5qc1wiLFxuICAvLyBFZGdlIEZ1bmN0aW9uc1xuICBcInN1cGFiYXNlL2Z1bmN0aW9ucy9hZG1pbi1jcmVhdGUtdXNlci9pbmRleC50c1wiLFwic3VwYWJhc2UvZnVuY3Rpb25zL2FkbWluLWRlbGV0ZS11c2VyL2luZGV4LnRzXCIsXG4gIFwic3VwYWJhc2UvZnVuY3Rpb25zL2FkbWluLXRvZ2dsZS1yb2xlL2luZGV4LnRzXCIsXG4gIFwic3VwYWJhc2UvZnVuY3Rpb25zL2F1dGgtZW1haWwtaG9vay9pbmRleC50c1wiLFxuICBcInN1cGFiYXNlL2Z1bmN0aW9ucy9iYWNrdXAtZXhwb3J0L2luZGV4LnRzXCIsXCJzdXBhYmFzZS9mdW5jdGlvbnMvYmFja3VwLXJlc3RvcmUvaW5kZXgudHNcIixcbiAgXCJzdXBhYmFzZS9mdW5jdGlvbnMvY2xpZW50LXJlZ2lzdGVyL2luZGV4LnRzXCIsXCJzdXBhYmFzZS9mdW5jdGlvbnMvY3JlYXRlLXBpeC9pbmRleC50c1wiLFxuICBcInN1cGFiYXNlL2Z1bmN0aW9ucy9jbGVhbnVwLXN0dWNrLWJyb2FkY2FzdHMvaW5kZXgudHNcIixcInN1cGFiYXNlL2Z1bmN0aW9ucy9lZmktc2V0dXAvaW5kZXgudHNcIixcbiAgXCJzdXBhYmFzZS9mdW5jdGlvbnMvZXhwaXJlLXBlbmRpbmctZGVwb3NpdHMvaW5kZXgudHNcIixcbiAgXCJzdXBhYmFzZS9mdW5jdGlvbnMvZ2l0aHViLXN5bmMvaW5kZXgudHNcIixcInN1cGFiYXNlL2Z1bmN0aW9ucy9waXgtd2ViaG9vay9pbmRleC50c1wiLFxuICBcInN1cGFiYXNlL2Z1bmN0aW9ucy9yZWNhcmdhLWV4cHJlc3MvaW5kZXgudHNcIixcInN1cGFiYXNlL2Z1bmN0aW9ucy9zZW5kLWJyb2FkY2FzdC9pbmRleC50c1wiLFxuICBcInN1cGFiYXNlL2Z1bmN0aW9ucy9zeW5jLXBlbmRpbmctcmVjYXJnYXMvaW5kZXgudHNcIixcInN1cGFiYXNlL2Z1bmN0aW9ucy9zZW5kLXB1c2gvaW5kZXgudHNcIixcbiAgXCJzdXBhYmFzZS9mdW5jdGlvbnMvdGVsZWdyYW0tYm90L2luZGV4LnRzXCIsXCJzdXBhYmFzZS9mdW5jdGlvbnMvdGVsZWdyYW0tbWluaWFwcC9pbmRleC50c1wiLFxuICBcInN1cGFiYXNlL2Z1bmN0aW9ucy90ZWxlZ3JhbS1ub3RpZnkvaW5kZXgudHNcIixcInN1cGFiYXNlL2Z1bmN0aW9ucy90ZWxlZ3JhbS1zZXR1cC9pbmRleC50c1wiLFxuICBcInN1cGFiYXNlL2Z1bmN0aW9ucy92YXBpZC1zZXR1cC9pbmRleC50c1wiLFxuICAvLyBFbWFpbCB0ZW1wbGF0ZXNcbiAgXCJzdXBhYmFzZS9mdW5jdGlvbnMvX3NoYXJlZC9lbWFpbC10ZW1wbGF0ZXMvc2lnbnVwLnRzeFwiLFxuICBcInN1cGFiYXNlL2Z1bmN0aW9ucy9fc2hhcmVkL2VtYWlsLXRlbXBsYXRlcy9yZWNvdmVyeS50c3hcIixcbiAgXCJzdXBhYmFzZS9mdW5jdGlvbnMvX3NoYXJlZC9lbWFpbC10ZW1wbGF0ZXMvbWFnaWMtbGluay50c3hcIixcbiAgXCJzdXBhYmFzZS9mdW5jdGlvbnMvX3NoYXJlZC9lbWFpbC10ZW1wbGF0ZXMvaW52aXRlLnRzeFwiLFxuICBcInN1cGFiYXNlL2Z1bmN0aW9ucy9fc2hhcmVkL2VtYWlsLXRlbXBsYXRlcy9lbWFpbC1jaGFuZ2UudHN4XCIsXG4gIFwic3VwYWJhc2UvZnVuY3Rpb25zL19zaGFyZWQvZW1haWwtdGVtcGxhdGVzL3JlYXV0aGVudGljYXRpb24udHN4XCIsXG4gIC8vIFN1cGFiYXNlIGNvbmZpZ1xuICBcInN1cGFiYXNlL2NvbmZpZy50b21sXCIsXG5dO1xuXG50eXBlIFRhYktleSA9IFwiZGFkb3NcIiB8IFwiZ2l0aHViXCIgfCBcImF0dWFsaXphY2FvXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEJhY2t1cFNlY3Rpb24oKSB7XG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZTxUYWJLZXk+KFwiZGFkb3NcIik7XG4gIGNvbnN0IFtpbmNsdWRlRGIsIHNldEluY2x1ZGVEYl0gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW2luY2x1ZGVTb3VyY2UsIHNldEluY2x1ZGVTb3VyY2VdID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtleHBvcnRpbmcsIHNldEV4cG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtleHBvcnRQcm9ncmVzcywgc2V0RXhwb3J0UHJvZ3Jlc3NdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtleHBvcnRTdGFnZSwgc2V0RXhwb3J0U3RhZ2VdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtpbXBvcnRpbmcsIHNldEltcG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtyZXN0b3JlUmVzdWx0LCBzZXRSZXN0b3JlUmVzdWx0XSA9IHVzZVN0YXRlPGFueT4obnVsbCk7XG4gIGNvbnN0IGZpbGVJbnB1dFJlZiA9IHVzZVJlZjxIVE1MSW5wdXRFbGVtZW50PihudWxsKTtcblxuICAvLyBHaXRIdWIgc3luY1xuICBjb25zdCBbcmVwb3MsIHNldFJlcG9zXSA9IHVzZVN0YXRlPGFueVtdPihbXSk7XG4gIGNvbnN0IFtsb2FkaW5nUmVwb3MsIHNldExvYWRpbmdSZXBvc10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtzZWxlY3RlZFJlcG8sIHNldFNlbGVjdGVkUmVwb10gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW3N5bmNpbmcsIHNldFN5bmNpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc3luY1Jlc3VsdCwgc2V0U3luY1Jlc3VsdF0gPSB1c2VTdGF0ZTxhbnk+KG51bGwpO1xuICBjb25zdCBbc3luY1Byb2dyZXNzLCBzZXRTeW5jUHJvZ3Jlc3NdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtzeW5jU3RhZ2UsIHNldFN5bmNTdGFnZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW3N5bmNMb2csIHNldFN5bmNMb2ddID0gdXNlU3RhdGU8eyBwYXRoOiBzdHJpbmc7IHN0YXR1czogXCJva1wiIHwgXCJlcnJvclwiIHwgXCJwZW5kaW5nXCI7IGVycm9yPzogc3RyaW5nIH1bXT4oW10pO1xuICBjb25zdCBzeW5jTG9nUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcblxuICAvLyBVcGRhdGUgc3lzdGVtXG4gIGNvbnN0IFt1cGRhdGVFeHBvcnRpbmcsIHNldFVwZGF0ZUV4cG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFt1cGRhdGVFeHBvcnRQcm9ncmVzcywgc2V0VXBkYXRlRXhwb3J0UHJvZ3Jlc3NdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFt1cGRhdGVFeHBvcnRTdGFnZSwgc2V0VXBkYXRlRXhwb3J0U3RhZ2VdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFt1cGRhdGVJbXBvcnRpbmcsIHNldFVwZGF0ZUltcG9ydGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFt1cGRhdGVJbXBvcnRQcm9ncmVzcywgc2V0VXBkYXRlSW1wb3J0UHJvZ3Jlc3NdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFt1cGRhdGVJbXBvcnRTdGFnZSwgc2V0VXBkYXRlSW1wb3J0U3RhZ2VdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFt1cGRhdGVSZXN1bHQsIHNldFVwZGF0ZVJlc3VsdF0gPSB1c2VTdGF0ZTxhbnk+KG51bGwpO1xuICBjb25zdCBbY3VycmVudFZlcnNpb24sIHNldEN1cnJlbnRWZXJzaW9uXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCB1cGRhdGVGaWxlSW5wdXRSZWYgPSB1c2VSZWY8SFRNTElucHV0RWxlbWVudD4obnVsbCk7XG5cbiAgLy8gUGVuZGluZyB1cGRhdGUgc3RhdGUgKHVzZWQgYnkgY29uZmlybU1vZGFsKVxuICBjb25zdCBbcGVuZGluZ1VwZGF0ZUZpbGUsIHNldFBlbmRpbmdVcGRhdGVGaWxlXSA9IHVzZVN0YXRlPEZpbGUgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3BlbmRpbmdNYW5pZmVzdCwgc2V0UGVuZGluZ01hbmlmZXN0XSA9IHVzZVN0YXRlPGFueT4obnVsbCk7XG5cbiAgLy8gVXBkYXRlIGhpc3RvcnlcbiAgY29uc3QgW3VwZGF0ZUhpc3RvcnksIHNldFVwZGF0ZUhpc3RvcnldID0gdXNlU3RhdGU8YW55W10+KFtdKTtcbiAgY29uc3QgW3Nob3dIaXN0b3J5LCBzZXRTaG93SGlzdG9yeV0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgLy8gR2VuZXJpYyBjb25maXJtYXRpb24gbW9kYWwgKHVuaWZpZWQgZm9yIGFsbCBjb25maXJtYXRpb25zKVxuICBjb25zdCBbY29uZmlybU1vZGFsLCBzZXRDb25maXJtTW9kYWxdID0gdXNlU3RhdGU8e1xuICAgIG9wZW46IGJvb2xlYW47XG4gICAgdGl0bGU6IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIGRldGFpbHM/OiBzdHJpbmdbXTtcbiAgICBpY29uPzogXCJzeW5jXCIgfCBcInJlc3RvcmVcIiB8IFwidXBkYXRlXCI7XG4gICAgb25Db25maXJtOiAoKSA9PiB2b2lkO1xuICB9Pih7IG9wZW46IGZhbHNlLCB0aXRsZTogXCJcIiwgZGVzY3JpcHRpb246IFwiXCIsIG9uQ29uZmlybTogKCkgPT4ge30gfSk7XG4gIC8vIEdpdEh1YiBQQVRcbiAgY29uc3QgW2dpdGh1YlBhdCwgc2V0R2l0aHViUGF0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbc2hvd1BhdCwgc2V0U2hvd1BhdF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtzYXZpbmdQYXQsIHNldFNhdmluZ1BhdF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtwYXRMb2FkZWQsIHNldFBhdExvYWRlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgLy8gRHluYW1pYyBzb3VyY2UgcGF0aHMgbWFuaWZlc3RcbiAgY29uc3QgW2R5bmFtaWNQYXRocywgc2V0RHluYW1pY1BhdGhzXSA9IHVzZVN0YXRlPHN0cmluZ1tdIHwgbnVsbD4obnVsbCk7XG5cbiAgLy8gSW50ZWdyaXR5IGNoZWNrXG4gIGNvbnN0IFtpbnRlZ3JpdHlDaGVja2luZywgc2V0SW50ZWdyaXR5Q2hlY2tpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbaW50ZWdyaXR5UmVzdWx0LCBzZXRJbnRlZ3JpdHlSZXN1bHRdID0gdXNlU3RhdGU8eyBtaXNzaW5nOiBzdHJpbmdbXTsgZm91bmQ6IG51bWJlcjsgdG90YWw6IG51bWJlciB9IHwgbnVsbD4obnVsbCk7XG5cbiAgLy8gRWZmZWN0aXZlIHBhdGhzOiBkeW5hbWljIGZyb20gREIgaWYgYXZhaWxhYmxlLCBvdGhlcndpc2UgaGFyZGNvZGVkIGZhbGxiYWNrXG4gIGNvbnN0IGVmZmVjdGl2ZVBhdGhzID0gZHluYW1pY1BhdGhzIHx8IFNPVVJDRV9QQVRIUztcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGxvYWRQYXQgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKFwic3lzdGVtX2NvbmZpZ1wiKVxuICAgICAgICAuc2VsZWN0KFwidmFsdWVcIilcbiAgICAgICAgLmVxKFwia2V5XCIsIFwiZ2l0aHViUGF0XCIpXG4gICAgICAgIC5tYXliZVNpbmdsZSgpO1xuICAgICAgaWYgKGRhdGE/LnZhbHVlKSBzZXRHaXRodWJQYXQoZGF0YS52YWx1ZSk7XG4gICAgICBzZXRQYXRMb2FkZWQodHJ1ZSk7XG4gICAgfTtcbiAgICBjb25zdCBsb2FkTWFuaWZlc3QgPSBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKFwic3lzdGVtX2NvbmZpZ1wiKVxuICAgICAgICAuc2VsZWN0KFwidmFsdWVcIilcbiAgICAgICAgLmVxKFwia2V5XCIsIFwic291cmNlX3BhdGhzX21hbmlmZXN0XCIpXG4gICAgICAgIC5tYXliZVNpbmdsZSgpO1xuICAgICAgaWYgKGRhdGE/LnZhbHVlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcGF0aHMgPSBKU09OLnBhcnNlKGRhdGEudmFsdWUpO1xuICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBhdGhzKSAmJiBwYXRocy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzZXREeW5hbWljUGF0aHMocGF0aHMpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coYFtCYWNrdXBdIE1hbmlmZXN0byBkaW7Dom1pY28gY2FycmVnYWRvOiAke3BhdGhzLmxlbmd0aH0gYXJxdWl2b3NgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggeyAvKiBmYWxsYmFjayB0byBoYXJkY29kZWQgKi8gfVxuICAgICAgfVxuICAgIH07XG4gICAgbG9hZFBhdCgpO1xuICAgIGxvYWRNYW5pZmVzdCgpO1xuICB9LCBbXSk7XG5cbiAgLy8gTG9hZCBjdXJyZW50IHN5c3RlbSB2ZXJzaW9uICsgdXBkYXRlIGhpc3RvcnlcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBsb2FkVmVyc2lvbiA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgLmZyb20oXCJzeXN0ZW1fY29uZmlnXCIpXG4gICAgICAgIC5zZWxlY3QoXCJ2YWx1ZVwiKVxuICAgICAgICAuZXEoXCJrZXlcIiwgXCJzeXN0ZW1fdmVyc2lvblwiKVxuICAgICAgICAubWF5YmVTaW5nbGUoKTtcbiAgICAgIHNldEN1cnJlbnRWZXJzaW9uKGRhdGE/LnZhbHVlIHx8IFwiMS4wLjBcIik7XG4gICAgfTtcbiAgICBjb25zdCBsb2FkSGlzdG9yeSA9IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgLmZyb20oXCJ1cGRhdGVfaGlzdG9yeVwiKVxuICAgICAgICAuc2VsZWN0KFwiKlwiKVxuICAgICAgICAub3JkZXIoXCJhcHBsaWVkX2F0XCIsIHsgYXNjZW5kaW5nOiBmYWxzZSB9KVxuICAgICAgICAubGltaXQoMjApO1xuICAgICAgaWYgKGRhdGEpIHNldFVwZGF0ZUhpc3RvcnkoZGF0YSk7XG4gICAgfTtcbiAgICBsb2FkVmVyc2lvbigpO1xuICAgIGxvYWRIaXN0b3J5KCk7XG4gIH0sIFtdKTtcblxuICBjb25zdCBzYXZlR2l0aHViUGF0ID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldFNhdmluZ1BhdCh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgLmZyb20oXCJzeXN0ZW1fY29uZmlnXCIpXG4gICAgICAgIC51cHNlcnQoeyBrZXk6IFwiZ2l0aHViUGF0XCIsIHZhbHVlOiBnaXRodWJQYXQgfSwgeyBvbkNvbmZsaWN0OiBcImtleVwiIH0pO1xuICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcbiAgICAgIHRvYXN0LnN1Y2Nlc3MoXCJHaXRIdWIgUEFUIHNhbHZvIVwiKTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgdG9hc3QuZXJyb3IoYEVycm86ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgfVxuICAgIHNldFNhdmluZ1BhdChmYWxzZSk7XG4gIH07XG5cbiAgY29uc3QgbG9hZFJlcG9zID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldExvYWRpbmdSZXBvcyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhOiB7IHNlc3Npb24gfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRTZXNzaW9uKCk7XG4gICAgICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcihcIlNlc3PDo28gZXhwaXJhZGFcIik7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goXG4gICAgICAgIGAke2ltcG9ydC5tZXRhLmVudi5WSVRFX1NVUEFCQVNFX1VSTH0vZnVuY3Rpb25zL3YxL2dpdGh1Yi1zeW5jP2FjdGlvbj1saXN0LXJlcG9zYCxcbiAgICAgICAgeyBoZWFkZXJzOiB7IEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHtzZXNzaW9uLmFjY2Vzc190b2tlbn1gLCBhcGlrZXk6IGltcG9ydC5tZXRhLmVudi5WSVRFX1NVUEFCQVNFX1BVQkxJU0hBQkxFX0tFWSB9IH1cbiAgICAgICk7XG4gICAgICBpZiAoIXJlc3Aub2spIHsgY29uc3QgZXJyID0gYXdhaXQgcmVzcC5qc29uKCkuY2F0Y2goKCkgPT4gKHsgZXJyb3I6IFwiRXJyb1wiIH0pKTsgdGhyb3cgbmV3IEVycm9yKGVyci5lcnJvciB8fCBgSFRUUCAke3Jlc3Auc3RhdHVzfWApOyB9XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICBzZXRSZXBvcyhkYXRhKTtcbiAgICAgIGlmIChkYXRhLmxlbmd0aCA+IDAgJiYgIXNlbGVjdGVkUmVwbykgc2V0U2VsZWN0ZWRSZXBvKGRhdGFbMF0uZnVsbF9uYW1lKTtcbiAgICAgIHRvYXN0LnN1Y2Nlc3MoYCR7ZGF0YS5sZW5ndGh9IHJlcG9zaXTDs3Jpb3MgZW5jb250cmFkb3NgKTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkgeyB0b2FzdC5lcnJvcihgRXJybzogJHtlcnIubWVzc2FnZX1gKTsgfVxuICAgIHNldExvYWRpbmdSZXBvcyhmYWxzZSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlR2l0SHViU3luYyA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXNlbGVjdGVkUmVwbykgeyB0b2FzdC5lcnJvcihcIlNlbGVjaW9uZSB1bSByZXBvc2l0w7NyaW9cIik7IHJldHVybjsgfVxuICAgIHNldENvbmZpcm1Nb2RhbCh7XG4gICAgICBvcGVuOiB0cnVlLFxuICAgICAgdGl0bGU6IFwiU2luY3Jvbml6YXIgY29tIEdpdEh1YlwiLFxuICAgICAgZGVzY3JpcHRpb246IGBFbnZpYXIgdG9kb3Mgb3MgYXJxdWl2b3MgZG8gcHJvamV0byBwYXJhIG8gcmVwb3NpdMOzcmlvICR7c2VsZWN0ZWRSZXBvfT9gLFxuICAgICAgZGV0YWlsczogW1wiUMOhZ2luYXMgZSBjb21wb25lbnRlc1wiLCBcIkhvb2tzIGUgYmlibGlvdGVjYXNcIiwgXCJFZGdlIEZ1bmN0aW9uc1wiLCBcIkNvbmZpZ3VyYcOnw7Vlc1wiXSxcbiAgICAgIGljb246IFwic3luY1wiLFxuICAgICAgb25Db25maXJtOiAoKSA9PiB7IHNldENvbmZpcm1Nb2RhbChwcmV2ID0+ICh7IC4uLnByZXYsIG9wZW46IGZhbHNlIH0pKTsgZXhlY3V0ZUdpdEh1YlN5bmMoKTsgfSxcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBleGVjdXRlR2l0SHViU3luYyA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRTeW5jaW5nKHRydWUpOyBzZXRTeW5jUmVzdWx0KG51bGwpOyBzZXRTeW5jUHJvZ3Jlc3MoMCk7IHNldFN5bmNTdGFnZShcIkNvbGV0YW5kbyBhcnF1aXZvcy4uLlwiKTsgc2V0U3luY0xvZyhbXSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZGF0YTogeyBzZXNzaW9uIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0U2Vzc2lvbigpO1xuICAgICAgaWYgKCFzZXNzaW9uKSB0aHJvdyBuZXcgRXJyb3IoXCJTZXNzw6NvIGV4cGlyYWRhXCIpO1xuICAgICAgY29uc3QgYWxsUGF0aHMgPSBlZmZlY3RpdmVQYXRocztcbiAgICAgIGNvbnN0IGZpbGVzOiB7IHBhdGg6IHN0cmluZzsgY29udGVudDogc3RyaW5nIH1bXSA9IFtdO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxQYXRocy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzZXRTeW5jU3RhZ2UoYENvbGV0YW5kbyAke2kgKyAxfS8ke2FsbFBhdGhzLmxlbmd0aH0uLi5gKTtcbiAgICAgICAgc2V0U3luY1Byb2dyZXNzKE1hdGgucm91bmQoKGkgLyBhbGxQYXRocy5sZW5ndGgpICogMjApKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByID0gYXdhaXQgZmV0Y2gobmV3IFVSTChgLyR7YWxsUGF0aHNbaV19YCwgd2luZG93LmxvY2F0aW9uLm9yaWdpbikuaHJlZik7XG4gICAgICAgICAgaWYgKHIub2spIHsgY29uc3QgdGV4dCA9IGF3YWl0IHIudGV4dCgpOyBpZiAodGV4dCAmJiB0ZXh0Lmxlbmd0aCA+IDEwKSBmaWxlcy5wdXNoKHsgcGF0aDogYWxsUGF0aHNbaV0sIGNvbnRlbnQ6IHRleHQgfSk7IH1cbiAgICAgICAgfSBjYXRjaCB7IC8qIHNraXAgKi8gfVxuICAgICAgfVxuICAgICAgaWYgKGZpbGVzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKFwiTmVuaHVtIGFycXVpdm8gY29sZXRhZG9cIik7XG4gICAgICBzZXRTeW5jU3RhZ2UoYCR7ZmlsZXMubGVuZ3RofSBhcnF1aXZvcyBjb2xldGFkb3MuIEVudmlhbmRvLi4uYCk7IHNldFN5bmNQcm9ncmVzcygyMCk7XG4gICAgICBjb25zdCBpbml0aWFsTG9nID0gZmlsZXMubWFwKGYgPT4gKHsgcGF0aDogZi5wYXRoLCBzdGF0dXM6IFwicGVuZGluZ1wiIGFzIGNvbnN0IH0pKTtcbiAgICAgIHNldFN5bmNMb2coaW5pdGlhbExvZyk7XG4gICAgICBjb25zdCByZXBvID0gcmVwb3MuZmluZCgocjogYW55KSA9PiByLmZ1bGxfbmFtZSA9PT0gc2VsZWN0ZWRSZXBvKTtcbiAgICAgIGNvbnN0IHRhcmdldEJyYW5jaCA9IHJlcG8/LmRlZmF1bHRfYnJhbmNoIHx8IFwibWFpblwiO1xuICAgICAgY29uc3QgQkFUQ0hfU0laRSA9IDU7XG4gICAgICBjb25zdCB0b3RhbEJhdGNoZXMgPSBNYXRoLmNlaWwoZmlsZXMubGVuZ3RoIC8gQkFUQ0hfU0laRSk7XG4gICAgICBsZXQgYWxsUmVzdWx0czogYW55W10gPSBbXTtcbiAgICAgIGZvciAobGV0IGIgPSAwOyBiIDwgdG90YWxCYXRjaGVzOyBiKyspIHtcbiAgICAgICAgY29uc3QgYmF0Y2hGaWxlcyA9IGZpbGVzLnNsaWNlKGIgKiBCQVRDSF9TSVpFLCAoYiArIDEpICogQkFUQ0hfU0laRSk7XG4gICAgICAgIHNldFN5bmNTdGFnZShgTG90ZSAke2IgKyAxfS8ke3RvdGFsQmF0Y2hlc30gKCR7TWF0aC5taW4oKGIgKyAxKSAqIEJBVENIX1NJWkUsIGZpbGVzLmxlbmd0aCl9LyR7ZmlsZXMubGVuZ3RofSlgKTtcbiAgICAgICAgc2V0U3luY1Byb2dyZXNzKDIwICsgTWF0aC5yb3VuZCgoYiAvIHRvdGFsQmF0Y2hlcykgKiA3NSkpO1xuICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goYCR7aW1wb3J0Lm1ldGEuZW52LlZJVEVfU1VQQUJBU0VfVVJMfS9mdW5jdGlvbnMvdjEvZ2l0aHViLXN5bmM/YWN0aW9uPXN5bmNgLCB7XG4gICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLCBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7c2Vzc2lvbi5hY2Nlc3NfdG9rZW59YCwgYXBpa2V5OiBpbXBvcnQubWV0YS5lbnYuVklURV9TVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVkgfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHJlcG86IHNlbGVjdGVkUmVwbywgYnJhbmNoOiB0YXJnZXRCcmFuY2gsIGZpbGVzOiBiYXRjaEZpbGVzIH0pLFxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICAgIGlmICghcmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCBgSFRUUCAke3Jlc3Auc3RhdHVzfWApO1xuICAgICAgICBjb25zdCBiYXRjaFJlc3VsdHMgPSByZXN1bHQucmVzdWx0cyB8fCBbXTtcbiAgICAgICAgYWxsUmVzdWx0cyA9IFsuLi5hbGxSZXN1bHRzLCAuLi5iYXRjaFJlc3VsdHNdO1xuICAgICAgICBzZXRTeW5jTG9nKHByZXYgPT4ge1xuICAgICAgICAgIGNvbnN0IHVwZGF0ZWQgPSBbLi4ucHJldl07XG4gICAgICAgICAgZm9yIChjb25zdCByIG9mIGJhdGNoUmVzdWx0cykgeyBjb25zdCBpZHggPSB1cGRhdGVkLmZpbmRJbmRleChsID0+IGwucGF0aCA9PT0gci5wYXRoKTsgaWYgKGlkeCA+PSAwKSB1cGRhdGVkW2lkeF0gPSB7IHBhdGg6IHIucGF0aCwgc3RhdHVzOiByLnN0YXR1cyA9PT0gXCJva1wiID8gXCJva1wiIDogXCJlcnJvclwiLCBlcnJvcjogci5lcnJvciB9OyB9XG4gICAgICAgICAgcmV0dXJuIHVwZGF0ZWQ7XG4gICAgICAgIH0pO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgc3luY0xvZ1JlZi5jdXJyZW50Py5zY3JvbGxUbyh7IHRvcDogc3luY0xvZ1JlZi5jdXJyZW50LnNjcm9sbEhlaWdodCwgYmVoYXZpb3I6IFwic21vb3RoXCIgfSk7IH0sIDEwMCk7XG4gICAgICB9XG4gICAgICBjb25zdCBva0NvdW50ID0gYWxsUmVzdWx0cy5maWx0ZXIociA9PiByLnN0YXR1cyA9PT0gXCJva1wiKS5sZW5ndGg7XG4gICAgICBjb25zdCBlcnJDb3VudCA9IGFsbFJlc3VsdHMuZmlsdGVyKHIgPT4gci5zdGF0dXMgIT09IFwib2tcIikubGVuZ3RoO1xuICAgICAgc2V0U3luY1Byb2dyZXNzKDEwMCk7XG4gICAgICBzZXRTeW5jU3RhZ2UoYENvbmNsdcOtZG8hICR7b2tDb3VudH0gZW52aWFkb3Mke2VyckNvdW50ID4gMCA/IGAsICR7ZXJyQ291bnR9IGVycm9zYCA6IFwiXCJ9YCk7XG4gICAgICBzZXRTeW5jUmVzdWx0KHsgcmVwbzogc2VsZWN0ZWRSZXBvLCBicmFuY2g6IHRhcmdldEJyYW5jaCwgcmVzdWx0czogYWxsUmVzdWx0cyB9KTtcbiAgICAgIHRvYXN0LnN1Y2Nlc3MoYCR7b2tDb3VudH0gYXJxdWl2b3Mgc2luY3Jvbml6YWRvcyBjb20gR2l0SHViIWApO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7IHRvYXN0LmVycm9yKGBFcnJvOiAke2Vyci5tZXNzYWdlfWApOyBzZXRTeW5jU3RhZ2UoYEVycm86ICR7ZXJyLm1lc3NhZ2V9YCk7IH1cbiAgICBzZXRTeW5jaW5nKGZhbHNlKTtcbiAgfTtcblxuXG5cbiAgY29uc3QgaGFuZGxlRXhwb3J0ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghaW5jbHVkZURiICYmICFpbmNsdWRlU291cmNlKSB7IHRvYXN0LmVycm9yKFwiU2VsZWNpb25lIHBlbG8gbWVub3MgdW1hIG9ww6fDo29cIik7IHJldHVybjsgfVxuICAgIHNldEV4cG9ydGluZyh0cnVlKTsgc2V0RXhwb3J0UHJvZ3Jlc3MoMCk7IHNldEV4cG9ydFN0YWdlKFwiSW5pY2lhbmRvLi4uXCIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGRhdGE6IHsgc2Vzc2lvbiB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFNlc3Npb24oKTtcbiAgICAgIGlmICghc2Vzc2lvbikgdGhyb3cgbmV3IEVycm9yKFwiU2Vzc8OjbyBleHBpcmFkYVwiKTtcblxuICAgICAgY29uc3QgemlwID0gbmV3IEpTWmlwKCk7XG4gICAgICBsZXQgdG90YWxTdGVwcyA9IDA7XG4gICAgICBsZXQgY3VycmVudFN0ZXAgPSAwO1xuICAgICAgaWYgKGluY2x1ZGVEYikgdG90YWxTdGVwcyArPSAxOyAvLyBEQiBleHBvcnQgPSAxIHN0ZXAgKGVkZ2UgZnVuY3Rpb24gaGFuZGxlcyBpdClcbiAgICAgIGlmIChpbmNsdWRlU291cmNlKSB0b3RhbFN0ZXBzICs9IGVmZmVjdGl2ZVBhdGhzLmxlbmd0aDtcblxuICAgICAgLy8gMS4gRGF0YWJhc2UgZXhwb3J0IHZpYSBlZGdlIGZ1bmN0aW9uXG4gICAgICBpZiAoaW5jbHVkZURiKSB7XG4gICAgICAgIHNldEV4cG9ydFN0YWdlKFwiRXhwb3J0YW5kbyBiYW5jbyBkZSBkYWRvcy4uLlwiKTtcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGAke2ltcG9ydC5tZXRhLmVudi5WSVRFX1NVUEFCQVNFX1VSTH0vZnVuY3Rpb25zL3YxL2JhY2t1cC1leHBvcnRgLCB7XG4gICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLCBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7c2Vzc2lvbi5hY2Nlc3NfdG9rZW59YCwgYXBpa2V5OiBpbXBvcnQubWV0YS5lbnYuVklURV9TVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVkgfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGluY2x1ZGVEYXRhYmFzZTogdHJ1ZSB9KSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghcmVzcC5vaykgeyBjb25zdCBlcnIgPSBhd2FpdCByZXNwLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBlcnJvcjogXCJFcnJvXCIgfSkpOyB0aHJvdyBuZXcgRXJyb3IoZXJyLmVycm9yIHx8IGBIVFRQICR7cmVzcC5zdGF0dXN9YCk7IH1cbiAgICAgICAgLy8gVGhlIGVkZ2UgZnVuY3Rpb24gcmV0dXJucyBhIFpJUCB3aXRoIGRhdGFiYXNlLyBmb2xkZXIg4oCUIGV4dHJhY3QgYW5kIHJlLWFkZCB0byBvdXIgWklQXG4gICAgICAgIGNvbnN0IGRiWmlwRGF0YSA9IGF3YWl0IHJlc3AuYXJyYXlCdWZmZXIoKTtcbiAgICAgICAgY29uc3QgZGJaaXAgPSBhd2FpdCBKU1ppcC5sb2FkQXN5bmMoZGJaaXBEYXRhKTtcbiAgICAgICAgZm9yIChjb25zdCBbcGF0aCwgZmlsZV0gb2YgT2JqZWN0LmVudHJpZXMoZGJaaXAuZmlsZXMpKSB7XG4gICAgICAgICAgaWYgKCFmaWxlLmRpcikge1xuICAgICAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZpbGUuYXN5bmMoXCJ1aW50OGFycmF5XCIpO1xuICAgICAgICAgICAgemlwLmZpbGUocGF0aCwgY29udGVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRTdGVwKys7XG4gICAgICAgIHNldEV4cG9ydFByb2dyZXNzKE1hdGgucm91bmQoKGN1cnJlbnRTdGVwIC8gdG90YWxTdGVwcykgKiAxMDApKTtcbiAgICAgIH1cblxuICAgICAgLy8gMi4gU291cmNlIGNvZGUgdmlhIGZldGNoXG4gICAgICBpZiAoaW5jbHVkZVNvdXJjZSkge1xuICAgICAgICBjb25zdCBzb3VyY2VGb2xkZXIgPSB6aXAuZm9sZGVyKFwic291cmNlXCIpO1xuICAgICAgICBsZXQgZmV0Y2hlZCA9IDA7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZWZmZWN0aXZlUGF0aHMpIHtcbiAgICAgICAgICBzZXRFeHBvcnRTdGFnZShgQ29sZXRhbmRvICR7ZmV0Y2hlZCArIDF9LyR7ZWZmZWN0aXZlUGF0aHMubGVuZ3RofTogJHtmaWxlUGF0aC5zcGxpdChcIi9cIikucG9wKCl9YCk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBhd2FpdCBmZXRjaChuZXcgVVJMKGAvJHtmaWxlUGF0aH1gLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKS5ocmVmKTtcbiAgICAgICAgICAgIGlmIChyLm9rKSB7XG4gICAgICAgICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCByLnRleHQoKTtcbiAgICAgICAgICAgICAgaWYgKHRleHQgJiYgdGV4dC5sZW5ndGggPiAxMCkge1xuICAgICAgICAgICAgICAgIHNvdXJjZUZvbGRlciEuZmlsZShmaWxlUGF0aCwgdGV4dCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICAgICAgZmV0Y2hlZCsrO1xuICAgICAgICAgIGN1cnJlbnRTdGVwKys7XG4gICAgICAgICAgc2V0RXhwb3J0UHJvZ3Jlc3MoTWF0aC5yb3VuZCgoY3VycmVudFN0ZXAgLyB0b3RhbFN0ZXBzKSAqIDEwMCkpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSBiYWNrdXAtaW5mb1xuICAgICAgemlwLmZpbGUoXCJiYWNrdXAtaW5mby5qc29uXCIsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgdmVyc2lvbjogXCIyLjBcIixcbiAgICAgICAgY3JlYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICBpbmNsdWRlX2RhdGFiYXNlOiBpbmNsdWRlRGIsXG4gICAgICAgIGluY2x1ZGVfc291cmNlOiBpbmNsdWRlU291cmNlLFxuICAgICAgICBzb3VyY2VfZmlsZXM6IGluY2x1ZGVTb3VyY2UgPyBlZmZlY3RpdmVQYXRocy5sZW5ndGggOiAwLFxuICAgICAgICB0YWJsZXM6IFwiZHluYW1pY1wiLFxuICAgICAgfSwgbnVsbCwgMikpO1xuXG4gICAgICBzZXRFeHBvcnRTdGFnZShcIkdlcmFuZG8gWklQLi4uXCIpO1xuICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHppcC5nZW5lcmF0ZUFzeW5jKHsgdHlwZTogXCJibG9iXCIsIGNvbXByZXNzaW9uOiBcIkRFRkxBVEVcIiB9KTtcbiAgICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICBjb25zdCBhID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICBhLmhyZWYgPSB1cmw7XG4gICAgICBhLmRvd25sb2FkID0gYGJhY2t1cC1yZWNhcmdhcy0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCl9LnppcGA7XG4gICAgICBhLmNsaWNrKCk7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgICBzZXRFeHBvcnRQcm9ncmVzcygxMDApO1xuICAgICAgc2V0RXhwb3J0U3RhZ2UoXCJDb25jbHXDrWRvIVwiKTtcbiAgICAgIHRvYXN0LnN1Y2Nlc3MoYEJhY2t1cCBleHBvcnRhZG8hICR7aW5jbHVkZURiID8gXCJCRCArIFwiIDogXCJcIn0ke2luY2x1ZGVTb3VyY2UgPyBcIkPDs2RpZ29cIiA6IFwiXCJ9YCk7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHsgdG9hc3QuZXJyb3IoYEVycm86ICR7ZXJyLm1lc3NhZ2V9YCk7IHNldEV4cG9ydFN0YWdlKFwiXCIpOyB9XG4gICAgc2V0RXhwb3J0aW5nKGZhbHNlKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVJbXBvcnQgPSBhc3luYyAoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICBjb25zdCBmaWxlID0gZS50YXJnZXQuZmlsZXM/LlswXTtcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcbiAgICBpZiAoIWZpbGUubmFtZS5lbmRzV2l0aChcIi56aXBcIikpIHsgdG9hc3QuZXJyb3IoXCJTZWxlY2lvbmUgdW0gYXJxdWl2byAuemlwXCIpOyByZXR1cm47IH1cbiAgICBzZXRDb25maXJtTW9kYWwoe1xuICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgIHRpdGxlOiBcIlJlc3RhdXJhciBCYWNrdXBcIixcbiAgICAgIGRlc2NyaXB0aW9uOiBcIkEgcmVzdGF1cmHDp8OjbyB2YWkgc29icmVzY3JldmVyIG9zIGRhZG9zIGF0dWFpcyBkbyBiYW5jbyBkZSBkYWRvcy5cIixcbiAgICAgIGRldGFpbHM6IFtcIlRvZG9zIG9zIGRhZG9zIHNlcsOjbyBzdWJzdGl0dcOtZG9zXCIsIFwiRXN0YSBhw6fDo28gbsOjbyBwb2RlIHNlciBkZXNmZWl0YVwiXSxcbiAgICAgIGljb246IFwicmVzdG9yZVwiLFxuICAgICAgb25Db25maXJtOiAoKSA9PiB7IHNldENvbmZpcm1Nb2RhbChwcmV2ID0+ICh7IC4uLnByZXYsIG9wZW46IGZhbHNlIH0pKTsgZXhlY3V0ZUltcG9ydChmaWxlKTsgfSxcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCBleGVjdXRlSW1wb3J0ID0gYXN5bmMgKGZpbGU6IEZpbGUpID0+IHtcbiAgICBzZXRJbXBvcnRpbmcodHJ1ZSk7IHNldFJlc3RvcmVSZXN1bHQobnVsbCk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZGF0YTogeyBzZXNzaW9uIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0U2Vzc2lvbigpO1xuICAgICAgaWYgKCFzZXNzaW9uKSB0aHJvdyBuZXcgRXJyb3IoXCJTZXNzw6NvIGV4cGlyYWRhXCIpO1xuICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCBmaWxlLmFycmF5QnVmZmVyKCk7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgZmV0Y2goYCR7aW1wb3J0Lm1ldGEuZW52LlZJVEVfU1VQQUJBU0VfVVJMfS9mdW5jdGlvbnMvdjEvYmFja3VwLXJlc3RvcmVgLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Nlc3Npb24uYWNjZXNzX3Rva2VufWAsIGFwaWtleTogaW1wb3J0Lm1ldGEuZW52LlZJVEVfU1VQQUJBU0VfUFVCTElTSEFCTEVfS0VZIH0sXG4gICAgICAgIGJvZHk6IGFycmF5QnVmZmVyLFxuICAgICAgfSk7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICAgIGlmICghcmVzcC5vaykgdGhyb3cgbmV3IEVycm9yKHJlc3VsdC5lcnJvciB8fCBgSFRUUCAke3Jlc3Auc3RhdHVzfWApO1xuICAgICAgc2V0UmVzdG9yZVJlc3VsdChyZXN1bHQpO1xuICAgICAgdG9hc3Quc3VjY2VzcyhcIkJhY2t1cCByZXN0YXVyYWRvIGNvbSBzdWNlc3NvIVwiKTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkgeyB0b2FzdC5lcnJvcihgRXJybzogJHtlcnIubWVzc2FnZX1gKTsgfVxuICAgIHNldEltcG9ydGluZyhmYWxzZSk7XG4gICAgaWYgKGZpbGVJbnB1dFJlZi5jdXJyZW50KSBmaWxlSW5wdXRSZWYuY3VycmVudC52YWx1ZSA9IFwiXCI7XG4gIH07XG5cbiAgLy8gPT09IFVQREFURSBTWVNURU0gSEFORExFUlMgPT09XG4gIGNvbnN0IGhhbmRsZVVwZGF0ZUV4cG9ydCA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRVcGRhdGVFeHBvcnRpbmcodHJ1ZSk7IHNldFVwZGF0ZUV4cG9ydFByb2dyZXNzKDApOyBzZXRVcGRhdGVFeHBvcnRTdGFnZShcIkluaWNpYW5kbyBwYWNvdGUgZGUgYXR1YWxpemHDp8Ojby4uLlwiKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhOiB7IHNlc3Npb24gfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRTZXNzaW9uKCk7XG4gICAgICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcihcIlNlc3PDo28gZXhwaXJhZGFcIik7XG5cbiAgICAgIGNvbnN0IHppcCA9IG5ldyBKU1ppcCgpO1xuICAgICAgY29uc3QgdG90YWxTdGVwcyA9IDEgKyBlZmZlY3RpdmVQYXRocy5sZW5ndGg7IC8vIERCICsgc291cmNlIGZpbGVzXG4gICAgICBsZXQgY3VycmVudFN0ZXAgPSAwO1xuXG4gICAgICAvLyAxLiBEYXRhYmFzZSBleHBvcnRcbiAgICAgIHNldFVwZGF0ZUV4cG9ydFN0YWdlKFwiRXhwb3J0YW5kbyBiYW5jbyBkZSBkYWRvcy4uLlwiKTtcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChgJHtpbXBvcnQubWV0YS5lbnYuVklURV9TVVBBQkFTRV9VUkx9L2Z1bmN0aW9ucy92MS9iYWNrdXAtZXhwb3J0YCwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLCBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7c2Vzc2lvbi5hY2Nlc3NfdG9rZW59YCwgYXBpa2V5OiBpbXBvcnQubWV0YS5lbnYuVklURV9TVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVkgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBpbmNsdWRlRGF0YWJhc2U6IHRydWUgfSksXG4gICAgICB9KTtcbiAgICAgIGlmICghcmVzcC5vaykgeyBjb25zdCBlcnIgPSBhd2FpdCByZXNwLmpzb24oKS5jYXRjaCgoKSA9PiAoeyBlcnJvcjogXCJFcnJvXCIgfSkpOyB0aHJvdyBuZXcgRXJyb3IoZXJyLmVycm9yIHx8IGBIVFRQICR7cmVzcC5zdGF0dXN9YCk7IH1cbiAgICAgIGNvbnN0IGRiWmlwRGF0YSA9IGF3YWl0IHJlc3AuYXJyYXlCdWZmZXIoKTtcbiAgICAgIGNvbnN0IGRiWmlwID0gYXdhaXQgSlNaaXAubG9hZEFzeW5jKGRiWmlwRGF0YSk7XG4gICAgICBmb3IgKGNvbnN0IFtwYXRoLCBmaWxlXSBvZiBPYmplY3QuZW50cmllcyhkYlppcC5maWxlcykpIHtcbiAgICAgICAgaWYgKCFmaWxlLmRpcikge1xuICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBhd2FpdCBmaWxlLmFzeW5jKFwidWludDhhcnJheVwiKTtcbiAgICAgICAgICB6aXAuZmlsZShwYXRoLCBjb250ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY3VycmVudFN0ZXArKztcbiAgICAgIHNldFVwZGF0ZUV4cG9ydFByb2dyZXNzKE1hdGgucm91bmQoKGN1cnJlbnRTdGVwIC8gdG90YWxTdGVwcykgKiAxMDApKTtcblxuICAgICAgLy8gMi4gU291cmNlIGNvZGVcbiAgICAgIGNvbnN0IHNvdXJjZUZvbGRlciA9IHppcC5mb2xkZXIoXCJzb3VyY2VcIik7XG4gICAgICBsZXQgZmV0Y2hlZCA9IDA7XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGVmZmVjdGl2ZVBhdGhzKSB7XG4gICAgICAgIHNldFVwZGF0ZUV4cG9ydFN0YWdlKGBDb2xldGFuZG8gJHtmZXRjaGVkICsgMX0vJHtlZmZlY3RpdmVQYXRocy5sZW5ndGh9OiAke2ZpbGVQYXRoLnNwbGl0KFwiL1wiKS5wb3AoKX1gKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByID0gYXdhaXQgZmV0Y2gobmV3IFVSTChgLyR7ZmlsZVBhdGh9YCwgd2luZG93LmxvY2F0aW9uLm9yaWdpbikuaHJlZik7XG4gICAgICAgICAgaWYgKHIub2spIHtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBhd2FpdCByLnRleHQoKTtcbiAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQubGVuZ3RoID4gMTApIHNvdXJjZUZvbGRlciEuZmlsZShmaWxlUGF0aCwgdGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHsgLyogc2tpcCAqLyB9XG4gICAgICAgIGZldGNoZWQrKztcbiAgICAgICAgY3VycmVudFN0ZXArKztcbiAgICAgICAgc2V0VXBkYXRlRXhwb3J0UHJvZ3Jlc3MoTWF0aC5yb3VuZCgoY3VycmVudFN0ZXAgLyB0b3RhbFN0ZXBzKSAqIDEwMCkpO1xuICAgICAgfVxuXG4gICAgICAvLyAzLiBHZW5lcmF0ZSB1cGRhdGUgbWFuaWZlc3Qgd2l0aCBlZmZlY3RpdmVQYXRocyBpbmNsdWRlZCBmb3IgZHluYW1pYyBkaXNjb3ZlcnlcbiAgICAgIGNvbnN0IHZlcnNpb24gPSBjdXJyZW50VmVyc2lvbiB8fCBcIjEuMC4wXCI7XG4gICAgICB6aXAuZmlsZShcInVwZGF0ZS1tYW5pZmVzdC5qc29uXCIsIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgdmVyc2lvbixcbiAgICAgICAgY3JlYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICB0YWJsZXM6IFwiZHluYW1pY1wiLFxuICAgICAgICBzb3VyY2VfZmlsZXM6IGVmZmVjdGl2ZVBhdGhzLmxlbmd0aCxcbiAgICAgICAgc291cmNlX3BhdGhzOiBlZmZlY3RpdmVQYXRocyxcbiAgICAgICAgdHlwZTogXCJmdWxsLXVwZGF0ZVwiLFxuICAgICAgfSwgbnVsbCwgMikpO1xuXG4gICAgICBzZXRVcGRhdGVFeHBvcnRTdGFnZShcIkdlcmFuZG8gcGFjb3RlIFpJUC4uLlwiKTtcbiAgICAgIGNvbnN0IGJsb2IgPSBhd2FpdCB6aXAuZ2VuZXJhdGVBc3luYyh7IHR5cGU6IFwiYmxvYlwiLCBjb21wcmVzc2lvbjogXCJERUZMQVRFXCIgfSk7XG4gICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgYS5ocmVmID0gdXJsO1xuICAgICAgYS5kb3dubG9hZCA9IGBhdHVhbGl6YWNhby12JHt2ZXJzaW9ufS0ke25ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCl9LnppcGA7XG4gICAgICBhLmNsaWNrKCk7XG4gICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHVybCk7XG4gICAgICBzZXRVcGRhdGVFeHBvcnRQcm9ncmVzcygxMDApO1xuICAgICAgc2V0VXBkYXRlRXhwb3J0U3RhZ2UoXCJQYWNvdGUgZGUgYXR1YWxpemHDp8OjbyBnZXJhZG8hXCIpO1xuICAgICAgdG9hc3Quc3VjY2VzcyhgUGFjb3RlIGRlIGF0dWFsaXphw6fDo28gdiR7dmVyc2lvbn0gZXhwb3J0YWRvIWApO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7IHRvYXN0LmVycm9yKGBFcnJvOiAke2Vyci5tZXNzYWdlfWApOyBzZXRVcGRhdGVFeHBvcnRTdGFnZShcIlwiKTsgfVxuICAgIHNldFVwZGF0ZUV4cG9ydGluZyhmYWxzZSk7XG4gIH07XG5cbiAgLy8gU3RlcCAxOiBSZWFkIG1hbmlmZXN0IGFuZCBzaG93IGNvbmZpcm1hdGlvblxuICBjb25zdCBoYW5kbGVVcGRhdGVJbXBvcnQgPSBhc3luYyAoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICBjb25zdCBmaWxlID0gZS50YXJnZXQuZmlsZXM/LlswXTtcbiAgICBpZiAoIWZpbGUpIHJldHVybjtcbiAgICBpZiAoIWZpbGUubmFtZS5lbmRzV2l0aChcIi56aXBcIikpIHsgdG9hc3QuZXJyb3IoXCJTZWxlY2lvbmUgdW0gYXJxdWl2byAuemlwXCIpOyByZXR1cm47IH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBhcnJheUJ1ZmZlciA9IGF3YWl0IGZpbGUuYXJyYXlCdWZmZXIoKTtcbiAgICAgIGNvbnN0IHppcCA9IGF3YWl0IEpTWmlwLmxvYWRBc3luYyhhcnJheUJ1ZmZlcik7XG4gICAgICBjb25zdCBtYW5pZmVzdEZpbGUgPSB6aXAuZmlsZShcInVwZGF0ZS1tYW5pZmVzdC5qc29uXCIpO1xuICAgICAgaWYgKCFtYW5pZmVzdEZpbGUpIHRocm93IG5ldyBFcnJvcihcIlBhY290ZSBpbnbDoWxpZG86IGZhbHRhIHVwZGF0ZS1tYW5pZmVzdC5qc29uXCIpO1xuICAgICAgY29uc3QgbWFuaWZlc3QgPSBKU09OLnBhcnNlKGF3YWl0IG1hbmlmZXN0RmlsZS5hc3luYyhcInN0cmluZ1wiKSk7XG5cbiAgICAgIC8vIENvdW50IERCIGZpbGVzXG4gICAgICBsZXQgZGJUYWJsZUNvdW50ID0gMDtcbiAgICAgIGZvciAoY29uc3QgW3BhdGhdIG9mIE9iamVjdC5lbnRyaWVzKHppcC5maWxlcykpIHtcbiAgICAgICAgaWYgKHBhdGguc3RhcnRzV2l0aChcImRhdGFiYXNlL1wiKSAmJiBwYXRoLmVuZHNXaXRoKFwiLmpzb25cIikpIGRiVGFibGVDb3VudCsrO1xuICAgICAgfVxuICAgICAgbWFuaWZlc3QuX2RiVGFibGVDb3VudCA9IGRiVGFibGVDb3VudDtcblxuICAgICAgc2V0UGVuZGluZ1VwZGF0ZUZpbGUoZmlsZSk7XG4gICAgICBzZXRQZW5kaW5nTWFuaWZlc3QobWFuaWZlc3QpO1xuICAgICAgLy8gU2hvdyBjb25maXJtYXRpb24gdmlhIHRoZSB1bmlmaWVkIGNvbmZpcm1Nb2RhbFxuICAgICAgc2V0Q29uZmlybU1vZGFsKHtcbiAgICAgICAgb3BlbjogdHJ1ZSxcbiAgICAgICAgdGl0bGU6IFwiQ29uZmlybWFyIEF0dWFsaXphw6fDo29cIixcbiAgICAgICAgZGVzY3JpcHRpb246IGBBcGxpY2FyIHBhY290ZSB2JHttYW5pZmVzdC52ZXJzaW9ufSBjb20gJHtkYlRhYmxlQ291bnR9IHRhYmVsYXMgZSAke21hbmlmZXN0LnNvdXJjZV9maWxlcyB8fCAwfSBhcnF1aXZvcyBmb250ZT9gLFxuICAgICAgICBkZXRhaWxzOiBbXG4gICAgICAgICAgYFZlcnPDo28gZG8gcGFjb3RlOiB2JHttYW5pZmVzdC52ZXJzaW9ufWAsXG4gICAgICAgICAgYERhdGEgZGUgY3JpYcOnw6NvOiAke2Zvcm1hdEZ1bGxEYXRlVGltZUJSKG1hbmlmZXN0LmNyZWF0ZWRfYXQpfWAsXG4gICAgICAgICAgYCR7ZGJUYWJsZUNvdW50fSB0YWJlbGFzIMK3ICR7bWFuaWZlc3Quc291cmNlX2ZpbGVzIHx8IDB9IGFycXVpdm9zIGZvbnRlYCxcbiAgICAgICAgICBgVmVyc8OjbyBhdHVhbDogJHtjdXJyZW50VmVyc2lvbiB8fCBcIjEuMC4wXCJ9YCxcbiAgICAgICAgXSxcbiAgICAgICAgaWNvbjogXCJ1cGRhdGVcIixcbiAgICAgICAgb25Db25maXJtOiAoKSA9PiB7XG4gICAgICAgICAgc2V0Q29uZmlybU1vZGFsKHByZXYgPT4gKHsgLi4ucHJldiwgb3BlbjogZmFsc2UgfSkpO1xuICAgICAgICAgIGNvbmZpcm1BbmRBcHBseVVwZGF0ZSgpO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIHRvYXN0LmVycm9yKGBFcnJvIGFvIGxlciBwYWNvdGU6ICR7ZXJyLm1lc3NhZ2V9YCk7XG4gICAgfVxuICAgIGlmICh1cGRhdGVGaWxlSW5wdXRSZWYuY3VycmVudCkgdXBkYXRlRmlsZUlucHV0UmVmLmN1cnJlbnQudmFsdWUgPSBcIlwiO1xuICB9O1xuXG4gIGNvbnN0IGNvbmZpcm1BbmRBcHBseVVwZGF0ZSA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXBlbmRpbmdVcGRhdGVGaWxlIHx8ICFwZW5kaW5nTWFuaWZlc3QpIHJldHVybjtcbiAgICBjb25zdCBmaWxlID0gcGVuZGluZ1VwZGF0ZUZpbGU7XG4gICAgY29uc3QgbWFuaWZlc3QgPSBwZW5kaW5nTWFuaWZlc3Q7XG4gICAgc2V0UGVuZGluZ1VwZGF0ZUZpbGUobnVsbCk7XG4gICAgc2V0UGVuZGluZ01hbmlmZXN0KG51bGwpO1xuXG4gICAgc2V0VXBkYXRlSW1wb3J0aW5nKHRydWUpOyBzZXRVcGRhdGVSZXN1bHQobnVsbCk7IHNldFVwZGF0ZUltcG9ydFByb2dyZXNzKDApOyBzZXRVcGRhdGVJbXBvcnRTdGFnZShcIkxlbmRvIHBhY290ZS4uLlwiKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhOiB7IHNlc3Npb24gfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRTZXNzaW9uKCk7XG4gICAgICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcihcIlNlc3PDo28gZXhwaXJhZGFcIik7XG5cbiAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpO1xuICAgICAgY29uc3QgemlwID0gYXdhaXQgSlNaaXAubG9hZEFzeW5jKGFycmF5QnVmZmVyKTtcblxuICAgICAgc2V0VXBkYXRlSW1wb3J0U3RhZ2UoYFBhY290ZSB2JHttYW5pZmVzdC52ZXJzaW9ufS4gUmVzdGF1cmFuZG8gYmFuY28uLi5gKTtcbiAgICAgIHNldFVwZGF0ZUltcG9ydFByb2dyZXNzKDIwKTtcblxuICAgICAgY29uc3QgZGJaaXAgPSBuZXcgSlNaaXAoKTtcbiAgICAgIGNvbnN0IGJhY2t1cEluZm9GaWxlID0gemlwLmZpbGUoXCJiYWNrdXAtaW5mby5qc29uXCIpO1xuICAgICAgaWYgKGJhY2t1cEluZm9GaWxlKSBkYlppcC5maWxlKFwiYmFja3VwLWluZm8uanNvblwiLCBhd2FpdCBiYWNrdXBJbmZvRmlsZS5hc3luYyhcInVpbnQ4YXJyYXlcIikpO1xuXG4gICAgICBsZXQgaGFzRGJGaWxlcyA9IGZhbHNlO1xuICAgICAgZm9yIChjb25zdCBbcGF0aCwgemlwRmlsZV0gb2YgT2JqZWN0LmVudHJpZXMoemlwLmZpbGVzKSkge1xuICAgICAgICBpZiAocGF0aC5zdGFydHNXaXRoKFwiZGF0YWJhc2UvXCIpICYmICF6aXBGaWxlLmRpcikge1xuICAgICAgICAgIGRiWmlwLmZpbGUocGF0aCwgYXdhaXQgemlwRmlsZS5hc3luYyhcInVpbnQ4YXJyYXlcIikpO1xuICAgICAgICAgIGhhc0RiRmlsZXMgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGxldCByZXN0b3JlUmVzdWx0czogYW55ID0gbnVsbDtcbiAgICAgIGlmIChoYXNEYkZpbGVzKSB7XG4gICAgICAgIGNvbnN0IGRiQmxvYiA9IGF3YWl0IGRiWmlwLmdlbmVyYXRlQXN5bmMoeyB0eXBlOiBcImFycmF5YnVmZmVyXCIgfSk7XG4gICAgICAgIHNldFVwZGF0ZUltcG9ydFN0YWdlKFwiRW52aWFuZG8gZGFkb3MgcGFyYSByZXN0YXVyYcOnw6NvLi4uXCIpO1xuICAgICAgICBzZXRVcGRhdGVJbXBvcnRQcm9ncmVzcyg0MCk7XG5cbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGAke2ltcG9ydC5tZXRhLmVudi5WSVRFX1NVUEFCQVNFX1VSTH0vZnVuY3Rpb25zL3YxL2JhY2t1cC1yZXN0b3JlYCwge1xuICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgaGVhZGVyczogeyBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7c2Vzc2lvbi5hY2Nlc3NfdG9rZW59YCwgYXBpa2V5OiBpbXBvcnQubWV0YS5lbnYuVklURV9TVVBBQkFTRV9QVUJMSVNIQUJMRV9LRVkgfSxcbiAgICAgICAgICBib2R5OiBkYkJsb2IsXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCByZXNwLmpzb24oKTtcbiAgICAgICAgaWYgKCFyZXNwLm9rKSB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmVycm9yIHx8IGBIVFRQICR7cmVzcC5zdGF0dXN9YCk7XG4gICAgICAgIHJlc3RvcmVSZXN1bHRzID0gcmVzdWx0O1xuICAgICAgICBzZXRVcGRhdGVJbXBvcnRQcm9ncmVzcyg4MCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNhdmUgc291cmNlX3BhdGhzIGZyb20gbWFuaWZlc3QgdG8gc3lzdGVtX2NvbmZpZyBmb3IgZHluYW1pYyBkaXNjb3Zlcnkgb24gdGhpcyBzaXRlXG4gICAgICBpZiAobWFuaWZlc3Quc291cmNlX3BhdGhzICYmIEFycmF5LmlzQXJyYXkobWFuaWZlc3Quc291cmNlX3BhdGhzKSkge1xuICAgICAgICBzZXRVcGRhdGVJbXBvcnRTdGFnZShcIlNhbHZhbmRvIG1hbmlmZXN0byBkZSBhcnF1aXZvcy4uLlwiKTtcbiAgICAgICAgYXdhaXQgc3VwYWJhc2UuZnJvbShcInN5c3RlbV9jb25maWdcIikudXBzZXJ0KFxuICAgICAgICAgIHsga2V5OiBcInNvdXJjZV9wYXRoc19tYW5pZmVzdFwiLCB2YWx1ZTogSlNPTi5zdHJpbmdpZnkobWFuaWZlc3Quc291cmNlX3BhdGhzKSB9LFxuICAgICAgICAgIHsgb25Db25mbGljdDogXCJrZXlcIiB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSBzeXN0ZW0gdmVyc2lvblxuICAgICAgY29uc3QgcHJldmlvdXNWZXJzaW9uID0gY3VycmVudFZlcnNpb24gfHwgXCIxLjAuMFwiO1xuICAgICAgY29uc3QgbmV3VmVyc2lvbiA9IGluY3JlbWVudFZlcnNpb24obWFuaWZlc3QudmVyc2lvbik7XG4gICAgICBzZXRVcGRhdGVJbXBvcnRTdGFnZShcIkF0dWFsaXphbmRvIHZlcnPDo28gZG8gc2lzdGVtYS4uLlwiKTtcbiAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oXCJzeXN0ZW1fY29uZmlnXCIpLnVwc2VydCh7IGtleTogXCJzeXN0ZW1fdmVyc2lvblwiLCB2YWx1ZTogbmV3VmVyc2lvbiB9LCB7IG9uQ29uZmxpY3Q6IFwia2V5XCIgfSk7XG4gICAgICBzZXRDdXJyZW50VmVyc2lvbihuZXdWZXJzaW9uKTtcblxuICAgICAgLy8gU2F2ZSB0byB1cGRhdGVfaGlzdG9yeVxuICAgICAgY29uc3QgcmVzdWx0cyA9IHJlc3RvcmVSZXN1bHRzPy5yZXN1bHRzIHx8IFtdO1xuICAgICAgY29uc3QgdGFibGVzUmVzdG9yZWQgPSByZXN1bHRzLmZpbHRlcigocjogYW55KSA9PiByLnN0YXR1cyA9PT0gXCJyZXN0b3JlZFwiKS5sZW5ndGg7XG4gICAgICBjb25zdCB0YWJsZXNTa2lwcGVkID0gcmVzdWx0cy5maWx0ZXIoKHI6IGFueSkgPT4gci5zdGF0dXMgPT09IFwic2tpcHBlZFwiIHx8IHIuc3RhdHVzID09PSBcImVtcHR5XCIgfHwgci5zdGF0dXMgPT09IFwic2tpcHBlZF9ma1wiKS5sZW5ndGg7XG4gICAgICBjb25zdCB0YWJsZXNGYWlsZWQgPSByZXN1bHRzLmZpbHRlcigocjogYW55KSA9PiByLnN0YXR1cyA9PT0gXCJlcnJvclwiKS5sZW5ndGg7XG4gICAgICBjb25zdCB0b3RhbFJlY29yZHMgPSByZXN1bHRzLmZpbHRlcigocjogYW55KSA9PiByLnN0YXR1cyA9PT0gXCJyZXN0b3JlZFwiKS5yZWR1Y2UoKHN1bTogbnVtYmVyLCByOiBhbnkpID0+IHN1bSArIChyLmNvdW50IHx8IDApLCAwKTtcblxuICAgICAgY29uc3QgeyBkYXRhOiB7IHVzZXIgfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKCk7XG4gICAgICBhd2FpdCBzdXBhYmFzZS5mcm9tKFwidXBkYXRlX2hpc3RvcnlcIikuaW5zZXJ0KHtcbiAgICAgICAgdmVyc2lvbjogbmV3VmVyc2lvbixcbiAgICAgICAgcHJldmlvdXNfdmVyc2lvbjogcHJldmlvdXNWZXJzaW9uLFxuICAgICAgICBiYWNrdXBfZGF0ZTogbWFuaWZlc3QuY3JlYXRlZF9hdCxcbiAgICAgICAgYmFja3VwX2J5OiByZXN0b3JlUmVzdWx0cz8uYmFja3VwX2J5IHx8IG1hbmlmZXN0LmNyZWF0ZWRfYnkgfHwgbnVsbCxcbiAgICAgICAgcmVzdWx0czogcmVzdWx0cyxcbiAgICAgICAgdGFibGVzX3Jlc3RvcmVkOiB0YWJsZXNSZXN0b3JlZCxcbiAgICAgICAgdGFibGVzX3NraXBwZWQ6IHRhYmxlc1NraXBwZWQsXG4gICAgICAgIHRhYmxlc19mYWlsZWQ6IHRhYmxlc0ZhaWxlZCxcbiAgICAgICAgdG90YWxfcmVjb3JkczogdG90YWxSZWNvcmRzLFxuICAgICAgICBhcHBsaWVkX2J5OiB1c2VyPy5pZCB8fCBudWxsLFxuICAgICAgfSk7XG5cbiAgICAgIC8vIFJlbG9hZCBoaXN0b3J5XG4gICAgICBjb25zdCB7IGRhdGE6IGhpc3RvcnlEYXRhIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAuZnJvbShcInVwZGF0ZV9oaXN0b3J5XCIpXG4gICAgICAgIC5zZWxlY3QoXCIqXCIpXG4gICAgICAgIC5vcmRlcihcImFwcGxpZWRfYXRcIiwgeyBhc2NlbmRpbmc6IGZhbHNlIH0pXG4gICAgICAgIC5saW1pdCgyMCk7XG4gICAgICBpZiAoaGlzdG9yeURhdGEpIHNldFVwZGF0ZUhpc3RvcnkoaGlzdG9yeURhdGEpO1xuXG4gICAgICBzZXRVcGRhdGVJbXBvcnRQcm9ncmVzcygxMDApO1xuICAgICAgc2V0VXBkYXRlSW1wb3J0U3RhZ2UoXCJBdHVhbGl6YcOnw6NvIGNvbmNsdcOtZGEhXCIpO1xuICAgICAgc2V0VXBkYXRlUmVzdWx0KHtcbiAgICAgICAgZnJvbV92ZXJzaW9uOiBwcmV2aW91c1ZlcnNpb24sXG4gICAgICAgIHRvX3ZlcnNpb246IG5ld1ZlcnNpb24sXG4gICAgICAgIG1hbmlmZXN0LFxuICAgICAgICByZXN0b3JlOiByZXN0b3JlUmVzdWx0cyxcbiAgICAgIH0pO1xuICAgICAgdG9hc3Quc3VjY2VzcyhgU2lzdGVtYSBhdHVhbGl6YWRvIHBhcmEgdiR7bmV3VmVyc2lvbn0hYCk7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHsgdG9hc3QuZXJyb3IoYEVycm86ICR7ZXJyLm1lc3NhZ2V9YCk7IHNldFVwZGF0ZUltcG9ydFN0YWdlKGBFcnJvOiAke2Vyci5tZXNzYWdlfWApOyB9XG4gICAgc2V0VXBkYXRlSW1wb3J0aW5nKGZhbHNlKTtcbiAgfTtcblxuICBjb25zdCBjYW5jZWxVcGRhdGUgPSAoKSA9PiB7XG4gICAgc2V0Q29uZmlybU1vZGFsKHByZXYgPT4gKHsgLi4ucHJldiwgb3BlbjogZmFsc2UgfSkpO1xuICAgIHNldFBlbmRpbmdVcGRhdGVGaWxlKG51bGwpO1xuICAgIHNldFBlbmRpbmdNYW5pZmVzdChudWxsKTtcbiAgfTtcblxuICBjb25zdCBydW5JbnRlZ3JpdHlDaGVjayA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRJbnRlZ3JpdHlDaGVja2luZyh0cnVlKTtcbiAgICBzZXRJbnRlZ3JpdHlSZXN1bHQobnVsbCk7XG4gICAgY29uc3QgbWlzc2luZzogc3RyaW5nW10gPSBbXTtcbiAgICBsZXQgZm91bmQgPSAwO1xuICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZWZmZWN0aXZlUGF0aHMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHIgPSBhd2FpdCBmZXRjaChuZXcgVVJMKGAvJHtmaWxlUGF0aH1gLCB3aW5kb3cubG9jYXRpb24ub3JpZ2luKS5ocmVmLCB7IG1ldGhvZDogXCJIRUFEXCIgfSk7XG4gICAgICAgIGlmIChyLm9rKSB7IGZvdW5kKys7IH0gZWxzZSB7IG1pc3NpbmcucHVzaChmaWxlUGF0aCk7IH1cbiAgICAgIH0gY2F0Y2ggeyBtaXNzaW5nLnB1c2goZmlsZVBhdGgpOyB9XG4gICAgfVxuICAgIHNldEludGVncml0eVJlc3VsdCh7IG1pc3NpbmcsIGZvdW5kLCB0b3RhbDogZWZmZWN0aXZlUGF0aHMubGVuZ3RoIH0pO1xuICAgIGlmIChtaXNzaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdG9hc3Quc3VjY2Vzcyhg4pyFIEludGVncmlkYWRlIE9LISBUb2RvcyBvcyAke2ZvdW5kfSBhcnF1aXZvcyBlbmNvbnRyYWRvcy5gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdG9hc3QuZXJyb3IoYOKaoO+4jyAke21pc3NpbmcubGVuZ3RofSBhcnF1aXZvKHMpIGZhbHRhbmRvIG5vIGJhY2t1cCFgKTtcbiAgICB9XG4gICAgc2V0SW50ZWdyaXR5Q2hlY2tpbmcoZmFsc2UpO1xuICB9O1xuXG4gIGNvbnN0IGluY3JlbWVudFZlcnNpb24gPSAodjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBwYXJ0cyA9IHYuc3BsaXQoXCIuXCIpLm1hcChOdW1iZXIpO1xuICAgIHBhcnRzWzJdID0gKHBhcnRzWzJdIHx8IDApICsgMTtcbiAgICByZXR1cm4gcGFydHMuam9pbihcIi5cIik7XG4gIH07XG5cbiAgY29uc3QgdGFiczogeyBrZXk6IFRhYktleTsgbGFiZWw6IHN0cmluZzsgaWNvbjogYW55IH1bXSA9IFtcbiAgICB7IGtleTogXCJkYWRvc1wiLCBsYWJlbDogXCJEYWRvc1wiLCBpY29uOiBEYXRhYmFzZSB9LFxuICAgIHsga2V5OiBcImdpdGh1YlwiLCBsYWJlbDogXCJHaXRIdWJcIiwgaWNvbjogR2l0aHViIH0sXG4gICAgeyBrZXk6IFwiYXR1YWxpemFjYW9cIiwgbGFiZWw6IFwiQXR1YWxpemHDp8Ojb1wiLCBpY29uOiBQYWNrYWdlQ2hlY2sgfSxcbiAgXTtcblxuICByZXR1cm4gKFxuICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMTIgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19IGNsYXNzTmFtZT1cInNwYWNlLXktNVwiPlxuICAgICAgey8qIEhlYWRlciB3aXRoIHN0YXRzICovfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBwLTQgcm91bmRlZC0yeGwgYmFja2Ryb3AtYmx1ci14bCBiZy13aGl0ZS9bMC4wNF0gc2hhZG93LVtpbnNldF8wXzFweF8xcHhfcmdiYSgyNTUsMjU1LDI1NSwwLjA2KV1cIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTExIHctMTEgcm91bmRlZC14bCBiZy1ncmFkaWVudC10by1iciBmcm9tLWFtYmVyLTUwMC8yNSB0by1vcmFuZ2UtNTAwLzI1IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNoYWRvdy1sZyBzaGFkb3ctYW1iZXItNTAwLzEwXCI+XG4gICAgICAgICAgPFNoaWVsZCBjbGFzc05hbWU9XCJoLTUgdy01IHRleHQtYW1iZXItNDAwXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPkJhY2t1cCAmIFN5bmM8L2gyPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+VGFiZWxhcyBkaW7Dom1pY2FzIMK3IHtmb3JtYXREYXRlRnVsbEJSKG5ldyBEYXRlKCkpfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgey8qIFRhYiBTd2l0Y2hlciAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMSBwLTEuNSByb3VuZGVkLTJ4bCBiYWNrZHJvcC1ibHVyLXhsIGJnLXdoaXRlL1swLjA0XSBzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDI1NSwyNTUsMjU1LDAuMDYpXVwiPlxuICAgICAgICB7dGFicy5tYXAodCA9PiAoXG4gICAgICAgICAgPGJ1dHRvbiBrZXk9e3Qua2V5fSBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVUYWIodC5rZXkpfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleC0xIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHB5LTIuNSBweC0zIHJvdW5kZWQteGwgdGV4dC1zbSBmb250LW1lZGl1bSB0cmFuc2l0aW9uLWFsbCAke1xuICAgICAgICAgICAgICBhY3RpdmVUYWIgPT09IHQua2V5XG4gICAgICAgICAgICAgICAgPyBcImJnLXdoaXRlL1swLjA4XSB0ZXh0LWZvcmVncm91bmQgc2hhZG93LVtpbnNldF8wXzFweF8xcHhfcmdiYSgyNTUsMjU1LDI1NSwwLjEpXVwiXG4gICAgICAgICAgICAgICAgOiBcInRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3Zlcjp0ZXh0LWZvcmVncm91bmQgaG92ZXI6Ymctd2hpdGUvWzAuMDNdXCJcbiAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgIDx0Lmljb24gY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+XG4gICAgICAgICAgICB7dC5sYWJlbH1cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cblxuICAgICAgPEFuaW1hdGVQcmVzZW5jZSBtb2RlPVwid2FpdFwiPlxuICAgICAgICB7YWN0aXZlVGFiID09PSBcImRhZG9zXCIgJiYgKFxuICAgICAgICAgIDxtb3Rpb24uZGl2IGtleT1cImRhZG9zXCIgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB4OiAtMTIgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB4OiAwIH19IGV4aXQ9e3sgb3BhY2l0eTogMCwgeDogMTIgfX0gY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICB7LyogUXVpY2sgQWN0aW9ucyBSb3cgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgey8qIEV4cG9ydCBDYXJkICovfVxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUV4cG9ydH0gZGlzYWJsZWQ9e2V4cG9ydGluZ31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZWxhdGl2ZSBncm91cCByb3VuZGVkLTJ4bCBwLTQgYmFja2Ryb3AtYmx1ci14bCBiZy13aGl0ZS9bMC4wNF0gc2hhZG93LVtpbnNldF8wXzFweF8xcHhfcmdiYSgyNTUsMjU1LDI1NSwwLjA2KV0gaG92ZXI6Ymctd2hpdGUvWzAuMDddIGhvdmVyOnNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoMjU1LDI1NSwyNTUsMC4xKSwwXzBfMjBweF9yZ2JhKDI0NSwxNTgsMTEsMC4wOCldIHRyYW5zaXRpb24tYWxsIHRleHQtbGVmdCBkaXNhYmxlZDpvcGFjaXR5LTYwXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTEwIHctMTAgcm91bmRlZC14bCBiZy1ncmFkaWVudC10by1iciBmcm9tLWFtYmVyLTUwMC8yMCB0by1hbWJlci02MDAvMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWItMyBzaGFkb3ctbGcgc2hhZG93LWFtYmVyLTUwMC81XCI+XG4gICAgICAgICAgICAgICAgICB7ZXhwb3J0aW5nID8gPExvYWRlcjIgY2xhc3NOYW1lPVwiaC00IHctNCBhbmltYXRlLXNwaW4gdGV4dC1hbWJlci00MDBcIiAvPiA6IDxBcnJvd0Rvd25Ub0xpbmUgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LWFtYmVyLTQwMFwiIC8+fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+e2V4cG9ydGluZyA/IFwiR2VyYW5kby4uLlwiIDogXCJFeHBvcnRhclwifTwvcD5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbXQtMC41XCI+QmFpeGFyIGJhY2t1cCAuemlwPC9wPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICB7LyogSW1wb3J0IENhcmQgKi99XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gZmlsZUlucHV0UmVmLmN1cnJlbnQ/LmNsaWNrKCl9IGRpc2FibGVkPXtpbXBvcnRpbmd9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVsYXRpdmUgZ3JvdXAgcm91bmRlZC0yeGwgcC00IGJhY2tkcm9wLWJsdXIteGwgYmctd2hpdGUvWzAuMDRdIHNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoMjU1LDI1NSwyNTUsMC4wNildIGhvdmVyOmJnLXdoaXRlL1swLjA3XSBob3ZlcjpzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDI1NSwyNTUsMjU1LDAuMSksMF8wXzIwcHhfcmdiYSgyMzksNjgsNjgsMC4wOCldIHRyYW5zaXRpb24tYWxsIHRleHQtbGVmdCBkaXNhYmxlZDpvcGFjaXR5LTYwXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTEwIHctMTAgcm91bmRlZC14bCBiZy1ncmFkaWVudC10by1iciBmcm9tLXJlZC01MDAvMjAgdG8tcmVkLTYwMC8xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBtYi0zIHNoYWRvdy1sZyBzaGFkb3ctcmVkLTUwMC81XCI+XG4gICAgICAgICAgICAgICAgICB7aW1wb3J0aW5nID8gPExvYWRlcjIgY2xhc3NOYW1lPVwiaC00IHctNCBhbmltYXRlLXNwaW4gdGV4dC1yZWQtNDAwXCIgLz4gOiA8QXJyb3dVcEZyb21MaW5lIGNsYXNzTmFtZT1cImgtNCB3LTQgdGV4dC1yZWQtNDAwXCIgLz59XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZFwiPntpbXBvcnRpbmcgPyBcIlJlc3RhdXJhbmRvLi4uXCIgOiBcIlJlc3RhdXJhclwifTwvcD5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbXQtMC41XCI+SW1wb3J0YXIgYmFja3VwIC56aXA8L3A+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxpbnB1dCByZWY9e2ZpbGVJbnB1dFJlZn0gdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCIuemlwXCIgb25DaGFuZ2U9e2hhbmRsZUltcG9ydH0gY2xhc3NOYW1lPVwiaGlkZGVuXCIgLz5cblxuICAgICAgICAgICAgey8qIEV4cG9ydCBwcm9ncmVzcyAqL31cbiAgICAgICAgICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICAgICAgICAgIHtleHBvcnRpbmcgJiYgKFxuICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgaGVpZ2h0OiAwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgaGVpZ2h0OiBcImF1dG9cIiB9fSBleGl0PXt7IG9wYWNpdHk6IDAsIGhlaWdodDogMCB9fVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicm91bmRlZC0yeGwgYmFja2Ryb3AtYmx1ci14bCBiZy1wcmltYXJ5L1swLjA2XSBzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDI1NSwyNTUsMjU1LDAuMDYpXSBwLTQgc3BhY2UteS0zIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZFwiPntleHBvcnRTdGFnZX08L3A+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLTIuNSBiZy13aGl0ZS9bMC4wNl0gcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBjbGFzc05hbWU9XCJoLWZ1bGwgYmctZ3JhZGllbnQtdG8tciBmcm9tLXByaW1hcnkgdG8tYW1iZXItNDAwIHJvdW5kZWQtZnVsbFwiXG4gICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyB3aWR0aDogMCB9fSBhbmltYXRlPXt7IHdpZHRoOiBgJHtleHBvcnRQcm9ncmVzc30lYCB9fSB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjMgfX0gLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRleHQtcmlnaHQgZm9udC1tb25vXCI+e2V4cG9ydFByb2dyZXNzfSU8L3A+XG4gICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG5cbiAgICAgICAgICAgIHsvKiBJbnRlZ3JpdHkgQ2hlY2sgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdW5kZWQtMnhsIGJhY2tkcm9wLWJsdXIteGwgYmctd2hpdGUvWzAuMDNdIHNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoMjU1LDI1NSwyNTUsMC4wNSldIHAtNCBzcGFjZS15LTNcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICA8U2hpZWxkIGNsYXNzTmFtZT1cImgtNCB3LTQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+VmVyaWZpY2HDp8OjbyBkZSBJbnRlZ3JpZGFkZTwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e3J1bkludGVncml0eUNoZWNrfSBkaXNhYmxlZD17aW50ZWdyaXR5Q2hlY2tpbmd9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHB4LTMgcHktMS41IHJvdW5kZWQteGwgdGV4dC14cyBmb250LXNlbWlib2xkIGJnLXByaW1hcnkvMTAgdGV4dC1wcmltYXJ5IGhvdmVyOmJnLXByaW1hcnkvMjAgdHJhbnNpdGlvbi1hbGwgZGlzYWJsZWQ6b3BhY2l0eS02MFwiPlxuICAgICAgICAgICAgICAgICAge2ludGVncml0eUNoZWNraW5nID8gPExvYWRlcjIgY2xhc3NOYW1lPVwiaC0zIHctMyBhbmltYXRlLXNwaW5cIiAvPiA6IDxSZWZyZXNoQ3cgY2xhc3NOYW1lPVwiaC0zIHctM1wiIC8+fVxuICAgICAgICAgICAgICAgICAge2ludGVncml0eUNoZWNraW5nID8gXCJWZXJpZmljYW5kby4uLlwiIDogXCJWZXJpZmljYXJcIn1cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPkNvbXBhcmEgb3MgYXJxdWl2b3MgZG8gcHJvamV0byBjb20gbyBTT1VSQ0VfUEFUSFMgcGFyYSBnYXJhbnRpciBxdWUgbmVuaHVtIGFycXVpdm8gZmlxdWUgZm9yYSBkbyBiYWNrdXAuPC9wPlxuXG4gICAgICAgICAgICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICAgICAgICAgICAge2ludGVncml0eVJlc3VsdCAmJiAoXG4gICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIGhlaWdodDogMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIGhlaWdodDogXCJhdXRvXCIgfX0gZXhpdD17eyBvcGFjaXR5OiAwLCBoZWlnaHQ6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic3BhY2UteS0yIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAge2ludGVncml0eVJlc3VsdC5taXNzaW5nLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxDaGVja0NpcmNsZTIgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LWVtZXJhbGQtNDAwXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEFsZXJ0VHJpYW5nbGUgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LWFtYmVyLTQwMFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7aW50ZWdyaXR5UmVzdWx0LmZvdW5kfS97aW50ZWdyaXR5UmVzdWx0LnRvdGFsfSBhcnF1aXZvcyBlbmNvbnRyYWRvc1xuICAgICAgICAgICAgICAgICAgICAgICAge2ludGVncml0eVJlc3VsdC5taXNzaW5nLmxlbmd0aCA+IDAgJiYgYCDCtyAke2ludGVncml0eVJlc3VsdC5taXNzaW5nLmxlbmd0aH0gZmFsdGFuZG9gfVxuICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIHtpbnRlZ3JpdHlSZXN1bHQubWlzc2luZy5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1heC1oLTQwIG92ZXJmbG93LXktYXV0byByb3VuZGVkLXhsIGJnLXJlZC01MDAvWzAuMDZdIGJvcmRlciBib3JkZXItcmVkLTUwMC8yMCBwLTIuNSBzcGFjZS15LTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtc2VtaWJvbGQgdGV4dC1yZWQtNDAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xXCI+QXJxdWl2b3MgZmFsdGFudGVzOjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtpbnRlZ3JpdHlSZXN1bHQubWlzc2luZy5tYXAoKGYpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHAga2V5PXtmfSBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBmb250LW1vbm8gdGV4dC1yZWQtMzAwLzgwIHRydW5jYXRlXCI+4p2MIHtmfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICB7aW50ZWdyaXR5UmVzdWx0Lm1pc3NpbmcubGVuZ3RoID09PSAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdW5kZWQteGwgYmctZW1lcmFsZC01MDAvWzAuMDZdIGJvcmRlciBib3JkZXItZW1lcmFsZC01MDAvMjAgcC0yLjVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtZW1lcmFsZC00MDAgZm9udC1tZWRpdW1cIj7inIUgVG9kb3Mgb3MgYXJxdWl2b3MgZXN0w6NvIGNvYmVydG9zIHBlbG8gYmFja3VwLiBOZW5odW0gYXJxdWl2byBmYWx0YW5kby48L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIFRhYmxlcyBpbmZvICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBiYWNrZHJvcC1ibHVyLXhsIGJnLXdoaXRlL1swLjAzXSBzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDI1NSwyNTUsMjU1LDAuMDUpXSBwLTRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBtYi0zXCI+XG4gICAgICAgICAgICAgICAgPEhhcmREcml2ZSBjbGFzc05hbWU9XCJoLTQgdy00IHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiIC8+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5UYWJlbGFzIG5vIGJhY2t1cDwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXdyYXAgZ2FwLTEuNVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtbW9ubyBweC0yIHB5LTEgcm91bmRlZC1sZyBiZy13aGl0ZS9bMC4wNV0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHNoYWRvdy1baW5zZXRfMF8xcHhfMHB4X3JnYmEoMjU1LDI1NSwyNTUsMC4wNCldXCI+XG4gICAgICAgICAgICAgICAgICDwn5SEIERlc2NvYmVydGEgYXV0b23DoXRpY2Eg4oCUIHRvZGFzIGFzIHRhYmVsYXMgZG8gc2NoZW1hIHB1YmxpY1xuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIEluY2x1ZGUgREIgdG9nZ2xlICovfVxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRJbmNsdWRlRGIoIWluY2x1ZGVEYil9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHctZnVsbCBwLTMuNSByb3VuZGVkLTJ4bCBiYWNrZHJvcC1ibHVyLXhsIGJnLXdoaXRlL1swLjAzXSBzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDI1NSwyNTUsMjU1LDAuMDUpXSBob3ZlcjpiZy13aGl0ZS9bMC4wNl0gdHJhbnNpdGlvbi1hbGwgdGV4dC1sZWZ0XCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgaC01IHctNSByb3VuZGVkLW1kIGJvcmRlci0yIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRyYW5zaXRpb24tY29sb3JzICR7XG4gICAgICAgICAgICAgICAgaW5jbHVkZURiID8gXCJiZy1wcmltYXJ5IGJvcmRlci1wcmltYXJ5XCIgOiBcImJvcmRlci1tdXRlZC1mb3JlZ3JvdW5kLzQwXCJcbiAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgIHtpbmNsdWRlRGIgJiYgPENoZWNrQ2lyY2xlMiBjbGFzc05hbWU9XCJoLTMuNSB3LTMuNSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZFwiIC8+fVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZFwiPkluY2x1aXIgYmFuY28gZGUgZGFkb3M8L3A+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+VXN1w6FyaW9zLCBzYWxkb3MsIHJlY2FyZ2FzLCBjb25maWdzPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgICB7LyogSW5jbHVkZSBTb3VyY2UgdG9nZ2xlICovfVxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRJbmNsdWRlU291cmNlKCFpbmNsdWRlU291cmNlKX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgdy1mdWxsIHAtMy41IHJvdW5kZWQtMnhsIGJhY2tkcm9wLWJsdXIteGwgYmctd2hpdGUvWzAuMDNdIHNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoMjU1LDI1NSwyNTUsMC4wNSldIGhvdmVyOmJnLXdoaXRlL1swLjA2XSB0cmFuc2l0aW9uLWFsbCB0ZXh0LWxlZnRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BoLTUgdy01IHJvdW5kZWQtbWQgYm9yZGVyLTIgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdHJhbnNpdGlvbi1jb2xvcnMgJHtcbiAgICAgICAgICAgICAgICBpbmNsdWRlU291cmNlID8gXCJiZy1wcmltYXJ5IGJvcmRlci1wcmltYXJ5XCIgOiBcImJvcmRlci1tdXRlZC1mb3JlZ3JvdW5kLzQwXCJcbiAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgIHtpbmNsdWRlU291cmNlICYmIDxDaGVja0NpcmNsZTIgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjUgdGV4dC1wcmltYXJ5LWZvcmVncm91bmRcIiAvPn1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWZvcmVncm91bmQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNVwiPlxuICAgICAgICAgICAgICAgICAgPENvZGUyIGNsYXNzTmFtZT1cImgtMy41IHctMy41XCIgLz4gSW5jbHVpciBjw7NkaWdvLWZvbnRlXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlDDoWdpbmFzLCBjb21wb25lbnRlcywgaG9va3MsIGVkZ2UgZnVuY3Rpb25zPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAgICB7LyogUmVzdG9yZSBSZXN1bHQgKi99XG4gICAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICAgICAgICB7cmVzdG9yZVJlc3VsdCAmJiAoXG4gICAgICAgICAgICAgICAgPG1vdGlvbi5kaXYgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBoZWlnaHQ6IDAgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBoZWlnaHQ6IFwiYXV0b1wiIH19IGV4aXQ9e3sgb3BhY2l0eTogMCwgaGVpZ2h0OiAwIH19XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBiYWNrZHJvcC1ibHVyLXhsIGJnLWVtZXJhbGQtNTAwL1swLjA2XSBzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDUyLDIxMSwxNTMsMC4xKSwwXzBfMjBweF9yZ2JhKDE2LDE4NSwxMjksMC4wNildIHAtNCBzcGFjZS15LTMgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1lbWVyYWxkLTQwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxDaGVja0NpcmNsZTIgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IFJlc3RhdXJhZG8gY29tIHN1Y2Vzc29cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFJlc3RvcmVSZXN1bHQobnVsbCl9IGNsYXNzTmFtZT1cInRleHQtZGVzdHJ1Y3RpdmUgaG92ZXI6dGV4dC1kZXN0cnVjdGl2ZS84MFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxYIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC00IHRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCI+PENsb2NrIGNsYXNzTmFtZT1cImgtMyB3LTNcIiAvPiB7cmVzdG9yZVJlc3VsdC5iYWNrdXBfZGF0ZSA/IGZvcm1hdEZ1bGxEYXRlVGltZUJSKHJlc3RvcmVSZXN1bHQuYmFja3VwX2RhdGUpIDogXCLigJRcIn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPntyZXN0b3JlUmVzdWx0LmJhY2t1cF9ieSB8fCBcIuKAlFwifTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTEgbWF4LWgtNDAgb3ZlcmZsb3cteS1hdXRvXCI+XG4gICAgICAgICAgICAgICAgICAgIHtyZXN0b3JlUmVzdWx0LnJlc3VsdHM/Lm1hcCgocjogYW55LCBpOiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHRleHQteHMgcHktMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1mb3JlZ3JvdW5kIGZvbnQtbW9ub1wiPntyLnRhYmxlfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGZvbnQtbWVkaXVtICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHIuc3RhdHVzID09PSBcInJlc3RvcmVkXCIgPyBcInRleHQtZW1lcmFsZC00MDBcIiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHIuc3RhdHVzID09PSBcInNraXBwZWRcIiA/IFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICByLnN0YXR1cyA9PT0gXCJlcnJvclwiID8gXCJ0ZXh0LXJlZC00MDBcIiA6IFwidGV4dC1hbWJlci00MDBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7ci5zdGF0dXMgPT09IFwicmVzdG9yZWRcIiA/IGAke3IuY291bnR9IHJlZ2lzdHJvc2AgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgci5zdGF0dXMgPT09IFwic2tpcHBlZFwiID8gXCJwdWxhZG9cIiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByLnN0YXR1cyA9PT0gXCJlbXB0eVwiID8gXCJ2YXppb1wiIDogci5lcnJvciB8fCBcImVycm9cIn1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAge2FjdGl2ZVRhYiA9PT0gXCJnaXRodWJcIiAmJiAoXG4gICAgICAgICAgPG1vdGlvbi5kaXYga2V5PVwiZ2l0aHViXCIgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB4OiAxMiB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHg6IDAgfX0gZXhpdD17eyBvcGFjaXR5OiAwLCB4OiAtMTIgfX0gY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICB7LyogR2l0SHViIFBBVCBDb25maWcgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdW5kZWQtMnhsIGJhY2tkcm9wLWJsdXIteGwgYmctd2hpdGUvWzAuMDRdIHNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoMjU1LDI1NSwyNTUsMC4wNildIHAtNCBzcGFjZS15LTJcIj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+R2l0SHViIFBBVCAoUGVyc29uYWwgQWNjZXNzIFRva2VuKTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgZmxleC0xXCI+XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgdHlwZT17c2hvd1BhdCA/IFwidGV4dFwiIDogXCJwYXNzd29yZFwifVxuICAgICAgICAgICAgICAgICAgICB2YWx1ZT17Z2l0aHViUGF0fVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRHaXRodWJQYXQoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImdocF8uLi5cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yIHByLTkgcm91bmRlZC14bCBiZy13aGl0ZS9bMC4wNV0gYm9yZGVyIGJvcmRlci13aGl0ZS9bMC4wOF0gdGV4dC1mb3JlZ3JvdW5kIHRleHQtc20gZm9udC1tb25vIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1wcmltYXJ5LzMwIHBsYWNlaG9sZGVyOnRleHQtbXV0ZWQtZm9yZWdyb3VuZC81MFwiXG4gICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd1BhdCghc2hvd1BhdCl9IGNsYXNzTmFtZT1cImFic29sdXRlIHJpZ2h0LTIuNSB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOnRleHQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICB7c2hvd1BhdCA/IDxFeWVPZmYgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjVcIiAvPiA6IDxFeWUgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjVcIiAvPn1cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17c2F2ZUdpdGh1YlBhdH0gZGlzYWJsZWQ9e3NhdmluZ1BhdH1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTMgcHktMiByb3VuZGVkLXhsIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgdGV4dC1zbSBmb250LW1lZGl1bSBob3ZlcjpvcGFjaXR5LTkwIHRyYW5zaXRpb24tb3BhY2l0eSBkaXNhYmxlZDpvcGFjaXR5LTUwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjVcIj5cbiAgICAgICAgICAgICAgICAgIHtzYXZpbmdQYXQgPyA8TG9hZGVyMiBjbGFzc05hbWU9XCJoLTMuNSB3LTMuNSBhbmltYXRlLXNwaW5cIiAvPiA6IDxTYXZlIGNsYXNzTmFtZT1cImgtMy41IHctMy41XCIgLz59XG4gICAgICAgICAgICAgICAgICBTYWx2YXJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPkdlcmUgZW0gPGEgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9zZXR0aW5ncy90b2tlbnNcIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lclwiIGNsYXNzTmFtZT1cInVuZGVybGluZSBob3Zlcjp0ZXh0LWZvcmVncm91bmRcIj5naXRodWIuY29tL3NldHRpbmdzL3Rva2VuczwvYT4gY29tIGVzY29wbyA8Y29kZSBjbGFzc05hbWU9XCJiZy13aGl0ZS9bMC4wNl0gcHgtMSByb3VuZGVkXCI+cmVwbzwvY29kZT48L3A+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIExvYWQgcmVwb3MgKi99XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2xvYWRSZXBvc30gZGlzYWJsZWQ9e2xvYWRpbmdSZXBvc31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB5LTMgcm91bmRlZC0yeGwgYmFja2Ryb3AtYmx1ci14bCBiZy13aGl0ZS9bMC4wNF0gc2hhZG93LVtpbnNldF8wXzFweF8xcHhfcmdiYSgyNTUsMjU1LDI1NSwwLjA2KV0gaG92ZXI6Ymctd2hpdGUvWzAuMDddIHRleHQtZm9yZWdyb3VuZCBmb250LW1lZGl1bSB0ZXh0LXNtIHRyYW5zaXRpb24tYWxsIGRpc2FibGVkOm9wYWNpdHktNTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAge2xvYWRpbmdSZXBvcyA/IDxMb2FkZXIyIGNsYXNzTmFtZT1cImgtNCB3LTQgYW5pbWF0ZS1zcGluXCIgLz4gOiA8UmVmcmVzaEN3IGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPn1cbiAgICAgICAgICAgICAge2xvYWRpbmdSZXBvcyA/IFwiQ2FycmVnYW5kby4uLlwiIDogcmVwb3MubGVuZ3RoID4gMCA/IFwiQXR1YWxpemFyIHJlcG9zaXTDs3Jpb3NcIiA6IFwiQ2FycmVnYXIgcmVwb3NpdMOzcmlvc1wifVxuICAgICAgICAgICAgPC9idXR0b24+XG5cbiAgICAgICAgICAgIHtyZXBvcy5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlXCI+XG4gICAgICAgICAgICAgICAgICA8c2VsZWN0IHZhbHVlPXtzZWxlY3RlZFJlcG99IG9uQ2hhbmdlPXtlID0+IHNldFNlbGVjdGVkUmVwbyhlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweS0yLjUgcHgtMyBwbC05IHJvdW5kZWQtMnhsIGJhY2tkcm9wLWJsdXIteGwgYmctd2hpdGUvWzAuMDRdIHNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoMjU1LDI1NSwyNTUsMC4wNildIHRleHQtZm9yZWdyb3VuZCB0ZXh0LXNtIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXByaW1hcnkvMzAgZm9jdXM6b3V0bGluZS1ub25lIGFwcGVhcmFuY2Utbm9uZVwiPlxuICAgICAgICAgICAgICAgICAgICB7cmVwb3MubWFwKChyOiBhbnkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17ci5mdWxsX25hbWV9IHZhbHVlPXtyLmZ1bGxfbmFtZX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ci5mdWxsX25hbWV9ICh7ci5kZWZhdWx0X2JyYW5jaH0pIHtyLnByaXZhdGUgPyBcIuKAoiBwcml2YWRvXCIgOiBcIuKAoiBww7pibGljb1wifVxuICAgICAgICAgICAgICAgICAgICAgIDwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICAgICAgPEdpdGh1YiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBsZWZ0LTMgdG9wLTEvMiAtdHJhbnNsYXRlLXktMS8yIGgtMy41IHctMy41IHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBwb2ludGVyLWV2ZW50cy1ub25lXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxDaGV2cm9uRG93biBjbGFzc05hbWU9XCJhYnNvbHV0ZSByaWdodC0zIHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiBoLTMuNSB3LTMuNSB0ZXh0LW11dGVkLWZvcmVncm91bmQgcG9pbnRlci1ldmVudHMtbm9uZVwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICB7IXN5bmNpbmcgJiYgKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHBhZ2VzID0gZWZmZWN0aXZlUGF0aHMuZmlsdGVyKHAgPT4gcC5zdGFydHNXaXRoKFwic3JjL3BhZ2VzL1wiKSkubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50cyA9IGVmZmVjdGl2ZVBhdGhzLmZpbHRlcihwID0+IHAuc3RhcnRzV2l0aChcInNyYy9jb21wb25lbnRzL1wiKSkubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgY29uc3QgaG9va3MgPSBlZmZlY3RpdmVQYXRocy5maWx0ZXIocCA9PiBwLnN0YXJ0c1dpdGgoXCJzcmMvaG9va3MvXCIpKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICBjb25zdCBsaWJzID0gZWZmZWN0aXZlUGF0aHMuZmlsdGVyKHAgPT4gcC5zdGFydHNXaXRoKFwic3JjL2xpYi9cIikpLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGVkZ2VGbnMgPSBlZmZlY3RpdmVQYXRocy5maWx0ZXIocCA9PiBwLnN0YXJ0c1dpdGgoXCJzdXBhYmFzZS9mdW5jdGlvbnMvXCIpKS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICBjb25zdCBjb25maWdzID0gZWZmZWN0aXZlUGF0aHMuZmlsdGVyKHAgPT4gIXAuc3RhcnRzV2l0aChcInNyYy9cIikgJiYgIXAuc3RhcnRzV2l0aChcInN1cGFiYXNlL2Z1bmN0aW9ucy9cIikgJiYgIXAuc3RhcnRzV2l0aChcInB1YmxpYy9cIikpLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm91bmRlZC0yeGwgYmFja2Ryb3AtYmx1ci14bCBiZy13aGl0ZS9bMC4wM10gc2hhZG93LVtpbnNldF8wXzFweF8xcHhfcmdiYSgyNTUsMjU1LDI1NSwwLjA0KV0gcC0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+UHJvamV0byBjb21wbGV0bzo8L3NwYW4+e1wiIFwifVxuICAgICAgICAgICAgICAgICAgICAgICAge3BhZ2VzfSBww6FnaW5hcyDCtyB7Y29tcG9uZW50c30gY29tcG9uZW50ZXMgwrcge2hvb2tzfSBob29rcyDCtyB7bGlic30gbGlicyDCtyB7ZWRnZUZuc30gZWRnZSBmdW5jdGlvbnN7Y29uZmlncyA+IDAgPyBgIMK3ICR7Y29uZmlnc30gY29uZmlnc2AgOiBcIlwifVxuICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmQvNzAgbXQtMSBmb250LW1vbm9cIj57ZWZmZWN0aXZlUGF0aHMubGVuZ3RofSBhcnF1aXZvcyB0b3RhbDwvcD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pKCl9XG5cbiAgICAgICAgICAgICAgICB7IXN5bmNpbmcgPyAoXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUdpdEh1YlN5bmN9IGRpc2FibGVkPXshc2VsZWN0ZWRSZXBvfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktMyByb3VuZGVkLTJ4bCBiZy1ncmFkaWVudC10by1yIGZyb20tZW1lcmFsZC01MDAgdG8tdGVhbC01MDAgdGV4dC13aGl0ZSBmb250LXNlbWlib2xkIHRleHQtc20gaG92ZXI6c2hhZG93LWxnIGhvdmVyOnNoYWRvdy1lbWVyYWxkLTUwMC8yNSB0cmFuc2l0aW9uLWFsbCBkaXNhYmxlZDpvcGFjaXR5LTUwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgIDxGb2xkZXJTeW5jIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPiBTaW5jcm9uaXphciB0dWRvXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBiYWNrZHJvcC1ibHVyLXhsIGJnLXdoaXRlL1swLjA0XSBzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDI1NSwyNTUsMjU1LDAuMDYpXSBwLTQgc3BhY2UteS0zXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57c3luY1N0YWdlfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC0yLjUgYmctd2hpdGUvWzAuMDZdIHJvdW5kZWQtZnVsbCBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBjbGFzc05hbWU9XCJoLWZ1bGwgYmctZ3JhZGllbnQtdG8tciBmcm9tLXByaW1hcnkgdG8tYW1iZXItNDAwIHJvdW5kZWQtZnVsbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IHdpZHRoOiAwIH19IGFuaW1hdGU9e3sgd2lkdGg6IGAke3N5bmNQcm9ncmVzc30lYCB9fSB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjMgfX0gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB0ZXh0LXJpZ2h0IGZvbnQtbW9ub1wiPntzeW5jUHJvZ3Jlc3N9JTwvcD5cbiAgICAgICAgICAgICAgICAgICAge3N5bmNMb2cubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiByZWY9e3N5bmNMb2dSZWZ9IGNsYXNzTmFtZT1cIm1heC1oLTQ0IG92ZXJmbG93LXktYXV0byBzcGFjZS15LTAuNSByb3VuZGVkLXhsIHAtMiBiZy13aGl0ZS9bMC4wMl1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzeW5jTG9nLm1hcCgoaXRlbSwgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHRleHQtWzExcHhdIHB5LTAuNVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtZm9yZWdyb3VuZCBmb250LW1vbm8gdHJ1bmNhdGUgbWF4LXctWzIyMHB4XVwiPntpdGVtLnBhdGguc3BsaXQoXCIvXCIpLnBvcCgpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bmb250LW1lZGl1bSBmbGV4LXNocmluay0wIG1sLTIgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uc3RhdHVzID09PSBcIm9rXCIgPyBcInRleHQtZW1lcmFsZC00MDBcIiA6IGl0ZW0uc3RhdHVzID09PSBcImVycm9yXCIgPyBcInRleHQtcmVkLTQwMFwiIDogXCJ0ZXh0LW11dGVkLWZvcmVncm91bmRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpdGVtLnN0YXR1cyA9PT0gXCJva1wiID8gXCLinJNcIiA6IGl0ZW0uc3RhdHVzID09PSBcImVycm9yXCIgPyBcIuKcl1wiIDogXCLigKZcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICAgICAgICAgIHtzeW5jUmVzdWx0ICYmICFzeW5jaW5nICYmIChcbiAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIGhlaWdodDogMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIGhlaWdodDogXCJhdXRvXCIgfX0gZXhpdD17eyBvcGFjaXR5OiAwLCBoZWlnaHQ6IDAgfX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJvdW5kZWQtMnhsIGJhY2tkcm9wLWJsdXIteGwgYmctZW1lcmFsZC01MDAvWzAuMDZdIHNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoNTIsMjExLDE1MywwLjEpLDBfMF8yMHB4X3JnYmEoMTYsMTg1LDEyOSwwLjA2KV0gcC00IHNwYWNlLXktMiBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWVtZXJhbGQtNDAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPENoZWNrQ2lyY2xlMiBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz4gU2luY3Jvbml6YWRvXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRTeW5jUmVzdWx0KG51bGwpfSBjbGFzc05hbWU9XCJ0ZXh0LWRlc3RydWN0aXZlIGhvdmVyOnRleHQtZGVzdHJ1Y3RpdmUvODBcIj48WCBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz48L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj57c3luY1Jlc3VsdC5yZXBvfSDCtyBicmFuY2g6IHtzeW5jUmVzdWx0LmJyYW5jaH08L3A+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTMgdGV4dC14c1wiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LWVtZXJhbGQtNDAwIGZvbnQtbWVkaXVtXCI+e3N5bmNSZXN1bHQucmVzdWx0cz8uZmlsdGVyKChyOiBhbnkpID0+IHIuc3RhdHVzID09PSBcIm9rXCIpLmxlbmd0aH0gZW52aWFkb3M8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIHtzeW5jUmVzdWx0LnJlc3VsdHM/LmZpbHRlcigocjogYW55KSA9PiByLnN0YXR1cyAhPT0gXCJva1wiKS5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXJlZC00MDAgZm9udC1tZWRpdW1cIj57c3luY1Jlc3VsdC5yZXN1bHRzPy5maWx0ZXIoKHI6IGFueSkgPT4gci5zdGF0dXMgIT09IFwib2tcIikubGVuZ3RofSBlcnJvczwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgKX1cblxuICAgICAgICB7YWN0aXZlVGFiID09PSBcImF0dWFsaXphY2FvXCIgJiYgKFxuICAgICAgICAgIDxtb3Rpb24uZGl2IGtleT1cImF0dWFsaXphY2FvXCIgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB4OiAxMiB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHg6IDAgfX0gZXhpdD17eyBvcGFjaXR5OiAwLCB4OiAtMTIgfX0gY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICB7LyogVmVyc2lvbiBpbmZvICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBiYWNrZHJvcC1ibHVyLXhsIGJnLXdoaXRlL1swLjA0XSBzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDI1NSwyNTUsMjU1LDAuMDYpXSBwLTQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTEwIHctMTAgcm91bmRlZC14bCBiZy1ncmFkaWVudC10by1iciBmcm9tLWJsdWUtNTAwLzIwIHRvLWluZGlnby02MDAvMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgc2hhZG93LWxnIHNoYWRvdy1ibHVlLTUwMC81XCI+XG4gICAgICAgICAgICAgICAgPEluZm8gY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LWJsdWUtNDAwXCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZFwiPlZlcnPDo28gYXR1YWw6IDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtbW9ubyB0ZXh0LXByaW1hcnlcIj57Y3VycmVudFZlcnNpb24gfHwgXCIuLi5cIn08L3NwYW4+PC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPkdlcmUgdW0gcGFjb3RlIHBhcmEgbWlncmFyIG91IGFwbGljYXIgdW1hIGF0dWFsaXphw6fDo288L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsvKiBFeHBvcnQgLyBJbXBvcnQgQ2FyZHMgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVVcGRhdGVFeHBvcnR9IGRpc2FibGVkPXt1cGRhdGVFeHBvcnRpbmd9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicmVsYXRpdmUgZ3JvdXAgcm91bmRlZC0yeGwgcC00IGJhY2tkcm9wLWJsdXIteGwgYmctd2hpdGUvWzAuMDRdIHNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoMjU1LDI1NSwyNTUsMC4wNildIGhvdmVyOmJnLXdoaXRlL1swLjA3XSBob3ZlcjpzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDI1NSwyNTUsMjU1LDAuMSksMF8wXzIwcHhfcmdiYSg1OSwxMzAsMjQ2LDAuMDgpXSB0cmFuc2l0aW9uLWFsbCB0ZXh0LWxlZnQgZGlzYWJsZWQ6b3BhY2l0eS02MFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC0xMCB3LTEwIHJvdW5kZWQteGwgYmctZ3JhZGllbnQtdG8tYnIgZnJvbS1ibHVlLTUwMC8yMCB0by1ibHVlLTYwMC8xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBtYi0zIHNoYWRvdy1sZyBzaGFkb3ctYmx1ZS01MDAvNVwiPlxuICAgICAgICAgICAgICAgICAge3VwZGF0ZUV4cG9ydGluZyA/IDxMb2FkZXIyIGNsYXNzTmFtZT1cImgtNCB3LTQgYW5pbWF0ZS1zcGluIHRleHQtYmx1ZS00MDBcIiAvPiA6IDxBcnJvd0Rvd25Ub0xpbmUgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LWJsdWUtNDAwXCIgLz59XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZFwiPnt1cGRhdGVFeHBvcnRpbmcgPyBcIkdlcmFuZG8uLi5cIiA6IFwiR2VyYXIgUGFjb3RlXCJ9PC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtdC0wLjVcIj5FeHBvcnRhciBhdHVhbGl6YcOnw6NvPC9wPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHVwZGF0ZUZpbGVJbnB1dFJlZi5jdXJyZW50Py5jbGljaygpfSBkaXNhYmxlZD17dXBkYXRlSW1wb3J0aW5nfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlbGF0aXZlIGdyb3VwIHJvdW5kZWQtMnhsIHAtNCBiYWNrZHJvcC1ibHVyLXhsIGJnLXdoaXRlL1swLjA0XSBzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDI1NSwyNTUsMjU1LDAuMDYpXSBob3ZlcjpiZy13aGl0ZS9bMC4wN10gaG92ZXI6c2hhZG93LVtpbnNldF8wXzFweF8xcHhfcmdiYSgyNTUsMjU1LDI1NSwwLjEpLDBfMF8yMHB4X3JnYmEoMTYsMTg1LDEyOSwwLjA4KV0gdHJhbnNpdGlvbi1hbGwgdGV4dC1sZWZ0IGRpc2FibGVkOm9wYWNpdHktNjBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtMTAgdy0xMCByb3VuZGVkLXhsIGJnLWdyYWRpZW50LXRvLWJyIGZyb20tZW1lcmFsZC01MDAvMjAgdG8tZW1lcmFsZC02MDAvMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWItMyBzaGFkb3ctbGcgc2hhZG93LWVtZXJhbGQtNTAwLzVcIj5cbiAgICAgICAgICAgICAgICAgIHt1cGRhdGVJbXBvcnRpbmcgPyA8TG9hZGVyMiBjbGFzc05hbWU9XCJoLTQgdy00IGFuaW1hdGUtc3BpbiB0ZXh0LWVtZXJhbGQtNDAwXCIgLz4gOiA8VXBsb2FkQ2xvdWQgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LWVtZXJhbGQtNDAwXCIgLz59XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZFwiPnt1cGRhdGVJbXBvcnRpbmcgPyBcIkFwbGljYW5kby4uLlwiIDogXCJBcGxpY2FyIEF0dWFsaXphw6fDo29cIn08L3A+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG10LTAuNVwiPkltcG9ydGFyIHBhY290ZSAuemlwPC9wPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8aW5wdXQgcmVmPXt1cGRhdGVGaWxlSW5wdXRSZWZ9IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiLnppcFwiIG9uQ2hhbmdlPXtoYW5kbGVVcGRhdGVJbXBvcnR9IGNsYXNzTmFtZT1cImhpZGRlblwiIC8+XG5cbiAgICAgICAgICAgIHsvKiBFeHBvcnQgUHJvZ3Jlc3MgKi99XG4gICAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICAgICAgICB7dXBkYXRlRXhwb3J0aW5nICYmIChcbiAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIGhlaWdodDogMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIGhlaWdodDogXCJhdXRvXCIgfX0gZXhpdD17eyBvcGFjaXR5OiAwLCBoZWlnaHQ6IDAgfX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJvdW5kZWQtMnhsIGJhY2tkcm9wLWJsdXIteGwgYmctYmx1ZS01MDAvWzAuMDZdIHNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoNTksMTMwLDI0NiwwLjEpXSBwLTQgc3BhY2UteS0zIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZFwiPnt1cGRhdGVFeHBvcnRTdGFnZX08L3A+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLTIuNSBiZy13aGl0ZS9bMC4wNl0gcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBjbGFzc05hbWU9XCJoLWZ1bGwgYmctZ3JhZGllbnQtdG8tciBmcm9tLWJsdWUtNTAwIHRvLWluZGlnby00MDAgcm91bmRlZC1mdWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IHdpZHRoOiAwIH19IGFuaW1hdGU9e3sgd2lkdGg6IGAke3VwZGF0ZUV4cG9ydFByb2dyZXNzfSVgIH19IHRyYW5zaXRpb249e3sgZHVyYXRpb246IDAuMyB9fSAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmQgdGV4dC1yaWdodCBmb250LW1vbm9cIj57dXBkYXRlRXhwb3J0UHJvZ3Jlc3N9JTwvcD5cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cblxuICAgICAgICAgICAgey8qIEltcG9ydCBQcm9ncmVzcyAqL31cbiAgICAgICAgICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICAgICAgICAgIHt1cGRhdGVJbXBvcnRpbmcgJiYgKFxuICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgaGVpZ2h0OiAwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgaGVpZ2h0OiBcImF1dG9cIiB9fSBleGl0PXt7IG9wYWNpdHk6IDAsIGhlaWdodDogMCB9fVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicm91bmRlZC0yeGwgYmFja2Ryb3AtYmx1ci14bCBiZy1lbWVyYWxkLTUwMC9bMC4wNl0gc2hhZG93LVtpbnNldF8wXzFweF8xcHhfcmdiYSgxNiwxODUsMTI5LDAuMSldIHAtNCBzcGFjZS15LTMgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+e3VwZGF0ZUltcG9ydFN0YWdlfTwvcD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtMi41IGJnLXdoaXRlL1swLjA2XSByb3VuZGVkLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGNsYXNzTmFtZT1cImgtZnVsbCBiZy1ncmFkaWVudC10by1yIGZyb20tZW1lcmFsZC01MDAgdG8tZ3JlZW4tNDAwIHJvdW5kZWQtZnVsbFwiXG4gICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyB3aWR0aDogMCB9fSBhbmltYXRlPXt7IHdpZHRoOiBgJHt1cGRhdGVJbXBvcnRQcm9ncmVzc30lYCB9fSB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjMgfX0gLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRleHQtcmlnaHQgZm9udC1tb25vXCI+e3VwZGF0ZUltcG9ydFByb2dyZXNzfSU8L3A+XG4gICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG5cbiAgICAgICAgICAgIHsvKiBVcGRhdGUgUmVzdWx0ICovfVxuICAgICAgICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICAgICAge3VwZGF0ZVJlc3VsdCAmJiAoXG4gICAgICAgICAgICAgICAgPG1vdGlvbi5kaXYgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBoZWlnaHQ6IDAgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBoZWlnaHQ6IFwiYXV0b1wiIH19IGV4aXQ9e3sgb3BhY2l0eTogMCwgaGVpZ2h0OiAwIH19XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBiYWNrZHJvcC1ibHVyLXhsIGJnLWVtZXJhbGQtNTAwL1swLjA2XSBzaGFkb3ctW2luc2V0XzBfMXB4XzFweF9yZ2JhKDUyLDIxMSwxNTMsMC4xKSwwXzBfMjBweF9yZ2JhKDE2LDE4NSwxMjksMC4wNildIHAtNCBzcGFjZS15LTMgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1lbWVyYWxkLTQwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxDaGVja0NpcmNsZTIgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IEF0dWFsaXphw6fDo28gQXBsaWNhZGFcbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFVwZGF0ZVJlc3VsdChudWxsKX0gY2xhc3NOYW1lPVwidGV4dC1kZXN0cnVjdGl2ZSBob3Zlcjp0ZXh0LWRlc3RydWN0aXZlLzgwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPFggY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTQgdGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1tb25vXCI+dnt1cGRhdGVSZXN1bHQuZnJvbV92ZXJzaW9ufSDihpIgdnt1cGRhdGVSZXN1bHQudG9fdmVyc2lvbn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCI+PENsb2NrIGNsYXNzTmFtZT1cImgtMyB3LTNcIiAvPiB7dXBkYXRlUmVzdWx0Lm1hbmlmZXN0Py5jcmVhdGVkX2F0ID8gZm9ybWF0RnVsbERhdGVUaW1lQlIodXBkYXRlUmVzdWx0Lm1hbmlmZXN0LmNyZWF0ZWRfYXQpIDogXCLigJRcIn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHt1cGRhdGVSZXN1bHQucmVzdG9yZT8ucmVzdWx0cyAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0xIG1heC1oLTQwIG92ZXJmbG93LXktYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICAgIHt1cGRhdGVSZXN1bHQucmVzdG9yZS5yZXN1bHRzLm1hcCgocjogYW55LCBpOiBudW1iZXIpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gdGV4dC14cyBweS0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtZm9yZWdyb3VuZCBmb250LW1vbm9cIj57ci50YWJsZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGZvbnQtbWVkaXVtICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgci5zdGF0dXMgPT09IFwicmVzdG9yZWRcIiA/IFwidGV4dC1lbWVyYWxkLTQwMFwiIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByLnN0YXR1cyA9PT0gXCJza2lwcGVkXCIgPyBcInRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByLnN0YXR1cyA9PT0gXCJlcnJvclwiID8gXCJ0ZXh0LXJlZC00MDBcIiA6IFwidGV4dC1hbWJlci00MDBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3Iuc3RhdHVzID09PSBcInJlc3RvcmVkXCIgPyBgJHtyLmNvdW50fSByZWdpc3Ryb3NgIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgci5zdGF0dXMgPT09IFwic2tpcHBlZFwiID8gXCJwdWxhZG9cIiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIuc3RhdHVzID09PSBcImVtcHR5XCIgPyBcInZhemlvXCIgOiByLmVycm9yIHx8IFwiZXJyb1wifVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxuXG4gICAgICAgICAgICB7LyogVXBkYXRlIEhpc3RvcnkgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdW5kZWQtMnhsIGJhY2tkcm9wLWJsdXIteGwgYmctd2hpdGUvWzAuMDRdIHNoYWRvdy1baW5zZXRfMF8xcHhfMXB4X3JnYmEoMjU1LDI1NSwyNTUsMC4wNildIHAtNCBzcGFjZS15LTNcIj5cbiAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93SGlzdG9yeSghc2hvd0hpc3RvcnkpfSBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gdy1mdWxsXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgPENsb2NrIGNsYXNzTmFtZT1cImgtNCB3LTQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+SGlzdMOzcmljbyBkZSBBdHVhbGl6YcOnw7VlczwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmQgZm9udC1tb25vXCI+e3VwZGF0ZUhpc3RvcnkubGVuZ3RofSByZWdpc3Ryb3M8L3NwYW4+XG4gICAgICAgICAgICAgICAgICB7c2hvd0hpc3RvcnkgPyA8Q2hldnJvbkRvd24gY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjUgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz4gOiA8Q2hldnJvblJpZ2h0IGNsYXNzTmFtZT1cImgtMy41IHctMy41IHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiIC8+fVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICAgICAgICB7c2hvd0hpc3RvcnkgJiYgKFxuICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXYgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBoZWlnaHQ6IDAgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBoZWlnaHQ6IFwiYXV0b1wiIH19IGV4aXQ9e3sgb3BhY2l0eTogMCwgaGVpZ2h0OiAwIH19IGNsYXNzTmFtZT1cIm92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgICB7dXBkYXRlSGlzdG9yeS5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHB5LTJcIj5OZW5odW1hIGF0dWFsaXphw6fDo28gYXBsaWNhZGEgYWluZGEuPC9wPlxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yIG1heC1oLTYwIG92ZXJmbG93LXktYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3VwZGF0ZUhpc3RvcnkubWFwKChoOiBhbnkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2guaWR9IGNsYXNzTmFtZT1cInJvdW5kZWQteGwgYmctd2hpdGUvWzAuMDNdIHAtMyBzcGFjZS15LTEuNVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kIGZvbnQtbW9ub1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aC5wcmV2aW91c192ZXJzaW9uID8gYHYke2gucHJldmlvdXNfdmVyc2lvbn0g4oaSIGAgOiBcIlwifXZ7aC52ZXJzaW9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmb3JtYXRGdWxsRGF0ZVRpbWVCUihoLmFwcGxpZWRfYXQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMyB0ZXh0LVsxMHB4XVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1lbWVyYWxkLTQwMFwiPuKckyB7aC50YWJsZXNfcmVzdG9yZWR9IHJlc3RhdXJhZGFzPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2gudGFibGVzX3NraXBwZWQgPiAwICYmIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPuKKmCB7aC50YWJsZXNfc2tpcHBlZH0gcHVsYWRhczwvc3Bhbj59XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aC50YWJsZXNfZmFpbGVkID4gMCAmJiA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXJlZC00MDBcIj7inJcge2gudGFibGVzX2ZhaWxlZH0gZXJyb3M8L3NwYW4+fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1ibHVlLTQwMFwiPntoLnRvdGFsX3JlY29yZHN9IHJlZ2lzdHJvczwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aC5iYWNrdXBfZGF0ZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgUGFjb3RlIGRlIHtmb3JtYXREYXRlRnVsbEJSKGguYmFja3VwX2RhdGUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aC5iYWNrdXBfYnkgPyBgIHBvciAke2guYmFja3VwX2J5fWAgOiBcIlwifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIEhvdyBpdCB3b3JrcyAqL31cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm91bmRlZC0yeGwgYmFja2Ryb3AtYmx1ci14bCBiZy13aGl0ZS9bMC4wM10gc2hhZG93LVtpbnNldF8wXzFweF8xcHhfcmdiYSgyNTUsMjU1LDI1NSwwLjA0KV0gcC00IHNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPkNvbW8gZnVuY2lvbmE8L3A+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0xLjUgdGV4dC1bMTFweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgPHA+8J+TpiA8YiBjbGFzc05hbWU9XCJ0ZXh0LWZvcmVncm91bmRcIj5HZXJhciBQYWNvdGU8L2I+IOKAlCBFeHBvcnRhIGJhbmNvIGRlIGRhZG9zICsgY8OzZGlnby1mb250ZSBjb21vIHVtIFpJUCB2ZXJzaW9uYWRvPC9wPlxuICAgICAgICAgICAgICAgIDxwPvCflIQgPGIgY2xhc3NOYW1lPVwidGV4dC1mb3JlZ3JvdW5kXCI+QXBsaWNhciBBdHVhbGl6YcOnw6NvPC9iPiDigJQgSW1wb3J0YSBvIFpJUCBlIHJlc3RhdXJhIG9zIGRhZG9zIHZpYSB1cHNlcnQgaW50ZWxpZ2VudGUgKHNlbSBhcGFnYXIgZGFkb3MgZXhpc3RlbnRlcyk8L3A+XG4gICAgICAgICAgICAgICAgPHA+8J+UoiA8YiBjbGFzc05hbWU9XCJ0ZXh0LWZvcmVncm91bmRcIj5WZXJzw6NvPC9iPiDigJQgSW5jcmVtZW50YWRhIGF1dG9tYXRpY2FtZW50ZSBhIGNhZGEgYXR1YWxpemHDp8OjbyBhcGxpY2FkYTwvcD5cbiAgICAgICAgICAgICAgICA8cD7wn5OLIDxiIGNsYXNzTmFtZT1cInRleHQtZm9yZWdyb3VuZFwiPkhpc3TDs3JpY288L2I+IOKAlCBDYWRhIGF0dWFsaXphw6fDo28gw6kgcmVnaXN0cmFkYSBjb20gdmVyc8OjbywgZGF0YSBlIHJlc3VsdGFkbzwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICl9XG4gICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cblxuICAgICAgey8qIFVuaWZpZWQgQ29uZmlybWF0aW9uIE1vZGFsICovfVxuICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAge2NvbmZpcm1Nb2RhbC5vcGVuICYmIChcbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX1cbiAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCB6LVsxMDBdIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHAtNCBiZy1ibGFjay82MCBiYWNrZHJvcC1ibHVyLXNtXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldENvbmZpcm1Nb2RhbChwcmV2ID0+ICh7IC4uLnByZXYsIG9wZW46IGZhbHNlIH0pKX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjksIHk6IDIwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgc2NhbGU6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45LCB5OiAyMCB9fVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIGRhbXBpbmc6IDI1LCBzdGlmZm5lc3M6IDMwMCB9fVxuICAgICAgICAgICAgICBvbkNsaWNrPXtlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCl9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBtYXgtdy1tZCByb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLWJvcmRlci80MCBiZy1jYXJkLzk1IGJhY2tkcm9wLWJsdXIteGwgc2hhZG93LTJ4bCBvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7LyogSGVhZGVyICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNiBwYi00IHRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BteC1hdXRvIGgtMTQgdy0xNCByb3VuZGVkLTJ4bCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBtYi00IHNoYWRvdy1sZyAke1xuICAgICAgICAgICAgICAgICAgY29uZmlybU1vZGFsLmljb24gPT09IFwicmVzdG9yZVwiXG4gICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1iciBmcm9tLWFtYmVyLTUwMC8yMCB0by1vcmFuZ2UtNTAwLzIwIHNoYWRvdy1hbWJlci01MDAvMTBcIlxuICAgICAgICAgICAgICAgICAgICA6IGNvbmZpcm1Nb2RhbC5pY29uID09PSBcInVwZGF0ZVwiXG4gICAgICAgICAgICAgICAgICAgID8gXCJiZy1ncmFkaWVudC10by1iciBmcm9tLWJsdWUtNTAwLzIwIHRvLWluZGlnby01MDAvMjAgc2hhZG93LWJsdWUtNTAwLzEwXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcImJnLWdyYWRpZW50LXRvLWJyIGZyb20tZW1lcmFsZC01MDAvMjAgdG8tdGVhbC01MDAvMjAgc2hhZG93LWVtZXJhbGQtNTAwLzEwXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgICB7Y29uZmlybU1vZGFsLmljb24gPT09IFwicmVzdG9yZVwiID8gKFxuICAgICAgICAgICAgICAgICAgICA8QWxlcnRUcmlhbmdsZSBjbGFzc05hbWU9XCJoLTYgdy02IHRleHQtYW1iZXItNDAwXCIgLz5cbiAgICAgICAgICAgICAgICAgICkgOiBjb25maXJtTW9kYWwuaWNvbiA9PT0gXCJ1cGRhdGVcIiA/IChcbiAgICAgICAgICAgICAgICAgICAgPFBhY2thZ2VDaGVjayBjbGFzc05hbWU9XCJoLTYgdy02IHRleHQtYmx1ZS00MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPEdpdGh1YiBjbGFzc05hbWU9XCJoLTYgdy02IHRleHQtZW1lcmFsZC00MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+e2NvbmZpcm1Nb2RhbC50aXRsZX08L2gzPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG10LTEuNSBsZWFkaW5nLXJlbGF4ZWRcIj57Y29uZmlybU1vZGFsLmRlc2NyaXB0aW9ufTwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgey8qIERldGFpbHMgKi99XG4gICAgICAgICAgICAgIHtjb25maXJtTW9kYWwuZGV0YWlscyAmJiBjb25maXJtTW9kYWwuZGV0YWlscy5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm14LTYgbWItNCBwLTMuNSByb3VuZGVkLXhsIGJnLW11dGVkLzUwIGJvcmRlciBib3JkZXItYm9yZGVyLzMwXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICAgICAgICB7Y29uZmlybU1vZGFsLmRldGFpbHMubWFwKChkZXRhaWwsIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIuNSB0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BoLTEuNSB3LTEuNSByb3VuZGVkLWZ1bGwgZmxleC1zaHJpbmstMCAke1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25maXJtTW9kYWwuaWNvbiA9PT0gXCJyZXN0b3JlXCIgPyBcImJnLWFtYmVyLTQwMC83MFwiIDogY29uZmlybU1vZGFsLmljb24gPT09IFwidXBkYXRlXCIgPyBcImJnLWJsdWUtNDAwLzcwXCIgOiBcImJnLWVtZXJhbGQtNDAwLzcwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1gfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAge2RldGFpbH1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICB7LyogQWN0aW9ucyAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTYgcHQtMiBmbGV4IGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Q29uZmlybU1vZGFsKHByZXYgPT4gKHsgLi4ucHJldiwgb3BlbjogZmFsc2UgfSkpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIHB5LTMgcm91bmRlZC14bCBiZy1tdXRlZCB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbSBmb250LW1lZGl1bSBob3ZlcjpiZy1tdXRlZC84MCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDBcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIENhbmNlbGFyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgb25DbGljaz17Y29uZmlybU1vZGFsLm9uQ29uZmlybX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtMSBweS0zIHJvdW5kZWQteGwgdGV4dC1zbSBmb250LXNlbWlib2xkIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiAke1xuICAgICAgICAgICAgICAgICAgICBjb25maXJtTW9kYWwuaWNvbiA9PT0gXCJyZXN0b3JlXCJcbiAgICAgICAgICAgICAgICAgICAgICA/IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLWFtYmVyLTUwMCB0by1vcmFuZ2UtNTAwIHRleHQtd2hpdGUgaG92ZXI6c2hhZG93LWxnIGhvdmVyOnNoYWRvdy1hbWJlci01MDAvMjVcIlxuICAgICAgICAgICAgICAgICAgICAgIDogY29uZmlybU1vZGFsLmljb24gPT09IFwidXBkYXRlXCJcbiAgICAgICAgICAgICAgICAgICAgICA/IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLWJsdWUtNTAwIHRvLWluZGlnby01MDAgdGV4dC13aGl0ZSBob3ZlcjpzaGFkb3ctbGcgaG92ZXI6c2hhZG93LWJsdWUtNTAwLzI1XCJcbiAgICAgICAgICAgICAgICAgICAgICA6IFwiYmctZ3JhZGllbnQtdG8tciBmcm9tLWVtZXJhbGQtNTAwIHRvLXRlYWwtNTAwIHRleHQtd2hpdGUgaG92ZXI6c2hhZG93LWxnIGhvdmVyOnNoYWRvdy1lbWVyYWxkLTUwMC8yNVwiXG4gICAgICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7Y29uZmlybU1vZGFsLmljb24gPT09IFwicmVzdG9yZVwiID8gKFxuICAgICAgICAgICAgICAgICAgICA8PjxVcGxvYWQgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IFJlc3RhdXJhcjwvPlxuICAgICAgICAgICAgICAgICAgKSA6IGNvbmZpcm1Nb2RhbC5pY29uID09PSBcInVwZGF0ZVwiID8gKFxuICAgICAgICAgICAgICAgICAgICA8PjxQYWNrYWdlQ2hlY2sgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IEFwbGljYXI8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgIDw+PEZvbGRlclN5bmMgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IFNpbmNyb25pemFyPC8+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICl9XG4gICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cbiAgICA8L21vdGlvbi5kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJ1c2VSZWYiLCJ1c2VFZmZlY3QiLCJtb3Rpb24iLCJBbmltYXRlUHJlc2VuY2UiLCJVcGxvYWQiLCJEYXRhYmFzZSIsIkxvYWRlcjIiLCJDaGVja0NpcmNsZTIiLCJBbGVydFRyaWFuZ2xlIiwiR2l0aHViIiwiUmVmcmVzaEN3IiwiRm9sZGVyU3luYyIsIkFycm93RG93blRvTGluZSIsIkFycm93VXBGcm9tTGluZSIsIlNoaWVsZCIsIkNsb2NrIiwiSGFyZERyaXZlIiwiQ2hldnJvbkRvd24iLCJDaGV2cm9uUmlnaHQiLCJYIiwiRXllIiwiRXllT2ZmIiwiU2F2ZSIsIkNvZGUyIiwiUGFja2FnZUNoZWNrIiwiVXBsb2FkQ2xvdWQiLCJJbmZvIiwic3VwYWJhc2UiLCJmb3JtYXRGdWxsRGF0ZVRpbWVCUiIsImZvcm1hdERhdGVGdWxsQlIiLCJzdHlsZWRUb2FzdCIsInRvYXN0IiwiSlNaaXAiLCJUQUJMRVNfTEFCRUwiLCJTT1VSQ0VfUEFUSFMiLCJCYWNrdXBTZWN0aW9uIiwiYWN0aXZlVGFiIiwic2V0QWN0aXZlVGFiIiwiaW5jbHVkZURiIiwic2V0SW5jbHVkZURiIiwiaW5jbHVkZVNvdXJjZSIsInNldEluY2x1ZGVTb3VyY2UiLCJleHBvcnRpbmciLCJzZXRFeHBvcnRpbmciLCJleHBvcnRQcm9ncmVzcyIsInNldEV4cG9ydFByb2dyZXNzIiwiZXhwb3J0U3RhZ2UiLCJzZXRFeHBvcnRTdGFnZSIsImltcG9ydGluZyIsInNldEltcG9ydGluZyIsInJlc3RvcmVSZXN1bHQiLCJzZXRSZXN0b3JlUmVzdWx0IiwiZmlsZUlucHV0UmVmIiwicmVwb3MiLCJzZXRSZXBvcyIsImxvYWRpbmdSZXBvcyIsInNldExvYWRpbmdSZXBvcyIsInNlbGVjdGVkUmVwbyIsInNldFNlbGVjdGVkUmVwbyIsInN5bmNpbmciLCJzZXRTeW5jaW5nIiwic3luY1Jlc3VsdCIsInNldFN5bmNSZXN1bHQiLCJzeW5jUHJvZ3Jlc3MiLCJzZXRTeW5jUHJvZ3Jlc3MiLCJzeW5jU3RhZ2UiLCJzZXRTeW5jU3RhZ2UiLCJzeW5jTG9nIiwic2V0U3luY0xvZyIsInN5bmNMb2dSZWYiLCJ1cGRhdGVFeHBvcnRpbmciLCJzZXRVcGRhdGVFeHBvcnRpbmciLCJ1cGRhdGVFeHBvcnRQcm9ncmVzcyIsInNldFVwZGF0ZUV4cG9ydFByb2dyZXNzIiwidXBkYXRlRXhwb3J0U3RhZ2UiLCJzZXRVcGRhdGVFeHBvcnRTdGFnZSIsInVwZGF0ZUltcG9ydGluZyIsInNldFVwZGF0ZUltcG9ydGluZyIsInVwZGF0ZUltcG9ydFByb2dyZXNzIiwic2V0VXBkYXRlSW1wb3J0UHJvZ3Jlc3MiLCJ1cGRhdGVJbXBvcnRTdGFnZSIsInNldFVwZGF0ZUltcG9ydFN0YWdlIiwidXBkYXRlUmVzdWx0Iiwic2V0VXBkYXRlUmVzdWx0IiwiY3VycmVudFZlcnNpb24iLCJzZXRDdXJyZW50VmVyc2lvbiIsInVwZGF0ZUZpbGVJbnB1dFJlZiIsInBlbmRpbmdVcGRhdGVGaWxlIiwic2V0UGVuZGluZ1VwZGF0ZUZpbGUiLCJwZW5kaW5nTWFuaWZlc3QiLCJzZXRQZW5kaW5nTWFuaWZlc3QiLCJ1cGRhdGVIaXN0b3J5Iiwic2V0VXBkYXRlSGlzdG9yeSIsInNob3dIaXN0b3J5Iiwic2V0U2hvd0hpc3RvcnkiLCJjb25maXJtTW9kYWwiLCJzZXRDb25maXJtTW9kYWwiLCJvcGVuIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsIm9uQ29uZmlybSIsImdpdGh1YlBhdCIsInNldEdpdGh1YlBhdCIsInNob3dQYXQiLCJzZXRTaG93UGF0Iiwic2F2aW5nUGF0Iiwic2V0U2F2aW5nUGF0IiwicGF0TG9hZGVkIiwic2V0UGF0TG9hZGVkIiwiZHluYW1pY1BhdGhzIiwic2V0RHluYW1pY1BhdGhzIiwiaW50ZWdyaXR5Q2hlY2tpbmciLCJzZXRJbnRlZ3JpdHlDaGVja2luZyIsImludGVncml0eVJlc3VsdCIsInNldEludGVncml0eVJlc3VsdCIsImVmZmVjdGl2ZVBhdGhzIiwibG9hZFBhdCIsImRhdGEiLCJmcm9tIiwic2VsZWN0IiwiZXEiLCJtYXliZVNpbmdsZSIsInZhbHVlIiwibG9hZE1hbmlmZXN0IiwicGF0aHMiLCJKU09OIiwicGFyc2UiLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwibG9hZFZlcnNpb24iLCJsb2FkSGlzdG9yeSIsIm9yZGVyIiwiYXNjZW5kaW5nIiwibGltaXQiLCJzYXZlR2l0aHViUGF0IiwiZXJyb3IiLCJ1cHNlcnQiLCJrZXkiLCJvbkNvbmZsaWN0Iiwic3VjY2VzcyIsImVyciIsIm1lc3NhZ2UiLCJsb2FkUmVwb3MiLCJzZXNzaW9uIiwiYXV0aCIsImdldFNlc3Npb24iLCJFcnJvciIsInJlc3AiLCJmZXRjaCIsImVudiIsIlZJVEVfU1VQQUJBU0VfVVJMIiwiaGVhZGVycyIsIkF1dGhvcml6YXRpb24iLCJhY2Nlc3NfdG9rZW4iLCJhcGlrZXkiLCJWSVRFX1NVUEFCQVNFX1BVQkxJU0hBQkxFX0tFWSIsIm9rIiwianNvbiIsImNhdGNoIiwic3RhdHVzIiwiZnVsbF9uYW1lIiwiaGFuZGxlR2l0SHViU3luYyIsImRldGFpbHMiLCJpY29uIiwicHJldiIsImV4ZWN1dGVHaXRIdWJTeW5jIiwiYWxsUGF0aHMiLCJmaWxlcyIsImkiLCJNYXRoIiwicm91bmQiLCJyIiwiVVJMIiwid2luZG93IiwibG9jYXRpb24iLCJvcmlnaW4iLCJocmVmIiwidGV4dCIsInB1c2giLCJwYXRoIiwiY29udGVudCIsImluaXRpYWxMb2ciLCJtYXAiLCJmIiwicmVwbyIsImZpbmQiLCJ0YXJnZXRCcmFuY2giLCJkZWZhdWx0X2JyYW5jaCIsIkJBVENIX1NJWkUiLCJ0b3RhbEJhdGNoZXMiLCJjZWlsIiwiYWxsUmVzdWx0cyIsImIiLCJiYXRjaEZpbGVzIiwic2xpY2UiLCJtaW4iLCJtZXRob2QiLCJib2R5Iiwic3RyaW5naWZ5IiwiYnJhbmNoIiwicmVzdWx0IiwiYmF0Y2hSZXN1bHRzIiwicmVzdWx0cyIsInVwZGF0ZWQiLCJpZHgiLCJmaW5kSW5kZXgiLCJsIiwic2V0VGltZW91dCIsImN1cnJlbnQiLCJzY3JvbGxUbyIsInRvcCIsInNjcm9sbEhlaWdodCIsImJlaGF2aW9yIiwib2tDb3VudCIsImZpbHRlciIsImVyckNvdW50IiwiaGFuZGxlRXhwb3J0IiwiemlwIiwidG90YWxTdGVwcyIsImN1cnJlbnRTdGVwIiwiaW5jbHVkZURhdGFiYXNlIiwiZGJaaXBEYXRhIiwiYXJyYXlCdWZmZXIiLCJkYlppcCIsImxvYWRBc3luYyIsImZpbGUiLCJPYmplY3QiLCJlbnRyaWVzIiwiZGlyIiwiYXN5bmMiLCJzb3VyY2VGb2xkZXIiLCJmb2xkZXIiLCJmZXRjaGVkIiwiZmlsZVBhdGgiLCJzcGxpdCIsInBvcCIsInZlcnNpb24iLCJjcmVhdGVkX2F0IiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwiaW5jbHVkZV9kYXRhYmFzZSIsImluY2x1ZGVfc291cmNlIiwic291cmNlX2ZpbGVzIiwidGFibGVzIiwiYmxvYiIsImdlbmVyYXRlQXN5bmMiLCJ0eXBlIiwiY29tcHJlc3Npb24iLCJ1cmwiLCJjcmVhdGVPYmplY3RVUkwiLCJhIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZG93bmxvYWQiLCJjbGljayIsInJldm9rZU9iamVjdFVSTCIsImhhbmRsZUltcG9ydCIsImUiLCJ0YXJnZXQiLCJuYW1lIiwiZW5kc1dpdGgiLCJleGVjdXRlSW1wb3J0IiwiaGFuZGxlVXBkYXRlRXhwb3J0Iiwic291cmNlX3BhdGhzIiwiaGFuZGxlVXBkYXRlSW1wb3J0IiwibWFuaWZlc3RGaWxlIiwibWFuaWZlc3QiLCJkYlRhYmxlQ291bnQiLCJzdGFydHNXaXRoIiwiX2RiVGFibGVDb3VudCIsImNvbmZpcm1BbmRBcHBseVVwZGF0ZSIsImJhY2t1cEluZm9GaWxlIiwiaGFzRGJGaWxlcyIsInppcEZpbGUiLCJyZXN0b3JlUmVzdWx0cyIsImRiQmxvYiIsInByZXZpb3VzVmVyc2lvbiIsIm5ld1ZlcnNpb24iLCJpbmNyZW1lbnRWZXJzaW9uIiwidGFibGVzUmVzdG9yZWQiLCJ0YWJsZXNTa2lwcGVkIiwidGFibGVzRmFpbGVkIiwidG90YWxSZWNvcmRzIiwicmVkdWNlIiwic3VtIiwiY291bnQiLCJ1c2VyIiwiZ2V0VXNlciIsImluc2VydCIsInByZXZpb3VzX3ZlcnNpb24iLCJiYWNrdXBfZGF0ZSIsImJhY2t1cF9ieSIsImNyZWF0ZWRfYnkiLCJ0YWJsZXNfcmVzdG9yZWQiLCJ0YWJsZXNfc2tpcHBlZCIsInRhYmxlc19mYWlsZWQiLCJ0b3RhbF9yZWNvcmRzIiwiYXBwbGllZF9ieSIsImlkIiwiaGlzdG9yeURhdGEiLCJmcm9tX3ZlcnNpb24iLCJ0b192ZXJzaW9uIiwicmVzdG9yZSIsImNhbmNlbFVwZGF0ZSIsInJ1bkludGVncml0eUNoZWNrIiwibWlzc2luZyIsImZvdW5kIiwidG90YWwiLCJ2IiwicGFydHMiLCJOdW1iZXIiLCJqb2luIiwidGFicyIsImxhYmVsIiwiZGl2IiwiaW5pdGlhbCIsIm9wYWNpdHkiLCJ5IiwiYW5pbWF0ZSIsImNsYXNzTmFtZSIsImgyIiwicCIsInQiLCJidXR0b24iLCJvbkNsaWNrIiwibW9kZSIsIngiLCJleGl0IiwiZGlzYWJsZWQiLCJpbnB1dCIsInJlZiIsImFjY2VwdCIsIm9uQ2hhbmdlIiwiaGVpZ2h0Iiwid2lkdGgiLCJ0cmFuc2l0aW9uIiwiZHVyYXRpb24iLCJzcGFuIiwidGFibGUiLCJwbGFjZWhvbGRlciIsInJlbCIsImNvZGUiLCJvcHRpb24iLCJwcml2YXRlIiwicGFnZXMiLCJjb21wb25lbnRzIiwiaG9va3MiLCJsaWJzIiwiZWRnZUZucyIsImNvbmZpZ3MiLCJpdGVtIiwiaCIsImFwcGxpZWRfYXQiLCJzY2FsZSIsImRhbXBpbmciLCJzdGlmZm5lc3MiLCJzdG9wUHJvcGFnYXRpb24iLCJoMyIsImRldGFpbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsUUFBUSxFQUFFQyxNQUFNLEVBQUVDLFNBQVMsUUFBUSxRQUFRO0FBQ3BELFNBQVNDLE1BQU0sRUFBRUMsZUFBZSxRQUFRLGdCQUFnQjtBQUN4RCxTQUNZQyxNQUFNLEVBQUVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxZQUFZLEVBQUVDLGFBQWEsRUFDaEVDLE1BQU0sRUFBRUMsU0FBUyxFQUFFQyxVQUFVLEVBQUVDLGVBQWUsRUFBRUMsZUFBZSxFQUNsREMsTUFBTSxFQUFFQyxLQUFLLEVBQUVDLFNBQVMsRUFBRUMsV0FBVyxFQUFFQyxZQUFZLEVBQUVDLENBQUMsRUFDbkVDLEdBQUcsRUFBRUMsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLEtBQUssRUFBRUMsWUFBWSxFQUFFQyxXQUFXLEVBQUVDLElBQUks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