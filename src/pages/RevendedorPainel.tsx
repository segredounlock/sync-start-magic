import { useAuth } from "@/hooks/useAuth";
import { useSiteName } from "@/hooks/useSiteName";
import { InfoCard } from "@/components/InfoCard";
import { DashboardSection } from "@/components/DashboardSection";
import { AtualizacoesSection } from "@/components/AtualizacoesSection";
import { useDisabledValues } from "@/hooks/useDisabledValues";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import RecargasTicker from "@/components/RecargasTicker";
import BrandedQRCode from "@/components/BrandedQRCode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { AnimatedCounter, AnimatedInt } from "@/components/AnimatedCounter";
import { Currency, IntVal, StatusBadge } from "@/components/ui";
import { MobileBottomNav, NavItem } from "@/components/MobileBottomNav";
import AnimatedCheck from "@/components/AnimatedCheck";
import { PromoBanner } from "@/components/PromoBanner";
import { FloatingMenuIcon, FloatingGridIcon } from "@/components/FloatingMenuIcon";
import { PopupBanner } from "@/components/PopupBanner";
import { SlideBanner } from "@/components/SlideBanner";
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
  X, User, Activity, Landmark, CreditCard, DollarSign, CheckCircle2, XCircle,
  Shield, Server, AlertTriangle, Loader2, Eye, 
  QrCode, Copy, ExternalLink, RefreshCw, Store, Search, Filter, ChevronRight, FileText,
  Tag, Users as UsersIcon, Settings, Star, ArrowRightLeft, Banknote, Ticket, Info, Headphones, HeadphoneOff, Trophy,
} from "lucide-react";
import { MeusPrecos } from "@/components/MeusPrecos";
import { MinhaRede } from "@/components/MinhaRede";
import { ScratchCard } from "@/components/ScratchCard";
import { TopRankingPodium } from "@/components/TopRankingPodium";
import { ResellerFeeConfig } from "@/components/ResellerFeeConfig";
import { SupportTab } from "@/components/settings/SupportTab";
const ClientSupport = lazy(() => import("@/pages/ClientSupport"));

import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback, useRef } from "react";
import { appToast, styledToast as toast } from "@/lib/toast";
import { formatDateTimeBR, formatFullDateTimeBR, formatDateLongUpperBR, toLocalDateKey, getTodayLocalKey, getRecargaTime, getRecargaTimeLabel } from "@/lib/timezone";

import type { Recarga, CatalogValue, CatalogCarrier, Transaction } from "@/types";
import { usePixDeposit } from "@/hooks/usePixDeposit";
import { useFeePreview } from "@/hooks/useFeePreview";
import { useResilientFetch, guardedFetch } from "@/hooks/useAsync";
import { operadoraColors, safeValor } from "@/lib/utils";
import { applyCurrencyMask, parseCurrencyMask } from "@/lib/currencyMask";
import { handleExpiredSession } from "@/lib/sessionGuard";

