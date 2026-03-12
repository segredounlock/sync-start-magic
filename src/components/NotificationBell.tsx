import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/NotificationBell.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/NotificationBell.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useRef = __vite__cjsImport3_react["useRef"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { Bell, X, DollarSign, Smartphone, UserPlus, Bot, CheckCheck, Trash2 } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { useNotifications } from "/src/hooks/useNotifications.ts";
import { usePushNotifications } from "/src/hooks/usePushNotifications.ts";
import { formatDateBR, formatTimeBR, isTodayBR, toLocalDateKey } from "/src/lib/timezone.ts";
import { useAuth } from "/src/hooks/useAuth.tsx";
import { supabase } from "/src/integrations/supabase/client.ts";
const ICON_MAP = {
    deposit: DollarSign,
    recarga: Smartphone,
    new_user_web: UserPlus,
    new_user_telegram: Bot
};
const COLOR_MAP = {
    deposit: "bg-success/15 text-success",
    recarga: "bg-primary/15 text-primary",
    new_user_web: "bg-accent/15 text-accent-foreground",
    new_user_telegram: "bg-primary/15 text-primary"
};
const STATUS_LABEL = {
    completed: {
        icon: "✓",
        cls: "bg-success/15 text-success"
    },
    concluida: {
        icon: "✓",
        cls: "bg-success/15 text-success"
    },
    paid: {
        icon: "✓",
        cls: "bg-success/15 text-success"
    },
    pending: {
        icon: "⏳",
        cls: "bg-warning/15 text-warning"
    },
    pendente: {
        icon: "⏳",
        cls: "bg-warning/15 text-warning"
    },
    processing: {
        icon: "⚙️",
        cls: "bg-primary/15 text-primary"
    },
    falha: {
        icon: "✗",
        cls: "bg-destructive/15 text-destructive"
    },
    cancelled: {
        icon: "🚫",
        cls: "bg-destructive/15 text-destructive"
    },
    new: {
        icon: "●",
        cls: "bg-primary/15 text-primary"
    }
};
function fmtTime(d) {
    try {
        return formatTimeBR(d);
    } catch  {
        return "";
    }
}
function fmtDate(d) {
    try {
        if (isTodayBR(d)) return "Hoje";
        const inputKey = toLocalDateKey(d);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = toLocalDateKey(yesterday.toISOString());
        if (inputKey === yKey) return "Ontem";
        return formatDateBR(d);
    } catch  {
        return "";
    }
}
export function NotificationBell({ listenTo, revendedores }) {
    _s();
    const { user } = useAuth();
    usePushNotifications(user?.id);
    // Load notification config from system_config
    const [notifConfig, setNotifConfig] = useState({});
    useEffect(()=>{
        (async ()=>{
            const { data } = await supabase.from("system_config").select("key, value").like("key", "notif_admin_%");
            if (data) {
                const cfg = {};
                data.forEach((r)=>{
                    if (r.key === "notif_admin_deposit") cfg.showDepositToast = r.value !== "false";
                    if (r.key === "notif_admin_recarga") cfg.showRecargaToast = r.value !== "false";
                    if (r.key === "notif_admin_new_user") cfg.showNewUserToast = r.value !== "false";
                });
                setNotifConfig(cfg);
            }
        })();
    }, []);
    const { notifications, unreadCount, loading, markAllRead, clearAll } = useNotifications({
        listenTo,
        revendedores,
        notifConfig
    });
    const [open, setOpen] = useState(false);
    const panelRef = useRef(null);
    // Close on outside click
    useEffect(()=>{
        if (!open) return;
        const handler = (e)=>{
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return ()=>document.removeEventListener("mousedown", handler);
    }, [
        open
    ]);
    // Group by date
    const grouped = notifications.reduce((acc, n)=>{
        const key = fmtDate(n.created_at);
        if (!acc[key]) acc[key] = [];
        acc[key].push(n);
        return acc;
    }, {});
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "relative",
        ref: panelRef,
        children: [
            /*#__PURE__*/ _jsxDEV("button", {
                onClick: ()=>{
                    setOpen(!open);
                    if (!open) markAllRead();
                },
                className: "relative p-2 rounded-xl hover:bg-muted/60 text-muted-foreground transition-all duration-200 active:scale-95",
                "aria-label": "Notificações",
                children: [
                    /*#__PURE__*/ _jsxDEV(motion.div, {
                        animate: unreadCount > 0 ? {
                            rotate: [
                                0,
                                12,
                                -12,
                                8,
                                -8,
                                0
                            ]
                        } : {},
                        transition: {
                            duration: 0.6,
                            repeat: Infinity,
                            repeatDelay: 4
                        },
                        children: /*#__PURE__*/ _jsxDEV(Bell, {
                            className: "h-5 w-5"
                        }, void 0, false, {
                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/NotificationBell.tsx",
                        lineNumber: 127,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                        children: unreadCount > 0 && /*#__PURE__*/ _jsxDEV(motion.span, {
                            initial: {
                                scale: 0
                            },
                            animate: {
                                scale: 1
                            },
                            exit: {
                                scale: 0
                            },
                            className: "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 shadow-sm",
                            children: unreadCount > 99 ? "99+" : unreadCount
                        }, void 0, false, {
                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                            lineNumber: 135,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/NotificationBell.tsx",
                        lineNumber: 133,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/NotificationBell.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                children: open && /*#__PURE__*/ _jsxDEV(_Fragment, {
                    children: [
                        /*#__PURE__*/ _jsxDEV(motion.div, {
                            className: "fixed inset-0 bg-black/40 z-[60] sm:hidden",
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            },
                            onClick: ()=>setOpen(false)
                        }, void 0, false, {
                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                            lineNumber: 152,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0,
                                y: -8,
                                scale: 0.96
                            },
                            animate: {
                                opacity: 1,
                                y: 0,
                                scale: 1
                            },
                            exit: {
                                opacity: 0,
                                y: -8,
                                scale: 0.96
                            },
                            transition: {
                                type: "spring",
                                damping: 24,
                                stiffness: 300
                            },
                            className: "fixed inset-x-3 top-14 bottom-auto z-[61] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] max-h-[75vh] sm:max-h-[480px] rounded-2xl border border-border bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col",
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "px-4 py-3 border-b border-border/60 flex items-center justify-between bg-muted/20",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(Bell, {
                                                    className: "h-4 w-4 text-primary"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("h3", {
                                                    className: "text-sm font-bold text-foreground",
                                                    children: "Notificações"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                    lineNumber: 171,
                                                    columnNumber: 19
                                                }, this),
                                                notifications.length > 0 && /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full",
                                                    children: notifications.length
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                    lineNumber: 173,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                                            lineNumber: 169,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center gap-1",
                                            children: [
                                                notifications.length > 0 && /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: markAllRead,
                                                            className: "text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors flex items-center gap-1",
                                                            title: "Marcar todas como lidas",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV(CheckCheck, {
                                                                    className: "h-3 w-3"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                    lineNumber: 186,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "hidden sm:inline",
                                                                    children: "Lidas"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                    lineNumber: 187,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                            lineNumber: 181,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: clearAll,
                                                            className: "text-[10px] text-muted-foreground hover:text-destructive px-2 py-1 rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-1",
                                                            title: "Limpar tudo",
                                                            children: /*#__PURE__*/ _jsxDEV(Trash2, {
                                                                className: "h-3 w-3"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                lineNumber: 194,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                            lineNumber: 189,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setOpen(false),
                                                    className: "p-1.5 rounded-lg hover:bg-destructive/15 text-destructive transition-colors",
                                                    children: /*#__PURE__*/ _jsxDEV(X, {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                        lineNumber: 202,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                    lineNumber: 198,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                                            lineNumber: 178,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                    lineNumber: 168,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex-1 overflow-y-auto overscroll-contain",
                                    children: loading ? /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex flex-col items-center justify-center py-12 gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                lineNumber: 211,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "Carregando..."
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                lineNumber: 212,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/NotificationBell.tsx",
                                        lineNumber: 210,
                                        columnNumber: 19
                                    }, this) : notifications.length === 0 ? /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex flex-col items-center justify-center py-12 text-muted-foreground",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3",
                                                children: /*#__PURE__*/ _jsxDEV(Bell, {
                                                    className: "h-6 w-6 opacity-40"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                lineNumber: 216,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm font-medium",
                                                children: "Tudo limpo!"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                lineNumber: 219,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs mt-1 opacity-70",
                                                children: "Notificações em tempo real aparecerão aqui"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                lineNumber: 220,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/NotificationBell.tsx",
                                        lineNumber: 215,
                                        columnNumber: 19
                                    }, this) : Object.entries(grouped).map(([dateLabel, items])=>/*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "sticky top-0 bg-background/90 backdrop-blur-sm px-4 py-1.5 border-b border-border/30",
                                                    children: /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70",
                                                        children: dateLabel
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                        lineNumber: 227,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                    lineNumber: 226,
                                                    columnNumber: 23
                                                }, this),
                                                items.map((n, i)=>{
                                                    const Icon = ICON_MAP[n.type] || Smartphone;
                                                    const colorCls = COLOR_MAP[n.type] || "bg-muted text-foreground";
                                                    const statusInfo = STATUS_LABEL[n.status] || {
                                                        icon: "⏳",
                                                        cls: "bg-warning/15 text-warning"
                                                    };
                                                    return /*#__PURE__*/ _jsxDEV(motion.div, {
                                                        initial: {
                                                            opacity: 0,
                                                            x: 8
                                                        },
                                                        animate: {
                                                            opacity: 1,
                                                            x: 0
                                                        },
                                                        transition: {
                                                            delay: i * 0.02,
                                                            duration: 0.15
                                                        },
                                                        className: `px-4 py-3 border-b border-border/20 hover:bg-muted/30 transition-colors cursor-default ${!n.is_read ? "bg-primary/[0.03]" : ""}`,
                                                        children: /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex items-start gap-3",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: `w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`,
                                                                    children: /*#__PURE__*/ _jsxDEV(Icon, {
                                                                        className: "h-4 w-4"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                        lineNumber: 251,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                    lineNumber: 250,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "min-w-0 flex-1",
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV("p", {
                                                                            className: "text-[13px] font-medium text-foreground leading-snug",
                                                                            children: n.message
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                            lineNumber: 256,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                                            className: "flex items-center gap-1.5 mt-1",
                                                                            children: [
                                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                                    className: "text-[11px] text-muted-foreground truncate",
                                                                                    children: n.user_nome || n.user_email || "Usuário"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                                    lineNumber: 260,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                                    className: "text-muted-foreground/40",
                                                                                    children: "·"
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                                    lineNumber: 263,
                                                                                    columnNumber: 35
                                                                                }, this),
                                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                                    className: "text-[11px] text-muted-foreground/70 tabular-nums shrink-0",
                                                                                    children: fmtTime(n.created_at)
                                                                                }, void 0, false, {
                                                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                                    lineNumber: 264,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                            lineNumber: 259,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                    lineNumber: 255,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: `text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${statusInfo.cls}`,
                                                                    children: statusInfo.icon
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                    lineNumber: 271,
                                                                    columnNumber: 31
                                                                }, this),
                                                                !n.is_read && /*#__PURE__*/ _jsxDEV("div", {
                                                                    className: "w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                                    lineNumber: 277,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                            lineNumber: 248,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, n.id, false, {
                                                        fileName: "/dev-server/src/components/NotificationBell.tsx",
                                                        lineNumber: 239,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            ]
                                        }, dateLabel, true, {
                                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                                            lineNumber: 224,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/NotificationBell.tsx",
                                    lineNumber: 208,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/components/NotificationBell.tsx",
                            lineNumber: 160,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "/dev-server/src/components/NotificationBell.tsx",
                lineNumber: 148,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/NotificationBell.tsx",
        lineNumber: 117,
        columnNumber: 5
    }, this);
}
_s(NotificationBell, "nEvtdwf6+YjSjiEmlcrlU28CkZU=", false, function() {
    return [
        useAuth,
        usePushNotifications,
        useNotifications
    ];
});
_c = NotificationBell;
var _c;
$RefreshReg$(_c, "NotificationBell");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/NotificationBell.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/NotificationBell.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk5vdGlmaWNhdGlvbkJlbGwudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VSZWYsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQmVsbCwgWCwgRG9sbGFyU2lnbiwgU21hcnRwaG9uZSwgVXNlclBsdXMsIEJvdCwgQ2hlY2tDaGVjaywgVHJhc2gyIH0gZnJvbSBcImx1Y2lkZS1yZWFjdFwiO1xuaW1wb3J0IHsgbW90aW9uLCBBbmltYXRlUHJlc2VuY2UgfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IHsgdXNlTm90aWZpY2F0aW9ucywgQXBwTm90aWZpY2F0aW9uLCBOb3RpZkNvbmZpZyB9IGZyb20gXCJAL2hvb2tzL3VzZU5vdGlmaWNhdGlvbnNcIjtcbmltcG9ydCB7IHVzZVB1c2hOb3RpZmljYXRpb25zIH0gZnJvbSBcIkAvaG9va3MvdXNlUHVzaE5vdGlmaWNhdGlvbnNcIjtcbmltcG9ydCB7IGZvcm1hdERhdGVCUiwgZm9ybWF0VGltZUJSLCBpc1RvZGF5QlIsIHRvTG9jYWxEYXRlS2V5IH0gZnJvbSBcIkAvbGliL3RpbWV6b25lXCI7XG5pbXBvcnQgeyB1c2VBdXRoIH0gZnJvbSBcIkAvaG9va3MvdXNlQXV0aFwiO1xuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tIFwiQC9pbnRlZ3JhdGlvbnMvc3VwYWJhc2UvY2xpZW50XCI7XG5cbmludGVyZmFjZSBOb3RpZmljYXRpb25CZWxsUHJvcHMge1xuICBsaXN0ZW5UbzogKFwiZGVwb3NpdFwiIHwgXCJyZWNhcmdhXCIgfCBcIm5ld191c2VyXCIpW107XG4gIHJldmVuZGVkb3Jlcz86IHsgaWQ6IHN0cmluZzsgbm9tZTogc3RyaW5nIHwgbnVsbDsgZW1haWw6IHN0cmluZyB8IG51bGwgfVtdO1xufVxuXG5jb25zdCBJQ09OX01BUDogUmVjb3JkPEFwcE5vdGlmaWNhdGlvbltcInR5cGVcIl0sIHR5cGVvZiBEb2xsYXJTaWduPiA9IHtcbiAgZGVwb3NpdDogRG9sbGFyU2lnbixcbiAgcmVjYXJnYTogU21hcnRwaG9uZSxcbiAgbmV3X3VzZXJfd2ViOiBVc2VyUGx1cyxcbiAgbmV3X3VzZXJfdGVsZWdyYW06IEJvdCxcbn07XG5cbmNvbnN0IENPTE9SX01BUDogUmVjb3JkPEFwcE5vdGlmaWNhdGlvbltcInR5cGVcIl0sIHN0cmluZz4gPSB7XG4gIGRlcG9zaXQ6IFwiYmctc3VjY2Vzcy8xNSB0ZXh0LXN1Y2Nlc3NcIixcbiAgcmVjYXJnYTogXCJiZy1wcmltYXJ5LzE1IHRleHQtcHJpbWFyeVwiLFxuICBuZXdfdXNlcl93ZWI6IFwiYmctYWNjZW50LzE1IHRleHQtYWNjZW50LWZvcmVncm91bmRcIixcbiAgbmV3X3VzZXJfdGVsZWdyYW06IFwiYmctcHJpbWFyeS8xNSB0ZXh0LXByaW1hcnlcIixcbn07XG5cbmNvbnN0IFNUQVRVU19MQUJFTDogUmVjb3JkPHN0cmluZywgeyBpY29uOiBzdHJpbmc7IGNsczogc3RyaW5nIH0+ID0ge1xuICBjb21wbGV0ZWQ6IHsgaWNvbjogXCLinJNcIiwgY2xzOiBcImJnLXN1Y2Nlc3MvMTUgdGV4dC1zdWNjZXNzXCIgfSxcbiAgY29uY2x1aWRhOiB7IGljb246IFwi4pyTXCIsIGNsczogXCJiZy1zdWNjZXNzLzE1IHRleHQtc3VjY2Vzc1wiIH0sXG4gIHBhaWQ6IHsgaWNvbjogXCLinJNcIiwgY2xzOiBcImJnLXN1Y2Nlc3MvMTUgdGV4dC1zdWNjZXNzXCIgfSxcbiAgcGVuZGluZzogeyBpY29uOiBcIuKPs1wiLCBjbHM6IFwiYmctd2FybmluZy8xNSB0ZXh0LXdhcm5pbmdcIiB9LFxuICBwZW5kZW50ZTogeyBpY29uOiBcIuKPs1wiLCBjbHM6IFwiYmctd2FybmluZy8xNSB0ZXh0LXdhcm5pbmdcIiB9LFxuICBwcm9jZXNzaW5nOiB7IGljb246IFwi4pqZ77iPXCIsIGNsczogXCJiZy1wcmltYXJ5LzE1IHRleHQtcHJpbWFyeVwiIH0sXG4gIGZhbGhhOiB7IGljb246IFwi4pyXXCIsIGNsczogXCJiZy1kZXN0cnVjdGl2ZS8xNSB0ZXh0LWRlc3RydWN0aXZlXCIgfSxcbiAgY2FuY2VsbGVkOiB7IGljb246IFwi8J+aq1wiLCBjbHM6IFwiYmctZGVzdHJ1Y3RpdmUvMTUgdGV4dC1kZXN0cnVjdGl2ZVwiIH0sXG4gIG5ldzogeyBpY29uOiBcIuKXj1wiLCBjbHM6IFwiYmctcHJpbWFyeS8xNSB0ZXh0LXByaW1hcnlcIiB9LFxufTtcblxuZnVuY3Rpb24gZm10VGltZShkOiBzdHJpbmcpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZm9ybWF0VGltZUJSKGQpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gXCJcIjtcbiAgfVxufVxuXG5mdW5jdGlvbiBmbXREYXRlKGQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIGlmIChpc1RvZGF5QlIoZCkpIHJldHVybiBcIkhvamVcIjtcbiAgICBjb25zdCBpbnB1dEtleSA9IHRvTG9jYWxEYXRlS2V5KGQpO1xuICAgIGNvbnN0IHllc3RlcmRheSA9IG5ldyBEYXRlKCk7XG4gICAgeWVzdGVyZGF5LnNldERhdGUoeWVzdGVyZGF5LmdldERhdGUoKSAtIDEpO1xuICAgIGNvbnN0IHlLZXkgPSB0b0xvY2FsRGF0ZUtleSh5ZXN0ZXJkYXkudG9JU09TdHJpbmcoKSk7XG4gICAgaWYgKGlucHV0S2V5ID09PSB5S2V5KSByZXR1cm4gXCJPbnRlbVwiO1xuICAgIHJldHVybiBmb3JtYXREYXRlQlIoZCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBcIlwiO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBOb3RpZmljYXRpb25CZWxsKHsgbGlzdGVuVG8sIHJldmVuZGVkb3JlcyB9OiBOb3RpZmljYXRpb25CZWxsUHJvcHMpIHtcbiAgY29uc3QgeyB1c2VyIH0gPSB1c2VBdXRoKCk7XG4gIHVzZVB1c2hOb3RpZmljYXRpb25zKHVzZXI/LmlkKTtcblxuICAvLyBMb2FkIG5vdGlmaWNhdGlvbiBjb25maWcgZnJvbSBzeXN0ZW1fY29uZmlnXG4gIGNvbnN0IFtub3RpZkNvbmZpZywgc2V0Tm90aWZDb25maWddID0gdXNlU3RhdGU8Tm90aWZDb25maWc+KHt9KTtcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAuZnJvbShcInN5c3RlbV9jb25maWdcIilcbiAgICAgICAgLnNlbGVjdChcImtleSwgdmFsdWVcIilcbiAgICAgICAgLmxpa2UoXCJrZXlcIiwgXCJub3RpZl9hZG1pbl8lXCIpO1xuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgY29uc3QgY2ZnOiBOb3RpZkNvbmZpZyA9IHt9O1xuICAgICAgICBkYXRhLmZvckVhY2goKHI6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChyLmtleSA9PT0gXCJub3RpZl9hZG1pbl9kZXBvc2l0XCIpIGNmZy5zaG93RGVwb3NpdFRvYXN0ID0gci52YWx1ZSAhPT0gXCJmYWxzZVwiO1xuICAgICAgICAgIGlmIChyLmtleSA9PT0gXCJub3RpZl9hZG1pbl9yZWNhcmdhXCIpIGNmZy5zaG93UmVjYXJnYVRvYXN0ID0gci52YWx1ZSAhPT0gXCJmYWxzZVwiO1xuICAgICAgICAgIGlmIChyLmtleSA9PT0gXCJub3RpZl9hZG1pbl9uZXdfdXNlclwiKSBjZmcuc2hvd05ld1VzZXJUb2FzdCA9IHIudmFsdWUgIT09IFwiZmFsc2VcIjtcbiAgICAgICAgfSk7XG4gICAgICAgIHNldE5vdGlmQ29uZmlnKGNmZyk7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IHsgbm90aWZpY2F0aW9ucywgdW5yZWFkQ291bnQsIGxvYWRpbmcsIG1hcmtBbGxSZWFkLCBjbGVhckFsbCB9ID0gdXNlTm90aWZpY2F0aW9ucyh7XG4gICAgbGlzdGVuVG8sXG4gICAgcmV2ZW5kZWRvcmVzLFxuICAgIG5vdGlmQ29uZmlnLFxuICB9KTtcblxuICBjb25zdCBbb3Blbiwgc2V0T3Blbl0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IHBhbmVsUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcblxuICAvLyBDbG9zZSBvbiBvdXRzaWRlIGNsaWNrXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFvcGVuKSByZXR1cm47XG4gICAgY29uc3QgaGFuZGxlciA9IChlOiBNb3VzZUV2ZW50KSA9PiB7XG4gICAgICBpZiAocGFuZWxSZWYuY3VycmVudCAmJiAhcGFuZWxSZWYuY3VycmVudC5jb250YWlucyhlLnRhcmdldCBhcyBOb2RlKSkge1xuICAgICAgICBzZXRPcGVuKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgaGFuZGxlcik7XG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgaGFuZGxlcik7XG4gIH0sIFtvcGVuXSk7XG5cbiAgLy8gR3JvdXAgYnkgZGF0ZVxuICBjb25zdCBncm91cGVkID0gbm90aWZpY2F0aW9ucy5yZWR1Y2U8UmVjb3JkPHN0cmluZywgQXBwTm90aWZpY2F0aW9uW10+PigoYWNjLCBuKSA9PiB7XG4gICAgY29uc3Qga2V5ID0gZm10RGF0ZShuLmNyZWF0ZWRfYXQpO1xuICAgIGlmICghYWNjW2tleV0pIGFjY1trZXldID0gW107XG4gICAgYWNjW2tleV0ucHVzaChuKTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlXCIgcmVmPXtwYW5lbFJlZn0+XG4gICAgICB7LyogQmVsbCBCdXR0b24gKi99XG4gICAgICA8YnV0dG9uXG4gICAgICAgIG9uQ2xpY2s9eygpID0+IHtcbiAgICAgICAgICBzZXRPcGVuKCFvcGVuKTtcbiAgICAgICAgICBpZiAoIW9wZW4pIG1hcmtBbGxSZWFkKCk7XG4gICAgICAgIH19XG4gICAgICAgIGNsYXNzTmFtZT1cInJlbGF0aXZlIHAtMiByb3VuZGVkLXhsIGhvdmVyOmJnLW11dGVkLzYwIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAgYWN0aXZlOnNjYWxlLTk1XCJcbiAgICAgICAgYXJpYS1sYWJlbD1cIk5vdGlmaWNhw6fDtWVzXCJcbiAgICAgID5cbiAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICBhbmltYXRlPXt1bnJlYWRDb3VudCA+IDAgPyB7IHJvdGF0ZTogWzAsIDEyLCAtMTIsIDgsIC04LCAwXSB9IDoge319XG4gICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC42LCByZXBlYXQ6IEluZmluaXR5LCByZXBlYXREZWxheTogNCB9fVxuICAgICAgICA+XG4gICAgICAgICAgPEJlbGwgY2xhc3NOYW1lPVwiaC01IHctNVwiIC8+XG4gICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICB7dW5yZWFkQ291bnQgPiAwICYmIChcbiAgICAgICAgICAgIDxtb3Rpb24uc3BhblxuICAgICAgICAgICAgICBpbml0aWFsPXt7IHNjYWxlOiAwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgc2NhbGU6IDEgfX1cbiAgICAgICAgICAgICAgZXhpdD17eyBzY2FsZTogMCB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSAtdG9wLTAuNSAtcmlnaHQtMC41IG1pbi13LVsxOHB4XSBoLVsxOHB4XSByb3VuZGVkLWZ1bGwgYmctZGVzdHJ1Y3RpdmUgdGV4dC1kZXN0cnVjdGl2ZS1mb3JlZ3JvdW5kIHRleHQtWzEwcHhdIGZvbnQtYm9sZCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBweC0xIHNoYWRvdy1zbVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHt1bnJlYWRDb3VudCA+IDk5ID8gXCI5OStcIiA6IHVucmVhZENvdW50fVxuICAgICAgICAgICAgPC9tb3Rpb24uc3Bhbj5cbiAgICAgICAgICApfVxuICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cbiAgICAgIDwvYnV0dG9uPlxuXG4gICAgICB7LyogUGFuZWwgKi99XG4gICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICB7b3BlbiAmJiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIHsvKiBNb2JpbGUgYmFja2Ryb3AgKi99XG4gICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzQwIHotWzYwXSBzbTpoaWRkZW5cIlxuICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRPcGVuKGZhbHNlKX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogLTgsIHNjYWxlOiAwLjk2IH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCwgc2NhbGU6IDEgfX1cbiAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCB5OiAtOCwgc2NhbGU6IDAuOTYgfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyB0eXBlOiBcInNwcmluZ1wiLCBkYW1waW5nOiAyNCwgc3RpZmZuZXNzOiAzMDAgfX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQteC0zIHRvcC0xNCBib3R0b20tYXV0byB6LVs2MV0gc206YWJzb2x1dGUgc206aW5zZXQtYXV0byBzbTpyaWdodC0wIHNtOnRvcC1mdWxsIHNtOm10LTIgc206dy1bMzgwcHhdIG1heC1oLVs3NXZoXSBzbTptYXgtaC1bNDgwcHhdIHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItYm9yZGVyIGJnLWJhY2tncm91bmQvOTUgYmFja2Ryb3AtYmx1ci14bCBzaGFkb3ctMnhsIG92ZXJmbG93LWhpZGRlbiBmbGV4IGZsZXgtY29sXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgey8qIEhlYWRlciAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC00IHB5LTMgYm9yZGVyLWIgYm9yZGVyLWJvcmRlci82MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gYmctbXV0ZWQvMjBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICA8QmVsbCBjbGFzc05hbWU9XCJoLTQgdy00IHRleHQtcHJpbWFyeVwiIC8+XG4gICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+Tm90aWZpY2HDp8O1ZXM8L2gzPlxuICAgICAgICAgICAgICAgICAge25vdGlmaWNhdGlvbnMubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBiZy1tdXRlZCBweC0xLjUgcHktMC41IHJvdW5kZWQtZnVsbFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtub3RpZmljYXRpb25zLmxlbmd0aH1cbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCI+XG4gICAgICAgICAgICAgICAgICB7bm90aWZpY2F0aW9ucy5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXttYXJrQWxsUmVhZH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3Zlcjp0ZXh0LWZvcmVncm91bmQgcHgtMiBweS0xIHJvdW5kZWQtbGcgaG92ZXI6YmctbXV0ZWQgdHJhbnNpdGlvbi1jb2xvcnMgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU9XCJNYXJjYXIgdG9kYXMgY29tbyBsaWRhc1wiXG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPENoZWNrQ2hlY2sgY2xhc3NOYW1lPVwiaC0zIHctM1wiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJoaWRkZW4gc206aW5saW5lXCI+TGlkYXM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17Y2xlYXJBbGx9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6dGV4dC1kZXN0cnVjdGl2ZSBweC0yIHB5LTEgcm91bmRlZC1sZyBob3ZlcjpiZy1kZXN0cnVjdGl2ZS8xMCB0cmFuc2l0aW9uLWNvbG9ycyBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT1cIkxpbXBhciB0dWRvXCJcbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VHJhc2gyIGNsYXNzTmFtZT1cImgtMyB3LTNcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE9wZW4oZmFsc2UpfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwLTEuNSByb3VuZGVkLWxnIGhvdmVyOmJnLWRlc3RydWN0aXZlLzE1IHRleHQtZGVzdHJ1Y3RpdmUgdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8WCBjbGFzc05hbWU9XCJoLTMuNSB3LTMuNVwiIC8+XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgey8qIENvbnRlbnQgKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xIG92ZXJmbG93LXktYXV0byBvdmVyc2Nyb2xsLWNvbnRhaW5cIj5cbiAgICAgICAgICAgICAgICB7bG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcHktMTIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTYgaC02IGJvcmRlci0yIGJvcmRlci1wcmltYXJ5LzMwIGJvcmRlci10LXByaW1hcnkgcm91bmRlZC1mdWxsIGFuaW1hdGUtc3BpblwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+Q2FycmVnYW5kby4uLjwvcD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiBub3RpZmljYXRpb25zLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcHktMTIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xMiBoLTEyIHJvdW5kZWQtMnhsIGJnLW11dGVkLzUwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG1iLTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8QmVsbCBjbGFzc05hbWU9XCJoLTYgdy02IG9wYWNpdHktNDBcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LW1lZGl1bVwiPlR1ZG8gbGltcG8hPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIG10LTEgb3BhY2l0eS03MFwiPk5vdGlmaWNhw6fDtWVzIGVtIHRlbXBvIHJlYWwgYXBhcmVjZXLDo28gYXF1aTwvcD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhncm91cGVkKS5tYXAoKFtkYXRlTGFiZWwsIGl0ZW1zXSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17ZGF0ZUxhYmVsfT5cbiAgICAgICAgICAgICAgICAgICAgICB7LyogRGF0ZSBzZXBhcmF0b3IgKi99XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzdGlja3kgdG9wLTAgYmctYmFja2dyb3VuZC85MCBiYWNrZHJvcC1ibHVyLXNtIHB4LTQgcHktMS41IGJvcmRlci1iIGJvcmRlci1ib3JkZXIvMzBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtc2VtaWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtbXV0ZWQtZm9yZWdyb3VuZC83MFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7ZGF0ZUxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICAgey8qIEl0ZW1zICovfVxuICAgICAgICAgICAgICAgICAgICAgIHtpdGVtcy5tYXAoKG4sIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IEljb24gPSBJQ09OX01BUFtuLnR5cGVdIHx8IFNtYXJ0cGhvbmU7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjb2xvckNscyA9IENPTE9SX01BUFtuLnR5cGVdIHx8IFwiYmctbXV0ZWQgdGV4dC1mb3JlZ3JvdW5kXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGF0dXNJbmZvID0gU1RBVFVTX0xBQkVMW24uc3RhdHVzXSB8fCB7IGljb246IFwi4o+zXCIsIGNsczogXCJiZy13YXJuaW5nLzE1IHRleHQtd2FybmluZ1wiIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXtuLmlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeDogOCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeDogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IGkgKiAwLjAyLCBkdXJhdGlvbjogMC4xNSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHB4LTQgcHktMyBib3JkZXItYiBib3JkZXItYm9yZGVyLzIwIGhvdmVyOmJnLW11dGVkLzMwIHRyYW5zaXRpb24tY29sb3JzIGN1cnNvci1kZWZhdWx0ICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhbi5pc19yZWFkID8gXCJiZy1wcmltYXJ5L1swLjAzXVwiIDogXCJcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLXN0YXJ0IGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7LyogSWNvbiAqL31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdy04IGgtOCByb3VuZGVkLXhsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNocmluay0wICR7Y29sb3JDbHN9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxJY29uIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsvKiBDb250ZW50ICovfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtaW4tdy0wIGZsZXgtMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxM3B4XSBmb250LW1lZGl1bSB0ZXh0LWZvcmVncm91bmQgbGVhZGluZy1zbnVnXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge24ubWVzc2FnZX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgbXQtMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB0cnVuY2F0ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge24udXNlcl9ub21lIHx8IG4udXNlcl9lbWFpbCB8fCBcIlVzdcOhcmlvXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZC80MFwiPsK3PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZC83MCB0YWJ1bGFyLW51bXMgc2hyaW5rLTBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmbXRUaW1lKG4uY3JlYXRlZF9hdCl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7LyogU3RhdHVzIGJhZGdlICovfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdGV4dC1bOXB4XSBmb250LWJvbGQgcHgtMS41IHB5LTAuNSByb3VuZGVkLW1kIHNocmluay0wICR7c3RhdHVzSW5mby5jbHN9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtzdGF0dXNJbmZvLmljb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsvKiBVbnJlYWQgZG90ICovfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeyFuLmlzX3JlYWQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMiBoLTIgcm91bmRlZC1mdWxsIGJnLXByaW1hcnkgc2hyaW5rLTAgbXQtMS41XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKX1cbiAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxuICAgIDwvZGl2PlxuICApO1xufVxuIl0sIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlUmVmIiwidXNlRWZmZWN0IiwiQmVsbCIsIlgiLCJEb2xsYXJTaWduIiwiU21hcnRwaG9uZSIsIlVzZXJQbHVzIiwiQm90IiwiQ2hlY2tDaGVjayIsIlRyYXNoMiIsIm1vdGlvbiIsIkFuaW1hdGVQcmVzZW5jZSIsInVzZU5vdGlmaWNhdGlvbnMiLCJ1c2VQdXNoTm90aWZpY2F0aW9ucyIsImZvcm1hdERhdGVCUiIsImZvcm1hdFRpbWVCUiIsImlzVG9kYXlCUiIsInRvTG9jYWxEYXRlS2V5IiwidXNlQXV0aCIsInN1cGFiYXNlIiwiSUNPTl9NQVAiLCJkZXBvc2l0IiwicmVjYXJnYSIsIm5ld191c2VyX3dlYiIsIm5ld191c2VyX3RlbGVncmFtIiwiQ09MT1JfTUFQIiwiU1RBVFVTX0xBQkVMIiwiY29tcGxldGVkIiwiaWNvbiIsImNscyIsImNvbmNsdWlkYSIsInBhaWQiLCJwZW5kaW5nIiwicGVuZGVudGUiLCJwcm9jZXNzaW5nIiwiZmFsaGEiLCJjYW5jZWxsZWQiLCJuZXciLCJmbXRUaW1lIiwiZCIsImZtdERhdGUiLCJpbnB1dEtleSIsInllc3RlcmRheSIsIkRhdGUiLCJzZXREYXRlIiwiZ2V0RGF0ZSIsInlLZXkiLCJ0b0lTT1N0cmluZyIsIk5vdGlmaWNhdGlvbkJlbGwiLCJsaXN0ZW5UbyIsInJldmVuZGVkb3JlcyIsInVzZXIiLCJpZCIsIm5vdGlmQ29uZmlnIiwic2V0Tm90aWZDb25maWciLCJkYXRhIiwiZnJvbSIsInNlbGVjdCIsImxpa2UiLCJjZmciLCJmb3JFYWNoIiwiciIsImtleSIsInNob3dEZXBvc2l0VG9hc3QiLCJ2YWx1ZSIsInNob3dSZWNhcmdhVG9hc3QiLCJzaG93TmV3VXNlclRvYXN0Iiwibm90aWZpY2F0aW9ucyIsInVucmVhZENvdW50IiwibG9hZGluZyIsIm1hcmtBbGxSZWFkIiwiY2xlYXJBbGwiLCJvcGVuIiwic2V0T3BlbiIsInBhbmVsUmVmIiwiaGFuZGxlciIsImUiLCJjdXJyZW50IiwiY29udGFpbnMiLCJ0YXJnZXQiLCJkb2N1bWVudCIsImFkZEV2ZW50TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwiZ3JvdXBlZCIsInJlZHVjZSIsImFjYyIsIm4iLCJjcmVhdGVkX2F0IiwicHVzaCIsImRpdiIsImNsYXNzTmFtZSIsInJlZiIsImJ1dHRvbiIsIm9uQ2xpY2siLCJhcmlhLWxhYmVsIiwiYW5pbWF0ZSIsInJvdGF0ZSIsInRyYW5zaXRpb24iLCJkdXJhdGlvbiIsInJlcGVhdCIsIkluZmluaXR5IiwicmVwZWF0RGVsYXkiLCJzcGFuIiwiaW5pdGlhbCIsInNjYWxlIiwiZXhpdCIsIm9wYWNpdHkiLCJ5IiwidHlwZSIsImRhbXBpbmciLCJzdGlmZm5lc3MiLCJoMyIsImxlbmd0aCIsInRpdGxlIiwicCIsIk9iamVjdCIsImVudHJpZXMiLCJtYXAiLCJkYXRlTGFiZWwiLCJpdGVtcyIsImkiLCJJY29uIiwiY29sb3JDbHMiLCJzdGF0dXNJbmZvIiwic3RhdHVzIiwieCIsImRlbGF5IiwiaXNfcmVhZCIsIm1lc3NhZ2UiLCJ1c2VyX25vbWUiLCJ1c2VyX2VtYWlsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxRQUFRLEVBQUVDLE1BQU0sRUFBRUMsU0FBUyxRQUFRLFFBQVE7QUFDcEQsU0FBU0MsSUFBSSxFQUFFQyxDQUFDLEVBQUVDLFVBQVUsRUFBRUMsVUFBVSxFQUFFQyxRQUFRLEVBQUVDLEdBQUcsRUFBRUMsVUFBVSxFQUFFQyxNQUFNLFFBQVEsZUFBZTtBQUNsRyxTQUFTQyxNQUFNLEVBQUVDLGVBQWUsUUFBUSxnQkFBZ0I7QUFDeEQsU0FBU0MsZ0JBQWdCLFFBQXNDLDJCQUEyQjtBQUMxRixTQUFTQyxvQkFBb0IsUUFBUSwrQkFBK0I7QUFDcEUsU0FBU0MsWUFBWSxFQUFFQyxZQUFZLEVBQUVDLFNBQVMsRUFBRUMsY0FBYyxRQUFRLGlCQUFpQjtBQUN2RixTQUFTQyxPQUFPLFFBQVEsa0JBQWtCO0FBQzFDLFNBQVNDLFFBQVEsUUFBUSxpQ0FBaUM7QUFPMUQsTUFBTUMsV0FBK0Q7SUFDbkVDLFNBQVNqQjtJQUNUa0IsU0FBU2pCO0lBQ1RrQixjQUFjakI7SUFDZGtCLG1CQUFtQmpCO0FBQ3JCO0FBRUEsTUFBTWtCLFlBQXFEO0lBQ3pESixTQUFTO0lBQ1RDLFNBQVM7SUFDVEMsY0FBYztJQUNkQyxtQkFBbUI7QUFDckI7QUFFQSxNQUFNRSxlQUE4RDtJQUNsRUMsV0FBVztRQUFFQyxNQUFNO1FBQUtDLEtBQUs7SUFBNkI7SUFDMURDLFdBQVc7UUFBRUYsTUFBTTtRQUFLQyxLQUFLO0lBQTZCO0lBQzFERSxNQUFNO1FB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