import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/RevendedorPainel.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/RevendedorPainel.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$(), _s1 = $RefreshSig$();
import { useAuth } from "/src/hooks/useAuth.tsx";
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import RecargasTicker from "/src/components/RecargasTicker.tsx";
import BrandedQRCode from "/src/components/BrandedQRCode.tsx";
import { ThemeToggle } from "/src/components/ThemeToggle.tsx";
import { AnimatedIcon } from "/src/components/AnimatedIcon.tsx";
import { AnimatedCounter, AnimatedInt } from "/src/components/AnimatedCounter.tsx";
import { MobileBottomNav } from "/src/components/MobileBottomNav.tsx";
import AnimatedCheck from "/src/components/AnimatedCheck.tsx";
import { PromoBanner } from "/src/components/PromoBanner.tsx";
import { PopupBanner } from "/src/components/PopupBanner.tsx";
import { useBackgroundPaymentMonitor } from "/src/hooks/useBackgroundPaymentMonitor.ts";
import { playSuccessSound } from "/src/lib/sounds.ts";
import { FloatingPoll } from "/src/components/FloatingPoll.tsx";
import { SkeletonValue, SkeletonRow } from "/src/components/Skeleton.tsx";
import { ImageCropper } from "/src/components/ImageCropper.tsx";
import { RecargaReceipt } from "/src/components/RecargaReceipt.tsx";
import { ProfileTab } from "/src/components/ProfileTab.tsx";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { LogOut, Smartphone, History, Send, Clock, MessageCircle, X, User, Activity, Landmark, CreditCard, CheckCircle2, XCircle, Wifi, Database, Shield, Server, AlertTriangle, Loader2, Eye, QrCode, Copy, ExternalLink, RefreshCw, Store, Search, Filter, ChevronRight, FileText } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { supabase } from "/src/integrations/supabase/client.ts";
import __vite__cjsImport24_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useEffect = __vite__cjsImport24_react["useEffect"]; const useState = __vite__cjsImport24_react["useState"]; const useCallback = __vite__cjsImport24_react["useCallback"]; const useRef = __vite__cjsImport24_react["useRef"];
import { appToast, styledToast as toast } from "/src/lib/toast.tsx";
import { formatDateTimeBR, formatFullDateTimeBR, formatDateLongUpperBR, toLocalDateKey, getTodayLocalKey } from "/src/lib/timezone.ts";
import { usePixDeposit } from "/src/hooks/usePixDeposit.ts";
import { useResilientFetch, guardedFetch } from "/src/hooks/useAsync.ts";
import { operadoraColors, safeValor } from "/src/lib/utils.ts";
export default function RevendedorPainel({ resellerId, resellerBranding } = {}) {
    _s();
    const isClientMode = !!resellerId;
    const navigate = useNavigate();
    const { user, role, signOut } = useAuth();
    const [saldo, setSaldo] = useState(0);
    const [recargas, setRecargas] = useState([]);
    const { loading, runFetch } = useResilientFetch();
    const [tab, setTab] = useState("recarga");
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileNome, setProfileNome] = useState("");
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [cropFile, setCropFile] = useState(null);
    // Recarga form
    const [telefone, setTelefone] = useState("");
    const [clipboardPhone, setClipboardPhone] = useState(null);
    const [selectedCarrier, setSelectedCarrier] = useState(null);
    const [selectedValue, setSelectedValue] = useState(null);
    const [extraData, setExtraData] = useState("");
    const [sending, setSending] = useState(false);
    const [pendingWarning, setPendingWarning] = useState(null);
    const [recargaResult, setRecargaResult] = useState(null);
    const [trackingStatus, setTrackingStatus] = useState({
        loading: false,
        data: null,
        open: false,
        localRecarga: null
    });
    const [phoneCheckResult, setPhoneCheckResult] = useState(null);
    const [checkingPhone, setCheckingPhone] = useState(false);
    const [detectingOperator, setDetectingOperator] = useState(false);
    const [detectedOperatorName, setDetectedOperatorName] = useState(null);
    const lastDetectedPhoneRef = useRef("");
    const [selectedRecarga, setSelectedRecarga] = useState(null);
    const [receiptRecarga, setReceiptRecarga] = useState(null);
    // API Catalog
    const [catalog, setCatalog] = useState([]);
    const [catalogLoading, setCatalogLoading] = useState(false);
    const catalogLoaded = useRef(false);
    // Contacts
    const [telegramUsername, setTelegramUsername] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [telegramBotToken, setTelegramBotToken] = useState("");
    const [telegramLinked, setTelegramLinked] = useState(false);
    const [showBotToken, setShowBotToken] = useState(false);
    const [savingContacts, setSavingContacts] = useState(false);
    // Transactions (extrato)
    const [transactions, setTransactions] = useState([]);
    const [transLoading, setTransLoading] = useState(false);
    const transLoaded = useRef(false);
    // Histórico filters
    const [histSearch, setHistSearch] = useState("");
    const [histStatus, setHistStatus] = useState("all");
    const [histOperadora, setHistOperadora] = useState("all");
    // Tabela de valores modal
    const [showValoresModal, setShowValoresModal] = useState(false);
    // Status
    const [statusData, setStatusData] = useState(null);
    // Profile slug for store link
    // Profile slug for store link
    const [profileSlug, setProfileSlug] = useState("");
    // Banner config from banners table
    const [bannersList, setBannersList] = useState([]);
    const [dismissedBanners, setDismissedBanners] = useState(new Set());
    // Call edge function helper
    const callApi = useCallback(async (action, params = {})=>{
        const { data, error } = await supabase.functions.invoke("recarga-express", {
            body: {
                action,
                ...params
            }
        });
        if (error) throw new Error(error.message || "Erro na API");
        return data;
    }, []);
    const fetchCatalog = useCallback(async ()=>{
        await guardedFetch(catalogLoaded, setCatalogLoading, async ()=>{
            // Always build catalog from local DB with reseller/global pricing rules
            const [{ data: ops }, { data: globalRules }, { data: resellerRules }] = await Promise.all([
                supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
                supabase.from("pricing_rules").select("*"),
                user?.id ? supabase.from("reseller_pricing_rules").select("*").eq("user_id", user.id) : Promise.resolve({
                    data: []
                })
            ]);
            if (ops) {
                const localCatalog = ops.map((op)=>{
                    const opGlobalRules = (globalRules || []).filter((r)=>r.operadora_id === op.id);
                    const opResellerRules = (resellerRules || []).filter((r)=>r.operadora_id === op.id);
                    const valores = op.valores || [];
                    const values = valores.map((v)=>{
                        const resellerRule = opResellerRules.find((r)=>Number(r.valor_recarga) === v);
                        const globalRule = opGlobalRules.find((r)=>Number(r.valor_recarga) === v);
                        const rule = resellerRule || globalRule;
                        const cost = rule ? rule.tipo_regra === "fixo" ? Number(rule.regra_valor) : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100) : v;
                        return {
                            valueId: `${op.id}_${v}`,
                            value: v,
                            cost
                        };
                    });
                    return {
                        carrierId: op.id,
                        name: op.nome,
                        order: 0,
                        values
                    };
                });
                setCatalog(localCatalog);
            } else {
                try {
                    const resp = await callApi("catalog");
                    if (resp?.success && resp.data) setCatalog(resp.data);
                } catch  {}
            }
        });
    }, [
        user?.id,
        callApi
    ]);
    const fetchData = useCallback(async ()=>{
        if (!user) return;
        await runFetch(async ()=>{
            const [{ data: saldoData }, { data: recargasData }, { data: profile }, { data: botTokenConfig }] = await Promise.all([
                supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", "revenda").maybeSingle(),
                supabase.from("recargas").select("*").eq("user_id", user.id).order("created_at", {
                    ascending: false
                }).limit(50),
                supabase.from("profiles").select("nome, telegram_username, whatsapp_number, telegram_id, slug, avatar_url").eq("id", user.id).single(),
                supabase.from("reseller_config").select("value").eq("user_id", user.id).eq("key", "telegram_bot_token").maybeSingle()
            ]);
            setSaldo(Number(saldoData?.valor) || 0);
            setRecargas(recargasData || []);
            const p = profile;
            setProfileNome(p?.nome || "");
            setTelegramUsername(p?.telegram_username || "");
            setWhatsappNumber(p?.whatsapp_number || "");
            setTelegramBotToken(botTokenConfig?.value || "");
            setTelegramLinked(!!p?.telegram_id);
            setProfileSlug(p?.slug || "");
            setAvatarUrl(p?.avatar_url || null);
        });
    }, [
        user,
        runFetch
    ]);
    const fetchTransactions = useCallback(async ()=>{
        if (!user) return;
        await guardedFetch(transLoaded, setTransLoading, async ()=>{
            const { data } = await supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", {
                ascending: false
            }).limit(50);
            setTransactions(data || []);
        });
    }, [
        user
    ]);
    const fetchStatus = useCallback(async ()=>{
        try {
            const [{ count: opsCount }, { count: recTotal }, { data: lastRec }, { data: rpcStats }] = await Promise.all([
                supabase.from("operadoras").select("*", {
                    count: "exact",
                    head: true
                }).eq("ativo", true),
                supabase.from("recargas").select("*", {
                    count: "exact",
                    head: true
                }),
                supabase.from("recargas").select("created_at").order("created_at", {
                    ascending: false
                }).limit(1),
                supabase.rpc("get_operator_stats")
            ]);
            // Map RPC results to expected format
            const operatorStats = (Array.isArray(rpcStats) ? rpcStats : []).map((s)=>({
                    operadora: s.operadora || "",
                    avgRecent: Number(s.avg_recent) || 0,
                    min24h: Number(s.min_24h) || 0,
                    avg24h: Number(s.avg_24h) || 0,
                    max24h: Number(s.max_24h) || 0,
                    recentCount: Number(s.recent_count) || 0
                }));
            // Ensure all active operators appear
            const activeOps = [
                "Claro",
                "Tim",
                "Vivo"
            ];
            activeOps.forEach((op)=>{
                if (!operatorStats.find((s)=>s.operadora.toLowerCase() === op.toLowerCase())) {
                    operatorStats.push({
                        operadora: op,
                        avgRecent: 0,
                        min24h: 0,
                        avg24h: 0,
                        max24h: 0,
                        recentCount: 0
                    });
                }
            });
            setStatusData({
                dbOnline: true,
                authOnline: !!user,
                operadorasCount: opsCount || 0,
                recargasTotal: recTotal || 0,
                lastRecarga: lastRec?.[0]?.created_at || null,
                operatorStats
            });
        } catch  {
            setStatusData({
                dbOnline: false,
                authOnline: !!user,
                operadorasCount: 0,
                recargasTotal: 0,
                lastRecarga: null,
                operatorStats: []
            });
        }
    }, [
        user
    ]);
    // Background payment monitor — load revendedor deposit toast config
    const [revDepositToast, setRevDepositToast] = useState(false);
    useEffect(()=>{
        supabase.rpc("get_notif_config", {
            _key: "notif_revendedor_deposit"
        }).then(({ data })=>{
            if (data === "true") setRevDepositToast(true);
        });
    }, []);
    const handleBgPaymentConfirmed = useCallback(()=>{
        fetchData();
        fetchTransactions();
    }, [
        fetchData,
        fetchTransactions
    ]);
    useBackgroundPaymentMonitor(user?.id, handleBgPaymentConfirmed, revDepositToast);
    // Realtime: listen for recargas status changes
    // Realtime: saldo updates
    useEffect(()=>{
        if (!user) return;
        const saldoChannel = supabase.channel(`saldo-realtime-${user.id}`).on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "saldos",
            filter: `user_id=eq.${user.id}`
        }, (payload)=>{
            const row = payload.new;
            if (row?.tipo === "revenda" && row?.valor !== undefined) {
                setSaldo(Number(row.valor));
            }
        }).subscribe();
        return ()=>{
            supabase.removeChannel(saldoChannel);
        };
    }, [
        user
    ]);
    // Realtime: recargas status updates
    useEffect(()=>{
        if (!user) return;
        const channel = supabase.channel(`recargas-status-${user.id}`).on("postgres_changes", {
            event: "UPDATE",
            schema: "public",
            table: "recargas",
            filter: `user_id=eq.${user.id}`
        }, (payload)=>{
            const newRow = payload.new;
            const oldRow = payload.old;
            if (newRow.status === "completed" && oldRow?.status !== "completed") {
                appToast.recargaCompleted(`Recarga ${newRow.operadora || ""} R$ ${Number(newRow.valor).toFixed(2)} para ${newRow.telefone} concluída!`);
                playSuccessSound();
                fetchData();
                // Auto-send receipt to Telegram (uses Satori fallback for image)
                supabase.functions.invoke("telegram-notify", {
                    body: {
                        type: "recarga_completed",
                        user_id: user.id,
                        data: {
                            telefone: newRow.telefone,
                            operadora: newRow.operadora || null,
                            valor: Number(newRow.valor),
                            recarga_id: newRow.id,
                            created_at: newRow.created_at
                        }
                    }
                }).catch((e)=>console.warn("Auto telegram receipt failed:", e));
            }
        }).subscribe();
        return ()=>{
            supabase.removeChannel(channel);
        };
    }, [
        user,
        fetchData
    ]);
    useEffect(()=>{
        // Parallel initial load: data + catalog + banners
        fetchData();
        fetchCatalog();
        supabase.from("banners").select("*").order("position").then(({ data })=>{
            setBannersList((data || []).map((b)=>({
                    id: b.id,
                    position: b.position,
                    type: b.type,
                    enabled: b.enabled,
                    title: b.title,
                    subtitle: b.subtitle,
                    link: b.link
                })));
        });
    }, [
        fetchData,
        fetchCatalog
    ]);
    useEffect(()=>{
        if (tab === "extrato" || tab === "addSaldo") fetchTransactions();
    }, [
        tab,
        fetchTransactions
    ]);
    useEffect(()=>{
        if (tab === "status") fetchStatus();
    }, [
        tab,
        fetchStatus
    ]);
    // Auto-poll pending recargas to update status from external API
    useEffect(()=>{
        const pendingWithExternalId = recargas.filter((r)=>r.status === "pending" && r.external_id);
        if (pendingWithExternalId.length === 0) return;
        let cancelled = false;
        const pollPending = async ()=>{
            for (const r of pendingWithExternalId){
                if (cancelled) break;
                try {
                    const resp = await callApi("order-status", {
                        external_id: r.external_id
                    });
                    if (resp?.success && resp.data?.localStatus === "completed") {
                        appToast.recargaCompleted(`Recarga ${r.operadora || ""} R$ ${Number(r.valor).toFixed(2)} para ${r.telefone} concluída!`);
                        playSuccessSound();
                        fetchData();
                        break;
                    }
                } catch  {}
            }
        };
        // Poll immediately then every 30s
        pollPending();
        const interval = setInterval(pollPending, 30000);
        return ()=>{
            cancelled = true;
            clearInterval(interval);
        };
    }, [
        recargas,
        callApi,
        fetchData
    ]);
    // Detect phone number in clipboard for quick paste (delayed to avoid iOS "Paste" popup on load)
    useEffect(()=>{
        if (tab !== "recarga" || telefone.length > 0) {
            setClipboardPhone(null);
            return;
        }
        let cancelled = false;
        const timer = setTimeout(async ()=>{
            if (cancelled || !document.hasFocus()) return;
            try {
                if (!navigator.clipboard?.readText) return;
                const text = await navigator.clipboard.readText();
                if (cancelled || !text) return;
                const digits = text.replace(/\D/g, "");
                if (digits.length >= 10 && digits.length <= 11) {
                    setClipboardPhone(digits);
                }
            } catch  {}
        }, 1500);
        return ()=>{
            cancelled = true;
            clearTimeout(timer);
        };
    }, [
        tab,
        telefone
    ]);
    // Auto-detect removed — user selects operator manually, then clicks "Verificar"
    const formatPhoneDisplay = (v)=>{
        const d = v.replace(/\D/g, "").slice(0, 11);
        if (d.length <= 2) return d;
        if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
        return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    };
    useEffect(()=>{
        setSelectedValue(null);
        setExtraData("");
        setPhoneCheckResult(null);
    }, [
        selectedCarrier
    ]);
    const formatCooldownMessage = useCallback((message)=>{
        if (!message) return "";
        const isoMatch = message.match(/(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)/);
        if (!isoMatch) return message;
        try {
            const dt = new Date(isoMatch[1]);
            const formatted = formatFullDateTimeBR(dt);
            if (message.toLowerCase().includes("cooldown")) {
                return `⏳ Cooldown ativo!\nEste número recebeu uma recarga recentemente.\nUma nova recarga só será permitida após ${formatted}.`;
            }
            return message.replace(isoMatch[1], formatted);
        } catch  {
            return message;
        }
    }, []);
    const handleCheckPhone = async ()=>{
        if (!telefone.trim()) {
            appToast.error("Digite o número");
            return;
        }
        const normalizedPhone = telefone.replace(/\D/g, "");
        // If no carrier selected, try to auto-detect operator first
        if (!selectedCarrier?.carrierId) {
            setCheckingPhone(true);
            setPhoneCheckResult(null);
            try {
                const queryResp = await callApi("query-operator", {
                    phoneNumber: normalizedPhone
                });
                console.log("query-operator result:", queryResp);
                if (queryResp?.success && queryResp.data) {
                    // Try to match operator name from response to catalog
                    const operatorName = queryResp.data.carrier?.name || queryResp.data.operator || queryResp.data.operadora || queryResp.data.name || "";
                    if (operatorName) {
                        const normalize = (s)=>s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
                        const matched = catalog.find((c)=>normalize(c.name).includes(normalize(operatorName)) || normalize(operatorName).includes(normalize(c.name)));
                        if (matched) {
                            setSelectedCarrier(matched);
                            appToast.success(`Operadora detectada: ${matched.name}`);
                            // Now proceed to check-phone with the detected carrier
                            try {
                                const resp = await callApi("check-phone", {
                                    phoneNumber: normalizedPhone,
                                    carrierId: matched.carrierId
                                });
                                if (resp?.success && resp.data) {
                                    const checkResult = {
                                        ...resp.data,
                                        message: resp.data.status === "COOLDOWN" ? formatCooldownMessage(resp.data.message) : resp.data.message || "Número disponível para recarga."
                                    };
                                    setPhoneCheckResult(checkResult);
                                    if (checkResult.status === "CLEAR") appToast.success("Número disponível!");
                                    else if (checkResult.status === "COOLDOWN") appToast.warning(checkResult.message);
                                    else if (checkResult.status === "BLACKLISTED") appToast.blocked(checkResult.message);
                                }
                            } catch  {}
                            setCheckingPhone(false);
                            return;
                        } else {
                            toast.warning(`Operadora "${operatorName}" detectada, mas não encontrada no catálogo. Selecione manualmente.`);
                        }
                    } else {
                        toast.warning("Não foi possível detectar a operadora. Selecione manualmente.");
                    }
                } else {
                    toast.warning("Não foi possível detectar a operadora. Selecione manualmente.");
                }
            } catch (err) {
                console.warn("Auto-detect operator failed:", err.message);
                toast.warning("Selecione a operadora manualmente.");
            }
            setCheckingPhone(false);
            return;
        }
        setCheckingPhone(true);
        setPhoneCheckResult(null);
        try {
            const resp = await callApi("check-phone", {
                phoneNumber: normalizedPhone,
                carrierId: selectedCarrier.carrierId
            });
            if (resp?.success && resp.data) {
                const checkResult = {
                    ...resp.data,
                    message: resp.data.status === "COOLDOWN" ? formatCooldownMessage(resp.data.message) : resp.data.message || "Número disponível para recarga."
                };
                setPhoneCheckResult(checkResult);
                if (checkResult.status === "BLACKLISTED") {
                    toast.error(checkResult.message || "Número na blacklist");
                } else if (checkResult.status === "COOLDOWN") {
                    toast.warning(checkResult.message || "Número em cooldown");
                } else {
                    toast.success("Número disponível!");
                }
            }
        } catch (err) {
            toast.error(err.message || "Erro ao verificar número");
        }
        setCheckingPhone(false);
    };
    const handleRecarga = async (e, skipPendingCheck = false)=>{
        e.preventDefault();
        if (!telefone.trim() || !selectedCarrier || !selectedValue) {
            toast.error("Preencha todos os campos");
            return;
        }
        if (selectedCarrier.extraField?.required && !extraData.trim()) {
            toast.error(`Preencha o campo: ${selectedCarrier.extraField.title}`);
            return;
        }
        if (selectedValue.cost > saldo) {
            toast.error("Saldo insuficiente");
            return;
        }
        // Check for pending recargas on same number
        if (!skipPendingCheck) {
            const normalizedPhone = telefone.replace(/\D/g, "");
            const { count } = await supabase.from("recargas").select("id", {
                count: "exact",
                head: true
            }).eq("telefone", normalizedPhone).eq("status", "pending");
            if (count && count > 0) {
                setPendingWarning({
                    phone: telefone,
                    count
                });
                return;
            }
        }
        setSending(true);
        setRecargaResult(null);
        try {
            const normalizedPhone = telefone.replace(/\D/g, "");
            // Revalida imediatamente antes de recarregar para evitar divergência de status
            const precheckResp = await callApi("check-phone", {
                phoneNumber: normalizedPhone,
                carrierId: selectedCarrier.carrierId
            });
            if (precheckResp?.success && precheckResp.data) {
                const precheckResult = {
                    ...precheckResp.data,
                    message: precheckResp.data.status === "COOLDOWN" ? formatCooldownMessage(precheckResp.data.message) : precheckResp.data.message || "Número disponível para recarga."
                };
                setPhoneCheckResult(precheckResult);
                if (precheckResult.status === "BLACKLISTED" || precheckResult.status === "COOLDOWN") {
                    throw new Error(precheckResult.message || "Número indisponível para recarga no momento.");
                }
            }
            const resp = await callApi("recharge", {
                carrierId: selectedCarrier.carrierId,
                phoneNumber: normalizedPhone,
                valueId: selectedValue.valueId,
                extraData: extraData.trim() || undefined,
                saldo_tipo: "revenda"
            });
            if (resp?.success) {
                const newBalance = resp.data?.localBalance ?? saldo - selectedValue.cost;
                const externalId = resp.data?._id || null;
                const orderStatus = resp.data?.status;
                setRecargaResult({
                    success: true,
                    message: `Pedido de ${fmt(selectedValue.value)} (${selectedCarrier.name}) para ${telefone} enviado com sucesso! Novo saldo: ${fmt(newBalance)}`,
                    externalId
                });
                if (orderStatus === "feita" || orderStatus === "completed") {
                    toast.success(`✅ Recarga concluída! ${fmt(selectedValue.value)} (${selectedCarrier.name}) para ${telefone}. Novo saldo: ${fmt(newBalance)}`);
                    playSuccessSound();
                }
                setTelefone("");
                setSelectedCarrier(null);
                setSelectedValue(null);
                setExtraData("");
                setPhoneCheckResult(null);
                fetchData();
            } else {
                throw new Error(formatCooldownMessage(resp?.error || "Erro ao criar recarga"));
            }
        } catch (err) {
            const msg = formatCooldownMessage(err.message || "Erro ao realizar recarga");
            const finalMsg = msg.toLowerCase().includes("cooldown") && !msg.includes("⏳") ? `⏳ ${msg}` : msg;
            setRecargaResult({
                success: false,
                message: finalMsg
            });
        }
        setSending(false);
    };
    const handleSaveContacts = async ()=>{
        setSavingContacts(true);
        try {
            const { error: profileError } = await supabase.from("profiles").update({
                telegram_username: telegramUsername.trim() || null,
                whatsapp_number: whatsappNumber.trim() || null
            }).eq("id", user.id);
            if (profileError) throw profileError;
            // Save telegram_bot_token to reseller_config (secure storage)
            const tokenValue = telegramBotToken.trim() || null;
            const { error: configError } = await supabase.from("reseller_config").upsert({
                user_id: user.id,
                key: "telegram_bot_token",
                value: tokenValue
            }, {
                onConflict: "user_id,key"
            });
            if (configError) throw configError;
            toast.success("Contatos salvos!");
        } catch (err) {
            toast.error(err.message || "Erro ao salvar");
        }
        setSavingContacts(false);
    };
    const fmt = (v)=>v.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    const handleTrackRecharge = async (externalId, localRecarga)=>{
        const lr = localRecarga || trackingStatus.localRecarga || null;
        setTrackingStatus({
            loading: true,
            data: null,
            open: true,
            localRecarga: lr
        });
        try {
            const resp = await callApi("orders");
            if (resp?.success && resp.data) {
                const orders = Array.isArray(resp.data) ? resp.data : resp.data.data || [];
                const order = orders.find((o)=>o._id === externalId);
                setTrackingStatus({
                    loading: false,
                    data: order || {
                        _id: externalId,
                        status: "Não encontrado"
                    },
                    open: true,
                    localRecarga: lr
                });
            } else {
                setTrackingStatus({
                    loading: false,
                    data: {
                        _id: externalId,
                        status: "Erro ao consultar"
                    },
                    open: true,
                    localRecarga: lr
                });
            }
        } catch  {
            setTrackingStatus({
                loading: false,
                data: {
                    _id: externalId,
                    status: "Erro ao consultar"
                },
                open: true,
                localRecarga: lr
            });
        }
    };
    const fmtDate = (d)=>formatDateTimeBR(d);
    const recargasHoje = recargas.filter((r)=>toLocalDateKey(r.created_at) === getTodayLocalKey()).length;
    const userLabel = profileNome || user?.email?.split("@")[0] || "Revendedor";
    const userInitial = (userLabel[0] || "R").toUpperCase();
    const menuItems = [
        {
            key: "recarga",
            label: "Nova Recarga",
            icon: Send,
            active: true
        },
        {
            key: "addSaldo",
            label: "Adicionar Saldo",
            icon: CreditCard,
            dashed: true
        },
        {
            key: "historico",
            label: "Histórico de Pedidos",
            icon: History
        },
        {
            key: "extrato",
            label: "Extrato de Depósitos",
            icon: Landmark
        },
        {
            key: "contatos",
            label: "Meu Perfil",
            icon: User
        },
        {
            key: "status",
            label: "Status do Sistema",
            icon: Activity
        }
    ];
    const tabTitle = {
        recarga: "Nova Recarga",
        addSaldo: "Adicionar Saldo",
        historico: "Histórico de Pedidos",
        extrato: "Extrato de Depósitos",
        contatos: "Meu Perfil",
        status: "Status do Sistema"
    };
    const selectTab = (nextTab)=>{
        setTab(nextTab);
        setMenuOpen(false);
        setRecargaResult(null);
    };
    const handleAvatarUpload = async (e)=>{
        const file = e.target.files?.[0];
        if (!file || !user) return;
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
        ];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Formato não suportado. Use JPG, PNG, WebP ou GIF.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Arquivo muito grande. Máximo 2MB.");
            return;
        }
        e.target.value = "";
        // GIF goes directly, other formats open cropper
        if (file.type === "image/gif") {
            await uploadAvatarFile(file);
        } else {
            setCropFile(file);
        }
    };
    const uploadAvatarFile = async (fileOrBlob)=>{
        if (!user) return;
        setUploadingAvatar(true);
        try {
            const ext = fileOrBlob instanceof File ? fileOrBlob.name.split(".").pop() || "jpg" : "jpg";
            const path = `${user.id}/avatar.${ext}`;
            const { data: existingFiles } = await supabase.storage.from("avatars").list(user.id);
            if (existingFiles?.length) {
                await supabase.storage.from("avatars").remove(existingFiles.map((f)=>`${user.id}/${f.name}`));
            }
            const { error: upErr } = await supabase.storage.from("avatars").upload(path, fileOrBlob, {
                upsert: true
            });
            if (upErr) throw upErr;
            const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
            const publicUrl = urlData.publicUrl + "?t=" + Date.now();
            await supabase.from("profiles").update({
                avatar_url: publicUrl
            }).eq("id", user.id);
            setAvatarUrl(publicUrl);
            toast.success("Foto de perfil atualizada!");
        } catch (err) {
            console.error(err);
            toast.error("Erro ao enviar foto: " + (err.message || "tente novamente"));
        }
        setUploadingAvatar(false);
    };
    const [avatarError, setAvatarError] = useState(false);
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    // Reset error when URL changes
    useEffect(()=>{
        setAvatarError(false);
    }, [
        avatarUrl
    ]);
    const AvatarDisplay = ({ size = "w-12 h-12", textSize = "text-base" })=>avatarUrl && !avatarError ? /*#__PURE__*/ _jsxDEV("img", {
            src: avatarUrl,
            alt: "Avatar",
            className: `${size} rounded-full object-cover shrink-0`,
            referrerPolicy: "no-referrer",
            crossOrigin: "anonymous",
            onError: ()=>setAvatarError(true)
        }, void 0, false, {
            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
            lineNumber: 713,
            columnNumber: 7
        }, this) : /*#__PURE__*/ _jsxDEV("div", {
            className: `${size} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold ${textSize} shrink-0`,
            children: userInitial
        }, void 0, false, {
            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
            lineNumber: 722,
            columnNumber: 7
        }, this);
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "min-h-screen md:flex pb-8",
        children: [
            menuOpen && /*#__PURE__*/ _jsxDEV(_Fragment, {
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden",
                        onClick: ()=>setMenuOpen(false)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 733,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "fixed inset-x-0 bottom-0 z-[61] md:hidden rounded-t-2xl bg-card/95 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)] border-t border-border/50",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex justify-center pt-3 pb-1",
                                children: /*#__PURE__*/ _jsxDEV("div", {
                                    className: "w-10 h-1 rounded-full bg-muted-foreground/20"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 737,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 736,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center justify-between px-5 pb-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("h2", {
                                        className: "font-display text-lg font-bold text-foreground",
                                        children: "Menu"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 742,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 744,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>setMenuOpen(false),
                                                className: "w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors",
                                                children: /*#__PURE__*/ _jsxDEV(X, {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 746,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 745,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 743,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 741,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "mx-4 mb-3 p-3 rounded-xl glass-card rgb-border",
                                children: /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(AvatarDisplay, {}, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 754,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "min-w-0",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-sm font-semibold text-foreground truncate",
                                                    children: user?.email
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 756,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-xs text-success font-medium",
                                                    children: loading ? /*#__PURE__*/ _jsxDEV(SkeletonValue, {
                                                        width: "w-14",
                                                        className: "h-3"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 757,
                                                        columnNumber: 78
                                                    }, this) : fmt(saldo)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 757,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 755,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 753,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 752,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "px-4 pb-3 grid grid-cols-3 gap-2",
                                children: [
                                    menuItems.map((item)=>{
                                        const isActive = tab === item.key;
                                        return /*#__PURE__*/ _jsxDEV("button", {
                                            onClick: ()=>selectTab(item.key),
                                            className: `flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl active:scale-95 transition-all ${isActive ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_12px_hsl(var(--primary)/0.1)]" : "bg-muted/30 text-foreground hover:bg-muted/50"}`,
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(item.icon, {
                                                    className: `h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 776,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: `text-[11px] font-semibold text-center leading-tight ${isActive ? "text-primary" : "text-foreground"}`,
                                                    children: item.label
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 777,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, item.key, true, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 767,
                                            columnNumber: 19
                                        }, this);
                                    }),
                                    !isClientMode && /*#__PURE__*/ _jsxDEV("a", {
                                        href: profileSlug ? `/loja/${profileSlug}` : `/recarga?ref=${user?.id}`,
                                        target: "_blank",
                                        rel: "noopener noreferrer",
                                        className: "flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl bg-muted/30 text-foreground hover:bg-muted/50 active:scale-95 transition-all",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(Store, {
                                                className: "h-6 w-6 text-accent"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 789,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-[11px] font-semibold text-center leading-tight",
                                                children: "Minha Loja"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 790,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 783,
                                        columnNumber: 17
                                    }, this),
                                    !isClientMode && (role === "admin" || role === "revendedor") && /*#__PURE__*/ _jsxDEV("a", {
                                        href: "/admin",
                                        className: "flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl bg-muted/30 text-foreground hover:bg-muted/50 active:scale-95 transition-all",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(Shield, {
                                                className: "h-6 w-6 text-warning"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 799,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-[11px] font-semibold text-center leading-tight",
                                                children: "Admin"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 800,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 795,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 763,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "px-4 pb-5 pt-1",
                                children: /*#__PURE__*/ _jsxDEV("button", {
                                    onClick: signOut,
                                    className: "w-full py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/15 flex items-center justify-center gap-2 transition-all border border-destructive/15",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(LogOut, {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 811,
                                            columnNumber: 17
                                        }, this),
                                        " Sair"
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 807,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 806,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 734,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            /*#__PURE__*/ _jsxDEV("aside", {
                className: "hidden md:block md:sticky top-0 left-0 h-screen w-[280px] z-30 border-r border-border bg-card/95 backdrop-blur-xl",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "h-full flex flex-col relative",
                    children: [
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                            lineNumber: 822,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "px-5 py-5 border-b border-border relative",
                            children: [
                                /*#__PURE__*/ _jsxDEV("h1", {
                                    className: "font-display text-xl font-bold shimmer-letters",
                                    children: [
                                        "Recargas ",
                                        /*#__PURE__*/ _jsxDEV("span", {
                                            className: "brasil-word",
                                            children: "Brasil"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 826,
                                            columnNumber: 24
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 825,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-[10px] uppercase tracking-widest text-primary/80 font-semibold mt-1.5",
                                    children: "Revendedor"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 828,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                            lineNumber: 824,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "p-4 space-y-3 border-b border-border relative",
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "glass-card rounded-xl p-3.5 flex items-center gap-3 rgb-border",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(AvatarDisplay, {}, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 833,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "min-w-0",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex items-center gap-1.5 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                            className: "text-sm font-bold text-foreground truncate uppercase shimmer-letters",
                                                            children: userLabel
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 836,
                                                            columnNumber: 19
                                                        }, this),
                                                        role === "admin" && /*#__PURE__*/ _jsxDEV("svg", {
                                                            className: "h-4 w-4 text-primary flex-shrink-0 animate-[spin-wobble_3s_ease-in-out_infinite]",
                                                            viewBox: "0 0 24 24",
                                                            fill: "currentColor",
                                                            style: {
                                                                animationName: 'spin-wobble'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("path", {
                                                                    d: "M12 2L14.09 8.26L21 9.27L16.18 13.14L17.64 20.02L12 16.77L6.36 20.02L7.82 13.14L3 9.27L9.91 8.26L12 2Z"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 841,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("path", {
                                                                    d: "M9.5 12.5L11 14L14.5 10.5",
                                                                    stroke: "white",
                                                                    strokeWidth: "1.5",
                                                                    strokeLinecap: "round",
                                                                    strokeLinejoin: "round",
                                                                    fill: "none"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 842,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 840,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 835,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-xs text-muted-foreground truncate",
                                                    children: user?.email
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 846,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 834,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 832,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "glass-card rounded-xl p-3.5",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-[10px] text-muted-foreground uppercase tracking-wider font-semibold",
                                            children: "Seu saldo"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 850,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-2xl font-bold text-success mt-1",
                                            children: loading ? /*#__PURE__*/ _jsxDEV(SkeletonValue, {
                                                width: "w-24",
                                                className: "h-7"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 851,
                                                columnNumber: 78
                                            }, this) : /*#__PURE__*/ _jsxDEV(AnimatedCounter, {
                                                value: saldo,
                                                prefix: "R$ "
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 851,
                                                columnNumber: 127
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 851,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 849,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                            lineNumber: 831,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("nav", {
                            className: "p-3 space-y-1 overflow-y-auto flex-1 relative",
                            children: [
                                menuItems.map((item)=>{
                                    const isActive = tab === item.key;
                                    return /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>selectTab(item.key),
                                        className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${isActive ? "nav-item-active" : item.dashed ? "text-success border border-dashed border-success/30 hover:bg-success/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`,
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(item.icon, {
                                                className: `h-4 w-4 shrink-0 ${isActive ? "text-primary" : item.dashed ? "text-success" : ""}`
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 870,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                children: item.label
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 871,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, item.key, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 859,
                                        columnNumber: 17
                                    }, this);
                                }),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "pt-3 mt-3 border-t border-border",
                                    children: /*#__PURE__*/ _jsxDEV("a", {
                                        href: "/chat",
                                        className: "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all group shadow-[0_0_12px_hsl(var(--primary)/0.08)]",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                                animate: {
                                                    scale: [
                                                        1,
                                                        1.15,
                                                        1
                                                    ]
                                                },
                                                transition: {
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                },
                                                children: /*#__PURE__*/ _jsxDEV(MessageCircle, {
                                                    className: "h-5 w-5 text-primary"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 880,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 879,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                children: "Bate-papo"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 882,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV(ChevronRight, {
                                                className: "h-4 w-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 883,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 877,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 876,
                                    columnNumber: 13
                                }, this),
                                !isClientMode && (role === "admin" || role === "revendedor") && /*#__PURE__*/ _jsxDEV("div", {
                                    className: "pt-3 mt-3 border-t border-border space-y-1",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "px-2 text-[10px] tracking-widest text-muted-foreground/60 uppercase font-semibold",
                                            children: "Administração"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 889,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("a", {
                                            href: "/admin",
                                            className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary/80 hover:text-primary hover:bg-primary/5 transition-colors",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(Shield, {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 891,
                                                    columnNumber: 19
                                                }, this),
                                                " ",
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    children: "Painel Admin"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 891,
                                                    columnNumber: 50
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 890,
                                            columnNumber: 17
                                        }, this),
                                        role === "admin" && /*#__PURE__*/ _jsxDEV("a", {
                                            href: "/principal",
                                            className: "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary/80 hover:text-primary hover:bg-primary/5 transition-colors",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(Landmark, {
                                                    className: "h-4 w-4"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 895,
                                                    columnNumber: 21
                                                }, this),
                                                " ",
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    children: "Painel Principal"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 895,
                                                    columnNumber: 54
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 894,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 888,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                            lineNumber: 855,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "p-4 border-t border-border space-y-3 relative",
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("span", {
                                            className: "text-sm text-muted-foreground",
                                            children: "Tema"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 904,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 905,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 903,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("button", {
                                    onClick: signOut,
                                    className: "w-full py-2.5 rounded-lg border border-destructive/25 text-destructive text-sm font-medium hover:bg-destructive/10 transition-all flex items-center justify-center gap-2 group",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(LogOut, {
                                            className: "h-4 w-4 group-hover:translate-x-0.5 transition-transform"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 909,
                                            columnNumber: 15
                                        }, this),
                                        " Sair"
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 907,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                            lineNumber: 902,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                    lineNumber: 820,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 819,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex-1 min-w-0",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "sticky top-0 z-[70]",
                        children: [
                            /*#__PURE__*/ _jsxDEV("header", {
                                className: "glass-header px-4 md:px-6 py-4 flex items-center justify-between relative z-[100] overflow-visible",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 920,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center gap-3",
                                        children: /*#__PURE__*/ _jsxDEV("h2", {
                                            className: "font-display text-xl font-bold text-foreground",
                                            children: tabTitle[tab]
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 922,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 921,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>selectTab("addSaldo"),
                                                className: "h-9 px-4 rounded-xl bg-success text-success-foreground flex items-center gap-1.5 text-sm font-bold shadow-[0_0_16px_hsl(var(--success)/0.35)] hover:shadow-[0_0_24px_hsl(var(--success)/0.5)] hover:scale-105 active:scale-95 transition-all",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(CreditCard, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 927,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        children: loading ? /*#__PURE__*/ _jsxDEV(SkeletonValue, {
                                                            width: "w-12",
                                                            className: "h-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 928,
                                                            columnNumber: 34
                                                        }, this) : /*#__PURE__*/ _jsxDEV(AnimatedCounter, {
                                                            value: saldo,
                                                            prefix: "R$ "
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 928,
                                                            columnNumber: 83
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 928,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 925,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "relative z-[80]",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("button", {
                                                        onClick: ()=>setShowAvatarMenu((prev)=>!prev),
                                                        className: "focus:outline-none",
                                                        children: /*#__PURE__*/ _jsxDEV(AvatarDisplay, {
                                                            size: "w-9 h-9",
                                                            textSize: "text-xs"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 932,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 931,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                                        children: showAvatarMenu && /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "fixed inset-0 z-[119]",
                                                                    onClick: ()=>setShowAvatarMenu(false)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 937,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                    initial: {
                                                                        opacity: 0,
                                                                        scale: 0.9,
                                                                        y: -4
                                                                    },
                                                                    animate: {
                                                                        opacity: 1,
                                                                        scale: 1,
                                                                        y: 0
                                                                    },
                                                                    exit: {
                                                                        opacity: 0,
                                                                        scale: 0.9,
                                                                        y: -4
                                                                    },
                                                                    transition: {
                                                                        duration: 0.15
                                                                    },
                                                                    className: "fixed right-4 md:right-6 top-[4.25rem] md:top-[4.5rem] z-[120] min-w-[160px] rounded-xl bg-card border border-border shadow-xl p-2",
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                                            className: "px-3 py-2 border-b border-border mb-1",
                                                                            children: /*#__PURE__*/ _jsxDEV("p", {
                                                                                className: "text-xs text-muted-foreground truncate",
                                                                                children: user?.email
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 946,
                                                                                columnNumber: 27
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 945,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("button", {
                                                                            onClick: ()=>{
                                                                                setShowAvatarMenu(false);
                                                                                signOut();
                                                                            },
                                                                            className: "w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors",
                                                                            children: [
                                                                                /*#__PURE__*/ _jsxDEV(LogOut, {
                                                                                    className: "h-4 w-4"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 952,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                " Sair da conta"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 948,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 938,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 934,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 930,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 924,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 918,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "relative z-10",
                                children: /*#__PURE__*/ _jsxDEV(RecargasTicker, {}, void 0, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 961,
                                    columnNumber: 42
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 961,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 917,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("main", {
                        className: "max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-5",
                        children: [
                            tab !== "contatos" && /*#__PURE__*/ _jsxDEV("div", {
                                className: "grid grid-cols-2 lg:grid-cols-3 gap-3",
                                children: [
                                    {
                                        icon: Smartphone,
                                        label: "Recargas Hoje",
                                        rawValue: recargasHoje,
                                        isCurrency: false,
                                        color: "text-primary",
                                        bgColor: "bg-primary/10",
                                        anim: "float"
                                    },
                                    {
                                        icon: Clock,
                                        label: "Total",
                                        rawValue: recargas.length,
                                        isCurrency: false,
                                        color: "text-accent",
                                        bgColor: "bg-accent/10",
                                        anim: "pulse"
                                    }
                                ].map((c, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                                        initial: {
                                            opacity: 0,
                                            y: 16
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            delay: i * 0.1,
                                            type: "spring",
                                            stiffness: 200
                                        },
                                        className: "kpi-card",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-2.5 mb-2.5",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: `w-10 h-10 rounded-xl ${c.bgColor} flex items-center justify-center icon-container`,
                                                        children: /*#__PURE__*/ _jsxDEV(AnimatedIcon, {
                                                            icon: c.icon,
                                                            className: `h-5 w-5 ${c.color}`,
                                                            animation: c.anim,
                                                            delay: i * 0.12
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 975,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 974,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-[10px] text-muted-foreground uppercase tracking-wider font-semibold",
                                                        children: c.label
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 977,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 973,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: `text-2xl md:text-3xl font-bold ${c.color} truncate`,
                                                children: loading ? /*#__PURE__*/ _jsxDEV(SkeletonValue, {
                                                    width: "w-16",
                                                    className: "h-7"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 980,
                                                    columnNumber: 30
                                                }, this) : c.isCurrency ? /*#__PURE__*/ _jsxDEV(AnimatedCounter, {
                                                    value: c.rawValue,
                                                    prefix: "R$ "
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 980,
                                                    columnNumber: 94
                                                }, this) : /*#__PURE__*/ _jsxDEV(AnimatedInt, {
                                                    value: c.rawValue
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 980,
                                                    columnNumber: 153
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 979,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, c.label, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 972,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 967,
                                columnNumber: 11
                            }, this),
                            bannersList.filter((b)=>b.enabled && b.type !== "popup" && !dismissedBanners.has(b.position)).map((b)=>/*#__PURE__*/ _jsxDEV(PromoBanner, {
                                    title: b.title || undefined,
                                    subtitle: b.subtitle || undefined,
                                    visible: true,
                                    link: b.link || undefined,
                                    onClose: ()=>setDismissedBanners((prev)=>new Set([
                                                ...prev,
                                                b.position
                                            ]))
                                }, b.id, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 989,
                                    columnNumber: 13
                                }, this)),
                            bannersList.filter((b)=>b.enabled && b.type === "popup" && !dismissedBanners.has(b.position)).map((b)=>/*#__PURE__*/ _jsxDEV(PopupBanner, {
                                    title: b.title || undefined,
                                    subtitle: b.subtitle || undefined,
                                    visible: true,
                                    link: b.link || undefined,
                                    onClose: ()=>setDismissedBanners((prev)=>new Set([
                                                ...prev,
                                                b.position
                                            ]))
                                }, b.id, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 1001,
                                    columnNumber: 13
                                }, this)),
                            tab === "recarga" && /*#__PURE__*/ _jsxDEV(_Fragment, {
                                children: [
                                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                        children: recargaResult && /*#__PURE__*/ _jsxDEV(motion.div, {
                                            initial: {
                                                opacity: 0,
                                                scale: 0.9
                                            },
                                            animate: {
                                                opacity: 1,
                                                scale: 1
                                            },
                                            exit: {
                                                opacity: 0,
                                                scale: 0.9
                                            },
                                            className: "glass-modal rounded-2xl p-8 text-center",
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
                                                        stiffness: 300,
                                                        damping: 15,
                                                        delay: 0.1
                                                    },
                                                    className: `w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${recargaResult.success ? "bg-warning/15" : "bg-destructive/15"}`,
                                                    children: recargaResult.success ? /*#__PURE__*/ _jsxDEV(motion.div, {
                                                        animate: {
                                                            rotate: 360
                                                        },
                                                        transition: {
                                                            repeat: Infinity,
                                                            duration: 1.5,
                                                            ease: "linear"
                                                        },
                                                        children: /*#__PURE__*/ _jsxDEV(Loader2, {
                                                            className: "h-10 w-10 text-warning"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1028,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1024,
                                                        columnNumber: 27
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
                                                            className: "h-10 w-10 text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1034,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1030,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1021,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("h3", {
                                                    className: `font-display text-xl font-bold mb-2 ${recargaResult.success ? "text-warning" : "text-destructive"}`,
                                                    children: recargaResult.success ? "⏳ Processando Pedido..." : "Erro na Recarga"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1038,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-muted-foreground mb-6",
                                                    children: recargaResult.message
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1041,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex flex-col sm:flex-row gap-3 justify-center",
                                                    children: [
                                                        recargaResult.success && recargaResult.externalId && /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: ()=>handleTrackRecharge(recargaResult.externalId),
                                                            className: "px-6 py-2.5 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV(Eye, {
                                                                    className: "h-4 w-4"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1048,
                                                                    columnNumber: 27
                                                                }, this),
                                                                " Acompanhar Recarga"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1044,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: ()=>{
                                                                setRecargaResult(null);
                                                                setTrackingStatus({
                                                                    loading: false,
                                                                    data: null,
                                                                    open: false,
                                                                    localRecarga: null
                                                                });
                                                            },
                                                            className: "px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity",
                                                            children: recargaResult.success ? "Nova Recarga" : "Tentar Novamente"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1051,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1042,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 1017,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 1015,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                        children: trackingStatus.open && /*#__PURE__*/ _jsxDEV(motion.div, {
                                            initial: {
                                                opacity: 0
                                            },
                                            animate: {
                                                opacity: 1
                                            },
                                            exit: {
                                                opacity: 0
                                            },
                                            className: "fixed inset-0 bg-background/70 backdrop-blur-sm z-[70] flex items-center justify-center px-4",
                                            onClick: ()=>setTrackingStatus((prev)=>({
                                                        ...prev,
                                                        open: false
                                                    })),
                                            children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                initial: {
                                                    opacity: 0,
                                                    y: 30,
                                                    scale: 0.95
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1
                                                },
                                                exit: {
                                                    opacity: 0,
                                                    y: 30,
                                                    scale: 0.95
                                                },
                                                className: "glass-card rounded-2xl w-full max-w-md p-6",
                                                onClick: (e)=>e.stopPropagation(),
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "flex items-center justify-between mb-4",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("h3", {
                                                                className: "font-display text-lg font-bold text-foreground flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV(Activity, {
                                                                        className: "h-5 w-5 text-primary"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1075,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    " Acompanhamento"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1074,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>setTrackingStatus((prev)=>({
                                                                            ...prev,
                                                                            open: false
                                                                        })),
                                                                className: "p-1 rounded-md hover:bg-destructive/15 text-destructive",
                                                                children: /*#__PURE__*/ _jsxDEV(X, {
                                                                    className: "h-5 w-5"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1078,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1077,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1073,
                                                        columnNumber: 23
                                                    }, this),
                                                    trackingStatus.loading ? /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "flex flex-col items-center py-8 gap-3",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV(Loader2, {
                                                                className: "h-8 w-8 animate-spin text-primary"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1084,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                className: "text-sm text-muted-foreground",
                                                                children: "Consultando status..."
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1085,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1083,
                                                        columnNumber: 25
                                                    }, this) : trackingStatus.data ? /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "space-y-3",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: "ID"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1090,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs font-mono text-foreground",
                                                                        children: trackingStatus.data._id || "—"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1091,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1089,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: "Status"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1094,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: `text-xs font-bold px-2 py-1 rounded-full ${trackingStatus.data.status === "feita" || trackingStatus.data.status === "completed" ? "bg-success/15 text-success" : trackingStatus.data.status === "andamento" || trackingStatus.data.status === "in_progress" ? "bg-blue-500/15 text-blue-400" : trackingStatus.data.status === "pendente" || trackingStatus.data.status === "pending" ? "bg-warning/15 text-warning" : trackingStatus.data.status === "falha" || trackingStatus.data.status === "failed" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`,
                                                                        children: trackingStatus.data.status === "feita" || trackingStatus.data.status === "completed" ? "✅ Concluída" : trackingStatus.data.status === "andamento" || trackingStatus.data.status === "in_progress" ? "🔄 Em andamento" : trackingStatus.data.status === "pendente" || trackingStatus.data.status === "pending" ? "⏳ Processando" : trackingStatus.data.status === "falha" || trackingStatus.data.status === "failed" ? "❌ Falhou" : trackingStatus.data.status
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1095,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1093,
                                                                columnNumber: 27
                                                            }, this),
                                                            trackingStatus.data.phoneNumber && /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: "Telefone"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1115,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs text-foreground",
                                                                        children: trackingStatus.data.phoneNumber
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1116,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1114,
                                                                columnNumber: 29
                                                            }, this),
                                                            trackingStatus.data.carrier?.name && /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: "Operadora"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1121,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs text-foreground",
                                                                        children: trackingStatus.data.carrier.name
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1122,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1120,
                                                                columnNumber: 29
                                                            }, this),
                                                            trackingStatus.localRecarga ? /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                                className: "text-xs text-muted-foreground",
                                                                                children: "Valor da Recarga"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1129,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                                className: "text-xs font-bold text-foreground",
                                                                                children: fmt(safeValor(trackingStatus.localRecarga))
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1130,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1128,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                                className: "text-xs text-muted-foreground",
                                                                                children: "Custo (debitado)"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1133,
                                                                                columnNumber: 33
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                                className: "text-xs font-bold text-foreground",
                                                                                children: fmt(trackingStatus.localRecarga.custo)
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1134,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1132,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true) : trackingStatus.data.value ? /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: "Valor"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1139,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs font-bold text-foreground",
                                                                        children: fmt(Number(trackingStatus.data.value.cost || trackingStatus.data.value.value || 0))
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1140,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1138,
                                                                columnNumber: 29
                                                            }, this) : null,
                                                            trackingStatus.data.createdAt && /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center justify-between p-3 rounded-lg bg-muted/30",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: "Criado em"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1145,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-xs text-foreground",
                                                                        children: fmtDate(trackingStatus.data.createdAt)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1146,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1144,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>handleTrackRecharge(trackingStatus.data._id),
                                                                className: "w-full mt-2 px-4 py-2.5 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV(RefreshCw, {
                                                                        className: "h-4 w-4"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1153,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    " Atualizar Status"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1149,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1088,
                                                        columnNumber: 25
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1068,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 1063,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 1061,
                                        columnNumber: 15
                                    }, this),
                                    !recargaResult && /*#__PURE__*/ _jsxDEV(_Fragment, {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex justify-end",
                                                children: /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setShowValoresModal(true),
                                                    className: "px-4 py-2 rounded-lg glass-card text-primary text-sm font-semibold hover:bg-primary/10 transition-colors",
                                                    children: "☰ Ver Tabela de Valores"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1165,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1164,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                                children: showValoresModal && /*#__PURE__*/ _jsxDEV(motion.div, {
                                                    initial: {
                                                        opacity: 0
                                                    },
                                                    animate: {
                                                        opacity: 1
                                                    },
                                                    exit: {
                                                        opacity: 0
                                                    },
                                                    className: "fixed inset-0 bg-background/70 backdrop-blur-sm z-[70] flex items-start justify-center pt-8 md:pt-16 px-4",
                                                    onClick: ()=>setShowValoresModal(false),
                                                    children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                        initial: {
                                                            opacity: 0,
                                                            y: 30,
                                                            scale: 0.95
                                                        },
                                                        animate: {
                                                            opacity: 1,
                                                            y: 0,
                                                            scale: 1
                                                        },
                                                        exit: {
                                                            opacity: 0,
                                                            y: 30,
                                                            scale: 0.95
                                                        },
                                                        className: "glass-card rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 md:p-6",
                                                        onClick: (e)=>e.stopPropagation(),
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center justify-between mb-4 border-b border-border pb-3",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("h3", {
                                                                        className: "font-display text-lg font-bold text-foreground",
                                                                        children: "Valores e Operadoras Disponíveis"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1185,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("button", {
                                                                        onClick: ()=>setShowValoresModal(false),
                                                                        className: "p-1 rounded-md hover:bg-destructive/15 text-destructive",
                                                                        children: /*#__PURE__*/ _jsxDEV(X, {
                                                                            className: "h-5 w-5"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1187,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1186,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1184,
                                                                columnNumber: 27
                                                            }, this),
                                                            catalogLoading ? /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "space-y-2",
                                                                children: [
                                                                    1,
                                                                    2,
                                                                    3
                                                                ].map((i)=>/*#__PURE__*/ _jsxDEV(SkeletonRow, {}, i, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1191,
                                                                        columnNumber: 74
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1191,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "space-y-5",
                                                                children: [
                                                                    catalog.map((carrier)=>{
                                                                        if (carrier.values.length === 0) return null;
                                                                        return /*#__PURE__*/ _jsxDEV("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ _jsxDEV("h4", {
                                                                                    className: "font-bold text-foreground text-base mb-2",
                                                                                    children: carrier.name
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1198,
                                                                                    columnNumber: 37
                                                                                }, this),
                                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                                    className: "grid grid-cols-2 gap-2",
                                                                                    children: carrier.values.sort((a, b)=>a.value - b.value).map((val)=>/*#__PURE__*/ _jsxDEV("button", {
                                                                                            type: "button",
                                                                                            onClick: ()=>{
                                                                                                setSelectedCarrier(carrier);
                                                                                                setSelectedValue(val);
                                                                                                setShowValoresModal(false);
                                                                                            },
                                                                                            className: "glass rounded-xl p-3 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center",
                                                                                            children: [
                                                                                                /*#__PURE__*/ _jsxDEV("p", {
                                                                                                    className: "text-foreground font-bold text-base",
                                                                                                    children: fmt(val.value)
                                                                                                }, void 0, false, {
                                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                    lineNumber: 1211,
                                                                                                    columnNumber: 43
                                                                                                }, this),
                                                                                                /*#__PURE__*/ _jsxDEV("p", {
                                                                                                    className: "text-primary text-xs font-medium mt-0.5",
                                                                                                    children: [
                                                                                                        "Paga ",
                                                                                                        fmt(val.cost)
                                                                                                    ]
                                                                                                }, void 0, true, {
                                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                    lineNumber: 1212,
                                                                                                    columnNumber: 43
                                                                                                }, this)
                                                                                            ]
                                                                                        }, val.valueId, true, {
                                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                            lineNumber: 1201,
                                                                                            columnNumber: 41
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1199,
                                                                                    columnNumber: 37
                                                                                }, this)
                                                                            ]
                                                                        }, carrier.carrierId, true, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1197,
                                                                            columnNumber: 35
                                                                        }, this);
                                                                    }),
                                                                    catalog.length === 0 && /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-muted-foreground text-center py-6",
                                                                        children: "Nenhuma operadora disponível"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1220,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1193,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1179,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1174,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1172,
                                                columnNumber: 19
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
                                                className: "glass-card rounded-2xl p-6 md:p-10 relative overflow-hidden",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-primary/5 blur-3xl pointer-events-none"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1234,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "text-center mb-8 relative",
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
                                                                    stiffness: 200,
                                                                    damping: 15
                                                                },
                                                                className: "w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
                                                                children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                    animate: {
                                                                        y: [
                                                                            0,
                                                                            -4,
                                                                            0
                                                                        ],
                                                                        scale: [
                                                                            1,
                                                                            1.08,
                                                                            1
                                                                        ]
                                                                    },
                                                                    transition: {
                                                                        repeat: Infinity,
                                                                        duration: 2.5,
                                                                        ease: "easeInOut"
                                                                    },
                                                                    children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                                        className: "h-9 w-9"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1246,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1242,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1237,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("h3", {
                                                                className: "font-display text-2xl md:text-3xl font-bold text-foreground",
                                                                children: "Qual o número?"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1249,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                className: "text-muted-foreground mt-1",
                                                                children: "Digite o DDD + Número do celular"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1250,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1236,
                                                        columnNumber: 21
                                                    }, this),
                                                    clipboardPhone && telefone.length === 0 && /*#__PURE__*/ _jsxDEV(motion.button, {
                                                        type: "button",
                                                        initial: {
                                                            opacity: 0,
                                                            y: -10
                                                        },
                                                        animate: {
                                                            opacity: 1,
                                                            y: 0
                                                        },
                                                        onClick: ()=>{
                                                            setTelefone(formatPhoneDisplay(clipboardPhone));
                                                            setClipboardPhone(null);
                                                        },
                                                        className: "w-full flex items-center justify-between rounded-xl px-4 py-3 mb-2 bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-all active:scale-[0.98]",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex items-center gap-3",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV(Copy, {
                                                                        className: "w-4 h-4 text-primary"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1261,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "text-left",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                                className: "text-xs font-medium text-primary",
                                                                                children: "Número detectado na área de transferência"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1263,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                                className: "text-base font-mono font-bold text-foreground",
                                                                                children: formatPhoneDisplay(clipboardPhone)
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1264,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1262,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1260,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                className: "text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary text-primary-foreground",
                                                                children: "Colar"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1267,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1255,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("form", {
                                                        onSubmit: handleRecarga,
                                                        className: "space-y-5 max-w-xl mx-auto relative",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                children: /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "flex flex-col sm:flex-row gap-2.5",
                                                                    children: /*#__PURE__*/ _jsxDEV("input", {
                                                                        type: "tel",
                                                                        value: telefone,
                                                                        onChange: (e)=>{
                                                                            const raw = e.target.value;
                                                                            const prevDigits = telefone.replace(/\D/g, "");
                                                                            // If user is deleting, just use raw value
                                                                            if (raw.length < telefone.length) {
                                                                                setTelefone(raw);
                                                                                // Reset detection if phone changed significantly
                                                                                const newDigits = raw.replace(/\D/g, "");
                                                                                if (newDigits.length < 11) {
                                                                                    setSelectedCarrier(null);
                                                                                    setDetectedOperatorName(null);
                                                                                    lastDetectedPhoneRef.current = "";
                                                                                }
                                                                            } else {
                                                                                // Extract digits and re-format
                                                                                const digits = raw.replace(/\D/g, "").slice(0, 11);
                                                                                setTelefone(formatPhoneDisplay(digits));
                                                                            }
                                                                            setPhoneCheckResult(null);
                                                                        },
                                                                        onPaste: (e)=>{
                                                                            e.preventDefault();
                                                                            const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 11);
                                                                            setTelefone(formatPhoneDisplay(digits));
                                                                            setPhoneCheckResult(null);
                                                                        },
                                                                        required: true,
                                                                        maxLength: 16,
                                                                        className: "flex-1 min-w-0 px-5 py-4 rounded-xl glass-input text-foreground placeholder:text-muted-foreground/60 text-xl tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono transition-all",
                                                                        placeholder: "(00) 00000-0000"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1275,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1274,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1273,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                                        className: "block text-sm font-semibold text-foreground mb-1.5",
                                                                        children: "Operadora"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1310,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("select", {
                                                                        value: selectedCarrier?.carrierId || "",
                                                                        onChange: (e)=>{
                                                                            const c = catalog.find((c)=>c.carrierId === e.target.value);
                                                                            setSelectedCarrier(c || null);
                                                                        },
                                                                        className: "w-full px-5 py-3.5 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none bg-[length:16px] bg-[right_16px_center] bg-no-repeat",
                                                                        style: {
                                                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2388888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 15 5 5 5-5'/%3E%3Cpath d='m7 9 5-5 5 5'/%3E%3C/svg%3E")`
                                                                        },
                                                                        children: [
                                                                            /*#__PURE__*/ _jsxDEV("option", {
                                                                                value: "",
                                                                                children: "Selecione..."
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1320,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            catalog.map((c)=>/*#__PURE__*/ _jsxDEV("option", {
                                                                                    value: c.carrierId,
                                                                                    children: c.name
                                                                                }, c.carrierId, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1321,
                                                                                    columnNumber: 47
                                                                                }, this))
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1311,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    selectedCarrier && telefone.replace(/\D/g, "").length >= 10 && !phoneCheckResult && /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                        initial: {
                                                                            opacity: 0,
                                                                            y: -3
                                                                        },
                                                                        animate: {
                                                                            opacity: 1,
                                                                            y: 0
                                                                        },
                                                                        className: "mt-3 p-3 rounded-xl bg-warning/10 border border-warning/25 flex items-center gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsxDEV(AlertTriangle, {
                                                                                className: "h-4 w-4 text-warning shrink-0"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1327,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                                className: "text-sm text-warning font-medium flex-1",
                                                                                children: "Verifique se o número está com blacklist ou cooldown ativo antes de recarregar."
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1328,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                                type: "button",
                                                                                onClick: handleCheckPhone,
                                                                                disabled: checkingPhone,
                                                                                className: "px-4 py-2 rounded-lg text-sm font-bold bg-warning/20 text-warning hover:bg-warning/30 border border-warning/30 transition-all shrink-0",
                                                                                children: checkingPhone ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                                                    className: "h-4 w-4 animate-spin"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1331,
                                                                                    columnNumber: 48
                                                                                }, this) : "Verificar"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1329,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1326,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    phoneCheckResult && /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                        initial: {
                                                                            opacity: 0,
                                                                            y: -5
                                                                        },
                                                                        animate: {
                                                                            opacity: 1,
                                                                            y: 0
                                                                        },
                                                                        className: `mt-2 p-3 rounded-xl text-sm font-medium flex items-start gap-2 ${phoneCheckResult.status === "CLEAR" ? "bg-success/10 text-success border border-success/20" : phoneCheckResult.status === "COOLDOWN" ? "bg-warning/10 text-warning border border-warning/20" : "bg-destructive/10 text-destructive border border-destructive/20"}`,
                                                                        children: [
                                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                                className: "mt-0.5 shrink-0",
                                                                                children: phoneCheckResult.status === "CLEAR" ? /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                                                                    className: "h-4 w-4"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1345,
                                                                                    columnNumber: 68
                                                                                }, this) : phoneCheckResult.status === "COOLDOWN" ? /*#__PURE__*/ _jsxDEV(Clock, {
                                                                                    className: "h-4 w-4"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1346,
                                                                                    columnNumber: 71
                                                                                }, this) : /*#__PURE__*/ _jsxDEV(AlertTriangle, {
                                                                                    className: "h-4 w-4"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1347,
                                                                                    columnNumber: 30
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1344,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                                className: "whitespace-pre-line",
                                                                                children: phoneCheckResult.message
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1349,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1338,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1309,
                                                                columnNumber: 23
                                                            }, this),
                                                            selectedCarrier?.extraField?.required && /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                initial: {
                                                                    opacity: 0,
                                                                    height: 0
                                                                },
                                                                animate: {
                                                                    opacity: 1,
                                                                    height: "auto"
                                                                },
                                                                transition: {
                                                                    duration: 0.2
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                                        className: "block text-sm font-semibold text-foreground mb-1.5",
                                                                        children: [
                                                                            selectedCarrier.extraField.title,
                                                                            " *"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1357,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                                        type: "text",
                                                                        value: extraData,
                                                                        onChange: (e)=>setExtraData(e.target.value),
                                                                        required: true,
                                                                        className: "w-full px-5 py-3.5 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all",
                                                                        placeholder: selectedCarrier.extraField.title
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1358,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1356,
                                                                columnNumber: 25
                                                            }, this),
                                                            selectedCarrier && selectedCarrier.values.length > 0 && /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                initial: {
                                                                    opacity: 0,
                                                                    y: 10
                                                                },
                                                                animate: {
                                                                    opacity: 1,
                                                                    y: 0
                                                                },
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                                        className: "block text-sm font-semibold text-foreground mb-2",
                                                                        children: "Valor"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1367,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "grid grid-cols-3 gap-2.5",
                                                                        children: selectedCarrier.values.sort((a, b)=>a.value - b.value).map((val, i)=>/*#__PURE__*/ _jsxDEV(motion.button, {
                                                                                type: "button",
                                                                                initial: {
                                                                                    opacity: 0,
                                                                                    scale: 0.9
                                                                                },
                                                                                animate: {
                                                                                    opacity: 1,
                                                                                    scale: 1
                                                                                },
                                                                                transition: {
                                                                                    delay: i * 0.04
                                                                                },
                                                                                whileTap: {
                                                                                    scale: 0.93
                                                                                },
                                                                                onClick: ()=>setSelectedValue(val),
                                                                                className: `py-3 rounded-xl text-sm font-bold border-2 transition-all ${selectedValue?.valueId === val.valueId ? "bg-primary text-primary-foreground border-primary glow-primary shadow-lg shadow-primary/20" : "border-border text-foreground hover:border-primary/30 hover:bg-primary/5 glass"}`,
                                                                                children: [
                                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                                        className: "text-base",
                                                                                        children: fmt(val.value)
                                                                                    }, void 0, false, {
                                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                        lineNumber: 1374,
                                                                                        columnNumber: 33
                                                                                    }, this),
                                                                                    val.label && val.label !== `R$ ${val.cost}` ? /*#__PURE__*/ _jsxDEV("div", {
                                                                                        className: "text-[10px] font-medium opacity-70 mt-0.5 truncate",
                                                                                        children: val.label
                                                                                    }, void 0, false, {
                                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                        lineNumber: 1376,
                                                                                        columnNumber: 35
                                                                                    }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                                                                        className: "text-[10px] font-medium opacity-70 mt-0.5",
                                                                                        children: [
                                                                                            "Paga ",
                                                                                            fmt(val.cost)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                        lineNumber: 1378,
                                                                                        columnNumber: 35
                                                                                    }, this)
                                                                                ]
                                                                            }, val.valueId, true, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1370,
                                                                                columnNumber: 31
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1368,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1366,
                                                                columnNumber: 25
                                                            }, this),
                                                            selectedValue && /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                initial: {
                                                                    opacity: 0,
                                                                    y: 8
                                                                },
                                                                animate: {
                                                                    opacity: 1,
                                                                    y: 0
                                                                },
                                                                className: "glass-card rounded-xl p-4 text-center border-primary/20",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-xs text-muted-foreground uppercase tracking-wider",
                                                                        children: "Resumo da Recarga"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1390,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-lg font-bold text-foreground mt-1",
                                                                        children: [
                                                                            selectedCarrier?.name,
                                                                            " — ",
                                                                            fmt(selectedValue.value)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1391,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-sm text-primary font-semibold",
                                                                        children: [
                                                                            "Custo: ",
                                                                            fmt(selectedValue.cost)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1392,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    selectedValue.cost > saldo && /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-xs text-destructive mt-1.5 font-semibold",
                                                                        children: "⚠️ Saldo insuficiente"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1394,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1388,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV(motion.button, {
                                                                type: "submit",
                                                                disabled: sending || !selectedValue || !selectedCarrier || selectedValue.cost > saldo || phoneCheckResult?.status === "BLACKLISTED",
                                                                whileTap: {
                                                                    scale: 0.97
                                                                },
                                                                className: "w-full py-4 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2.5",
                                                                children: sending ? /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                    animate: {
                                                                        rotate: 360
                                                                    },
                                                                    transition: {
                                                                        repeat: Infinity,
                                                                        duration: 1,
                                                                        ease: "linear"
                                                                    },
                                                                    className: "h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1402,
                                                                    columnNumber: 36
                                                                }, this) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV(Send, {
                                                                            className: "h-5 w-5"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1403,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        " Enviar Recarga →"
                                                                    ]
                                                                }, void 0, true)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1399,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1271,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                                        children: pendingWarning && /*#__PURE__*/ _jsxDEV(motion.div, {
                                                            initial: {
                                                                opacity: 0
                                                            },
                                                            animate: {
                                                                opacity: 1
                                                            },
                                                            exit: {
                                                                opacity: 0
                                                            },
                                                            className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4",
                                                            onClick: ()=>setPendingWarning(null),
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
                                                                    scale: 0.9
                                                                },
                                                                onClick: (e)=>e.stopPropagation(),
                                                                className: "w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 text-center",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "w-14 h-14 rounded-full bg-warning/15 border border-warning/30 flex items-center justify-center mx-auto mb-4",
                                                                        children: /*#__PURE__*/ _jsxDEV(AlertTriangle, {
                                                                            className: "h-7 w-7 text-warning"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1425,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1424,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("h3", {
                                                                        className: "text-lg font-bold text-foreground mb-2",
                                                                        children: "Recarga em Processamento"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1427,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-sm text-muted-foreground mb-5",
                                                                        children: [
                                                                            "Já existe ",
                                                                            /*#__PURE__*/ _jsxDEV("strong", {
                                                                                className: "text-foreground",
                                                                                children: [
                                                                                    pendingWarning.count,
                                                                                    " recarga",
                                                                                    pendingWarning.count > 1 ? "s" : ""
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1429,
                                                                                columnNumber: 41
                                                                            }, this),
                                                                            " em processamento para o número ",
                                                                            /*#__PURE__*/ _jsxDEV("strong", {
                                                                                className: "text-foreground",
                                                                                children: pendingWarning.phone
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1429,
                                                                                columnNumber: 185
                                                                            }, this),
                                                                            ". Deseja continuar mesmo assim?"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1428,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "flex gap-3",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                                onClick: ()=>setPendingWarning(null),
                                                                                className: "flex-1 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-colors",
                                                                                children: "Cancelar"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1432,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                                onClick: ()=>{
                                                                                    setPendingWarning(null);
                                                                                    handleRecarga({
                                                                                        preventDefault: ()=>{}
                                                                                    }, true);
                                                                                },
                                                                                className: "flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all",
                                                                                children: "Continuar"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1438,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1431,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1417,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1410,
                                                            columnNumber: 25
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1408,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1229,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "glass-card rounded-2xl overflow-hidden",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "px-5 py-4 border-b border-border flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("h3", {
                                                                className: "font-display text-xl font-bold text-foreground",
                                                                children: "Últimas Recargas"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1457,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>selectTab("historico"),
                                                                className: "text-primary font-semibold text-sm hover:opacity-80",
                                                                children: "Ver todas"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1458,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1456,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        children: recargas.slice(0, 5).length === 0 ? /*#__PURE__*/ _jsxDEV("p", {
                                                            className: "py-8 text-center text-muted-foreground",
                                                            children: "Nenhuma recarga ainda"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1462,
                                                            columnNumber: 25
                                                        }, this) : recargas.slice(0, 5).map((r, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                                                                initial: {
                                                                    opacity: 0,
                                                                    x: -20
                                                                },
                                                                animate: {
                                                                    opacity: 1,
                                                                    x: 0
                                                                },
                                                                transition: {
                                                                    delay: i * 0.07,
                                                                    duration: 0.3
                                                                },
                                                                onClick: ()=>r.status === "completed" || r.status === "concluida" ? setReceiptRecarga(r) : null,
                                                                className: `px-5 py-4 border-b border-border last:border-0 flex items-center gap-3 transition-colors ${r.status === "completed" || r.status === "concluida" ? "hover:bg-muted/20 cursor-pointer active:bg-muted/30" : "hover:bg-muted/20"}`,
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: `w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${r.status === "completed" || r.status === "concluida" ? "bg-success/15" : r.status === "pending" ? "bg-warning/15" : r.status === "falha" ? "bg-destructive/15" : "bg-muted/50"}`,
                                                                        children: r.status === "completed" || r.status === "concluida" ? /*#__PURE__*/ _jsxDEV(AnimatedCheck, {
                                                                            size: 24,
                                                                            className: "text-success"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1472,
                                                                            columnNumber: 31
                                                                        }, this) : r.status === "pending" ? /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                            animate: {
                                                                                rotate: 360
                                                                            },
                                                                            transition: {
                                                                                repeat: Infinity,
                                                                                duration: 2,
                                                                                ease: "linear"
                                                                            },
                                                                            children: /*#__PURE__*/ _jsxDEV(Loader2, {
                                                                                className: "h-6 w-6 text-warning"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1475,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1474,
                                                                            columnNumber: 31
                                                                        }, this) : r.status === "falha" ? /*#__PURE__*/ _jsxDEV(motion.div, {
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
                                                                                className: "h-6 w-6 text-destructive drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1486,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1478,
                                                                            columnNumber: 31
                                                                        }, this) : /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                                            className: "h-5 w-5 text-muted-foreground"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1489,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1468,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "min-w-0 flex-1",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                                className: "flex items-center gap-2",
                                                                                children: /*#__PURE__*/ _jsxDEV("span", {
                                                                                    className: `text-xs font-bold px-2 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`,
                                                                                    children: r.operadora || "Operadora"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1494,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1493,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                                className: "text-sm text-muted-foreground font-mono",
                                                                                children: r.telefone
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1496,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                                className: "text-[10px] text-muted-foreground/60 mt-0.5",
                                                                                children: fmtDate(r.created_at)
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1497,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1492,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "text-right shrink-0",
                                                                        children: [
                                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                                className: "font-bold text-foreground",
                                                                                children: fmt(safeValor(r))
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1500,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                                className: `text-xs font-medium ${r.status === "completed" || r.status === "concluida" ? "text-success" : r.status === "pending" ? "text-warning" : r.status === "falha" ? "text-destructive" : "text-muted-foreground"}`,
                                                                                children: r.status === "completed" || r.status === "concluida" ? "Concluída" : r.status === "pending" ? "Processando" : r.status === "falha" ? "Falha" : r.status
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1501,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            (r.status === "completed" || r.status === "concluida") && /*#__PURE__*/ _jsxDEV("div", {
                                                                                className: "mt-1",
                                                                                children: /*#__PURE__*/ _jsxDEV("span", {
                                                                                    className: "text-[10px] text-primary/70 font-medium",
                                                                                    children: "📄 Ver comprovante"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1506,
                                                                                    columnNumber: 33
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1505,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1499,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, r.id, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1464,
                                                                columnNumber: 25
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1460,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1455,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true)
                                ]
                            }, void 0, true),
                            tab === "addSaldo" && /*#__PURE__*/ _jsxDEV(AddSaldoSection, {
                                saldo: saldo,
                                fmt: fmt,
                                fmtDate: fmtDate,
                                transactions: transactions,
                                userEmail: user?.email,
                                userName: userLabel,
                                onDeposited: fetchData,
                                fetchTransactions: fetchTransactions,
                                resellerId: resellerId,
                                saldoTipo: (role === "admin" || role === "revendedor") && !isClientMode ? "pessoal" : "revenda"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 1520,
                                columnNumber: 34
                            }, this),
                            tab === "historico" && /*#__PURE__*/ _jsxDEV(_Fragment, {
                                children: (()=>{
                                    const operadoras = Array.from(new Set(recargas.map((r)=>r.operadora).filter(Boolean)));
                                    const filtered = recargas.filter((r)=>{
                                        if (histStatus !== "all") {
                                            if (histStatus === "completed" && r.status !== "completed" && r.status !== "concluida") return false;
                                            if (histStatus === "pending" && r.status !== "pending") return false;
                                            if (histStatus === "falha" && r.status !== "falha") return false;
                                        }
                                        if (histOperadora !== "all" && r.operadora !== histOperadora) return false;
                                        if (histSearch && !r.telefone.includes(histSearch.replace(/\D/g, ""))) return false;
                                        return true;
                                    });
                                    return /*#__PURE__*/ _jsxDEV(_Fragment, {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex flex-col sm:flex-row gap-3 mb-1",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "relative flex-1",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV(Search, {
                                                                className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1543,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("input", {
                                                                type: "text",
                                                                placeholder: "Buscar por telefone...",
                                                                value: histSearch,
                                                                onChange: (e)=>setHistSearch(e.target.value),
                                                                className: "w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1544,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1542,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("select", {
                                                        value: histStatus,
                                                        onChange: (e)=>setHistStatus(e.target.value),
                                                        className: "px-3 py-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("option", {
                                                                value: "all",
                                                                children: "Todos os status"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1557,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("option", {
                                                                value: "completed",
                                                                children: "Concluída"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1558,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("option", {
                                                                value: "pending",
                                                                children: "Processando"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1559,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("option", {
                                                                value: "falha",
                                                                children: "Falha"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1560,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1552,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("select", {
                                                        value: histOperadora,
                                                        onChange: (e)=>setHistOperadora(e.target.value),
                                                        className: "px-3 py-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("option", {
                                                                value: "all",
                                                                children: "Todas operadoras"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1567,
                                                                columnNumber: 25
                                                            }, this),
                                                            operadoras.map((op)=>/*#__PURE__*/ _jsxDEV("option", {
                                                                    value: op,
                                                                    children: op
                                                                }, op, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1568,
                                                                    columnNumber: 47
                                                                }, this))
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1562,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1541,
                                                columnNumber: 21
                                            }, this),
                                            histSearch || histStatus !== "all" || histOperadora !== "all" ? /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-2 text-xs text-muted-foreground mb-1",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(Filter, {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1574,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        children: [
                                                            filtered.length,
                                                            " de ",
                                                            recargas.length,
                                                            " resultados"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1575,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("button", {
                                                        onClick: ()=>{
                                                            setHistSearch("");
                                                            setHistStatus("all");
                                                            setHistOperadora("all");
                                                        },
                                                        className: "ml-auto text-primary hover:underline text-xs",
                                                        children: "Limpar filtros"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1576,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1573,
                                                columnNumber: 23
                                            }, this) : null,
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "md:hidden space-y-2",
                                                children: filtered.length === 0 ? /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-center py-8 text-muted-foreground",
                                                    children: "Nenhuma recarga encontrada"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1584,
                                                    columnNumber: 25
                                                }, this) : (()=>{
                                                    let lastDate = "";
                                                    return filtered.map((r, i)=>{
                                                        const dateLabel = formatDateLongUpperBR(r.created_at);
                                                        const showSep = dateLabel !== lastDate;
                                                        lastDate = dateLabel;
                                                        const statusLabel = r.status === "completed" || r.status === "concluida" ? "Concluída" : r.status === "pending" ? "Processando" : r.status === "falha" ? "Falha" : r.status;
                                                        const statusClass = r.status === "completed" || r.status === "concluida" ? "bg-success/15 text-success" : r.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                                                        return /*#__PURE__*/ _jsxDEV("div", {
                                                            children: [
                                                                showSep && /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "flex justify-center my-2",
                                                                    children: /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-[10px] bg-muted/60 text-muted-foreground px-3 py-0.5 rounded-full font-medium",
                                                                        children: dateLabel
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1597,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1596,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                    initial: {
                                                                        opacity: 0,
                                                                        y: 8
                                                                    },
                                                                    animate: {
                                                                        opacity: 1,
                                                                        y: 0
                                                                    },
                                                                    transition: {
                                                                        delay: i * 0.03
                                                                    },
                                                                    className: "glass-card rounded-xl p-4 cursor-pointer hover:bg-muted/30 active:scale-[0.98] transition-all",
                                                                    onClick: ()=>setSelectedRecarga(r),
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                                            className: "flex items-center justify-between mb-3",
                                                                            children: [
                                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                                    className: "flex items-center gap-3",
                                                                                    children: [
                                                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                                                            className: `w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${r.status === "completed" || r.status === "concluida" ? "bg-success/15" : r.status === "pending" ? "bg-warning/15" : r.status === "falha" ? "bg-destructive/15" : "bg-muted/50"}`,
                                                                                            children: r.status === "completed" || r.status === "concluida" ? /*#__PURE__*/ _jsxDEV(AnimatedCheck, {
                                                                                                size: 28,
                                                                                                className: "text-success"
                                                                                            }, void 0, false, {
                                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                lineNumber: 1609,
                                                                                                columnNumber: 41
                                                                                            }, this) : r.status === "pending" ? /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                                                animate: {
                                                                                                    rotate: 360
                                                                                                },
                                                                                                transition: {
                                                                                                    repeat: Infinity,
                                                                                                    duration: 2,
                                                                                                    ease: "linear"
                                                                                                },
                                                                                                children: /*#__PURE__*/ _jsxDEV(Loader2, {
                                                                                                    className: "h-7 w-7 text-warning"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                    lineNumber: 1612,
                                                                                                    columnNumber: 43
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                lineNumber: 1611,
                                                                                                columnNumber: 41
                                                                                            }, this) : r.status === "falha" ? /*#__PURE__*/ _jsxDEV(motion.div, {
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
                                                                                                    className: "h-7 w-7 text-destructive drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                    lineNumber: 1616,
                                                                                                    columnNumber: 43
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                lineNumber: 1615,
                                                                                                columnNumber: 41
                                                                                            }, this) : /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                                                                className: "h-6 w-6 text-muted-foreground"
                                                                                            }, void 0, false, {
                                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                lineNumber: 1619,
                                                                                                columnNumber: 41
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                            lineNumber: 1605,
                                                                                            columnNumber: 37
                                                                                        }, this),
                                                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                                                            children: [
                                                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                                                    className: `text-xs font-bold px-2 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`,
                                                                                                    children: r.operadora || "Operadora"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                    lineNumber: 1623,
                                                                                                    columnNumber: 39
                                                                                                }, this),
                                                                                                /*#__PURE__*/ _jsxDEV("p", {
                                                                                                    className: "text-xs text-muted-foreground font-mono",
                                                                                                    children: r.telefone
                                                                                                }, void 0, false, {
                                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                    lineNumber: 1624,
                                                                                                    columnNumber: 39
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                            lineNumber: 1622,
                                                                                            columnNumber: 37
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1604,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                                    className: `px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`,
                                                                                    children: statusLabel
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1627,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1603,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                                            className: "flex items-center justify-between pt-3 border-t border-border",
                                                                            children: [
                                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                                    className: "text-xs text-muted-foreground",
                                                                                    children: fmtDate(r.created_at)
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1630,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                                    className: "flex items-center gap-2",
                                                                                    children: [
                                                                                        (r.status === "completed" || r.status === "concluida") && /*#__PURE__*/ _jsxDEV("button", {
                                                                                            onClick: (e)=>{
                                                                                                e.stopPropagation();
                                                                                                setReceiptRecarga(r);
                                                                                            },
                                                                                            className: "flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 text-success text-[10px] font-semibold hover:bg-success/20 transition-colors",
                                                                                            children: [
                                                                                                /*#__PURE__*/ _jsxDEV(FileText, {
                                                                                                    className: "h-3 w-3"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                                    lineNumber: 1637,
                                                                                                    columnNumber: 41
                                                                                                }, this),
                                                                                                " Comprovante"
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                            lineNumber: 1633,
                                                                                            columnNumber: 39
                                                                                        }, this),
                                                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                                                            className: "font-bold font-mono text-foreground",
                                                                                            children: fmt(safeValor(r))
                                                                                        }, void 0, false, {
                                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                            lineNumber: 1640,
                                                                                            columnNumber: 37
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1631,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1629,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1600,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, r.id, true, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1594,
                                                            columnNumber: 29
                                                        }, this);
                                                    });
                                                })()
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1582,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "hidden md:block glass-card rounded-xl overflow-hidden",
                                                children: /*#__PURE__*/ _jsxDEV("table", {
                                                    className: "w-full text-sm",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("thead", {
                                                            children: /*#__PURE__*/ _jsxDEV("tr", {
                                                                className: "border-b border-border bg-muted/50",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("th", {
                                                                        className: "text-left px-4 py-3 font-medium text-muted-foreground",
                                                                        children: "Data"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1654,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("th", {
                                                                        className: "text-left px-4 py-3 font-medium text-muted-foreground",
                                                                        children: "Telefone"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1655,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("th", {
                                                                        className: "text-left px-4 py-3 font-medium text-muted-foreground",
                                                                        children: "Operadora"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1656,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("th", {
                                                                        className: "text-right px-4 py-3 font-medium text-muted-foreground",
                                                                        children: "Valor"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1657,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("th", {
                                                                        className: "text-center px-4 py-3 font-medium text-muted-foreground",
                                                                        children: "Status"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1658,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1653,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1652,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("tbody", {
                                                            children: filtered.length === 0 ? /*#__PURE__*/ _jsxDEV("tr", {
                                                                children: /*#__PURE__*/ _jsxDEV("td", {
                                                                    colSpan: 5,
                                                                    className: "text-center py-8 text-muted-foreground",
                                                                    children: "Nenhuma recarga encontrada"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1663,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1663,
                                                                columnNumber: 29
                                                            }, this) : filtered.map((r, i)=>/*#__PURE__*/ _jsxDEV(motion.tr, {
                                                                    initial: {
                                                                        opacity: 0,
                                                                        y: 8
                                                                    },
                                                                    animate: {
                                                                        opacity: 1,
                                                                        y: 0
                                                                    },
                                                                    transition: {
                                                                        delay: i * 0.03
                                                                    },
                                                                    className: "border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer",
                                                                    onClick: ()=>setSelectedRecarga(r),
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("td", {
                                                                            className: "px-4 py-3 text-muted-foreground whitespace-nowrap",
                                                                            children: fmtDate(r.created_at)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1668,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("td", {
                                                                            className: "px-4 py-3 font-mono text-foreground",
                                                                            children: r.telefone
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1669,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("td", {
                                                                            className: "px-4 py-3",
                                                                            children: /*#__PURE__*/ _jsxDEV("span", {
                                                                                className: `text-xs font-bold px-2 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`,
                                                                                children: r.operadora || "—"
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1670,
                                                                                columnNumber: 57
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1670,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("td", {
                                                                            className: "px-4 py-3 text-right font-mono font-medium text-foreground",
                                                                            children: fmt(safeValor(r))
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1671,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("td", {
                                                                            className: "px-4 py-3 text-center",
                                                                            children: /*#__PURE__*/ _jsxDEV("span", {
                                                                                className: `inline-block px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "completed" || r.status === "concluida" ? "bg-success/15 text-success" : r.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`,
                                                                                children: r.status === "completed" || r.status === "concluida" ? "Concluída" : r.status === "pending" ? "Processando" : r.status
                                                                            }, void 0, false, {
                                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                lineNumber: 1673,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1672,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, r.id, true, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1665,
                                                                    columnNumber: 29
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1661,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1651,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1650,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true);
                                })()
                            }, void 0, false),
                            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                children: selectedRecarga && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0
                                    },
                                    animate: {
                                        opacity: 1
                                    },
                                    exit: {
                                        opacity: 0
                                    },
                                    className: "fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4",
                                    onClick: ()=>setSelectedRecarga(null),
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
                                            scale: 0.9
                                        },
                                        onClick: (e)=>e.stopPropagation(),
                                        className: "w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden",
                                        children: (()=>{
                                            const r = selectedRecarga;
                                            const isCompleted = r.status === "completed" || r.status === "concluida";
                                            const isPending = r.status === "pending";
                                            const statusLabel = isCompleted ? "Concluída" : isPending ? "Processando" : r.status === "falha" ? "Falha" : r.status;
                                            const statusClass = isCompleted ? "bg-success/15 text-success border-success/30" : isPending ? "bg-warning/15 text-warning border-warning/30" : "bg-destructive/15 text-destructive border-destructive/30";
                                            const statusIcon = isCompleted ? /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                                className: "h-8 w-8 text-success"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1712,
                                                columnNumber: 54
                                            }, this) : isPending ? /*#__PURE__*/ _jsxDEV(Clock, {
                                                className: "h-8 w-8 text-warning"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1712,
                                                columnNumber: 118
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
                                                    className: "h-8 w-8 text-destructive drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1712,
                                                    columnNumber: 336
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1712,
                                                columnNumber: 163
                                            }, this);
                                            return /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "px-6 pt-6 pb-4 text-center",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3",
                                                                children: statusIcon
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1716,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("h3", {
                                                                className: "text-lg font-bold text-foreground mb-1",
                                                                children: "Detalhes do Pedido"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1719,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                className: `inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusClass}`,
                                                                children: statusLabel
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1720,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1715,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "px-6 pb-5 space-y-3",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex justify-between items-center py-2 border-b border-border",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm text-muted-foreground",
                                                                        children: "Telefone"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1724,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm font-mono font-semibold text-foreground",
                                                                        children: r.telefone
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1725,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1723,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex justify-between items-center py-2 border-b border-border",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm text-muted-foreground",
                                                                        children: "Operadora"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1728,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: `text-sm font-bold px-2.5 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`,
                                                                        children: r.operadora || "—"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1729,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1727,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex justify-between items-center py-2 border-b border-border",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm text-muted-foreground",
                                                                        children: "Valor da Recarga"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1732,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm font-mono font-bold text-foreground",
                                                                        children: fmt(safeValor(r))
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1733,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1731,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex justify-between items-center py-2 border-b border-border",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm text-muted-foreground",
                                                                        children: "Custo (debitado)"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1736,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm font-mono font-semibold text-foreground",
                                                                        children: fmt(r.custo)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1737,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1735,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex justify-between items-center py-2 border-b border-border",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm text-muted-foreground",
                                                                        children: "Data"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1740,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm text-foreground",
                                                                        children: fmtDate(r.created_at)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1741,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1739,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "flex justify-between items-center py-2",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-sm text-muted-foreground",
                                                                        children: "ID"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1744,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-[10px] font-mono text-muted-foreground/70 max-w-[160px] truncate",
                                                                        children: r.id
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1745,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1743,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1722,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "px-6 pb-5 flex gap-3",
                                                        children: [
                                                            isCompleted && /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>{
                                                                    setSelectedRecarga(null);
                                                                    setReceiptRecarga(r);
                                                                },
                                                                className: "flex-1 py-3 rounded-xl border border-success text-success font-semibold text-sm hover:bg-success/10 transition-all flex items-center justify-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV(FileText, {
                                                                        className: "h-4 w-4"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1754,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    " Comprovante"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1750,
                                                                columnNumber: 29
                                                            }, this),
                                                            r.external_id && /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>{
                                                                    setSelectedRecarga(null);
                                                                    handleTrackRecharge(r.external_id, r);
                                                                },
                                                                className: "flex-1 py-3 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV(Activity, {
                                                                        className: "h-4 w-4"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1762,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    " Acompanhar"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1758,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>setSelectedRecarga(null),
                                                                className: "flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all",
                                                                children: "Fechar"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1765,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1748,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true);
                                        })()
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 1699,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 1692,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 1690,
                                columnNumber: 11
                            }, this),
                            receiptRecarga && /*#__PURE__*/ _jsxDEV(RecargaReceipt, {
                                recarga: receiptRecarga,
                                open: !!receiptRecarga,
                                onClose: ()=>setReceiptRecarga(null),
                                storeName: profileNome || "Recargas Brasil",
                                userId: user?.id
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 1780,
                                columnNumber: 13
                            }, this),
                            tab === "extrato" && /*#__PURE__*/ _jsxDEV(_Fragment, {
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "md:hidden space-y-2",
                                        children: transLoading ? /*#__PURE__*/ _jsxDEV("div", {
                                            className: "space-y-2",
                                            children: [
                                                1,
                                                2,
                                                3
                                            ].map((i)=>/*#__PURE__*/ _jsxDEV(SkeletonRow, {}, i, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1793,
                                                    columnNumber: 64
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 1793,
                                            columnNumber: 19
                                        }, this) : transactions.length === 0 ? /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-center py-8 text-muted-foreground",
                                            children: "Nenhuma transação encontrada"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 1795,
                                            columnNumber: 19
                                        }, this) : (()=>{
                                            let lastDate = "";
                                            return transactions.map((t, i)=>{
                                                const dateLabel = formatDateLongUpperBR(t.created_at);
                                                const showSep = dateLabel !== lastDate;
                                                lastDate = dateLabel;
                                                const isDeposit = t.type === "deposit" || t.type === "deposito";
                                                const statusLabel = t.status === "completed" || t.status === "confirmado" ? "Confirmado" : t.status === "pending" ? "Processando" : t.status;
                                                const statusClass = t.status === "completed" || t.status === "confirmado" ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                                                return /*#__PURE__*/ _jsxDEV("div", {
                                                    children: [
                                                        showSep && /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex justify-center my-2",
                                                            children: /*#__PURE__*/ _jsxDEV("span", {
                                                                className: "text-[10px] bg-muted/60 text-muted-foreground px-3 py-0.5 rounded-full font-medium",
                                                                children: dateLabel
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1809,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1808,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV(motion.div, {
                                                            initial: {
                                                                opacity: 0,
                                                                y: 8
                                                            },
                                                            animate: {
                                                                opacity: 1,
                                                                y: 0
                                                            },
                                                            transition: {
                                                                delay: i * 0.03
                                                            },
                                                            className: "glass-card rounded-xl p-4",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "flex items-center justify-between mb-3",
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                                            children: [
                                                                                /*#__PURE__*/ _jsxDEV("p", {
                                                                                    className: "font-semibold text-foreground text-sm capitalize",
                                                                                    children: isDeposit ? "Depósito" : t.type
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1816,
                                                                                    columnNumber: 31
                                                                                }, this),
                                                                                /*#__PURE__*/ _jsxDEV("p", {
                                                                                    className: "text-xs text-muted-foreground",
                                                                                    children: "PIX"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                                    lineNumber: 1817,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1815,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                                            className: `px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`,
                                                                            children: statusLabel
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1819,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1814,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "flex items-center justify-between pt-3 border-t border-border",
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                                            className: "text-xs text-muted-foreground",
                                                                            children: fmtDate(t.created_at)
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1822,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                                            className: `font-bold font-mono ${isDeposit ? "text-success" : "text-foreground"}`,
                                                                            children: [
                                                                                isDeposit ? "+" : "-",
                                                                                fmt(t.amount)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                            lineNumber: 1823,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1821,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1812,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, t.id, true, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1806,
                                                    columnNumber: 23
                                                }, this);
                                            });
                                        })()
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 1791,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "hidden md:block glass-card rounded-xl overflow-hidden",
                                        children: /*#__PURE__*/ _jsxDEV("table", {
                                            className: "w-full text-sm",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("thead", {
                                                    children: /*#__PURE__*/ _jsxDEV("tr", {
                                                        className: "border-b border-border bg-muted/50",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("th", {
                                                                className: "text-left px-4 py-3 font-medium text-muted-foreground",
                                                                children: "Data"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1838,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("th", {
                                                                className: "text-left px-4 py-3 font-medium text-muted-foreground",
                                                                children: "Tipo"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1839,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("th", {
                                                                className: "text-left px-4 py-3 font-medium text-muted-foreground",
                                                                children: "Módulo"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1840,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("th", {
                                                                className: "text-right px-4 py-3 font-medium text-muted-foreground",
                                                                children: "Valor"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1841,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("th", {
                                                                className: "text-center px-4 py-3 font-medium text-muted-foreground",
                                                                children: "Status"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1842,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1837,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1836,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("tbody", {
                                                    children: transLoading ? /*#__PURE__*/ _jsxDEV("tr", {
                                                        children: /*#__PURE__*/ _jsxDEV("td", {
                                                            colSpan: 5,
                                                            className: "py-4",
                                                            children: /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "space-y-2",
                                                                children: [
                                                                    1,
                                                                    2,
                                                                    3
                                                                ].map((i)=>/*#__PURE__*/ _jsxDEV(SkeletonRow, {}, i, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1847,
                                                                        columnNumber: 105
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1847,
                                                                columnNumber: 60
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1847,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1847,
                                                        columnNumber: 23
                                                    }, this) : transactions.length === 0 ? /*#__PURE__*/ _jsxDEV("tr", {
                                                        children: /*#__PURE__*/ _jsxDEV("td", {
                                                            colSpan: 5,
                                                            className: "text-center py-8 text-muted-foreground",
                                                            children: "Nenhuma transação encontrada"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1849,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1849,
                                                        columnNumber: 23
                                                    }, this) : transactions.map((t, i)=>/*#__PURE__*/ _jsxDEV(motion.tr, {
                                                            initial: {
                                                                opacity: 0,
                                                                y: 8
                                                            },
                                                            animate: {
                                                                opacity: 1,
                                                                y: 0
                                                            },
                                                            transition: {
                                                                delay: i * 0.03
                                                            },
                                                            className: "border-b border-border last:border-0 hover:bg-muted/30 transition-colors",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("td", {
                                                                    className: "px-4 py-3 text-muted-foreground whitespace-nowrap",
                                                                    children: fmtDate(t.created_at)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1853,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("td", {
                                                                    className: "px-4 py-3 text-foreground capitalize",
                                                                    children: t.type === "deposit" || t.type === "deposito" ? "Depósito" : t.type === "withdrawal" ? "Saque" : t.type
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1854,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("td", {
                                                                    className: "px-4 py-3 text-foreground",
                                                                    children: "PIX"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1855,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("td", {
                                                                    className: `px-4 py-3 text-right font-mono font-medium ${t.type === "deposit" || t.type === "deposito" ? "text-success" : "text-foreground"}`,
                                                                    children: [
                                                                        t.type === "deposit" || t.type === "deposito" ? "+" : "-",
                                                                        fmt(t.amount)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1856,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("td", {
                                                                    className: "px-4 py-3 text-center",
                                                                    children: /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: `inline-block px-2 py-0.5 rounded-full text-xs font-medium ${t.status === "completed" || t.status === "confirmado" ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`,
                                                                        children: t.status === "completed" || t.status === "confirmado" ? "Confirmado" : t.status === "pending" ? "Processando" : t.status === "expired" ? "Expirado" : t.status === "failed" ? "Falhou" : t.status === "cancelled" ? "Cancelado" : t.status
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1860,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1859,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, t.id, true, {
                                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                            lineNumber: 1851,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 1845,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 1835,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 1834,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            tab === "contatos" && /*#__PURE__*/ _jsxDEV(ProfileTab, {
                                user: user,
                                role: role,
                                avatarUrl: avatarUrl,
                                avatarError: avatarError,
                                setAvatarError: setAvatarError,
                                userLabel: userLabel,
                                userInitial: userInitial,
                                profileNome: profileNome,
                                setProfileNome: setProfileNome,
                                saldo: saldo,
                                loading: loading,
                                fmt: fmt,
                                telegramLinked: telegramLinked,
                                telegramUsername: telegramUsername,
                                whatsappNumber: whatsappNumber,
                                uploadingAvatar: uploadingAvatar,
                                handleAvatarUpload: handleAvatarUpload,
                                recargas: recargas,
                                recargasHoje: recargasHoje,
                                totalRecargas: recargas.length,
                                selectTab: selectTab,
                                navigate: navigate
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 1875,
                                columnNumber: 13
                            }, this),
                            tab === "status" && /*#__PURE__*/ _jsxDEV(motion.div, {
                                initial: {
                                    opacity: 0,
                                    y: 20
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                className: "space-y-5",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("h2", {
                                                className: "text-lg font-bold text-foreground",
                                                children: "Status do Sistema"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1907,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "Tempo médio de processamento das recargas por operadora."
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1908,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 1906,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                                        children: (statusData?.operatorStats || []).map((op, i)=>{
                                            const fmtTime = (s)=>{
                                                if (!s || s <= 0) return "—";
                                                const mins = Math.floor(s / 60);
                                                const secs = Math.round(s % 60);
                                                return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                                            };
                                            const opName = op.operadora.toUpperCase();
                                            const opColor = opName === "CLARO" ? "text-red-400" : opName === "TIM" ? "text-blue-400" : opName === "VIVO" ? "text-purple-400" : "text-muted-foreground";
                                            const avgColor = op.avgRecent <= 120 ? "text-emerald-400" : op.avgRecent <= 300 ? "text-yellow-400" : "text-red-400";
                                            return /*#__PURE__*/ _jsxDEV(motion.div, {
                                                initial: {
                                                    opacity: 0,
                                                    y: 15
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0
                                                },
                                                transition: {
                                                    delay: i * 0.1
                                                },
                                                className: "glass-card rounded-xl p-5 space-y-3",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center",
                                                                children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                                    animate: opName === "CLARO" ? {
                                                                        scale: [
                                                                            1,
                                                                            1.15,
                                                                            1
                                                                        ]
                                                                    } : opName === "TIM" ? {
                                                                        y: [
                                                                            0,
                                                                            -3,
                                                                            0
                                                                        ]
                                                                    } : {
                                                                        rotate: [
                                                                            0,
                                                                            8,
                                                                            -8,
                                                                            0
                                                                        ]
                                                                    },
                                                                    transition: {
                                                                        repeat: Infinity,
                                                                        duration: 2,
                                                                        ease: "easeInOut",
                                                                        delay: i * 0.15
                                                                    },
                                                                    children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                                        className: `h-5 w-5 ${opColor}`
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1936,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                    lineNumber: 1928,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1927,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: `font-bold text-base ${opColor}`,
                                                                        children: op.operadora
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1940,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-[10px] text-muted-foreground",
                                                                        children: [
                                                                            "Baseado nas últimas ",
                                                                            op.recentCount,
                                                                            " recargas"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1941,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1939,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1926,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                className: "text-[10px] text-muted-foreground uppercase tracking-wider",
                                                                children: "Média Atual (Recente)"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1946,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                className: `text-2xl font-black ${avgColor}`,
                                                                children: fmtTime(op.avgRecent)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1947,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1945,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "grid grid-cols-3 gap-2 pt-2 border-t border-border/30",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-[10px] text-muted-foreground uppercase",
                                                                        children: "Mínimo (24h)"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1952,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-sm font-semibold text-foreground",
                                                                        children: fmtTime(op.min24h)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1953,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1951,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-[10px] text-muted-foreground uppercase",
                                                                        children: "Média (24h)"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1956,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-sm font-semibold text-foreground",
                                                                        children: fmtTime(op.avg24h)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1957,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1955,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-[10px] text-muted-foreground uppercase",
                                                                        children: "Máximo (24h)"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1960,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-sm font-semibold text-foreground",
                                                                        children: fmtTime(op.max24h)
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                        lineNumber: 1961,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                                lineNumber: 1959,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1950,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, op.operadora, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1924,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 1912,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "grid grid-cols-2 md:grid-cols-4 gap-3",
                                        children: [
                                            {
                                                icon: Server,
                                                label: "Servidor",
                                                status: true,
                                                anim: "pulse"
                                            },
                                            {
                                                icon: Database,
                                                label: "Banco",
                                                status: statusData?.dbOnline ?? false,
                                                anim: "float"
                                            },
                                            {
                                                icon: Shield,
                                                label: "Auth",
                                                status: statusData?.authOnline ?? false,
                                                anim: "wiggle"
                                            },
                                            {
                                                icon: Wifi,
                                                label: "API",
                                                status: catalog.length > 0,
                                                anim: "bounce"
                                            }
                                        ].map((item, i)=>/*#__PURE__*/ _jsxDEV("div", {
                                                className: "glass-card rounded-xl p-3 flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: `w-2 h-2 rounded-full ${item.status ? "bg-success animate-pulse" : "bg-destructive"}`
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1978,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV(AnimatedIcon, {
                                                        icon: item.icon,
                                                        className: `h-4 w-4 ${item.status ? "text-success" : "text-destructive"}`,
                                                        animation: item.anim,
                                                        delay: i * 0.1
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1979,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-xs font-medium text-foreground",
                                                        children: item.label
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1980,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, item.label, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1977,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 1970,
                                        columnNumber: 15
                                    }, this),
                                    statusData && /*#__PURE__*/ _jsxDEV("div", {
                                        className: "glass-card rounded-xl p-4 grid grid-cols-3 gap-4 text-center",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: "Operadoras"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1988,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xl font-bold text-foreground",
                                                        children: catalog.length || statusData.operadorasCount
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1989,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1987,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: "Total recargas"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1992,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xl font-bold text-foreground",
                                                        children: statusData.recargasTotal
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1993,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1991,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: "Última"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1996,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xs font-medium text-foreground",
                                                        children: statusData.lastRecarga ? fmtDate(statusData.lastRecarga) : "—"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                        lineNumber: 1997,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 1995,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 1986,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 1904,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 964,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 916,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(FloatingPoll, {}, void 0, false, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 2007,
                columnNumber: 7
            }, this),
            cropFile && /*#__PURE__*/ _jsxDEV(ImageCropper, {
                file: cropFile,
                onCrop: async (blob)=>{
                    setCropFile(null);
                    await uploadAvatarFile(blob);
                },
                onCancel: ()=>setCropFile(null)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 2011,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ _jsxDEV(MobileBottomNav, {
                items: [
                    {
                        key: "recarga",
                        label: "Recarga",
                        icon: Send,
                        color: "text-primary",
                        animation: "bounce"
                    },
                    {
                        key: "historico",
                        label: "Pedidos",
                        icon: History,
                        color: "text-warning",
                        animation: "wiggle"
                    },
                    {
                        key: "addSaldo",
                        label: "Saldo",
                        icon: CreditCard,
                        color: "text-success",
                        animation: "pulse",
                        highlighted: true
                    },
                    {
                        key: "chat",
                        label: "Bate-papo",
                        icon: MessageCircle,
                        color: "text-primary",
                        animation: "float"
                    },
                    {
                        key: "contatos",
                        label: "Perfil",
                        icon: User,
                        color: "text-accent",
                        animation: "float"
                    },
                    {
                        key: "extrato",
                        label: "Extrato",
                        icon: Landmark,
                        color: "text-success",
                        animation: "bounce"
                    },
                    {
                        key: "status",
                        label: "Status",
                        icon: Activity,
                        color: "text-warning",
                        animation: "pulse"
                    }
                ],
                activeKey: tab,
                onSelect: (key)=>{
                    if (key === "chat") {
                        navigate("/chat");
                        return;
                    }
                    selectTab(key);
                },
                mainCount: 4,
                userLabel: user?.email || userLabel,
                userRole: role === "admin" ? "Administrador" : role === "revendedor" ? "Revendedor" : role === "cliente" ? "Cliente" : "Usuário",
                userAvatarUrl: avatarUrl,
                onSignOut: signOut,
                panelLinks: [
                    ...!isClientMode && (role === "admin" || role === "revendedor") ? [
                        {
                            label: "Painel Admin",
                            path: "/admin",
                            icon: Shield,
                            color: "text-primary"
                        }
                    ] : [],
                    ...role === "admin" ? [
                        {
                            label: "Principal",
                            path: "/principal",
                            icon: Landmark,
                            color: "text-success"
                        }
                    ] : []
                ]
            }, void 0, false, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 2022,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
        lineNumber: 729,
        columnNumber: 5
    }, this);
}
_s(RevendedorPainel, "Ke4ooOqlA5A8OyS14r6hOhKlsBM=", false, function() {
    return [
        useNavigate,
        useAuth,
        useResilientFetch,
        useBackgroundPaymentMonitor
    ];
});
_c = RevendedorPainel;
// ===== ADD SALDO SECTION =====
function AddSaldoSection({ saldo, fmt, fmtDate, transactions, userEmail, userName, onDeposited, fetchTransactions, resellerId, saldoTipo }) {
    _s1();
    const pix = usePixDeposit({
        userEmail,
        userName,
        resellerId,
        saldoTipo,
        pollInterval: 3000,
        onConfirmed: ()=>{
            onDeposited();
            fetchTransactions();
        }
    });
    const { depositAmount, setDepositAmount, generating, pixData, pixError, copied, checking, paymentConfirmed, confirmedAmount, pollCount, presetAmounts, generatePix: handleGeneratePix, copyCode: handleCopyCode, checkStatus: handleCheckStatus, reset: handleNewPix } = pix;
    const DEPOSIT_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
    const depositTxs = transactions.filter((t)=>t.type === "deposit").map((t)=>{
        if (t.status === "pending" && Date.now() - new Date(t.created_at).getTime() > DEPOSIT_EXPIRY_MS) {
            return {
                ...t,
                status: "expired"
            };
        }
        return t;
    });
    return /*#__PURE__*/ _jsxDEV(motion.div, {
        initial: {
            opacity: 0,
            y: 20
        },
        animate: {
            opacity: 1,
            y: 0
        },
        className: "space-y-5",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "glass-card rounded-2xl p-5 text-center",
                children: [
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-xs text-muted-foreground uppercase tracking-wide",
                        children: "Saldo atual"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2092,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-3xl font-bold text-success mt-1",
                        children: fmt(saldo)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2093,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 2091,
                columnNumber: 7
            }, this),
            paymentConfirmed ? /*#__PURE__*/ _jsxDEV(motion.div, {
                initial: {
                    opacity: 0,
                    scale: 0.9
                },
                animate: {
                    opacity: 1,
                    scale: 1
                },
                className: "glass-card rounded-2xl p-8 text-center space-y-4",
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
                            stiffness: 200,
                            delay: 0.1
                        },
                        className: "w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto",
                        children: /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                            className: "h-10 w-10 text-success"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                            lineNumber: 2102,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2100,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: 12
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.2
                        },
                        children: [
                            /*#__PURE__*/ _jsxDEV("h3", {
                                className: "font-display text-2xl font-bold text-foreground",
                                children: "Pagamento Confirmado!"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2105,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-muted-foreground mt-1",
                                children: "Seu depósito foi processado com sucesso"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2106,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2104,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV(motion.p, {
                        initial: {
                            opacity: 0,
                            y: 12
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.3
                        },
                        className: "text-4xl font-bold text-success",
                        children: [
                            "+",
                            fmt(confirmedAmount)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2108,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV(motion.p, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        transition: {
                            delay: 0.4
                        },
                        className: "text-sm text-muted-foreground",
                        children: "Crédito adicionado ao seu saldo"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2110,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV(motion.button, {
                        initial: {
                            opacity: 0,
                            y: 12
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.5
                        },
                        onClick: handleNewPix,
                        className: "px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all",
                        children: "Fazer Novo Depósito"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2112,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 2098,
                columnNumber: 9
            }, this) : !pixData ? /* Formulário de depósito */ /*#__PURE__*/ _jsxDEV("div", {
                className: "glass-card rounded-2xl p-6 space-y-5",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "text-center",
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
                                    stiffness: 200
                                },
                                className: "w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-3",
                                children: /*#__PURE__*/ _jsxDEV(QrCode, {
                                    className: "h-8 w-8 text-success"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 2124,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2122,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("h3", {
                                className: "font-display text-xl font-bold text-foreground",
                                children: "Depositar via PIX"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2126,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-sm text-muted-foreground mt-1",
                                children: "Selecione ou digite o valor para gerar o QR Code"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2127,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2121,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "grid grid-cols-3 gap-2",
                        children: presetAmounts.map((v)=>/*#__PURE__*/ _jsxDEV("button", {
                                onClick: ()=>setDepositAmount(String(v)),
                                disabled: generating,
                                className: `py-3 rounded-xl border font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${depositAmount === String(v) ? "border-success bg-success/15 text-success" : "border-border bg-muted/20 hover:bg-success/10 hover:border-success/30 text-foreground"}`,
                                children: fmt(v)
                            }, v, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2133,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2131,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ _jsxDEV("span", {
                                className: "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold",
                                children: "R$"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2147,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("input", {
                                type: "text",
                                inputMode: "decimal",
                                value: depositAmount,
                                onChange: (e)=>{
                                    const raw = e.target.value.replace(/[^0-9,.]/g, "");
                                    setDepositAmount(raw);
                                },
                                placeholder: "Outro valor (mín. R$ 10)",
                                min: 10,
                                className: "w-full pl-10 pr-3 py-3 rounded-xl glass-input text-foreground font-bold text-lg focus:outline-none focus:ring-2 focus:ring-success/50 border border-border"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2148,
                                columnNumber: 13
                            }, this),
                            depositAmount && parseFloat(depositAmount.replace(",", ".")) > 0 && parseFloat(depositAmount.replace(",", ".")) < 10 && /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-xs text-destructive mt-1",
                                children: "Valor mínimo: R$ 10,00"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2161,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2146,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("button", {
                        onClick: ()=>handleGeneratePix(),
                        disabled: generating || !depositAmount || parseFloat(depositAmount.replace(",", ".")) < 10,
                        className: "w-full py-3.5 rounded-xl bg-success text-success-foreground font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_16px_hsl(var(--success)/0.3)]",
                        children: [
                            generating ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                className: "h-5 w-5 animate-spin"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2170,
                                columnNumber: 27
                            }, this) : /*#__PURE__*/ _jsxDEV(QrCode, {
                                className: "h-5 w-5"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2170,
                                columnNumber: 74
                            }, this),
                            "Gerar PIX"
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2166,
                        columnNumber: 11
                    }, this),
                    pixError && /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: 8
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        className: "p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV(AlertTriangle, {
                                className: "h-4 w-4 mt-0.5 shrink-0"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2177,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV("span", {
                                children: pixError
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2178,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2175,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 2120,
                columnNumber: 9
            }, this) : /* QR Code / PIX result */ /*#__PURE__*/ _jsxDEV(motion.div, {
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
                className: "glass-card rounded-2xl p-6 space-y-5",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                className: "w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-3",
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
                                children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0
                                    },
                                    animate: {
                                        opacity: 1
                                    },
                                    transition: {
                                        delay: 0.3,
                                        duration: 0.3
                                    },
                                    children: /*#__PURE__*/ _jsxDEV(CheckCircle2, {
                                        className: "h-8 w-8 text-success"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 2199,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 2194,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2188,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(motion.h3, {
                                className: "font-display text-lg font-bold text-foreground",
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
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2202,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(motion.p, {
                                className: "text-sm text-muted-foreground",
                                initial: {
                                    opacity: 0
                                },
                                animate: {
                                    opacity: 1
                                },
                                transition: {
                                    delay: 0.3
                                },
                                children: "Escaneie o QR Code ou copie o código abaixo"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2210,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(motion.p, {
                                className: "text-2xl font-bold text-success mt-2",
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
                                children: fmt(pixData.amount)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2218,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(motion.p, {
                                className: "text-xs text-muted-foreground mt-1",
                                initial: {
                                    opacity: 0
                                },
                                animate: {
                                    opacity: 1
                                },
                                transition: {
                                    delay: 0.5
                                },
                                children: "via Pix"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2226,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2187,
                        columnNumber: 11
                    }, this),
                    pixData.qr_code && /*#__PURE__*/ _jsxDEV(motion.div, {
                        className: "flex justify-center relative",
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
                        children: [
                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                className: "absolute inset-0 rounded-2xl",
                                animate: {
                                    boxShadow: [
                                        "0 0 0px hsl(var(--success) / 0)",
                                        "0 0 24px hsl(var(--success) / 0.25)",
                                        "0 0 0px hsl(var(--success) / 0)"
                                    ]
                                },
                                transition: {
                                    duration: 2.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2244,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV(BrandedQRCode, {
                                value: pixData.qr_code
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2249,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2238,
                        columnNumber: 13
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
                        children: [
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-xs text-muted-foreground font-medium uppercase tracking-wide",
                                children: "Código PIX Copia e Cola"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2261,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("input", {
                                        readOnly: true,
                                        value: pixData.qr_code,
                                        className: "flex-1 px-3 py-2.5 rounded-xl glass-input text-foreground text-xs font-mono truncate border border-border"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 2263,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(motion.button, {
                                        onClick: handleCopyCode,
                                        whileTap: {
                                            scale: 0.95
                                        },
                                        animate: copied ? {
                                            backgroundColor: "hsl(var(--success))"
                                        } : {},
                                        className: `px-4 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${copied ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`,
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(Copy, {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 2276,
                                                columnNumber: 19
                                            }, this),
                                            copied ? "Copiado!" : "Copiar"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 2268,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2262,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2255,
                        columnNumber: 13
                    }, this),
                    pixData.payment_link && /*#__PURE__*/ _jsxDEV("a", {
                        href: pixData.payment_link,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors",
                        children: [
                            /*#__PURE__*/ _jsxDEV(ExternalLink, {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2287,
                                columnNumber: 15
                            }, this),
                            " Abrir link de pagamento"
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2285,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center justify-center gap-2 py-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                animate: {
                                    rotate: 360
                                },
                                transition: {
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "linear"
                                },
                                children: /*#__PURE__*/ _jsxDEV(RefreshCw, {
                                    className: "h-4 w-4 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 2294,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2293,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-xs text-muted-foreground",
                                children: [
                                    "Verificando pagamento automaticamente...",
                                    pollCount > 0 && /*#__PURE__*/ _jsxDEV("span", {
                                        className: "ml-1",
                                        children: [
                                            "(",
                                            pollCount,
                                            "x)"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 2298,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2296,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2292,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: handleCheckStatus,
                                disabled: checking,
                                className: "flex-1 py-3 rounded-xl bg-success/10 border border-success/20 text-success font-bold text-sm flex items-center justify-center gap-2 hover:bg-success/20 transition-colors disabled:opacity-50",
                                children: [
                                    checking ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                        className: "h-4 w-4 animate-spin"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 2306,
                                        columnNumber: 27
                                    }, this) : /*#__PURE__*/ _jsxDEV(RefreshCw, {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                        lineNumber: 2306,
                                        columnNumber: 74
                                    }, this),
                                    "Verificar Agora"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2304,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: handleNewPix,
                                className: "px-4 py-3 rounded-xl border border-border text-muted-foreground font-medium text-sm hover:bg-muted/40 transition-colors",
                                children: "Novo PIX"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                lineNumber: 2309,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2303,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 2184,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "glass-card rounded-2xl overflow-hidden",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "px-5 py-4 border-b border-border",
                        children: /*#__PURE__*/ _jsxDEV("h3", {
                            className: "font-display text-lg font-bold text-foreground",
                            children: "Últimos Depósitos"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                            lineNumber: 2320,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2319,
                        columnNumber: 9
                    }, this),
                    depositTxs.length === 0 ? /*#__PURE__*/ _jsxDEV("p", {
                        className: "py-8 text-center text-muted-foreground",
                        children: "Nenhum depósito registrado"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                        lineNumber: 2323,
                        columnNumber: 11
                    }, this) : depositTxs.slice(0, 10).map((t, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0,
                                x: -16
                            },
                            animate: {
                                opacity: 1,
                                x: 0
                            },
                            transition: {
                                delay: i * 0.06
                            },
                            className: "px-5 py-3 border-b border-border last:border-0 flex items-center justify-between",
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: `w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.status === "completed" ? "bg-success/15" : t.status === "expired" ? "bg-destructive/15" : "bg-warning/15"}`,
                                            children: t.status === "completed" ? /*#__PURE__*/ _jsxDEV(AnimatedCheck, {
                                                size: 18,
                                                className: "text-success"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 2329,
                                                columnNumber: 45
                                            }, this) : t.status === "expired" ? /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-destructive text-sm",
                                                children: "✕"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 2329,
                                                columnNumber: 125
                                            }, this) : /*#__PURE__*/ _jsxDEV(Loader2, {
                                                className: "h-4 w-4 text-warning animate-spin"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                lineNumber: 2329,
                                                columnNumber: 179
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 2328,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "font-medium text-foreground text-sm",
                                                    children: "Depósito PIX"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 2332,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "text-xs text-muted-foreground",
                                                    children: fmtDate(t.created_at)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                                    lineNumber: 2333,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 2331,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 2327,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "text-right",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: `font-bold ${t.status === "completed" ? "text-success" : t.status === "expired" ? "text-destructive" : "text-warning"}`,
                                            children: [
                                                "+",
                                                fmt(t.amount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 2337,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("span", {
                                            className: `text-[10px] font-semibold uppercase tracking-wide ${t.status === "completed" ? "text-success" : t.status === "expired" ? "text-destructive" : "text-warning"}`,
                                            children: t.status === "completed" ? "✓ Confirmado" : t.status === "expired" ? "✕ Expirado" : "⏳ Processando"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                            lineNumber: 2338,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                                    lineNumber: 2336,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, t.id, true, {
                            fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                            lineNumber: 2325,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
                lineNumber: 2318,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/RevendedorPainel.tsx",
        lineNumber: 2089,
        columnNumber: 5
    }, this);
}
_s1(AddSaldoSection, "Lrf0w3HHxQsL5kvb0DPadaB1ngQ=", false, function() {
    return [
        usePixDeposit
    ];
});
_c1 = AddSaldoSection;
var _c, _c1;
$RefreshReg$(_c, "RevendedorPainel");
$RefreshReg$(_c1, "AddSaldoSection");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/RevendedorPainel.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/RevendedorPainel.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJldmVuZGVkb3JQYWluZWwudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZUF1dGggfSBmcm9tIFwiQC9ob29rcy91c2VBdXRoXCI7XG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XG5pbXBvcnQgUmVjYXJnYXNUaWNrZXIgZnJvbSBcIkAvY29tcG9uZW50cy9SZWNhcmdhc1RpY2tlclwiO1xuaW1wb3J0IEJyYW5kZWRRUkNvZGUgZnJvbSBcIkAvY29tcG9uZW50cy9CcmFuZGVkUVJDb2RlXCI7XG5pbXBvcnQgeyBUaGVtZVRvZ2dsZSB9IGZyb20gXCJAL2NvbXBvbmVudHMvVGhlbWVUb2dnbGVcIjtcbmltcG9ydCB7IEFuaW1hdGVkSWNvbiB9IGZyb20gXCJAL2NvbXBvbmVudHMvQW5pbWF0ZWRJY29uXCI7XG5pbXBvcnQgeyBBbmltYXRlZENvdW50ZXIsIEFuaW1hdGVkSW50IH0gZnJvbSBcIkAvY29tcG9uZW50cy9BbmltYXRlZENvdW50ZXJcIjtcbmltcG9ydCB7IE1vYmlsZUJvdHRvbU5hdiwgTmF2SXRlbSB9IGZyb20gXCJAL2NvbXBvbmVudHMvTW9iaWxlQm90dG9tTmF2XCI7XG5pbXBvcnQgQW5pbWF0ZWRDaGVjayBmcm9tIFwiQC9jb21wb25lbnRzL0FuaW1hdGVkQ2hlY2tcIjtcbmltcG9ydCB7IFByb21vQmFubmVyIH0gZnJvbSBcIkAvY29tcG9uZW50cy9Qcm9tb0Jhbm5lclwiO1xuaW1wb3J0IHsgUG9wdXBCYW5uZXIgfSBmcm9tIFwiQC9jb21wb25lbnRzL1BvcHVwQmFubmVyXCI7XG5pbXBvcnQgeyBQaXhSZXN1bHQgfSBmcm9tIFwiQC9saWIvcGF5bWVudFwiO1xuaW1wb3J0IHsgdXNlQmFja2dyb3VuZFBheW1lbnRNb25pdG9yIH0gZnJvbSBcIkAvaG9va3MvdXNlQmFja2dyb3VuZFBheW1lbnRNb25pdG9yXCI7XG5pbXBvcnQgeyBwbGF5U3VjY2Vzc1NvdW5kIH0gZnJvbSBcIkAvbGliL3NvdW5kc1wiO1xuaW1wb3J0IHsgRmxvYXRpbmdQb2xsIH0gZnJvbSBcIkAvY29tcG9uZW50cy9GbG9hdGluZ1BvbGxcIjtcbmltcG9ydCB7IFNrZWxldG9uVmFsdWUsIFNrZWxldG9uUm93LCBTa2VsZXRvbkNhcmQgfSBmcm9tIFwiQC9jb21wb25lbnRzL1NrZWxldG9uXCI7XG5pbXBvcnQgeyBJbWFnZUNyb3BwZXIgfSBmcm9tIFwiQC9jb21wb25lbnRzL0ltYWdlQ3JvcHBlclwiO1xuaW1wb3J0IHsgUmVjYXJnYVJlY2VpcHQgfSBmcm9tIFwiQC9jb21wb25lbnRzL1JlY2FyZ2FSZWNlaXB0XCI7XG5pbXBvcnQgeyBQcm9maWxlVGFiIH0gZnJvbSBcIkAvY29tcG9uZW50cy9Qcm9maWxlVGFiXCI7XG5pbXBvcnQgeyBtb3Rpb24sIEFuaW1hdGVQcmVzZW5jZSB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5pbXBvcnQge1xuICBMb2dPdXQsIFdhbGxldCwgU21hcnRwaG9uZSwgSGlzdG9yeSwgU2VuZCwgQ2xvY2ssIE1lc3NhZ2VDaXJjbGUsXG4gIE1lbnUsIFgsIFVzZXIsIEFjdGl2aXR5LCBMYW5kbWFyaywgQ3JlZGl0Q2FyZCwgQ2hlY2tDaXJjbGUyLCBYQ2lyY2xlLFxuICBXaWZpLCBEYXRhYmFzZSwgU2hpZWxkLCBTZXJ2ZXIsIEFsZXJ0VHJpYW5nbGUsIExvYWRlcjIsIEV5ZSwgRXllT2ZmLCBTYXZlLFxuICBRckNvZGUsIENvcHksIEV4dGVybmFsTGluaywgUmVmcmVzaEN3LCBTdG9yZSwgUGVuY2lsLCBTZWFyY2gsIEZpbHRlciwgQ2FtZXJhLCBDaGV2cm9uUmlnaHQsIEZpbGVUZXh0LFxufSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5cbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSBcIkAvaW50ZWdyYXRpb25zL3N1cGFiYXNlL2NsaWVudFwiO1xuaW1wb3J0IHsgdXNlRWZmZWN0LCB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZVJlZiB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgYXBwVG9hc3QsIHN0eWxlZFRvYXN0IGFzIHRvYXN0IH0gZnJvbSBcIkAvbGliL3RvYXN0XCI7XG5pbXBvcnQgeyBmb3JtYXREYXRlVGltZUJSLCBmb3JtYXRGdWxsRGF0ZVRpbWVCUiwgZm9ybWF0RGF0ZUxvbmdVcHBlckJSLCB0b0xvY2FsRGF0ZUtleSwgZ2V0VG9kYXlMb2NhbEtleSB9IGZyb20gXCJAL2xpYi90aW1lem9uZVwiO1xuXG5pbXBvcnQgdHlwZSB7IFJlY2FyZ2EsIENhdGFsb2dWYWx1ZSwgQ2F0YWxvZ0NhcnJpZXIsIFRyYW5zYWN0aW9uIH0gZnJvbSBcIkAvdHlwZXNcIjtcbmltcG9ydCB7IHVzZVBpeERlcG9zaXQgfSBmcm9tIFwiQC9ob29rcy91c2VQaXhEZXBvc2l0XCI7XG5pbXBvcnQgeyB1c2VSZXNpbGllbnRGZXRjaCwgZ3VhcmRlZEZldGNoIH0gZnJvbSBcIkAvaG9va3MvdXNlQXN5bmNcIjtcbmltcG9ydCB7IG9wZXJhZG9yYUNvbG9ycywgc2FmZVZhbG9yIH0gZnJvbSBcIkAvbGliL3V0aWxzXCI7XG5cbnR5cGUgUGFpbmVsVGFiID0gXCJyZWNhcmdhXCIgfCBcImFkZFNhbGRvXCIgfCBcImhpc3Rvcmljb1wiIHwgXCJleHRyYXRvXCIgfCBcImNvbnRhdG9zXCIgfCBcInN0YXR1c1wiO1xuXG5pbnRlcmZhY2UgUmV2ZW5kZWRvclBhaW5lbFByb3BzIHtcbiAgcmVzZWxsZXJJZD86IHN0cmluZztcbiAgcmVzZWxsZXJCcmFuZGluZz86IHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgbG9nb1VybDogc3RyaW5nIHwgbnVsbDtcbiAgICBwcmltYXJ5Q29sb3I6IHN0cmluZyB8IG51bGw7XG4gICAgc2Vjb25kYXJ5Q29sb3I6IHN0cmluZyB8IG51bGw7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJldmVuZGVkb3JQYWluZWwoeyByZXNlbGxlcklkLCByZXNlbGxlckJyYW5kaW5nIH06IFJldmVuZGVkb3JQYWluZWxQcm9wcyA9IHt9KSB7XG4gIGNvbnN0IGlzQ2xpZW50TW9kZSA9ICEhcmVzZWxsZXJJZDtcbiAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xuICBjb25zdCB7IHVzZXIsIHJvbGUsIHNpZ25PdXQgfSA9IHVzZUF1dGgoKTtcbiAgY29uc3QgW3NhbGRvLCBzZXRTYWxkb10gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3QgW3JlY2FyZ2FzLCBzZXRSZWNhcmdhc10gPSB1c2VTdGF0ZTxSZWNhcmdhW10+KFtdKTtcbiAgY29uc3QgeyBsb2FkaW5nLCBydW5GZXRjaCB9ID0gdXNlUmVzaWxpZW50RmV0Y2goKTtcbiAgY29uc3QgW3RhYiwgc2V0VGFiXSA9IHVzZVN0YXRlPFBhaW5lbFRhYj4oXCJyZWNhcmdhXCIpO1xuICBjb25zdCBbbWVudU9wZW4sIHNldE1lbnVPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3Byb2ZpbGVOb21lLCBzZXRQcm9maWxlTm9tZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2F2YXRhclVybCwgc2V0QXZhdGFyVXJsXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbdXBsb2FkaW5nQXZhdGFyLCBzZXRVcGxvYWRpbmdBdmF0YXJdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbY3JvcEZpbGUsIHNldENyb3BGaWxlXSA9IHVzZVN0YXRlPEZpbGUgfCBudWxsPihudWxsKTtcblxuICAvLyBSZWNhcmdhIGZvcm1cbiAgY29uc3QgW3RlbGVmb25lLCBzZXRUZWxlZm9uZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2NsaXBib2FyZFBob25lLCBzZXRDbGlwYm9hcmRQaG9uZV0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3NlbGVjdGVkQ2Fycmllciwgc2V0U2VsZWN0ZWRDYXJyaWVyXSA9IHVzZVN0YXRlPENhdGFsb2dDYXJyaWVyIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtzZWxlY3RlZFZhbHVlLCBzZXRTZWxlY3RlZFZhbHVlXSA9IHVzZVN0YXRlPENhdGFsb2dWYWx1ZSB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbZXh0cmFEYXRhLCBzZXRFeHRyYURhdGFdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtzZW5kaW5nLCBzZXRTZW5kaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3BlbmRpbmdXYXJuaW5nLCBzZXRQZW5kaW5nV2FybmluZ10gPSB1c2VTdGF0ZTx7IHBob25lOiBzdHJpbmc7IGNvdW50OiBudW1iZXIgfSB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbcmVjYXJnYVJlc3VsdCwgc2V0UmVjYXJnYVJlc3VsdF0gPSB1c2VTdGF0ZTx7IHN1Y2Nlc3M6IGJvb2xlYW47IG1lc3NhZ2U6IHN0cmluZzsgZXh0ZXJuYWxJZD86IHN0cmluZyB9IHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFt0cmFja2luZ1N0YXR1cywgc2V0VHJhY2tpbmdTdGF0dXNdID0gdXNlU3RhdGU8eyBsb2FkaW5nOiBib29sZWFuOyBkYXRhOiBhbnkgfCBudWxsOyBvcGVuOiBib29sZWFuOyBsb2NhbFJlY2FyZ2E/OiBSZWNhcmdhIHwgbnVsbCB9Pih7IGxvYWRpbmc6IGZhbHNlLCBkYXRhOiBudWxsLCBvcGVuOiBmYWxzZSwgbG9jYWxSZWNhcmdhOiBudWxsIH0pO1xuICBjb25zdCBbcGhvbmVDaGVja1Jlc3VsdCwgc2V0UGhvbmVDaGVja1Jlc3VsdF0gPSB1c2VTdGF0ZTx7IHN0YXR1czogc3RyaW5nOyBtZXNzYWdlOiBzdHJpbmcgfSB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbY2hlY2tpbmdQaG9uZSwgc2V0Q2hlY2tpbmdQaG9uZV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtkZXRlY3RpbmdPcGVyYXRvciwgc2V0RGV0ZWN0aW5nT3BlcmF0b3JdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbZGV0ZWN0ZWRPcGVyYXRvck5hbWUsIHNldERldGVjdGVkT3BlcmF0b3JOYW1lXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBsYXN0RGV0ZWN0ZWRQaG9uZVJlZiA9IHVzZVJlZjxzdHJpbmc+KFwiXCIpO1xuICBjb25zdCBbc2VsZWN0ZWRSZWNhcmdhLCBzZXRTZWxlY3RlZFJlY2FyZ2FdID0gdXNlU3RhdGU8UmVjYXJnYSB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbcmVjZWlwdFJlY2FyZ2EsIHNldFJlY2VpcHRSZWNhcmdhXSA9IHVzZVN0YXRlPFJlY2FyZ2EgfCBudWxsPihudWxsKTtcblxuICAvLyBBUEkgQ2F0YWxvZ1xuICBjb25zdCBbY2F0YWxvZywgc2V0Q2F0YWxvZ10gPSB1c2VTdGF0ZTxDYXRhbG9nQ2FycmllcltdPihbXSk7XG4gIGNvbnN0IFtjYXRhbG9nTG9hZGluZywgc2V0Q2F0YWxvZ0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBjYXRhbG9nTG9hZGVkID0gdXNlUmVmKGZhbHNlKTtcblxuICAvLyBDb250YWN0c1xuICBjb25zdCBbdGVsZWdyYW1Vc2VybmFtZSwgc2V0VGVsZWdyYW1Vc2VybmFtZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW3doYXRzYXBwTnVtYmVyLCBzZXRXaGF0c2FwcE51bWJlcl0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW3RlbGVncmFtQm90VG9rZW4sIHNldFRlbGVncmFtQm90VG9rZW5dID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFt0ZWxlZ3JhbUxpbmtlZCwgc2V0VGVsZWdyYW1MaW5rZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2hvd0JvdFRva2VuLCBzZXRTaG93Qm90VG9rZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2F2aW5nQ29udGFjdHMsIHNldFNhdmluZ0NvbnRhY3RzXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAvLyBUcmFuc2FjdGlvbnMgKGV4dHJhdG8pXG4gIGNvbnN0IFt0cmFuc2FjdGlvbnMsIHNldFRyYW5zYWN0aW9uc10gPSB1c2VTdGF0ZTxUcmFuc2FjdGlvbltdPihbXSk7XG4gIGNvbnN0IFt0cmFuc0xvYWRpbmcsIHNldFRyYW5zTG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IHRyYW5zTG9hZGVkID0gdXNlUmVmKGZhbHNlKTtcblxuICAvLyBIaXN0w7NyaWNvIGZpbHRlcnNcbiAgY29uc3QgW2hpc3RTZWFyY2gsIHNldEhpc3RTZWFyY2hdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtoaXN0U3RhdHVzLCBzZXRIaXN0U3RhdHVzXSA9IHVzZVN0YXRlPFwiYWxsXCIgfCBcImNvbXBsZXRlZFwiIHwgXCJwZW5kaW5nXCIgfCBcImZhbGhhXCI+KFwiYWxsXCIpO1xuICBjb25zdCBbaGlzdE9wZXJhZG9yYSwgc2V0SGlzdE9wZXJhZG9yYV0gPSB1c2VTdGF0ZShcImFsbFwiKTtcblxuICAvLyBUYWJlbGEgZGUgdmFsb3JlcyBtb2RhbFxuICBjb25zdCBbc2hvd1ZhbG9yZXNNb2RhbCwgc2V0U2hvd1ZhbG9yZXNNb2RhbF0gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgLy8gU3RhdHVzXG4gIGNvbnN0IFtzdGF0dXNEYXRhLCBzZXRTdGF0dXNEYXRhXSA9IHVzZVN0YXRlPHtcbiAgICBkYk9ubGluZTogYm9vbGVhbjtcbiAgICBhdXRoT25saW5lOiBib29sZWFuO1xuICAgIG9wZXJhZG9yYXNDb3VudDogbnVtYmVyO1xuICAgIHJlY2FyZ2FzVG90YWw6IG51bWJlcjtcbiAgICBsYXN0UmVjYXJnYTogc3RyaW5nIHwgbnVsbDtcbiAgICBvcGVyYXRvclN0YXRzOiB7IG9wZXJhZG9yYTogc3RyaW5nOyBhdmdSZWNlbnQ6IG51bWJlcjsgbWluMjRoOiBudW1iZXI7IGF2ZzI0aDogbnVtYmVyOyBtYXgyNGg6IG51bWJlcjsgcmVjZW50Q291bnQ6IG51bWJlciB9W107XG4gIH0gfCBudWxsPihudWxsKTtcblxuICAvLyBQcm9maWxlIHNsdWcgZm9yIHN0b3JlIGxpbmtcbiAgLy8gUHJvZmlsZSBzbHVnIGZvciBzdG9yZSBsaW5rXG4gIGNvbnN0IFtwcm9maWxlU2x1Zywgc2V0UHJvZmlsZVNsdWddID0gdXNlU3RhdGUoXCJcIik7XG5cbiAgLy8gQmFubmVyIGNvbmZpZyBmcm9tIGJhbm5lcnMgdGFibGVcbiAgY29uc3QgW2Jhbm5lcnNMaXN0LCBzZXRCYW5uZXJzTGlzdF0gPSB1c2VTdGF0ZTx7IGlkOiBzdHJpbmc7IHBvc2l0aW9uOiBudW1iZXI7IHR5cGU6IHN0cmluZzsgZW5hYmxlZDogYm9vbGVhbjsgdGl0bGU6IHN0cmluZzsgc3VidGl0bGU6IHN0cmluZzsgbGluazogc3RyaW5nIH1bXT4oW10pO1xuICBjb25zdCBbZGlzbWlzc2VkQmFubmVycywgc2V0RGlzbWlzc2VkQmFubmVyc10gPSB1c2VTdGF0ZTxTZXQ8bnVtYmVyPj4obmV3IFNldCgpKTtcblxuXG4gIC8vIENhbGwgZWRnZSBmdW5jdGlvbiBoZWxwZXJcbiAgY29uc3QgY2FsbEFwaSA9IHVzZUNhbGxiYWNrKGFzeW5jIChhY3Rpb246IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHt9KSA9PiB7XG4gICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnVuY3Rpb25zLmludm9rZShcInJlY2FyZ2EtZXhwcmVzc1wiLCB7XG4gICAgICBib2R5OiB7IGFjdGlvbiwgLi4ucGFyYW1zIH0sXG4gICAgfSk7XG4gICAgaWYgKGVycm9yKSB0aHJvdyBuZXcgRXJyb3IoZXJyb3IubWVzc2FnZSB8fCBcIkVycm8gbmEgQVBJXCIpO1xuICAgIHJldHVybiBkYXRhO1xuICB9LCBbXSk7XG5cbiAgY29uc3QgZmV0Y2hDYXRhbG9nID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGF3YWl0IGd1YXJkZWRGZXRjaChjYXRhbG9nTG9hZGVkLCBzZXRDYXRhbG9nTG9hZGluZywgYXN5bmMgKCkgPT4ge1xuICAgICAgLy8gQWx3YXlzIGJ1aWxkIGNhdGFsb2cgZnJvbSBsb2NhbCBEQiB3aXRoIHJlc2VsbGVyL2dsb2JhbCBwcmljaW5nIHJ1bGVzXG4gICAgICBjb25zdCBbeyBkYXRhOiBvcHMgfSwgeyBkYXRhOiBnbG9iYWxSdWxlcyB9LCB7IGRhdGE6IHJlc2VsbGVyUnVsZXMgfV0gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHN1cGFiYXNlLmZyb20oXCJvcGVyYWRvcmFzXCIpLnNlbGVjdChcIipcIikuZXEoXCJhdGl2b1wiLCB0cnVlKS5vcmRlcihcIm5vbWVcIiksXG4gICAgICAgIHN1cGFiYXNlLmZyb20oXCJwcmljaW5nX3J1bGVzXCIpLnNlbGVjdChcIipcIiksXG4gICAgICAgIHVzZXI/LmlkID8gc3VwYWJhc2UuZnJvbShcInJlc2VsbGVyX3ByaWNpbmdfcnVsZXNcIikuc2VsZWN0KFwiKlwiKS5lcShcInVzZXJfaWRcIiwgdXNlci5pZCkgOiBQcm9taXNlLnJlc29sdmUoeyBkYXRhOiBbXSB9KSxcbiAgICAgIF0pO1xuXG4gICAgICBpZiAob3BzKSB7XG4gICAgICAgIGNvbnN0IGxvY2FsQ2F0YWxvZzogQ2F0YWxvZ0NhcnJpZXJbXSA9IG9wcy5tYXAoKG9wKSA9PiB7XG4gICAgICAgICAgY29uc3Qgb3BHbG9iYWxSdWxlcyA9IChnbG9iYWxSdWxlcyB8fCBbXSkuZmlsdGVyKChyKSA9PiByLm9wZXJhZG9yYV9pZCA9PT0gb3AuaWQpO1xuICAgICAgICAgIGNvbnN0IG9wUmVzZWxsZXJSdWxlcyA9IChyZXNlbGxlclJ1bGVzIHx8IFtdKS5maWx0ZXIoKHI6IGFueSkgPT4gci5vcGVyYWRvcmFfaWQgPT09IG9wLmlkKTtcbiAgICAgICAgICBjb25zdCB2YWxvcmVzID0gKG9wLnZhbG9yZXMgYXMgdW5rbm93biBhcyBudW1iZXJbXSkgfHwgW107XG4gICAgICAgICAgY29uc3QgdmFsdWVzOiBDYXRhbG9nVmFsdWVbXSA9IHZhbG9yZXMubWFwKCh2OiBudW1iZXIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc2VsbGVyUnVsZSA9IG9wUmVzZWxsZXJSdWxlcy5maW5kKChyOiBhbnkpID0+IE51bWJlcihyLnZhbG9yX3JlY2FyZ2EpID09PSB2KTtcbiAgICAgICAgICAgIGNvbnN0IGdsb2JhbFJ1bGUgPSBvcEdsb2JhbFJ1bGVzLmZpbmQoKHIpID0+IE51bWJlcihyLnZhbG9yX3JlY2FyZ2EpID09PSB2KTtcbiAgICAgICAgICAgIGNvbnN0IHJ1bGUgPSByZXNlbGxlclJ1bGUgfHwgZ2xvYmFsUnVsZTtcbiAgICAgICAgICAgIGNvbnN0IGNvc3QgPSBydWxlXG4gICAgICAgICAgICAgID8gcnVsZS50aXBvX3JlZ3JhID09PSBcImZpeG9cIlxuICAgICAgICAgICAgICAgID8gTnVtYmVyKHJ1bGUucmVncmFfdmFsb3IpXG4gICAgICAgICAgICAgICAgOiBOdW1iZXIocnVsZS5jdXN0bykgKiAoMSArIE51bWJlcihydWxlLnJlZ3JhX3ZhbG9yKSAvIDEwMClcbiAgICAgICAgICAgICAgOiB2O1xuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWVJZDogYCR7b3AuaWR9XyR7dn1gLCB2YWx1ZTogdiwgY29zdCB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiB7IGNhcnJpZXJJZDogb3AuaWQsIG5hbWU6IG9wLm5vbWUsIG9yZGVyOiAwLCB2YWx1ZXMgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNldENhdGFsb2cobG9jYWxDYXRhbG9nKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGNhbGxBcGkoXCJjYXRhbG9nXCIpO1xuICAgICAgICAgIGlmIChyZXNwPy5zdWNjZXNzICYmIHJlc3AuZGF0YSkgc2V0Q2F0YWxvZyhyZXNwLmRhdGEpO1xuICAgICAgICB9IGNhdGNoIHsgLyogKi8gfVxuICAgICAgfVxuICAgIH0pO1xuICB9LCBbdXNlcj8uaWQsIGNhbGxBcGldKTtcblxuICBjb25zdCBmZXRjaERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgaWYgKCF1c2VyKSByZXR1cm47XG4gICAgYXdhaXQgcnVuRmV0Y2goYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgW3sgZGF0YTogc2FsZG9EYXRhIH0sIHsgZGF0YTogcmVjYXJnYXNEYXRhIH0sIHsgZGF0YTogcHJvZmlsZSB9LCB7IGRhdGE6IGJvdFRva2VuQ29uZmlnIH1dID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBzdXBhYmFzZS5mcm9tKFwic2FsZG9zXCIpLnNlbGVjdChcInZhbG9yXCIpLmVxKFwidXNlcl9pZFwiLCB1c2VyLmlkKS5lcShcInRpcG9cIiwgXCJyZXZlbmRhXCIpLm1heWJlU2luZ2xlKCksXG4gICAgICAgIHN1cGFiYXNlLmZyb20oXCJyZWNhcmdhc1wiKS5zZWxlY3QoXCIqXCIpLmVxKFwidXNlcl9pZFwiLCB1c2VyLmlkKS5vcmRlcihcImNyZWF0ZWRfYXRcIiwgeyBhc2NlbmRpbmc6IGZhbHNlIH0pLmxpbWl0KDUwKSxcbiAgICAgICAgc3VwYWJhc2UuZnJvbShcInByb2ZpbGVzXCIpLnNlbGVjdChcIm5vbWUsIHRlbGVncmFtX3VzZXJuYW1lLCB3aGF0c2FwcF9udW1iZXIsIHRlbGVncmFtX2lkLCBzbHVnLCBhdmF0YXJfdXJsXCIpLmVxKFwiaWRcIiwgdXNlci5pZCkuc2luZ2xlKCksXG4gICAgICAgIHN1cGFiYXNlLmZyb20oXCJyZXNlbGxlcl9jb25maWdcIikuc2VsZWN0KFwidmFsdWVcIikuZXEoXCJ1c2VyX2lkXCIsIHVzZXIuaWQpLmVxKFwia2V5XCIsIFwidGVsZWdyYW1fYm90X3Rva2VuXCIpLm1heWJlU2luZ2xlKCksXG4gICAgICBdKTtcbiAgICAgIHNldFNhbGRvKE51bWJlcihzYWxkb0RhdGE/LnZhbG9yKSB8fCAwKTtcbiAgICAgIHNldFJlY2FyZ2FzKHJlY2FyZ2FzRGF0YSB8fCBbXSk7XG4gICAgICBjb25zdCBwID0gcHJvZmlsZSBhcyBhbnk7XG4gICAgICBzZXRQcm9maWxlTm9tZShwPy5ub21lIHx8IFwiXCIpO1xuICAgICAgc2V0VGVsZWdyYW1Vc2VybmFtZShwPy50ZWxlZ3JhbV91c2VybmFtZSB8fCBcIlwiKTtcbiAgICAgIHNldFdoYXRzYXBwTnVtYmVyKHA/LndoYXRzYXBwX251bWJlciB8fCBcIlwiKTtcbiAgICAgIHNldFRlbGVncmFtQm90VG9rZW4oYm90VG9rZW5Db25maWc/LnZhbHVlIHx8IFwiXCIpO1xuICAgICAgc2V0VGVsZWdyYW1MaW5rZWQoISFwPy50ZWxlZ3JhbV9pZCk7XG4gICAgICBzZXRQcm9maWxlU2x1ZyhwPy5zbHVnIHx8IFwiXCIpO1xuICAgICAgc2V0QXZhdGFyVXJsKHA/LmF2YXRhcl91cmwgfHwgbnVsbCk7XG4gICAgfSk7XG4gIH0sIFt1c2VyLCBydW5GZXRjaF0pO1xuXG4gIGNvbnN0IGZldGNoVHJhbnNhY3Rpb25zID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIGlmICghdXNlcikgcmV0dXJuO1xuICAgIGF3YWl0IGd1YXJkZWRGZXRjaCh0cmFuc0xvYWRlZCwgc2V0VHJhbnNMb2FkaW5nLCBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKFwidHJhbnNhY3Rpb25zXCIpXG4gICAgICAgIC5zZWxlY3QoXCIqXCIpXG4gICAgICAgIC5lcShcInVzZXJfaWRcIiwgdXNlci5pZClcbiAgICAgICAgLm9yZGVyKFwiY3JlYXRlZF9hdFwiLCB7IGFzY2VuZGluZzogZmFsc2UgfSlcbiAgICAgICAgLmxpbWl0KDUwKTtcbiAgICAgIHNldFRyYW5zYWN0aW9ucyhkYXRhIHx8IFtdKTtcbiAgICB9KTtcbiAgfSwgW3VzZXJdKTtcblxuICBjb25zdCBmZXRjaFN0YXR1cyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgW3sgY291bnQ6IG9wc0NvdW50IH0sIHsgY291bnQ6IHJlY1RvdGFsIH0sIHsgZGF0YTogbGFzdFJlYyB9LCB7IGRhdGE6IHJwY1N0YXRzIH1dID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBzdXBhYmFzZS5mcm9tKFwib3BlcmFkb3Jhc1wiKS5zZWxlY3QoXCIqXCIsIHsgY291bnQ6IFwiZXhhY3RcIiwgaGVhZDogdHJ1ZSB9KS5lcShcImF0aXZvXCIsIHRydWUpLFxuICAgICAgICBzdXBhYmFzZS5mcm9tKFwicmVjYXJnYXNcIikuc2VsZWN0KFwiKlwiLCB7IGNvdW50OiBcImV4YWN0XCIsIGhlYWQ6IHRydWUgfSksXG4gICAgICAgIHN1cGFiYXNlLmZyb20oXCJyZWNhcmdhc1wiKS5zZWxlY3QoXCJjcmVhdGVkX2F0XCIpLm9yZGVyKFwiY3JlYXRlZF9hdFwiLCB7IGFzY2VuZGluZzogZmFsc2UgfSkubGltaXQoMSksXG4gICAgICAgIHN1cGFiYXNlLnJwYyhcImdldF9vcGVyYXRvcl9zdGF0c1wiIGFzIGFueSksXG4gICAgICBdKTtcblxuICAgICAgLy8gTWFwIFJQQyByZXN1bHRzIHRvIGV4cGVjdGVkIGZvcm1hdFxuICAgICAgY29uc3Qgb3BlcmF0b3JTdGF0czogeyBvcGVyYWRvcmE6IHN0cmluZzsgYXZnUmVjZW50OiBudW1iZXI7IG1pbjI0aDogbnVtYmVyOyBhdmcyNGg6IG51bWJlcjsgbWF4MjRoOiBudW1iZXI7IHJlY2VudENvdW50OiBudW1iZXIgfVtdID0gXG4gICAgICAgIChBcnJheS5pc0FycmF5KHJwY1N0YXRzKSA/IHJwY1N0YXRzIDogW10pLm1hcCgoczogYW55KSA9PiAoe1xuICAgICAgICAgIG9wZXJhZG9yYTogcy5vcGVyYWRvcmEgfHwgXCJcIixcbiAgICAgICAgICBhdmdSZWNlbnQ6IE51bWJlcihzLmF2Z19yZWNlbnQpIHx8IDAsXG4gICAgICAgICAgbWluMjRoOiBOdW1iZXIocy5taW5fMjRoKSB8fCAwLFxuICAgICAgICAgIGF2ZzI0aDogTnVtYmVyKHMuYXZnXzI0aCkgfHwgMCxcbiAgICAgICAgICBtYXgyNGg6IE51bWJlcihzLm1heF8yNGgpIHx8IDAsXG4gICAgICAgICAgcmVjZW50Q291bnQ6IE51bWJlcihzLnJlY2VudF9jb3VudCkgfHwgMCxcbiAgICAgICAgfSkpO1xuXG4gICAgICAvLyBFbnN1cmUgYWxsIGFjdGl2ZSBvcGVyYXRvcnMgYXBwZWFyXG4gICAgICBjb25zdCBhY3RpdmVPcHMgPSBbXCJDbGFyb1wiLCBcIlRpbVwiLCBcIlZpdm9cIl07XG4gICAgICBhY3RpdmVPcHMuZm9yRWFjaChvcCA9PiB7XG4gICAgICAgIGlmICghb3BlcmF0b3JTdGF0cy5maW5kKHMgPT4gcy5vcGVyYWRvcmEudG9Mb3dlckNhc2UoKSA9PT0gb3AudG9Mb3dlckNhc2UoKSkpIHtcbiAgICAgICAgICBvcGVyYXRvclN0YXRzLnB1c2goeyBvcGVyYWRvcmE6IG9wLCBhdmdSZWNlbnQ6IDAsIG1pbjI0aDogMCwgYXZnMjRoOiAwLCBtYXgyNGg6IDAsIHJlY2VudENvdW50OiAwIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgc2V0U3RhdHVzRGF0YSh7XG4gICAgICAgIGRiT25saW5lOiB0cnVlLFxuICAgICAgICBhdXRoT25saW5lOiAhIXVzZXIsXG4gICAgICAgIG9wZXJhZG9yYXNDb3VudDogb3BzQ291bnQgfHwgMCxcbiAgICAgICAgcmVjYXJnYXNUb3RhbDogcmVjVG90YWwgfHwgMCxcbiAgICAgICAgbGFzdFJlY2FyZ2E6IGxhc3RSZWM/LlswXT8uY3JlYXRlZF9hdCB8fCBudWxsLFxuICAgICAgICBvcGVyYXRvclN0YXRzLFxuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7XG4gICAgICBzZXRTdGF0dXNEYXRhKHsgZGJPbmxpbmU6IGZhbHNlLCBhdXRoT25saW5lOiAhIXVzZXIsIG9wZXJhZG9yYXNDb3VudDogMCwgcmVjYXJnYXNUb3RhbDogMCwgbGFzdFJlY2FyZ2E6IG51bGwsIG9wZXJhdG9yU3RhdHM6IFtdIH0pO1xuICAgIH1cbiAgfSwgW3VzZXJdKTtcblxuXG5cbiAgLy8gQmFja2dyb3VuZCBwYXltZW50IG1vbml0b3Ig4oCUIGxvYWQgcmV2ZW5kZWRvciBkZXBvc2l0IHRvYXN0IGNvbmZpZ1xuICBjb25zdCBbcmV2RGVwb3NpdFRvYXN0LCBzZXRSZXZEZXBvc2l0VG9hc3RdID0gdXNlU3RhdGUoZmFsc2UpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHN1cGFiYXNlLnJwYyhcImdldF9ub3RpZl9jb25maWdcIiwgeyBfa2V5OiBcIm5vdGlmX3JldmVuZGVkb3JfZGVwb3NpdFwiIH0pXG4gICAgICAudGhlbigoeyBkYXRhIH0pID0+IHsgaWYgKGRhdGEgPT09IFwidHJ1ZVwiKSBzZXRSZXZEZXBvc2l0VG9hc3QodHJ1ZSk7IH0pO1xuICB9LCBbXSk7XG4gIGNvbnN0IGhhbmRsZUJnUGF5bWVudENvbmZpcm1lZCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcbiAgICBmZXRjaERhdGEoKTtcbiAgICBmZXRjaFRyYW5zYWN0aW9ucygpO1xuICB9LCBbZmV0Y2hEYXRhLCBmZXRjaFRyYW5zYWN0aW9uc10pO1xuICB1c2VCYWNrZ3JvdW5kUGF5bWVudE1vbml0b3IodXNlcj8uaWQsIGhhbmRsZUJnUGF5bWVudENvbmZpcm1lZCwgcmV2RGVwb3NpdFRvYXN0KTtcblxuICAvLyBSZWFsdGltZTogbGlzdGVuIGZvciByZWNhcmdhcyBzdGF0dXMgY2hhbmdlc1xuICAvLyBSZWFsdGltZTogc2FsZG8gdXBkYXRlc1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghdXNlcikgcmV0dXJuO1xuICAgIGNvbnN0IHNhbGRvQ2hhbm5lbCA9IHN1cGFiYXNlXG4gICAgICAuY2hhbm5lbChgc2FsZG8tcmVhbHRpbWUtJHt1c2VyLmlkfWApXG4gICAgICAub24oXCJwb3N0Z3Jlc19jaGFuZ2VzXCIsIHtcbiAgICAgICAgZXZlbnQ6IFwiKlwiLFxuICAgICAgICBzY2hlbWE6IFwicHVibGljXCIsXG4gICAgICAgIHRhYmxlOiBcInNhbGRvc1wiLFxuICAgICAgICBmaWx0ZXI6IGB1c2VyX2lkPWVxLiR7dXNlci5pZH1gLFxuICAgICAgfSwgKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3Qgcm93ID0gcGF5bG9hZC5uZXcgYXMgYW55O1xuICAgICAgICBpZiAocm93Py50aXBvID09PSBcInJldmVuZGFcIiAmJiByb3c/LnZhbG9yICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBzZXRTYWxkbyhOdW1iZXIocm93LnZhbG9yKSk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuc3Vic2NyaWJlKCk7XG4gICAgcmV0dXJuICgpID0+IHsgc3VwYWJhc2UucmVtb3ZlQ2hhbm5lbChzYWxkb0NoYW5uZWwpOyB9O1xuICB9LCBbdXNlcl0pO1xuXG4gIC8vIFJlYWx0aW1lOiByZWNhcmdhcyBzdGF0dXMgdXBkYXRlc1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICghdXNlcikgcmV0dXJuO1xuICAgIGNvbnN0IGNoYW5uZWwgPSBzdXBhYmFzZVxuICAgICAgLmNoYW5uZWwoYHJlY2FyZ2FzLXN0YXR1cy0ke3VzZXIuaWR9YClcbiAgICAgIC5vbihcInBvc3RncmVzX2NoYW5nZXNcIiwge1xuICAgICAgICBldmVudDogXCJVUERBVEVcIixcbiAgICAgICAgc2NoZW1hOiBcInB1YmxpY1wiLFxuICAgICAgICB0YWJsZTogXCJyZWNhcmdhc1wiLFxuICAgICAgICBmaWx0ZXI6IGB1c2VyX2lkPWVxLiR7dXNlci5pZH1gLFxuICAgICAgfSwgKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3QgbmV3Um93ID0gcGF5bG9hZC5uZXcgYXMgYW55O1xuICAgICAgICBjb25zdCBvbGRSb3cgPSBwYXlsb2FkLm9sZCBhcyBhbnk7XG4gICAgICAgIGlmIChuZXdSb3cuc3RhdHVzID09PSBcImNvbXBsZXRlZFwiICYmIG9sZFJvdz8uc3RhdHVzICE9PSBcImNvbXBsZXRlZFwiKSB7XG4gICAgICAgICAgYXBwVG9hc3QucmVjYXJnYUNvbXBsZXRlZChgUmVjYXJnYSAke25ld1Jvdy5vcGVyYWRvcmEgfHwgXCJcIn0gUiQgJHtOdW1iZXIobmV3Um93LnZhbG9yKS50b0ZpeGVkKDIpfSBwYXJhICR7bmV3Um93LnRlbGVmb25lfSBjb25jbHXDrWRhIWApO1xuICAgICAgICAgIHBsYXlTdWNjZXNzU291bmQoKTtcbiAgICAgICAgICBmZXRjaERhdGEoKTtcbiAgICAgICAgICAvLyBBdXRvLXNlbmQgcmVjZWlwdCB0byBUZWxlZ3JhbSAodXNlcyBTYXRvcmkgZmFsbGJhY2sgZm9yIGltYWdlKVxuICAgICAgICAgIHN1cGFiYXNlLmZ1bmN0aW9ucy5pbnZva2UoXCJ0ZWxlZ3JhbS1ub3RpZnlcIiwge1xuICAgICAgICAgICAgYm9keToge1xuICAgICAgICAgICAgICB0eXBlOiBcInJlY2FyZ2FfY29tcGxldGVkXCIsXG4gICAgICAgICAgICAgIHVzZXJfaWQ6IHVzZXIuaWQsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICB0ZWxlZm9uZTogbmV3Um93LnRlbGVmb25lLFxuICAgICAgICAgICAgICAgIG9wZXJhZG9yYTogbmV3Um93Lm9wZXJhZG9yYSB8fCBudWxsLFxuICAgICAgICAgICAgICAgIHZhbG9yOiBOdW1iZXIobmV3Um93LnZhbG9yKSxcbiAgICAgICAgICAgICAgICByZWNhcmdhX2lkOiBuZXdSb3cuaWQsXG4gICAgICAgICAgICAgICAgY3JlYXRlZF9hdDogbmV3Um93LmNyZWF0ZWRfYXQsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLmNhdGNoKGUgPT4gY29uc29sZS53YXJuKFwiQXV0byB0ZWxlZ3JhbSByZWNlaXB0IGZhaWxlZDpcIiwgZSkpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnN1YnNjcmliZSgpO1xuICAgIHJldHVybiAoKSA9PiB7IHN1cGFiYXNlLnJlbW92ZUNoYW5uZWwoY2hhbm5lbCk7IH07XG4gIH0sIFt1c2VyLCBmZXRjaERhdGFdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIFBhcmFsbGVsIGluaXRpYWwgbG9hZDogZGF0YSArIGNhdGFsb2cgKyBiYW5uZXJzXG4gICAgZmV0Y2hEYXRhKCk7XG4gICAgZmV0Y2hDYXRhbG9nKCk7XG4gICAgc3VwYWJhc2UuZnJvbShcImJhbm5lcnNcIikuc2VsZWN0KFwiKlwiKS5vcmRlcihcInBvc2l0aW9uXCIpLnRoZW4oKHsgZGF0YSB9KSA9PiB7XG4gICAgICBzZXRCYW5uZXJzTGlzdCgoZGF0YSB8fCBbXSkubWFwKGIgPT4gKHtcbiAgICAgICAgaWQ6IGIuaWQsXG4gICAgICAgIHBvc2l0aW9uOiBiLnBvc2l0aW9uLFxuICAgICAgICB0eXBlOiBiLnR5cGUsXG4gICAgICAgIGVuYWJsZWQ6IGIuZW5hYmxlZCxcbiAgICAgICAgdGl0bGU6IGIudGl0bGUsXG4gICAgICAgIHN1YnRpdGxlOiBiLnN1YnRpdGxlLFxuICAgICAgICBsaW5rOiBiLmxpbmssXG4gICAgICB9KSkpO1xuICAgIH0pO1xuICB9LCBbZmV0Y2hEYXRhLCBmZXRjaENhdGFsb2ddKTtcbiAgdXNlRWZmZWN0KCgpID0+IHsgaWYgKHRhYiA9PT0gXCJleHRyYXRvXCIgfHwgdGFiID09PSBcImFkZFNhbGRvXCIpIGZldGNoVHJhbnNhY3Rpb25zKCk7IH0sIFt0YWIsIGZldGNoVHJhbnNhY3Rpb25zXSk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7IGlmICh0YWIgPT09IFwic3RhdHVzXCIpIGZldGNoU3RhdHVzKCk7IH0sIFt0YWIsIGZldGNoU3RhdHVzXSk7XG5cbiAgLy8gQXV0by1wb2xsIHBlbmRpbmcgcmVjYXJnYXMgdG8gdXBkYXRlIHN0YXR1cyBmcm9tIGV4dGVybmFsIEFQSVxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHBlbmRpbmdXaXRoRXh0ZXJuYWxJZCA9IHJlY2FyZ2FzLmZpbHRlcihyID0+IHIuc3RhdHVzID09PSBcInBlbmRpbmdcIiAmJiAociBhcyBhbnkpLmV4dGVybmFsX2lkKTtcbiAgICBpZiAocGVuZGluZ1dpdGhFeHRlcm5hbElkLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuXG4gICAgbGV0IGNhbmNlbGxlZCA9IGZhbHNlO1xuICAgIGNvbnN0IHBvbGxQZW5kaW5nID0gYXN5bmMgKCkgPT4ge1xuICAgICAgZm9yIChjb25zdCByIG9mIHBlbmRpbmdXaXRoRXh0ZXJuYWxJZCkge1xuICAgICAgICBpZiAoY2FuY2VsbGVkKSBicmVhaztcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgY2FsbEFwaShcIm9yZGVyLXN0YXR1c1wiLCB7IGV4dGVybmFsX2lkOiAociBhcyBhbnkpLmV4dGVybmFsX2lkIH0pO1xuICAgICAgICAgIGlmIChyZXNwPy5zdWNjZXNzICYmIHJlc3AuZGF0YT8ubG9jYWxTdGF0dXMgPT09IFwiY29tcGxldGVkXCIpIHtcbiAgICAgICAgICAgIGFwcFRvYXN0LnJlY2FyZ2FDb21wbGV0ZWQoYFJlY2FyZ2EgJHtyLm9wZXJhZG9yYSB8fCBcIlwifSBSJCAke051bWJlcihyLnZhbG9yKS50b0ZpeGVkKDIpfSBwYXJhICR7ci50ZWxlZm9uZX0gY29uY2x1w61kYSFgKTtcbiAgICAgICAgICAgIHBsYXlTdWNjZXNzU291bmQoKTtcbiAgICAgICAgICAgIGZldGNoRGF0YSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8gUG9sbCBpbW1lZGlhdGVseSB0aGVuIGV2ZXJ5IDMwc1xuICAgIHBvbGxQZW5kaW5nKCk7XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChwb2xsUGVuZGluZywgMzAwMDApO1xuICAgIHJldHVybiAoKSA9PiB7IGNhbmNlbGxlZCA9IHRydWU7IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpOyB9O1xuICB9LCBbcmVjYXJnYXMsIGNhbGxBcGksIGZldGNoRGF0YV0pO1xuXG4gIC8vIERldGVjdCBwaG9uZSBudW1iZXIgaW4gY2xpcGJvYXJkIGZvciBxdWljayBwYXN0ZSAoZGVsYXllZCB0byBhdm9pZCBpT1MgXCJQYXN0ZVwiIHBvcHVwIG9uIGxvYWQpXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHRhYiAhPT0gXCJyZWNhcmdhXCIgfHwgdGVsZWZvbmUubGVuZ3RoID4gMCkge1xuICAgICAgc2V0Q2xpcGJvYXJkUGhvbmUobnVsbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxldCBjYW5jZWxsZWQgPSBmYWxzZTtcbiAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKGNhbmNlbGxlZCB8fCAhZG9jdW1lbnQuaGFzRm9jdXMoKSkgcmV0dXJuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKCFuYXZpZ2F0b3IuY2xpcGJvYXJkPy5yZWFkVGV4dCkgcmV0dXJuO1xuICAgICAgICBjb25zdCB0ZXh0ID0gYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC5yZWFkVGV4dCgpO1xuICAgICAgICBpZiAoY2FuY2VsbGVkIHx8ICF0ZXh0KSByZXR1cm47XG4gICAgICAgIGNvbnN0IGRpZ2l0cyA9IHRleHQucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICBpZiAoZGlnaXRzLmxlbmd0aCA+PSAxMCAmJiBkaWdpdHMubGVuZ3RoIDw9IDExKSB7XG4gICAgICAgICAgc2V0Q2xpcGJvYXJkUGhvbmUoZGlnaXRzKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCB7IC8qIGNsaXBib2FyZCBwZXJtaXNzaW9uIGRlbmllZCAqLyB9XG4gICAgfSwgMTUwMCk7XG4gICAgcmV0dXJuICgpID0+IHsgY2FuY2VsbGVkID0gdHJ1ZTsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfTtcbiAgfSwgW3RhYiwgdGVsZWZvbmVdKTtcblxuICAgLy8gQXV0by1kZXRlY3QgcmVtb3ZlZCDigJQgdXNlciBzZWxlY3RzIG9wZXJhdG9yIG1hbnVhbGx5LCB0aGVuIGNsaWNrcyBcIlZlcmlmaWNhclwiXG5cbiAgY29uc3QgZm9ybWF0UGhvbmVEaXNwbGF5ID0gKHY6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IGQgPSB2LnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5zbGljZSgwLCAxMSk7XG4gICAgaWYgKGQubGVuZ3RoIDw9IDIpIHJldHVybiBkO1xuICAgIGlmIChkLmxlbmd0aCA8PSA3KSByZXR1cm4gYCgke2Quc2xpY2UoMCwgMil9KSAke2Quc2xpY2UoMil9YDtcbiAgICByZXR1cm4gYCgke2Quc2xpY2UoMCwgMil9KSAke2Quc2xpY2UoMiwgNyl9LSR7ZC5zbGljZSg3KX1gO1xuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7IHNldFNlbGVjdGVkVmFsdWUobnVsbCk7IHNldEV4dHJhRGF0YShcIlwiKTsgc2V0UGhvbmVDaGVja1Jlc3VsdChudWxsKTsgfSwgW3NlbGVjdGVkQ2Fycmllcl0pO1xuXG4gIGNvbnN0IGZvcm1hdENvb2xkb3duTWVzc2FnZSA9IHVzZUNhbGxiYWNrKChtZXNzYWdlPzogc3RyaW5nKSA9PiB7XG4gICAgaWYgKCFtZXNzYWdlKSByZXR1cm4gXCJcIjtcbiAgICBjb25zdCBpc29NYXRjaCA9IG1lc3NhZ2UubWF0Y2goLyhcXGR7NH0tXFxkezJ9LVxcZHsyfVRbXFxkOi5dK1o/KS8pO1xuICAgIGlmICghaXNvTWF0Y2gpIHJldHVybiBtZXNzYWdlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGR0ID0gbmV3IERhdGUoaXNvTWF0Y2hbMV0pO1xuICAgICAgY29uc3QgZm9ybWF0dGVkID0gZm9ybWF0RnVsbERhdGVUaW1lQlIoZHQpO1xuXG4gICAgICBpZiAobWVzc2FnZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKFwiY29vbGRvd25cIikpIHtcbiAgICAgICAgcmV0dXJuIGDij7MgQ29vbGRvd24gYXRpdm8hXFxuRXN0ZSBuw7ptZXJvIHJlY2ViZXUgdW1hIHJlY2FyZ2EgcmVjZW50ZW1lbnRlLlxcblVtYSBub3ZhIHJlY2FyZ2Egc8OzIHNlcsOhIHBlcm1pdGlkYSBhcMOzcyAke2Zvcm1hdHRlZH0uYDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1lc3NhZ2UucmVwbGFjZShpc29NYXRjaFsxXSwgZm9ybWF0dGVkKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBtZXNzYWdlO1xuICAgIH1cbiAgfSwgW10pO1xuXG4gIGNvbnN0IGhhbmRsZUNoZWNrUGhvbmUgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCF0ZWxlZm9uZS50cmltKCkpIHsgYXBwVG9hc3QuZXJyb3IoXCJEaWdpdGUgbyBuw7ptZXJvXCIpOyByZXR1cm47IH1cbiAgICBcbiAgICBjb25zdCBub3JtYWxpemVkUGhvbmUgPSB0ZWxlZm9uZS5yZXBsYWNlKC9cXEQvZywgXCJcIik7XG5cbiAgICAvLyBJZiBubyBjYXJyaWVyIHNlbGVjdGVkLCB0cnkgdG8gYXV0by1kZXRlY3Qgb3BlcmF0b3IgZmlyc3RcbiAgICBpZiAoIXNlbGVjdGVkQ2Fycmllcj8uY2FycmllcklkKSB7XG4gICAgICBzZXRDaGVja2luZ1Bob25lKHRydWUpO1xuICAgICAgc2V0UGhvbmVDaGVja1Jlc3VsdChudWxsKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHF1ZXJ5UmVzcCA9IGF3YWl0IGNhbGxBcGkoXCJxdWVyeS1vcGVyYXRvclwiLCB7IHBob25lTnVtYmVyOiBub3JtYWxpemVkUGhvbmUgfSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicXVlcnktb3BlcmF0b3IgcmVzdWx0OlwiLCBxdWVyeVJlc3ApO1xuICAgICAgICBcbiAgICAgICAgaWYgKHF1ZXJ5UmVzcD8uc3VjY2VzcyAmJiBxdWVyeVJlc3AuZGF0YSkge1xuICAgICAgICAgIC8vIFRyeSB0byBtYXRjaCBvcGVyYXRvciBuYW1lIGZyb20gcmVzcG9uc2UgdG8gY2F0YWxvZ1xuICAgICAgICAgIGNvbnN0IG9wZXJhdG9yTmFtZSA9IHF1ZXJ5UmVzcC5kYXRhLmNhcnJpZXI/Lm5hbWUgfHwgcXVlcnlSZXNwLmRhdGEub3BlcmF0b3IgfHwgcXVlcnlSZXNwLmRhdGEub3BlcmFkb3JhIHx8IHF1ZXJ5UmVzcC5kYXRhLm5hbWUgfHwgXCJcIjtcbiAgICAgICAgICBpZiAob3BlcmF0b3JOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemUgPSAoczogc3RyaW5nKSA9PiBzLm5vcm1hbGl6ZShcIk5GRFwiKS5yZXBsYWNlKC9bXFx1MDMwMC1cXHUwMzZmXS9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpLnRyaW0oKTtcbiAgICAgICAgICAgIGNvbnN0IG1hdGNoZWQgPSBjYXRhbG9nLmZpbmQoYyA9PiBub3JtYWxpemUoYy5uYW1lKS5pbmNsdWRlcyhub3JtYWxpemUob3BlcmF0b3JOYW1lKSkgfHwgbm9ybWFsaXplKG9wZXJhdG9yTmFtZSkuaW5jbHVkZXMobm9ybWFsaXplKGMubmFtZSkpKTtcbiAgICAgICAgICAgIGlmIChtYXRjaGVkKSB7XG4gICAgICAgICAgICAgIHNldFNlbGVjdGVkQ2FycmllcihtYXRjaGVkKTtcbiAgICAgICAgICAgICAgYXBwVG9hc3Quc3VjY2VzcyhgT3BlcmFkb3JhIGRldGVjdGFkYTogJHttYXRjaGVkLm5hbWV9YCk7XG4gICAgICAgICAgICAgIC8vIE5vdyBwcm9jZWVkIHRvIGNoZWNrLXBob25lIHdpdGggdGhlIGRldGVjdGVkIGNhcnJpZXJcbiAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwID0gYXdhaXQgY2FsbEFwaShcImNoZWNrLXBob25lXCIsIHsgcGhvbmVOdW1iZXI6IG5vcm1hbGl6ZWRQaG9uZSwgY2FycmllcklkOiBtYXRjaGVkLmNhcnJpZXJJZCB9KTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcD8uc3VjY2VzcyAmJiByZXNwLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGNoZWNrUmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgICAgICAuLi5yZXNwLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IHJlc3AuZGF0YS5zdGF0dXMgPT09IFwiQ09PTERPV05cIlxuICAgICAgICAgICAgICAgICAgICAgID8gZm9ybWF0Q29vbGRvd25NZXNzYWdlKHJlc3AuZGF0YS5tZXNzYWdlKVxuICAgICAgICAgICAgICAgICAgICAgIDogKHJlc3AuZGF0YS5tZXNzYWdlIHx8IFwiTsO6bWVybyBkaXNwb27DrXZlbCBwYXJhIHJlY2FyZ2EuXCIpLFxuICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgIHNldFBob25lQ2hlY2tSZXN1bHQoY2hlY2tSZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgaWYgKGNoZWNrUmVzdWx0LnN0YXR1cyA9PT0gXCJDTEVBUlwiKSBhcHBUb2FzdC5zdWNjZXNzKFwiTsO6bWVybyBkaXNwb27DrXZlbCFcIik7XG4gICAgICAgICAgICAgICAgICBlbHNlIGlmIChjaGVja1Jlc3VsdC5zdGF0dXMgPT09IFwiQ09PTERPV05cIikgYXBwVG9hc3Qud2FybmluZyhjaGVja1Jlc3VsdC5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoZWNrUmVzdWx0LnN0YXR1cyA9PT0gXCJCTEFDS0xJU1RFRFwiKSBhcHBUb2FzdC5ibG9ja2VkKGNoZWNrUmVzdWx0Lm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSBjaGVjay1waG9uZSBlcnJvciBhZnRlciBhdXRvLWRldGVjdCAqLyB9XG4gICAgICAgICAgICAgIHNldENoZWNraW5nUGhvbmUoZmFsc2UpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0b2FzdC53YXJuaW5nKGBPcGVyYWRvcmEgXCIke29wZXJhdG9yTmFtZX1cIiBkZXRlY3RhZGEsIG1hcyBuw6NvIGVuY29udHJhZGEgbm8gY2F0w6Fsb2dvLiBTZWxlY2lvbmUgbWFudWFsbWVudGUuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRvYXN0Lndhcm5pbmcoXCJOw6NvIGZvaSBwb3Nzw612ZWwgZGV0ZWN0YXIgYSBvcGVyYWRvcmEuIFNlbGVjaW9uZSBtYW51YWxtZW50ZS5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRvYXN0Lndhcm5pbmcoXCJOw6NvIGZvaSBwb3Nzw612ZWwgZGV0ZWN0YXIgYSBvcGVyYWRvcmEuIFNlbGVjaW9uZSBtYW51YWxtZW50ZS5cIik7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcIkF1dG8tZGV0ZWN0IG9wZXJhdG9yIGZhaWxlZDpcIiwgZXJyLm1lc3NhZ2UpO1xuICAgICAgICB0b2FzdC53YXJuaW5nKFwiU2VsZWNpb25lIGEgb3BlcmFkb3JhIG1hbnVhbG1lbnRlLlwiKTtcbiAgICAgIH1cbiAgICAgIHNldENoZWNraW5nUGhvbmUoZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNldENoZWNraW5nUGhvbmUodHJ1ZSk7XG4gICAgc2V0UGhvbmVDaGVja1Jlc3VsdChudWxsKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGNhbGxBcGkoXCJjaGVjay1waG9uZVwiLCB7XG4gICAgICAgIHBob25lTnVtYmVyOiBub3JtYWxpemVkUGhvbmUsXG4gICAgICAgIGNhcnJpZXJJZDogc2VsZWN0ZWRDYXJyaWVyLmNhcnJpZXJJZCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVzcD8uc3VjY2VzcyAmJiByZXNwLmRhdGEpIHtcbiAgICAgICAgY29uc3QgY2hlY2tSZXN1bHQgPSB7XG4gICAgICAgICAgLi4ucmVzcC5kYXRhLFxuICAgICAgICAgIG1lc3NhZ2U6IHJlc3AuZGF0YS5zdGF0dXMgPT09IFwiQ09PTERPV05cIlxuICAgICAgICAgICAgPyBmb3JtYXRDb29sZG93bk1lc3NhZ2UocmVzcC5kYXRhLm1lc3NhZ2UpXG4gICAgICAgICAgICA6IChyZXNwLmRhdGEubWVzc2FnZSB8fCBcIk7Dum1lcm8gZGlzcG9uw612ZWwgcGFyYSByZWNhcmdhLlwiKSxcbiAgICAgICAgfTtcblxuICAgICAgICBzZXRQaG9uZUNoZWNrUmVzdWx0KGNoZWNrUmVzdWx0KTtcbiAgICAgICAgaWYgKGNoZWNrUmVzdWx0LnN0YXR1cyA9PT0gXCJCTEFDS0xJU1RFRFwiKSB7XG4gICAgICAgICAgdG9hc3QuZXJyb3IoY2hlY2tSZXN1bHQubWVzc2FnZSB8fCBcIk7Dum1lcm8gbmEgYmxhY2tsaXN0XCIpO1xuICAgICAgICB9IGVsc2UgaWYgKGNoZWNrUmVzdWx0LnN0YXR1cyA9PT0gXCJDT09MRE9XTlwiKSB7XG4gICAgICAgICAgdG9hc3Qud2FybmluZyhjaGVja1Jlc3VsdC5tZXNzYWdlIHx8IFwiTsO6bWVybyBlbSBjb29sZG93blwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2FzdC5zdWNjZXNzKFwiTsO6bWVybyBkaXNwb27DrXZlbCFcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgdG9hc3QuZXJyb3IoZXJyLm1lc3NhZ2UgfHwgXCJFcnJvIGFvIHZlcmlmaWNhciBuw7ptZXJvXCIpO1xuICAgIH1cbiAgICBzZXRDaGVja2luZ1Bob25lKGZhbHNlKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVSZWNhcmdhID0gYXN5bmMgKGU6IFJlYWN0LkZvcm1FdmVudCwgc2tpcFBlbmRpbmdDaGVjayA9IGZhbHNlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICghdGVsZWZvbmUudHJpbSgpIHx8ICFzZWxlY3RlZENhcnJpZXIgfHwgIXNlbGVjdGVkVmFsdWUpIHtcbiAgICAgIHRvYXN0LmVycm9yKFwiUHJlZW5jaGEgdG9kb3Mgb3MgY2FtcG9zXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzZWxlY3RlZENhcnJpZXIuZXh0cmFGaWVsZD8ucmVxdWlyZWQgJiYgIWV4dHJhRGF0YS50cmltKCkpIHtcbiAgICAgIHRvYXN0LmVycm9yKGBQcmVlbmNoYSBvIGNhbXBvOiAke3NlbGVjdGVkQ2Fycmllci5leHRyYUZpZWxkLnRpdGxlfWApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzZWxlY3RlZFZhbHVlLmNvc3QgPiBzYWxkbykge1xuICAgICAgdG9hc3QuZXJyb3IoXCJTYWxkbyBpbnN1ZmljaWVudGVcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIHBlbmRpbmcgcmVjYXJnYXMgb24gc2FtZSBudW1iZXJcbiAgICBpZiAoIXNraXBQZW5kaW5nQ2hlY2spIHtcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRQaG9uZSA9IHRlbGVmb25lLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgIGNvbnN0IHsgY291bnQgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKFwicmVjYXJnYXNcIilcbiAgICAgICAgLnNlbGVjdChcImlkXCIsIHsgY291bnQ6IFwiZXhhY3RcIiwgaGVhZDogdHJ1ZSB9KVxuICAgICAgICAuZXEoXCJ0ZWxlZm9uZVwiLCBub3JtYWxpemVkUGhvbmUpXG4gICAgICAgIC5lcShcInN0YXR1c1wiLCBcInBlbmRpbmdcIik7XG4gICAgICBpZiAoY291bnQgJiYgY291bnQgPiAwKSB7XG4gICAgICAgIHNldFBlbmRpbmdXYXJuaW5nKHsgcGhvbmU6IHRlbGVmb25lLCBjb3VudCB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNldFNlbmRpbmcodHJ1ZSk7XG4gICAgc2V0UmVjYXJnYVJlc3VsdChudWxsKTtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgbm9ybWFsaXplZFBob25lID0gdGVsZWZvbmUucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuXG4gICAgICAvLyBSZXZhbGlkYSBpbWVkaWF0YW1lbnRlIGFudGVzIGRlIHJlY2FycmVnYXIgcGFyYSBldml0YXIgZGl2ZXJnw6puY2lhIGRlIHN0YXR1c1xuICAgICAgY29uc3QgcHJlY2hlY2tSZXNwID0gYXdhaXQgY2FsbEFwaShcImNoZWNrLXBob25lXCIsIHtcbiAgICAgICAgcGhvbmVOdW1iZXI6IG5vcm1hbGl6ZWRQaG9uZSxcbiAgICAgICAgY2FycmllcklkOiBzZWxlY3RlZENhcnJpZXIuY2FycmllcklkLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChwcmVjaGVja1Jlc3A/LnN1Y2Nlc3MgJiYgcHJlY2hlY2tSZXNwLmRhdGEpIHtcbiAgICAgICAgY29uc3QgcHJlY2hlY2tSZXN1bHQgPSB7XG4gICAgICAgICAgLi4ucHJlY2hlY2tSZXNwLmRhdGEsXG4gICAgICAgICAgbWVzc2FnZTogcHJlY2hlY2tSZXNwLmRhdGEuc3RhdHVzID09PSBcIkNPT0xET1dOXCJcbiAgICAgICAgICAgID8gZm9ybWF0Q29vbGRvd25NZXNzYWdlKHByZWNoZWNrUmVzcC5kYXRhLm1lc3NhZ2UpXG4gICAgICAgICAgICA6IChwcmVjaGVja1Jlc3AuZGF0YS5tZXNzYWdlIHx8IFwiTsO6bWVybyBkaXNwb27DrXZlbCBwYXJhIHJlY2FyZ2EuXCIpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHNldFBob25lQ2hlY2tSZXN1bHQocHJlY2hlY2tSZXN1bHQpO1xuXG4gICAgICAgIGlmIChwcmVjaGVja1Jlc3VsdC5zdGF0dXMgPT09IFwiQkxBQ0tMSVNURURcIiB8fCBwcmVjaGVja1Jlc3VsdC5zdGF0dXMgPT09IFwiQ09PTERPV05cIikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihwcmVjaGVja1Jlc3VsdC5tZXNzYWdlIHx8IFwiTsO6bWVybyBpbmRpc3BvbsOtdmVsIHBhcmEgcmVjYXJnYSBubyBtb21lbnRvLlwiKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgY2FsbEFwaShcInJlY2hhcmdlXCIsIHtcbiAgICAgICAgY2FycmllcklkOiBzZWxlY3RlZENhcnJpZXIuY2FycmllcklkLFxuICAgICAgICBwaG9uZU51bWJlcjogbm9ybWFsaXplZFBob25lLFxuICAgICAgICB2YWx1ZUlkOiBzZWxlY3RlZFZhbHVlLnZhbHVlSWQsXG4gICAgICAgIGV4dHJhRGF0YTogZXh0cmFEYXRhLnRyaW0oKSB8fCB1bmRlZmluZWQsXG4gICAgICAgIHNhbGRvX3RpcG86IFwicmV2ZW5kYVwiLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChyZXNwPy5zdWNjZXNzKSB7XG4gICAgICAgIGNvbnN0IG5ld0JhbGFuY2UgPSByZXNwLmRhdGE/LmxvY2FsQmFsYW5jZSA/PyAoc2FsZG8gLSBzZWxlY3RlZFZhbHVlLmNvc3QpO1xuICAgICAgICBjb25zdCBleHRlcm5hbElkID0gcmVzcC5kYXRhPy5faWQgfHwgbnVsbDtcbiAgICAgICAgY29uc3Qgb3JkZXJTdGF0dXMgPSByZXNwLmRhdGE/LnN0YXR1cztcbiAgICAgICAgc2V0UmVjYXJnYVJlc3VsdCh7XG4gICAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgICBtZXNzYWdlOiBgUGVkaWRvIGRlICR7Zm10KHNlbGVjdGVkVmFsdWUudmFsdWUpfSAoJHtzZWxlY3RlZENhcnJpZXIubmFtZX0pIHBhcmEgJHt0ZWxlZm9uZX0gZW52aWFkbyBjb20gc3VjZXNzbyEgTm92byBzYWxkbzogJHtmbXQobmV3QmFsYW5jZSl9YCxcbiAgICAgICAgICBleHRlcm5hbElkLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG9yZGVyU3RhdHVzID09PSBcImZlaXRhXCIgfHwgb3JkZXJTdGF0dXMgPT09IFwiY29tcGxldGVkXCIpIHtcbiAgICAgICAgICB0b2FzdC5zdWNjZXNzKGDinIUgUmVjYXJnYSBjb25jbHXDrWRhISAke2ZtdChzZWxlY3RlZFZhbHVlLnZhbHVlKX0gKCR7c2VsZWN0ZWRDYXJyaWVyLm5hbWV9KSBwYXJhICR7dGVsZWZvbmV9LiBOb3ZvIHNhbGRvOiAke2ZtdChuZXdCYWxhbmNlKX1gKTtcbiAgICAgICAgICBwbGF5U3VjY2Vzc1NvdW5kKCk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGVsZWZvbmUoXCJcIik7XG4gICAgICAgIHNldFNlbGVjdGVkQ2FycmllcihudWxsKTtcbiAgICAgICAgc2V0U2VsZWN0ZWRWYWx1ZShudWxsKTtcbiAgICAgICAgc2V0RXh0cmFEYXRhKFwiXCIpO1xuICAgICAgICBzZXRQaG9uZUNoZWNrUmVzdWx0KG51bGwpO1xuICAgICAgICBmZXRjaERhdGEoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihmb3JtYXRDb29sZG93bk1lc3NhZ2UocmVzcD8uZXJyb3IgfHwgXCJFcnJvIGFvIGNyaWFyIHJlY2FyZ2FcIikpO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBjb25zdCBtc2cgPSBmb3JtYXRDb29sZG93bk1lc3NhZ2UoZXJyLm1lc3NhZ2UgfHwgXCJFcnJvIGFvIHJlYWxpemFyIHJlY2FyZ2FcIik7XG4gICAgICBjb25zdCBmaW5hbE1zZyA9IChtc2cudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhcImNvb2xkb3duXCIpICYmICFtc2cuaW5jbHVkZXMoXCLij7NcIikpID8gYOKPsyAke21zZ31gIDogbXNnO1xuICAgICAgc2V0UmVjYXJnYVJlc3VsdCh7IHN1Y2Nlc3M6IGZhbHNlLCBtZXNzYWdlOiBmaW5hbE1zZyB9KTtcbiAgICB9XG4gICAgc2V0U2VuZGluZyhmYWxzZSk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlU2F2ZUNvbnRhY3RzID0gYXN5bmMgKCkgPT4ge1xuICAgIHNldFNhdmluZ0NvbnRhY3RzKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yOiBwcm9maWxlRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oXCJwcm9maWxlc1wiKS51cGRhdGUoeyB0ZWxlZ3JhbV91c2VybmFtZTogdGVsZWdyYW1Vc2VybmFtZS50cmltKCkgfHwgbnVsbCwgd2hhdHNhcHBfbnVtYmVyOiB3aGF0c2FwcE51bWJlci50cmltKCkgfHwgbnVsbCB9IGFzIGFueSkuZXEoXCJpZFwiLCB1c2VyIS5pZCk7XG4gICAgICBpZiAocHJvZmlsZUVycm9yKSB0aHJvdyBwcm9maWxlRXJyb3I7XG4gICAgICAvLyBTYXZlIHRlbGVncmFtX2JvdF90b2tlbiB0byByZXNlbGxlcl9jb25maWcgKHNlY3VyZSBzdG9yYWdlKVxuICAgICAgY29uc3QgdG9rZW5WYWx1ZSA9IHRlbGVncmFtQm90VG9rZW4udHJpbSgpIHx8IG51bGw7XG4gICAgICBjb25zdCB7IGVycm9yOiBjb25maWdFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbShcInJlc2VsbGVyX2NvbmZpZ1wiKS51cHNlcnQoXG4gICAgICAgIHsgdXNlcl9pZDogdXNlciEuaWQsIGtleTogXCJ0ZWxlZ3JhbV9ib3RfdG9rZW5cIiwgdmFsdWU6IHRva2VuVmFsdWUgfSxcbiAgICAgICAgeyBvbkNvbmZsaWN0OiBcInVzZXJfaWQsa2V5XCIgfVxuICAgICAgKTtcbiAgICAgIGlmIChjb25maWdFcnJvcikgdGhyb3cgY29uZmlnRXJyb3I7XG4gICAgICB0b2FzdC5zdWNjZXNzKFwiQ29udGF0b3Mgc2Fsdm9zIVwiKTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkgeyB0b2FzdC5lcnJvcihlcnIubWVzc2FnZSB8fCBcIkVycm8gYW8gc2FsdmFyXCIpOyB9XG4gICAgc2V0U2F2aW5nQ29udGFjdHMoZmFsc2UpO1xuICB9O1xuXG4gIGNvbnN0IGZtdCA9ICh2OiBudW1iZXIpID0+IHYudG9Mb2NhbGVTdHJpbmcoXCJwdC1CUlwiLCB7IHN0eWxlOiBcImN1cnJlbmN5XCIsIGN1cnJlbmN5OiBcIkJSTFwiIH0pO1xuXG4gIGNvbnN0IGhhbmRsZVRyYWNrUmVjaGFyZ2UgPSBhc3luYyAoZXh0ZXJuYWxJZDogc3RyaW5nLCBsb2NhbFJlY2FyZ2E/OiBSZWNhcmdhKSA9PiB7XG4gICAgY29uc3QgbHIgPSBsb2NhbFJlY2FyZ2EgfHwgdHJhY2tpbmdTdGF0dXMubG9jYWxSZWNhcmdhIHx8IG51bGw7XG4gICAgc2V0VHJhY2tpbmdTdGF0dXMoeyBsb2FkaW5nOiB0cnVlLCBkYXRhOiBudWxsLCBvcGVuOiB0cnVlLCBsb2NhbFJlY2FyZ2E6IGxyIH0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwID0gYXdhaXQgY2FsbEFwaShcIm9yZGVyc1wiKTtcbiAgICAgIGlmIChyZXNwPy5zdWNjZXNzICYmIHJlc3AuZGF0YSkge1xuICAgICAgICBjb25zdCBvcmRlcnMgPSBBcnJheS5pc0FycmF5KHJlc3AuZGF0YSkgPyByZXNwLmRhdGEgOiByZXNwLmRhdGEuZGF0YSB8fCBbXTtcbiAgICAgICAgY29uc3Qgb3JkZXIgPSBvcmRlcnMuZmluZCgobzogYW55KSA9PiBvLl9pZCA9PT0gZXh0ZXJuYWxJZCk7XG4gICAgICAgIHNldFRyYWNraW5nU3RhdHVzKHsgbG9hZGluZzogZmFsc2UsIGRhdGE6IG9yZGVyIHx8IHsgX2lkOiBleHRlcm5hbElkLCBzdGF0dXM6IFwiTsOjbyBlbmNvbnRyYWRvXCIgfSwgb3BlbjogdHJ1ZSwgbG9jYWxSZWNhcmdhOiBsciB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFRyYWNraW5nU3RhdHVzKHsgbG9hZGluZzogZmFsc2UsIGRhdGE6IHsgX2lkOiBleHRlcm5hbElkLCBzdGF0dXM6IFwiRXJybyBhbyBjb25zdWx0YXJcIiB9LCBvcGVuOiB0cnVlLCBsb2NhbFJlY2FyZ2E6IGxyIH0pO1xuICAgICAgfVxuICAgIH0gY2F0Y2gge1xuICAgICAgc2V0VHJhY2tpbmdTdGF0dXMoeyBsb2FkaW5nOiBmYWxzZSwgZGF0YTogeyBfaWQ6IGV4dGVybmFsSWQsIHN0YXR1czogXCJFcnJvIGFvIGNvbnN1bHRhclwiIH0sIG9wZW46IHRydWUsIGxvY2FsUmVjYXJnYTogbHIgfSk7XG4gICAgfVxuICB9O1xuICBjb25zdCBmbXREYXRlID0gKGQ6IHN0cmluZykgPT4gZm9ybWF0RGF0ZVRpbWVCUihkKTtcblxuICBjb25zdCByZWNhcmdhc0hvamUgPSByZWNhcmdhcy5maWx0ZXIoKHIpID0+IHRvTG9jYWxEYXRlS2V5KHIuY3JlYXRlZF9hdCkgPT09IGdldFRvZGF5TG9jYWxLZXkoKSkubGVuZ3RoO1xuICBjb25zdCB1c2VyTGFiZWwgPSBwcm9maWxlTm9tZSB8fCB1c2VyPy5lbWFpbD8uc3BsaXQoXCJAXCIpWzBdIHx8IFwiUmV2ZW5kZWRvclwiO1xuICBjb25zdCB1c2VySW5pdGlhbCA9ICh1c2VyTGFiZWxbMF0gfHwgXCJSXCIpLnRvVXBwZXJDYXNlKCk7XG5cbiAgdHlwZSBNZW51SXRlbSA9IHsga2V5OiBQYWluZWxUYWI7IGxhYmVsOiBzdHJpbmc7IGljb246IHR5cGVvZiBTZW5kOyBhY3RpdmU/OiBib29sZWFuOyBkYXNoZWQ/OiBib29sZWFuIH07XG4gIGNvbnN0IG1lbnVJdGVtczogTWVudUl0ZW1bXSA9IFtcbiAgICB7IGtleTogXCJyZWNhcmdhXCIsIGxhYmVsOiBcIk5vdmEgUmVjYXJnYVwiLCBpY29uOiBTZW5kLCBhY3RpdmU6IHRydWUgfSxcbiAgICB7IGtleTogXCJhZGRTYWxkb1wiLCBsYWJlbDogXCJBZGljaW9uYXIgU2FsZG9cIiwgaWNvbjogQ3JlZGl0Q2FyZCwgZGFzaGVkOiB0cnVlIH0sXG4gICAgeyBrZXk6IFwiaGlzdG9yaWNvXCIsIGxhYmVsOiBcIkhpc3TDs3JpY28gZGUgUGVkaWRvc1wiLCBpY29uOiBIaXN0b3J5IH0sXG4gICAgeyBrZXk6IFwiZXh0cmF0b1wiLCBsYWJlbDogXCJFeHRyYXRvIGRlIERlcMOzc2l0b3NcIiwgaWNvbjogTGFuZG1hcmsgfSxcbiAgICB7IGtleTogXCJjb250YXRvc1wiLCBsYWJlbDogXCJNZXUgUGVyZmlsXCIsIGljb246IFVzZXIgfSxcbiAgICB7IGtleTogXCJzdGF0dXNcIiwgbGFiZWw6IFwiU3RhdHVzIGRvIFNpc3RlbWFcIiwgaWNvbjogQWN0aXZpdHkgfSxcbiAgXTtcblxuICBjb25zdCB0YWJUaXRsZTogUmVjb3JkPFBhaW5lbFRhYiwgc3RyaW5nPiA9IHtcbiAgICByZWNhcmdhOiBcIk5vdmEgUmVjYXJnYVwiLCBhZGRTYWxkbzogXCJBZGljaW9uYXIgU2FsZG9cIiwgaGlzdG9yaWNvOiBcIkhpc3TDs3JpY28gZGUgUGVkaWRvc1wiLFxuICAgIGV4dHJhdG86IFwiRXh0cmF0byBkZSBEZXDDs3NpdG9zXCIsIGNvbnRhdG9zOiBcIk1ldSBQZXJmaWxcIiwgc3RhdHVzOiBcIlN0YXR1cyBkbyBTaXN0ZW1hXCIsXG4gIH07XG5cbiAgY29uc3Qgc2VsZWN0VGFiID0gKG5leHRUYWI6IFBhaW5lbFRhYikgPT4geyBzZXRUYWIobmV4dFRhYik7IHNldE1lbnVPcGVuKGZhbHNlKTsgc2V0UmVjYXJnYVJlc3VsdChudWxsKTsgfTtcblxuICBjb25zdCBoYW5kbGVBdmF0YXJVcGxvYWQgPSBhc3luYyAoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcbiAgICBjb25zdCBmaWxlID0gZS50YXJnZXQuZmlsZXM/LlswXTtcbiAgICBpZiAoIWZpbGUgfHwgIXVzZXIpIHJldHVybjtcbiAgICBjb25zdCBhbGxvd2VkVHlwZXMgPSBbXCJpbWFnZS9qcGVnXCIsIFwiaW1hZ2UvcG5nXCIsIFwiaW1hZ2Uvd2VicFwiLCBcImltYWdlL2dpZlwiXTtcbiAgICBpZiAoIWFsbG93ZWRUeXBlcy5pbmNsdWRlcyhmaWxlLnR5cGUpKSB7XG4gICAgICB0b2FzdC5lcnJvcihcIkZvcm1hdG8gbsOjbyBzdXBvcnRhZG8uIFVzZSBKUEcsIFBORywgV2ViUCBvdSBHSUYuXCIpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZmlsZS5zaXplID4gMiAqIDEwMjQgKiAxMDI0KSB7XG4gICAgICB0b2FzdC5lcnJvcihcIkFycXVpdm8gbXVpdG8gZ3JhbmRlLiBNw6F4aW1vIDJNQi5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGUudGFyZ2V0LnZhbHVlID0gXCJcIjtcbiAgICAvLyBHSUYgZ29lcyBkaXJlY3RseSwgb3RoZXIgZm9ybWF0cyBvcGVuIGNyb3BwZXJcbiAgICBpZiAoZmlsZS50eXBlID09PSBcImltYWdlL2dpZlwiKSB7XG4gICAgICBhd2FpdCB1cGxvYWRBdmF0YXJGaWxlKGZpbGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRDcm9wRmlsZShmaWxlKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgdXBsb2FkQXZhdGFyRmlsZSA9IGFzeW5jIChmaWxlT3JCbG9iOiBGaWxlIHwgQmxvYikgPT4ge1xuICAgIGlmICghdXNlcikgcmV0dXJuO1xuICAgIHNldFVwbG9hZGluZ0F2YXRhcih0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZXh0ID0gZmlsZU9yQmxvYiBpbnN0YW5jZW9mIEZpbGUgPyAoZmlsZU9yQmxvYi5uYW1lLnNwbGl0KFwiLlwiKS5wb3AoKSB8fCBcImpwZ1wiKSA6IFwianBnXCI7XG4gICAgICBjb25zdCBwYXRoID0gYCR7dXNlci5pZH0vYXZhdGFyLiR7ZXh0fWA7XG4gICAgICBjb25zdCB7IGRhdGE6IGV4aXN0aW5nRmlsZXMgfSA9IGF3YWl0IHN1cGFiYXNlLnN0b3JhZ2UuZnJvbShcImF2YXRhcnNcIikubGlzdCh1c2VyLmlkKTtcbiAgICAgIGlmIChleGlzdGluZ0ZpbGVzPy5sZW5ndGgpIHtcbiAgICAgICAgYXdhaXQgc3VwYWJhc2Uuc3RvcmFnZS5mcm9tKFwiYXZhdGFyc1wiKS5yZW1vdmUoZXhpc3RpbmdGaWxlcy5tYXAoZiA9PiBgJHt1c2VyLmlkfS8ke2YubmFtZX1gKSk7XG4gICAgICB9XG4gICAgICBjb25zdCB7IGVycm9yOiB1cEVyciB9ID0gYXdhaXQgc3VwYWJhc2Uuc3RvcmFnZS5mcm9tKFwiYXZhdGFyc1wiKS51cGxvYWQocGF0aCwgZmlsZU9yQmxvYiwgeyB1cHNlcnQ6IHRydWUgfSk7XG4gICAgICBpZiAodXBFcnIpIHRocm93IHVwRXJyO1xuICAgICAgY29uc3QgeyBkYXRhOiB1cmxEYXRhIH0gPSBzdXBhYmFzZS5zdG9yYWdlLmZyb20oXCJhdmF0YXJzXCIpLmdldFB1YmxpY1VybChwYXRoKTtcbiAgICAgIGNvbnN0IHB1YmxpY1VybCA9IHVybERhdGEucHVibGljVXJsICsgXCI/dD1cIiArIERhdGUubm93KCk7XG4gICAgICBhd2FpdCBzdXBhYmFzZS5mcm9tKFwicHJvZmlsZXNcIikudXBkYXRlKHsgYXZhdGFyX3VybDogcHVibGljVXJsIH0gYXMgYW55KS5lcShcImlkXCIsIHVzZXIuaWQpO1xuICAgICAgc2V0QXZhdGFyVXJsKHB1YmxpY1VybCk7XG4gICAgICB0b2FzdC5zdWNjZXNzKFwiRm90byBkZSBwZXJmaWwgYXR1YWxpemFkYSFcIik7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIHRvYXN0LmVycm9yKFwiRXJybyBhbyBlbnZpYXIgZm90bzogXCIgKyAoZXJyLm1lc3NhZ2UgfHwgXCJ0ZW50ZSBub3ZhbWVudGVcIikpO1xuICAgIH1cbiAgICBzZXRVcGxvYWRpbmdBdmF0YXIoZmFsc2UpO1xuICB9O1xuXG4gIGNvbnN0IFthdmF0YXJFcnJvciwgc2V0QXZhdGFyRXJyb3JdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2hvd0F2YXRhck1lbnUsIHNldFNob3dBdmF0YXJNZW51XSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAvLyBSZXNldCBlcnJvciB3aGVuIFVSTCBjaGFuZ2VzXG4gIHVzZUVmZmVjdCgoKSA9PiB7IHNldEF2YXRhckVycm9yKGZhbHNlKTsgfSwgW2F2YXRhclVybF0pO1xuXG4gIGNvbnN0IEF2YXRhckRpc3BsYXkgPSAoeyBzaXplID0gXCJ3LTEyIGgtMTJcIiwgdGV4dFNpemUgPSBcInRleHQtYmFzZVwiIH06IHsgc2l6ZT86IHN0cmluZzsgdGV4dFNpemU/OiBzdHJpbmcgfSkgPT4gKFxuICAgIGF2YXRhclVybCAmJiAhYXZhdGFyRXJyb3IgPyAoXG4gICAgICA8aW1nIFxuICAgICAgICBzcmM9e2F2YXRhclVybH0gXG4gICAgICAgIGFsdD1cIkF2YXRhclwiIFxuICAgICAgICBjbGFzc05hbWU9e2Ake3NpemV9IHJvdW5kZWQtZnVsbCBvYmplY3QtY292ZXIgc2hyaW5rLTBgfSBcbiAgICAgICAgcmVmZXJyZXJQb2xpY3k9XCJuby1yZWZlcnJlclwiXG4gICAgICAgIGNyb3NzT3JpZ2luPVwiYW5vbnltb3VzXCJcbiAgICAgICAgb25FcnJvcj17KCkgPT4gc2V0QXZhdGFyRXJyb3IodHJ1ZSl9XG4gICAgICAvPlxuICAgICkgOiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17YCR7c2l6ZX0gcm91bmRlZC1mdWxsIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZm9udC1ib2xkICR7dGV4dFNpemV9IHNocmluay0wYH0+XG4gICAgICAgIHt1c2VySW5pdGlhbH1cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIG1kOmZsZXggcGItOFwiPlxuICAgICAgey8qIE1vYmlsZSBNZW51IEJvdHRvbSBTaGVldCAqL31cbiAgICAgIHttZW51T3BlbiAmJiAoXG4gICAgICAgIDw+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzYwIGJhY2tkcm9wLWJsdXItc20gei1bNjBdIG1kOmhpZGRlblwiIG9uQ2xpY2s9eygpID0+IHNldE1lbnVPcGVuKGZhbHNlKX0gLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpeGVkIGluc2V0LXgtMCBib3R0b20tMCB6LVs2MV0gbWQ6aGlkZGVuIHJvdW5kZWQtdC0yeGwgYmctY2FyZC85NSBiYWNrZHJvcC1ibHVyLXhsIHNoYWRvdy1bMF8tOHB4XzQwcHhfcmdiYSgwLDAsMCwwLjUpXSBwYi1bZW52KHNhZmUtYXJlYS1pbnNldC1ib3R0b20pXSBib3JkZXItdCBib3JkZXItYm9yZGVyLzUwXCI+XG4gICAgICAgICAgICB7LyogRHJhZyBoYW5kbGUgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1jZW50ZXIgcHQtMyBwYi0xXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xMCBoLTEgcm91bmRlZC1mdWxsIGJnLW11dGVkLWZvcmVncm91bmQvMjBcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsvKiBIZWFkZXIgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweC01IHBiLTNcIj5cbiAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cImZvbnQtZGlzcGxheSB0ZXh0LWxnIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj5NZW51PC9oMj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgIDxUaGVtZVRvZ2dsZSAvPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0TWVudU9wZW4oZmFsc2UpfSBjbGFzc05hbWU9XCJ3LTggaC04IHJvdW5kZWQtZnVsbCBiZy1kZXN0cnVjdGl2ZS8xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LWRlc3RydWN0aXZlIGhvdmVyOmJnLWRlc3RydWN0aXZlLzIwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgICAgICA8WCBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIFVzZXIgSW5mbyAqL31cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXgtNCBtYi0zIHAtMyByb3VuZGVkLXhsIGdsYXNzLWNhcmQgcmdiLWJvcmRlclwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgPEF2YXRhckRpc3BsYXkgLz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi13LTBcIj5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmQgdHJ1bmNhdGVcIj57dXNlcj8uZW1haWx9PC9wPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXN1Y2Nlc3MgZm9udC1tZWRpdW1cIj57bG9hZGluZyA/IDxTa2VsZXRvblZhbHVlIHdpZHRoPVwidy0xNFwiIGNsYXNzTmFtZT1cImgtM1wiIC8+IDogZm10KHNhbGRvKX08L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsvKiBHcmlkICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC00IHBiLTMgZ3JpZCBncmlkLWNvbHMtMyBnYXAtMlwiPlxuICAgICAgICAgICAgICB7bWVudUl0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzQWN0aXZlID0gdGFiID09PSBpdGVtLmtleTtcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBrZXk9e2l0ZW0ua2V5fVxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZWxlY3RUYWIoaXRlbS5rZXkpfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBweS00IHB4LTIgcm91bmRlZC14bCBhY3RpdmU6c2NhbGUtOTUgdHJhbnNpdGlvbi1hbGwgJHtcbiAgICAgICAgICAgICAgICAgICAgICBpc0FjdGl2ZVxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcImJnLXByaW1hcnkvMTUgdGV4dC1wcmltYXJ5IGJvcmRlciBib3JkZXItcHJpbWFyeS8yNSBzaGFkb3ctWzBfMF8xMnB4X2hzbCh2YXIoLS1wcmltYXJ5KS8wLjEpXVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiYmctbXV0ZWQvMzAgdGV4dC1mb3JlZ3JvdW5kIGhvdmVyOmJnLW11dGVkLzUwXCJcbiAgICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxpdGVtLmljb24gY2xhc3NOYW1lPXtgaC02IHctNiAke2lzQWN0aXZlID8gXCJ0ZXh0LXByaW1hcnlcIiA6IFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCJ9YH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdGV4dC1bMTFweF0gZm9udC1zZW1pYm9sZCB0ZXh0LWNlbnRlciBsZWFkaW5nLXRpZ2h0ICR7aXNBY3RpdmUgPyBcInRleHQtcHJpbWFyeVwiIDogXCJ0ZXh0LWZvcmVncm91bmRcIn1gfT57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9KX1cblxuICAgICAgICAgICAgICB7IWlzQ2xpZW50TW9kZSAmJiAoXG4gICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgIGhyZWY9e3Byb2ZpbGVTbHVnID8gYC9sb2phLyR7cHJvZmlsZVNsdWd9YCA6IGAvcmVjYXJnYT9yZWY9JHt1c2VyPy5pZH1gfVxuICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgcHktNCBweC0yIHJvdW5kZWQteGwgYmctbXV0ZWQvMzAgdGV4dC1mb3JlZ3JvdW5kIGhvdmVyOmJnLW11dGVkLzUwIGFjdGl2ZTpzY2FsZS05NSB0cmFuc2l0aW9uLWFsbFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPFN0b3JlIGNsYXNzTmFtZT1cImgtNiB3LTYgdGV4dC1hY2NlbnRcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gZm9udC1zZW1pYm9sZCB0ZXh0LWNlbnRlciBsZWFkaW5nLXRpZ2h0XCI+TWluaGEgTG9qYTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgICAgeyFpc0NsaWVudE1vZGUgJiYgKHJvbGUgPT09IFwiYWRtaW5cIiB8fCByb2xlID09PSBcInJldmVuZGVkb3JcIikgJiYgKFxuICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICBocmVmPVwiL2FkbWluXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHB5LTQgcHgtMiByb3VuZGVkLXhsIGJnLW11dGVkLzMwIHRleHQtZm9yZWdyb3VuZCBob3ZlcjpiZy1tdXRlZC81MCBhY3RpdmU6c2NhbGUtOTUgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxTaGllbGQgY2xhc3NOYW1lPVwiaC02IHctNiB0ZXh0LXdhcm5pbmdcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gZm9udC1zZW1pYm9sZCB0ZXh0LWNlbnRlciBsZWFkaW5nLXRpZ2h0XCI+QWRtaW48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsvKiBTYWlyICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC00IHBiLTUgcHQtMVwiPlxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17c2lnbk91dH1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktMyByb3VuZGVkLXhsIGJnLWRlc3RydWN0aXZlLzEwIHRleHQtZGVzdHJ1Y3RpdmUgdGV4dC1zbSBmb250LXNlbWlib2xkIGhvdmVyOmJnLWRlc3RydWN0aXZlLzE1IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHRyYW5zaXRpb24tYWxsIGJvcmRlciBib3JkZXItZGVzdHJ1Y3RpdmUvMTVcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPExvZ091dCBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz4gU2FpclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8Lz5cbiAgICAgICl9XG5cbiAgICAgIHsvKiBEZXNrdG9wIFNpZGViYXIgKi99XG4gICAgICA8YXNpZGUgY2xhc3NOYW1lPVwiaGlkZGVuIG1kOmJsb2NrIG1kOnN0aWNreSB0b3AtMCBsZWZ0LTAgaC1zY3JlZW4gdy1bMjgwcHhdIHotMzAgYm9yZGVyLXIgYm9yZGVyLWJvcmRlciBiZy1jYXJkLzk1IGJhY2tkcm9wLWJsdXIteGxcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLWZ1bGwgZmxleCBmbGV4LWNvbCByZWxhdGl2ZVwiPlxuICAgICAgICAgIHsvKiBTdWJ0bGUgZ3JhZGllbnQgZ2xvdyAqL31cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC0wIGxlZnQtMCByaWdodC0wIGgtMzIgYmctZ3JhZGllbnQtdG8tYiBmcm9tLXByaW1hcnkvNSB0by10cmFuc3BhcmVudCBwb2ludGVyLWV2ZW50cy1ub25lXCIgLz5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtNSBweS01IGJvcmRlci1iIGJvcmRlci1ib3JkZXIgcmVsYXRpdmVcIj5cbiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC14bCBmb250LWJvbGQgc2hpbW1lci1sZXR0ZXJzXCI+XG4gICAgICAgICAgICAgIFJlY2FyZ2FzIDxzcGFuIGNsYXNzTmFtZT1cImJyYXNpbC13b3JkXCI+QnJhc2lsPC9zcGFuPlxuICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHVwcGVyY2FzZSB0cmFja2luZy13aWRlc3QgdGV4dC1wcmltYXJ5LzgwIGZvbnQtc2VtaWJvbGQgbXQtMS41XCI+UmV2ZW5kZWRvcjwvcD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC00IHNwYWNlLXktMyBib3JkZXItYiBib3JkZXItYm9yZGVyIHJlbGF0aXZlXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdsYXNzLWNhcmQgcm91bmRlZC14bCBwLTMuNSBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyByZ2ItYm9yZGVyXCI+XG4gICAgICAgICAgICAgIDxBdmF0YXJEaXNwbGF5IC8+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLXctMFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNSBtaW4tdy0wXCI+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmQgdHJ1bmNhdGUgdXBwZXJjYXNlIHNoaW1tZXItbGV0dGVyc1wiPlxuICAgICAgICAgICAgICAgICAgICB7dXNlckxhYmVsfVxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAge3JvbGUgPT09IFwiYWRtaW5cIiAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LXByaW1hcnkgZmxleC1zaHJpbmstMCBhbmltYXRlLVtzcGluLXdvYmJsZV8zc19lYXNlLWluLW91dF9pbmZpbml0ZV1cIiB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cImN1cnJlbnRDb2xvclwiIHN0eWxlPXt7IGFuaW1hdGlvbk5hbWU6ICdzcGluLXdvYmJsZScgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xMiAyTDE0LjA5IDguMjZMMjEgOS4yN0wxNi4xOCAxMy4xNEwxNy42NCAyMC4wMkwxMiAxNi43N0w2LjM2IDIwLjAyTDcuODIgMTMuMTRMMyA5LjI3TDkuOTEgOC4yNkwxMiAyWlwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk05LjUgMTIuNUwxMSAxNEwxNC41IDEwLjVcIiBzdHJva2U9XCJ3aGl0ZVwiIHN0cm9rZVdpZHRoPVwiMS41XCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiIGZpbGw9XCJub25lXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRydW5jYXRlXCI+e3VzZXI/LmVtYWlsfTwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLXhsIHAtMy41XCI+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgZm9udC1zZW1pYm9sZFwiPlNldSBzYWxkbzwvcD5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ib2xkIHRleHQtc3VjY2VzcyBtdC0xXCI+e2xvYWRpbmcgPyA8U2tlbGV0b25WYWx1ZSB3aWR0aD1cInctMjRcIiBjbGFzc05hbWU9XCJoLTdcIiAvPiA6IDxBbmltYXRlZENvdW50ZXIgdmFsdWU9e3NhbGRvfSBwcmVmaXg9XCJSJCZuYnNwO1wiIC8+fTwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPG5hdiBjbGFzc05hbWU9XCJwLTMgc3BhY2UteS0xIG92ZXJmbG93LXktYXV0byBmbGV4LTEgcmVsYXRpdmVcIj5cbiAgICAgICAgICAgIHttZW51SXRlbXMubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IGlzQWN0aXZlID0gdGFiID09PSBpdGVtLmtleTtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICBrZXk9e2l0ZW0ua2V5fVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2VsZWN0VGFiKGl0ZW0ua2V5KX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIuNSByb3VuZGVkLWxnIHRleHQtbGVmdCB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRyYW5zaXRpb24tYWxsICR7XG4gICAgICAgICAgICAgICAgICAgIGlzQWN0aXZlXG4gICAgICAgICAgICAgICAgICAgICAgPyBcIm5hdi1pdGVtLWFjdGl2ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgOiBpdGVtLmRhc2hlZFxuICAgICAgICAgICAgICAgICAgICAgID8gXCJ0ZXh0LXN1Y2Nlc3MgYm9yZGVyIGJvcmRlci1kYXNoZWQgYm9yZGVyLXN1Y2Nlc3MvMzAgaG92ZXI6Ymctc3VjY2Vzcy8xMFwiXG4gICAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3Zlcjp0ZXh0LWZvcmVncm91bmQgaG92ZXI6YmctbXV0ZWQvNDBcIlxuICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPGl0ZW0uaWNvbiBjbGFzc05hbWU9e2BoLTQgdy00IHNocmluay0wICR7aXNBY3RpdmUgPyBcInRleHQtcHJpbWFyeVwiIDogaXRlbS5kYXNoZWQgPyBcInRleHQtc3VjY2Vzc1wiIDogXCJcIn1gfSAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSl9XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHQtMyBtdC0zIGJvcmRlci10IGJvcmRlci1ib3JkZXJcIj5cbiAgICAgICAgICAgICAgPGEgaHJlZj1cIi9jaGF0XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0zIHJvdW5kZWQteGwgdGV4dC1zbSBmb250LXNlbWlib2xkIGJnLXByaW1hcnkvMTAgdGV4dC1wcmltYXJ5IGhvdmVyOmJnLXByaW1hcnkvMjAgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIHRyYW5zaXRpb24tYWxsIGdyb3VwIHNoYWRvdy1bMF8wXzEycHhfaHNsKHZhcigtLXByaW1hcnkpLzAuMDgpXVwiPlxuICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGFuaW1hdGU9e3sgc2NhbGU6IFsxLCAxLjE1LCAxXSB9fSB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAyLCByZXBlYXQ6IEluZmluaXR5LCBlYXNlOiBcImVhc2VJbk91dFwiIH19PlxuICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VDaXJjbGUgY2xhc3NOYW1lPVwiaC01IHctNSB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICA8c3Bhbj5CYXRlLXBhcG88L3NwYW4+XG4gICAgICAgICAgICAgICAgPENoZXZyb25SaWdodCBjbGFzc05hbWU9XCJoLTQgdy00IG1sLWF1dG8gb3BhY2l0eS01MCBncm91cC1ob3ZlcjpvcGFjaXR5LTEwMCB0cmFuc2l0aW9uLW9wYWNpdHlcIiAvPlxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgeyFpc0NsaWVudE1vZGUgJiYgKHJvbGUgPT09IFwiYWRtaW5cIiB8fCByb2xlID09PSBcInJldmVuZGVkb3JcIikgJiYgKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB0LTMgbXQtMyBib3JkZXItdCBib3JkZXItYm9yZGVyIHNwYWNlLXktMVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtMiB0ZXh0LVsxMHB4XSB0cmFja2luZy13aWRlc3QgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kLzYwIHVwcGVyY2FzZSBmb250LXNlbWlib2xkXCI+QWRtaW5pc3RyYcOnw6NvPC9kaXY+XG4gICAgICAgICAgICAgICAgPGEgaHJlZj1cIi9hZG1pblwiIGNsYXNzTmFtZT1cInctZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBweC0zIHB5LTIgcm91bmRlZC1sZyB0ZXh0LXNtIHRleHQtcHJpbWFyeS84MCBob3Zlcjp0ZXh0LXByaW1hcnkgaG92ZXI6YmctcHJpbWFyeS81IHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgICAgICA8U2hpZWxkIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPiA8c3Bhbj5QYWluZWwgQWRtaW48L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgICAgIHtyb2xlID09PSBcImFkbWluXCIgJiYgKFxuICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cIi9wcmluY2lwYWxcIiBjbGFzc05hbWU9XCJ3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yIHJvdW5kZWQtbGcgdGV4dC1zbSB0ZXh0LXByaW1hcnkvODAgaG92ZXI6dGV4dC1wcmltYXJ5IGhvdmVyOmJnLXByaW1hcnkvNSB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgICAgICAgICA8TGFuZG1hcmsgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IDxzcGFuPlBhaW5lbCBQcmluY2lwYWw8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApfVxuICAgICAgICAgIDwvbmF2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTQgYm9yZGVyLXQgYm9yZGVyLWJvcmRlciBzcGFjZS15LTMgcmVsYXRpdmVcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+VGVtYTwvc3Bhbj5cbiAgICAgICAgICAgICAgPFRoZW1lVG9nZ2xlIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17c2lnbk91dH1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB5LTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZGVzdHJ1Y3RpdmUvMjUgdGV4dC1kZXN0cnVjdGl2ZSB0ZXh0LXNtIGZvbnQtbWVkaXVtIGhvdmVyOmJnLWRlc3RydWN0aXZlLzEwIHRyYW5zaXRpb24tYWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIGdyb3VwXCI+XG4gICAgICAgICAgICAgIDxMb2dPdXQgY2xhc3NOYW1lPVwiaC00IHctNCBncm91cC1ob3Zlcjp0cmFuc2xhdGUteC0wLjUgdHJhbnNpdGlvbi10cmFuc2Zvcm1cIiAvPiBTYWlyXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2FzaWRlPlxuXG4gICAgICB7LyogTWFpbiAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xIG1pbi13LTBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdGlja3kgdG9wLTAgei1bNzBdXCI+XG4gICAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJnbGFzcy1oZWFkZXIgcHgtNCBtZDpweC02IHB5LTQgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHJlbGF0aXZlIHotWzEwMF0gb3ZlcmZsb3ctdmlzaWJsZVwiPlxuICAgICAgICAgICAgey8qIEhlYWRlciBncmFkaWVudCBhY2NlbnQgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGJvdHRvbS0wIGxlZnQtMCByaWdodC0wIGgtcHggYmctZ3JhZGllbnQtdG8tciBmcm9tLXRyYW5zcGFyZW50IHZpYS1wcmltYXJ5LzIwIHRvLXRyYW5zcGFyZW50XCIgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cImZvbnQtZGlzcGxheSB0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57dGFiVGl0bGVbdGFiXX08L2gyPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2VsZWN0VGFiKFwiYWRkU2FsZG9cIil9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaC05IHB4LTQgcm91bmRlZC14bCBiZy1zdWNjZXNzIHRleHQtc3VjY2Vzcy1mb3JlZ3JvdW5kIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgdGV4dC1zbSBmb250LWJvbGQgc2hhZG93LVswXzBfMTZweF9oc2wodmFyKC0tc3VjY2VzcykvMC4zNSldIGhvdmVyOnNoYWRvdy1bMF8wXzI0cHhfaHNsKHZhcigtLXN1Y2Nlc3MpLzAuNSldIGhvdmVyOnNjYWxlLTEwNSBhY3RpdmU6c2NhbGUtOTUgdHJhbnNpdGlvbi1hbGxcIj5cbiAgICAgICAgICAgICAgICA8Q3JlZGl0Q2FyZCBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz5cbiAgICAgICAgICAgICAgICA8c3Bhbj57bG9hZGluZyA/IDxTa2VsZXRvblZhbHVlIHdpZHRoPVwidy0xMlwiIGNsYXNzTmFtZT1cImgtNFwiIC8+IDogPEFuaW1hdGVkQ291bnRlciB2YWx1ZT17c2FsZG99IHByZWZpeD1cIlIkJm5ic3A7XCIgLz59PC9zcGFuPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSB6LVs4MF1cIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFNob3dBdmF0YXJNZW51KHByZXYgPT4gIXByZXYpfSBjbGFzc05hbWU9XCJmb2N1czpvdXRsaW5lLW5vbmVcIj5cbiAgICAgICAgICAgICAgICAgIDxBdmF0YXJEaXNwbGF5IHNpemU9XCJ3LTkgaC05XCIgdGV4dFNpemU9XCJ0ZXh0LXhzXCIgLz5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICAgICAgICAgICAge3Nob3dBdmF0YXJNZW51ICYmIChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpeGVkIGluc2V0LTAgei1bMTE5XVwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dBdmF0YXJNZW51KGZhbHNlKX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45LCB5OiAtNCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45LCB5OiAtNCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC4xNSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgcmlnaHQtNCBtZDpyaWdodC02IHRvcC1bNC4yNXJlbV0gbWQ6dG9wLVs0LjVyZW1dIHotWzEyMF0gbWluLXctWzE2MHB4XSByb3VuZGVkLXhsIGJnLWNhcmQgYm9yZGVyIGJvcmRlci1ib3JkZXIgc2hhZG93LXhsIHAtMlwiXG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC0zIHB5LTIgYm9yZGVyLWIgYm9yZGVyLWJvcmRlciBtYi0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRydW5jYXRlXCI+e3VzZXI/LmVtYWlsfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7IHNldFNob3dBdmF0YXJNZW51KGZhbHNlKTsgc2lnbk91dCgpOyB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtMyBweS0yLjUgcm91bmRlZC1sZyB0ZXh0LWRlc3RydWN0aXZlIHRleHQtc20gZm9udC1tZWRpdW0gaG92ZXI6YmctZGVzdHJ1Y3RpdmUvMTAgdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8TG9nT3V0IGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPiBTYWlyIGRhIGNvbnRhXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIHotMTBcIj48UmVjYXJnYXNUaWNrZXIgLz48L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgPG1haW4gY2xhc3NOYW1lPVwibWF4LXctNXhsIG14LWF1dG8gcC00IG1kOnAtNiBwYi0yNCBtZDpwYi02IHNwYWNlLXktNVwiPlxuICAgICAgICAgIHsvKiBTdGF0cyAtIGhpZGRlbiBvbiBwcm9maWxlIHRhYiAqL31cbiAgICAgICAgICB7dGFiICE9PSBcImNvbnRhdG9zXCIgJiYgKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMiBsZzpncmlkLWNvbHMtMyBnYXAtM1wiPlxuICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgeyBpY29uOiBTbWFydHBob25lLCBsYWJlbDogXCJSZWNhcmdhcyBIb2plXCIsIHJhd1ZhbHVlOiByZWNhcmdhc0hvamUsIGlzQ3VycmVuY3k6IGZhbHNlLCBjb2xvcjogXCJ0ZXh0LXByaW1hcnlcIiwgYmdDb2xvcjogXCJiZy1wcmltYXJ5LzEwXCIsIGFuaW06IFwiZmxvYXRcIiBhcyBjb25zdCB9LFxuICAgICAgICAgICAgICB7IGljb246IENsb2NrLCBsYWJlbDogXCJUb3RhbFwiLCByYXdWYWx1ZTogcmVjYXJnYXMubGVuZ3RoLCBpc0N1cnJlbmN5OiBmYWxzZSwgY29sb3I6IFwidGV4dC1hY2NlbnRcIiwgYmdDb2xvcjogXCJiZy1hY2NlbnQvMTBcIiwgYW5pbTogXCJwdWxzZVwiIGFzIGNvbnN0IH0sXG4gICAgICAgICAgICBdLm1hcCgoYywgaSkgPT4gKFxuICAgICAgICAgICAgICA8bW90aW9uLmRpdiBrZXk9e2MubGFiZWx9IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMTYgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19IHRyYW5zaXRpb249e3sgZGVsYXk6IGkgKiAwLjEsIHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMjAwIH19IGNsYXNzTmFtZT1cImtwaS1jYXJkXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMi41IG1iLTIuNVwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B3LTEwIGgtMTAgcm91bmRlZC14bCAke2MuYmdDb2xvcn0gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgaWNvbi1jb250YWluZXJgfT5cbiAgICAgICAgICAgICAgICAgICAgPEFuaW1hdGVkSWNvbiBpY29uPXtjLmljb259IGNsYXNzTmFtZT17YGgtNSB3LTUgJHtjLmNvbG9yfWB9IGFuaW1hdGlvbj17Yy5hbmltfSBkZWxheT17aSAqIDAuMTJ9IC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgZm9udC1zZW1pYm9sZFwiPntjLmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9e2B0ZXh0LTJ4bCBtZDp0ZXh0LTN4bCBmb250LWJvbGQgJHtjLmNvbG9yfSB0cnVuY2F0ZWB9PlxuICAgICAgICAgICAgICAgICAge2xvYWRpbmcgPyA8U2tlbGV0b25WYWx1ZSB3aWR0aD1cInctMTZcIiBjbGFzc05hbWU9XCJoLTdcIiAvPiA6IGMuaXNDdXJyZW5jeSA/IDxBbmltYXRlZENvdW50ZXIgdmFsdWU9e2MucmF3VmFsdWV9IHByZWZpeD1cIlIkJm5ic3A7XCIgLz4gOiA8QW5pbWF0ZWRJbnQgdmFsdWU9e2MucmF3VmFsdWV9IC8+fVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHsvKiBCYW5uZXJzIFByb21vY2lvbmFpcyAqL31cbiAgICAgICAgICB7YmFubmVyc0xpc3QuZmlsdGVyKGIgPT4gYi5lbmFibGVkICYmIGIudHlwZSAhPT0gXCJwb3B1cFwiICYmICFkaXNtaXNzZWRCYW5uZXJzLmhhcyhiLnBvc2l0aW9uKSkubWFwKGIgPT4gKFxuICAgICAgICAgICAgPFByb21vQmFubmVyXG4gICAgICAgICAgICAgIGtleT17Yi5pZH1cbiAgICAgICAgICAgICAgdGl0bGU9e2IudGl0bGUgfHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICBzdWJ0aXRsZT17Yi5zdWJ0aXRsZSB8fCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgIHZpc2libGU9e3RydWV9XG4gICAgICAgICAgICAgIGxpbms9e2IubGluayB8fCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHNldERpc21pc3NlZEJhbm5lcnMocHJldiA9PiBuZXcgU2V0KFsuLi5wcmV2LCBiLnBvc2l0aW9uXSkpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICApKX1cblxuICAgICAgICAgIHsvKiBQb3B1cCBCYW5uZXJzICovfVxuICAgICAgICAgIHtiYW5uZXJzTGlzdC5maWx0ZXIoYiA9PiBiLmVuYWJsZWQgJiYgYi50eXBlID09PSBcInBvcHVwXCIgJiYgIWRpc21pc3NlZEJhbm5lcnMuaGFzKGIucG9zaXRpb24pKS5tYXAoYiA9PiAoXG4gICAgICAgICAgICA8UG9wdXBCYW5uZXJcbiAgICAgICAgICAgICAga2V5PXtiLmlkfVxuICAgICAgICAgICAgICB0aXRsZT17Yi50aXRsZSB8fCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgIHN1YnRpdGxlPXtiLnN1YnRpdGxlIHx8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgdmlzaWJsZT17dHJ1ZX1cbiAgICAgICAgICAgICAgbGluaz17Yi5saW5rIHx8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0RGlzbWlzc2VkQmFubmVycyhwcmV2ID0+IG5ldyBTZXQoWy4uLnByZXYsIGIucG9zaXRpb25dKSl9XG4gICAgICAgICAgICAvPlxuICAgICAgICAgICkpfVxuXG4gICAgICAgICAgey8qID09PT09IFRBQjogUkVDQVJHQSA9PT09PSAqL31cbiAgICAgICAgICB7dGFiID09PSBcInJlY2FyZ2FcIiAmJiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICB7LyogU3VjY2Vzcy9FcnJvciBvdmVybGF5ICovfVxuICAgICAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICAgICAgICAgIHtyZWNhcmdhUmVzdWx0ICYmIChcbiAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOSB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH19IGV4aXQ9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOSB9fVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJnbGFzcy1tb2RhbCByb3VuZGVkLTJ4bCBwLTggdGV4dC1jZW50ZXJcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IHNjYWxlOiAwIH19IGFuaW1hdGU9e3sgc2NhbGU6IDEgfX0gdHJhbnNpdGlvbj17eyB0eXBlOiBcInNwcmluZ1wiLCBzdGlmZm5lc3M6IDMwMCwgZGFtcGluZzogMTUsIGRlbGF5OiAwLjEgfX1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LTIwIGgtMjAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG14LWF1dG8gbWItNCAke3JlY2FyZ2FSZXN1bHQuc3VjY2VzcyA/IFwiYmctd2FybmluZy8xNVwiIDogXCJiZy1kZXN0cnVjdGl2ZS8xNVwifWB9PlxuICAgICAgICAgICAgICAgICAgICAgIHtyZWNhcmdhUmVzdWx0LnN1Y2Nlc3NcbiAgICAgICAgICAgICAgICAgICAgICAgID8gPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IHJvdGF0ZTogMzYwIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyByZXBlYXQ6IEluZmluaXR5LCBkdXJhdGlvbjogMS41LCBlYXNlOiBcImxpbmVhclwiIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TG9hZGVyMiBjbGFzc05hbWU9XCJoLTEwIHctMTAgdGV4dC13YXJuaW5nXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgOiA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgc2NhbGU6IFsxLCAxLjE1LCAxLCAxLjEsIDFdLCByb3RhdGU6IFswLCAtMTAsIDEwLCAtNSwgMF0sIG9wYWNpdHk6IFsxLCAwLjcsIDFdIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyByZXBlYXQ6IEluZmluaXR5LCBkdXJhdGlvbjogMi41LCBlYXNlOiBcImVhc2VJbk91dFwiIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8WENpcmNsZSBjbGFzc05hbWU9XCJoLTEwIHctMTAgdGV4dC1kZXN0cnVjdGl2ZSBkcm9wLXNoYWRvdy1bMF8wXzhweF9yZ2JhKDIzOSw2OCw2OCwwLjUpXVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT17YGZvbnQtZGlzcGxheSB0ZXh0LXhsIGZvbnQtYm9sZCBtYi0yICR7cmVjYXJnYVJlc3VsdC5zdWNjZXNzID8gXCJ0ZXh0LXdhcm5pbmdcIiA6IFwidGV4dC1kZXN0cnVjdGl2ZVwifWB9PlxuICAgICAgICAgICAgICAgICAgICAgIHtyZWNhcmdhUmVzdWx0LnN1Y2Nlc3MgPyBcIuKPsyBQcm9jZXNzYW5kbyBQZWRpZG8uLi5cIiA6IFwiRXJybyBuYSBSZWNhcmdhXCJ9XG4gICAgICAgICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtYi02XCI+e3JlY2FyZ2FSZXN1bHQubWVzc2FnZX08L3A+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBzbTpmbGV4LXJvdyBnYXAtMyBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtyZWNhcmdhUmVzdWx0LnN1Y2Nlc3MgJiYgcmVjYXJnYVJlc3VsdC5leHRlcm5hbElkICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlVHJhY2tSZWNoYXJnZShyZWNhcmdhUmVzdWx0LmV4dGVybmFsSWQhKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtNiBweS0yLjUgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLXByaW1hcnkgdGV4dC1wcmltYXJ5IGZvbnQtc2VtaWJvbGQgaG92ZXI6YmctcHJpbWFyeS8xMCB0cmFuc2l0aW9uLWNvbG9ycyBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMlwiXG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxFeWUgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IEFjb21wYW5oYXIgUmVjYXJnYVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHsgc2V0UmVjYXJnYVJlc3VsdChudWxsKTsgc2V0VHJhY2tpbmdTdGF0dXMoeyBsb2FkaW5nOiBmYWxzZSwgZGF0YTogbnVsbCwgb3BlbjogZmFsc2UsIGxvY2FsUmVjYXJnYTogbnVsbCB9KTsgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTYgcHktMi41IHJvdW5kZWQteGwgYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBmb250LXNlbWlib2xkIGhvdmVyOm9wYWNpdHktOTAgdHJhbnNpdGlvbi1vcGFjaXR5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cmVjYXJnYVJlc3VsdC5zdWNjZXNzID8gXCJOb3ZhIFJlY2FyZ2FcIiA6IFwiVGVudGFyIE5vdmFtZW50ZVwifVxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cblxuICAgICAgICAgICAgICB7LyogVHJhY2tpbmcgTW9kYWwgKi99XG4gICAgICAgICAgICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICAgICAgICAgICAge3RyYWNraW5nU3RhdHVzLm9wZW4gJiYgKFxuICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fSBleGl0PXt7IG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCBiZy1iYWNrZ3JvdW5kLzcwIGJhY2tkcm9wLWJsdXItc20gei1bNzBdIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB4LTRcIlxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRUcmFja2luZ1N0YXR1cyhwcmV2ID0+ICh7IC4uLnByZXYsIG9wZW46IGZhbHNlIH0pKX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDMwLCBzY2FsZTogMC45NSB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAsIHNjYWxlOiAxIH19IGV4aXQ9e3sgb3BhY2l0eTogMCwgeTogMzAsIHNjYWxlOiAwLjk1IH19XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLTJ4bCB3LWZ1bGwgbWF4LXctbWQgcC02XCJcbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi00XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtbGcgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8QWN0aXZpdHkgY2xhc3NOYW1lPVwiaC01IHctNSB0ZXh0LXByaW1hcnlcIiAvPiBBY29tcGFuaGFtZW50b1xuICAgICAgICAgICAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0VHJhY2tpbmdTdGF0dXMocHJldiA9PiAoeyAuLi5wcmV2LCBvcGVuOiBmYWxzZSB9KSl9IGNsYXNzTmFtZT1cInAtMSByb3VuZGVkLW1kIGhvdmVyOmJnLWRlc3RydWN0aXZlLzE1IHRleHQtZGVzdHJ1Y3RpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPFggY2xhc3NOYW1lPVwiaC01IHctNVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICAgIHt0cmFja2luZ1N0YXR1cy5sb2FkaW5nID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBweS04IGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxMb2FkZXIyIGNsYXNzTmFtZT1cImgtOCB3LTggYW5pbWF0ZS1zcGluIHRleHQtcHJpbWFyeVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+Q29uc3VsdGFuZG8gc3RhdHVzLi4uPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKSA6IHRyYWNraW5nU3RhdHVzLmRhdGEgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgcm91bmRlZC1sZyBiZy1tdXRlZC8zMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+SUQ8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LW1vbm8gdGV4dC1mb3JlZ3JvdW5kXCI+e3RyYWNraW5nU3RhdHVzLmRhdGEuX2lkIHx8IFwi4oCUXCJ9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIHJvdW5kZWQtbGcgYmctbXV0ZWQvMzBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlN0YXR1czwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0ZXh0LXhzIGZvbnQtYm9sZCBweC0yIHB5LTEgcm91bmRlZC1mdWxsICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFja2luZ1N0YXR1cy5kYXRhLnN0YXR1cyA9PT0gXCJmZWl0YVwiIHx8IHRyYWNraW5nU3RhdHVzLmRhdGEuc3RhdHVzID09PSBcImNvbXBsZXRlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1zdWNjZXNzLzE1IHRleHQtc3VjY2Vzc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdHJhY2tpbmdTdGF0dXMuZGF0YS5zdGF0dXMgPT09IFwiYW5kYW1lbnRvXCIgfHwgdHJhY2tpbmdTdGF0dXMuZGF0YS5zdGF0dXMgPT09IFwiaW5fcHJvZ3Jlc3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiYmctYmx1ZS01MDAvMTUgdGV4dC1ibHVlLTQwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdHJhY2tpbmdTdGF0dXMuZGF0YS5zdGF0dXMgPT09IFwicGVuZGVudGVcIiB8fCB0cmFja2luZ1N0YXR1cy5kYXRhLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcImJnLXdhcm5pbmcvMTUgdGV4dC13YXJuaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0cmFja2luZ1N0YXR1cy5kYXRhLnN0YXR1cyA9PT0gXCJmYWxoYVwiIHx8IHRyYWNraW5nU3RhdHVzLmRhdGEuc3RhdHVzID09PSBcImZhaWxlZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1kZXN0cnVjdGl2ZS8xNSB0ZXh0LWRlc3RydWN0aXZlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcImJnLW11dGVkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3RyYWNraW5nU3RhdHVzLmRhdGEuc3RhdHVzID09PSBcImZlaXRhXCIgfHwgdHJhY2tpbmdTdGF0dXMuZGF0YS5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgPyBcIuKchSBDb25jbHXDrWRhXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiB0cmFja2luZ1N0YXR1cy5kYXRhLnN0YXR1cyA9PT0gXCJhbmRhbWVudG9cIiB8fCB0cmFja2luZ1N0YXR1cy5kYXRhLnN0YXR1cyA9PT0gXCJpbl9wcm9ncmVzc1wiID8gXCLwn5SEIEVtIGFuZGFtZW50b1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdHJhY2tpbmdTdGF0dXMuZGF0YS5zdGF0dXMgPT09IFwicGVuZGVudGVcIiB8fCB0cmFja2luZ1N0YXR1cy5kYXRhLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIgPyBcIuKPsyBQcm9jZXNzYW5kb1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdHJhY2tpbmdTdGF0dXMuZGF0YS5zdGF0dXMgPT09IFwiZmFsaGFcIiB8fCB0cmFja2luZ1N0YXR1cy5kYXRhLnN0YXR1cyA9PT0gXCJmYWlsZWRcIiA/IFwi4p2MIEZhbGhvdVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogdHJhY2tpbmdTdGF0dXMuZGF0YS5zdGF0dXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3RyYWNraW5nU3RhdHVzLmRhdGEucGhvbmVOdW1iZXIgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyByb3VuZGVkLWxnIGJnLW11dGVkLzMwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlRlbGVmb25lPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LWZvcmVncm91bmRcIj57dHJhY2tpbmdTdGF0dXMuZGF0YS5waG9uZU51bWJlcn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0cmFja2luZ1N0YXR1cy5kYXRhLmNhcnJpZXI/Lm5hbWUgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyByb3VuZGVkLWxnIGJnLW11dGVkLzMwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPk9wZXJhZG9yYTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1mb3JlZ3JvdW5kXCI+e3RyYWNraW5nU3RhdHVzLmRhdGEuY2Fycmllci5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgey8qIFNob3cgbG9jYWwgcmVjYXJnYSBkYXRhIHdpdGggdmFsb3IsIGN1c3RvIGFuZCBsdWNybyAqL31cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3RyYWNraW5nU3RhdHVzLmxvY2FsUmVjYXJnYSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC0zIHJvdW5kZWQtbGcgYmctbXV0ZWQvMzBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5WYWxvciBkYSBSZWNhcmdhPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57Zm10KHNhZmVWYWxvcih0cmFja2luZ1N0YXR1cy5sb2NhbFJlY2FyZ2EpKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyByb3VuZGVkLWxnIGJnLW11dGVkLzMwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+Q3VzdG8gKGRlYml0YWRvKTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+e2ZtdCh0cmFja2luZ1N0YXR1cy5sb2NhbFJlY2FyZ2EuY3VzdG8pfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApIDogdHJhY2tpbmdTdGF0dXMuZGF0YS52YWx1ZSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwLTMgcm91bmRlZC1sZyBiZy1tdXRlZC8zMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5WYWxvcjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPntmbXQoTnVtYmVyKHRyYWNraW5nU3RhdHVzLmRhdGEudmFsdWUuY29zdCB8fCB0cmFja2luZ1N0YXR1cy5kYXRhLnZhbHVlLnZhbHVlIHx8IDApKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB7dHJhY2tpbmdTdGF0dXMuZGF0YS5jcmVhdGVkQXQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHAtMyByb3VuZGVkLWxnIGJnLW11dGVkLzMwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPkNyaWFkbyBlbTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1mb3JlZ3JvdW5kXCI+e2ZtdERhdGUodHJhY2tpbmdTdGF0dXMuZGF0YS5jcmVhdGVkQXQpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVRyYWNrUmVjaGFyZ2UodHJhY2tpbmdTdGF0dXMuZGF0YS5faWQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBtdC0yIHB4LTQgcHktMi41IHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1wcmltYXJ5IHRleHQtcHJpbWFyeSBmb250LXNlbWlib2xkIGhvdmVyOmJnLXByaW1hcnkvMTAgdHJhbnNpdGlvbi1jb2xvcnMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPFJlZnJlc2hDdyBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz4gQXR1YWxpemFyIFN0YXR1c1xuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG5cbiAgICAgICAgICAgICAgeyFyZWNhcmdhUmVzdWx0ICYmIChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktZW5kXCI+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0U2hvd1ZhbG9yZXNNb2RhbCh0cnVlKX1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC00IHB5LTIgcm91bmRlZC1sZyBnbGFzcy1jYXJkIHRleHQtcHJpbWFyeSB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgaG92ZXI6YmctcHJpbWFyeS8xMCB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgICAgICAgICAgIOKYsCBWZXIgVGFiZWxhIGRlIFZhbG9yZXNcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgey8qIE1vZGFsIFRhYmVsYSBkZSBWYWxvcmVzIChmcm9tIEFQSSBjYXRhbG9nKSAqL31cbiAgICAgICAgICAgICAgICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICAgICAgICAgICAgICAgIHtzaG93VmFsb3Jlc01vZGFsICYmIChcbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fSBleGl0PXt7IG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZpeGVkIGluc2V0LTAgYmctYmFja2dyb3VuZC83MCBiYWNrZHJvcC1ibHVyLXNtIHotWzcwXSBmbGV4IGl0ZW1zLXN0YXJ0IGp1c3RpZnktY2VudGVyIHB0LTggbWQ6cHQtMTYgcHgtNFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93VmFsb3Jlc01vZGFsKGZhbHNlKX1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDMwLCBzY2FsZTogMC45NSB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAsIHNjYWxlOiAxIH19IGV4aXQ9e3sgb3BhY2l0eTogMCwgeTogMzAsIHNjYWxlOiAwLjk1IH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdsYXNzLWNhcmQgcm91bmRlZC0yeGwgdy1mdWxsIG1heC13LWxnIG1heC1oLVs4MHZoXSBvdmVyZmxvdy15LWF1dG8gcC01IG1kOnAtNlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiBlLnN0b3BQcm9wYWdhdGlvbigpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi00IGJvcmRlci1iIGJvcmRlci1ib3JkZXIgcGItM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+VmFsb3JlcyBlIE9wZXJhZG9yYXMgRGlzcG9uw612ZWlzPC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFNob3dWYWxvcmVzTW9kYWwoZmFsc2UpfSBjbGFzc05hbWU9XCJwLTEgcm91bmRlZC1tZCBob3ZlcjpiZy1kZXN0cnVjdGl2ZS8xNSB0ZXh0LWRlc3RydWN0aXZlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8WCBjbGFzc05hbWU9XCJoLTUgdy01XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtjYXRhbG9nTG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPntbMSwyLDNdLm1hcChpID0+IDxTa2VsZXRvblJvdyBrZXk9e2l9IC8+KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NhdGFsb2cubWFwKChjYXJyaWVyKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXJyaWVyLnZhbHVlcy5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtjYXJyaWVyLmNhcnJpZXJJZH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZCB0ZXh0LWJhc2UgbWItMlwiPntjYXJyaWVyLm5hbWV9PC9oND5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2Fycmllci52YWx1ZXMuc29ydCgoYSwgYikgPT4gYS52YWx1ZSAtIGIudmFsdWUpLm1hcCgodmFsKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt2YWwudmFsdWVJZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZENhcnJpZXIoY2Fycmllcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGVkVmFsdWUodmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2hvd1ZhbG9yZXNNb2RhbChmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3Mgcm91bmRlZC14bCBwLTMgYm9yZGVyIGJvcmRlci1ib3JkZXIgaG92ZXI6Ym9yZGVyLXByaW1hcnkvNTAgaG92ZXI6YmctcHJpbWFyeS81IHRyYW5zaXRpb24tYWxsIHRleHQtY2VudGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWZvcmVncm91bmQgZm9udC1ib2xkIHRleHQtYmFzZVwiPntmbXQodmFsLnZhbHVlKX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXByaW1hcnkgdGV4dC14cyBmb250LW1lZGl1bSBtdC0wLjVcIj5QYWdhIHtmbXQodmFsLmNvc3QpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2NhdGFsb2cubGVuZ3RoID09PSAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRleHQtY2VudGVyIHB5LTZcIj5OZW5odW1hIG9wZXJhZG9yYSBkaXNwb27DrXZlbDwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG5cbiAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IFxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJnbGFzcy1jYXJkIHJvdW5kZWQtMnhsIHAtNiBtZDpwLTEwIHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsvKiBTdWJ0bGUgZ2xvdyBhY2NlbnQgYmVoaW5kIHRoZSBjYXJkICovfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIC10b3AtMjAgbGVmdC0xLzIgLXRyYW5zbGF0ZS14LTEvMiB3LTYwIGgtNjAgcm91bmRlZC1mdWxsIGJnLXByaW1hcnkvNSBibHVyLTN4bCBwb2ludGVyLWV2ZW50cy1ub25lXCIgLz5cblxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIG1iLTggcmVsYXRpdmVcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgc2NhbGU6IDAgfX0gYW5pbWF0ZT17eyBzY2FsZTogMSB9fSBcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiAyMDAsIGRhbXBpbmc6IDE1IH19XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LTIwIGgtMjAgcm91bmRlZC1mdWxsIGJnLXByaW1hcnkvMTUgdGV4dC1wcmltYXJ5IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG14LWF1dG8gbWItNCByaW5nLTIgcmluZy1wcmltYXJ5LzIwIHJpbmctb2Zmc2V0LTIgcmluZy1vZmZzZXQtYmFja2dyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyB5OiBbMCwgLTQsIDBdLCBzY2FsZTogWzEsIDEuMDgsIDFdIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDIuNSwgZWFzZTogXCJlYXNlSW5PdXRcIiB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8U21hcnRwaG9uZSBjbGFzc05hbWU9XCJoLTkgdy05XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cImZvbnQtZGlzcGxheSB0ZXh0LTJ4bCBtZDp0ZXh0LTN4bCBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+UXVhbCBvIG7Dum1lcm8/PC9oMz5cbiAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgbXQtMVwiPkRpZ2l0ZSBvIERERCArIE7Dum1lcm8gZG8gY2VsdWxhcjwvcD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgey8qIENsaXBib2FyZCBwaG9uZSBzdWdnZXN0aW9uICovfVxuICAgICAgICAgICAgICAgICAgICB7Y2xpcGJvYXJkUGhvbmUgJiYgdGVsZWZvbmUubGVuZ3RoID09PSAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IC0xMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHsgc2V0VGVsZWZvbmUoZm9ybWF0UGhvbmVEaXNwbGF5KGNsaXBib2FyZFBob25lKSk7IHNldENsaXBib2FyZFBob25lKG51bGwpOyB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiByb3VuZGVkLXhsIHB4LTQgcHktMyBtYi0yIGJnLXByaW1hcnkvMTAgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzI1IGhvdmVyOmJnLXByaW1hcnkvMTUgdHJhbnNpdGlvbi1hbGwgYWN0aXZlOnNjYWxlLVswLjk4XVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8Q29weSBjbGFzc05hbWU9XCJ3LTQgaC00IHRleHQtcHJpbWFyeVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1sZWZ0XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LXByaW1hcnlcIj5Ow7ptZXJvIGRldGVjdGFkbyBuYSDDoXJlYSBkZSB0cmFuc2ZlcsOqbmNpYTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWJhc2UgZm9udC1tb25vIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57Zm9ybWF0UGhvbmVEaXNwbGF5KGNsaXBib2FyZFBob25lKX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgcHgtMi41IHB5LTEgcm91bmRlZC1sZyBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kXCI+Q29sYXI8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICApfVxuXG4gICAgICAgICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXtoYW5kbGVSZWNhcmdhfSBjbGFzc05hbWU9XCJzcGFjZS15LTUgbWF4LXcteGwgbXgtYXV0byByZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgIHsvKiBUZWxlZm9uZSArIGNoZWNrICovfVxuICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgZ2FwLTIuNVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRlbFwiIHZhbHVlPXt0ZWxlZm9uZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhdyA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcHJldkRpZ2l0cyA9IHRlbGVmb25lLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIHVzZXIgaXMgZGVsZXRpbmcsIGp1c3QgdXNlIHJhdyB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJhdy5sZW5ndGggPCB0ZWxlZm9uZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGVsZWZvbmUocmF3KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVzZXQgZGV0ZWN0aW9uIGlmIHBob25lIGNoYW5nZWQgc2lnbmlmaWNhbnRseVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuZXdEaWdpdHMgPSByYXcucmVwbGFjZSgvXFxEL2csIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3RGlnaXRzLmxlbmd0aCA8IDExKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRDYXJyaWVyKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldERldGVjdGVkT3BlcmF0b3JOYW1lKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3REZXRlY3RlZFBob25lUmVmLmN1cnJlbnQgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBFeHRyYWN0IGRpZ2l0cyBhbmQgcmUtZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpZ2l0cyA9IHJhdy5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRUZWxlZm9uZShmb3JtYXRQaG9uZURpc3BsYXkoZGlnaXRzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRQaG9uZUNoZWNrUmVzdWx0KG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25QYXN0ZT17KGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGRpZ2l0cyA9IGUuY2xpcGJvYXJkRGF0YS5nZXREYXRhKFwidGV4dFwiKS5yZXBsYWNlKC9cXEQvZywgXCJcIikuc2xpY2UoMCwgMTEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGVsZWZvbmUoZm9ybWF0UGhvbmVEaXNwbGF5KGRpZ2l0cykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0UGhvbmVDaGVja1Jlc3VsdChudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkIG1heExlbmd0aD17MTZ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIG1pbi13LTAgcHgtNSBweS00IHJvdW5kZWQteGwgZ2xhc3MtaW5wdXQgdGV4dC1mb3JlZ3JvdW5kIHBsYWNlaG9sZGVyOnRleHQtbXV0ZWQtZm9yZWdyb3VuZC82MCB0ZXh0LXhsIHRyYWNraW5nLXdpZGVzdCB0ZXh0LWNlbnRlciBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctcHJpbWFyeS80MCBmb250LW1vbm8gdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiKDAwKSAwMDAwMC0wMDAwXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICAgey8qIE9wZXJhZG9yYSAqL31cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmQgbWItMS41XCI+T3BlcmFkb3JhPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzZWxlY3RcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3NlbGVjdGVkQ2Fycmllcj8uY2FycmllcklkIHx8IFwiXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGMgPSBjYXRhbG9nLmZpbmQoKGMpID0+IGMuY2FycmllcklkID09PSBlLnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRDYXJyaWVyKGMgfHwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweC01IHB5LTMuNSByb3VuZGVkLXhsIGdsYXNzLWlucHV0IHRleHQtZm9yZWdyb3VuZCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctcHJpbWFyeS80MCB0cmFuc2l0aW9uLWFsbCBhcHBlYXJhbmNlLW5vbmUgYmctW2xlbmd0aDoxNnB4XSBiZy1bcmlnaHRfMTZweF9jZW50ZXJdIGJnLW5vLXJlcGVhdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmRJbWFnZTogYHVybChcImRhdGE6aW1hZ2Uvc3ZnK3htbCwlM0NzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nMTYnIGhlaWdodD0nMTYnIHZpZXdCb3g9JzAgMCAyNCAyNCcgZmlsbD0nbm9uZScgc3Ryb2tlPSclMjM4ODg4ODg4OCcgc3Ryb2tlLXdpZHRoPScyJyBzdHJva2UtbGluZWNhcD0ncm91bmQnIHN0cm9rZS1saW5lam9pbj0ncm91bmQnJTNFJTNDcGF0aCBkPSdtNyAxNSA1IDUgNS01Jy8lM0UlM0NwYXRoIGQ9J203IDkgNS01IDUgNScvJTNFJTNDL3N2ZyUzRVwiKWAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPlNlbGVjaW9uZS4uLjwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2F0YWxvZy5tYXAoKGMpID0+IDxvcHRpb24ga2V5PXtjLmNhcnJpZXJJZH0gdmFsdWU9e2MuY2FycmllcklkfT57Yy5uYW1lfTwvb3B0aW9uPil9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cblxuICAgICAgICAgICAgICAgICAgICAgICAgey8qIENoZWNrIGNvb2xkb3duL2JsYWNrbGlzdCBoaW50IC0gYXBwZWFycyBhZnRlciBzZWxlY3Rpbmcgb3BlcmF0b3IgKi99XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2VsZWN0ZWRDYXJyaWVyICYmIHRlbGVmb25lLnJlcGxhY2UoL1xcRC9nLCBcIlwiKS5sZW5ndGggPj0gMTAgJiYgIXBob25lQ2hlY2tSZXN1bHQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IC0zIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fSBjbGFzc05hbWU9XCJtdC0zIHAtMyByb3VuZGVkLXhsIGJnLXdhcm5pbmcvMTAgYm9yZGVyIGJvcmRlci13YXJuaW5nLzI1IGZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFsZXJ0VHJpYW5nbGUgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LXdhcm5pbmcgc2hyaW5rLTBcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC13YXJuaW5nIGZvbnQtbWVkaXVtIGZsZXgtMVwiPlZlcmlmaXF1ZSBzZSBvIG7Dum1lcm8gZXN0w6EgY29tIGJsYWNrbGlzdCBvdSBjb29sZG93biBhdGl2byBhbnRlcyBkZSByZWNhcnJlZ2FyLjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtoYW5kbGVDaGVja1Bob25lfSBkaXNhYmxlZD17Y2hlY2tpbmdQaG9uZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTQgcHktMiByb3VuZGVkLWxnIHRleHQtc20gZm9udC1ib2xkIGJnLXdhcm5pbmcvMjAgdGV4dC13YXJuaW5nIGhvdmVyOmJnLXdhcm5pbmcvMzAgYm9yZGVyIGJvcmRlci13YXJuaW5nLzMwIHRyYW5zaXRpb24tYWxsIHNocmluay0wXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Y2hlY2tpbmdQaG9uZSA/IDxMb2FkZXIyIGNsYXNzTmFtZT1cImgtNCB3LTQgYW5pbWF0ZS1zcGluXCIgLz4gOiBcIlZlcmlmaWNhclwifVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB7LyogQ2hlY2sgcmVzdWx0IGRpc3BsYXkgKi99XG4gICAgICAgICAgICAgICAgICAgICAgICB7cGhvbmVDaGVja1Jlc3VsdCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogLTUgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgbXQtMiBwLTMgcm91bmRlZC14bCB0ZXh0LXNtIGZvbnQtbWVkaXVtIGZsZXggaXRlbXMtc3RhcnQgZ2FwLTIgJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBob25lQ2hlY2tSZXN1bHQuc3RhdHVzID09PSBcIkNMRUFSXCIgPyBcImJnLXN1Y2Nlc3MvMTAgdGV4dC1zdWNjZXNzIGJvcmRlciBib3JkZXItc3VjY2Vzcy8yMFwiIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBob25lQ2hlY2tSZXN1bHQuc3RhdHVzID09PSBcIkNPT0xET1dOXCIgPyBcImJnLXdhcm5pbmcvMTAgdGV4dC13YXJuaW5nIGJvcmRlciBib3JkZXItd2FybmluZy8yMFwiIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYmctZGVzdHJ1Y3RpdmUvMTAgdGV4dC1kZXN0cnVjdGl2ZSBib3JkZXIgYm9yZGVyLWRlc3RydWN0aXZlLzIwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwibXQtMC41IHNocmluay0wXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3Bob25lQ2hlY2tSZXN1bHQuc3RhdHVzID09PSBcIkNMRUFSXCIgPyA8Q2hlY2tDaXJjbGUyIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPiA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBob25lQ2hlY2tSZXN1bHQuc3RhdHVzID09PSBcIkNPT0xET1dOXCIgPyA8Q2xvY2sgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFsZXJ0VHJpYW5nbGUgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3aGl0ZXNwYWNlLXByZS1saW5lXCI+e3Bob25lQ2hlY2tSZXN1bHQubWVzc2FnZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgICB7LyogRXh0cmEgZmllbGQgKGV4OiBDUEYpICovfVxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZENhcnJpZXI/LmV4dHJhRmllbGQ/LnJlcXVpcmVkICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgaGVpZ2h0OiAwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgaGVpZ2h0OiBcImF1dG9cIiB9fSB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG1iLTEuNVwiPntzZWxlY3RlZENhcnJpZXIuZXh0cmFGaWVsZC50aXRsZX0gKjwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHZhbHVlPXtleHRyYURhdGF9IG9uQ2hhbmdlPXsoZSkgPT4gc2V0RXh0cmFEYXRhKGUudGFyZ2V0LnZhbHVlKX0gcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtNSBweS0zLjUgcm91bmRlZC14bCBnbGFzcy1pbnB1dCB0ZXh0LWZvcmVncm91bmQgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXByaW1hcnkvNDAgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPXtzZWxlY3RlZENhcnJpZXIuZXh0cmFGaWVsZC50aXRsZX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICApfVxuXG4gICAgICAgICAgICAgICAgICAgICAgey8qIFZhbG9yZXMgKi99XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2FycmllciAmJiBzZWxlY3RlZENhcnJpZXIudmFsdWVzLmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXYgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG1iLTJcIj5WYWxvcjwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMyBnYXAtMi41XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkQ2Fycmllci52YWx1ZXMuc29ydCgoYSwgYikgPT4gYS52YWx1ZSAtIGIudmFsdWUpLm1hcCgodmFsLCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmJ1dHRvbiBrZXk9e3ZhbC52YWx1ZUlkfSB0eXBlPVwiYnV0dG9uXCIgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45IH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgc2NhbGU6IDEgfX0gdHJhbnNpdGlvbj17eyBkZWxheTogaSAqIDAuMDQgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTMgfX0gb25DbGljaz17KCkgPT4gc2V0U2VsZWN0ZWRWYWx1ZSh2YWwpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BweS0zIHJvdW5kZWQteGwgdGV4dC1zbSBmb250LWJvbGQgYm9yZGVyLTIgdHJhbnNpdGlvbi1hbGwgJHtzZWxlY3RlZFZhbHVlPy52YWx1ZUlkID09PSB2YWwudmFsdWVJZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGJvcmRlci1wcmltYXJ5IGdsb3ctcHJpbWFyeSBzaGFkb3ctbGcgc2hhZG93LXByaW1hcnkvMjBcIiA6IFwiYm9yZGVyLWJvcmRlciB0ZXh0LWZvcmVncm91bmQgaG92ZXI6Ym9yZGVyLXByaW1hcnkvMzAgaG92ZXI6YmctcHJpbWFyeS81IGdsYXNzXCJ9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1iYXNlXCI+e2ZtdCh2YWwudmFsdWUpfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dmFsLmxhYmVsICYmIHZhbC5sYWJlbCAhPT0gYFIkICR7dmFsLmNvc3R9YCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtbWVkaXVtIG9wYWNpdHktNzAgbXQtMC41IHRydW5jYXRlXCI+e3ZhbC5sYWJlbH08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtbWVkaXVtIG9wYWNpdHktNzAgbXQtMC41XCI+UGFnYSB7Zm10KHZhbC5jb3N0KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICAgICAgICAgIHsvKiBTZWxlY3RlZCBzdW1tYXJ5ICovfVxuICAgICAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZFZhbHVlICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogOCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLXhsIHAtNCB0ZXh0LWNlbnRlciBib3JkZXItcHJpbWFyeS8yMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5SZXN1bW8gZGEgUmVjYXJnYTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG10LTFcIj57c2VsZWN0ZWRDYXJyaWVyPy5uYW1lfSDigJQge2ZtdChzZWxlY3RlZFZhbHVlLnZhbHVlKX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1wcmltYXJ5IGZvbnQtc2VtaWJvbGRcIj5DdXN0bzoge2ZtdChzZWxlY3RlZFZhbHVlLmNvc3QpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkVmFsdWUuY29zdCA+IHNhbGRvICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtZGVzdHJ1Y3RpdmUgbXQtMS41IGZvbnQtc2VtaWJvbGRcIj7imqDvuI8gU2FsZG8gaW5zdWZpY2llbnRlPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmJ1dHRvbiB0eXBlPVwic3VibWl0XCIgZGlzYWJsZWQ9e3NlbmRpbmcgfHwgIXNlbGVjdGVkVmFsdWUgfHwgIXNlbGVjdGVkQ2FycmllciB8fCBzZWxlY3RlZFZhbHVlLmNvc3QgPiBzYWxkbyB8fCAocGhvbmVDaGVja1Jlc3VsdD8uc3RhdHVzID09PSBcIkJMQUNLTElTVEVEXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTcgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweS00IHJvdW5kZWQteGwgYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCB0ZXh0LWJhc2UgZm9udC1ib2xkIGhvdmVyOmJyaWdodG5lc3MtMTEwIGRpc2FibGVkOm9wYWNpdHktNDAgZGlzYWJsZWQ6aG92ZXI6YnJpZ2h0bmVzcy0xMDAgdHJhbnNpdGlvbi1hbGwgc2hhZG93LWxnIHNoYWRvdy1wcmltYXJ5LzI1IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yLjVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzZW5kaW5nID8gPG1vdGlvbi5kaXYgYW5pbWF0ZT17eyByb3RhdGU6IDM2MCB9fSB0cmFuc2l0aW9uPXt7IHJlcGVhdDogSW5maW5pdHksIGR1cmF0aW9uOiAxLCBlYXNlOiBcImxpbmVhclwiIH19IGNsYXNzTmFtZT1cImgtNSB3LTUgYm9yZGVyLTIgYm9yZGVyLXByaW1hcnktZm9yZWdyb3VuZCBib3JkZXItdC10cmFuc3BhcmVudCByb3VuZGVkLWZ1bGxcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IDw+PFNlbmQgY2xhc3NOYW1lPVwiaC01IHctNVwiIC8+IEVudmlhciBSZWNhcmdhIOKGkjwvPn1cbiAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZm9ybT5cblxuICAgICAgICAgICAgICAgICAgICB7LyogUGVuZGluZyByZWNoYXJnZSB3YXJuaW5nIG1vZGFsICovfVxuICAgICAgICAgICAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICAgICAgICAgICAgICAgIHtwZW5kaW5nV2FybmluZyAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIHotWzcwXSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBiZy1ibGFjay82MCBiYWNrZHJvcC1ibHVyLXNtIHB4LTRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRQZW5kaW5nV2FybmluZyhudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjksIHk6IDIwIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiBlLnN0b3BQcm9wYWdhdGlvbigpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBtYXgtdy1zbSBiZy1jYXJkIGJvcmRlciBib3JkZXItYm9yZGVyIHJvdW5kZWQtMnhsIHNoYWRvdy0yeGwgcC02IHRleHQtY2VudGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xNCBoLTE0IHJvdW5kZWQtZnVsbCBiZy13YXJuaW5nLzE1IGJvcmRlciBib3JkZXItd2FybmluZy8zMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBteC1hdXRvIG1iLTRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBbGVydFRyaWFuZ2xlIGNsYXNzTmFtZT1cImgtNyB3LTcgdGV4dC13YXJuaW5nXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG1iLTJcIj5SZWNhcmdhIGVtIFByb2Nlc3NhbWVudG88L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1iLTVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIErDoSBleGlzdGUgPHN0cm9uZyBjbGFzc05hbWU9XCJ0ZXh0LWZvcmVncm91bmRcIj57cGVuZGluZ1dhcm5pbmcuY291bnR9IHJlY2FyZ2F7cGVuZGluZ1dhcm5pbmcuY291bnQgPiAxID8gXCJzXCIgOiBcIlwifTwvc3Ryb25nPiBlbSBwcm9jZXNzYW1lbnRvIHBhcmEgbyBuw7ptZXJvIDxzdHJvbmcgY2xhc3NOYW1lPVwidGV4dC1mb3JlZ3JvdW5kXCI+e3BlbmRpbmdXYXJuaW5nLnBob25lfTwvc3Ryb25nPi4gRGVzZWphIGNvbnRpbnVhciBtZXNtbyBhc3NpbT9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFBlbmRpbmdXYXJuaW5nKG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4LTEgcHktMyByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItYm9yZGVyIHRleHQtZm9yZWdyb3VuZCBmb250LXNlbWlib2xkIHRleHQtc20gaG92ZXI6YmctbXV0ZWQvNTAgdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDYW5jZWxhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRQZW5kaW5nV2FybmluZyhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVSZWNhcmdhKHsgcHJldmVudERlZmF1bHQ6ICgpID0+IHt9IH0gYXMgUmVhY3QuRm9ybUV2ZW50LCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIHB5LTMgcm91bmRlZC14bCBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGZvbnQtc2VtaWJvbGQgdGV4dC1zbSBob3ZlcjpicmlnaHRuZXNzLTExMCB0cmFuc2l0aW9uLWFsbFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENvbnRpbnVhclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cblxuICAgICAgICAgICAgICAgICAgey8qIMOabHRpbWFzIFJlY2FyZ2FzICovfVxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1jYXJkIHJvdW5kZWQtMnhsIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB4LTUgcHktNCBib3JkZXItYiBib3JkZXItYm9yZGVyIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC14bCBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+w5psdGltYXMgUmVjYXJnYXM8L2gzPlxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2VsZWN0VGFiKFwiaGlzdG9yaWNvXCIpfSBjbGFzc05hbWU9XCJ0ZXh0LXByaW1hcnkgZm9udC1zZW1pYm9sZCB0ZXh0LXNtIGhvdmVyOm9wYWNpdHktODBcIj5WZXIgdG9kYXM8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAge3JlY2FyZ2FzLnNsaWNlKDAsIDUpLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInB5LTggdGV4dC1jZW50ZXIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+TmVuaHVtYSByZWNhcmdhIGFpbmRhPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiByZWNhcmdhcy5zbGljZSgwLCA1KS5tYXAoKHIsIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGtleT17ci5pZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB4OiAtMjAgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB4OiAwIH19IHRyYW5zaXRpb249e3sgZGVsYXk6IGkgKiAwLjA3LCBkdXJhdGlvbjogMC4zIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IChyLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiB8fCByLnN0YXR1cyA9PT0gXCJjb25jbHVpZGFcIikgPyBzZXRSZWNlaXB0UmVjYXJnYShyKSA6IG51bGx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHB4LTUgcHktNCBib3JkZXItYiBib3JkZXItYm9yZGVyIGxhc3Q6Ym9yZGVyLTAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgdHJhbnNpdGlvbi1jb2xvcnMgJHsoci5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgfHwgci5zdGF0dXMgPT09IFwiY29uY2x1aWRhXCIpID8gXCJob3ZlcjpiZy1tdXRlZC8yMCBjdXJzb3ItcG9pbnRlciBhY3RpdmU6YmctbXV0ZWQvMzBcIiA6IFwiaG92ZXI6YmctbXV0ZWQvMjBcIn1gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2B3LTEyIGgtMTIgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNocmluay0wICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHIuc3RhdHVzID09PSBcImNvbXBsZXRlZFwiIHx8IHIuc3RhdHVzID09PSBcImNvbmNsdWlkYVwiKSA/IFwiYmctc3VjY2Vzcy8xNVwiIDogci5zdGF0dXMgPT09IFwicGVuZGluZ1wiID8gXCJiZy13YXJuaW5nLzE1XCIgOiByLnN0YXR1cyA9PT0gXCJmYWxoYVwiID8gXCJiZy1kZXN0cnVjdGl2ZS8xNVwiIDogXCJiZy1tdXRlZC81MFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7KHIuc3RhdHVzID09PSBcImNvbXBsZXRlZFwiIHx8IHIuc3RhdHVzID09PSBcImNvbmNsdWlkYVwiKSA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxBbmltYXRlZENoZWNrIHNpemU9ezI0fSBjbGFzc05hbWU9XCJ0ZXh0LXN1Y2Nlc3NcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiByLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBhbmltYXRlPXt7IHJvdGF0ZTogMzYwIH19IHRyYW5zaXRpb249e3sgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDIsIGVhc2U6IFwibGluZWFyXCIgfX0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxMb2FkZXIyIGNsYXNzTmFtZT1cImgtNiB3LTYgdGV4dC13YXJuaW5nXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogci5zdGF0dXMgPT09IFwiZmFsaGFcIiA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGU6IFsxLCAxLjE1LCAxLCAxLjEsIDFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0ZTogWzAsIC0xMCwgMTAsIC01LCAwXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiBbMSwgMC43LCAxXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHJlcGVhdDogSW5maW5pdHksIGR1cmF0aW9uOiAyLjUsIGVhc2U6IFwiZWFzZUluT3V0XCIgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFhDaXJjbGUgY2xhc3NOYW1lPVwiaC02IHctNiB0ZXh0LWRlc3RydWN0aXZlIGRyb3Atc2hhZG93LVswXzBfNnB4X3JnYmEoMjM5LDY4LDY4LDAuNSldXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFNtYXJ0cGhvbmUgY2xhc3NOYW1lPVwiaC01IHctNSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi13LTAgZmxleC0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdGV4dC14cyBmb250LWJvbGQgcHgtMiBweS0wLjUgcm91bmRlZC1tZCBib3JkZXIgJHtvcGVyYWRvcmFDb2xvcnMoci5vcGVyYWRvcmEpLmJnfSAke29wZXJhZG9yYUNvbG9ycyhyLm9wZXJhZG9yYSkudGV4dH0gJHtvcGVyYWRvcmFDb2xvcnMoci5vcGVyYWRvcmEpLmJvcmRlcn1gfT57ci5vcGVyYWRvcmEgfHwgXCJPcGVyYWRvcmFcIn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQgZm9udC1tb25vXCI+e3IudGVsZWZvbmV9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZC82MCBtdC0wLjVcIj57Zm10RGF0ZShyLmNyZWF0ZWRfYXQpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1yaWdodCBzaHJpbmstMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57Zm10KHNhZmVWYWxvcihyKSl9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRleHQteHMgZm9udC1tZWRpdW0gJHsoci5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgfHwgci5zdGF0dXMgPT09IFwiY29uY2x1aWRhXCIpID8gXCJ0ZXh0LXN1Y2Nlc3NcIiA6IHIuc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwidGV4dC13YXJuaW5nXCIgOiByLnN0YXR1cyA9PT0gXCJmYWxoYVwiID8gXCJ0ZXh0LWRlc3RydWN0aXZlXCIgOiBcInRleHQtbXV0ZWQtZm9yZWdyb3VuZFwifWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyhyLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiB8fCByLnN0YXR1cyA9PT0gXCJjb25jbHVpZGFcIikgPyBcIkNvbmNsdcOtZGFcIiA6IHIuc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwiUHJvY2Vzc2FuZG9cIiA6IHIuc3RhdHVzID09PSBcImZhbGhhXCIgPyBcIkZhbGhhXCIgOiByLnN0YXR1c31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyhyLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiB8fCByLnN0YXR1cyA9PT0gXCJjb25jbHVpZGFcIikgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtcHJpbWFyeS83MCBmb250LW1lZGl1bVwiPvCfk4QgVmVyIGNvbXByb3ZhbnRlPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC8+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8Lz5cbiAgICAgICAgICApfVxuXG4gICAgICAgICAgey8qID09PT09IFRBQjogQURJQ0lPTkFSIFNBTERPID09PT09ICovfVxuICAgICAgICAgIHt0YWIgPT09IFwiYWRkU2FsZG9cIiAmJiA8QWRkU2FsZG9TZWN0aW9uIHNhbGRvPXtzYWxkb30gZm10PXtmbXR9IGZtdERhdGU9e2ZtdERhdGV9IHRyYW5zYWN0aW9ucz17dHJhbnNhY3Rpb25zfSB1c2VyRW1haWw9e3VzZXI/LmVtYWlsfSB1c2VyTmFtZT17dXNlckxhYmVsfSBvbkRlcG9zaXRlZD17ZmV0Y2hEYXRhfSBmZXRjaFRyYW5zYWN0aW9ucz17ZmV0Y2hUcmFuc2FjdGlvbnN9IHJlc2VsbGVySWQ9e3Jlc2VsbGVySWR9IHNhbGRvVGlwbz17KHJvbGUgPT09IFwiYWRtaW5cIiB8fCByb2xlID09PSBcInJldmVuZGVkb3JcIikgJiYgIWlzQ2xpZW50TW9kZSA/IFwicGVzc29hbFwiIDogXCJyZXZlbmRhXCJ9IC8+fVxuXG4gICAgICAgICAgey8qID09PT09IFRBQjogSElTVE9SSUNPID09PT09ICovfVxuICAgICAgICAgIHt0YWIgPT09IFwiaGlzdG9yaWNvXCIgJiYgKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgey8qIEZpbHRlcnMgKi99XG4gICAgICAgICAgICAgIHsoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9wZXJhZG9yYXMgPSBBcnJheS5mcm9tKG5ldyBTZXQocmVjYXJnYXMubWFwKHIgPT4gci5vcGVyYWRvcmEpLmZpbHRlcihCb29sZWFuKSkpIGFzIHN0cmluZ1tdO1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlcmVkID0gcmVjYXJnYXMuZmlsdGVyKHIgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGhpc3RTdGF0dXMgIT09IFwiYWxsXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhpc3RTdGF0dXMgPT09IFwiY29tcGxldGVkXCIgJiYgci5zdGF0dXMgIT09IFwiY29tcGxldGVkXCIgJiYgci5zdGF0dXMgIT09IFwiY29uY2x1aWRhXCIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhpc3RTdGF0dXMgPT09IFwicGVuZGluZ1wiICYmIHIuc3RhdHVzICE9PSBcInBlbmRpbmdcIikgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGlzdFN0YXR1cyA9PT0gXCJmYWxoYVwiICYmIHIuc3RhdHVzICE9PSBcImZhbGhhXCIpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGlmIChoaXN0T3BlcmFkb3JhICE9PSBcImFsbFwiICYmIHIub3BlcmFkb3JhICE9PSBoaXN0T3BlcmFkb3JhKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICBpZiAoaGlzdFNlYXJjaCAmJiAhci50ZWxlZm9uZS5pbmNsdWRlcyhoaXN0U2VhcmNoLnJlcGxhY2UoL1xcRC9nLCBcIlwiKSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBzbTpmbGV4LXJvdyBnYXAtMyBtYi0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBmbGV4LTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxTZWFyY2ggY2xhc3NOYW1lPVwiYWJzb2x1dGUgbGVmdC0zIHRvcC0xLzIgLXRyYW5zbGF0ZS15LTEvMiBoLTQgdy00IHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIkJ1c2NhciBwb3IgdGVsZWZvbmUuLi5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17aGlzdFNlYXJjaH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gc2V0SGlzdFNlYXJjaChlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwbC05IHByLTMgcHktMi41IHJvdW5kZWQteGwgYmctbXV0ZWQvNDAgYm9yZGVyIGJvcmRlci1ib3JkZXIgdGV4dC1mb3JlZ3JvdW5kIHBsYWNlaG9sZGVyOnRleHQtbXV0ZWQtZm9yZWdyb3VuZCB0ZXh0LXNtIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1wcmltYXJ5LzMwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2hpc3RTdGF0dXN9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRIaXN0U3RhdHVzKGUudGFyZ2V0LnZhbHVlIGFzIGFueSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC0zIHB5LTIuNSByb3VuZGVkLXhsIGJnLW11dGVkLzQwIGJvcmRlciBib3JkZXItYm9yZGVyIHRleHQtZm9yZWdyb3VuZCB0ZXh0LXNtIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1wcmltYXJ5LzMwXCJcbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiYWxsXCI+VG9kb3Mgb3Mgc3RhdHVzPC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiY29tcGxldGVkXCI+Q29uY2x1w61kYTwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cInBlbmRpbmdcIj5Qcm9jZXNzYW5kbzwvb3B0aW9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImZhbGhhXCI+RmFsaGE8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICAgICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17aGlzdE9wZXJhZG9yYX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IHNldEhpc3RPcGVyYWRvcmEoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtMyBweS0yLjUgcm91bmRlZC14bCBiZy1tdXRlZC80MCBib3JkZXIgYm9yZGVyLWJvcmRlciB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctcHJpbWFyeS8zMFwiXG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cImFsbFwiPlRvZGFzIG9wZXJhZG9yYXM8L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtvcGVyYWRvcmFzLm1hcChvcCA9PiA8b3B0aW9uIGtleT17b3B9IHZhbHVlPXtvcH0+e29wfTwvb3B0aW9uPil9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIHtoaXN0U2VhcmNoIHx8IGhpc3RTdGF0dXMgIT09IFwiYWxsXCIgfHwgaGlzdE9wZXJhZG9yYSAhPT0gXCJhbGxcIiA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1iLTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGaWx0ZXIgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2ZpbHRlcmVkLmxlbmd0aH0gZGUge3JlY2FyZ2FzLmxlbmd0aH0gcmVzdWx0YWRvczwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4geyBzZXRIaXN0U2VhcmNoKFwiXCIpOyBzZXRIaXN0U3RhdHVzKFwiYWxsXCIpOyBzZXRIaXN0T3BlcmFkb3JhKFwiYWxsXCIpOyB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtbC1hdXRvIHRleHQtcHJpbWFyeSBob3Zlcjp1bmRlcmxpbmUgdGV4dC14c1wiPkxpbXBhciBmaWx0cm9zPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuXG4gICAgICAgICAgICAgICAgICAgIHsvKiBNb2JpbGUgY2FyZHMgKi99XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWQ6aGlkZGVuIHNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtmaWx0ZXJlZC5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS04IHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPk5lbmh1bWEgcmVjYXJnYSBlbmNvbnRyYWRhPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiAoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGxhc3REYXRlID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmaWx0ZXJlZC5tYXAoKHIsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0ZUxhYmVsID0gZm9ybWF0RGF0ZUxvbmdVcHBlckJSKHIuY3JlYXRlZF9hdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHNob3dTZXAgPSBkYXRlTGFiZWwgIT09IGxhc3REYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBsYXN0RGF0ZSA9IGRhdGVMYWJlbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzTGFiZWwgPSAoci5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgfHwgci5zdGF0dXMgPT09IFwiY29uY2x1aWRhXCIpID8gXCJDb25jbHXDrWRhXCIgOiByLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIgPyBcIlByb2Nlc3NhbmRvXCIgOiByLnN0YXR1cyA9PT0gXCJmYWxoYVwiID8gXCJGYWxoYVwiIDogci5zdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c0NsYXNzID0gKHIuc3RhdHVzID09PSBcImNvbXBsZXRlZFwiIHx8IHIuc3RhdHVzID09PSBcImNvbmNsdWlkYVwiKSA/IFwiYmctc3VjY2Vzcy8xNSB0ZXh0LXN1Y2Nlc3NcIiA6IHIuc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwiYmctd2FybmluZy8xNSB0ZXh0LXdhcm5pbmdcIiA6IFwiYmctZGVzdHJ1Y3RpdmUvMTUgdGV4dC1kZXN0cnVjdGl2ZVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtyLmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93U2VwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktY2VudGVyIG15LTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBiZy1tdXRlZC82MCB0ZXh0LW11dGVkLWZvcmVncm91bmQgcHgtMyBweS0wLjUgcm91bmRlZC1mdWxsIGZvbnQtbWVkaXVtXCI+e2RhdGVMYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogOCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX0gdHJhbnNpdGlvbj17eyBkZWxheTogaSAqIDAuMDMgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLXhsIHAtNCBjdXJzb3ItcG9pbnRlciBob3ZlcjpiZy1tdXRlZC8zMCBhY3RpdmU6c2NhbGUtWzAuOThdIHRyYW5zaXRpb24tYWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2VsZWN0ZWRSZWNhcmdhKHIpfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gbWItM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdy0xMiBoLTEyIHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaHJpbmstMCAke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoci5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgfHwgci5zdGF0dXMgPT09IFwiY29uY2x1aWRhXCIpID8gXCJiZy1zdWNjZXNzLzE1XCIgOiByLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIgPyBcImJnLXdhcm5pbmcvMTVcIiA6IHIuc3RhdHVzID09PSBcImZhbGhhXCIgPyBcImJnLWRlc3RydWN0aXZlLzE1XCIgOiBcImJnLW11dGVkLzUwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyhyLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiB8fCByLnN0YXR1cyA9PT0gXCJjb25jbHVpZGFcIikgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEFuaW1hdGVkQ2hlY2sgc2l6ZT17Mjh9IGNsYXNzTmFtZT1cInRleHQtc3VjY2Vzc1wiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiByLnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXYgYW5pbWF0ZT17eyByb3RhdGU6IDM2MCB9fSB0cmFuc2l0aW9uPXt7IHJlcGVhdDogSW5maW5pdHksIGR1cmF0aW9uOiAyLCBlYXNlOiBcImxpbmVhclwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPExvYWRlcjIgY2xhc3NOYW1lPVwiaC03IHctNyB0ZXh0LXdhcm5pbmdcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6IHIuc3RhdHVzID09PSBcImZhbGhhXCIgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXYgYW5pbWF0ZT17eyBzY2FsZTogWzEsIDEuMTUsIDEsIDEuMSwgMV0sIHJvdGF0ZTogWzAsIC0xMCwgMTAsIC01LCAwXSwgb3BhY2l0eTogWzEsIDAuNywgMV0gfX0gdHJhbnNpdGlvbj17eyByZXBlYXQ6IEluZmluaXR5LCBkdXJhdGlvbjogMi41LCBlYXNlOiBcImVhc2VJbk91dFwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFhDaXJjbGUgY2xhc3NOYW1lPVwiaC03IHctNyB0ZXh0LWRlc3RydWN0aXZlIGRyb3Atc2hhZG93LVswXzBfNnB4X3JnYmEoMjM5LDY4LDY4LDAuNSldXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPFNtYXJ0cGhvbmUgY2xhc3NOYW1lPVwiaC02IHctNiB0ZXh0LW11dGVkLWZvcmVncm91bmRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2B0ZXh0LXhzIGZvbnQtYm9sZCBweC0yIHB5LTAuNSByb3VuZGVkLW1kIGJvcmRlciAke29wZXJhZG9yYUNvbG9ycyhyLm9wZXJhZG9yYSkuYmd9ICR7b3BlcmFkb3JhQ29sb3JzKHIub3BlcmFkb3JhKS50ZXh0fSAke29wZXJhZG9yYUNvbG9ycyhyLm9wZXJhZG9yYSkuYm9yZGVyfWB9PntyLm9wZXJhZG9yYSB8fCBcIk9wZXJhZG9yYVwifTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQgZm9udC1tb25vXCI+e3IudGVsZWZvbmV9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgcHgtMi41IHB5LTEgcm91bmRlZC1mdWxsIHRleHQteHMgZm9udC1zZW1pYm9sZCAke3N0YXR1c0NsYXNzfWB9PntzdGF0dXNMYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBwdC0zIGJvcmRlci10IGJvcmRlci1ib3JkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPntmbXREYXRlKHIuY3JlYXRlZF9hdCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsoci5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgfHwgci5zdGF0dXMgPT09IFwiY29uY2x1aWRhXCIpICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eyhlKSA9PiB7IGUuc3RvcFByb3BhZ2F0aW9uKCk7IHNldFJlY2VpcHRSZWNhcmdhKHIpOyB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xIHB4LTIgcHktMSByb3VuZGVkLWxnIGJnLXN1Y2Nlc3MvMTAgdGV4dC1zdWNjZXNzIHRleHQtWzEwcHhdIGZvbnQtc2VtaWJvbGQgaG92ZXI6Ymctc3VjY2Vzcy8yMCB0cmFuc2l0aW9uLWNvbG9yc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8RmlsZVRleHQgY2xhc3NOYW1lPVwiaC0zIHctM1wiIC8+IENvbXByb3ZhbnRlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCBmb250LW1vbm8gdGV4dC1mb3JlZ3JvdW5kXCI+e2ZtdChzYWZlVmFsb3IocikpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICB9KSgpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgey8qIERlc2t0b3AgdGFibGUgKi99XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaGlkZGVuIG1kOmJsb2NrIGdsYXNzLWNhcmQgcm91bmRlZC14bCBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidy1mdWxsIHRleHQtc21cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzTmFtZT1cImJvcmRlci1iIGJvcmRlci1ib3JkZXIgYmctbXV0ZWQvNTBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwidGV4dC1sZWZ0IHB4LTQgcHktMyBmb250LW1lZGl1bSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5EYXRhPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwidGV4dC1sZWZ0IHB4LTQgcHktMyBmb250LW1lZGl1bSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5UZWxlZm9uZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInRleHQtbGVmdCBweC00IHB5LTMgZm9udC1tZWRpdW0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+T3BlcmFkb3JhPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwidGV4dC1yaWdodCBweC00IHB5LTMgZm9udC1tZWRpdW0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+VmFsb3I8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweC00IHB5LTMgZm9udC1tZWRpdW0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+U3RhdHVzPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtmaWx0ZXJlZC5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRyPjx0ZCBjb2xTcGFuPXs1fSBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS04IHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPk5lbmh1bWEgcmVjYXJnYSBlbmNvbnRyYWRhPC90ZD48L3RyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApIDogZmlsdGVyZWQubWFwKChyLCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi50ciBrZXk9e3IuaWR9IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogOCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX0gdHJhbnNpdGlvbj17eyBkZWxheTogaSAqIDAuMDMgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJvcmRlci1iIGJvcmRlci1ib3JkZXIgbGFzdDpib3JkZXItMCBob3ZlcjpiZy1tdXRlZC8zMCB0cmFuc2l0aW9uLWNvbG9ycyBjdXJzb3ItcG9pbnRlclwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZFJlY2FyZ2Eocil9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktMyB0ZXh0LW11dGVkLWZvcmVncm91bmQgd2hpdGVzcGFjZS1ub3dyYXBcIj57Zm10RGF0ZShyLmNyZWF0ZWRfYXQpfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNCBweS0zIGZvbnQtbW9ubyB0ZXh0LWZvcmVncm91bmRcIj57ci50ZWxlZm9uZX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktM1wiPjxzcGFuIGNsYXNzTmFtZT17YHRleHQteHMgZm9udC1ib2xkIHB4LTIgcHktMC41IHJvdW5kZWQtbWQgYm9yZGVyICR7b3BlcmFkb3JhQ29sb3JzKHIub3BlcmFkb3JhKS5iZ30gJHtvcGVyYWRvcmFDb2xvcnMoci5vcGVyYWRvcmEpLnRleHR9ICR7b3BlcmFkb3JhQ29sb3JzKHIub3BlcmFkb3JhKS5ib3JkZXJ9YH0+e3Iub3BlcmFkb3JhIHx8IFwi4oCUXCJ9PC9zcGFuPjwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNCBweS0zIHRleHQtcmlnaHQgZm9udC1tb25vIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZFwiPntmbXQoc2FmZVZhbG9yKHIpKX08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktMyB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BpbmxpbmUtYmxvY2sgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsIHRleHQteHMgZm9udC1tZWRpdW0gJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoci5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgfHwgci5zdGF0dXMgPT09IFwiY29uY2x1aWRhXCIpID8gXCJiZy1zdWNjZXNzLzE1IHRleHQtc3VjY2Vzc1wiIDogci5zdGF0dXMgPT09IFwicGVuZGluZ1wiID8gXCJiZy13YXJuaW5nLzE1IHRleHQtd2FybmluZ1wiIDogXCJiZy1kZXN0cnVjdGl2ZS8xNSB0ZXh0LWRlc3RydWN0aXZlXCJ9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyhyLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiB8fCByLnN0YXR1cyA9PT0gXCJjb25jbHVpZGFcIikgPyBcIkNvbmNsdcOtZGFcIiA6IHIuc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwiUHJvY2Vzc2FuZG9cIiA6IHIuc3RhdHVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLnRyPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9KSgpfVxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHsvKiBSZWNhcmdhIERldGFpbCBNb2RhbCAqL31cbiAgICAgICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICAgICAge3NlbGVjdGVkUmVjYXJnYSAmJiAoXG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCB6LVs3MF0gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYmctYmxhY2svNjAgYmFja2Ryb3AtYmx1ci1zbSBweC00XCJcbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZFJlY2FyZ2EobnVsbCl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45LCB5OiAyMCB9fVxuICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45IH19XG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gZS5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBtYXgtdy1zbSBiZy1jYXJkIGJvcmRlciBib3JkZXItYm9yZGVyIHJvdW5kZWQtMnhsIHNoYWRvdy0yeGwgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgciA9IHNlbGVjdGVkUmVjYXJnYTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSByLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiB8fCByLnN0YXR1cyA9PT0gXCJjb25jbHVpZGFcIjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNQZW5kaW5nID0gci5zdGF0dXMgPT09IFwicGVuZGluZ1wiO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNMYWJlbCA9IGlzQ29tcGxldGVkID8gXCJDb25jbHXDrWRhXCIgOiBpc1BlbmRpbmcgPyBcIlByb2Nlc3NhbmRvXCIgOiByLnN0YXR1cyA9PT0gXCJmYWxoYVwiID8gXCJGYWxoYVwiIDogci5zdGF0dXM7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c0NsYXNzID0gaXNDb21wbGV0ZWQgPyBcImJnLXN1Y2Nlc3MvMTUgdGV4dC1zdWNjZXNzIGJvcmRlci1zdWNjZXNzLzMwXCIgOiBpc1BlbmRpbmcgPyBcImJnLXdhcm5pbmcvMTUgdGV4dC13YXJuaW5nIGJvcmRlci13YXJuaW5nLzMwXCIgOiBcImJnLWRlc3RydWN0aXZlLzE1IHRleHQtZGVzdHJ1Y3RpdmUgYm9yZGVyLWRlc3RydWN0aXZlLzMwXCI7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHN0YXR1c0ljb24gPSBpc0NvbXBsZXRlZCA/IDxDaGVja0NpcmNsZTIgY2xhc3NOYW1lPVwiaC04IHctOCB0ZXh0LXN1Y2Nlc3NcIiAvPiA6IGlzUGVuZGluZyA/IDxDbG9jayBjbGFzc05hbWU9XCJoLTggdy04IHRleHQtd2FybmluZ1wiIC8+IDogPG1vdGlvbi5kaXYgYW5pbWF0ZT17eyBzY2FsZTogWzEsIDEuMTUsIDEsIDEuMSwgMV0sIHJvdGF0ZTogWzAsIC0xMCwgMTAsIC01LCAwXSwgb3BhY2l0eTogWzEsIDAuNywgMV0gfX0gdHJhbnNpdGlvbj17eyByZXBlYXQ6IEluZmluaXR5LCBkdXJhdGlvbjogMi41LCBlYXNlOiBcImVhc2VJbk91dFwiIH19PjxYQ2lyY2xlIGNsYXNzTmFtZT1cImgtOCB3LTggdGV4dC1kZXN0cnVjdGl2ZSBkcm9wLXNoYWRvdy1bMF8wXzZweF9yZ2JhKDIzOSw2OCw2OCwwLjUpXVwiIC8+PC9tb3Rpb24uZGl2PjtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC02IHB0LTYgcGItNCB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTYgaC0xNiByb3VuZGVkLWZ1bGwgYmctbXV0ZWQvNTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbXgtYXV0byBtYi0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3N0YXR1c0ljb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG1iLTFcIj5EZXRhbGhlcyBkbyBQZWRpZG88L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BpbmxpbmUtYmxvY2sgcHgtMyBweS0xIHJvdW5kZWQtZnVsbCB0ZXh0LXhzIGZvbnQtYm9sZCBib3JkZXIgJHtzdGF0dXNDbGFzc31gfT57c3RhdHVzTGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB4LTYgcGItNSBzcGFjZS15LTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgcHktMiBib3JkZXItYiBib3JkZXItYm9yZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5UZWxlZm9uZTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtbW9ubyBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZFwiPntyLnRlbGVmb25lfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIHB5LTIgYm9yZGVyLWIgYm9yZGVyLWJvcmRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+T3BlcmFkb3JhPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRleHQtc20gZm9udC1ib2xkIHB4LTIuNSBweS0wLjUgcm91bmRlZC1tZCBib3JkZXIgJHtvcGVyYWRvcmFDb2xvcnMoci5vcGVyYWRvcmEpLmJnfSAke29wZXJhZG9yYUNvbG9ycyhyLm9wZXJhZG9yYSkudGV4dH0gJHtvcGVyYWRvcmFDb2xvcnMoci5vcGVyYWRvcmEpLmJvcmRlcn1gfT57ci5vcGVyYWRvcmEgfHwgXCLigJRcIn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBweS0yIGJvcmRlci1iIGJvcmRlci1ib3JkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlZhbG9yIGRhIFJlY2FyZ2E8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LW1vbm8gZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPntmbXQoc2FmZVZhbG9yKHIpKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBweS0yIGJvcmRlci1iIGJvcmRlci1ib3JkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPkN1c3RvIChkZWJpdGFkbyk8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LW1vbm8gZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57Zm10KHIuY3VzdG8pfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIHB5LTIgYm9yZGVyLWIgYm9yZGVyLWJvcmRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+RGF0YTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtZm9yZWdyb3VuZFwiPntmbXREYXRlKHIuY3JlYXRlZF9hdCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgcHktMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+SUQ8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gZm9udC1tb25vIHRleHQtbXV0ZWQtZm9yZWdyb3VuZC83MCBtYXgtdy1bMTYwcHhdIHRydW5jYXRlXCI+e3IuaWR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC02IHBiLTUgZmxleCBnYXAtM1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7aXNDb21wbGV0ZWQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHsgc2V0U2VsZWN0ZWRSZWNhcmdhKG51bGwpOyBzZXRSZWNlaXB0UmVjYXJnYShyKTsgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBweS0zIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1zdWNjZXNzIHRleHQtc3VjY2VzcyBmb250LXNlbWlib2xkIHRleHQtc20gaG92ZXI6Ymctc3VjY2Vzcy8xMCB0cmFuc2l0aW9uLWFsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZpbGVUZXh0IGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPiBDb21wcm92YW50ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgICAgICB7ci5leHRlcm5hbF9pZCAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBzZXRTZWxlY3RlZFJlY2FyZ2EobnVsbCk7IGhhbmRsZVRyYWNrUmVjaGFyZ2Uoci5leHRlcm5hbF9pZCEsIHIpOyB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIHB5LTMgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLXByaW1hcnkgdGV4dC1wcmltYXJ5IGZvbnQtc2VtaWJvbGQgdGV4dC1zbSBob3ZlcjpiZy1wcmltYXJ5LzEwIHRyYW5zaXRpb24tYWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8QWN0aXZpdHkgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IEFjb21wYW5oYXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkUmVjYXJnYShudWxsKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4LTEgcHktMyByb3VuZGVkLXhsIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgZm9udC1zZW1pYm9sZCB0ZXh0LXNtIGhvdmVyOmJyaWdodG5lc3MtMTEwIHRyYW5zaXRpb24tYWxsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEZlY2hhclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSkoKX1cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG4gICAgICAgICAge3JlY2VpcHRSZWNhcmdhICYmIChcbiAgICAgICAgICAgIDxSZWNhcmdhUmVjZWlwdFxuICAgICAgICAgICAgICByZWNhcmdhPXtyZWNlaXB0UmVjYXJnYX1cbiAgICAgICAgICAgICAgb3Blbj17ISFyZWNlaXB0UmVjYXJnYX1cbiAgICAgICAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0UmVjZWlwdFJlY2FyZ2EobnVsbCl9XG4gICAgICAgICAgICAgIHN0b3JlTmFtZT17cHJvZmlsZU5vbWUgfHwgXCJSZWNhcmdhcyBCcmFzaWxcIn1cbiAgICAgICAgICAgICAgdXNlcklkPXt1c2VyPy5pZH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgICB7dGFiID09PSBcImV4dHJhdG9cIiAmJiAoXG4gICAgICAgICAgICA8PlxuICAgICAgICAgICAgICB7LyogTW9iaWxlIGNhcmRzICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1kOmhpZGRlbiBzcGFjZS15LTJcIj5cbiAgICAgICAgICAgICAgICB7dHJhbnNMb2FkaW5nID8gKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTJcIj57WzEsMiwzXS5tYXAoaSA9PiA8U2tlbGV0b25Sb3cga2V5PXtpfSAvPil9PC9kaXY+XG4gICAgICAgICAgICAgICAgKSA6IHRyYW5zYWN0aW9ucy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS04IHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPk5lbmh1bWEgdHJhbnNhw6fDo28gZW5jb250cmFkYTwvcD5cbiAgICAgICAgICAgICAgICApIDogKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgIGxldCBsYXN0RGF0ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNhY3Rpb25zLm1hcCgodCwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRlTGFiZWwgPSBmb3JtYXREYXRlTG9uZ1VwcGVyQlIodC5jcmVhdGVkX2F0KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2hvd1NlcCA9IGRhdGVMYWJlbCAhPT0gbGFzdERhdGU7XG4gICAgICAgICAgICAgICAgICAgIGxhc3REYXRlID0gZGF0ZUxhYmVsO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0RlcG9zaXQgPSB0LnR5cGUgPT09IFwiZGVwb3NpdFwiIHx8IHQudHlwZSA9PT0gXCJkZXBvc2l0b1wiO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNMYWJlbCA9ICh0LnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiB8fCB0LnN0YXR1cyA9PT0gXCJjb25maXJtYWRvXCIpID8gXCJDb25maXJtYWRvXCIgOiB0LnN0YXR1cyA9PT0gXCJwZW5kaW5nXCIgPyBcIlByb2Nlc3NhbmRvXCIgOiB0LnN0YXR1cztcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3RhdHVzQ2xhc3MgPSAodC5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgfHwgdC5zdGF0dXMgPT09IFwiY29uZmlybWFkb1wiKSA/IFwiYmctc3VjY2Vzcy8xNSB0ZXh0LXN1Y2Nlc3NcIiA6IHQuc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwiYmctd2FybmluZy8xNSB0ZXh0LXdhcm5pbmdcIiA6IFwiYmctZGVzdHJ1Y3RpdmUvMTUgdGV4dC1kZXN0cnVjdGl2ZVwiO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXt0LmlkfT5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93U2VwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktY2VudGVyIG15LTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBiZy1tdXRlZC82MCB0ZXh0LW11dGVkLWZvcmVncm91bmQgcHgtMyBweS0wLjUgcm91bmRlZC1mdWxsIGZvbnQtbWVkaXVtXCI+e2RhdGVMYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogOCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX0gdHJhbnNpdGlvbj17eyBkZWxheTogaSAqIDAuMDMgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLXhsIHAtNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kIHRleHQtc20gY2FwaXRhbGl6ZVwiPntpc0RlcG9zaXQgPyBcIkRlcMOzc2l0b1wiIDogdC50eXBlfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+UElYPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHB4LTIuNSBweS0xIHJvdW5kZWQtZnVsbCB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgJHtzdGF0dXNDbGFzc31gfT57c3RhdHVzTGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHQtMyBib3JkZXItdCBib3JkZXItYm9yZGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj57Zm10RGF0ZSh0LmNyZWF0ZWRfYXQpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2Bmb250LWJvbGQgZm9udC1tb25vICR7aXNEZXBvc2l0ID8gXCJ0ZXh0LXN1Y2Nlc3NcIiA6IFwidGV4dC1mb3JlZ3JvdW5kXCJ9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aXNEZXBvc2l0ID8gXCIrXCIgOiBcIi1cIn17Zm10KHQuYW1vdW50KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSkoKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIHsvKiBEZXNrdG9wIHRhYmxlICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImhpZGRlbiBtZDpibG9jayBnbGFzcy1jYXJkIHJvdW5kZWQteGwgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInctZnVsbCB0ZXh0LXNtXCI+XG4gICAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJib3JkZXItYiBib3JkZXItYm9yZGVyIGJnLW11dGVkLzUwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInRleHQtbGVmdCBweC00IHB5LTMgZm9udC1tZWRpdW0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+RGF0YTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInRleHQtbGVmdCBweC00IHB5LTMgZm9udC1tZWRpdW0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+VGlwbzwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInRleHQtbGVmdCBweC00IHB5LTMgZm9udC1tZWRpdW0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+TcOzZHVsbzwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInRleHQtcmlnaHQgcHgtNCBweS0zIGZvbnQtbWVkaXVtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlZhbG9yPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgcHgtNCBweS0zIGZvbnQtbWVkaXVtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlN0YXR1czwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgICAgPHRib2R5PlxuICAgICAgICAgICAgICAgICAgICB7dHJhbnNMb2FkaW5nID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDx0cj48dGQgY29sU3Bhbj17NX0gY2xhc3NOYW1lPVwicHktNFwiPjxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+e1sxLDIsM10ubWFwKGkgPT4gPFNrZWxldG9uUm93IGtleT17aX0gLz4pfTwvZGl2PjwvdGQ+PC90cj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IHRyYW5zYWN0aW9ucy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgICAgICAgPHRyPjx0ZCBjb2xTcGFuPXs1fSBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS04IHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPk5lbmh1bWEgdHJhbnNhw6fDo28gZW5jb250cmFkYTwvdGQ+PC90cj5cbiAgICAgICAgICAgICAgICAgICAgKSA6IHRyYW5zYWN0aW9ucy5tYXAoKHQsIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLnRyIGtleT17dC5pZH0gaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiA4IH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fSB0cmFuc2l0aW9uPXt7IGRlbGF5OiBpICogMC4wMyB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYm9yZGVyLWIgYm9yZGVyLWJvcmRlciBsYXN0OmJvcmRlci0wIGhvdmVyOmJnLW11dGVkLzMwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNCBweS0zIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB3aGl0ZXNwYWNlLW5vd3JhcFwiPntmbXREYXRlKHQuY3JlYXRlZF9hdCl9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC00IHB5LTMgdGV4dC1mb3JlZ3JvdW5kIGNhcGl0YWxpemVcIj57KHQudHlwZSA9PT0gXCJkZXBvc2l0XCIgfHwgdC50eXBlID09PSBcImRlcG9zaXRvXCIpID8gXCJEZXDDs3NpdG9cIiA6IHQudHlwZSA9PT0gXCJ3aXRoZHJhd2FsXCIgPyBcIlNhcXVlXCIgOiB0LnR5cGV9PC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC00IHB5LTMgdGV4dC1mb3JlZ3JvdW5kXCI+UElYPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9e2BweC00IHB5LTMgdGV4dC1yaWdodCBmb250LW1vbm8gZm9udC1tZWRpdW0gJHsodC50eXBlID09PSBcImRlcG9zaXRcIiB8fCB0LnR5cGUgPT09IFwiZGVwb3NpdG9cIikgPyBcInRleHQtc3VjY2Vzc1wiIDogXCJ0ZXh0LWZvcmVncm91bmRcIn1gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgeyh0LnR5cGUgPT09IFwiZGVwb3NpdFwiIHx8IHQudHlwZSA9PT0gXCJkZXBvc2l0b1wiKSA/IFwiK1wiIDogXCItXCJ9e2ZtdCh0LmFtb3VudCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTQgcHktMyB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BpbmxpbmUtYmxvY2sgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsIHRleHQteHMgZm9udC1tZWRpdW0gJHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAodC5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgfHwgdC5zdGF0dXMgPT09IFwiY29uZmlybWFkb1wiKSA/IFwiYmctc3VjY2Vzcy8xNSB0ZXh0LXN1Y2Nlc3NcIiA6IHQuc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwiYmctd2FybmluZy8xNSB0ZXh0LXdhcm5pbmdcIiA6IFwiYmctZGVzdHJ1Y3RpdmUvMTUgdGV4dC1kZXN0cnVjdGl2ZVwifWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsodC5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgfHwgdC5zdGF0dXMgPT09IFwiY29uZmlybWFkb1wiKSA/IFwiQ29uZmlybWFkb1wiIDogdC5zdGF0dXMgPT09IFwicGVuZGluZ1wiID8gXCJQcm9jZXNzYW5kb1wiIDogdC5zdGF0dXMgPT09IFwiZXhwaXJlZFwiID8gXCJFeHBpcmFkb1wiIDogdC5zdGF0dXMgPT09IFwiZmFpbGVkXCIgPyBcIkZhbGhvdVwiIDogdC5zdGF0dXMgPT09IFwiY2FuY2VsbGVkXCIgPyBcIkNhbmNlbGFkb1wiIDogdC5zdGF0dXN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24udHI+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICB7LyogPT09PT0gVEFCOiBDT05UQVRPUyAoTWluaGEgQ29udGEpIOKAlCBJbnN0YWdyYW0tc3R5bGUgPT09PT0gKi99XG4gICAgICAgICAge3RhYiA9PT0gXCJjb250YXRvc1wiICYmIChcbiAgICAgICAgICAgIDxQcm9maWxlVGFiXG4gICAgICAgICAgICAgIHVzZXI9e3VzZXJ9XG4gICAgICAgICAgICAgIHJvbGU9e3JvbGV9XG4gICAgICAgICAgICAgIGF2YXRhclVybD17YXZhdGFyVXJsfVxuICAgICAgICAgICAgICBhdmF0YXJFcnJvcj17YXZhdGFyRXJyb3J9XG4gICAgICAgICAgICAgIHNldEF2YXRhckVycm9yPXtzZXRBdmF0YXJFcnJvcn1cbiAgICAgICAgICAgICAgdXNlckxhYmVsPXt1c2VyTGFiZWx9XG4gICAgICAgICAgICAgIHVzZXJJbml0aWFsPXt1c2VySW5pdGlhbH1cbiAgICAgICAgICAgICAgcHJvZmlsZU5vbWU9e3Byb2ZpbGVOb21lfVxuICAgICAgICAgICAgICBzZXRQcm9maWxlTm9tZT17c2V0UHJvZmlsZU5vbWV9XG4gICAgICAgICAgICAgIHNhbGRvPXtzYWxkb31cbiAgICAgICAgICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgICAgICAgICAgZm10PXtmbXR9XG4gICAgICAgICAgICAgIHRlbGVncmFtTGlua2VkPXt0ZWxlZ3JhbUxpbmtlZH1cbiAgICAgICAgICAgICAgdGVsZWdyYW1Vc2VybmFtZT17dGVsZWdyYW1Vc2VybmFtZX1cbiAgICAgICAgICAgICAgd2hhdHNhcHBOdW1iZXI9e3doYXRzYXBwTnVtYmVyfVxuICAgICAgICAgICAgICB1cGxvYWRpbmdBdmF0YXI9e3VwbG9hZGluZ0F2YXRhcn1cbiAgICAgICAgICAgICAgaGFuZGxlQXZhdGFyVXBsb2FkPXtoYW5kbGVBdmF0YXJVcGxvYWR9XG4gICAgICAgICAgICAgIHJlY2FyZ2FzPXtyZWNhcmdhc31cbiAgICAgICAgICAgICAgcmVjYXJnYXNIb2plPXtyZWNhcmdhc0hvamV9XG4gICAgICAgICAgICAgIHRvdGFsUmVjYXJnYXM9e3JlY2FyZ2FzLmxlbmd0aH1cbiAgICAgICAgICAgICAgc2VsZWN0VGFiPXtzZWxlY3RUYWJ9XG4gICAgICAgICAgICAgIG5hdmlnYXRlPXtuYXZpZ2F0ZX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKX1cblxuXG4gICAgICAgICAgey8qID09PT09IFRBQjogU1RBVFVTID09PT09ICovfVxuICAgICAgICAgIHt0YWIgPT09IFwic3RhdHVzXCIgJiYgKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXYgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAyMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX0gY2xhc3NOYW1lPVwic3BhY2UteS01XCI+XG4gICAgICAgICAgICAgIHsvKiBIZWFkZXIgKi99XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPlN0YXR1cyBkbyBTaXN0ZW1hPC9oMj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlRlbXBvIG3DqWRpbyBkZSBwcm9jZXNzYW1lbnRvIGRhcyByZWNhcmdhcyBwb3Igb3BlcmFkb3JhLjwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgey8qIE9wZXJhdG9yIHRpbWluZyBjYXJkcyAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0yIGdhcC00XCI+XG4gICAgICAgICAgICAgICAgeyhzdGF0dXNEYXRhPy5vcGVyYXRvclN0YXRzIHx8IFtdKS5tYXAoKG9wLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgICBjb25zdCBmbXRUaW1lID0gKHM6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXMgfHwgcyA8PSAwKSByZXR1cm4gXCLigJRcIjtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWlucyA9IE1hdGguZmxvb3IocyAvIDYwKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2VjcyA9IE1hdGgucm91bmQocyAlIDYwKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1pbnMgPiAwID8gYCR7bWluc31tICR7c2Vjc31zYCA6IGAke3NlY3N9c2A7XG4gICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgY29uc3Qgb3BOYW1lID0gb3Aub3BlcmFkb3JhLnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICAgICAgICBjb25zdCBvcENvbG9yID0gb3BOYW1lID09PSBcIkNMQVJPXCIgPyBcInRleHQtcmVkLTQwMFwiIDogb3BOYW1lID09PSBcIlRJTVwiID8gXCJ0ZXh0LWJsdWUtNDAwXCIgOiBvcE5hbWUgPT09IFwiVklWT1wiID8gXCJ0ZXh0LXB1cnBsZS00MDBcIiA6IFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI7XG4gICAgICAgICAgICAgICAgICBjb25zdCBhdmdDb2xvciA9IG9wLmF2Z1JlY2VudCA8PSAxMjAgPyBcInRleHQtZW1lcmFsZC00MDBcIiA6IG9wLmF2Z1JlY2VudCA8PSAzMDAgPyBcInRleHQteWVsbG93LTQwMFwiIDogXCJ0ZXh0LXJlZC00MDBcIjtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2IGtleT17b3Aub3BlcmFkb3JhfSBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDE1IH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fSB0cmFuc2l0aW9uPXt7IGRlbGF5OiBpICogMC4xIH19XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLXhsIHAtNSBzcGFjZS15LTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTAgaC0xMCByb3VuZGVkLWxnIGJnLW11dGVkLzUwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcE5hbWUgPT09IFwiQ0xBUk9cIiA/IHsgc2NhbGU6IFsxLCAxLjE1LCAxXSB9IDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wTmFtZSA9PT0gXCJUSU1cIiAgID8geyB5OiBbMCwgLTMsIDBdIH0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyByb3RhdGU6IFswLCA4LCAtOCwgMF0gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHJlcGVhdDogSW5maW5pdHksIGR1cmF0aW9uOiAyLCBlYXNlOiBcImVhc2VJbk91dFwiLCBkZWxheTogaSAqIDAuMTUgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxTbWFydHBob25lIGNsYXNzTmFtZT17YGgtNSB3LTUgJHtvcENvbG9yfWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPXtgZm9udC1ib2xkIHRleHQtYmFzZSAke29wQ29sb3J9YH0+e29wLm9wZXJhZG9yYX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPkJhc2VhZG8gbmFzIMO6bHRpbWFzIHtvcC5yZWNlbnRDb3VudH0gcmVjYXJnYXM8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyXCI+TcOpZGlhIEF0dWFsIChSZWNlbnRlKTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT17YHRleHQtMnhsIGZvbnQtYmxhY2sgJHthdmdDb2xvcn1gfT57Zm10VGltZShvcC5hdmdSZWNlbnQpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMyBnYXAtMiBwdC0yIGJvcmRlci10IGJvcmRlci1ib3JkZXIvMzBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB1cHBlcmNhc2VcIj5Nw61uaW1vICgyNGgpPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+e2ZtdFRpbWUob3AubWluMjRoKX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB1cHBlcmNhc2VcIj5Nw6lkaWEgKDI0aCk8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57Zm10VGltZShvcC5hdmcyNGgpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHVwcGVyY2FzZVwiPk3DoXhpbW8gKDI0aCk8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57Zm10VGltZShvcC5tYXgyNGgpfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICB7LyogU3lzdGVtIGhlYWx0aCBpbmRpY2F0b3JzICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTIgbWQ6Z3JpZC1jb2xzLTQgZ2FwLTNcIj5cbiAgICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgICAgIHsgaWNvbjogU2VydmVyLCBsYWJlbDogXCJTZXJ2aWRvclwiLCBzdGF0dXM6IHRydWUsIGFuaW06IFwicHVsc2VcIiBhcyBjb25zdCB9LFxuICAgICAgICAgICAgICAgICAgeyBpY29uOiBEYXRhYmFzZSwgbGFiZWw6IFwiQmFuY29cIiwgc3RhdHVzOiBzdGF0dXNEYXRhPy5kYk9ubGluZSA/PyBmYWxzZSwgYW5pbTogXCJmbG9hdFwiIGFzIGNvbnN0IH0sXG4gICAgICAgICAgICAgICAgICB7IGljb246IFNoaWVsZCwgbGFiZWw6IFwiQXV0aFwiLCBzdGF0dXM6IHN0YXR1c0RhdGE/LmF1dGhPbmxpbmUgPz8gZmFsc2UsIGFuaW06IFwid2lnZ2xlXCIgYXMgY29uc3QgfSxcbiAgICAgICAgICAgICAgICAgIHsgaWNvbjogV2lmaSwgbGFiZWw6IFwiQVBJXCIsIHN0YXR1czogY2F0YWxvZy5sZW5ndGggPiAwLCBhbmltOiBcImJvdW5jZVwiIGFzIGNvbnN0IH0sXG4gICAgICAgICAgICAgICAgXS5tYXAoKGl0ZW0sIGkpID0+IChcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpdGVtLmxhYmVsfSBjbGFzc05hbWU9XCJnbGFzcy1jYXJkIHJvdW5kZWQteGwgcC0zIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdy0yIGgtMiByb3VuZGVkLWZ1bGwgJHtpdGVtLnN0YXR1cyA/IFwiYmctc3VjY2VzcyBhbmltYXRlLXB1bHNlXCIgOiBcImJnLWRlc3RydWN0aXZlXCJ9YH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPEFuaW1hdGVkSWNvbiBpY29uPXtpdGVtLmljb259IGNsYXNzTmFtZT17YGgtNCB3LTQgJHtpdGVtLnN0YXR1cyA/IFwidGV4dC1zdWNjZXNzXCIgOiBcInRleHQtZGVzdHJ1Y3RpdmVcIn1gfSBhbmltYXRpb249e2l0ZW0uYW5pbX0gZGVsYXk9e2kgKiAwLjF9IC8+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kXCI+e2l0ZW0ubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHtzdGF0dXNEYXRhICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdsYXNzLWNhcmQgcm91bmRlZC14bCBwLTQgZ3JpZCBncmlkLWNvbHMtMyBnYXAtNCB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5PcGVyYWRvcmFzPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57Y2F0YWxvZy5sZW5ndGggfHwgc3RhdHVzRGF0YS5vcGVyYWRvcmFzQ291bnR9PC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlRvdGFsIHJlY2FyZ2FzPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57c3RhdHVzRGF0YS5yZWNhcmdhc1RvdGFsfTwvcD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj7Dmmx0aW1hPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZFwiPntzdGF0dXNEYXRhLmxhc3RSZWNhcmdhID8gZm10RGF0ZShzdGF0dXNEYXRhLmxhc3RSZWNhcmdhKSA6IFwi4oCUXCJ9PC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9tYWluPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIHsvKiBGbG9hdGluZyBQb2xsICovfVxuICAgICAgPEZsb2F0aW5nUG9sbCAvPlxuXG4gICAgICB7LyogSW1hZ2UgQ3JvcHBlciBNb2RhbCAqL31cbiAgICAgIHtjcm9wRmlsZSAmJiAoXG4gICAgICAgIDxJbWFnZUNyb3BwZXJcbiAgICAgICAgICBmaWxlPXtjcm9wRmlsZX1cbiAgICAgICAgICBvbkNyb3A9e2FzeW5jIChibG9iKSA9PiB7XG4gICAgICAgICAgICBzZXRDcm9wRmlsZShudWxsKTtcbiAgICAgICAgICAgIGF3YWl0IHVwbG9hZEF2YXRhckZpbGUoYmxvYik7XG4gICAgICAgICAgfX1cbiAgICAgICAgICBvbkNhbmNlbD17KCkgPT4gc2V0Q3JvcEZpbGUobnVsbCl9XG4gICAgICAgIC8+XG4gICAgICApfVxuXG4gICAgICB7LyogTW9iaWxlIEJvdHRvbSBOYXYgKi99XG4gICAgICA8TW9iaWxlQm90dG9tTmF2XG4gICAgICAgIGl0ZW1zPXtbXG4gICAgICAgICAgeyBrZXk6IFwicmVjYXJnYVwiLCBsYWJlbDogXCJSZWNhcmdhXCIsIGljb246IFNlbmQsIGNvbG9yOiBcInRleHQtcHJpbWFyeVwiLCBhbmltYXRpb246IFwiYm91bmNlXCIgfSxcbiAgICAgICAgICB7IGtleTogXCJoaXN0b3JpY29cIiwgbGFiZWw6IFwiUGVkaWRvc1wiLCBpY29uOiBIaXN0b3J5LCBjb2xvcjogXCJ0ZXh0LXdhcm5pbmdcIiwgYW5pbWF0aW9uOiBcIndpZ2dsZVwiIH0sXG4gICAgICAgICAgeyBrZXk6IFwiYWRkU2FsZG9cIiwgbGFiZWw6IFwiU2FsZG9cIiwgaWNvbjogQ3JlZGl0Q2FyZCwgY29sb3I6IFwidGV4dC1zdWNjZXNzXCIsIGFuaW1hdGlvbjogXCJwdWxzZVwiLCBoaWdobGlnaHRlZDogdHJ1ZSB9LFxuICAgICAgICAgIHsga2V5OiBcImNoYXRcIiwgbGFiZWw6IFwiQmF0ZS1wYXBvXCIsIGljb246IE1lc3NhZ2VDaXJjbGUsIGNvbG9yOiBcInRleHQtcHJpbWFyeVwiLCBhbmltYXRpb246IFwiZmxvYXRcIiB9LFxuICAgICAgICAgIHsga2V5OiBcImNvbnRhdG9zXCIsIGxhYmVsOiBcIlBlcmZpbFwiLCBpY29uOiBVc2VyLCBjb2xvcjogXCJ0ZXh0LWFjY2VudFwiLCBhbmltYXRpb246IFwiZmxvYXRcIiB9LFxuICAgICAgICAgIHsga2V5OiBcImV4dHJhdG9cIiwgbGFiZWw6IFwiRXh0cmF0b1wiLCBpY29uOiBMYW5kbWFyaywgY29sb3I6IFwidGV4dC1zdWNjZXNzXCIsIGFuaW1hdGlvbjogXCJib3VuY2VcIiB9LFxuICAgICAgICAgIHsga2V5OiBcInN0YXR1c1wiLCBsYWJlbDogXCJTdGF0dXNcIiwgaWNvbjogQWN0aXZpdHksIGNvbG9yOiBcInRleHQtd2FybmluZ1wiLCBhbmltYXRpb246IFwicHVsc2VcIiB9LFxuICAgICAgICBdIGFzIE5hdkl0ZW1bXX1cbiAgICAgICAgYWN0aXZlS2V5PXt0YWJ9XG4gICAgICAgIG9uU2VsZWN0PXsoa2V5KSA9PiB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gXCJjaGF0XCIpIHsgbmF2aWdhdGUoXCIvY2hhdFwiKTsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VsZWN0VGFiKGtleSBhcyBQYWluZWxUYWIpO1xuICAgICAgICB9fVxuICAgICAgICBtYWluQ291bnQ9ezR9XG4gICAgICAgIHVzZXJMYWJlbD17dXNlcj8uZW1haWwgfHwgdXNlckxhYmVsfVxuICAgICAgICB1c2VyUm9sZT17cm9sZSA9PT0gXCJhZG1pblwiID8gXCJBZG1pbmlzdHJhZG9yXCIgOiByb2xlID09PSBcInJldmVuZGVkb3JcIiA/IFwiUmV2ZW5kZWRvclwiIDogcm9sZSA9PT0gXCJjbGllbnRlXCIgPyBcIkNsaWVudGVcIiA6IFwiVXN1w6FyaW9cIn1cbiAgICAgICAgdXNlckF2YXRhclVybD17YXZhdGFyVXJsfVxuICAgICAgICBvblNpZ25PdXQ9e3NpZ25PdXR9XG4gICAgICAgIHBhbmVsTGlua3M9e1tcbiAgICAgICAgICAuLi4oIWlzQ2xpZW50TW9kZSAmJiAocm9sZSA9PT0gXCJhZG1pblwiIHx8IHJvbGUgPT09IFwicmV2ZW5kZWRvclwiKSA/IFt7IGxhYmVsOiBcIlBhaW5lbCBBZG1pblwiLCBwYXRoOiBcIi9hZG1pblwiLCBpY29uOiBTaGllbGQsIGNvbG9yOiBcInRleHQtcHJpbWFyeVwiIH1dIDogW10pLFxuICAgICAgICAgIC4uLihyb2xlID09PSBcImFkbWluXCIgPyBbeyBsYWJlbDogXCJQcmluY2lwYWxcIiwgcGF0aDogXCIvcHJpbmNpcGFsXCIsIGljb246IExhbmRtYXJrLCBjb2xvcjogXCJ0ZXh0LXN1Y2Nlc3NcIiB9XSA6IFtdKSxcbiAgICAgICAgXX1cbiAgICAgIC8+XG4gICAgPC9kaXY+XG4gICk7XG59XG5cbi8vID09PT09IEFERCBTQUxETyBTRUNUSU9OID09PT09XG5mdW5jdGlvbiBBZGRTYWxkb1NlY3Rpb24oeyBzYWxkbywgZm10LCBmbXREYXRlLCB0cmFuc2FjdGlvbnMsIHVzZXJFbWFpbCwgdXNlck5hbWUsIG9uRGVwb3NpdGVkLCBmZXRjaFRyYW5zYWN0aW9ucywgcmVzZWxsZXJJZCwgc2FsZG9UaXBvIH06IHtcbiAgc2FsZG86IG51bWJlcjtcbiAgZm10OiAodjogbnVtYmVyKSA9PiBzdHJpbmc7XG4gIGZtdERhdGU6IChkOiBzdHJpbmcpID0+IHN0cmluZztcbiAgdHJhbnNhY3Rpb25zOiB7IGlkOiBzdHJpbmc7IGFtb3VudDogbnVtYmVyOyB0eXBlOiBzdHJpbmc7IHN0YXR1czogc3RyaW5nOyBjcmVhdGVkX2F0OiBzdHJpbmc7IG1vZHVsZTogc3RyaW5nIHwgbnVsbCB9W107XG4gIHVzZXJFbWFpbD86IHN0cmluZztcbiAgdXNlck5hbWU/OiBzdHJpbmc7XG4gIG9uRGVwb3NpdGVkOiAoKSA9PiB2b2lkO1xuICBmZXRjaFRyYW5zYWN0aW9uczogKCkgPT4gdm9pZDtcbiAgcmVzZWxsZXJJZD86IHN0cmluZztcbiAgc2FsZG9UaXBvPzogc3RyaW5nO1xufSkge1xuICBjb25zdCBwaXggPSB1c2VQaXhEZXBvc2l0KHtcbiAgICB1c2VyRW1haWwsXG4gICAgdXNlck5hbWUsXG4gICAgcmVzZWxsZXJJZCxcbiAgICBzYWxkb1RpcG8sXG4gICAgcG9sbEludGVydmFsOiAzMDAwLFxuICAgIG9uQ29uZmlybWVkOiAoKSA9PiB7IG9uRGVwb3NpdGVkKCk7IGZldGNoVHJhbnNhY3Rpb25zKCk7IH0sXG4gIH0pO1xuXG4gIGNvbnN0IHtcbiAgICBkZXBvc2l0QW1vdW50LCBzZXREZXBvc2l0QW1vdW50LCBnZW5lcmF0aW5nLCBwaXhEYXRhLCBwaXhFcnJvcixcbiAgICBjb3BpZWQsIGNoZWNraW5nLCBwYXltZW50Q29uZmlybWVkLCBjb25maXJtZWRBbW91bnQsIHBvbGxDb3VudCxcbiAgICBwcmVzZXRBbW91bnRzLCBnZW5lcmF0ZVBpeDogaGFuZGxlR2VuZXJhdGVQaXgsIGNvcHlDb2RlOiBoYW5kbGVDb3B5Q29kZSxcbiAgICBjaGVja1N0YXR1czogaGFuZGxlQ2hlY2tTdGF0dXMsIHJlc2V0OiBoYW5kbGVOZXdQaXgsXG4gIH0gPSBwaXg7XG5cbiAgY29uc3QgREVQT1NJVF9FWFBJUllfTVMgPSAzMCAqIDYwICogMTAwMDsgLy8gMzAgbWludXRlc1xuICBjb25zdCBkZXBvc2l0VHhzID0gdHJhbnNhY3Rpb25zLmZpbHRlcih0ID0+IHQudHlwZSA9PT0gXCJkZXBvc2l0XCIpLm1hcCh0ID0+IHtcbiAgICBpZiAodC5zdGF0dXMgPT09IFwicGVuZGluZ1wiICYmIChEYXRlLm5vdygpIC0gbmV3IERhdGUodC5jcmVhdGVkX2F0KS5nZXRUaW1lKCkpID4gREVQT1NJVF9FWFBJUllfTVMpIHtcbiAgICAgIHJldHVybiB7IC4uLnQsIHN0YXR1czogXCJleHBpcmVkXCIgfTtcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG4gIH0pO1xuXG4gIHJldHVybiAoXG4gICAgPG1vdGlvbi5kaXYgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAyMCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX0gY2xhc3NOYW1lPVwic3BhY2UteS01XCI+XG4gICAgICB7LyogU2FsZG8gQXR1YWwgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImdsYXNzLWNhcmQgcm91bmRlZC0yeGwgcC01IHRleHQtY2VudGVyXCI+XG4gICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHVwcGVyY2FzZSB0cmFja2luZy13aWRlXCI+U2FsZG8gYXR1YWw8L3A+XG4gICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LXN1Y2Nlc3MgbXQtMVwiPntmbXQoc2FsZG8pfTwvcD5cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7LyogUGF5bWVudCBDb25maXJtZWQgU2NyZWVuICovfVxuICAgICAge3BheW1lbnRDb25maXJtZWQgPyAoXG4gICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOSB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLTJ4bCBwLTggdGV4dC1jZW50ZXIgc3BhY2UteS00XCI+XG4gICAgICAgICAgPG1vdGlvbi5kaXYgaW5pdGlhbD17eyBzY2FsZTogMCB9fSBhbmltYXRlPXt7IHNjYWxlOiAxIH19IHRyYW5zaXRpb249e3sgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiAyMDAsIGRlbGF5OiAwLjEgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInctMjAgaC0yMCByb3VuZGVkLWZ1bGwgYmctc3VjY2Vzcy8xNSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBteC1hdXRvXCI+XG4gICAgICAgICAgICA8Q2hlY2tDaXJjbGUyIGNsYXNzTmFtZT1cImgtMTAgdy0xMCB0ZXh0LXN1Y2Nlc3NcIiAvPlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDEyIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fSB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjIgfX0+XG4gICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj5QYWdhbWVudG8gQ29uZmlybWFkbyE8L2gzPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG10LTFcIj5TZXUgZGVww7NzaXRvIGZvaSBwcm9jZXNzYWRvIGNvbSBzdWNlc3NvPC9wPlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICA8bW90aW9uLnAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMiB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX0gdHJhbnNpdGlvbj17eyBkZWxheTogMC4zIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LTR4bCBmb250LWJvbGQgdGV4dC1zdWNjZXNzXCI+K3tmbXQoY29uZmlybWVkQW1vdW50KX08L21vdGlvbi5wPlxuICAgICAgICAgIDxtb3Rpb24ucCBpbml0aWFsPXt7IG9wYWNpdHk6IDAgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19IHRyYW5zaXRpb249e3sgZGVsYXk6IDAuNCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5DcsOpZGl0byBhZGljaW9uYWRvIGFvIHNldSBzYWxkbzwvbW90aW9uLnA+XG4gICAgICAgICAgPG1vdGlvbi5idXR0b24gaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMiB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX0gdHJhbnNpdGlvbj17eyBkZWxheTogMC41IH19XG4gICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVOZXdQaXh9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJweC02IHB5LTMgcm91bmRlZC14bCBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGZvbnQtYm9sZCB0ZXh0LXNtIGhvdmVyOm9wYWNpdHktOTAgdHJhbnNpdGlvbi1hbGxcIj5cbiAgICAgICAgICAgIEZhemVyIE5vdm8gRGVww7NzaXRvXG4gICAgICAgICAgPC9tb3Rpb24uYnV0dG9uPlxuICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICApIDogIXBpeERhdGEgPyAoXG4gICAgICAgIC8qIEZvcm11bMOhcmlvIGRlIGRlcMOzc2l0byAqL1xuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdsYXNzLWNhcmQgcm91bmRlZC0yeGwgcC02IHNwYWNlLXktNVwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgc2NhbGU6IDAgfX0gYW5pbWF0ZT17eyBzY2FsZTogMSB9fSB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMjAwIH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctMTYgaC0xNiByb3VuZGVkLTJ4bCBiZy1zdWNjZXNzLzE1IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG14LWF1dG8gbWItM1wiPlxuICAgICAgICAgICAgICA8UXJDb2RlIGNsYXNzTmFtZT1cImgtOCB3LTggdGV4dC1zdWNjZXNzXCIgLz5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC14bCBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+RGVwb3NpdGFyIHZpYSBQSVg8L2gzPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbXQtMVwiPlNlbGVjaW9uZSBvdSBkaWdpdGUgbyB2YWxvciBwYXJhIGdlcmFyIG8gUVIgQ29kZTwvcD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIHsvKiBQcmVzZXQgYW1vdW50cyAqL31cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTJcIj5cbiAgICAgICAgICAgIHtwcmVzZXRBbW91bnRzLm1hcCh2ID0+IChcbiAgICAgICAgICAgICAgPGJ1dHRvbiBrZXk9e3Z9IG9uQ2xpY2s9eygpID0+IHNldERlcG9zaXRBbW91bnQoU3RyaW5nKHYpKX1cbiAgICAgICAgICAgICAgICBkaXNhYmxlZD17Z2VuZXJhdGluZ31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BweS0zIHJvdW5kZWQteGwgYm9yZGVyIGZvbnQtYm9sZCB0ZXh0LXNtIHRyYW5zaXRpb24tYWxsIGhvdmVyOnNjYWxlLVsxLjAyXSBhY3RpdmU6c2NhbGUtOTUgZGlzYWJsZWQ6b3BhY2l0eS01MCAke1xuICAgICAgICAgICAgICAgICAgZGVwb3NpdEFtb3VudCA9PT0gU3RyaW5nKHYpXG4gICAgICAgICAgICAgICAgICAgID8gXCJib3JkZXItc3VjY2VzcyBiZy1zdWNjZXNzLzE1IHRleHQtc3VjY2Vzc1wiXG4gICAgICAgICAgICAgICAgICAgIDogXCJib3JkZXItYm9yZGVyIGJnLW11dGVkLzIwIGhvdmVyOmJnLXN1Y2Nlc3MvMTAgaG92ZXI6Ym9yZGVyLXN1Y2Nlc3MvMzAgdGV4dC1mb3JlZ3JvdW5kXCJcbiAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAge2ZtdCh2KX1cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIHsvKiBDdXN0b20gYW1vdW50ICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmVcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMyB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRleHQtc20gZm9udC1ib2xkXCI+UiQ8L3NwYW4+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICBpbnB1dE1vZGU9XCJkZWNpbWFsXCJcbiAgICAgICAgICAgICAgdmFsdWU9e2RlcG9zaXRBbW91bnR9XG4gICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByYXcgPSBlLnRhcmdldC52YWx1ZS5yZXBsYWNlKC9bXjAtOSwuXS9nLCBcIlwiKTtcbiAgICAgICAgICAgICAgICBzZXREZXBvc2l0QW1vdW50KHJhdyk7XG4gICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiT3V0cm8gdmFsb3IgKG3DrW4uIFIkIDEwKVwiXG4gICAgICAgICAgICAgIG1pbj17MTB9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwbC0xMCBwci0zIHB5LTMgcm91bmRlZC14bCBnbGFzcy1pbnB1dCB0ZXh0LWZvcmVncm91bmQgZm9udC1ib2xkIHRleHQtbGcgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXN1Y2Nlc3MvNTAgYm9yZGVyIGJvcmRlci1ib3JkZXJcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIHtkZXBvc2l0QW1vdW50ICYmIHBhcnNlRmxvYXQoZGVwb3NpdEFtb3VudC5yZXBsYWNlKFwiLFwiLCBcIi5cIikpID4gMCAmJiBwYXJzZUZsb2F0KGRlcG9zaXRBbW91bnQucmVwbGFjZShcIixcIiwgXCIuXCIpKSA8IDEwICYmIChcbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LWRlc3RydWN0aXZlIG10LTFcIj5WYWxvciBtw61uaW1vOiBSJCAxMCwwMDwvcD5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7LyogR2VuZXJhdGUgYnV0dG9uIC0gZnVsbCB3aWR0aCBiZWxvdyAqL31cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVHZW5lcmF0ZVBpeCgpfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e2dlbmVyYXRpbmcgfHwgIWRlcG9zaXRBbW91bnQgfHwgcGFyc2VGbG9hdChkZXBvc2l0QW1vdW50LnJlcGxhY2UoXCIsXCIsIFwiLlwiKSkgPCAxMH1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweS0zLjUgcm91bmRlZC14bCBiZy1zdWNjZXNzIHRleHQtc3VjY2Vzcy1mb3JlZ3JvdW5kIGZvbnQtYm9sZCB0ZXh0LWJhc2UgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgaG92ZXI6b3BhY2l0eS05MCBkaXNhYmxlZDpvcGFjaXR5LTUwIHRyYW5zaXRpb24tYWxsIHNoYWRvdy1bMF8wXzE2cHhfaHNsKHZhcigtLXN1Y2Nlc3MpLzAuMyldXCI+XG4gICAgICAgICAgICB7Z2VuZXJhdGluZyA/IDxMb2FkZXIyIGNsYXNzTmFtZT1cImgtNSB3LTUgYW5pbWF0ZS1zcGluXCIgLz4gOiA8UXJDb2RlIGNsYXNzTmFtZT1cImgtNSB3LTVcIiAvPn1cbiAgICAgICAgICAgIEdlcmFyIFBJWFxuICAgICAgICAgIDwvYnV0dG9uPlxuXG4gICAgICAgICAge3BpeEVycm9yICYmIChcbiAgICAgICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogOCB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicC00IHJvdW5kZWQteGwgYmctZGVzdHJ1Y3RpdmUvMTAgYm9yZGVyIGJvcmRlci1kZXN0cnVjdGl2ZS8yMCB0ZXh0LWRlc3RydWN0aXZlIHRleHQtc20gZmxleCBpdGVtcy1zdGFydCBnYXAtMlwiPlxuICAgICAgICAgICAgICA8QWxlcnRUcmlhbmdsZSBjbGFzc05hbWU9XCJoLTQgdy00IG10LTAuNSBzaHJpbmstMFwiIC8+XG4gICAgICAgICAgICAgIDxzcGFuPntwaXhFcnJvcn08L3NwYW4+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogKFxuICAgICAgICAvKiBRUiBDb2RlIC8gUElYIHJlc3VsdCAqL1xuICAgICAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjkgfX0gYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgIHRyYW5zaXRpb249e3sgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiAzMDAsIGRhbXBpbmc6IDI1IH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLTJ4bCBwLTYgc3BhY2UteS01XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy0xNiBoLTE2IHJvdW5kZWQtMnhsIGJnLXN1Y2Nlc3MvMTUgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbXgtYXV0byBtYi0zXCJcbiAgICAgICAgICAgICAgaW5pdGlhbD17eyBzY2FsZTogMCB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IHNjYWxlOiAxIH19XG4gICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiA0MDAsIGRhbXBpbmc6IDEyLCBkZWxheTogMC4xIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4zLCBkdXJhdGlvbjogMC4zIH19XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8Q2hlY2tDaXJjbGUyIGNsYXNzTmFtZT1cImgtOCB3LTggdGV4dC1zdWNjZXNzXCIgLz5cbiAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgPG1vdGlvbi5oM1xuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCJcbiAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4yIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFBJWCBHZXJhZG8gY29tIFN1Y2Vzc28hXG4gICAgICAgICAgICA8L21vdGlvbi5oMz5cbiAgICAgICAgICAgIDxtb3Rpb24ucFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiXG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4zIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIEVzY2FuZWllIG8gUVIgQ29kZSBvdSBjb3BpZSBvIGPDs2RpZ28gYWJhaXhvXG4gICAgICAgICAgICA8L21vdGlvbi5wPlxuICAgICAgICAgICAgPG1vdGlvbi5wXG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYm9sZCB0ZXh0LXN1Y2Nlc3MgbXQtMlwiXG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuNSB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH19XG4gICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiAzMDAsIGRhbXBpbmc6IDE1LCBkZWxheTogMC40IH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHtmbXQocGl4RGF0YS5hbW91bnQpfVxuICAgICAgICAgICAgPC9tb3Rpb24ucD5cbiAgICAgICAgICAgIDxtb3Rpb24ucFxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtdC0xXCJcbiAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjUgfX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgdmlhIFBpeFxuICAgICAgICAgICAgPC9tb3Rpb24ucD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIHsvKiBRUiBDb2RlIC0gR2VyYWRvIGxvY2FsbWVudGUgYSBwYXJ0aXIgZG8gY29waWEtZS1jb2xhICovfVxuICAgICAgICAgIHtwaXhEYXRhLnFyX2NvZGUgJiYgKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWNlbnRlciByZWxhdGl2ZVwiXG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMjAgfX1cbiAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuMyB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgcm91bmRlZC0yeGxcIlxuICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgYm94U2hhZG93OiBbXCIwIDAgMHB4IGhzbCh2YXIoLS1zdWNjZXNzKSAvIDApXCIsIFwiMCAwIDI0cHggaHNsKHZhcigtLXN1Y2Nlc3MpIC8gMC4yNSlcIiwgXCIwIDAgMHB4IGhzbCh2YXIoLS1zdWNjZXNzKSAvIDApXCJdIH19XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMi41LCByZXBlYXQ6IEluZmluaXR5LCBlYXNlOiBcImVhc2VJbk91dFwiIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxCcmFuZGVkUVJDb2RlIHZhbHVlPXtwaXhEYXRhLnFyX2NvZGV9IC8+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHsvKiBDb3B5IFBJWCBjb2RlICovfVxuICAgICAgICAgIHtwaXhEYXRhLnFyX2NvZGUgJiYgKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic3BhY2UteS0yXCJcbiAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC41IH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGZvbnQtbWVkaXVtIHVwcGVyY2FzZSB0cmFja2luZy13aWRlXCI+Q8OzZGlnbyBQSVggQ29waWEgZSBDb2xhPC9wPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgIHJlYWRPbmx5XG4gICAgICAgICAgICAgICAgICB2YWx1ZT17cGl4RGF0YS5xcl9jb2RlfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIHB4LTMgcHktMi41IHJvdW5kZWQteGwgZ2xhc3MtaW5wdXQgdGV4dC1mb3JlZ3JvdW5kIHRleHQteHMgZm9udC1tb25vIHRydW5jYXRlIGJvcmRlciBib3JkZXItYm9yZGVyXCJcbiAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUNvcHlDb2RlfVxuICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e2NvcGllZCA/IHsgYmFja2dyb3VuZENvbG9yOiBcImhzbCh2YXIoLS1zdWNjZXNzKSlcIiB9IDoge319XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BweC00IHJvdW5kZWQteGwgZm9udC1ib2xkIHRleHQtc20gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNSB0cmFuc2l0aW9uLWFsbCAke1xuICAgICAgICAgICAgICAgICAgICBjb3BpZWRcbiAgICAgICAgICAgICAgICAgICAgICA/IFwiYmctc3VjY2VzcyB0ZXh0LXN1Y2Nlc3MtZm9yZWdyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgICAgOiBcImJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgaG92ZXI6b3BhY2l0eS05MFwiXG4gICAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgICA8Q29weSBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz5cbiAgICAgICAgICAgICAgICAgIHtjb3BpZWQgPyBcIkNvcGlhZG8hXCIgOiBcIkNvcGlhclwifVxuICAgICAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHsvKiBQYXltZW50IGxpbmsgKi99XG4gICAgICAgICAge3BpeERhdGEucGF5bWVudF9saW5rICYmIChcbiAgICAgICAgICAgIDxhIGhyZWY9e3BpeERhdGEucGF5bWVudF9saW5rfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB5LTMgcm91bmRlZC14bCBiZy1wcmltYXJ5LzEwIGJvcmRlciBib3JkZXItcHJpbWFyeS8yMCB0ZXh0LXByaW1hcnkgZm9udC1tZWRpdW0gdGV4dC1zbSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBob3ZlcjpiZy1wcmltYXJ5LzIwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgIDxFeHRlcm5hbExpbmsgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IEFicmlyIGxpbmsgZGUgcGFnYW1lbnRvXG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgKX1cblxuICAgICAgICAgIHsvKiBBdXRvLXBvbGxpbmcgaW5kaWNhdG9yICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgcHktMlwiPlxuICAgICAgICAgICAgPG1vdGlvbi5kaXYgYW5pbWF0ZT17eyByb3RhdGU6IDM2MCB9fSB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAyLCByZXBlYXQ6IEluZmluaXR5LCBlYXNlOiBcImxpbmVhclwiIH19PlxuICAgICAgICAgICAgICA8UmVmcmVzaEN3IGNsYXNzTmFtZT1cImgtNCB3LTQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgIFZlcmlmaWNhbmRvIHBhZ2FtZW50byBhdXRvbWF0aWNhbWVudGUuLi5cbiAgICAgICAgICAgICAge3BvbGxDb3VudCA+IDAgJiYgPHNwYW4gY2xhc3NOYW1lPVwibWwtMVwiPih7cG9sbENvdW50fXgpPC9zcGFuPn1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIHsvKiBBY3Rpb25zICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMlwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVDaGVja1N0YXR1c30gZGlzYWJsZWQ9e2NoZWNraW5nfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4LTEgcHktMyByb3VuZGVkLXhsIGJnLXN1Y2Nlc3MvMTAgYm9yZGVyIGJvcmRlci1zdWNjZXNzLzIwIHRleHQtc3VjY2VzcyBmb250LWJvbGQgdGV4dC1zbSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBob3ZlcjpiZy1zdWNjZXNzLzIwIHRyYW5zaXRpb24tY29sb3JzIGRpc2FibGVkOm9wYWNpdHktNTBcIj5cbiAgICAgICAgICAgICAge2NoZWNraW5nID8gPExvYWRlcjIgY2xhc3NOYW1lPVwiaC00IHctNCBhbmltYXRlLXNwaW5cIiAvPiA6IDxSZWZyZXNoQ3cgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+fVxuICAgICAgICAgICAgICBWZXJpZmljYXIgQWdvcmFcbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXtoYW5kbGVOZXdQaXh9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTQgcHktMyByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItYm9yZGVyIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBmb250LW1lZGl1bSB0ZXh0LXNtIGhvdmVyOmJnLW11dGVkLzQwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgIE5vdm8gUElYXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgKX1cblxuICAgICAgey8qIMOabHRpbW9zIGRlcMOzc2l0b3MgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImdsYXNzLWNhcmQgcm91bmRlZC0yeGwgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtNSBweS00IGJvcmRlci1iIGJvcmRlci1ib3JkZXJcIj5cbiAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtbGcgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPsOabHRpbW9zIERlcMOzc2l0b3M8L2gzPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAge2RlcG9zaXRUeHMubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInB5LTggdGV4dC1jZW50ZXIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+TmVuaHVtIGRlcMOzc2l0byByZWdpc3RyYWRvPC9wPlxuICAgICAgICApIDogZGVwb3NpdFR4cy5zbGljZSgwLCAxMCkubWFwKCh0LCBpKSA9PiAoXG4gICAgICAgICAgPG1vdGlvbi5kaXYga2V5PXt0LmlkfSBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHg6IC0xNiB9fSBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHg6IDAgfX0gdHJhbnNpdGlvbj17eyBkZWxheTogaSAqIDAuMDYgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTUgcHktMyBib3JkZXItYiBib3JkZXItYm9yZGVyIGxhc3Q6Ym9yZGVyLTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHctOCBoLTggcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNocmluay0wICR7dC5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgPyBcImJnLXN1Y2Nlc3MvMTVcIiA6IHQuc3RhdHVzID09PSBcImV4cGlyZWRcIiA/IFwiYmctZGVzdHJ1Y3RpdmUvMTVcIiA6IFwiYmctd2FybmluZy8xNVwifWB9PlxuICAgICAgICAgICAgICAgIHt0LnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiA/IDxBbmltYXRlZENoZWNrIHNpemU9ezE4fSBjbGFzc05hbWU9XCJ0ZXh0LXN1Y2Nlc3NcIiAvPiA6IHQuc3RhdHVzID09PSBcImV4cGlyZWRcIiA/IDxzcGFuIGNsYXNzTmFtZT1cInRleHQtZGVzdHJ1Y3RpdmUgdGV4dC1zbVwiPuKclTwvc3Bhbj4gOiA8TG9hZGVyMiBjbGFzc05hbWU9XCJoLTQgdy00IHRleHQtd2FybmluZyBhbmltYXRlLXNwaW5cIiAvPn1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwiZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kIHRleHQtc21cIj5EZXDDs3NpdG8gUElYPC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+e2ZtdERhdGUodC5jcmVhdGVkX2F0KX08L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtcmlnaHRcIj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPXtgZm9udC1ib2xkICR7dC5zdGF0dXMgPT09IFwiY29tcGxldGVkXCIgPyBcInRleHQtc3VjY2Vzc1wiIDogdC5zdGF0dXMgPT09IFwiZXhwaXJlZFwiID8gXCJ0ZXh0LWRlc3RydWN0aXZlXCIgOiBcInRleHQtd2FybmluZ1wifWB9Pit7Zm10KHQuYW1vdW50KX08L3A+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHRleHQtWzEwcHhdIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGUgJHt0LnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiA/IFwidGV4dC1zdWNjZXNzXCIgOiB0LnN0YXR1cyA9PT0gXCJleHBpcmVkXCIgPyBcInRleHQtZGVzdHJ1Y3RpdmVcIiA6IFwidGV4dC13YXJuaW5nXCJ9YH0+XG4gICAgICAgICAgICAgICAge3Quc3RhdHVzID09PSBcImNvbXBsZXRlZFwiID8gXCLinJMgQ29uZmlybWFkb1wiIDogdC5zdGF0dXMgPT09IFwiZXhwaXJlZFwiID8gXCLinJUgRXhwaXJhZG9cIiA6IFwi4o+zIFByb2Nlc3NhbmRvXCJ9XG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L21vdGlvbi5kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlQXV0aCIsInVzZU5hdmlnYXRlIiwiUmVjYXJnYXNUaWNrZXIiLCJCcmFuZGVkUVJDb2RlIiwiVGhlbWVUb2dnbGUiLCJBbmltYXRlZEljb24iLCJBbmltYXRlZENvdW50ZXIiLCJBbmltYXRlZEludCIsIk1vYmlsZUJvdHRvbU5hdiIsIkFuaW1hdGVkQ2hlY2siLCJQcm9tb0Jhbm5lciIsIlBvcHVwQmFubmVyIiwidXNlQmFja2dyb3VuZFBheW1lbnRNb25pdG9yIiwicGxheVN1Y2Nlc3NTb3VuZCIsIkZsb2F0aW5nUG9sbCIsIlNrZWxldG9uVmFsdWUiLCJTa2VsZXRvblJvdyIsIkltYWdlQ3JvcHBlciIsIlJlY2FyZ2FSZWNlaXB0IiwiUHJvZmlsZVRhYiIsIm1vdGlvbiIsIkFuaW1hdGVQcmVzZW5jZSIsIkxvZ091dCIsIlNtYXJ0cGhvbmUiLCJIaXN0b3J5IiwiU2VuZCIsIkNsb2NrIiwiTWVzc2FnZUNpcmNsZSIsIlgiLCJVc2VyIiwiQWN0aXZpdHkiLCJMYW5kbWFyayIsIkNyZWRpdENhcmQiLCJDaGVja0NpcmNsZTIiLCJYQ2lyY2xlIiwiV2lmaSIsIkRhdGFiYXNlIiwiU2hpZWxkIiwiU2VydmVyIiwiQWxlcnRUcmlhbmdsZSIsIkxvYWRlcjIiLCJFeWUiLCJRckNvZGUiLCJDb3B5IiwiRXh0ZXJuYWxMaW5rIiwiUmVmcmVzaEN3IiwiU3RvcmUiLCJTZWFyY2giLCJGaWx0ZXIiLCJDaGV2cm9uUmlnaHQiLCJGaWxlVGV4dCIsInN1cGFiYXNlIiwidXNlRWZmZWN0IiwidXNlU3RhdGUiLCJ1c2VDYWxsYmFjayIsInVzZVJlZiIsImFwcFRvYXN0Iiwic3R5bGVkVG9hc3QiLCJ0b2FzdCIsImZvcm1hdERhdGVUaW1lQlIiLCJmb3JtYXRGdWxsRGF0ZVRpbWVCUiIsImZvcm1hdERhdGVMb25nVXBwZXJCUiIsInRvTG9jYWxEYXRlS2V5IiwiZ2V0VG9kYXlMb2NhbEtleSIsInVzZVBpeERlcG9zaXQiLCJ1c2VSZXNpbGllbnRGZXRjaCIsImd1YXJkZWRGZXRjaCIsIm9wZXJhZG9yYUNvbG9ycyIsInNhZmVWYWxvciIsIlJldmVuZGVkb3JQYWluZWwiLCJyZXNlbGxlcklkIiwicmVzZWxsZXJCcmFuZGluZyIsImlzQ2xpZW50TW9kZSIsIm5hdmlnYXRlIiwidXNlciIsInJvbGUiLCJzaWduT3V0Iiwic2FsZG8iLCJzZXRTYWxkbyIsInJlY2FyZ2FzIiwic2V0UmVjYXJnYXMiLCJsb2FkaW5nIiwicnVuRmV0Y2giLCJ0YWIiLCJzZXRUYWIiLCJtZW51T3BlbiIsInNldE1lbnVPcGVuIiwicHJvZmlsZU5vbWUiLCJzZXRQcm9maWxlTm9tZSIsImF2YXRhclVybCIsInNldEF2YXRhclVybCIsInVwbG9hZGluZ0F2YXRhciIsInNldFVwbG9hZGluZ0F2YXRhciIsImNyb3BGaWxlIiwic2V0Q3JvcEZpbGUiLCJ0ZWxlZm9uZSIsInNldFRlbGVmb25lIiwiY2xpcGJvYXJkUGhvbmUiLCJzZXRDbGlwYm9hcmRQaG9uZSIsInNlbGVjdGVkQ2FycmllciIsInNldFNlbGVjdGVkQ2FycmllciIsInNlbGVjdGVkVmFsdWUiLCJzZXRTZWxlY3RlZFZhbHVlIiwiZXh0cmFEYXRhIiwic2V0RXh0cmFEYXRhIiwic2VuZGluZyIsInNldFNlbmRpbmciLCJwZW5kaW5nV2FybmluZyIsInNldFBlbmRpbmdXYXJuaW5nIiwicmVjYXJnYVJlc3VsdCIsInNldFJlY2FyZ2FSZXN1bHQiLCJ0cmFja2luZ1N0YXR1cyIsInNldFRyYWNraW5nU3RhdHVzIiwiZGF0YSIsIm9wZW4iLCJsb2NhbFJlY2FyZ2EiLCJwaG9uZUNoZWNrUmVzdWx0Iiwic2V0UGhvbmVDaGVja1Jlc3VsdCIsImNoZWNraW5nUGhvbmUiLCJzZXRDaGVja2luZ1Bob25lIiwiZGV0ZWN0aW5nT3BlcmF0b3IiLCJzZXREZXRlY3RpbmdPcGVyYXRvciIsImRldGVjdGVkT3BlcmF0b3JOYW1lIiwic2V0RGV0ZWN0ZWRPcGVyYXRvck5hbWUiLCJsYXN0RGV0ZWN0ZWRQaG9uZVJlZiIsInNlbGVjdGVkUmVjYXJnYSIsInNldFNlbGVjdGVkUmVjYXJnYSIsInJlY2VpcHRSZWNhcmdhIiwic2V0UmVjZWlwdFJlY2FyZ2EiLCJjYXRhbG9nIiwic2V0Q2F0YWxvZyIsImNhdGFsb2dMb2FkaW5nIiwic2V0Q2F0YWxvZ0xvYWRpbmciLCJjYXRhbG9nTG9hZGVkIiwidGVsZWdyYW1Vc2VybmFtZSIsInNldFRlbGVncmFtVXNlcm5hbWUiLCJ3aGF0c2FwcE51bWJlciIsInNldFdoYXRzYXBwTnVtYmVyIiwidGVsZWdyYW1Cb3RUb2tlbiIsInNldFRlbGVncmFtQm90VG9rZW4iLCJ0ZWxlZ3JhbUxpbmtlZCIsInNldFRlbGVncmFtTGlua2VkIiwic2hvd0JvdFRva2VuIiwic2V0U2hvd0JvdFRva2VuIiwic2F2aW5nQ29udGFjdHMiLCJzZXRTYXZpbmdDb250YWN0cyIsInRyYW5zYWN0aW9ucyIsInNldFRyYW5zYWN0aW9ucyIsInRyYW5zTG9hZGluZyIsInNldFRyYW5zTG9hZGluZyIsInRyYW5zTG9hZGVkIiwiaGlzdFNlYXJjaCIsInNldEhpc3RTZWFyY2giLCJoaXN0U3RhdHVzIiwic2V0SGlzdFN0YXR1cyIsImhpc3RPcGVyYWRvcmEiLCJzZXRIaXN0T3BlcmFkb3JhIiwic2hvd1ZhbG9yZXNNb2RhbCIsInNldFNob3dWYWxvcmVzTW9kYWwiLCJzdGF0dXNEYXRhIiwic2V0U3RhdHVzRGF0YSIsInByb2ZpbGVTbHVnIiwic2V0UHJvZmlsZVNsdWciLCJiYW5uZXJzTGlzdCIsInNldEJhbm5lcnNMaXN0IiwiZGlzbWlzc2VkQmFubmVycyIsInNldERpc21pc3NlZEJhbm5lcnMiLCJTZXQiLCJjYWxsQXBpIiwiYWN0aW9uIiwicGFyYW1zIiwiZXJyb3IiLCJmdW5jdGlvbnMiLCJpbnZva2UiLCJib2R5IiwiRXJyb3IiLCJtZXNzYWdlIiwiZmV0Y2hDYXRhbG9nIiwib3BzIiwiZ2xvYmFsUnVsZXMiLCJyZXNlbGxlclJ1bGVzIiwiUHJvbWlzZSIsImFsbCIsImZyb20iLCJzZWxlY3QiLCJlcSIsIm9yZGVyIiwiaWQiLCJyZXNvbHZlIiwibG9jYWxDYXRhbG9nIiwibWFwIiwib3AiLCJvcEdsb2JhbFJ1bGVzIiwiZmlsdGVyIiwiciIsIm9wZXJhZG9yYV9pZCIsIm9wUmVzZWxsZXJSdWxlcyIsInZhbG9yZXMiLCJ2YWx1ZXMiLCJ2IiwicmVzZWxsZXJSdWxlIiwiZmluZCIsIk51bWJlciIsInZhbG9yX3JlY2FyZ2EiLCJnbG9iYWxSdWxlIiwicnVsZSIsImNvc3QiLCJ0aXBvX3JlZ3JhIiwicmVncmFfdmFsb3IiLCJjdXN0byIsInZhbHVlSWQiLCJ2YWx1ZSIsImNhcnJpZXJJZCIsIm5hbWUiLCJub21lIiwicmVzcCIsInN1Y2Nlc3MiLCJmZXRjaERhdGEiLCJzYWxkb0RhdGEiLCJyZWNhcmdhc0RhdGEiLCJwcm9maWxlIiwiYm90VG9rZW5Db25maWciLCJtYXliZVNpbmdsZSIsImFzY2VuZGluZyIsImxpbWl0Iiwic2luZ2xlIiwidmFsb3IiLCJwIiwidGVsZWdyYW1fdXNlcm5hbWUiLCJ3aGF0c2FwcF9udW1iZXIiLCJ0ZWxlZ3JhbV9pZCIsInNsdWciLCJhdmF0YXJfdXJsIiwiZmV0Y2hUcmFuc2FjdGlvbnMiLCJmZXRjaFN0YXR1cyIsImNvdW50Iiwib3BzQ291bnQiLCJyZWNUb3RhbCIsImxhc3RSZWMiLCJycGNTdGF0cyIsImhlYWQiLCJycGMiLCJvcGVyYXRvclN0YXRzIiwiQXJyYXkiLCJpc0FycmF5IiwicyIsIm9wZXJhZG9yYSIsImF2Z1JlY2VudCIsImF2Z19yZWNlbnQiLCJtaW4yNGgiLCJtaW5fMjRoIiwiYXZnMjRoIiwiYXZnXzI0aCIsIm1heDI0aCIsIm1heF8yNGgiLCJyZWNlbnRDb3VudCIsInJlY2VudF9jb3VudCIsImFjdGl2ZU9wcyIsImZvckVhY2giLCJ0b0xvd2VyQ2FzZSIsInB1c2giLCJkYk9ubGluZSIsImF1dGhPbmxpbmUiLCJvcGVyYWRvcmFzQ291bnQiLCJyZWNhcmdhc1RvdGFsIiwibGFzdFJlY2FyZ2EiLCJjcmVhdGVkX2F0IiwicmV2RGVwb3NpdFRvYXN0Iiwic2V0UmV2RGVwb3NpdFRvYXN0IiwiX2tleSIsInRoZW4iLCJoYW5kbGVCZ1BheW1lbnRDb25maXJtZWQiLCJzYWxkb0NoYW5uZWwiLCJjaGFubmVsIiwib24iLCJldmVudCIsInNjaGVtYSIsInRhYmxlIiwicGF5bG9hZCIsInJvdyIsIm5ldyIsInRpcG8iLCJ1bmRlZmluZWQiLCJzdWJzY3JpYmUiLCJyZW1vdmVDaGFubmVsIiwibmV3Um93Iiwib2xkUm93Iiwib2xkIiwic3RhdHVzIiwicmVjYXJnYUNvbXBsZXRlZCIsInRvRml4ZWQiLCJ0eXBlIiwidXNlcl9pZCIsInJlY2FyZ2FfaWQiLCJjYXRjaCIsImUiLCJjb25zb2xlIiwid2FybiIsImIiLCJwb3NpdGlvbiIsImVuYWJsZWQiLCJ0aXRsZSIsInN1YnRpdGxlIiwibGluayIsInBlbmRpbmdXaXRoRXh0ZXJuYWxJZCIsImV4dGVybmFsX2lkIiwibGVuZ3RoIiwiY2FuY2VsbGVkIiwicG9sbFBlbmRpbmciLCJsb2NhbFN0YXR1cyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJjbGVhckludGVydmFsIiwidGltZXIiLCJzZXRUaW1lb3V0IiwiZG9jdW1lbnQiLCJoYXNGb2N1cyIsIm5hdmlnYXRvciIsImNsaXBib2FyZCIsInJlYWRUZXh0IiwidGV4dCIsImRpZ2l0cyIsInJlcGxhY2UiLCJjbGVhclRpbWVvdXQiLCJmb3JtYXRQaG9uZURpc3BsYXkiLCJkIiwic2xpY2UiLCJmb3JtYXRDb29sZG93bk1lc3NhZ2UiLCJpc29NYXRjaCIsIm1hdGNoIiwiZHQiLCJEYXRlIiwiZm9ybWF0dGVkIiwiaW5jbHVkZXMiLCJoYW5kbGVDaGVja1Bob25lIiwidHJpbSIsIm5vcm1hbGl6ZWRQaG9uZSIsInF1ZXJ5UmVzcCIsInBob25lTnVtYmVyIiwibG9nIiwib3BlcmF0b3JOYW1lIiwiY2FycmllciIsIm9wZXJhdG9yIiwibm9ybWFsaXplIiwibWF0Y2hlZCIsImMiLCJjaGVja1Jlc3VsdCIsIndhcm5pbmciLCJibG9ja2VkIiwiZXJyIiwiaGFuZGxlUmVjYXJnYSIsInNraXBQZW5kaW5nQ2hlY2siLCJwcmV2ZW50RGVmYXVsdCIsImV4dHJhRmllbGQiLCJyZXF1aXJlZCIsInBob25lIiwicHJlY2hlY2tSZXNwIiwicHJlY2hlY2tSZXN1bHQiLCJzYWxkb190aXBvIiwibmV3QmFsYW5jZSIsImxvY2FsQmFsYW5jZSIsImV4dGVybmFsSWQiLCJfaWQiLCJvcmRlclN0YXR1cyIsImZtdCIsIm1zZyIsImZpbmFsTXNnIiwiaGFuZGxlU2F2ZUNvbnRhY3RzIiwicHJvZmlsZUVycm9yIiwidXBkYXRlIiwidG9rZW5WYWx1ZSIsImNvbmZpZ0Vycm9yIiwidXBzZXJ0Iiwia2V5Iiwib25Db25mbGljdCIsInRvTG9jYWxlU3RyaW5nIiwic3R5bGUiLCJjdXJyZW5jeSIsImhhbmRsZVRyYWNrUmVjaGFyZ2UiLCJsciIsIm9yZGVycyIsIm8iLCJmbXREYXRlIiwicmVjYXJnYXNIb2plIiwidXNlckxhYmVsIiwiZW1haWwiLCJzcGxpdCIsInVzZXJJbml0aWFsIiwidG9VcHBlckNhc2UiLCJtZW51SXRlbXMiLCJsYWJlbCIsImljb24iLCJhY3RpdmUiLCJkYXNoZWQiLCJ0YWJUaXRsZSIsInJlY2FyZ2EiLCJhZGRTYWxkbyIsImhpc3RvcmljbyIsImV4dHJhdG8iLCJjb250YXRvcyIsInNlbGVjdFRhYiIsIm5leHRUYWIiLCJoYW5kbGVBdmF0YXJVcGxvYWQiLCJmaWxlIiwidGFyZ2V0IiwiZmlsZXMiLCJhbGxvd2VkVHlwZXMiLCJzaXplIiwidXBsb2FkQXZhdGFyRmlsZSIsImZpbGVPckJsb2IiLCJleHQiLCJGaWxlIiwicG9wIiwicGF0aCIsImV4aXN0aW5nRmlsZXMiLCJzdG9yYWdlIiwibGlzdCIsInJlbW92ZSIsImYiLCJ1cEVyciIsInVwbG9hZCIsInVybERhdGEiLCJnZXRQdWJsaWNVcmwiLCJwdWJsaWNVcmwiLCJub3ciLCJhdmF0YXJFcnJvciIsInNldEF2YXRhckVycm9yIiwic2hvd0F2YXRhck1lbnUiLCJzZXRTaG93QXZhdGFyTWVudSIsIkF2YXRhckRpc3BsYXkiLCJ0ZXh0U2l6ZSIsImltZyIsInNyYyIsImFsdCIsImNsYXNzTmFtZSIsInJlZmVycmVyUG9saWN5IiwiY3Jvc3NPcmlnaW4iLCJvbkVycm9yIiwiZGl2Iiwib25DbGljayIsImgyIiwiYnV0dG9uIiwid2lkdGgiLCJpdGVtIiwiaXNBY3RpdmUiLCJzcGFuIiwiYSIsImhyZWYiLCJyZWwiLCJhc2lkZSIsImgxIiwic3ZnIiwidmlld0JveCIsImZpbGwiLCJhbmltYXRpb25OYW1lIiwic3Ryb2tlIiwic3Ryb2tlV2lkdGgiLCJzdHJva2VMaW5lY2FwIiwic3Ryb2tlTGluZWpvaW4iLCJwcmVmaXgiLCJuYXYiLCJhbmltYXRlIiwic2NhbGUiLCJ0cmFuc2l0aW9uIiwiZHVyYXRpb24iLCJyZXBlYXQiLCJJbmZpbml0eSIsImVhc2UiLCJoZWFkZXIiLCJwcmV2IiwiaW5pdGlhbCIsIm9wYWNpdHkiLCJ5IiwiZXhpdCIsIm1haW4iLCJyYXdWYWx1ZSIsImlzQ3VycmVuY3kiLCJjb2xvciIsImJnQ29sb3IiLCJhbmltIiwiaSIsImRlbGF5Iiwic3RpZmZuZXNzIiwiYW5pbWF0aW9uIiwiaGFzIiwidmlzaWJsZSIsIm9uQ2xvc2UiLCJkYW1waW5nIiwicm90YXRlIiwiaDMiLCJzdG9wUHJvcGFnYXRpb24iLCJjcmVhdGVkQXQiLCJoNCIsInNvcnQiLCJ2YWwiLCJmb3JtIiwib25TdWJtaXQiLCJpbnB1dCIsIm9uQ2hhbmdlIiwicmF3IiwicHJldkRpZ2l0cyIsIm5ld0RpZ2l0cyIsImN1cnJlbnQiLCJvblBhc3RlIiwiY2xpcGJvYXJkRGF0YSIsImdldERhdGEiLCJtYXhMZW5ndGgiLCJwbGFjZWhvbGRlciIsImJhY2tncm91bmRJbWFnZSIsIm9wdGlvbiIsImRpc2FibGVkIiwiaGVpZ2h0Iiwid2hpbGVUYXAiLCJzdHJvbmciLCJ4IiwiYmciLCJib3JkZXIiLCJBZGRTYWxkb1NlY3Rpb24iLCJ1c2VyRW1haWwiLCJ1c2VyTmFtZSIsIm9uRGVwb3NpdGVkIiwic2FsZG9UaXBvIiwib3BlcmFkb3JhcyIsIkJvb2xlYW4iLCJmaWx0ZXJlZCIsImxhc3REYXRlIiwiZGF0ZUxhYmVsIiwic2hvd1NlcCIsInN0YXR1c0xhYmVsIiwic3RhdHVzQ2xhc3MiLCJ0aGVhZCIsInRyIiwidGgiLCJ0Ym9keSIsInRkIiwiY29sU3BhbiIsImlzQ29tcGxldGVkIiwiaXNQZW5kaW5nIiwic3RhdHVzSWNvbiIsInN0b3JlTmFtZSIsInVzZXJJZCIsInQiLCJpc0RlcG9zaXQiLCJhbW91bnQiLCJ0b3RhbFJlY2FyZ2FzIiwiZm10VGltZSIsIm1pbnMiLCJNYXRoIiwiZmxvb3IiLCJzZWNzIiwicm91bmQiLCJvcE5hbWUiLCJvcENvbG9yIiwiYXZnQ29sb3IiLCJvbkNyb3AiLCJibG9iIiwib25DYW5jZWwiLCJpdGVtcyIsImhpZ2hsaWdodGVkIiwiYWN0aXZlS2V5Iiwib25TZWxlY3QiLCJtYWluQ291bnQiLCJ1c2VyUm9sZSIsInVzZXJBdmF0YXJVcmwiLCJvblNpZ25PdXQiLCJwYW5lbExpbmtzIiwicGl4IiwicG9sbEludGVydmFsIiwib25Db25maXJtZWQiLCJkZXBvc2l0QW1vdW50Iiwic2V0RGVwb3NpdEFtb3VudCIsImdlbmVyYXRpbmciLCJwaXhEYXRhIiwicGl4RXJyb3IiLCJjb3BpZWQiLCJjaGVja2luZyIsInBheW1lbnRDb25maXJtZWQiLCJjb25maXJtZWRBbW91bnQiLCJwb2xsQ291bnQiLCJwcmVzZXRBbW91bnRzIiwiZ2VuZXJhdGVQaXgiLCJoYW5kbGVHZW5lcmF0ZVBpeCIsImNvcHlDb2RlIiwiaGFuZGxlQ29weUNvZGUiLCJjaGVja1N0YXR1cyIsImhhbmRsZUNoZWNrU3RhdHVzIiwicmVzZXQiLCJoYW5kbGVOZXdQaXgiLCJERVBPU0lUX0VYUElSWV9NUyIsImRlcG9zaXRUeHMiLCJnZXRUaW1lIiwiU3RyaW5nIiwiaW5wdXRNb2RlIiwibWluIiwicGFyc2VGbG9hdCIsInFyX2NvZGUiLCJib3hTaGFkb3ciLCJyZWFkT25seSIsImJhY2tncm91bmRDb2xvciIsInBheW1lbnRfbGluayJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsT0FBTyxRQUFRLGtCQUFrQjtBQUMxQyxTQUFTQyxXQUFXLFFBQVEsbUJBQW1CO0FBQy9DLE9BQU9DLG9CQUFvQiw4QkFBOEI7QUFDekQsT0FBT0MsbUJBQW1CLDZCQUE2QjtBQUN2RCxTQUFTQyxXQUFXLFFBQVEsMkJBQTJCO0FBQ3ZELFNBQVNDLFlBQVksUUFBUSw0QkFBNEI7QUFDekQsU0FBU0MsZUFBZSxFQUFFQyxXQUFXLFFBQVEsK0JBQStCO0FBQzVFLFNBQVNDLGVBQWUsUUFBaUIsK0JBQStCO0FBQ3hFLE9BQU9DLG1CQUFtQiw2QkFBNkI7QUFDdkQsU0FBU0MsV0FBVyxRQUFRLDJCQUEyQjtBQUN2RCxTQUFTQyxXQUFXLFFBQVEsMkJBQTJCO0FBRXZELFNBQVNDLDJCQUEyQixRQUFRLHNDQUFzQztBQUNsRixTQUFTQyxnQkFBZ0IsUUFBUSxlQUFlO0FB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