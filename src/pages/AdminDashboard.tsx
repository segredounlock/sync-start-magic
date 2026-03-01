import { useAuth } from "@/hooks/useAuth";
import { BroadcastForm } from "@/components/BroadcastForm";
import { BroadcastProgress } from "@/components/BroadcastProgress";
import { SkeletonRow, SkeletonCard, SkeletonValue } from "@/components/Skeleton";
import BrandedQRCode from "@/components/BrandedQRCode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { RealtimeNotifications } from "@/components/RealtimeNotifications";
import { MobileBottomNav, NavItem } from "@/components/MobileBottomNav";
import { createPixDeposit, checkPaymentStatus, PixResult } from "@/lib/payment";
import { useBackgroundPaymentMonitor } from "@/hooks/useBackgroundPaymentMonitor";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Users, DollarSign, Smartphone, BarChart3, Plus, Search,
  ToggleLeft, ToggleRight, History, Package, Landmark, TrendingUp,
  Wallet, RefreshCw, CreditCard, FileText, ArrowUpRight, Settings, Tag,
  Save, Eye, EyeOff, Globe, Key, Bot, Zap, Menu, X,
  Wifi, WifiOff, Hash, AtSign, Trash2, AlertTriangle, CheckCircle2, ChevronDown, Link2, RotateCcw,
  Settings2, Store, Upload, Palette, Image, Copy, Loader2, QrCode, ExternalLink, Clock,
  Megaphone, Send,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAll";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

interface Revendedor {
  id: string;
  nome: string | null;
  email: string | null;
  active: boolean;
  created_at: string;
  saldo: number;
  role: string;
}

interface RecargaHistorico {
  user_id: string;
  id: string;
  telefone: string;
  operadora: string | null;
  valor: number;
  custo: number;
  status: string;
  created_at: string;
  user_nome: string | null;
  user_email: string | null;
}

interface Operadora {
  id: string;
  nome: string;
  valores: number[];
  ativo: boolean;
}

interface PricingRule {
  id?: string;
  operadora_id: string;
  valor_recarga: number;
  custo: number;
  tipo_regra: "fixo" | "margem";
  regra_valor: number;
}

type Period = "hoje" | "7dias" | "mes" | "total";

