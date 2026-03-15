import { useState, useEffect, useCallback } from "react";
import { AnimatedCounter, AnimatedInt } from "@/components/AnimatedCounter";
import AnimatedCheck from "@/components/AnimatedCheck";
import { supabase } from "@/integrations/supabase/client";
import { createPixDeposit, type PixResult } from "@/lib/payment";
import { motion, AnimatePresence } from "framer-motion";
import recargasLogo from "@/assets/recargas-brasil-logo.jpeg";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone, Plus, Clock, Landmark, User,
  ChevronRight, RefreshCw, Copy, Check,
  ArrowLeft, Shield, LogOut, Camera, Loader2,
  Share2, FileText, MapPin, Hash, Wallet, Phone, Zap,
  AlertTriangle, CheckCircle2, XCircle, MessageCircle
} from "lucide-react";
import { ChatPage } from "@/components/chat/ChatPage";
import { useSeasonalTheme, SEASONAL_BUTTON_EMOJIS } from "@/hooks/useSeasonalTheme";
import { SEASONAL_THEMES, type SeasonalThemeKey } from "@/components/SeasonalEffects";
import { formatFullDateTimeBR, formatDateTimeBR, formatDateLongUpperBR, formatTimeBR } from "@/lib/timezone";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        colorScheme?: "light" | "dark";
        initDataUnsafe?: { user?: { id: number; username?: string } };
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
          section_bg_color?: string;
          accent_text_color?: string;
          destructive_text_color?: string;
          header_bg_color?: string;
          subtitle_text_color?: string;
          section_header_text_color?: string;
          bottom_bar_bg_color?: string;
        };
        BackButton?: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
        MainButton?: { show: () => void; hide: () => void; setText: (t: string) => void; onClick: (cb: () => void) => void };
        HapticFeedback?: { impactOccurred: (s: string) => void; notificationOccurred: (s: string) => void };
      };
    };
  }
}

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
  bottom_bar_bg_color: "#17212b",
};

function useTelegramTheme() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const tp = tg?.themeParams;
    const root = document.documentElement;

    const theme = { ...TG_DARK_DEFAULTS, ...tp };

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

type Section = "recarga" | "deposito" | "historico" | "extrato" | "conta" | "status" | "chat";

import type { Recarga } from "@/types";

interface ValorItem { valueId: string; cost: number; userCost?: number; value?: number; label: string; }
interface TgOperadora { id: string; nome: string; carrierId: string; valores: ValorItem[]; }

