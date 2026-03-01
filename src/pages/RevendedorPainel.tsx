import { useAuth } from "@/hooks/useAuth";
import BrandedQRCode from "@/components/BrandedQRCode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { MobileBottomNav, NavItem } from "@/components/MobileBottomNav";
import AnimatedCheck from "@/components/AnimatedCheck";
import { PromoBanner } from "@/components/PromoBanner";
import { createPixDeposit, checkPaymentStatus, PixResult } from "@/lib/payment";
import { useBackgroundPaymentMonitor } from "@/hooks/useBackgroundPaymentMonitor";
import { playSuccessSound } from "@/lib/sounds";
import { SkeletonValue, SkeletonRow, SkeletonCard } from "@/components/Skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Wallet, Smartphone, History, Send, Clock, MessageCircle,
  Menu, X, User, Activity, Landmark, CreditCard, CheckCircle2, XCircle,
  Wifi, Database, Shield, Server, AlertTriangle, Loader2, Eye, EyeOff, Save,
  QrCode, Copy, ExternalLink, RefreshCw, Store, Pencil, Search, Filter, Camera,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

interface Recarga {
  id: string;
  telefone: string;
  operadora: string | null;
  valor: number;
  custo: number;
  status: string;
  created_at: string;
}

interface CatalogValue {
  valueId: string;
  value: number;
  cost: number;
  label?: string;
}

