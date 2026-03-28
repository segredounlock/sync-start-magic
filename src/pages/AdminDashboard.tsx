import { useAuth } from "@/hooks/useAuth";
import { useSiteName } from "@/hooks/useSiteName";
import { buildUrl } from "@/lib/domain";
import { renderTelegramHtml } from "@/components/TextFormatToolbar";
import { PinProtection } from "@/components/PinProtection";
import { useDisabledValues } from "@/hooks/useDisabledValues";
import AdminBankDashboard from "@/components/BankDashboard";
// (removed duplicate toast hook)
import { BroadcastForm } from "@/components/BroadcastForm";
import { BroadcastProgress } from "@/components/BroadcastProgress";
import { SkeletonRow, SkeletonCard, SkeletonValue, SkeletonPricingGrid } from "@/components/Skeleton";
import BrandedQRCode from "@/components/BrandedQRCode";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedIcon } from "@/components/AnimatedIcon";
import { FloatingMenuIcon, FloatingGridIcon } from "@/components/FloatingMenuIcon";
import { Suspense, lazy } from "react";
import { AnimatedCounter, AnimatedInt } from "@/components/AnimatedCounter";
import { Currency, IntVal, StatusBadge, getStatusLabel } from "@/components/ui";
import { NotificationBell } from "@/components/NotificationBell";
import { getLocalDayStartUTC, getLocalMonthStartUTC, toLocalDateKey, getTodayLocalKey, formatDateTimeBR, formatDateFullBR } from "@/lib/timezone";
import { MobileBottomNav, NavItem } from "@/components/MobileBottomNav";
import { PixResult } from "@/lib/payment";
import { FloatingPoll } from "@/components/FloatingPoll";
import { useBackgroundPaymentMonitor } from "@/hooks/useBackgroundPaymentMonitor";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut, Users, DollarSign, Smartphone, BarChart3, Plus, Search,
  ToggleLeft, ToggleRight, History, Package, Landmark, TrendingUp,
  RefreshCw, CreditCard, ArrowUpRight, Settings, Tag,
  Save, Eye, EyeOff, Globe, Bot, Zap, Menu, X,
  Wifi, WifiOff, Hash, AtSign, Trash2, AlertTriangle, CheckCircle2, ChevronDown, Link2, RotateCcw,
  Settings2, Store, Upload, Palette, Image, Copy, Loader2, QrCode, ExternalLink, Clock,
  Megaphone, Send, Check, Shield, UserX,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllRows } from "@/lib/fetchAll";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { styledToast as toast } from "@/lib/toast";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

import type { Revendedor, RecargaHistorico, Operadora, PricingRule, Period } from "@/types";
import { usePixDeposit } from "@/hooks/usePixDeposit";
import { useFeePreview } from "@/hooks/useFeePreview";
import { useResilientFetch, guardedFetch } from "@/hooks/useAsync";
import { useCrud } from "@/hooks/useCrud";
import { confirm } from "@/lib/confirm";
import { logAudit } from "@/lib/auditLog";
import { applyCurrencyMask } from "@/lib/currencyMask";
const AuditTab = lazy(() => import("@/components/AuditTab"));