export default function TelegramMiniApp() {
  useTelegramTheme();

  // Expand to full screen automatically
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();

      // Retry expand after short delays to ensure it takes effect
      setTimeout(() => tg.expand(), 100);
      setTimeout(() => tg.expand(), 500);

      // Disable vertical swipe to close (keeps app fullscreen)
      if ((tg as any).disableVerticalSwipes) {
        (tg as any).disableVerticalSwipes();
      }
      // Request fullscreen if available (Telegram Bot API 8.0+)
      if ((tg as any).requestFullscreen) {
        try { (tg as any).requestFullscreen(); } catch {}
      }
      // Force viewport height to 100%
      if ((tg as any).isExpanded === false) {
        setTimeout(() => tg.expand(), 1000);
      }
      // Set header/viewport color to match background
      if ((tg as any).setHeaderColor) {
        try { (tg as any).setHeaderColor("secondary_bg_color"); } catch {}
      }
      if ((tg as any).setBackgroundColor) {
        try { (tg as any).setBackgroundColor("#17212b"); } catch {}
      }
    }

    // CSS fix: ensure full viewport on Telegram
    document.documentElement.style.height = "100%";
    document.body.style.height = "100%";
    document.body.style.overflow = "hidden";

    // Prevent zoom: update viewport meta tag
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement | null;
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }
    const originalViewport = viewportMeta.content;
    viewportMeta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";

    // Prevent pinch-to-zoom only (double-tap handled via CSS touch-action)
    const preventZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchstart", preventZoom, { passive: false });

    // Prevent gesture zoom (Safari)
    const preventGesture = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("gesturechange", preventGesture);

    return () => {
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

  const [section, setSection] = useState<Section>("recarga");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [saldo, setSaldo] = useState(0);
  const [hasAuthSession, setHasAuthSession] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Recarga
  const [operadoras, setOperadoras] = useState<TgOperadora[]>([]);
  const [selectedOp, setSelectedOp] = useState<TgOperadora | null>(null);
  const [selectedValor, setSelectedValor] = useState<ValorItem | null>(null);
  const [phone, setPhone] = useState("");
  const [clipboardPhone, setClipboardPhone] = useState<string | null>(null);
  const [recargaStep, setRecargaStep] = useState<"op" | "valor" | "phone" | "confirm" | "check">("phone");
  const [recargaLoading, setRecargaLoading] = useState(false);
  const [recargaResult, setRecargaResult] = useState<{ success: boolean; message: string; details?: { valor: number; telefone: string; operadora: string; novoSaldo: number; pedidoId: string | null; hora: string } } | null>(null);
  const [phoneCheckResult, setPhoneCheckResult] = useState<{ status: string; message: string } | null>(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // Histórico & Extrato
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [viewingReceipt, setViewingReceipt] = useState<Recarga | null>(null);

  // Depósito
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [pixData, setPixData] = useState<PixResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [refreshingExtrato, setRefreshingExtrato] = useState(false);
  const [refreshingRecargas, setRefreshingRecargas] = useState(false);
  const [showPriceTable, setShowPriceTable] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" | "info" }[]>([]);
  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const tgWebApp = window.Telegram?.WebApp;

  const getTelegramUser = useCallback(() => {
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
    } catch { return null; }
  }, []);

  // Helper to save/load session from localStorage
  const saveSession = useCallback((data: { userId: string; userName: string; userEmail: string; saldo: number }) => {
    try { localStorage.setItem("tg_miniapp_session", JSON.stringify(data)); } catch {}
  }, []);

  const clearSession = useCallback(() => {
    try { localStorage.removeItem("tg_miniapp_session"); } catch {}
  }, []);

  const loadSavedSession = useCallback((): { userId: string; userName: string; userEmail: string; saldo: number } | null => {
    try {
      const raw = localStorage.getItem("tg_miniapp_session");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }, []);

  const applySession = useCallback((data: { userId: string; userName: string; userEmail: string; saldo: number }) => {
    setUserId(data.userId);
    setUserName(data.userName);
    setUserEmail(data.userEmail);
    setSaldo(data.saldo);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const liveTg = window.Telegram?.WebApp;
      liveTg?.ready();
      liveTg?.expand();

      // Check auth session first (used by chat RLS)
      let existingSessionUserId: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        existingSessionUserId = session?.user?.id ?? null;
        if (!cancelled) setHasAuthSession(!!session?.user);
      } catch (err) {
        console.error("Mini App auth session precheck error:", err);
        if (!cancelled) setHasAuthSession(false);
      }

      // 1) Try Telegram initData lookup
      const tgUser = await (async () => {
        for (let i = 0; i < 12; i++) {
          const u = getTelegramUser();
          if (u?.id) return u;
          await new Promise(r => setTimeout(r, 250));
        }
        return null;
      })();

      if (tgUser?.id && !cancelled) {
        try {
          const { data, error } = await supabase.functions.invoke("telegram-miniapp", {
            body: { action: "lookup", telegram_id: tgUser.id },
          });
          if (!error && data?.found) {
            const sess = { userId: data.user_id, userName: data.nome || "", userEmail: "", saldo: Number(data.saldo || 0) };
            applySession(sess);
            saveSession(sess);
            if (data.avatar_url) setAvatarUrl(data.avatar_url);
            if (!cancelled) setLoading(false);
            return;
          }
        } catch (err) { console.error("Mini App TG lookup error:", err); }
      }

      // 2) Try existing auth user if available
      if (existingSessionUserId && !cancelled) {
        try {
          const { data, error } = await supabase.functions.invoke("telegram-miniapp", {
            body: { action: "lookup_by_user_id", user_id: existingSessionUserId },
          });
          if (!error && data?.found) {
            const sess = { userId: data.user_id, userName: data.nome || "", userEmail: "", saldo: Number(data.saldo || 0) };
            applySession(sess);
            saveSession(sess);
            if (data.avatar_url) setAvatarUrl(data.avatar_url);
            if (!cancelled) setLoading(false);
            return;
          } else {
            const { data: sData } = await supabase.functions.invoke("telegram-miniapp", {
              body: { action: "saldo", user_id: existingSessionUserId },
            });
            const sess = { userId: existingSessionUserId, userName: "", userEmail: "", saldo: Number(sData?.saldo || 0) };
            applySession(sess);
            saveSession(sess);
            if (!cancelled) setLoading(false);
            return;
          }
        } catch (err) { console.error("Mini App auth session error:", err); }
      }

      // 3) Try saved localStorage session (offline/fallback)
      const saved = loadSavedSession();
      if (saved && !cancelled) {
        applySession(saved);
        // Refresh saldo in background
        supabase.functions.invoke("telegram-miniapp", { body: { action: "saldo", user_id: saved.userId } })
          .then(({ data }) => { if (data?.saldo !== undefined) setSaldo(Number(data.saldo)); })
          .catch(() => {});
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) setLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, [getTelegramUser, applySession, saveSession, loadSavedSession]);

  const refreshSaldo = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await supabase.functions.invoke("telegram-miniapp", { body: { action: "saldo", user_id: userId } });
      if (data?.saldo !== undefined) {
        const newSaldo = Number(data.saldo);
        setSaldo(newSaldo);
        // Update saved session with new balance
        const saved = loadSavedSession();
        if (saved) saveSession({ ...saved, saldo: newSaldo });
      }
    } catch (err) { console.error("refreshSaldo error:", err); }
  }, [userId, loadSavedSession, saveSession]);

  const loadOperadoras = useCallback(async () => {
    try {
      const { data } = await supabase.functions.invoke("telegram-miniapp", { body: { action: "operadoras", user_id: userId } });
      setOperadoras(data?.operadoras || []);
    } catch (err) { console.error("loadOperadoras error:", err); }
  }, [userId]);

  const loadRecargas = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await supabase.functions.invoke("telegram-miniapp", { body: { action: "recargas", user_id: userId } });
      setRecargas(data?.recargas || []);
    } catch (err) { console.error("loadRecargas error:", err); }
  }, [userId]);

  const loadTransactions = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("transactions")
        .select("id, amount, status, type, created_at, payment_id, metadata")
        .eq("user_id", userId)
        .eq("type", "deposit")
        .order("created_at", { ascending: false })
        .limit(20);
      setTransactions(data || []);
    } catch (err) { console.error("loadTransactions error:", err); }
  }, [userId]);

  // Load avatar on mount
  const loadAvatar = useCallback(async () => {
    if (!userId) return;
    try {
      // Use edge function (service role) to bypass RLS
      const { data } = await supabase.functions.invoke("telegram-miniapp", {
        body: { action: "lookup_by_user_id", user_id: userId },
      });
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    } catch {}
  }, [userId]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 2 * 1024 * 1024) { alert("Arquivo muito grande (máx 2MB)"); return; }
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/avatar.${ext}`;
      // Remove old files
      const { data: existingFiles } = await supabase.storage.from("avatars").list(userId);
      if (existingFiles?.length) {
        await supabase.storage.from("avatars").remove(existingFiles.map(f => `${userId}/${f.name}`));
      }
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = urlData.publicUrl + "?t=" + Date.now();
      await supabase.from("profiles").update({ avatar_url: publicUrl } as any).eq("id", userId);
      setAvatarUrl(publicUrl);
      tgWebApp?.HapticFeedback?.notificationOccurred("success");
    } catch (err: any) {
      alert(err.message || "Erro ao enviar foto");
    }
    setUploadingAvatar(false);
  };

  useEffect(() => {
    if (!userId) return;
    if (section === "recarga") { loadOperadoras(); loadRecargas(); }
    if (section === "historico") loadRecargas();
    if (section === "extrato") loadTransactions();
    if (section === "recarga" || section === "deposito") refreshSaldo();
    if (section === "conta") loadAvatar();
  }, [section, userId]);

  // Realtime subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`miniapp-realtime-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "saldos", filter: `user_id=eq.${userId}` },
        (payload) => {
          const row = payload.new as any;
          if (row?.tipo === "revenda" && row?.valor !== undefined) {
            setSaldo(Number(row.valor));
            tgWebApp?.HapticFeedback?.impactOccurred("light");
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "recargas", filter: `user_id=eq.${userId}` },
        (payload) => {
          const updated = payload.new as any;
          if (updated?.status === "completed" && updated?.telefone) {
            const tel = updated.telefone.replace(/\D/g, "");
            const formatted = tel.length >= 10 ? `(${tel.slice(0, 2)}) ${tel.slice(2, 7)}-${tel.slice(7)}` : tel;
            showToast(`✅ Recarga concluída para ${formatted}!`, "success");
            tgWebApp?.HapticFeedback?.notificationOccurred("success");
          }
          loadRecargas();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter: `user_id=eq.${userId}` },
        () => {
          loadTransactions();
          // Also refresh saldo on deposit completion
          refreshSaldo();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, loadRecargas, loadTransactions, refreshSaldo, showToast]);

  // Auto-check pending recargas against API every 8s
  useEffect(() => {
    if (!userId) return;
    let active = true;

    const checkPending = async () => {
      const pending = recargas.filter(r => r.status === "pending" && r.external_id);
      if (pending.length === 0) return;

      for (const r of pending) {
        if (!active) break;
        try {
          const { data } = await supabase.functions.invoke("recarga-express", {
            body: { action: "order-status", external_id: r.external_id },
          });
          if (data?.success && data.data?.localStatus && data.data.localStatus !== "pending") {
            // DB was updated by the edge function, realtime will pick it up
            // but force reload just in case
            await loadRecargas();
            tgWebApp?.HapticFeedback?.notificationOccurred("success");
            break; // reload got all updates
          }
        } catch { /* ignore */ }
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 8000);
    return () => { active = false; clearInterval(interval); };
  }, [userId, recargas, loadRecargas]);

  const formatCurrency = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const handleRecargaConfirm = async () => {
    if (!userId || !selectedOp || !selectedValor || !phone) return;
    const tel = phone.replace(/\D/g, "");
    if (tel.length < 10) return;
    setRecargaLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("recarga-express", {
        body: { action: "recharge", carrierId: selectedOp.carrierId, phoneNumber: tel, valueId: selectedValor.valueId },
      });
      if (error) throw error;
      if (!result?.success) throw new Error(result?.error || "Erro ao processar recarga");
      await refreshSaldo();
      tgWebApp?.HapticFeedback?.notificationOccurred("success");
      const orderData = result.data || {};
      const now = new Date();
      const hora = formatFullDateTimeBR(now);
      const receiptValue =
        (Number(selectedValor.value) > 0 ? Number(selectedValor.value) : 0) ||
        (() => {
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
          hora,
        },
      });
    } catch (err: any) {
      tgWebApp?.HapticFeedback?.notificationOccurred("error");
      setRecargaResult({ success: false, message: err.message || "Erro ao processar recarga" });
    }
    setRecargaLoading(false);
  };

  const resetRecarga = () => { setSelectedOp(null); setSelectedValor(null); setPhone(""); setRecargaStep("phone"); setRecargaResult(null); setPhoneCheckResult(null); };

  const formatCooldownMsg = (msg?: string) => {
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

  const handleCheckPhone = async (carrierId?: string) => {
    const normalizedPhone = phone.replace(/\D/g, "");
    if (normalizedPhone.length < 10) return;
    const cId = carrierId || selectedOp?.carrierId;
    if (!cId) return;
    setCheckingPhone(true);
    setPhoneCheckResult(null);
    try {
      const { data: resp } = await supabase.functions.invoke("recarga-express", {
        body: { action: "check-phone", phoneNumber: normalizedPhone, carrierId: cId },
      });
      if (resp?.success && resp.data) {
        const result = {
          status: resp.data.status,
          message: resp.data.status === "COOLDOWN"
            ? formatCooldownMsg(resp.data.message)
            : (resp.data.message || "Número disponível para recarga."),
        };
        setPhoneCheckResult(result);
        tgWebApp?.HapticFeedback?.impactOccurred(result.status === "CLEAR" ? "light" : "heavy");
      }
    } catch (err: any) {
      setPhoneCheckResult({ status: "ERROR", message: err.message || "Erro ao verificar" });
    }
    setCheckingPhone(false);
  };

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0 || !userId) return;
    setDepositLoading(true);
    try {
      const result = await createPixDeposit(amount, "", "", false, userId);
      setPixData(result);
      tgWebApp?.HapticFeedback?.impactOccurred("medium");
    } catch (err: any) { alert(err.message || "Erro ao gerar PIX"); }
    setDepositLoading(false);
  };

  const copyPix = async () => {
    if (!pixData?.qr_code) return;
    await navigator.clipboard.writeText(pixData.qr_code);
    setCopied(true);
    tgWebApp?.HapticFeedback?.impactOccurred("light");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) return;
    setLoginLoading(true);
    setLoginError("");
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Falha no login");
      const { data, error } = await supabase.functions.invoke("telegram-miniapp", { body: { action: "lookup_by_user_id", user_id: authData.user.id } });
      if (!error && data?.found) {
        const sess = { userId: data.user_id, userName: data.nome || "", userEmail: authData.user.email || "", saldo: Number(data.saldo || 0) };
        applySession(sess);
        saveSession(sess);
      } else {
        const { data: sData } = await supabase.functions.invoke("telegram-miniapp", { body: { action: "saldo", user_id: authData.user.id } });
        const sess = { userId: authData.user.id, userName: authData.user.email || "", userEmail: authData.user.email || "", saldo: Number(sData?.saldo || 0) };
        applySession(sess);
        saveSession(sess);
      }
      setHasAuthSession(true);
    } catch (err: any) { setLoginError(err.message || "Erro ao fazer login"); }
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearSession();
    setUserId(null); setUserName(""); setUserEmail(""); setSaldo(0);
    setHasAuthSession(false);
  };

  // Detect phone number in clipboard when phone step is active
  useEffect(() => {
    if (section !== "recarga" || recargaStep !== "phone" || phone.length > 0) {
      setClipboardPhone(null);
      return;
    }
    const detectClipboard = async () => {
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
      } catch {
        // Clipboard permission denied — silently ignore
      }
    };
    detectClipboard();
  }, [section, recargaStep, phone]);


  const sectionTitle: Record<Section, string> = {
    recarga: "Nova Recarga", deposito: "Adicionar Saldo", historico: "Histórico de Pedidos",
    extrato: "Extrato de Depósitos", conta: "Minha Conta", status: "Status do Sistema", chat: "Bate-papo",
  };

  const initials = userName ? userName.slice(0, 2).toUpperCase() : "US";

  // Inline style helpers using Telegram CSS vars
  const st = {
    bg: { backgroundColor: "var(--tg-bg)" } as React.CSSProperties,
    secondaryBg: { backgroundColor: "var(--tg-secondary-bg)" } as React.CSSProperties,
    headerBg: { backgroundColor: "var(--tg-header-bg)" } as React.CSSProperties,
    bottomBar: { backgroundColor: "var(--tg-bottom-bar)" } as React.CSSProperties,
    text: { color: "var(--tg-text)" } as React.CSSProperties,
    hint: { color: "var(--tg-hint)" } as React.CSSProperties,
    link: { color: "var(--tg-link)" } as React.CSSProperties,
    accent: { color: "var(--tg-accent)" } as React.CSSProperties,
    btn: { backgroundColor: "var(--tg-btn)", color: "var(--tg-btn-text)" } as React.CSSProperties,
    btnText: { color: "var(--tg-btn-text)" } as React.CSSProperties,
    destructive: { color: "var(--tg-destructive)" } as React.CSSProperties,
    green: { color: "#4ade80" } as React.CSSProperties,
    borderSub: "1px solid color-mix(in srgb, var(--tg-hint) 15%, transparent)",
    borderMain: "1px solid color-mix(in srgb, var(--tg-hint) 20%, transparent)",
  };

  // ─── Splash / Loading ────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={st.bg}>
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full blur-[100px]" style={{ background: "var(--tg-btn)", opacity: 0.12 }} />
        </div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10"
        >
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: `0 0 40px rgba(82,136,193,0.3)` }}>
            <img src={recargasLogo} alt="Recargas Brasil" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        {/* Animated dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex gap-2 mt-6 z-10"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: "var(--tg-btn)" }}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
            />
          ))}
        </motion.div>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-4 text-sm font-medium tracking-wide z-10"
          style={{ color: "var(--tg-hint)" }}
        >
          Carregando...
        </motion.p>
      </div>
    );
  }

  // ─── Login ──────────────────────────────────────
  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative" style={{ ...st.text }}>
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img src={recargasLogo} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.95) 100%)" }} />
        </div>
        <div className="w-full max-w-sm relative z-10">
          {/* Logo & title */}
          <div className="text-center mb-8">
            <img src={recargasLogo} alt="Recargas Brasil" className="w-28 h-28 rounded-3xl mx-auto mb-5 shadow-2xl object-cover ring-2 ring-white/20" />
            <h1 className="text-2xl font-bold text-white drop-shadow-lg">Recargas Brasil</h1>
            <p className="text-sm mt-1.5 text-white/50">Faça login para continuar</p>
          </div>
          {/* Form card */}
          <div className="rounded-2xl p-5 space-y-4 backdrop-blur-xl"
            style={{ 
              backgroundColor: "rgba(23, 33, 43, 0.75)", 
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"
            }}>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5 block">E-mail</label>
                <input type="email" placeholder="seu@email.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#f5f5f5", border: "1px solid rgba(255,255,255,0.12)" }} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Senha</label>
                <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#f5f5f5", border: "1px solid rgba(255,255,255,0.12)" }} />
              </div>
            </div>
            {loginError && <p className="text-xs text-center" style={st.destructive}>{loginError}</p>}
            <button onClick={handleLogin} disabled={loginLoading || !loginEmail || !loginPassword}
              className="w-full rounded-xl py-3.5 font-bold text-sm transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{ 
                background: "linear-gradient(135deg, #5288c1 0%, #3a6fa8 100%)", 
                color: "#fff",
                boxShadow: "0 4px 15px rgba(82, 136, 193, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)"
              }}>
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── App ────────────────────────────────────────
  return (
    <div className={`min-h-screen flex flex-col relative ${isSeasonalActive && !transitioning ? "pt-8" : ""}`} style={{ ...st.bg, ...st.text }}>
      {/* Toast Notifications */}
      <div className="fixed top-16 left-0 right-0 z-[200] flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="pointer-events-auto rounded-xl px-4 py-3 shadow-lg backdrop-blur-xl max-w-[90vw] text-center"
              style={{
                backgroundColor: toast.type === "success" ? "rgba(74,222,128,0.15)" : toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(96,165,250,0.15)",
                border: `1px solid ${toast.type === "success" ? "rgba(74,222,128,0.4)" : toast.type === "error" ? "rgba(239,68,68,0.4)" : "rgba(96,165,250,0.4)"}`,
                color: toast.type === "success" ? "#4ade80" : toast.type === "error" ? "#ef4444" : "#60a5fa",
              }}
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            >
              <p className="text-sm font-semibold">{toast.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-lg px-4 py-3 flex items-center justify-between"
        style={{ ...st.headerBg, borderBottom: st.borderMain }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={st.btn}>
            <Smartphone className="w-4 h-4" style={st.btnText} />
          </div>
          <h1 className="font-bold text-[15px]" style={st.text}>{sectionTitle[section]}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg px-3 py-1.5" style={{ ...st.secondaryBg, border: st.borderSub }}>
            <p className="text-[10px] leading-none" style={st.hint}>Saldo</p>
            <p className="text-xs font-bold leading-tight" style={st.green}><AnimatedCounter value={saldo} prefix="R$&nbsp;" /></p>
          </div>
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">{initials}</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y manipulation' }}>
        <AnimatePresence mode="wait">
          {/* ── Nova Recarga ── */}
          {section === "recarga" && (
            <motion.div key="recarga" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
              {recargaResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="space-y-4"
                >
                  {/* Status Header */}
                  <div className="rounded-2xl p-6 text-center" style={{ ...st.secondaryBg, border: `2px solid ${recargaResult.success ? "#4ade80" : "var(--tg-destructive)"}` }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                    >
                      {recargaResult.success ? (
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: "rgba(74, 222, 128, 0.15)" }}>
                          <Check className="w-8 h-8" style={{ color: "#4ade80" }} />
                        </div>
                      ) : (
                        <p className="text-4xl mb-3">❌</p>
                      )}
                    </motion.div>
                    <p className="font-bold text-lg" style={st.text}>{recargaResult.message}</p>
                    {!recargaResult.success && (
                      <button onClick={resetRecarga} className="mt-4 rounded-xl px-6 py-2.5 text-sm font-medium" style={{ ...st.secondaryBg, border: st.borderSub, color: "var(--tg-text)" }}>
                        Tentar Novamente
                      </button>
                    )}
                  </div>

                  {/* Comprovante Details */}
                  {recargaResult.success && recargaResult.details && (
                    <>
                      <div className="rounded-2xl overflow-hidden" style={{ ...st.secondaryBg, border: st.borderSub }}>
                        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: st.borderSub, backgroundColor: "rgba(74, 222, 128, 0.05)" }}>
                          <FileText className="w-4 h-4" style={{ color: "#4ade80" }} />
                          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: "#4ade80" }}>Comprovante de Recarga</span>
                        </div>
                        <div className="divide-y" style={{ borderColor: "var(--tg-secondary-bg)" }}>
                          {[
                            { icon: Phone, label: "Telefone", value: recargaResult.details.telefone },
                            { icon: Zap, label: "Operadora", value: recargaResult.details.operadora },
                            { icon: Wallet, label: "Valor", value: formatCurrency(recargaResult.details.valor), highlight: true },
                            { icon: Wallet, label: "Novo Saldo", value: formatCurrency(recargaResult.details.novoSaldo) },
                            { icon: Hash, label: "ID do Pedido", value: recargaResult.details.pedidoId || "—" },
                            { icon: Clock, label: "Data/Hora", value: recargaResult.details.hora },
                          ].map((row, i) => (
                            <motion.div
                              key={row.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.06 }}
                              className="flex items-center justify-between px-4 py-3"
                              style={{ borderColor: "rgba(255,255,255,0.05)" }}
                            >
                              <div className="flex items-center gap-2.5">
                                <row.icon className="w-4 h-4" style={{ color: "var(--tg-hint)" }} />
                                <span className="text-xs" style={{ color: "var(--tg-hint)" }}>{row.label}</span>
                              </div>
                              <span className={`text-sm font-semibold ${row.highlight ? "" : ""}`} style={{ color: row.highlight ? "#4ade80" : "var(--tg-text)" }}>
                                {row.value}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        {/* Share / Enviar Comprovante */}
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          onClick={async () => {
                            const d = recargaResult.details!;
                            const text = `✅ *Comprovante de Recarga*\n\n📱 Telefone: ${d.telefone}\n📡 Operadora: ${(d.operadora || "—").toUpperCase()}\n💰 Valor: ${formatCurrency(d.valor)}\n🆔 Pedido: ${d.pedidoId || "—"}\n🕐 Data: ${d.hora}\n\nRecarga realizada com sucesso!`;
                            try {
                              if (navigator.share) {
                                await navigator.share({ title: "Comprovante de Recarga", text: text.replace(/\*/g, "") });
                              } else {
                                await navigator.clipboard.writeText(text.replace(/\*/g, ""));
                                tgWebApp?.HapticFeedback?.notificationOccurred("success");
                              }
                            } catch { /* user cancelled */ }
                          }}
                          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                          style={{ backgroundColor: "var(--tg-btn)", color: "var(--tg-btn-text)" }}
                        >
                          <Share2 className="w-4 h-4" />
                          Enviar
                        </motion.button>

                        {/* Acompanhar Pedido */}
                        {recargaResult.details.pedidoId && (
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 }}
                            onClick={async () => {
                              tgWebApp?.HapticFeedback?.impactOccurred("medium");
                              try {
                                const { data } = await supabase.functions.invoke("recarga-express", {
                                  body: { action: "order-status", external_id: recargaResult.details!.pedidoId },
                                });
                                const status = data?.data?.localStatus || data?.data?.status || "desconhecido";
                                const statusMap: Record<string, string> = { completed: "✅ Concluída", pending: "⏳ Processando", falha: "❌ Falha", feita: "✅ Concluída" };
                                alert(statusMap[status] || `Status: ${status}`);
                              } catch { alert("Erro ao consultar status"); }
                            }}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
                            style={{ ...st.secondaryBg, border: st.borderSub, color: "var(--tg-text)" }}
                          >
                            <RefreshCw className="w-4 h-4" />
                            Status
                          </motion.button>
                        )}
                      </div>

                      {/* Nova Recarga */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        onClick={resetRecarga}
                        className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                        style={{ ...st.secondaryBg, border: st.borderSub, color: "var(--tg-accent)" }}
                      >
                        <Smartphone className="w-4 h-4" />
                        Nova Recarga
                      </motion.button>
                    </>
                  )}
                </motion.div>
              ) : (
                <>
                  <div className="flex gap-1">
                    {["phone", "op", "valor", "confirm"].map((step, i) => (
                      <div key={step} className="flex-1 h-1 rounded-full"
                        style={{ backgroundColor: ["phone", "op", "valor", "confirm"].indexOf(recargaStep) >= i ? "var(--tg-btn)" : "color-mix(in srgb, var(--tg-hint) 25%, transparent)" }} />
                    ))}
                  </div>

                  {recargaStep === "phone" && (
                    <div className="rounded-2xl p-6 space-y-5" style={{ ...st.secondaryBg, border: st.borderSub }}>
                      <div className="text-center">
                        <motion.div
                          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                          style={{ backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)" }}
                          animate={{ y: [0, -6, 0], rotate: [0, -8, 8, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Smartphone className="w-7 h-7" style={st.link} />
                        </motion.div>
                        <h2 className="text-lg font-bold" style={st.text}>Qual o número?</h2>
                        <p className="text-sm mt-1" style={st.hint}>Digite o DDD + Número do celular</p>
                      </div>
                      {/* Clipboard phone suggestion */}
                      {clipboardPhone && phone.length === 0 && (
                        <button
                          onClick={() => { setPhone(clipboardPhone); setClipboardPhone(null); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                          className="w-full flex items-center justify-between rounded-xl px-4 py-3 transition-all active:scale-[0.98]"
                          style={{ backgroundColor: "color-mix(in srgb, var(--tg-btn) 12%, transparent)", border: `1px solid color-mix(in srgb, var(--tg-btn) 30%, transparent)` }}>
                          <div className="flex items-center gap-3">
                            <Copy className="w-4 h-4" style={st.link} />
                            <div className="text-left">
                              <p className="text-xs font-medium" style={st.link}>Número detectado na área de transferência</p>
                              <p className="text-base font-mono font-bold" style={st.text}>{formatPhone(clipboardPhone)}</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={st.btn}>Colar</span>
                        </button>
                      )}
                      <input type="tel" value={formatPhone(phone)}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                          setPhone(digits);
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const pasted = e.clipboardData.getData("text") || "";
                          let digits = pasted.replace(/\D/g, "");
                          // Remove country code 55 if present (e.g. +5521999005933)
                          if (digits.length >= 12 && digits.startsWith("55")) {
                            digits = digits.slice(2);
                          }
                          digits = digits.slice(0, 11);
                          setPhone(digits);
                        }}
                        placeholder="(00) 00000-0000"
                        className="w-full bg-transparent pb-3 text-2xl text-center font-mono focus:outline-none"
                        style={{ ...st.text, borderBottom: st.borderMain }} />
                      <button onClick={() => { if (phone.replace(/\D/g, "").length >= 10) { loadOperadoras(); setRecargaStep("op"); } }}
                        disabled={phone.replace(/\D/g, "").length < 10}
                        className="w-full rounded-xl py-3.5 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-40"
                        style={st.btn}>
                        Continuar <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {recargaStep === "op" && (
                    <div className="space-y-3">
                      <button onClick={() => setRecargaStep("phone")} className="flex items-center gap-1 text-sm" style={st.hint}>
                        <ArrowLeft className="w-4 h-4" /> Voltar
                      </button>
                      <h2 className="text-lg font-bold" style={st.text}>Selecione a operadora</h2>
                      {operadoras.length === 0 ? (
                        <div className="text-center py-8" style={st.hint}>
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Carregando operadoras...</p>
                        </div>
                      ) : operadoras.map((op) => (
                        <button key={op.id} onClick={() => { setSelectedOp(op); setPhoneCheckResult(null); handleCheckPhone(op.carrierId); setRecargaStep("check"); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                          className="w-full rounded-xl p-4 text-left transition flex items-center justify-between"
                          style={{ ...st.secondaryBg, border: st.borderSub }}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)" }}>
                              <Smartphone className="w-5 h-5" style={st.link} />
                            </div>
                            <span className="font-semibold" style={st.text}>{(op.nome || "").toUpperCase()}</span>
                          </div>
                          <ChevronRight className="w-4 h-4" style={st.hint} />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Check step - blacklist/cooldown verification */}
                  {recargaStep === "check" && selectedOp && (
                    <div className="space-y-4">
                      <button onClick={() => { setRecargaStep("op"); setPhoneCheckResult(null); }} className="flex items-center gap-1 text-sm" style={st.hint}>
                        <ArrowLeft className="w-4 h-4" /> Voltar
                      </button>
                      <div className="text-center">
                        <motion.div
                          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                          style={{ backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)" }}
                          animate={checkingPhone ? { rotate: [0, 360] } : {}}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        >
                          <Shield className="w-7 h-7" style={st.link} />
                        </motion.div>
                        <h2 className="text-lg font-bold" style={st.text}>Verificação de Número</h2>
                        <p className="text-sm mt-1" style={st.hint}>{(selectedOp.nome || "").toUpperCase()} • {phone}</p>
                      </div>

                      <div className="rounded-2xl p-5" style={{ ...st.secondaryBg, border: st.borderSub }}>
                        {checkingPhone && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-4">
                            <Loader2 className="w-8 h-8 animate-spin" style={st.link} />
                            <p className="text-sm font-medium" style={st.hint}>Verificando blacklist e cooldown...</p>
                          </motion.div>
                        )}
                        {!checkingPhone && phoneCheckResult && (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-3 py-2">
                            {phoneCheckResult.status === "CLEAR" ? (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                                <CheckCircle2 className="w-12 h-12" style={{ color: "#22c55e" }} />
                              </motion.div>
                            ) : phoneCheckResult.status === "COOLDOWN" ? (
                              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                                <AlertTriangle className="w-12 h-12" style={{ color: "#eab308" }} />
                              </motion.div>
                            ) : (
                              <motion.div animate={{ scale: [1, 1.15, 1, 1.1, 1], rotate: [0, -10, 10, -5, 0], opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
                                <XCircle className="w-12 h-12 text-destructive drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                              </motion.div>
                            )}
                            <p className="text-sm font-semibold text-center" style={{
                              color: phoneCheckResult.status === "CLEAR" ? "#22c55e" : phoneCheckResult.status === "COOLDOWN" ? "#eab308" : "#ef4444"
                            }}>
                              {phoneCheckResult.status === "CLEAR" ? "Número Disponível" : phoneCheckResult.status === "COOLDOWN" ? "Cooldown Ativo" : "Número Bloqueado"}
                            </p>
                            <p className="text-xs text-center" style={st.hint}>{phoneCheckResult.message}</p>
                          </motion.div>
                        )}
                      </div>

                      {!checkingPhone && phoneCheckResult && (
                        <div className="flex gap-2">
                          {phoneCheckResult.status !== "BLACKLISTED" && (
                            <button onClick={() => setRecargaStep("valor")}
                              className="flex-1 rounded-xl py-3.5 font-semibold transition flex items-center justify-center gap-2"
                              style={{ backgroundColor: "var(--tg-btn)", color: "var(--tg-btn-text)" }}>
                              Continuar <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => { setRecargaStep("op"); setPhoneCheckResult(null); }}
                            className="flex-1 rounded-xl py-3.5 font-semibold transition flex items-center justify-center gap-2"
                            style={{ ...st.secondaryBg, ...st.text, border: st.borderSub }}>
                            Trocar Operadora
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {recargaStep === "valor" && selectedOp && (
                    <div className="space-y-3">
                      <button onClick={() => setRecargaStep("check")} className="flex items-center gap-1 text-sm" style={st.hint}>
                        <ArrowLeft className="w-4 h-4" /> Voltar
                      </button>
                      <h2 className="text-lg font-bold" style={st.text}>{(selectedOp.nome || "").toUpperCase()} — Valor</h2>

                      <div className="grid grid-cols-2 gap-3">
                        {selectedOp.valores.sort((a: ValorItem, b: ValorItem) => (a.userCost ?? a.cost) - (b.userCost ?? b.cost)).map((v: ValorItem) => {
                          const faceValue = v.value || v.cost;
                          const displayCost = v.userCost ?? v.cost;
                          const discount = faceValue > displayCost ? Math.round(((faceValue - displayCost) / faceValue) * 100) : 0;
                          return (
                            <button key={v.valueId} onClick={() => { setSelectedValor(v); setRecargaStep("confirm"); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                              className="relative rounded-xl py-4 px-3 text-left transition-all active:scale-95"
                              style={{ ...st.secondaryBg, ...st.text, border: st.borderSub }}>
                              {discount > 0 && (
                                <span className="absolute -top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                                  style={{ background: discount >= 30 ? "#22c55e" : discount >= 20 ? "#10b981" : "#3b82f6" }}>
                                  {discount}% OFF
                                </span>
                              )}
                              <div className="text-[10px] font-semibold uppercase tracking-wider" style={st.hint}>Recarga</div>
                              <div className="text-lg font-bold mt-0.5">R$ {faceValue.toFixed(2)}</div>
                              {v.label && v.label !== `R$ ${v.cost}` && v.label !== `R$ ${faceValue}` && (
                                <div className="text-[10px] mt-0.5 truncate" style={st.hint}>{v.label}</div>
                              )}
                              {discount > 0 && (
                                <div className="mt-2 pt-2" style={{ borderTop: st.borderSub }}>
                                  <span className="text-[11px]" style={st.hint}>Você paga </span>
                                  <span className="text-sm font-bold" style={{ color: "#22c55e" }}>R$ {displayCost.toFixed(2)}</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {recargaStep === "confirm" && selectedOp && selectedValor && (
                    <div className="space-y-3">
                      <button onClick={() => setRecargaStep("valor")} className="flex items-center gap-1 text-sm" style={st.hint}>
                        <ArrowLeft className="w-4 h-4" /> Voltar
                      </button>
                      <div className="rounded-2xl p-5 space-y-3" style={{ ...st.secondaryBg, border: st.borderSub }}>
                        <h2 className="text-lg font-bold text-center" style={st.text}>Confirmar Recarga</h2>
                        <div className="flex justify-between"><span style={st.hint}>Operadora</span><span className="font-semibold" style={st.text}>{selectedOp.nome}</span></div>
                        <div className="flex justify-between"><span style={st.hint}>Número</span><span className="font-mono" style={st.text}>{formatPhone(phone)}</span></div>
                        <div className="flex justify-between"><span style={st.hint}>Valor</span><span className="font-bold" style={st.green}>{formatCurrency(selectedValor.userCost ?? selectedValor.cost)}</span></div>
                        <div className="flex justify-between text-sm"><span style={st.hint}>Saldo após</span><span style={st.text}>{formatCurrency(saldo - (selectedValor.userCost ?? selectedValor.cost))}</span></div>
                      </div>
                      {(selectedValor.userCost ?? selectedValor.cost) > saldo ? (
                        <p className="text-center text-sm" style={st.destructive}>Saldo insuficiente</p>
                      ) : (
                        <button onClick={handleRecargaConfirm} disabled={recargaLoading}
                          className="w-full rounded-xl py-3.5 font-semibold transition disabled:opacity-50"
                          style={{ backgroundColor: "#4ade80", color: "#000" }}>
                          {recargaLoading ? "Processando..." : "✅ Confirmar Recarga"}
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}

              {recargaStep === "phone" && (
                <div className="space-y-3 pt-2">
                  {/* Botão Ver Tabela de Valores */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setShowPriceTable(true); if (operadoras.length === 0) loadOperadoras(); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                      className="rounded-xl px-4 py-2.5 flex items-center gap-2 transition-all active:scale-[0.97]"
                      style={{ border: "1px solid color-mix(in srgb, var(--tg-hint) 25%, transparent)", backgroundColor: "color-mix(in srgb, var(--tg-hint) 8%, var(--tg-bg))" }}
                    >
                      <span className="text-sm" style={st.hint}>≡</span>
                      <span className="text-sm font-semibold" style={st.hint}>Ver Tabela de Valores</span>
                    </button>
                  </div>

                  {/* Modal Bottom Sheet - Tabela de Valores */}
                  <AnimatePresence>
                    {showPriceTable && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-50"
                          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                          onClick={() => setShowPriceTable(false)}
                        />
                        <motion.div
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          transition={{ type: "spring", damping: 28, stiffness: 300 }}
                          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl max-h-[80vh] flex flex-col"
                          style={{ backgroundColor: "var(--tg-secondary-bg, #232e3c)", border: st.borderSub }}
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: st.borderSub }}>
                            <h3 className="text-base font-bold" style={st.text}>Valores e Operadoras Disponíveis</h3>
                            <button onClick={() => setShowPriceTable(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--tg-hint) 15%, transparent)" }}>
                              <span className="text-sm" style={st.hint}>✕</span>
                            </button>
                          </div>

                          {/* Content */}
                          <div className="flex-1 overflow-y-auto pb-8">
                            {operadoras.length === 0 ? (
                              <div className="flex items-center justify-center py-10" style={st.hint}>
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-sm">Carregando...</span>
                              </div>
                            ) : operadoras.map((op, opIdx) => (
                              <div key={op.id} style={opIdx > 0 ? { borderTop: st.borderSub } : undefined}>
                                <div className="px-5 py-3 flex items-center gap-2">
                                  <span className="text-sm font-bold" style={st.text}>{op.nome}</span>
                                </div>
                                <div className="px-5 pb-4 grid grid-cols-2 gap-2.5">
                                  {op.valores
                                    .sort((a: ValorItem, b: ValorItem) => (a.userCost ?? a.cost) - (b.userCost ?? b.cost))
                                    .map(v => {
                                      const faceValue = v.value || v.cost;
                                      const displayCost = v.userCost ?? v.cost;
                                      const hasDiff = faceValue !== displayCost;
                                      return (
                                        <div key={v.valueId} className="rounded-xl px-3 py-3.5 text-center min-h-[60px] flex flex-col items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, var(--tg-hint) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--tg-hint) 15%, transparent)" }}>
                                          <p className="text-sm font-bold" style={st.text}>R$ {faceValue.toFixed(2).replace(".", ",")}</p>
                                          {hasDiff && (
                                            <p className="text-xs font-medium mt-0.5" style={{ color: "#4ade80" }}>Paga R$ {displayCost.toFixed(2).replace(".", ",")}</p>
                                          )}
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm" style={st.text}>Últimas Recargas</h3>
                    {recargas.length > 0 && (
                      <button onClick={() => setSection("historico")} className="text-xs" style={st.link}>Ver todas</button>
                    )}
                  </div>
                  {recargas.length === 0 ? (
                    <div className="rounded-xl p-4 text-center" style={{ ...st.secondaryBg, border: st.borderSub }}>
                      <p className="text-sm" style={st.hint}>Nenhuma recarga realizada ainda</p>
                    </div>
                  ) : (
                    recargas.slice(0, 5).map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-xl p-3.5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
                        style={{ ...st.secondaryBg, border: st.borderSub }}
                        onClick={() => { if (r.status === "completed") { setViewingReceipt(r); setSection("historico"); } }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={st.bg}>
                            <Smartphone className="w-5 h-5" style={st.link} />
                          </div>
                          <div>
                            <p className="font-bold text-sm" style={st.text}>{(r.operadora || "—").toUpperCase()}</p>
                            <p className="text-xs font-mono" style={st.hint}>{formatPhone(r.telefone)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm" style={st.text}>{formatCurrency(r.valor)}</p>
                          <p className="text-[11px] font-medium" style={{ color: r.status === "completed" ? "var(--tg-link)" : r.status === "pending" ? "#facc15" : "var(--tg-destructive)" }}>
                            {r.status === "completed" ? "Comprovante" : r.status === "pending" ? "Processando" : "Falha"}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Adicionar Saldo ── */}
          {section === "deposito" && (
            <motion.div key="deposito" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
              {pixData ? (
                <motion.div
                  className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] pb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {/* Success badge */}
                  <div className="text-center">
                    <motion.div
                      className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(74,222,128,0.15)" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.1 }}
                    >
                      <Check className="w-6 h-6" style={{ color: "#4ade80" }} />
                    </motion.div>
                    <motion.h2
                      className="text-base font-bold"
                      style={st.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      PIX Gerado com Sucesso!
                    </motion.h2>
                  </div>

                  {/* QR Code compact */}
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="bg-white rounded-xl p-2.5 relative">
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        animate={{ boxShadow: ["0 0 0px rgba(74,222,128,0)", "0 0 16px rgba(74,222,128,0.25)", "0 0 0px rgba(74,222,128,0)"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <QRCodeSVG value={pixData.qr_code || ""} size={160} />
                    </div>
                  </motion.div>

                  {/* Amount */}
                  <motion.p
                    className="text-center text-xl font-bold"
                    style={st.green}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.4 }}
                  >
                    {formatCurrency(pixData.amount)}
                  </motion.p>

                  {/* Copy section */}
                  {pixData.qr_code && (
                    <motion.div
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.button
                        onClick={copyPix}
                        className="w-full rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2"
                        style={st.btn}
                        whileTap={{ scale: 0.95 }}
                        animate={copied ? { backgroundColor: "rgba(74,222,128,0.2)" } : {}}
                      >
                        {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar código PIX</>}
                      </motion.button>
                    </motion.div>
                  )}
                  <motion.button
                    onClick={() => { setPixData(null); setDepositAmount(""); }}
                    className="w-full text-center text-sm flex items-center justify-center gap-1"
                    style={st.hint}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </motion.button>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-2xl p-5 text-center" style={{ ...st.secondaryBg, border: st.borderSub }}>
                    <p className="text-[11px] uppercase tracking-wider" style={st.hint}>Saldo Atual</p>
                    <p className="text-2xl font-bold mt-1" style={st.green}>{formatCurrency(saldo)}</p>
                  </div>
                  <h2 className="font-bold" style={st.text}>Selecione o valor</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 15, 20, 30, 50, 100].map((v) => (
                      <button key={v} onClick={() => setDepositAmount(String(v))}
                        className="rounded-xl py-3.5 text-center font-semibold transition"
                        style={{
                          ...(depositAmount === String(v) ? { backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)", color: "var(--tg-link)" } : { ...st.secondaryBg, ...st.text }),
                          border: depositAmount === String(v) ? "1px solid var(--tg-btn)" : st.borderSub,
                        }}>
                        R$ {v}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span style={st.hint}>R$</span>
                      <input type="text" inputMode="decimal" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value.replace(/[^\d,.]/g, ""))}
                        placeholder="Outro valor (mín. R$ 10)" className="flex-1 rounded-xl p-3 focus:outline-none"
                        style={{ ...st.secondaryBg, ...st.text, border: st.borderSub }} />
                    </div>
                    {depositAmount && parseFloat(depositAmount.replace(",", ".")) > 0 && parseFloat(depositAmount.replace(",", ".")) < 10 && (
                      <p className="text-xs" style={{ color: "var(--tg-destructive, #ec3942)" }}>Valor mínimo: R$ 10,00</p>
                    )}
                  </div>
                  <motion.button
                    onClick={handleDeposit}
                    disabled={depositLoading || !depositAmount || parseFloat((depositAmount || "0").replace(",", ".")) < 10}
                    className="w-full rounded-2xl py-4 font-bold text-base transition disabled:opacity-40 flex items-center justify-center gap-3 relative overflow-hidden"
                    style={{ backgroundColor: "#4ade80", color: "#000" }}
                    whileTap={{ scale: 0.97 }}
                    animate={{ boxShadow: ["0 0 0px rgba(74,222,128,0.3)", "0 0 20px rgba(74,222,128,0.5)", "0 0 0px rgba(74,222,128,0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div
                      animate={{ y: [0, -2, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Landmark className="w-5 h-5" />
                    </motion.div>
                    {depositLoading ? "Gerando PIX..." : "💰 Gerar PIX Agora"}
                    <motion.div
                      className="absolute right-4"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── Histórico ── */}
          {section === "historico" && (
            <motion.div key="historico" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-2">
              {/* Receipt Detail View */}
              <AnimatePresence>
                {viewingReceipt && (
                  <>
                    <motion.div
                      className="fixed inset-0 z-[100]"
                      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setViewingReceipt(null)}
                    />
                    <motion.div
                      className="fixed inset-x-4 top-[15%] z-[101] rounded-2xl p-5 space-y-4 max-h-[75vh] overflow-y-auto"
                      style={{ ...st.secondaryBg, border: `2px solid ${viewingReceipt.status === "completed" ? "#4ade80" : "#facc15"}` }}
                      initial={{ opacity: 0, scale: 0.9, y: 30 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 30 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      {/* Header */}
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: viewingReceipt.status === "completed" ? "rgba(74,222,128,0.15)" : "rgba(250,204,21,0.15)" }}>
                          {viewingReceipt.status === "completed"
                            ? <Check className="w-7 h-7" style={{ color: "#4ade80" }} />
                            : <Clock className="w-7 h-7" style={{ color: "#facc15" }} />}
                        </div>
                        <p className="font-bold text-lg" style={st.text}>
                          {viewingReceipt.status === "completed" ? "Recarga Concluída" : viewingReceipt.status === "pending" ? "Processando..." : "Falha na Recarga"}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="rounded-xl overflow-hidden" style={{ ...st.bg, border: st.borderSub }}>
                        <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: st.borderSub, backgroundColor: "rgba(74,222,128,0.05)" }}>
                          <FileText className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
                          <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: "#4ade80" }}>Comprovante</span>
                        </div>
                        {[
                          { icon: Phone, label: "Telefone", value: formatPhone(viewingReceipt.telefone) },
                          { icon: Zap, label: "Operadora", value: (viewingReceipt.operadora || "—").toUpperCase() },
                          { icon: Wallet, label: "Valor", value: formatCurrency(viewingReceipt.valor), highlight: true },
                          { icon: Hash, label: "ID do Pedido", value: viewingReceipt.external_id || viewingReceipt.id.slice(0, 8) },
                          { icon: Clock, label: "Data", value: formatDateTimeBR(viewingReceipt.created_at) },
                        ].map((row) => (
                          <div key={row.label} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <div className="flex items-center gap-2">
                              <row.icon className="w-3.5 h-3.5" style={{ color: "var(--tg-hint)" }} />
                              <span className="text-xs" style={{ color: "var(--tg-hint)" }}>{row.label}</span>
                            </div>
                            <span className="text-sm font-semibold" style={{ color: row.highlight ? "#4ade80" : "var(--tg-text)" }}>{row.value}</span>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={async () => {
                            const text = `✅ Comprovante de Recarga\n\n📱 Telefone: ${formatPhone(viewingReceipt.telefone)}\n📡 Operadora: ${(viewingReceipt.operadora || "—").toUpperCase()}\n💰 Valor: ${formatCurrency(viewingReceipt.valor)}\n🆔 Pedido: ${viewingReceipt.external_id || viewingReceipt.id.slice(0, 8)}\n🕐 Data: ${formatFullDateTimeBR(viewingReceipt.created_at)}\n\nRecarga realizada com sucesso!`;
                            try {
                              if (navigator.share) await navigator.share({ title: "Comprovante de Recarga", text });
                              else { await navigator.clipboard.writeText(text); tgWebApp?.HapticFeedback?.notificationOccurred("success"); }
                            } catch {}
                          }}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ backgroundColor: "var(--tg-btn)", color: "var(--tg-btn-text)" }}
                        >
                          <Share2 className="w-4 h-4" /> Enviar
                        </button>
                        <button
                          onClick={() => setViewingReceipt(null)}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ ...st.bg, border: st.borderSub, color: "var(--tg-text)" }}
                        >
                          Fechar
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {recargas.length === 0 ? (
                <p className="text-center py-12 text-sm" style={st.hint}>Nenhuma recarga encontrada</p>
              ) : (() => {
                let lastDate = "";
                return recargas.map((r) => {
                  const d = new Date(r.created_at);
                  const dateLabel = formatDateLongUpperBR(r.created_at);
                  const showSep = dateLabel !== lastDate;
                  lastDate = dateLabel;
                  return (
                    <div key={r.id}>
                      {showSep && (
                        <div className="flex justify-center my-2">
                          <span className="text-[10px] px-3 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--tg-hint)" }}>{dateLabel}</span>
                        </div>
                      )}
                      <button
                        onClick={() => { setViewingReceipt(r); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                        className="w-full rounded-xl p-3 flex items-center justify-between text-left active:scale-[0.98] transition-transform"
                        style={{ ...st.secondaryBg, border: st.borderSub }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={st.bg}>
                            <Smartphone className="w-4 h-4" style={st.hint} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={st.text}>{(r.operadora || "—").toUpperCase()}</p>
                            <p className="text-xs font-mono" style={st.hint}>{formatPhone(r.telefone)}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-sm" style={st.text}>{formatCurrency(r.valor)}</p>
                            <p className="text-[10px]" style={{ color: r.status === "completed" ? "#4ade80" : r.status === "pending" ? "#facc15" : "var(--tg-destructive)" }}>
                              {r.status === "completed" ? "✅ Concluída" : r.status === "pending" ? "⏳ Processando" : "❌ Falha"}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4" style={{ color: "var(--tg-hint)" }} />
                        </div>
                      </button>
                    </div>
                  );
                });
              })()}
              <button onClick={async () => { setRefreshingRecargas(true); await loadRecargas(); setRefreshingRecargas(false); }} className="w-full text-center text-sm transition py-2 flex items-center justify-center gap-1" style={st.hint}>
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingRecargas ? "animate-spin" : ""}`} /> Atualizar
              </button>
            </motion.div>
          )}

          {/* ── Extrato ── */}
          {section === "extrato" && (
            <motion.div key="extrato" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-2">
              {transactions.length === 0 ? (
                <p className="text-center py-12 text-sm" style={st.hint}>Nenhum depósito encontrado</p>
              ) : (() => {
                let lastDate = "";
                return transactions.map((t) => {
                  const d = new Date(t.created_at);
                  const dateLabel = formatDateLongUpperBR(t.created_at);
                  const showSep = dateLabel !== lastDate;
                  lastDate = dateLabel;
                  const isPending = t.status === "pending";
                  const hasQr = isPending && t.metadata?.qr_code && t.metadata.qr_code !== "yes" && t.metadata.qr_code !== "no";
                  return (
                    <div key={t.id}>
                      {showSep && (
                        <div className="flex justify-center my-2">
                          <span className="text-[10px] px-3 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--tg-hint)" }}>{dateLabel}</span>
                        </div>
                      )}
                      <button
                        className="w-full rounded-xl p-3 flex items-center justify-between text-left"
                        style={{ ...st.secondaryBg, border: st.borderSub }}
                        onClick={() => {
                          if (hasQr) {
                            setPixData({
                              gateway: t.metadata?.gateway || "",
                              payment_id: t.payment_id || "",
                              qr_code: t.metadata.qr_code,
                              qr_code_base64: null,
                              payment_link: null,
                              amount: t.amount,
                              status: "pending",
                            });
                            setSection("deposito");
                            tgWebApp?.HapticFeedback?.impactOccurred("light");
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "color-mix(in srgb, #4ade80 10%, transparent)" }}>
                            <Landmark className="w-4 h-4" style={st.green} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={st.text}>Depósito PIX</p>
                            <p className="text-xs" style={st.hint}>{formatTimeBR(t.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-sm" style={st.green}>+{formatCurrency(t.amount)}</p>
                            <p className="text-[10px]" style={{ color: (t.status === "approved" || t.status === "completed") ? "#4ade80" : isPending ? "#facc15" : "var(--tg-destructive)" }}>
                              {(t.status === "approved" || t.status === "completed") ? "✅ Confirmado" : isPending ? "⏳ Processando" : "❌ Falha"}
                            </p>
                          </div>
                          {hasQr && <ChevronRight className="w-4 h-4" style={{ color: "var(--tg-hint)" }} />}
                        </div>
                      </button>
                    </div>
                  );
                });
              })()}
              <button onClick={async () => { setRefreshingExtrato(true); await loadTransactions(); setRefreshingExtrato(false); }} className="w-full text-center text-sm transition py-2 flex items-center justify-center gap-1" style={st.hint}>
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingExtrato ? "animate-spin" : ""}`} /> Atualizar
              </button>
            </motion.div>
          )}

          {/* ── Conta ── */}
          {section === "conta" && (
            <motion.div key="conta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, type: "spring", damping: 20 }}
                className="rounded-2xl p-5 flex items-center gap-4" style={{ ...st.secondaryBg, border: st.borderSub }}>
                {/* Avatar with upload */}
                <label className="relative cursor-pointer group shrink-0">
                  <div className="w-[72px] h-[72px] rounded-full p-[3px] rgb-border flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-orange-500 flex items-center justify-center text-xl font-bold text-white">{initials}</div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--tg-btn)" }}>
                    {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Camera className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                </label>
                <div>
                  <p className="font-bold" style={st.text}>{userName}</p>
                  <p className="text-sm" style={st.hint}>{userEmail}</p>
                  <p className="text-xs mt-1" style={st.hint}>Toque na foto para alterar</p>
                </div>
              </motion.div>

              {/* Telegram Vinculado */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: "spring", damping: 20 }}
                className="rounded-2xl p-4 flex items-center gap-3 overflow-hidden relative"
                style={{ ...st.secondaryBg, border: "1px solid rgba(34,197,94,0.3)" }}
              >
                <motion.div
                  className="absolute inset-0 opacity-10"
                  style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.3) 0%, transparent 60%)" }}
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "rgba(34,197,94,0.15)" }}
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.74 4-1.73 6.67-2.88 8.02-3.44 3.82-1.6 4.62-1.87 5.13-1.88.11 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .41z" fill="rgb(34,197,94)"/>
                  </svg>
                </motion.div>
                <div className="flex-1 relative z-10">
                  <p className="font-semibold text-sm" style={{ color: "rgb(34,197,94)" }}>Telegram Vinculado</p>
                  <p className="text-xs" style={st.hint}>Conta conectada com sucesso</p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 300 }}
                >
                  <AnimatedCheck size={22} className="text-success" />
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, type: "spring", damping: 20 }}
                className="rounded-2xl p-5" style={{ ...st.secondaryBg, border: st.borderSub }}>
                <div className="flex items-center gap-2 mb-1">
                  <motion.svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: "rgb(34,197,94)" }}
                    animate={{ rotateY: [0, 180, 360], scale: [1, 1.15, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                  </motion.svg>
                  <p className="text-[11px] uppercase tracking-wider" style={st.hint}>Saldo de Revenda</p>
                </div>
                <p className="text-2xl font-bold" style={st.green}>{formatCurrency(saldo)}</p>
              </motion.div>
              <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, type: "spring", damping: 20 }}
                onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm transition"
                style={{ ...st.destructive, border: st.borderSub }}>
                <LogOut className="w-4 h-4" /> Sair da conta
              </motion.button>
            </motion.div>
          )}

          {/* ── Status ── */}
          {section === "status" && (
            <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-3">
              {[
                { name: "API de Recargas" },
                { name: "Gateway de Pagamento" },
                { name: "Bot do Telegram" },
              ].map((item) => (
                <div key={item.name} className="rounded-xl p-4 flex items-center justify-between" style={{ ...st.secondaryBg, border: st.borderSub }}>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" style={st.hint} />
                    <span className="text-sm font-medium" style={st.text}>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#4ade80" }} />
                    <span className="text-xs" style={st.green}>Online</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
          {/* ── Chat ── */}
          {section === "chat" && userId && hasAuthSession && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-[calc(100vh-180px)] tg-chat-theme">
              <ChatPage onBack={() => setSection("recarga")} forceMobile />
            </motion.div>
          )}
          {section === "chat" && (!userId || !hasAuthSession) && (
            <motion.div key="chat-no-auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 flex flex-col items-center justify-center text-center" style={{ minHeight: "50vh" }}>
              <MessageCircle className="w-14 h-14 mb-4" style={st.hint} />
              <p className="text-base font-bold mb-2" style={st.text}>Faça login para acessar o chat</p>
              <div className="rounded-xl p-4 mt-2 text-left space-y-2" style={{ background: "rgba(255,255,255,0.05)", border: st.borderMain }}>
                <p className="text-xs font-semibold" style={st.text}>📋 Como acessar:</p>
                <p className="text-xs" style={st.hint}>1. Toque na aba <strong style={st.text}>"Conta"</strong> no menu inferior</p>
                <p className="text-xs" style={st.hint}>2. Se já estiver logado, toque em <strong style={st.text}>"Sair"</strong> e entre novamente</p>
                <p className="text-xs" style={st.hint}>3. Faça login com seu <strong style={st.text}>e-mail e senha</strong></p>
                <p className="text-xs" style={st.hint}>4. Volte para a aba <strong style={st.text}>"Chat"</strong></p>
              </div>
              <p className="text-[10px] mt-3" style={st.hint}>⚠️ Certifique-se de lembrar seu e-mail e senha cadastrados no sistema</p>
              <button
                onClick={() => setSection("conta")}
                className="mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: (st.btn as any)?.backgroundColor || "var(--tg-btn, #2481cc)", color: (st.btnText as any)?.color || "#fff" }}
              >
                Ir para Conta
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Seasonal Effects for Mini App (own particles + banners with smooth transitions) */}
      {(isSeasonalActive || transitioning) && (
        <>
          {/* Top seasonal banner — smooth entry/exit */}
          <AnimatePresence mode="wait">
            {!transitioning && isSeasonalActive && (
              <motion.div
                key={`miniapp-banner-${seasonalTheme.key}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className={`fixed top-0 left-0 right-0 z-40 bg-gradient-to-r ${seasonalTheme.accentGradient} overflow-hidden`}
              >
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex items-center justify-center gap-2 py-1.5 px-4"
                >
                  <span className="text-sm">{seasonalTheme.emoji}</span>
                  <span className="text-xs font-bold text-white drop-shadow-sm tracking-wide">{seasonalTheme.label.toUpperCase()}</span>
                  <span className="text-sm">{seasonalTheme.emoji}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating particles — fade out gracefully when transitioning */}
          {seasonalTheme.particles.slice(0, 8).map((emoji, i) => (
            <motion.div
              key={`miniapp-p-${seasonalTheme.key}-${i}`}
              className="fixed pointer-events-none select-none z-[9999]"
              initial={{ top: -40, left: `${(i * 12 + Math.random() * 8) % 95}%`, opacity: 0, scale: 0.5, rotate: 0 }}
              animate={transitioning
                ? { opacity: 0, scale: 0, rotate: 720, transition: { duration: 1.5, ease: "easeInOut" } }
                : {
                    top: "110vh",
                    opacity: [0, 0.8, 0.8, 0.4, 0],
                    scale: [0.5, 1, 0.8],
                    rotate: [0, 180, 360],
                  }
              }
              transition={transitioning ? undefined : { duration: 8 + Math.random() * 5, delay: i * 1.2, repeat: Infinity, ease: "linear" }}
              style={{ fontSize: 14 + Math.random() * 8 }}
            >
              {emoji}
            </motion.div>
          ))}

          {/* Ambient glow — smooth fade */}
          <AnimatePresence>
            {!transitioning && seasonalTheme.glowColor && (
              <motion.div
                key={`miniapp-glow-${seasonalTheme.key}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="fixed inset-0 pointer-events-none z-[9998]"
                style={{
                  background: `radial-gradient(ellipse at 50% 0%, ${seasonalTheme.glowColor} 0%, transparent 60%)`,
                }}
              />
            )}
          </AnimatePresence>

          {/* Bottom seasonal strip above nav — smooth entry/exit */}
          <AnimatePresence mode="wait">
            {!transitioning && isSeasonalActive && (
              <motion.div
                key={`miniapp-strip-${seasonalTheme.key}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                className={`fixed bottom-[60px] left-0 right-0 z-20 bg-gradient-to-r ${seasonalTheme.accentGradient} overflow-hidden`}
              >
                <div className="flex items-center justify-center gap-2 py-1 px-4">
                  <span className="text-xs">{seasonalTheme.emoji}</span>
                  <span className="text-[10px] font-bold text-white drop-shadow-sm tracking-wide">{seasonalTheme.label.toUpperCase()}</span>
                  <span className="text-xs">{seasonalTheme.emoji}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 backdrop-blur-xl z-30 safe-area-bottom"
        style={{ ...st.bottomBar, borderTop: st.borderMain }}>
        <div className="flex justify-around items-center px-2 py-2.5">
          {([
            { id: "recarga" as Section, icon: Smartphone, label: seasonalEmojis.recarga ? `${seasonalEmojis.recarga}` : "Recarga", defaultLabel: "Recarga" },
            { id: "deposito" as Section, icon: Plus, label: seasonalEmojis.deposito ? `${seasonalEmojis.deposito}` : "Saldo", defaultLabel: "Saldo" },
            { id: "chat" as Section, icon: MessageCircle, label: seasonalEmojis.chat ? `${seasonalEmojis.chat}` : "Chat", defaultLabel: "Chat" },
            { id: "historico" as Section, icon: Clock, label: seasonalEmojis.historico ? `${seasonalEmojis.historico}` : "Pedidos", defaultLabel: "Pedidos" },
            { id: "conta" as Section, icon: User, label: seasonalEmojis.conta ? `${seasonalEmojis.conta}` : "Conta", defaultLabel: "Conta" },
          ]).map((item) => {
            const isActive = section === item.id;
            // Unique animation per icon
            const iconAnimations: Record<string, any> = {
              recarga: { rotate: [0, -15, 15, -10, 0], scale: [1, 1.15, 1], transition: { duration: 0.5, ease: "easeInOut" } },
              deposito: { scale: [1, 1.3, 1], rotate: [0, 90, 180, 270, 360], transition: { duration: 0.6, ease: "easeInOut" } },
              chat: { scale: [1, 1.2, 1], y: [0, -4, 0], transition: { duration: 0.4, ease: "easeOut" } },
              historico: { rotate: [0, 360], transition: { duration: 0.8, ease: "easeInOut" } },
              extrato: { y: [0, -6, 0], scale: [1, 1.1, 1], transition: { duration: 0.4, ease: "easeOut" } },
              conta: { scale: [1, 1.2, 0.9, 1.1, 1], transition: { duration: 0.5, type: "spring" } },
            };
            const continuousAnimations: Record<string, any> = {
              recarga: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } },
              deposito: { rotate: [0, 8, -8, 0], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } },
              chat: { y: [0, -2, 0], scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
              historico: { rotate: [0, 360], transition: { repeat: Infinity, duration: 4, ease: "linear" } },
              extrato: { y: [0, -2, 0, 2, 0], transition: { repeat: Infinity, duration: 2.2, ease: "easeInOut" } },
              conta: { scale: [1, 1.08, 1], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
            };
            const iconAnimation = isActive ? (iconAnimations[item.id] || {}) : {};
            const continuousAnim = continuousAnimations[item.id] || {};

            return (
              <button key={item.id} onClick={() => { setSection(item.id); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition min-w-[60px]"
                style={{ color: isActive ? "var(--tg-accent)" : "var(--tg-hint)" }}>
                <motion.div
                  animate={{ ...iconAnimation, ...continuousAnim } as any}
                  whileTap={{ scale: 0.8 }}
                >
                  <item.icon className="w-6 h-6" />
                </motion.div>
                <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="w-1.5 h-1.5 rounded-full mt-0.5"
                    style={{ backgroundColor: "var(--tg-accent)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
