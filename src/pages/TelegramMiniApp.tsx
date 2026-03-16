import { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatedCounter, AnimatedInt } from "@/components/AnimatedCounter";
import AnimatedCheck from "@/components/AnimatedCheck";
import { supabase } from "@/integrations/supabase/client";
import { createPixDeposit, type PixResult } from "@/lib/payment";
import { applyCurrencyMask } from "@/lib/currencyMask";
import { useFeePreview } from "@/hooks/useFeePreview";
import { motion, AnimatePresence } from "framer-motion";
import recargasLogo from "@/assets/recargas-brasil-logo.jpeg";
import { QRCodeSVG } from "qrcode.react";
import {
  Smartphone, DollarSign, Clock, Landmark, User,
  ChevronRight, RefreshCw, Copy, Check,
  ArrowLeft, Shield, LogOut, Camera, Loader2,
  Share2, FileText, MapPin, Hash, Wallet, Phone, Zap,
  AlertTriangle, CheckCircle2, XCircle, MessageCircle,
  MoreHorizontal, X, Settings, Search, Filter, Save, Pencil, ArrowRightLeft
} from "lucide-react";
import { ChatPage } from "@/components/chat/ChatPage";
import { AtualizacoesSection } from "@/components/AtualizacoesSection";
import { TopRankingPodium } from "@/components/TopRankingPodium";
import { ScratchCard } from "@/components/ScratchCard";
import { Ticket } from "lucide-react";
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
        onEvent?: (eventType: string, cb: () => void) => void;
        offEvent?: (eventType: string, cb: () => void) => void;
        BackButton?: { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
        MainButton?: { show: () => void; hide: () => void; setText: (t: string) => void; onClick: (cb: () => void) => void };
        HapticFeedback?: { impactOccurred: (s: string) => void; notificationOccurred: (s: string) => void };
      };
    };
  }
}

// Premium Dark Green theme — matches the website's design system
const TG_DARK_DEFAULTS = {
  bg_color: "#070d0b",         // hsl(160 30% 4%)
  text_color: "#e3ede8",       // hsl(150 15% 92%)
  hint_color: "#708c82",       // hsl(150 8% 50%)
  link_color: "#22c55e",       // hsl(152 72% 46%)
  button_color: "#22c55e",     // primary green
  button_text_color: "#070d0b",// dark on green button
  secondary_bg_color: "#0f1a16",// hsl(160 25% 8%)
  section_bg_color: "#070d0b",
  accent_text_color: "#22c55e",
  destructive_text_color: "#ef4444",
  header_bg_color: "#0f1a16",
  subtitle_text_color: "#708c82",
  section_header_text_color: "#22c55e",
  bottom_bar_bg_color: "#070d0b",
} as const;

const TG_LIGHT_DEFAULTS = {
  bg_color: "#f0f5f2",         // hsl(160 10% 96%)
  text_color: "#0a1a12",       // hsl(160 30% 8%)
  hint_color: "#6b7f75",       // hsl(160 8% 45%)
  link_color: "#1a9a4a",       // hsl(152 70% 38%)
  button_color: "#1a9a4a",
  button_text_color: "#ffffff",
  secondary_bg_color: "#e6ece9",// hsl(160 12% 92%)
  section_bg_color: "#f0f5f2",
  accent_text_color: "#1a9a4a",
  destructive_text_color: "#ef4444",
  header_bg_color: "#e6ece9",
  subtitle_text_color: "#6b7f75",
  section_header_text_color: "#1a9a4a",
  bottom_bar_bg_color: "#f0f5f2",
} as const;

const hexToRgb = (hex?: string) => {
  if (!hex) return null;
  const value = hex.replace("#", "").trim();
  if (![3, 6].includes(value.length)) return null;
  const normalized = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const int = Number.parseInt(normalized, 16);
  if (Number.isNaN(int)) return null;
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const isDarkTelegramPalette = (bgColor?: string, textColor?: string) => {
  const bg = hexToRgb(bgColor);
  const text = hexToRgb(textColor);
  if (!bg) return false;

  const bgLuma = (0.299 * bg.r + 0.587 * bg.g + 0.114 * bg.b) / 255;
  const textLuma = text ? (0.299 * text.r + 0.587 * text.g + 0.114 * text.b) / 255 : 1;

  return bgLuma < 0.45 && textLuma > bgLuma;
};

/** Operator timing cards for Status section — mirrors RevendedorPainel */
function StatusOperatorCards({ st }: { st: any }) {
  const [stats, setStats] = useState<{ operadora: string; avgRecent: number; minRecent: number; min24h: number; avg24h: number; pendingCount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: rpcStats } = await supabase.rpc("get_operator_stats" as any);
        const mapped = (Array.isArray(rpcStats) ? rpcStats : []).map((s: any) => ({
          operadora: s.operadora || "",
          avgRecent: Number(s.avg_recent) || 0,
          minRecent: Number(s.min_recent) || 0,
          min24h: Number(s.min_24h) || 0,
          avg24h: Number(s.avg_24h) || 0,
          pendingCount: Number(s.pending_count) || 0,
        }));
        const activeOps = ["Claro", "Tim", "Vivo"];
        activeOps.forEach(op => {
          if (!mapped.find(s => s.operadora.toLowerCase() === op.toLowerCase())) {
            mapped.push({ operadora: op, avgRecent: 0, minRecent: 0, min24h: 0, avg24h: 0, pendingCount: 0 });
          }
        });
        setStats(mapped);
      } catch { /* */ }
      setLoading(false);
    })();
  }, []);

  const fmtTime = (s: number) => {
    if (!s || s <= 0) return "—";
    const mins = Math.floor(s / 60);
    const secs = Math.round(s % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const opColors: Record<string, { gradient: string; accent: string }> = {
    CLARO: { gradient: "linear-gradient(135deg, #ef4444, #dc2626)", accent: "#ef4444" },
    TIM: { gradient: "linear-gradient(135deg, #3b82f6, #2563eb)", accent: "#3b82f6" },
    VIVO: { gradient: "linear-gradient(135deg, #a855f7, #9333ea)", accent: "#a855f7" },
  };

  const timeColor = (s: number) => s <= 120 ? "var(--tg-accent)" : s <= 300 ? "var(--tg-warning, #facc15)" : "var(--tg-destructive)";

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin" style={st.hint} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stats.map((op, i) => {
        const opName = op.operadora.toUpperCase();
        const colors = opColors[opName] || { gradient: "linear-gradient(135deg, #6b7280, #4b5563)", accent: "#6b7280" };
        const pendingIcon = op.pendingCount > 5 ? "⚠️" : "⏳";

        return (
          <motion.div key={op.operadora} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="rounded-2xl overflow-hidden" style={{ border: st.borderSub }}>
            {/* Colored header bar */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: colors.gradient }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                  <Smartphone className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-white text-sm tracking-wide">{opName}</span>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/70 uppercase font-semibold tracking-wider">Pendentes</p>
                <p className="text-lg font-black text-white">{op.pendingCount}</p>
              </div>
            </div>
            {/* Body */}
            <div className="p-3 space-y-2.5" style={st.secondaryBg}>
              {/* Avg + Min recent */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "color-mix(in srgb, var(--tg-hint, #708499) 8%, transparent)", border: st.borderSub }}>
                   <p className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--tg-destructive)" }}>Média Atual</p>
                  <p className="text-lg font-black" style={{ color: timeColor(op.avgRecent) }}>{fmtTime(op.avgRecent)}</p>
                  <p className="text-[8px]" style={st.hint}>Últimas 3</p>
                </div>
                <div className="rounded-xl p-2.5 text-center" style={{ backgroundColor: "color-mix(in srgb, var(--tg-hint, #708499) 8%, transparent)", border: st.borderSub }}>
                   <p className="text-[9px] uppercase font-bold tracking-wider" style={st.accent}>Tempo Min.</p>
                  <p className="text-lg font-black" style={{ color: timeColor(op.minRecent) }}>{fmtTime(op.minRecent)}</p>
                  <p className="text-[8px]" style={st.hint}>Últimas 3</p>
                </div>
              </div>
              {/* Processing count */}
              <div className="flex items-center justify-between rounded-xl px-3 py-2" style={{ backgroundColor: "color-mix(in srgb, var(--tg-hint, #708499) 6%, transparent)", border: st.borderSub }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{pendingIcon}</span>
                  <span className="text-xs font-bold uppercase tracking-wide" style={st.text}>Processando</span>
                </div>
                <span className="text-base font-black" style={{ color: colors.accent }}>{op.pendingCount}</span>
              </div>
              {/* Consolidated 24h */}
              <div className="pt-2" style={{ borderTop: st.borderSub }}>
                <p className="text-[9px] uppercase tracking-[0.15em] font-semibold text-center mb-1.5" style={st.hint}>Consolidado 24 Horas</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <p className="text-[9px] uppercase" style={st.hint}>Média Geral</p>
                    <p className="text-sm font-bold" style={st.text}>{fmtTime(op.avg24h)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] uppercase" style={st.hint}>Mínimo (24h)</p>
                    <p className="text-sm font-bold" style={st.text}>{fmtTime(op.min24h)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function useTelegramTheme() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const tg = window.Telegram?.WebApp;

    const applyTelegramTheme = () => {
      const liveTg = window.Telegram?.WebApp;
      const tp = liveTg?.themeParams ?? {};
      const hasTelegramColors = Boolean(tp.bg_color || tp.secondary_bg_color || tp.text_color || tp.button_color);
      const isDark = hasTelegramColors
        ? isDarkTelegramPalette(tp.bg_color, tp.text_color)
        : (liveTg?.colorScheme === "light" ? false : true); // default to dark when outside Telegram
      // Always use the website's premium theme — ignore Telegram native colors
      const theme = isDark ? TG_DARK_DEFAULTS : TG_LIGHT_DEFAULTS;

      root.classList.toggle("dark", isDark);

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
      root.style.setProperty("--tg-bottom-bar", theme.bottom_bar_bg_color);
      root.style.setProperty("--tg-warning", isDark ? "#facc15" : "#eab308");
      root.style.setProperty("--gradient-bg", `linear-gradient(160deg, ${theme.bg_color}, ${theme.secondary_bg_color}, ${theme.section_bg_color})`);

      body.style.background = theme.bg_color;
      body.style.color = theme.text_color;
    };

    applyTelegramTheme();
    tg?.onEvent?.("themeChanged", applyTelegramTheme);

    return () => {
      tg?.offEvent?.("themeChanged", applyTelegramTheme);
      body.style.background = "";
      body.style.color = "";
    };
  }, []);
}