export default function AdminDashboard() {
  const { user, role, signOut } = useAuth();
  const siteName = useSiteName();
  const { isDisabled, toggle: toggleDisabledValue, refetch: refetchDisabled } = useDisabledValues();
  const navigate = useNavigate();
  // Notifications handled by NotificationBell component
  const [revendedores, setRevendedores] = useState<Revendedor[]>([]);
  const { loading, runFetch } = useResilientFetch();
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<"visao" | "historico" | "operadoras" | "usuarios" | "depositos" | "configuracoes" | "precificacao" | "meusprecos" | "bot" | "gateway" | "loja" | "addSaldo" | "broadcast" | "auditoria">("visao");
  const [userSubTab, setUserSubTab] = useState<"revendedores" | "clientes">(role === "revendedor" ? "clientes" : "revendedores");
  const [configSubTab, setConfigSubTab] = useState<"geral" | "pagamentos" | "depositos">("geral");
  const [period, setPeriod] = useState<Period>("7dias");
  const [userSearch, setUserSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);
  const USERS_PER_PAGE = 15;
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ email: "", password: "", nome: "", saldo: "0", role: "revendedor" });
  const [creatingUser, setCreatingUser] = useState(false);
  const [editSaldoUser, setEditSaldoUser] = useState<Revendedor | null>(null);
  const [editSaldoValue, setEditSaldoValue] = useState("");
  const [savingSaldo, setSavingSaldo] = useState(false);
  const [confirmRoleRemove, setConfirmRoleRemove] = useState<Revendedor | null>(null);

  // Broadcast state - restore from localStorage if a broadcast was running
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [broadcastProgressId, setBroadcastProgressId] = useState<string | null>(() => {
    try { return localStorage.getItem('broadcast_progress_id'); } catch { return null; }
  });
  const [broadcastTitle, setBroadcastTitle] = useState(() => {
    try { return localStorage.getItem('broadcast_title') || ''; } catch { return ''; }
  });
  const [broadcastUserCount, setBroadcastUserCount] = useState(0);
  const [broadcastBlockedCount, setBroadcastBlockedCount] = useState(0);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [interruptedBroadcasts, setInterruptedBroadcasts] = useState<any[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showLucroModal, setShowLucroModal] = useState(false);

  // All recargas for analytics
  const [allRecargas, setAllRecargas] = useState<RecargaHistorico[]>([]);
  const [allTransactions, setAllTransactions] = useState<{ amount: number; created_at: string; status: string; type: string }[]>([]);
  const [allProfiles, setAllProfiles] = useState<{ id: string; telegram_id: string | null; telegram_username: string | null; created_at: string }[]>([]);

  // Historico state
  const [recargas, setRecargas] = useState<RecargaHistorico[]>([]);
  const [recargasLoading, setRecargasLoading] = useState(false);
  const recargasLoaded = useRef(false);
  const [recargaSearch, setRecargaSearch] = useState("");
  const [recargaPage, setRecargaPage] = useState(1);
  const RECARGAS_PER_PAGE = 20;

  // Operadoras state
  const [operadoras, setOperadoras] = useState<Operadora[]>([]);
  const [operadorasLoading, setOperadorasLoading] = useState(false);
  const operadorasLoaded = useRef(false);
  const [showOperadoraModal, setShowOperadoraModal] = useState(false);
  const [editOperadora, setEditOperadora] = useState<Operadora | null>(null);

  // Config state
  const [configData, setConfigData] = useState<Record<string, string>>({});
  const [configLoading, setConfigLoading] = useState(false);
  const configLoaded = useRef(false);
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
  const gwLoaded = useRef(false);
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
    { value: "", label: "Nenhuma (usar gateway global)", icon: "🌐", desc: "Usa a configuração global do sistema" },
    { value: "mercadopago", label: "Mercado Pago", icon: "💳", desc: "Pagamentos via Mercado Pago" },
    { value: "pushinpay", label: "PushinPay", icon: "⚡", desc: "Pagamentos PIX instantâneo" },
    { value: "virtualpay", label: "VirtualPay", icon: "💎", desc: "Gateway VirtualPay" },
    { value: "efipay", label: "Efi Pay", icon: "🏦", desc: "Pagamentos via Efi (Gerencianet)" },
    { value: "misticpay", label: "MisticPay", icon: "🔮", desc: "Gateway MisticPay" },
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
  const depositLoaded = useRef(false);
  const [depositSearch, setDepositSearch] = useState("");
  const [selectedDeposit, setSelectedDeposit] = useState<typeof depositTransactions[0] | null>(null);
  const [meuSaldo, setMeuSaldo] = useState(0);
  const [myTransactions, setMyTransactions] = useState<{ id: string; amount: number; type: string; status: string; created_at: string; module: string | null }[]>([]);

  // Client management state
  const [clientsList, setClientsList] = useState<{ id: string; nome: string | null; email: string | null; created_at: string; saldo: number }[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const clientsLoaded = useRef(false);
  const [clientSearch, setClientSearch] = useState("");
  const [creditClientModal, setCreditClientModal] = useState<{ id: string; nome: string | null; email: string | null; saldo: number } | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditSaving, setCreditSaving] = useState(false);
  const [clientHistoryModal, setClientHistoryModal] = useState<{ id: string; nome: string | null; email: string | null } | null>(null);
  const [clientRecargas, setClientRecargas] = useState<{ id: string; telefone: string; operadora: string | null; valor: number; status: string; created_at: string }[]>([]);
  const [clientRecargasLoading, setClientRecargasLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    if (!user?.id) return;
    if (!clientsLoaded.current) setClientsLoading(true);
    try {
      // Get profiles where reseller_id = current user
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email, created_at")
        .eq("reseller_id" as any, user.id)
        .order("created_at", { ascending: false });
      
      if (!profiles?.length) { setClientsList([]); clientsLoaded.current = true; setClientsLoading(false); return; }
      
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
    clientsLoaded.current = true;
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
    if (period === "hoje") return getLocalDayStartUTC(now);
    if (period === "7dias") { const d = new Date(now); d.setDate(d.getDate() - 7); d.setHours(0, 0, 0, 0); return d.toISOString(); }
    if (period === "mes") return getLocalMonthStartUTC(now);
    return new Date(2020, 0, 1).toISOString();
  }, [period]);

  // Tracks whether analytics (recargas+transactions) have been loaded
  const analyticsLoaded = useRef(false);

  // Light initial load: only profiles, roles, saldos (fast)
  const fetchData = useCallback(async () => {
    const t0 = performance.now();
    await runFetch(async () => {
      if (role === "revendedor") {
        const [clientProfiles, ownSaldos, clientSaldos] = await Promise.all([
          fetchAllRows("profiles", { filters: (q: any) => q.eq("reseller_id", user?.id) }),
          fetchAllRows("saldos", { filters: (q: any) => q.eq("user_id", user?.id).eq("tipo", "revenda") }),
          fetchAllRows("saldos", { filters: (q: any) => q.eq("tipo", "revenda") }),
        ]);

        const clientIds = (clientProfiles || []).map((p: any) => p.id);
        if (user?.id && ownSaldos?.length) setMeuSaldo(Number(ownSaldos[0].valor) || 0);

        const saldoMap: Record<string, number> = {};
        clientSaldos?.forEach((s: any) => { if (clientIds.includes(s.user_id)) saldoMap[s.user_id] = Number(s.valor); });

        const list: Revendedor[] = (clientProfiles || []).map((p: any) => ({
          id: p.id, nome: p.nome, email: p.email, active: p.active, created_at: p.created_at,
          saldo: saldoMap[p.id] ?? 0,
          role: "cliente",
          avatar_url: p.avatar_url || null,
        }));
        setRevendedores(list);

        setAllProfiles((clientProfiles || []).map((p: any) => ({ id: p.id, telegram_id: p.telegram_id, telegram_username: p.telegram_username, created_at: p.created_at })));
      } else {
        const [allRoles, allProfilesData, allSaldos] = await Promise.all([
          fetchAllRows("user_roles", { select: "user_id, role" }),
          fetchAllRows("profiles"),
          fetchAllRows("saldos", { filters: (q: any) => q.eq("tipo", "revenda") }),
        ]);

        setAllProfiles((allProfilesData || []).map(p => ({ id: p.id, telegram_id: p.telegram_id, telegram_username: p.telegram_username, created_at: p.created_at })));

        const roleMap: Record<string, string> = {};
        allRoles?.forEach(r => { roleMap[r.user_id] = r.role; });

        const saldoMap: Record<string, number> = {};
        allSaldos?.forEach(s => { saldoMap[s.user_id] = Number(s.valor); });

        if (user?.id) setMeuSaldo(saldoMap[user.id] ?? 0);
        const list: Revendedor[] = (allProfilesData || []).map(p => {
          const normalizedRole = String(roleMap[p.id] || "").toLowerCase();
          const resolvedRole =
            normalizedRole === "user"
              ? "usuario"
              : ["admin", "revendedor", "cliente", "usuario"].includes(normalizedRole)
                ? normalizedRole
                : "sem_role";

          return {
            id: p.id, nome: p.nome, email: p.email, active: p.active, created_at: p.created_at,
            saldo: saldoMap[p.id] ?? 0, role: resolvedRole,
            avatar_url: (p as any).avatar_url || null,
          };
        });
        setRevendedores(list);
      }
    });
    console.log(`[AdminDashboard] fetchData completed in ${(performance.now() - t0).toFixed(0)}ms`);
  }, [role, user?.id, runFetch]);

  // Heavy analytics load: recargas + transactions (deferred, loaded once)
  const fetchAnalytics = useCallback(async () => {
    if (analyticsLoaded.current) return;
    analyticsLoaded.current = true;
    const t0 = performance.now();
    try {
      if (role === "revendedor") {
        const clientIds = revendedores.map(r => r.id);
        const allowedIds = new Set([...clientIds, user?.id]);
        const [recData, transData] = await Promise.all([
          fetchAllRows("recargas", { orderBy: { column: "created_at", ascending: false } }),
          fetchAllRows("transactions", { select: "amount, created_at, status, type, user_id", orderBy: { column: "created_at", ascending: false } }),
        ]);
        const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
        revendedores.forEach(p => { profileMap[p.id] = { nome: p.nome, email: p.email }; });

        setAllRecargas((recData || []).filter((r: any) => allowedIds.has(r.user_id)).map((r: any) => ({
          ...r, valor: Number(r.valor), custo: Number(r.custo),
          user_nome: profileMap[r.user_id]?.nome || null,
          user_email: profileMap[r.user_id]?.email || null,
        })));
        setAllTransactions((transData || []).filter((t: any) => allowedIds.has(t.user_id)).map((t: any) => ({ ...t, amount: Number(t.amount) })));
      } else {
        const [recData, transData] = await Promise.all([
          fetchAllRows("recargas", { orderBy: { column: "created_at", ascending: false } }),
          fetchAllRows("transactions", { select: "amount, created_at, status, type", orderBy: { column: "created_at", ascending: false } }),
        ]);
        const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
        revendedores.forEach(p => { profileMap[p.id] = { nome: p.nome, email: p.email }; });

        setAllRecargas((recData || []).map(r => ({
          ...r, valor: Number(r.valor), custo: Number(r.custo),
          user_nome: profileMap[r.user_id]?.nome || null,
          user_email: profileMap[r.user_id]?.email || null,
        })));
        setAllTransactions((transData || []).map(t => ({ ...t, amount: Number(t.amount) })));
      }
      console.log(`[AdminDashboard] fetchAnalytics completed in ${(performance.now() - t0).toFixed(0)}ms`);
    } catch (err) {
      console.error("fetchAnalytics error:", err);
      analyticsLoaded.current = false;
    }
  }, [role, user?.id, revendedores]);

  const fetchRecargas = useCallback(async () => {
    await guardedFetch(recargasLoaded, setRecargasLoading, async () => {
      const { data: allRec } = await supabase.from("recargas").select("*").order("created_at", { ascending: false }).limit(200);
      if (!allRec?.length) { setRecargas([]); return; }
      const userIds = [...new Set(allRec.map(r => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", userIds);
      const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
      profiles?.forEach(p => { profileMap[p.id] = { nome: p.nome, email: p.email }; });
      setRecargas(allRec.map(r => ({ ...r, valor: Number(r.valor), custo: Number(r.custo), user_nome: profileMap[r.user_id]?.nome || null, user_email: profileMap[r.user_id]?.email || null })));
    });
  }, []);

  const fetchOperadoras = useCallback(async () => {
    await guardedFetch(operadorasLoaded, setOperadorasLoading, async () => {
      const { data } = await supabase.from("operadoras").select("*").order("nome");
      setOperadoras((data || []).map(o => ({ ...o, valores: (o.valores as unknown as number[]) || [] })));
    });
  }, []);

  const fetchConfig = useCallback(async () => {
    await guardedFetch(configLoaded, setConfigLoading, async () => {
      const { data } = await supabase.from("system_config").select("key, value");
      const map: Record<string, string> = {};
      data?.forEach(row => { map[row.key] = row.value || ""; });

      // Revendedor: load bot token from own profile (isolated)
      // Admin: keeps system_config token (same as /principal)
      if (role === "revendedor" && user?.id) {
        const { data: tokenConfig } = await supabase.from("reseller_config").select("value").eq("user_id", user.id).eq("key", "telegram_bot_token").maybeSingle();
        map.telegramBotToken = tokenConfig?.value || "";
      }

      setConfigData(map);
    });
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
            await supabase.from("reseller_config").upsert(
              { user_id: user.id, key: "telegram_bot_token", value: value },
              { onConflict: "user_id,key" }
            );
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
    await guardedFetch(depositLoaded, setDepositLoading, async () => {
      const { data: txs } = await supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(500);
      if (!txs?.length) { setDepositTransactions([]); return; }
      const userIds = [...new Set(txs.map(t => t.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", userIds);
      const profileMap: Record<string, { nome: string | null; email: string | null }> = {};
      profiles?.forEach(p => { profileMap[p.id] = { nome: p.nome, email: p.email }; });
      setDepositTransactions(txs.map(t => ({ ...t, amount: Number(t.amount), user_nome: profileMap[t.user_id]?.nome || undefined, user_email: profileMap[t.user_id]?.email || undefined })));
    });
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

  const { remove: removeResellerPricing } = useCrud("reseller_pricing_rules", { onRefresh: fetchResellerPricingRules, messages: { deleted: "Preço removido (usará preço global)" } });
  const { remove: removePricingRule } = useCrud("pricing_rules", { onRefresh: fetchPricingRules, messages: { deleted: "Regra removida" } });

  const resetResellerPricingRule = async (operadora_id: string, valor_recarga: number) => {
    const existing = resellerPricingRules.find(r => r.operadora_id === operadora_id && r.valor_recarga === valor_recarga);
    if (!existing?.id) return;
    await removeResellerPricing(existing.id);
  };

  const resetPricingRule = async (operadora_id: string, valor_recarga: number) => {
    const existing = pricingRules.find(r => r.operadora_id === operadora_id && r.valor_recarga === valor_recarga);
    if (!existing?.id) return;
    await removePricingRule(existing.id);
  };

  // Target user pricing (admin managing pricing for a specific reseller or client)
  const fetchTargetUserPricingRules = useCallback(async (userId: string) => {
    if (!userId) { setTargetUserPricingRules([]); return; }
    try {
      const { data } = await supabase.from("reseller_pricing_rules").select("*").eq("user_id", userId);
      setTargetUserPricingRules((data || []).map((r: any) => ({ ...r, valor_recarga: Number(r.valor_recarga), custo: Number(r.custo), regra_valor: Number(r.regra_valor), tipo_regra: r.tipo_regra as "fixo" | "margem" })));
    } catch (err) { console.error(err); }
  }, []);

  const saveTargetUserPricingRule = async (userId: string, rule: PricingRule) => {
    const key = `t-${rule.operadora_id}-${rule.valor_recarga}`;
    setTargetUserPricingSaving(prev => ({ ...prev, [key]: true }));
    try {
      const { error } = await supabase.from("reseller_pricing_rules").upsert({
        user_id: userId,
        operadora_id: rule.operadora_id,
        valor_recarga: rule.valor_recarga,
        custo: rule.custo,
        tipo_regra: rule.tipo_regra,
        regra_valor: rule.regra_valor,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: "user_id,operadora_id,valor_recarga" } as any);
      if (error) throw error;
      toast.success(`Preço para R$ ${rule.valor_recarga.toFixed(2)} salvo!`);
      fetchTargetUserPricingRules(userId);
    } catch (err: any) { toast.error(err.message || "Erro ao salvar"); }
    setTargetUserPricingSaving(prev => ({ ...prev, [key]: false }));
  };

  const resetTargetUserPricingRule = async (userId: string, operadora_id: string, valor_recarga: number) => {
    const existing = targetUserPricingRules.find(r => r.operadora_id === operadora_id && r.valor_recarga === valor_recarga);
    if (!existing?.id) return;
    try {
      await (supabase.from("reseller_pricing_rules" as any) as any).delete().eq("id", existing.id);
      toast.success("Preço removido (usará preço global)");
      fetchTargetUserPricingRules(userId);
    } catch (err: any) { toast.error(err.message || "Erro"); }
  };

  // Background payment monitor — load admin deposit toast config
  const [adminDepositToast, setAdminDepositToast] = useState(true);
  useEffect(() => {
    supabase.from("system_config").select("value").eq("key", "notif_admin_deposit").maybeSingle()
      .then(({ data }) => { if (data && data.value === "false") setAdminDepositToast(false); });
  }, []);
  const handleBgPaymentConfirmed = useCallback(() => { analyticsLoaded.current = false; fetchData(); }, [fetchData]);
  useBackgroundPaymentMonitor(user?.id, handleBgPaymentConfirmed, adminDepositToast, false);

  // Load current user's avatar
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      try {
        const { data, error } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
        if (!error && data?.avatar_url) setMyAvatarUrl(data.avatar_url);
      } catch (e) { console.error("Failed to load avatar:", e); }
    })();
  }, [user?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);
  // Load analytics lazily when dashboard (visao) or usuarios tab is active and revendedores are loaded
  useEffect(() => { if ((tab === "visao" || tab === "usuarios") && revendedores.length > 0) fetchAnalytics(); }, [tab, revendedores.length, fetchAnalytics]);
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
    const totalCobrado = filteredRecargas.reduce((s, r) => s + r.custo, 0);
    const totalCustoApi = filteredRecargas.reduce((s, r) => s + (Number((r as any).custo_api) || 0), 0);
    const lucro = totalCobrado - totalCustoApi;
    const totalDeposited = filteredTransactions.filter(t => (t.status === "completed" || t.status === "confirmado") && (t.type === "deposit" || t.type === "deposito")).reduce((s, t) => s + t.amount, 0);
    const txCount = filteredTransactions.length;
    const saldoCarteiras = revendedores.reduce((s, r) => s + r.saldo, 0);
    const totalRec = filteredRecargas.length;
    const successRec = filteredRecargas.filter(r => r.status === "completed" || r.status === "concluida").length;
    const pendingRec = filteredRecargas.filter(r => r.status === "pending" || r.status === "pendente").length;
    const ticketMedio = totalRec > 0 ? totalVendas / totalRec : 0;

    // Lucro por operadora breakdown
    const lucroPorOperadora: { operadora: string; cobrado: number; custoApi: number; lucro: number; count: number }[] = [];
    const opMap: Record<string, { cobrado: number; custoApi: number; count: number }> = {};
    filteredRecargas.forEach(r => {
      const op = (r.operadora || "Outros").toUpperCase();
      if (!opMap[op]) opMap[op] = { cobrado: 0, custoApi: 0, count: 0 };
      opMap[op].cobrado += r.custo;
      opMap[op].custoApi += Number((r as any).custo_api) || 0;
      opMap[op].count += 1;
    });
    Object.entries(opMap).sort((a, b) => (b[1].cobrado - b[1].custoApi) - (a[1].cobrado - a[1].custoApi)).forEach(([op, v]) => {
      lucroPorOperadora.push({ operadora: op, cobrado: v.cobrado, custoApi: v.custoApi, lucro: v.cobrado - v.custoApi, count: v.count });
    });

    return { totalVendas, totalCobrado, totalCustoApi, lucro, totalDeposited, txCount, saldoCarteiras, totalRec, successRec, pendingRec, ticketMedio, lucroPorOperadora };
  }, [filteredRecargas, filteredTransactions, revendedores]);

  // Helper: data local YYYY-MM-DD (sem problemas de fuso UTC)
  // Now using centralized timezone utility

  // Chart: Vendas & Lucro por dia (preenche todos os dias do período)
  const vendasLucroPorDia = useMemo(() => {
    const map: Record<string, { cobrado: number; custoApi: number }> = {};
    filteredRecargas.forEach(r => {
      const day = toLocalDateKey(r.created_at);
      if (!map[day]) map[day] = { cobrado: 0, custoApi: 0 };
      map[day].cobrado += r.custo;
      map[day].custoApi += Number((r as any).custo_api) || 0;
    });
    // Preencher todos os dias do período
    const start = new Date(periodStart);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const days: { day: string; vendas: number; lucro: number }[] = [];
    for (let d = new Date(start.getFullYear(), start.getMonth(), start.getDate()); d <= today; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const v = map[key] || { cobrado: 0, custoApi: 0 };
      days.push({
        day: d.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" }),
        vendas: v.cobrado,
        lucro: v.cobrado - v.custoApi,
      });
    }
    return days;
  }, [filteredRecargas, periodStart]);

  const displayVendasLucro = vendasLucroPorDia;



  // Chart: Novos usuários por dia (preenche todos os dias do período)
  const novosPorDia = useMemo(() => {
    const map: Record<string, number> = {};
    revendedores.filter(r => r.created_at >= periodStart).forEach(r => {
      const day = toLocalDateKey(r.created_at);
      map[day] = (map[day] || 0) + 1;
    });
    // Preencher todos os dias do período
    const start = new Date(periodStart);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const days: { day: string; count: number }[] = [];
    for (let d = new Date(start.getFullYear(), start.getMonth(), start.getDate()); d <= today; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      days.push({
        day: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }),
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
      const op = (r.operadora || "Outros").toUpperCase().trim();
      map[op] = (map[op] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredRecargas]);

  const displayMixOperadoras = mixOperadoras;

  // Chart: Volume de depósitos por dia
  const depositosPorDia = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTransactions.filter(t => (t.type === "deposit" || t.type === "deposito") && (t.status === "completed" || t.status === "confirmado")).forEach(t => {
      const day = toLocalDateKey(t.created_at);
      map[day] = (map[day] || 0) + t.amount;
    });
    return Object.entries(map).sort().map(([day, total]) => ({
      day: new Date(day + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" }),
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

  // Pricing sub-tab state (admin)
  const [pricingSubTab, setPricingSubTab] = useState<"global" | "revendedor">("global");
  const [pricingTargetUserId, setPricingTargetUserId] = useState<string>("");
  const [targetUserPricingRules, setTargetUserPricingRules] = useState<PricingRule[]>([]);
  const [targetUserPricingSelectedOp, setTargetUserPricingSelectedOp] = useState<string>("");
  const [targetUserPricingSaving, setTargetUserPricingSaving] = useState<Record<string, boolean>>({});



  const toggleOperadora = async (op: Operadora) => {
    const { error } = await supabase.from("operadoras").update({ ativo: !op.ativo }).eq("id", op.id);
    if (error) { toast.error("Erro ao atualizar operadora"); return; }
    toast.success(op.ativo ? "Operadora desativada" : "Operadora ativada");
    fetchOperadoras();
  };

  const { remove: removeOperadora } = useCrud("operadoras", { onRefresh: fetchOperadoras, messages: { deleted: "Operadora excluída" } });
  const deleteOperadora = async (op: Operadora) => {
    await removeOperadora(op.id, `Excluir operadora ${op.nome}?`);
  };




  const filteredRecargasHistorico = recargas.filter(r =>
    r.telefone.includes(recargaSearch) ||
    (r.user_nome || "").toLowerCase().includes(recargaSearch.toLowerCase()) ||
    (r.user_email || "").toLowerCase().includes(recargaSearch.toLowerCase()) ||
    (r.operadora || "").toLowerCase().includes(recargaSearch.toLowerCase())
  );

  const recargaTotalPages = Math.max(1, Math.ceil(filteredRecargasHistorico.length / RECARGAS_PER_PAGE));
  const paginatedRecargas = filteredRecargasHistorico.slice((recargaPage - 1) * RECARGAS_PER_PAGE, recargaPage * RECARGAS_PER_PAGE);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string) => formatDateTimeBR(d);

  // Gateway config fetch/save
  const fetchGatewayConfig = useCallback(async () => {
    if (!user) return;
    if (!gwLoaded.current) setGwLoading(true);
    try {
      const { data } = await supabase.from("reseller_config").select("key, value").eq("user_id", user.id);
      const cfg: Record<string, string> = {};
      data?.forEach((r: any) => { cfg[r.key] = r.value || ""; });
      setGwModule(cfg.paymentModule || "");
      setGwFields(cfg);
    } catch (err) { console.error(err); }
    gwLoaded.current = true;
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
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado. Use JPG, PNG, WebP ou GIF.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 8MB.");
      return;
    }
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
      .select('id, title, message, image_url, buttons, sent_count, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) {
      const ids = data.map((n: any) => n.id);
      const { data: progresses } = await (supabase.from('broadcast_progress' as any) as any)
        .select('notification_id, status, sent_count, failed_count, total_users')
        .in('notification_id', ids)
        .order('created_at', { ascending: false });
      
      const progressMap: Record<string, any> = {};
      progresses?.forEach((p: any) => { if (!progressMap[p.notification_id]) progressMap[p.notification_id] = p; });
      
      setBroadcastHistory(data.map((n: any) => {
        const prog = progressMap[n.id];
        const isFailed = prog?.status === 'completed' && (prog?.sent_count || 0) === 0 && (prog?.failed_count || 0) > 0;
        return { ...n, status: prog?.status || 'pending', broadcast_failed: isFailed, bp_failed_count: prog?.failed_count || 0, bp_total_users: prog?.total_users || 0 };
      }));
    }

    // Fetch interrupted broadcasts
    const { data: interrupted } = await (supabase.from('broadcast_progress' as any) as any)
      .select('*, notification:notifications(title)')
      .in('status', ['cancelled', 'failed'])
      .order('created_at', { ascending: false });
    if (interrupted) {
      const incomplete = interrupted.filter((b: any) => (b.sent_count + b.failed_count) < b.total_users);
      setInterruptedBroadcasts(incomplete);
    }
  }, []);

  const fetchBroadcastUserCount = useCallback(async () => {
    const [activeRes, blockedRes] = await Promise.all([
      (supabase.from('telegram_users' as any) as any)
        .select('*', { count: 'exact', head: true })
        .eq('is_blocked', false)
        .eq('is_registered', true),
      (supabase.from('telegram_users' as any) as any)
        .select('*', { count: 'exact', head: true })
        .eq('is_blocked', true),
    ]);
    setBroadcastUserCount(activeRes.count || 0);
    setBroadcastBlockedCount(blockedRes.count || 0);
  }, []);

  useEffect(() => { if (tab === "broadcast") { fetchBroadcastHistory(); fetchBroadcastUserCount(); } }, [tab, fetchBroadcastHistory, fetchBroadcastUserCount]);

  // Persist broadcast progress to localStorage so it survives page navigation
  useEffect(() => {
    try {
      if (broadcastProgressId) {
        localStorage.setItem('broadcast_progress_id', broadcastProgressId);
        localStorage.setItem('broadcast_title', broadcastTitle);
      } else {
        localStorage.removeItem('broadcast_progress_id');
        localStorage.removeItem('broadcast_title');
      }
    } catch {}
  }, [broadcastProgressId, broadcastTitle]);

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
    <PinProtection configKey="adminPin">
    <div className="min-h-screen md:flex">
      {/* Mobile Menu Bottom Sheet */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[60] md:hidden" onClick={() => setMenuOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-[61] md:hidden rounded-t-2xl bg-background shadow-[0_-8px_30px_rgba(0,0,0,0.4)] pb-[env(safe-area-inset-bottom)]">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
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
            <div className="mx-4 mb-3 p-3 rounded-xl bg-muted/50">
              <div className="flex items-center gap-3">
                {myAvatarUrl ? (
                  <img src={myAvatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    {(user?.email?.[0] || "A").toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role || "Admin"}</p>
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
                    onClick={() => { if (item.link) { navigate(item.link); } else { setTab(item.key as any); } setMenuOpen(false); }}
                    className={`flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl active:scale-95 ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/40 text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <FloatingGridIcon icon={item.icon} color={item.color} isActive={isActive} index={index} />
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
      <aside className="hidden md:block md:sticky top-0 left-0 h-screen w-[260px] z-30 border-r border-border bg-card">
        <div className="h-full flex flex-col">
          <div className="px-5 py-5 border-b border-border">
            <h1 className="font-display text-xl font-bold shimmer-letters truncate">
              {siteName}
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-primary font-semibold mt-1.5">Admin</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
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
                    onClick={() => { if (item.link) { navigate(item.link); } else { setTab(item.key as any); } setMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    <FloatingMenuIcon icon={item.icon} color={item.color} isActive={isActive} index={index} />
                    <motion.span whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                      {item.label}
                    </motion.span>
                    {item.link && <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />}
                    {!item.link && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />}
                  </button>
                </motion.div>
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
              {tab === "auditoria" && "Histórico de ações administrativas."}
              
            </p>
          </div>
          {tab === "historico" && (
            <button onClick={fetchRecargas} className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors" title="Atualizar">
              <RefreshCw className={`h-4 w-4 ${recargasLoading ? "animate-spin" : ""}`} />
            </button>
          )}
          <NotificationBell listenTo={["deposit", "new_user"]} />
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
              <div className="flex rounded-2xl overflow-hidden bg-muted/40 border border-border/40 p-1 gap-0.5 w-fit">
                {([
                  { key: "hoje", label: "Hoje" },
                  { key: "7dias", label: "7 Dias" },
                  { key: "mes", label: "Mês" },
                  { key: "total", label: "Total" },
                ] as { key: Period; label: string }[]).map(p => (
                  <button
                    key={p.key}
                    onClick={() => setPeriod(p.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${period === p.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank-style Dashboard */}
            <AdminBankDashboard
              lucro={analytics.lucro}
              totalDeposited={analytics.totalDeposited}
              saldoCarteiras={analytics.saldoCarteiras}
              ticketMedio={analytics.ticketMedio}
              totalRec={analytics.totalRec}
              successRec={analytics.successRec}
              pendingRec={analytics.pendingRec}
              meuSaldo={meuSaldo}
              loading={loading}
              onAddSaldo={() => setTab("addSaldo")}
              onNavigate={(t) => setTab(t as typeof tab)}
              onShowLucroModal={() => role === "admin" && setShowLucroModal(true)}
              lucroPct={analytics.totalCobrado > 0 ? (analytics.lucro / analytics.totalCobrado) * 100 : 0}
              txCount={analytics.txCount}
              totalCobrado={analytics.totalCobrado}
            />



            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Vendas & Lucro */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-9 h-9 rounded-lg bg-success/15 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-base">Vendas & Lucro (7 dias)</h4>
                    <p className="text-xs text-muted-foreground">Recargas realizadas pelo bot</p>
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
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-base">Por Operadora</h4>
                    <p className="text-xs text-muted-foreground">Distribuição de vendas</p>
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
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input type="text" value={recargaSearch} onChange={e => { setRecargaSearch(e.target.value); setRecargaPage(1); }} placeholder="Buscar por telefone, revendedor ou operadora..." className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-[13px]" />
            </div>

            {/* Stats compactos */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: "Total", value: filteredRecargasHistorico.length, color: "text-foreground" },
                { label: "Concluídas", value: filteredRecargasHistorico.filter(r => r.status === "completed" || r.status === "concluida").length, color: "text-success" },
                { label: "Pendentes", value: filteredRecargasHistorico.filter(r => r.status === "pending").length, color: "text-warning" },
                { label: "Falhas", value: filteredRecargasHistorico.filter(r => r.status === "falha" || r.status === "failed").length, color: "text-destructive" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-lg p-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</p>
                  <p className={`text-lg font-bold mt-0.5 ${s.color}`}><AnimatedInt value={s.value} /></p>
                </motion.div>
              ))}
            </div>

            {/* Mobile: Card Layout */}
            <div className="md:hidden space-y-2">
              {recargasLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : paginatedRecargas.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma recarga encontrada</p>
              ) : paginatedRecargas.map((r, idx) => {
                const initials = (r.user_nome || r.user_email || "?").slice(0, 2).toUpperCase();
                const avatarColors = ["bg-primary", "bg-accent", "bg-warning", "bg-success", "bg-destructive"];
                const colorIdx = (r.user_id || "").charCodeAt(0) % avatarColors.length;
                // Status via plugin
                return (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="glass-card rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full ${avatarColors[colorIdx]} ring-2 ring-background flex items-center justify-center text-[10px] font-bold text-primary-foreground`}>
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-[13px] truncate">{r.user_nome || "—"}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{r.user_email || "—"}</p>
                        </div>
                      </div>
                      <StatusBadge status={r.status} type="recarga" className="flex-shrink-0" />
                    </div>
                    <div className="grid grid-cols-4 gap-2 pt-2 border-t border-border/50">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Operadora</p>
                        <p className="text-[12px] font-semibold text-foreground">{(r.operadora || "—").toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Telefone</p>
                        <p className="text-[12px] font-mono text-foreground">{r.telefone}</p>
                      </div>
                       <div className="text-right">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Valor</p>
                        <p className="text-[12px] font-bold font-mono text-foreground tabular-nums"><Currency value={r.valor} duration={600} delay={idx * 40} /></p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Lucro</p>
                        <p className="text-[12px] font-bold font-mono text-success tabular-nums">
                          {(r.status === "completed" || r.status === "concluida") ? <Currency value={(Number(r.custo) || 0) - (Number((r as any).custo_api) || 0)} sign duration={600} delay={idx * 40} /> : "—"}
                        </p>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{fmtDate(r.created_at)}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden md:block glass-card rounded-lg overflow-hidden">
              <table className="w-full" style={{ fontSize: "13px" }}>
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Usuário</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Detalhes</th>
                    <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor</th>
                    <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lucro</th>
                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recargasLoading ? (
                    <tr><td colSpan={6} className="py-4"><div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div></td></tr>
                  ) : paginatedRecargas.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Nenhuma recarga encontrada</td></tr>
                  ) : paginatedRecargas.map((r, idx) => {
                    const initials = (r.user_nome || r.user_email || "?").slice(0, 2).toUpperCase();
                    const avatarColors = ["bg-primary", "bg-accent", "bg-warning", "bg-success", "bg-destructive"];
                    const colorIdx = (r.user_id || "").charCodeAt(0) % avatarColors.length;
                    const lucro = (r.status === "completed" || r.status === "concluida") ? (Number(r.custo) || 0) - (Number((r as any).custo_api) || 0) : 0;
                    return (
                      <motion.tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-primary/[0.04] transition-colors group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap text-[11px]">{fmtDate(r.created_at)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full ${avatarColors[colorIdx]} ring-2 ring-background flex items-center justify-center text-[10px] font-bold text-primary-foreground`}>
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-[13px] truncate">{r.user_nome || "—"}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{r.user_email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="text-foreground text-[13px] font-medium">{(r.operadora || "—").toUpperCase()}</p>
                          <p className="font-mono text-muted-foreground text-[11px]">{r.telefone}</p>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <p className="font-mono font-bold text-foreground tabular-nums"><Currency value={r.valor} duration={600} delay={idx * 20} /></p>
                          {role === "admin" && <p className="text-[11px] text-muted-foreground font-mono tabular-nums">Custo: <Currency value={r.custo} duration={600} delay={idx * 20} /></p>}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {(r.status === "completed" || r.status === "concluida") ? (
                            <Currency value={lucro} sign className="font-mono font-bold text-success tabular-nums" duration={600} delay={idx * 20} />
                          ) : (
                            <span className="text-muted-foreground text-[11px]">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <StatusBadge status={r.status} type="recarga" />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {recargaTotalPages > 1 && (
              <div className="flex items-center justify-between mt-3 px-1">
                <span className="text-[11px] text-muted-foreground">
                  {filteredRecargasHistorico.length} resultado{filteredRecargasHistorico.length !== 1 ? 's' : ''} · Pág. {recargaPage}/{recargaTotalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRecargaPage(p => Math.max(1, p - 1))}
                    disabled={recargaPage <= 1}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted/50 text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: Math.min(5, recargaTotalPages) }, (_, i) => {
                    let page: number;
                    if (recargaTotalPages <= 5) {
                      page = i + 1;
                    } else if (recargaPage <= 3) {
                      page = i + 1;
                    } else if (recargaPage >= recargaTotalPages - 2) {
                      page = recargaTotalPages - 4 + i;
                    } else {
                      page = recargaPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setRecargaPage(page)}
                        className={`w-7 h-7 rounded-md text-[11px] font-medium transition-colors ${
                          recargaPage === page ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-foreground hover:bg-muted'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setRecargaPage(p => Math.min(recargaTotalPages, p + 1))}
                    disabled={recargaPage >= recargaTotalPages}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted/50 text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
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
                      <h3 className="font-semibold text-foreground">{(op.nome || "").toUpperCase()}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${op.ativo ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                        {op.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {op.valores.map(v => {
                        const disabled = isDisabled(op.id, v);
                        return (
                          <button
                            key={v}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (!user?.id) return;
                              await toggleDisabledValue(op.id, v, user.id);
                            }}
                            className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                              disabled
                                ? "bg-destructive/15 text-destructive line-through opacity-60"
                                : "bg-muted text-foreground hover:bg-primary/10"
                            }`}
                            title={disabled ? "Clique para reativar este valor" : "Clique para desativar este valor"}
                          >
                            {fmt(v)} {disabled ? "✕" : ""}
                          </button>
                        );
                      })}
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
                          logAudit("create_user", "user", res.data?.user_id, { email: newUserData.email, nome: newUserData.nome, role: newUserData.role, saldo: parseFloat(newUserData.saldo) || 0 });
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
                onChange={e => { setUserSearch(e.target.value); setUsersPage(1); }}
                className="w-full sm:w-96 pl-10 pr-4 py-2.5 rounded-lg border border-input bg-muted/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-lg p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Total</p>
                <p className="text-lg font-bold text-foreground mt-0.5"><AnimatedInt value={revendedores.length} /></p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-lg p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-success font-semibold">Ativos</p>
                <p className="text-lg font-bold text-success mt-0.5"><AnimatedInt value={revendedores.filter(r => r.active).length} /></p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-lg p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-destructive font-semibold">Inativos</p>
                <p className="text-lg font-bold text-destructive mt-0.5"><AnimatedInt value={revendedores.filter(r => !r.active).length} /></p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-lg p-2.5 text-center">
                <p className="text-[9px] uppercase tracking-wider text-warning font-semibold">Saldo</p>
                <p className="text-lg font-bold text-warning mt-0.5 font-mono"><AnimatedCounter value={revendedores.reduce((s, r) => s + r.saldo, 0)} prefix="R$" /></p>
              </motion.div>
            </div>

            {/* Mobile: User Cards */}
            <div className="md:hidden space-y-2">
              {loading ? (
                <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : (() => {
                const filtered = revendedores.filter(r => {
                  if (!userSearch.trim()) return true;
                  const q = userSearch.toLowerCase();
                  return (r.nome || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
                });
                if (filtered.length === 0) return <p className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</p>;
                const totalPages = Math.ceil(filtered.length / USERS_PER_PAGE);
                const paged = filtered.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE);
                const todayStr = getTodayLocalKey();
                return <>{paged.map((r, idx) => {
                  const initials = (r.nome || r.email || "?").slice(0, 1).toUpperCase();
                  const colors = ["bg-primary", "bg-accent", "bg-warning", "bg-success", "bg-destructive"];
                  const colorIdx = r.id.charCodeAt(0) % colors.length;
                  const userRecs = allRecargas.filter(rc => rc.user_id === r.id);
                  const recCount = userRecs.length;
                  const completedRecs = userRecs.filter(rc => rc.status === "completed" || rc.status === "concluida");
                  const totalVendido = completedRecs.reduce((s, rc) => s + (Number(rc.custo) || 0), 0);
                  const totalLucro = completedRecs.reduce((s, rc) => s + ((Number(rc.custo) || 0) - (Number((rc as any).custo_api) || 0)), 0);
                  const roleBadge = r.role === "admin"
                    ? { label: "ADM", cls: "bg-warning/20 text-warning" }
                    : r.role === "revendedor"
                    ? { label: "REV", cls: "bg-success/20 text-success" }
                    : r.role === "cliente"
                    ? { label: "CLI", cls: "bg-primary/20 text-primary" }
                    : { label: "USR", cls: "bg-muted text-muted-foreground" };
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
                      className="glass-card rounded-xl p-3">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="relative shrink-0">
                          {r.avatar_url ? (
                            <img src={r.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-border" />
                          ) : (
                            <div className={`w-8 h-8 rounded-full ${colors[colorIdx]} flex items-center justify-center text-xs font-bold text-primary-foreground ring-2 ring-border`}>
                              {initials}
                            </div>
                          )}
                          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${r.active ? "bg-success" : "bg-destructive"}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground text-[13px] truncate leading-tight">{r.nome || "—"}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{r.email || "—"}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 ${roleBadge.cls}`}>{roleBadge.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-border/50">
                        <div className="text-center">
                          <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">Saldo</p>
                          <p className="text-[11px] font-bold font-mono text-foreground"><AnimatedCounter value={r.saldo} prefix="R$" decimals={0} /></p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">Vendas</p>
                          <p className="text-[11px] font-bold font-mono text-success"><AnimatedCounter value={totalVendido} prefix="R$&nbsp;" duration={600} /></p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">Recs</p>
                          <p className="text-[11px] font-bold text-foreground"><AnimatedInt value={recCount} /></p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] uppercase tracking-wider text-muted-foreground font-semibold">Lucro</p>
                          <p className="text-[11px] font-bold font-mono text-success"><AnimatedCounter value={totalLucro} prefix="R$&nbsp;" duration={600} /></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/50">
                        <button onClick={() => { setEditSaldoUser(r); setEditSaldoValue(String(r.saldo)); }}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-success/15 text-success hover:bg-success/25 transition-colors">Saldo</button>
                        <button onClick={() => navigate("/principal")}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-muted/60 text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3" /> Ver
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button disabled={usersPage <= 1} onClick={() => setUsersPage(p => p - 1)} className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-muted/60 text-foreground hover:bg-muted disabled:opacity-40 transition-colors">Anterior</button>
                    <span className="text-[10px] text-muted-foreground">{usersPage} / {totalPages}</span>
                    <button disabled={usersPage >= totalPages} onClick={() => setUsersPage(p => p + 1)} className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-muted/60 text-foreground hover:bg-muted disabled:opacity-40 transition-colors">Próximo</button>
                  </div>
                )}
                </>;
              })()}
            </div>

            <div className="hidden md:block glass-card rounded-xl overflow-hidden">
              <table className="w-full" style={{ fontSize: "13px" }}>
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Usuário</th>
                    <th className="text-center px-2 py-2 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Tipo</th>
                    <th className="text-center px-2 py-2 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Saldo</th>
                    <th className="text-center px-2 py-2 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Recs</th>
                    <th className="text-center px-2 py-2 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Hoje</th>
                    <th className="text-center px-2 py-2 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Vendido</th>
                    <th className="text-center px-2 py-2 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Lucro</th>
                    <th className="text-center px-2 py-2 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Status</th>
                    <th className="text-center px-2 py-2 font-bold text-muted-foreground uppercase text-[10px] tracking-widest">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="py-4"><div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div></td></tr>
                  ) : (() => {
                    const filtered = revendedores.filter(r => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return (r.nome || "").toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
                    });
                    if (filtered.length === 0) return <tr><td colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</td></tr>;
                    const totalPagesD = Math.ceil(filtered.length / USERS_PER_PAGE);
                    const pagedD = filtered.slice((usersPage - 1) * USERS_PER_PAGE, usersPage * USERS_PER_PAGE);
                    const todayStr = getTodayLocalKey();
                    return <>{pagedD.map((r, idx) => {
                      const initials = (r.nome || r.email || "?").slice(0, 1).toUpperCase();
                      const colors = ["bg-primary", "bg-accent", "bg-warning", "bg-success", "bg-destructive"];
                      const colorIdx = r.id.charCodeAt(0) % colors.length;
                      const userRecs = allRecargas.filter(rc => rc.user_id === r.id);
                      const recCount = userRecs.length;
                      const recHoje = userRecs.filter(rc => toLocalDateKey(rc.created_at) === todayStr).length;
                      const completedRecs = userRecs.filter(rc => rc.status === "completed" || rc.status === "concluida");
                      const totalVendido = completedRecs.reduce((s, rc) => s + (Number(rc.custo) || 0), 0);
                      const totalLucro = completedRecs.reduce((s, rc) => s + ((Number(rc.custo) || 0) - (Number((rc as any).custo_api) || 0)), 0);
                      const saldoBaixo = r.saldo > 0 && r.saldo < 10;
                      const roleBadge = r.role === "admin"
                        ? { label: "ADMIN", cls: "bg-warning/20 text-warning" }
                        : r.role === "revendedor"
                        ? { label: "REVEND", cls: "bg-success/20 text-success" }
                        : r.role === "cliente"
                        ? { label: "CLIENTE", cls: "bg-primary/20 text-primary" }
                        : r.role === "usuario"
                        ? { label: "USUÁRIO", cls: "bg-accent/20 text-accent" }
                        : { label: "SEM ROLE", cls: "bg-muted text-muted-foreground" };
                      return (
                        <motion.tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-primary/[0.04] transition-colors cursor-pointer group"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="relative shrink-0">
                                {r.avatar_url ? (
                                  <img src={r.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-border" />
                                ) : (
                                  <div className={`w-8 h-8 rounded-full ${colors[colorIdx]} flex items-center justify-center text-xs font-bold text-primary-foreground ring-2 ring-border`}>
                                    {initials}
                                  </div>
                                )}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${r.active ? "bg-success" : "bg-destructive"}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate text-[13px] leading-tight">{r.nome || "—"}</p>
                                <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">{r.email || "—"}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${roleBadge.cls}`}>
                              {roleBadge.label}
                            </span>
                          </td>
                          <td className="px-2 py-2.5 text-center">
                            <span className={`font-mono font-medium text-[13px] tabular-nums ${saldoBaixo ? "text-warning" : "text-foreground"}`}>
                              <AnimatedCounter value={r.saldo} prefix="R$&nbsp;" />
                            </span>
                            {saldoBaixo && <p className="text-[9px] text-warning italic leading-tight">Baixo</p>}
                          </td>
                          <td className="px-2 py-2.5 text-center text-[13px] text-foreground tabular-nums"><AnimatedInt value={recCount} /></td>
                          <td className="px-2 py-2.5 text-center">
                            <span className={`font-medium text-[13px] tabular-nums ${recHoje > 0 ? "bg-primary/15 text-primary px-1.5 py-0.5 rounded" : "text-foreground"}`}>
                              <AnimatedInt value={recHoje} />
                            </span>
                          </td>
                          <td className="px-2 py-2.5 text-center font-mono font-medium text-[13px] text-success tabular-nums"><AnimatedCounter value={totalVendido} prefix="R$&nbsp;" /></td>
                          <td className="px-2 py-2.5 text-center font-mono font-medium text-[13px] text-success tabular-nums"><AnimatedCounter value={totalLucro} prefix="R$&nbsp;" /></td>
                          <td className="px-2 py-2.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${r.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${r.active ? "bg-success" : "bg-destructive"}`} />
                              {r.active ? "Ativo" : "Off"}
                            </span>
                          </td>
                          <td className="px-2 py-2.5">
                            <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={(e) => { e.stopPropagation(); setEditSaldoUser(r); setEditSaldoValue(String(r.saldo)); }}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold bg-success/15 text-success hover:bg-success/25 transition-colors flex items-center gap-0.5">
                                <DollarSign className="h-3 w-3" /> Saldo
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); navigate(`/perfil/${(r as any).slug || r.id}`); }}
                                className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Ver perfil">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setClientHistoryModal({ id: r.id, nome: r.nome, email: r.email }); fetchClientRecargas(r.id); }}
                                className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Histórico">
                                <History className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                    {totalPagesD > 1 && (
                      <tr><td colSpan={9} className="py-2">
                        <div className="flex items-center justify-center gap-2">
                          <button disabled={usersPage <= 1} onClick={() => setUsersPage(p => p - 1)} className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-muted/60 text-foreground hover:bg-muted disabled:opacity-40 transition-colors">Anterior</button>
                          <span className="text-[10px] text-muted-foreground">{usersPage} / {totalPagesD}</span>
                          <button disabled={usersPage >= totalPagesD} onClick={() => setUsersPage(p => p + 1)} className="px-3 py-1 rounded-lg text-[10px] font-semibold bg-muted/60 text-foreground hover:bg-muted disabled:opacity-40 transition-colors">Próximo</button>
                        </div>
                      </td></tr>
                    )}
                    </>;
                  })()}
                </tbody>
              </table>
            </div>

            {/* Modal editar saldo */}
            <AnimatePresence>
              {editSaldoUser && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 backdrop-blur-sm" onClick={() => setEditSaldoUser(null)}>
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
                          logAudit("set_saldo", "saldo", editSaldoUser.id, { anterior: editSaldoUser.saldo, novo: newVal, nome: editSaldoUser.nome || editSaldoUser.email });
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
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-background/70 backdrop-blur-sm" onClick={() => setConfirmRoleRemove(null)}>
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
                          logAudit("remove_role", "user_role", confirmRoleRemove.id, { role: "revendedor", nome: confirmRoleRemove.nome || confirmRoleRemove.email });
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
                              <p className="font-bold text-success text-sm"><AnimatedCounter value={c.saldo} prefix="R$&nbsp;" duration={600} /></p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <span className="text-xs text-muted-foreground">{formatDateFullBR(c.created_at)}</span>
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
                                <td className="px-4 py-3 text-right font-bold text-success"><AnimatedCounter value={c.saldo} prefix="R$&nbsp;" duration={600} /></td>
                                <td className="px-4 py-3 text-muted-foreground">{formatDateFullBR(c.created_at)}</td>
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
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {/* Stats compactos */}
            <div className="grid grid-cols-3 gap-2 mb-1">
              {[
                { label: "Recebidos", value: analytics.totalDeposited, prefix: "R$ ", color: "text-foreground" },
                { label: "Transações", value: analytics.txCount, prefix: "", color: "text-foreground" },
                { label: "Carteiras", value: analytics.saldoCarteiras, prefix: "R$ ", color: "text-warning" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card rounded-lg p-2.5 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{s.label}</p>
                  <p className={`text-lg font-bold mt-0.5 font-mono tabular-nums ${s.color}`}>
                    {s.prefix ? <Currency value={s.value as number} duration={700} /> : <IntVal value={s.value as number} duration={700} />}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Gráfico compacto */}
            <div className="glass-card rounded-lg p-4 mb-1">
              <h4 className="font-semibold text-foreground text-sm mb-3">Volume de Depósitos</h4>
              <div className="h-48">
                {depositosPorDia.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={depositosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={v => `R$ ${v}`} />
                      <Tooltip formatter={(v: any) => [fmt(Number(v)), "Depósitos"]} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 2.5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Sem dados no período</div>
                )}
              </div>
            </div>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input type="text" value={depositSearch} onChange={e => setDepositSearch(e.target.value)} placeholder="Buscar por revendedor, módulo, ID pagamento..." className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-[13px]" />
            </div>

            {/* Mobile: Card Layout */}
            <div className="md:hidden space-y-2">
              {depositLoading ? (
                <div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
              ) : depositTransactions.filter(t =>
                (t.user_nome || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.user_email || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.module || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.payment_id || "").toLowerCase().includes(depositSearch.toLowerCase())
              ).length === 0 ? (
                <p className="text-center py-8 text-muted-foreground text-sm">Nenhuma transação encontrada</p>
              ) : depositTransactions.filter(t =>
                (t.user_nome || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.user_email || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.module || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                (t.payment_id || "").toLowerCase().includes(depositSearch.toLowerCase())
              ).map((t, idx) => {
                const initials = (t.user_nome || t.user_email || "?").slice(0, 2).toUpperCase();
                // Status via plugin
                return (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04, duration: 0.3 }} className="glass-card rounded-lg p-3 cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all" onClick={() => setSelectedDeposit(t)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 ring-2 ring-background flex items-center justify-center text-[10px] font-bold text-primary">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-[13px] truncate">{t.user_nome || "—"}</p>
                          <p className="text-[11px] text-muted-foreground">{fmtDate(t.created_at)}</p>
                        </div>
                      </div>
                      <StatusBadge status={t.status} type="deposit" className="flex-shrink-0" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Tipo</p>
                        <p className="text-[12px] font-medium text-foreground capitalize">{(t.type === "deposito" || t.type === "deposit") ? "Depósito" : t.type === "withdrawal" ? "Saque" : t.type}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Método</p>
                        <p className="text-[12px] font-medium text-foreground uppercase">PIX</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Valor</p>
                        <p className={`text-[13px] font-bold font-mono tabular-nums ${(t.type === "deposit" || t.type === "deposito") ? "text-success" : "text-foreground"}`}>
                          <Currency value={t.amount} sign duration={800} delay={idx * 40} />
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden md:block glass-card rounded-lg overflow-hidden">
              <table className="w-full" style={{ fontSize: "13px" }}>
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Revendedor</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tipo</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Método</th>
                    <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Valor</th>
                    <th className="text-center px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {depositLoading ? (
                    <tr><td colSpan={6} className="py-4"><div className="space-y-2">{[1,2,3].map(i => <SkeletonRow key={i} />)}</div></td></tr>
                  ) : depositTransactions.filter(t =>
                    (t.user_nome || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.user_email || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.module || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.payment_id || "").toLowerCase().includes(depositSearch.toLowerCase())
                  ).length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Nenhuma transação encontrada</td></tr>
                  ) : depositTransactions.filter(t =>
                    (t.user_nome || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.user_email || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.module || "").toLowerCase().includes(depositSearch.toLowerCase()) ||
                    (t.payment_id || "").toLowerCase().includes(depositSearch.toLowerCase())
                  ).map((t, idx) => {
                    const initials = (t.user_nome || t.user_email || "?").slice(0, 2).toUpperCase();
                    return (
                      <motion.tr key={t.id} className="border-b border-border/50 last:border-0 hover:bg-primary/[0.04] transition-colors cursor-pointer group" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.04, duration: 0.3 }} onClick={() => setSelectedDeposit(t)}>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap text-[11px]">{fmtDate(t.created_at)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 ring-2 ring-background flex items-center justify-center text-[10px] font-bold text-primary">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground text-[13px] truncate">{t.user_nome || "—"}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{t.user_email || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-foreground capitalize text-[13px]">{(t.type === "deposito" || t.type === "deposit") ? "Depósito" : t.type === "withdrawal" ? "Saque" : t.type}</td>
                        <td className="px-4 py-2.5 text-foreground text-[13px]">PIX</td>
                        <td className={`px-4 py-2.5 text-right font-mono font-bold tabular-nums ${(t.type === "deposit" || t.type === "deposito") ? "text-success" : "text-foreground"}`}>
                          <Currency value={t.amount} sign duration={800} delay={idx * 40} />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <StatusBadge status={t.status} type="deposit" />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

            {/* Deposit Detail Modal */}
            <AnimatePresence>
              {selectedDeposit && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedDeposit(null)}>
                  <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-card rounded-2xl p-6 w-full max-w-md max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    {(() => {
                      const t = selectedDeposit;
                      const meta = (t.metadata && typeof t.metadata === "object" && !Array.isArray(t.metadata)) ? t.metadata as Record<string, unknown> : {};
                      // Status via plugin
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
                        { label: "Status", value: getStatusLabel(t.status, "deposit") },
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
                            <button onClick={() => setSelectedDeposit(null)} className="p-1.5 rounded-lg hover:bg-destructive/15 transition-colors text-destructive"><X className="h-5 w-5" /></button>
                          </div>
                          <div className="text-center mb-5">
                            <p className="text-3xl font-bold font-mono text-success">+<AnimatedCounter value={t.amount} prefix="R$&nbsp;" /></p>
                            <StatusBadge status={t.status} type="deposit" className="mt-2 px-3 py-1 text-xs" />
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
                      <label className="block text-sm font-medium text-foreground mb-3">Selecione a Gateway</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {gatewayOptions.map((o) => (
                          <button key={o.value} onClick={() => setGwModule(o.value)}
                            className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                              gwModule === o.value
                                ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                                : 'border-border bg-muted/30 hover:border-muted-foreground/30 hover:bg-muted/50'
                            }`}>
                            <span className="text-2xl block mb-2">{o.icon}</span>
                            <p className={`text-sm font-semibold ${gwModule === o.value ? 'text-primary' : 'text-foreground'}`}>{o.label}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{o.desc}</p>
                            {gwModule === o.value && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                <Check className="h-3 w-3 text-primary-foreground" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      {!gwModule && <p className="text-xs text-muted-foreground mt-2">Sem gateway individual, o sistema usará a gateway global.</p>}
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
                        onClick={() => { navigator.clipboard.writeText(buildUrl(`/loja/${storeSlug}`)); toast.success("Link copiado!"); }}>
                        <Link2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm text-foreground font-mono truncate">{buildUrl(`/loja/${storeSlug}`)}</span>
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
                          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleLogoUpload} className="hidden" />
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
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">URL do Site</label>
                      <input type="text" value={configData.siteUrl || ""} onChange={e => setConfigData(prev => ({ ...prev, siteUrl: e.target.value }))}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="https://recargasbrasill.com" />
                      <p className="text-xs text-muted-foreground mt-1">Domínio principal usado em links do bot, emails e OG tags</p>
                    </div>

                    {/* Modo Manutenção - movido para Painel Principal */}

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
                            <label className="block text-sm font-medium text-foreground mb-3">Selecione a Gateway</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {gatewayOptions.map((o) => (
                                <button key={o.value} onClick={() => setGwModule(o.value)}
                                  className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                                    gwModule === o.value
                                      ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                                      : 'border-border bg-muted/30 hover:border-muted-foreground/30 hover:bg-muted/50'
                                  }`}>
                                  <span className="text-2xl block mb-2">{o.icon}</span>
                                  <p className={`text-sm font-semibold ${gwModule === o.value ? 'text-primary' : 'text-foreground'}`}>{o.label}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{o.desc}</p>
                                  {gwModule === o.value && (
                                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                      <Check className="h-3 w-3 text-primary-foreground" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                            {!gwModule && <p className="text-xs text-muted-foreground mt-2">Sem gateway individual, o sistema usará a gateway global.</p>}
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
                <p className="text-sm text-muted-foreground">Regras de preço globais e por revendedor.</p>
              </div>
              <button onClick={() => { fetchOperadoras(); fetchPricingRules(); if (pricingTargetUserId) fetchTargetUserPricingRules(pricingTargetUserId); }} className="p-2 rounded-lg border border-border hover:bg-muted/50 text-muted-foreground transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-tabs: Global | Por Revendedor */}
            <div className="flex rounded-xl overflow-hidden border border-border">
              {[
                { key: "global" as const, label: "Global", icon: Globe },
                { key: "revendedor" as const, label: "Por Revendedor", icon: Users },
              ].map(st => (
                <button
                  key={st.key}
                  onClick={() => { setPricingSubTab(st.key); setTargetUserPricingSelectedOp(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
                    pricingSubTab === st.key
                      ? "bg-success text-success-foreground"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <st.icon className="h-4 w-4" />
                  {st.label}
                </button>
              ))}
            </div>

            {/* === GLOBAL pricing === */}
            {pricingSubTab === "global" && (
              <>
                {operadorasLoading ? (
                  <SkeletonPricingGrid />
                ) : operadoras.filter(o => o.ativo).length === 0 ? (
                  <div className="glass-card rounded-xl p-8 text-center">
                    <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhuma operadora ativa cadastrada.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 flex-wrap">
                      {operadoras.filter(o => o.ativo).map(op => (
                        <button key={op.id} onClick={() => setPricingSelectedOp(op.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            (pricingSelectedOp || operadoras.filter(o => o.ativo)[0]?.id) === op.id
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                              : "glass-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                          }`}>
                          <Package className="h-4 w-4" />{(op.nome || "").toUpperCase()}
                        </button>
                      ))}
                    </div>
                    {(() => {
                      const activeOpId = pricingSelectedOp || operadoras.filter(o => o.ativo)[0]?.id;
                      const activeOp = operadoras.find(o => o.id === activeOpId);
                      if (!activeOp) return null;
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {activeOp.valores.sort((a, b) => a - b).map(valor => {
                            const rule = pricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
                            const localTipo = rule?.tipo_regra || "fixo";
                            const localValor = rule?.regra_valor ?? 0;
                            const localCusto = rule?.custo ?? 0;
                            const precoFinal = localTipo === "fixo" ? localValor : valor * (1 + localValor / 100);
                            const lucro = precoFinal - localCusto;
                            return (
                              <div key={valor} className="glass-card rounded-xl p-4 space-y-3 border border-border/50">
                                <div className="flex items-center justify-between">
                                  <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Recarga</p><p className="text-xl font-bold text-foreground">{fmt(valor)}</p></div>
                                  <div className="text-right"><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Preço Final</p><p className={`text-xl font-bold ${precoFinal > 0 ? "text-success" : "text-muted-foreground"}`}>{precoFinal > 0 ? fmt(precoFinal) : "—"}</p></div>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                                  <span className="text-muted-foreground">Custo: {fmt(localCusto)}</span>
                                  <span className={`font-medium ${lucro > 0 ? "text-success" : lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>Lucro: {fmt(lucro)}</span>
                                </div>
                                <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-end">
                                  <div>
                                    <label className="text-[10px] text-muted-foreground mb-1 block">Tipo de Regra</label>
                                    <select value={localTipo} onChange={e => { savePricingRule({ operadora_id: activeOpId, valor_recarga: valor, custo: localCusto, tipo_regra: e.target.value as "fixo" | "margem", regra_valor: localValor }); }} className="h-9 rounded-lg bg-muted/70 border border-border px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                                      <option value="margem">Margem (%)</option><option value="fixo">Fixo (R$)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-muted-foreground mb-1 block">Valor</label>
                                    <input type="number" defaultValue={localValor} onBlur={e => { savePricingRule({ operadora_id: activeOpId, valor_recarga: valor, custo: localCusto, tipo_regra: localTipo, regra_valor: parseFloat(e.target.value) || 0 }); }} className="h-9 w-full rounded-lg bg-muted/70 border border-border px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                                  </div>
                                  <button onClick={() => resetPricingRule(activeOpId, valor)} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors" title="Resetar regra">
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
              </>
            )}

            {/* === POR REVENDEDOR pricing === */}
            {pricingSubTab === "revendedor" && (() => {
              const filteredUsers = revendedores.filter(r => r.role === "revendedor");
              const selectedUserId = pricingTargetUserId;
              const selectedUser = filteredUsers.find(u => u.id === selectedUserId);

              return (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Selecione o Revendedor
                    </label>
                    <select
                      value={selectedUserId}
                      onChange={e => {
                        setPricingTargetUserId(e.target.value);
                        setTargetUserPricingSelectedOp("");
                        if (e.target.value) fetchTargetUserPricingRules(e.target.value);
                        else setTargetUserPricingRules([]);
                      }}
                      className="w-full h-11 rounded-xl bg-muted/70 border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Selecione...</option>
                      {filteredUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.nome || u.email || u.id}</option>
                      ))}
                    </select>
                  </div>

                  {!selectedUserId ? (
                    <div className="glass-card rounded-xl p-8 text-center border-2 border-dashed border-border">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Selecione um revendedor para gerenciar seus preços personalizados.</p>
                    </div>
                  ) : operadorasLoading ? (
                    <SkeletonPricingGrid />
                  ) : operadoras.filter(o => o.ativo).length === 0 ? (
                    <div className="glass-card rounded-xl p-8 text-center">
                      <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">Nenhuma operadora ativa cadastrada.</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 flex-wrap">
                        {operadoras.filter(o => o.ativo).map(op => (
                          <button key={op.id} onClick={() => setTargetUserPricingSelectedOp(op.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              (targetUserPricingSelectedOp || operadoras.filter(o => o.ativo)[0]?.id) === op.id
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "glass-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                            }`}>
                            <Package className="h-4 w-4" />{(op.nome || "").toUpperCase()}
                          </button>
                        ))}
                      </div>
                      {(() => {
                        const activeOpId = targetUserPricingSelectedOp || operadoras.filter(o => o.ativo)[0]?.id;
                        const activeOp = operadoras.find(o => o.id === activeOpId);
                        if (!activeOp) return null;
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {activeOp.valores.sort((a, b) => a - b).map(valor => {
                              const rule = targetUserPricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
                              const globalRule = pricingRules.find(r => r.operadora_id === activeOpId && r.valor_recarga === valor);
                              const localTipo = rule?.tipo_regra || "fixo";
                              const localValor = rule?.regra_valor ?? 0;
                              const localCusto = rule?.custo ?? 0;
                              const precoFinal = rule ? (localTipo === "fixo" ? localValor : valor * (1 + localValor / 100)) : 0;
                              const globalPreco = globalRule ? (globalRule.tipo_regra === "fixo" ? globalRule.regra_valor : valor * (1 + globalRule.regra_valor / 100)) : 0;
                              const lucro = precoFinal - localCusto;
                              const hasCustom = !!rule;

                              return (
                                <div key={valor} className={`glass-card rounded-xl p-4 space-y-3 border ${hasCustom ? "border-success/50" : "border-border/50"}`}>
                                  <div className="flex items-center justify-between">
                                    <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Recarga</p><p className="text-xl font-bold text-foreground">{fmt(valor)}</p></div>
                                    <div className="text-right">
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{hasCustom ? "Preço Personalizado" : "Preço Global"}</p>
                                      <p className={`text-xl font-bold ${hasCustom ? "text-success" : "text-muted-foreground"}`}>{hasCustom ? fmt(precoFinal) : (globalPreco > 0 ? fmt(globalPreco) : "—")}</p>
                                    </div>
                                  </div>
                                  {hasCustom && (
                                    <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
                                      <span className="text-muted-foreground">Custo: {fmt(localCusto)}</span>
                                      <span className={`font-medium ${lucro > 0 ? "text-success" : lucro < 0 ? "text-destructive" : "text-muted-foreground"}`}>Lucro: {fmt(lucro)}</span>
                                    </div>
                                  )}
                                  <div className="grid grid-cols-[auto_1fr_auto] gap-2 items-end">
                                    <div>
                                      <label className="text-[10px] text-muted-foreground mb-1 block">Tipo</label>
                                      <select value={localTipo} onChange={e => { saveTargetUserPricingRule(selectedUserId, { operadora_id: activeOpId, valor_recarga: valor, custo: localCusto, tipo_regra: e.target.value as "fixo" | "margem", regra_valor: localValor }); }} className="h-9 rounded-lg bg-muted/70 border border-border px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                                        <option value="margem">Margem (%)</option><option value="fixo">Fixo (R$)</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-[10px] text-muted-foreground mb-1 block">Valor</label>
                                      <input type="number" defaultValue={localValor} key={`${selectedUserId}-${activeOpId}-${valor}-${rule?.regra_valor}`} onBlur={e => { saveTargetUserPricingRule(selectedUserId, { operadora_id: activeOpId, valor_recarga: valor, custo: localCusto, tipo_regra: localTipo, regra_valor: parseFloat(e.target.value) || 0 }); }} className="h-9 w-full rounded-lg bg-muted/70 border border-border px-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                                    </div>
                                    <button onClick={() => resetTargetUserPricingRule(selectedUserId, activeOpId, valor)} className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-destructive/10 text-destructive/60 hover:text-destructive transition-colors" title="Resetar (usar global)">
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
                </>
              );
            })()}
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
              <SkeletonPricingGrid />
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
                      {(op.nome || "").toUpperCase()}
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
                                  // Revendedor: save to reseller_config (isolated). Admin: save to system_config (global)
                                  if (!user?.id) { toast.error("Sessão inválida. Faça login novamente."); return; }
                                  if (role === "revendedor") {
                                    await supabase.from("reseller_config").upsert({ user_id: user.id, key: "telegram_bot_token", value: token }, { onConflict: "user_id,key" });
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
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">📢 Canal de Notícias</label>
                      <input type="text" value={configData.telegramNewsChannel || ""} onChange={e => setConfigData(prev => ({ ...prev, telegramNewsChannel: e.target.value }))}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="@CREDITOSO ou https://t.me/CREDITOSO" />
                      <p className="text-xs text-muted-foreground mt-1">Broadcasts serão replicados automaticamente neste canal. O bot precisa ser administrador do canal.</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}




        {/* Credit Client Modal */}
        {creditClientModal && (
          <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-[70] flex items-center justify-center px-4" onClick={() => setCreditClientModal(null)}>
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
          <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-[70] flex items-start justify-center pt-8 md:pt-16 px-4" onClick={() => setClientHistoryModal(null)}>
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-5 md:p-6" onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Histórico de Recargas</h3>
                  <p className="text-sm text-muted-foreground">{clientHistoryModal.nome || clientHistoryModal.email}</p>
                </div>
                <button onClick={() => setClientHistoryModal(null)} className="p-1 rounded-md hover:bg-destructive/15 text-destructive">
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
                          {r.status === "completed" ? "Concluída" : r.status === "pending" ? "Processando" : r.status}
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-foreground">Notificações</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {broadcastUserCount} usuários ativos</span>
                  {broadcastBlockedCount > 0 && (
                    <span className="flex items-center gap-1 text-orange-400">
                      <UserX className="w-4 h-4" /> {broadcastBlockedCount} bloqueados
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBroadcastModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-primary text-sm"
                >
                  <Send className="w-4 h-4" /> Nova Notificação
                </button>
              </div>
            </div>

            {/* Active progress */}
            {broadcastProgressId && (
              <BroadcastProgress
                progressId={broadcastProgressId}
                notificationTitle={broadcastTitle}
                onComplete={() => {
                  toast.success('Broadcast concluído!');
                  setBroadcastProgressId(null);
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

            {/* Broadcasts Interrompidos */}
            {interruptedBroadcasts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-bold text-foreground">Broadcasts Interrompidos</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-semibold">{interruptedBroadcasts.length}</span>
                </div>
                {interruptedBroadcasts.map((b: any) => {
                  const pct = b.total_users > 0 ? Math.round(((b.sent_count + b.failed_count) / b.total_users) * 100) : 0;
                  const remaining = b.total_users - (b.sent_count + b.failed_count);
                  const title = b.notification?.title || 'Broadcast';
                  return (
                    <div key={b.id} className="glass-card rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Megaphone className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-semibold text-sm text-foreground truncate">{title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${b.status === 'cancelled' ? 'bg-orange-500/15 text-orange-400' : 'bg-destructive/15 text-destructive'}`}>
                            {b.status === 'cancelled' ? '⚠️ Interrompido' : '❌ Falhou'}
                          </span>
                          <button
                            onClick={async () => {
                              setBroadcastTitle(title);
                              try {
                                const { data: result, error } = await supabase.functions.invoke('send-broadcast', { body: { resume_progress_id: b.id } });
                                if (error) throw error;
                                if (result?.progress_id) { setBroadcastProgressId(result.progress_id); toast.success('Broadcast retomado!'); }
                                fetchBroadcastHistory();
                              } catch (err: any) { toast.error('Erro ao retomar: ' + (err.message || 'Erro')); }
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-primary/15 text-primary hover:bg-primary/25 transition-colors font-medium"
                          >
                            <RotateCcw className="w-3 h-3" /> Retomar
                          </button>
                          <button
                            onClick={async () => {
                              if (!await confirm('Excluir este broadcast interrompido?')) return;
                              await (supabase.from('broadcast_progress' as any) as any).delete().eq('id', b.id);
                              toast.success('Excluído');
                              fetchBroadcastHistory();
                            }}
                            className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>Progresso</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-destructive transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div className="text-center p-1.5 rounded-lg bg-green-500/10">
                          <div className="text-sm font-bold text-green-500">{b.sent_count}</div>
                          <div className="text-[9px] text-muted-foreground">Enviados</div>
                        </div>
                        <div className="text-center p-1.5 rounded-lg bg-red-500/10">
                          <div className="text-sm font-bold text-red-500">{b.failed_count}</div>
                          <div className="text-[9px] text-muted-foreground">Falhas</div>
                        </div>
                        <div className="text-center p-1.5 rounded-lg bg-orange-500/10">
                          <div className="text-sm font-bold text-orange-500">{b.blocked_count}</div>
                          <div className="text-[9px] text-muted-foreground">Bloqueados</div>
                        </div>
                        <div className="text-center p-1.5 rounded-lg bg-primary/10">
                          <div className="text-sm font-bold text-primary">{b.total_users}</div>
                          <div className="text-[9px] text-muted-foreground">Total</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Restantes: {remaining} usuários</span>
                        <span>Batch {b.current_batch}/{b.total_batches}</span>
                      </div>
                      {b.error_message && (
                        <div className="text-[11px] p-2 rounded-lg bg-destructive/10 text-destructive">{b.error_message}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* History */}
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Histórico de Notificações</h3>
              {broadcastHistory.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 text-center">
                  <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground">Nenhum broadcast realizado.</p>
                  <p className="text-xs text-muted-foreground mt-1">Clique em "Nova Notificação" para enviar sua primeira mensagem.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {broadcastHistory.map((h: any) => (
                    <div key={h.id} className="glass-card rounded-2xl p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Megaphone className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-foreground">{h.title}</h4>
                            {h.message && (
                              <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap [&_b]:font-bold [&_i]:italic [&_s]:line-through [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:rounded [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: renderTelegramHtml(h.message) }} />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {h.broadcast_failed ? (
                            <span className="text-xs font-bold text-destructive flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Falhou ({h.bp_failed_count}/{h.bp_total_users})
                            </span>
                          ) : (
                            <span className="text-sm font-bold text-green-400">{h.sent_count} enviados</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(h.created_at).toLocaleDateString('pt-BR')}, {new Date(h.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <button
                            onClick={async () => {
                              setBroadcastSending(true);
                              setBroadcastTitle(h.title);
                              try {
                                const { data: newNotif, error: dupError } = await (supabase.from('notifications' as any) as any)
                                  .insert({ title: h.title, message: h.message, image_url: h.image_url, buttons: h.buttons || [], status: 'sending', sent_count: 0, failed_count: 0 })
                                  .select('id').single();
                                if (dupError) throw dupError;
                                const { data: result, error } = await supabase.functions.invoke('send-broadcast', {
                                  body: { notification_id: newNotif.id, include_unregistered: false },
                                });
                                if (error) throw error;
                                if (result?.progress_id) {
                                  setBroadcastProgressId(result.progress_id);
                                  toast.success(`Reenviando para ${result.total || 0} usuários!`);
                                }
                                fetchBroadcastHistory();
                              } catch (err: any) {
                                toast.error('Erro: ' + (err.message || 'Erro desconhecido'));
                              } finally {
                                setBroadcastSending(false);
                              }
                            }}
                            disabled={broadcastSending}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors mt-1 ${
                              h.broadcast_failed
                                ? 'bg-destructive/20 text-destructive hover:bg-destructive/30 font-bold animate-pulse'
                                : 'glass text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <RefreshCw className="w-3 h-3" /> {h.broadcast_failed ? '⚠️ Reenviar Agora' : 'Reenviar'}
                          </button>
                          {!h.broadcast_failed && h.sent_count > 0 && (
                            <button
                              onClick={async () => {
                                if (!confirm(`Deletar ${h.sent_count} mensagens enviadas do Telegram? Isso só funciona para broadcasts recentes (últimas 48h).`)) return;
                                try {
                                  const { data, error } = await supabase.functions.invoke('delete-broadcast', { body: { notification_id: h.id } });
                                  if (error) throw error;
                                  if (data?.error) { toast.error(data.error); return; }
                                  toast.success(`${data.deleted || 0} mensagens deletadas, ${data.failed || 0} falharam`);
                                } catch (err: any) { toast.error('Erro: ' + (err.message || 'Erro')); }
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs glass text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3 h-3" /> Deletar
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lucro por Operadora Modal */}
            <AnimatePresence>
            {showLucroModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLucroModal(false)} />
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="relative w-full max-w-md max-h-[85vh] overflow-y-auto glass-modal rounded-2xl p-5 z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-success" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">Lucro por Operadora</h3>
                    </div>
                    <button onClick={() => setShowLucroModal(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Total summary */}
                  <div className={`p-3 rounded-xl mb-4 ${analytics.lucro >= 0 ? "bg-success/10 border border-success/20" : "bg-destructive/10 border border-destructive/20"}`}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Lucro Total do Período</p>
                    <p className={`text-xl font-extrabold ${analytics.lucro >= 0 ? "text-success" : "text-destructive"}`}>
                      {analytics.lucro >= 0 ? "+" : ""}<AnimatedCounter value={Math.abs(analytics.lucro)} prefix="R$&nbsp;" />
                    </p>
                  </div>

                  {/* Per-operadora breakdown */}
                  <div className="space-y-2">
                    {analytics.lucroPorOperadora.map((op, i) => {
                      const maxLucro = Math.max(...analytics.lucroPorOperadora.map(o => Math.abs(o.lucro)), 1);
                      const pct = (Math.abs(op.lucro) / maxLucro) * 100;
                      const colors: Record<string, { bg: string; text: string }> = {
                        TIM: { bg: "bg-blue-500", text: "text-blue-400" },
                        VIVO: { bg: "bg-purple-500", text: "text-purple-400" },
                        CLARO: { bg: "bg-red-500", text: "text-red-400" },
                        OI: { bg: "bg-amber-500", text: "text-amber-400" },
                      };
                      const c = colors[op.operadora] || { bg: "bg-muted-foreground", text: "text-muted-foreground" };
                      return (
                        <motion.div key={op.operadora} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="glass-card rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                              <span className="text-xs font-bold text-foreground">{op.operadora}</span>
                              <span className="text-[10px] text-muted-foreground">{op.count} recargas</span>
                            </div>
                            <span className={`text-xs font-bold ${op.lucro >= 0 ? "text-success" : "text-destructive"}`}>
                              {op.lucro >= 0 ? "+" : ""}<AnimatedCounter value={Math.abs(op.lucro)} prefix="R$&nbsp;" />
                            </span>
                          </div>
                          <div className="flex gap-3 text-[10px] text-muted-foreground mb-1.5">
                            <span>Cobrado: <AnimatedCounter value={op.cobrado} prefix="R$&nbsp;" /></span>
                            <span>API: <AnimatedCounter value={op.custoApi} prefix="R$&nbsp;" /></span>
                          </div>
                          <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 + i * 0.05 }}
                              className={`h-full rounded-full ${op.lucro >= 0 ? "bg-success" : "bg-destructive"}`} />
                          </div>
                        </motion.div>
                      );
                    })}
                    {analytics.lucroPorOperadora.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-4">Sem dados de recargas no período selecionado</p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
            </AnimatePresence>

            {showBroadcastModal && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !broadcastSending && setShowBroadcastModal(false)} />
                <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto glass-modal rounded-2xl p-6 z-10">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Zap className="w-5 h-5 text-warning" /> Enviar Broadcast VIP
                    </h3>
                    <button
                      onClick={() => !broadcastSending && setShowBroadcastModal(false)}
                      className="p-1.5 rounded-lg hover:bg-destructive/15 text-destructive transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <BroadcastForm
                    userCount={broadcastUserCount}
                    sending={broadcastSending}
                    onClose={() => setShowBroadcastModal(false)}
                    onSubmit={async (data) => {
                      setBroadcastSending(true);
                      setBroadcastTitle(data.title);
                      try {
                        const { data: notif, error: notifError } = await (supabase.from('notifications' as any) as any)
                          .insert({
                            title: data.title,
                            message: data.message,
                            image_url: data.image_url,
                            buttons: data.buttons,
                            message_effect_id: data.message_effect_id,
                          })
                          .select()
                          .single();
                        if (notifError) throw notifError;

                        const { data: result, error } = await supabase.functions.invoke('send-broadcast', {
                          body: { notification_id: notif.id, include_unregistered: false },
                        });
                        if (error) throw error;
                        if (result?.progress_id) {
                          setBroadcastProgressId(result.progress_id);
                          toast.success(`Broadcast iniciado para ${result.total || 0} usuários!`);
                        }
                        setShowBroadcastModal(false);
                        fetchBroadcastHistory();
                      } catch (err: any) {
                        toast.error('Erro ao iniciar broadcast: ' + (err.message || 'Erro desconhecido'));
                      } finally {
                        setBroadcastSending(false);
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ===== AUDITORIA ===== */}
        {tab === "auditoria" && (
          <Suspense fallback={<div className="h-40 rounded-xl bg-card border border-border animate-pulse" />}>
            <AuditTab />
          </Suspense>
        )}

      </main>
      </div>

      {showOperadoraModal && <OperadoraModal operadora={editOperadora} onClose={() => setShowOperadoraModal(false)} onSaved={fetchOperadoras} />}

      {/* Floating Poll */}
      <FloatingPoll />

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
          ...(role === "admin" ? [{ key: "auditoria", label: "Auditoria", icon: Shield, color: "text-primary", animation: "pulse" as const }] : []),
          { key: "configuracoes", label: "Config", icon: Settings, color: "text-muted-foreground", animation: "spin" as const },
        ]}
        activeKey={tab}
        onSelect={(key) => {
          setTab(key as any);
          setMenuOpen(false);
        }}
        mainCount={4}
        userLabel={user?.email || "Admin"}
        userRole={role === "admin" ? "Administrador" : "Revendedor"}
        userAvatarUrl={myAvatarUrl}
        onSignOut={signOut}
        panelLinks={[
          ...(role === "admin" ? [{ label: "Principal", path: "/principal", icon: Users, color: "text-success" }] : []),
          { label: "Painel Cliente", path: "/painel", icon: Landmark, color: "text-primary" },
        ]}
      />
    </div>
    </PinProtection>
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
  const pix = usePixDeposit({
    userEmail,
    userName,
    useGlobal: true,
    pollInterval: 5000,
    onConfirmed: () => { onDeposited(); fetchTransactions(); },
  });

  const {
    depositAmount, setDepositAmount, generating, pixData, pixError,
    copied, checking, paymentConfirmed, confirmedAmount, pollCount,
    presetAmounts, generatePix: handleGeneratePix, copyCode: handleCopyCode,
    checkStatus: handleCheckStatus, reset: handleNewPix,
  } = pix;
  const { calcFee: feeCalc } = useFeePreview();

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

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">R$</span>
            <input type="text" inputMode="numeric" value={depositAmount}
              onChange={e => setDepositAmount(applyCurrencyMask(e.target.value))}
              placeholder="Outro valor (mín. R$ 10)"
              className="w-full pl-10 pr-3 py-3 rounded-xl glass-input text-foreground font-bold text-lg focus:outline-none focus:ring-2 focus:ring-success/50 border border-border" />
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

          <button onClick={() => handleGeneratePix()} disabled={generating || !depositAmount || parseFloat(depositAmount.replace(",", ".")) < 10}
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
            {pixData.fee_amount && pixData.fee_amount > 0 ? (
              <div className="mt-1 space-y-0.5">
                <p className="text-xs text-muted-foreground">
                  Taxa: <span className="font-mono text-destructive/80">-{fmt(pixData.fee_amount)}</span>
                  {pixData.fee_type === "percentual" && pixData.fee_value ? ` (${pixData.fee_value}%)` : ""}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  Você receberá: <span className="text-success">{fmt(pixData.net_amount ?? pixData.amount)}</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">via PIX</p>
            )}
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
                {(t.status === "completed" || t.status === "confirmado") ? "✓ Confirmado" : "⏳ Processando"}
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4" onClick={onClose}>
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