type PainelTab = "dashboard" | "recarga" | "addSaldo" | "historico" | "extrato" | "ranking" | "contatos" | "status" | "atualizacoes" | "meusprecos" | "minharede" | "raspadinha" | "suporte";

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
  const siteName = useSiteName();
  const isClientMode = !!resellerId;
  const navigate = useNavigate();
  const { filterValores } = useDisabledValues();
  const { user, role, signOut } = useAuth();
  const [saldo, setSaldo] = useState(0);
  const [saldoPessoal, setSaldoPessoal] = useState(0);
  const [showMoverSaldo, setShowMoverSaldo] = useState(false);
  const [moverValor, setMoverValor] = useState("");
  const [moverLoading, setMoverLoading] = useState(false);
  const [showSaque, setShowSaque] = useState(false);
  const [saqueValor, setSaqueValor] = useState("");
  const [saqueLoading, setSaqueLoading] = useState(false);
  const [saquePixKey, setSaquePixKey] = useState("");
  const [saquePixKeyType, setSaquePixKeyType] = useState("");
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const { loading, runFetch } = useResilientFetch();
  const [tab, setTab] = useState<PainelTab>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileNome, setProfileNome] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileBadge, setProfileBadge] = useState<BadgeType | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [supportEnabled, setSupportEnabled] = useState(true);

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
  const notifiedRecargaIds = useRef<Set<string>>(new Set());
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
  useEffect(() => {
    const loadSupportEnabled = async () => {
      const { data } = await (supabase.from("system_config") as any)
        .select("value")
        .eq("key", "supportEnabled")
        .maybeSingle();
      setSupportEnabled(data?.value !== "false");
    };

    loadSupportEnabled();

    const ch = supabase
      .channel("reseller-panel-support-enabled")
      .on("postgres_changes", { event: "*", schema: "public", table: "system_config", filter: "key=eq.supportEnabled" }, (payload: any) => {
        const isEnabled = payload.new?.value !== "false";
        setSupportEnabled(isEnabled);
        if (!isEnabled && tab === "suporte") setTab("dashboard");
      })
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, [tab]);
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [savingContacts, setSavingContacts] = useState(false);
  const [salesToolsEnabled, setSalesToolsEnabled] = useState(true);
  const [hasNetwork, setHasNetwork] = useState(false);

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
    operatorStats: { operadora: string; avgRecent: number; minRecent: number; min24h: number; avg24h: number; max24h: number; recentCount: number; pendingCount: number }[];
  } | null>(null);

  // Profile slug for store link
  // Profile slug for store link
  const [profileSlug, setProfileSlug] = useState("");
  const [referralCode, setReferralCode] = useState("");

  // Banner config from banners table
  const [bannersList, setBannersList] = useState<{ id: string; position: number; type: string; enabled: boolean; title: string; subtitle: string; link: string; icon_url: string | null }[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<Set<number>>(new Set());
  const [totalRecargasCount, setTotalRecargasCount] = useState(0);
  const [totalCompletedCount, setTotalCompletedCount] = useState(0);

  // Call edge function helper with session guard
  const callApi = useCallback(async (action: string, params: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("recarga-express", {
      body: { action, ...params },
    });
    if (error) {
      const msg = error?.message || "";
      const status = (error as any)?.status || (error as any)?.context?.status;
      if (status === 401 || msg.includes("Token inválido") || msg.includes("Invalid JWT")) {
        handleExpiredSession();
        throw new Error("Sessão expirada");
      }
      throw new Error(msg || "Erro na API");
    }
    // Check if response body contains auth error
    if (data?.error && (data.error === "Token inválido" || data.error === "Não autorizado")) {
      handleExpiredSession();
      throw new Error("Sessão expirada");
    }
    return data;
  }, []);

  const fetchCatalog = useCallback(async () => {
    await guardedFetch(catalogLoaded, setCatalogLoading, async () => {
      // In client mode, load reseller's custom pricing
      // In reseller/user mode, load own custom pricing (if any) with global as fallback
      const pricingUserId = isClientMode ? resellerId : user?.id;
      const [{ data: ops }, { data: globalRules }, { data: resellerRules }, { data: baseRules }, { data: dmConfigs }] = await Promise.all([
        supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
        supabase.from("pricing_rules").select("*"),
        pricingUserId ? supabase.from("reseller_pricing_rules").select("*").eq("user_id", pricingUserId) : Promise.resolve({ data: [] }),
        pricingUserId ? supabase.from("reseller_base_pricing_rules").select("*").eq("user_id", pricingUserId) : Promise.resolve({ data: [] }),
        supabase.from("system_config").select("key, value").in("key", ["defaultMarginEnabled", "defaultMarginType", "defaultMarginValue"]),
      ]);

      // Parse default margin config
      const dmMap: Record<string, string> = {};
      (dmConfigs || []).forEach((c: any) => { dmMap[c.key] = c.value || ""; });
      const dmEnabled = dmMap.defaultMarginEnabled === "true";
      const dmType = dmMap.defaultMarginType || "fixo";
      const dmValue = parseFloat(dmMap.defaultMarginValue || "0") || 0;

      if (ops) {
        const hasResellerRules = (resellerRules || []).length > 0;
        const hasBaseRules = (baseRules || []).length > 0;
        const localCatalog: CatalogCarrier[] = ops.map((op) => {
          const opGlobalRules = (globalRules || []).filter((r) => r.operadora_id === op.id);
          const opResellerRules = (resellerRules || []).filter((r: any) => r.operadora_id === op.id);
          const opBaseRules = (baseRules || []).filter((r: any) => r.operadora_id === op.id);
          const valores = filterValores(op.id, (op.valores as unknown as number[]) || []);
          const values: CatalogValue[] = valores.map((v: number) => {
            const resellerRule = opResellerRules.find((r: any) => Number(r.valor_recarga) === v);
            const baseRule = opBaseRules.find((r: any) => Number(r.valor_recarga) === v);
            const globalRule = opGlobalRules.find((r) => Number(r.valor_recarga) === v);
            let cost: number;

            if (isClientMode && hasResellerRules && resellerRule) {
              // Client mode only: Reseller's network markup (regra_valor = selling price)
              cost = resellerRule.tipo_regra === "fixo"
                ? (Number(resellerRule.regra_valor) > 0 ? Number(resellerRule.regra_valor) : Number(resellerRule.custo))
                : Number(resellerRule.custo) * (1 + Number(resellerRule.regra_valor) / 100);
            } else if (hasBaseRules && baseRule) {
              // Admin-set custom base cost (regra_valor = user's actual cost)
              cost = Number(baseRule.regra_valor) > 0 ? Number(baseRule.regra_valor) : Number(baseRule.custo);
            } else if (dmEnabled && dmValue > 0 && globalRule) {
              // Global rule + default margin
              const apiCost = Number(globalRule.custo);
              cost = dmType === "fixo" ? apiCost + dmValue : apiCost * (1 + dmValue / 100);
            } else if (globalRule) {
              // Global rule direct
              cost = globalRule.tipo_regra === "fixo"
                ? (Number(globalRule.regra_valor) > 0 ? Number(globalRule.regra_valor) : Number(globalRule.custo))
                : Number(globalRule.custo) * (1 + Number(globalRule.regra_valor) / 100);
            } else {
              cost = v;
            }
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

  const userIdRef = useRef(user?.id);
  userIdRef.current = user?.id;

  const fetchData = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    const t0 = performance.now();
    await runFetch(async () => {
      const [{ data: saldoData }, { data: saldoPessoalData }, { data: recargasData }, { data: profile }, { data: botTokenConfig }, { count: recargasTotalCount }, { count: recargasCompletedCount }] = await Promise.all([
        supabase.from("saldos").select("valor").eq("user_id", uid).eq("tipo", "revenda").maybeSingle(),
        supabase.from("saldos").select("valor").eq("user_id", uid).eq("tipo", "pessoal").maybeSingle(),
        supabase.from("recargas").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(50),
        supabase.from("profiles").select("nome, telegram_username, whatsapp_number, telegram_id, slug, avatar_url, referral_code, verification_badge").eq("id", uid).single(),
        supabase.from("reseller_config").select("value").eq("user_id", uid).eq("key", "telegram_bot_token").maybeSingle(),
        supabase.from("recargas").select("id", { count: "exact", head: true }).eq("user_id", uid),
        supabase.from("recargas").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("status", "completed"),
      ]);
      setSaldo(Number(saldoData?.valor) || 0);
      setSaldoPessoal(Number(saldoPessoalData?.valor) || 0);
      setRecargas(recargasData || []);
      setTotalRecargasCount(recargasTotalCount || 0);
      setTotalCompletedCount(recargasCompletedCount || 0);
      const p = profile as any;
      setProfileNome(p?.nome || "");
      setTelegramUsername(p?.telegram_username || "");
      setWhatsappNumber(p?.whatsapp_number || "");
      setTelegramBotToken(botTokenConfig?.value || "");
      setTelegramLinked(!!p?.telegram_id);
      setProfileSlug(p?.slug || "");
      setReferralCode(p?.referral_code || "");
      setAvatarUrl(p?.avatar_url || null);
      setProfileBadge((p?.verification_badge as BadgeType) || null);
      // Fetch PIX key for withdrawals
      const { data: pixData } = await supabase
        .from("reseller_config")
        .select("key, value")
        .eq("user_id", uid)
        .in("key", ["pix_key_type", "pix_key_value"]);
      if (pixData) {
        for (const row of pixData) {
          if (row.key === "pix_key_type" && row.value) setSaquePixKeyType(row.value);
          if (row.key === "pix_key_value" && row.value) setSaquePixKey(row.value);
        }
      }
    });
    console.log(`[RevendedorPainel] fetchData completed in ${(performance.now() - t0).toFixed(0)}ms`);
  }, [runFetch]);

  const [commissions, setCommissions] = useState<{ id: string; amount: number; type: string; created_at: string; recarga_id: string | null; referred_user_id: string }[]>([]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    await guardedFetch(transLoaded, setTransLoading, async () => {
      const [{ data: txData }, { data: commData }] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("referral_commissions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
      ]);
      setTransactions(txData || []);
      setCommissions(commData || []);
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
      const operatorStats: { operadora: string; avgRecent: number; minRecent: number; min24h: number; avg24h: number; max24h: number; recentCount: number; pendingCount: number }[] = 
        (Array.isArray(rpcStats) ? rpcStats : []).map((s: any) => ({
          operadora: s.operadora || "",
          avgRecent: Number(s.avg_recent) || 0,
          minRecent: Number(s.min_recent) || 0,
          min24h: Number(s.min_24h) || 0,
          avg24h: Number(s.avg_24h) || 0,
          max24h: Number(s.max_24h) || 0,
          recentCount: Number(s.recent_count) || 0,
          pendingCount: Number(s.pending_count) || 0,
        }));

      // Ensure all active operators appear
      const activeOps = ["Claro", "Tim", "Vivo"];
      activeOps.forEach(op => {
        if (!operatorStats.find(s => s.operadora.toLowerCase() === op.toLowerCase())) {
          operatorStats.push({ operadora: op, avgRecent: 0, minRecent: 0, min24h: 0, avg24h: 0, max24h: 0, recentCount: 0, pendingCount: 0 });
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
    supabase.rpc("get_sales_tools_enabled" as any)
      .then(({ data }) => { setSalesToolsEnabled(data !== false); });
    if (user) {
      supabase.from("profiles").select("id", { count: "exact", head: true })
        .eq("reseller_id", user.id)
        .then(({ count }) => { setHasNetwork((count ?? 0) > 0); });
    }
  }, [user]);
  const handleBgPaymentConfirmed = useCallback(() => {
    fetchData();
    fetchTransactions();
  }, [fetchData, fetchTransactions]);
  useBackgroundPaymentMonitor(user?.id, handleBgPaymentConfirmed, revDepositToast);

  // Realtime: listen for recargas status changes
  // Realtime: saldo updates
  useEffect(() => {
    if (!user) return;
    const uid = user?.id;
    if (!uid) return;
    const saldoChannel = supabase
      .channel(`saldo-realtime-${uid}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "saldos",
        filter: `user_id=eq.${uid}`,
      }, (payload) => {
        const row = payload.new as any;
        if (row?.tipo === "revenda" && row?.valor !== undefined) {
          setSaldo(Number(row.valor));
        }
        if (row?.tipo === "pessoal" && row?.valor !== undefined) {
          setSaldoPessoal(Number(row.valor));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(saldoChannel); };
  }, [user?.id]);

  // Stable refs for realtime callbacks
  const fetchDataRef = useRef(fetchData);
  fetchDataRef.current = fetchData;
  const fetchTransactionsRef = useRef(fetchTransactions);
  fetchTransactionsRef.current = fetchTransactions;

  // Realtime: recargas status updates
  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;
    const channel = supabase
      .channel(`recargas-status-${uid}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "recargas",
        filter: `user_id=eq.${uid}`,
      }, (payload) => {
        const newRow = payload.new as any;
        const oldRow = payload.old as any;
        if (newRow.status === "completed" && oldRow?.status !== "completed" && !notifiedRecargaIds.current.has(newRow.id)) {
          notifiedRecargaIds.current.add(newRow.id);
          appToast.recargaCompleted(`Recarga ${(newRow.operadora || "").toUpperCase()} R$ ${Number(newRow.valor).toFixed(2)} para ${newRow.telefone} concluída!`);
          playSuccessSound();
          fetchDataRef.current();
          supabase.functions.invoke("telegram-notify", {
            body: {
              type: "recarga_completed",
              user_id: uid,
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
  }, [user?.id]);

  // Realtime: transactions (saques) status updates
  useEffect(() => {
    const uid = user?.id;
    if (!uid) return;
    const txChannel = supabase
      .channel(`tx-realtime-${uid}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "transactions",
        filter: `user_id=eq.${uid}`,
      }, (payload) => {
        const newRow = payload.new as any;
        const oldRow = payload.old as any;
        if (newRow.type === "saque" && newRow.status !== oldRow?.status) {
          fetchTransactionsRef.current();
          fetchDataRef.current();
          if (newRow.status === "completed") {
            toast.success(`🎉 Saque de R$ ${Number(newRow.amount).toFixed(2).replace(".", ",")} foi pago!`);
          } else if (newRow.status === "approved") {
            toast.success(`✅ Saque de R$ ${Number(newRow.amount).toFixed(2).replace(".", ",")} aprovado!`);
          } else if (newRow.status === "rejected") {
            toast.error(`❌ Saque de R$ ${Number(newRow.amount).toFixed(2).replace(".", ",")} rejeitado. Saldo estornado.`);
          }
        }
        if (newRow.type === "deposit" && newRow.status !== oldRow?.status) {
          fetchTransactionsRef.current();
          fetchDataRef.current();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(txChannel); };
  }, [user?.id]);

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
        icon_url: b.icon_url,
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
          if (resp?.success && resp.data?.localStatus === "completed" && !notifiedRecargaIds.current.has(r.id)) {
            notifiedRecargaIds.current.add(r.id);
            appToast.recargaCompleted(`Recarga ${(r.operadora || "").toUpperCase()} R$ ${Number(r.valor).toFixed(2)} para ${r.telefone} concluída!`);
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

   // Local fallback: detect operator by Brazilian mobile prefix
   const detectOperatorLocally = useCallback((digits: string): string | null => {
     if (digits.length !== 11) return null;
     const prefix = parseInt(digits.substring(2, 6));
     if ((prefix >= 9611 && prefix <= 9699) || (prefix >= 9100 && prefix <= 9199)) return "claro";
     if ((prefix >= 9700 && prefix <= 9799) || (prefix >= 9800 && prefix <= 9899)) return "vivo";
     if ((prefix >= 9900 && prefix <= 9999) || (prefix >= 9200 && prefix <= 9299)) return "tim";
     if (prefix >= 9300 && prefix <= 9399) return "oi";
     return null;
   }, []);

   // Match operator name to catalog entry
   const matchOperatorToCatalog = useCallback((operatorName: string) => {
     if (!operatorName || !catalog.length) return null;
     const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
     return catalog.find(c => norm(c.name).includes(norm(operatorName)) || norm(operatorName).includes(norm(c.name)));
   }, [catalog]);

   // Auto-detect operator when phone has 11 digits
   useEffect(() => {
     const digits = telefone.replace(/\D/g, "");
     if (digits.length !== 11 || !catalog.length) return;
     if (lastDetectedPhoneRef.current === digits) return;
     
     const timer = setTimeout(async () => {
       if (lastDetectedPhoneRef.current === digits) return;
       lastDetectedPhoneRef.current = digits;
       setDetectingOperator(true);
       let matched = null;
       try {
         const queryResp = await callApi("query-operator", { phoneNumber: digits });
         if (queryResp?.success && queryResp.data) {
           const operatorName = queryResp.data.carrier?.name || queryResp.data.operator || "";
           if (operatorName) {
             matched = matchOperatorToCatalog(operatorName);
           }
         }
       } catch (err: any) {
         console.warn("Auto-detect operator API failed:", err.message);
       }
       // Fallback local if API didn't match
       if (!matched) {
         const localName = detectOperatorLocally(digits);
         if (localName) {
           matched = matchOperatorToCatalog(localName);
           if (matched) console.log("Operadora detectada via fallback local:", localName);
         }
       }
       if (matched) {
         setSelectedCarrier(matched);
         setDetectedOperatorName(matched.name);
         appToast.success(`Operadora detectada: ${matched.name}`);
       } else {
         setDetectedOperatorName(null);
         appToast.warning("Não foi possível detectar a operadora automaticamente");
       }
       setDetectingOperator(false);
     }, 500);
     return () => clearTimeout(timer);
   }, [telefone, catalog, callApi, matchOperatorToCatalog, detectOperatorLocally]);

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
          // Mark as notified to prevent duplicate toasts from Realtime/polling
          if (resp.data?.recargaId) notifiedRecargaIds.current.add(resp.data.recargaId);
          if (externalId) notifiedRecargaIds.current.add(externalId);
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
      const { error: profileError } = await supabase.from("profiles").update({ telegram_username: telegramUsername.trim() || null, whatsapp_number: whatsappNumber.trim() || null } as any).eq("id", user!.id);
      if (profileError) throw profileError;
      // Save telegram_bot_token to reseller_config (secure storage)
      const tokenValue = telegramBotToken.trim() || null;
      const { error: configError } = await supabase.from("reseller_config").upsert(
        { user_id: user!.id, key: "telegram_bot_token", value: tokenValue },
        { onConflict: "user_id,key" }
      );
      if (configError) throw configError;
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

  const todayKey = getTodayLocalKey();
  const recargasHojeAll = recargas.filter((r) => toLocalDateKey(r.created_at) === todayKey);
  const recargasHoje = recargasHojeAll.length;
  const recargasHojeCompleted = recargasHojeAll.filter((r) => r.status === "completed").length;
  const recargasHojePending = recargasHojeAll.filter((r) => r.status === "pending" || r.status === "processing").length;
  const successRate = totalRecargasCount > 0 ? Math.round((totalCompletedCount / totalRecargasCount) * 100) : 0;
  const userLabel = profileNome || user?.email?.split("@")[0] || "Revendedor";
  const userInitial = (userLabel[0] || "R").toUpperCase();

  type MenuItem = { key: PainelTab; label: string; icon: typeof Send; color: string; active?: boolean; dashed?: boolean };
   const menuItems: MenuItem[] = [
    { key: "dashboard", label: "Dashboard", icon: Activity, color: "text-red-400" },
    { key: "recarga", label: "Fazer Recarga", icon: Send, color: "text-blue-400" },
    { key: "historico", label: "Meus Pedidos", icon: History, color: "text-yellow-400" },
    { key: "extrato", label: "Carteira", icon: Landmark, color: "text-emerald-400" },
    { key: "ranking", label: "Ranking", icon: Trophy, color: "text-yellow-400" },
    { key: "addSaldo", label: "Depositar", icon: CreditCard, color: "text-cyan-400", dashed: true },
    { key: "contatos", label: "Configurações", icon: Settings, color: "text-purple-400" },
    { key: "status", label: "Status do Sistema", icon: Activity, color: "text-sky-400" },
    { key: "atualizacoes", label: "Atualizações", icon: RefreshCw, color: "text-lime-400" },
    { key: "raspadinha", label: "Raspadinha", icon: Ticket, color: "text-orange-400" },
    { key: "suporte", label: supportEnabled ? "Suporte" : "Suporte offline", icon: supportEnabled ? Headphones : HeadphoneOff, color: supportEnabled ? "text-teal-400" : "text-muted-foreground" },
  ];

  const isAdmin = role === "admin";
  const isRevendedor = isAdmin || role === "revendedor" || hasNetwork;
  const showSalesTools = isAdmin || salesToolsEnabled;

  const salesMenuItems: MenuItem[] = (() => {
    if (isClientMode || !showSalesTools || !isRevendedor) return [];
    const items: MenuItem[] = [];
    items.push({ key: "meusprecos", label: "Meus Preços", icon: Tag, color: "text-amber-400" });
    items.push({ key: "minharede", label: "Minha Rede", icon: UsersIcon, color: "text-indigo-400" });
    return items;
  })();

  const tabTitle: Record<PainelTab, string> = {
    dashboard: "Dashboard", recarga: "Fazer Recarga", addSaldo: "Depositar", historico: "Meus Pedidos",
    extrato: "Carteira", ranking: "Ranking", contatos: "Configurações", status: "Status do Sistema",
    atualizacoes: "Atualizações", meusprecos: "Meus Preços", minharede: "Minha Rede", raspadinha: "Raspadinha", suporte: "Suporte",
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
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 8MB.");
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
                  <p className="text-xs text-success font-medium">{loading ? <SkeletonValue width="w-14" className="h-3" /> : <AnimatedCounter value={saldo} prefix="R$&nbsp;" />}</p>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="px-4 pb-3 grid grid-cols-3 gap-2">
              {menuItems.map((item, index) => {
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
                    <FloatingGridIcon icon={item.icon} color={isActive ? "text-primary" : item.color} isActive={isActive} index={index} />
                    <span className={`text-[11px] font-semibold text-center leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>{item.label}</span>
                  </button>
                );
              })}

              {/* Sales Tools */}
              {salesMenuItems.length > 0 && (
                <>
                  <div className="col-span-3 pt-1">
                    <p className="text-[10px] tracking-widest text-muted-foreground/60 uppercase font-semibold text-center">Ferramentas de Venda</p>
                  </div>
                  {salesMenuItems.map((item, index) => {
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
                        <FloatingGridIcon icon={item.icon} color={isActive ? "text-primary" : item.color} isActive={isActive} index={menuItems.length + index} />
                        <span className={`text-[11px] font-semibold text-center leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>{item.label}</span>
                      </button>
                    );
                  })}
                </>
              )}

              {!isClientMode && isRevendedor && (
                <a
                  href={profileSlug ? `/loja/${profileSlug}` : `/recarga?ref=${referralCode || user?.id}`}
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
            <h1 className="font-display text-xl font-bold shimmer-letters truncate">
              {siteName}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-primary/80 font-semibold mt-1.5">{isRevendedor ? "Revendedor" : "Cliente"}</p>
          </div>

          <div className="p-4 space-y-3 border-b border-border relative">
            <div className="glass-card rounded-xl p-3.5 flex items-center gap-3 rgb-border">
              <AvatarDisplay />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate uppercase shimmer-letters">
                    {userLabel}
                  </p>
                  <VerificationBadge badge={profileBadge} size="md" />
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
            {menuItems.map((item, index) => {
              const isActive = tab === item.key;
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    onClick={() => selectTab(item.key)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                      isActive
                        ? "nav-item-active"
                        : item.dashed
                        ? "text-success border border-dashed border-success/30 hover:bg-success/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <FloatingMenuIcon icon={item.icon} color={item.color} isActive={isActive} index={index} size="h-4 w-4" />
                    <motion.span whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      {item.label}
                    </motion.span>
                  </button>
                </motion.div>
              );
            })}

            {/* Sales Tools Section */}
            {salesMenuItems.length > 0 && (
              <div className="pt-3 mt-3 border-t border-border space-y-1">
                <div className="px-2 text-[10px] tracking-widest text-muted-foreground/60 uppercase font-semibold">Ferramentas de Venda</div>
                {salesMenuItems.map((item, index) => {
                  const isActive = tab === item.key;
                  return (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (menuItems.length + index) * 0.05 }}
                    >
                      <button
                        onClick={() => selectTab(item.key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                          isActive ? "nav-item-active" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <FloatingMenuIcon icon={item.icon} color={item.color} isActive={isActive} index={menuItems.length + index} size="h-4 w-4" />
                        <motion.span whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                          {item.label}
                        </motion.span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}

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
                      <div className="fixed inset-0 z-[119]" onClick={() => setShowAvatarMenu(false)} />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="fixed right-4 md:right-6 top-[4.25rem] md:top-[4.5rem] z-[120] min-w-[160px] rounded-xl bg-card border border-border shadow-xl p-2"
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
          <div className="relative z-10"><RecargasTicker /></div>
        </div>

        <main className="max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-5">
          {/* Stats - hidden on profile tab */}
          {tab === "dashboard" && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Recargas Hoje */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200 }} className="kpi-card">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center icon-container">
                  <AnimatedIcon icon={Smartphone} className="h-5 w-5 text-primary" animation="float" delay={0} />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Recargas Hoje</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-primary truncate">
                {loading ? <SkeletonValue width="w-16" className="h-7" /> : <AnimatedInt value={recargasHoje} />}
              </p>
              {!loading && recargasHoje > 0 && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                    <CheckCircle2 className="h-3 w-3" /> {recargasHojeCompleted}
                  </span>
                  {recargasHojePending > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-warning font-medium">
                      <Clock className="h-3 w-3" /> {recargasHojePending}
                    </span>
                  )}
                </div>
              )}
            </motion.div>

            {/* Total Geral */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring", stiffness: 200 }} className="kpi-card">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center icon-container">
                  <AnimatedIcon icon={Activity} className="h-5 w-5 text-accent" animation="pulse" delay={0.12} />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Geral</span>
              </div>
              <p className="text-2xl md:text-3xl font-bold text-accent truncate">
                {loading ? <SkeletonValue width="w-16" className="h-7" /> : <AnimatedInt value={totalCompletedCount} />}
              </p>
              {!loading && totalRecargasCount > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                    {successRate}% sucesso
                  </span>
                  {totalRecargasCount - totalCompletedCount > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      · {totalRecargasCount - totalCompletedCount} outras
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          </div>
          )}

          {/* Banners Promocionais — Banner Topo */}
          {bannersList.filter(b => b.enabled && b.type === "banner" && !dismissedBanners.has(b.position)).map(b => (
            <PromoBanner
              key={b.id}
              title={b.title || undefined}
              subtitle={b.subtitle || undefined}
              visible={true}
              link={b.link || undefined}
              icon_url={b.icon_url || undefined}
              onClose={() => setDismissedBanners(prev => new Set([...prev, b.position]))}
            />
          ))}

          {/* Slide Banners — Carrossel animado */}
          {(() => {
            const slideBanners = bannersList.filter(b => b.enabled && b.type === "slide" && !dismissedBanners.has(b.position));
            if (slideBanners.length === 0) return null;
            return (
              <SlideBanner
                slides={slideBanners.map(b => ({ title: b.title || "", subtitle: b.subtitle || "", link: b.link || undefined, icon_url: b.icon_url || undefined }))}
                visible={true}
                onClose={() => {
                  slideBanners.forEach(b => setDismissedBanners(prev => new Set([...prev, b.position])));
                }}
              />
            );
          })()}

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

          {/* ===== TAB: DASHBOARD ===== */}
          {tab === "dashboard" && user && (
            <DashboardSection
              saldo={saldo}
              loading={loading}
              userId={user.id}
              userName={userLabel}
              badge={profileBadge}
              onNavigateTab={(t) => selectTab(t as PainelTab)}
              isClientMode={isClientMode}
              salesToolsEnabled={salesToolsEnabled}
              userRole={role}
              isRevendedor={isRevendedor}
            />
          )}

          {/* ===== TAB: RECARGA ===== */}
          {tab === "recarga" && (
            <>
              {/* Info Card - Recarga */}
              <InfoCard title="Como Recarregar" items={[
                { icon: Smartphone, iconColor: "text-primary", label: "Número", description: "digite o telefone do cliente. A operadora é detectada automaticamente." },
                { icon: DollarSign, iconColor: "text-success", label: "Valor", description: "selecione o valor da recarga. O custo será descontado do seu saldo." },
                { icon: Send, iconColor: "text-warning", label: "Enviar", description: "confirme e aguarde a recarga ser processada em segundos." },
              ]} />

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
                                : trackingStatus.data.status === "andamento" || trackingStatus.data.status === "in_progress"
                                ? "bg-blue-500/15 text-blue-400"
                                : trackingStatus.data.status === "pendente" || trackingStatus.data.status === "pending"
                                ? "bg-warning/15 text-warning"
                                : trackingStatus.data.status === "falha" || trackingStatus.data.status === "failed"
                                ? "bg-destructive/15 text-destructive"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {trackingStatus.data.status === "feita" || trackingStatus.data.status === "completed" ? "✅ Concluída"
                                : trackingStatus.data.status === "andamento" || trackingStatus.data.status === "in_progress" ? "🔄 Em andamento"
                                : trackingStatus.data.status === "pendente" || trackingStatus.data.status === "pending" ? "⏳ Processando"
                                : trackingStatus.data.status === "falha" || trackingStatus.data.status === "failed" ? "❌ Falhou"
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
                        <label className="block text-sm font-semibold text-foreground mb-1.5">
                          Operadora
                          {detectingOperator && <span className="ml-2 text-xs text-primary animate-pulse">Detectando...</span>}
                          {detectedOperatorName && !detectingOperator && <span className="ml-2 text-xs text-success">✓ {detectedOperatorName}</span>}
                        </label>
                        <select
                          value={selectedCarrier?.carrierId || ""}
                          onChange={(e) => {
                            const c = catalog.find((c) => c.carrierId === e.target.value);
                            setSelectedCarrier(c || null);
                            if (c) setDetectedOperatorName(c.name);
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

                      <motion.button type="submit" disabled={sending || !selectedValue || !selectedCarrier || selectedValue.cost > saldo || (phoneCheckResult?.status === "BLACKLISTED") || (phoneCheckResult?.status === "COOLDOWN")}
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
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`}>{(r.operadora || "Operadora").toUpperCase()}</span>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">{r.telefone}</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">{getRecargaTimeLabel(r)} {fmtDate(getRecargaTime(r))}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-foreground"><Currency value={safeValor(r)} duration={600} /></p>
                            <p className="text-[10px] text-muted-foreground">Custo: <Currency value={r.custo || safeValor(r)} duration={600} /></p>
                            <StatusBadge status={r.status} type="recarga" className="text-xs" />
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
          {tab === "addSaldo" && <AddSaldoSection saldo={saldo} fmt={fmt} fmtDate={fmtDate} transactions={transactions} userEmail={user?.email} userName={userLabel} onDeposited={fetchData} fetchTransactions={fetchTransactions} resellerId={resellerId} saldoTipo="revenda" />}

          {/* ===== TAB: HISTORICO ===== */}
          {tab === "historico" && (
            <>
              {/* Info Card - Histórico */}
              <InfoCard title="Histórico de Recargas" items={[
                { icon: History, iconColor: "text-primary", label: "Todas as Recargas", description: "lista completa de recargas com status, operadora e valor." },
                { icon: Filter, iconColor: "text-warning", label: "Filtros", description: "filtre por status (concluída, pendente, falha) e por operadora." },
              ]} />

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
                        {operadoras.map(op => <option key={op} value={op}>{op.toUpperCase()}</option>)}
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
                          // Status via plugin
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
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`}>{(r.operadora || "Operadora").toUpperCase()}</span>
                                      <p className="text-xs text-muted-foreground font-mono">{r.telefone}</p>
                                    </div>
                                  </div>
                                  <StatusBadge status={r.status} type="recarga" className="px-2.5 py-1 text-xs" />
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                  <span className="text-xs text-muted-foreground">{getRecargaTimeLabel(r)} {fmtDate(getRecargaTime(r))}</span>
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
                            <th className="text-right px-4 py-3 font-medium text-muted-foreground">Custo</th>
                            <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma recarga encontrada</td></tr>
                          ) : filtered.map((r, i) => (
                            <motion.tr key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                              onClick={() => setSelectedRecarga(r)}>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(getRecargaTime(r))}</td>
                              <td className="px-4 py-3 font-mono text-foreground">{r.telefone}</td>
                              <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`}>{(r.operadora || "—").toUpperCase()}</span></td>
                              <td className="px-4 py-3 text-right font-mono font-medium text-foreground"><Currency value={safeValor(r)} duration={600} /></td>
                              <td className="px-4 py-3 text-right font-mono font-medium text-muted-foreground"><Currency value={r.custo || safeValor(r)} duration={600} /></td>
                              <td className="px-4 py-3 text-center">
                                <StatusBadge status={r.status} type="recarga" className="text-xs" />
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
                            <span className={`text-sm font-bold px-2.5 py-0.5 rounded-md border ${operadoraColors(r.operadora).bg} ${operadoraColors(r.operadora).text} ${operadoraColors(r.operadora).border}`}>{(r.operadora || "—").toUpperCase()}</span>
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
                            <span className="text-sm text-foreground">{getRecargaTimeLabel(r)} {fmtDate(getRecargaTime(r))}</span>
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
              storeName={profileNome || siteName}
              userId={user?.id}
            />
          )}
          {tab === "extrato" && (
            <>
              {/* Info Card - Extrato */}
              <InfoCard title="Minha Carteira" items={[
                { icon: Wallet, iconColor: "text-primary", label: "Saldo", description: "saldo disponível para realizar recargas e operações." },
                { icon: ArrowRightLeft, iconColor: "text-success", label: "Transações", description: "depósitos, recargas e comissões movimentam sua carteira." },
                { icon: Banknote, iconColor: "text-warning", label: "Saques", description: "solicite a retirada do saldo pessoal (comissões) via PIX." },
              ]} />
              {/* Wallet Header */}
              <div className="mb-5">
                <h2 className="text-xl font-bold text-foreground">Minha Carteira</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Gerencie seu saldo, faça recargas e solicite saques.</p>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/70 p-5 mb-5 text-primary-foreground">
                <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4 items-center">
                  {/* Saldo de Recargas */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <Wallet className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Saldo de Recargas</span>
                    </div>
                    <p className="text-3xl font-bold tabular-nums">{loading ? "..." : fmt(saldo)}</p>
                    <button
                      onClick={() => selectTab("addSaldo")}
                      className="self-start flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-primary text-xs font-bold hover:bg-white/90 transition-colors mt-1"
                    >
                      <CreditCard className="h-3.5 w-3.5" /> Comprar Créditos
                    </button>
                  </div>

                  {/* Comissões */}
                  <div className="flex flex-col gap-2 sm:border-l sm:border-white/20 sm:pl-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                        <Star className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Comissões</span>
                    </div>
                    <p className="text-2xl font-bold tabular-nums">{loading ? "..." : fmt(saldoPessoal)}</p>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => { setSaqueValor(""); setShowSaque(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 text-xs font-bold hover:bg-white/25 transition-colors">
                        <Landmark className="h-3.5 w-3.5" /> Sacar
                      </button>
                      <button onClick={() => { setMoverValor(""); setShowMoverSaldo(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 text-xs font-bold hover:bg-white/25 transition-colors">
                        <ArrowRightLeft className="h-3.5 w-3.5" /> Usar Saldo
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extrato Detalhado */}
              {(() => {
                // Merge transactions + recargas into unified list
                type ExtratoItem = { id: string; tipo: "deposito" | "recarga" | "saque" | "transferencia" | "comissao"; titulo: string; subtitulo: string; valor: number; data: string; status: string; isPositive: boolean };
                const items: ExtratoItem[] = [
                  ...transactions.map((t): ExtratoItem => {
                    const isDeposit = t.type === "deposit" || t.type === "deposito";
                    const isSaque = t.type === "saque" || t.type === "withdrawal";
                    const isMover = t.type === "transfer" || t.module === "comissoes";
                    const saqueCompleted = isSaque && (t.status === "completed" || t.status === "paid");

                    let titulo = "Depósito";
                    let subtitulo = "Depósito via PIX";
                    let tipo: ExtratoItem["tipo"] = "deposito";

                    if (isSaque) {
                      tipo = "saque";
                      titulo = saqueCompleted ? "Saque Concluído" : t.status === "pending" ? "Saque Pendente" : "Saque";
                      subtitulo = saqueCompleted ? "Seu saque foi pago" : t.status === "pending" ? "Aguardando processamento" : "Solicitação de saque";
                    } else if (isMover && !isDeposit) {
                      tipo = "transferencia";
                      titulo = "Transferência";
                      subtitulo = t.module === "comissoes" ? "Mover saldo de comissões" : "Transferência entre carteiras";
                    } else {
                      subtitulo = "Depósito via PIX";
                    }

                    return {
                      id: t.id,
                      tipo,
                      titulo,
                      subtitulo,
                      valor: t.amount,
                      data: t.created_at,
                      status: t.status,
                      isPositive: isSaque ? false : (isDeposit || (isMover && !isDeposit && t.amount > 0)),
                    };
                  }),
                  // Commissions from referral_commissions
                  ...commissions.map((c): ExtratoItem => {
                    // Try to find matching recarga for richer subtitle
                    const matchedRecarga = c.recarga_id ? recargas.find(r => r.id === c.recarga_id) : null;
                    const subtitulo = matchedRecarga
                      ? `Comissão pela venda de ${(matchedRecarga.operadora || "").toUpperCase()} ${fmt(safeValor(matchedRecarga))}`
                      : `Comissão ${c.type === "indirect" ? "indireta" : "direta"} de indicação`;
                    return {
                      id: c.id,
                      tipo: "comissao",
                      titulo: "Comissão Recebida",
                      subtitulo,
                      valor: c.amount,
                      data: c.created_at,
                      status: "completed",
                      isPositive: true,
                    };
                  }),
                  ...recargas.filter(r => r.status === "completed").map((r): ExtratoItem => ({
                    id: r.id,
                    tipo: "recarga",
                    titulo: "Venda de Recarga",
                    subtitulo: `Recarga ${(r.operadora || "").toUpperCase()} ${fmt(safeValor(r))}`,
                    valor: r.custo || safeValor(r),
                    data: r.created_at,
                    status: r.status,
                    isPositive: false,
                  })),
                ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

                const iconForType = (tipo: ExtratoItem["tipo"]) => {
                  if (tipo === "deposito") return <Banknote className="h-4 w-4 text-success" />;
                  if (tipo === "recarga") return <Smartphone className="h-4 w-4 text-blue-500" />;
                  if (tipo === "saque") return <Landmark className="h-4 w-4 text-warning" />;
                  if (tipo === "comissao") return <Star className="h-4 w-4 text-warning" />;
                  return <ArrowRightLeft className="h-4 w-4 text-accent" />;
                };
                const bgForType = (tipo: ExtratoItem["tipo"]) => {
                  if (tipo === "deposito") return "bg-success/10";
                  if (tipo === "recarga") return "bg-blue-500/10";
                  if (tipo === "saque") return "bg-destructive/10";
                  if (tipo === "comissao") return "bg-warning/10";
                  return "bg-accent/10";
                };

                return (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-base font-bold text-foreground">Extrato Detalhado</h3>
                      </div>
                      <button onClick={fetchTransactions} className="text-muted-foreground hover:text-foreground transition-colors">
                        <RefreshCw className={`h-4 w-4 ${transLoading ? "animate-spin" : ""}`} />
                      </button>
                    </div>

                    {transLoading && items.length === 0 ? (
                      <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
                    ) : items.length === 0 ? (
                      <p className="text-center py-8 text-muted-foreground">Nenhuma movimentação encontrada</p>
                    ) : (
                      <div className="space-y-2">
                        {items.map((item, i) => {
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.02 }}
                              className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
                            >
                              <div className={`w-10 h-10 rounded-xl ${bgForType(item.tipo)} flex items-center justify-center shrink-0`}>
                                {iconForType(item.tipo)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground text-sm">{item.titulo}</p>
                                <p className="text-xs text-muted-foreground truncate">{item.subtitulo}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className={`font-bold text-sm tabular-nums ${item.tipo === "saque" && item.status === "pending" ? "text-warning" : item.isPositive ? "text-success" : "text-destructive"}`}>
                                  {item.isPositive ? "+" : "-"} {fmt(item.valor)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{fmtDate(item.data)}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* ===== TAB: CONTATOS (Minha Conta) — Instagram-style ===== */}
          {tab === "contatos" && (
            <div className="space-y-6">
              {/* Info Card - Perfil */}
              <InfoCard title="Minha Conta" items={[
                { icon: User, iconColor: "text-primary", label: "Perfil", description: "atualize seu nome, foto, telefone e informações pessoais. Foto aceita: JPG, PNG, GIF ou WebP (máx. 8MB)." },
                { icon: Settings, iconColor: "text-warning", label: "Configurações", description: "gerencie chave PIX, notificações e preferências da conta." },
                { icon: Headphones, iconColor: "text-teal-500", label: "Suporte", description: "configure canais de atendimento (WhatsApp, Telegram, Instagram, etc.) para sua rede." },
              ]} />
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
                totalRecargas={totalRecargasCount}
                selectTab={selectTab}
                navigate={navigate}
              />

              {/* Fee config - only for resellers, not clients */}
              {!isClientMode && (role === "admin" || role === "revendedor") && user?.id && (
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Taxa de Depósito da Rede
                  </h3>
                  <ResellerFeeConfig userId={user.id} />
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: SUPORTE ===== */}
          {tab === "suporte" && user && (
            <div className="space-y-6">
              {supportEnabled ? (
                <>
                  <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
                    <ClientSupport />
                  </Suspense>
                  <SupportTab userId={user.id} />
                </>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                  <HeadphoneOff className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                   <h3 className="text-lg font-bold text-foreground">Suporte Offline</h3>
                  <p className="text-sm text-muted-foreground mt-2"><p className="text-sm text-muted-foreground mt-2">O atendimento está temporariamente indisponível.</p></p>
                </div>
              )}
            </div>
          )}

          {/* ===== TAB: STATUS ===== */}
          {tab === "status" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Info Card - Status */}
              <InfoCard title="Status do Sistema" items={[
                { icon: Activity, iconColor: "text-success", label: "Tempo de Processamento", description: "média de tempo que cada operadora leva para confirmar a recarga." },
                { icon: Server, iconColor: "text-primary", label: "Disponibilidade", description: "indica se a API de recargas está respondendo normalmente." },
              ]} />
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
                  const opGradient = opName === "CLARO"
                    ? "from-red-500 to-red-600"
                    : opName === "TIM"
                    ? "from-blue-500 to-blue-600"
                    : opName === "VIVO"
                    ? "from-purple-500 to-purple-600"
                    : "from-muted to-muted";
                  const opAccent = opName === "CLARO" ? "text-red-500" : opName === "TIM" ? "text-blue-500" : opName === "VIVO" ? "text-purple-500" : "text-muted-foreground";
                  const avgColor = op.avgRecent <= 120 ? "text-emerald-500" : op.avgRecent <= 300 ? "text-yellow-500" : "text-red-500";
                  const minColor = op.minRecent <= 120 ? "text-emerald-500" : op.minRecent <= 300 ? "text-yellow-500" : "text-red-500";
                  const pendingIcon = op.pendingCount > 5 ? "⚠️" : "⏳";

                  return (
                    <motion.div key={op.operadora} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="rounded-2xl overflow-hidden border border-border/40 bg-card shadow-lg">
                      
                      {/* Colored header bar */}
                      <div className={`bg-gradient-to-r ${opGradient} px-4 py-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Smartphone className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-bold text-white text-base tracking-wide">{opName}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Pendentes</p>
                          <p className="text-xl font-black text-white">{op.pendingCount}</p>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4 space-y-3">
                        {/* Avg + Min recent */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-muted/30 border border-border/30 p-3 text-center">
                            <p className="text-[10px] text-red-400 uppercase font-bold tracking-wider">Média Atual</p>
                            <p className={`text-xl font-black ${avgColor}`}>{fmtTime(op.avgRecent)}</p>
                            <p className="text-[9px] text-muted-foreground">Últimas 3</p>
                          </div>
                          <div className="rounded-xl bg-muted/30 border border-border/30 p-3 text-center">
                            <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Tempo Min.</p>
                            <p className={`text-xl font-black ${minColor}`}>{fmtTime(op.minRecent)}</p>
                            <p className="text-[9px] text-muted-foreground">Últimas 3</p>
                          </div>
                        </div>

                        {/* Processing count */}
                        <div className="flex items-center justify-between rounded-xl bg-muted/20 border border-border/30 px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{pendingIcon}</span>
                            <span className="text-xs font-bold text-foreground uppercase tracking-wide">Processando</span>
                          </div>
                          <span className={`text-lg font-black ${opAccent}`}>{op.pendingCount}</span>
                        </div>

                        {/* Consolidated 24h */}
                        <div className="border-t border-border/30 pt-3">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold text-center mb-2">Consolidado 24 Horas</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="text-center">
                              <p className="text-[10px] text-muted-foreground uppercase">Média Geral</p>
                              <p className="text-sm font-bold text-foreground">{fmtTime(op.avg24h)}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] text-muted-foreground uppercase">Mínimo (24h)</p>
                              <p className="text-sm font-bold text-foreground">{fmtTime(op.min24h)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Important observations */}
              <div className="glass-card rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground mb-1">Observações Importantes</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      O tempo de processamento e o volume em andamento são indicadores em tempo real para auxiliar sua operação. <span className="font-semibold text-foreground">Todas as informações acima são estimativas baseadas em tráfego recente; o prazo formal das operadoras para a conclusão de recargas permanece de até 24 horas.</span>
                    </p>
                  </div>
                </div>
                <div className="text-center pt-2 border-t border-border/30">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-semibold">Última Atualização</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== TAB: MEUS PREÇOS ===== */}
          {tab === "meusprecos" && user && <MeusPrecos userId={user.id} />}

          {/* ===== TAB: MINHA REDE ===== */}
          {tab === "minharede" && user && <MinhaRede userId={user.id} profileSlug={profileSlug} referralCode={referralCode} />}

          {/* ===== TAB: ATUALIZAÇÕES ===== */}
          {tab === "atualizacoes" && (
            <div className="space-y-6">
              <AtualizacoesSection />
            </div>
          )}

          {/* ===== TAB: RANKING ===== */}
          {tab === "ranking" && user && (
            <TopRankingPodium userId={user.id} showPodium={false} />
          )}

          {/* ===== TAB: RASPADINHA ===== */}
          {tab === "raspadinha" && user && (
            <ScratchCard userId={user.id} />
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
          { key: "dashboard", label: "Início", icon: Activity, color: "text-red-400", animation: "pulse" },
          { key: "recarga", label: "Recarga", icon: Smartphone, color: "text-blue-400", animation: "bounce" },
          { key: "addSaldo", label: "Saldo", icon: DollarSign, color: "text-success", animation: "pulse", elevated: true },
          { key: "historico", label: "Pedidos", icon: History, color: "text-yellow-400", animation: "wiggle" },
          { key: "chat", label: "Bate-papo", icon: MessageCircle, color: "text-cyan-400", animation: "float" },
          { key: "raspadinha", label: "Raspadinha", icon: Ticket, color: "text-orange-400", animation: "bounce" },
          { key: "contatos", label: "Config", icon: Settings, color: "text-purple-400", animation: "float" },
          { key: "extrato", label: "Extrato", icon: Landmark, color: "text-emerald-400", animation: "bounce" },
          { key: "ranking", label: "Ranking", icon: Trophy, color: "text-yellow-400", animation: "bounce" },
          { key: "status", label: "Status", icon: Activity, color: "text-sky-400", animation: "pulse" },
          { key: "atualizacoes", label: "Novidades", icon: RefreshCw, color: "text-lime-400", animation: "float" },
          { key: "suporte", label: supportEnabled ? "Suporte" : "Suporte offline", icon: supportEnabled ? Headphones : HeadphoneOff, color: supportEnabled ? "text-teal-400" : "text-muted-foreground", animation: "float" },
          ...salesMenuItems.map(item => ({ key: item.key, label: item.label, icon: item.icon, color: item.color, animation: "float" as const })),
          
        ] as NavItem[]}
        activeKey={tab}
        onSelect={(key) => {
          if (key === "chat") { navigate("/chat"); return; }
          selectTab(key as PainelTab);
        }}
        mainCount={4}
        userLabel={user?.email || userLabel}
        userRole={role === "admin" ? "Administrador" : isRevendedor ? "Revendedor" : "Cliente"}
        userAvatarUrl={avatarUrl}
        onSignOut={signOut}
        panelLinks={[
          ...(!isClientMode && (role === "admin" || role === "revendedor") ? [{ label: "Painel Admin", path: "/admin", icon: Shield, color: "text-primary" }] : []),
          ...(role === "admin" ? [{ label: "Principal", path: "/principal", icon: Landmark, color: "text-success" }] : []),
          ...(!isClientMode && isRevendedor ? [{ label: "Minha Loja", path: profileSlug ? `/loja/${profileSlug}` : `/recarga?ref=${referralCode || user?.id}`, icon: Store, color: "text-accent" }] : []),
        ]}
      />

      {/* Modal Mover Saldo */}
      <AnimatePresence>
        {showMoverSaldo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowMoverSaldo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ArrowRightLeft className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Mover Saldo</h3>
                </div>
                <button onClick={() => setShowMoverSaldo(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transfira o lucro de <strong className="text-foreground">Comissões</strong> para o <strong className="text-foreground">Saldo Principal</strong> para realizar novas recargas imediatamente. Esta ação não tem taxas.
                </p>
              </div>

              <div className="space-y-1.5 mb-5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor para transferir</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={moverValor}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
                    setMoverValor(raw);
                  }}
                  placeholder="R$ 0.00"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
                <p className="text-[10px] text-muted-foreground text-right font-medium">
                  DISPONÍVEL: {fmt(saldoPessoal)}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowMoverSaldo(false)}
                  className="flex-1 py-3 rounded-xl border border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  disabled={moverLoading || !moverValor || parseFloat(moverValor) <= 0 || parseFloat(moverValor) > saldoPessoal}
                  onClick={async () => {
                    const val = parseFloat(moverValor);
                    if (!val || val <= 0 || val > saldoPessoal || !user) return;
                    setMoverLoading(true);
                    try {
                      // Debit comissões
                      const { error: e1 } = await supabase
                        .from("saldos")
                        .update({ valor: saldoPessoal - val })
                        .eq("user_id", user.id)
                        .eq("tipo", "pessoal");
                      if (e1) throw e1;
                      // Credit revenda
                      const { error: e2 } = await supabase
                        .from("saldos")
                        .update({ valor: saldo + val })
                        .eq("user_id", user.id)
                        .eq("tipo", "revenda");
                      if (e2) throw e2;
                      setSaldoPessoal(saldoPessoal - val);
                      setSaldo(saldo + val);
                      toast.success(`${fmt(val)} transferido para Saldo Principal!`);
                      setShowMoverSaldo(false);
                    } catch {
                      toast.error("Erro ao transferir saldo");
                    } finally {
                      setMoverLoading(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {moverLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirmar Transferência
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Solicitar Saque */}
      <AnimatePresence>
        {showSaque && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setShowSaque(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Landmark className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Solicitar Saque (PIX)</h3>
                </div>
                <button onClick={() => setShowSaque(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-5 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-foreground mb-0.5">INFORMAÇÃO IMPORTANTE</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Os saques são processados em até 72 horas úteis. Na maioria dos casos, o valor cai na sua conta em segundos.
                  </p>
                </div>
              </div>

              {/* PIX Key display/warning */}
              {saquePixKey ? (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Chave PIX para recebimento</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary uppercase">{saquePixKeyType || "PIX"}</span>
                    <span className="text-sm font-bold text-foreground">{saquePixKey}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 mb-5 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground mb-0.5">CHAVE PIX NÃO CONFIGURADA</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Configure sua chave PIX nas configurações do perfil antes de solicitar um saque.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1.5 mb-5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quanto deseja sacar?</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={saqueValor}
                  onChange={(e) => {
                    setSaqueValor(applyCurrencyMask(e.target.value));
                  }}
                  placeholder="R$ Mínimo 5,00"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-base font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
                <div className="flex justify-between items-center">
                  <p className="text-[10px] text-muted-foreground font-medium">
                    DISPONÍVEL: {fmt(saldoPessoal)}
                  </p>
                  <button
                    onClick={() => setSaqueValor(saldoPessoal.toFixed(2).replace(".", ","))}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    SACAR TUDO
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaque(false)}
                  className="flex-1 py-3 rounded-xl border border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  disabled={saqueLoading || !saqueValor || parseCurrencyMask(saqueValor) < 5 || parseCurrencyMask(saqueValor) > saldoPessoal || !saquePixKey}
                  onClick={async () => {
                    const val = parseCurrencyMask(saqueValor);
                    if (!val || val < 5 || val > saldoPessoal || !user || !saquePixKey) return;
                    setSaqueLoading(true);
                    try {
                      // Create withdrawal transaction with PIX key in metadata
                      const { error } = await supabase.from("transactions").insert({
                        user_id: user.id,
                        amount: val,
                        type: "saque",
                        status: "pending",
                        module: "comissoes",
                        metadata: { pix_key: saquePixKey, pix_key_type: saquePixKeyType },
                      });
                      if (error) throw error;
                      // Debit comissões using atomic RPC
                      const { error: e2 } = await supabase.rpc("increment_saldo", {
                        p_user_id: user.id,
                        p_tipo: "pessoal",
                        p_amount: -val,
                      });
                      if (e2) throw e2;
                      setSaldoPessoal(prev => prev - val);
                      toast.success(`Saque de ${fmt(val)} solicitado com sucesso!`);
                      setShowSaque(false);
                    } catch {
                      toast.error("Erro ao solicitar saque");
                    } finally {
                      setSaqueLoading(false);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saqueLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirmar e Sacar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

  const { calcFee: feeCalc } = useFeePreview();

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
              <button key={v} onClick={() => setDepositAmount(v.toFixed(2).replace(".", ","))}
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
              inputMode="numeric"
              value={depositAmount}
              onChange={e => setDepositAmount(applyCurrencyMask(e.target.value))}
              placeholder="Outro valor (mín. R$ 10)"
              min={10}
              className="w-full pl-10 pr-3 py-3 rounded-xl glass-input text-foreground font-bold text-lg focus:outline-none focus:ring-2 focus:ring-success/50 border border-border"
            />
            {depositAmount && parseFloat(depositAmount.replace(",", ".")) > 0 && parseFloat(depositAmount.replace(",", ".")) < 10 && (
              <p className="text-xs text-destructive mt-1">Valor mínimo: R$ 10,00</p>
            )}
          </div>

          {/* Fee preview */}
          {(() => {
            const val = parseFloat((depositAmount || "0").replace(",", "."));
            const preview = feeCalc(val);
            if (preview.hasFee && val >= 10) {
              return (
                <div className="rounded-xl bg-muted/30 border border-border px-4 py-3 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Valor do depósito</span>
                    <span className="font-mono">{fmt(val)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Taxa ({preview.feeLabel})</span>
                    <span className="font-mono text-destructive/80">-{fmt(preview.feeAmount)}</span>
                  </div>
                  <div className="border-t border-border pt-1 flex justify-between text-sm font-semibold">
                    <span className="text-foreground">Você receberá</span>
                    <span className="text-success font-mono">{fmt(preview.netAmount)}</span>
                  </div>
                </div>
              );
            }
            return null;
          })()}

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
            {pixData.fee_amount && pixData.fee_amount > 0 ? (
              <motion.div
                className="mt-1 space-y-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs text-muted-foreground">
                  Taxa: <span className="font-mono text-destructive/80">-{fmt(pixData.fee_amount)}</span>
                  {pixData.fee_type === "percentual" && pixData.fee_value ? ` (${pixData.fee_value}%)` : ""}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  Você receberá: <span className="text-success">{fmt(pixData.net_amount ?? pixData.amount)}</span>
                </p>
              </motion.div>
            ) : (
              <motion.p
                className="text-xs text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                via Pix
              </motion.p>
            )}
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
                {t.status === "completed" ? <AnimatedCheck size={18} className="text-success" /> : t.status === "expired" ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="text-destructive text-sm font-bold block">✕</motion.span> : <Loader2 className="h-4 w-4 text-warning animate-spin" />}
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