interface CatalogCarrier {
  carrierId: string;
  name: string;
  order: number;
  extraField?: { required: boolean; title: string } | null;
  values: CatalogValue[];
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  module: string | null;
}

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
  const { user, role, signOut } = useAuth();
  const [saldo, setSaldo] = useState(0);
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PainelTab>("recarga");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileNome, setProfileNome] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Recarga form
  const [telefone, setTelefone] = useState("");
  const [clipboardPhone, setClipboardPhone] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<CatalogCarrier | null>(null);
  const [selectedValue, setSelectedValue] = useState<CatalogValue | null>(null);
  const [extraData, setExtraData] = useState("");
  const [sending, setSending] = useState(false);
  const [recargaResult, setRecargaResult] = useState<{ success: boolean; message: string; externalId?: string } | null>(null);
  const [trackingStatus, setTrackingStatus] = useState<{ loading: boolean; data: any | null; open: boolean }>({ loading: false, data: null, open: false });
  const [phoneCheckResult, setPhoneCheckResult] = useState<{ status: string; message: string } | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // API Catalog
  const [catalog, setCatalog] = useState<CatalogCarrier[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

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

  // Banner config from system_config
  const [bannerConfig, setBannerConfig] = useState<{ enabled: boolean; title: string; subtitle: string; link: string }>({ enabled: true, title: "", subtitle: "", link: "" });


  // Call edge function helper
  const callApi = useCallback(async (action: string, params: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("recarga-express", {
      body: { action, ...params },
    });
    if (error) throw new Error(error.message || "Erro na API");
    return data;
  }, []);

  const fetchCatalog = useCallback(async () => {
    setCatalogLoading(true);
    try {
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
            // Reseller rules first, then global rules, then face value
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
        // Fallback to API catalog if local DB fails
        try {
          const resp = await callApi("catalog");
          if (resp?.success && resp.data) setCatalog(resp.data);
        } catch { /* */ }
      }
    } catch (err) {
      console.error("Erro ao buscar catálogo:", err);
    }
    setCatalogLoading(false);
  }, [user?.id, callApi]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [{ data: saldoData }, { data: recargasData }, { data: profile }] = await Promise.all([
        supabase.from("saldos").select("valor").eq("user_id", user.id).eq("tipo", (role === "admin" || role === "revendedor") && !isClientMode ? "pessoal" : "revenda").maybeSingle(),
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
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [user]);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setTransLoading(true);
    try {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setTransactions(data || []);
    } catch { /* */ }
    setTransLoading(false);
  }, [user]);

  const fetchStatus = useCallback(async () => {
    try {
      const now24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [{ count: opsCount }, { count: recTotal }, { data: lastRec }, { data: completed24h }] = await Promise.all([
        supabase.from("operadoras").select("*", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("recargas").select("*", { count: "exact", head: true }),
        supabase.from("recargas").select("created_at").order("created_at", { ascending: false }).limit(1),
        supabase.from("recargas").select("operadora, created_at, completed_at").eq("status", "completed").not("completed_at", "is", null).gte("created_at", now24h),
      ]);

      // Calculate per-operator processing times using completed_at
      const opMap = new Map<string, number[]>();
      (completed24h || []).forEach((r: any) => {
        if (!r.operadora || !r.created_at || !r.completed_at) return;
        const diffMs = new Date(r.completed_at).getTime() - new Date(r.created_at).getTime();
        if (diffMs <= 0 || diffMs > 24 * 60 * 60 * 1000) return;
        const name = r.operadora;
        if (!opMap.has(name)) opMap.set(name, []);
        opMap.get(name)!.push(diffMs / 1000);
      });

      const operatorStats = Array.from(opMap.entries()).map(([operadora, times]) => {
        const sorted = [...times].sort((a, b) => a - b);
        const recent = sorted.slice(-3); // last 3
        return {
          operadora,
          avgRecent: recent.reduce((a, b) => a + b, 0) / recent.length,
          min24h: sorted[0],
          avg24h: sorted.reduce((a, b) => a + b, 0) / sorted.length,
          max24h: sorted[sorted.length - 1],
          recentCount: recent.length,
        };
      });

      // Ensure all active operators appear
      const activeOps = ["Claro", "TIM", "Vivo"];
      activeOps.forEach(op => {
        if (!operatorStats.find(s => s.operadora === op)) {
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



  // Background payment monitor - detects payments even when not on deposit tab
  const handleBgPaymentConfirmed = useCallback(() => {
    fetchData();
    fetchTransactions();
  }, [fetchData, fetchTransactions]);
  useBackgroundPaymentMonitor(user?.id, handleBgPaymentConfirmed);

  // Realtime: listen for recargas status changes
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
          toast.success(`✅ Recarga ${newRow.operadora || ""} R$ ${Number(newRow.valor).toFixed(2)} para ${newRow.telefone} concluída!`);
          playSuccessSound();
          fetchData();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchData]);

  useEffect(() => { fetchData(); fetchCatalog(); }, [fetchData, fetchCatalog]);
  useEffect(() => {
    supabase.from("system_config").select("key, value").in("key", ["bannerEnabled", "bannerTitle", "bannerSubtitle", "bannerLink"]).then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach(r => { map[r.key] = r.value || ""; });
      setBannerConfig({ enabled: map.bannerEnabled !== "false", title: map.bannerTitle || "", subtitle: map.bannerSubtitle || "", link: map.bannerLink || "" });
    });
  }, []);
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
            toast.success(`✅ Recarga ${r.operadora || ""} R$ ${Number(r.valor).toFixed(2)} para ${r.telefone} concluída!`);
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

  // Detect phone number in clipboard for quick paste
  useEffect(() => {
    if (tab !== "recarga" || telefone.length > 0) {
      setClipboardPhone(null);
      return;
    }
    const detectClipboard = async () => {
      try {
        if (!navigator.clipboard?.readText) return;
        const text = await navigator.clipboard.readText();
        if (!text) return;
        const digits = text.replace(/\D/g, "");
        if (digits.length >= 10 && digits.length <= 11) {
          setClipboardPhone(digits);
        }
      } catch { /* clipboard permission denied */ }
    };
    detectClipboard();
  }, [tab, telefone]);

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
      const formatted = dt.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      if (message.toLowerCase().includes("cooldown")) {
        return `⏳ Cooldown ativo!\nEste número recebeu uma recarga recentemente.\nUma nova recarga só será permitida após ${formatted}.`;
      }

      return message.replace(isoMatch[1], formatted);
    } catch {
      return message;
    }
  }, []);

  const handleCheckPhone = async () => {
    if (!telefone.trim()) { toast.error("Digite o número"); return; }
    if (!selectedCarrier?.carrierId) {
      toast.warning("Selecione a operadora antes de verificar. O cooldown pode variar por operadora.");
      return;
    }

    setCheckingPhone(true);
    setPhoneCheckResult(null);
    try {
      const resp = await callApi("check-phone", {
        phoneNumber: telefone.replace(/\D/g, ""),
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

  const handleRecarga = async (e: React.FormEvent) => {
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
        saldo_tipo: (role === "admin" || role === "revendedor") && !isClientMode ? "pessoal" : "revenda",
      });

      if (resp?.success) {
        const newBalance = resp.data?.localBalance ?? (saldo - selectedValue.cost);
        const externalId = resp.data?._id || null;
        const orderStatus = resp.data?.status;
        setRecargaResult({
          success: true,
          message: `Recarga de ${fmt(selectedValue.value)} (${selectedCarrier.name}) realizada para ${telefone}! Novo saldo: ${fmt(newBalance)}`,
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

  const handleTrackRecharge = async (externalId: string) => {
    setTrackingStatus({ loading: true, data: null, open: true });
    try {
      const resp = await callApi("orders");
      if (resp?.success && resp.data) {
        const orders = Array.isArray(resp.data) ? resp.data : resp.data.data || [];
        const order = orders.find((o: any) => o._id === externalId);
        setTrackingStatus({ loading: false, data: order || { _id: externalId, status: "Não encontrado" }, open: true });
      } else {
        setTrackingStatus({ loading: false, data: { _id: externalId, status: "Erro ao consultar" }, open: true });
      }
    } catch {
      setTrackingStatus({ loading: false, data: { _id: externalId, status: "Erro ao consultar" }, open: true });
    }
  };
  const fmtDate = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  const recargasHoje = recargas.filter((r) => r.created_at.startsWith(new Date().toISOString().split("T")[0])).length;
  const userLabel = profileNome || user?.email?.split("@")[0] || "Revendedor";
  const userInitial = (userLabel[0] || "R").toUpperCase();

  type MenuItem = { key: PainelTab; label: string; icon: typeof Send; active?: boolean; dashed?: boolean };
  const menuItems: MenuItem[] = [
    { key: "recarga", label: "Nova Recarga", icon: Send, active: true },
    { key: "addSaldo", label: "Adicionar Saldo", icon: CreditCard, dashed: true },
    { key: "historico", label: "Histórico de Pedidos", icon: History },
    { key: "extrato", label: "Extrato de Depósitos", icon: Landmark },
    { key: "contatos", label: "Minha Conta", icon: User },
    { key: "status", label: "Status do Sistema", icon: Activity },
  ];

  const tabTitle: Record<PainelTab, string> = {
    recarga: "Nova Recarga", addSaldo: "Adicionar Saldo", historico: "Histórico de Pedidos",
    extrato: "Extrato de Depósitos", contatos: "Minha Conta", status: "Status do Sistema",
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
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { data: existingFiles } = await supabase.storage.from("avatars").list(user.id);
      if (existingFiles?.length) {
        await supabase.storage.from("avatars").remove(existingFiles.map(f => `${user.id}/${f.name}`));
      }
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
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
    e.target.value = "";
  };

  const AvatarDisplay = ({ size = "w-10 h-10", textSize = "text-sm" }: { size?: string; textSize?: string }) => (
    avatarUrl ? (
      <img src={avatarUrl} alt="Avatar" className={`${size} rounded-full object-cover shrink-0`} />
    ) : (
      <div className={`${size} rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold ${textSize} shrink-0`}>
        {userInitial}
      </div>
    )
  );

  return (
    <div className="min-h-screen md:flex">
      {/* Mobile Menu Bottom Sheet */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 md:hidden rounded-t-2xl bg-background shadow-[0_-8px_30px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="font-display text-lg font-bold text-foreground">Menu</h2>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button onClick={() => setMenuOpen(false)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="mx-4 mb-3 p-3 rounded-xl bg-muted/50 rgb-border">
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
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl active:scale-95 ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/40 text-foreground hover:bg-muted/60"
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
                  className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl bg-muted/40 text-foreground hover:bg-muted/60 active:scale-95"
                >
                  <Store className="h-6 w-6 text-accent" />
                  <span className="text-[11px] font-semibold text-center leading-tight">Minha Loja</span>
                </a>
              )}

              {!isClientMode && (role === "admin" || role === "revendedor") && (
                <a
                  href="/admin"
                  className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl bg-muted/40 text-foreground hover:bg-muted/60 active:scale-95"
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
                className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:sticky top-0 left-0 h-screen w-[290px] z-30 border-r border-border glass-header">
        <div className="h-full flex flex-col">
          <div className="px-5 py-4 border-b border-border">
            <h1 className="font-display text-2xl font-bold shimmer-letters">
              Recargas <span className="brasil-word">Brasil</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-white font-medium mt-1">Revendedor</p>
          </div>

          <div className="p-4 space-y-3 border-b border-border">
            <div className="glass-card rounded-lg p-3 flex items-center gap-3 rgb-border">
              <AvatarDisplay />
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate uppercase">{userLabel}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <div className="glass-card rounded-lg p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Seu saldo</p>
              <p className="text-2xl font-bold text-success mt-0.5">{loading ? <SkeletonValue width="w-24" className="h-7" /> : fmt(saldo)}</p>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            {menuItems.map((item) => {
              const isActive = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => selectTab(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : item.dashed
                      ? "text-success border border-dashed border-success/40 hover:bg-success/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : item.dashed ? "text-success" : ""}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {!isClientMode && (role === "admin" || role === "revendedor") && (
              <div className="pt-3 mt-3 border-t border-border space-y-1">
                <div className="px-2 text-[10px] tracking-widest text-muted-foreground uppercase">Administração</div>
                <a href="/admin" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                  <Shield className="h-4 w-4" /> <span>Painel Admin</span>
                </a>
              </div>
            )}
          </nav>

          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tema</span>
              <ThemeToggle />
            </div>
            <button onClick={signOut}
              className="w-full py-2.5 rounded-lg border border-destructive/35 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="glass-header px-4 md:px-6 py-4 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl font-bold text-foreground">{tabTitle[tab]}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => selectTab("addSaldo")}
              className="h-9 px-4 rounded-xl bg-success text-success-foreground flex items-center gap-1.5 text-sm font-bold shadow-[0_0_16px_hsl(var(--success)/0.35)] hover:shadow-[0_0_24px_hsl(var(--success)/0.5)] hover:scale-105 active:scale-95 transition-all">
              <CreditCard className="h-4 w-4" />
              <span>{loading ? <SkeletonValue width="w-12" className="h-4" /> : fmt(saldo)}</span>
            </button>
            <div className="w-9 h-9 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold text-xs">
              {userInitial}
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { icon: Wallet, label: "Saldo", value: loading ? null : fmt(saldo), color: "text-success", anim: "bounce" as const },
              { icon: Smartphone, label: "Recargas Hoje", value: String(recargasHoje), color: "text-primary", anim: "float" as const },
              { icon: Clock, label: "Total", value: String(recargas.length), color: "text-accent", anim: "pulse" as const },
            ].map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <AnimatedIcon icon={c.icon} className={`h-4 w-4 ${c.color}`} animation={c.anim} delay={i * 0.12} />
                  <span className="text-xs text-muted-foreground">{c.label}</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground truncate">{c.value === null ? <SkeletonValue width="w-16" className="h-6" /> : c.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Banner Promocional */}
          <PromoBanner
            title={bannerConfig.title || undefined}
            subtitle={bannerConfig.subtitle || undefined}
            visible={bannerConfig.enabled}
            link={bannerConfig.link || undefined}
            onClose={() => setBannerConfig(prev => ({ ...prev, enabled: false }))}
          />

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
                      className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${recargaResult.success ? "bg-success/15" : "bg-destructive/15"}`}>
                      {recargaResult.success
                        ? <CheckCircle2 className="h-10 w-10 text-success" />
                        : <XCircle className="h-10 w-10 text-destructive" />
                      }
                    </motion.div>
                    <h3 className={`font-display text-xl font-bold mb-2 ${recargaResult.success ? "text-success" : "text-destructive"}`}>
                      {recargaResult.success ? "Recarga Realizada!" : "Erro na Recarga"}
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
                      <button onClick={() => { setRecargaResult(null); setTrackingStatus({ loading: false, data: null, open: false }); }}
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
                    className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center px-4"
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
                        <button onClick={() => setTrackingStatus(prev => ({ ...prev, open: false }))} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
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
                                : trackingStatus.data.status === "pendente" || trackingStatus.data.status === "pending" ? "⏳ Pendente"
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
                          {trackingStatus.data.value && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <span className="text-xs text-muted-foreground">Valor</span>
                              <span className="text-xs font-bold text-foreground">{fmt(Number(trackingStatus.data.value.cost || trackingStatus.data.value.value || 0))}</span>
                            </div>
                          )}
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
                        className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-start justify-center pt-8 md:pt-16 px-4"
                        onClick={() => setShowValoresModal(false)}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
                          className="glass-card rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 md:p-6"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                            <h3 className="font-display text-lg font-bold text-foreground">Valores e Operadoras Disponíveis</h3>
                            <button onClick={() => setShowValoresModal(false)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
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
                        <Smartphone className="h-9 w-9" />
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
                              // If user is deleting, just use raw value
                              if (raw.length < telefone.length) {
                                setTelefone(raw);
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
                          <button type="button" onClick={handleCheckPhone} disabled={checkingPhone || !telefone.trim() || !selectedCarrier}
                            className="w-full sm:w-auto px-5 py-3 rounded-xl glass-card text-sm font-bold text-primary hover:bg-primary/10 disabled:opacity-40 transition-all shrink-0 border border-primary/20">
                            {checkingPhone ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Verificar"}
                          </button>
                        </div>
                        {phoneCheckResult && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                            className={`mt-3 p-3 rounded-xl text-sm font-medium flex items-start gap-2 ${
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
                          className="px-5 py-4 border-b border-border last:border-0 flex items-center gap-3 hover:bg-muted/20 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-foreground">{r.operadora || "Operadora"}</p>
                            <p className="text-sm text-muted-foreground font-mono">{r.telefone}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-foreground">{fmt(r.valor)}</p>
                            <span className={`text-xs font-medium ${(r.status === "completed" || r.status === "concluida") ? "text-success" : r.status === "pending" ? "text-warning" : r.status === "falha" ? "text-destructive" : "text-muted-foreground"}`}>
                              {(r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Pendente" : r.status === "falha" ? "Falha" : r.status}
                            </span>
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
                        <option value="pending">Pendente</option>
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
                    <div className="md:hidden space-y-3">
                      {filtered.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">Nenhuma recarga encontrada</p>
                      ) : filtered.map((r, i) => {
                        const statusLabel = (r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Pendente" : r.status === "falha" ? "Falha" : r.status;
                        const statusClass = (r.status === "completed" || r.status === "concluida") ? "bg-success/15 text-success" : r.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                        return (
                          <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground text-sm">{r.operadora || "Operadora"}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{r.telefone}</p>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <span className="text-xs text-muted-foreground">{fmtDate(r.created_at)}</span>
                              <span className="font-bold font-mono text-foreground">{fmt(r.valor)}</span>
                            </div>
                          </motion.div>
                        );
                      })}
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
                              className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(r.created_at)}</td>
                              <td className="px-4 py-3 font-mono text-foreground">{r.telefone}</td>
                              <td className="px-4 py-3 text-foreground">{r.operadora || "—"}</td>
                              <td className="px-4 py-3 text-right font-mono font-medium text-foreground">{fmt(r.valor)}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                  (r.status === "completed" || r.status === "concluida") ? "bg-success/15 text-success" : r.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                                  {(r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Pendente" : r.status}
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

          {/* ===== TAB: EXTRATO ===== */}
          {tab === "extrato" && (
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {transLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
                ) : transactions.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada</p>
                ) : transactions.map((t, i) => {
                  const isDeposit = t.type === "deposit" || t.type === "deposito";
                  const statusLabel = (t.status === "completed" || t.status === "confirmado") ? "Confirmado" : t.status === "pending" ? "Pendente" : t.status;
                  const statusClass = (t.status === "completed" || t.status === "confirmado") ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                  return (
                    <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
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
                  );
                })}
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
                        <td className="px-4 py-3 text-foreground capitalize">{t.type}</td>
                        <td className="px-4 py-3 text-foreground">PIX</td>
                        <td className={`px-4 py-3 text-right font-mono font-medium ${(t.type === "deposit" || t.type === "deposito") ? "text-success" : "text-foreground"}`}>
                          {(t.type === "deposit" || t.type === "deposito") ? "+" : "-"}{fmt(t.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            (t.status === "completed" || t.status === "confirmado") ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"}`}>
                            {(t.status === "completed" || t.status === "confirmado") ? "Confirmado" : t.status === "pending" ? "Pendente" : t.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ===== TAB: CONTATOS (Minha Conta) ===== */}
          {tab === "contatos" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">Minha Conta</h3>
                <p className="text-sm text-muted-foreground">Gerencie seus dados pessoais e preferências.</p>
              </div>

              <div className="glass-card rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="relative cursor-pointer group">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold text-2xl shrink-0">
                        {userInitial}
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {uploadingAvatar ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
                    </div>
                    <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                  </label>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-lg text-foreground truncate uppercase">{userLabel}</p>
                    <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-semibold capitalize">
                      {role || "Revendedor"}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">Clique na foto para alterar • JPG, PNG, WebP ou GIF até 2MB</p>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">Saldo Atual</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{loading ? "..." : fmt(saldo)}</p>
                </div>
              </div>

              {/* Editar nome */}
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-bold text-foreground">Dados Pessoais</h4>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Nome</label>
                  <input
                    value={profileNome}
                    onChange={(e) => setProfileNome(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-foreground text-sm border border-border"
                    maxLength={100}
                  />
                </div>
                <button
                  onClick={async () => {
                    if (!user || !profileNome.trim()) { toast.error("Informe um nome válido"); return; }
                    try {
                      const { error } = await supabase.from("profiles").update({ nome: profileNome.trim() } as any).eq("id", user.id);
                      if (error) throw error;
                      toast.success("Nome atualizado!");
                    } catch { toast.error("Erro ao salvar nome"); }
                  }}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" /> Salvar Nome
                </button>
              </div>

              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-bold text-foreground">Integrações</h4>
                </div>
                <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0088cc, #0077b5)" }}>
                    <Send className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground">Telegram</p>
                    <p className="text-xs text-muted-foreground">{telegramLinked ? "Conta vinculada" : "Não configurado"}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${telegramLinked ? "text-success" : "text-muted-foreground"}`}>
                    {telegramLinked ? <><CheckCircle2 className="h-4 w-4" /> Ativo</> : "Inativo"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => selectTab("historico")} className="glass-card rounded-2xl p-4 text-left hover:bg-muted/40 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                    <History className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-bold text-foreground text-sm mt-2">Histórico de Pedidos</p>
                  <p className="text-xs text-muted-foreground">Ver todas as recargas</p>
                </button>
                <button onClick={() => selectTab("extrato")} className="glass-card rounded-2xl p-4 text-left hover:bg-muted/40 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-success/15 flex items-center justify-center">
                    <Landmark className="h-5 w-5 text-success" />
                  </div>
                  <p className="font-bold text-foreground text-sm mt-2">Histórico de Depósitos</p>
                  <p className="text-xs text-muted-foreground">Ver entradas de saldo</p>
                </button>
              </div>

              <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-bold text-foreground">Segurança</h4>
                </div>
                <button onClick={async () => {
                  if (!user?.email) return;
                  const { error } = await supabase.auth.resetPasswordForEmail(user.email);
                  if (error) toast.error("Erro ao enviar e-mail");
                  else toast.success("E-mail de redefinição enviado!");
                }} className="text-sm font-semibold text-primary hover:underline">
                  Alterar Senha
                </button>
              </div>

            </motion.div>
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
                  const opColor = op.operadora === "Claro" ? "text-red-400" : op.operadora === "TIM" ? "text-blue-400" : "text-purple-400";
                  const avgColor = op.avgRecent <= 120 ? "text-emerald-400" : op.avgRecent <= 300 ? "text-yellow-400" : "text-red-400";
                  return (
                    <motion.div key={op.operadora} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                      className="glass-card rounded-xl p-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                          <Smartphone className={`h-5 w-5 ${opColor}`} />
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

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        items={[
          { key: "recarga", label: "Recarga", icon: Send, color: "text-primary", animation: "bounce" },
          { key: "historico", label: "Pedidos", icon: History, color: "text-warning", animation: "wiggle" },
          { key: "addSaldo", label: "Saldo", icon: CreditCard, color: "text-success", animation: "pulse", highlighted: true },
          { key: "contatos", label: "Conta", icon: User, color: "text-accent", animation: "float" },
          { key: "extrato", label: "Extrato", icon: Landmark, color: "text-success", animation: "bounce" },
          { key: "status", label: "Status", icon: Activity, color: "text-warning", animation: "pulse" },
        ] as NavItem[]}
        activeKey={tab}
        onSelect={(key) => {
          selectTab(key as PainelTab);
        }}
        mainCount={4}
        userLabel={user?.email || userLabel}
        userRole={role === "admin" ? "Administrador" : role === "revendedor" ? "Revendedor" : role === "cliente" ? "Cliente" : "Usuário"}
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
  const [depositAmount, setDepositAmount] = useState("");
  const [generating, setGenerating] = useState(false);
  const [pixData, setPixData] = useState<PixResult | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState(0);
  const [pollCount, setPollCount] = useState(0);

  const presetAmounts = [20, 50, 100, 200, 500, 1000];

  // Auto-poll payment status every 5s when PIX is active
  useEffect(() => {
    if (!pixData?.payment_id || paymentConfirmed) return;
    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(pixData.payment_id);
        setPollCount(p => p + 1);
        if (status === "completed") {
          setPaymentConfirmed(true);
          setConfirmedAmount(pixData.amount);
          // Toast handled by useBackgroundPaymentMonitor to avoid duplicates
          onDeposited();
          fetchTransactions();
          clearInterval(interval);
        }
      } catch { /* silent */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [pixData, paymentConfirmed, onDeposited, fetchTransactions]);

  const handleGeneratePix = async (amount?: number) => {
    const value = amount || parseFloat(depositAmount.replace(",", "."));
    if (!value || value <= 0) {
      toast.error("Informe um valor válido");
      return;
    }
    setGenerating(true);
    setPixError(null);
    setPixData(null);
    setPaymentConfirmed(false);
    setPollCount(0);
    try {
      const result = await createPixDeposit(value, userEmail, userName, !resellerId ? false : false, resellerId, saldoTipo);
      setPixData(result);
    } catch (err: any) {
      const msg = err.message || "Erro ao gerar PIX";
      setPixError(msg);
      toast.error(msg);
    }
    setGenerating(false);
  };

  const handleCopyCode = () => {
    if (!pixData?.qr_code) return;
    navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCheckStatus = async () => {
    if (!pixData?.payment_id) return;
    setChecking(true);
    try {
      const status = await checkPaymentStatus(pixData.payment_id);
      if (status === "completed") {
        setPaymentConfirmed(true);
        setConfirmedAmount(pixData.amount);
        // Toast handled by useBackgroundPaymentMonitor to avoid duplicates
        onDeposited();
        fetchTransactions();
      } else {
        toast.info("Pagamento ainda pendente. Aguarde a confirmação.");
      }
    } catch { toast.error("Erro ao verificar status"); }
    setChecking(false);
  };

  const handleNewPix = () => {
    setPixData(null);
    setDepositAmount("");
    setPaymentConfirmed(false);
    setPollCount(0);
    setConfirmedAmount(0);
  };

  const depositTxs = transactions.filter(t => t.type === "deposit");

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
              onChange={e => setDepositAmount(e.target.value.replace(/[^0-9,.]/g, ""))}
              placeholder="Outro valor"
              className="w-full pl-10 pr-3 py-3 rounded-xl glass-input text-foreground font-bold text-lg focus:outline-none focus:ring-2 focus:ring-success/50 border border-border"
            />
          </div>

          {/* Generate button - full width below */}
          <button
            onClick={() => handleGeneratePix()}
            disabled={generating || !depositAmount}
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
              via {pixData.gateway}
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${t.status === "completed" ? "bg-success/15" : "bg-warning/15"}`}>
                {t.status === "completed" ? <AnimatedCheck size={18} className="text-success" /> : <Loader2 className="h-4 w-4 text-warning animate-spin" />}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Depósito PIX</p>
                <p className="text-xs text-muted-foreground">{fmtDate(t.created_at)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${t.status === "completed" ? "text-success" : "text-warning"}`}>+{fmt(t.amount)}</p>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${t.status === "completed" ? "text-success" : "text-warning"}`}>
                {t.status === "completed" ? "✓ Confirmado" : "⏳ Pendente"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