export default function AdminDashboard() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"visao" | "historico" | "operadoras" | "usuarios" | "depositos" | "configuracoes" | "precificacao" | "meusprecos" | "bot" | "gateway" | "loja" | "addSaldo" | "broadcast">("visao");
  const [userSubTab, setUserSubTab] = useState<"revendedores" | "clientes">(role === "revendedor" ? "clientes" : "revendedores");
  const [configSubTab, setConfigSubTab] = useState<"geral" | "pagamentos" | "depositos">("geral");
  const [period, setPeriod] = useState<Period>("7dias");
  const [userSearch, setUserSearch] = useState("");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ email: "", password: "", nome: "", saldo: "0", role: "revendedor" });
  const [creatingUser, setCreatingUser] = useState(false);
  const [editSaldoUser, setEditSaldoUser] = useState<Revendedor | null>(null);
  const [editSaldoValue, setEditSaldoValue] = useState("");
  const [savingSaldo, setSavingSaldo] = useState(false);
  const [confirmRoleRemove, setConfirmRoleRemove] = useState<Revendedor | null>(null);

  // Broadcast state
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastProgressId, setBroadcastProgressId] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastUserCount, setBroadcastUserCount] = useState(0);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);

  // All recargas for analytics
  const [allRecargas, setAllRecargas] = useState<RecargaHistorico[]>([]);
  const [allTransactions, setAllTransactions] = useState<{ amount: number; created_at: string; status: string; type: string }[]>([]);
  const [allProfiles, setAllProfiles] = useState<{ id: string; telegram_id: string | null; telegram_username: string | null; created_at: string }[]>([]);

  // Historico state
  const [recargas, setRecargas] = useState<RecargaHistorico[]>([]);
  const [recargasLoading, setRecargasLoading] = useState(false);
  const [recargaSearch, setRecargaSearch] = useState("");

  // Operadoras state
  const [operadoras, setOperadoras] = useState<Operadora[]>([]);
  const [operadorasLoading, setOperadorasLoading] = useState(false);
  const [showOperadoraModal, setShowOperadoraModal] = useState(false);
  const [editOperadora, setEditOperadora] = useState<Operadora | null>(null);

  // Config state
  const [configData, setConfigData] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaving, setConfigSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showMpKeyTest, setShowMpKeyTest] = useState(false);
  const [showMpKeyProd, setShowMpKeyProd] = useState(false);
  const [botStatus, setBotStatus] = useState<{
    connected: boolean; loading: boolean; botName: string | null; botUsername: string | null;
    botId: string | null; error: string | null; webhookUrl: string | null; webhookError: string | null;
    pendingUpdates: number | null;
  }>({ connected: false, loading: false, botName: null, botUsername: null, botId: null, error: null, webhookUrl: null, webhookError: null, pendingUpdates: null });

  // Gateway config (reseller's own)
  const [gwModule, setGwModule] = useState("");
  const [gwFields, setGwFields] = useState<Record<string, string>>({});
  const [gwLoading, setGwLoading] = useState(false);
  const [gwSaving, setGwSaving] = useState(false);
  const [gwShowSecrets, setGwShowSecrets] = useState<Record<string, boolean>>({});

  // Store customization
  const [storeSlug, setStoreSlug] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storePrimaryColor, setStorePrimaryColor] = useState("#10b981");
  const [storeSecondaryColor, setStoreSecondaryColor] = useState("#1e293b");
  const [storeLogoUrl, setStoreLogoUrl] = useState("");
  const [storeSaving, setStoreSaving] = useState(false);
  const [storeLogoUploading, setStoreLogoUploading] = useState(false);

  const gatewayOptions = [
    { value: "", label: "Nenhuma (usar gateway global)" },
    { value: "mercadopago", label: "Mercado Pago" },
    { value: "pushinpay", label: "PushinPay" },
    { value: "virtualpay", label: "VirtualPay" },
    { value: "efipay", label: "Efi Pay" },
    { value: "misticpay", label: "MisticPay" },
  ];
  const gatewayFieldDefs: Record<string, { key: string; label: string; secret?: boolean }[]> = {
    mercadopago: [
      { key: "mercadoPagoModo", label: "Modo (prod ou test)" },
      { key: "mercadoPagoKeyProd", label: "Token Produção", secret: true },
      { key: "mercadoPagoKeyTest", label: "Token Teste", secret: true },
    ],
    pushinpay: [{ key: "pushinPayToken", label: "Token PushinPay", secret: true }],
    virtualpay: [
      { key: "virtualPayClientId", label: "Client ID", secret: true },
      { key: "virtualPayClientSecret", label: "Client Secret", secret: true },
      { key: "virtualPayPlatformId", label: "Platform ID" },
    ],
    efipay: [
      { key: "efiPayClientId", label: "Client ID", secret: true },
      { key: "efiPayClientSecret", label: "Client Secret", secret: true },
      { key: "efiPayPixKey", label: "Chave PIX" },
      { key: "efiPaySandbox", label: "Sandbox (true/false)" },
    ],
    misticpay: [
      { key: "misticPayClientId", label: "Client ID", secret: true },
      { key: "misticPayClientSecret", label: "Client Secret", secret: true },
    ],
  };

  const refreshBotStatus = useCallback(async (token?: string) => {
    const tkn = token || configData.telegramBotToken;
    if (!tkn) return;
    setBotStatus(prev => ({ ...prev, loading: true }));
    try {
      const resp = await fetch(`https://api.telegram.org/bot${tkn}/getMe`);
      const data = await resp.json();
      if (data.ok) {
        setBotStatus({ connected: true, loading: false, botName: data.result.first_name, botUsername: data.result.username, botId: String(data.result.id), error: null, webhookUrl: null, webhookError: null, pendingUpdates: null });
        const whResp = await fetch(`https://api.telegram.org/bot${tkn}/getWebhookInfo`);
        const whData = await whResp.json();
        if (whData.ok) setBotStatus(prev => ({ ...prev, webhookUrl: whData.result.url || null, webhookError: whData.result.last_error_message || null, pendingUpdates: whData.result.pending_update_count ?? null }));
      } else {
        setBotStatus({ connected: false, loading: false, botName: null, botUsername: null, botId: null, error: data.description, webhookUrl: null, webhookError: null, pendingUpdates: null });
      }
    } catch { setBotStatus({ connected: false, loading: false, botName: null, botUsername: null, botId: null, error: "Erro de conexão", webhookUrl: null, webhookError: null, pendingUpdates: null }); }
  }, [configData.telegramBotToken]);
  const [tokenSectionOpen, setTokenSectionOpen] = useState(false);
  const [validatingToken, setValidatingToken] = useState(false);
  const [showVpSecret, setShowVpSecret] = useState(false);
  const [showPpToken, setShowPpToken] = useState(false);

  // Depositos state
  const [depositTransactions, setDepositTransactions] = useState<{ id: string; amount: number; created_at: string; status: string; type: string; module: string | null; user_id: string; payment_id?: string | null; metadata?: any; user_nome?: string; user_email?: string }[]>([]);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositSearch, setDepositSearch] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState<typeof depositTransactions[0] | null>(null);
  const [meuSaldo, setMeuSaldo] = useState(0);
  const [myTransactions, setMyTransactions] = useState<{ id: string; amount: number; type: string; status: string; created_at: string; module: string | null }[]>([]);

  // Client management state
  const [clientsList, setClientsList] = useState<{ id: string; nome: string | null; email: string | null; created_at: string; saldo: number }[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [creditClientModal, setCreditClientModal] = useState<{ id: string; nome: string | null; email: string | null; saldo: number } | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditSaving, setCreditSaving] = useState(false);
  const [clientHistoryModal, setClientHistoryModal] = useState<{ id: string; nome: string | null; email: string | null } | null>(null);
  const [clientRecargas, setClientRecargas] = useState<{ id: string; telefone: string; operadora: string | null; valor: number; status: string; created_at: string }[]>([]);
  const [clientRecargasLoading, setClientRecargasLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!user?.id) return;
    setClientsLoading(true);
    try {
      // Get profiles where reseller_id = current user
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email, created_at")
        .eq("reseller_id" as any, user.id)
        .order("created_at", { ascending: false });
      
      if (!profiles?.length) { setClientsList([]); setClientsLoading(false); return; }
      
      const clientIds = profiles.map(p => p.id);
      const { data: saldos } = await supabase.from("saldos").select("user_id, valor").in("user_id", clientIds).eq("tipo", "revenda");
      const saldoMap: Record<string, number> = {};
      saldos?.forEach(s => { saldoMap[s.user_id] = Number(s.valor); });
      
      setClientsList(profiles.map(p => ({
        id: p.id,
        nome: p.nome,
        email: p.email,
        created_at: p.created_at,
        saldo: saldoMap[p.id] ?? 0,
      })));
    } catch (err) { console.error(err); }
    setClientsLoading(false);
  }, [user]);

  const handleCreditClient = async () => {
    if (!creditClientModal || !creditAmount) return;
    const amount = parseFloat(creditAmount.replace(",", "."));
    if (!amount || amount <= 0) { toast.error("Valor inválido"); return; }
    setCreditSaving(true);
    try {
      const newSaldo = creditClientModal.saldo + amount;
      const { error } = await supabase.from("saldos").update({ valor: newSaldo }).eq("user_id", creditClientModal.id).eq("tipo", "revenda");
      if (error) throw error;
      
      // Record the transaction
      await supabase.from("transactions").insert({
        user_id: creditClientModal.id,
        amount,
        type: "deposit",
        status: "completed",
        module: "manual",
        metadata: { credited_by: user?.id, credited_by_email: user?.email } as any,
      });
      
      supabase.functions.invoke("telegram-notify", {
        body: { type: "saldo_added", user_id: creditClientModal.id, data: { valor: amount, novo_saldo: newSaldo } },
      }).catch(() => {});
      toast.success(`${fmt(amount)} creditado para ${creditClientModal.nome || creditClientModal.email}!`);
      setCreditClientModal(null);
      setCreditAmount("");
      fetchClients();
    } catch (err: any) { toast.error(err.message || "Erro ao creditar"); }
    setCreditSaving(false);
  };

  const fetchClientRecargas = async (clientId: string) => {
    setClientRecargasLoading(true);
    try {
      const { data } = await supabase.from("recargas").select("id, telefone, operadora, valor, status, created_at")
        .eq("user_id", clientId).order("created_at", { ascending: false }).limit(50);
      setClientRecargas((data || []).map(r => ({ ...r, valor: Number(r.valor) })));
    } catch { /* */ }
    setClientRecargasLoading(false);
  };

  const fetchMyTransactions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase.from("transactions").select("id, amount, type, status, created_at, module").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
      setMyTransactions((data || []).map(t => ({ ...t, amount: Number(t.amount) })));
    } catch { /* */ }
  }, [user]);

  const periodStart = useMemo(() => {
    const now = new Date();
    if (period === "hoje") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    if (period === "7dias") { const d = new Date(now); d.setDate(d.getDate() - 7); return d.toISOString(); }
    if (period === "mes") return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    return new Date(2020, 0, 1).toISOString();
  }, [period]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (role === "revendedor") {
        // Revendedor: only fetch their own clients (profiles with reseller_id = user.id)
        const [clientProfiles, ownSaldos, clientSaldos, recData, transData] = await Promise.all([
          fetchAllRows("profiles", { filters: (q: any) => q.eq("reseller_id", user?.id) }),
          fetchAllRows("saldos", { filters: (q: any) => q.eq("user_id", user?.id).eq("tipo", "revenda") }),
          fetchAllRows("saldos", { filters: (q: any) => q.eq("tipo", "revenda") }),
          fetchAllRows("recargas", { orderBy: { column: "created_at", ascending: false } }),
          fetchAllRows("transactions", { select: "amount, created_at, status, type, user_id", orderBy: { column: "created_at", ascending: false } }),
        ]);

        const clientIds = (clientProfiles || []).map((p: any) => p.id);
        
        // Own balance
        if (user?.id && ownSaldos?.length) setMeuSaldo(Number(ownSaldos[0].valor) || 0);

        const saldoMap: Record<string, number> = {};
        clientSaldos?.forEach((s: any) => { if (clientIds.includes(s.user_id)) saldoMap[s.user_id] = Number(s.valor); });

        const list: Revendedor[] = (clientProfiles || []).map((p: any) => ({
          id: p.id, nome: p.nome, email: p.email, active: p.active, created_at: p.created_at,
          saldo: saldoMap[p.id] ?? 0,
          role: "cliente",
        }));
        setRevendedores(list);

        setAllProfiles((clientProfiles || []).map((p: any) => ({ id: p.id, telegram_id: p.telegram_id, telegram_username: p.telegram_username, created_at: p.created_at })));

        // Filter recargas and transactions to only client IDs + own
        const allowedIds = new Set([...clientIds, user?.id]);
        const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
        (clientProfiles || []).forEach((p: any) => { profileMap[p.id] = { nome: p.nome, email: p.email }; });

        setAllRecargas((recData || []).filter((r: any) => allowedIds.has(r.user_id)).map((r: any) => ({
          ...r, valor: Number(r.valor), custo: Number(r.custo),
          user_nome: profileMap[r.user_id]?.nome || null,
          user_email: profileMap[r.user_id]?.email || null,
        })));
        setAllTransactions((transData || []).filter((t: any) => allowedIds.has(t.user_id)).map((t: any) => ({ ...t, amount: Number(t.amount) })));
      } else {
        // Admin: fetch ALL profiles, roles, and saldos
        const [allRoles, allProfilesData, allSaldos, recData, transData] = await Promise.all([
          fetchAllRows("user_roles", { select: "user_id, role" }),
          fetchAllRows("profiles"),
          fetchAllRows("saldos", { filters: (q: any) => q.eq("tipo", "revenda") }),
          fetchAllRows("recargas", { orderBy: { column: "created_at", ascending: false } }),
          fetchAllRows("transactions", { select: "amount, created_at, status, type", orderBy: { column: "created_at", ascending: false } }),
        ]);

        setAllProfiles((allProfilesData || []).map(p => ({ id: p.id, telegram_id: p.telegram_id, telegram_username: p.telegram_username, created_at: p.created_at })));
        setAllTransactions((transData || []).map(t => ({ ...t, amount: Number(t.amount) })));

        const roleMap: Record<string, string> = {};
        allRoles?.forEach(r => { roleMap[r.user_id] = r.role; });

        const saldoMap: Record<string, number> = {};
        allSaldos?.forEach(s => { saldoMap[s.user_id] = Number(s.valor); });

        if (user?.id) setMeuSaldo(saldoMap[user.id] ?? 0);
        const list: Revendedor[] = (allProfilesData || []).map(p => ({
          id: p.id, nome: p.nome, email: p.email, active: p.active, created_at: p.created_at,
          saldo: saldoMap[p.id] ?? 0,
          role: roleMap[p.id] || "user",
        }));
        setRevendedores(list);

        const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
        (allProfilesData || []).forEach((p: any) => { profileMap[p.id] = { nome: p.nome, email: p.email }; });

        setAllRecargas((recData || []).map(r => ({
          ...r, valor: Number(r.valor), custo: Number(r.custo),
          user_nome: profileMap[r.user_id]?.nome || null,
          user_email: profileMap[r.user_id]?.email || null,
        })));
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados");
    }
    setLoading(false);
  }, [role, user?.id]);

  const fetchRecargas = useCallback(async () => {
    setRecargasLoading(true);
    try {
      const { data: allRec } = await supabase.from("recargas").select("*").order("created_at", { ascending: false }).limit(200);
      if (!allRec?.length) { setRecargas([]); setRecargasLoading(false); return; }
      const userIds = [...new Set(allRec.map(r => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", userIds);
      const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
      profiles?.forEach(p => { profileMap[p.id] = { nome: p.nome, email: p.email }; });
      setRecargas(allRec.map(r => ({ ...r, valor: Number(r.valor), custo: Number(r.custo), user_nome: profileMap[r.user_id]?.nome || null, user_email: profileMap[r.user_id]?.email || null })));
    } catch (err) { console.error(err); }
    setRecargasLoading(false);
  }, []);

  const fetchOperadoras = useCallback(async () => {
    setOperadorasLoading(true);
    try {
      const { data } = await supabase.from("operadoras").select("*").order("nome");
      setOperadoras((data || []).map(o => ({ ...o, valores: (o.valores as unknown as number[]) || [] })));
    } catch (err) { console.error(err); }
    setOperadorasLoading(false);
  }, []);

  const fetchConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const { data } = await supabase.from("system_config").select("key, value");
      const map: Record<string, string> = {};
      data?.forEach(row => { map[row.key] = row.value || ""; });

      // Revendedor: load bot token from own profile (isolated)
      // Admin: keeps system_config token (same as /principal)
      if (role === "revendedor" && user?.id) {
        const { data: profile } = await supabase.from("profiles").select("telegram_bot_token").eq("id", user.id).maybeSingle();
        map.telegramBotToken = profile?.telegram_bot_token || "";
      }

      setConfigData(map);
    } catch (err) { console.error(err); }
    setConfigLoading(false);
  }, [role, user]);

  const saveConfig = async () => {
    setConfigSaving(true);
    try {
      const entries = Object.entries(configData);
      for (const [key, value] of entries) {
        // Revendedor: save bot token to own profile (isolated)
        // Admin: save to system_config (global, same as /principal)
        if (key === "telegramBotToken" && role === "revendedor") {
          if (user?.id) {
            await supabase.from("profiles").update({ telegram_bot_token: value }).eq("id", user.id);
          }
          continue;
        }
        await supabase.from("system_config").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      }
      toast.success("Configurações salvas com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    }
    setConfigSaving(false);
  };

  const fetchDeposits = useCallback(async () => {
    setDepositLoading(true);
    try {
      const { data: txs } = await supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(500);
      if (!txs?.length) { setDepositTransactions([]); setDepositLoading(false); return; }
      const userIds = [...new Set(txs.map(t => t.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", userIds);
      const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
      profiles?.forEach(p => { profileMap[p.id] = { nome: p.nome, email: p.email }; });
      setDepositTransactions(txs.map(t => ({ ...t, amount: Number(t.amount), user_nome: profileMap[t.user_id]?.nome || undefined, user_email: profileMap[t.user_id]?.email || undefined })));
    } catch (err) { console.error(err); }
    setDepositLoading(false);
  }, []);

  const fetchPricingRules = useCallback(async () => {
    try {
      const { data } = await supabase.from("pricing_rules").select("*");
      setPricingRules((data || []).map(r => ({ ...r, valor_recarga: Number(r.valor_recarga), custo: Number(r.custo), regra_valor: Number(r.regra_valor), tipo_regra: r.tipo_regra as "fixo" | "margem" })));
    } catch (err) { console.error(err); }
  }, []);

  const savePricingRule = async (rule: PricingRule) => {
    const key = `${rule.operadora_id}-${rule.valor_recarga}`;
    setPricingSaving(prev => ({ ...prev, [key]: true }));
    try {
      const { error } = await supabase.from("pricing_rules").upsert({
        operadora_id: rule.operadora_id,
        valor_recarga: rule.valor_recarga,
        custo: rule.custo,
        tipo_regra: rule.tipo_regra,
        regra_valor: rule.regra_valor,
        updated_at: new Date().toISOString(),
      }, { onConflict: "operadora_id,valor_recarga" });
      if (error) throw error;
      toast.success(`Regra para R$ ${rule.valor_recarga.toFixed(2)} salva!`);
      fetchPricingRules();
    } catch (err: any) { toast.error(err.message || "Erro ao salvar regra"); }
    setPricingSaving(prev => ({ ...prev, [key]: false }));
  };

  const fetchResellerPricingRules = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from("reseller_pricing_rules").select("*").eq("user_id", user.id);
      setResellerPricingRules((data || []).map((r: any) => ({ ...r, valor_recarga: Number(r.valor_recarga), custo: Number(r.custo), regra_valor: Number(r.regra_valor), tipo_regra: r.tipo_regra as "fixo" | "margem" })));
    } catch (err) { console.error(err); }
  }, [user]);

  const saveResellerPricingRule = async (rule: PricingRule) => {
    if (!user) return;
    const key = `r-${rule.operadora_id}-${rule.valor_recarga}`;
    setResellerPricingSaving(prev => ({ ...prev, [key]: true }));
    try {
      const { error } = await supabase.from("reseller_pricing_rules").upsert({
        user_id: user.id,
        operadora_id: rule.operadora_id,
        valor_recarga: rule.valor_recarga,
        custo: rule.custo,
        tipo_regra: rule.tipo_regra,
        regra_valor: rule.regra_valor,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,operadora_id,valor_recarga" } as any);
      if (error) throw error;
      toast.success(`Preço para R$ ${rule.valor_recarga.toFixed(2)} salvo!`);
      fetchResellerPricingRules();
    } catch (err: any) { toast.error(err.message || "Erro ao salvar"); }
    setResellerPricingSaving(prev => ({ ...prev, [key]: false }));
  };

  const resetResellerPricingRule = async (operadora_id: string, valor_recarga: number) => {
    const existing = resellerPricingRules.find(r => r.operadora_id === operadora_id && r.valor_recarga === valor_recarga);
    if (!existing?.id) return;
    try {
      await supabase.from("reseller_pricing_rules").delete().eq("id", existing.id);
      toast.success("Preço removido (usará preço global)");
      fetchResellerPricingRules();
    } catch (err: any) { toast.error(err.message || "Erro"); }
  };

  const resetPricingRule = async (operadora_id: string, valor_recarga: number) => {
    const existing = pricingRules.find(r => r.operadora_id === operadora_id && r.valor_recarga === valor_recarga);
    if (!existing?.id) return;
    try {
      await supabase.from("pricing_rules").delete().eq("id", existing.id);
      toast.success("Regra removida");
      fetchPricingRules();
    } catch (err: any) { toast.error(err.message || "Erro"); }
  };

  // Background payment monitor
  const handleBgPaymentConfirmed = useCallback(() => { fetchData(); }, [fetchData]);
  useBackgroundPaymentMonitor(user?.id, handleBgPaymentConfirmed);

  useEffect(() => { fetchData(); }, [fetchData]);
   useEffect(() => { if (tab === "historico") fetchRecargas(); }, [tab, fetchRecargas]);
  useEffect(() => { if (tab === "operadoras" || tab === "precificacao" || tab === "meusprecos") { fetchOperadoras(); fetchPricingRules(); } }, [tab, fetchOperadoras, fetchPricingRules]);
  useEffect(() => { if (tab === "meusprecos") fetchResellerPricingRules(); }, [tab]);
  useEffect(() => { if (tab === "configuracoes" || tab === "bot") fetchConfig(); }, [tab, fetchConfig]);
  useEffect(() => { if (tab === "bot" && configData.telegramBotToken && botStatus.connected) refreshBotStatus(); }, [tab]);
  useEffect(() => { if (tab === "depositos") fetchDeposits(); }, [tab, fetchDeposits]);
  useEffect(() => { if (tab === "addSaldo") fetchMyTransactions(); }, [tab, fetchMyTransactions]);

  // Filtered analytics data
  const filteredRecargas = useMemo(() => allRecargas.filter(r => r.created_at >= periodStart), [allRecargas, periodStart]);
  const filteredTransactions = useMemo(() => allTransactions.filter(t => t.created_at >= periodStart), [allTransactions, periodStart]);

  // Analytics computations
  const analytics = useMemo(() => {
    const totalVendas = filteredRecargas.reduce((s, r) => s + r.valor, 0);
    const totalCusto = filteredRecargas.reduce((s, r) => s + r.custo, 0);
    const lucro = totalVendas - totalCusto;
    const totalDeposited = filteredTransactions.filter(t => (t.status === "completed" || t.status === "confirmado") && (t.type === "deposit" || t.type === "deposito")).reduce((s, t) => s + t.amount, 0);
    const txCount = filteredTransactions.length;
    const saldoCarteiras = revendedores.reduce((s, r) => s + r.saldo, 0);
    const totalRec = filteredRecargas.length;
    const successRec = filteredRecargas.filter(r => r.status === "completed" || r.status === "concluida").length;
    const pendingRec = filteredRecargas.filter(r => r.status === "pending" || r.status === "pendente").length;
    const ticketMedio = totalRec > 0 ? totalVendas / totalRec : 0;

    return { totalVendas, totalCusto, lucro, totalDeposited, txCount, saldoCarteiras, totalRec, successRec, pendingRec, ticketMedio };
  }, [filteredRecargas, filteredTransactions, revendedores]);

  // Chart: Vendas & Lucro por dia
  const vendasLucroPorDia = useMemo(() => {
    const map: Record<string, { vendas: number; custo: number }> = {};
    filteredRecargas.forEach(r => {
      const day = r.created_at.split("T")[0];
      if (!map[day]) map[day] = { vendas: 0, custo: 0 };
      map[day].vendas += r.valor;
      map[day].custo += r.custo;
    });
    return Object.entries(map).sort().map(([day, v]) => ({
      day: new Date(day).toLocaleDateString("pt-BR", { weekday: "short" }),
      vendas: v.vendas,
      lucro: v.vendas - v.custo,
    }));
  }, [filteredRecargas]);

  const displayVendasLucro = vendasLucroPorDia;

  // Chart: Novos usuários por dia (preenche todos os dias do período)
  const novosPorDia = useMemo(() => {
    const map: Record<string, number> = {};
    revendedores.filter(r => r.created_at >= periodStart).forEach(r => {
      const day = r.created_at.split("T")[0];
      map[day] = (map[day] || 0) + 1;
    });
    // Preencher todos os dias do período
    const start = new Date(periodStart);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const days: { day: string; count: number }[] = [];
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split("T")[0];
      days.push({
        day: new Date(d.getFullYear(), d.getMonth(), d.getDate()).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
        count: map[key] || 0,
      });
    }
    return days;
  }, [revendedores, periodStart]);

  const displayNovosPorDia = novosPorDia;

  // Chart: Mix de operadoras
  const mixOperadoras = useMemo(() => {
    const map: Record<string, number> = {};
    filteredRecargas.forEach(r => {
      const op = r.operadora || "Outros";
      map[op] = (map[op] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredRecargas]);

  const displayMixOperadoras = mixOperadoras;

  // Chart: Volume de depósitos por dia
  const depositosPorDia = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.filter(t => (t.type === "deposit" || t.type === "deposito") && (t.status === "completed" || t.status === "confirmado")).forEach(t => {
      const day = t.created_at.split("T")[0];
      map[day] = (map[day] || 0) + t.amount;
    });
    return Object.entries(map).sort().map(([day, total]) => ({
      day: new Date(day).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      total,
    }));
  }, [filteredTransactions]);

  const displayDepositosPorDia = depositosPorDia;

  const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Pricing rules state
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [pricingSelectedOp, setPricingSelectedOp] = useState<string>("");
  const [pricingSaving, setPricingSaving] = useState<Record<string, boolean>>({});

  // Reseller pricing rules state
  const [resellerPricingRules, setResellerPricingRules] = useState<PricingRule[]>([]);
  const [resellerPricingSelectedOp, setResellerPricingSelectedOp] = useState<string>("");
  const [resellerPricingSaving, setResellerPricingSaving] = useState<Record<string, boolean>>({});




  const toggleOperadora = async (op: Operadora) => {
    const { error } = await supabase.from("operadoras").update({ ativo: !op.ativo }).eq("id", op.id);
    if (error) { toast.error("Erro ao atualizar operadora"); return; }
    toast.success(op.ativo ? "Operadora desativada" : "Operadora ativada");
    fetchOperadoras();
  };

  const deleteOperadora = async (op: Operadora) => {
    if (!confirm(`Excluir operadora ${op.nome}?`)) return;
    const { error } = await supabase.from("operadoras").delete().eq("id", op.id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Operadora excluída");
    fetchOperadoras();
  };




  const filteredRecargasHistorico = recargas.filter(r =>
    r.telefone.includes(recargaSearch) ||
    (r.user_nome || "").toLowerCase().includes(recargaSearch.toLowerCase()) ||
    (r.user_email || "").toLowerCase().includes(recargaSearch.toLowerCase()) ||
    (r.operadora || "").toLowerCase().includes(recargaSearch.toLowerCase())
  );

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

  // Gateway config fetch/save
  const fetchGatewayConfig = useCallback(async () => {
    if (!user) return;
    setGwLoading(true);
    try {
      const { data } = await supabase.from("reseller_config").select("key, value").eq("user_id", user.id);
      const cfg: Record<string, string> = {};
      data?.forEach((r: any) => { cfg[r.key] = r.value || ""; });
      setGwModule(cfg.paymentModule || "");
      setGwFields(cfg);
    } catch (err) { console.error(err); }
    setGwLoading(false);
  }, [user]);

  const saveGatewayConfig = async () => {
    if (!user) return;
    setGwSaving(true);
    try {
      const allKeys = ["paymentModule", ...(gatewayFieldDefs[gwModule] || []).map(f => f.key)];
      const values: Record<string, string> = { paymentModule: gwModule };
      for (const f of (gatewayFieldDefs[gwModule] || [])) { values[f.key] = gwFields[f.key] || ""; }
      for (const key of allKeys) {
        await supabase.from("reseller_config").upsert({ user_id: user.id, key, value: values[key] || "" }, { onConflict: "user_id,key" } as any);
      }
      toast.success("Gateway salva com sucesso!");
    } catch (err: any) { toast.error(err.message || "Erro ao salvar"); }
    setGwSaving(false);
  };

  // Store config fetch/save
  const fetchStoreConfig = useCallback(async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase.from("profiles").select("slug, store_name, store_logo_url, store_primary_color, store_secondary_color").eq("id", user.id).single();
      const p = profile as any;
      if (p) {
        setStoreSlug(p.slug || "");
        setStoreName(p.store_name || "");
        setStoreLogoUrl(p.store_logo_url || "");
        setStorePrimaryColor(p.store_primary_color || "#10b981");
        setStoreSecondaryColor(p.store_secondary_color || "#1e293b");
      }
    } catch {}
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setStoreLogoUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/logo.${ext}`;
      const { error: upErr } = await supabase.storage.from("store-logos").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("store-logos").getPublicUrl(path);
      setStoreLogoUrl(pub.publicUrl);
      toast.success("Logo enviado!");
    } catch (err: any) { toast.error(err.message || "Erro ao enviar logo"); }
    setStoreLogoUploading(false);
  };

  const saveStoreConfig = async () => {
    if (!user) return;
    setStoreSaving(true);
    try {
      const slugClean = storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-");
      if (slugClean && slugClean.length < 3) { toast.error("Slug: mínimo 3 caracteres"); setStoreSaving(false); return; }
      if (slugClean) {
        const { data: existing } = await supabase.from("profiles").select("id").eq("slug", slugClean).neq("id", user.id).maybeSingle();
        if (existing) { toast.error("Slug já em uso."); setStoreSaving(false); return; }
      }
      const { error } = await supabase.from("profiles").update({
        slug: slugClean || null, store_name: storeName.trim() || null,
        store_logo_url: storeLogoUrl || null, store_primary_color: storePrimaryColor || null,
        store_secondary_color: storeSecondaryColor || null,
      } as any).eq("id", user.id);
      if (error) throw error;
      setStoreSlug(slugClean);
      toast.success("Loja salva!");
    } catch (err: any) { toast.error(err.message || "Erro ao salvar"); }
    setStoreSaving(false);
  };

  const fetchBroadcastHistory = useCallback(async () => {
    const { data } = await (supabase.from('notifications' as any) as any)
      .select('id, title, sent_count, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      // Get progress status for each
      const ids = data.map((n: any) => n.id);
      const { data: progresses } = await (supabase.from('broadcast_progress' as any) as any)
        .select('notification_id, status')
        .in('notification_id', ids)
        .order('created_at', { ascending: false });
      
      const statusMap: Record<string, string> = {};
      progresses?.forEach((p: any) => { if (!statusMap[p.notification_id]) statusMap[p.notification_id] = p.status; });
      
      setBroadcastHistory(data.map((n: any) => ({ ...n, status: statusMap[n.id] || 'pending' })));
    }
  }, []);

  const fetchBroadcastUserCount = useCallback(async () => {
    const { count } = await (supabase.from('telegram_users' as any) as any)
      .select('*', { count: 'exact', head: true })
      .eq('is_blocked', false)
      .eq('is_registered', true);
    setBroadcastUserCount(count || 0);
  }, []);

  useEffect(() => { if (tab === "broadcast") { fetchBroadcastHistory(); fetchBroadcastUserCount(); } }, [tab, fetchBroadcastHistory, fetchBroadcastUserCount]);

  useEffect(() => { if (tab === "gateway") fetchGatewayConfig(); }, [tab, fetchGatewayConfig]);
  useEffect(() => { if (tab === "loja") fetchStoreConfig(); }, [tab, fetchStoreConfig]);
  useEffect(() => { if (tab === "usuarios" && userSubTab === "clientes") fetchClients(); }, [tab, userSubTab, fetchClients]);

  const [menuOpen, setMenuOpen] = useState(false);

  const allMenuItems: { key: string; icon: any; label: string; color: string; adminOnly?: boolean; link?: string }[] = [
    { key: "visao", icon: BarChart3, label: "Dashboard", color: "text-primary" },
    { key: "usuarios", icon: Users, label: role === "revendedor" ? "Meus Clientes" : "Usuários", color: "text-accent" },
    { key: "historico", icon: History, label: "Recargas", color: "text-warning" },
    { key: "addSaldo", icon: CreditCard, label: "Adicionar Saldo", color: "text-success" },
    { key: "depositos", icon: Landmark, label: "Depósitos", color: "text-success" },
    { key: "gateway", icon: Settings2, label: "Gateway de Pagamento", color: "text-warning", adminOnly: true },
    { key: "loja", icon: Store, label: "Minha Loja", color: "text-primary" },
    { key: "precificacao", icon: Tag, label: "Precificação", color: "text-warning", adminOnly: true },
    { key: "meusprecos", icon: DollarSign, label: "Meus Preços", color: "text-success" },
    { key: "bot", icon: Bot, label: "Bot", color: "text-accent" },
    { key: "broadcast", icon: Megaphone, label: "Broadcast", color: "text-warning", adminOnly: true },
    { key: "configuracoes", icon: Settings, label: "Configurações", color: "text-muted-foreground", adminOnly: true },
  ];
  const menuItems = role === "revendedor" ? allMenuItems.filter(m => !m.adminOnly) : allMenuItems;

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
            <div className="mx-4 mb-3 p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {(user?.email?.[0] || "A").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role || "Admin"}</p>
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
                    onClick={() => { if (item.link) { navigate(item.link); } else { setTab(item.key as any); } setMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl active:scale-95 ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/40 text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <item.icon className={`h-6 w-6 ${isActive ? "text-primary" : item.color}`} />
                    <span className={`text-[11px] font-semibold text-center leading-tight ${isActive ? "text-primary" : "text-foreground"}`}>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => { navigate("/painel"); setMenuOpen(false); }}
                className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl bg-muted/40 text-foreground hover:bg-muted/60 active:scale-95"
              >
                <Landmark className="h-6 w-6 text-accent" />
                <span className="text-[11px] font-semibold text-center leading-tight">Painel Cliente</span>
              </button>

              {role === "admin" && (
                <button
                  onClick={() => { navigate("/principal"); setMenuOpen(false); }}
                  className="flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl bg-muted/40 text-foreground hover:bg-muted/60 active:scale-95"
                >
                  <Users className="h-6 w-6 text-success" />
                  <span className="text-[11px] font-semibold text-center leading-tight">Principal</span>
                </button>
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
      <aside className="hidden md:block md:sticky top-0 left-0 h-screen w-[250px] z-30 border-r border-border glass-header">
        <div className="h-full flex flex-col">
          <div className="px-5 py-5 border-b border-border">
            <h1 className="font-display text-xl font-bold shimmer-letters">
              Recargas <span className="brasil-word">Brasil</span>
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-white font-medium mt-1">Admin</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {menuItems.map(item => {
              const isActive = tab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { if (item.link) { navigate(item.link); } else { setTab(item.key as any); } setMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <item.icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary-foreground" : item.color}`} />
                  <span>{item.label}</span>
                  {item.link && <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
                  {!item.link && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-border space-y-1">
            {role === "admin" && (
              <button onClick={() => navigate("/principal")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
                <Users className="h-4 w-4 text-success" /> <span>Principal</span>
              </button>
            )}
            <button onClick={() => navigate("/painel")} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors">
              <Landmark className="h-4 w-4 text-primary" /> <span>Painel Cliente</span>
            </button>
          </div>

          <div className="p-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
              <ThemeToggle />
            </div>
            <button onClick={signOut}
              className="w-full py-2.5 rounded-xl border border-destructive/35 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2">
              <LogOut className="h-4 w-4" /> Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <header className="glass-header px-4 md:px-6 py-3 sticky top-0 z-20 flex items-center gap-3">
          
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold text-foreground leading-tight">
              {menuItems.find(m => m.key === tab)?.label || "Dashboard"}
            </h2>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">
              {tab === "visao" && "Acompanhe o desempenho da plataforma."}
              {tab === "historico" && "Histórico global de todas as recargas realizadas."}
              {tab === "usuarios" && (role === "revendedor" ? "Gerencie seus clientes." : "Gerencie usuários e clientes do sistema.")}
              {tab === "depositos" && "Acompanhe todos os depósitos."}
              {tab === "addSaldo" && "Deposite via PIX para adicionar saldo."}
              {tab === "configuracoes" && "Configure a plataforma."}
              {tab === "bot" && "Configure o bot do Telegram."}
              {tab === "gateway" && "Configure sua gateway de pagamento."}
              {tab === "loja" && "Personalize a aparência da sua loja."}
              {tab === "meusprecos" && "Defina seus próprios preços para sua loja."}
              {tab === "broadcast" && "Envie mensagens em massa para seus usuários do Telegram."}
              
            </p>
          </div>
          {tab === "historico" && (
            <button onClick={fetchRecargas} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors" title="Atualizar">
              <RefreshCw className={`h-4 w-4 ${recargasLoading ? "animate-spin" : ""}`} />
            </button>
          )}
          <RealtimeNotifications listenTo={["deposit"]} />
        </header>

        <main className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-6">

        {/* ===== VISÃO GERAL ===== */}
        {tab === "visao" && (
          <>
            {/* Period Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Visão Geral</h2>
                <p className="text-sm text-muted-foreground">Acompanhe o desempenho da sua plataforma.</p>
              </div>
              <div className="flex rounded-lg overflow-hidden glass w-fit">
                {([
                  { key: "hoje", label: "Hoje" },
                  { key: "7dias", label: "7 Dias" },
                  { key: "mes", label: "Mês Atual" },
                  { key: "total", label: "Todo Período" },
                ] as { key: Period; label: string }[]).map(p => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Meu Saldo */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 mb-6 max-w-md">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Meu Saldo</span>
                </div>
                <button onClick={() => setTab("addSaldo")}
                  className="h-8 px-3 rounded-lg bg-success text-success-foreground flex items-center gap-1.5 text-xs font-bold shadow-[0_0_12px_hsl(var(--success)/0.3)] hover:shadow-[0_0_20px_hsl(var(--success)/0.5)] hover:scale-105 active:scale-95 transition-all">
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Saldo
                </button>
              </div>
              <p className="text-3xl font-bold text-foreground">{fmt(meuSaldo)}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">Mantenha recarregado para operar</span>
                <button onClick={fetchData} className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground">
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </motion.div>


            {/* Performance Financeira */}
            <h3 className="font-display text-lg font-bold text-foreground mb-3">Performance Financeira & Operacional</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Resultado Financeiro - span 1 */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                    <AnimatedIcon icon={TrendingUp} className="h-4 w-4 text-success" animation="bounce" delay={0.05} />
                  </div>
                  <span className="text-sm text-muted-foreground">Resultado Financeiro</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{fmt(analytics.lucro)}</p>
                <span className="text-xs font-semibold text-success">Lucro Bruto</span>
                <div className="flex justify-between mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Total Vendas</p>
                    <p className="text-sm font-bold text-foreground">{fmt(analytics.totalVendas)}</p>
                  </div>
                  {role === "admin" && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Custo Provider</p>
                    <p className="text-sm font-bold text-destructive">- {fmt(analytics.totalCusto)}</p>
                  </div>
                  )}
                  {role === "revendedor" && (
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">Meu Custo</p>
                    <p className="text-sm font-bold text-destructive">- {fmt(analytics.totalVendas - analytics.lucro)}</p>
                  </div>
                  )}
                </div>
              </motion.div>

              {/* Total Depositado */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <AnimatedIcon icon={CreditCard} className="h-4 w-4 text-primary" animation="pulse" delay={0.1} />
                  </div>
                  <span className="text-sm text-muted-foreground">Total Depositado</span>
                  <span className="ml-auto text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">{analytics.txCount} txs</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{fmt(analytics.totalDeposited)}</p>
              </motion.div>

              {/* Saldo em Carteiras */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center">
                    <AnimatedIcon icon={Wallet} className="h-4 w-4 text-warning" animation="wiggle" delay={0.15} />
                  </div>
                  <span className="text-sm text-muted-foreground">Saldo em Carteiras</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{fmt(analytics.saldoCarteiras)}</p>
                <span className="text-xs text-success">Passivo do Sistema</span>
              </motion.div>
            </div>

            {/* KPI Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Volume de Recargas */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AnimatedIcon icon={Smartphone} className="h-5 w-5 text-primary" animation="float" />
                  <span className="font-semibold text-foreground">Volume de Recargas</span>
                  {analytics.pendingRec > 0 && (
                    <span className="ml-auto text-xs bg-destructive/15 text-destructive px-2 py-0.5 rounded-full font-medium">● {analytics.pendingRec} Pendentes</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-foreground">{analytics.totalRec}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-success/10">
                    <p className="text-[10px] text-success">Sucesso</p>
                    <p className="text-lg font-bold text-success">{analytics.successRec}</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-destructive/10">
                    <p className="text-[10px] text-destructive">Pendentes</p>
                    <p className="text-lg font-bold text-destructive">{analytics.pendingRec}</p>
                  </div>
                </div>
              </motion.div>

              {/* Usuários Únicos */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <AnimatedIcon icon={Users} className="h-4 w-4 text-primary" animation="pulse" delay={0.25} />
                  </div>
                  <span className="text-sm text-muted-foreground">Usuários Únicos</span>
                  {allProfiles.filter(p => p.created_at >= periodStart).length > 0 && (
                    <span className="ml-auto text-xs bg-success/15 text-success px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="h-3 w-3" />+{allProfiles.filter(p => p.created_at >= periodStart).length} novos
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-foreground">{allProfiles.length || revendedores.length}</p>
                <span className="text-xs text-muted-foreground">Site + Bot Telegram</span>
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                  <div className="text-center p-1.5 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Total</p>
                    <p className="text-sm font-bold text-foreground">{allProfiles.length || revendedores.length}</p>
                  </div>
                  <div className="text-center p-1.5 rounded-lg bg-success/10">
                    <p className="text-[10px] text-success flex items-center justify-center gap-0.5"><Bot className="h-3 w-3" /> Bot</p>
                    <p className="text-sm font-bold text-success">{allProfiles.filter(p => !!p.telegram_id).length}</p>
                  </div>
                  <div className="text-center p-1.5 rounded-lg bg-primary/10">
                    <p className="text-[10px] text-primary flex items-center justify-center gap-0.5"><Globe className="h-3 w-3" /> Site</p>
                    <p className="text-sm font-bold text-primary">{allProfiles.filter(p => !p.telegram_id).length || revendedores.length}</p>
                  </div>
                </div>
              </motion.div>

              {/* Ticket Médio */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                    <AnimatedIcon icon={FileText} className="h-4 w-4 text-accent-foreground" animation="bounce" delay={0.3} />
                  </div>
                  <span className="text-sm text-muted-foreground">Ticket Médio</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{fmt(analytics.ticketMedio)}</p>
              </motion.div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Vendas & Lucro */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-success/15 flex items-center justify-center">
                    <BarChart3 className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Vendas & Lucro (7 dias)</h4>
                    <p className="text-[10px] text-muted-foreground">Recargas realizadas pelo bot</p>
                  </div>
                </div>
                <div className="h-64 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayVendasLucro} barGap={2}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip formatter={(v: any, name: string) => [fmt(Number(v)), name]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Bar dataKey="lucro" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="Lucro" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Novos Usuários */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-5">
                <h4 className="font-semibold text-foreground mb-4">Novos Usuários</h4>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={displayNovosPorDia}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Novos" />
                      </BarChart>
                    </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Por Operadora */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Por Operadora</h4>
                    <p className="text-[10px] text-muted-foreground">Distribuição de vendas</p>
                  </div>
                </div>
                <div className="h-52 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={displayMixOperadoras} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                        {displayMixOperadoras.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any, name: string) => {
                        const total = displayMixOperadoras.reduce((s, o) => s + o.value, 0);
                        const pct = total > 0 ? ((Number(v) / total) * 100).toFixed(0) : 0;
                        return [`${v} (${pct}%)`, name];
                      }} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {displayMixOperadoras.map((op, i) => {
                    const total = displayMixOperadoras.reduce((s, o) => s + o.value, 0);
                    const pct = total > 0 ? ((op.value / total) * 100).toFixed(0) : 0;
                    return (
                      <div key={op.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {op.name} {pct}%
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Volume de Depósitos */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card rounded-xl p-5">
                <h4 className="font-semibold text-foreground mb-4">Volume de Depósitos</h4>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={displayDepositosPorDia}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `R$ ${v}`} />
                        <Tooltip formatter={(v: any) => [fmt(Number(v)), "Depósitos"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} name="Depósitos" />
                      </LineChart>
                    </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </>
        )}

        {/* ===== HISTÓRICO ===== */}
        {tab === "historico" && (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={recargaSearch} onChange={e => setRecargaSearch(e.target.value)} placeholder="Buscar por telefone, revendedor ou operadora..." className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            </div>
            {/* Mobile: Card Layout */}
            <div className="md:hidden space-y-3">
              {recargasLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : filteredRecargasHistorico.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma recarga encontrada</p>
              ) : filteredRecargasHistorico.map(r => {
                const initials = (r.user_nome || r.user_email || "?").slice(0, 2).toUpperCase();
                const avatarColors = ["bg-primary", "bg-accent", "bg-warning", "bg-success", "bg-destructive"];
                const colorIdx = (r.user_id || "").charCodeAt(0) % avatarColors.length;
                const statusLabel = (r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Pendente" : r.status === "falha" ? "Falha" : r.status;
                const statusClass = (r.status === "completed" || r.status === "concluida") ? "bg-success/15 text-success" : r.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                return (
                  <div key={r.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${avatarColors[colorIdx]} flex items-center justify-center text-xs font-bold text-primary-foreground`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{r.user_nome || "—"}</p>
                          <p className="text-xs text-muted-foreground truncate">{r.user_email || "—"}</p>
                        </div>
                      </div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusClass}`}>{statusLabel}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Operadora</p>
                        <p className="text-sm font-semibold text-foreground">{r.operadora || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Telefone</p>
                        <p className="text-sm font-mono text-foreground">{r.telefone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Valor</p>
                        <p className="text-sm font-bold text-foreground">{fmt(r.valor)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground">{fmtDate(r.created_at)}</span>
                      {role === "admin" && <span className="text-[10px] text-muted-foreground">Custo: {fmt(r.custo)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden md:block glass-card rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Usuário</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Detalhes</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recargasLoading ? (
                    <tr><td colSpan={5} className="py-4"><div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div></td></tr>
                  ) : filteredRecargasHistorico.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma recarga encontrada</td></tr>
                  ) : filteredRecargasHistorico.map(r => {
                    const initials = (r.user_nome || r.user_email || "?").slice(0, 2).toUpperCase();
                    const avatarColors = ["bg-primary", "bg-accent", "bg-warning", "bg-success", "bg-destructive"];
                    const colorIdx = (r.user_id || "").charCodeAt(0) % avatarColors.length;
                    return (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{fmtDate(r.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-9 h-9 rounded-full ${avatarColors[colorIdx]} flex items-center justify-center text-xs font-bold text-primary-foreground`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">{r.user_nome || "—"}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.user_email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-foreground text-sm font-medium">{r.operadora || "—"}</p>
                          <p className="font-mono text-muted-foreground text-xs">{r.telefone}</p>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="font-mono font-bold text-foreground">{fmt(r.valor)}</p>
                          {role === "admin" && <p className="text-xs text-muted-foreground">Custo: {fmt(r.custo)}</p>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            (r.status === "completed" || r.status === "concluida") ? "bg-success/15 text-success" :
                            r.status === "pending" ? "bg-warning/15 text-warning" :
                            "bg-destructive/15 text-destructive"
                          }`}>{(r.status === "completed" || r.status === "concluida") ? "Concluída" : r.status === "pending" ? "Pendente" : r.status === "falha" ? "Falha" : r.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ===== OPERADORAS ===== */}
        {tab === "operadoras" && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setEditOperadora(null); setShowOperadoraModal(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity glow-primary">
                <Plus className="h-4 w-4" /> Nova Operadora
              </button>
            </div>
            <div className="grid gap-3">
              {operadorasLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : operadoras.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma operadora cadastrada</p>
              ) : operadoras.map(op => (
                <div key={op.id} className="glass-card rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{op.nome}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${op.ativo ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {op.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {op.valores.map(v => (
                        <span key={v} className="px-2 py-0.5 rounded bg-muted text-xs font-mono text-foreground">{fmt(v)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setEditOperadora(op); setShowOperadoraModal(true); }} className="px-3 py-1.5 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Editar</button>
                    <button onClick={() => toggleOperadora(op)} className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground">
                      {op.ativo ? <ToggleRight className="h-5 w-5 text-success" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                    <button onClick={() => deleteOperadora(op)} className="px-3 py-1.5 rounded text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">Excluir</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {/* ===== USUÁRIOS ===== */}
        {tab === "usuarios" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">{role === "revendedor" ? "Meus Clientes" : "Usuários"}</h2>
                <p className="text-sm text-muted-foreground">{role === "revendedor" ? "Clientes cadastrados pela sua loja." : "Gerencie usuários e clientes."}</p>
              </div>
              {role === "admin" && userSubTab === "revendedores" && (
                <button onClick={() => setShowCreateUser(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted/30 text-foreground font-medium text-sm hover:bg-muted/60 transition-colors">
                  <Plus className="h-4 w-4" /> Novo Usuário
                </button>
              )}
            </div>

            {/* Sub-tabs - only for admin */}
            {role === "admin" && (
            <div className="flex gap-1 p-1 rounded-lg bg-muted/40 w-fit">
              <button
                onClick={() => setUserSubTab("revendedores")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  userSubTab === "revendedores"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Revendedores
              </button>
              <button
                onClick={() => setUserSubTab("clientes")}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  userSubTab === "clientes"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Clientes
              </button>
            </div>
            )}

            {userSubTab === "revendedores" && (<>


            {/* Modal criar usuário */}
            <AnimatePresence>
              {showCreateUser && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="glass-card rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-foreground text-lg">Novo Usuário</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Nome</label>
                        <input value={newUserData.nome} onChange={e => setNewUserData(p => ({ ...p, nome: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Email</label>
                        <input type="email" value={newUserData.email} onChange={e => setNewUserData(p => ({ ...p, email: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Senha</label>
                        <input type="password" value={newUserData.password} onChange={e => setNewUserData(p => ({ ...p, password: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Saldo</label>
                        <input type="number" value={newUserData.saldo} onChange={e => setNewUserData(p => ({ ...p, saldo: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Role</label>
                        <select value={newUserData.role} onChange={e => setNewUserData(p => ({ ...p, role: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                          <option value="revendedor">Revendedor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-between pt-2">
                      <button onClick={() => { setShowCreateUser(false); setNewUserData({ email: "", password: "", nome: "", saldo: "0", role: "revendedor" }); }}
                        className="px-5 py-2 rounded-lg bg-muted/60 text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancelar</button>
                      <button disabled={creatingUser} onClick={async () => {
                        setCreatingUser(true);
                        try {
                          const res = await supabase.functions.invoke("admin-create-user", {
                            body: { email: newUserData.email, password: newUserData.password, nome: newUserData.nome, role: newUserData.role, saldo: parseFloat(newUserData.saldo) || 0 },
                          });
                          if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
                          toast.success("Usuário criado com sucesso!");
                          setShowCreateUser(false);
                          setNewUserData({ email: "", password: "", nome: "", saldo: "0", role: "revendedor" });
                          fetchData();
                        } catch (err: any) {
                          toast.error(err.message || "Erro ao criar usuário");
                        } finally { setCreatingUser(false); }
                      }} className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                        {creatingUser ? "Criando..." : "Salvar"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Buscar usuário..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full sm:w-96 pl-10 pr-4 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{revendedores.length}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold text-success">{revendedores.filter(r => r.active).length}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-destructive">{revendedores.filter(r => !r.active).length}</p>
              </div>
              <div className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground">Saldo Total</p>
                <p className="text-2xl font-bold text-warning">{fmt(revendedores.reduce((s, r) => s + r.saldo, 0))}</p>
              </div>
            </div>

            {/* Mobile: User Cards */}
            <div className="md:hidden space-y-3">
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : (() => {
                const filtered = revendedores.filter(r => {
                  if (!userSearch.trim()) return true;
                  const q = userSearch.toLowerCase();
                  return (r.nome || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
                });
                if (filtered.length === 0) return <p className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</p>;
                const todayStr = new Date().toISOString().slice(0, 10);
                return filtered.map(r => {
                  const initials = (r.nome || r.email || "?").slice(0, 1).toUpperCase();
                  const colors = ["bg-primary", "bg-accent", "bg-warning", "bg-success", "bg-destructive"];
                  const colorIdx = r.id.charCodeAt(0) % colors.length;
                  const userRecs = allRecargas.filter(rc => rc.user_id === r.id);
                  const recCount = userRecs.length;
                  const recHoje = userRecs.filter(rc => rc.created_at?.slice(0, 10) === todayStr).length;
                  const totalVendido = userRecs.filter(rc => rc.status === "completed" || rc.status === "concluida").reduce((s, rc) => s + (Number(rc.valor) || 0), 0);
                  const ultimaRec = userRecs[0];
                  return (
                    <div key={r.id} className="glass-card rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full ${colors[colorIdx]} flex items-center justify-center text-sm font-bold text-primary-foreground`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground text-sm truncate">{r.nome || "—"}</p>
                            <p className="text-xs text-muted-foreground truncate">{r.email || "—"}</p>
                          </div>
                        </div>
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${r.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                          {r.active ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-border">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Saldo</p>
                          <p className="text-sm font-bold font-mono text-foreground">{fmt(r.saldo)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Vendido</p>
                          <p className="text-sm font-bold font-mono text-success">{fmt(totalVendido)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Recargas</p>
                          <p className="text-sm font-bold text-foreground">{recCount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Hoje</p>
                          <p className="text-sm font-bold text-primary">{recHoje}</p>
                        </div>
                      </div>
                      {ultimaRec && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Última Recarga</p>
                          <p className="text-xs text-foreground">
                            {ultimaRec.operadora || "—"} • {ultimaRec.telefone} • {fmt(ultimaRec.valor)}
                            <span className="text-muted-foreground ml-1">({fmtDate(ultimaRec.created_at)})</span>
                          </p>
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                        <button onClick={() => { setEditSaldoUser(r); setEditSaldoValue(String(r.saldo)); }}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold bg-success/15 text-success hover:bg-success/25 transition-colors">Saldo</button>
                        <button onClick={() => navigate("/principal")}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold bg-muted/60 text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> Ver
                        </button>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Desktop: Users Table */}
            <div className="hidden md:block glass-card rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Revendedor</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Saldo</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Recargas</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Hoje</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Total Vendido</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Última Recarga</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="py-4"><div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div></td></tr>
                  ) : (() => {
                    const filtered = revendedores.filter(r => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return (r.nome || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
                    });
                    if (filtered.length === 0) return <tr><td colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</td></tr>;
                    const todayStr = new Date().toISOString().slice(0, 10);
                    return filtered.map(r => {
                      const initials = (r.nome || r.email || "?").slice(0, 1).toUpperCase();
                      const colors = ["bg-primary", "bg-accent", "bg-warning", "bg-success", "bg-destructive"];
                      const colorIdx = r.id.charCodeAt(0) % colors.length;
                      const userRecs = allRecargas.filter(rc => rc.user_id === r.id);
                      const recCount = userRecs.length;
                      const recHoje = userRecs.filter(rc => rc.created_at?.slice(0, 10) === todayStr).length;
                      const totalVendido = userRecs.filter(rc => rc.status === "completed" || rc.status === "concluida").reduce((s, rc) => s + (Number(rc.valor) || 0), 0);
                      const ultimaRec = userRecs[0];
                      return (
                        <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex-shrink-0 w-9 h-9 rounded-full ${colors[colorIdx]} flex items-center justify-center text-sm font-bold text-primary-foreground`}>
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">{r.nome || "—"}</p>
                                <p className="text-xs text-muted-foreground truncate">{r.email || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-mono font-medium text-foreground">{fmt(r.saldo)}</td>
                          <td className="px-4 py-3 text-center text-foreground">{recCount}</td>
                          <td className="px-4 py-3 text-center font-medium text-primary">{recHoje}</td>
                          <td className="px-4 py-3 text-center font-mono font-medium text-success">{fmt(totalVendido)}</td>
                          <td className="px-4 py-3 text-center">
                            {ultimaRec ? (
                              <div className="text-xs">
                                <p className="text-foreground">{ultimaRec.operadora || "—"} • {fmt(ultimaRec.valor)}</p>
                                <p className="text-muted-foreground">{fmtDate(ultimaRec.created_at)}</p>
                              </div>
                            ) : <span className="text-muted-foreground text-xs">—</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${r.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                              {r.active ? "Ativo" : "Inativo"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); setEditSaldoUser(r); setEditSaldoValue(String(r.saldo)); }}
                                className="px-2.5 py-1 rounded text-xs font-medium bg-success/15 text-success hover:bg-success/25 transition-colors">Saldo</button>
                              <button onClick={(e) => { e.stopPropagation(); navigate("/principal"); }}
                                className="p-1.5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                                <Eye className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Modal editar saldo */}
            <AnimatePresence>
              {editSaldoUser && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm" onClick={() => setEditSaldoUser(null)}>
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card rounded-xl p-6 w-full max-w-sm mx-4 space-y-4" onClick={e => e.stopPropagation()}>
                    <h4 className="font-semibold text-foreground text-lg">Editar Saldo</h4>
                    <p className="text-sm text-muted-foreground">{editSaldoUser.nome || editSaldoUser.email}</p>
                    <div>
                      <label className="block text-sm font-bold text-foreground mb-1">Novo Saldo (R$)</label>
                      <input type="number" step="0.01" value={editSaldoValue} onChange={e => setEditSaldoValue(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                      <button onClick={() => setEditSaldoUser(null)} className="px-4 py-2 rounded-lg bg-muted/60 text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancelar</button>
                      <button disabled={savingSaldo} onClick={async () => {
                        setSavingSaldo(true);
                        try {
                          const newVal = parseFloat(editSaldoValue) || 0;
                          const { error } = await supabase.from("saldos").update({ valor: newVal }).eq("user_id", editSaldoUser.id).eq("tipo", "revenda");
                          if (error) throw error;
                          supabase.functions.invoke("telegram-notify", {
                            body: { type: "saldo_set", user_id: editSaldoUser.id, data: { novo_saldo: newVal } },
                          }).catch(() => {});
                          toast.success("Saldo atualizado!");
                          setEditSaldoUser(null);
                          fetchData();
                        } catch (err: any) { toast.error(err.message || "Erro ao atualizar saldo"); }
                        setSavingSaldo(false);
                      }} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                        {savingSaldo ? "Salvando..." : "Salvar"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Modal confirmação remover role */}
            <AnimatePresence>
              {confirmRoleRemove && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm" onClick={() => setConfirmRoleRemove(null)}>
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card rounded-xl p-6 w-full max-w-sm mx-4 space-y-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-6 w-6 text-warning" />
                      <h4 className="font-semibold text-foreground text-lg">Confirmar Remoção</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Tem certeza que deseja remover a role de <strong className="text-foreground">revendedor</strong> de <strong className="text-foreground">{confirmRoleRemove.nome || confirmRoleRemove.email}</strong>? O usuário perderá acesso ao painel de revendedor.
                    </p>
                    <div className="flex gap-2 justify-end pt-2">
                      <button onClick={() => setConfirmRoleRemove(null)} className="px-4 py-2 rounded-lg bg-muted/60 text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancelar</button>
                      <button onClick={async () => {
                        try {
                          const res = await supabase.functions.invoke("admin-toggle-role", {
                            body: { user_id: confirmRoleRemove.id, role: "revendedor", action: "remove" },
                          });
                          if (res.error || res.data?.error) throw new Error(res.data?.error || res.error?.message);
                          toast.success("Role removida!");
                          setConfirmRoleRemove(null);
                          fetchData();
                        } catch (err: any) { toast.error(err.message || "Erro ao remover role"); }
                      }} className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                        Remover
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            </>)}

            {/* === Clientes Sub-tab === */}
            {userSubTab === "clientes" && (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring w-64"
                        placeholder="Buscar cliente..."
                      />
                    </div>
                  </div>
                  <button onClick={fetchClients} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors" title="Atualizar">
                    <RefreshCw className={`h-4 w-4 ${clientsLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {clientsLoading ? (
                  <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
                ) : (() => {
                  const filtered = clientsList.filter(c =>
                    (c.nome || "").toLowerCase().includes(clientSearch.toLowerCase()) ||
                    (c.email || "").toLowerCase().includes(clientSearch.toLowerCase())
                  );
                  return filtered.length === 0 ? (
                    <div className="glass-card rounded-xl p-8 text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground font-medium">Nenhum cliente encontrado</p>
                      <p className="text-xs text-muted-foreground mt-1">Clientes se cadastram pela sua loja</p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile cards */}
                      <div className="md:hidden space-y-3">
                        {filtered.map((c, i) => (
                          <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            className="glass-card rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                                  {(c.nome?.[0] || c.email?.[0] || "C").toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-foreground text-sm truncate">{c.nome || "Sem nome"}</p>
                                  <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                                </div>
                              </div>
                              <p className="font-bold text-success text-sm">{fmt(c.saldo)}</p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setClientHistoryModal({ id: c.id, nome: c.nome, email: c.email }); fetchClientRecargas(c.id); }}
                                  className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1"
                                >
                                  <History className="h-3 w-3" /> Histórico
                                </button>
                                <button
                                  onClick={() => setCreditClientModal({ id: c.id, nome: c.nome, email: c.email, saldo: c.saldo })}
                                  className="px-3 py-1.5 rounded-lg bg-success/15 text-xs font-bold text-success hover:bg-success/25 transition-colors flex items-center gap-1"
                                >
                                  <Plus className="h-3 w-3" /> Creditar
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Desktop table */}
                      <div className="hidden md:block glass-card rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cliente</th>
                              <th className="text-left px-4 py-3 font-medium text-muted-foreground">E-mail</th>
                              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Saldo</th>
                              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cadastro</th>
                              <th className="text-center px-4 py-3 font-medium text-muted-foreground">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filtered.map((c, i) => (
                              <motion.tr key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                      {(c.nome?.[0] || c.email?.[0] || "C").toUpperCase()}
                                    </div>
                                    <span className="font-medium text-foreground">{c.nome || "Sem nome"}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                                <td className="px-4 py-3 text-right font-bold text-success">{fmt(c.saldo)}</td>
                                <td className="px-4 py-3 text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => { setClientHistoryModal({ id: c.id, nome: c.nome, email: c.email }); fetchClientRecargas(c.id); }}
                                      className="px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                                    >
                                      Histórico
                                    </button>
                                    <button
                                      onClick={() => setCreditClientModal({ id: c.id, nome: c.nome, email: c.email, saldo: c.saldo })}
                                      className="px-3 py-1.5 rounded-lg bg-success/15 text-xs font-bold text-success hover:bg-success/25 transition-colors"
                                    >
                                      + Creditar
                                    </button>
                                  </div>
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

          </motion.div>
        )}

        {/* ===== ADICIONAR SALDO ===== */}
        {tab === "addSaldo" && (
          <AdminAddSaldoSection saldo={meuSaldo} fmt={fmt} fmtDate={fmtDate} transactions={myTransactions} userEmail={user?.email} userName={user?.email?.split("@")[0]} onDeposited={fetchData} fetchTransactions={fetchMyTransactions} />
        )}

        {/* ===== DEPÓSITOS ===== */}
        {tab === "depositos" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="font-display text-2xl font-bold text-foreground">Depósitos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="glass-card rounded-xl p-5">
                <p className="text-xs text-muted-foreground">Total Depositado</p>
                <p className="text-2xl font-bold text-foreground">{fmt(analytics.totalDeposited)}</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <p className="text-xs text-muted-foreground">Transações</p>
                <p className="text-2xl font-bold text-foreground">{analytics.txCount}</p>
              </div>
              <div className="glass-card rounded-xl p-5">
                <p className="text-xs text-muted-foreground">Saldo em Carteiras</p>
                <p className="text-2xl font-bold text-warning">{fmt(analytics.saldoCarteiras)}</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-5 mb-4">
              <h4 className="font-semibold text-foreground mb-4">Volume de Depósitos por Dia</h4>
              <div className="h-64">
                {depositosPorDia.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={depositosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `R$ ${v}`} />
                      <Tooltip formatter={(v: any) => [fmt(Number(v)), "Depósitos"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                      <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados no período</div>
                )}
              </div>
            </div>
            {/* Deposit transactions table */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input type="text" value={depositSearch} onChange={e => setDepositSearch(e.target.value)} placeholder="Buscar por revendedor, módulo..." className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
            </div>
            {/* Mobile: Card Layout */}
            <div className="md:hidden space-y-3">
              {depositLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : depositTransactions.filter(t =>
                (t.user_nome || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.user_email || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.module || "").toLowerCase().includes(depositSearch.toLowerCase())
              ).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada</p>
              ) : depositTransactions.filter(t =>
                (t.user_nome || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.user_email || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.module || "").toLowerCase().includes(depositSearch.toLowerCase())
              ).map(t => {
                const initials = (t.user_nome || t.user_email || "?").slice(0, 2).toUpperCase();
                const statusLabel = (t.status === "completed" || t.status === "confirmado") ? "Confirmado" : t.status === "pending" ? "Pendente" : t.status;
                const statusClass = (t.status === "completed" || t.status === "confirmado") ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                return (
                  <div key={t.id} className="glass-card rounded-xl p-4 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => setSelectedDeposit(t)}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">{t.user_nome || "—"}</p>
                          <p className="text-xs text-muted-foreground">{fmtDate(t.created_at)}</p>
                        </div>
                      </div>
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusClass}`}>{statusLabel}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tipo</p>
                          <p className="text-sm font-medium text-foreground capitalize">{t.type === "deposito" ? "Depósito" : t.type}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Método</p>
                          <p className="text-sm font-medium text-foreground uppercase">PIX</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Valor</p>
                        <p className={`text-base font-bold font-mono ${(t.type === "deposit" || t.type === "deposito") ? "text-success" : "text-foreground"}`}>
                          {(t.type === "deposit" || t.type === "deposito") ? "+" : "-"}{fmt(t.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden md:block glass-card rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Revendedor</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Módulo</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Valor</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {depositLoading ? (
                    <tr><td colSpan={6} className="py-4"><div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div></td></tr>
                  ) : depositTransactions.filter(t =>
                    (t.user_nome || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.user_email || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.module || "").toLowerCase().includes(depositSearch.toLowerCase())
                  ).length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma transação encontrada</td></tr>
                  ) : depositTransactions.filter(t =>
                    (t.user_nome || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.user_email || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.module || "").toLowerCase().includes(depositSearch.toLowerCase())
                  ).map(t => (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedDeposit(t)}>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{fmtDate(t.created_at)}</td>
                      <td className="px-4 py-3 text-foreground">{t.user_nome || t.user_email || "—"}</td>
                      <td className="px-4 py-3 text-foreground capitalize">{t.type === "deposito" ? "Depósito" : t.type}</td>
                      <td className="px-4 py-3 text-foreground">PIX</td>
                      <td className={`px-4 py-3 text-right font-mono font-medium ${(t.type === "deposit" || t.type === "deposito") ? "text-success" : "text-foreground"}`}>
                        {(t.type === "deposit" || t.type === "deposito") ? "+" : "-"}{fmt(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          (t.status === "completed" || t.status === "confirmado") ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive"
                        }`}>{(t.status === "completed" || t.status === "confirmado") ? "Confirmado" : t.status === "pending" ? "Pendente" : t.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

            {/* Deposit Detail Modal */}
            <AnimatePresence>
              {selectedDeposit && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDeposit(null)}>
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    {(() => {
                      const t = selectedDeposit;
                      const meta = (t.metadata && typeof t.metadata === "object" && !Array.isArray(t.metadata)) ? t.metadata as Record<string, unknown> : {};
                      const statusLabel = (t.status === "completed" || t.status === "confirmado") ? "Confirmado" : t.status === "pending" ? "Pendente" : t.status;
                      const statusClass = (t.status === "completed" || t.status === "confirmado") ? "bg-success/15 text-success" : t.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";
                      const initials = (t.user_nome || t.user_email || "?").slice(0, 2).toUpperCase();
                      const gw = (meta.gateway as string) || t.module || "";
                      const gwLabel: Record<string, string> = {
                        mercadopago: "Mercado Pago", pushinpay: "PushinPay", virtualpay: "VirtualPay",
                        efipay: "Efi Pay", pixgo: "PixGo", misticpay: "MisticPay",
                      };

                      // Common rows always shown
                      const commonRows: { label: string; value: string | null | undefined }[] = [
                        { label: "Revendedor", value: t.user_nome || t.user_email || "—" },
                        { label: "Valor", value: fmt(t.amount) },
                        { label: "Status", value: statusLabel },
                        { label: "Data", value: fmtDate(t.created_at) },
                        { label: "Método", value: "PIX" },
                        { label: "Gateway", value: gwLabel[gw] || gw || "—" },
                        { label: "ID do Pagamento", value: t.payment_id || "—" },
                        { label: "Referência", value: meta.reference as string || null },
                        { label: "Confirmado em", value: meta.confirmed_at ? fmtDate(meta.confirmed_at as string) : null },
                      ];

                      // Gateway-specific payer info rows
                      const payerRows: { label: string; value: string | null | undefined }[] = [];

                      if (gw === "mercadopago") {
                        payerRows.push(
                          { label: "Nome do Pagador", value: meta.payer_name as string || null },
                          { label: "E-mail do Pagador", value: meta.payer_email as string || null },
                          { label: "CPF/CNPJ", value: meta.payer_document as string || null },
                          { label: "Banco do Pagador", value: meta.bank_name as string || null },
                          { label: "End-to-End ID", value: meta.end_to_end_id as string || null },
                        );
                      } else if (gw === "pushinpay") {
                        payerRows.push(
                          { label: "Nome do Pagador", value: meta.payer_name as string || null },
                          { label: "CPF/CNPJ", value: meta.payer_document as string || null },
                          { label: "Banco do Pagador", value: meta.bank_name as string || null },
                          { label: "End-to-End ID", value: meta.end_to_end_id as string || null },
                        );
                      } else if (gw === "virtualpay") {
                        payerRows.push(
                          { label: "Nome do Pagador", value: meta.payer_name as string || null },
                          { label: "CPF/CNPJ", value: meta.payer_document as string || null },
                          { label: "End-to-End ID", value: meta.end_to_end_id as string || null },
                        );
                      } else if (gw === "efipay") {
                        payerRows.push(
                          { label: "Nome do Pagador", value: meta.payer_name as string || null },
                          { label: "CPF", value: meta.payer_document as string || null },
                          { label: "End-to-End ID", value: meta.end_to_end_id as string || null },
                        );
                      } else if (gw === "pixgo") {
                        payerRows.push(
                          { label: "Nome do Pagador", value: meta.payer_name as string || null },
                          { label: "CPF do Pagador", value: meta.payer_document as string || null },
                          { label: "End-to-End ID", value: meta.end_to_end_id as string || null },
                        );
                      } else if (gw === "misticpay") {
                        payerRows.push(
                          { label: "Nome do Cliente", value: meta.payer_name as string || null },
                          { label: "Documento (CPF)", value: meta.payer_document as string || null },
                          { label: "Taxa MisticPay", value: meta.fee ? `R$ ${Number(meta.fee).toFixed(2)}` : null },
                        );
                      } else {
                        // Fallback: show all available payer fields
                        payerRows.push(
                          { label: "Nome do Pagador", value: meta.payer_name as string || null },
                          { label: "Documento", value: meta.payer_document as string || null },
                          { label: "E-mail do Pagador", value: meta.payer_email as string || null },
                          { label: "Banco", value: meta.bank_name as string || null },
                          { label: "End-to-End ID", value: meta.end_to_end_id as string || null },
                          { label: "Taxa", value: meta.fee ? `R$ ${Number(meta.fee).toFixed(2)}` : null },
                        );
                      }

                      const hasPayerInfo = payerRows.some(r => r.value);

                      return (
                        <>
                          <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">{initials}</div>
                              <div>
                                <h3 className="font-display text-lg font-bold text-foreground">Detalhes do Depósito</h3>
                                <p className="text-xs text-muted-foreground">{t.user_nome || t.user_email}</p>
                              </div>
                            </div>
                            <button onClick={() => setSelectedDeposit(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                          </div>
                          <div className="text-center mb-5">
                            <p className="text-3xl font-bold font-mono text-success">+{fmt(t.amount)}</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>{statusLabel}</span>
                          </div>
                          {/* Common info */}
                          <div className="space-y-0 divide-y divide-border">
                            {commonRows.filter(r => r.value).map((r, i) => (
                              <div key={i} className="flex items-center justify-between py-3">
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">{r.label}</span>
                                <span className="text-sm font-medium text-foreground text-right max-w-[60%] break-all">{r.value}</span>
                              </div>
                            ))}
                          </div>
                          {/* Payer info section */}
                          {hasPayerInfo && (
                            <>
                              <div className="mt-4 mb-2">
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Dados do Pagador ({gwLabel[gw] || "PIX"})</p>
                              </div>
                              <div className="space-y-0 divide-y divide-border rounded-lg border border-border overflow-hidden">
                                {payerRows.filter(r => r.value).map((r, i) => (
                                  <div key={i} className="flex items-center justify-between py-3 px-3 bg-muted/20">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">{r.label}</span>
                                    <span className="text-sm font-medium text-foreground text-right max-w-[60%] break-all">{r.value}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {!hasPayerInfo && (
                            <p className="text-xs text-muted-foreground mt-4 text-center italic">Informações do pagador serão preenchidas automaticamente quando o PIX for confirmado via webhook.</p>
                          )}
                        </>
                      );
                    })()}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

          {/* ===== GATEWAY DE PAGAMENTO ===== */}
          {tab === "gateway" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                    <Settings2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">Gateway de Pagamento</h3>
                    <p className="text-sm text-muted-foreground">Configure sua gateway individual para receber depósitos PIX</p>
                  </div>
                </div>
                {gwLoading ? (
                  <div className="text-center py-8"><div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div></div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Gateway</label>
                      <select value={gwModule} onChange={(e) => setGwModule(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                        {gatewayOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      {!gwModule && <p className="text-xs text-muted-foreground mt-1">Sem gateway individual, o sistema usará a gateway global.</p>}
                    </div>
                    {gwModule && gatewayFieldDefs[gwModule] && (
                      <div className="space-y-3 border-t border-border pt-4">
                        <h4 className="font-semibold text-foreground text-sm mb-3">Credenciais — {gatewayOptions.find(o => o.value === gwModule)?.label}</h4>
                        {gatewayFieldDefs[gwModule].map((field) => (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
                            <div className="relative">
                              <input type={field.secret && !gwShowSecrets[field.key] ? "password" : "text"}
                                value={gwFields[field.key] || ""} onChange={(e) => setGwFields({ ...gwFields, [field.key]: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-12" placeholder={field.label} />
                              {field.secret && (
                                <button type="button" onClick={() => setGwShowSecrets({ ...gwShowSecrets, [field.key]: !gwShowSecrets[field.key] })}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {gwShowSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={saveGatewayConfig} disabled={gwSaving}
                      className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
                      {gwSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> Salvar Gateway</>}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ===== MINHA LOJA ===== */}
          {tab === "loja" && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <div className="glass-card rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-foreground">Personalizar Loja</h3>
                    <p className="text-sm text-muted-foreground">Configure a aparência da sua loja para clientes</p>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">URL Personalizada (slug)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground shrink-0">/loja/</span>
                      <input type="text" value={storeSlug} onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        className="flex-1 px-4 py-3 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="minha-loja" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Mínimo 3 caracteres. Apenas letras, números e hífens.</p>
                    {storeSlug && storeSlug.length >= 3 && (
                      <div className="mt-2 glass-input rounded-lg px-3 py-2 flex items-center gap-2 cursor-pointer"
                        onClick={() => { navigator.clipboard.writeText(`https://recargasbrasill.com/loja/${storeSlug}`); toast.success("Link copiado!"); }}>
                        <Link2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm text-foreground font-mono truncate">https://recargasbrasill.com/loja/{storeSlug}</span>
                        <Copy className="h-4 w-4 text-muted-foreground shrink-0 ml-auto" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Nome da Loja</label>
                    <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Minha Loja de Recargas" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Logo da Loja</label>
                    <div className="flex items-center gap-4">
                      {storeLogoUrl ? (
                        <img src={storeLogoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-border" />
                      ) : (
                        <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center"><Image className="h-6 w-6 text-muted-foreground" /></div>
                      )}
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg glass-card cursor-pointer hover:bg-muted/40 transition-colors text-sm font-medium text-foreground">
                          {storeLogoUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {storeLogoUploading ? "Enviando..." : "Enviar Logo"}
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        {storeLogoUrl && <button onClick={() => setStoreLogoUrl("")} className="ml-2 text-xs text-destructive hover:underline">Remover</button>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2"><Palette className="h-4 w-4 inline mr-1" />Cores</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Cor Principal</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={storePrimaryColor} onChange={(e) => setStorePrimaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                          <input type="text" value={storePrimaryColor} onChange={(e) => setStorePrimaryColor(e.target.value)} className="flex-1 px-3 py-2 rounded-lg glass-input text-foreground text-sm font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Cor Secundária</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={storeSecondaryColor} onChange={(e) => setStoreSecondaryColor(e.target.value)} className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                          <input type="text" value={storeSecondaryColor} onChange={(e) => setStoreSecondaryColor(e.target.value)} className="flex-1 px-3 py-2 rounded-lg glass-input text-foreground text-sm font-mono" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Pré-visualização</label>
                    <div className="rounded-xl border border-border overflow-hidden" style={{ background: storeSecondaryColor }}>
                      <div className="p-4 flex items-center gap-3" style={{ borderBottom: `2px solid ${storePrimaryColor}` }}>
                        {storeLogoUrl ? <img src={storeLogoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" /> : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: storePrimaryColor }}><Smartphone className="h-4 w-4 text-white" /></div>
                        )}
                        <span className="font-bold text-white text-sm">{storeName || "Minha Loja"}</span>
                      </div>
                      <div className="p-4 flex gap-2">
                        <div className="rounded-lg px-3 py-1.5 text-xs font-bold text-white" style={{ background: storePrimaryColor }}>R$ 15,00</div>
                        <div className="rounded-lg px-3 py-1.5 text-xs font-bold text-white/60 border border-white/20">R$ 20,00</div>
                        <div className="rounded-lg px-3 py-1.5 text-xs font-bold text-white/60 border border-white/20">R$ 30,00</div>
                      </div>
                    </div>
                  </div>
                  <button onClick={saveStoreConfig} disabled={storeSaving}
                    className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-base font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
                    {storeSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> Salvar Loja</>}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        {/* ===== CONFIGURAÇÕES ===== */}
        {tab === "configuracoes" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-foreground">Configurações</h2>
              <button onClick={saveConfig} disabled={configSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                <Save className="h-4 w-4" /> {configSaving ? "Salvando..." : "Salvar Tudo"}
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="overflow-x-auto scrollbar-hide -mx-1 px-1">
              <div className="flex gap-1 border-b border-border min-w-max">
                {([
                  { key: "geral" as const, icon: Settings, label: "Geral" },
                  { key: "pagamentos" as const, icon: CreditCard, label: "Pagamentos" },
                  { key: "depositos" as const, icon: Landmark, label: "Depósitos" },
                ]).map(st => (
                  <button
                    key={st.key}
                    onClick={() => setConfigSubTab(st.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                      configSubTab === st.key
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <st.icon className="h-4 w-4" /> {st.label}
                  </button>
                ))}
              </div>
            </div>

            {configLoading ? (
              <div className="space-y-3 py-4">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div>
            ) : (
              <>
                {/* Geral */}
                {configSubTab === "geral" && (
                  <div className="glass-card rounded-xl p-6 space-y-4">
                    <h4 className="font-semibold text-foreground flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Configurações Gerais</h4>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Nome do Site</label>
                      <input type="text" value={configData.siteTitle || ""} onChange={e => setConfigData(prev => ({ ...prev, siteTitle: e.target.value }))}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Recargas Brasil" />
                    </div>

                    {/* Info: tokens moved to Principal */}
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground">Os tokens (Telegram Bot Token, GitHub PAT) são gerenciados no <strong className="text-foreground">Painel Principal</strong> nas seções Bot Telegram e Backup.</p>
                    </div>
                  </div>
                )}


                {/* Pagamentos - Gateway Individual */}
                {configSubTab === "pagamentos" && (
                  <div className="space-y-5">
                    <div className="glass-card rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                          <Settings2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">Gateway de Pagamento</h4>
                          <p className="text-xs text-muted-foreground">Configure sua gateway individual para receber depósitos PIX</p>
                        </div>
                      </div>
                      {gwLoading ? (
                        <div className="text-center py-8"><div className="space-y-3">{[1,2,3].map(i => <SkeletonCard key={i} />)}</div></div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Gateway</label>
                            <select value={gwModule} onChange={(e) => setGwModule(e.target.value)}
                              className="w-full px-4 py-3 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                              {gatewayOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                            {!gwModule && <p className="text-xs text-muted-foreground mt-1">Sem gateway individual, o sistema usará a gateway global.</p>}
                          </div>
                          {gwModule && gatewayFieldDefs[gwModule] && (
                            <div className="space-y-3 border-t border-border pt-4">
                              <h4 className="font-semibold text-foreground text-sm mb-3">Credenciais — {gatewayOptions.find(o => o.value === gwModule)?.label}</h4>
                              {gatewayFieldDefs[gwModule].map((field) => (
                                <div key={field.key}>
                                  <label className="block text-sm font-medium text-foreground mb-1">{field.label}</label>
                                  <div className="relative">
                                    <input type={field.secret && !gwShowSecrets[field.key] ? "password" : "text"}
                                      value={gwFields[field.key] || ""} onChange={(e) => setGwFields({ ...gwFields, [field.key]: e.target.value })}
                                      className="w-full px-4 py-3 rounded-xl glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring pr-12" placeholder={field.label} />
                                    {field.secret && (
                                      <button type="button" onClick={() => setGwShowSecrets({ ...gwShowSecrets, [field.key]: !gwShowSecrets[field.key] })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                        {gwShowSecrets[field.key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <button onClick={saveGatewayConfig} disabled={gwSaving}
                            className="w-full py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
                            {gwSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Save className="h-4 w-4" /> Salvar Gateway</>}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Depósitos - Limites e Taxas */}
                {configSubTab === "depositos" && (
                  <div className="space-y-6">
                    <div className="glass-card rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-foreground text-lg flex items-center gap-2"><Landmark className="h-5 w-5 text-primary" /> Limites e Regras</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-foreground mb-1">Depósito Mínimo (R$)</label>
                          <input type="number" value={configData.depositoMinimo || ""} onChange={e => setConfigData(prev => ({ ...prev, depositoMinimo: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="20" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-foreground mb-1">Depósito Máximo (R$)</label>
                          <input type="number" value={configData.depositoMaximo || ""} onChange={e => setConfigData(prev => ({ ...prev, depositoMaximo: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="1000" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-foreground mb-1">Máximo de PIX Pendentes</label>
                        <input type="number" value={configData.maxPixPendentes || ""} onChange={e => setConfigData(prev => ({ ...prev, maxPixPendentes: e.target.value }))}
                          className="w-full px-3 py-2.5 rounded-md border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="2" />
                        <span className="text-xs text-muted-foreground mt-1 block">Impede spam de QR Codes por usuário.</span>
                      </div>
                    </div>

                    <div className="glass-card rounded-xl p-6 space-y-4">
                      <h4 className="font-semibold text-foreground text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" /> Taxas ao Cliente
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Tipo de Taxa</label>
                          <select value={configData.taxaTipo || "fixo"} onChange={e => setConfigData(prev => ({ ...prev, taxaTipo: e.target.value }))}
                            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2388888b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                            <option value="fixo">Valor Fixo (R$)</option>
                            <option value="percentual">Percentual (%)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1.5">Valor da Taxa</label>
                          <div className="relative">
                            <input type="text" value={configData.taxaValor || ""} onChange={e => setConfigData(prev => ({ ...prev, taxaValor: e.target.value }))}
                              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono" placeholder={configData.taxaTipo === "percentual" ? "5" : "0,45"} />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                              {configData.taxaTipo === "percentual" ? "%" : "R$"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                        Esta taxa é descontada do valor creditado ao cliente.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button onClick={saveConfig} disabled={configSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                    <Save className="h-4 w-4" /> {configSaving ? "Salvando..." : "Salvar Configurações"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ===== PRECIFICAÇÃO ===== */}
        {tab === "precificacao" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Precificação</h2>
                <p className="text-sm text-muted-foreground">Defina regras de preço específicas por produto.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { fetchOperadoras(); fetchPricingRules(); }} className="p-2 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground transition-colors">
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button onClick={() => { setEditOperadora(null); setShowOperadoraModal(true); }} className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {operadorasLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
            ) : operadoras.filter(o => o.ativo).length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma operadora ativa cadastrada.</p>
              </div>
            ) : (
              <>
                {/* Operadora tabs */}
                <div className="flex gap-2 flex-wrap">
                  {operadoras.filter(o => o.ativo).map(op => (
                    <button
                      key={op.id}
                      onClick={() => setPricingSelectedOp(op.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        (pricingSelectedOp || operadoras.filter(o => o.ativo)[0]?.id) === op.id
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "glass-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Package className="h-4 w-4" />
                      {op.nome}
                    </button>
                  ))}
                </div>

                {/* Value cards */}
                {(() => {
                  const activeOpId = pricingSelectedOp || operadoras.filter(o => o.ativo)[0]?.id;
                  const activeOp = operadoras.find(o => o.id === activeOpId);
                  if (!activeOp) return null;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeOp.valores.sort((a, b) => a - b).map(valor => {
                        const rule = pricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
                        const localKey = `${activeOpId}-${valor}`;
                        const localTipo = rule?.tipo_regra || "fixo";
                        const localValor = rule?.regra_valor ?? 0;
                        const localCusto = rule?.custo ?? 0;

                        const precoFinal = localTipo === "fixo" ? localValor : valor * (1 + localValor / 100);
                        const lucro = precoFinal - localCusto;

                        return (
                          <div key={valor} className="glass-card rounded-xl p-4 space-y-3 border border-border/50">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Recarga</p>
                                <p className="text-xl font-bold text-foreground">{fmt(valor)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Preço Final</p>
                                <p className={`text-xl font-bold ${precoFinal > 0 ? "text-success" : "text-muted-foreground"}`}>
                                  {precoFinal > 0 ? fmt(precoFinal) : "—"}
                                </p>
                              </div>
                            </div>

                            {/* Custo & Lucro bar */}
                            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                              <span className="text-muted-foreground">Custo: {fmt(localCusto)}</span>
                              <span className={`font-medium ${lucro > 0 ? "text-success" : lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                Lucro: {fmt(lucro)}
                              </span>
                            </div>

                            {/* Rule inputs */}
                            <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-end">
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Tipo de Regra</label>
                                <select
                                  value={localTipo}
                                  onChange={e => {
                                    const newTipo = e.target.value as "fixo" | "margem";
                                    savePricingRule({ operadora_id: activeOpId, valor_recarga: valor, custo: localCusto, tipo_regra: newTipo, regra_valor: localValor });
                                  }}
                                  className="h-9 rounded-lg bg-muted/70 border border-border px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                  <option value="margem">Margem (%)</option>
                                  <option value="fixo">Fixo (R$)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] text-muted-foreground mb-1 block">Valor</label>
                                <input
                                  type="number"
                                  defaultValue={localValor}
                                  onBlur={e => {
                                    const v = parseFloat(e.target.value) || 0;
                                    savePricingRule({ operadora_id: activeOpId, valor_recarga: valor, custo: localCusto, tipo_regra: localTipo, regra_valor: v });
                                  }}
                                  className="h-9 w-full rounded-lg bg-muted/70 border border-border px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                              </div>
                              <button
                                onClick={() => resetPricingRule(activeOpId, valor)}
                                className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors"
                                title="Resetar regra"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            )}
          </motion.div>
        )}

        {/* ===== MEUS PREÇOS ===== */}
        {tab === "meusprecos" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Meus Preços</h2>
                <p className="text-sm text-muted-foreground">Defina preços personalizados para sua loja. Valores não definidos usarão o preço global.</p>
              </div>
              <button onClick={() => { fetchOperadoras(); fetchResellerPricingRules(); }} className="p-2 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {operadorasLoading ? (
              <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
            ) : operadoras.filter(o => o.ativo).length === 0 ? (
              <div className="glass-card rounded-xl p-8 text-center">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma operadora ativa cadastrada.</p>
              </div>
            ) : (
              <>
                {/* Operadora tabs */}
                <div className="flex gap-2 flex-wrap">
                  {operadoras.filter(o => o.ativo).map(op => (
                    <button
                      key={op.id}
                      onClick={() => setResellerPricingSelectedOp(op.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        (resellerPricingSelectedOp || operadoras.filter(o => o.ativo)[0]?.id) === op.id
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "glass-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      }`}
                    >
                      <Package className="h-4 w-4" />
                      {op.nome}
                    </button>
                  ))}
                </div>

                {/* Value cards */}
                {(() => {
                  const activeOpId = resellerPricingSelectedOp || operadoras.filter(o => o.ativo)[0]?.id;
                  const activeOp = operadoras.find(o => o.id === activeOpId);
                  if (!activeOp) return null;

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeOp.valores.sort((a, b) => a - b).map(valor => {
                        const resellerRule = resellerPricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
                        const globalRule = pricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);

                        const isCustom = !!resellerRule;
                        const rule = resellerRule || globalRule;
                        const localTipo = rule?.tipo_regra || "fixo";
                        const localValor = rule?.regra_valor ?? 0;
                        const localCusto = rule?.custo ?? 0;

                        const precoFinal = localTipo === "fixo" ? localValor : valor * (1 + localValor / 100);
                        const lucro = precoFinal - localCusto;

                        return (
                          <div key={valor} className={`glass-card rounded-xl p-4 space-y-3 border ${isCustom ? "border-primary/50" : "border-border/50"}`}>
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Recarga</p>
                                <p className="text-xl font-bold text-foreground">{fmt(valor)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                  {isCustom ? "Preço Personalizado" : "Preço Global"}
                                </p>
                                <p className={`text-xl font-bold ${precoFinal > 0 ? "text-success" : "text-muted-foreground"}`}>
                                  {precoFinal > 0 ? fmt(precoFinal) : "—"}
                                </p>
                              </div>
                            </div>

                            {/* Badge */}
                            {isCustom && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                                Personalizado
                              </span>
                            )}

                            {/* Custo & Lucro bar */}
                            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                              <span className="text-muted-foreground">Custo: {fmt(localCusto)}</span>
                              <span className={`font-medium ${lucro > 0 ? "text-success" : lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                Lucro: {fmt(lucro)}
                              </span>
                            </div>

                            {/* Rule inputs */}
                            <div className="space-y-2">
                              <div className="grid grid-cols-[auto_1fr] gap-2 items-end">
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Tipo</label>
                                  <select
                                    value={isCustom ? localTipo : (globalRule?.tipo_regra || "fixo")}
                                    onChange={e => {
                                      const newTipo = e.target.value as "fixo" | "margem";
                                      saveResellerPricingRule({ operadora_id: activeOpId, valor_recarga: valor, custo: localCusto, tipo_regra: newTipo, regra_valor: localValor });
                                    }}
                                    className="h-9 rounded-lg bg-muted/70 border border-border px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                  >
                                    <option value="margem">Margem (%)</option>
                                    <option value="fixo">Fixo (R$)</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[10px] text-muted-foreground mb-1 block">Preço (R$)</label>
                                  <input
                                    type="number"
                                    defaultValue={localValor}
                                    key={`val-${activeOpId}-${valor}-${isCustom}`}
                                    onBlur={e => {
                                      const v = parseFloat(e.target.value) || 0;
                                      saveResellerPricingRule({ operadora_id: activeOpId, valor_recarga: valor, custo: localCusto, tipo_regra: localTipo, regra_valor: v });
                                    }}
                                    className="h-9 w-full rounded-lg bg-muted/70 border border-border px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end">
                                <button
                                  onClick={() => resetResellerPricingRule(activeOpId, valor)}
                                  className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors"
                                  title="Remover preço personalizado"
                                  disabled={!isCustom}
                                >
                                  <Trash2 className={`h-4 w-4 ${!isCustom ? "opacity-30" : ""}`} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            )}
          </motion.div>
        )}

        {tab === "bot" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Bot className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Bot Telegram</h2>
                  <p className="text-sm text-muted-foreground">Configure todas as opções do bot</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => {
                  if (!configData.telegramBotToken) { toast.error("Configure o token primeiro"); return; }
                  refreshBotStatus();
                }} disabled={botStatus.loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-foreground font-medium text-sm hover:bg-accent/50 disabled:opacity-50 transition-colors">
                  <RefreshCw className={`h-4 w-4 ${botStatus.loading ? "animate-spin" : ""}`} /> Atualizar
                </button>
                <button onClick={saveConfig} disabled={configSaving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                  <Save className="h-4 w-4" /> {configSaving ? "Salvando..." : "Salvar Tudo"}
                </button>
              </div>
            </div>

            {configLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : (
              <>
                {/* Status do Bot */}
                <div className="glass-card rounded-xl p-6 space-y-5 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">Status do Bot</h4>
                        <p className="text-xs text-muted-foreground">Informações e status de conexão</p>
                      </div>
                    </div>
                    {botStatus.connected ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Conectado
                      </span>
                    ) : botStatus.error ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                        <WifiOff className="h-3.5 w-3.5" /> Desconectado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
                        <Wifi className="h-3.5 w-3.5" /> Não verificado
                      </span>
                    )}
                  </div>

                  {botStatus.connected && (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="rounded-lg border border-border bg-background/50 p-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                            <Bot className="h-3.5 w-3.5" /> NOME DO BOT
                          </div>
                          <p className="font-semibold text-foreground">{botStatus.botName || "—"}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-background/50 p-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                            <AtSign className="h-3.5 w-3.5" /> USERNAME
                          </div>
                          <p className="font-semibold text-foreground">@{botStatus.botUsername || "—"}</p>
                        </div>
                        <div className="rounded-lg border border-border bg-background/50 p-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                            <Hash className="h-3.5 w-3.5" /> BOT ID
                          </div>
                          <p className="font-semibold text-foreground">{botStatus.botId || "—"}</p>
                        </div>
                        <div className={`rounded-lg border bg-background/50 p-4 ${(botStatus.pendingUpdates ?? 0) > 0 ? "border-warning/40" : "border-border"}`}>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                            <Clock className="h-3.5 w-3.5" /> PENDENTES
                          </div>
                          <p className={`font-semibold ${(botStatus.pendingUpdates ?? 0) > 0 ? "text-warning" : "text-foreground"}`}>{botStatus.pendingUpdates !== null ? botStatus.pendingUpdates : "—"}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button onClick={() => refreshBotStatus()} disabled={botStatus.loading} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-foreground font-medium text-sm hover:bg-accent/50 disabled:opacity-50 transition-colors">
                          <RefreshCw className={`h-4 w-4 ${botStatus.loading ? "animate-spin" : ""}`} /> Atualizar
                        </button>
                        <button onClick={async () => {
                          if (!configData.telegramBotToken) return;
                          try {
                            toast.info("Resetando webhook...");
                            await fetch(`https://api.telegram.org/bot${configData.telegramBotToken}/deleteWebhook?drop_pending_updates=true`);
                            await new Promise(r => setTimeout(r, 1000));
                            // Pass the token in body so telegram-setup uses the correct bot (isolated per reseller)
                            const resp = await supabase.functions.invoke("telegram-setup", {
                              body: { token: configData.telegramBotToken, action: "reset" },
                            });
                            if (resp.error) throw resp.error;
                            toast.success("✅ Webhook resetado e reconfigurado!");
                            const whResp = await fetch(`https://api.telegram.org/bot${configData.telegramBotToken}/getWebhookInfo`);
                            const whData = await whResp.json();
                            if (whData.ok) setBotStatus(prev => ({ ...prev, webhookUrl: whData.result.url || null, webhookError: null }));
                          } catch { toast.error("Erro ao resetar webhook"); }
                        }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/15 border border-warning/30 text-warning font-medium text-sm hover:bg-warning/25 transition-colors">
                          <RotateCcw className="h-4 w-4" /> Resetar Webhook
                        </button>
                      </div>

                      {botStatus.webhookError && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                          Último erro: {botStatus.webhookError}
                        </div>
                      )}
                    </>
                  )}

                  {botStatus.error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                      {botStatus.error}
                    </div>
                  )}
                </div>

                {/* Token - Collapsible */}
                <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
                  <button onClick={() => setTokenSectionOpen(!tokenSectionOpen)} className="w-full flex items-center justify-between p-6 hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Link2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-foreground">Token do Bot</h4>
                        <p className="text-xs text-muted-foreground">Configure a chave de acesso do BotFather</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${tokenSectionOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {tokenSectionOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-6 pb-6 space-y-4">
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 text-warning text-sm">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            Alterar o token desconectará o bot atual.
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <input type={showApiKey ? "text" : "password"} value={configData.telegramBotToken || ""} onChange={e => setConfigData(prev => ({ ...prev, telegramBotToken: e.target.value }))}
                                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono" placeholder="123456789:ABC-DEF_ghi..." />
                              <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <button onClick={async () => {
                              const token = configData.telegramBotToken;
                              if (!token) { toast.error("Insira o token"); return; }
                              setValidatingToken(true);
                              try {
                                const resp = await fetch(`https://api.telegram.org/bot${token}/getMe`);
                                const data = await resp.json();
                                if (data.ok) {
                                  // Revendedor: save to profiles (isolated). Admin: save to system_config (global)
                                  if (!user?.id) { toast.error("Sessão inválida. Faça login novamente."); return; }
                                  if (role === "revendedor") {
                                    await supabase.from("profiles").update({ telegram_bot_token: token }).eq("id", user.id);
                                  } else {
                                    await supabase.from("system_config").upsert({ key: "telegramBotToken", value: token }, { onConflict: "key" });
                                  }
                                  toast.success(`Token válido e salvo! Bot: ${data.result.first_name} (@${data.result.username})`);
                                  setBotStatus({ connected: true, loading: false, botName: data.result.first_name, botUsername: data.result.username, botId: String(data.result.id), error: null, webhookUrl: null, webhookError: null, pendingUpdates: null });
                                } else {
                                  toast.error("Token inválido: " + (data.description || "Erro desconhecido"));
                                }
                              } catch { toast.error("Erro de conexão ao validar"); }
                              setValidatingToken(false);
                            }} disabled={validatingToken} className="px-5 py-2.5 rounded-lg border border-input bg-background text-foreground font-medium text-sm hover:bg-accent/50 disabled:opacity-50 transition-colors whitespace-nowrap">
                              {validatingToken ? "Validando..." : "Validar"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Links */}
                <div className="glass-card rounded-xl p-6 space-y-4 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Links</h4>
                      <p className="text-xs text-muted-foreground">Links de grupo e suporte</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">URL do Grupo Telegram</label>
                      <input type="url" value={configData.telegramGroupUrl || ""} onChange={e => setConfigData(prev => ({ ...prev, telegramGroupUrl: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://t.me/seugrupo" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">URL de Suporte</label>
                      <input type="url" value={configData.supportUrl || ""} onChange={e => setConfigData(prev => ({ ...prev, supportUrl: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://t.me/seusuporte" />
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}




        {/* Credit Client Modal */}
        {creditClientModal && (
          <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-center justify-center px-4" onClick={() => setCreditClientModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display text-lg font-bold text-foreground mb-1">Creditar Saldo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para: <span className="font-semibold text-foreground">{creditClientModal.nome || creditClientModal.email}</span>
              </p>
              <p className="text-xs text-muted-foreground mb-1">Saldo atual</p>
              <p className="text-xl font-bold text-success mb-4">{fmt(creditClientModal.saldo)}</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-1">Valor a creditar (R$)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={creditAmount}
                  onChange={e => setCreditAmount(e.target.value.replace(/[^0-9,.]/g, ""))}
                  className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-lg font-bold focus:outline-none focus:ring-2 focus:ring-success/50"
                  placeholder="0,00"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[10, 20, 50, 100, 200, 500].map(v => (
                  <button key={v} onClick={() => setCreditAmount(String(v))}
                    className="py-2 rounded-lg border border-border text-sm font-bold text-foreground hover:bg-success/10 hover:border-success/30 transition-all">
                    {fmt(v)}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCreditClientModal(null)} className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
                  Cancelar
                </button>
                <button onClick={handleCreditClient} disabled={creditSaving || !creditAmount}
                  className="flex-1 py-2.5 rounded-lg bg-success text-success-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  {creditSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Creditar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Client History Modal */}
        {clientHistoryModal && (
          <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex items-start justify-center pt-8 md:pt-16 px-4" onClick={() => setClientHistoryModal(null)}>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 md:p-6" onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Histórico de Recargas</h3>
                  <p className="text-sm text-muted-foreground">{clientHistoryModal.nome || clientHistoryModal.email}</p>
                </div>
                <button onClick={() => setClientHistoryModal(null)} className="p-1 rounded-md hover:bg-muted text-muted-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {clientRecargasLoading ? (
                <p className="text-center py-8 text-muted-foreground">Carregando...</p>
              ) : clientRecargas.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">Nenhuma recarga encontrada</p>
              ) : (
                <div className="space-y-2">
                  {clientRecargas.map((r, i) => (
                    <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                          <Smartphone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.operadora || "Operadora"}</p>
                          <p className="text-xs text-muted-foreground font-mono">{r.telefone}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground text-sm">{fmt(r.valor)}</p>
                        <span className={`text-xs font-medium ${
                          r.status === "completed" ? "text-success" : r.status === "pending" ? "text-warning" : "text-destructive"
                        }`}>
                          {r.status === "completed" ? "Concluída" : r.status === "pending" ? "Pendente" : r.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* ===== BROADCAST ===== */}
        {tab === "broadcast" && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Form */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-warning" /> Nova Mensagem
                </h3>
                <BroadcastForm
                  userCount={broadcastUserCount}
                  sending={broadcastSending}
                  onSubmit={async (data) => {
                    setBroadcastSending(true);
                    setBroadcastTitle(data.title);
                    try {
                      // Create notification record
                      const { data: notif, error: notifError } = await (supabase.from('notifications' as any) as any)
                        .insert({
                          title: data.title,
                          message: data.message,
                          image_url: data.image_url,
                          buttons: data.buttons,
                          message_effect_id: data.message_effect_id,
                          created_by: user?.id,
                        })
                        .select()
                        .single();

                      if (notifError) throw notifError;

                      // Start broadcast
                      const { data: result, error } = await supabase.functions.invoke('send-broadcast', {
                        body: { notification_id: notif.id, include_unregistered: false },
                      });

                      if (error) throw error;
                      if (result?.progress_id) {
                        setBroadcastProgressId(result.progress_id);
                        toast.success(`Broadcast iniciado para ${result.total || 0} usuários!`);
                      }
                    } catch (err: any) {
                      toast.error('Erro ao iniciar broadcast: ' + (err.message || 'Erro desconhecido'));
                    } finally {
                      setBroadcastSending(false);
                    }
                  }}
                />
              </div>

              {/* Progress / History */}
              <div className="space-y-4">
                {broadcastProgressId && (
                  <BroadcastProgress
                    progressId={broadcastProgressId}
                    notificationTitle={broadcastTitle}
                    onComplete={() => {
                      toast.success('Broadcast concluído!');
                      // Refresh history
                      fetchBroadcastHistory();
                    }}
                    onResume={async (pid) => {
                      const { error } = await supabase.functions.invoke('send-broadcast', {
                        body: { resume_progress_id: pid },
                      });
                      if (error) toast.error('Erro ao retomar: ' + error.message);
                      else toast.success('Broadcast retomado!');
                    }}
                  />
                )}

                {/* History */}
                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" /> Histórico
                  </h3>
                  {broadcastHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum broadcast realizado.</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {broadcastHistory.map((h: any) => (
                        <div key={h.id} className="flex items-center justify-between p-3 rounded-lg glass text-sm">
                          <div>
                            <p className="font-medium text-foreground">{h.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(h.created_at).toLocaleDateString('pt-BR')} • {h.sent_count} enviados
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            h.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            h.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {h.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </main>
      </div>

      {showOperadoraModal && <OperadoraModal operadora={editOperadora} onClose={() => setShowOperadoraModal(false)} onSaved={fetchOperadoras} />}

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        items={[
          { key: "visao", label: "Home", icon: BarChart3, color: "text-primary", animation: "pulse" },
          { key: "historico", label: "Recargas", icon: History, color: "text-warning", animation: "wiggle" },
          { key: "addSaldo", label: "Saldo", icon: CreditCard, color: "text-success", animation: "pulse", highlighted: true },
          { key: "depositos", label: "Depósitos", icon: Landmark, color: "text-success", animation: "bounce" },
          { key: "loja", label: "Loja", icon: Store, color: "text-accent", animation: "float" },
          { key: "usuarios", label: "Usuários", icon: Users, color: "text-accent", animation: "bounce" },
          { key: "gateway", label: "Gateway", icon: Settings2, color: "text-warning", animation: "wiggle" },
          { key: "precificacao", label: "Precificação", icon: Tag, color: "text-warning", animation: "pulse" },
          { key: "meusprecos", label: "Meus Preços", icon: DollarSign, color: "text-success", animation: "float" },
          { key: "bot", label: "Bot", icon: Bot, color: "text-accent", animation: "wiggle" },
          { key: "broadcast", label: "Broadcast", icon: Megaphone, color: "text-warning", animation: "pulse" },
          { key: "configuracoes", label: "Config", icon: Settings, color: "text-muted-foreground", animation: "spin" },
        ]}
        activeKey={tab}
        onSelect={(key) => {
          setTab(key as any);
          setMenuOpen(false);
        }}
        mainCount={4}
        userLabel={user?.email || "Admin"}
        userRole={role === "admin" ? "Administrador" : "Revendedor"}
        onSignOut={signOut}
        panelLinks={[
          ...(role === "admin" ? [{ label: "Principal", path: "/principal", icon: Users, color: "text-success" }] : []),
          { label: "Painel Cliente", path: "/painel", icon: Landmark, color: "text-primary" },
        ]}
      />
    </div>
  );
}

// ===== ADMIN ADD SALDO SECTION =====
function AdminAddSaldoSection({ saldo, fmt, fmtDate, transactions, userEmail, userName, onDeposited, fetchTransactions }: {
  saldo: number;
  fmt: (v: number) => string;
  fmtDate: (d: string) => string;
  transactions: { id: string; amount: number; type: string; status: string; created_at: string; module: string | null }[];
  userEmail?: string;
  userName?: string;
  onDeposited: () => void;
  fetchTransactions: () => void;
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
    }, 5000);
    return () => clearInterval(interval);
  }, [pixData, paymentConfirmed, onDeposited, fetchTransactions]);

  const handleGeneratePix = async (amount?: number) => {
    const value = amount || parseFloat(depositAmount.replace(",", "."));
    if (!value || value <= 0) { toast.error("Informe um valor válido"); return; }
    setGenerating(true);
    setPixError(null);
    setPixData(null);
    setPaymentConfirmed(false);
    setPollCount(0);
    try {
      const result = await createPixDeposit(value, userEmail, userName, true);
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

  const depositTxs = transactions.filter(t => t.type === "deposit" || t.type === "deposito");

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
          <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            onClick={handleNewPix}
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-all">
            Fazer Novo Depósito
          </motion.button>
        </motion.div>
      ) : !pixData ? (
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-3">
              <QrCode className="h-8 w-8 text-success" />
            </motion.div>
            <h3 className="font-display text-xl font-bold text-foreground">Depositar via PIX</h3>
            <p className="text-sm text-muted-foreground mt-1">Selecione ou digite o valor para gerar o QR Code</p>
          </div>

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

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">R$</span>
            <input type="text" inputMode="decimal" value={depositAmount}
              onChange={e => setDepositAmount(e.target.value.replace(/[^0-9,.]/g, ""))}
              placeholder="Outro valor"
              className="w-full pl-10 pr-3 py-3 rounded-xl glass-input text-foreground font-bold text-lg focus:outline-none focus:ring-2 focus:ring-success/50 border border-border" />
          </div>

          <button onClick={() => handleGeneratePix()} disabled={generating || !depositAmount}
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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6 space-y-5">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-success/15 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="h-7 w-7 text-success" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">PIX Gerado!</h3>
            <p className="text-sm text-muted-foreground">Escaneie o QR Code ou copie o código abaixo</p>
            <p className="text-2xl font-bold text-success mt-2">{fmt(pixData.amount)}</p>
            <p className="text-xs text-muted-foreground mt-1">via PIX</p>
          </div>

          {pixData.qr_code && (
            <div className="flex justify-center">
              <BrandedQRCode value={pixData.qr_code} />
            </div>
          )}

          {pixData.qr_code && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Código PIX Copia e Cola</p>
              <div className="flex gap-2">
                <input readOnly value={pixData.qr_code}
                  className="flex-1 px-3 py-2.5 rounded-xl glass-input text-foreground text-xs font-mono truncate border border-border" />
                <button onClick={handleCopyCode}
                  className={`px-4 rounded-xl font-bold text-sm flex items-center gap-1.5 transition-all ${copied ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground hover:opacity-90"}`}>
                  <Copy className="h-4 w-4" />
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>
            </div>
          )}

          {pixData.payment_link && (
            <a href={pixData.payment_link} target="_blank" rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors">
              <ExternalLink className="h-4 w-4" /> Abrir link de pagamento
            </a>
          )}

          <div className="flex items-center justify-center gap-2 py-2">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </motion.div>
            <p className="text-xs text-muted-foreground">
              Verificando pagamento automaticamente...
              {pollCount > 0 && <span className="ml-1">({pollCount}x)</span>}
            </p>
          </div>

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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${(t.status === "completed" || t.status === "confirmado") ? "bg-success/15" : "bg-warning/15"}`}>
                {(t.status === "completed" || t.status === "confirmado") ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Clock className="h-4 w-4 text-warning" />}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Depósito PIX</p>
                <p className="text-xs text-muted-foreground">{fmtDate(t.created_at)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${(t.status === "completed" || t.status === "confirmado") ? "text-success" : "text-warning"}`}>+{fmt(t.amount)}</p>
              <span className={`text-[10px] font-semibold uppercase tracking-wide ${(t.status === "completed" || t.status === "confirmado") ? "text-success" : "text-warning"}`}>
                {(t.status === "completed" || t.status === "confirmado") ? "✓ Confirmado" : "⏳ Pendente"}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function OperadoraModal({ operadora, onClose, onSaved }: { operadora: Operadora | null; onClose: () => void; onSaved: () => void }) {
  const [nome, setNome] = useState(operadora?.nome || "");
  const [valoresStr, setValoresStr] = useState(operadora?.valores.join(", ") || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    const valores = valoresStr.split(",").map(v => parseFloat(v.trim())).filter(v => !isNaN(v) && v > 0);
    if (!valores.length) { toast.error("Informe ao menos um valor"); return; }
    setLoading(true);
    try {
      if (operadora) {
        const { error } = await supabase.from("operadoras").update({ nome: nome.trim(), valores }).eq("id", operadora.id);
        if (error) throw error;
        toast.success("Operadora atualizada!");
      } else {
        const { error } = await supabase.from("operadoras").insert({ nome: nome.trim(), valores });
        if (error) throw error;
        toast.success("Operadora criada!");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass-modal rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">{operadora ? "Editar" : "Nova"} Operadora</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nome *</label>
            <input type="text" required value={nome} onChange={e => setNome(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Ex: Vivo" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Valores (separados por vírgula) *</label>
            <input type="text" required value={valoresStr} onChange={e => setValoresStr(e.target.value)} className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="10, 15, 20, 30, 50, 100" />
            <p className="text-xs text-muted-foreground mt-1">Ex: 10, 15, 20, 30, 50, 100</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50">{loading ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
