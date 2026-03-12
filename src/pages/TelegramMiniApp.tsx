import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/TelegramMiniApp.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/TelegramMiniApp.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$(), _s1 = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"]; const useCallback = __vite__cjsImport3_react["useCallback"];
import AnimatedCheck from "/src/components/AnimatedCheck.tsx";
import { supabase } from "/src/integrations/supabase/client.ts";
import { createPixDeposit } from "/src/lib/payment.ts";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import recargasLogo from "/src/assets/recargas-brasil-logo.jpeg?import";
import { QRCodeSVG } from "/node_modules/.vite/deps/qrcode__react.js?v=9b410283";
import { Smartphone, Plus, Clock, Landmark, User, ChevronRight, RefreshCw, Copy, Check, ArrowLeft, Shield, LogOut, Camera, Loader2, Share2, FileText, Hash, Wallet, Phone, Zap, AlertTriangle, CheckCircle2, XCircle, MessageCircle } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { ChatPage } from "/src/components/chat/ChatPage.tsx";
import { useSeasonalTheme } from "/src/hooks/useSeasonalTheme.ts";
import { formatFullDateTimeBR, formatDateTimeBR, formatDateLongUpperBR, formatTimeBR } from "/src/lib/timezone.ts";
// Telegram dark theme defaults (matches Telegram's dark mode)
const TG_DARK_DEFAULTS = {
    bg_color: "#17212b",
    text_color: "#f5f5f5",
    hint_color: "#708499",
    link_color: "#6ab3f3",
    button_color: "#5288c1",
    button_text_color: "#ffffff",
    secondary_bg_color: "#232e3c",
    section_bg_color: "#17212b",
    accent_text_color: "#6ab2f2",
    destructive_text_color: "#ec3942",
    header_bg_color: "#17212b",
    subtitle_text_color: "#708499",
    section_header_text_color: "#6ab2f2",
    bottom_bar_bg_color: "#17212b"
};
function useTelegramTheme() {
    _s();
    useEffect(()=>{
        const tg = window.Telegram?.WebApp;
        const tp = tg?.themeParams;
        const root = document.documentElement;
        const theme = {
            ...TG_DARK_DEFAULTS,
            ...tp
        };
        root.style.setProperty("--tg-bg", theme.bg_color);
        root.style.setProperty("--tg-text", theme.text_color);
        root.style.setProperty("--tg-hint", theme.hint_color);
        root.style.setProperty("--tg-link", theme.link_color);
        root.style.setProperty("--tg-btn", theme.button_color);
        root.style.setProperty("--tg-btn-text", theme.button_text_color);
        root.style.setProperty("--tg-secondary-bg", theme.secondary_bg_color);
        root.style.setProperty("--tg-section-bg", theme.section_bg_color);
        root.style.setProperty("--tg-accent", theme.accent_text_color);
        root.style.setProperty("--tg-destructive", theme.destructive_text_color);
        root.style.setProperty("--tg-header-bg", theme.header_bg_color);
        root.style.setProperty("--tg-subtitle", theme.subtitle_text_color);
        root.style.setProperty("--tg-section-header", theme.section_header_text_color);
        root.style.setProperty("--tg-bottom-bar", theme.bottom_bar_bg_color || theme.secondary_bg_color);
    }, []);
}
_s(useTelegramTheme, "OD7bBpZva5O2jO+Puf00hKivP7c=");
export default function TelegramMiniApp() {
    _s1();
    useTelegramTheme();
    // Expand to full screen automatically
    useEffect(()=>{
        const tg = window.Telegram?.WebApp;
        if (tg) {
            tg.ready();
            tg.expand();
            // Retry expand after short delays to ensure it takes effect
            setTimeout(()=>tg.expand(), 100);
            setTimeout(()=>tg.expand(), 500);
            // Disable vertical swipe to close (keeps app fullscreen)
            if (tg.disableVerticalSwipes) {
                tg.disableVerticalSwipes();
            }
            // Request fullscreen if available (Telegram Bot API 8.0+)
            if (tg.requestFullscreen) {
                try {
                    tg.requestFullscreen();
                } catch  {}
            }
            // Force viewport height to 100%
            if (tg.isExpanded === false) {
                setTimeout(()=>tg.expand(), 1000);
            }
            // Set header/viewport color to match background
            if (tg.setHeaderColor) {
                try {
                    tg.setHeaderColor("secondary_bg_color");
                } catch  {}
            }
            if (tg.setBackgroundColor) {
                try {
                    tg.setBackgroundColor("#17212b");
                } catch  {}
            }
        }
        // CSS fix: ensure full viewport on Telegram
        document.documentElement.style.height = "100%";
        document.body.style.height = "100%";
        document.body.style.overflow = "hidden";
        // Prevent zoom: update viewport meta tag
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement("meta");
            viewportMeta.name = "viewport";
            document.head.appendChild(viewportMeta);
        }
        const originalViewport = viewportMeta.content;
        viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
        // Prevent pinch-to-zoom only (double-tap handled via CSS touch-action)
        const preventZoom = (e)=>{
            if (e.touches.length > 1) e.preventDefault();
        };
        document.addEventListener("touchstart", preventZoom, {
            passive: false
        });
        // Prevent gesture zoom (Safari)
        const preventGesture = (e)=>e.preventDefault();
        document.addEventListener("gesturestart", preventGesture);
        document.addEventListener("gesturechange", preventGesture);
        return ()=>{
            document.documentElement.style.height = "";
            document.body.style.height = "";
            document.body.style.overflow = "";
            if (viewportMeta) viewportMeta.content = originalViewport;
            document.removeEventListener("touchstart", preventZoom);
            document.removeEventListener("gesturestart", preventGesture);
            document.removeEventListener("gesturechange", preventGesture);
        };
    }, []);
    const { activeTheme, theme: seasonalTheme, emojis: seasonalEmojis, isActive: isSeasonalActive, transitioning } = useSeasonalTheme();
    const [section, setSection] = useState("recarga");
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [saldo, setSaldo] = useState(0);
    const [hasAuthSession, setHasAuthSession] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    // Recarga
    const [operadoras, setOperadoras] = useState([]);
    const [selectedOp, setSelectedOp] = useState(null);
    const [selectedValor, setSelectedValor] = useState(null);
    const [phone, setPhone] = useState("");
    const [clipboardPhone, setClipboardPhone] = useState(null);
    const [recargaStep, setRecargaStep] = useState("phone");
    const [recargaLoading, setRecargaLoading] = useState(false);
    const [recargaResult, setRecargaResult] = useState(null);
    const [phoneCheckResult, setPhoneCheckResult] = useState(null);
    const [checkingPhone, setCheckingPhone] = useState(false);
    // Histórico & Extrato
    const [recargas, setRecargas] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [viewingReceipt, setViewingReceipt] = useState(null);
    // Depósito
    const [depositAmount, setDepositAmount] = useState("");
    const [depositLoading, setDepositLoading] = useState(false);
    const [pixData, setPixData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [refreshingExtrato, setRefreshingExtrato] = useState(false);
    const [refreshingRecargas, setRefreshingRecargas] = useState(false);
    // Toast notifications
    const [toasts, setToasts] = useState([]);
    const showToast = useCallback((message, type = "success")=>{
        const id = Date.now();
        setToasts((prev)=>[
                ...prev,
                {
                    id,
                    message,
                    type
                }
            ]);
        setTimeout(()=>setToasts((prev)=>prev.filter((t)=>t.id !== id)), 4000);
    }, []);
    const tgWebApp = window.Telegram?.WebApp;
    const getTelegramUser = useCallback(()=>{
        const liveTg = window.Telegram?.WebApp;
        const directUser = liveTg?.initDataUnsafe?.user;
        if (directUser?.id) return directUser;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const raw = urlParams.get("tgWebAppData");
            if (!raw) return null;
            const initDataParams = new URLSearchParams(raw);
            const userRaw = initDataParams.get("user");
            if (!userRaw) return null;
            const parsedUser = JSON.parse(userRaw);
            return parsedUser?.id ? parsedUser : null;
        } catch  {
            return null;
        }
    }, []);
    // Helper to save/load session from localStorage
    const saveSession = useCallback((data)=>{
        try {
            localStorage.setItem("tg_miniapp_session", JSON.stringify(data));
        } catch  {}
    }, []);
    const clearSession = useCallback(()=>{
        try {
            localStorage.removeItem("tg_miniapp_session");
        } catch  {}
    }, []);
    const loadSavedSession = useCallback(()=>{
        try {
            const raw = localStorage.getItem("tg_miniapp_session");
            if (!raw) return null;
            return JSON.parse(raw);
        } catch  {
            return null;
        }
    }, []);
    const applySession = useCallback((data)=>{
        setUserId(data.userId);
        setUserName(data.userName);
        setUserEmail(data.userEmail);
        setSaldo(data.saldo);
    }, []);
    useEffect(()=>{
        let cancelled = false;
        async function init() {
            const liveTg = window.Telegram?.WebApp;
            liveTg?.ready();
            liveTg?.expand();
            // Check auth session first (used by chat RLS)
            let existingSessionUserId = null;
            try {
                const { data: { session } } = await supabase.auth.getSession();
                existingSessionUserId = session?.user?.id ?? null;
                if (!cancelled) setHasAuthSession(!!session?.user);
            } catch (err) {
                console.error("Mini App auth session precheck error:", err);
                if (!cancelled) setHasAuthSession(false);
            }
            // 1) Try Telegram initData lookup
            const tgUser = await (async ()=>{
                for(let i = 0; i < 12; i++){
                    const u = getTelegramUser();
                    if (u?.id) return u;
                    await new Promise((r)=>setTimeout(r, 250));
                }
                return null;
            })();
            if (tgUser?.id && !cancelled) {
                try {
                    const { data, error } = await supabase.functions.invoke("telegram-miniapp", {
                        body: {
                            action: "lookup",
                            telegram_id: tgUser.id
                        }
                    });
                    if (!error && data?.found) {
                        const sess = {
                            userId: data.user_id,
                            userName: data.nome || "",
                            userEmail: "",
                            saldo: Number(data.saldo || 0)
                        };
                        applySession(sess);
                        saveSession(sess);
                        if (data.avatar_url) setAvatarUrl(data.avatar_url);
                        if (!cancelled) setLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error("Mini App TG lookup error:", err);
                }
            }
            // 2) Try existing auth user if available
            if (existingSessionUserId && !cancelled) {
                try {
                    const { data, error } = await supabase.functions.invoke("telegram-miniapp", {
                        body: {
                            action: "lookup_by_user_id",
                            user_id: existingSessionUserId
                        }
                    });
                    if (!error && data?.found) {
                        const sess = {
                            userId: data.user_id,
                            userName: data.nome || "",
                            userEmail: "",
                            saldo: Number(data.saldo || 0)
                        };
                        applySession(sess);
                        saveSession(sess);
                        if (data.avatar_url) setAvatarUrl(data.avatar_url);
                        if (!cancelled) setLoading(false);
                        return;
                    } else {
                        const { data: sData } = await supabase.functions.invoke("telegram-miniapp", {
                            body: {
                                action: "saldo",
                                user_id: existingSessionUserId
                            }
                        });
                        const sess = {
                            userId: existingSessionUserId,
                            userName: "",
                            userEmail: "",
                            saldo: Number(sData?.saldo || 0)
                        };
                        applySession(sess);
                        saveSession(sess);
                        if (!cancelled) setLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error("Mini App auth session error:", err);
                }
            }
            // 3) Try saved localStorage session (offline/fallback)
            const saved = loadSavedSession();
            if (saved && !cancelled) {
                applySession(saved);
                // Refresh saldo in background
                supabase.functions.invoke("telegram-miniapp", {
                    body: {
                        action: "saldo",
                        user_id: saved.userId
                    }
                }).then(({ data })=>{
                    if (data?.saldo !== undefined) setSaldo(Number(data.saldo));
                }).catch(()=>{});
                if (!cancelled) setLoading(false);
                return;
            }
            if (!cancelled) setLoading(false);
        }
        init();
        return ()=>{
            cancelled = true;
        };
    }, [
        getTelegramUser,
        applySession,
        saveSession,
        loadSavedSession
    ]);
    const refreshSaldo = useCallback(async ()=>{
        if (!userId) return;
        try {
            const { data } = await supabase.functions.invoke("telegram-miniapp", {
                body: {
                    action: "saldo",
                    user_id: userId
                }
            });
            if (data?.saldo !== undefined) {
                const newSaldo = Number(data.saldo);
                setSaldo(newSaldo);
                // Update saved session with new balance
                const saved = loadSavedSession();
                if (saved) saveSession({
                    ...saved,
                    saldo: newSaldo
                });
            }
        } catch (err) {
            console.error("refreshSaldo error:", err);
        }
    }, [
        userId,
        loadSavedSession,
        saveSession
    ]);
    const loadOperadoras = useCallback(async ()=>{
        try {
            const { data } = await supabase.functions.invoke("telegram-miniapp", {
                body: {
                    action: "operadoras",
                    user_id: userId
                }
            });
            setOperadoras(data?.operadoras || []);
        } catch (err) {
            console.error("loadOperadoras error:", err);
        }
    }, [
        userId
    ]);
    const loadRecargas = useCallback(async ()=>{
        if (!userId) return;
        try {
            const { data } = await supabase.functions.invoke("telegram-miniapp", {
                body: {
                    action: "recargas",
                    user_id: userId
                }
            });
            setRecargas(data?.recargas || []);
        } catch (err) {
            console.error("loadRecargas error:", err);
        }
    }, [
        userId
    ]);
    const loadTransactions = useCallback(async ()=>{
        if (!userId) return;
        try {
            const { data } = await supabase.from("transactions").select("id, amount, status, type, created_at, payment_id, metadata").eq("user_id", userId).eq("type", "deposit").order("created_at", {
                ascending: false
            }).limit(20);
            setTransactions(data || []);
        } catch (err) {
            console.error("loadTransactions error:", err);
        }
    }, [
        userId
    ]);
    // Load avatar on mount
    const loadAvatar = useCallback(async ()=>{
        if (!userId) return;
        try {
            // Use edge function (service role) to bypass RLS
            const { data } = await supabase.functions.invoke("telegram-miniapp", {
                body: {
                    action: "lookup_by_user_id",
                    user_id: userId
                }
            });
            if (data?.avatar_url) setAvatarUrl(data.avatar_url);
        } catch  {}
    }, [
        userId
    ]);
    const handleAvatarUpload = async (e)=>{
        const file = e.target.files?.[0];
        if (!file || !userId) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("Arquivo muito grande (máx 2MB)");
            return;
        }
        setUploadingAvatar(true);
        try {
            const ext = file.name.split(".").pop() || "jpg";
            const path = `${userId}/avatar.${ext}`;
            // Remove old files
            const { data: existingFiles } = await supabase.storage.from("avatars").list(userId);
            if (existingFiles?.length) {
                await supabase.storage.from("avatars").remove(existingFiles.map((f)=>`${userId}/${f.name}`));
            }
            const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
                upsert: true
            });
            if (upErr) throw upErr;
            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
            const publicUrl = urlData.publicUrl + "?t=" + Date.now();
            await supabase.from("profiles").update({
                avatar_url: publicUrl
            }).eq("id", userId);
            setAvatarUrl(publicUrl);
            tgWebApp?.HapticFeedback?.notificationOccurred("success");
        } catch (err) {
            alert(err.message || "Erro ao enviar foto");
        }
        setUploadingAvatar(false);
    };
    useEffect(()=>{
        if (!userId) return;
        if (section === "recarga") {
            loadOperadoras();
            loadRecargas();
        }
        if (section === "historico") loadRecargas();
        if (section === "extrato") loadTransactions();
        if (section === "recarga" || section === "deposito") refreshSaldo();
        if (section === "conta") loadAvatar();
    }, [
        section,
        userId
    ]);
    // Realtime subscriptions
    useEffect(()=>{
        if (!userId) return;
        const channel = supabase.channel(`miniapp-realtime-${userId}`).on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "saldos",
            filter: `user_id=eq.${userId}`
        }, (payload)=>{
            const row = payload.new;
            if (row?.tipo === "revenda" && row?.valor !== undefined) {
                setSaldo(Number(row.valor));
                tgWebApp?.HapticFeedback?.impactOccurred("light");
            }
        }).on("postgres_changes", {
            event: "UPDATE",
            schema: "public",
            table: "recargas",
            filter: `user_id=eq.${userId}`
        }, (payload)=>{
            const updated = payload.new;
            if (updated?.status === "completed" && updated?.telefone) {
                const tel = updated.telefone.replace(/\D/g, "");
                const formatted = tel.length >= 10 ? `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}` : tel;
                showToast(`✅ Recarga concluída para ${formatted}!`, "success");
                tgWebApp?.HapticFeedback?.notificationOccurred("success");
            }
            loadRecargas();
        }).on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "transactions",
            filter: `user_id=eq.${userId}`
        }, ()=>{
            loadTransactions();
            // Also refresh saldo on deposit completion
            refreshSaldo();
        }).subscribe();
        return ()=>{
            supabase.removeChannel(channel);
        };
    }, [
        userId,
        loadRecargas,
        loadTransactions,
        refreshSaldo,
        showToast
    ]);
    // Auto-check pending recargas against API every 8s
    useEffect(()=>{
        if (!userId) return;
        let active = true;
        const checkPending = async ()=>{
            const pending = recargas.filter((r)=>r.status === "pending" && r.external_id);
            if (pending.length === 0) return;
            for (const r of pending){
                if (!active) break;
                try {
                    const { data } = await supabase.functions.invoke("recarga-express", {
                        body: {
                            action: "order-status",
                            external_id: r.external_id
                        }
                    });
                    if (data?.success && data.data?.localStatus && data.data.localStatus !== "pending") {
                        // DB was updated by the edge function, realtime will pick it up
                        // but force reload just in case
                        await loadRecargas();
                        tgWebApp?.HapticFeedback?.notificationOccurred("success");
                        break; // reload got all updates
                    }
                } catch  {}
            }
        };
        checkPending();
        const interval = setInterval(checkPending, 8000);
        return ()=>{
            active = false;
            clearInterval(interval);
        };
    }, [
        userId,
        recargas,
        loadRecargas
    ]);
    const formatCurrency = (v)=>`R$ ${v.toLocaleString("pt-BR", {
            minimumFractionDigits: 2
        })}`;
    const formatPhone = (v)=>{
        const d = v.replace(/\D/g, "").slice(0, 11);
        if (d.length <= 2) return d;
        if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
        return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    };
    const handleRecargaConfirm = async ()=>{
        if (!userId || !selectedOp || !selectedValor || !phone) return;
        const tel = phone.replace(/\D/g, "");
        if (tel.length < 10) return;
        setRecargaLoading(true);
        try {
            const { data: result, error } = await supabase.functions.invoke("recarga-express", {
                body: {
                    action: "recharge",
                    carrierId: selectedOp.carrierId,
                    phoneNumber: tel,
                    valueId: selectedValor.valueId
                }
            });
            if (error) throw error;
            if (!result?.success) throw new Error(result?.error || "Erro ao processar recarga");
            await refreshSaldo();
            tgWebApp?.HapticFeedback?.notificationOccurred("success");
            const orderData = result.data || {};
            const now = new Date();
            const hora = formatFullDateTimeBR(now);
            const receiptValue = (Number(selectedValor.value) > 0 ? Number(selectedValor.value) : 0) || (()=>{
                const label = String(selectedValor.label || "").replace(/,/g, ".");
                const nums = label.match(/\d+(?:\.\d{1,2})?/g);
                if (!nums?.length) return Number(selectedValor.cost) || 0;
                const parsed = Number(nums[nums.length - 1]);
                return Number.isFinite(parsed) && parsed > 0 ? parsed : Number(selectedValor.cost) || 0;
            })();
            setRecargaResult({
                success: true,
                message: `Recarga realizada com sucesso!`,
                details: {
                    valor: receiptValue,
                    telefone: formatPhone(phone),
                    operadora: selectedOp.nome || selectedOp.carrierId,
                    novoSaldo: orderData.localBalance ?? saldo,
                    pedidoId: orderData._id || orderData.id || orderData.orderId || null,
                    hora
                }
            });
        } catch (err) {
            tgWebApp?.HapticFeedback?.notificationOccurred("error");
            setRecargaResult({
                success: false,
                message: err.message || "Erro ao processar recarga"
            });
        }
        setRecargaLoading(false);
    };
    const resetRecarga = ()=>{
        setSelectedOp(null);
        setSelectedValor(null);
        setPhone("");
        setRecargaStep("phone");
        setRecargaResult(null);
        setPhoneCheckResult(null);
    };
    const formatCooldownMsg = (msg)=>{
        if (!msg) return "";
        const isoMatch = msg.match(/(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)/);
        if (isoMatch) {
            const d = new Date(isoMatch[1]);
            const formatted = formatDateTimeBR(d);
            if (msg.toLowerCase().includes("cooldown")) {
                return `⏳ Cooldown ativo! Nova recarga permitida após ${formatted}.`;
            }
            return msg.replace(isoMatch[1], formatted);
        }
        return msg;
    };
    const handleCheckPhone = async (carrierId)=>{
        const normalizedPhone = phone.replace(/\D/g, "");
        if (normalizedPhone.length < 10) return;
        const cId = carrierId || selectedOp?.carrierId;
        if (!cId) return;
        setCheckingPhone(true);
        setPhoneCheckResult(null);
        try {
            const { data: resp } = await supabase.functions.invoke("recarga-express", {
                body: {
                    action: "check-phone",
                    phoneNumber: normalizedPhone,
                    carrierId: cId
                }
            });
            if (resp?.success && resp.data) {
                const result = {
                    status: resp.data.status,
                    message: resp.data.status === "COOLDOWN" ? formatCooldownMsg(resp.data.message) : resp.data.message || "Número disponível para recarga."
                };
                setPhoneCheckResult(result);
                tgWebApp?.HapticFeedback?.impactOccurred(result.status === "CLEAR" ? "light" : "heavy");
            }
        } catch (err) {
            setPhoneCheckResult({
                status: "ERROR",
                message: err.message || "Erro ao verificar"
            });
        }
        setCheckingPhone(false);
    };
    const handleDeposit = async ()=>{
        const amount = parseFloat(depositAmount.replace(",", "."));
        if (isNaN(amount) || amount <= 0 || !userId) return;
        setDepositLoading(true);
        try {
            const result = await createPixDeposit(amount, "", "", false, userId);
            setPixData(result);
            tgWebApp?.HapticFeedback?.impactOccurred("medium");
        } catch (err) {
            alert(err.message || "Erro ao gerar PIX");
        }
        setDepositLoading(false);
    };
    const copyPix = async ()=>{
        if (!pixData?.qr_code) return;
        await navigator.clipboard.writeText(pixData.qr_code);
        setCopied(true);
        tgWebApp?.HapticFeedback?.impactOccurred("light");
        setTimeout(()=>setCopied(false), 2000);
    };
    const handleLogin = async ()=>{
        if (!loginEmail || !loginPassword) return;
        setLoginLoading(true);
        setLoginError("");
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail.trim(),
                password: loginPassword
            });
            if (authError) throw authError;
            if (!authData.user) throw new Error("Falha no login");
            const { data, error } = await supabase.functions.invoke("telegram-miniapp", {
                body: {
                    action: "lookup_by_user_id",
                    user_id: authData.user.id
                }
            });
            if (!error && data?.found) {
                const sess = {
                    userId: data.user_id,
                    userName: data.nome || "",
                    userEmail: authData.user.email || "",
                    saldo: Number(data.saldo || 0)
                };
                applySession(sess);
                saveSession(sess);
            } else {
                const { data: sData } = await supabase.functions.invoke("telegram-miniapp", {
                    body: {
                        action: "saldo",
                        user_id: authData.user.id
                    }
                });
                const sess = {
                    userId: authData.user.id,
                    userName: authData.user.email || "",
                    userEmail: authData.user.email || "",
                    saldo: Number(sData?.saldo || 0)
                };
                applySession(sess);
                saveSession(sess);
            }
            setHasAuthSession(true);
        } catch (err) {
            setLoginError(err.message || "Erro ao fazer login");
        }
        setLoginLoading(false);
    };
    const handleLogout = async ()=>{
        await supabase.auth.signOut();
        clearSession();
        setUserId(null);
        setUserName("");
        setUserEmail("");
        setSaldo(0);
        setHasAuthSession(false);
    };
    // Detect phone number in clipboard when phone step is active
    useEffect(()=>{
        if (section !== "recarga" || recargaStep !== "phone" || phone.length > 0) {
            setClipboardPhone(null);
            return;
        }
        const detectClipboard = async ()=>{
            try {
                if (!navigator.clipboard?.readText) return;
                const text = await navigator.clipboard.readText();
                if (!text) return;
                let digits = text.replace(/\D/g, "");
                // Remove country code 55 if present
                if (digits.length >= 12 && digits.startsWith("55")) {
                    digits = digits.slice(2);
                }
                // Check if it looks like a Brazilian phone number (10-11 digits)
                if (digits.length >= 10 && digits.length <= 11) {
                    setClipboardPhone(digits);
                }
            } catch  {
            // Clipboard permission denied — silently ignore
            }
        };
        detectClipboard();
    }, [
        section,
        recargaStep,
        phone
    ]);
    const sectionTitle = {
        recarga: "Nova Recarga",
        deposito: "Adicionar Saldo",
        historico: "Histórico de Pedidos",
        extrato: "Extrato de Depósitos",
        conta: "Minha Conta",
        status: "Status do Sistema",
        chat: "Bate-papo"
    };
    const initials = userName ? userName.slice(0, 2).toUpperCase() : "US";
    // Inline style helpers using Telegram CSS vars
    const st = {
        bg: {
            backgroundColor: "var(--tg-bg)"
        },
        secondaryBg: {
            backgroundColor: "var(--tg-secondary-bg)"
        },
        headerBg: {
            backgroundColor: "var(--tg-header-bg)"
        },
        bottomBar: {
            backgroundColor: "var(--tg-bottom-bar)"
        },
        text: {
            color: "var(--tg-text)"
        },
        hint: {
            color: "var(--tg-hint)"
        },
        link: {
            color: "var(--tg-link)"
        },
        accent: {
            color: "var(--tg-accent)"
        },
        btn: {
            backgroundColor: "var(--tg-btn)",
            color: "var(--tg-btn-text)"
        },
        btnText: {
            color: "var(--tg-btn-text)"
        },
        destructive: {
            color: "var(--tg-destructive)"
        },
        green: {
            color: "#4ade80"
        },
        borderSub: "1px solid color-mix(in srgb, var(--tg-hint) 15%, transparent)",
        borderMain: "1px solid color-mix(in srgb, var(--tg-hint) 20%, transparent)"
    };
    // ─── Splash / Loading ────────────────────────────────────
    if (loading) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen flex flex-col items-center justify-center relative overflow-hidden",
            style: st.bg,
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "absolute inset-0 overflow-hidden pointer-events-none",
                    children: /*#__PURE__*/ _jsxDEV("div", {
                        className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full blur-[100px]",
                        style: {
                            background: "var(--tg-btn)",
                            opacity: 0.12
                        }
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                        lineNumber: 729,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                    lineNumber: 728,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV(motion.div, {
                    initial: {
                        opacity: 0,
                        scale: 0.8
                    },
                    animate: {
                        opacity: 1,
                        scale: 1
                    },
                    transition: {
                        duration: 0.5,
                        ease: [
                            0.4,
                            0,
                            0.2,
                            1
                        ]
                    },
                    className: "relative z-10",
                    children: /*#__PURE__*/ _jsxDEV("div", {
                        className: "w-24 h-24 rounded-2xl overflow-hidden shadow-2xl",
                        style: {
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: `0 0 40px rgba(82,136,193,0.3)`
                        },
                        children: /*#__PURE__*/ _jsxDEV("img", {
                            src: recargasLogo,
                            alt: "Recargas Brasil",
                            className: "w-full h-full object-cover"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 740,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                        lineNumber: 739,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                    lineNumber: 733,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV(motion.div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    transition: {
                        delay: 0.3,
                        duration: 0.4
                    },
                    className: "flex gap-2 mt-6 z-10",
                    children: [
                        0,
                        1,
                        2
                    ].map((i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                            className: "w-2.5 h-2.5 rounded-full",
                            style: {
                                background: "var(--tg-btn)"
                            },
                            animate: {
                                scale: [
                                    1,
                                    1.4,
                                    1
                                ],
                                opacity: [
                                    0.4,
                                    1,
                                    0.4
                                ]
                            },
                            transition: {
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }
                        }, i, false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 752,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                    lineNumber: 745,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV(motion.p, {
                    initial: {
                        opacity: 0,
                        y: 8
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        delay: 0.5,
                        duration: 0.4
                    },
                    className: "mt-4 text-sm font-medium tracking-wide z-10",
                    style: {
                        color: "var(--tg-hint)"
                    },
                    children: "Carregando..."
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                    lineNumber: 763,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
            lineNumber: 726,
            columnNumber: 7
        }, this);
    }
    // ─── Login ──────────────────────────────────────
    if (!userId) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen flex flex-col items-center justify-center p-6 relative",
            style: {
                ...st.text
            },
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "absolute inset-0 z-0",
                    children: [
                        /*#__PURE__*/ _jsxDEV("img", {
                            src: recargasLogo,
                            alt: "",
                            className: "w-full h-full object-cover"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 782,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "absolute inset-0",
                            style: {
                                background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.95) 100%)"
                            }
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 783,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                    lineNumber: 781,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "w-full max-w-sm relative z-10",
                    children: [
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "text-center mb-8",
                            children: [
                                /*#__PURE__*/ _jsxDEV("img", {
                                    src: recargasLogo,
                                    alt: "Recargas Brasil",
                                    className: "w-28 h-28 rounded-3xl mx-auto mb-5 shadow-2xl object-cover ring-2 ring-white/20"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 788,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("h1", {
                                    className: "text-2xl font-bold text-white drop-shadow-lg",
                                    children: "Recargas Brasil"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 789,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-sm mt-1.5 text-white/50",
                                    children: "Faça login para continuar"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 790,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 787,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "rounded-2xl p-5 space-y-4 backdrop-blur-xl",
                            style: {
                                backgroundColor: "rgba(23, 33, 43, 0.75)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
                            },
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("label", {
                                                    className: "text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5 block",
                                                    children: "E-mail"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 801,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("input", {
                                                    type: "email",
                                                    placeholder: "seu@email.com",
                                                    value: loginEmail,
                                                    onChange: (e)=>setLoginEmail(e.target.value),
                                                    className: "w-full rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all",
                                                    style: {
                                                        backgroundColor: "rgba(255,255,255,0.08)",
                                                        color: "#f5f5f5",
                                                        border: "1px solid rgba(255,255,255,0.12)"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 802,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 800,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("label", {
                                                    className: "text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5 block",
                                                    children: "Senha"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 807,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("input", {
                                                    type: "password",
                                                    placeholder: "••••••••",
                                                    value: loginPassword,
                                                    onChange: (e)=>setLoginPassword(e.target.value),
                                                    onKeyDown: (e)=>e.key === "Enter" && handleLogin(),
                                                    className: "w-full rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all",
                                                    style: {
                                                        backgroundColor: "rgba(255,255,255,0.08)",
                                                        color: "#f5f5f5",
                                                        border: "1px solid rgba(255,255,255,0.12)"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 808,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 806,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 799,
                                    columnNumber: 13
                                }, this),
                                loginError && /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-xs text-center",
                                    style: st.destructive,
                                    children: loginError
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 814,
                                    columnNumber: 28
                                }, this),
                                /*#__PURE__*/ _jsxDEV("button", {
                                    onClick: handleLogin,
                                    disabled: loginLoading || !loginEmail || !loginPassword,
                                    className: "w-full rounded-xl py-3.5 font-bold text-sm transition-all disabled:opacity-40 active:scale-[0.98]",
                                    style: {
                                        background: "linear-gradient(135deg, #5288c1 0%, #3a6fa8 100%)",
                                        color: "#fff",
                                        boxShadow: "0 4px 15px rgba(82, 136, 193, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
                                    },
                                    children: loginLoading ? "Entrando..." : "Entrar"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 815,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 793,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                    lineNumber: 785,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
            lineNumber: 779,
            columnNumber: 7
        }, this);
    }
    // ─── App ────────────────────────────────────────
    return /*#__PURE__*/ _jsxDEV("div", {
        className: `min-h-screen flex flex-col relative ${isSeasonalActive && !transitioning ? "pt-8" : ""}`,
        style: {
            ...st.bg,
            ...st.text
        },
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "fixed top-16 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4",
                children: /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                    children: toasts.map((toast)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0,
                                y: -30,
                                scale: 0.9
                            },
                            animate: {
                                opacity: 1,
                                y: 0,
                                scale: 1
                            },
                            exit: {
                                opacity: 0,
                                y: -20,
                                scale: 0.9
                            },
                            transition: {
                                type: "spring",
                                stiffness: 400,
                                damping: 25
                            },
                            className: "pointer-events-auto rounded-xl px-4 py-3 shadow-lg backdrop-blur-xl max-w-[90vw] text-center",
                            style: {
                                backgroundColor: toast.type === "success" ? "rgba(74,222,128,0.15)" : toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(96,165,250,0.15)",
                                border: `1px solid ${toast.type === "success" ? "rgba(74,222,128,0.4)" : toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(96,165,250,0.4)"}`,
                                color: toast.type === "success" ? "#4ade80" : toast.type === "error" ? "#ef4444" : "#60a5fa"
                            },
                            onClick: ()=>setToasts((prev)=>prev.filter((t)=>t.id !== toast.id)),
                            children: /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-sm font-semibold",
                                children: toast.message
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 851,
                                columnNumber: 15
                            }, this)
                        }, toast.id, false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 837,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                    lineNumber: 835,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                lineNumber: 834,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "sticky top-0 z-30 backdrop-blur-lg px-4 py-3 flex items-center justify-between",
                style: {
                    ...st.headerBg,
                    borderBottom: st.borderMain
                },
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "w-8 h-8 rounded-lg flex items-center justify-center",
                                style: st.btn,
                                children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                    className: "w-4 h-4",
                                    style: st.btnText
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 862,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 861,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("h1", {
                                className: "font-bold text-[15px]",
                                style: st.text,
                                children: sectionTitle[section]
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 864,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                        lineNumber: 860,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "rounded-lg px-3 py-1.5",
                                style: {
                                    ...st.secondaryBg,
                                    border: st.borderSub
                                },
                                children: [
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-[10px] leading-none",
                                        style: st.hint,
                                        children: "Saldo"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 868,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-xs font-bold leading-tight",
                                        style: st.green,
                                        children: formatCurrency(saldo)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 869,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 867,
                                columnNumber: 11
                            }, this),
                            avatarUrl ? /*#__PURE__*/ _jsxDEV("img", {
                                src: avatarUrl,
                                alt: "",
                                className: "w-8 h-8 rounded-full object-cover"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 872,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                className: "w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white",
                                children: initials
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 874,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                        lineNumber: 866,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                lineNumber: 858,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex-1 overflow-y-auto pb-20 scrollbar-hide",
                style: {
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-y manipulation'
                },
                children: /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                    mode: "wait",
                    children: [
                        section === "recarga" && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "p-4 space-y-4",
                            children: [
                                recargaResult ? /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        scale: 0.9
                                    },
                                    animate: {
                                        opacity: 1,
                                        scale: 1
                                    },
                                    transition: {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25
                                    },
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "rounded-2xl p-6 text-center",
                                            style: {
                                                ...st.secondaryBg,
                                                border: `2px solid ${recargaResult.success ? "#4ade80" : "var(--tg-destructive)"}`
                                            },
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                                    initial: {
                                                        scale: 0
                                                    },
                                                    animate: {
                                                        scale: 1
                                                    },
                                                    transition: {
                                                        type: "spring",
                                                        stiffness: 400,
                                                        damping: 15,
                                                        delay: 0.2
                                                    },
                                                    children: recargaResult.success ? /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center",
                                                        style: {
                                                            backgroundColor: "rgba(74, 222, 128, 0.15)"
                                                        },
                                                        children: /*#__PURE__*/ _jsxDEV(Check, {
                                                            className: "w-8 h-8",
                                                            style: {
                                                                color: "#4ade80"
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 901,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 900,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-4xl mb-3",
                                                        children: "❌"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 904,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 894,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "font-bold text-lg",
                                                    style: st.text,
                                                    children: recargaResult.message
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 907,
                                                    columnNumber: 21
                                                }, this),
                                                !recargaResult.success && /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: resetRecarga,
                                                    className: "mt-4 rounded-xl px-6 py-2.5 text-sm font-medium",
                                                    style: {
                                                        ...st.secondaryBg,
                                                        border: st.borderSub,
                                                        color: "var(--tg-text)"
                                                    },
                                                    children: "Tentar Novamente"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 909,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 893,
                                            columnNumber: 19
                                        }, this),
                                        recargaResult.success && recargaResult.details && /*#__PURE__*/ _jsxDEV(_Fragment, {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "rounded-2xl overflow-hidden",
                                                    style: {
                                                        ...st.secondaryBg,
                                                        border: st.borderSub
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "px-4 py-3 flex items-center gap-2",
                                                            style: {
                                                                borderBottom: st.borderSub,
                                                                backgroundColor: "rgba(74, 222, 128, 0.05)"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV(FileText, {
                                                                    className: "w-4 h-4",
                                                                    style: {
                                                                        color: "#4ade80"
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 920,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "text-xs font-bold tracking-wider uppercase",
                                                                    style: {
                                                                        color: "#4ade80"
                                                                    },
                                                                    children: "Comprovante de Recarga"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 921,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 919,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "divide-y",
                                                            style: {
                                                                borderColor: "var(--tg-secondary-bg)"
                                                            },
                                                            children: [
                                                                {
                                                                    icon: Phone,
                                                                    label: "Telefone",
                                                                    value: recargaResult.details.telefone
                                                                },
                                                                {
                                                                    icon: Zap,
                                                                    label: "Operadora",
                                                                    value: recargaResult.details.operadora
                                                                },
                                                                {
                                                                    icon: Wallet,
                                                                    label: "Valor",
                                                                    value: formatCurrency(recargaResult.details.valor),
                                                                    highlight: true
                                                                },
                                                                {
                                                                    icon: Wallet,
                                                                    label: "Novo Saldo",
                                                                    value: formatCurrency(recargaResult.details.novoSaldo)
                                                                },
                                                                {
                                                                    icon: Hash,
                                                                    label: "ID do Pedido",
                                                                    value: recargaResult.details.pedidoId || "—"
                                                                },
                                                                {
                                                                    icon: Clock,
                                                                    label: "Data/Hora",
                                                                    value: recargaResult.details.hora
                                                                }
                                                            ].map((row, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                                                                    initial: {
                                                                        opacity: 0,
                                                                        x: -10
                                                                    },
                                                                    animate: {
                                                                        opacity: 1,
                                                                        x: 0
                                                                    },
                                                                    transition: {
                                                                        delay: 0.3 + i * 0.06
                                                                    },
                                                                    className: "flex items-center justify-between px-4 py-3",
                                                                    style: {
                                                                        borderColor: "rgba(255,255,255,0.05)"
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                                            className: "flex items-center gap-2.5",
                                                                            children: [
                                                                                /*#__PURE__*/ _jsxDEV(row.icon, {
                                                                                    className: "w-4 h-4",
                                                                                    style: {
                                                                                        color: "var(--tg-hint)"
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                                    lineNumber: 941,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                                    className: "text-xs",
                                                                                    style: {
                                                                                        color: "var(--tg-hint)"
                                                                                    },
                                                                                    children: row.label
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                                    lineNumber: 942,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 940,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                                            className: `text-sm font-semibold ${row.highlight ? "" : ""}`,
                                                                            style: {
                                                                                color: row.highlight ? "#4ade80" : "var(--tg-text)"
                                                                            },
                                                                            children: row.value
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 944,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, row.label, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 932,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 923,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 918,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "grid grid-cols-2 gap-3",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(motion.button, {
                                                            initial: {
                                                                opacity: 0,
                                                                y: 10
                                                            },
                                                            animate: {
                                                                opacity: 1,
                                                                y: 0
                                                            },
                                                            transition: {
                                                                delay: 0.6
                                                            },
                                                            onClick: async ()=>{
                                                                const d = recargaResult.details;
                                                                const text = `✅ *Comprovante de Recarga*\n\n📱 Telefone: ${d.telefone}\n📡 Operadora: ${d.operadora}\n💰 Valor: ${formatCurrency(d.valor)}\n🆔 Pedido: ${d.pedidoId || "—"}\n🕐 Data: ${d.hora}\n\nRecarga realizada com sucesso!`;
                                                                try {
                                                                    if (navigator.share) {
                                                                        await navigator.share({
                                                                            title: "Comprovante de Recarga",
                                                                            text: text.replace(/\*/g, "")
                                                                        });
                                                                    } else {
                                                                        await navigator.clipboard.writeText(text.replace(/\*/g, ""));
                                                                        tgWebApp?.HapticFeedback?.notificationOccurred("success");
                                                                    }
                                                                } catch  {}
                                                            },
                                                            className: "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold",
                                                            style: {
                                                                backgroundColor: "var(--tg-btn)",
                                                                color: "var(--tg-btn-text)"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV(Share2, {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 974,
                                                                    columnNumber: 27
                                                                }, this),
                                                                "Enviar"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 955,
                                                            columnNumber: 25
                                                        }, this),
                                                        recargaResult.details.pedidoId && /*#__PURE__*/ _jsxDEV(motion.button, {
                                                            initial: {
                                                                opacity: 0,
                                                                y: 10
                                                            },
                                                            animate: {
                                                                opacity: 1,
                                                                y: 0
                                                            },
                                                            transition: {
                                                                delay: 0.65
                                                            },
                                                            onClick: async ()=>{
                                                                tgWebApp?.HapticFeedback?.impactOccurred("medium");
                                                                try {
                                                                    const { data } = await supabase.functions.invoke("recarga-express", {
                                                                        body: {
                                                                            action: "order-status",
                                                                            external_id: recargaResult.details.pedidoId
                                                                        }
                                                                    });
                                                                    const status = data?.data?.localStatus || data?.data?.status || "desconhecido";
                                                                    const statusMap = {
                                                                        completed: "✅ Concluída",
                                                                        pending: "⏳ Processando",
                                                                        falha: "❌ Falha",
                                                                        feita: "✅ Concluída"
                                                                    };
                                                                    alert(statusMap[status] || `Status: ${status}`);
                                                                } catch  {
                                                                    alert("Erro ao consultar status");
                                                                }
                                                            },
                                                            className: "flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold",
                                                            style: {
                                                                ...st.secondaryBg,
                                                                border: st.borderSub,
                                                                color: "var(--tg-text)"
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV(RefreshCw, {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 998,
                                                                    columnNumber: 29
                                                                }, this),
                                                                "Status"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 980,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 953,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV(motion.button, {
                                                    initial: {
                                                        opacity: 0,
                                                        y: 10
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        y: 0
                                                    },
                                                    transition: {
                                                        delay: 0.7
                                                    },
                                                    onClick: resetRecarga,
                                                    className: "w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2",
                                                    style: {
                                                        ...st.secondaryBg,
                                                        border: st.borderSub,
                                                        color: "var(--tg-accent)"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1013,
                                                            columnNumber: 25
                                                        }, this),
                                                        "Nova Recarga"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1005,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 886,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex gap-1",
                                            children: [
                                                "phone",
                                                "op",
                                                "valor",
                                                "confirm"
                                            ].map((step, i)=>/*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex-1 h-1 rounded-full",
                                                    style: {
                                                        backgroundColor: [
                                                            "phone",
                                                            "op",
                                                            "valor",
                                                            "confirm"
                                                        ].indexOf(recargaStep) >= i ? "var(--tg-btn)" : "color-mix(in srgb, var(--tg-hint) 25%, transparent)"
                                                    }
                                                }, step, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1023,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1021,
                                            columnNumber: 19
                                        }, this),
                                        recargaStep === "phone" && /*#__PURE__*/ _jsxDEV("div", {
                                            className: "rounded-2xl p-6 space-y-5",
                                            style: {
                                                ...st.secondaryBg,
                                                border: st.borderSub
                                            },
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "text-center",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(motion.div, {
                                                            className: "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3",
                                                            style: {
                                                                backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)"
                                                            },
                                                            animate: {
                                                                y: [
                                                                    0,
                                                                    -6,
                                                                    0
                                                                ],
                                                                rotate: [
                                                                    0,
                                                                    -8,
                                                                    8,
                                                                    0
                                                                ]
                                                            },
                                                            transition: {
                                                                duration: 2.5,
                                                                repeat: Infinity,
                                                                ease: "easeInOut"
                                                            },
                                                            children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                                className: "w-7 h-7",
                                                                style: st.link
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1037,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1031,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("h2", {
                                                            className: "text-lg font-bold",
                                                            style: st.text,
                                                            children: "Qual o número?"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1039,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                            className: "text-sm mt-1",
                                                            style: st.hint,
                                                            children: "Digite o DDD + Número do celular"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1040,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1030,
                                                    columnNumber: 23
                                                }, this),
                                                clipboardPhone && phone.length === 0 && /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>{
                                                        setPhone(clipboardPhone);
                                                        setClipboardPhone(null);
                                                        tgWebApp?.HapticFeedback?.impactOccurred("light");
                                                    },
                                                    className: "w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all active:scale-[0.98]",
                                                    style: {
                                                        backgroundColor: "color-mix(in srgb, var(--tg-btn) 12%, transparent)",
                                                        border: `1px solid color-mix(in srgb, var(--tg-btn) 30%, transparent)`
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV(Copy, {
                                                                    className: "w-4 h-4",
                                                                    style: st.link
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1049,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "text-left",
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "text-xs font-medium",
                                                                            style: st.link,
                                                                            children: "Número detectado na área de transferência"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1051,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "text-base font-mono font-bold",
                                                                            style: st.text,
                                                                            children: formatPhone(clipboardPhone)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1052,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1050,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1048,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "text-xs font-semibold px-2.5 py-1 rounded-lg",
                                                            style: st.btn,
                                                            children: "Colar"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1055,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1044,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("input", {
                                                    type: "tel",
                                                    value: formatPhone(phone),
                                                    onChange: (e)=>{
                                                        const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                                                        setPhone(digits);
                                                    },
                                                    onPaste: (e)=>{
                                                        e.preventDefault();
                                                        const pasted = e.clipboardData.getData("text") || "";
                                                        let digits = pasted.replace(/\D/g, "");
                                                        // Remove country code 55 if present (e.g. +5521999005933)
                                                        if (digits.length >= 12 && digits.startsWith("55")) {
                                                            digits = digits.slice(2);
                                                        }
                                                        digits = digits.slice(0, 11);
                                                        setPhone(digits);
                                                    },
                                                    placeholder: "(00) 00000-0000",
                                                    className: "w-full bg-transparent pb-3 text-2xl text-center font-mono focus:outline-none",
                                                    style: {
                                                        ...st.text,
                                                        borderBottom: st.borderMain
                                                    }
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1058,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>{
                                                        if (phone.replace(/\D/g, "").length >= 10) {
                                                            loadOperadoras();
                                                            setRecargaStep("op");
                                                        }
                                                    },
                                                    disabled: phone.replace(/\D/g, "").length < 10,
                                                    className: "w-full rounded-xl py-3.5 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-40",
                                                    style: st.btn,
                                                    children: [
                                                        "Continuar ",
                                                        /*#__PURE__*/ _jsxDEV(ChevronRight, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1081,
                                                            columnNumber: 35
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1077,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1029,
                                            columnNumber: 21
                                        }, this),
                                        recargaStep === "op" && /*#__PURE__*/ _jsxDEV("div", {
                                            className: "space-y-3",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setRecargaStep("phone"),
                                                    className: "flex items-center gap-1 text-sm",
                                                    style: st.hint,
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1089,
                                                            columnNumber: 25
                                                        }, this),
                                                        " Voltar"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1088,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("h2", {
                                                    className: "text-lg font-bold",
                                                    style: st.text,
                                                    children: "Selecione a operadora"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1091,
                                                    columnNumber: 23
                                                }, this),
                                                operadoras.length === 0 ? /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "text-center py-8",
                                                    style: st.hint,
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(RefreshCw, {
                                                            className: "w-6 h-6 animate-spin mx-auto mb-2"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1094,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                            className: "text-sm",
                                                            children: "Carregando operadoras..."
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1095,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1093,
                                                    columnNumber: 25
                                                }, this) : operadoras.map((op)=>/*#__PURE__*/ _jsxDEV("button", {
                                                        onClick: ()=>{
                                                            setSelectedOp(op);
                                                            setPhoneCheckResult(null);
                                                            handleCheckPhone(op.carrierId);
                                                            setRecargaStep("check");
                                                            tgWebApp?.HapticFeedback?.impactOccurred("light");
                                                        },
                                                        className: "w-full rounded-xl p-4 text-left transition flex items-center justify-between",
                                                        style: {
                                                            ...st.secondaryBg,
                                                            border: st.borderSub
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center gap-3",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "w-10 h-10 rounded-lg flex items-center justify-center",
                                                                        style: {
                                                                            backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)"
                                                                        },
                                                                        children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                                            className: "w-5 h-5",
                                                                            style: st.link
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1104,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1102,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "font-semibold",
                                                                        style: st.text,
                                                                        children: op.nome
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1106,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1101,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV(ChevronRight, {
                                                                className: "w-4 h-4",
                                                                style: st.hint
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1108,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, op.id, true, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1098,
                                                        columnNumber: 25
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1087,
                                            columnNumber: 21
                                        }, this),
                                        recargaStep === "check" && selectedOp && /*#__PURE__*/ _jsxDEV("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>{
                                                        setRecargaStep("op");
                                                        setPhoneCheckResult(null);
                                                    },
                                                    className: "flex items-center gap-1 text-sm",
                                                    style: st.hint,
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1118,
                                                            columnNumber: 25
                                                        }, this),
                                                        " Voltar"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1117,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "text-center",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(motion.div, {
                                                            className: "w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3",
                                                            style: {
                                                                backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)"
                                                            },
                                                            animate: checkingPhone ? {
                                                                rotate: [
                                                                    0,
                                                                    360
                                                                ]
                                                            } : {},
                                                            transition: {
                                                                duration: 1.5,
                                                                repeat: Infinity,
                                                                ease: "linear"
                                                            },
                                                            children: /*#__PURE__*/ _jsxDEV(Shield, {
                                                                className: "w-7 h-7",
                                                                style: st.link
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1127,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1121,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("h2", {
                                                            className: "text-lg font-bold",
                                                            style: st.text,
                                                            children: "Verificação de Número"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1129,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                            className: "text-sm mt-1",
                                                            style: st.hint,
                                                            children: [
                                                                selectedOp.nome,
                                                                " • ",
                                                                phone
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1130,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1120,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "rounded-2xl p-5",
                                                    style: {
                                                        ...st.secondaryBg,
                                                        border: st.borderSub
                                                    },
                                                    children: [
                                                        checkingPhone && /*#__PURE__*/ _jsxDEV(motion.div, {
                                                            initial: {
                                                                opacity: 0
                                                            },
                                                            animate: {
                                                                opacity: 1
                                                            },
                                                            className: "flex flex-col items-center gap-3 py-4",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV(Loader2, {
                                                                    className: "w-8 h-8 animate-spin",
                                                                    style: st.link
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1136,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("p", {
                                                                    className: "text-sm font-medium",
                                                                    style: st.hint,
                                                                    children: "Verificando blacklist e cooldown..."
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1137,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1135,
                                                            columnNumber: 27
                                                        }, this),
                                                        !checkingPhone && phoneCheckResult && /*#__PURE__*/ _jsxDEV(motion.div, {
                                                            initial: {
                                                                opacity: 0,
                                                                scale: 0.95
                                                            },
                                                            animate: {
                                                                opacity: 1,
                                                                scale: 1
                                                            },
                                                            className: "flex flex-col items-center gap-3 py-2",
                                                            children: [
                                                                phoneCheckResult.status === "CLEAR" ? /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                    initial: {
                                                                        scale: 0
                                                                    },
                                                                    animate: {
                                                                        scale: 1
                                                                    },
                                                                    transition: {
                                                                        type: "spring",
                                                                        stiffness: 300
                                                                    },
                                                                    children: /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                                                        className: "w-12 h-12",
                                                                        style: {
                                                                            color: "#22c55e"
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1144,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1143,
                                                                    columnNumber: 31
                                                                }, this) : phoneCheckResult.status === "COOLDOWN" ? /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                    animate: {
                                                                        rotate: [
                                                                            0,
                                                                            -10,
                                                                            10,
                                                                            -10,
                                                                            0
                                                                        ]
                                                                    },
                                                                    transition: {
                                                                        duration: 0.5
                                                                    },
                                                                    children: /*#__PURE__*/ _jsxDEV(AlertTriangle, {
                                                                        className: "w-12 h-12",
                                                                        style: {
                                                                            color: "#eab308"
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1148,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1147,
                                                                    columnNumber: 31
                                                                }, this) : /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                    animate: {
                                                                        scale: [
                                                                            1,
                                                                            1.15,
                                                                            1,
                                                                            1.1,
                                                                            1
                                                                        ],
                                                                        rotate: [
                                                                            0,
                                                                            -10,
                                                                            10,
                                                                            -5,
                                                                            0
                                                                        ],
                                                                        opacity: [
                                                                            1,
                                                                            0.7,
                                                                            1
                                                                        ]
                                                                    },
                                                                    transition: {
                                                                        repeat: Infinity,
                                                                        duration: 2.5,
                                                                        ease: "easeInOut"
                                                                    },
                                                                    children: /*#__PURE__*/ _jsxDEV(XCircle, {
                                                                        className: "w-12 h-12 text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1152,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1151,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("p", {
                                                                    className: "text-sm font-semibold text-center",
                                                                    style: {
                                                                        color: phoneCheckResult.status === "CLEAR" ? "#22c55e" : phoneCheckResult.status === "COOLDOWN" ? "#eab308" : "#ef4444"
                                                                    },
                                                                    children: phoneCheckResult.status === "CLEAR" ? "Número Disponível" : phoneCheckResult.status === "COOLDOWN" ? "Cooldown Ativo" : "Número Bloqueado"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1155,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("p", {
                                                                    className: "text-xs text-center",
                                                                    style: st.hint,
                                                                    children: phoneCheckResult.message
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1160,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1141,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1133,
                                                    columnNumber: 23
                                                }, this),
                                                !checkingPhone && phoneCheckResult && /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex gap-2",
                                                    children: [
                                                        phoneCheckResult.status !== "BLACKLISTED" && /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: ()=>setRecargaStep("valor"),
                                                            className: "flex-1 rounded-xl py-3.5 font-semibold transition flex items-center justify-center gap-2",
                                                            style: {
                                                                backgroundColor: "var(--tg-btn)",
                                                                color: "var(--tg-btn-text)"
                                                            },
                                                            children: [
                                                                "Continuar ",
                                                                /*#__PURE__*/ _jsxDEV(ChevronRight, {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1171,
                                                                    columnNumber: 41
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1168,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: ()=>{
                                                                setRecargaStep("op");
                                                                setPhoneCheckResult(null);
                                                            },
                                                            className: "flex-1 rounded-xl py-3.5 font-semibold transition flex items-center justify-center gap-2",
                                                            style: {
                                                                ...st.secondaryBg,
                                                                ...st.text,
                                                                border: st.borderSub
                                                            },
                                                            children: "Trocar Operadora"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1174,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1166,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1116,
                                            columnNumber: 21
                                        }, this),
                                        recargaStep === "valor" && selectedOp && /*#__PURE__*/ _jsxDEV("div", {
                                            className: "space-y-3",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setRecargaStep("check"),
                                                    className: "flex items-center gap-1 text-sm",
                                                    style: st.hint,
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1187,
                                                            columnNumber: 25
                                                        }, this),
                                                        " Voltar"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1186,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("h2", {
                                                    className: "text-lg font-bold",
                                                    style: st.text,
                                                    children: [
                                                        selectedOp.nome,
                                                        " — Valor"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1189,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "grid grid-cols-2 gap-3",
                                                    children: selectedOp.valores.sort((a, b)=>(a.userCost ?? a.cost) - (b.userCost ?? b.cost)).map((v)=>{
                                                        const faceValue = v.value || v.cost;
                                                        const displayCost = v.userCost ?? v.cost;
                                                        const discount = faceValue > displayCost ? Math.round((faceValue - displayCost) / faceValue * 100) : 0;
                                                        return /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: ()=>{
                                                                setSelectedValor(v);
                                                                setRecargaStep("confirm");
                                                                tgWebApp?.HapticFeedback?.impactOccurred("light");
                                                            },
                                                            className: "relative rounded-xl py-4 px-3 text-left transition-all active:scale-95",
                                                            style: {
                                                                ...st.secondaryBg,
                                                                ...st.text,
                                                                border: st.borderSub
                                                            },
                                                            children: [
                                                                discount > 0 && /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "absolute -top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white",
                                                                    style: {
                                                                        background: discount >= 30 ? "#22c55e" : discount >= 20 ? "#10b981" : "#3b82f6"
                                                                    },
                                                                    children: [
                                                                        discount,
                                                                        "% OFF"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1201,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "text-[10px] font-semibold uppercase tracking-wider",
                                                                    style: st.hint,
                                                                    children: "Recarga"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1206,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "text-lg font-bold mt-0.5",
                                                                    children: [
                                                                        "R$ ",
                                                                        faceValue.toFixed(2)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1207,
                                                                    columnNumber: 31
                                                                }, this),
                                                                v.label && v.label !== `R$ ${v.cost}` && v.label !== `R$ ${faceValue}` && /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "text-[10px] mt-0.5 truncate",
                                                                    style: st.hint,
                                                                    children: v.label
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1209,
                                                                    columnNumber: 33
                                                                }, this),
                                                                discount > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "mt-2 pt-2",
                                                                    style: {
                                                                        borderTop: st.borderSub
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                                            className: "text-[11px]",
                                                                            style: st.hint,
                                                                            children: "Você paga "
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1213,
                                                                            columnNumber: 35
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                                            className: "text-sm font-bold",
                                                                            style: {
                                                                                color: "#22c55e"
                                                                            },
                                                                            children: [
                                                                                "R$ ",
                                                                                displayCost.toFixed(2)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1214,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1212,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, v.valueId, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1197,
                                                            columnNumber: 29
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1191,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1185,
                                            columnNumber: 21
                                        }, this),
                                        recargaStep === "confirm" && selectedOp && selectedValor && /*#__PURE__*/ _jsxDEV("div", {
                                            className: "space-y-3",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setRecargaStep("valor"),
                                                    className: "flex items-center gap-1 text-sm",
                                                    style: st.hint,
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1227,
                                                            columnNumber: 25
                                                        }, this),
                                                        " Voltar"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1226,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "rounded-2xl p-5 space-y-3",
                                                    style: {
                                                        ...st.secondaryBg,
                                                        border: st.borderSub
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("h2", {
                                                            className: "text-lg font-bold text-center",
                                                            style: st.text,
                                                            children: "Confirmar Recarga"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1230,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex justify-between",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    style: st.hint,
                                                                    children: "Operadora"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1231,
                                                                    columnNumber: 63
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "font-semibold",
                                                                    style: st.text,
                                                                    children: selectedOp.nome
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1231,
                                                                    columnNumber: 101
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1231,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex justify-between",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    style: st.hint,
                                                                    children: "Número"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1232,
                                                                    columnNumber: 63
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "font-mono",
                                                                    style: st.text,
                                                                    children: formatPhone(phone)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1232,
                                                                    columnNumber: 98
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1232,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex justify-between",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    style: st.hint,
                                                                    children: "Valor"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1233,
                                                                    columnNumber: 63
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "font-bold",
                                                                    style: st.green,
                                                                    children: formatCurrency(selectedValor.userCost ?? selectedValor.cost)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1233,
                                                                    columnNumber: 97
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1233,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex justify-between text-sm",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    style: st.hint,
                                                                    children: "Saldo após"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1234,
                                                                    columnNumber: 71
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    style: st.text,
                                                                    children: formatCurrency(saldo - (selectedValor.userCost ?? selectedValor.cost))
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1234,
                                                                    columnNumber: 110
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1234,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1229,
                                                    columnNumber: 23
                                                }, this),
                                                (selectedValor.userCost ?? selectedValor.cost) > saldo ? /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-center text-sm",
                                                    style: st.destructive,
                                                    children: "Saldo insuficiente"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1237,
                                                    columnNumber: 25
                                                }, this) : /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: handleRecargaConfirm,
                                                    disabled: recargaLoading,
                                                    className: "w-full rounded-xl py-3.5 font-semibold transition disabled:opacity-50",
                                                    style: {
                                                        backgroundColor: "#4ade80",
                                                        color: "#000"
                                                    },
                                                    children: recargaLoading ? "Processando..." : "✅ Confirmar Recarga"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1239,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1225,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true),
                                recargaStep === "phone" && /*#__PURE__*/ _jsxDEV("div", {
                                    className: "space-y-2 pt-2",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("h3", {
                                                    className: "font-bold text-sm",
                                                    style: st.text,
                                                    children: "Últimas Recargas"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1253,
                                                    columnNumber: 21
                                                }, this),
                                                recargas.length > 0 && /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setSection("historico"),
                                                    className: "text-xs",
                                                    style: st.link,
                                                    children: "Ver todas"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1255,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1252,
                                            columnNumber: 19
                                        }, this),
                                        recargas.length === 0 ? /*#__PURE__*/ _jsxDEV("div", {
                                            className: "rounded-xl p-4 text-center",
                                            style: {
                                                ...st.secondaryBg,
                                                border: st.borderSub
                                            },
                                            children: /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm",
                                                style: st.hint,
                                                children: "Nenhuma recarga realizada ainda"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1260,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1259,
                                            columnNumber: 21
                                        }, this) : recargas.slice(0, 5).map((r, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                                                initial: {
                                                    opacity: 0,
                                                    y: 10
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0
                                                },
                                                transition: {
                                                    delay: i * 0.05
                                                },
                                                className: "rounded-xl p-3.5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform",
                                                style: {
                                                    ...st.secondaryBg,
                                                    border: st.borderSub
                                                },
                                                onClick: ()=>{
                                                    if (r.status === "completed") {
                                                        setViewingReceipt(r);
                                                        setSection("historico");
                                                    }
                                                },
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "w-10 h-10 rounded-lg flex items-center justify-center",
                                                                style: st.bg,
                                                                children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                                    className: "w-5 h-5",
                                                                    style: st.link
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1275,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1274,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "font-bold text-sm",
                                                                        style: st.text,
                                                                        children: r.operadora || "—"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1278,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-xs font-mono",
                                                                        style: st.hint,
                                                                        children: formatPhone(r.telefone)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1279,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1277,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1273,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "text-right",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                className: "font-bold text-sm",
                                                                style: st.text,
                                                                children: formatCurrency(r.valor)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1283,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                className: "text-[11px] font-medium",
                                                                style: {
                                                                    color: r.status === "completed" ? "var(--tg-link)" : r.status === "pending" ? "#facc15" : "var(--tg-destructive)"
                                                                },
                                                                children: r.status === "completed" ? "Comprovante" : r.status === "pending" ? "Processando" : "Falha"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1284,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1282,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, r.id, true, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1264,
                                                columnNumber: 23
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1251,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, "recarga", true, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 884,
                            columnNumber: 13
                        }, this),
                        section === "deposito" && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "p-4 space-y-4",
                            children: pixData ? /*#__PURE__*/ _jsxDEV(motion.div, {
                                className: "space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] pb-4",
                                initial: {
                                    opacity: 0,
                                    scale: 0.9
                                },
                                animate: {
                                    opacity: 1,
                                    scale: 1
                                },
                                transition: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25
                                },
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-center",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                                className: "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center",
                                                style: {
                                                    backgroundColor: "rgba(74,222,128,0.15)"
                                                },
                                                initial: {
                                                    scale: 0
                                                },
                                                animate: {
                                                    scale: 1
                                                },
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 400,
                                                    damping: 12,
                                                    delay: 0.1
                                                },
                                                children: /*#__PURE__*/ _jsxDEV(Check, {
                                                    className: "w-6 h-6",
                                                    style: {
                                                        color: "#4ade80"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1315,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1308,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV(motion.h2, {
                                                className: "text-base font-bold",
                                                style: st.text,
                                                initial: {
                                                    opacity: 0,
                                                    y: 10
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0
                                                },
                                                transition: {
                                                    delay: 0.2
                                                },
                                                children: "PIX Gerado com Sucesso!"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1317,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1307,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(motion.div, {
                                        className: "flex justify-center",
                                        initial: {
                                            opacity: 0,
                                            y: 20
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            delay: 0.3
                                        },
                                        children: /*#__PURE__*/ _jsxDEV("div", {
                                            className: "bg-white rounded-xl p-2.5 relative",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                                    className: "absolute inset-0 rounded-xl",
                                                    animate: {
                                                        boxShadow: [
                                                            "0 0 0px rgba(74,222,128,0)",
                                                            "0 0 16px rgba(74,222,128,0.25)",
                                                            "0 0 0px rgba(74,222,128,0)"
                                                        ]
                                                    },
                                                    transition: {
                                                        duration: 2.5,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1336,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV(QRCodeSVG, {
                                                    value: pixData.qr_code || "",
                                                    size: 160
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1341,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1335,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1329,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(motion.p, {
                                        className: "text-center text-xl font-bold",
                                        style: st.green,
                                        initial: {
                                            opacity: 0,
                                            scale: 0.5
                                        },
                                        animate: {
                                            opacity: 1,
                                            scale: 1
                                        },
                                        transition: {
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 15,
                                            delay: 0.4
                                        },
                                        children: formatCurrency(pixData.amount)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1346,
                                        columnNumber: 19
                                    }, this),
                                    pixData.qr_code && /*#__PURE__*/ _jsxDEV(motion.div, {
                                        className: "space-y-2",
                                        initial: {
                                            opacity: 0,
                                            y: 10
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            delay: 0.5
                                        },
                                        children: /*#__PURE__*/ _jsxDEV(motion.button, {
                                            onClick: copyPix,
                                            className: "w-full rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2",
                                            style: st.btn,
                                            whileTap: {
                                                scale: 0.95
                                            },
                                            animate: copied ? {
                                                backgroundColor: "rgba(74,222,128,0.2)"
                                            } : {},
                                            children: copied ? /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(Check, {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1371,
                                                        columnNumber: 37
                                                    }, this),
                                                    " Copiado!"
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(Copy, {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1371,
                                                        columnNumber: 83
                                                    }, this),
                                                    " Copiar código PIX"
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1364,
                                            columnNumber: 23
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1358,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(motion.button, {
                                        onClick: ()=>{
                                            setPixData(null);
                                            setDepositAmount("");
                                        },
                                        className: "w-full text-center text-sm flex items-center justify-center gap-1",
                                        style: st.hint,
                                        initial: {
                                            opacity: 0
                                        },
                                        animate: {
                                            opacity: 1
                                        },
                                        transition: {
                                            delay: 0.6
                                        },
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1383,
                                                columnNumber: 21
                                            }, this),
                                            " Voltar"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1375,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 1300,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "rounded-2xl p-5 text-center",
                                        style: {
                                            ...st.secondaryBg,
                                            border: st.borderSub
                                        },
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[11px] uppercase tracking-wider",
                                                style: st.hint,
                                                children: "Saldo Atual"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1389,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-2xl font-bold mt-1",
                                                style: st.green,
                                                children: formatCurrency(saldo)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1390,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1388,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("h2", {
                                        className: "font-bold",
                                        style: st.text,
                                        children: "Selecione o valor"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1392,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "grid grid-cols-3 gap-2",
                                        children: [
                                            10,
                                            15,
                                            20,
                                            30,
                                            50,
                                            100
                                        ].map((v)=>/*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>setDepositAmount(String(v)),
                                                className: "rounded-xl py-3.5 text-center font-semibold transition",
                                                style: {
                                                    ...depositAmount === String(v) ? {
                                                        backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)",
                                                        color: "var(--tg-link)"
                                                    } : {
                                                        ...st.secondaryBg,
                                                        ...st.text
                                                    },
                                                    border: depositAmount === String(v) ? "1px solid var(--tg-btn)" : st.borderSub
                                                },
                                                children: [
                                                    "R$ ",
                                                    v
                                                ]
                                            }, v, true, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1395,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1393,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "space-y-1",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        style: st.hint,
                                                        children: "R$"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1407,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                        type: "text",
                                                        inputMode: "decimal",
                                                        value: depositAmount,
                                                        onChange: (e)=>setDepositAmount(e.target.value.replace(/[^\d,.]/g, "")),
                                                        placeholder: "Outro valor (mín. R$ 10)",
                                                        className: "flex-1 rounded-xl p-3 focus:outline-none",
                                                        style: {
                                                            ...st.secondaryBg,
                                                            ...st.text,
                                                            border: st.borderSub
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1408,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1406,
                                                columnNumber: 21
                                            }, this),
                                            depositAmount && parseFloat(depositAmount.replace(",", ".")) > 0 && parseFloat(depositAmount.replace(",", ".")) < 10 && /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs",
                                                style: {
                                                    color: "var(--tg-destructive, #ec3942)"
                                                },
                                                children: "Valor mínimo: R$ 10,00"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1413,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1405,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(motion.button, {
                                        onClick: handleDeposit,
                                        disabled: depositLoading || !depositAmount || parseFloat((depositAmount || "0").replace(",", ".")) < 10,
                                        className: "w-full rounded-2xl py-4 font-bold text-base transition disabled:opacity-40 flex items-center justify-center gap-3 relative overflow-hidden",
                                        style: {
                                            backgroundColor: "#4ade80",
                                            color: "#000"
                                        },
                                        whileTap: {
                                            scale: 0.97
                                        },
                                        animate: {
                                            boxShadow: [
                                                "0 0 0px rgba(74,222,128,0.3)",
                                                "0 0 20px rgba(74,222,128,0.5)",
                                                "0 0 0px rgba(74,222,128,0.3)"
                                            ]
                                        },
                                        transition: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        },
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                                animate: {
                                                    y: [
                                                        0,
                                                        -2,
                                                        0
                                                    ]
                                                },
                                                transition: {
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                },
                                                children: /*#__PURE__*/ _jsxDEV(Landmark, {
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1429,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1425,
                                                columnNumber: 21
                                            }, this),
                                            depositLoading ? "Gerando PIX..." : "💰 Gerar PIX Agora",
                                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                                className: "absolute right-4",
                                                animate: {
                                                    x: [
                                                        0,
                                                        4,
                                                        0
                                                    ]
                                                },
                                                transition: {
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                },
                                                children: /*#__PURE__*/ _jsxDEV(ChevronRight, {
                                                    className: "w-5 h-5"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1437,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1432,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1416,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 1387,
                                columnNumber: 17
                            }, this)
                        }, "deposito", false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1298,
                            columnNumber: 13
                        }, this),
                        section === "historico" && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "p-4 space-y-2",
                            children: [
                                /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                    children: viewingReceipt && /*#__PURE__*/ _jsxDEV(_Fragment, {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                                className: "fixed inset-0 z-[100]",
                                                style: {
                                                    backgroundColor: "rgba(0,0,0,0.6)"
                                                },
                                                initial: {
                                                    opacity: 0
                                                },
                                                animate: {
                                                    opacity: 1
                                                },
                                                exit: {
                                                    opacity: 0
                                                },
                                                onClick: ()=>setViewingReceipt(null)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1452,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                                className: "fixed inset-x-4 top-[15%] z-[101] rounded-2xl p-5 space-y-4 max-h-[75vh] overflow-y-auto",
                                                style: {
                                                    ...st.secondaryBg,
                                                    border: `2px solid ${viewingReceipt.status === "completed" ? "#4ade80" : "#facc15"}`
                                                },
                                                initial: {
                                                    opacity: 0,
                                                    scale: 0.9,
                                                    y: 30
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    scale: 1,
                                                    y: 0
                                                },
                                                exit: {
                                                    opacity: 0,
                                                    scale: 0.9,
                                                    y: 30
                                                },
                                                transition: {
                                                    type: "spring",
                                                    stiffness: 300,
                                                    damping: 25
                                                },
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "text-center",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center",
                                                                style: {
                                                                    backgroundColor: viewingReceipt.status === "completed" ? "rgba(74,222,128,0.15)" : "rgba(250,204,21,0.15)"
                                                                },
                                                                children: viewingReceipt.status === "completed" ? /*#__PURE__*/ _jsxDEV(Check, {
                                                                    className: "w-7 h-7",
                                                                    style: {
                                                                        color: "#4ade80"
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1473,
                                                                    columnNumber: 31
                                                                }, this) : /*#__PURE__*/ _jsxDEV(Clock, {
                                                                    className: "w-7 h-7",
                                                                    style: {
                                                                        color: "#facc15"
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1474,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1470,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                className: "font-bold text-lg",
                                                                style: st.text,
                                                                children: viewingReceipt.status === "completed" ? "Recarga Concluída" : viewingReceipt.status === "pending" ? "Processando..." : "Falha na Recarga"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1476,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1469,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "rounded-xl overflow-hidden",
                                                        style: {
                                                            ...st.bg,
                                                            border: st.borderSub
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "px-4 py-2.5 flex items-center gap-2",
                                                                style: {
                                                                    borderBottom: st.borderSub,
                                                                    backgroundColor: "rgba(74,222,128,0.05)"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV(FileText, {
                                                                        className: "w-3.5 h-3.5",
                                                                        style: {
                                                                            color: "#4ade80"
                                                                        }
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1484,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-[10px] font-bold tracking-wider uppercase",
                                                                        style: {
                                                                            color: "#4ade80"
                                                                        },
                                                                        children: "Comprovante"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1485,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1483,
                                                                columnNumber: 25
                                                            }, this),
                                                            [
                                                                {
                                                                    icon: Phone,
                                                                    label: "Telefone",
                                                                    value: formatPhone(viewingReceipt.telefone)
                                                                },
                                                                {
                                                                    icon: Zap,
                                                                    label: "Operadora",
                                                                    value: viewingReceipt.operadora || "—"
                                                                },
                                                                {
                                                                    icon: Wallet,
                                                                    label: "Valor",
                                                                    value: formatCurrency(viewingReceipt.valor),
                                                                    highlight: true
                                                                },
                                                                {
                                                                    icon: Hash,
                                                                    label: "ID do Pedido",
                                                                    value: viewingReceipt.external_id || viewingReceipt.id.slice(0, 8)
                                                                },
                                                                {
                                                                    icon: Clock,
                                                                    label: "Data",
                                                                    value: formatDateTimeBR(viewingReceipt.created_at)
                                                                }
                                                            ].map((row)=>/*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "flex items-center justify-between px-4 py-2.5",
                                                                    style: {
                                                                        borderBottom: "1px solid rgba(255,255,255,0.05)"
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                                            className: "flex items-center gap-2",
                                                                            children: [
                                                                                /*#__PURE__*/ _jsxDEV(row.icon, {
                                                                                    className: "w-3.5 h-3.5",
                                                                                    style: {
                                                                                        color: "var(--tg-hint)"
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                                    lineNumber: 1496,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                                    className: "text-xs",
                                                                                    style: {
                                                                                        color: "var(--tg-hint)"
                                                                                    },
                                                                                    children: row.label
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                                    lineNumber: 1497,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1495,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                                            className: "text-sm font-semibold",
                                                                            style: {
                                                                                color: row.highlight ? "#4ade80" : "var(--tg-text)"
                                                                            },
                                                                            children: row.value
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1499,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, row.label, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1494,
                                                                    columnNumber: 27
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1482,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "grid grid-cols-2 gap-3",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: async ()=>{
                                                                    const text = `✅ Comprovante de Recarga\n\n📱 Telefone: ${formatPhone(viewingReceipt.telefone)}\n📡 Operadora: ${viewingReceipt.operadora || "—"}\n💰 Valor: ${formatCurrency(viewingReceipt.valor)}\n🆔 Pedido: ${viewingReceipt.external_id || viewingReceipt.id.slice(0, 8)}\n🕐 Data: ${formatFullDateTimeBR(viewingReceipt.created_at)}\n\nRecarga realizada com sucesso!`;
                                                                    try {
                                                                        if (navigator.share) await navigator.share({
                                                                            title: "Comprovante de Recarga",
                                                                            text
                                                                        });
                                                                        else {
                                                                            await navigator.clipboard.writeText(text);
                                                                            tgWebApp?.HapticFeedback?.notificationOccurred("success");
                                                                        }
                                                                    } catch  {}
                                                                },
                                                                className: "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold",
                                                                style: {
                                                                    backgroundColor: "var(--tg-btn)",
                                                                    color: "var(--tg-btn-text)"
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV(Share2, {
                                                                        className: "w-4 h-4"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1517,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    " Enviar"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1506,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>setViewingReceipt(null),
                                                                className: "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold",
                                                                style: {
                                                                    ...st.bg,
                                                                    border: st.borderSub,
                                                                    color: "var(--tg-text)"
                                                                },
                                                                children: "Fechar"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                lineNumber: 1519,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1505,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1460,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1449,
                                    columnNumber: 15
                                }, this),
                                recargas.length === 0 ? /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-center py-12 text-sm",
                                    style: st.hint,
                                    children: "Nenhuma recarga encontrada"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1533,
                                    columnNumber: 17
                                }, this) : (()=>{
                                    let lastDate = "";
                                    return recargas.map((r)=>{
                                        const d = new Date(r.created_at);
                                        const dateLabel = formatDateLongUpperBR(r.created_at);
                                        const showSep = dateLabel !== lastDate;
                                        lastDate = dateLabel;
                                        return /*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                showSep && /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex justify-center my-2",
                                                    children: /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-[10px] px-3 py-0.5 rounded-full font-medium",
                                                        style: {
                                                            backgroundColor: "rgba(255,255,255,0.06)",
                                                            color: "var(--tg-hint)"
                                                        },
                                                        children: dateLabel
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1545,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1544,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>{
                                                        setViewingReceipt(r);
                                                        tgWebApp?.HapticFeedback?.impactOccurred("light");
                                                    },
                                                    className: "w-full rounded-xl p-3 flex items-center justify-between text-left active:scale-[0.98] transition-transform",
                                                    style: {
                                                        ...st.secondaryBg,
                                                        border: st.borderSub
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "w-9 h-9 rounded-lg flex items-center justify-center",
                                                                    style: st.bg,
                                                                    children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                                        className: "w-4 h-4",
                                                                        style: st.hint
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1555,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1554,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "font-semibold text-sm",
                                                                            style: st.text,
                                                                            children: r.operadora || "—"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1558,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "text-xs font-mono",
                                                                            style: st.hint,
                                                                            children: formatPhone(r.telefone)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1559,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1557,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1553,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "text-right flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "font-semibold text-sm",
                                                                            style: st.text,
                                                                            children: formatCurrency(r.valor)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1564,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "text-[10px]",
                                                                            style: {
                                                                                color: r.status === "completed" ? "#4ade80" : r.status === "pending" ? "#facc15" : "var(--tg-destructive)"
                                                                            },
                                                                            children: r.status === "completed" ? "✅ Concluída" : r.status === "pending" ? "⏳ Processando" : "❌ Falha"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1565,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1563,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV(ChevronRight, {
                                                                    className: "w-4 h-4",
                                                                    style: {
                                                                        color: "var(--tg-hint)"
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1569,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1562,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1548,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, r.id, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1542,
                                            columnNumber: 21
                                        }, this);
                                    });
                                })(),
                                /*#__PURE__*/ _jsxDEV("button", {
                                    onClick: async ()=>{
                                        setRefreshingRecargas(true);
                                        await loadRecargas();
                                        setRefreshingRecargas(false);
                                    },
                                    className: "w-full text-center text-sm transition py-2 flex items-center justify-center gap-1",
                                    style: st.hint,
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(RefreshCw, {
                                            className: `w-3.5 h-3.5 ${refreshingRecargas ? "animate-spin" : ""}`
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1577,
                                            columnNumber: 17
                                        }, this),
                                        " Atualizar"
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1576,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, "historico", true, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1447,
                            columnNumber: 13
                        }, this),
                        section === "extrato" && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "p-4 space-y-2",
                            children: [
                                transactions.length === 0 ? /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-center py-12 text-sm",
                                    style: st.hint,
                                    children: "Nenhum depósito encontrado"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1586,
                                    columnNumber: 17
                                }, this) : (()=>{
                                    let lastDate = "";
                                    return transactions.map((t)=>{
                                        const d = new Date(t.created_at);
                                        const dateLabel = formatDateLongUpperBR(t.created_at);
                                        const showSep = dateLabel !== lastDate;
                                        lastDate = dateLabel;
                                        const isPending = t.status === "pending";
                                        const hasQr = isPending && t.metadata?.qr_code && t.metadata.qr_code !== "yes" && t.metadata.qr_code !== "no";
                                        return /*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                showSep && /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex justify-center my-2",
                                                    children: /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-[10px] px-3 py-0.5 rounded-full font-medium",
                                                        style: {
                                                            backgroundColor: "rgba(255,255,255,0.06)",
                                                            color: "var(--tg-hint)"
                                                        },
                                                        children: dateLabel
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1600,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1599,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    className: "w-full rounded-xl p-3 flex items-center justify-between text-left",
                                                    style: {
                                                        ...st.secondaryBg,
                                                        border: st.borderSub
                                                    },
                                                    onClick: ()=>{
                                                        if (hasQr) {
                                                            setPixData({
                                                                gateway: t.metadata?.gateway || "",
                                                                payment_id: t.payment_id || "",
                                                                qr_code: t.metadata.qr_code,
                                                                qr_code_base64: null,
                                                                payment_link: null,
                                                                amount: t.amount,
                                                                status: "pending"
                                                            });
                                                            setSection("deposito");
                                                            tgWebApp?.HapticFeedback?.impactOccurred("light");
                                                        }
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex items-center gap-3",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "w-9 h-9 rounded-lg flex items-center justify-center",
                                                                    style: {
                                                                        backgroundColor: "color-mix(in srgb, #4ade80 10%, transparent)"
                                                                    },
                                                                    children: /*#__PURE__*/ _jsxDEV(Landmark, {
                                                                        className: "w-4 h-4",
                                                                        style: st.green
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                        lineNumber: 1624,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1623,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "font-semibold text-sm",
                                                                            style: st.text,
                                                                            children: "Depósito PIX"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1627,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "text-xs",
                                                                            style: st.hint,
                                                                            children: formatTimeBR(t.created_at)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1628,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1626,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1622,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "text-right flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "font-semibold text-sm",
                                                                            style: st.green,
                                                                            children: [
                                                                                "+",
                                                                                formatCurrency(t.amount)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1633,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "text-[10px]",
                                                                            style: {
                                                                                color: t.status === "approved" || t.status === "completed" ? "#4ade80" : isPending ? "#facc15" : "var(--tg-destructive)"
                                                                            },
                                                                            children: t.status === "approved" || t.status === "completed" ? "✅ Confirmado" : isPending ? "⏳ Processando" : "❌ Falha"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                            lineNumber: 1634,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1632,
                                                                    columnNumber: 27
                                                                }, this),
                                                                hasQr && /*#__PURE__*/ _jsxDEV(ChevronRight, {
                                                                    className: "w-4 h-4",
                                                                    style: {
                                                                        color: "var(--tg-hint)"
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                                    lineNumber: 1638,
                                                                    columnNumber: 37
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1631,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1603,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, t.id, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1597,
                                            columnNumber: 21
                                        }, this);
                                    });
                                })(),
                                /*#__PURE__*/ _jsxDEV("button", {
                                    onClick: async ()=>{
                                        setRefreshingExtrato(true);
                                        await loadTransactions();
                                        setRefreshingExtrato(false);
                                    },
                                    className: "w-full text-center text-sm transition py-2 flex items-center justify-center gap-1",
                                    style: st.hint,
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(RefreshCw, {
                                            className: `w-3.5 h-3.5 ${refreshingExtrato ? "animate-spin" : ""}`
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1646,
                                            columnNumber: 17
                                        }, this),
                                        " Atualizar"
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1645,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, "extrato", true, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1584,
                            columnNumber: 13
                        }, this),
                        section === "conta" && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "p-4 space-y-4",
                            children: [
                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        y: 20
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    transition: {
                                        delay: 0.05,
                                        type: "spring",
                                        damping: 20
                                    },
                                    className: "rounded-2xl p-5 flex items-center gap-4",
                                    style: {
                                        ...st.secondaryBg,
                                        border: st.borderSub
                                    },
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("label", {
                                            className: "relative cursor-pointer group shrink-0",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "w-[72px] h-[72px] rounded-full p-[3px] rgb-border flex items-center justify-center",
                                                    children: avatarUrl ? /*#__PURE__*/ _jsxDEV("img", {
                                                        src: avatarUrl,
                                                        alt: "Avatar",
                                                        className: "w-full h-full rounded-full object-cover"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1660,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "w-full h-full rounded-full bg-orange-500 flex items-center justify-center text-xl font-bold text-white",
                                                        children: initials
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1662,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1658,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center",
                                                    style: {
                                                        backgroundColor: "var(--tg-btn)"
                                                    },
                                                    children: uploadingAvatar ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                        className: "w-3.5 h-3.5 text-white animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1667,
                                                        columnNumber: 40
                                                    }, this) : /*#__PURE__*/ _jsxDEV(Camera, {
                                                        className: "w-3.5 h-3.5 text-white"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                        lineNumber: 1667,
                                                        columnNumber: 102
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1665,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("input", {
                                                    type: "file",
                                                    accept: "image/jpeg,image/png,image/webp,image/gif",
                                                    onChange: handleAvatarUpload,
                                                    className: "hidden",
                                                    disabled: uploadingAvatar
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1669,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1657,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "font-bold",
                                                    style: st.text,
                                                    children: userName
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1672,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-sm",
                                                    style: st.hint,
                                                    children: userEmail
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1673,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-xs mt-1",
                                                    style: st.hint,
                                                    children: "Toque na foto para alterar"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1674,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1671,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1654,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        y: 20
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    transition: {
                                        delay: 0.15,
                                        type: "spring",
                                        damping: 20
                                    },
                                    className: "rounded-2xl p-4 flex items-center gap-3 overflow-hidden relative",
                                    style: {
                                        ...st.secondaryBg,
                                        border: "1px solid rgba(34,197,94,0.3)"
                                    },
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(motion.div, {
                                            className: "absolute inset-0 opacity-10",
                                            style: {
                                                background: "linear-gradient(135deg, rgba(34,197,94,0.3) 0%, transparent 60%)"
                                            },
                                            animate: {
                                                opacity: [
                                                    0.05,
                                                    0.15,
                                                    0.05
                                                ]
                                            },
                                            transition: {
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1686,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV(motion.div, {
                                            animate: {
                                                rotate: [
                                                    0,
                                                    5,
                                                    -5,
                                                    0
                                                ]
                                            },
                                            transition: {
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                repeatDelay: 3
                                            },
                                            className: "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                            style: {
                                                backgroundColor: "rgba(34,197,94,0.15)"
                                            },
                                            children: /*#__PURE__*/ _jsxDEV("svg", {
                                                viewBox: "0 0 24 24",
                                                fill: "none",
                                                className: "w-5 h-5",
                                                children: /*#__PURE__*/ _jsxDEV("path", {
                                                    d: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.74 4-1.73 6.67-2.88 8.02-3.44 3.82-1.6 4.62-1.87 5.13-1.88.11 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .41z",
                                                    fill: "rgb(34,197,94)"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1699,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1698,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1692,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex-1 relative z-10",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "font-semibold text-sm",
                                                    style: {
                                                        color: "rgb(34,197,94)"
                                                    },
                                                    children: "Telegram Vinculado"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1703,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-xs",
                                                    style: st.hint,
                                                    children: "Conta conectada com sucesso"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1704,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1702,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV(motion.div, {
                                            initial: {
                                                scale: 0
                                            },
                                            animate: {
                                                scale: 1
                                            },
                                            transition: {
                                                delay: 0.5,
                                                type: "spring",
                                                stiffness: 300
                                            },
                                            children: /*#__PURE__*/ _jsxDEV(AnimatedCheck, {
                                                size: 22,
                                                className: "text-success"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                lineNumber: 1711,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1706,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1679,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        y: 20
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    transition: {
                                        delay: 0.25,
                                        type: "spring",
                                        damping: 20
                                    },
                                    className: "rounded-2xl p-5",
                                    style: {
                                        ...st.secondaryBg,
                                        border: st.borderSub
                                    },
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center gap-2 mb-1",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(motion.svg, {
                                                    width: "18",
                                                    height: "18",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: "2",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    style: {
                                                        color: "rgb(34,197,94)"
                                                    },
                                                    animate: {
                                                        rotateY: [
                                                            0,
                                                            180,
                                                            360
                                                        ],
                                                        scale: [
                                                            1,
                                                            1.15,
                                                            1
                                                        ]
                                                    },
                                                    transition: {
                                                        duration: 3,
                                                        repeat: Infinity,
                                                        ease: "easeInOut"
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("path", {
                                                            d: "M21 12V7H5a2 2 0 0 1 0-4h14v4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1725,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("path", {
                                                            d: "M3 5v14a2 2 0 0 0 2 2h16v-5"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1726,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("path", {
                                                            d: "M18 12a2 2 0 0 0 0 4h4v-4Z"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                            lineNumber: 1727,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1718,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-[11px] uppercase tracking-wider",
                                                    style: st.hint,
                                                    children: "Saldo de Revenda"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1729,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1717,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-2xl font-bold",
                                            style: st.green,
                                            children: formatCurrency(saldo)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1731,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1715,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV(motion.button, {
                                    initial: {
                                        opacity: 0,
                                        y: 20
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    transition: {
                                        delay: 0.35,
                                        type: "spring",
                                        damping: 20
                                    },
                                    onClick: handleLogout,
                                    className: "w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm transition",
                                    style: {
                                        ...st.destructive,
                                        border: st.borderSub
                                    },
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(LogOut, {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1736,
                                            columnNumber: 17
                                        }, this),
                                        " Sair da conta"
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1733,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, "conta", true, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1653,
                            columnNumber: 13
                        }, this),
                        section === "status" && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "p-4 space-y-3",
                            children: [
                                {
                                    name: "API de Recargas"
                                },
                                {
                                    name: "Gateway de Pagamento"
                                },
                                {
                                    name: "Bot do Telegram"
                                }
                            ].map((item)=>/*#__PURE__*/ _jsxDEV("div", {
                                    className: "rounded-xl p-4 flex items-center justify-between",
                                    style: {
                                        ...st.secondaryBg,
                                        border: st.borderSub
                                    },
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(Shield, {
                                                    className: "w-5 h-5",
                                                    style: st.hint
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1751,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "text-sm font-medium",
                                                    style: st.text,
                                                    children: item.name
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1752,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1750,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "w-2 h-2 rounded-full animate-pulse",
                                                    style: {
                                                        backgroundColor: "#4ade80"
                                                    }
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1755,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "text-xs",
                                                    style: st.green,
                                                    children: "Online"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1756,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1754,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, item.name, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1749,
                                    columnNumber: 17
                                }, this))
                        }, "status", false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1743,
                            columnNumber: 13
                        }, this),
                        section === "chat" && userId && hasAuthSession && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "h-[calc(100vh-180px)] tg-chat-theme",
                            children: /*#__PURE__*/ _jsxDEV(ChatPage, {
                                onBack: ()=>setSection("recarga"),
                                forceMobile: true
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 1765,
                                columnNumber: 15
                            }, this)
                        }, "chat", false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1764,
                            columnNumber: 13
                        }, this),
                        section === "chat" && (!userId || !hasAuthSession) && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            className: "p-6 flex flex-col items-center justify-center text-center",
                            style: {
                                minHeight: "50vh"
                            },
                            children: [
                                /*#__PURE__*/ _jsxDEV(MessageCircle, {
                                    className: "w-14 h-14 mb-4",
                                    style: st.hint
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1770,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-base font-bold mb-2",
                                    style: st.text,
                                    children: "Faça login para acessar o chat"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1771,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "rounded-xl p-4 mt-2 text-left space-y-2",
                                    style: {
                                        background: "rgba(255,255,255,0.05)",
                                        border: st.borderMain
                                    },
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-xs font-semibold",
                                            style: st.text,
                                            children: "📋 Como acessar:"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1773,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-xs",
                                            style: st.hint,
                                            children: [
                                                "1. Toque na aba ",
                                                /*#__PURE__*/ _jsxDEV("strong", {
                                                    style: st.text,
                                                    children: '"Conta"'
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1774,
                                                    columnNumber: 72
                                                }, this),
                                                " no menu inferior"
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1774,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-xs",
                                            style: st.hint,
                                            children: [
                                                "2. Se já estiver logado, toque em ",
                                                /*#__PURE__*/ _jsxDEV("strong", {
                                                    style: st.text,
                                                    children: '"Sair"'
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1775,
                                                    columnNumber: 90
                                                }, this),
                                                " e entre novamente"
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1775,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-xs",
                                            style: st.hint,
                                            children: [
                                                "3. Faça login com seu ",
                                                /*#__PURE__*/ _jsxDEV("strong", {
                                                    style: st.text,
                                                    children: "e-mail e senha"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1776,
                                                    columnNumber: 78
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1776,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-xs",
                                            style: st.hint,
                                            children: [
                                                "4. Volte para a aba ",
                                                /*#__PURE__*/ _jsxDEV("strong", {
                                                    style: st.text,
                                                    children: '"Chat"'
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                                    lineNumber: 1777,
                                                    columnNumber: 76
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                            lineNumber: 1777,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1772,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-[10px] mt-3",
                                    style: st.hint,
                                    children: "⚠️ Certifique-se de lembrar seu e-mail e senha cadastrados no sistema"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1779,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("button", {
                                    onClick: ()=>setSection("conta"),
                                    className: "mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                    style: {
                                        background: st.btn?.backgroundColor || "var(--tg-btn, #2481cc)",
                                        color: st.btnText?.color || "#fff"
                                    },
                                    children: "Ir para Conta"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1780,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, "chat-no-auth", true, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1769,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                    lineNumber: 881,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                lineNumber: 880,
                columnNumber: 7
            }, this),
            (isSeasonalActive || transitioning) && /*#__PURE__*/ _jsxDEV(_Fragment, {
                children: [
                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                        mode: "wait",
                        children: !transitioning && isSeasonalActive && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                height: 0,
                                opacity: 0
                            },
                            animate: {
                                height: "auto",
                                opacity: 1
                            },
                            exit: {
                                height: 0,
                                opacity: 0
                            },
                            transition: {
                                duration: 0.8,
                                ease: [
                                    0.25,
                                    0.1,
                                    0.25,
                                    1
                                ]
                            },
                            className: `fixed top-0 left-0 right-0 z-40 bg-gradient-to-r ${seasonalTheme.accentGradient} overflow-hidden`,
                            children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                initial: {
                                    y: -20,
                                    opacity: 0
                                },
                                animate: {
                                    y: 0,
                                    opacity: 1
                                },
                                exit: {
                                    y: -20,
                                    opacity: 0
                                },
                                transition: {
                                    duration: 0.5,
                                    delay: 0.3
                                },
                                className: "flex items-center justify-center gap-2 py-1.5 px-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-sm",
                                        children: seasonalTheme.emoji
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1813,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-xs font-bold text-white drop-shadow-sm tracking-wide",
                                        children: seasonalTheme.label.toUpperCase()
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1814,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-sm",
                                        children: seasonalTheme.emoji
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1815,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 1806,
                                columnNumber: 17
                            }, this)
                        }, `miniapp-banner-${seasonalTheme.key}`, false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1798,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                        lineNumber: 1796,
                        columnNumber: 11
                    }, this),
                    seasonalTheme.particles.slice(0, 8).map((emoji, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                            className: "fixed pointer-events-none select-none z-[9999]",
                            initial: {
                                top: -40,
                                left: `${(i * 12 + Math.random() * 8) % 95}%`,
                                opacity: 0,
                                scale: 0.5,
                                rotate: 0
                            },
                            animate: transitioning ? {
                                opacity: 0,
                                scale: 0,
                                rotate: 720,
                                transition: {
                                    duration: 1.5,
                                    ease: "easeInOut"
                                }
                            } : {
                                top: "110vh",
                                opacity: [
                                    0,
                                    0.8,
                                    0.8,
                                    0.4,
                                    0
                                ],
                                scale: [
                                    0.5,
                                    1,
                                    0.8
                                ],
                                rotate: [
                                    0,
                                    180,
                                    360
                                ]
                            },
                            transition: transitioning ? undefined : {
                                duration: 8 + Math.random() * 5,
                                delay: i * 1.2,
                                repeat: Infinity,
                                ease: "linear"
                            },
                            style: {
                                fontSize: 14 + Math.random() * 8
                            },
                            children: emoji
                        }, `miniapp-p-${seasonalTheme.key}-${i}`, false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1823,
                            columnNumber: 13
                        }, this)),
                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                        children: !transitioning && seasonalTheme.glowColor && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            transition: {
                                duration: 1.5,
                                ease: "easeInOut"
                            },
                            className: "fixed inset-0 pointer-events-none z-[9998]",
                            style: {
                                background: `radial-gradient(ellipse at 50% 0%, ${seasonalTheme.glowColor} 0%, transparent 60%)`
                            }
                        }, `miniapp-glow-${seasonalTheme.key}`, false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1846,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                        lineNumber: 1844,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                        mode: "wait",
                        children: !transitioning && isSeasonalActive && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                height: 0,
                                opacity: 0
                            },
                            animate: {
                                height: "auto",
                                opacity: 1
                            },
                            exit: {
                                height: 0,
                                opacity: 0
                            },
                            transition: {
                                duration: 0.6,
                                ease: [
                                    0.25,
                                    0.1,
                                    0.25,
                                    1
                                ]
                            },
                            className: `fixed bottom-[60px] left-0 right-0 z-20 bg-gradient-to-r ${seasonalTheme.accentGradient} overflow-hidden`,
                            children: /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center justify-center gap-2 py-1 px-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-xs",
                                        children: seasonalTheme.emoji
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1872,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-[10px] font-bold text-white drop-shadow-sm tracking-wide",
                                        children: seasonalTheme.label.toUpperCase()
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1873,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-xs",
                                        children: seasonalTheme.emoji
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1874,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                lineNumber: 1871,
                                columnNumber: 17
                            }, this)
                        }, `miniapp-strip-${seasonalTheme.key}`, false, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1863,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                        lineNumber: 1861,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "fixed bottom-0 left-0 right-0 backdrop-blur-xl z-30 safe-area-bottom",
                style: {
                    ...st.bottomBar,
                    borderTop: st.borderMain
                },
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "flex justify-around items-center px-2 py-2.5",
                    children: [
                        {
                            id: "recarga",
                            icon: Smartphone,
                            label: seasonalEmojis.recarga ? `${seasonalEmojis.recarga}` : "Recarga",
                            defaultLabel: "Recarga"
                        },
                        {
                            id: "deposito",
                            icon: Plus,
                            label: seasonalEmojis.deposito ? `${seasonalEmojis.deposito}` : "Saldo",
                            defaultLabel: "Saldo"
                        },
                        {
                            id: "chat",
                            icon: MessageCircle,
                            label: seasonalEmojis.chat ? `${seasonalEmojis.chat}` : "Chat",
                            defaultLabel: "Chat"
                        },
                        {
                            id: "historico",
                            icon: Clock,
                            label: seasonalEmojis.historico ? `${seasonalEmojis.historico}` : "Pedidos",
                            defaultLabel: "Pedidos"
                        },
                        {
                            id: "conta",
                            icon: User,
                            label: seasonalEmojis.conta ? `${seasonalEmojis.conta}` : "Conta",
                            defaultLabel: "Conta"
                        }
                    ].map((item)=>{
                        const isActive = section === item.id;
                        // Unique animation per icon
                        const iconAnimations = {
                            recarga: {
                                rotate: [
                                    0,
                                    -15,
                                    15,
                                    -10,
                                    0
                                ],
                                scale: [
                                    1,
                                    1.15,
                                    1
                                ],
                                transition: {
                                    duration: 0.5,
                                    ease: "easeInOut"
                                }
                            },
                            deposito: {
                                scale: [
                                    1,
                                    1.3,
                                    1
                                ],
                                rotate: [
                                    0,
                                    90,
                                    180,
                                    270,
                                    360
                                ],
                                transition: {
                                    duration: 0.6,
                                    ease: "easeInOut"
                                }
                            },
                            chat: {
                                scale: [
                                    1,
                                    1.2,
                                    1
                                ],
                                y: [
                                    0,
                                    -4,
                                    0
                                ],
                                transition: {
                                    duration: 0.4,
                                    ease: "easeOut"
                                }
                            },
                            historico: {
                                rotate: [
                                    0,
                                    360
                                ],
                                transition: {
                                    duration: 0.8,
                                    ease: "easeInOut"
                                }
                            },
                            extrato: {
                                y: [
                                    0,
                                    -6,
                                    0
                                ],
                                scale: [
                                    1,
                                    1.1,
                                    1
                                ],
                                transition: {
                                    duration: 0.4,
                                    ease: "easeOut"
                                }
                            },
                            conta: {
                                scale: [
                                    1,
                                    1.2,
                                    0.9,
                                    1.1,
                                    1
                                ],
                                transition: {
                                    duration: 0.5,
                                    type: "spring"
                                }
                            }
                        };
                        const continuousAnimations = {
                            recarga: {
                                y: [
                                    0,
                                    -3,
                                    0
                                ],
                                transition: {
                                    repeat: Infinity,
                                    duration: 1.8,
                                    ease: "easeInOut"
                                }
                            },
                            deposito: {
                                rotate: [
                                    0,
                                    8,
                                    -8,
                                    0
                                ],
                                transition: {
                                    repeat: Infinity,
                                    duration: 2.5,
                                    ease: "easeInOut"
                                }
                            },
                            chat: {
                                y: [
                                    0,
                                    -2,
                                    0
                                ],
                                scale: [
                                    1,
                                    1.05,
                                    1
                                ],
                                transition: {
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "easeInOut"
                                }
                            },
                            historico: {
                                rotate: [
                                    0,
                                    360
                                ],
                                transition: {
                                    repeat: Infinity,
                                    duration: 4,
                                    ease: "linear"
                                }
                            },
                            extrato: {
                                y: [
                                    0,
                                    -2,
                                    0,
                                    2,
                                    0
                                ],
                                transition: {
                                    repeat: Infinity,
                                    duration: 2.2,
                                    ease: "easeInOut"
                                }
                            },
                            conta: {
                                scale: [
                                    1,
                                    1.08,
                                    1
                                ],
                                transition: {
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "easeInOut"
                                }
                            }
                        };
                        const iconAnimation = isActive ? iconAnimations[item.id] || {} : {};
                        const continuousAnim = continuousAnimations[item.id] || {};
                        return /*#__PURE__*/ _jsxDEV("button", {
                            onClick: ()=>{
                                setSection(item.id);
                                tgWebApp?.HapticFeedback?.impactOccurred("light");
                            },
                            className: "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition min-w-[60px]",
                            style: {
                                color: isActive ? "var(--tg-accent)" : "var(--tg-hint)"
                            },
                            children: [
                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                    animate: {
                                        ...iconAnimation,
                                        ...continuousAnim
                                    },
                                    whileTap: {
                                        scale: 0.8
                                    },
                                    children: /*#__PURE__*/ _jsxDEV(item.icon, {
                                        className: "w-6 h-6"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                        lineNumber: 1922,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1918,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ _jsxDEV("span", {
                                    className: "text-[11px] font-medium leading-tight",
                                    children: item.label
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1924,
                                    columnNumber: 17
                                }, this),
                                isActive && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    layoutId: "tab-indicator",
                                    className: "w-1.5 h-1.5 rounded-full mt-0.5",
                                    style: {
                                        backgroundColor: "var(--tg-accent)"
                                    },
                                    transition: {
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30
                                    }
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                                    lineNumber: 1926,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, item.id, true, {
                            fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                            lineNumber: 1915,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                    lineNumber: 1885,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
                lineNumber: 1883,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/TelegramMiniApp.tsx",
        lineNumber: 832,
        columnNumber: 5
    }, this);
}
_s1(TelegramMiniApp, "yRkbCp58U8lOd3IxL3aV3wCW3R8=", false, function() {
    return [
        useTelegramTheme,
        useSeasonalTheme
    ];
});
_c = TelegramMiniApp;
var _c;
$RefreshReg$(_c, "TelegramMiniApp");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/TelegramMiniApp.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/TelegramMiniApp.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRlbGVncmFtTWluaUFwcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBBbmltYXRlZENoZWNrIGZyb20gXCJAL2NvbXBvbmVudHMvQW5pbWF0ZWRDaGVja1wiO1xuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tIFwiQC9pbnRlZ3JhdGlvbnMvc3VwYWJhc2UvY2xpZW50XCI7XG5pbXBvcnQgeyBjcmVhdGVQaXhEZXBvc2l0LCB0eXBlIFBpeFJlc3VsdCB9IGZyb20gXCJAL2xpYi9wYXltZW50XCI7XG5pbXBvcnQgeyBtb3Rpb24sIEFuaW1hdGVQcmVzZW5jZSB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5pbXBvcnQgcmVjYXJnYXNMb2dvIGZyb20gXCJAL2Fzc2V0cy9yZWNhcmdhcy1icmFzaWwtbG9nby5qcGVnXCI7XG5pbXBvcnQgeyBRUkNvZGVTVkcgfSBmcm9tIFwicXJjb2RlLnJlYWN0XCI7XG5pbXBvcnQge1xuICBTbWFydHBob25lLCBQbHVzLCBDbG9jaywgTGFuZG1hcmssIFVzZXIsXG4gIENoZXZyb25SaWdodCwgUmVmcmVzaEN3LCBDb3B5LCBDaGVjayxcbiAgQXJyb3dMZWZ0LCBTaGllbGQsIExvZ091dCwgQ2FtZXJhLCBMb2FkZXIyLFxuICBTaGFyZTIsIEZpbGVUZXh0LCBNYXBQaW4sIEhhc2gsIFdhbGxldCwgUGhvbmUsIFphcCxcbiAgQWxlcnRUcmlhbmdsZSwgQ2hlY2tDaXJjbGUyLCBYQ2lyY2xlLCBNZXNzYWdlQ2lyY2xlXG59IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcbmltcG9ydCB7IENoYXRQYWdlIH0gZnJvbSBcIkAvY29tcG9uZW50cy9jaGF0L0NoYXRQYWdlXCI7XG5pbXBvcnQgeyB1c2VTZWFzb25hbFRoZW1lLCBTRUFTT05BTF9CVVRUT05fRU1PSklTIH0gZnJvbSBcIkAvaG9va3MvdXNlU2Vhc29uYWxUaGVtZVwiO1xuaW1wb3J0IHsgU0VBU09OQUxfVEhFTUVTLCB0eXBlIFNlYXNvbmFsVGhlbWVLZXkgfSBmcm9tIFwiQC9jb21wb25lbnRzL1NlYXNvbmFsRWZmZWN0c1wiO1xuaW1wb3J0IHsgZm9ybWF0RnVsbERhdGVUaW1lQlIsIGZvcm1hdERhdGVUaW1lQlIsIGZvcm1hdERhdGVMb25nVXBwZXJCUiwgZm9ybWF0VGltZUJSIH0gZnJvbSBcIkAvbGliL3RpbWV6b25lXCI7XG5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgaW50ZXJmYWNlIFdpbmRvdyB7XG4gICAgVGVsZWdyYW0/OiB7XG4gICAgICBXZWJBcHA/OiB7XG4gICAgICAgIHJlYWR5OiAoKSA9PiB2b2lkO1xuICAgICAgICBleHBhbmQ6ICgpID0+IHZvaWQ7XG4gICAgICAgIGNsb3NlOiAoKSA9PiB2b2lkO1xuICAgICAgICBjb2xvclNjaGVtZT86IFwibGlnaHRcIiB8IFwiZGFya1wiO1xuICAgICAgICBpbml0RGF0YVVuc2FmZT86IHsgdXNlcj86IHsgaWQ6IG51bWJlcjsgdXNlcm5hbWU/OiBzdHJpbmcgfSB9O1xuICAgICAgICB0aGVtZVBhcmFtcz86IHtcbiAgICAgICAgICBiZ19jb2xvcj86IHN0cmluZztcbiAgICAgICAgICB0ZXh0X2NvbG9yPzogc3RyaW5nO1xuICAgICAgICAgIGhpbnRfY29sb3I/OiBzdHJpbmc7XG4gICAgICAgICAgbGlua19jb2xvcj86IHN0cmluZztcbiAgICAgICAgICBidXR0b25fY29sb3I/OiBzdHJpbmc7XG4gICAgICAgICAgYnV0dG9uX3RleHRfY29sb3I/OiBzdHJpbmc7XG4gICAgICAgICAgc2Vjb25kYXJ5X2JnX2NvbG9yPzogc3RyaW5nO1xuICAgICAgICAgIHNlY3Rpb25fYmdfY29sb3I/OiBzdHJpbmc7XG4gICAgICAgICAgYWNjZW50X3RleHRfY29sb3I/OiBzdHJpbmc7XG4gICAgICAgICAgZGVzdHJ1Y3RpdmVfdGV4dF9jb2xvcj86IHN0cmluZztcbiAgICAgICAgICBoZWFkZXJfYmdfY29sb3I/OiBzdHJpbmc7XG4gICAgICAgICAgc3VidGl0bGVfdGV4dF9jb2xvcj86IHN0cmluZztcbiAgICAgICAgICBzZWN0aW9uX2hlYWRlcl90ZXh0X2NvbG9yPzogc3RyaW5nO1xuICAgICAgICAgIGJvdHRvbV9iYXJfYmdfY29sb3I/OiBzdHJpbmc7XG4gICAgICAgIH07XG4gICAgICAgIEJhY2tCdXR0b24/OiB7IHNob3c6ICgpID0+IHZvaWQ7IGhpZGU6ICgpID0+IHZvaWQ7IG9uQ2xpY2s6IChjYjogKCkgPT4gdm9pZCkgPT4gdm9pZDsgb2ZmQ2xpY2s6IChjYjogKCkgPT4gdm9pZCkgPT4gdm9pZCB9O1xuICAgICAgICBNYWluQnV0dG9uPzogeyBzaG93OiAoKSA9PiB2b2lkOyBoaWRlOiAoKSA9PiB2b2lkOyBzZXRUZXh0OiAodDogc3RyaW5nKSA9PiB2b2lkOyBvbkNsaWNrOiAoY2I6ICgpID0+IHZvaWQpID0+IHZvaWQgfTtcbiAgICAgICAgSGFwdGljRmVlZGJhY2s/OiB7IGltcGFjdE9jY3VycmVkOiAoczogc3RyaW5nKSA9PiB2b2lkOyBub3RpZmljYXRpb25PY2N1cnJlZDogKHM6IHN0cmluZykgPT4gdm9pZCB9O1xuICAgICAgfTtcbiAgICB9O1xuICB9XG59XG5cbi8vIFRlbGVncmFtIGRhcmsgdGhlbWUgZGVmYXVsdHMgKG1hdGNoZXMgVGVsZWdyYW0ncyBkYXJrIG1vZGUpXG5jb25zdCBUR19EQVJLX0RFRkFVTFRTID0ge1xuICBiZ19jb2xvcjogXCIjMTcyMTJiXCIsXG4gIHRleHRfY29sb3I6IFwiI2Y1ZjVmNVwiLFxuICBoaW50X2NvbG9yOiBcIiM3MDg0OTlcIixcbiAgbGlua19jb2xvcjogXCIjNmFiM2YzXCIsXG4gIGJ1dHRvbl9jb2xvcjogXCIjNTI4OGMxXCIsXG4gIGJ1dHRvbl90ZXh0X2NvbG9yOiBcIiNmZmZmZmZcIixcbiAgc2Vjb25kYXJ5X2JnX2NvbG9yOiBcIiMyMzJlM2NcIixcbiAgc2VjdGlvbl9iZ19jb2xvcjogXCIjMTcyMTJiXCIsXG4gIGFjY2VudF90ZXh0X2NvbG9yOiBcIiM2YWIyZjJcIixcbiAgZGVzdHJ1Y3RpdmVfdGV4dF9jb2xvcjogXCIjZWMzOTQyXCIsXG4gIGhlYWRlcl9iZ19jb2xvcjogXCIjMTcyMTJiXCIsXG4gIHN1YnRpdGxlX3RleHRfY29sb3I6IFwiIzcwODQ5OVwiLFxuICBzZWN0aW9uX2hlYWRlcl90ZXh0X2NvbG9yOiBcIiM2YWIyZjJcIixcbiAgYm90dG9tX2Jhcl9iZ19jb2xvcjogXCIjMTcyMTJiXCIsXG59O1xuXG5mdW5jdGlvbiB1c2VUZWxlZ3JhbVRoZW1lKCkge1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHRnID0gd2luZG93LlRlbGVncmFtPy5XZWJBcHA7XG4gICAgY29uc3QgdHAgPSB0Zz8udGhlbWVQYXJhbXM7XG4gICAgY29uc3Qgcm9vdCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuICAgIGNvbnN0IHRoZW1lID0geyAuLi5UR19EQVJLX0RFRkFVTFRTLCAuLi50cCB9O1xuXG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tdGctYmdcIiwgdGhlbWUuYmdfY29sb3IpO1xuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoXCItLXRnLXRleHRcIiwgdGhlbWUudGV4dF9jb2xvcik7XG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tdGctaGludFwiLCB0aGVtZS5oaW50X2NvbG9yKTtcbiAgICByb290LnN0eWxlLnNldFByb3BlcnR5KFwiLS10Zy1saW5rXCIsIHRoZW1lLmxpbmtfY29sb3IpO1xuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoXCItLXRnLWJ0blwiLCB0aGVtZS5idXR0b25fY29sb3IpO1xuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoXCItLXRnLWJ0bi10ZXh0XCIsIHRoZW1lLmJ1dHRvbl90ZXh0X2NvbG9yKTtcbiAgICByb290LnN0eWxlLnNldFByb3BlcnR5KFwiLS10Zy1zZWNvbmRhcnktYmdcIiwgdGhlbWUuc2Vjb25kYXJ5X2JnX2NvbG9yKTtcbiAgICByb290LnN0eWxlLnNldFByb3BlcnR5KFwiLS10Zy1zZWN0aW9uLWJnXCIsIHRoZW1lLnNlY3Rpb25fYmdfY29sb3IpO1xuICAgIHJvb3Quc3R5bGUuc2V0UHJvcGVydHkoXCItLXRnLWFjY2VudFwiLCB0aGVtZS5hY2NlbnRfdGV4dF9jb2xvcik7XG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tdGctZGVzdHJ1Y3RpdmVcIiwgdGhlbWUuZGVzdHJ1Y3RpdmVfdGV4dF9jb2xvcik7XG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tdGctaGVhZGVyLWJnXCIsIHRoZW1lLmhlYWRlcl9iZ19jb2xvcik7XG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tdGctc3VidGl0bGVcIiwgdGhlbWUuc3VidGl0bGVfdGV4dF9jb2xvcik7XG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tdGctc2VjdGlvbi1oZWFkZXJcIiwgdGhlbWUuc2VjdGlvbl9oZWFkZXJfdGV4dF9jb2xvcik7XG4gICAgcm9vdC5zdHlsZS5zZXRQcm9wZXJ0eShcIi0tdGctYm90dG9tLWJhclwiLCB0aGVtZS5ib3R0b21fYmFyX2JnX2NvbG9yIHx8IHRoZW1lLnNlY29uZGFyeV9iZ19jb2xvcik7XG4gIH0sIFtdKTtcbn1cblxudHlwZSBTZWN0aW9uID0gXCJyZWNhcmdhXCIgfCBcImRlcG9zaXRvXCIgfCBcImhpc3Rvcmljb1wiIHwgXCJleHRyYXRvXCIgfCBcImNvbnRhXCIgfCBcInN0YXR1c1wiIHwgXCJjaGF0XCI7XG5cbmltcG9ydCB0eXBlIHsgUmVjYXJnYSB9IGZyb20gXCJAL3R5cGVzXCI7XG5cbmludGVyZmFjZSBWYWxvckl0ZW0geyB2YWx1ZUlkOiBzdHJpbmc7IGNvc3Q6IG51bWJlcjsgdXNlckNvc3Q/OiBudW1iZXI7IHZhbHVlPzogbnVtYmVyOyBsYWJlbDogc3RyaW5nOyB9XG5pbnRlcmZhY2UgVGdPcGVyYWRvcmEgeyBpZDogc3RyaW5nOyBub21lOiBzdHJpbmc7IGNhcnJpZXJJZDogc3RyaW5nOyB2YWxvcmVzOiBWYWxvckl0ZW1bXTsgfVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBUZWxlZ3JhbU1pbmlBcHAoKSB7XG4gIHVzZVRlbGVncmFtVGhlbWUoKTtcblxuICAvLyBFeHBhbmQgdG8gZnVsbCBzY3JlZW4gYXV0b21hdGljYWxseVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHRnID0gd2luZG93LlRlbGVncmFtPy5XZWJBcHA7XG4gICAgaWYgKHRnKSB7XG4gICAgICB0Zy5yZWFkeSgpO1xuICAgICAgdGcuZXhwYW5kKCk7XG5cbiAgICAgIC8vIFJldHJ5IGV4cGFuZCBhZnRlciBzaG9ydCBkZWxheXMgdG8gZW5zdXJlIGl0IHRha2VzIGVmZmVjdFxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0Zy5leHBhbmQoKSwgMTAwKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGcuZXhwYW5kKCksIDUwMCk7XG5cbiAgICAgIC8vIERpc2FibGUgdmVydGljYWwgc3dpcGUgdG8gY2xvc2UgKGtlZXBzIGFwcCBmdWxsc2NyZWVuKVxuICAgICAgaWYgKCh0ZyBhcyBhbnkpLmRpc2FibGVWZXJ0aWNhbFN3aXBlcykge1xuICAgICAgICAodGcgYXMgYW55KS5kaXNhYmxlVmVydGljYWxTd2lwZXMoKTtcbiAgICAgIH1cbiAgICAgIC8vIFJlcXVlc3QgZnVsbHNjcmVlbiBpZiBhdmFpbGFibGUgKFRlbGVncmFtIEJvdCBBUEkgOC4wKylcbiAgICAgIGlmICgodGcgYXMgYW55KS5yZXF1ZXN0RnVsbHNjcmVlbikge1xuICAgICAgICB0cnkgeyAodGcgYXMgYW55KS5yZXF1ZXN0RnVsbHNjcmVlbigpOyB9IGNhdGNoIHt9XG4gICAgICB9XG4gICAgICAvLyBGb3JjZSB2aWV3cG9ydCBoZWlnaHQgdG8gMTAwJVxuICAgICAgaWYgKCh0ZyBhcyBhbnkpLmlzRXhwYW5kZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGcuZXhwYW5kKCksIDEwMDApO1xuICAgICAgfVxuICAgICAgLy8gU2V0IGhlYWRlci92aWV3cG9ydCBjb2xvciB0byBtYXRjaCBiYWNrZ3JvdW5kXG4gICAgICBpZiAoKHRnIGFzIGFueSkuc2V0SGVhZGVyQ29sb3IpIHtcbiAgICAgICAgdHJ5IHsgKHRnIGFzIGFueSkuc2V0SGVhZGVyQ29sb3IoXCJzZWNvbmRhcnlfYmdfY29sb3JcIik7IH0gY2F0Y2gge31cbiAgICAgIH1cbiAgICAgIGlmICgodGcgYXMgYW55KS5zZXRCYWNrZ3JvdW5kQ29sb3IpIHtcbiAgICAgICAgdHJ5IHsgKHRnIGFzIGFueSkuc2V0QmFja2dyb3VuZENvbG9yKFwiIzE3MjEyYlwiKTsgfSBjYXRjaCB7fVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENTUyBmaXg6IGVuc3VyZSBmdWxsIHZpZXdwb3J0IG9uIFRlbGVncmFtXG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG5cbiAgICAvLyBQcmV2ZW50IHpvb206IHVwZGF0ZSB2aWV3cG9ydCBtZXRhIHRhZ1xuICAgIGxldCB2aWV3cG9ydE1ldGEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdtZXRhW25hbWU9XCJ2aWV3cG9ydFwiXScpIGFzIEhUTUxNZXRhRWxlbWVudCB8IG51bGw7XG4gICAgaWYgKCF2aWV3cG9ydE1ldGEpIHtcbiAgICAgIHZpZXdwb3J0TWV0YSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJtZXRhXCIpO1xuICAgICAgdmlld3BvcnRNZXRhLm5hbWUgPSBcInZpZXdwb3J0XCI7XG4gICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHZpZXdwb3J0TWV0YSk7XG4gICAgfVxuICAgIGNvbnN0IG9yaWdpbmFsVmlld3BvcnQgPSB2aWV3cG9ydE1ldGEuY29udGVudDtcbiAgICB2aWV3cG9ydE1ldGEuY29udGVudCA9IFwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEuMCwgbWF4aW11bS1zY2FsZT0xLjAsIHVzZXItc2NhbGFibGU9bm8sIHZpZXdwb3J0LWZpdD1jb3ZlclwiO1xuXG4gICAgLy8gUHJldmVudCBwaW5jaC10by16b29tIG9ubHkgKGRvdWJsZS10YXAgaGFuZGxlZCB2aWEgQ1NTIHRvdWNoLWFjdGlvbilcbiAgICBjb25zdCBwcmV2ZW50Wm9vbSA9IChlOiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA+IDEpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9O1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaHN0YXJ0XCIsIHByZXZlbnRab29tLCB7IHBhc3NpdmU6IGZhbHNlIH0pO1xuXG4gICAgLy8gUHJldmVudCBnZXN0dXJlIHpvb20gKFNhZmFyaSlcbiAgICBjb25zdCBwcmV2ZW50R2VzdHVyZSA9IChlOiBFdmVudCkgPT4gZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJnZXN0dXJlc3RhcnRcIiwgcHJldmVudEdlc3R1cmUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJnZXN0dXJlY2hhbmdlXCIsIHByZXZlbnRHZXN0dXJlKTtcblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gXCJcIjtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuaGVpZ2h0ID0gXCJcIjtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3cgPSBcIlwiO1xuICAgICAgaWYgKHZpZXdwb3J0TWV0YSkgdmlld3BvcnRNZXRhLmNvbnRlbnQgPSBvcmlnaW5hbFZpZXdwb3J0O1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIiwgcHJldmVudFpvb20pO1xuICAgICAgXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZ2VzdHVyZXN0YXJ0XCIsIHByZXZlbnRHZXN0dXJlKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJnZXN0dXJlY2hhbmdlXCIsIHByZXZlbnRHZXN0dXJlKTtcbiAgICB9O1xuICB9LCBbXSk7XG5cbiAgY29uc3QgeyBhY3RpdmVUaGVtZSwgdGhlbWU6IHNlYXNvbmFsVGhlbWUsIGVtb2ppczogc2Vhc29uYWxFbW9qaXMsIGlzQWN0aXZlOiBpc1NlYXNvbmFsQWN0aXZlLCB0cmFuc2l0aW9uaW5nIH0gPSB1c2VTZWFzb25hbFRoZW1lKCk7XG5cbiAgY29uc3QgW3NlY3Rpb24sIHNldFNlY3Rpb25dID0gdXNlU3RhdGU8U2VjdGlvbj4oXCJyZWNhcmdhXCIpO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW3VzZXJJZCwgc2V0VXNlcklkXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbdXNlck5hbWUsIHNldFVzZXJOYW1lXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbdXNlckVtYWlsLCBzZXRVc2VyRW1haWxdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtzYWxkbywgc2V0U2FsZG9dID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtoYXNBdXRoU2Vzc2lvbiwgc2V0SGFzQXV0aFNlc3Npb25dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbbG9naW5FbWFpbCwgc2V0TG9naW5FbWFpbF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2xvZ2luUGFzc3dvcmQsIHNldExvZ2luUGFzc3dvcmRdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtsb2dpbkxvYWRpbmcsIHNldExvZ2luTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtsb2dpbkVycm9yLCBzZXRMb2dpbkVycm9yXSA9IHVzZVN0YXRlKFwiXCIpO1xuXG4gIC8vIFJlY2FyZ2FcbiAgY29uc3QgW29wZXJhZG9yYXMsIHNldE9wZXJhZG9yYXNdID0gdXNlU3RhdGU8VGdPcGVyYWRvcmFbXT4oW10pO1xuICBjb25zdCBbc2VsZWN0ZWRPcCwgc2V0U2VsZWN0ZWRPcF0gPSB1c2VTdGF0ZTxUZ09wZXJhZG9yYSB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbc2VsZWN0ZWRWYWxvciwgc2V0U2VsZWN0ZWRWYWxvcl0gPSB1c2VTdGF0ZTxWYWxvckl0ZW0gfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3Bob25lLCBzZXRQaG9uZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2NsaXBib2FyZFBob25lLCBzZXRDbGlwYm9hcmRQaG9uZV0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3JlY2FyZ2FTdGVwLCBzZXRSZWNhcmdhU3RlcF0gPSB1c2VTdGF0ZTxcIm9wXCIgfCBcInZhbG9yXCIgfCBcInBob25lXCIgfCBcImNvbmZpcm1cIiB8IFwiY2hlY2tcIj4oXCJwaG9uZVwiKTtcbiAgY29uc3QgW3JlY2FyZ2FMb2FkaW5nLCBzZXRSZWNhcmdhTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtyZWNhcmdhUmVzdWx0LCBzZXRSZWNhcmdhUmVzdWx0XSA9IHVzZVN0YXRlPHsgc3VjY2VzczogYm9vbGVhbjsgbWVzc2FnZTogc3RyaW5nOyBkZXRhaWxzPzogeyB2YWxvcjogbnVtYmVyOyB0ZWxlZm9uZTogc3RyaW5nOyBvcGVyYWRvcmE6IHN0cmluZzsgbm92b1NhbGRvOiBudW1iZXI7IHBlZGlkb0lkOiBzdHJpbmcgfCBudWxsOyBob3JhOiBzdHJpbmcgfSB9IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtwaG9uZUNoZWNrUmVzdWx0LCBzZXRQaG9uZUNoZWNrUmVzdWx0XSA9IHVzZVN0YXRlPHsgc3RhdHVzOiBzdHJpbmc7IG1lc3NhZ2U6IHN0cmluZyB9IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtjaGVja2luZ1Bob25lLCBzZXRDaGVja2luZ1Bob25lXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAvLyBIaXN0w7NyaWNvICYgRXh0cmF0b1xuICBjb25zdCBbcmVjYXJnYXMsIHNldFJlY2FyZ2FzXSA9IHVzZVN0YXRlPFJlY2FyZ2FbXT4oW10pO1xuICBjb25zdCBbdHJhbnNhY3Rpb25zLCBzZXRUcmFuc2FjdGlvbnNdID0gdXNlU3RhdGU8YW55W10+KFtdKTtcbiAgY29uc3QgW3ZpZXdpbmdSZWNlaXB0LCBzZXRWaWV3aW5nUmVjZWlwdF0gPSB1c2VTdGF0ZTxSZWNhcmdhIHwgbnVsbD4obnVsbCk7XG5cbiAgLy8gRGVww7NzaXRvXG4gIGNvbnN0IFtkZXBvc2l0QW1vdW50LCBzZXREZXBvc2l0QW1vdW50XSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbZGVwb3NpdExvYWRpbmcsIHNldERlcG9zaXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3BpeERhdGEsIHNldFBpeERhdGFdID0gdXNlU3RhdGU8UGl4UmVzdWx0IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtjb3BpZWQsIHNldENvcGllZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFthdmF0YXJVcmwsIHNldEF2YXRhclVybF0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3VwbG9hZGluZ0F2YXRhciwgc2V0VXBsb2FkaW5nQXZhdGFyXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3JlZnJlc2hpbmdFeHRyYXRvLCBzZXRSZWZyZXNoaW5nRXh0cmF0b10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtyZWZyZXNoaW5nUmVjYXJnYXMsIHNldFJlZnJlc2hpbmdSZWNhcmdhc10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgLy8gVG9hc3Qgbm90aWZpY2F0aW9uc1xuICBjb25zdCBbdG9hc3RzLCBzZXRUb2FzdHNdID0gdXNlU3RhdGU8eyBpZDogbnVtYmVyOyBtZXNzYWdlOiBzdHJpbmc7IHR5cGU6IFwic3VjY2Vzc1wiIHwgXCJlcnJvclwiIHwgXCJpbmZvXCIgfVtdPihbXSk7XG4gIGNvbnN0IHNob3dUb2FzdCA9IHVzZUNhbGxiYWNrKChtZXNzYWdlOiBzdHJpbmcsIHR5cGU6IFwic3VjY2Vzc1wiIHwgXCJlcnJvclwiIHwgXCJpbmZvXCIgPSBcInN1Y2Nlc3NcIikgPT4ge1xuICAgIGNvbnN0IGlkID0gRGF0ZS5ub3coKTtcbiAgICBzZXRUb2FzdHMocHJldiA9PiBbLi4ucHJldiwgeyBpZCwgbWVzc2FnZSwgdHlwZSB9XSk7XG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRUb2FzdHMocHJldiA9PiBwcmV2LmZpbHRlcih0ID0+IHQuaWQgIT09IGlkKSksIDQwMDApO1xuICB9LCBbXSk7XG5cbiAgY29uc3QgdGdXZWJBcHAgPSB3aW5kb3cuVGVsZWdyYW0/LldlYkFwcDtcblxuICBjb25zdCBnZXRUZWxlZ3JhbVVzZXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7XG4gICAgY29uc3QgbGl2ZVRnID0gd2luZG93LlRlbGVncmFtPy5XZWJBcHA7XG4gICAgY29uc3QgZGlyZWN0VXNlciA9IGxpdmVUZz8uaW5pdERhdGFVbnNhZmU/LnVzZXI7XG4gICAgaWYgKGRpcmVjdFVzZXI/LmlkKSByZXR1cm4gZGlyZWN0VXNlcjtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbiAgICAgIGNvbnN0IHJhdyA9IHVybFBhcmFtcy5nZXQoXCJ0Z1dlYkFwcERhdGFcIik7XG4gICAgICBpZiAoIXJhdykgcmV0dXJuIG51bGw7XG4gICAgICBjb25zdCBpbml0RGF0YVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocmF3KTtcbiAgICAgIGNvbnN0IHVzZXJSYXcgPSBpbml0RGF0YVBhcmFtcy5nZXQoXCJ1c2VyXCIpO1xuICAgICAgaWYgKCF1c2VyUmF3KSByZXR1cm4gbnVsbDtcbiAgICAgIGNvbnN0IHBhcnNlZFVzZXIgPSBKU09OLnBhcnNlKHVzZXJSYXcpO1xuICAgICAgcmV0dXJuIHBhcnNlZFVzZXI/LmlkID8gcGFyc2VkVXNlciA6IG51bGw7XG4gICAgfSBjYXRjaCB7IHJldHVybiBudWxsOyB9XG4gIH0sIFtdKTtcblxuICAvLyBIZWxwZXIgdG8gc2F2ZS9sb2FkIHNlc3Npb24gZnJvbSBsb2NhbFN0b3JhZ2VcbiAgY29uc3Qgc2F2ZVNlc3Npb24gPSB1c2VDYWxsYmFjaygoZGF0YTogeyB1c2VySWQ6IHN0cmluZzsgdXNlck5hbWU6IHN0cmluZzsgdXNlckVtYWlsOiBzdHJpbmc7IHNhbGRvOiBudW1iZXIgfSkgPT4ge1xuICAgIHRyeSB7IGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidGdfbWluaWFwcF9zZXNzaW9uXCIsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTsgfSBjYXRjaCB7fVxuICB9LCBbXSk7XG5cbiAgY29uc3QgY2xlYXJTZXNzaW9uID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIHRyeSB7IGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwidGdfbWluaWFwcF9zZXNzaW9uXCIpOyB9IGNhdGNoIHt9XG4gIH0sIFtdKTtcblxuICBjb25zdCBsb2FkU2F2ZWRTZXNzaW9uID0gdXNlQ2FsbGJhY2soKCk6IHsgdXNlcklkOiBzdHJpbmc7IHVzZXJOYW1lOiBzdHJpbmc7IHVzZXJFbWFpbDogc3RyaW5nOyBzYWxkbzogbnVtYmVyIH0gfCBudWxsID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmF3ID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0Z19taW5pYXBwX3Nlc3Npb25cIik7XG4gICAgICBpZiAoIXJhdykgcmV0dXJuIG51bGw7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShyYXcpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gbnVsbDsgfVxuICB9LCBbXSk7XG5cbiAgY29uc3QgYXBwbHlTZXNzaW9uID0gdXNlQ2FsbGJhY2soKGRhdGE6IHsgdXNlcklkOiBzdHJpbmc7IHVzZXJOYW1lOiBzdHJpbmc7IHVzZXJFbWFpbDogc3RyaW5nOyBzYWxkbzogbnVtYmVyIH0pID0+IHtcbiAgICBzZXRVc2VySWQoZGF0YS51c2VySWQpO1xuICAgIHNldFVzZXJOYW1lKGRhdGEudXNlck5hbWUpO1xuICAgIHNldFVzZXJFbWFpbChkYXRhLnVzZXJFbWFpbCk7XG4gICAgc2V0U2FsZG8oZGF0YS5zYWxkbyk7XG4gIH0sIFtdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZTtcblxuICAgIGFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICBjb25zdCBsaXZlVGcgPSB3aW5kb3cuVGVsZWdyYW0/LldlYkFwcDtcbiAgICAgIGxpdmVUZz8ucmVhZHkoKTtcbiAgICAgIGxpdmVUZz8uZXhwYW5kKCk7XG5cbiAgICAgIC8vIENoZWNrIGF1dGggc2Vzc2lvbiBmaXJzdCAodXNlZCBieSBjaGF0IFJMUylcbiAgICAgIGxldCBleGlzdGluZ1Nlc3Npb25Vc2VySWQ6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBkYXRhOiB7IHNlc3Npb24gfSB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRTZXNzaW9uKCk7XG4gICAgICAgIGV4aXN0aW5nU2Vzc2lvblVzZXJJZCA9IHNlc3Npb24/LnVzZXI/LmlkID8/IG51bGw7XG4gICAgICAgIGlmICghY2FuY2VsbGVkKSBzZXRIYXNBdXRoU2Vzc2lvbighIXNlc3Npb24/LnVzZXIpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJNaW5pIEFwcCBhdXRoIHNlc3Npb24gcHJlY2hlY2sgZXJyb3I6XCIsIGVycik7XG4gICAgICAgIGlmICghY2FuY2VsbGVkKSBzZXRIYXNBdXRoU2Vzc2lvbihmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIDEpIFRyeSBUZWxlZ3JhbSBpbml0RGF0YSBsb29rdXBcbiAgICAgIGNvbnN0IHRnVXNlciA9IGF3YWl0IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMTI7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHUgPSBnZXRUZWxlZ3JhbVVzZXIoKTtcbiAgICAgICAgICBpZiAodT8uaWQpIHJldHVybiB1O1xuICAgICAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHIgPT4gc2V0VGltZW91dChyLCAyNTApKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0pKCk7XG5cbiAgICAgIGlmICh0Z1VzZXI/LmlkICYmICFjYW5jZWxsZWQpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mdW5jdGlvbnMuaW52b2tlKFwidGVsZWdyYW0tbWluaWFwcFwiLCB7XG4gICAgICAgICAgICBib2R5OiB7IGFjdGlvbjogXCJsb29rdXBcIiwgdGVsZWdyYW1faWQ6IHRnVXNlci5pZCB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghZXJyb3IgJiYgZGF0YT8uZm91bmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlc3MgPSB7IHVzZXJJZDogZGF0YS51c2VyX2lkLCB1c2VyTmFtZTogZGF0YS5ub21lIHx8IFwiXCIsIHVzZXJFbWFpbDogXCJcIiwgc2FsZG86IE51bWJlcihkYXRhLnNhbGRvIHx8IDApIH07XG4gICAgICAgICAgICBhcHBseVNlc3Npb24oc2Vzcyk7XG4gICAgICAgICAgICBzYXZlU2Vzc2lvbihzZXNzKTtcbiAgICAgICAgICAgIGlmIChkYXRhLmF2YXRhcl91cmwpIHNldEF2YXRhclVybChkYXRhLmF2YXRhcl91cmwpO1xuICAgICAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IGNvbnNvbGUuZXJyb3IoXCJNaW5pIEFwcCBURyBsb29rdXAgZXJyb3I6XCIsIGVycik7IH1cbiAgICAgIH1cblxuICAgICAgLy8gMikgVHJ5IGV4aXN0aW5nIGF1dGggdXNlciBpZiBhdmFpbGFibGVcbiAgICAgIGlmIChleGlzdGluZ1Nlc3Npb25Vc2VySWQgJiYgIWNhbmNlbGxlZCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZ1bmN0aW9ucy5pbnZva2UoXCJ0ZWxlZ3JhbS1taW5pYXBwXCIsIHtcbiAgICAgICAgICAgIGJvZHk6IHsgYWN0aW9uOiBcImxvb2t1cF9ieV91c2VyX2lkXCIsIHVzZXJfaWQ6IGV4aXN0aW5nU2Vzc2lvblVzZXJJZCB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmICghZXJyb3IgJiYgZGF0YT8uZm91bmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlc3MgPSB7IHVzZXJJZDogZGF0YS51c2VyX2lkLCB1c2VyTmFtZTogZGF0YS5ub21lIHx8IFwiXCIsIHVzZXJFbWFpbDogXCJcIiwgc2FsZG86IE51bWJlcihkYXRhLnNhbGRvIHx8IDApIH07XG4gICAgICAgICAgICBhcHBseVNlc3Npb24oc2Vzcyk7XG4gICAgICAgICAgICBzYXZlU2Vzc2lvbihzZXNzKTtcbiAgICAgICAgICAgIGlmIChkYXRhLmF2YXRhcl91cmwpIHNldEF2YXRhclVybChkYXRhLmF2YXRhcl91cmwpO1xuICAgICAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB7IGRhdGE6IHNEYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mdW5jdGlvbnMuaW52b2tlKFwidGVsZWdyYW0tbWluaWFwcFwiLCB7XG4gICAgICAgICAgICAgIGJvZHk6IHsgYWN0aW9uOiBcInNhbGRvXCIsIHVzZXJfaWQ6IGV4aXN0aW5nU2Vzc2lvblVzZXJJZCB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCBzZXNzID0geyB1c2VySWQ6IGV4aXN0aW5nU2Vzc2lvblVzZXJJZCwgdXNlck5hbWU6IFwiXCIsIHVzZXJFbWFpbDogXCJcIiwgc2FsZG86IE51bWJlcihzRGF0YT8uc2FsZG8gfHwgMCkgfTtcbiAgICAgICAgICAgIGFwcGx5U2Vzc2lvbihzZXNzKTtcbiAgICAgICAgICAgIHNhdmVTZXNzaW9uKHNlc3MpO1xuICAgICAgICAgICAgaWYgKCFjYW5jZWxsZWQpIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7IGNvbnNvbGUuZXJyb3IoXCJNaW5pIEFwcCBhdXRoIHNlc3Npb24gZXJyb3I6XCIsIGVycik7IH1cbiAgICAgIH1cblxuICAgICAgLy8gMykgVHJ5IHNhdmVkIGxvY2FsU3RvcmFnZSBzZXNzaW9uIChvZmZsaW5lL2ZhbGxiYWNrKVxuICAgICAgY29uc3Qgc2F2ZWQgPSBsb2FkU2F2ZWRTZXNzaW9uKCk7XG4gICAgICBpZiAoc2F2ZWQgJiYgIWNhbmNlbGxlZCkge1xuICAgICAgICBhcHBseVNlc3Npb24oc2F2ZWQpO1xuICAgICAgICAvLyBSZWZyZXNoIHNhbGRvIGluIGJhY2tncm91bmRcbiAgICAgICAgc3VwYWJhc2UuZnVuY3Rpb25zLmludm9rZShcInRlbGVncmFtLW1pbmlhcHBcIiwgeyBib2R5OiB7IGFjdGlvbjogXCJzYWxkb1wiLCB1c2VyX2lkOiBzYXZlZC51c2VySWQgfSB9KVxuICAgICAgICAgIC50aGVuKCh7IGRhdGEgfSkgPT4geyBpZiAoZGF0YT8uc2FsZG8gIT09IHVuZGVmaW5lZCkgc2V0U2FsZG8oTnVtYmVyKGRhdGEuc2FsZG8pKTsgfSlcbiAgICAgICAgICAuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgICBpZiAoIWNhbmNlbGxlZCkgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFjYW5jZWxsZWQpIHNldExvYWRpbmcoZmFsc2UpO1xuICAgIH1cblxuICAgIGluaXQoKTtcbiAgICByZXR1cm4gKCkgPT4geyBjYW5jZWxsZWQgPSB0cnVlOyB9O1xuICB9LCBbZ2V0VGVsZWdyYW1Vc2VyLCBhcHBseVNlc3Npb24sIHNhdmVTZXNzaW9uLCBsb2FkU2F2ZWRTZXNzaW9uXSk7XG5cbiAgY29uc3QgcmVmcmVzaFNhbGRvID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGlmICghdXNlcklkKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgc3VwYWJhc2UuZnVuY3Rpb25zLmludm9rZShcInRlbGVncmFtLW1pbmlhcHBcIiwgeyBib2R5OiB7IGFjdGlvbjogXCJzYWxkb1wiLCB1c2VyX2lkOiB1c2VySWQgfSB9KTtcbiAgICAgIGlmIChkYXRhPy5zYWxkbyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IG5ld1NhbGRvID0gTnVtYmVyKGRhdGEuc2FsZG8pO1xuICAgICAgICBzZXRTYWxkbyhuZXdTYWxkbyk7XG4gICAgICAgIC8vIFVwZGF0ZSBzYXZlZCBzZXNzaW9uIHdpdGggbmV3IGJhbGFuY2VcbiAgICAgICAgY29uc3Qgc2F2ZWQgPSBsb2FkU2F2ZWRTZXNzaW9uKCk7XG4gICAgICAgIGlmIChzYXZlZCkgc2F2ZVNlc3Npb24oeyAuLi5zYXZlZCwgc2FsZG86IG5ld1NhbGRvIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycikgeyBjb25zb2xlLmVycm9yKFwicmVmcmVzaFNhbGRvIGVycm9yOlwiLCBlcnIpOyB9XG4gIH0sIFt1c2VySWQsIGxvYWRTYXZlZFNlc3Npb24sIHNhdmVTZXNzaW9uXSk7XG5cbiAgY29uc3QgbG9hZE9wZXJhZG9yYXMgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgc3VwYWJhc2UuZnVuY3Rpb25zLmludm9rZShcInRlbGVncmFtLW1pbmlhcHBcIiwgeyBib2R5OiB7IGFjdGlvbjogXCJvcGVyYWRvcmFzXCIsIHVzZXJfaWQ6IHVzZXJJZCB9IH0pO1xuICAgICAgc2V0T3BlcmFkb3JhcyhkYXRhPy5vcGVyYWRvcmFzIHx8IFtdKTtcbiAgICB9IGNhdGNoIChlcnIpIHsgY29uc29sZS5lcnJvcihcImxvYWRPcGVyYWRvcmFzIGVycm9yOlwiLCBlcnIpOyB9XG4gIH0sIFt1c2VySWRdKTtcblxuICBjb25zdCBsb2FkUmVjYXJnYXMgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgaWYgKCF1c2VySWQpIHJldHVybjtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mdW5jdGlvbnMuaW52b2tlKFwidGVsZWdyYW0tbWluaWFwcFwiLCB7IGJvZHk6IHsgYWN0aW9uOiBcInJlY2FyZ2FzXCIsIHVzZXJfaWQ6IHVzZXJJZCB9IH0pO1xuICAgICAgc2V0UmVjYXJnYXMoZGF0YT8ucmVjYXJnYXMgfHwgW10pO1xuICAgIH0gY2F0Y2ggKGVycikgeyBjb25zb2xlLmVycm9yKFwibG9hZFJlY2FyZ2FzIGVycm9yOlwiLCBlcnIpOyB9XG4gIH0sIFt1c2VySWRdKTtcblxuICBjb25zdCBsb2FkVHJhbnNhY3Rpb25zID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGlmICghdXNlcklkKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgLmZyb20oXCJ0cmFuc2FjdGlvbnNcIilcbiAgICAgICAgLnNlbGVjdChcImlkLCBhbW91bnQsIHN0YXR1cywgdHlwZSwgY3JlYXRlZF9hdCwgcGF5bWVudF9pZCwgbWV0YWRhdGFcIilcbiAgICAgICAgLmVxKFwidXNlcl9pZFwiLCB1c2VySWQpXG4gICAgICAgIC5lcShcInR5cGVcIiwgXCJkZXBvc2l0XCIpXG4gICAgICAgIC5vcmRlcihcImNyZWF0ZWRfYXRcIiwgeyBhc2NlbmRpbmc6IGZhbHNlIH0pXG4gICAgICAgIC5saW1pdCgyMCk7XG4gICAgICBzZXRUcmFuc2FjdGlvbnMoZGF0YSB8fCBbXSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7IGNvbnNvbGUuZXJyb3IoXCJsb2FkVHJhbnNhY3Rpb25zIGVycm9yOlwiLCBlcnIpOyB9XG4gIH0sIFt1c2VySWRdKTtcblxuICAvLyBMb2FkIGF2YXRhciBvbiBtb3VudFxuICBjb25zdCBsb2FkQXZhdGFyID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGlmICghdXNlcklkKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgIC8vIFVzZSBlZGdlIGZ1bmN0aW9uIChzZXJ2aWNlIHJvbGUpIHRvIGJ5cGFzcyBSTFNcbiAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgc3VwYWJhc2UuZnVuY3Rpb25zLmludm9rZShcInRlbGVncmFtLW1pbmlhcHBcIiwge1xuICAgICAgICBib2R5OiB7IGFjdGlvbjogXCJsb29rdXBfYnlfdXNlcl9pZFwiLCB1c2VyX2lkOiB1c2VySWQgfSxcbiAgICAgIH0pO1xuICAgICAgaWYgKGRhdGE/LmF2YXRhcl91cmwpIHNldEF2YXRhclVybChkYXRhLmF2YXRhcl91cmwpO1xuICAgIH0gY2F0Y2gge31cbiAgfSwgW3VzZXJJZF0pO1xuXG4gIGNvbnN0IGhhbmRsZUF2YXRhclVwbG9hZCA9IGFzeW5jIChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MSW5wdXRFbGVtZW50PikgPT4ge1xuICAgIGNvbnN0IGZpbGUgPSBlLnRhcmdldC5maWxlcz8uWzBdO1xuICAgIGlmICghZmlsZSB8fCAhdXNlcklkKSByZXR1cm47XG4gICAgaWYgKGZpbGUuc2l6ZSA+IDIgKiAxMDI0ICogMTAyNCkgeyBhbGVydChcIkFycXVpdm8gbXVpdG8gZ3JhbmRlIChtw6F4IDJNQilcIik7IHJldHVybjsgfVxuICAgIHNldFVwbG9hZGluZ0F2YXRhcih0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXh0ID0gZmlsZS5uYW1lLnNwbGl0KFwiLlwiKS5wb3AoKSB8fCBcImpwZ1wiO1xuICAgICAgY29uc3QgcGF0aCA9IGAke3VzZXJJZH0vYXZhdGFyLiR7ZXh0fWA7XG4gICAgICAvLyBSZW1vdmUgb2xkIGZpbGVzXG4gICAgICBjb25zdCB7IGRhdGE6IGV4aXN0aW5nRmlsZXMgfSA9IGF3YWl0IHN1cGFiYXNlLnN0b3JhZ2UuZnJvbShcImF2YXRhcnNcIikubGlzdCh1c2VySWQpO1xuICAgICAgaWYgKGV4aXN0aW5nRmlsZXM/Lmxlbmd0aCkge1xuICAgICAgICBhd2FpdCBzdXBhYmFzZS5zdG9yYWdlLmZyb20oXCJhdmF0YXJzXCIpLnJlbW92ZShleGlzdGluZ0ZpbGVzLm1hcChmID0+IGAke3VzZXJJZH0vJHtmLm5hbWV9YCkpO1xuICAgICAgfVxuICAgICAgY29uc3QgeyBlcnJvcjogdXBFcnIgfSA9IGF3YWl0IHN1cGFiYXNlLnN0b3JhZ2UuZnJvbShcImF2YXRhcnNcIikudXBsb2FkKHBhdGgsIGZpbGUsIHsgdXBzZXJ0OiB0cnVlIH0pO1xuICAgICAgaWYgKHVwRXJyKSB0aHJvdyB1cEVycjtcbiAgICAgIGNvbnN0IHsgZGF0YTogdXJsRGF0YSB9ID0gc3VwYWJhc2Uuc3RvcmFnZS5mcm9tKFwiYXZhdGFyc1wiKS5nZXRQdWJsaWNVcmwocGF0aCk7XG4gICAgICBjb25zdCBwdWJsaWNVcmwgPSB1cmxEYXRhLnB1YmxpY1VybCArIFwiP3Q9XCIgKyBEYXRlLm5vdygpO1xuICAgICAgYXdhaXQgc3VwYWJhc2UuZnJvbShcInByb2ZpbGVzXCIpLnVwZGF0ZSh7IGF2YXRhcl91cmw6IHB1YmxpY1VybCB9IGFzIGFueSkuZXEoXCJpZFwiLCB1c2VySWQpO1xuICAgICAgc2V0QXZhdGFyVXJsKHB1YmxpY1VybCk7XG4gICAgICB0Z1dlYkFwcD8uSGFwdGljRmVlZGJhY2s/Lm5vdGlmaWNhdGlvbk9jY3VycmVkKFwic3VjY2Vzc1wiKTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgYWxlcnQoZXJyLm1lc3NhZ2UgfHwgXCJFcnJvIGFvIGVudmlhciBmb3RvXCIpO1xuICAgIH1cbiAgICBzZXRVcGxvYWRpbmdBdmF0YXIoZmFsc2UpO1xuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCF1c2VySWQpIHJldHVybjtcbiAgICBpZiAoc2VjdGlvbiA9PT0gXCJyZWNhcmdhXCIpIHsgbG9hZE9wZXJhZG9yYXMoKTsgbG9hZFJlY2FyZ2FzKCk7IH1cbiAgICBpZiAoc2VjdGlvbiA9PT0gXCJoaXN0b3JpY29cIikgbG9hZFJlY2FyZ2FzKCk7XG4gICAgaWYgKHNlY3Rpb24gPT09IFwiZXh0cmF0b1wiKSBsb2FkVHJhbnNhY3Rpb25zKCk7XG4gICAgaWYgKHNlY3Rpb24gPT09IFwicmVjYXJnYVwiIHx8IHNlY3Rpb24gPT09IFwiZGVwb3NpdG9cIikgcmVmcmVzaFNhbGRvKCk7XG4gICAgaWYgKHNlY3Rpb24gPT09IFwiY29udGFcIikgbG9hZEF2YXRhcigpO1xuICB9LCBbc2VjdGlvbiwgdXNlcklkXSk7XG5cbiAgLy8gUmVhbHRpbWUgc3Vic2NyaXB0aW9uc1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghdXNlcklkKSByZXR1cm47XG5cbiAgICBjb25zdCBjaGFubmVsID0gc3VwYWJhc2VcbiAgICAgIC5jaGFubmVsKGBtaW5pYXBwLXJlYWx0aW1lLSR7dXNlcklkfWApXG4gICAgICAub24oXG4gICAgICAgIFwicG9zdGdyZXNfY2hhbmdlc1wiLFxuICAgICAgICB7IGV2ZW50OiBcIipcIiwgc2NoZW1hOiBcInB1YmxpY1wiLCB0YWJsZTogXCJzYWxkb3NcIiwgZmlsdGVyOiBgdXNlcl9pZD1lcS4ke3VzZXJJZH1gIH0sXG4gICAgICAgIChwYXlsb2FkKSA9PiB7XG4gICAgICAgICAgY29uc3Qgcm93ID0gcGF5bG9hZC5uZXcgYXMgYW55O1xuICAgICAgICAgIGlmIChyb3c/LnRpcG8gPT09IFwicmV2ZW5kYVwiICYmIHJvdz8udmFsb3IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgc2V0U2FsZG8oTnVtYmVyKHJvdy52YWxvcikpO1xuICAgICAgICAgICAgdGdXZWJBcHA/LkhhcHRpY0ZlZWRiYWNrPy5pbXBhY3RPY2N1cnJlZChcImxpZ2h0XCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKVxuICAgICAgLm9uKFxuICAgICAgICBcInBvc3RncmVzX2NoYW5nZXNcIixcbiAgICAgICAgeyBldmVudDogXCJVUERBVEVcIiwgc2NoZW1hOiBcInB1YmxpY1wiLCB0YWJsZTogXCJyZWNhcmdhc1wiLCBmaWx0ZXI6IGB1c2VyX2lkPWVxLiR7dXNlcklkfWAgfSxcbiAgICAgICAgKHBheWxvYWQpID0+IHtcbiAgICAgICAgICBjb25zdCB1cGRhdGVkID0gcGF5bG9hZC5uZXcgYXMgYW55O1xuICAgICAgICAgIGlmICh1cGRhdGVkPy5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgJiYgdXBkYXRlZD8udGVsZWZvbmUpIHtcbiAgICAgICAgICAgIGNvbnN0IHRlbCA9IHVwZGF0ZWQudGVsZWZvbmUucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgICAgY29uc3QgZm9ybWF0dGVkID0gdGVsLmxlbmd0aCA+PSAxMCA/IGAoJHt0ZWwuc2xpY2UoMCwgMil9KSAke3RlbC5zbGljZSgyLCA3KX0tJHt0ZWwuc2xpY2UoNyl9YCA6IHRlbDtcbiAgICAgICAgICAgIHNob3dUb2FzdChg4pyFIFJlY2FyZ2EgY29uY2x1w61kYSBwYXJhICR7Zm9ybWF0dGVkfSFgLCBcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICB0Z1dlYkFwcD8uSGFwdGljRmVlZGJhY2s/Lm5vdGlmaWNhdGlvbk9jY3VycmVkKFwic3VjY2Vzc1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbG9hZFJlY2FyZ2FzKCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIC5vbihcbiAgICAgICAgXCJwb3N0Z3Jlc19jaGFuZ2VzXCIsXG4gICAgICAgIHsgZXZlbnQ6IFwiKlwiLCBzY2hlbWE6IFwicHVibGljXCIsIHRhYmxlOiBcInRyYW5zYWN0aW9uc1wiLCBmaWx0ZXI6IGB1c2VyX2lkPWVxLiR7dXNlcklkfWAgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGxvYWRUcmFuc2FjdGlvbnMoKTtcbiAgICAgICAgICAvLyBBbHNvIHJlZnJlc2ggc2FsZG8gb24gZGVwb3NpdCBjb21wbGV0aW9uXG4gICAgICAgICAgcmVmcmVzaFNhbGRvKCk7XG4gICAgICAgIH1cbiAgICAgIClcbiAgICAgIC5zdWJzY3JpYmUoKTtcblxuICAgIHJldHVybiAoKSA9PiB7IHN1cGFiYXNlLnJlbW92ZUNoYW5uZWwoY2hhbm5lbCk7IH07XG4gIH0sIFt1c2VySWQsIGxvYWRSZWNhcmdhcywgbG9hZFRyYW5zYWN0aW9ucywgcmVmcmVzaFNhbGRvLCBzaG93VG9hc3RdKTtcblxuICAvLyBBdXRvLWNoZWNrIHBlbmRpbmcgcmVjYXJnYXMgYWdhaW5zdCBBUEkgZXZlcnkgOHNcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXVzZXJJZCkgcmV0dXJuO1xuICAgIGxldCBhY3RpdmUgPSB0cnVlO1xuXG4gICAgY29uc3QgY2hlY2tQZW5kaW5nID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgcGVuZGluZyA9IHJlY2FyZ2FzLmZpbHRlcihyID0+IHIuc3RhdHVzID09PSBcInBlbmRpbmdcIiAmJiByLmV4dGVybmFsX2lkKTtcbiAgICAgIGlmIChwZW5kaW5nLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgICBmb3IgKGNvbnN0IHIgb2YgcGVuZGluZykge1xuICAgICAgICBpZiAoIWFjdGl2ZSkgYnJlYWs7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mdW5jdGlvbnMuaW52b2tlKFwicmVjYXJnYS1leHByZXNzXCIsIHtcbiAgICAgICAgICAgIGJvZHk6IHsgYWN0aW9uOiBcIm9yZGVyLXN0YXR1c1wiLCBleHRlcm5hbF9pZDogci5leHRlcm5hbF9pZCB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmIChkYXRhPy5zdWNjZXNzICYmIGRhdGEuZGF0YT8ubG9jYWxTdGF0dXMgJiYgZGF0YS5kYXRhLmxvY2FsU3RhdHVzICE9PSBcInBlbmRpbmdcIikge1xuICAgICAgICAgICAgLy8gREIgd2FzIHVwZGF0ZWQgYnkgdGhlIGVkZ2UgZnVuY3Rpb24sIHJlYWx0aW1lIHdpbGwgcGljayBpdCB1cFxuICAgICAgICAgICAgLy8gYnV0IGZvcmNlIHJlbG9hZCBqdXN0IGluIGNhc2VcbiAgICAgICAgICAgIGF3YWl0IGxvYWRSZWNhcmdhcygpO1xuICAgICAgICAgICAgdGdXZWJBcHA/LkhhcHRpY0ZlZWRiYWNrPy5ub3RpZmljYXRpb25PY2N1cnJlZChcInN1Y2Nlc3NcIik7XG4gICAgICAgICAgICBicmVhazsgLy8gcmVsb2FkIGdvdCBhbGwgdXBkYXRlc1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIGNoZWNrUGVuZGluZygpO1xuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoY2hlY2tQZW5kaW5nLCA4MDAwKTtcbiAgICByZXR1cm4gKCkgPT4geyBhY3RpdmUgPSBmYWxzZTsgY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7IH07XG4gIH0sIFt1c2VySWQsIHJlY2FyZ2FzLCBsb2FkUmVjYXJnYXNdKTtcblxuICBjb25zdCBmb3JtYXRDdXJyZW5jeSA9ICh2OiBudW1iZXIpID0+IGBSJCAke3YudG9Mb2NhbGVTdHJpbmcoXCJwdC1CUlwiLCB7IG1pbmltdW1GcmFjdGlvbkRpZ2l0czogMiB9KX1gO1xuICBjb25zdCBmb3JtYXRQaG9uZSA9ICh2OiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBkID0gdi5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTEpO1xuICAgIGlmIChkLmxlbmd0aCA8PSAyKSByZXR1cm4gZDtcbiAgICBpZiAoZC5sZW5ndGggPD0gNykgcmV0dXJuIGAoJHtkLnNsaWNlKDAsIDIpfSkgJHtkLnNsaWNlKDIpfWA7XG4gICAgcmV0dXJuIGAoJHtkLnNsaWNlKDAsIDIpfSkgJHtkLnNsaWNlKDIsIDcpfS0ke2Quc2xpY2UoNyl9YDtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVSZWNhcmdhQ29uZmlybSA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXVzZXJJZCB8fCAhc2VsZWN0ZWRPcCB8fCAhc2VsZWN0ZWRWYWxvciB8fCAhcGhvbmUpIHJldHVybjtcbiAgICBjb25zdCB0ZWwgPSBwaG9uZS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG4gICAgaWYgKHRlbC5sZW5ndGggPCAxMCkgcmV0dXJuO1xuICAgIHNldFJlY2FyZ2FMb2FkaW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGRhdGE6IHJlc3VsdCwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZ1bmN0aW9ucy5pbnZva2UoXCJyZWNhcmdhLWV4cHJlc3NcIiwge1xuICAgICAgICBib2R5OiB7IGFjdGlvbjogXCJyZWNoYXJnZVwiLCBjYXJyaWVySWQ6IHNlbGVjdGVkT3AuY2FycmllcklkLCBwaG9uZU51bWJlcjogdGVsLCB2YWx1ZUlkOiBzZWxlY3RlZFZhbG9yLnZhbHVlSWQgfSxcbiAgICAgIH0pO1xuICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcbiAgICAgIGlmICghcmVzdWx0Py5zdWNjZXNzKSB0aHJvdyBuZXcgRXJyb3IocmVzdWx0Py5lcnJvciB8fCBcIkVycm8gYW8gcHJvY2Vzc2FyIHJlY2FyZ2FcIik7XG4gICAgICBhd2FpdCByZWZyZXNoU2FsZG8oKTtcbiAgICAgIHRnV2ViQXBwPy5IYXB0aWNGZWVkYmFjaz8ubm90aWZpY2F0aW9uT2NjdXJyZWQoXCJzdWNjZXNzXCIpO1xuICAgICAgY29uc3Qgb3JkZXJEYXRhID0gcmVzdWx0LmRhdGEgfHwge307XG4gICAgICBjb25zdCBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgY29uc3QgaG9yYSA9IGZvcm1hdEZ1bGxEYXRlVGltZUJSKG5vdyk7XG4gICAgICBjb25zdCByZWNlaXB0VmFsdWUgPVxuICAgICAgICAoTnVtYmVyKHNlbGVjdGVkVmFsb3IudmFsdWUpID4gMCA/IE51bWJlcihzZWxlY3RlZFZhbG9yLnZhbHVlKSA6IDApIHx8XG4gICAgICAgICgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgbGFiZWwgPSBTdHJpbmcoc2VsZWN0ZWRWYWxvci5sYWJlbCB8fCBcIlwiKS5yZXBsYWNlKC8sL2csIFwiLlwiKTtcbiAgICAgICAgICBjb25zdCBudW1zID0gbGFiZWwubWF0Y2goL1xcZCsoPzpcXC5cXGR7MSwyfSk/L2cpO1xuICAgICAgICAgIGlmICghbnVtcz8ubGVuZ3RoKSByZXR1cm4gTnVtYmVyKHNlbGVjdGVkVmFsb3IuY29zdCkgfHwgMDtcbiAgICAgICAgICBjb25zdCBwYXJzZWQgPSBOdW1iZXIobnVtc1tudW1zLmxlbmd0aCAtIDFdKTtcbiAgICAgICAgICByZXR1cm4gTnVtYmVyLmlzRmluaXRlKHBhcnNlZCkgJiYgcGFyc2VkID4gMCA/IHBhcnNlZCA6IE51bWJlcihzZWxlY3RlZFZhbG9yLmNvc3QpIHx8IDA7XG4gICAgICAgIH0pKCk7XG5cbiAgICAgIHNldFJlY2FyZ2FSZXN1bHQoe1xuICAgICAgICBzdWNjZXNzOiB0cnVlLFxuICAgICAgICBtZXNzYWdlOiBgUmVjYXJnYSByZWFsaXphZGEgY29tIHN1Y2Vzc28hYCxcbiAgICAgICAgZGV0YWlsczoge1xuICAgICAgICAgIHZhbG9yOiByZWNlaXB0VmFsdWUsXG4gICAgICAgICAgdGVsZWZvbmU6IGZvcm1hdFBob25lKHBob25lKSxcbiAgICAgICAgICBvcGVyYWRvcmE6IHNlbGVjdGVkT3Aubm9tZSB8fCBzZWxlY3RlZE9wLmNhcnJpZXJJZCxcbiAgICAgICAgICBub3ZvU2FsZG86IG9yZGVyRGF0YS5sb2NhbEJhbGFuY2UgPz8gc2FsZG8sXG4gICAgICAgICAgcGVkaWRvSWQ6IG9yZGVyRGF0YS5faWQgfHwgb3JkZXJEYXRhLmlkIHx8IG9yZGVyRGF0YS5vcmRlcklkIHx8IG51bGwsXG4gICAgICAgICAgaG9yYSxcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICB0Z1dlYkFwcD8uSGFwdGljRmVlZGJhY2s/Lm5vdGlmaWNhdGlvbk9jY3VycmVkKFwiZXJyb3JcIik7XG4gICAgICBzZXRSZWNhcmdhUmVzdWx0KHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6IGVyci5tZXNzYWdlIHx8IFwiRXJybyBhbyBwcm9jZXNzYXIgcmVjYXJnYVwiIH0pO1xuICAgIH1cbiAgICBzZXRSZWNhcmdhTG9hZGluZyhmYWxzZSk7XG4gIH07XG5cbiAgY29uc3QgcmVzZXRSZWNhcmdhID0gKCkgPT4geyBzZXRTZWxlY3RlZE9wKG51bGwpOyBzZXRTZWxlY3RlZFZhbG9yKG51bGwpOyBzZXRQaG9uZShcIlwiKTsgc2V0UmVjYXJnYVN0ZXAoXCJwaG9uZVwiKTsgc2V0UmVjYXJnYVJlc3VsdChudWxsKTsgc2V0UGhvbmVDaGVja1Jlc3VsdChudWxsKTsgfTtcblxuICBjb25zdCBmb3JtYXRDb29sZG93bk1zZyA9IChtc2c/OiBzdHJpbmcpID0+IHtcbiAgICBpZiAoIW1zZykgcmV0dXJuIFwiXCI7XG4gICAgY29uc3QgaXNvTWF0Y2ggPSBtc2cubWF0Y2goLyhcXGR7NH0tXFxkezJ9LVxcZHsyfVRbXFxkOi5dK1o/KS8pO1xuICAgIGlmIChpc29NYXRjaCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKGlzb01hdGNoWzFdKTtcbiAgICAgIGNvbnN0IGZvcm1hdHRlZCA9IGZvcm1hdERhdGVUaW1lQlIoZCk7XG4gICAgICBpZiAobXNnLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoXCJjb29sZG93blwiKSkge1xuICAgICAgICByZXR1cm4gYOKPsyBDb29sZG93biBhdGl2byEgTm92YSByZWNhcmdhIHBlcm1pdGlkYSBhcMOzcyAke2Zvcm1hdHRlZH0uYDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtc2cucmVwbGFjZShpc29NYXRjaFsxXSwgZm9ybWF0dGVkKTtcbiAgICB9XG4gICAgcmV0dXJuIG1zZztcbiAgfTtcblxuICBjb25zdCBoYW5kbGVDaGVja1Bob25lID0gYXN5bmMgKGNhcnJpZXJJZD86IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IG5vcm1hbGl6ZWRQaG9uZSA9IHBob25lLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICBpZiAobm9ybWFsaXplZFBob25lLmxlbmd0aCA8IDEwKSByZXR1cm47XG4gICAgY29uc3QgY0lkID0gY2FycmllcklkIHx8IHNlbGVjdGVkT3A/LmNhcnJpZXJJZDtcbiAgICBpZiAoIWNJZCkgcmV0dXJuO1xuICAgIHNldENoZWNraW5nUGhvbmUodHJ1ZSk7XG4gICAgc2V0UGhvbmVDaGVja1Jlc3VsdChudWxsKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhOiByZXNwIH0gPSBhd2FpdCBzdXBhYmFzZS5mdW5jdGlvbnMuaW52b2tlKFwicmVjYXJnYS1leHByZXNzXCIsIHtcbiAgICAgICAgYm9keTogeyBhY3Rpb246IFwiY2hlY2stcGhvbmVcIiwgcGhvbmVOdW1iZXI6IG5vcm1hbGl6ZWRQaG9uZSwgY2FycmllcklkOiBjSWQgfSxcbiAgICAgIH0pO1xuICAgICAgaWYgKHJlc3A/LnN1Y2Nlc3MgJiYgcmVzcC5kYXRhKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHtcbiAgICAgICAgICBzdGF0dXM6IHJlc3AuZGF0YS5zdGF0dXMsXG4gICAgICAgICAgbWVzc2FnZTogcmVzcC5kYXRhLnN0YXR1cyA9PT0gXCJDT09MRE9XTlwiXG4gICAgICAgICAgICA/IGZvcm1hdENvb2xkb3duTXNnKHJlc3AuZGF0YS5tZXNzYWdlKVxuICAgICAgICAgICAgOiAocmVzcC5kYXRhLm1lc3NhZ2UgfHwgXCJOw7ptZXJvIGRpc3BvbsOtdmVsIHBhcmEgcmVjYXJnYS5cIiksXG4gICAgICAgIH07XG4gICAgICAgIHNldFBob25lQ2hlY2tSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgdGdXZWJBcHA/LkhhcHRpY0ZlZWRiYWNrPy5pbXBhY3RPY2N1cnJlZChyZXN1bHQuc3RhdHVzID09PSBcIkNMRUFSXCIgPyBcImxpZ2h0XCIgOiBcImhlYXZ5XCIpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBzZXRQaG9uZUNoZWNrUmVzdWx0KHsgc3RhdHVzOiBcIkVSUk9SXCIsIG1lc3NhZ2U6IGVyci5tZXNzYWdlIHx8IFwiRXJybyBhbyB2ZXJpZmljYXJcIiB9KTtcbiAgICB9XG4gICAgc2V0Q2hlY2tpbmdQaG9uZShmYWxzZSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlRGVwb3NpdCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBhbW91bnQgPSBwYXJzZUZsb2F0KGRlcG9zaXRBbW91bnQucmVwbGFjZShcIixcIiwgXCIuXCIpKTtcbiAgICBpZiAoaXNOYU4oYW1vdW50KSB8fCBhbW91bnQgPD0gMCB8fCAhdXNlcklkKSByZXR1cm47XG4gICAgc2V0RGVwb3NpdExvYWRpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNyZWF0ZVBpeERlcG9zaXQoYW1vdW50LCBcIlwiLCBcIlwiLCBmYWxzZSwgdXNlcklkKTtcbiAgICAgIHNldFBpeERhdGEocmVzdWx0KTtcbiAgICAgIHRnV2ViQXBwPy5IYXB0aWNGZWVkYmFjaz8uaW1wYWN0T2NjdXJyZWQoXCJtZWRpdW1cIik7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHsgYWxlcnQoZXJyLm1lc3NhZ2UgfHwgXCJFcnJvIGFvIGdlcmFyIFBJWFwiKTsgfVxuICAgIHNldERlcG9zaXRMb2FkaW5nKGZhbHNlKTtcbiAgfTtcblxuICBjb25zdCBjb3B5UGl4ID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghcGl4RGF0YT8ucXJfY29kZSkgcmV0dXJuO1xuICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHBpeERhdGEucXJfY29kZSk7XG4gICAgc2V0Q29waWVkKHRydWUpO1xuICAgIHRnV2ViQXBwPy5IYXB0aWNGZWVkYmFjaz8uaW1wYWN0T2NjdXJyZWQoXCJsaWdodFwiKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHNldENvcGllZChmYWxzZSksIDIwMDApO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUxvZ2luID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghbG9naW5FbWFpbCB8fCAhbG9naW5QYXNzd29yZCkgcmV0dXJuO1xuICAgIHNldExvZ2luTG9hZGluZyh0cnVlKTtcbiAgICBzZXRMb2dpbkVycm9yKFwiXCIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGRhdGE6IGF1dGhEYXRhLCBlcnJvcjogYXV0aEVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25JbldpdGhQYXNzd29yZCh7IGVtYWlsOiBsb2dpbkVtYWlsLnRyaW0oKSwgcGFzc3dvcmQ6IGxvZ2luUGFzc3dvcmQgfSk7XG4gICAgICBpZiAoYXV0aEVycm9yKSB0aHJvdyBhdXRoRXJyb3I7XG4gICAgICBpZiAoIWF1dGhEYXRhLnVzZXIpIHRocm93IG5ldyBFcnJvcihcIkZhbGhhIG5vIGxvZ2luXCIpO1xuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnVuY3Rpb25zLmludm9rZShcInRlbGVncmFtLW1pbmlhcHBcIiwgeyBib2R5OiB7IGFjdGlvbjogXCJsb29rdXBfYnlfdXNlcl9pZFwiLCB1c2VyX2lkOiBhdXRoRGF0YS51c2VyLmlkIH0gfSk7XG4gICAgICBpZiAoIWVycm9yICYmIGRhdGE/LmZvdW5kKSB7XG4gICAgICAgIGNvbnN0IHNlc3MgPSB7IHVzZXJJZDogZGF0YS51c2VyX2lkLCB1c2VyTmFtZTogZGF0YS5ub21lIHx8IFwiXCIsIHVzZXJFbWFpbDogYXV0aERhdGEudXNlci5lbWFpbCB8fCBcIlwiLCBzYWxkbzogTnVtYmVyKGRhdGEuc2FsZG8gfHwgMCkgfTtcbiAgICAgICAgYXBwbHlTZXNzaW9uKHNlc3MpO1xuICAgICAgICBzYXZlU2Vzc2lvbihzZXNzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHsgZGF0YTogc0RhdGEgfSA9IGF3YWl0IHN1cGFiYXNlLmZ1bmN0aW9ucy5pbnZva2UoXCJ0ZWxlZ3JhbS1taW5pYXBwXCIsIHsgYm9keTogeyBhY3Rpb246IFwic2FsZG9cIiwgdXNlcl9pZDogYXV0aERhdGEudXNlci5pZCB9IH0pO1xuICAgICAgICBjb25zdCBzZXNzID0geyB1c2VySWQ6IGF1dGhEYXRhLnVzZXIuaWQsIHVzZXJOYW1lOiBhdXRoRGF0YS51c2VyLmVtYWlsIHx8IFwiXCIsIHVzZXJFbWFpbDogYXV0aERhdGEudXNlci5lbWFpbCB8fCBcIlwiLCBzYWxkbzogTnVtYmVyKHNEYXRhPy5zYWxkbyB8fCAwKSB9O1xuICAgICAgICBhcHBseVNlc3Npb24oc2Vzcyk7XG4gICAgICAgIHNhdmVTZXNzaW9uKHNlc3MpO1xuICAgICAgfVxuICAgICAgc2V0SGFzQXV0aFNlc3Npb24odHJ1ZSk7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHsgc2V0TG9naW5FcnJvcihlcnIubWVzc2FnZSB8fCBcIkVycm8gYW8gZmF6ZXIgbG9naW5cIik7IH1cbiAgICBzZXRMb2dpbkxvYWRpbmcoZmFsc2UpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUxvZ291dCA9IGFzeW5jICgpID0+IHtcbiAgICBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25PdXQoKTtcbiAgICBjbGVhclNlc3Npb24oKTtcbiAgICBzZXRVc2VySWQobnVsbCk7IHNldFVzZXJOYW1lKFwiXCIpOyBzZXRVc2VyRW1haWwoXCJcIik7IHNldFNhbGRvKDApO1xuICAgIHNldEhhc0F1dGhTZXNzaW9uKGZhbHNlKTtcbiAgfTtcblxuICAvLyBEZXRlY3QgcGhvbmUgbnVtYmVyIGluIGNsaXBib2FyZCB3aGVuIHBob25lIHN0ZXAgaXMgYWN0aXZlXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHNlY3Rpb24gIT09IFwicmVjYXJnYVwiIHx8IHJlY2FyZ2FTdGVwICE9PSBcInBob25lXCIgfHwgcGhvbmUubGVuZ3RoID4gMCkge1xuICAgICAgc2V0Q2xpcGJvYXJkUGhvbmUobnVsbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGRldGVjdENsaXBib2FyZCA9IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghbmF2aWdhdG9yLmNsaXBib2FyZD8ucmVhZFRleHQpIHJldHVybjtcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQucmVhZFRleHQoKTtcbiAgICAgICAgaWYgKCF0ZXh0KSByZXR1cm47XG4gICAgICAgIGxldCBkaWdpdHMgPSB0ZXh0LnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgLy8gUmVtb3ZlIGNvdW50cnkgY29kZSA1NSBpZiBwcmVzZW50XG4gICAgICAgIGlmIChkaWdpdHMubGVuZ3RoID49IDEyICYmIGRpZ2l0cy5zdGFydHNXaXRoKFwiNTVcIikpIHtcbiAgICAgICAgICBkaWdpdHMgPSBkaWdpdHMuc2xpY2UoMik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQ2hlY2sgaWYgaXQgbG9va3MgbGlrZSBhIEJyYXppbGlhbiBwaG9uZSBudW1iZXIgKDEwLTExIGRpZ2l0cylcbiAgICAgICAgaWYgKGRpZ2l0cy5sZW5ndGggPj0gMTAgJiYgZGlnaXRzLmxlbmd0aCA8PSAxMSkge1xuICAgICAgICAgIHNldENsaXBib2FyZFBob25lKGRpZ2l0cyk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBDbGlwYm9hcmQgcGVybWlzc2lvbiBkZW5pZWQg4oCUIHNpbGVudGx5IGlnbm9yZVxuICAgICAgfVxuICAgIH07XG4gICAgZGV0ZWN0Q2xpcGJvYXJkKCk7XG4gIH0sIFtzZWN0aW9uLCByZWNhcmdhU3RlcCwgcGhvbmVdKTtcblxuXG4gIGNvbnN0IHNlY3Rpb25UaXRsZTogUmVjb3JkPFNlY3Rpb24sIHN0cmluZz4gPSB7XG4gICAgcmVjYXJnYTogXCJOb3ZhIFJlY2FyZ2FcIiwgZGVwb3NpdG86IFwiQWRpY2lvbmFyIFNhbGRvXCIsIGhpc3RvcmljbzogXCJIaXN0w7NyaWNvIGRlIFBlZGlkb3NcIixcbiAgICBleHRyYXRvOiBcIkV4dHJhdG8gZGUgRGVww7NzaXRvc1wiLCBjb250YTogXCJNaW5oYSBDb250YVwiLCBzdGF0dXM6IFwiU3RhdHVzIGRvIFNpc3RlbWFcIiwgY2hhdDogXCJCYXRlLXBhcG9cIixcbiAgfTtcblxuICBjb25zdCBpbml0aWFscyA9IHVzZXJOYW1lID8gdXNlck5hbWUuc2xpY2UoMCwgMikudG9VcHBlckNhc2UoKSA6IFwiVVNcIjtcblxuICAvLyBJbmxpbmUgc3R5bGUgaGVscGVycyB1c2luZyBUZWxlZ3JhbSBDU1MgdmFyc1xuICBjb25zdCBzdCA9IHtcbiAgICBiZzogeyBiYWNrZ3JvdW5kQ29sb3I6IFwidmFyKC0tdGctYmcpXCIgfSBhcyBSZWFjdC5DU1NQcm9wZXJ0aWVzLFxuICAgIHNlY29uZGFyeUJnOiB7IGJhY2tncm91bmRDb2xvcjogXCJ2YXIoLS10Zy1zZWNvbmRhcnktYmcpXCIgfSBhcyBSZWFjdC5DU1NQcm9wZXJ0aWVzLFxuICAgIGhlYWRlckJnOiB7IGJhY2tncm91bmRDb2xvcjogXCJ2YXIoLS10Zy1oZWFkZXItYmcpXCIgfSBhcyBSZWFjdC5DU1NQcm9wZXJ0aWVzLFxuICAgIGJvdHRvbUJhcjogeyBiYWNrZ3JvdW5kQ29sb3I6IFwidmFyKC0tdGctYm90dG9tLWJhcilcIiB9IGFzIFJlYWN0LkNTU1Byb3BlcnRpZXMsXG4gICAgdGV4dDogeyBjb2xvcjogXCJ2YXIoLS10Zy10ZXh0KVwiIH0gYXMgUmVhY3QuQ1NTUHJvcGVydGllcyxcbiAgICBoaW50OiB7IGNvbG9yOiBcInZhcigtLXRnLWhpbnQpXCIgfSBhcyBSZWFjdC5DU1NQcm9wZXJ0aWVzLFxuICAgIGxpbms6IHsgY29sb3I6IFwidmFyKC0tdGctbGluaylcIiB9IGFzIFJlYWN0LkNTU1Byb3BlcnRpZXMsXG4gICAgYWNjZW50OiB7IGNvbG9yOiBcInZhcigtLXRnLWFjY2VudClcIiB9IGFzIFJlYWN0LkNTU1Byb3BlcnRpZXMsXG4gICAgYnRuOiB7IGJhY2tncm91bmRDb2xvcjogXCJ2YXIoLS10Zy1idG4pXCIsIGNvbG9yOiBcInZhcigtLXRnLWJ0bi10ZXh0KVwiIH0gYXMgUmVhY3QuQ1NTUHJvcGVydGllcyxcbiAgICBidG5UZXh0OiB7IGNvbG9yOiBcInZhcigtLXRnLWJ0bi10ZXh0KVwiIH0gYXMgUmVhY3QuQ1NTUHJvcGVydGllcyxcbiAgICBkZXN0cnVjdGl2ZTogeyBjb2xvcjogXCJ2YXIoLS10Zy1kZXN0cnVjdGl2ZSlcIiB9IGFzIFJlYWN0LkNTU1Byb3BlcnRpZXMsXG4gICAgZ3JlZW46IHsgY29sb3I6IFwiIzRhZGU4MFwiIH0gYXMgUmVhY3QuQ1NTUHJvcGVydGllcyxcbiAgICBib3JkZXJTdWI6IFwiMXB4IHNvbGlkIGNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS10Zy1oaW50KSAxNSUsIHRyYW5zcGFyZW50KVwiLFxuICAgIGJvcmRlck1haW46IFwiMXB4IHNvbGlkIGNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS10Zy1oaW50KSAyMCUsIHRyYW5zcGFyZW50KVwiLFxuICB9O1xuXG4gIC8vIOKUgOKUgOKUgCBTcGxhc2ggLyBMb2FkaW5nIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICBpZiAobG9hZGluZykge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciByZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW5cIiBzdHlsZT17c3QuYmd9PlxuICAgICAgICB7LyogQW1iaWVudCBnbG93ICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgb3ZlcmZsb3ctaGlkZGVuIHBvaW50ZXItZXZlbnRzLW5vbmVcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC0xLzIgbGVmdC0xLzIgLXRyYW5zbGF0ZS14LTEvMiAtdHJhbnNsYXRlLXktMS8yIHctWzMyMHB4XSBoLVszMjBweF0gcm91bmRlZC1mdWxsIGJsdXItWzEwMHB4XVwiIHN0eWxlPXt7IGJhY2tncm91bmQ6IFwidmFyKC0tdGctYnRuKVwiLCBvcGFjaXR5OiAwLjEyIH19IC8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsvKiBMb2dvICovfVxuICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOCB9fVxuICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgc2NhbGU6IDEgfX1cbiAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjUsIGVhc2U6IFswLjQsIDAsIDAuMiwgMV0gfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJyZWxhdGl2ZSB6LTEwXCJcbiAgICAgICAgPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0yNCBoLTI0IHJvdW5kZWQtMnhsIG92ZXJmbG93LWhpZGRlbiBzaGFkb3ctMnhsXCIgc3R5bGU9e3sgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMSlcIiwgYm94U2hhZG93OiBgMCAwIDQwcHggcmdiYSg4MiwxMzYsMTkzLDAuMylgIH19PlxuICAgICAgICAgICAgPGltZyBzcmM9e3JlY2FyZ2FzTG9nb30gYWx0PVwiUmVjYXJnYXMgQnJhc2lsXCIgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBvYmplY3QtY292ZXJcIiAvPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L21vdGlvbi5kaXY+XG5cbiAgICAgICAgey8qIEFuaW1hdGVkIGRvdHMgKi99XG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4zLCBkdXJhdGlvbjogMC40IH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBnYXAtMiBtdC02IHotMTBcIlxuICAgICAgICA+XG4gICAgICAgICAge1swLCAxLCAyXS5tYXAoKGkpID0+IChcbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy0yLjUgaC0yLjUgcm91bmRlZC1mdWxsXCJcbiAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZDogXCJ2YXIoLS10Zy1idG4pXCIgfX1cbiAgICAgICAgICAgICAgYW5pbWF0ZT17eyBzY2FsZTogWzEsIDEuNCwgMV0sIG9wYWNpdHk6IFswLjQsIDEsIDAuNF0gfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMSwgcmVwZWF0OiBJbmZpbml0eSwgZGVsYXk6IGkgKiAwLjIsIGVhc2U6IFwiZWFzZUluT3V0XCIgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvbW90aW9uLmRpdj5cblxuICAgICAgICB7LyogVGV4dCAqL31cbiAgICAgICAgPG1vdGlvbi5wXG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiA4IH19XG4gICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC41LCBkdXJhdGlvbjogMC40IH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwibXQtNCB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRyYWNraW5nLXdpZGUgei0xMFwiXG4gICAgICAgICAgc3R5bGU9e3sgY29sb3I6IFwidmFyKC0tdGctaGludClcIiB9fVxuICAgICAgICA+XG4gICAgICAgICAgQ2FycmVnYW5kby4uLlxuICAgICAgICA8L21vdGlvbi5wPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIC8vIOKUgOKUgOKUgCBMb2dpbiDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgaWYgKCF1c2VySWQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC02IHJlbGF0aXZlXCIgc3R5bGU9e3sgLi4uc3QudGV4dCB9fT5cbiAgICAgICAgey8qIEJhY2tncm91bmQgaW1hZ2UgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQtMCB6LTBcIj5cbiAgICAgICAgICA8aW1nIHNyYz17cmVjYXJnYXNMb2dvfSBhbHQ9XCJcIiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIG9iamVjdC1jb3ZlclwiIC8+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wXCIgc3R5bGU9e3sgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQodG8gYm90dG9tLCByZ2JhKDAsMCwwLDAuNCkgMCUsIHJnYmEoMCwwLDAsMC44NSkgNjAlLCByZ2JhKDAsMCwwLDAuOTUpIDEwMCUpXCIgfX0gLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIG1heC13LXNtIHJlbGF0aXZlIHotMTBcIj5cbiAgICAgICAgICB7LyogTG9nbyAmIHRpdGxlICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgbWItOFwiPlxuICAgICAgICAgICAgPGltZyBzcmM9e3JlY2FyZ2FzTG9nb30gYWx0PVwiUmVjYXJnYXMgQnJhc2lsXCIgY2xhc3NOYW1lPVwidy0yOCBoLTI4IHJvdW5kZWQtM3hsIG14LWF1dG8gbWItNSBzaGFkb3ctMnhsIG9iamVjdC1jb3ZlciByaW5nLTIgcmluZy13aGl0ZS8yMFwiIC8+XG4gICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtd2hpdGUgZHJvcC1zaGFkb3ctbGdcIj5SZWNhcmdhcyBCcmFzaWw8L2gxPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBtdC0xLjUgdGV4dC13aGl0ZS81MFwiPkZhw6dhIGxvZ2luIHBhcmEgY29udGludWFyPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIHsvKiBGb3JtIGNhcmQgKi99XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBwLTUgc3BhY2UteS00IGJhY2tkcm9wLWJsdXIteGxcIlxuICAgICAgICAgICAgc3R5bGU9e3sgXG4gICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDIzLCAzMywgNDMsIDAuNzUpXCIsIFxuICAgICAgICAgICAgICBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xKVwiLFxuICAgICAgICAgICAgICBib3hTaGFkb3c6IFwiMCA4cHggMzJweCByZ2JhKDAsMCwwLDAuNCksIGluc2V0IDAgMXB4IDAgcmdiYSgyNTUsMjU1LDI1NSwwLjA1KVwiXG4gICAgICAgICAgICB9fT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0zXCI+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIGZvbnQtbWVkaXVtIHRleHQtd2hpdGUvNDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEuNSBibG9ja1wiPkUtbWFpbDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJlbWFpbFwiIHBsYWNlaG9sZGVyPVwic2V1QGVtYWlsLmNvbVwiIHZhbHVlPXtsb2dpbkVtYWlsfSBvbkNoYW5nZT17KGUpID0+IHNldExvZ2luRW1haWwoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHJvdW5kZWQteGwgcHgtNCBweS0zLjUgdGV4dC1zbSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS00MDAvNTAgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsMC4wOClcIiwgY29sb3I6IFwiI2Y1ZjVmNVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xMilcIiB9fSAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gZm9udC1tZWRpdW0gdGV4dC13aGl0ZS80MCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMS41IGJsb2NrXCI+U2VuaGE8L2xhYmVsPlxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIuKAouKAouKAouKAouKAouKAouKAouKAolwiIHZhbHVlPXtsb2dpblBhc3N3b3JkfSBvbkNoYW5nZT17KGUpID0+IHNldExvZ2luUGFzc3dvcmQoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXsoZSkgPT4gZS5rZXkgPT09IFwiRW50ZXJcIiAmJiBoYW5kbGVMb2dpbigpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHJvdW5kZWQteGwgcHgtNCBweS0zLjUgdGV4dC1zbSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctYmx1ZS00MDAvNTAgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsMC4wOClcIiwgY29sb3I6IFwiI2Y1ZjVmNVwiLCBib3JkZXI6IFwiMXB4IHNvbGlkIHJnYmEoMjU1LDI1NSwyNTUsMC4xMilcIiB9fSAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAge2xvZ2luRXJyb3IgJiYgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LWNlbnRlclwiIHN0eWxlPXtzdC5kZXN0cnVjdGl2ZX0+e2xvZ2luRXJyb3J9PC9wPn1cbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlTG9naW59IGRpc2FibGVkPXtsb2dpbkxvYWRpbmcgfHwgIWxvZ2luRW1haWwgfHwgIWxvZ2luUGFzc3dvcmR9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCByb3VuZGVkLXhsIHB5LTMuNSBmb250LWJvbGQgdGV4dC1zbSB0cmFuc2l0aW9uLWFsbCBkaXNhYmxlZDpvcGFjaXR5LTQwIGFjdGl2ZTpzY2FsZS1bMC45OF1cIlxuICAgICAgICAgICAgICBzdHlsZT17eyBcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsICM1Mjg4YzEgMCUsICMzYTZmYTggMTAwJSlcIiwgXG4gICAgICAgICAgICAgICAgY29sb3I6IFwiI2ZmZlwiLFxuICAgICAgICAgICAgICAgIGJveFNoYWRvdzogXCIwIDRweCAxNXB4IHJnYmEoODIsIDEzNiwgMTkzLCAwLjQpLCBpbnNldCAwIDFweCAwIHJnYmEoMjU1LDI1NSwyNTUsMC4xNSlcIlxuICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAge2xvZ2luTG9hZGluZyA/IFwiRW50cmFuZG8uLi5cIiA6IFwiRW50cmFyXCJ9XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgLy8g4pSA4pSA4pSAIEFwcCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT17YG1pbi1oLXNjcmVlbiBmbGV4IGZsZXgtY29sIHJlbGF0aXZlICR7aXNTZWFzb25hbEFjdGl2ZSAmJiAhdHJhbnNpdGlvbmluZyA/IFwicHQtOFwiIDogXCJcIn1gfSBzdHlsZT17eyAuLi5zdC5iZywgLi4uc3QudGV4dCB9fT5cbiAgICAgIHsvKiBUb2FzdCBOb3RpZmljYXRpb25zICovfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCB0b3AtMTYgbGVmdC0wIHJpZ2h0LTAgei1bMjAwXSBmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBnYXAtMiBwb2ludGVyLWV2ZW50cy1ub25lIHB4LTRcIj5cbiAgICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICB7dG9hc3RzLm1hcCgodG9hc3QpID0+IChcbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGtleT17dG9hc3QuaWR9XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogLTMwLCBzY2FsZTogMC45IH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCwgc2NhbGU6IDEgfX1cbiAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCB5OiAtMjAsIHNjYWxlOiAwLjkgfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyB0eXBlOiBcInNwcmluZ1wiLCBzdGlmZm5lc3M6IDQwMCwgZGFtcGluZzogMjUgfX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicG9pbnRlci1ldmVudHMtYXV0byByb3VuZGVkLXhsIHB4LTQgcHktMyBzaGFkb3ctbGcgYmFja2Ryb3AtYmx1ci14bCBtYXgtdy1bOTB2d10gdGV4dC1jZW50ZXJcIlxuICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogdG9hc3QudHlwZSA9PT0gXCJzdWNjZXNzXCIgPyBcInJnYmEoNzQsMjIyLDEyOCwwLjE1KVwiIDogdG9hc3QudHlwZSA9PT0gXCJlcnJvclwiID8gXCJyZ2JhKDIzOSw2OCw2OCwwLjE1KVwiIDogXCJyZ2JhKDk2LDE2NSwyNTAsMC4xNSlcIixcbiAgICAgICAgICAgICAgICBib3JkZXI6IGAxcHggc29saWQgJHt0b2FzdC50eXBlID09PSBcInN1Y2Nlc3NcIiA/IFwicmdiYSg3NCwyMjIsMTI4LDAuNClcIiA6IHRvYXN0LnR5cGUgPT09IFwiZXJyb3JcIiA/IFwicmdiYSgyMzksNjgsNjgsMC40KVwiIDogXCJyZ2JhKDk2LDE2NSwyNTAsMC40KVwifWAsXG4gICAgICAgICAgICAgICAgY29sb3I6IHRvYXN0LnR5cGUgPT09IFwic3VjY2Vzc1wiID8gXCIjNGFkZTgwXCIgOiB0b2FzdC50eXBlID09PSBcImVycm9yXCIgPyBcIiNlZjQ0NDRcIiA6IFwiIzYwYTVmYVwiLFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUb2FzdHMocHJldiA9PiBwcmV2LmZpbHRlcih0ID0+IHQuaWQgIT09IHRvYXN0LmlkKSl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1zZW1pYm9sZFwiPnt0b2FzdC5tZXNzYWdlfTwvcD5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG4gICAgICA8L2Rpdj5cblxuICAgICAgey8qIEhlYWRlciAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RpY2t5IHRvcC0wIHotMzAgYmFja2Ryb3AtYmx1ci1sZyBweC00IHB5LTMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCJcbiAgICAgICAgc3R5bGU9e3sgLi4uc3QuaGVhZGVyQmcsIGJvcmRlckJvdHRvbTogc3QuYm9yZGVyTWFpbiB9fT5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy04IGgtOCByb3VuZGVkLWxnIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIgc3R5bGU9e3N0LmJ0bn0+XG4gICAgICAgICAgICA8U21hcnRwaG9uZSBjbGFzc05hbWU9XCJ3LTQgaC00XCIgc3R5bGU9e3N0LmJ0blRleHR9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LVsxNXB4XVwiIHN0eWxlPXtzdC50ZXh0fT57c2VjdGlvblRpdGxlW3NlY3Rpb25dfTwvaDE+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLWxnIHB4LTMgcHktMS41XCIgc3R5bGU9e3sgLi4uc3Quc2Vjb25kYXJ5QmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViIH19PlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gbGVhZGluZy1ub25lXCIgc3R5bGU9e3N0LmhpbnR9PlNhbGRvPC9wPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJvbGQgbGVhZGluZy10aWdodFwiIHN0eWxlPXtzdC5ncmVlbn0+e2Zvcm1hdEN1cnJlbmN5KHNhbGRvKX08L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge2F2YXRhclVybCA/IChcbiAgICAgICAgICAgIDxpbWcgc3JjPXthdmF0YXJVcmx9IGFsdD1cIlwiIGNsYXNzTmFtZT1cInctOCBoLTggcm91bmRlZC1mdWxsIG9iamVjdC1jb3ZlclwiIC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy04IGgtOCByb3VuZGVkLWZ1bGwgYmctb3JhbmdlLTUwMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LVsxMHB4XSBmb250LWJvbGQgdGV4dC13aGl0ZVwiPntpbml0aWFsc308L2Rpdj5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7LyogQ29udGVudCAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xIG92ZXJmbG93LXktYXV0byBwYi0yMCBzY3JvbGxiYXItaGlkZVwiIHN0eWxlPXt7IFdlYmtpdE92ZXJmbG93U2Nyb2xsaW5nOiAndG91Y2gnLCB0b3VjaEFjdGlvbjogJ3Bhbi15IG1hbmlwdWxhdGlvbicgfX0+XG4gICAgICAgIDxBbmltYXRlUHJlc2VuY2UgbW9kZT1cIndhaXRcIj5cbiAgICAgICAgICB7Lyog4pSA4pSAIE5vdmEgUmVjYXJnYSDilIDilIAgKi99XG4gICAgICAgICAge3NlY3Rpb24gPT09IFwicmVjYXJnYVwiICYmIChcbiAgICAgICAgICAgIDxtb3Rpb24uZGl2IGtleT1cInJlY2FyZ2FcIiBpbml0aWFsPXt7IG9wYWNpdHk6IDAgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19IGV4aXQ9e3sgb3BhY2l0eTogMCB9fSBjbGFzc05hbWU9XCJwLTQgc3BhY2UteS00XCI+XG4gICAgICAgICAgICAgIHtyZWNhcmdhUmVzdWx0ID8gKFxuICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjkgfX1cbiAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgc2NhbGU6IDEgfX1cbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiAzMDAsIGRhbXBpbmc6IDI1IH19XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJzcGFjZS15LTRcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHsvKiBTdGF0dXMgSGVhZGVyICovfVxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBwLTYgdGV4dC1jZW50ZXJcIiBzdHlsZT17eyAuLi5zdC5zZWNvbmRhcnlCZywgYm9yZGVyOiBgMnB4IHNvbGlkICR7cmVjYXJnYVJlc3VsdC5zdWNjZXNzID8gXCIjNGFkZTgwXCIgOiBcInZhcigtLXRnLWRlc3RydWN0aXZlKVwifWAgfX0+XG4gICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBzY2FsZTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgc2NhbGU6IDEgfX1cbiAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogNDAwLCBkYW1waW5nOiAxNSwgZGVsYXk6IDAuMiB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge3JlY2FyZ2FSZXN1bHQuc3VjY2VzcyA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xNiBoLTE2IHJvdW5kZWQtZnVsbCBteC1hdXRvIG1iLTMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg3NCwgMjIyLCAxMjgsIDAuMTUpXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxDaGVjayBjbGFzc05hbWU9XCJ3LTggaC04XCIgc3R5bGU9e3sgY29sb3I6IFwiIzRhZGU4MFwiIH19IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC00eGwgbWItM1wiPuKdjDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LWxnXCIgc3R5bGU9e3N0LnRleHR9PntyZWNhcmdhUmVzdWx0Lm1lc3NhZ2V9PC9wPlxuICAgICAgICAgICAgICAgICAgICB7IXJlY2FyZ2FSZXN1bHQuc3VjY2VzcyAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtyZXNldFJlY2FyZ2F9IGNsYXNzTmFtZT1cIm10LTQgcm91bmRlZC14bCBweC02IHB5LTIuNSB0ZXh0LXNtIGZvbnQtbWVkaXVtXCIgc3R5bGU9e3sgLi4uc3Quc2Vjb25kYXJ5QmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViLCBjb2xvcjogXCJ2YXIoLS10Zy10ZXh0KVwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgVGVudGFyIE5vdmFtZW50ZVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgIHsvKiBDb21wcm92YW50ZSBEZXRhaWxzICovfVxuICAgICAgICAgICAgICAgICAge3JlY2FyZ2FSZXN1bHQuc3VjY2VzcyAmJiByZWNhcmdhUmVzdWx0LmRldGFpbHMgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm91bmRlZC0yeGwgb3ZlcmZsb3ctaGlkZGVuXCIgc3R5bGU9e3sgLi4uc3Quc2Vjb25kYXJ5QmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC00IHB5LTMgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIiBzdHlsZT17eyBib3JkZXJCb3R0b206IHN0LmJvcmRlclN1YiwgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoNzQsIDIyMiwgMTI4LCAwLjA1KVwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8RmlsZVRleHQgY2xhc3NOYW1lPVwidy00IGgtNFwiIHN0eWxlPXt7IGNvbG9yOiBcIiM0YWRlODBcIiB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB0cmFja2luZy13aWRlciB1cHBlcmNhc2VcIiBzdHlsZT17eyBjb2xvcjogXCIjNGFkZTgwXCIgfX0+Q29tcHJvdmFudGUgZGUgUmVjYXJnYTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJkaXZpZGUteVwiIHN0eWxlPXt7IGJvcmRlckNvbG9yOiBcInZhcigtLXRnLXNlY29uZGFyeS1iZylcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IGljb246IFBob25lLCBsYWJlbDogXCJUZWxlZm9uZVwiLCB2YWx1ZTogcmVjYXJnYVJlc3VsdC5kZXRhaWxzLnRlbGVmb25lIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpY29uOiBaYXAsIGxhYmVsOiBcIk9wZXJhZG9yYVwiLCB2YWx1ZTogcmVjYXJnYVJlc3VsdC5kZXRhaWxzLm9wZXJhZG9yYSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsgaWNvbjogV2FsbGV0LCBsYWJlbDogXCJWYWxvclwiLCB2YWx1ZTogZm9ybWF0Q3VycmVuY3kocmVjYXJnYVJlc3VsdC5kZXRhaWxzLnZhbG9yKSwgaGlnaGxpZ2h0OiB0cnVlIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpY29uOiBXYWxsZXQsIGxhYmVsOiBcIk5vdm8gU2FsZG9cIiwgdmFsdWU6IGZvcm1hdEN1cnJlbmN5KHJlY2FyZ2FSZXN1bHQuZGV0YWlscy5ub3ZvU2FsZG8pIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpY29uOiBIYXNoLCBsYWJlbDogXCJJRCBkbyBQZWRpZG9cIiwgdmFsdWU6IHJlY2FyZ2FSZXN1bHQuZGV0YWlscy5wZWRpZG9JZCB8fCBcIuKAlFwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpY29uOiBDbG9jaywgbGFiZWw6IFwiRGF0YS9Ib3JhXCIsIHZhbHVlOiByZWNhcmdhUmVzdWx0LmRldGFpbHMuaG9yYSB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBdLm1hcCgocm93LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleT17cm93LmxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB4OiAtMTAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeDogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4zICsgaSAqIDAuMDYgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweC00IHB5LTNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYm9yZGVyQ29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjA1KVwiIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMi41XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxyb3cuaWNvbiBjbGFzc05hbWU9XCJ3LTQgaC00XCIgc3R5bGU9e3sgY29sb3I6IFwidmFyKC0tdGctaGludClcIiB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzXCIgc3R5bGU9e3sgY29sb3I6IFwidmFyKC0tdGctaGludClcIiB9fT57cm93LmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdGV4dC1zbSBmb250LXNlbWlib2xkICR7cm93LmhpZ2hsaWdodCA/IFwiXCIgOiBcIlwifWB9IHN0eWxlPXt7IGNvbG9yOiByb3cuaGlnaGxpZ2h0ID8gXCIjNGFkZTgwXCIgOiBcInZhcigtLXRnLXRleHQpXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyb3cudmFsdWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICAgey8qIEFjdGlvbiBCdXR0b25zICovfVxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgey8qIFNoYXJlIC8gRW52aWFyIENvbXByb3ZhbnRlICovfVxuICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5idXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC42IH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2FzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkID0gcmVjYXJnYVJlc3VsdC5kZXRhaWxzITtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB0ZXh0ID0gYOKchSAqQ29tcHJvdmFudGUgZGUgUmVjYXJnYSpcXG5cXG7wn5OxIFRlbGVmb25lOiAke2QudGVsZWZvbmV9XFxu8J+ToSBPcGVyYWRvcmE6ICR7ZC5vcGVyYWRvcmF9XFxu8J+SsCBWYWxvcjogJHtmb3JtYXRDdXJyZW5jeShkLnZhbG9yKX1cXG7wn4aUIFBlZGlkbzogJHtkLnBlZGlkb0lkIHx8IFwi4oCUXCJ9XFxu8J+VkCBEYXRhOiAke2QuaG9yYX1cXG5cXG5SZWNhcmdhIHJlYWxpemFkYSBjb20gc3VjZXNzbyFgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmF2aWdhdG9yLnNoYXJlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF3YWl0IG5hdmlnYXRvci5zaGFyZSh7IHRpdGxlOiBcIkNvbXByb3ZhbnRlIGRlIFJlY2FyZ2FcIiwgdGV4dDogdGV4dC5yZXBsYWNlKC9cXCovZywgXCJcIikgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0LnJlcGxhY2UoL1xcKi9nLCBcIlwiKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRnV2ViQXBwPy5IYXB0aWNGZWVkYmFjaz8ubm90aWZpY2F0aW9uT2NjdXJyZWQoXCJzdWNjZXNzXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggeyAvKiB1c2VyIGNhbmNlbGxlZCAqLyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHB5LTMgcm91bmRlZC14bCB0ZXh0LXNtIGZvbnQtc2VtaWJvbGRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwidmFyKC0tdGctYnRuKVwiLCBjb2xvcjogXCJ2YXIoLS10Zy1idG4tdGV4dClcIiB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8U2hhcmUyIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICBFbnZpYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgey8qIEFjb21wYW5oYXIgUGVkaWRvICovfVxuICAgICAgICAgICAgICAgICAgICAgICAge3JlY2FyZ2FSZXN1bHQuZGV0YWlscy5wZWRpZG9JZCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuNjUgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0Z1dlYkFwcD8uSGFwdGljRmVlZGJhY2s/LmltcGFjdE9jY3VycmVkKFwibWVkaXVtXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZS5mdW5jdGlvbnMuaW52b2tlKFwicmVjYXJnYS1leHByZXNzXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBib2R5OiB7IGFjdGlvbjogXCJvcmRlci1zdGF0dXNcIiwgZXh0ZXJuYWxfaWQ6IHJlY2FyZ2FSZXN1bHQuZGV0YWlscyEucGVkaWRvSWQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGRhdGE/LmRhdGE/LmxvY2FsU3RhdHVzIHx8IGRhdGE/LmRhdGE/LnN0YXR1cyB8fCBcImRlc2NvbmhlY2lkb1wiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNNYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7IGNvbXBsZXRlZDogXCLinIUgQ29uY2x1w61kYVwiLCBwZW5kaW5nOiBcIuKPsyBQcm9jZXNzYW5kb1wiLCBmYWxoYTogXCLinYwgRmFsaGFcIiwgZmVpdGE6IFwi4pyFIENvbmNsdcOtZGFcIiB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydChzdGF0dXNNYXBbc3RhdHVzXSB8fCBgU3RhdHVzOiAke3N0YXR1c31gKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggeyBhbGVydChcIkVycm8gYW8gY29uc3VsdGFyIHN0YXR1c1wiKTsgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgcHktMyByb3VuZGVkLXhsIHRleHQtc20gZm9udC1zZW1pYm9sZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgLi4uc3Quc2Vjb25kYXJ5QmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViLCBjb2xvcjogXCJ2YXIoLS10Zy10ZXh0KVwiIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8UmVmcmVzaEN3IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICAgey8qIE5vdmEgUmVjYXJnYSAqL31cbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjcgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3Jlc2V0UmVjYXJnYX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweS0zIHJvdW5kZWQteGwgdGV4dC1zbSBmb250LXNlbWlib2xkIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IC4uLnN0LnNlY29uZGFyeUJnLCBib3JkZXI6IHN0LmJvcmRlclN1YiwgY29sb3I6IFwidmFyKC0tdGctYWNjZW50KVwiIH19XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFNtYXJ0cGhvbmUgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICBOb3ZhIFJlY2FyZ2FcbiAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMVwiPlxuICAgICAgICAgICAgICAgICAgICB7W1wicGhvbmVcIiwgXCJvcFwiLCBcInZhbG9yXCIsIFwiY29uZmlybVwiXS5tYXAoKHN0ZXAsIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17c3RlcH0gY2xhc3NOYW1lPVwiZmxleC0xIGgtMSByb3VuZGVkLWZ1bGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBbXCJwaG9uZVwiLCBcIm9wXCIsIFwidmFsb3JcIiwgXCJjb25maXJtXCJdLmluZGV4T2YocmVjYXJnYVN0ZXApID49IGkgPyBcInZhcigtLXRnLWJ0bilcIiA6IFwiY29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLXRnLWhpbnQpIDI1JSwgdHJhbnNwYXJlbnQpXCIgfX0gLz5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAge3JlY2FyZ2FTdGVwID09PSBcInBob25lXCIgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdW5kZWQtMnhsIHAtNiBzcGFjZS15LTVcIiBzdHlsZT17eyAuLi5zdC5zZWNvbmRhcnlCZywgYm9yZGVyOiBzdC5ib3JkZXJTdWIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy0xNCBoLTE0IHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBteC1hdXRvIG1iLTNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwiY29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLXRnLWJ0bikgMTUlLCB0cmFuc3BhcmVudClcIiB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IHk6IFswLCAtNiwgMF0sIHJvdGF0ZTogWzAsIC04LCA4LCAwXSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAyLjUsIHJlcGVhdDogSW5maW5pdHksIGVhc2U6IFwiZWFzZUluT3V0XCIgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPFNtYXJ0cGhvbmUgY2xhc3NOYW1lPVwidy03IGgtN1wiIHN0eWxlPXtzdC5saW5rfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkXCIgc3R5bGU9e3N0LnRleHR9PlF1YWwgbyBuw7ptZXJvPzwvaDI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIG10LTFcIiBzdHlsZT17c3QuaGludH0+RGlnaXRlIG8gREREICsgTsO6bWVybyBkbyBjZWx1bGFyPC9wPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIHsvKiBDbGlwYm9hcmQgcGhvbmUgc3VnZ2VzdGlvbiAqL31cbiAgICAgICAgICAgICAgICAgICAgICB7Y2xpcGJvYXJkUGhvbmUgJiYgcGhvbmUubGVuZ3RoID09PSAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBzZXRQaG9uZShjbGlwYm9hcmRQaG9uZSk7IHNldENsaXBib2FyZFBob25lKG51bGwpOyB0Z1dlYkFwcD8uSGFwdGljRmVlZGJhY2s/LmltcGFjdE9jY3VycmVkKFwibGlnaHRcIik7IH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcm91bmRlZC14bCBweC00IHB5LTMgdHJhbnNpdGlvbi1hbGwgYWN0aXZlOnNjYWxlLVswLjk4XVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCJjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tdGctYnRuKSAxMiUsIHRyYW5zcGFyZW50KVwiLCBib3JkZXI6IGAxcHggc29saWQgY29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLXRnLWJ0bikgMzAlLCB0cmFuc3BhcmVudClgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPENvcHkgY2xhc3NOYW1lPVwidy00IGgtNFwiIHN0eWxlPXtzdC5saW5rfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1sZWZ0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtbWVkaXVtXCIgc3R5bGU9e3N0Lmxpbmt9Pk7Dum1lcm8gZGV0ZWN0YWRvIG5hIMOhcmVhIGRlIHRyYW5zZmVyw6puY2lhPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1iYXNlIGZvbnQtbW9ubyBmb250LWJvbGRcIiBzdHlsZT17c3QudGV4dH0+e2Zvcm1hdFBob25lKGNsaXBib2FyZFBob25lKX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgcHgtMi41IHB5LTEgcm91bmRlZC1sZ1wiIHN0eWxlPXtzdC5idG59PkNvbGFyPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRlbFwiIHZhbHVlPXtmb3JtYXRQaG9uZShwaG9uZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGlnaXRzID0gZS50YXJnZXQudmFsdWUucmVwbGFjZSgvXFxEL2csIFwiXCIpLnNsaWNlKDAsIDExKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGhvbmUoZGlnaXRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBvblBhc3RlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBhc3RlZCA9IGUuY2xpcGJvYXJkRGF0YS5nZXREYXRhKFwidGV4dFwiKSB8fCBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgZGlnaXRzID0gcGFzdGVkLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGNvdW50cnkgY29kZSA1NSBpZiBwcmVzZW50IChlLmcuICs1NTIxOTk5MDA1OTMzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlnaXRzLmxlbmd0aCA+PSAxMiAmJiBkaWdpdHMuc3RhcnRzV2l0aChcIjU1XCIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlnaXRzID0gZGlnaXRzLnNsaWNlKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpZ2l0cyA9IGRpZ2l0cy5zbGljZSgwLCAxMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNldFBob25lKGRpZ2l0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIoMDApIDAwMDAwLTAwMDBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGJnLXRyYW5zcGFyZW50IHBiLTMgdGV4dC0yeGwgdGV4dC1jZW50ZXIgZm9udC1tb25vIGZvY3VzOm91dGxpbmUtbm9uZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyAuLi5zdC50ZXh0LCBib3JkZXJCb3R0b206IHN0LmJvcmRlck1haW4gfX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHsgaWYgKHBob25lLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5sZW5ndGggPj0gMTApIHsgbG9hZE9wZXJhZG9yYXMoKTsgc2V0UmVjYXJnYVN0ZXAoXCJvcFwiKTsgfSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3Bob25lLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5sZW5ndGggPCAxMH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCByb3VuZGVkLXhsIHB5LTMuNSBmb250LXNlbWlib2xkIHRyYW5zaXRpb24gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgZGlzYWJsZWQ6b3BhY2l0eS00MFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17c3QuYnRufT5cbiAgICAgICAgICAgICAgICAgICAgICAgIENvbnRpbnVhciA8Q2hldnJvblJpZ2h0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgICAgICAgIHtyZWNhcmdhU3RlcCA9PT0gXCJvcFwiICYmIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFJlY2FyZ2FTdGVwKFwicGhvbmVcIil9IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xIHRleHQtc21cIiBzdHlsZT17c3QuaGludH0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QXJyb3dMZWZ0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPiBWb2x0YXJcbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGRcIiBzdHlsZT17c3QudGV4dH0+U2VsZWNpb25lIGEgb3BlcmFkb3JhPC9oMj5cbiAgICAgICAgICAgICAgICAgICAgICB7b3BlcmFkb3Jhcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHB5LThcIiBzdHlsZT17c3QuaGludH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxSZWZyZXNoQ3cgY2xhc3NOYW1lPVwidy02IGgtNiBhbmltYXRlLXNwaW4gbXgtYXV0byBtYi0yXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbVwiPkNhcnJlZ2FuZG8gb3BlcmFkb3Jhcy4uLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICkgOiBvcGVyYWRvcmFzLm1hcCgob3ApID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24ga2V5PXtvcC5pZH0gb25DbGljaz17KCkgPT4geyBzZXRTZWxlY3RlZE9wKG9wKTsgc2V0UGhvbmVDaGVja1Jlc3VsdChudWxsKTsgaGFuZGxlQ2hlY2tQaG9uZShvcC5jYXJyaWVySWQpOyBzZXRSZWNhcmdhU3RlcChcImNoZWNrXCIpOyB0Z1dlYkFwcD8uSGFwdGljRmVlZGJhY2s/LmltcGFjdE9jY3VycmVkKFwibGlnaHRcIik7IH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCByb3VuZGVkLXhsIHAtNCB0ZXh0LWxlZnQgdHJhbnNpdGlvbiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyAuLi5zdC5zZWNvbmRhcnlCZywgYm9yZGVyOiBzdC5ib3JkZXJTdWIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTAgaC0xMCByb3VuZGVkLWxnIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCJjb2xvci1taXgoaW4gc3JnYiwgdmFyKC0tdGctYnRuKSAxNSUsIHRyYW5zcGFyZW50KVwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFNtYXJ0cGhvbmUgY2xhc3NOYW1lPVwidy01IGgtNVwiIHN0eWxlPXtzdC5saW5rfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGRcIiBzdHlsZT17c3QudGV4dH0+e29wLm5vbWV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPENoZXZyb25SaWdodCBjbGFzc05hbWU9XCJ3LTQgaC00XCIgc3R5bGU9e3N0LmhpbnR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApfVxuXG4gICAgICAgICAgICAgICAgICB7LyogQ2hlY2sgc3RlcCAtIGJsYWNrbGlzdC9jb29sZG93biB2ZXJpZmljYXRpb24gKi99XG4gICAgICAgICAgICAgICAgICB7cmVjYXJnYVN0ZXAgPT09IFwiY2hlY2tcIiAmJiBzZWxlY3RlZE9wICYmIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHsgc2V0UmVjYXJnYVN0ZXAoXCJvcFwiKTsgc2V0UGhvbmVDaGVja1Jlc3VsdChudWxsKTsgfX0gY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgdGV4dC1zbVwiIHN0eWxlPXtzdC5oaW50fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBcnJvd0xlZnQgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+IFZvbHRhclxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctMTQgaC0xNCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbXgtYXV0byBtYi0zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcImNvbG9yLW1peChpbiBzcmdiLCB2YXIoLS10Zy1idG4pIDE1JSwgdHJhbnNwYXJlbnQpXCIgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17Y2hlY2tpbmdQaG9uZSA/IHsgcm90YXRlOiBbMCwgMzYwXSB9IDoge319XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDEuNSwgcmVwZWF0OiBJbmZpbml0eSwgZWFzZTogXCJsaW5lYXJcIiB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8U2hpZWxkIGNsYXNzTmFtZT1cInctNyBoLTdcIiBzdHlsZT17c3QubGlua30gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtYm9sZFwiIHN0eWxlPXtzdC50ZXh0fT5WZXJpZmljYcOnw6NvIGRlIE7Dum1lcm88L2gyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBtdC0xXCIgc3R5bGU9e3N0LmhpbnR9PntzZWxlY3RlZE9wLm5vbWV9IOKAoiB7cGhvbmV9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBwLTVcIiBzdHlsZT17eyAuLi5zdC5zZWNvbmRhcnlCZywgYm9yZGVyOiBzdC5ib3JkZXJTdWIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Y2hlY2tpbmdQaG9uZSAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX0gY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHktNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMb2FkZXIyIGNsYXNzTmFtZT1cInctOCBoLTggYW5pbWF0ZS1zcGluXCIgc3R5bGU9e3N0Lmxpbmt9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LW1lZGl1bVwiIHN0eWxlPXtzdC5oaW50fT5WZXJpZmljYW5kbyBibGFja2xpc3QgZSBjb29sZG93bi4uLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHshY2hlY2tpbmdQaG9uZSAmJiBwaG9uZUNoZWNrUmVzdWx0ICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXYgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45NSB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH19IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0zIHB5LTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cGhvbmVDaGVja1Jlc3VsdC5zdGF0dXMgPT09IFwiQ0xFQVJcIiA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgc2NhbGU6IDAgfX0gYW5pbWF0ZT17eyBzY2FsZTogMSB9fSB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Q2hlY2tDaXJjbGUyIGNsYXNzTmFtZT1cInctMTIgaC0xMlwiIHN0eWxlPXt7IGNvbG9yOiBcIiMyMmM1NWVcIiB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBwaG9uZUNoZWNrUmVzdWx0LnN0YXR1cyA9PT0gXCJDT09MRE9XTlwiID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXYgYW5pbWF0ZT17eyByb3RhdGU6IFswLCAtMTAsIDEwLCAtMTAsIDBdIH19IHRyYW5zaXRpb249e3sgZHVyYXRpb246IDAuNSB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFsZXJ0VHJpYW5nbGUgY2xhc3NOYW1lPVwidy0xMiBoLTEyXCIgc3R5bGU9e3sgY29sb3I6IFwiI2VhYjMwOFwiIH19IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGFuaW1hdGU9e3sgc2NhbGU6IFsxLCAxLjE1LCAxLCAxLjEsIDFdLCByb3RhdGU6IFswLCAtMTAsIDEwLCAtNSwgMF0sIG9wYWNpdHk6IFsxLCAwLjcsIDFdIH19IHRyYW5zaXRpb249e3sgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDIuNSwgZWFzZTogXCJlYXNlSW5PdXRcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFhDaXJjbGUgY2xhc3NOYW1lPVwidy0xMiBoLTEyIHRleHQtZGVzdHJ1Y3RpdmUgZHJvcC1zaGFkb3ctWzBfMF84cHhfcmdiYSgyMzksNjgsNjgsMC41KV1cIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtY2VudGVyXCIgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBwaG9uZUNoZWNrUmVzdWx0LnN0YXR1cyA9PT0gXCJDTEVBUlwiID8gXCIjMjJjNTVlXCIgOiBwaG9uZUNoZWNrUmVzdWx0LnN0YXR1cyA9PT0gXCJDT09MRE9XTlwiID8gXCIjZWFiMzA4XCIgOiBcIiNlZjQ0NDRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3Bob25lQ2hlY2tSZXN1bHQuc3RhdHVzID09PSBcIkNMRUFSXCIgPyBcIk7Dum1lcm8gRGlzcG9uw612ZWxcIiA6IHBob25lQ2hlY2tSZXN1bHQuc3RhdHVzID09PSBcIkNPT0xET1dOXCIgPyBcIkNvb2xkb3duIEF0aXZvXCIgOiBcIk7Dum1lcm8gQmxvcXVlYWRvXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1jZW50ZXJcIiBzdHlsZT17c3QuaGludH0+e3Bob25lQ2hlY2tSZXN1bHQubWVzc2FnZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgICB7IWNoZWNraW5nUGhvbmUgJiYgcGhvbmVDaGVja1Jlc3VsdCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3Bob25lQ2hlY2tSZXN1bHQuc3RhdHVzICE9PSBcIkJMQUNLTElTVEVEXCIgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0UmVjYXJnYVN0ZXAoXCJ2YWxvclwiKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSByb3VuZGVkLXhsIHB5LTMuNSBmb250LXNlbWlib2xkIHRyYW5zaXRpb24gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInZhcigtLXRnLWJ0bilcIiwgY29sb3I6IFwidmFyKC0tdGctYnRuLXRleHQpXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDb250aW51YXIgPENoZXZyb25SaWdodCBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB7IHNldFJlY2FyZ2FTdGVwKFwib3BcIik7IHNldFBob25lQ2hlY2tSZXN1bHQobnVsbCk7IH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIHJvdW5kZWQteGwgcHktMy41IGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvbiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgLi4uc3Quc2Vjb25kYXJ5QmcsIC4uLnN0LnRleHQsIGJvcmRlcjogc3QuYm9yZGVyU3ViIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRyb2NhciBPcGVyYWRvcmFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgICAgICAgIHtyZWNhcmdhU3RlcCA9PT0gXCJ2YWxvclwiICYmIHNlbGVjdGVkT3AgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktM1wiPlxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0UmVjYXJnYVN0ZXAoXCJjaGVja1wiKX0gY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgdGV4dC1zbVwiIHN0eWxlPXtzdC5oaW50fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxBcnJvd0xlZnQgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+IFZvbHRhclxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtYm9sZFwiIHN0eWxlPXtzdC50ZXh0fT57c2VsZWN0ZWRPcC5ub21lfSDigJQgVmFsb3I8L2gyPlxuXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0yIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRPcC52YWxvcmVzLnNvcnQoKGE6IFZhbG9ySXRlbSwgYjogVmFsb3JJdGVtKSA9PiAoYS51c2VyQ29zdCA/PyBhLmNvc3QpIC0gKGIudXNlckNvc3QgPz8gYi5jb3N0KSkubWFwKCh2OiBWYWxvckl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZmFjZVZhbHVlID0gdi52YWx1ZSB8fCB2LmNvc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc3BsYXlDb3N0ID0gdi51c2VyQ29zdCA/PyB2LmNvc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpc2NvdW50ID0gZmFjZVZhbHVlID4gZGlzcGxheUNvc3QgPyBNYXRoLnJvdW5kKCgoZmFjZVZhbHVlIC0gZGlzcGxheUNvc3QpIC8gZmFjZVZhbHVlKSAqIDEwMCkgOiAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24ga2V5PXt2LnZhbHVlSWR9IG9uQ2xpY2s9eygpID0+IHsgc2V0U2VsZWN0ZWRWYWxvcih2KTsgc2V0UmVjYXJnYVN0ZXAoXCJjb25maXJtXCIpOyB0Z1dlYkFwcD8uSGFwdGljRmVlZGJhY2s/LmltcGFjdE9jY3VycmVkKFwibGlnaHRcIik7IH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyZWxhdGl2ZSByb3VuZGVkLXhsIHB5LTQgcHgtMyB0ZXh0LWxlZnQgdHJhbnNpdGlvbi1hbGwgYWN0aXZlOnNjYWxlLTk1XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IC4uLnN0LnNlY29uZGFyeUJnLCAuLi5zdC50ZXh0LCBib3JkZXI6IHN0LmJvcmRlclN1YiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtkaXNjb3VudCA+IDAgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJhYnNvbHV0ZSAtdG9wLTIgcmlnaHQtMiB0ZXh0LVsxMHB4XSBmb250LWJvbGQgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsIHRleHQtd2hpdGVcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmQ6IGRpc2NvdW50ID49IDMwID8gXCIjMjJjNTVlXCIgOiBkaXNjb3VudCA+PSAyMCA/IFwiIzEwYjk4MVwiIDogXCIjM2I4MmY2XCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2Rpc2NvdW50fSUgT0ZGXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCIgc3R5bGU9e3N0LmhpbnR9PlJlY2FyZ2E8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgbXQtMC41XCI+UiQge2ZhY2VWYWx1ZS50b0ZpeGVkKDIpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3YubGFiZWwgJiYgdi5sYWJlbCAhPT0gYFIkICR7di5jb3N0fWAgJiYgdi5sYWJlbCAhPT0gYFIkICR7ZmFjZVZhbHVlfWAgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIG10LTAuNSB0cnVuY2F0ZVwiIHN0eWxlPXtzdC5oaW50fT57di5sYWJlbH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ZGlzY291bnQgPiAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC0yIHB0LTJcIiBzdHlsZT17eyBib3JkZXJUb3A6IHN0LmJvcmRlclN1YiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XVwiIHN0eWxlPXtzdC5oaW50fT5Wb2PDqiBwYWdhIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZFwiIHN0eWxlPXt7IGNvbG9yOiBcIiMyMmM1NWVcIiB9fT5SJCB7ZGlzcGxheUNvc3QudG9GaXhlZCgyKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgICAgICAgIHtyZWNhcmdhU3RlcCA9PT0gXCJjb25maXJtXCIgJiYgc2VsZWN0ZWRPcCAmJiBzZWxlY3RlZFZhbG9yICYmIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFJlY2FyZ2FTdGVwKFwidmFsb3JcIil9IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xIHRleHQtc21cIiBzdHlsZT17c3QuaGludH0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8QXJyb3dMZWZ0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPiBWb2x0YXJcbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdW5kZWQtMnhsIHAtNSBzcGFjZS15LTNcIiBzdHlsZT17eyAuLi5zdC5zZWNvbmRhcnlCZywgYm9yZGVyOiBzdC5ib3JkZXJTdWIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1jZW50ZXJcIiBzdHlsZT17c3QudGV4dH0+Q29uZmlybWFyIFJlY2FyZ2E8L2gyPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlblwiPjxzcGFuIHN0eWxlPXtzdC5oaW50fT5PcGVyYWRvcmE8L3NwYW4+PHNwYW4gY2xhc3NOYW1lPVwiZm9udC1zZW1pYm9sZFwiIHN0eWxlPXtzdC50ZXh0fT57c2VsZWN0ZWRPcC5ub21lfTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW5cIj48c3BhbiBzdHlsZT17c3QuaGludH0+TsO6bWVybzwvc3Bhbj48c3BhbiBjbGFzc05hbWU9XCJmb250LW1vbm9cIiBzdHlsZT17c3QudGV4dH0+e2Zvcm1hdFBob25lKHBob25lKX08L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuXCI+PHNwYW4gc3R5bGU9e3N0LmhpbnR9PlZhbG9yPC9zcGFuPjxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZFwiIHN0eWxlPXtzdC5ncmVlbn0+e2Zvcm1hdEN1cnJlbmN5KHNlbGVjdGVkVmFsb3IudXNlckNvc3QgPz8gc2VsZWN0ZWRWYWxvci5jb3N0KX08L3NwYW4+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIHRleHQtc21cIj48c3BhbiBzdHlsZT17c3QuaGludH0+U2FsZG8gYXDDs3M8L3NwYW4+PHNwYW4gc3R5bGU9e3N0LnRleHR9Pntmb3JtYXRDdXJyZW5jeShzYWxkbyAtIChzZWxlY3RlZFZhbG9yLnVzZXJDb3N0ID8/IHNlbGVjdGVkVmFsb3IuY29zdCkpfTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICB7KHNlbGVjdGVkVmFsb3IudXNlckNvc3QgPz8gc2VsZWN0ZWRWYWxvci5jb3N0KSA+IHNhbGRvID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgdGV4dC1zbVwiIHN0eWxlPXtzdC5kZXN0cnVjdGl2ZX0+U2FsZG8gaW5zdWZpY2llbnRlPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZVJlY2FyZ2FDb25maXJtfSBkaXNhYmxlZD17cmVjYXJnYUxvYWRpbmd9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCByb3VuZGVkLXhsIHB5LTMuNSBmb250LXNlbWlib2xkIHRyYW5zaXRpb24gZGlzYWJsZWQ6b3BhY2l0eS01MFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCIjNGFkZTgwXCIsIGNvbG9yOiBcIiMwMDBcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3JlY2FyZ2FMb2FkaW5nID8gXCJQcm9jZXNzYW5kby4uLlwiIDogXCLinIUgQ29uZmlybWFyIFJlY2FyZ2FcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICB7cmVjYXJnYVN0ZXAgPT09IFwicGhvbmVcIiAmJiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTIgcHQtMlwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXNtXCIgc3R5bGU9e3N0LnRleHR9PsOabHRpbWFzIFJlY2FyZ2FzPC9oMz5cbiAgICAgICAgICAgICAgICAgICAge3JlY2FyZ2FzLmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0U2VjdGlvbihcImhpc3Rvcmljb1wiKX0gY2xhc3NOYW1lPVwidGV4dC14c1wiIHN0eWxlPXtzdC5saW5rfT5WZXIgdG9kYXM8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAge3JlY2FyZ2FzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyb3VuZGVkLXhsIHAtNCB0ZXh0LWNlbnRlclwiIHN0eWxlPXt7IC4uLnN0LnNlY29uZGFyeUJnLCBib3JkZXI6IHN0LmJvcmRlclN1YiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtXCIgc3R5bGU9e3N0LmhpbnR9Pk5lbmh1bWEgcmVjYXJnYSByZWFsaXphZGEgYWluZGE8L3A+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgcmVjYXJnYXMuc2xpY2UoMCwgNSkubWFwKChyLCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleT17ci5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMTAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogaSAqIDAuMDUgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJvdW5kZWQteGwgcC0zLjUgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGN1cnNvci1wb2ludGVyIGFjdGl2ZTpzY2FsZS1bMC45OF0gdHJhbnNpdGlvbi10cmFuc2Zvcm1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgLi4uc3Quc2Vjb25kYXJ5QmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7IGlmIChyLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIikgeyBzZXRWaWV3aW5nUmVjZWlwdChyKTsgc2V0U2VjdGlvbihcImhpc3Rvcmljb1wiKTsgfSB9fVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEwIGgtMTAgcm91bmRlZC1sZyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiIHN0eWxlPXtzdC5iZ30+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFNtYXJ0cGhvbmUgY2xhc3NOYW1lPVwidy01IGgtNVwiIHN0eWxlPXtzdC5saW5rfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbVwiIHN0eWxlPXtzdC50ZXh0fT57ci5vcGVyYWRvcmEgfHwgXCLigJRcIn08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LW1vbm9cIiBzdHlsZT17c3QuaGludH0+e2Zvcm1hdFBob25lKHIudGVsZWZvbmUpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1yaWdodFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbVwiIHN0eWxlPXtzdC50ZXh0fT57Zm9ybWF0Q3VycmVuY3koci52YWxvcil9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSBmb250LW1lZGl1bVwiIHN0eWxlPXt7IGNvbG9yOiByLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiA/IFwidmFyKC0tdGctbGluaylcIiA6IHIuc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwiI2ZhY2MxNVwiIDogXCJ2YXIoLS10Zy1kZXN0cnVjdGl2ZSlcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7ci5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgPyBcIkNvbXByb3ZhbnRlXCIgOiByLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIgPyBcIlByb2Nlc3NhbmRvXCIgOiBcIkZhbGhhXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHsvKiDilIDilIAgQWRpY2lvbmFyIFNhbGRvIOKUgOKUgCAqL31cbiAgICAgICAgICB7c2VjdGlvbiA9PT0gXCJkZXBvc2l0b1wiICYmIChcbiAgICAgICAgICAgIDxtb3Rpb24uZGl2IGtleT1cImRlcG9zaXRvXCIgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fSBleGl0PXt7IG9wYWNpdHk6IDAgfX0gY2xhc3NOYW1lPVwicC00IHNwYWNlLXktNFwiPlxuICAgICAgICAgICAgICB7cGl4RGF0YSA/IChcbiAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic3BhY2UteS0zIG92ZXJmbG93LXktYXV0byBtYXgtaC1bY2FsYygxMDB2aC0xODBweCldIHBiLTRcIlxuICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45IH19XG4gICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH19XG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAyNSB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHsvKiBTdWNjZXNzIGJhZGdlICovfVxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctMTIgaC0xMiByb3VuZGVkLWZ1bGwgbXgtYXV0byBtYi0yIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg3NCwyMjIsMTI4LDAuMTUpXCIgfX1cbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IHNjYWxlOiAwIH19XG4gICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiA0MDAsIGRhbXBpbmc6IDEyLCBkZWxheTogMC4xIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8Q2hlY2sgY2xhc3NOYW1lPVwidy02IGgtNlwiIHN0eWxlPXt7IGNvbG9yOiBcIiM0YWRlODBcIiB9fSAvPlxuICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uaDJcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LWJhc2UgZm9udC1ib2xkXCJcbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17c3QudGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDEwIH19XG4gICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4yIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICBQSVggR2VyYWRvIGNvbSBTdWNlc3NvIVxuICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5oMj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICB7LyogUVIgQ29kZSBjb21wYWN0ICovfVxuICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWNlbnRlclwiXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMjAgfX1cbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuMyB9fVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQteGwgcC0yLjUgcmVsYXRpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQtMCByb3VuZGVkLXhsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgYm94U2hhZG93OiBbXCIwIDAgMHB4IHJnYmEoNzQsMjIyLDEyOCwwKVwiLCBcIjAgMCAxNnB4IHJnYmEoNzQsMjIyLDEyOCwwLjI1KVwiLCBcIjAgMCAwcHggcmdiYSg3NCwyMjIsMTI4LDApXCJdIH19XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAyLjUsIHJlcGVhdDogSW5maW5pdHksIGVhc2U6IFwiZWFzZUluT3V0XCIgfX1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIDxRUkNvZGVTVkcgdmFsdWU9e3BpeERhdGEucXJfY29kZSB8fCBcIlwifSBzaXplPXsxNjB9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgICAgICAgICAgICB7LyogQW1vdW50ICovfVxuICAgICAgICAgICAgICAgICAgPG1vdGlvbi5wXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHRleHQteGwgZm9udC1ib2xkXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3N0LmdyZWVufVxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjUgfX1cbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAxNSwgZGVsYXk6IDAuNCB9fVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7Zm9ybWF0Q3VycmVuY3kocGl4RGF0YS5hbW91bnQpfVxuICAgICAgICAgICAgICAgICAgPC9tb3Rpb24ucD5cblxuICAgICAgICAgICAgICAgICAgey8qIENvcHkgc2VjdGlvbiAqL31cbiAgICAgICAgICAgICAgICAgIHtwaXhEYXRhLnFyX2NvZGUgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInNwYWNlLXktMlwiXG4gICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuNSB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5idXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2NvcHlQaXh9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcm91bmRlZC14bCBweS0zIGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvbiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMlwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17c3QuYnRufVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e2NvcGllZCA/IHsgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoNzQsMjIyLDEyOCwwLjIpXCIgfSA6IHt9fVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtjb3BpZWQgPyA8PjxDaGVjayBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz4gQ29waWFkbyE8Lz4gOiA8PjxDb3B5IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPiBDb3BpYXIgY8OzZGlnbyBQSVg8Lz59XG4gICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPG1vdGlvbi5idXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBzZXRQaXhEYXRhKG51bGwpOyBzZXREZXBvc2l0QW1vdW50KFwiXCIpOyB9fVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgdGV4dC1jZW50ZXIgdGV4dC1zbSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMVwiXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlPXtzdC5oaW50fVxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuNiB9fVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8QXJyb3dMZWZ0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPiBWb2x0YXJcbiAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm91bmRlZC0yeGwgcC01IHRleHQtY2VudGVyXCIgc3R5bGU9e3sgLi4uc3Quc2Vjb25kYXJ5QmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViIH19PlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIiBzdHlsZT17c3QuaGludH0+U2FsZG8gQXR1YWw8L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYm9sZCBtdC0xXCIgc3R5bGU9e3N0LmdyZWVufT57Zm9ybWF0Q3VycmVuY3koc2FsZG8pfTwvcD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cImZvbnQtYm9sZFwiIHN0eWxlPXtzdC50ZXh0fT5TZWxlY2lvbmUgbyB2YWxvcjwvaDI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAge1sxMCwgMTUsIDIwLCAzMCwgNTAsIDEwMF0ubWFwKCh2KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBrZXk9e3Z9IG9uQ2xpY2s9eygpID0+IHNldERlcG9zaXRBbW91bnQoU3RyaW5nKHYpKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJvdW5kZWQteGwgcHktMy41IHRleHQtY2VudGVyIGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgICAuLi4oZGVwb3NpdEFtb3VudCA9PT0gU3RyaW5nKHYpID8geyBiYWNrZ3JvdW5kQ29sb3I6IFwiY29sb3ItbWl4KGluIHNyZ2IsIHZhcigtLXRnLWJ0bikgMTUlLCB0cmFuc3BhcmVudClcIiwgY29sb3I6IFwidmFyKC0tdGctbGluaylcIiB9IDogeyAuLi5zdC5zZWNvbmRhcnlCZywgLi4uc3QudGV4dCB9KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBkZXBvc2l0QW1vdW50ID09PSBTdHJpbmcodikgPyBcIjFweCBzb2xpZCB2YXIoLS10Zy1idG4pXCIgOiBzdC5ib3JkZXJTdWIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgIFIkIHt2fVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTFcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXtzdC5oaW50fT5SJDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBpbnB1dE1vZGU9XCJkZWNpbWFsXCIgdmFsdWU9e2RlcG9zaXRBbW91bnR9IG9uQ2hhbmdlPXsoZSkgPT4gc2V0RGVwb3NpdEFtb3VudChlLnRhcmdldC52YWx1ZS5yZXBsYWNlKC9bXlxcZCwuXS9nLCBcIlwiKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIk91dHJvIHZhbG9yIChtw61uLiBSJCAxMClcIiBjbGFzc05hbWU9XCJmbGV4LTEgcm91bmRlZC14bCBwLTMgZm9jdXM6b3V0bGluZS1ub25lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IC4uLnN0LnNlY29uZGFyeUJnLCAuLi5zdC50ZXh0LCBib3JkZXI6IHN0LmJvcmRlclN1YiB9fSAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge2RlcG9zaXRBbW91bnQgJiYgcGFyc2VGbG9hdChkZXBvc2l0QW1vdW50LnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgPiAwICYmIHBhcnNlRmxvYXQoZGVwb3NpdEFtb3VudC5yZXBsYWNlKFwiLFwiLCBcIi5cIikpIDwgMTAgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHNcIiBzdHlsZT17eyBjb2xvcjogXCJ2YXIoLS10Zy1kZXN0cnVjdGl2ZSwgI2VjMzk0MilcIiB9fT5WYWxvciBtw61uaW1vOiBSJCAxMCwwMDwvcD5cbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPG1vdGlvbi5idXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlRGVwb3NpdH1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e2RlcG9zaXRMb2FkaW5nIHx8ICFkZXBvc2l0QW1vdW50IHx8IHBhcnNlRmxvYXQoKGRlcG9zaXRBbW91bnQgfHwgXCIwXCIpLnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgPCAxMH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHJvdW5kZWQtMnhsIHB5LTQgZm9udC1ib2xkIHRleHQtYmFzZSB0cmFuc2l0aW9uIGRpc2FibGVkOm9wYWNpdHktNDAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTMgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcIiM0YWRlODBcIiwgY29sb3I6IFwiIzAwMFwiIH19XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlVGFwPXt7IHNjYWxlOiAwLjk3IH19XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgYm94U2hhZG93OiBbXCIwIDAgMHB4IHJnYmEoNzQsMjIyLDEyOCwwLjMpXCIsIFwiMCAwIDIwcHggcmdiYSg3NCwyMjIsMTI4LDAuNSlcIiwgXCIwIDAgMHB4IHJnYmEoNzQsMjIyLDEyOCwwLjMpXCJdIH19XG4gICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDIsIHJlcGVhdDogSW5maW5pdHksIGVhc2U6IFwiZWFzZUluT3V0XCIgfX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IHk6IFswLCAtMiwgMF0gfX1cbiAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAxLjUsIHJlcGVhdDogSW5maW5pdHksIGVhc2U6IFwiZWFzZUluT3V0XCIgfX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIDxMYW5kbWFyayBjbGFzc05hbWU9XCJ3LTUgaC01XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICB7ZGVwb3NpdExvYWRpbmcgPyBcIkdlcmFuZG8gUElYLi4uXCIgOiBcIvCfkrAgR2VyYXIgUElYIEFnb3JhXCJ9XG4gICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgcmlnaHQtNFwiXG4gICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyB4OiBbMCwgNCwgMF0gfX1cbiAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAxLCByZXBlYXQ6IEluZmluaXR5LCBlYXNlOiBcImVhc2VJbk91dFwiIH19XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8Q2hldnJvblJpZ2h0IGNsYXNzTmFtZT1cInctNSBoLTVcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICA8L21vdGlvbi5idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHsvKiDilIDilIAgSGlzdMOzcmljbyDilIDilIAgKi99XG4gICAgICAgICAge3NlY3Rpb24gPT09IFwiaGlzdG9yaWNvXCIgJiYgKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXYga2V5PVwiaGlzdG9yaWNvXCIgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fSBleGl0PXt7IG9wYWNpdHk6IDAgfX0gY2xhc3NOYW1lPVwicC00IHNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICB7LyogUmVjZWlwdCBEZXRhaWwgVmlldyAqL31cbiAgICAgICAgICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICAgICAgICB7dmlld2luZ1JlY2VpcHQgJiYgKFxuICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIHotWzEwMF1cIlxuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDAsMCwwLDAuNilcIiB9fVxuICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fVxuICAgICAgICAgICAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFZpZXdpbmdSZWNlaXB0KG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZpeGVkIGluc2V0LXgtNCB0b3AtWzE1JV0gei1bMTAxXSByb3VuZGVkLTJ4bCBwLTUgc3BhY2UteS00IG1heC1oLVs3NXZoXSBvdmVyZmxvdy15LWF1dG9cIlxuICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IC4uLnN0LnNlY29uZGFyeUJnLCBib3JkZXI6IGAycHggc29saWQgJHt2aWV3aW5nUmVjZWlwdC5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgPyBcIiM0YWRlODBcIiA6IFwiI2ZhY2MxNVwifWAgfX1cbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjksIHk6IDMwIH19XG4gICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOSwgeTogMzAgfX1cbiAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAyNSB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgey8qIEhlYWRlciAqL31cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTQgaC0xNCByb3VuZGVkLWZ1bGwgbXgtYXV0byBtYi0yIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiB2aWV3aW5nUmVjZWlwdC5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgPyBcInJnYmEoNzQsMjIyLDEyOCwwLjE1KVwiIDogXCJyZ2JhKDI1MCwyMDQsMjEsMC4xNSlcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3ZpZXdpbmdSZWNlaXB0LnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gPENoZWNrIGNsYXNzTmFtZT1cInctNyBoLTdcIiBzdHlsZT17eyBjb2xvcjogXCIjNGFkZTgwXCIgfX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IDxDbG9jayBjbGFzc05hbWU9XCJ3LTcgaC03XCIgc3R5bGU9e3sgY29sb3I6IFwiI2ZhY2MxNVwiIH19IC8+fVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1sZ1wiIHN0eWxlPXtzdC50ZXh0fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3ZpZXdpbmdSZWNlaXB0LnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiA/IFwiUmVjYXJnYSBDb25jbHXDrWRhXCIgOiB2aWV3aW5nUmVjZWlwdC5zdGF0dXMgPT09IFwicGVuZGluZ1wiID8gXCJQcm9jZXNzYW5kby4uLlwiIDogXCJGYWxoYSBuYSBSZWNhcmdhXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgICB7LyogRGV0YWlscyAqL31cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdW5kZWQteGwgb3ZlcmZsb3ctaGlkZGVuXCIgc3R5bGU9e3sgLi4uc3QuYmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC00IHB5LTIuNSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiIHN0eWxlPXt7IGJvcmRlckJvdHRvbTogc3QuYm9yZGVyU3ViLCBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSg3NCwyMjIsMTI4LDAuMDUpXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxGaWxlVGV4dCBjbGFzc05hbWU9XCJ3LTMuNSBoLTMuNVwiIHN0eWxlPXt7IGNvbG9yOiBcIiM0YWRlODBcIiB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBmb250LWJvbGQgdHJhY2tpbmctd2lkZXIgdXBwZXJjYXNlXCIgc3R5bGU9e3sgY29sb3I6IFwiIzRhZGU4MFwiIH19PkNvbXByb3ZhbnRlPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICB7W1xuICAgICAgICAgICAgICAgICAgICAgICAgICB7IGljb246IFBob25lLCBsYWJlbDogXCJUZWxlZm9uZVwiLCB2YWx1ZTogZm9ybWF0UGhvbmUodmlld2luZ1JlY2VpcHQudGVsZWZvbmUpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgaWNvbjogWmFwLCBsYWJlbDogXCJPcGVyYWRvcmFcIiwgdmFsdWU6IHZpZXdpbmdSZWNlaXB0Lm9wZXJhZG9yYSB8fCBcIuKAlFwiIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgaWNvbjogV2FsbGV0LCBsYWJlbDogXCJWYWxvclwiLCB2YWx1ZTogZm9ybWF0Q3VycmVuY3kodmlld2luZ1JlY2VpcHQudmFsb3IpLCBoaWdobGlnaHQ6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyBpY29uOiBIYXNoLCBsYWJlbDogXCJJRCBkbyBQZWRpZG9cIiwgdmFsdWU6IHZpZXdpbmdSZWNlaXB0LmV4dGVybmFsX2lkIHx8IHZpZXdpbmdSZWNlaXB0LmlkLnNsaWNlKDAsIDgpIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsgaWNvbjogQ2xvY2ssIGxhYmVsOiBcIkRhdGFcIiwgdmFsdWU6IGZvcm1hdERhdGVUaW1lQlIodmlld2luZ1JlY2VpcHQuY3JlYXRlZF9hdCkgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0ubWFwKChyb3cpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e3Jvdy5sYWJlbH0gY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHB4LTQgcHktMi41XCIgc3R5bGU9e3sgYm9yZGVyQm90dG9tOiBcIjFweCBzb2xpZCByZ2JhKDI1NSwyNTUsMjU1LDAuMDUpXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJvdy5pY29uIGNsYXNzTmFtZT1cInctMy41IGgtMy41XCIgc3R5bGU9e3sgY29sb3I6IFwidmFyKC0tdGctaGludClcIiB9fSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14c1wiIHN0eWxlPXt7IGNvbG9yOiBcInZhcigtLXRnLWhpbnQpXCIgfX0+e3Jvdy5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LXNlbWlib2xkXCIgc3R5bGU9e3sgY29sb3I6IHJvdy5oaWdobGlnaHQgPyBcIiM0YWRlODBcIiA6IFwidmFyKC0tdGctdGV4dClcIiB9fT57cm93LnZhbHVlfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICAgIHsvKiBBY3Rpb25zICovfVxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXthc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdGV4dCA9IGDinIUgQ29tcHJvdmFudGUgZGUgUmVjYXJnYVxcblxcbvCfk7EgVGVsZWZvbmU6ICR7Zm9ybWF0UGhvbmUodmlld2luZ1JlY2VpcHQudGVsZWZvbmUpfVxcbvCfk6EgT3BlcmFkb3JhOiAke3ZpZXdpbmdSZWNlaXB0Lm9wZXJhZG9yYSB8fCBcIuKAlFwifVxcbvCfkrAgVmFsb3I6ICR7Zm9ybWF0Q3VycmVuY3kodmlld2luZ1JlY2VpcHQudmFsb3IpfVxcbvCfhpQgUGVkaWRvOiAke3ZpZXdpbmdSZWNlaXB0LmV4dGVybmFsX2lkIHx8IHZpZXdpbmdSZWNlaXB0LmlkLnNsaWNlKDAsIDgpfVxcbvCflZAgRGF0YTogJHtmb3JtYXRGdWxsRGF0ZVRpbWVCUih2aWV3aW5nUmVjZWlwdC5jcmVhdGVkX2F0KX1cXG5cXG5SZWNhcmdhIHJlYWxpemFkYSBjb20gc3VjZXNzbyFgO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmF2aWdhdG9yLnNoYXJlKSBhd2FpdCBuYXZpZ2F0b3Iuc2hhcmUoeyB0aXRsZTogXCJDb21wcm92YW50ZSBkZSBSZWNhcmdhXCIsIHRleHQgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHsgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7IHRnV2ViQXBwPy5IYXB0aWNGZWVkYmFjaz8ubm90aWZpY2F0aW9uT2NjdXJyZWQoXCJzdWNjZXNzXCIpOyB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXNtIGZvbnQtc2VtaWJvbGRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwidmFyKC0tdGctYnRuKVwiLCBjb2xvcjogXCJ2YXIoLS10Zy1idG4tdGV4dClcIiB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8U2hhcmUyIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPiBFbnZpYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRWaWV3aW5nUmVjZWlwdChudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgcHktMi41IHJvdW5kZWQteGwgdGV4dC1zbSBmb250LXNlbWlib2xkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgLi4uc3QuYmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViLCBjb2xvcjogXCJ2YXIoLS10Zy10ZXh0KVwiIH19XG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIEZlY2hhclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxuXG4gICAgICAgICAgICAgIHtyZWNhcmdhcy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgcHktMTIgdGV4dC1zbVwiIHN0eWxlPXtzdC5oaW50fT5OZW5odW1hIHJlY2FyZ2EgZW5jb250cmFkYTwvcD5cbiAgICAgICAgICAgICAgKSA6ICgoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGxhc3REYXRlID0gXCJcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjYXJnYXMubWFwKChyKSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBkID0gbmV3IERhdGUoci5jcmVhdGVkX2F0KTtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGVMYWJlbCA9IGZvcm1hdERhdGVMb25nVXBwZXJCUihyLmNyZWF0ZWRfYXQpO1xuICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvd1NlcCA9IGRhdGVMYWJlbCAhPT0gbGFzdERhdGU7XG4gICAgICAgICAgICAgICAgICBsYXN0RGF0ZSA9IGRhdGVMYWJlbDtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICB7c2hvd1NlcCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1jZW50ZXIgbXktMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBweC0zIHB5LTAuNSByb3VuZGVkLWZ1bGwgZm9udC1tZWRpdW1cIiBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwicmdiYSgyNTUsMjU1LDI1NSwwLjA2KVwiLCBjb2xvcjogXCJ2YXIoLS10Zy1oaW50KVwiIH19PntkYXRlTGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7IHNldFZpZXdpbmdSZWNlaXB0KHIpOyB0Z1dlYkFwcD8uSGFwdGljRmVlZGJhY2s/LmltcGFjdE9jY3VycmVkKFwibGlnaHRcIik7IH19XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcm91bmRlZC14bCBwLTMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHRleHQtbGVmdCBhY3RpdmU6c2NhbGUtWzAuOThdIHRyYW5zaXRpb24tdHJhbnNmb3JtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IC4uLnN0LnNlY29uZGFyeUJnLCBib3JkZXI6IHN0LmJvcmRlclN1YiB9fVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTkgaC05IHJvdW5kZWQtbGcgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIiBzdHlsZT17c3QuYmd9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTbWFydHBob25lIGNsYXNzTmFtZT1cInctNCBoLTRcIiBzdHlsZT17c3QuaGludH0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtXCIgc3R5bGU9e3N0LnRleHR9PntyLm9wZXJhZG9yYSB8fCBcIuKAlFwifTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtbW9ub1wiIHN0eWxlPXtzdC5oaW50fT57Zm9ybWF0UGhvbmUoci50ZWxlZm9uZSl9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXJpZ2h0IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwiZm9udC1zZW1pYm9sZCB0ZXh0LXNtXCIgc3R5bGU9e3N0LnRleHR9Pntmb3JtYXRDdXJyZW5jeShyLnZhbG9yKX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF1cIiBzdHlsZT17eyBjb2xvcjogci5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgPyBcIiM0YWRlODBcIiA6IHIuc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwiI2ZhY2MxNVwiIDogXCJ2YXIoLS10Zy1kZXN0cnVjdGl2ZSlcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtyLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiA/IFwi4pyFIENvbmNsdcOtZGFcIiA6IHIuc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwi4o+zIFByb2Nlc3NhbmRvXCIgOiBcIuKdjCBGYWxoYVwifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxDaGV2cm9uUmlnaHQgY2xhc3NOYW1lPVwidy00IGgtNFwiIHN0eWxlPXt7IGNvbG9yOiBcInZhcigtLXRnLWhpbnQpXCIgfX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pKCl9XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17YXN5bmMgKCkgPT4geyBzZXRSZWZyZXNoaW5nUmVjYXJnYXModHJ1ZSk7IGF3YWl0IGxvYWRSZWNhcmdhcygpOyBzZXRSZWZyZXNoaW5nUmVjYXJnYXMoZmFsc2UpOyB9fSBjbGFzc05hbWU9XCJ3LWZ1bGwgdGV4dC1jZW50ZXIgdGV4dC1zbSB0cmFuc2l0aW9uIHB5LTIgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTFcIiBzdHlsZT17c3QuaGludH0+XG4gICAgICAgICAgICAgICAgPFJlZnJlc2hDdyBjbGFzc05hbWU9e2B3LTMuNSBoLTMuNSAke3JlZnJlc2hpbmdSZWNhcmdhcyA/IFwiYW5pbWF0ZS1zcGluXCIgOiBcIlwifWB9IC8+IEF0dWFsaXphclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICApfVxuXG4gICAgICAgICAgey8qIOKUgOKUgCBFeHRyYXRvIOKUgOKUgCAqL31cbiAgICAgICAgICB7c2VjdGlvbiA9PT0gXCJleHRyYXRvXCIgJiYgKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXYga2V5PVwiZXh0cmF0b1wiIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX0gZXhpdD17eyBvcGFjaXR5OiAwIH19IGNsYXNzTmFtZT1cInAtNCBzcGFjZS15LTJcIj5cbiAgICAgICAgICAgICAge3RyYW5zYWN0aW9ucy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgcHktMTIgdGV4dC1zbVwiIHN0eWxlPXtzdC5oaW50fT5OZW5odW0gZGVww7NzaXRvIGVuY29udHJhZG88L3A+XG4gICAgICAgICAgICAgICkgOiAoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBsYXN0RGF0ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9ucy5tYXAoKHQpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0LmNyZWF0ZWRfYXQpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgZGF0ZUxhYmVsID0gZm9ybWF0RGF0ZUxvbmdVcHBlckJSKHQuY3JlYXRlZF9hdCk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBzaG93U2VwID0gZGF0ZUxhYmVsICE9PSBsYXN0RGF0ZTtcbiAgICAgICAgICAgICAgICAgIGxhc3REYXRlID0gZGF0ZUxhYmVsO1xuICAgICAgICAgICAgICAgICAgY29uc3QgaXNQZW5kaW5nID0gdC5zdGF0dXMgPT09IFwicGVuZGluZ1wiO1xuICAgICAgICAgICAgICAgICAgY29uc3QgaGFzUXIgPSBpc1BlbmRpbmcgJiYgdC5tZXRhZGF0YT8ucXJfY29kZSAmJiB0Lm1ldGFkYXRhLnFyX2NvZGUgIT09IFwieWVzXCIgJiYgdC5tZXRhZGF0YS5xcl9jb2RlICE9PSBcIm5vXCI7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17dC5pZH0+XG4gICAgICAgICAgICAgICAgICAgICAge3Nob3dTZXAgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktY2VudGVyIG15LTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gcHgtMyBweS0wLjUgcm91bmRlZC1mdWxsIGZvbnQtbWVkaXVtXCIgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInJnYmEoMjU1LDI1NSwyNTUsMC4wNilcIiwgY29sb3I6IFwidmFyKC0tdGctaGludClcIiB9fT57ZGF0ZUxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHJvdW5kZWQteGwgcC0zIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiB0ZXh0LWxlZnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgLi4uc3Quc2Vjb25kYXJ5QmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChoYXNRcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFBpeERhdGEoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2F0ZXdheTogdC5tZXRhZGF0YT8uZ2F0ZXdheSB8fCBcIlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGF5bWVudF9pZDogdC5wYXltZW50X2lkIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxcl9jb2RlOiB0Lm1ldGFkYXRhLnFyX2NvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBxcl9jb2RlX2Jhc2U2NDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBheW1lbnRfbGluazogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFtb3VudDogdC5hbW91bnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IFwicGVuZGluZ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlY3Rpb24oXCJkZXBvc2l0b1wiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0Z1dlYkFwcD8uSGFwdGljRmVlZGJhY2s/LmltcGFjdE9jY3VycmVkKFwibGlnaHRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctOSBoLTkgcm91bmRlZC1sZyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCJjb2xvci1taXgoaW4gc3JnYiwgIzRhZGU4MCAxMCUsIHRyYW5zcGFyZW50KVwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMYW5kbWFyayBjbGFzc05hbWU9XCJ3LTQgaC00XCIgc3R5bGU9e3N0LmdyZWVufSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJmb250LXNlbWlib2xkIHRleHQtc21cIiBzdHlsZT17c3QudGV4dH0+RGVww7NzaXRvIFBJWDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzXCIgc3R5bGU9e3N0LmhpbnR9Pntmb3JtYXRUaW1lQlIodC5jcmVhdGVkX2F0KX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtcmlnaHQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJmb250LXNlbWlib2xkIHRleHQtc21cIiBzdHlsZT17c3QuZ3JlZW59Pit7Zm9ybWF0Q3VycmVuY3kodC5hbW91bnQpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XVwiIHN0eWxlPXt7IGNvbG9yOiAodC5zdGF0dXMgPT09IFwiYXBwcm92ZWRcIiB8fCB0LnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIikgPyBcIiM0YWRlODBcIiA6IGlzUGVuZGluZyA/IFwiI2ZhY2MxNVwiIDogXCJ2YXIoLS10Zy1kZXN0cnVjdGl2ZSlcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsodC5zdGF0dXMgPT09IFwiYXBwcm92ZWRcIiB8fCB0LnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIikgPyBcIuKchSBDb25maXJtYWRvXCIgOiBpc1BlbmRpbmcgPyBcIuKPsyBQcm9jZXNzYW5kb1wiIDogXCLinYwgRmFsaGFcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7aGFzUXIgJiYgPENoZXZyb25SaWdodCBjbGFzc05hbWU9XCJ3LTQgaC00XCIgc3R5bGU9e3sgY29sb3I6IFwidmFyKC0tdGctaGludClcIiB9fSAvPn1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH0pKCl9XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17YXN5bmMgKCkgPT4geyBzZXRSZWZyZXNoaW5nRXh0cmF0byh0cnVlKTsgYXdhaXQgbG9hZFRyYW5zYWN0aW9ucygpOyBzZXRSZWZyZXNoaW5nRXh0cmF0byhmYWxzZSk7IH19IGNsYXNzTmFtZT1cInctZnVsbCB0ZXh0LWNlbnRlciB0ZXh0LXNtIHRyYW5zaXRpb24gcHktMiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMVwiIHN0eWxlPXtzdC5oaW50fT5cbiAgICAgICAgICAgICAgICA8UmVmcmVzaEN3IGNsYXNzTmFtZT17YHctMy41IGgtMy41ICR7cmVmcmVzaGluZ0V4dHJhdG8gPyBcImFuaW1hdGUtc3BpblwiIDogXCJcIn1gfSAvPiBBdHVhbGl6YXJcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHsvKiDilIDilIAgQ29udGEg4pSA4pSAICovfVxuICAgICAgICAgIHtzZWN0aW9uID09PSBcImNvbnRhXCIgJiYgKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXYga2V5PVwiY29udGFcIiBpbml0aWFsPXt7IG9wYWNpdHk6IDAgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19IGV4aXQ9e3sgb3BhY2l0eTogMCB9fSBjbGFzc05hbWU9XCJwLTQgc3BhY2UteS00XCI+XG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMjAgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19IHRyYW5zaXRpb249e3sgZGVsYXk6IDAuMDUsIHR5cGU6IFwic3ByaW5nXCIsIGRhbXBpbmc6IDIwIH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicm91bmRlZC0yeGwgcC01IGZsZXggaXRlbXMtY2VudGVyIGdhcC00XCIgc3R5bGU9e3sgLi4uc3Quc2Vjb25kYXJ5QmcsIGJvcmRlcjogc3QuYm9yZGVyU3ViIH19PlxuICAgICAgICAgICAgICAgIHsvKiBBdmF0YXIgd2l0aCB1cGxvYWQgKi99XG4gICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInJlbGF0aXZlIGN1cnNvci1wb2ludGVyIGdyb3VwIHNocmluay0wXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctWzcycHhdIGgtWzcycHhdIHJvdW5kZWQtZnVsbCBwLVszcHhdIHJnYi1ib3JkZXIgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAge2F2YXRhclVybCA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz17YXZhdGFyVXJsfSBhbHQ9XCJBdmF0YXJcIiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIHJvdW5kZWQtZnVsbCBvYmplY3QtY292ZXJcIiAvPlxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCByb3VuZGVkLWZ1bGwgYmctb3JhbmdlLTUwMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LXdoaXRlXCI+e2luaXRpYWxzfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGJvdHRvbS0wIHJpZ2h0LTAgdy02IGgtNiByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBiYWNrZ3JvdW5kQ29sb3I6IFwidmFyKC0tdGctYnRuKVwiIH19PlxuICAgICAgICAgICAgICAgICAgICB7dXBsb2FkaW5nQXZhdGFyID8gPExvYWRlcjIgY2xhc3NOYW1lPVwidy0zLjUgaC0zLjUgdGV4dC13aGl0ZSBhbmltYXRlLXNwaW5cIiAvPiA6IDxDYW1lcmEgY2xhc3NOYW1lPVwidy0zLjUgaC0zLjUgdGV4dC13aGl0ZVwiIC8+fVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImZpbGVcIiBhY2NlcHQ9XCJpbWFnZS9qcGVnLGltYWdlL3BuZyxpbWFnZS93ZWJwLGltYWdlL2dpZlwiIG9uQ2hhbmdlPXtoYW5kbGVBdmF0YXJVcGxvYWR9IGNsYXNzTmFtZT1cImhpZGRlblwiIGRpc2FibGVkPXt1cGxvYWRpbmdBdmF0YXJ9IC8+XG4gICAgICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwiZm9udC1ib2xkXCIgc3R5bGU9e3N0LnRleHR9Pnt1c2VyTmFtZX08L3A+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtXCIgc3R5bGU9e3N0LmhpbnR9Pnt1c2VyRW1haWx9PC9wPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyBtdC0xXCIgc3R5bGU9e3N0LmhpbnR9PlRvcXVlIG5hIGZvdG8gcGFyYSBhbHRlcmFyPC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG5cbiAgICAgICAgICAgICAgey8qIFRlbGVncmFtIFZpbmN1bGFkbyAqL31cbiAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4xNSwgdHlwZTogXCJzcHJpbmdcIiwgZGFtcGluZzogMjAgfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBwLTQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgb3ZlcmZsb3ctaGlkZGVuIHJlbGF0aXZlXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyAuLi5zdC5zZWNvbmRhcnlCZywgYm9yZGVyOiBcIjFweCBzb2xpZCByZ2JhKDM0LDE5Nyw5NCwwLjMpXCIgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wIG9wYWNpdHktMTBcIlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCByZ2JhKDM0LDE5Nyw5NCwwLjMpIDAlLCB0cmFuc3BhcmVudCA2MCUpXCIgfX1cbiAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogWzAuMDUsIDAuMTUsIDAuMDVdIH19XG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAzLCByZXBlYXQ6IEluZmluaXR5LCBlYXNlOiBcImVhc2VJbk91dFwiIH19XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyByb3RhdGU6IFswLCA1LCAtNSwgMF0gfX1cbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDIsIHJlcGVhdDogSW5maW5pdHksIGVhc2U6IFwiZWFzZUluT3V0XCIsIHJlcGVhdERlbGF5OiAzIH19XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LTEwIGgtMTAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNocmluay0wXCJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmRDb2xvcjogXCJyZ2JhKDM0LDE5Nyw5NCwwLjE1KVwiIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBjbGFzc05hbWU9XCJ3LTUgaC01XCI+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptNC42NCA2LjhjLS4xNSAxLjU4LS44IDUuNDItMS4xMyA3LjE5LS4xNC43NS0uNDIgMS0uNjggMS4wMy0uNTguMDUtMS4wMi0uMzgtMS41OC0uNzUtLjg4LS41OC0xLjM4LS45NC0yLjIzLTEuNS0uOTktLjY1LS4zNS0xLjAxLjIyLTEuNTkuMTUtLjE1IDIuNzEtMi40OCAyLjc2LTIuNjkuMDEtLjAzLjAxLS4xNC0uMDctLjItLjA4LS4wNi0uMTktLjA0LS4yOC0uMDItLjEyLjAzLTIuMDIgMS4yOC01LjY5IDMuNzctLjU0LjM3LTEuMDMuNTUtMS40Ny41NC0uNDgtLjAxLTEuNC0uMjctMi4wOS0uNDktLjg0LS4yNy0xLjUxLS40Mi0xLjQ1LS44OC4wMy0uMjQuMzctLjQ5IDEuMDItLjc0IDQtMS43MyA2LjY3LTIuODggOC4wMi0zLjQ0IDMuODItMS42IDQuNjItMS44NyA1LjEzLTEuODguMTEgMCAuMzcuMDMuNTQuMTcuMTQuMTIuMTguMjguMi40Ny0uMDEuMDYuMDEuMjQgMCAuNDF6XCIgZmlsbD1cInJnYigzNCwxOTcsOTQpXCIvPlxuICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xIHJlbGF0aXZlIHotMTBcIj5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGQgdGV4dC1zbVwiIHN0eWxlPXt7IGNvbG9yOiBcInJnYigzNCwxOTcsOTQpXCIgfX0+VGVsZWdyYW0gVmluY3VsYWRvPC9wPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14c1wiIHN0eWxlPXtzdC5oaW50fT5Db250YSBjb25lY3RhZGEgY29tIHN1Y2Vzc288L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgc2NhbGU6IDAgfX1cbiAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgc2NhbGU6IDEgfX1cbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuNSwgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiAzMDAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8QW5pbWF0ZWRDaGVjayBzaXplPXsyMn0gY2xhc3NOYW1lPVwidGV4dC1zdWNjZXNzXCIgLz5cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cblxuICAgICAgICAgICAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fSB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjI1LCB0eXBlOiBcInNwcmluZ1wiLCBkYW1waW5nOiAyMCB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJvdW5kZWQtMnhsIHAtNVwiIHN0eWxlPXt7IC4uLnN0LnNlY29uZGFyeUJnLCBib3JkZXI6IHN0LmJvcmRlclN1YiB9fT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIG1iLTFcIj5cbiAgICAgICAgICAgICAgICAgIDxtb3Rpb24uc3ZnXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoPVwiMThcIiBoZWlnaHQ9XCIxOFwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZT1cImN1cnJlbnRDb2xvclwiIHN0cm9rZVdpZHRoPVwiMlwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZUxpbmVqb2luPVwicm91bmRcIlxuICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBjb2xvcjogXCJyZ2IoMzQsMTk3LDk0KVwiIH19XG4gICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgcm90YXRlWTogWzAsIDE4MCwgMzYwXSwgc2NhbGU6IFsxLCAxLjE1LCAxXSB9fVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAzLCByZXBlYXQ6IEluZmluaXR5LCBlYXNlOiBcImVhc2VJbk91dFwiIH19XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMjEgMTJWN0g1YTIgMiAwIDAgMSAwLTRoMTR2NFwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNMyA1djE0YTIgMiAwIDAgMCAyIDJoMTZ2LTVcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE4IDEyYTIgMiAwIDAgMCAwIDRoNHYtNFpcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uc3ZnPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCIgc3R5bGU9e3N0LmhpbnR9PlNhbGRvIGRlIFJldmVuZGE8L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkXCIgc3R5bGU9e3N0LmdyZWVufT57Zm9ybWF0Q3VycmVuY3koc2FsZG8pfTwvcD5cbiAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICA8bW90aW9uLmJ1dHRvbiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fSB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjM1LCB0eXBlOiBcInNwcmluZ1wiLCBkYW1waW5nOiAyMCB9fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUxvZ291dH0gY2xhc3NOYW1lPVwidy1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHJvdW5kZWQteGwgcHktMyB0ZXh0LXNtIHRyYW5zaXRpb25cIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IC4uLnN0LmRlc3RydWN0aXZlLCBib3JkZXI6IHN0LmJvcmRlclN1YiB9fT5cbiAgICAgICAgICAgICAgICA8TG9nT3V0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPiBTYWlyIGRhIGNvbnRhXG4gICAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICApfVxuXG4gICAgICAgICAgey8qIOKUgOKUgCBTdGF0dXMg4pSA4pSAICovfVxuICAgICAgICAgIHtzZWN0aW9uID09PSBcInN0YXR1c1wiICYmIChcbiAgICAgICAgICAgIDxtb3Rpb24uZGl2IGtleT1cInN0YXR1c1wiIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX0gZXhpdD17eyBvcGFjaXR5OiAwIH19IGNsYXNzTmFtZT1cInAtNCBzcGFjZS15LTNcIj5cbiAgICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwiQVBJIGRlIFJlY2FyZ2FzXCIgfSxcbiAgICAgICAgICAgICAgICB7IG5hbWU6IFwiR2F0ZXdheSBkZSBQYWdhbWVudG9cIiB9LFxuICAgICAgICAgICAgICAgIHsgbmFtZTogXCJCb3QgZG8gVGVsZWdyYW1cIiB9LFxuICAgICAgICAgICAgICBdLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpdGVtLm5hbWV9IGNsYXNzTmFtZT1cInJvdW5kZWQteGwgcC00IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiIHN0eWxlPXt7IC4uLnN0LnNlY29uZGFyeUJnLCBib3JkZXI6IHN0LmJvcmRlclN1YiB9fT5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICAgICAgPFNoaWVsZCBjbGFzc05hbWU9XCJ3LTUgaC01XCIgc3R5bGU9e3N0LmhpbnR9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1tZWRpdW1cIiBzdHlsZT17c3QudGV4dH0+e2l0ZW0ubmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTIgaC0yIHJvdW5kZWQtZnVsbCBhbmltYXRlLXB1bHNlXCIgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcIiM0YWRlODBcIiB9fSAvPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzXCIgc3R5bGU9e3N0LmdyZWVufT5PbmxpbmU8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgICB7Lyog4pSA4pSAIENoYXQg4pSA4pSAICovfVxuICAgICAgICAgIHtzZWN0aW9uID09PSBcImNoYXRcIiAmJiB1c2VySWQgJiYgaGFzQXV0aFNlc3Npb24gJiYgKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXYga2V5PVwiY2hhdFwiIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX0gZXhpdD17eyBvcGFjaXR5OiAwIH19IGNsYXNzTmFtZT1cImgtW2NhbGMoMTAwdmgtMTgwcHgpXSB0Zy1jaGF0LXRoZW1lXCI+XG4gICAgICAgICAgICAgIDxDaGF0UGFnZSBvbkJhY2s9eygpID0+IHNldFNlY3Rpb24oXCJyZWNhcmdhXCIpfSBmb3JjZU1vYmlsZSAvPlxuICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICl9XG4gICAgICAgICAge3NlY3Rpb24gPT09IFwiY2hhdFwiICYmICghdXNlcklkIHx8ICFoYXNBdXRoU2Vzc2lvbikgJiYgKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXYga2V5PVwiY2hhdC1uby1hdXRoXCIgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fSBleGl0PXt7IG9wYWNpdHk6IDAgfX0gY2xhc3NOYW1lPVwicC02IGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQtY2VudGVyXCIgc3R5bGU9e3sgbWluSGVpZ2h0OiBcIjUwdmhcIiB9fT5cbiAgICAgICAgICAgICAgPE1lc3NhZ2VDaXJjbGUgY2xhc3NOYW1lPVwidy0xNCBoLTE0IG1iLTRcIiBzdHlsZT17c3QuaGludH0gLz5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1iYXNlIGZvbnQtYm9sZCBtYi0yXCIgc3R5bGU9e3N0LnRleHR9PkZhw6dhIGxvZ2luIHBhcmEgYWNlc3NhciBvIGNoYXQ8L3A+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm91bmRlZC14bCBwLTQgbXQtMiB0ZXh0LWxlZnQgc3BhY2UteS0yXCIgc3R5bGU9e3sgYmFja2dyb3VuZDogXCJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpXCIsIGJvcmRlcjogc3QuYm9yZGVyTWFpbiB9fT5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGRcIiBzdHlsZT17c3QudGV4dH0+8J+TiyBDb21vIGFjZXNzYXI6PC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHNcIiBzdHlsZT17c3QuaGludH0+MS4gVG9xdWUgbmEgYWJhIDxzdHJvbmcgc3R5bGU9e3N0LnRleHR9PlwiQ29udGFcIjwvc3Ryb25nPiBubyBtZW51IGluZmVyaW9yPC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHNcIiBzdHlsZT17c3QuaGludH0+Mi4gU2UgasOhIGVzdGl2ZXIgbG9nYWRvLCB0b3F1ZSBlbSA8c3Ryb25nIHN0eWxlPXtzdC50ZXh0fT5cIlNhaXJcIjwvc3Ryb25nPiBlIGVudHJlIG5vdmFtZW50ZTwvcD5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzXCIgc3R5bGU9e3N0LmhpbnR9PjMuIEZhw6dhIGxvZ2luIGNvbSBzZXUgPHN0cm9uZyBzdHlsZT17c3QudGV4dH0+ZS1tYWlsIGUgc2VuaGE8L3N0cm9uZz48L3A+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14c1wiIHN0eWxlPXtzdC5oaW50fT40LiBWb2x0ZSBwYXJhIGEgYWJhIDxzdHJvbmcgc3R5bGU9e3N0LnRleHR9PlwiQ2hhdFwiPC9zdHJvbmc+PC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gbXQtM1wiIHN0eWxlPXtzdC5oaW50fT7imqDvuI8gQ2VydGlmaXF1ZS1zZSBkZSBsZW1icmFyIHNldSBlLW1haWwgZSBzZW5oYSBjYWRhc3RyYWRvcyBubyBzaXN0ZW1hPC9wPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2VjdGlvbihcImNvbnRhXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm10LTQgcHgtNSBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmQ6IChzdC5idG4gYXMgYW55KT8uYmFja2dyb3VuZENvbG9yIHx8IFwidmFyKC0tdGctYnRuLCAjMjQ4MWNjKVwiLCBjb2xvcjogKHN0LmJ0blRleHQgYXMgYW55KT8uY29sb3IgfHwgXCIjZmZmXCIgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIElyIHBhcmEgQ29udGFcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG4gICAgICA8L2Rpdj5cblxuICAgICAgey8qIFNlYXNvbmFsIEVmZmVjdHMgZm9yIE1pbmkgQXBwIChvd24gcGFydGljbGVzICsgYmFubmVycyB3aXRoIHNtb290aCB0cmFuc2l0aW9ucykgKi99XG4gICAgICB7KGlzU2Vhc29uYWxBY3RpdmUgfHwgdHJhbnNpdGlvbmluZykgJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIHsvKiBUb3Agc2Vhc29uYWwgYmFubmVyIOKAlCBzbW9vdGggZW50cnkvZXhpdCAqL31cbiAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlIG1vZGU9XCJ3YWl0XCI+XG4gICAgICAgICAgICB7IXRyYW5zaXRpb25pbmcgJiYgaXNTZWFzb25hbEFjdGl2ZSAmJiAoXG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAga2V5PXtgbWluaWFwcC1iYW5uZXItJHtzZWFzb25hbFRoZW1lLmtleX1gfVxuICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgaGVpZ2h0OiAwLCBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBoZWlnaHQ6IFwiYXV0b1wiLCBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICAgICAgZXhpdD17eyBoZWlnaHQ6IDAsIG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjgsIGVhc2U6IFswLjI1LCAwLjEsIDAuMjUsIDFdIH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZml4ZWQgdG9wLTAgbGVmdC0wIHJpZ2h0LTAgei00MCBiZy1ncmFkaWVudC10by1yICR7c2Vhc29uYWxUaGVtZS5hY2NlbnRHcmFkaWVudH0gb3ZlcmZsb3ctaGlkZGVuYH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IHk6IC0yMCwgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyB5OiAwLCBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICAgICAgICBleGl0PXt7IHk6IC0yMCwgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC41LCBkZWxheTogMC4zIH19XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBweS0xLjUgcHgtNFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbVwiPntzZWFzb25hbFRoZW1lLmVtb2ppfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ib2xkIHRleHQtd2hpdGUgZHJvcC1zaGFkb3ctc20gdHJhY2tpbmctd2lkZVwiPntzZWFzb25hbFRoZW1lLmxhYmVsLnRvVXBwZXJDYXNlKCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbVwiPntzZWFzb25hbFRoZW1lLmVtb2ppfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG5cbiAgICAgICAgICB7LyogRmxvYXRpbmcgcGFydGljbGVzIOKAlCBmYWRlIG91dCBncmFjZWZ1bGx5IHdoZW4gdHJhbnNpdGlvbmluZyAqL31cbiAgICAgICAgICB7c2Vhc29uYWxUaGVtZS5wYXJ0aWNsZXMuc2xpY2UoMCwgOCkubWFwKChlbW9qaSwgaSkgPT4gKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAga2V5PXtgbWluaWFwcC1wLSR7c2Vhc29uYWxUaGVtZS5rZXl9LSR7aX1gfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmaXhlZCBwb2ludGVyLWV2ZW50cy1ub25lIHNlbGVjdC1ub25lIHotWzk5OTldXCJcbiAgICAgICAgICAgICAgaW5pdGlhbD17eyB0b3A6IC00MCwgbGVmdDogYCR7KGkgKiAxMiArIE1hdGgucmFuZG9tKCkgKiA4KSAlIDk1fSVgLCBvcGFjaXR5OiAwLCBzY2FsZTogMC41LCByb3RhdGU6IDAgfX1cbiAgICAgICAgICAgICAgYW5pbWF0ZT17dHJhbnNpdGlvbmluZ1xuICAgICAgICAgICAgICAgID8geyBvcGFjaXR5OiAwLCBzY2FsZTogMCwgcm90YXRlOiA3MjAsIHRyYW5zaXRpb246IHsgZHVyYXRpb246IDEuNSwgZWFzZTogXCJlYXNlSW5PdXRcIiB9IH1cbiAgICAgICAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBcIjExMHZoXCIsXG4gICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IFswLCAwLjgsIDAuOCwgMC40LCAwXSxcbiAgICAgICAgICAgICAgICAgICAgc2NhbGU6IFswLjUsIDEsIDAuOF0sXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0ZTogWzAsIDE4MCwgMzYwXSxcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt0cmFuc2l0aW9uaW5nID8gdW5kZWZpbmVkIDogeyBkdXJhdGlvbjogOCArIE1hdGgucmFuZG9tKCkgKiA1LCBkZWxheTogaSAqIDEuMiwgcmVwZWF0OiBJbmZpbml0eSwgZWFzZTogXCJsaW5lYXJcIiB9fVxuICAgICAgICAgICAgICBzdHlsZT17eyBmb250U2l6ZTogMTQgKyBNYXRoLnJhbmRvbSgpICogOCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7ZW1vaml9XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKSl9XG5cbiAgICAgICAgICB7LyogQW1iaWVudCBnbG93IOKAlCBzbW9vdGggZmFkZSAqL31cbiAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICAgICAgeyF0cmFuc2l0aW9uaW5nICYmIHNlYXNvbmFsVGhlbWUuZ2xvd0NvbG9yICYmIChcbiAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICBrZXk9e2BtaW5pYXBwLWdsb3ctJHtzZWFzb25hbFRoZW1lLmtleX1gfVxuICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fVxuICAgICAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDEuNSwgZWFzZTogXCJlYXNlSW5PdXRcIiB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZpeGVkIGluc2V0LTAgcG9pbnRlci1ldmVudHMtbm9uZSB6LVs5OTk4XVwiXG4gICAgICAgICAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6IGByYWRpYWwtZ3JhZGllbnQoZWxsaXBzZSBhdCA1MCUgMCUsICR7c2Vhc29uYWxUaGVtZS5nbG93Q29sb3J9IDAlLCB0cmFuc3BhcmVudCA2MCUpYCxcbiAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cblxuICAgICAgICAgIHsvKiBCb3R0b20gc2Vhc29uYWwgc3RyaXAgYWJvdmUgbmF2IOKAlCBzbW9vdGggZW50cnkvZXhpdCAqL31cbiAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlIG1vZGU9XCJ3YWl0XCI+XG4gICAgICAgICAgICB7IXRyYW5zaXRpb25pbmcgJiYgaXNTZWFzb25hbEFjdGl2ZSAmJiAoXG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAga2V5PXtgbWluaWFwcC1zdHJpcC0ke3NlYXNvbmFsVGhlbWUua2V5fWB9XG4gICAgICAgICAgICAgICAgaW5pdGlhbD17eyBoZWlnaHQ6IDAsIG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgICAgICBhbmltYXRlPXt7IGhlaWdodDogXCJhdXRvXCIsIG9wYWNpdHk6IDEgfX1cbiAgICAgICAgICAgICAgICBleGl0PXt7IGhlaWdodDogMCwgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDAuNiwgZWFzZTogWzAuMjUsIDAuMSwgMC4yNSwgMV0gfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BmaXhlZCBib3R0b20tWzYwcHhdIGxlZnQtMCByaWdodC0wIHotMjAgYmctZ3JhZGllbnQtdG8tciAke3NlYXNvbmFsVGhlbWUuYWNjZW50R3JhZGllbnR9IG92ZXJmbG93LWhpZGRlbmB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHB5LTEgcHgtNFwiPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14c1wiPntzZWFzb25hbFRoZW1lLmVtb2ppfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtYm9sZCB0ZXh0LXdoaXRlIGRyb3Atc2hhZG93LXNtIHRyYWNraW5nLXdpZGVcIj57c2Vhc29uYWxUaGVtZS5sYWJlbC50b1VwcGVyQ2FzZSgpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHNcIj57c2Vhc29uYWxUaGVtZS5lbW9qaX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG4gICAgICAgIDwvPlxuICAgICAgKX1cblxuICAgICAgey8qIEJvdHRvbSBUYWIgQmFyICovfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBib3R0b20tMCBsZWZ0LTAgcmlnaHQtMCBiYWNrZHJvcC1ibHVyLXhsIHotMzAgc2FmZS1hcmVhLWJvdHRvbVwiXG4gICAgICAgIHN0eWxlPXt7IC4uLnN0LmJvdHRvbUJhciwgYm9yZGVyVG9wOiBzdC5ib3JkZXJNYWluIH19PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1hcm91bmQgaXRlbXMtY2VudGVyIHB4LTIgcHktMi41XCI+XG4gICAgICAgICAgeyhbXG4gICAgICAgICAgICB7IGlkOiBcInJlY2FyZ2FcIiBhcyBTZWN0aW9uLCBpY29uOiBTbWFydHBob25lLCBsYWJlbDogc2Vhc29uYWxFbW9qaXMucmVjYXJnYSA/IGAke3NlYXNvbmFsRW1vamlzLnJlY2FyZ2F9YCA6IFwiUmVjYXJnYVwiLCBkZWZhdWx0TGFiZWw6IFwiUmVjYXJnYVwiIH0sXG4gICAgICAgICAgICB7IGlkOiBcImRlcG9zaXRvXCIgYXMgU2VjdGlvbiwgaWNvbjogUGx1cywgbGFiZWw6IHNlYXNvbmFsRW1vamlzLmRlcG9zaXRvID8gYCR7c2Vhc29uYWxFbW9qaXMuZGVwb3NpdG99YCA6IFwiU2FsZG9cIiwgZGVmYXVsdExhYmVsOiBcIlNhbGRvXCIgfSxcbiAgICAgICAgICAgIHsgaWQ6IFwiY2hhdFwiIGFzIFNlY3Rpb24sIGljb246IE1lc3NhZ2VDaXJjbGUsIGxhYmVsOiBzZWFzb25hbEVtb2ppcy5jaGF0ID8gYCR7c2Vhc29uYWxFbW9qaXMuY2hhdH1gIDogXCJDaGF0XCIsIGRlZmF1bHRMYWJlbDogXCJDaGF0XCIgfSxcbiAgICAgICAgICAgIHsgaWQ6IFwiaGlzdG9yaWNvXCIgYXMgU2VjdGlvbiwgaWNvbjogQ2xvY2ssIGxhYmVsOiBzZWFzb25hbEVtb2ppcy5oaXN0b3JpY28gPyBgJHtzZWFzb25hbEVtb2ppcy5oaXN0b3JpY299YCA6IFwiUGVkaWRvc1wiLCBkZWZhdWx0TGFiZWw6IFwiUGVkaWRvc1wiIH0sXG4gICAgICAgICAgICB7IGlkOiBcImNvbnRhXCIgYXMgU2VjdGlvbiwgaWNvbjogVXNlciwgbGFiZWw6IHNlYXNvbmFsRW1vamlzLmNvbnRhID8gYCR7c2Vhc29uYWxFbW9qaXMuY29udGF9YCA6IFwiQ29udGFcIiwgZGVmYXVsdExhYmVsOiBcIkNvbnRhXCIgfSxcbiAgICAgICAgICBdKS5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzQWN0aXZlID0gc2VjdGlvbiA9PT0gaXRlbS5pZDtcbiAgICAgICAgICAgIC8vIFVuaXF1ZSBhbmltYXRpb24gcGVyIGljb25cbiAgICAgICAgICAgIGNvbnN0IGljb25BbmltYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge1xuICAgICAgICAgICAgICByZWNhcmdhOiB7IHJvdGF0ZTogWzAsIC0xNSwgMTUsIC0xMCwgMF0sIHNjYWxlOiBbMSwgMS4xNSwgMV0sIHRyYW5zaXRpb246IHsgZHVyYXRpb246IDAuNSwgZWFzZTogXCJlYXNlSW5PdXRcIiB9IH0sXG4gICAgICAgICAgICAgIGRlcG9zaXRvOiB7IHNjYWxlOiBbMSwgMS4zLCAxXSwgcm90YXRlOiBbMCwgOTAsIDE4MCwgMjcwLCAzNjBdLCB0cmFuc2l0aW9uOiB7IGR1cmF0aW9uOiAwLjYsIGVhc2U6IFwiZWFzZUluT3V0XCIgfSB9LFxuICAgICAgICAgICAgICBjaGF0OiB7IHNjYWxlOiBbMSwgMS4yLCAxXSwgeTogWzAsIC00LCAwXSwgdHJhbnNpdGlvbjogeyBkdXJhdGlvbjogMC40LCBlYXNlOiBcImVhc2VPdXRcIiB9IH0sXG4gICAgICAgICAgICAgIGhpc3RvcmljbzogeyByb3RhdGU6IFswLCAzNjBdLCB0cmFuc2l0aW9uOiB7IGR1cmF0aW9uOiAwLjgsIGVhc2U6IFwiZWFzZUluT3V0XCIgfSB9LFxuICAgICAgICAgICAgICBleHRyYXRvOiB7IHk6IFswLCAtNiwgMF0sIHNjYWxlOiBbMSwgMS4xLCAxXSwgdHJhbnNpdGlvbjogeyBkdXJhdGlvbjogMC40LCBlYXNlOiBcImVhc2VPdXRcIiB9IH0sXG4gICAgICAgICAgICAgIGNvbnRhOiB7IHNjYWxlOiBbMSwgMS4yLCAwLjksIDEuMSwgMV0sIHRyYW5zaXRpb246IHsgZHVyYXRpb246IDAuNSwgdHlwZTogXCJzcHJpbmdcIiB9IH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgY29udGludW91c0FuaW1hdGlvbnM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7XG4gICAgICAgICAgICAgIHJlY2FyZ2E6IHsgeTogWzAsIC0zLCAwXSwgdHJhbnNpdGlvbjogeyByZXBlYXQ6IEluZmluaXR5LCBkdXJhdGlvbjogMS44LCBlYXNlOiBcImVhc2VJbk91dFwiIH0gfSxcbiAgICAgICAgICAgICAgZGVwb3NpdG86IHsgcm90YXRlOiBbMCwgOCwgLTgsIDBdLCB0cmFuc2l0aW9uOiB7IHJlcGVhdDogSW5maW5pdHksIGR1cmF0aW9uOiAyLjUsIGVhc2U6IFwiZWFzZUluT3V0XCIgfSB9LFxuICAgICAgICAgICAgICBjaGF0OiB7IHk6IFswLCAtMiwgMF0sIHNjYWxlOiBbMSwgMS4wNSwgMV0sIHRyYW5zaXRpb246IHsgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDIsIGVhc2U6IFwiZWFzZUluT3V0XCIgfSB9LFxuICAgICAgICAgICAgICBoaXN0b3JpY286IHsgcm90YXRlOiBbMCwgMzYwXSwgdHJhbnNpdGlvbjogeyByZXBlYXQ6IEluZmluaXR5LCBkdXJhdGlvbjogNCwgZWFzZTogXCJsaW5lYXJcIiB9IH0sXG4gICAgICAgICAgICAgIGV4dHJhdG86IHsgeTogWzAsIC0yLCAwLCAyLCAwXSwgdHJhbnNpdGlvbjogeyByZXBlYXQ6IEluZmluaXR5LCBkdXJhdGlvbjogMi4yLCBlYXNlOiBcImVhc2VJbk91dFwiIH0gfSxcbiAgICAgICAgICAgICAgY29udGE6IHsgc2NhbGU6IFsxLCAxLjA4LCAxXSwgdHJhbnNpdGlvbjogeyByZXBlYXQ6IEluZmluaXR5LCBkdXJhdGlvbjogMiwgZWFzZTogXCJlYXNlSW5PdXRcIiB9IH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgaWNvbkFuaW1hdGlvbiA9IGlzQWN0aXZlID8gKGljb25BbmltYXRpb25zW2l0ZW0uaWRdIHx8IHt9KSA6IHt9O1xuICAgICAgICAgICAgY29uc3QgY29udGludW91c0FuaW0gPSBjb250aW51b3VzQW5pbWF0aW9uc1tpdGVtLmlkXSB8fCB7fTtcblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPGJ1dHRvbiBrZXk9e2l0ZW0uaWR9IG9uQ2xpY2s9eygpID0+IHsgc2V0U2VjdGlvbihpdGVtLmlkKTsgdGdXZWJBcHA/LkhhcHRpY0ZlZWRiYWNrPy5pbXBhY3RPY2N1cnJlZChcImxpZ2h0XCIpOyB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGdhcC0xIHB4LTMgcHktMiByb3VuZGVkLXhsIHRyYW5zaXRpb24gbWluLXctWzYwcHhdXCJcbiAgICAgICAgICAgICAgICBzdHlsZT17eyBjb2xvcjogaXNBY3RpdmUgPyBcInZhcigtLXRnLWFjY2VudClcIiA6IFwidmFyKC0tdGctaGludClcIiB9fT5cbiAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyAuLi5pY29uQW5pbWF0aW9uLCAuLi5jb250aW51b3VzQW5pbSB9IGFzIGFueX1cbiAgICAgICAgICAgICAgICAgIHdoaWxlVGFwPXt7IHNjYWxlOiAwLjggfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8aXRlbS5pY29uIGNsYXNzTmFtZT1cInctNiBoLTZcIiAvPlxuICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSBmb250LW1lZGl1bSBsZWFkaW5nLXRpZ2h0XCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIHtpc0FjdGl2ZSAmJiAoXG4gICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICBsYXlvdXRJZD1cInRhYi1pbmRpY2F0b3JcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LTEuNSBoLTEuNSByb3VuZGVkLWZ1bGwgbXQtMC41XCJcbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZENvbG9yOiBcInZhcigtLXRnLWFjY2VudClcIiB9fVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogNTAwLCBkYW1waW5nOiAzMCB9fVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJ1c2VDYWxsYmFjayIsIkFuaW1hdGVkQ2hlY2siLCJzdXBhYmFzZSIsImNyZWF0ZVBpeERlcG9zaXQiLCJtb3Rpb24iLCJBbmltYXRlUHJlc2VuY2UiLCJyZWNhcmdhc0xvZ28iLCJRUkNvZGVTVkciLCJTbWFydHBob25lIiwiUGx1cyIsIkNsb2NrIiwiTGFuZG1hcmsiLCJVc2VyIiwiQ2hldnJvblJpZ2h0IiwiUmVmcmVzaEN3IiwiQ29weSIsIkNoZWNrIiwiQXJyb3dMZWZ0IiwiU2hpZWxkIiwiTG9nT3V0IiwiQ2FtZXJhIiwiTG9hZGVyMiIsIlNoYXJlMiIsIkZpbGVUZXh0IiwiSGFzaCIsIldhbGxldCIsIlBob25lIiwiWmFwIiwiQWxlcnRUcmlhbmdsZSIsIkNoZWNrQ2lyY2xlMiIsIlhDaXJjbGUiLCJNZXNzYWdlQ2lyY2xlIiwiQ2hhdFBhZ2UiLCJ1c2VTZWFzb25hbFRoZW1lIiwiZm9ybWF0RnVsbERhdGVUaW1lQlIiLCJmb3JtYXREYXRlVGltZUJSIiwiZm9ybWF0RGF0ZUxvbmdVcHBlckJSIiwiZm9ybWF0VGltZUJSIiwiVEdfREFSS19ERUZBVUxUUyIsImJnX2NvbG9yIiwidGV4dF9jb2xvciIsImhpbnRfY29sb3IiLCJsaW5rX2NvbG9yIiwiYnV0dG9uX2NvbG9yIiwiYnV0dG9uX3RleHRfY29sb3IiLCJzZWNvbmRhcnlfYmdfY29sb3IiLCJzZWN0aW9uX2JnX2NvbG9yIiwiYWNjZW50X3RleHRfY29sb3IiLCJkZXN0cnVjdGl2ZV90ZXh0X2NvbG9yIiwiaGVhZGVyX2JnX2NvbG9yIiwic3VidGl0bGVfdGV4dF9jb2xvciIsInNlY3Rpb25faGVhZGVyX3RleHRfY29sb3IiLCJib3R0b21fYmFyX2JnX2NvbG9yIiwidXNlVGVsZWdyYW1UaGVtZSIsInRnIiwid2luZG93IiwiVGVsZWdyYW0iLCJXZWJBcHAiLCJ0cCIsInRoZW1lUGFyYW1zIiwicm9vdCIsImRvY3VtZW50IiwiZG9jdW1lbnRFbGVtZW50IiwidGhlbWUiLCJzdHlsZSIsInNldFByb3BlcnR5IiwiVGVsZWdyYW1NaW5pQXBwIiwicmVhZHkiLCJleHBhbmQiLCJzZXRUaW1lb3V0IiwiZGlzYWJsZVZlcnRpY2FsU3dpcGVzIiwicmVxdWVzdEZ1bGxzY3JlZW4iLCJpc0V4cGFuZGVkIiwic2V0SGVhZGVyQ29sb3IiLCJzZXRCYWNrZ3JvdW5kQ29sb3IiLCJoZWlnaHQiLCJib2R5Iiwib3ZlcmZsb3ciLCJ2aWV3cG9ydE1ldGEiLCJxdWVyeVNlbGVjdG9yIiwiY3JlYXRlRWxlbWVudCIsIm5hbWUiLCJoZWFkIiwiYXBwZW5kQ2hpbGQiLCJvcmlnaW5hbFZpZXdwb3J0IiwiY29udGVudCIsInByZXZlbnRab29tIiwiZSIsInRvdWNoZXMiLCJsZW5ndGgiLCJwcmV2ZW50RGVmYXVsdCIsImFkZEV2ZW50TGlzdGVuZXIiLCJwYXNzaXZlIiwicHJldmVudEdlc3R1cmUiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiYWN0aXZlVGhlbWUiLCJzZWFzb25hbFRoZW1lIiwiZW1vamlzIiwic2Vhc29uYWxFbW9qaXMiLCJpc0FjdGl2ZSIsImlzU2Vhc29uYWxBY3RpdmUiLCJ0cmFuc2l0aW9uaW5nIiwic2VjdGlvbiIsInNldFNlY3Rpb24iLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsInVzZXJJZCIsInNldFVzZXJJZCIsInVzZXJOYW1lIiwic2V0VXNlck5hbWUiLCJ1c2VyRW1haWwiLCJzZXRVc2VyRW1haWwiLCJzYWxkbyIsInNldFNhbGRvIiwiaGFzQXV0aFNlc3Npb24iLCJzZXRIYXNBdXRoU2Vzc2lvbiIsImxvZ2luRW1haWwiLCJzZXRMb2dpbkVtYWlsIiwibG9naW5QYXNzd29yZCIsInNldExvZ2luUGFzc3dvcmQiLCJsb2dpbkxvYWRpbmciLCJzZXRMb2dpbkxvYWRpbmciLCJsb2dpbkVycm9yIiwic2V0TG9naW5FcnJvciIsIm9wZXJhZG9yYXMiLCJzZXRPcGVyYWRvcmFzIiwic2VsZWN0ZWRPcCIsInNldFNlbGVjdGVkT3AiLCJzZWxlY3RlZFZhbG9yIiwic2V0U2VsZWN0ZWRWYWxvciIsInBob25lIiwic2V0UGhvbmUiLCJjbGlwYm9hcmRQaG9uZSIsInNldENsaXBib2FyZFBob25lIiwicmVjYXJnYVN0ZXAiLCJzZXRSZWNhcmdhU3RlcCIsInJlY2FyZ2FMb2FkaW5nIiwic2V0UmVjYXJnYUxvYWRpbmciLCJyZWNhcmdhUmVzdWx0Iiwic2V0UmVjYXJnYVJlc3VsdCIsInBob25lQ2hlY2tSZXN1bHQiLCJzZXRQaG9uZUNoZWNrUmVzdWx0IiwiY2hlY2tpbmdQaG9uZSIsInNldENoZWNraW5nUGhvbmUiLCJyZWNhcmdhcyIsInNldFJlY2FyZ2FzIiwidHJhbnNhY3Rpb25zIiwic2V0VHJhbnNhY3Rpb25zIiwidmlld2luZ1JlY2VpcHQiLCJzZXRWaWV3aW5nUmVjZWlwdCIsImRlcG9zaXRBbW91bnQiLCJzZXREZXBvc2l0QW1vdW50IiwiZGVwb3NpdExvYWRpbmciLCJzZXREZXBvc2l0TG9hZGluZyIsInBpeERhdGEiLCJzZXRQaXhEYXRhIiwiY29waWVkIiwic2V0Q29waWVkIiwiYXZhdGFyVXJsIiwic2V0QXZhdGFyVXJsIiwidXBsb2FkaW5nQXZhdGFyIiwic2V0VXBsb2FkaW5nQXZhdGFyIiwicmVmcmVzaGluZ0V4dHJhdG8iLCJzZXRSZWZyZXNoaW5nRXh0cmF0byIsInJlZnJlc2hpbmdSZWNhcmdhcyIsInNldFJlZnJlc2hpbmdSZWNhcmdhcyIsInRvYXN0cyIsInNldFRvYXN0cyIsInNob3dUb2FzdCIsIm1lc3NhZ2UiLCJ0eXBlIiwiaWQiLCJEYXRlIiwibm93IiwicHJldiIsImZpbHRlciIsInQiLCJ0Z1dlYkFwcCIsImdldFRlbGVncmFtVXNlciIsImxpdmVUZyIsImRpcmVjdFVzZXIiLCJpbml0RGF0YVVuc2FmZSIsInVzZXIiLCJ1cmxQYXJhbXMiLCJVUkxTZWFyY2hQYXJhbXMiLCJsb2NhdGlvbiIsInNlYXJjaCIsInJhdyIsImdldCIsImluaXREYXRhUGFyYW1zIiwidXNlclJhdyIsInBhcnNlZFVzZXIiLCJKU09OIiwicGFyc2UiLCJzYXZlU2Vzc2lvbiIsImRhdGEiLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwic3RyaW5naWZ5IiwiY2xlYXJTZXNzaW9uIiwicmVtb3ZlSXRlbSIsImxvYWRTYXZlZFNlc3Npb24iLCJnZXRJdGVtIiwiYXBwbHlTZXNzaW9uIiwiY2FuY2VsbGVkIiwiaW5pdCIsImV4aXN0aW5nU2Vzc2lvblVzZXJJZCIsInNlc3Npb24iLCJhdXRoIiwiZ2V0U2Vzc2lvbiIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsInRnVXNlciIsImkiLCJ1IiwiUHJvbWlzZSIsInIiLCJmdW5jdGlvbnMiLCJpbnZva2UiLCJhY3Rpb24iLCJ0ZWxlZ3JhbV9pZCIsImZvdW5kIiwic2VzcyIsInVzZXJfaWQiLCJub21lIiwiTnVtYmVyIiwiYXZhdGFyX3VybCIsInNEYXRhIiwic2F2ZWQiLCJ0aGVuIiwidW5kZWZpbmVkIiwiY2F0Y2giLCJyZWZyZXNoU2FsZG8iLCJuZXdTYWxkbyIsImxvYWRPcGVyYWRvcmFzIiwibG9hZFJlY2FyZ2FzIiwibG9hZFRyYW5zYWN0aW9ucyIsImZyb20iLCJzZWxlY3QiLCJlcSIsIm9yZGVyIiwiYXNjZW5kaW5nIiwibGltaXQiLCJsb2FkQXZhdGFyIiwiaGFuZGxlQXZhdGFyVXBsb2FkIiwiZmlsZSIsInRhcmdldCIsImZpbGVzIiwic2l6ZSIsImFsZXJ0IiwiZXh0Iiwic3BsaXQiLCJwb3AiLCJwYXRoIiwiZXhpc3RpbmdGaWxlcyIsInN0b3JhZ2UiLCJsaXN0IiwicmVtb3ZlIiwibWFwIiwiZiIsInVwRXJyIiwidXBsb2FkIiwidXBzZXJ0IiwidXJsRGF0YSIsImdldFB1YmxpY1VybCIsInB1YmxpY1VybCIsInVwZGF0ZSIsIkhhcHRpY0ZlZWRiYWNrIiwibm90aWZpY2F0aW9uT2NjdXJyZWQiLCJjaGFubmVsIiwib24iLCJldmVudCIsInNjaGVtYSIsInRhYmxlIiwicGF5bG9hZCIsInJvdyIsIm5ldyIsInRpcG8iLCJ2YWxvciIsImltcGFjdE9jY3VycmVkIiwidXBkYXRlZCIsInN0YXR1cyIsInRlbGVmb25lIiwidGVsIiwicmVwbGFjZSIsImZvcm1hdHRlZCIsInNsaWNlIiwic3Vic2NyaWJlIiwicmVtb3ZlQ2hhbm5lbCIsImFjdGl2ZSIsImNoZWNrUGVuZGluZyIsInBlbmRpbmciLCJleHRlcm5hbF9pZCIsInN1Y2Nlc3MiLCJsb2NhbFN0YXR1cyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwiZm9ybWF0Q3VycmVuY3kiLCJ2IiwidG9Mb2NhbGVTdHJpbmciLCJtaW5pbXVtRnJhY3Rpb25EaWdpdHMiLCJmb3JtYXRQaG9uZSIsImQiLCJoYW5kbGVSZWNhcmdhQ29uZmlybSIsInJlc3VsdCIsImNhcnJpZXJJZCIsInBob25lTnVtYmVyIiwidmFsdWVJZCIsIkVycm9yIiwib3JkZXJEYXRhIiwiaG9yYSIsInJlY2VpcHRWYWx1ZSIsInZhbHVlIiwibGFiZWwiLCJTdHJpbmciLCJudW1zIiwibWF0Y2giLCJjb3N0IiwicGFyc2VkIiwiaXNGaW5pdGUiLCJkZXRhaWxzIiwib3BlcmFkb3JhIiwibm92b1NhbGRvIiwibG9jYWxCYWxhbmNlIiwicGVkaWRvSWQiLCJfaWQiLCJvcmRlcklkIiwicmVzZXRSZWNhcmdhIiwiZm9ybWF0Q29vbGRvd25Nc2ciLCJtc2ciLCJpc29NYXRjaCIsInRvTG93ZXJDYXNlIiwiaW5jbHVkZXMiLCJoYW5kbGVDaGVja1Bob25lIiwibm9ybWFsaXplZFBob25lIiwiY0lkIiwicmVzcCIsImhhbmRsZURlcG9zaXQiLCJhbW91bnQiLCJwYXJzZUZsb2F0IiwiaXNOYU4iLCJjb3B5UGl4IiwicXJfY29kZSIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsIndyaXRlVGV4dCIsImhhbmRsZUxvZ2luIiwiYXV0aERhdGEiLCJhdXRoRXJyb3IiLCJzaWduSW5XaXRoUGFzc3dvcmQiLCJlbWFpbCIsInRyaW0iLCJwYXNzd29yZCIsImhhbmRsZUxvZ291dCIsInNpZ25PdXQiLCJkZXRlY3RDbGlwYm9hcmQiLCJyZWFkVGV4dCIsInRleHQiLCJkaWdpdHMiLCJzdGFydHNXaXRoIiwic2VjdGlvblRpdGxlIiwicmVjYXJnYSIsImRlcG9zaXRvIiwiaGlzdG9yaWNvIiwiZXh0cmF0byIsImNvbnRhIiwiY2hhdCIsImluaXRpYWxzIiwidG9VcHBlckNhc2UiLCJzdCIsImJnIiwiYmFja2dyb3VuZENvbG9yIiwic2Vjb25kYXJ5QmciLCJoZWFkZXJCZyIsImJvdHRvbUJhciIsImNvbG9yIiwiaGludCIsImxpbmsiLCJhY2NlbnQiLCJidG4iLCJidG5UZXh0IiwiZGVzdHJ1Y3RpdmUiLCJncmVlbiIsImJvcmRlclN1YiIsImJvcmRlck1haW4iLCJkaXYiLCJjbGFzc05hbWUiLCJiYWNrZ3JvdW5kIiwib3BhY2l0eSIsImluaXRpYWwiLCJzY2FsZSIsImFuaW1hdGUiLCJ0cmFuc2l0aW9uIiwiZHVyYXRpb24iLCJlYXNlIiwiYm9yZGVyIiwiYm94U2hhZG93IiwiaW1nIiwic3JjIiwiYWx0IiwiZGVsYXkiLCJyZXBlYXQiLCJJbmZpbml0eSIsInAiLCJ5IiwiaDEiLCJpbnB1dCIsInBsYWNlaG9sZGVyIiwib25DaGFuZ2UiLCJvbktleURvd24iLCJrZXkiLCJidXR0b24iLCJvbkNsaWNrIiwiZGlzYWJsZWQiLCJ0b2FzdCIsImV4aXQiLCJzdGlmZm5lc3MiLCJkYW1waW5nIiwiYm9yZGVyQm90dG9tIiwiV2Via2l0T3ZlcmZsb3dTY3JvbGxpbmciLCJ0b3VjaEFjdGlvbiIsIm1vZGUiLCJzcGFuIiwiYm9yZGVyQ29sb3IiLCJpY29uIiwiaGlnaGxpZ2h0IiwieCIsInNoYXJlIiwidGl0bGUiLCJzdGF0dXNNYXAiLCJjb21wbGV0ZWQiLCJmYWxoYSIsImZlaXRhIiwic3RlcCIsImluZGV4T2YiLCJyb3RhdGUiLCJoMiIsIm9uUGFzdGUiLCJwYXN0ZWQiLCJjbGlwYm9hcmREYXRhIiwiZ2V0RGF0YSIsIm9wIiwidmFsb3JlcyIsInNvcnQiLCJhIiwiYiIsInVzZXJDb3N0IiwiZmFjZVZhbHVlIiwiZGlzcGxheUNvc3QiLCJkaXNjb3VudCIsIk1hdGgiLCJyb3VuZCIsInRvRml4ZWQiLCJib3JkZXJUb3AiLCJoMyIsIndoaWxlVGFwIiwiaW5wdXRNb2RlIiwiY3JlYXRlZF9hdCIsImxhc3REYXRlIiwiZGF0ZUxhYmVsIiwic2hvd1NlcCIsImlzUGVuZGluZyIsImhhc1FyIiwibWV0YWRhdGEiLCJnYXRld2F5IiwicGF5bWVudF9pZCIsInFyX2NvZGVfYmFzZTY0IiwicGF5bWVudF9saW5rIiwiYWNjZXB0IiwicmVwZWF0RGVsYXkiLCJzdmciLCJ2aWV3Qm94IiwiZmlsbCIsIndpZHRoIiwic3Ryb2tlIiwic3Ryb2tlV2lkdGgiLCJzdHJva2VMaW5lY2FwIiwic3Ryb2tlTGluZWpvaW4iLCJyb3RhdGVZIiwiaXRlbSIsIm9uQmFjayIsImZvcmNlTW9iaWxlIiwibWluSGVpZ2h0Iiwic3Ryb25nIiwiYWNjZW50R3JhZGllbnQiLCJlbW9qaSIsInBhcnRpY2xlcyIsInRvcCIsImxlZnQiLCJyYW5kb20iLCJmb250U2l6ZSIsImdsb3dDb2xvciIsImRlZmF1bHRMYWJlbCIsImljb25BbmltYXRpb25zIiwiY29udGludW91c0FuaW1hdGlvbnMiLCJpY29uQW5pbWF0aW9uIiwiY29udGludW91c0FuaW0iLCJsYXlvdXRJZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsUUFBUSxFQUFFQyxTQUFTLEVBQUVDLFdBQVcsUUFBUSxRQUFRO0FBQ3pELE9BQU9DLG1CQUFtQiw2QkFBNkI7QUFDdkQsU0FBU0MsUUFBUSxRQUFRLGlDQUFpQztBQUMxRCxTQUFTQyxnQkFBZ0IsUUFBd0IsZ0JBQWdCO0FBQ2pFLFNBQVNDLE1BQU0sRUFBRUMsZUFBZSxRQUFRLGdCQUFnQjtBQUN4RCxPQUFPQyxrQkFBa0IscUNBQXFDO0FBQzlELFNBQVNDLFNBQVMsUUFBUSxlQUFlO0FBQ3pDLFNBQ0VDLFVBQVUsRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLFFBQVEsRUFB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