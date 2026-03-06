import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import RecargasTicker from "@/components/RecargasTicker";
import BrandedQRCode from "@/components/BrandedQRCode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { AnimatedCounter, AnimatedInt } from "@/components/AnimatedCounter";
import { MobileBottomNav, NavItem } from "@/components/MobileBottomNav";
import AnimatedCheck from "@/components/AnimatedCheck";
import { PromoBanner } from "@/components/PromoBanner";
import { PopupBanner } from "@/components/PopupBanner";
import { PixResult } from "@/lib/payment";
import { useBackgroundPaymentMonitor } from "@/hooks/useBackgroundPaymentMonitor";
import { playSuccessSound } from "@/lib/sounds";
import { FloatingPoll } from "@/components/FloatingPoll";
import { SkeletonValue, SkeletonRow, SkeletonCard } from "@/components/Skeleton";
import { ImageCropper } from "@/components/ImageCropper";
import { RecargaReceipt } from "@/components/RecargaReceipt";
import { ProfileTab } from "@/components/ProfileTab";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Wallet, Smartphone, History, Send, Clock, MessageCircle,
  Menu, X, User, Activity, Landmark, CreditCard, CheckCircle2, XCircle,
  Wifi, Database, Shield, Server, AlertTriangle, Loader2, Eye, EyeOff, Save,
  QrCode, Copy, ExternalLink, RefreshCw, Store, Pencil, Search, Filter, Camera, ChevronRight, FileText,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback, useRef } from "react";
import { appToast, styledToast as toast } from "@/lib/toast";
import { formatDateTimeBR, formatFullDateTimeBR, formatDateLongUpperBR, toLocalDateKey, getTodayLocalKey } from "@/lib/timezone";

import type { Recarga, CatalogValue, CatalogCarrier, Transaction } from "@/types";
import { usePixDeposit } from "@/hooks/usePixDeposit";
import { useResilientFetch, guardedFetch } from "@/hooks/useAsync";
import { operadoraColors, safeValor } from "@/lib/utils";

type PainelTab = "recarga" | "addSaldo" | "historico" | "extrato" | "contatos" | "status";

interface RevendedorPainelProps {
  resellerId?: string;
  resellerBranding?: {
    name: string;
    logoUrl: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
  };
}