type Section = "recarga" | "deposito" | "historico" | "extrato" | "conta" | "status" | "chat" | "raspadinha" | "atualizacoes";

import type { Recarga } from "@/types";

interface ValorItem { valueId: string; cost: number; userCost?: number; value?: number; label: string; }
interface TgOperadora { id: string; nome: string; carrierId: string; valores: ValorItem[]; }

export default function TelegramMiniApp() {
  useTelegramTheme();

  // Setup Telegram WebApp (simple expand, no fullscreen forcing)
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();

      // Set header/viewport color to match background
      if ((tg as any).setHeaderColor) {
        try { (tg as any).setHeaderColor("secondary_bg_color"); } catch {}
      }
      if ((tg as any).setBackgroundColor) {
        try { (tg as any).setBackgroundColor("bg_color"); } catch {}
      }
    }

    return () => {};
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
  const [detectingOperator, setDetectingOperator] = useState(false);
  const [detectedOperatorName, setDetectedOperatorName] = useState<string | null>(null);
  const [pendingWarning, setPendingWarning] = useState<{ phone: string; count: number } | null>(null);

  // Histórico & Extrato
  const [recargas, setRecargas] = useState<Recarga[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [viewingReceipt, setViewingReceipt] = useState<Recarga | null>(null);
  // Histórico filters (matching browser)
  const [histSearch, setHistSearch] = useState("");
  const [histStatus, setHistStatus] = useState<"all" | "completed" | "pending" | "falha">("all");
  const [histOperadora, setHistOperadora] = useState("all");

  // Depósito
  const [depositAmount, setDepositAmount] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [pixData, setPixData] = useState<PixResult | null>(null);
  const { calcFee: feeCalc } = useFeePreview();
  const [copied, setCopied] = useState(false);
  const [checkingPix, setCheckingPix] = useState(false);
  const [pixConfirmed, setPixConfirmed] = useState(false);
  const [confirmedPixAmount, setConfirmedPixAmount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [refreshingExtrato, setRefreshingExtrato] = useState(false);
  const [refreshingRecargas, setRefreshingRecargas] = useState(false);
  const [showPriceTable, setShowPriceTable] = useState(false);
  // Conta - profile editing
  const [editingName, setEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [saldoPessoal, setSaldoPessoal] = useState(0);

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

      // OPTIMIZATION 1: Show cached session IMMEDIATELY (instant render)
      const saved = loadSavedSession();
      if (saved && !cancelled) {
        applySession(saved);
        if (saved.userId) setAvatarUrl(null); // will be refreshed below
        setLoading(false); // UI renders instantly with cached data
      }

      // OPTIMIZATION 2: Start auth check & TG user detection IN PARALLEL
      const [authResult, tgUser] = await Promise.all([
        // Auth session check
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (!cancelled) setHasAuthSession(!!session?.user);
          return session?.user?.id ?? null;
        }).catch(() => { if (!cancelled) setHasAuthSession(false); return null; }),

        // TG user detection — reduced from 12×250ms to 6×150ms (max 900ms vs 3000ms)
        (async () => {
          for (let i = 0; i < 6; i++) {
            const u = getTelegramUser();
            if (u?.id) return u;
            await new Promise(r => setTimeout(r, 150));
          }
          return null;
        })(),
      ]);

      const existingSessionUserId = authResult as string | null;

      // OPTIMIZATION 3: Telegram lookup (primary path)
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

            // OPTIMIZATION 4: Auto-auth in BACKGROUND (non-blocking)
            if (!existingSessionUserId) {
              (async () => {
                try {
                  const { data: tokenData } = await supabase.functions.invoke("telegram-miniapp", {
                    body: { action: "create_session", telegram_id: tgUser.id },
                  });
                  if (tokenData?.token_hash && tokenData?.email) {
                    const { error: verifyErr } = await supabase.auth.verifyOtp({
                      token_hash: tokenData.token_hash,
                      type: "magiclink",
                    });
                    if (!verifyErr && !cancelled) {
                      console.log("[MiniApp] Auto-session created successfully");
                      setHasAuthSession(true);
                    }
                  }
                } catch (sessErr) {
                  console.warn("[MiniApp] Auto-session creation failed:", sessErr);
                }
              })();
            } else if (!cancelled) {
              setHasAuthSession(true);
            }
            return;
          }
        } catch (err) { console.error("Mini App TG lookup error:", err); }
      }

      // 2) Try existing auth user
      if (existingSessionUserId && !cancelled) {
        if (!cancelled) setHasAuthSession(true);
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

      // 3) If no cached session was applied and nothing else worked
      if (!saved && !cancelled) setLoading(false);
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
        .select("id, amount, status, type, created_at, payment_id, metadata, module")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      setTransactions(data || []);
    } catch (err) { console.error("loadTransactions error:", err); }
  }, [userId]);

  const loadSaldoPessoal = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from("saldos")
        .select("valor")
        .eq("user_id", userId)
        .eq("tipo", "pessoal")
        .maybeSingle();
      setSaldoPessoal(data?.valor || 0);
    } catch {}
  }, [userId]);

  // Load avatar on mount
  const loadAvatar = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await supabase.functions.invoke("telegram-miniapp", {
        body: { action: "lookup_by_user_id", user_id: userId },
      });
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    } catch {}
  }, [userId]);

  const handleSaveProfile = async () => {
    if (!userId || !editName.trim()) return;
    setSavingProfile(true);
    try {
      await supabase.from("profiles").update({ nome: editName.trim() } as any).eq("id", userId);
      setUserName(editName.trim());
      setEditingName(false);
      tgWebApp?.HapticFeedback?.notificationOccurred("success");
    } catch {}
    setSavingProfile(false);
  };

  const handleCheckPixStatus = async () => {
    if (!pixData?.payment_id) return;
    setCheckingPix(true);
    try {
      const { data } = await supabase.functions.invoke("check-pending-pix", { body: {} });
      // Reload transactions and saldo to check
      await Promise.all([loadTransactions(), refreshSaldo()]);
      // Check if this specific transaction was confirmed
      const { data: tx } = await supabase
        .from("transactions")
        .select("status, amount")
        .eq("payment_id", pixData.payment_id)
        .maybeSingle();
      if (tx?.status === "completed" || tx?.status === "approved") {
        setPixConfirmed(true);
        setConfirmedPixAmount(tx.amount);
        tgWebApp?.HapticFeedback?.notificationOccurred("success");
      }
    } catch {}
    setCheckingPix(false);
  };

  // Auto-poll PIX payment status
  useEffect(() => {
    if (!pixData?.payment_id || pixConfirmed) return;
    const interval = setInterval(async () => {
      try {
        const { data: tx } = await supabase
          .from("transactions")
          .select("status, amount")
          .eq("payment_id", pixData.payment_id)
          .maybeSingle();
        if (tx?.status === "completed" || tx?.status === "approved") {
          setPixConfirmed(true);
          setConfirmedPixAmount(tx.amount);
          await refreshSaldo();
          tgWebApp?.HapticFeedback?.notificationOccurred("success");
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [pixData, pixConfirmed, refreshSaldo]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 8 * 1024 * 1024) { alert("Arquivo muito grande (máx 8MB)"); return; }
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

  // OPTIMIZATION 5: Parallel data loading per section
  useEffect(() => {
    if (!userId) return;
    const loads: Promise<void>[] = [];
    if (section === "recarga") {
      loads.push(loadOperadoras(), loadRecargas(), refreshSaldo());
    } else if (section === "historico") {
      loads.push(loadRecargas());
    } else if (section === "extrato") {
      loads.push(loadTransactions());
    } else if (section === "deposito") {
      loads.push(refreshSaldo(), loadTransactions());
    } else if (section === "conta") {
      loads.push(loadAvatar(), loadSaldoPessoal(), refreshSaldo());
    }
    // Fire all in parallel
    if (loads.length) Promise.all(loads).catch(() => {});
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

  const handleRecargaConfirm = async (skipPendingCheck = false) => {
    if (!userId || !selectedOp || !selectedValor || !phone) return;
    const tel = phone.replace(/\D/g, "");
    if (tel.length < 10) return;

    // Check for pending recargas on same number (same as browser)
    if (!skipPendingCheck) {
      try {
        const { count } = await supabase
          .from("recargas")
          .select("id", { count: "exact", head: true })
          .eq("telefone", tel)
          .eq("status", "pending");
        if (count && count > 0) {
          setPendingWarning({ phone: tel, count });
          return;
        }
      } catch { /* ignore */ }
    }
    setPendingWarning(null);

    setRecargaLoading(true);
    try {
      // Pre-recheck: re-validate blacklist/cooldown right before submitting (same as browser)
      const { data: precheckResp } = await supabase.functions.invoke("recarga-express", {
        body: { action: "check-phone", phoneNumber: tel, carrierId: selectedOp.carrierId },
      });
      if (precheckResp?.success && precheckResp.data) {
        const precheckResult = {
          status: precheckResp.data.status,
          message: precheckResp.data.status === "COOLDOWN"
            ? formatCooldownMsg(precheckResp.data.message)
            : (precheckResp.data.message || ""),
        };
        setPhoneCheckResult(precheckResult);
        if (precheckResult.status === "BLACKLISTED" || precheckResult.status === "COOLDOWN") {
          tgWebApp?.HapticFeedback?.notificationOccurred("error");
          setRecargaStep("check");
          setRecargaLoading(false);
          return;
        }
      }

      const { data: result, error } = await supabase.functions.invoke("recarga-express", {
        body: { action: "recharge", carrierId: selectedOp.carrierId, phoneNumber: tel, valueId: selectedValor.valueId, saldo_tipo: "revenda" },
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
      setRecargaResult({ success: false, message: formatCooldownMsg(err.message) || "Erro ao processar recarga" });
    }
    setRecargaLoading(false);
  };

  const resetRecarga = () => { setSelectedOp(null); setSelectedValor(null); setPhone(""); setRecargaStep("phone"); setRecargaResult(null); setPhoneCheckResult(null); setDetectedOperatorName(null); setPendingWarning(null); };

  // Local fallback: detect operator by Brazilian mobile prefix
  const detectOperatorLocally = useCallback((digits: string): string | null => {
    if (digits.length !== 11) return null;
    const prefix = parseInt(digits.substring(2, 6));
    const vivoRanges = [[9611,9619],[9710,9719],[9810,9819],[9910,9919],[9960,9969],[9970,9979],[9980,9989],[9990,9999]];
    const claroRanges = [[9100,9109],[9110,9119],[9200,9209],[9210,9219],[9300,9309],[9310,9319],[9400,9409],[9410,9419],[9500,9509],[9510,9519]];
    const timRanges = [[9600,9610],[9700,9709],[9800,9809],[9900,9909],[9920,9929],[9930,9939],[9940,9949],[9950,9959]];
    for (const [min, max] of vivoRanges) if (prefix >= min && prefix <= max) return "VIVO";
    for (const [min, max] of claroRanges) if (prefix >= min && prefix <= max) return "CLARO";
    for (const [min, max] of timRanges) if (prefix >= min && prefix <= max) return "TIM";
    return null;
  }, []);




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

  // Auto-detect operator and proceed
  const handleContinueWithDetect = useCallback(async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return;

    setDetectingOperator(true);
    setDetectedOperatorName(null);
    tgWebApp?.HapticFeedback?.impactOccurred("light");

    // Load operadoras in parallel with detection
    const opsPromise = loadOperadoras();

    let matchedOp: TgOperadora | null = null;

    // Try API detection first
    try {
      const { data: resp } = await supabase.functions.invoke("recarga-express", {
        body: { action: "query-operator", phoneNumber: digits },
      });
      if (resp?.success && resp.data) {
        const opName = (resp.data.carrier?.name || resp.data.operator || "").toUpperCase().trim();
        if (opName) {
          await opsPromise;
          const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
          matchedOp = operadoras.find(o => normalize(o.nome) === normalize(opName)) || null;
          if (!matchedOp) {
            matchedOp = operadoras.find(o => normalize(o.nome).includes(normalize(opName)) || normalize(opName).includes(normalize(o.nome))) || null;
          }
        }
      }
    } catch (err: any) {
      console.warn("[MiniApp] Auto-detect operator API failed:", err.message);
    }

    // Fallback local detection
    if (!matchedOp && digits.length === 11) {
      const localName = detectOperatorLocally(digits);
      if (localName) {
        await opsPromise;
        const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        matchedOp = operadoras.find(o => normalize(o.nome) === normalize(localName)) || null;
      }
    }

    await opsPromise;
    setDetectingOperator(false);

    if (matchedOp) {
      setDetectedOperatorName(matchedOp.nome);
      setSelectedOp(matchedOp);
      setPhoneCheckResult(null);
      handleCheckPhone(matchedOp.carrierId);
      setRecargaStep("check");
      tgWebApp?.HapticFeedback?.notificationOccurred("success");
      showToast(`Operadora detectada: ${matchedOp.nome}`, "success");
    } else {
      setRecargaStep("op");
      showToast("Selecione a operadora manualmente", "info");
    }
  }, [phone, operadoras, loadOperadoras, detectOperatorLocally, handleCheckPhone, tgWebApp, showToast]);

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
    raspadinha: "Raspadinha", atualizacoes: "Atualizações",
  };

  const [moreOpen, setMoreOpen] = useState(false);

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
    green: { color: "var(--tg-accent)" } as React.CSSProperties,
    success: { color: "var(--tg-accent)" } as React.CSSProperties,
    successBg: { backgroundColor: "color-mix(in srgb, var(--tg-accent) 15%, transparent)" } as React.CSSProperties,
    warningText: { color: "var(--tg-warning, #facc15)" } as React.CSSProperties,
    warningBg: { backgroundColor: "color-mix(in srgb, var(--tg-warning, #facc15) 15%, transparent)" } as React.CSSProperties,
    dangerText: { color: "var(--tg-destructive)" } as React.CSSProperties,
    dangerBg: { backgroundColor: "color-mix(in srgb, var(--tg-destructive) 15%, transparent)" } as React.CSSProperties,
    inputBg: { backgroundColor: "color-mix(in srgb, var(--tg-text) 8%, var(--tg-bg))", color: "var(--tg-text)", border: "1px solid color-mix(in srgb, var(--tg-hint) 20%, transparent)" } as React.CSSProperties,
    overlay: { backgroundColor: "color-mix(in srgb, var(--tg-bg) 85%, transparent)" } as React.CSSProperties,
    borderSub: "1px solid color-mix(in srgb, var(--tg-hint) 18%, transparent)",
    borderMain: "1px solid color-mix(in srgb, var(--tg-accent) 15%, transparent)",
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
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl" style={{ border: "1px solid color-mix(in srgb, var(--tg-text) 10%, transparent)", boxShadow: "0 0 40px color-mix(in srgb, var(--tg-accent) 30%, transparent)" }}>
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
                  style={st.inputBg} />
              </div>
              <div>
                <label className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Senha</label>
                <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
                  style={st.inputBg} />
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
    <div className={`h-[100dvh] flex flex-col relative overflow-hidden ${isSeasonalActive && !transitioning ? "pt-8" : ""}`} style={{ ...st.bg, ...st.text }}>
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
                backgroundColor: toast.type === "success" ? "color-mix(in srgb, var(--tg-accent) 15%, transparent)" : toast.type === "error" ? "color-mix(in srgb, var(--tg-destructive) 15%, transparent)" : "color-mix(in srgb, var(--tg-link) 15%, transparent)",
                border: `1px solid ${toast.type === "success" ? "color-mix(in srgb, var(--tg-accent) 40%, transparent)" : toast.type === "error" ? "color-mix(in srgb, var(--tg-destructive) 40%, transparent)" : "color-mix(in srgb, var(--tg-link) 40%, transparent)"}`,
                color: toast.type === "success" ? "var(--tg-accent)" : toast.type === "error" ? "var(--tg-destructive)" : "var(--tg-link)",
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
              {/* Ranking no topo */}
              {userId && <TopRankingPodium userId={userId} />}
              {recargaResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="space-y-4"
                >
                  {/* Status Header */}
                  <div className="rounded-2xl p-6 text-center" style={{ ...st.secondaryBg, border: `2px solid ${recargaResult.success ? "var(--tg-accent)" : "var(--tg-destructive)"}` }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                    >
                      {recargaResult.success ? (
                        <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={st.successBg}>
                          <Check className="w-8 h-8" style={st.accent} />
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
                         <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: st.borderSub, backgroundColor: "color-mix(in srgb, var(--tg-accent) 5%, transparent)" }}>
                          <FileText className="w-4 h-4" style={st.accent} />
                          <span className="text-xs font-bold tracking-wider uppercase" style={st.accent}>Comprovante de Recarga</span>
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
                              style={{ borderColor: "color-mix(in srgb, var(--tg-text) 5%, transparent)" }}
                            >
                              <div className="flex items-center gap-2.5">
                                <row.icon className="w-4 h-4" style={{ color: "var(--tg-hint)" }} />
                                <span className="text-xs" style={{ color: "var(--tg-hint)" }}>{row.label}</span>
                              </div>
                              <span className={`text-sm font-semibold ${row.highlight ? "" : ""}`} style={{ color: row.highlight ? "var(--tg-accent)" : "var(--tg-text)" }}>
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
                    {["phone", "check", "valor", "confirm"].map((step, i) => {
                      const stepOrder = ["phone", "op", "check", "valor", "confirm"];
                      const currentIdx = stepOrder.indexOf(recargaStep);
                      const barIdx = [0, 2, 3, 4]; // map 4 bars to step indices
                      return (
                        <div key={step} className="flex-1 h-1 rounded-full"
                          style={{ backgroundColor: currentIdx >= barIdx[i] ? "var(--tg-btn)" : "color-mix(in srgb, var(--tg-hint) 25%, transparent)" }} />
                      );
                    })}
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
                      <button onClick={() => { if (phone.replace(/\D/g, "").length >= 10) handleContinueWithDetect(); }}
                        disabled={phone.replace(/\D/g, "").length < 10 || detectingOperator}
                        className="w-full rounded-xl py-3.5 font-semibold transition flex items-center justify-center gap-2 disabled:opacity-40"
                        style={st.btn}>
                        {detectingOperator ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Detectando operadora...</>
                        ) : (
                          <>Continuar <ChevronRight className="w-4 h-4" /></>
                        )}
                      </button>
                    </div>
                  )}

                  {recargaStep === "op" && (
                    <div className="space-y-3">
                      <button onClick={() => { setRecargaStep("phone"); setDetectedOperatorName(null); }} className="flex items-center gap-1 text-sm" style={st.hint}>
                        <ArrowLeft className="w-4 h-4" /> Voltar
                      </button>
                      <h2 className="text-lg font-bold" style={st.text}>Selecione a operadora</h2>
                      <p className="text-xs" style={st.hint}>Não foi possível detectar automaticamente</p>
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
                      <button onClick={() => { loadOperadoras(); setRecargaStep("op"); setPhoneCheckResult(null); }} className="flex items-center gap-1 text-sm" style={st.hint}>
                        <ArrowLeft className="w-4 h-4" /> Trocar Operadora
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
                        <div className="flex items-center justify-center gap-2 mt-1">
                          {detectedOperatorName && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)", color: "var(--tg-accent)" }}>
                              ✓ Detectada
                            </span>
                          )}
                          <p className="text-sm" style={st.hint}>{(selectedOp.nome || "").toUpperCase()} • {formatPhone(phone)}</p>
                        </div>
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
                                <CheckCircle2 className="w-12 h-12" style={st.accent} />
                              </motion.div>
                            ) : phoneCheckResult.status === "COOLDOWN" ? (
                              <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
                                <AlertTriangle className="w-12 h-12" style={st.warningText} />
                              </motion.div>
                            ) : (
                              <motion.div animate={{ scale: [1, 1.15, 1, 1.1, 1], rotate: [0, -10, 10, -5, 0], opacity: [1, 0.7, 1] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}>
                                <XCircle className="w-12 h-12" style={{ color: "var(--tg-destructive)", filter: "drop-shadow(0 0 8px color-mix(in srgb, var(--tg-destructive) 50%, transparent))" }} />
                              </motion.div>
                            )}
                            <p className="text-sm font-semibold text-center" style={{
                              color: phoneCheckResult.status === "CLEAR" ? "var(--tg-accent)" : phoneCheckResult.status === "COOLDOWN" ? "var(--tg-warning, #facc15)" : "var(--tg-destructive)"
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
                                  style={{ background: discount >= 30 ? "var(--tg-accent)" : discount >= 20 ? "var(--tg-accent)" : "var(--tg-link)" }}>
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
                                  <span className="text-sm font-bold" style={st.accent}>R$ {displayCost.toFixed(2)}</span>
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
                        <div className="flex justify-between"><span style={st.hint}>Operadora</span><span className="font-semibold" style={st.text}>{(selectedOp.nome || "").toUpperCase()}</span></div>
                        <div className="flex justify-between"><span style={st.hint}>Número</span><span className="font-mono" style={st.text}>{formatPhone(phone)}</span></div>
                        <div className="flex justify-between"><span style={st.hint}>Valor</span><span className="font-bold" style={st.green}>{formatCurrency(selectedValor.userCost ?? selectedValor.cost)}</span></div>
                        <div className="flex justify-between text-sm"><span style={st.hint}>Saldo após</span><span style={st.text}>{formatCurrency(saldo - (selectedValor.userCost ?? selectedValor.cost))}</span></div>
                      </div>
                      {/* Pending warning modal */}
                      {pendingWarning && (
                        <div className="rounded-xl p-4 space-y-3" style={{ ...st.warningBg, border: "1px solid color-mix(in srgb, var(--tg-warning, #facc15) 30%, transparent)" }}>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={st.warningText} />
                            <p className="text-sm font-semibold" style={st.warningText}>Recarga Pendente</p>
                          </div>
                          <p className="text-xs" style={st.hint}>
                            Já existe {pendingWarning.count} recarga(s) pendente(s) para este número. Deseja continuar mesmo assim?
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => handleRecargaConfirm(true)}
                              className="flex-1 rounded-xl py-2.5 font-semibold text-sm"
                              style={{ backgroundColor: "var(--tg-warning, #facc15)", color: "#000" }}>
                              Sim, continuar
                            </button>
                            <button onClick={() => setPendingWarning(null)}
                              className="flex-1 rounded-xl py-2.5 font-semibold text-sm"
                              style={{ ...st.secondaryBg, ...st.text, border: st.borderSub }}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                      {(selectedValor.userCost ?? selectedValor.cost) > saldo ? (
                        <p className="text-center text-sm" style={st.destructive}>Saldo insuficiente</p>
                      ) : !pendingWarning && (
                        <button onClick={() => handleRecargaConfirm()} disabled={recargaLoading}
                          className="w-full rounded-xl py-3.5 font-semibold transition disabled:opacity-50"
                          style={{ backgroundColor: "var(--tg-accent)", color: "var(--tg-bg)" }}>
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
                                  <span className="text-sm font-bold" style={st.text}>{(op.nome || "").toUpperCase()}</span>
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
                                            <p className="text-xs font-medium mt-0.5" style={st.accent}>Paga R$ {displayCost.toFixed(2).replace(".", ",")}</p>
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
              {/* Payment Confirmed Screen (matches browser) */}
              {pixConfirmed ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl p-6 text-center space-y-4" style={{ ...st.secondaryBg, border: st.borderSub }}>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 rounded-full mx-auto flex items-center justify-center" style={{ backgroundColor: "rgba(74,222,128,0.15)" }}>
                    <CheckCircle2 className="w-8 h-8" style={{ color: "#4ade80" }} />
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h3 className="text-lg font-bold" style={st.text}>Pagamento Confirmado!</h3>
                    <p className="text-sm" style={st.hint}>Seu depósito foi processado com sucesso</p>
                  </motion.div>
                  <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="text-3xl font-bold" style={st.green}>+{formatCurrency(confirmedPixAmount)}</motion.p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                    className="text-sm" style={st.hint}>Crédito adicionado ao seu saldo</motion.p>
                  <motion.button initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    onClick={() => { setPixData(null); setDepositAmount(""); setPixConfirmed(false); setConfirmedPixAmount(0); }}
                    className="px-6 py-3 rounded-xl font-bold text-sm" style={st.btn}>
                    Fazer Novo Depósito
                  </motion.button>
                </motion.div>
              ) : pixData ? (
                <motion.div
                  className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] pb-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="text-center">
                    <motion.div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: "rgba(74,222,128,0.15)" }}
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.1 }}>
                      <Check className="w-6 h-6" style={{ color: "#4ade80" }} />
                    </motion.div>
                    <motion.h2 className="text-base font-bold" style={st.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      PIX Gerado com Sucesso!
                    </motion.h2>
                    <motion.p className="text-xs" style={st.hint} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                      Escaneie o QR Code ou copie o código abaixo
                    </motion.p>
                  </div>
                  <motion.div className="flex justify-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="bg-white rounded-xl p-2.5 relative">
                      <motion.div className="absolute inset-0 rounded-xl"
                        animate={{ boxShadow: ["0 0 0px rgba(74,222,128,0)", "0 0 16px rgba(74,222,128,0.25)", "0 0 0px rgba(74,222,128,0)"] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
                      <QRCodeSVG value={pixData.qr_code || ""} size={160} />
                    </div>
                  </motion.div>
                  <motion.p className="text-center text-xl font-bold" style={st.green}
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.4 }}>
                    {formatCurrency(pixData.amount)}
                  </motion.p>
                  {pixData.fee_amount && pixData.fee_amount > 0 ? (
                    <motion.div className="text-center space-y-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      <p className="text-xs" style={st.hint}>
                        Taxa: <span className="font-mono" style={{ color: "var(--tg-destructive, #ec3942)" }}>-{formatCurrency(pixData.fee_amount)}</span>
                        {pixData.fee_type === "percentual" && pixData.fee_value ? ` (${pixData.fee_value}%)` : ""}
                      </p>
                      <p className="text-sm font-semibold" style={st.text}>
                        Você receberá: <span style={st.green}>{formatCurrency(pixData.net_amount ?? pixData.amount)}</span>
                      </p>
                    </motion.div>
                  ) : null}
                  {pixData.qr_code && (
                    <motion.div className="space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                      <motion.button onClick={copyPix}
                        className="w-full rounded-xl py-3 font-semibold transition flex items-center justify-center gap-2"
                        style={st.btn} whileTap={{ scale: 0.95 }}
                        animate={copied ? { backgroundColor: "rgba(74,222,128,0.2)" } : {}}>
                        {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar código PIX</>}
                      </motion.button>
                    </motion.div>
                  )}
                  {/* Auto-polling indicator (matches browser) */}
                  <div className="flex items-center justify-center gap-2 py-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                      <RefreshCw className="w-3.5 h-3.5" style={st.hint} />
                    </motion.div>
                    <p className="text-xs" style={st.hint}>Verificando pagamento automaticamente...</p>
                  </div>
                  {/* Actions (matches browser) */}
                  <div className="flex gap-2">
                    <button onClick={handleCheckPixStatus} disabled={checkingPix}
                      className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
                      style={{ backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>
                      {checkingPix ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Verificar Agora
                    </button>
                    <button onClick={() => { setPixData(null); setDepositAmount(""); setPixConfirmed(false); }}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium transition"
                      style={{ ...st.secondaryBg, border: st.borderSub, ...st.hint }}>
                      Novo PIX
                    </button>
                  </div>
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
                      <button key={v} onClick={() => setDepositAmount(v.toFixed(2).replace(".", ","))}
                        className="rounded-xl py-3.5 text-center font-semibold transition"
                        style={{
                          ...(depositAmount === v.toFixed(2).replace(".", ",") ? { backgroundColor: "color-mix(in srgb, var(--tg-btn) 15%, transparent)", color: "var(--tg-link)" } : { ...st.secondaryBg, ...st.text }),
                          border: depositAmount === v.toFixed(2).replace(".", ",") ? "1px solid var(--tg-btn)" : st.borderSub,
                        }}>
                        R$ {v.toFixed(2).replace(".", ",")}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span style={st.hint}>R$</span>
                      <input type="text" inputMode="numeric" value={depositAmount} onChange={(e) => setDepositAmount(applyCurrencyMask(e.target.value))}
                        placeholder="Outro valor (mín. R$ 10)" className="flex-1 rounded-xl p-3 focus:outline-none"
                        style={{ ...st.secondaryBg, ...st.text, border: st.borderSub }} />
                    </div>
                    {depositAmount && parseFloat(depositAmount.replace(",", ".")) > 0 && parseFloat(depositAmount.replace(",", ".")) < 10 && (
                      <p className="text-xs" style={{ color: "var(--tg-destructive, #ec3942)" }}>Valor mínimo: R$ 10,00</p>
                    )}
                  </div>
                  {(() => {
                    const val = parseFloat((depositAmount || "0").replace(",", "."));
                    const preview = feeCalc(val);
                    if (preview.hasFee && val >= 10) {
                      return (
                        <div className="rounded-xl px-4 py-3 space-y-1" style={{ ...st.secondaryBg, border: st.borderSub }}>
                          <div className="flex justify-between text-xs" style={st.hint}>
                            <span>Valor do depósito</span>
                            <span className="font-mono">{formatCurrency(val)}</span>
                          </div>
                          <div className="flex justify-between text-xs" style={st.hint}>
                            <span>Taxa ({preview.feeLabel})</span>
                            <span className="font-mono" style={{ color: "var(--tg-destructive, #ec3942)" }}>-{formatCurrency(preview.feeAmount)}</span>
                          </div>
                          <div className="pt-1 flex justify-between text-sm font-semibold" style={{ ...st.text, borderTop: st.borderSub }}>
                            <span>Você receberá</span>
                            <span className="font-mono" style={st.green}>{formatCurrency(preview.netAmount)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <motion.button
                    onClick={handleDeposit}
                    disabled={depositLoading || !depositAmount || parseFloat((depositAmount || "0").replace(",", ".")) < 10}
                    className="w-full rounded-2xl py-4 font-bold text-base transition disabled:opacity-40 flex items-center justify-center gap-3 relative overflow-hidden"
                    style={{ backgroundColor: "#4ade80", color: "#000" }}
                    whileTap={{ scale: 0.97 }}
                    animate={{ boxShadow: ["0 0 0px rgba(74,222,128,0.3)", "0 0 20px rgba(74,222,128,0.5)", "0 0 0px rgba(74,222,128,0.3)"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                      <Landmark className="w-5 h-5" />
                    </motion.div>
                    {depositLoading ? "Gerando PIX..." : "💰 Gerar PIX Agora"}
                    <motion.div className="absolute right-4" animate={{ x: [0, 4, 0] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}>
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>
                  </motion.button>

                  {/* Últimos depósitos (matches browser) */}
                  {(() => {
                    const DEPOSIT_EXPIRY_MS = 30 * 60 * 1000;
                    const depositTxs = transactions.filter(t => t.type === "deposit").map(t => {
                      if (t.status === "pending" && (Date.now() - new Date(t.created_at).getTime()) > DEPOSIT_EXPIRY_MS) {
                        return { ...t, status: "expired" };
                      }
                      return t;
                    });
                    if (depositTxs.length === 0) return null;
                    return (
                      <div className="rounded-2xl overflow-hidden" style={{ ...st.secondaryBg, border: st.borderSub }}>
                        <div className="px-4 py-3" style={{ borderBottom: st.borderSub }}>
                          <h3 className="font-bold text-sm" style={st.text}>Últimos Depósitos</h3>
                        </div>
                        {depositTxs.slice(0, 5).map((t: any) => (
                          <div key={t.id} className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: st.borderSub }}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: t.status === "completed" ? "rgba(74,222,128,0.15)" : t.status === "expired" ? "rgba(239,68,68,0.15)" : "rgba(250,204,21,0.15)" }}>
                                {t.status === "completed" ? <Check className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
                                  : t.status === "expired" ? <XCircle className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                                  : <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#facc15" }} />}
                              </div>
                              <div>
                                <p className="text-sm font-medium" style={st.text}>Depósito PIX</p>
                                <p className="text-[10px]" style={st.hint}>{formatDateTimeBR(t.created_at)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold" style={{ color: t.status === "completed" ? "#4ade80" : t.status === "expired" ? "#ef4444" : "#facc15" }}>+{formatCurrency(t.amount)}</p>
                              <span className="text-[9px] font-semibold uppercase tracking-wide"
                                style={{ color: t.status === "completed" ? "#4ade80" : t.status === "expired" ? "#ef4444" : "#facc15" }}>
                                {t.status === "completed" ? "✓ Confirmado" : t.status === "expired" ? "✕ Expirado" : "⏳ Processando"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Histórico ── */}
          {section === "historico" && (
            <motion.div key="historico" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-2">
              {/* Filters (matches browser) */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={st.hint} />
                  <input type="text" placeholder="Buscar por telefone..." value={histSearch} onChange={e => setHistSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ ...st.secondaryBg, ...st.text, border: st.borderSub }} />
                </div>
                <div className="flex gap-2">
                  <select value={histStatus} onChange={e => setHistStatus(e.target.value as any)}
                    className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={{ ...st.secondaryBg, ...st.text, border: st.borderSub }}>
                    <option value="all">Todos os status</option>
                    <option value="completed">Concluída</option>
                    <option value="pending">Processando</option>
                    <option value="falha">Falha</option>
                  </select>
                  <select value={histOperadora} onChange={e => setHistOperadora(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none"
                    style={{ ...st.secondaryBg, ...st.text, border: st.borderSub }}>
                    <option value="all">Todas operadoras</option>
                    {Array.from(new Set(recargas.map(r => r.operadora).filter(Boolean) as string[])).map(op => (
                      <option key={op} value={op}>{op.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Receipt Detail View */}
              <AnimatePresence>
                {viewingReceipt && (
                  <>
                    <motion.div className="fixed inset-0 z-[100]" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingReceipt(null)} />
                    <motion.div className="fixed inset-x-4 top-[15%] z-[101] rounded-2xl p-5 space-y-4 max-h-[75vh] overflow-y-auto"
                      style={{ ...st.secondaryBg, border: `2px solid ${viewingReceipt.status === "completed" ? "#4ade80" : "#facc15"}` }}
                      initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}>
                      <div className="text-center">
                        <div className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: viewingReceipt.status === "completed" ? "rgba(74,222,128,0.15)" : viewingReceipt.status === "pending" ? "rgba(250,204,21,0.15)" : "rgba(239,68,68,0.15)" }}>
                          {viewingReceipt.status === "completed" ? <Check className="w-7 h-7" style={{ color: "#4ade80" }} />
                            : viewingReceipt.status === "pending" ? <Clock className="w-7 h-7" style={{ color: "#facc15" }} />
                            : <XCircle className="w-7 h-7" style={{ color: "#ef4444" }} />}
                        </div>
                        <p className="font-bold text-lg" style={st.text}>
                          {viewingReceipt.status === "completed" ? "Recarga Concluída" : viewingReceipt.status === "pending" ? "Processando..." : "Falha na Recarga"}
                        </p>
                      </div>
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
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={async () => {
                            const text = `✅ Comprovante de Recarga\n\n📱 Telefone: ${formatPhone(viewingReceipt.telefone)}\n📡 Operadora: ${(viewingReceipt.operadora || "—").toUpperCase()}\n💰 Valor: ${formatCurrency(viewingReceipt.valor)}\n🆔 Pedido: ${viewingReceipt.external_id || viewingReceipt.id.slice(0, 8)}\n🕐 Data: ${formatFullDateTimeBR(viewingReceipt.created_at)}\n\nRecarga realizada com sucesso!`;
                            try { if (navigator.share) await navigator.share({ title: "Comprovante de Recarga", text }); else { await navigator.clipboard.writeText(text); tgWebApp?.HapticFeedback?.notificationOccurred("success"); } } catch {}
                          }}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ backgroundColor: "var(--tg-btn)", color: "var(--tg-btn-text)" }}>
                          <Share2 className="w-4 h-4" /> Enviar
                        </button>
                        <button onClick={() => setViewingReceipt(null)}
                          className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
                          style={{ ...st.bg, border: st.borderSub, color: "var(--tg-text)" }}>
                          Fechar
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {(() => {
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

                if (histSearch || histStatus !== "all" || histOperadora !== "all") {
                  return (
                    <>
                      <div className="flex items-center gap-2 text-xs py-1" style={st.hint}>
                        <Filter className="w-3.5 h-3.5" />
                        <span>{filtered.length} de {recargas.length} resultados</span>
                        <button onClick={() => { setHistSearch(""); setHistStatus("all"); setHistOperadora("all"); }}
                          className="ml-auto text-xs font-semibold" style={st.accent}>Limpar filtros</button>
                      </div>
                      {filtered.length === 0 ? (
                        <p className="text-center py-8 text-sm" style={st.hint}>Nenhuma recarga encontrada</p>
                      ) : renderRecargaList(filtered)}
                    </>
                  );
                }

                return filtered.length === 0 ? (
                  <p className="text-center py-12 text-sm" style={st.hint}>Nenhuma recarga encontrada</p>
                ) : renderRecargaList(filtered);

                function renderRecargaList(list: Recarga[]) {
                  let lastDate = "";
                  return list.map((r) => {
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
                        <button onClick={() => { setViewingReceipt(r); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                          className="w-full rounded-xl p-3 flex items-center justify-between text-left active:scale-[0.98] transition-transform"
                          style={{ ...st.secondaryBg, border: st.borderSub }}>
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
                }
              })()}
              <button onClick={async () => { setRefreshingRecargas(true); await loadRecargas(); setRefreshingRecargas(false); }} className="w-full text-center text-sm transition py-2 flex items-center justify-center gap-1" style={st.hint}>
                <RefreshCw className={`w-3.5 h-3.5 ${refreshingRecargas ? "animate-spin" : ""}`} /> Atualizar
              </button>
            </motion.div>
          )}

          {/* ── Extrato ── */}
          {section === "extrato" && (
            <motion.div key="extrato" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-2">
              {(() => {
                const DEPOSIT_EXPIRY_MS = 30 * 60 * 1000;
                const enriched = transactions.map(t => {
                  if (t.type === "deposit" && t.status === "pending" && (Date.now() - new Date(t.created_at).getTime()) > DEPOSIT_EXPIRY_MS) {
                    return { ...t, status: "expired" };
                  }
                  return t;
                });
                if (enriched.length === 0) {
                  return <p className="text-center py-12 text-sm" style={st.hint}>Nenhuma transação encontrada</p>;
                }
                let lastDate = "";
                return enriched.map((t: any) => {
                  const dateLabel = formatDateLongUpperBR(t.created_at);
                  const showSep = dateLabel !== lastDate;
                  lastDate = dateLabel;
                  const isPending = t.status === "pending";
                  const isExpired = t.status === "expired";
                  const isCompleted = t.status === "approved" || t.status === "completed";
                  const hasQr = isPending && t.metadata?.qr_code && t.metadata.qr_code !== "yes" && t.metadata.qr_code !== "no";
                  const isDeposit = t.type === "deposit";
                  const isSale = t.type === "sale" || t.type === "recarga";
                  const isCommission = t.type === "commission" || t.type === "referral";
                  const isWithdraw = t.type === "withdraw" || t.type === "saque";
                  const txLabel = isDeposit ? "Depósito PIX" : isSale ? "Venda" : isCommission ? "Comissão" : isWithdraw ? "Saque" : t.type;
                  const txIcon = isDeposit ? Landmark : isSale ? Smartphone : isCommission ? ArrowRightLeft : Wallet;
                  const TxIcon = txIcon;
                  const amountPrefix = isDeposit || isCommission ? "+" : isSale || isWithdraw ? "-" : "";
                  const amountColor = isExpired ? "#ef4444" : isCompleted ? "#4ade80" : isPending ? "#facc15" : "var(--tg-text)";
                  // Subtitle from metadata
                  const subtitle = t.metadata?.operadora ? `${(t.metadata.operadora as string).toUpperCase()} • ${formatCurrency(t.metadata?.valor_recarga || t.amount)}` : null;

                  return (
                    <div key={t.id}>
                      {showSep && (
                        <div className="flex justify-center my-2">
                          <span className="text-[10px] px-3 py-0.5 rounded-full font-medium" style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "var(--tg-hint)" }}>{dateLabel}</span>
                        </div>
                      )}
                      <button className="w-full rounded-xl p-3 flex items-center justify-between text-left"
                        style={{ ...st.secondaryBg, border: st.borderSub }}
                        onClick={() => {
                          if (hasQr) {
                            setPixData({ gateway: t.metadata?.gateway || "", payment_id: t.payment_id || "", qr_code: t.metadata.qr_code, qr_code_base64: null, payment_link: null, amount: t.amount, status: "pending" });
                            setSection("deposito");
                            tgWebApp?.HapticFeedback?.impactOccurred("light");
                          }
                        }}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: isExpired ? "rgba(239,68,68,0.1)" : isDeposit ? "rgba(74,222,128,0.1)" : isSale ? "rgba(59,130,246,0.1)" : isCommission ? "rgba(250,204,21,0.1)" : "rgba(255,255,255,0.06)" }}>
                            <TxIcon className="w-4 h-4" style={{ color: isExpired ? "#ef4444" : isDeposit ? "#4ade80" : isSale ? "#3b82f6" : isCommission ? "#facc15" : "var(--tg-hint)" }} />
                          </div>
                          <div>
                            <p className="font-semibold text-sm" style={st.text}>{txLabel}</p>
                            {subtitle ? <p className="text-[10px]" style={st.hint}>{subtitle}</p> : <p className="text-xs" style={st.hint}>{formatTimeBR(t.created_at)}</p>}
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-sm" style={{ color: amountColor }}>{amountPrefix}{formatCurrency(t.amount)}</p>
                            <p className="text-[10px]" style={{ color: amountColor }}>
                              {isCompleted ? "✅ Confirmado" : isPending ? "⏳ Processando" : isExpired ? "✕ Expirado" : "❌ Falha"}
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
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                        className="flex-1 rounded-lg px-2.5 py-1.5 text-sm font-bold focus:outline-none"
                        style={{ ...st.bg, ...st.text, border: st.borderSub }} autoFocus />
                      <button onClick={handleSaveProfile} disabled={savingProfile}
                        className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(74,222,128,0.15)" }}>
                        {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" style={st.green} /> : <Save className="w-4 h-4" style={st.green} />}
                      </button>
                      <button onClick={() => setEditingName(false)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(239,68,68,0.15)" }}>
                        <X className="w-4 h-4" style={st.destructive} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-bold truncate" style={st.text}>{userName}</p>
                      <button onClick={() => { setEditName(userName); setEditingName(true); }}
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                        <Pencil className="w-3 h-3" style={st.hint} />
                      </button>
                    </div>
                  )}
                  <p className="text-sm truncate" style={st.hint}>{userEmail}</p>
                  <p className="text-xs mt-1" style={st.hint}>Toque na foto para alterar</p>
                </div>
              </motion.div>

              {/* Telegram Vinculado */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: "spring", damping: 20 }}
                className="rounded-2xl p-4 flex items-center gap-3 overflow-hidden relative"
                style={{ ...st.secondaryBg, border: "1px solid rgba(34,197,94,0.3)" }}>
                <motion.div className="absolute inset-0 opacity-10"
                  style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.3) 0%, transparent 60%)" }}
                  animate={{ opacity: [0.05, 0.15, 0.05] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(34,197,94,0.15)" }}>
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.4-.27-2.09-.49-.84-.27-1.51-.42-1.45-.88.03-.24.37-.49 1.02-.74 4-1.73 6.67-2.88 8.02-3.44 3.82-1.6 4.62-1.87 5.13-1.88.11 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .41z" fill="rgb(34,197,94)"/>
                  </svg>
                </motion.div>
                <div className="flex-1 relative z-10">
                  <p className="font-semibold text-sm" style={{ color: "rgb(34,197,94)" }}>Telegram Vinculado</p>
                  <p className="text-xs" style={st.hint}>Conta conectada com sucesso</p>
                </div>
                <AnimatedCheck size={22} className="text-success" />
              </motion.div>

              {/* Saldos (matches browser dual wallet) */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, type: "spring", damping: 20 }}
                className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl p-4" style={{ ...st.secondaryBg, border: st.borderSub }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={st.hint}>Saldo de Revenda</p>
                  <p className="text-xl font-bold" style={st.green}>{formatCurrency(saldo)}</p>
                </div>
                <div className="rounded-2xl p-4" style={{ ...st.secondaryBg, border: st.borderSub }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={st.hint}>Comissões</p>
                  <p className="text-xl font-bold" style={st.accent}>{formatCurrency(saldoPessoal)}</p>
                </div>
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
            <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-lg font-bold" style={st.text}>Status do Sistema</h2>
                <p className="text-xs" style={st.hint}>Tempo médio de processamento das recargas por operadora.</p>
              </div>

              {/* Service Status */}
              <div className="space-y-2">
                {[
                  { name: "API de Recargas" },
                  { name: "Gateway de Pagamento" },
                  { name: "Bot do Telegram" },
                ].map((item) => (
                  <div key={item.name} className="rounded-xl p-3.5 flex items-center justify-between" style={{ ...st.secondaryBg, border: st.borderSub }}>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4" style={st.hint} />
                      <span className="text-sm font-medium" style={st.text}>{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#4ade80" }} />
                      <span className="text-xs" style={st.green}>Online</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Operator timing cards */}
              <StatusOperatorCards st={st} />

              {/* Important observations */}
              <div className="rounded-xl p-4 space-y-3" style={{ ...st.secondaryBg, border: st.borderSub }}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "color-mix(in srgb, var(--tg-accent, #6ab2f2) 15%, transparent)" }}>
                    <AlertTriangle className="h-4 w-4" style={st.accent} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold mb-1" style={st.text}>Observações Importantes</p>
                    <p className="text-xs leading-relaxed" style={st.hint}>
                      O tempo de processamento e o volume em andamento são indicadores em tempo real para auxiliar sua operação. <span style={{ ...st.text, fontWeight: 600 }}>Todas as informações acima são estimativas baseadas em tráfego recente; o prazo formal das operadoras para a conclusão de recargas permanece de até 24 horas.</span>
                    </p>
                  </div>
                </div>
                <div className="text-center pt-2" style={{ borderTop: st.borderSub }}>
                  <p className="text-[9px] uppercase tracking-[0.2em] font-semibold" style={st.hint}>Última Atualização</p>
                  <p className="text-sm font-bold mt-0.5" style={st.text}>{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
                </div>
              </div>
            </motion.div>
          )}
          {/* ── Atualizações ── */}
          {section === "atualizacoes" && (
            <motion.div key="atualizacoes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
              <AtualizacoesSection />
            </motion.div>
          )}
          {/* ── Raspadinha ── */}
          {section === "raspadinha" && userId && (
            <motion.div key="raspadinha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
              <ScratchCard userId={userId} noAuthMode={!hasAuthSession} />
            </motion.div>
          )}
          {section === "raspadinha" && !userId && (
            <motion.div key="raspadinha-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
              <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--tg-secondary-bg, #232e3c)" }}>
                  <Ticket className="w-8 h-8" style={{ color: "var(--tg-accent, #6ab2f2)" }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: "var(--tg-text, #f5f5f5)" }}>Login Necessário</h3>
                <p className="text-sm max-w-xs" style={{ color: "var(--tg-hint, #708499)" }}>
                  Para usar a Raspadinha, faça login com sua conta na aba <strong>Conta</strong>.
                </p>
                <button
                  onClick={() => setSection("conta")}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ background: "var(--tg-btn, #5288c1)", color: "var(--tg-btn-text, #fff)" }}
                >
                  Ir para Conta
                </button>
              </div>
            </motion.div>
          )}
          {/* ── Chat ── */}
          {section === "chat" && userId && hasAuthSession && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tg-chat-theme" style={{ height: "calc(100dvh - 120px)" }}>
              <ChatPage onBack={() => setSection("recarga")} forceMobile />
            </motion.div>
          )}
          {section === "chat" && userId && !hasAuthSession && (
            <motion.div key="chat-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 flex flex-col items-center justify-center text-center" style={{ minHeight: "50vh" }}>
              <Loader2 className="w-10 h-10 animate-spin mb-4" style={st.hint} />
              <p className="text-sm" style={st.hint}>Conectando ao chat...</p>
            </motion.div>
          )}
          {section === "chat" && !userId && (
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
        <div className="flex justify-around items-end px-2 pt-2 pb-2.5 relative">
          {([
            { id: "recarga" as Section, icon: Smartphone, label: seasonalEmojis.recarga ? `${seasonalEmojis.recarga}` : "Recarga", defaultLabel: "Recarga" },
            { id: "raspadinha" as Section, icon: Ticket, label: "Raspadinha", defaultLabel: "Raspadinha" },
            { id: "deposito" as Section, icon: DollarSign, label: seasonalEmojis.deposito ? `${seasonalEmojis.deposito}` : "Saldo", defaultLabel: "Saldo", isFab: true },
            { id: "historico" as Section, icon: Clock, label: seasonalEmojis.historico ? `${seasonalEmojis.historico}` : "Pedidos", defaultLabel: "Pedidos" },
          ]).map((item) => {
            const isActive = section === item.id;
            const isFab = (item as any).isFab;
            const iconAnimations: Record<string, any> = {
              recarga: { rotate: [0, -15, 15, -10, 0], scale: [1, 1.15, 1], transition: { duration: 0.5, ease: "easeInOut" } },
              deposito: { scale: [1, 1.3, 1], rotate: [0, 90, 180, 270, 360], transition: { duration: 0.6, ease: "easeInOut" } },
              raspadinha: { rotate: [0, -10, 10, -5, 0], scale: [1, 1.2, 1], transition: { duration: 0.5, ease: "easeInOut" } },
              historico: { rotate: [0, 360], transition: { duration: 0.8, ease: "easeInOut" } },
            };
            const continuousAnimations: Record<string, any> = {
              recarga: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } },
              deposito: { rotate: [0, 8, -8, 0], transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } },
              raspadinha: { rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } },
              historico: { rotate: [0, 360], transition: { repeat: Infinity, duration: 4, ease: "linear" } },
            };
            const iconAnimation = isActive ? (iconAnimations[item.id] || {}) : {};
            const continuousAnim = continuousAnimations[item.id] || {};

            if (isFab) {
              return (
                <motion.button key={item.id} onClick={() => { setSection(item.id); tgWebApp?.HapticFeedback?.impactOccurred("medium"); }}
                  className="flex flex-col items-center justify-center -mt-7 relative z-10"
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    {/* Snake border animation - outer ring */}
                    <svg className="absolute inset-0 w-14 h-14" viewBox="0 0 56 56" style={{ animation: "spin 3s linear infinite" }}>
                      <circle
                        cx="28" cy="28" r="25" fill="none"
                        stroke="var(--tg-accent)"
                        strokeWidth="2.5"
                        strokeDasharray="40 118"
                        strokeLinecap="round"
                        opacity={isActive ? 0.8 : 0.4}
                      />
                    </svg>
                    {/* Snake border animation - inner ring (reverse) */}
                    <svg className="absolute inset-0 w-14 h-14" viewBox="0 0 56 56" style={{ animation: "spin 3s linear infinite reverse" }}>
                      <circle
                        cx="28" cy="28" r="25" fill="none"
                        stroke="var(--tg-accent)"
                        strokeWidth="1.5"
                        strokeDasharray="25 133"
                        strokeLinecap="round"
                        opacity={isActive ? 0.5 : 0.2}
                      />
                    </svg>
                    {/* Glowing FAB circle */}
                    <motion.div
                      className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{
                        background: "var(--tg-accent)",
                        boxShadow: isActive
                          ? "0 4px 14px rgba(34,197,94,0.4), 0 0 20px rgba(34,197,94,0.2)"
                          : "0 4px 14px rgba(34,197,94,0.3)",
                        ...(isActive ? { outline: "2px solid rgba(34,197,94,0.3)", outlineOffset: "2px" } : {}),
                      }}
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          "0 4px 14px rgba(34,197,94,0.3)",
                          "0 6px 20px rgba(34,197,94,0.5)",
                          "0 4px 14px rgba(34,197,94,0.3)",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <item.icon className="h-5 w-5" style={{ color: "#fff" }} />
                    </motion.div>
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 leading-tight" style={{ color: isActive ? "var(--tg-accent)" : "var(--tg-hint)" }}>{item.label}</span>
                </motion.button>
              );
            }

            return (
              <button key={item.id} onClick={() => { setSection(item.id); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition min-w-[50px]"
                style={{ color: isActive ? "var(--tg-accent)" : "var(--tg-hint)" }}>
                <motion.div
                  animate={{ ...iconAnimation, ...continuousAnim } as any}
                  whileTap={{ scale: 0.8 }}
                >
                  <item.icon className="w-5 h-5" />
                </motion.div>
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--tg-accent)" }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {/* More button */}
          {(() => {
            const moreSections: Section[] = ["extrato", "conta", "chat", "status", "atualizacoes"];
            const isActiveInMore = moreSections.includes(section);
            return (
              <button onClick={() => { setMoreOpen(true); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition min-w-[50px]"
                style={{ color: isActiveInMore ? "var(--tg-accent)" : "var(--tg-hint)" }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  whileTap={{ scale: 0.8 }}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </motion.div>
                <span className="text-[10px] font-medium leading-tight">Mais</span>
                {isActiveInMore && (
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: "var(--tg-accent)" }}
                  />
                )}
              </button>
            );
          })()}
        </div>
      </div>

      {/* More Bottom Sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[60]"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              onClick={() => setMoreOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-[61] rounded-t-2xl shadow-2xl safe-area-bottom"
              style={{ backgroundColor: "var(--tg-bg)", borderTop: st.borderMain }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-9 h-1 rounded-full" style={{ backgroundColor: "var(--tg-hint)", opacity: 0.3 }} />
              </div>

              <div className="flex items-center justify-between px-5 pb-3">
                <h2 className="text-base font-bold" style={st.text}>Menu</h2>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--tg-destructive)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* User info */}
              {userName && (
                <div className="mx-4 mb-3 p-3 rounded-xl" style={{ backgroundColor: "var(--tg-secondary-bg)" }}>
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-full object-cover shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: "rgba(82,136,193,0.15)", color: "var(--tg-accent)" }}>
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={st.text}>{userName}</p>
                      <p className="text-[11px]" style={st.hint}>Revendedor</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                {([
                  { id: "chat" as Section, icon: MessageCircle, label: "Bate-papo", color: "var(--tg-accent)" },
                  { id: "extrato" as Section, icon: Landmark, label: "Carteira", color: "#4ade80" },
                  { id: "conta" as Section, icon: Settings, label: "Conta", color: "var(--tg-accent)" },
                  { id: "status" as Section, icon: Shield, label: "Status", color: "#facc15" },
                  { id: "atualizacoes" as Section, icon: RefreshCw, label: "Novidades", color: "#a3e635" },
                ]).map((item, index) => {
                  const isActive = section === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => { setSection(item.id); setMoreOpen(false); tgWebApp?.HapticFeedback?.impactOccurred("light"); }}
                      className="flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-colors"
                      style={{
                        backgroundColor: isActive ? "rgba(82,136,193,0.15)" : "var(--tg-secondary-bg)",
                        color: isActive ? "var(--tg-accent)" : "var(--tg-text)",
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index, type: "spring", stiffness: 300, damping: 20 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.1 * index }}
                      >
                        <item.icon className="h-5 w-5" style={{ color: isActive ? "var(--tg-accent)" : item.color }} />
                      </motion.div>
                      <span className="text-[11px] font-semibold">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {userId && (
                <div className="px-4 pb-5 pt-2">
                  <button
                    onClick={() => { handleLogout(); setMoreOpen(false); }}
                    className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                    style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "var(--tg-destructive)" }}
                  >
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