export default function RevendedorPainel({ resellerId, resellerBranding }: RevendedorPainelProps = {}) {
  const isClientMode = !!resellerId;
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const [saldo, setSaldo] = useState(0);
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const { loading, runFetch } = useResilientFetch();
  const [tab, setTab] = useState<PainelTab>("recarga");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileNome, setProfileNome] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  // Recarga form
  const [telefone, setTelefone] = useState("");
  const [clipboardPhone, setClipboardPhone] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<CatalogCarrier | null>(null);
  const [selectedValue, setSelectedValue] = useState<CatalogValue | null>(null);
  const [extraData, setExtraData] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingWarning, setPendingWarning] = useState<{ phone: string; count: number } | null>(null);
  const [recargaResult, setRecargaResult] = useState<{ success: boolean; message: string; externalId?: string } | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<{ loading: boolean; data: any | null; open: boolean; localRecarga?: Recarga | null }>({ loading: false, data: null, open: false, localRecarga: null });
  const [phoneCheckResult, setPhoneCheckResult] = useState<{ status: string; message: string } | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [detectingOperator, setDetectingOperator] = useState(false);
  const [detectedOperatorName, setDetectedOperatorName] = useState<string | null>(null);
  const lastDetectedPhoneRef = useRef<string>("");
  const [selectedRecarga, setSelectedRecarga] = useState<Recarga | null>(null);
  const [receiptRecarga, setReceiptRecarga] = useState<Recarga | null>(null);

  // API Catalog
  const [catalog, setCatalog] = useState<CatalogCarrier[]>([]);
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transLoading, setTransLoading] = useState(false);
  const transLoaded = useRef(false);

  // Histórico filters
  const [histSearch, setHistSearch] = useState("");
  const [histStatus, setHistStatus] = useState<"all" | "completed" | "pending" | "falha">("all");
  const [histOperadora, setHistOperadora] = useState("all");

  // Tabela de valores modal
  const [showValoresModal, setShowValoresModal] = useState(false);

  // Status
  const [statusData, setStatusData] = useState<{
    dbOnline: boolean;
    authOnline: boolean;
    operadorasCount: number;
    recargasTotal: number;
    lastRecarga: string | null;
    operatorStats: { operadora: string; avgRecent: number; min24h: number; avg24h: number; max24h: number; recentCount: number }[];
  } | null>(null);

  // Profile slug for store link
  // Profile slug for store link
  const [profileSlug, setProfileSlug] = useState("");

  // Banner config from banners table
  const [bannersList, setBannersList] = useState<{ id: string; position: number; type: string; enabled: boolean; title: string; subtitle: string; link: string }[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<Set<number>>(new Set());


  // Call edge function helper
  const callApi = useCallback(async (action: string, params: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("recarga-express", {
      body: { action, ...params },
    });
    if (error) throw new Error(error.message || "Erro na API");
    return data;
  }, []);

  const fetchCatalog = useCallback(async () => {
    await guardedFetch(catalogLoaded, setCatalogLoading, async () => {
      // Always build catalog from local DB with reseller/global pricing rules
      const [{ data: ops }, { data: globalRules }, { data: resellerRules }] = await Promise.all([
        supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
        supabase.from("pricing_rules").select("*"),
        user?.id ? supabase.from("reseller_pricing_rules").select("*").eq("user_id", user.id) : Promise.resolve({ data: [] }),
      ]);

      if (ops) {
        const localCatalog: CatalogCarrier[] = ops.map((op) => {
          const opGlobalRules = (globalRules || []).filter((r) => r.operadora_id === op.id);
          const opResellerRules = (resellerRules || []).filter((r: any) => r.operadora_id === op.id);
          const valores = (op.valores as unknown as number[]) || [];
          const values: CatalogValue[] = valores.map((v: number) => {
            const resellerRule = opResellerRules.find((r: any) => r.valor_recarga === v);
            const globalRule = opGlobalRules.find((r) => r.valor_recarga === v);
            const rule = resellerRule || globalRule;
            const cost = rule
              ? rule.tipo_regra === "fixo"
                ? Number(rule.regra_valor)
                : Number(rule.custo) * (1 + Number(rule.regra_valor) / 100)
              : v;
            return { valueId: `${op.id}_${v}`, value: v, cost };
          });
          return { carrierId: op.id, name: op.nome, order: 0, values };
        });
        setCatalog(localCatalog);
      } else {
        try {
          const resp = await callApi("catalog");
          if (resp?.success && resp.data) setCatalog(resp.data);
        } catch { /* */ }
      }
    });
  }, [user?.id, callApi]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    await runFetch(async () => {
      const [{ data: saldoData }, { data: recargasData }, { data: profile }] = await Promise.all([
        supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", "revenda").maybeSingle(),
        supabase.from("recargas").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
        supabase.from("profiles").select("nome, telegram_username, whatsapp_number, telegram_bot_token, telegram_id, slug, avatar_url").eq("id", user.id).single(),
      ]);
      setSaldo(Number(saldoData?.valor) || 0);
      setRecargas(recargasData || []);
      const p = profile as any;
      setProfileNome(p?.nome || "");
      setTelegramUsername(p?.telegram_username || "");
      setWhatsappNumber(p?.whatsapp_number || "");
      setTelegramBotToken(p?.telegram_bot_token || "");
      setTelegramLinked(!!p?.telegram_id);
      setProfileSlug(p?.slug || "");
      setAvatarUrl(p?.avatar_url || null);
    });
  }, [user, runFetch]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    await guardedFetch(transLoaded, setTransLoading, async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setTransactions(data || []);
    });
  }, [user]);

  const fetchStatus = useCallback(async () => {
    try {
      const [{ count: opsCount }, { count: recTotal }, { data: lastRec }, { data: rpcStats }] = await Promise.all([
        supabase.from("operadoras").select("*", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("recargas").select("*", { count: "exact", head: true }),
        supabase.from("recargas").select("created_at").order("created_at", { ascending: false }).limit(1),
        supabase.rpc("get_operator_stats" as any),
      ]);

      // Map RPC results to expected format
      const operatorStats: { operadora: string; avgRecent: number; min24h: number; avg24h: number; max24h: number; recentCount: number }[] = 
        (Array.isArray(rpcStats) ? rpcStats : []).map((s: any) => ({
          operadora: s.operadora || "",
          avgRecent: Number(s.avg_recent) || 0,
          min24h: Number(s.min_24h) || 0,
          avg24h: Number(s.avg_24h) || 0,
          max24h: Number(s.max_24h) || 0,
          recentCount: Number(s.recent_count) || 0,
        }));

      // Ensure all active operators appear
      const activeOps = ["Claro", "Tim", "Vivo"];
      activeOps.forEach(op => {
        if (!operatorStats.find(s => s.operadora.toLowerCase() === op.toLowerCase())) {
          operatorStats.push({ operadora: op, avgRecent: 0, min24h: 0, avg24h: 0, max24h: 0, recentCount: 0 });
        }
      });

      setStatusData({
        dbOnline: true,
        authOnline: !!user,
        operadorasCount: opsCount || 0,
        recargasTotal: recTotal || 0,
        lastRecarga: lastRec?.[0]?.created_at || null,
        operatorStats,
      });
    } catch {
      setStatusData({ dbOnline: false, authOnline: !!user, operadorasCount: 0, recargasTotal: 0, lastRecarga: null, operatorStats: [] });
    }
  }, [user]);



  // Background payment monitor — load revendedor deposit toast config
  const [revDepositToast, setRevDepositToast] = useState(false);
  useEffect(() => {
    supabase.rpc("get_notif_config", { _key: "notif_revendedor_deposit" })
      .then(({ data }) => { if (data === "true") setRevDepositToast(true); });
  }, []);
  const handleBgPaymentConfirmed = useCallback(() => {
    fetchData();
    fetchTransactions();
  }, [fetchData, fetchTransactions]);
  useBackgroundPaymentMonitor(user?.id, handleBgPaymentConfirmed, revDepositToast);

  // Realtime: listen for recargas status changes
  // Realtime: saldo updates
  useEffect(() => {
    if (!user) return;
    const saldoChannel = supabase
      .channel(`saldo-realtime-${user.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "saldos",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row?.tipo === "revenda" && row?.valor !== undefined) {
          setSaldo(Number(row.valor));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(saldoChannel); };
  }, [user]);

  // Realtime: recargas status updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`recargas-status-${user.id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "recargas",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        const newRow = payload.new as any;
        const oldRow = payload.old as any;
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
                created_at: newRow.created_at,
              },
            },
          }).catch(e => console.warn("Auto telegram receipt failed:", e));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchData]);

  useEffect(() => {
    // Parallel initial load: data + catalog + banners
    fetchData();
    fetchCatalog();
    supabase.from("banners").select("*").order("position").then(({ data }) => {
      setBannersList((data || []).map(b => ({
        id: b.id,
        position: b.position,
        type: b.type,
        enabled: b.enabled,
        title: b.title,
        subtitle: b.subtitle,
        link: b.link,
      })));
    });
  }, [fetchData, fetchCatalog]);
  useEffect(() => { if (tab === "extrato" || tab === "addSaldo") fetchTransactions(); }, [tab, fetchTransactions]);
  useEffect(() => { if (tab === "status") fetchStatus(); }, [tab, fetchStatus]);

  // Auto-poll pending recargas to update status from external API
  useEffect(() => {
    const pendingWithExternalId = recargas.filter(r => r.status === "pending" && (r as any).external_id);
    if (pendingWithExternalId.length === 0) return;

    let cancelled = false;
    const pollPending = async () => {
      for (const r of pendingWithExternalId) {
        if (cancelled) break;
        try {
          const resp = await callApi("order-status", { external_id: (r as any).external_id });
          if (resp?.success && resp.data?.localStatus === "completed") {
            appToast.recargaCompleted(`Recarga ${r.operadora || ""} R$ ${Number(r.valor).toFixed(2)} para ${r.telefone} concluída!`);
            playSuccessSound();
            fetchData();
            break;
          }
        } catch { /* ignore */ }
      }
    };

    // Poll immediately then every 30s
    pollPending();
    const interval = setInterval(pollPending, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [recargas, callApi, fetchData]);

  // Detect phone number in clipboard for quick paste (delayed to avoid iOS "Paste" popup on load)
  useEffect(() => {
    if (tab !== "recarga" || telefone.length > 0) {
      setClipboardPhone(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled || !document.hasFocus()) return;
      try {
        if (!navigator.clipboard?.readText) return;
        const text = await navigator.clipboard.readText();
        if (cancelled || !text) return;
        const digits = text.replace(/\D/g, "");
        if (digits.length >= 10 && digits.length <= 11) {
          setClipboardPhone(digits);
        }
      } catch { /* clipboard permission denied */ }
    }, 1500);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [tab, telefone]);

   // Auto-detect removed — user selects operator manually, then clicks "Verificar"

  const formatPhoneDisplay = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  useEffect(() => { setSelectedValue(null); setExtraData(""); setPhoneCheckResult(null); }, [selectedCarrier]);

  const formatCooldownMessage = useCallback((message?: string) => {
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
    } catch {
      return message;
    }
  }, []);

  const handleCheckPhone = async () => {
    if (!telefone.trim()) { appToast.error("Digite o número"); return; }
    
    const normalizedPhone = telefone.replace(/\D/g, "");

    // If no carrier selected, try to auto-detect operator first
    if (!selectedCarrier?.carrierId) {
      setCheckingPhone(true);
      setPhoneCheckResult(null);
      try {
        const queryResp = await callApi("query-operator", { phoneNumber: normalizedPhone });
        console.log("query-operator result:", queryResp);
        
        if (queryResp?.success && queryResp.data) {
          // Try to match operator name from response to catalog
          const operatorName = queryResp.data.carrier?.name || queryResp.data.operator || queryResp.data.operadora || queryResp.data.name || "";
          if (operatorName) {
            const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
            const matched = catalog.find(c => normalize(c.name).includes(normalize(operatorName)) || normalize(operatorName).includes(normalize(c.name)));
            if (matched) {
              setSelectedCarrier(matched);
              appToast.success(`Operadora detectada: ${matched.name}`);
              // Now proceed to check-phone with the detected carrier
              try {
                const resp = await callApi("check-phone", { phoneNumber: normalizedPhone, carrierId: matched.carrierId });
                if (resp?.success && resp.data) {
                  const checkResult = {
                    ...resp.data,
                    message: resp.data.status === "COOLDOWN"
                      ? formatCooldownMessage(resp.data.message)
                      : (resp.data.message || "Número disponível para recarga."),
                  };
                  setPhoneCheckResult(checkResult);
                  if (checkResult.status === "CLEAR") appToast.success("Número disponível!");
                  else if (checkResult.status === "COOLDOWN") appToast.warning(checkResult.message);
                  else if (checkResult.status === "BLACKLISTED") appToast.blocked(checkResult.message);
                }
              } catch { /* ignore check-phone error after auto-detect */ }
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
      } catch (err: any) {
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
        carrierId: selectedCarrier.carrierId,
      });

      if (resp?.success && resp.data) {
        const checkResult = {
          ...resp.data,
          message: resp.data.status === "COOLDOWN"
            ? formatCooldownMessage(resp.data.message)
            : (resp.data.message || "Número disponível para recarga."),
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
    } catch (err: any) {
      toast.error(err.message || "Erro ao verificar número");
    }
    setCheckingPhone(false);
  };

  const handleRecarga = async (e: React.FormEvent, skipPendingCheck = false) => {
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
      const { count } = await supabase
        .from("recargas")
        .select("id", { count: "exact", head: true })
        .eq("telefone", normalizedPhone)
        .eq("status", "pending");
      if (count && count > 0) {
        setPendingWarning({ phone: telefone, count });
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
        carrierId: selectedCarrier.carrierId,
      });

      if (precheckResp?.success && precheckResp.data) {
        const precheckResult = {
          ...precheckResp.data,
          message: precheckResp.data.status === "COOLDOWN"
            ? formatCooldownMessage(precheckResp.data.message)
            : (precheckResp.data.message || "Número disponível para recarga."),
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
        saldo_tipo: "revenda",
      });

      if (resp?.success) {
        const newBalance = resp.data?.localBalance ?? (saldo - selectedValue.cost);
        const externalId = resp.data?._id || null;
        const orderStatus = resp.data?.status;
        setRecargaResult({
          success: true,
          message: `Pedido de ${fmt(selectedValue.value)} (${selectedCarrier.name}) para ${telefone} enviado com sucesso! Novo saldo: ${fmt(newBalance)}`,
          externalId,
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
    } catch (err: any) {
      const msg = formatCooldownMessage(err.message || "Erro ao realizar recarga");
      const finalMsg = (msg.toLowerCase().includes("cooldown") && !msg.includes("⏳")) ? `⏳ ${msg}` : msg;
      setRecargaResult({ success: false, message: finalMsg });
    }
    setSending(false);
  };

  const handleSaveContacts = async () => {
    setSavingContacts(true);
    try {
      const { error } = await supabase.from("profiles").update({ telegram_username: telegramUsername.trim() || null, whatsapp_number: whatsappNumber.trim() || null, telegram_bot_token: telegramBotToken.trim() || null } as any).eq("id", user!.id);
      if (error) throw error;
      toast.success("Contatos salvos!");
    } catch (err: any) { toast.error(err.message || "Erro ao salvar"); }
    setSavingContacts(false);
  };

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleTrackRecharge = async (externalId: string, localRecarga?: Recarga) => {
    const lr = localRecarga || trackingStatus.localRecarga || null;
    setTrackingStatus({ loading: true, data: null, open: true, localRecarga: lr });
    try {
      const resp = await callApi("orders");
      if (resp?.success && resp.data) {
        const orders = Array.isArray(resp.data) ? resp.data : resp.data.data || [];
        const order = orders.find((o: any) => o._id === externalId);
        setTrackingStatus({ loading: false, data: order || { _id: externalId, status: "Não encontrado" }, open: true, localRecarga: lr });
      } else {
        setTrackingStatus({ loading: false, data: { _id: externalId, status: "Erro ao consultar" }, open: true, localRecarga: lr });
      }
    } catch {
      setTrackingStatus({ loading: false, data: { _id: externalId, status: "Erro ao consultar" }, open: true, localRecarga: lr });
    }
  };
  const fmtDate = (d: string) => formatDateTimeBR(d);

  const recargasHoje = recargas.filter((r) => toLocalDateKey(r.created_at) === getTodayLocalKey()).length;
  const userLabel = profileNome || user?.email?.split("@")[0] || "Revendedor";
  const userInitial = (userLabel[0] || "R").toUpperCase();

  type MenuItem = { key: PainelTab; label: string; icon: typeof Send; active?: boolean; dashed?: boolean };
  const menuItems: MenuItem[] = [
    { key: "recarga", label: "Nova Recarga", icon: Send, active: true },
    { key: "addSaldo", label: "Adicionar Saldo", icon: CreditCard, dashed: true },
    { key: "historico", label: "Histórico de Pedidos", icon: History },
    { key: "extrato", label: "Extrato de Depósitos", icon: Landmark },
    { key: "contatos", label: "Meu Perfil", icon: User },
    { key: "status", label: "Status do Sistema", icon: Activity },
  ];

  const tabTitle: Record<PainelTab, string> = {
    recarga: "Nova Recarga", addSaldo: "Adicionar Saldo", historico: "Histórico de Pedidos",
    extrato: "Extrato de Depósitos", contatos: "Meu Perfil", status: "Status do Sistema",
  };

  const selectTab = (nextTab: PainelTab) => { setTab(nextTab); setMenuOpen(false); setRecargaResult(null); };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
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

  const uploadAvatarFile = async (fileOrBlob: File | Blob) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const ext = fileOrBlob instanceof File ? (fileOrBlob.name.split(".").pop() || "jpg") : "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { data: existingFiles } = await supabase.storage.from("avatars").list(user.id);
      if (existingFiles?.length) {
        await supabase.storage.from("avatars").remove(existingFiles.map(f => `${user.id}/${f.name}`));
      }
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, fileOrBlob, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl + "?t=" + Date.now();
      await supabase.from("profiles").update({ avatar_url: publicUrl } as any).eq("id", user.id);
      setAvatarUrl(publicUrl);
      toast.success("Foto de perfil atualizada!");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar foto: " + (err.message || "tente novamente"));
    }
    setUploadingAvatar(false);
  };

  const [avatarError, setAvatarError] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);

  // Reset error when URL changes
  useEffect(() => { setAvatarError(false); }, [avatarUrl]);

  const AvatarDisplay = ({ size = "w-12 h-12", textSize = "text-base" }: { size?: string; textSize?: string }) => (
    avatarUrl && !avatarError ? (
      <img 
        src={avatarUrl} 
        alt="Avatar" 
        className={`${size} rounded-full object-cover shrink-0`} 
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={() => setAvatarError(true)}
      />
    ) : (
      <div className={`${size} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold ${textSize} shrink-0`}>
        {userInitial}
      </div>
    )
  );

  return (
    <div className="min-h-screen md:flex pb-8">
      {/* Mobile Menu Bottom Sheet */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[61] md:hidden rounded-t-2xl bg-card/95 backdrop-blur-xl shadow-[0_-8px_40px_rgba(0,0,0,0.5)] pb-[env(safe-area-inset-bottom)] border-t border-border/50">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="font-display text-lg font-bold text-foreground">Menu</h2>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="mx-4 mb-3 p-3 rounded-xl glass-card rgb-border">
              <div className="flex items-center gap-3">
                <AvatarDisplay />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.email}</p>
                  <p className="text-xs text-success font-medium">{loading ? <SkeletonValue width="w-14" className="h-3" /> : fmt(saldo)}</p>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="px-4 pb-3 grid grid-cols-3 gap-2">
              {menuItems.map((item) => {
                const isActive = tab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => selectTab(item.key)}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl active:scale-95 transition-all ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
                        : "bg-muted/30 text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <item.icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-[11px] font-semibold text-center leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>{item.label}</span>
                  </button>
                );
              })}

              {!isClientMode && (
                <a
                  href={profileSlug ? `/loja/${profileSlug}` : `/recarga?ref=${user?.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl bg-muted/30 text-foreground hover:bg-muted/50 active:scale-95 transition-all"
                >
                  <Store className="h-6 w-6 text-accent" />
                  <span className="text-[11px] font-semibold text-center leading-tight">Minha Loja</span>
                </a>
              )}

              {!isClientMode && (role === "admin" || role === "revendedor") && (
                <a
                  href="/admin"
                  className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl bg-muted/30 text-foreground hover:bg-muted/50 active:scale-95 transition-all"
                >
                  <Shield className="h-6 w-6 text-warning" />
                  <span className="text-[11px] font-semibold text-center leading-tight">Admin</span>
                </a>
              )}
            </div>

            {/* Sair */}
            <div className="px-4 pb-5 pt-1">
              <button
                onClick={signOut}
                className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/15 flex items-center justify-center gap-2 transition-all border border-destructive/15"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:sticky top-0 left-0 h-screen w-[280px] z-30 border-r border-border bg-card/95 backdrop-blur-xl">
        <div className="h-full flex flex-col relative">
          {/* Subtle gradient glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

          <div className="px-5 py-5 border-b border-border relative">
            <h1 className="font-display text-xl font-bold shimmer-letters">
              Recargas <span className="brasil-word">Brasil</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-primary/80 font-semibold mt-1.5">Revendedor</p>
          </div>

          <div className="p-4 space-y-3 border-b border-border relative">
            <div className="glass-card rounded-xl p-3.5 flex items-center gap-3 rgb-border">
              <AvatarDisplay />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate uppercase shimmer-letters">
                    {userLabel}
                  </p>
                  {role === "admin" && (
                    <svg className="h-4 w-4 text-primary flex-shrink-0 animate-[spin-wobble_3s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor" style={{ animationName: 'spin-wobble' }}>
                      <path d="M12 2L14.09 8.26L21 9.27L16.18 13.14L17.64 20.02L12 16.77L6.36 20.02L7.82 13.14L3 9.27L9.91 8.26L12 2Z" />
                      <path d="M9.5 12.5L11 14L14.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Seu saldo</p>
              <p className="text-2xl font-bold text-success mt-1">{loading ? <SkeletonValue width="w-24" className="h-7" /> : <AnimatedCounter value={saldo} prefix="R$&nbsp;" />}</p>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto flex-1 relative">
            {menuItems.map((item) => {
              const isActive = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => selectTab(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                    isActive
                      ? "nav-item-active"
                      : item.dashed
                      ? "text-success border border-dashed border-success/30 hover:bg-success/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : item.dashed ? "text-success" : ""}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-3 mt-3 border-t border-border">
              <a href="/chat"
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all group shadow-[0_0_12px_hsl(var(--primary)/0.08)]">
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                  <MessageCircle className="h-5 w-5 text-primary" />
                </motion.div>
                <span>Bate-papo</span>
                <ChevronRight className="h-4 w-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {!isClientMode && (role === "admin" || role === "revendedor") && (
              <div className="pt-3 mt-3 border-t border-border space-y-1">
                <div className="px-2 text-[10px] tracking-widest text-muted-foreground/60 uppercase font-semibold">Administração</div>
                <a href="/admin" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary/80 hover:text-primary hover:bg-primary/5 transition-colors">
                  <Shield className="h-4 w-4" /> <span>Painel Admin</span>
                </a>
                {role === "admin" && (
                  <a href="/principal" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-primary/80 hover:text-primary hover:bg-primary/5 transition-colors">
                    <Landmark className="h-4 w-4" /> <span>Painel Principal</span>
                  </a>
                )}
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-border space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <button onClick={signOut}
              className="w-full py-2.5 rounded-lg border border-destructive/25 text-destructive text-sm font-medium hover:bg-destructive/10 transition-all flex items-center justify-center gap-2 group">
              <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <div className="sticky top-0 z-[70]">
          <header className="glass-header px-4 md:px-6 py-4 flex items-center justify-between relative z-[100] overflow-visible">
            {/* Header gradient accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="flex items-center gap-3">
              <h2 className="font-display text-xl font-bold text-foreground">{tabTitle[tab]}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => selectTab("addSaldo")}
                className="h-9 px-4 rounded-xl bg-success text-success-foreground flex items-center gap-1.5 text-sm font-bold shadow-[0_0_16px_hsl(var(--success)/0.35)] hover:shadow-[0_0_24px_hsl(var(--success)/0.5)] hover:scale-105 active:scale-95 transition-all">
                <CreditCard className="h-4 w-4" />
                <span>{loading ? <SkeletonValue width="w-12" className="h-4" /> : <AnimatedCounter value={saldo} prefix="R$&nbsp;" />}</span>
              </button>
              <div className="relative z-[80]">
                <button onClick={() => setShowAvatarMenu(prev => !prev)} className="focus:outline-none">
                  <AvatarDisplay size="w-9 h-9" textSize="text-xs" />
                </button>
                <AnimatePresence>
                  {showAvatarMenu && (
                    <>
                      <div className="fixed inset-0 z-[89]" onClick={() => setShowAvatarMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="fixed right-4 md:right-6 top-[4.25rem] md:top-[4.5rem] z-[90] min-w-[160px] rounded-xl bg-card border border-border shadow-xl p-2"
                      >
                        <div className="px-3 py-2 border-b border-border mb-1">
                          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <button
                          onClick={() => { setShowAvatarMenu(false); signOut(); }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" /> Sair da conta
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>
          <RecargasTicker />
        </div>

        <main className="max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-5">
          {/* Stats - hidden on profile tab */}
          {tab !== "contatos" && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Smartphone, label: "Recargas Hoje", rawValue: recargasHoje, isCurrency: false, color: "text-primary", bgColor: "bg-primary/10", anim: "float" as const },
              { icon: Clock, label: "Total", rawValue: recargas.length, isCurrency: false, color: "text-accent", bgColor: "bg-accent/10", anim: "pulse" as const },
            ].map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }} className="kpi-card">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className={`w-10 h-10 rounded-xl ${c.bgColor} flex items-center justify-center icon-container`}>
                    <AnimatedIcon icon={c.icon} className={`h-5 w-5 ${c.color}`} animation={c.anim} delay={i * 0.12} />
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{c.label}</span>
                </div>
                <p className={`text-2xl md:text-3xl font-bold ${c.color} truncate`}>
                  {loading ? <SkeletonValue width="w-16" className="h-7" /> : c.isCurrency ? <AnimatedCounter value={c.rawValue} prefix="R$&nbsp;" /> : <AnimatedInt value={c.rawValue} />}
                </p>
              </motion.div>
            ))}
          </div>
          )}

          {/* Banners Promocionais */}
          {bannersList.filter(b => b.enabled && b.type !== "popup" && !dismissedBanners.has(b.position)).map(b => (
            <PromoBanner
              key={b.id}
              title={b.title || undefined}
              subtitle={b.subtitle || undefined}
              visible={true}
              link={b.link || undefined}
              onClose={() => setDismissedBanners(prev => new Set([...prev, b.position]))}
            />
          ))}

          {/* Popup Banners */}
          {bannersList.filter(b => b.enabled && b.type === "popup" && !dismissedBanners.has(b.position)).map(b => (
            <PopupBanner
              key={b.id}
              title={b.title || undefined}
              subtitle={b.subtitle || undefined}
              visible={true}
              link={b.link || undefined}
              onClose={() => setDismissedBanners(prev => new Set([...prev, b.position]))}
            />
          ))}

          {/* ===== TAB: RECARGA ===== */}
          {tab === "recarga" && (
            <>
              {/* Success/Error overlay */}
              <AnimatePresence>
                {recargaResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-modal rounded-2xl p-8 text-center"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${recargaResult.success ? "bg-warning/15" : "bg-destructive/15"}`}>
                      {recargaResult.success
                        ? <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          >
                            <Loader2 className="h-10 w-10 text-warning" />
                          </motion.div>
                        : <motion.div
                            animate={{ scale: [1, 1.15, 1, 1.1, 1], rotate: [0, -10, 10, -5, 0], opacity: [1, 0.7, 1] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                          >
                            <XCircle className="h-10 w-10 text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                          </motion.div>
                      }
                    </motion.div>
                    <h3 className={`font-display text-xl font-bold mb-2 ${recargaResult.success ? "text-warning" : "text-destructive"}`}>
                      {recargaResult.success ? "⏳ Processando Pedido..." : "Erro na Recarga"}
                    </h3>
                    <p className="text-muted-foreground mb-6">{recargaResult.message}</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {recargaResult.success && recargaResult.externalId && (
                        <button
                          onClick={() => handleTrackRecharge(recargaResult.externalId!)}
                          className="px-6 py-2.5 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="h-4 w-4" /> Acompanhar Recarga
                        </button>
                      )}
                      <button onClick={() => { setRecargaResult(null); setTrackingStatus({ loading: false, data: null, open: false, localRecarga: null }); }}
                        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
                        {recargaResult.success ? "Nova Recarga" : "Tentar Novamente"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tracking Modal */}
              <AnimatePresence>
                {trackingStatus.open && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-background/70 backdrop-blur-sm z-[70] flex items-center justify-center px-4"
                    onClick={() => setTrackingStatus(prev => ({ ...prev, open: false }))}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
                      className="glass-card rounded-2xl w-full max-w-md p-6"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                          <Activity className="h-5 w-5 text-primary" /> Acompanhamento
                        </h3>
                        <button onClick={() => setTrackingStatus(prev => ({ ...prev, open: false }))} className="p-1 rounded-md hover:bg-destructive/15 text-destructive">
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      {trackingStatus.loading ? (
                        <div className="flex flex-col items-center py-8 gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm text-muted-foreground">Consultando status...</p>
                        </div>
                      ) : trackingStatus.data ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <span className="text-xs text-muted-foreground">ID</span>
                            <span className="text-xs font-mono text-foreground">{trackingStatus.data._id || "—"}</span>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              trackingStatus.data.status === "feita" || trackingStatus.data.status === "completed"
                                ? "bg-success/15 text-success"
                                : trackingStatus.data.status === "pendente" || trackingStatus.data.status === "pending"
                                ? "bg-warning/15 text-warning"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {trackingStatus.data.status === "feita" || trackingStatus.data.status === "completed" ? "✅ Concluída"
                                : trackingStatus.data.status === "pendente" || trackingStatus.data.status === "pending" ? "⏳ Processando"
                                : trackingStatus.data.status === "falha" ? "❌ Falhou"
                                : trackingStatus.data.status}
                            </span>
                          </div>
                          {trackingStatus.data.phoneNumber && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <span className="text-xs text-muted-foreground">Telefone</span>
                              <span className="text-xs text-foreground">{trackingStatus.data.phoneNumber}</span>
                            </div>
                          )}
                          {trackingStatus.data.carrier?.name && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <span className="text-xs text-muted-foreground">Operadora</span>
                              <span className="text-xs text-foreground">{trackingStatus.data.carrier.name}</span>
                            </div>
                          )}
                          {/* Show local recarga data with valor, custo and lucro */}
                          {trackingStatus.localRecarga ? (
                            <>
                              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                <span className="text-xs text-muted-foreground">Valor da Recarga</span>
                                <span className="text-xs font-bold text-foreground">{fmt(safeValor(trackingStatus.localRecarga))}</span>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                                <span className="text-xs text-muted-foreground">Custo (debitado)</span>
                                <span className="text-xs font-bold text-foreground">{fmt(trackingStatus.localRecarga.custo)}</span>
                              </div>
                            </>
                          ) : trackingStatus.data.value ? (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <span className="text-xs text-muted-foreground">Valor</span>
                              <span className="text-xs font-bold text-foreground">{fmt(Number(trackingStatus.data.value.cost || trackingStatus.data.value.value || 0))}</span>
                            </div>
                          ) : null}
                          {trackingStatus.data.createdAt && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <span className="text-xs text-muted-foreground">Criado em</span>
                              <span className="text-xs text-foreground">{fmtDate(trackingStatus.data.createdAt)}</span>
                            </div>
                          )}
                          <button
                            onClick={() => handleTrackRecharge(trackingStatus.data._id)}
                            className="w-full mt-2 px-4 py-2.5 rounded-xl border border-primary text-primary font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="h-4 w-4" /> Atualizar Status
                          </button>
                        </div>
                      ) : null}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!recargaResult && (
                <>
                  <div className="flex justify-end">
                    <button onClick={() => setShowValoresModal(true)}
                      className="px-4 py-2 rounded-lg glass-card text-primary text-sm font-semibold hover:bg-primary/10 transition-colors">
                      ☰ Ver Tabela de Valores
                    </button>
                  </div>

                  {/* Modal Tabela de Valores (from API catalog) */}
                  <AnimatePresence>
                    {showValoresModal && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/70 backdrop-blur-sm z-[70] flex items-start justify-center pt-8 md:pt-16 px-4"
                        onClick={() => setShowValoresModal(false)}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
                          className="glass-card rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 md:p-6"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                            <h3 className="font-display text-lg font-bold text-foreground">Valores e Operadoras Disponíveis</h3>
                            <button onClick={() => setShowValoresModal(false)} className="p-1 rounded-md hover:bg-destructive/15 text-destructive">
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          {catalogLoading ? (
                            <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
                          ) : (
                            <div className="space-y-5">
                              {catalog.map((carrier) => {
                                if (carrier.values.length === 0) return null;
                                return (
                                  <div key={carrier.carrierId}>
                                    <h4 className="font-bold text-foreground text-base mb-2">{carrier.name}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {carrier.values.sort((a, b) => a.value - b.value).map((val) => (
                                        <button
                                          key={val.valueId}
                                          type="button"
                                          onClick={() => {
                                            setSelectedCarrier(carrier);
                                            setSelectedValue(val);
                                            setShowValoresModal(false);
                                          }}
                                          className="glass rounded-xl p-3 border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
                                        >
                                          <p className="text-foreground font-bold text-base">{fmt(val.value)}</p>
                                          <p className="text-primary text-xs font-medium mt-0.5">Paga {fmt(val.cost)}</p>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                              {catalog.length === 0 && (
                                <p className="text-muted-foreground text-center py-6">Nenhuma operadora disponível</p>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-2xl p-6 md:p-10 relative overflow-hidden"
                  >
                    {/* Subtle glow accent behind the card */}
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                    <div className="text-center mb-8 relative">
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} 
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4 ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                      >
                        <motion.div
                          animate={{ y: [0, -4, 0], scale: [1, 1.08, 1] }}
                          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        >
                          <Smartphone className="h-9 w-9" />
                        </motion.div>
                      </motion.div>
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">Qual o número?</h3>
                      <p className="text-muted-foreground mt-1">Digite o DDD + Número do celular</p>
                    </div>

                    {/* Clipboard phone suggestion */}
                    {clipboardPhone && telefone.length === 0 && (
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        onClick={() => { setTelefone(formatPhoneDisplay(clipboardPhone)); setClipboardPhone(null); }}
                        className="w-full flex items-center justify-between rounded-xl px-4 py-3 mb-2 bg-primary/10 border border-primary/25 hover:bg-primary/15 transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                          <Copy className="w-4 h-4 text-primary" />
                          <div className="text-left">
                            <p className="text-xs font-medium text-primary">Número detectado na área de transferência</p>
                            <p className="text-base font-mono font-bold text-foreground">{formatPhoneDisplay(clipboardPhone)}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary text-primary-foreground">Colar</span>
                      </motion.button>
                    )}

                    <form onSubmit={handleRecarga} className="space-y-5 max-w-xl mx-auto relative">
                      {/* Telefone + check */}
                      <div>
                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <input type="tel" value={telefone}
                            onChange={(e) => {
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
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 11);
                              setTelefone(formatPhoneDisplay(digits));
                              setPhoneCheckResult(null);
                            }}
                            required maxLength={16}
                            className="flex-1 min-w-0 px-5 py-4 rounded-xl glass-input text-foreground placeholder:text-muted-foreground/60 text-xl tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono transition-all"
                            placeholder="(00) 00000-0000" />
                        </div>
                      </div>

                      {/* Operadora */}
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1.5">Operadora</label>
                        <select
                          value={selectedCarrier?.carrierId || ""}
                          onChange={(e) => {
                            const c = catalog.find((c) => c.carrierId === e.target.value);
                            setSelectedCarrier(c || null);
                          }}
                          className="w-full px-5 py-3.5 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all appearance-none bg-[length:16px] bg-[right_16px_center] bg-no-repeat"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2388888888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7 15 5 5 5-5'/%3E%3Cpath d='m7 9 5-5 5 5'/%3E%3C/svg%3E")` }}
                        >
                          <option value="">Selecione...</option>
                          {catalog.map((c) => <option key={c.carrierId} value={c.carrierId}>{c.name}</option>)}
                        </select>

                        {/* Check cooldown/blacklist hint - appears after selecting operator */}
                        {selectedCarrier && telefone.replace(/\D/g, "").length >= 10 && !phoneCheckResult && (
                          <motion.div initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-xl bg-warning/10 border border-warning/25 flex items-center gap-3">
                            <AlertTriangle className="h-4 w-4 text-warning shrink-0" />
                            <p className="text-sm text-warning font-medium flex-1">Verifique se o número está com blacklist ou cooldown ativo antes de recarregar.</p>
                            <button type="button" onClick={handleCheckPhone} disabled={checkingPhone}
                              className="px-4 py-2 rounded-lg text-sm font-bold bg-warning/20 text-warning hover:bg-warning/30 border border-warning/30 transition-all shrink-0">
                              {checkingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                            </button>
                          </motion.div>
                        )}

                        {/* Check result display */}
                        {phoneCheckResult && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className={`mt-2 p-3 rounded-xl text-sm font-medium flex items-start gap-2 ${
                              phoneCheckResult.status === "CLEAR" ? "bg-success/10 text-success border border-success/20" :
                              phoneCheckResult.status === "COOLDOWN" ? "bg-warning/10 text-warning border border-warning/20" :
                              "bg-destructive/10 text-destructive border border-destructive/20"
                            }`}>
                            <span className="mt-0.5 shrink-0">
                            {phoneCheckResult.status === "CLEAR" ? <CheckCircle2 className="h-4 w-4" /> :
                             phoneCheckResult.status === "COOLDOWN" ? <Clock className="h-4 w-4" /> :
                             <AlertTriangle className="h-4 w-4" />}
                            </span>
                            <span className="whitespace-pre-line">{phoneCheckResult.message}</span>
                          </motion.div>
                        )}
                      </div>

                      {/* Extra field (ex: CPF) */}
                      {selectedCarrier?.extraField?.required && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.2 }}>
                          <label className="block text-sm font-semibold text-foreground mb-1.5">{selectedCarrier.extraField.title} *</label>
                          <input type="text" value={extraData} onChange={(e) => setExtraData(e.target.value)} required
                            className="w-full px-5 py-3.5 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                            placeholder={selectedCarrier.extraField.title} />
                        </motion.div>
                      )}

                      {/* Valores */}
                      {selectedCarrier && selectedCarrier.values.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <label className="block text-sm font-semibold text-foreground mb-2">Valor</label>
                          <div className="grid grid-cols-3 gap-2.5">
                            {selectedCarrier.values.sort((a, b) => a.value - b.value).map((val, i) => (
                              <motion.button key={val.valueId} type="button" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                                whileTap={{ scale: 0.93 }} onClick={() => setSelectedValue(val)}
                                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${selectedValue?.valueId === val.valueId
                                  ? "bg-primary text-primary-foreground border-primary glow-primary shadow-lg shadow-primary/20" : "border-border text-foreground hover:border-primary/30 hover:bg-primary/5 glass"}`}>
                                <div className="text-base">{fmt(val.value)}</div>
                                {val.label && val.label !== `R$ ${val.cost}` ? (
                                  <div className="text-[10px] font-medium opacity-70 mt-0.5 truncate">{val.label}</div>
                                ) : (
                                  <div className="text-[10px] font-medium opacity-70 mt-0.5">Paga {fmt(val.cost)}</div>
                                )}
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Selected summary */}
                      {selectedValue && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="glass-card rounded-xl p-4 text-center border-primary/20">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">Resumo da Recarga</p>
                          <p className="text-lg font-bold text-foreground mt-1">{selectedCarrier?.name} — {fmt(selectedValue.value)}</p>
                          <p className="text-sm text-primary font-semibold">Custo: {fmt(selectedValue.cost)}</p>
                          {selectedValue.cost > saldo && (
                            <p className="text-xs text-destructive mt-1.5 font-semibold">⚠️ Saldo insuficiente</p>
                          )}
                        </motion.div>
                      )}

                      <motion.button type="submit" disabled={sending || !selectedValue || !selectedCarrier || selectedValue.cost > saldo || (phoneCheckResult?.status === "BLACKLISTED")}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2.5">
                        {sending ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                          : <><Send className="h-5 w-5" /> Enviar Recarga →</>}
                      </motion.button>
                    </form>

                    {/* Pending recharge warning modal */}
                    <AnimatePresence>
                      {pendingWarning && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                          onClick={() => setPendingWarning(null)}
                        >
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 text-center"
                          >
                            <div className="w-14 h-14 rounded-full bg-warning/15 border border-warning/30 flex items-center justify-center mx-auto mb-4">
                              <AlertTriangle className="h-7 w-7 text-warning" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground mb-2">Recarga em Processamento</h3>
                            <p className="text-sm text-muted-foreground mb-5">
                              Já existe <strong className="text-foreground">{pendingWarning.count} recarga{pendingWarning.count > 1 ? "s" : ""}</strong> em processamento para o número <strong className="text-foreground">{pendingWarning.phone}</strong>. Deseja continuar mesmo assim?
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setPendingWarning(null)}
                                className="flex-1 py-3 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-colors"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => {
                                  setPendingWarning(null);
                                  handleRecarga({ preventDefault: () => {} } as React.FormEvent, true);
                                }}
                                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
                              >
                                Continuar
                              </button>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Últimas Recargas */}
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <h3 className="font-display text-xl font-bold text-foreground">Últimas Recargas</h3>
                      <button onClick={() => selectTab("historico")} className="text-primary font-semibold text-sm hover:opacity-80">Ver todas</button>
                    </div>
                    <div>
                      {recargas.slice(0, 5).length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground">Nenhuma recarga ainda</p>
                      ) : recargas.slice(0, 5).map((r, i) => (
                        <motion.div key={r.id}
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07, duration: 0.3 }}
                          onClick={() => (r.status === "completed" || r.status === "concluida") ? setReceiptRecarga(r) : null}
                          className={`px-5 py-4 border-b border-border last:border-0 flex items-center gap-3 transition-colors ${(r.status === "completed" || r.status === "concluida") ? "hover:bg-muted/20 cursor-pointer active:bg-muted/30" : "hover:bg-muted/20"}`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                            (r.status === "completed" || r.status === "concluida") ? "bg-success/15" : r.status === "pending" ? "bg-warning/15" : r.status === "falha" ? "bg-destructive/15" : "bg-muted/50"
                          }`}>
                            {(r.status === "completed" || r.status === "concluida") ? (
                              <AnimatedCheck size={24} className="text-success" />
                            ) : r.status === "pending" ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                <Loader2 className="h-6 w-6 text-warning" />
                              </motion.div>
                            ) : r.status === "falha" ? (
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.15, 1, 1.1, 1],
                                  rotate: [0, -10, 10, -5, 0],
                                  opacity: [1, 0.7, 1]
                                }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                              >
                                <XCircle className="h-6 w-6 text-destructive drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                              </motion.div>
                            ) : (
                              <Smartphone className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`}>{r.operadora || "Operadora"}</span>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{r.telefone}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{fmtDate(r.created_at)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-foreground">{fmt(safeValor(r))}</p>
                            <span className={`text-xs font-medium ${(r.status === "completed" || r.status === "concluida") ? "text-success" : r.status === "pending" ? "text-warning" : r.status === "falha" ? "text-destructive" : "text-muted-foreground"}`}>
                              {(r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Processando" : r.status === "falha" ? "Falha" : r.status}
                            </span>
                            {(r.status === "completed" || r.status === "concluida") && (
                              <div className="mt-1">
                                <span className="text-[10px] text-primary/70 font-medium">📄 Ver comprovante</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ===== TAB: ADICIONAR SALDO ===== */}
          {tab === "addSaldo" && <AddSaldoSection saldo={saldo} fmt={fmt} fmtDate={fmtDate} transactions={transactions} userEmail={user?.email} userName={userLabel} onDeposited={fetchData} fetchTransactions={fetchTransactions} resellerId={resellerId} saldoTipo={(role === "admin" || role === "revendedor") && !isClientMode ? "pessoal" : "revenda"} />}

          {/* ===== TAB: HISTORICO ===== */}
          {tab === "historico" && (
            <>
              {/* Filters */}
              {(() => {
                const operadoras = Array.from(new Set(recargas.map(r => r.operadora).filter(Boolean))) as string[];
                const filtered = recargas.filter(r => {
                  if (histStatus !== "all") {
                    if (histStatus === "completed" && r.status !== "completed" && r.status !== "concluida") return false;
                    if (histStatus === "pending" && r.status !== "pending") return false;
                    if (histStatus === "falha" && r.status !== "falha") return false;
                  }
                  if (histOperadora !== "all" && r.operadora !== histOperadora) return false;
                  if (histSearch && !r.telefone.includes(histSearch.replace(/\D/g, ""))) return false;
                  return true;
                });

                return (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3 mb-1">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Buscar por telefone..."
                          value={histSearch}
                          onChange={e => setHistSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <select
                        value={histStatus}
                        onChange={e => setHistStatus(e.target.value as any)}
                        className="px-3 py-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="all">Todos os status</option>
                        <option value="completed">Concluída</option>
                        <option value="pending">Processando</option>
                        <option value="falha">Falha</option>
                      </select>
                      <select
                        value={histOperadora}
                        onChange={e => setHistOperadora(e.target.value)}
                        className="px-3 py-2.5 rounded-xl bg-muted/40 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="all">Todas operadoras</option>
                        {operadoras.map(op => <option key={op} value={op}>{op}</option>)}
                      </select>
                    </div>

                    {histSearch || histStatus !== "all" || histOperadora !== "all" ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Filter className="h-3.5 w-3.5" />
                        <span>{filtered.length} de {recargas.length} resultados</span>
                        <button onClick={() => { setHistSearch(""); setHistStatus("all"); setHistOperadora("all"); }}
                          className="ml-auto text-primary hover:underline text-xs">Limpar filtros</button>
                      </div>
                    ) : null}

                    {/* Mobile cards */}
                    <div className="md:hidden space-y-2">
                      {filtered.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">Nenhuma recarga encontrada</p>
                      ) : (() => {
                        let lastDate = "";
                        return filtered.map((r, i) => {
                          const dateLabel = formatDateLongUpperBR(r.created_at);
                          const showSep = dateLabel !== lastDate;
                          lastDate = dateLabel;
                          const statusLabel = (r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Processando" : r.status === "falha" ? "Falha" : r.status;
                          const statusClass = (r.status === "completed" || r.status === "concluida") ? "bg-success/15 text-success" : r.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                          return (
                            <div key={r.id}>
                              {showSep && (
                                <div className="flex justify-center my-2">
                                  <span className="text-[10px] bg-muted/60 text-muted-foreground px-3 py-0.5 rounded-full font-medium">{dateLabel}</span>
                                </div>
                              )}
                              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="glass-card rounded-xl p-4 cursor-pointer hover:bg-muted/30 active:scale-[0.98] transition-all"
                                onClick={() => setSelectedRecarga(r)}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                      (r.status === "completed" || r.status === "concluida") ? "bg-success/15" : r.status === "pending" ? "bg-warning/15" : r.status === "falha" ? "bg-destructive/15" : "bg-muted/50"
                                    }`}>
                                      {(r.status === "completed" || r.status === "concluida") ? (
                                        <AnimatedCheck size={28} className="text-success" />
                                      ) : r.status === "pending" ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                                          <Loader2 className="h-7 w-7 text-warning" />
                                        </motion.div>
                                      ) : r.status === "falha" ? (
                                        <motion.div animate={{ scale: [1, 1.15, 1, 1.1, 1], rotate: [0, -10, 10, -5, 0], opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
                                          <XCircle className="h-7 w-7 text-destructive drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                                        </motion.div>
                                      ) : (
                                        <Smartphone className="h-6 w-6 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div>
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`}>{r.operadora || "Operadora"}</span>
                                      <p className="text-xs text-muted-foreground font-mono">{r.telefone}</p>
                                    </div>
                                  </div>
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                  <span className="text-xs text-muted-foreground">{fmtDate(r.created_at)}</span>
                                  <div className="flex items-center gap-2">
                                    {(r.status === "completed" || r.status === "concluida") && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); setReceiptRecarga(r); }}
                                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 text-success text-[10px] font-semibold hover:bg-success/20 transition-colors"
                                      >
                                        <FileText className="h-3 w-3" /> Comprovante
                                      </button>
                                    )}
                                    <span className="font-bold font-mono text-foreground">{fmt(safeValor(r))}</span>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    {/* Desktop table */}
                    <div className="hidden md:block glass-card rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Telefone</th>
                            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Operadora</th>
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma recarga encontrada</td></tr>
                          ) : filtered.map((r, i) => (
                            <motion.tr key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => setSelectedRecarga(r)}>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(r.created_at)}</td>
                              <td className="px-4 py-3 font-mono text-foreground">{r.telefone}</td>
                              <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`}>{r.operadora || "—"}</span></td>
                              <td className="px-4 py-3 text-right font-mono font-medium text-foreground">{fmt(safeValor(r))}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  (r.status === "completed" || r.status === "concluida") ? "bg-success/15 text-success" : r.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                                  {(r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Processando" : r.status}
                                </span>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </>
          )}

          {/* Recarga Detail Modal */}
          <AnimatePresence>
            {selectedRecarga && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
                onClick={() => setSelectedRecarga(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                >
                  {(() => {
                    const r = selectedRecarga;
                    const isCompleted = r.status === "completed" || r.status === "concluida";
                    const isPending = r.status === "pending";
                    const statusLabel = isCompleted ? "Concluída" : isPending ? "Processando" : r.status === "falha" ? "Falha" : r.status;
                    const statusClass = isCompleted ? "bg-success/15 text-success border-success/30" : isPending ? "bg-warning/15 text-warning border-warning/30" : "bg-destructive/15 text-destructive border-destructive/30";
                    const statusIcon = isCompleted ? <CheckCircle2 className="h-8 w-8 text-success" /> : isPending ? <Clock className="h-8 w-8 text-warning" /> : <motion.div animate={{ scale: [1, 1.15, 1, 1.1, 1], rotate: [0, -10, 10, -5, 0], opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}><XCircle className="h-8 w-8 text-destructive drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" /></motion.div>;
                    return (
                      <>
                        <div className="px-6 pt-6 pb-4 text-center">
                          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                            {statusIcon}
                          </div>
                          <h3 className="text-lg font-bold text-foreground mb-1">Detalhes do Pedido</h3>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusClass}`}>{statusLabel}</span>
                        </div>
                        <div className="px-6 pb-5 space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Telefone</span>
                            <span className="text-sm font-mono font-semibold text-foreground">{r.telefone}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Operadora</span>
                            <span className={`text-sm font-bold px-2.5 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`}>{r.operadora || "—"}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Valor da Recarga</span>
                            <span className="text-sm font-mono font-bold text-foreground">{fmt(safeValor(r))}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Custo (debitado)</span>
                            <span className="text-sm font-mono font-semibold text-foreground">{fmt(r.custo)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-border">
                            <span className="text-sm text-muted-foreground">Data</span>
                            <span className="text-sm text-foreground">{fmtDate(r.created_at)}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-muted-foreground">ID</span>
                            <span className="text-[10px] font-mono text-muted-foreground/70 max-w-[160px] truncate">{r.id}</span>
                          </div>
                        </div>
                        <div className="px-6 pb-5 flex gap-3">
                          {isCompleted && (
                            <button
                              onClick={() => { setSelectedRecarga(null); setReceiptRecarga(r); }}
                              className="flex-1 py-3 rounded-xl border border-success text-success font-semibold text-sm hover:bg-success/10 transition-all flex items-center justify-center gap-2"
                            >
                              <FileText className="h-4 w-4" /> Comprovante
                            </button>
                          )}
                          {r.external_id && (
                            <button
                              onClick={() => { setSelectedRecarga(null); handleTrackRecharge(r.external_id!, r); }}
                              className="flex-1 py-3 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/10 transition-all flex items-center justify-center gap-2"
                            >
                              <Activity className="h-4 w-4" /> Acompanhar
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedRecarga(null)}
                            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all"
                          >
                            Fechar
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {receiptRecarga && (
            <RecargaReceipt
              recarga={receiptRecarga}
              open={!!receiptRecarga}
              onClose={() => setReceiptRecarga(null)}
              storeName={profileNome || "Recargas Brasil"}
              userId={user?.id}
            />
          )}
          {tab === "extrato" && (
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {transLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
                ) : transactions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada</p>
                ) : (() => {
                  let lastDate = "";
                  return transactions.map((t, i) => {
                    const dateLabel = formatDateLongUpperBR(t.created_at);
                    const showSep = dateLabel !== lastDate;
                    lastDate = dateLabel;
                    const isDeposit = t.type === "deposit" || t.type === "deposito";
                    const statusLabel = (t.status === "completed" || t.status === "confirmado") ? "Confirmado" : t.status === "pending" ? "Processando" : t.status;
                    const statusClass = (t.status === "completed" || t.status === "confirmado") ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                    return (
                      <div key={t.id}>
                        {showSep && (
                          <div className="flex justify-center my-2">
                            <span className="text-[10px] bg-muted/60 text-muted-foreground px-3 py-0.5 rounded-full font-medium">{dateLabel}</span>
                          </div>
                        )}
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                          className="glass-card rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-semibold text-foreground text-sm capitalize">{isDeposit ? "Depósito" : t.type}</p>
                              <p className="text-xs text-muted-foreground">PIX</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <span className="text-xs text-muted-foreground">{fmtDate(t.created_at)}</span>
                            <span className={`font-bold font-mono ${isDeposit ? "text-success" : "text-foreground"}`}>
                              {isDeposit ? "+" : "-"}{fmt(t.amount)}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    );
                  });
                })()}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block glass-card rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Módulo</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transLoading ? (
                      <tr><td colSpan={5} className="py-4"><div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div></td></tr>
                    ) : transactions.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada</td></tr>
                    ) : transactions.map((t, i) => (
                      <motion.tr key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(t.created_at)}</td>
                        <td className="px-4 py-3 text-foreground capitalize">{(t.type === "deposit" || t.type === "deposito") ? "Depósito" : t.type === "withdrawal" ? "Saque" : t.type}</td>
                        <td className="px-4 py-3 text-foreground">PIX</td>
                        <td className={`px-4 py-3 text-right font-mono font-medium ${(t.type === "deposit" || t.type === "deposito") ? "text-success" : "text-foreground"}`}>
                          {(t.type === "deposit" || t.type === "deposito") ? "+" : "-"}{fmt(t.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            (t.status === "completed" || t.status === "confirmado") ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                            {(t.status === "completed" || t.status === "confirmado") ? "Confirmado" : t.status === "pending" ? "Processando" : t.status === "expired" ? "Expirado" : t.status === "failed" ? "Falhou" : t.status === "cancelled" ? "Cancelado" : t.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== TAB: CONTATOS (Minha Conta) — Instagram-style ===== */}
          {tab === "contatos" && (
            <ProfileTab
              user={user}
              role={role}
              avatarUrl={avatarUrl}
              avatarError={avatarError}
              setAvatarError={setAvatarError}
              userLabel={userLabel}
              userInitial={userInitial}
              profileNome={profileNome}
              setProfileNome={setProfileNome}
              saldo={saldo}
              loading={loading}
              fmt={fmt}
              telegramLinked={telegramLinked}
              telegramUsername={telegramUsername}
              whatsappNumber={whatsappNumber}
              uploadingAvatar={uploadingAvatar}
              handleAvatarUpload={handleAvatarUpload}
              recargas={recargas}
              recargasHoje={recargasHoje}
              totalRecargas={recargas.length}
              selectTab={selectTab}
              navigate={navigate}
            />
          )}


          {/* ===== TAB: STATUS ===== */}
          {tab === "status" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Header */}
              <div>
                <h2 className="text-lg font-bold text-foreground">Status do Sistema</h2>
                <p className="text-xs text-muted-foreground">Tempo médio de processamento das recargas por operadora.</p>
              </div>

              {/* Operator timing cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(statusData?.operatorStats || []).map((op, i) => {
                  const fmtTime = (s: number) => {
                    if (!s || s <= 0) return "—";
                    const mins = Math.floor(s / 60);
                    const secs = Math.round(s % 60);
                    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
                  };
                  const opName = op.operadora.toUpperCase();
                  const opColor = opName === "CLARO" ? "text-red-400" : opName === "TIM" ? "text-blue-400" : opName === "VIVO" ? "text-purple-400" : "text-muted-foreground";
                  const avgColor = op.avgRecent <= 120 ? "text-emerald-400" : op.avgRecent <= 300 ? "text-yellow-400" : "text-red-400";
                  return (
                    <motion.div key={op.operadora} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="glass-card rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                          <motion.div
                            animate={
                              opName === "CLARO" ? { scale: [1, 1.15, 1] } :
                              opName === "TIM"   ? { y: [0, -3, 0] } :
                                                   { rotate: [0, 8, -8, 0] }
                            }
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: i * 0.15 }}
                          >
                            <Smartphone className={`h-5 w-5 ${opColor}`} />
                          </motion.div>
                        </div>
                        <div>
                          <p className={`font-bold text-base ${opColor}`}>{op.operadora}</p>
                          <p className="text-[10px] text-muted-foreground">Baseado nas últimas {op.recentCount} recargas</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Média Atual (Recente)</p>
                        <p className={`text-2xl font-black ${avgColor}`}>{fmtTime(op.avgRecent)}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/30">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Mínimo (24h)</p>
                          <p className="text-sm font-semibold text-foreground">{fmtTime(op.min24h)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Média (24h)</p>
                          <p className="text-sm font-semibold text-foreground">{fmtTime(op.avg24h)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase">Máximo (24h)</p>
                          <p className="text-sm font-semibold text-foreground">{fmtTime(op.max24h)}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* System health indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                  { icon: Server, label: "Servidor", status: true, anim: "pulse" as const },
                  { icon: Database, label: "Banco", status: statusData?.dbOnline ?? false, anim: "float" as const },
                  { icon: Shield, label: "Auth", status: statusData?.authOnline ?? false, anim: "wiggle" as const },
                  { icon: Wifi, label: "API", status: catalog.length > 0, anim: "bounce" as const },
                ].map((item, i) => (
                  <div key={item.label} className="glass-card rounded-xl p-3 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.status ? "bg-success animate-pulse" : "bg-destructive"}`} />
                    <AnimatedIcon icon={item.icon} className={`h-4 w-4 ${item.status ? "text-success" : "text-destructive"}`} animation={item.anim} delay={i * 0.1} />
                    <span className="text-xs font-medium text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>

              {statusData && (
                <div className="glass-card rounded-xl p-4 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Operadoras</p>
                    <p className="text-xl font-bold text-foreground">{catalog.length || statusData.operadorasCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total recargas</p>
                    <p className="text-xl font-bold text-foreground">{statusData.recargasTotal}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Última</p>
                    <p className="text-xs font-medium text-foreground">{statusData.lastRecarga ? fmtDate(statusData.lastRecarga) : "—"}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Floating Poll */}
      <FloatingPoll />

      {/* Image Cropper Modal */}
      {cropFile && (
        <ImageCropper
          file={cropFile}
          onCrop={async (blob) => {
            setCropFile(null);
            await uploadAvatarFile(blob);
          }}
          onCancel={() => setCropFile(null)}
        />
      )}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        items={[
          { key: "recarga", label: "Recarga", icon: Send, color: "text-primary", animation: "bounce" },
          { key: "historico", label: "Pedidos", icon: History, color: "text-warning", animation: "wiggle" },
          { key: "addSaldo", label: "Saldo", icon: CreditCard, color: "text-success", animation: "pulse", highlighted: true },
          { key: "chat", label: "Bate-papo", icon: MessageCircle, color: "text-primary", animation: "float" },
          { key: "contatos", label: "Perfil", icon: User, color: "text-accent", animation: "float" },
          { key: "extrato", label: "Extrato", icon: Landmark, color: "text-success", animation: "bounce" },
          { key: "status", label: "Status", icon: Activity, color: "text-warning", animation: "pulse" },
        ] as NavItem[]}
        activeKey={tab}
        onSelect={(key) => {
          if (key === "chat") { navigate("/chat"); return; }
          selectTab(key as PainelTab);
        }}
        mainCount={4}
        userLabel={user?.email || userLabel}
        userRole={role === "admin" ? "Administrador" : role === "revendedor" ? "Revendedor" : role === "cliente" ? "Cliente" : "Usuário"}
        userAvatarUrl={avatarUrl}
        onSignOut={signOut}
        panelLinks={[
          ...(!isClientMode && (role === "admin" || role === "revendedor") ? [{ label: "Painel Admin", path: "/admin", icon: Shield, color: "text-primary" }] : []),
          ...(role === "admin" ? [{ label: "Principal", path: "/principal", icon: Landmark, color: "text-success" }] : []),
        ]}
      />
    </div>
  );
}

// ===== ADD SALDO SECTION =====
function AddSaldoSection({ saldo, fmt, fmtDate, transactions, userEmail, userName, onDeposited, fetchTransactions, resellerId, saldoTipo }: {
  saldo: number;
  fmt: (v: number) => string;
  fmtDate: (d: string) => string;
  transactions: { id: string; amount: number; type: string; status: string; created_at: string; module: string | null }[];
  userEmail?: string;
  userName?: string;
  onDeposited: () => void;
  fetchTransactions: () => void;
  resellerId?: string;
  saldoTipo?: string;
}) {
  const pix = usePixDeposit({
    userEmail,
    userName,
    resellerId,
    saldoTipo,
    pollInterval: 3000,
    onConfirmed: () => { onDeposited(); fetchTransactions(); },
  });

  const {
    depositAmount, setDepositAmount, generating, pixData, pixError,
    copied, checking, paymentConfirmed, confirmedAmount, pollCount,
    presetAmounts, generatePix: handleGeneratePix, copyCode: handleCopyCode,
    checkStatus: handleCheckStatus, reset: handleNewPix,
  } = pix;

  const DEPOSIT_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  const depositTxs = transactions.filter(t => t.type === "deposit").map(t => {
    if (t.status === "pending" && (Date.now() - new Date(t.created_at).getTime()) > DEPOSIT_EXPIRY_MS) {
      return { ...t, status: "expired" };
    }
    return t;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      {/* Saldo Atual */}
      <div className="glass-card rounded-2xl p-5 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Saldo atual</p>
        <p className="text-3xl font-bold text-success mt-1">{fmt(saldo)}</p>
      </div>

      {/* Payment Confirmed Screen */}
      {paymentConfirmed ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 text-center space-y-4">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="font-display text-2xl font-bold text-foreground">Pagamento Confirmado!</h3>
            <p className="text-muted-foreground mt-1">Seu depósito foi processado com sucesso</p>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-success">+{fmt(confirmedAmount)}</motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground">Crédito adicionado ao seu saldo</motion.p>
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            onClick={handleNewPix}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all">
            Fazer Novo Depósito
          </motion.button>
        </motion.div>
      ) : !pixData ? (
        /* Formulário de depósito */
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-3">
              <QrCode className="h-8 w-8 text-success" />
            </motion.div>
            <h3 className="font-display text-xl font-bold text-foreground">Depositar via PIX</h3>
            <p className="text-sm text-muted-foreground mt-1">Selecione ou digite o valor para gerar o QR Code</p>
          </div>

          {/* Preset amounts */}
          <div className="grid grid-cols-3 gap-2">
            {presetAmounts.map(v => (
              <button key={v} onClick={() => setDepositAmount(String(v))}
                disabled={generating}
                className={`py-3 rounded-xl border font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 ${
                  depositAmount === String(v)
                    ? "border-success bg-success/15 text-success"
                    : "border-border bg-muted/20 hover:bg-success/10 hover:border-success/30 text-foreground"
                }`}>
                {fmt(v)}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">R$</span>
            <input
              type="text"
              inputMode="decimal"
              value={depositAmount}
              onChange={e => {
                const raw = e.target.value.replace(/[^0-9,.]/g, "");
                setDepositAmount(raw);
              }}
              placeholder="Outro valor (mín. R$ 10)"
              min={10}
              className="w-full pl-10 pr-3 py-3 rounded-xl glass-input text-foreground font-bold text-lg focus:outline-none focus:ring-2 focus:ring-success/50 border border-border"
            />
            {depositAmount && parseFloat(depositAmount.replace(",", ".")) > 0 && parseFloat(depositAmount.replace(",", ".")) < 10 && (
              <p className="text-xs text-destructive mt-1">Valor mínimo: R$ 10,00</p>
            )}
          </div>

          {/* Generate button - full width below */}
          <button
            onClick={() => handleGeneratePix()}
            disabled={generating || !depositAmount || parseFloat(depositAmount.replace(",", ".")) < 10}
            className="w-full py-3.5 rounded-xl bg-success text-success-foreground font-bold text-base flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_16px_hsl(var(--success)/0.3)]">
            {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5" />}
            Gerar PIX
          </button>

          {pixError && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{pixError}</span>
            </motion.div>
          )}
        </div>
      ) : (
        /* QR Code / PIX result */
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="glass-card rounded-2xl p-6 space-y-5">
          <div className="text-center">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.1 }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <CheckCircle2 className="h-8 w-8 text-success" />
              </motion.div>
            </motion.div>
            <motion.h3
              className="font-display text-lg font-bold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              PIX Gerado com Sucesso!
            </motion.h3>
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Escaneie o QR Code ou copie o código abaixo
            </motion.p>
            <motion.p
              className="text-2xl font-bold text-success mt-2"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.4 }}
            >
              {fmt(pixData.amount)}
            </motion.p>
            <motion.p
              className="text-xs text-muted-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              via Pix
            </motion.p>
          </div>

          {/* QR Code - Gerado localmente a partir do copia-e-cola */}
          {pixData.qr_code && (
            <motion.div
              className="flex justify-center relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{ boxShadow: ["0 0 0px hsl(var(--success) / 0)", "0 0 24px hsl(var(--success) / 0.25)", "0 0 0px hsl(var(--success) / 0)"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <BrandedQRCode value={pixData.qr_code} />
            </motion.div>
          )}

          {/* Copy PIX code */}
          {pixData.qr_code && (
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Código PIX Copia e Cola</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={pixData.qr_code}
                  className="flex-1 px-3 py-2.5 rounded-xl glass-input text-foreground text-xs font-mono truncate border border-border"
                />
                <motion.button onClick={handleCopyCode}
                  whileTap={{ scale: 0.95 }}
                  animate={copied ? { backgroundColor: "hsl(var(--success))" } : {}}
                  className={`px-4 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${
                    copied
                      ? "bg-success text-success-foreground"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  }`}>
                  <Copy className="h-4 w-4" />
                  {copied ? "Copiado!" : "Copiar"}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Payment link */}
          {pixData.payment_link && (
            <a href={pixData.payment_link} target="_blank" rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors">
              <ExternalLink className="h-4 w-4" /> Abrir link de pagamento
            </a>
          )}

          {/* Auto-polling indicator */}
          <div className="flex items-center justify-center gap-2 py-2">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </motion.div>
            <p className="text-xs text-muted-foreground">
              Verificando pagamento automaticamente...
              {pollCount > 0 && <span className="ml-1">({pollCount}x)</span>}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={handleCheckStatus} disabled={checking}
              className="flex-1 py-3 rounded-xl bg-success/10 border border-success/20 text-success font-bold text-sm flex items-center justify-center gap-2 hover:bg-success/20 transition-colors disabled:opacity-50">
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Verificar Agora
            </button>
            <button onClick={handleNewPix}
              className="px-4 py-3 rounded-xl border border-border text-muted-foreground font-medium text-sm hover:bg-muted/40 transition-colors">
              Novo PIX
            </button>
          </div>
        </motion.div>
      )}

      {/* Últimos depósitos */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display text-lg font-bold text-foreground">Últimos Depósitos</h3>
        </div>
        {depositTxs.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">Nenhum depósito registrado</p>
        ) : depositTxs.slice(0, 10).map((t, i) => (
          <motion.div key={t.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
            className="px-5 py-3 border-b border-border last:border-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.status === "completed" ? "bg-success/15" : t.status === "expired" ? "bg-destructive/15" : "bg-warning/15"}`}>
                {t.status === "completed" ? <AnimatedCheck size={18} className="text-success" /> : t.status === "expired" ? <span className="text-destructive text-sm">✕</span> : <Loader2 className="h-4 w-4 text-warning animate-spin" />}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Depósito PIX</p>
                <p className="text-xs text-muted-foreground">{fmtDate(t.created_at)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${t.status === "completed" ? "text-success" : t.status === "expired" ? "text-destructive" : "text-warning"}`}>+{fmt(t.amount)}</p>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${t.status === "completed" ? "text-success" : t.status === "expired" ? "text-destructive" : "text-warning"}`}>
                {t.status === "completed" ? "✓ Confirmado" : t.status === "expired" ? "✕ Expirado" : "⏳ Processando"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
