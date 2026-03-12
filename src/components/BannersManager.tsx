import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/BannersManager.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/BannersManager.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"]; const useCallback = __vite__cjsImport3_react["useCallback"]; const useRef = __vite__cjsImport3_react["useRef"];
import { supabase } from "/src/integrations/supabase/client.ts";
import { PromoBanner } from "/src/components/PromoBanner.tsx";
import { ToggleLeft, ToggleRight, Zap, Save, Loader2 } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { styledToast as toast } from "/src/lib/toast.tsx";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
export function BannersManager({ botUsername }) {
    _s();
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({});
    const [expandedBanner, setExpandedBanner] = useState(null);
    const initialLoadDone = useRef(false);
    const fetchBanners = useCallback(async ()=>{
        try {
            const { data, error } = await supabase.from("banners").select("*").order("position");
            if (error) throw error;
            setBanners((data || []).map((b)=>({
                    ...b,
                    type: b.type
                })));
        } catch  {
            toast.error("Erro ao carregar banners");
        } finally{
            if (!initialLoadDone.current) {
                setLoading(false);
                initialLoadDone.current = true;
            }
        }
    }, []);
    useEffect(()=>{
        fetchBanners();
    }, [
        fetchBanners
    ]);
    const updateBanner = (position, updates)=>{
        setBanners((prev)=>prev.map((b)=>b.position === position ? {
                    ...b,
                    ...updates
                } : b));
    };
    const toggleBanner = async (banner)=>{
        const newEnabled = !banner.enabled;
        updateBanner(banner.position, {
            enabled: newEnabled
        });
        try {
            const { error } = await supabase.from("banners").update({
                enabled: newEnabled,
                updated_at: new Date().toISOString()
            }).eq("id", banner.id);
            if (error) throw error;
            toast.success(newEnabled ? `Banner ${banner.position} ativado!` : `Banner ${banner.position} desativado!`);
        } catch  {
            updateBanner(banner.position, {
                enabled: !newEnabled
            });
            toast.error("Erro ao alterar banner");
        }
    };
    const saveBanner = async (banner)=>{
        setSaving((prev)=>({
                ...prev,
                [banner.position]: true
            }));
        try {
            const { error } = await supabase.from("banners").update({
                type: banner.type,
                title: banner.title,
                subtitle: banner.subtitle,
                link: banner.link,
                updated_at: new Date().toISOString()
            }).eq("id", banner.id);
            if (error) throw error;
            toast.success(`Banner ${banner.position} salvo!`);
        } catch  {
            toast.error("Erro ao salvar banner");
        }
        setSaving((prev)=>({
                ...prev,
                [banner.position]: false
            }));
    };
    const typeLabels = {
        banner: {
            label: "Banner Topo",
            emoji: "📢"
        },
        popup: {
            label: "Pop-up Central",
            emoji: "💬"
        },
        slide: {
            label: "Slide Animado",
            emoji: "🎞️"
        }
    };
    if (loading) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "glass-card rounded-xl p-6",
            children: /*#__PURE__*/ _jsxDEV("div", {
                className: "flex items-center gap-2 text-muted-foreground",
                children: [
                    /*#__PURE__*/ _jsxDEV(Loader2, {
                        className: "h-4 w-4 animate-spin"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/BannersManager.tsx",
                        lineNumber: 105,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("span", {
                        className: "text-sm",
                        children: "Carregando banners..."
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/BannersManager.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/BannersManager.tsx",
                lineNumber: 104,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/components/BannersManager.tsx",
            lineNumber: 103,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "glass-card rounded-xl p-6 space-y-4",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ _jsxDEV("h4", {
                        className: "font-semibold text-foreground flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV(Zap, {
                                className: "h-4 w-4 text-warning"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                lineNumber: 116,
                                columnNumber: 11
                            }, this),
                            " 📢 Banners Promocionais"
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BannersManager.tsx",
                        lineNumber: 115,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("span", {
                        className: "text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-lg",
                        children: "Máx. 3 banners"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/BannersManager.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/BannersManager.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "space-y-3",
                children: banners.map((banner)=>/*#__PURE__*/ _jsxDEV("div", {
                        className: `rounded-xl border transition-colors ${banner.enabled ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`,
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center justify-between px-4 py-3 cursor-pointer",
                                onClick: ()=>setExpandedBanner(expandedBanner === banner.position ? null : banner.position),
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-lg",
                                                children: typeLabels[banner.type]?.emoji || "📢"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                lineNumber: 137,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-sm font-semibold text-foreground",
                                                        children: [
                                                            "Banner ",
                                                            banner.position,
                                                            " — ",
                                                            typeLabels[banner.type]?.label || banner.type
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 139,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xs text-muted-foreground truncate max-w-[200px]",
                                                        children: banner.title || "Sem título"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 142,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                lineNumber: 138,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                        lineNumber: 136,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center gap-2",
                                        children: /*#__PURE__*/ _jsxDEV("button", {
                                            onClick: (e)=>{
                                                e.stopPropagation();
                                                toggleBanner(banner);
                                            },
                                            className: `flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${banner.enabled ? "bg-success/15 text-success" : "bg-muted/60 text-muted-foreground"}`,
                                            children: banner.enabled ? /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(ToggleRight, {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 156,
                                                        columnNumber: 39
                                                    }, this),
                                                    " On"
                                                ]
                                            }, void 0, true) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(ToggleLeft, {
                                                        className: "h-3.5 w-3.5"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 156,
                                                        columnNumber: 89
                                                    }, this),
                                                    " Off"
                                                ]
                                            }, void 0, true)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BannersManager.tsx",
                                            lineNumber: 148,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                        lineNumber: 147,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                                children: expandedBanner === banner.position && /*#__PURE__*/ _jsxDEV(motion.div, {
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
                                        duration: 0.2
                                    },
                                    className: "overflow-hidden",
                                    children: /*#__PURE__*/ _jsxDEV("div", {
                                        className: "px-4 pb-4 space-y-3 border-t border-border/50 pt-3",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-xs font-medium text-muted-foreground mb-1.5",
                                                        children: "Tipo do Banner"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 174,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "flex gap-2",
                                                        children: [
                                                            "banner",
                                                            "popup",
                                                            "slide"
                                                        ].map((t)=>/*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>updateBanner(banner.position, {
                                                                        type: t
                                                                    }),
                                                                className: `flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors border ${banner.type === t ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:bg-muted/40"}`,
                                                                children: [
                                                                    typeLabels[t].emoji,
                                                                    " ",
                                                                    typeLabels[t].label
                                                                ]
                                                            }, t, true, {
                                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                                lineNumber: 177,
                                                                columnNumber: 27
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 175,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                lineNumber: 173,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-xs font-medium text-foreground mb-1",
                                                        children: "Título"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 194,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                        type: "text",
                                                        value: banner.title,
                                                        onChange: (e)=>updateBanner(banner.position, {
                                                                title: e.target.value
                                                            }),
                                                        className: "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                                                        placeholder: "🚀 Título do banner"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 195,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                lineNumber: 193,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-xs font-medium text-foreground mb-1",
                                                        children: "Subtítulo"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 206,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                        type: "text",
                                                        value: banner.subtitle,
                                                        onChange: (e)=>updateBanner(banner.position, {
                                                                subtitle: e.target.value
                                                            }),
                                                        className: "w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                                                        placeholder: "📱 Descrição do banner"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                lineNumber: 205,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-xs font-medium text-foreground mb-1",
                                                        children: "🔗 Link"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 218,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "flex gap-2",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("input", {
                                                                type: "text",
                                                                value: banner.link,
                                                                onChange: (e)=>updateBanner(banner.position, {
                                                                        link: e.target.value
                                                                    }),
                                                                className: "flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                                                                placeholder: "https://t.me/SeuBotAqui"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                                lineNumber: 220,
                                                                columnNumber: 25
                                                            }, this),
                                                            botUsername && /*#__PURE__*/ _jsxDEV("button", {
                                                                type: "button",
                                                                onClick: ()=>updateBanner(banner.position, {
                                                                        link: `https://t.me/${botUsername}`
                                                                    }),
                                                                className: "px-3 py-2 rounded-md bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors whitespace-nowrap",
                                                                children: [
                                                                    "@",
                                                                    botUsername
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                                lineNumber: 228,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 219,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                lineNumber: 217,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>saveBanner(banner),
                                                disabled: saving[banner.position],
                                                className: "w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50",
                                                children: [
                                                    saving[banner.position] ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                        className: "h-4 w-4 animate-spin"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 245,
                                                        columnNumber: 50
                                                    }, this) : /*#__PURE__*/ _jsxDEV(Save, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 245,
                                                        columnNumber: 97
                                                    }, this),
                                                    saving[banner.position] ? "Salvando..." : "Salvar Banner"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                lineNumber: 240,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-xs font-medium text-muted-foreground mb-2",
                                                        children: "Pré-visualização"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 251,
                                                        columnNumber: 23
                                                    }, this),
                                                    banner.type === "popup" ? /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "relative rounded-xl border border-dashed border-primary/30 p-4 bg-muted/20",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("div", {
                                                                className: "rounded-xl border border-primary/20 bg-card p-4 text-center space-y-2 max-w-[240px] mx-auto shadow-lg",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                                        className: "text-2xl",
                                                                        children: "📢"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                                        lineNumber: 255,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("h3", {
                                                                        className: "text-sm font-bold text-foreground",
                                                                        children: banner.title || "Título do Pop-up"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                                        lineNumber: 256,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: banner.subtitle || "Subtítulo do pop-up"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                                        lineNumber: 257,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    banner.link && /*#__PURE__*/ _jsxDEV("div", {
                                                                        className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold",
                                                                        children: "Acessar agora"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                                        lineNumber: 259,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                                lineNumber: 254,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                className: "text-center text-xs text-muted-foreground mt-2",
                                                                children: "Este banner abrirá como pop-up central"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                                lineNumber: 264,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 253,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ _jsxDEV(PromoBanner, {
                                                        title: banner.title || undefined,
                                                        subtitle: banner.subtitle || undefined,
                                                        link: banner.link || undefined,
                                                        visible: true
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                                        lineNumber: 267,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                                lineNumber: 250,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BannersManager.tsx",
                                        lineNumber: 171,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BannersManager.tsx",
                                    lineNumber: 164,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BannersManager.tsx",
                                lineNumber: 162,
                                columnNumber: 13
                            }, this)
                        ]
                    }, banner.id, true, {
                        fileName: "/dev-server/src/components/BannersManager.tsx",
                        lineNumber: 125,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "/dev-server/src/components/BannersManager.tsx",
                lineNumber: 123,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/BannersManager.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
_s(BannersManager, "Ebs5/qTc2dKJPL6XCuPVSbHo9lw=");
_c = BannersManager;
var _c;
$RefreshReg$(_c, "BannersManager");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/BannersManager.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/BannersManager.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhbm5lcnNNYW5hZ2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjaywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBzdXBhYmFzZSB9IGZyb20gXCJAL2ludGVncmF0aW9ucy9zdXBhYmFzZS9jbGllbnRcIjtcbmltcG9ydCB7IFByb21vQmFubmVyIH0gZnJvbSBcIi4vUHJvbW9CYW5uZXJcIjtcbmltcG9ydCB7IFBvcHVwQmFubmVyIH0gZnJvbSBcIi4vUG9wdXBCYW5uZXJcIjtcbmltcG9ydCB7IFRvZ2dsZUxlZnQsIFRvZ2dsZVJpZ2h0LCBaYXAsIFNhdmUsIExvYWRlcjIsIFBsdXMsIFRyYXNoMiB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcbmltcG9ydCB7IHN0eWxlZFRvYXN0IGFzIHRvYXN0IH0gZnJvbSBcIkAvbGliL3RvYXN0XCI7XG5pbXBvcnQgeyBtb3Rpb24sIEFuaW1hdGVQcmVzZW5jZSB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5cbmludGVyZmFjZSBCYW5uZXJEYXRhIHtcbiAgaWQ6IHN0cmluZztcbiAgcG9zaXRpb246IG51bWJlcjtcbiAgdHlwZTogXCJiYW5uZXJcIiB8IFwicG9wdXBcIiB8IFwic2xpZGVcIjtcbiAgdGl0bGU6IHN0cmluZztcbiAgc3VidGl0bGU6IHN0cmluZztcbiAgbGluazogc3RyaW5nO1xuICBlbmFibGVkOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgQmFubmVyc01hbmFnZXJQcm9wcyB7XG4gIGJvdFVzZXJuYW1lPzogc3RyaW5nIHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJhbm5lcnNNYW5hZ2VyKHsgYm90VXNlcm5hbWUgfTogQmFubmVyc01hbmFnZXJQcm9wcykge1xuICBjb25zdCBbYmFubmVycywgc2V0QmFubmVyc10gPSB1c2VTdGF0ZTxCYW5uZXJEYXRhW10+KFtdKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtzYXZpbmcsIHNldFNhdmluZ10gPSB1c2VTdGF0ZTxSZWNvcmQ8bnVtYmVyLCBib29sZWFuPj4oe30pO1xuICBjb25zdCBbZXhwYW5kZWRCYW5uZXIsIHNldEV4cGFuZGVkQmFubmVyXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpO1xuXG4gIGNvbnN0IGluaXRpYWxMb2FkRG9uZSA9IHVzZVJlZihmYWxzZSk7XG5cbiAgY29uc3QgZmV0Y2hCYW5uZXJzID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAuZnJvbShcImJhbm5lcnNcIilcbiAgICAgICAgLnNlbGVjdChcIipcIilcbiAgICAgICAgLm9yZGVyKFwicG9zaXRpb25cIik7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICAgICAgc2V0QmFubmVycygoZGF0YSB8fCBbXSkubWFwKGIgPT4gKHtcbiAgICAgICAgLi4uYixcbiAgICAgICAgdHlwZTogYi50eXBlIGFzIFwiYmFubmVyXCIgfCBcInBvcHVwXCIgfCBcInNsaWRlXCIsXG4gICAgICB9KSkpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdG9hc3QuZXJyb3IoXCJFcnJvIGFvIGNhcnJlZ2FyIGJhbm5lcnNcIik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICghaW5pdGlhbExvYWREb25lLmN1cnJlbnQpIHtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgIGluaXRpYWxMb2FkRG9uZS5jdXJyZW50ID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIFtdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4geyBmZXRjaEJhbm5lcnMoKTsgfSwgW2ZldGNoQmFubmVyc10pO1xuXG4gIGNvbnN0IHVwZGF0ZUJhbm5lciA9IChwb3NpdGlvbjogbnVtYmVyLCB1cGRhdGVzOiBQYXJ0aWFsPEJhbm5lckRhdGE+KSA9PiB7XG4gICAgc2V0QmFubmVycyhwcmV2ID0+IHByZXYubWFwKGIgPT4gYi5wb3NpdGlvbiA9PT0gcG9zaXRpb24gPyB7IC4uLmIsIC4uLnVwZGF0ZXMgfSA6IGIpKTtcbiAgfTtcblxuICBjb25zdCB0b2dnbGVCYW5uZXIgPSBhc3luYyAoYmFubmVyOiBCYW5uZXJEYXRhKSA9PiB7XG4gICAgY29uc3QgbmV3RW5hYmxlZCA9ICFiYW5uZXIuZW5hYmxlZDtcbiAgICB1cGRhdGVCYW5uZXIoYmFubmVyLnBvc2l0aW9uLCB7IGVuYWJsZWQ6IG5ld0VuYWJsZWQgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKFwiYmFubmVyc1wiKVxuICAgICAgICAudXBkYXRlKHsgZW5hYmxlZDogbmV3RW5hYmxlZCwgdXBkYXRlZF9hdDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpIH0pXG4gICAgICAgIC5lcShcImlkXCIsIGJhbm5lci5pZCk7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICAgICAgdG9hc3Quc3VjY2VzcyhuZXdFbmFibGVkID8gYEJhbm5lciAke2Jhbm5lci5wb3NpdGlvbn0gYXRpdmFkbyFgIDogYEJhbm5lciAke2Jhbm5lci5wb3NpdGlvbn0gZGVzYXRpdmFkbyFgKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHVwZGF0ZUJhbm5lcihiYW5uZXIucG9zaXRpb24sIHsgZW5hYmxlZDogIW5ld0VuYWJsZWQgfSk7XG4gICAgICB0b2FzdC5lcnJvcihcIkVycm8gYW8gYWx0ZXJhciBiYW5uZXJcIik7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHNhdmVCYW5uZXIgPSBhc3luYyAoYmFubmVyOiBCYW5uZXJEYXRhKSA9PiB7XG4gICAgc2V0U2F2aW5nKHByZXYgPT4gKHsgLi4ucHJldiwgW2Jhbm5lci5wb3NpdGlvbl06IHRydWUgfSkpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAuZnJvbShcImJhbm5lcnNcIilcbiAgICAgICAgLnVwZGF0ZSh7XG4gICAgICAgICAgdHlwZTogYmFubmVyLnR5cGUsXG4gICAgICAgICAgdGl0bGU6IGJhbm5lci50aXRsZSxcbiAgICAgICAgICBzdWJ0aXRsZTogYmFubmVyLnN1YnRpdGxlLFxuICAgICAgICAgIGxpbms6IGJhbm5lci5saW5rLFxuICAgICAgICAgIHVwZGF0ZWRfYXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcbiAgICAgICAgfSlcbiAgICAgICAgLmVxKFwiaWRcIiwgYmFubmVyLmlkKTtcbiAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG4gICAgICB0b2FzdC5zdWNjZXNzKGBCYW5uZXIgJHtiYW5uZXIucG9zaXRpb259IHNhbHZvIWApO1xuICAgIH0gY2F0Y2gge1xuICAgICAgdG9hc3QuZXJyb3IoXCJFcnJvIGFvIHNhbHZhciBiYW5uZXJcIik7XG4gICAgfVxuICAgIHNldFNhdmluZyhwcmV2ID0+ICh7IC4uLnByZXYsIFtiYW5uZXIucG9zaXRpb25dOiBmYWxzZSB9KSk7XG4gIH07XG5cbiAgY29uc3QgdHlwZUxhYmVsczogUmVjb3JkPHN0cmluZywgeyBsYWJlbDogc3RyaW5nOyBlbW9qaTogc3RyaW5nIH0+ID0ge1xuICAgIGJhbm5lcjogeyBsYWJlbDogXCJCYW5uZXIgVG9wb1wiLCBlbW9qaTogXCLwn5OiXCIgfSxcbiAgICBwb3B1cDogeyBsYWJlbDogXCJQb3AtdXAgQ2VudHJhbFwiLCBlbW9qaTogXCLwn5KsXCIgfSxcbiAgICBzbGlkZTogeyBsYWJlbDogXCJTbGlkZSBBbmltYWRvXCIsIGVtb2ppOiBcIvCfjp7vuI9cIiB9LFxuICB9O1xuXG4gIGlmIChsb2FkaW5nKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLXhsIHAtNlwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgIDxMb2FkZXIyIGNsYXNzTmFtZT1cImgtNCB3LTQgYW5pbWF0ZS1zcGluXCIgLz5cbiAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtXCI+Q2FycmVnYW5kbyBiYW5uZXJzLi4uPC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLXhsIHAtNiBzcGFjZS15LTRcIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgIDxaYXAgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LXdhcm5pbmdcIiAvPiDwn5OiIEJhbm5lcnMgUHJvbW9jaW9uYWlzXG4gICAgICAgIDwvaDQ+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGJnLW11dGVkLzYwIHB4LTIgcHktMSByb3VuZGVkLWxnXCI+XG4gICAgICAgICAgTcOheC4gMyBiYW5uZXJzXG4gICAgICAgIDwvc3Bhbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktM1wiPlxuICAgICAgICB7YmFubmVycy5tYXAoKGJhbm5lcikgPT4gKFxuICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgIGtleT17YmFubmVyLmlkfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtgcm91bmRlZC14bCBib3JkZXIgdHJhbnNpdGlvbi1jb2xvcnMgJHtcbiAgICAgICAgICAgICAgYmFubmVyLmVuYWJsZWQgPyBcImJvcmRlci1wcmltYXJ5LzMwIGJnLXByaW1hcnkvNVwiIDogXCJib3JkZXItYm9yZGVyIGJnLWNhcmRcIlxuICAgICAgICAgICAgfWB9XG4gICAgICAgICAgPlxuICAgICAgICAgICAgey8qIEJhbm5lciBoZWFkZXIgKi99XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweC00IHB5LTMgY3Vyc29yLXBvaW50ZXJcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRFeHBhbmRlZEJhbm5lcihleHBhbmRlZEJhbm5lciA9PT0gYmFubmVyLnBvc2l0aW9uID8gbnVsbCA6IGJhbm5lci5wb3NpdGlvbil9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LWxnXCI+e3R5cGVMYWJlbHNbYmFubmVyLnR5cGVdPy5lbW9qaSB8fCBcIvCfk6JcIn08L3NwYW4+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgQmFubmVyIHtiYW5uZXIucG9zaXRpb259IOKAlCB7dHlwZUxhYmVsc1tiYW5uZXIudHlwZV0/LmxhYmVsIHx8IGJhbm5lci50eXBlfVxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQgdHJ1bmNhdGUgbWF4LXctWzIwMHB4XVwiPlxuICAgICAgICAgICAgICAgICAgICB7YmFubmVyLnRpdGxlIHx8IFwiU2VtIHTDrXR1bG9cIn1cbiAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4geyBlLnN0b3BQcm9wYWdhdGlvbigpOyB0b2dnbGVCYW5uZXIoYmFubmVyKTsgfX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgcHgtMi41IHB5LTEgcm91bmRlZC1sZyB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvbi1jb2xvcnMgJHtcbiAgICAgICAgICAgICAgICAgICAgYmFubmVyLmVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgICA/IFwiYmctc3VjY2Vzcy8xNSB0ZXh0LXN1Y2Nlc3NcIlxuICAgICAgICAgICAgICAgICAgICAgIDogXCJiZy1tdXRlZC82MCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIlxuICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge2Jhbm5lci5lbmFibGVkID8gPD48VG9nZ2xlUmlnaHQgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjVcIiAvPiBPbjwvPiA6IDw+PFRvZ2dsZUxlZnQgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjVcIiAvPiBPZmY8Lz59XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsvKiBFeHBhbmRlZCBmb3JtICovfVxuICAgICAgICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICAgICAge2V4cGFuZGVkQmFubmVyID09PSBiYW5uZXIucG9zaXRpb24gJiYgKFxuICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IGhlaWdodDogMCwgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBoZWlnaHQ6IFwiYXV0b1wiLCBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICAgICAgICBleGl0PXt7IGhlaWdodDogMCwgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC4yIH19XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtNCBwYi00IHNwYWNlLXktMyBib3JkZXItdCBib3JkZXItYm9yZGVyLzUwIHB0LTNcIj5cbiAgICAgICAgICAgICAgICAgICAgey8qIFR5cGUgc2VsZWN0b3IgKi99XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1tZWRpdW0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1iLTEuNVwiPlRpcG8gZG8gQmFubmVyPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHsoW1wiYmFubmVyXCIsIFwicG9wdXBcIiwgXCJzbGlkZVwiXSBhcyBjb25zdCkubWFwKCh0KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdXBkYXRlQmFubmVyKGJhbm5lci5wb3NpdGlvbiwgeyB0eXBlOiB0IH0pfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtMSBweS0yIHB4LTMgcm91bmRlZC1sZyB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvbi1jb2xvcnMgYm9yZGVyICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYW5uZXIudHlwZSA9PT0gdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiYm9yZGVyLXByaW1hcnkgYmctcHJpbWFyeS8xMCB0ZXh0LXByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiYm9yZGVyLWJvcmRlciBiZy1iYWNrZ3JvdW5kIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3ZlcjpiZy1tdXRlZC80MFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dHlwZUxhYmVsc1t0XS5lbW9qaX0ge3R5cGVMYWJlbHNbdF0ubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIHsvKiBUaXRsZSAqL31cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LWZvcmVncm91bmQgbWItMVwiPlTDrXR1bG88L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2Jhbm5lci50aXRsZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gdXBkYXRlQmFubmVyKGJhbm5lci5wb3NpdGlvbiwgeyB0aXRsZTogZS50YXJnZXQudmFsdWUgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yIHJvdW5kZWQtbWQgYm9yZGVyIGJvcmRlci1pbnB1dCBiZy1iYWNrZ3JvdW5kIHRleHQtZm9yZWdyb3VuZCB0ZXh0LXNtIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1yaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwi8J+agCBUw610dWxvIGRvIGJhbm5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgey8qIFN1YnRpdGxlICovfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZCBtYi0xXCI+U3VidMOtdHVsbzwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17YmFubmVyLnN1YnRpdGxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB1cGRhdGVCYW5uZXIoYmFubmVyLnBvc2l0aW9uLCB7IHN1YnRpdGxlOiBlLnRhcmdldC52YWx1ZSB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweC0zIHB5LTIgcm91bmRlZC1tZCBib3JkZXIgYm9yZGVyLWlucHV0IGJnLWJhY2tncm91bmQgdGV4dC1mb3JlZ3JvdW5kIHRleHQtc20gZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXJpbmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCLwn5OxIERlc2NyacOnw6NvIGRvIGJhbm5lclwiXG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICAgICAgey8qIExpbmsgKi99XG4gICAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kIG1iLTFcIj7wn5SXIExpbms8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2Jhbm5lci5saW5rfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHVwZGF0ZUJhbm5lcihiYW5uZXIucG9zaXRpb24sIHsgbGluazogZS50YXJnZXQudmFsdWUgfSl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBweC0zIHB5LTIgcm91bmRlZC1tZCBib3JkZXIgYm9yZGVyLWlucHV0IGJnLWJhY2tncm91bmQgdGV4dC1mb3JlZ3JvdW5kIHRleHQtc20gZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXJpbmdcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cImh0dHBzOi8vdC5tZS9TZXVCb3RBcXVpXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Ym90VXNlcm5hbWUgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdXBkYXRlQmFubmVyKGJhbm5lci5wb3NpdGlvbiwgeyBsaW5rOiBgaHR0cHM6Ly90Lm1lLyR7Ym90VXNlcm5hbWV9YCB9KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC0zIHB5LTIgcm91bmRlZC1tZCBiZy1wcmltYXJ5LzE1IHRleHQtcHJpbWFyeSB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgaG92ZXI6YmctcHJpbWFyeS8yNSB0cmFuc2l0aW9uLWNvbG9ycyB3aGl0ZXNwYWNlLW5vd3JhcFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAe2JvdFVzZXJuYW1lfVxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIHsvKiBTYXZlIGJ1dHRvbiAqL31cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNhdmVCYW5uZXIoYmFubmVyKX1cbiAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17c2F2aW5nW2Jhbm5lci5wb3NpdGlvbl19XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB5LTIuNSByb3VuZGVkLWxnIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgZm9udC1zZW1pYm9sZCB0ZXh0LXNtIGhvdmVyOmJnLXByaW1hcnkvOTAgdHJhbnNpdGlvbi1jb2xvcnMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgZGlzYWJsZWQ6b3BhY2l0eS01MFwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7c2F2aW5nW2Jhbm5lci5wb3NpdGlvbl0gPyA8TG9hZGVyMiBjbGFzc05hbWU9XCJoLTQgdy00IGFuaW1hdGUtc3BpblwiIC8+IDogPFNhdmUgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+fVxuICAgICAgICAgICAgICAgICAgICAgIHtzYXZpbmdbYmFubmVyLnBvc2l0aW9uXSA/IFwiU2FsdmFuZG8uLi5cIiA6IFwiU2FsdmFyIEJhbm5lclwifVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICAgICAgICB7LyogUHJldmlldyAqL31cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LW1lZGl1bSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbWItMlwiPlByw6ktdmlzdWFsaXphw6fDo288L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgIHtiYW5uZXIudHlwZSA9PT0gXCJwb3B1cFwiID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItZGFzaGVkIGJvcmRlci1wcmltYXJ5LzMwIHAtNCBiZy1tdXRlZC8yMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIGJnLWNhcmQgcC00IHRleHQtY2VudGVyIHNwYWNlLXktMiBtYXgtdy1bMjQwcHhdIG14LWF1dG8gc2hhZG93LWxnXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC0yeGxcIj7wn5OiPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57YmFubmVyLnRpdGxlIHx8IFwiVMOtdHVsbyBkbyBQb3AtdXBcIn08L2gzPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+e2Jhbm5lci5zdWJ0aXRsZSB8fCBcIlN1YnTDrXR1bG8gZG8gcG9wLXVwXCJ9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtiYW5uZXIubGluayAmJiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMSBweC0zIHB5LTEuNSByb3VuZGVkLWxnIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgdGV4dC14cyBmb250LXNlbWlib2xkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjZXNzYXIgYWdvcmFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciB0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtdC0yXCI+RXN0ZSBiYW5uZXIgYWJyaXLDoSBjb21vIHBvcC11cCBjZW50cmFsPC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxQcm9tb0Jhbm5lclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aXRsZT17YmFubmVyLnRpdGxlIHx8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3VidGl0bGU9e2Jhbm5lci5zdWJ0aXRsZSB8fCB1bmRlZmluZWR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGxpbms9e2Jhbm5lci5saW5rIHx8IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZT17dHJ1ZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKSl9XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsInVzZUNhbGxiYWNrIiwidXNlUmVmIiwic3VwYWJhc2UiLCJQcm9tb0Jhbm5lciIsIlRvZ2dsZUxlZnQiLCJUb2dnbGVSaWdodCIsIlphcCIsIlNhdmUiLCJMb2FkZXIyIiwic3R5bGVkVG9hc3QiLCJ0b2FzdCIsIm1vdGlvbiIsIkFuaW1hdGVQcmVzZW5jZSIsIkJhbm5lcnNNYW5hZ2VyIiwiYm90VXNlcm5hbWUiLCJiYW5uZXJzIiwic2V0QmFubmVycyIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwic2F2aW5nIiwic2V0U2F2aW5nIiwiZXhwYW5kZWRCYW5uZXIiLCJzZXRFeHBhbmRlZEJhbm5lciIsImluaXRpYWxMb2FkRG9uZSIsImZldGNoQmFubmVycyIsImRhdGEiLCJlcnJvciIsImZyb20iLCJzZWxlY3QiLCJvcmRlciIsIm1hcCIsImIiLCJ0eXBlIiwiY3VycmVudCIsInVwZGF0ZUJhbm5lciIsInBvc2l0aW9uIiwidXBkYXRlcyIsInByZXYiLCJ0b2dnbGVCYW5uZXIiLCJiYW5uZXIiLCJuZXdFbmFibGVkIiwiZW5hYmxlZCIsInVwZGF0ZSIsInVwZGF0ZWRfYXQiLCJEYXRlIiwidG9JU09TdHJpbmciLCJlcSIsImlkIiwic3VjY2VzcyIsInNhdmVCYW5uZXIiLCJ0aXRsZSIsInN1YnRpdGxlIiwibGluayIsInR5cGVMYWJlbHMiLCJsYWJlbCIsImVtb2ppIiwicG9wdXAiLCJzbGlkZSIsImRpdiIsImNsYXNzTmFtZSIsInNwYW4iLCJoNCIsIm9uQ2xpY2siLCJwIiwiYnV0dG9uIiwiZSIsInN0b3BQcm9wYWdhdGlvbiIsImluaXRpYWwiLCJoZWlnaHQiLCJvcGFjaXR5IiwiYW5pbWF0ZSIsImV4aXQiLCJ0cmFuc2l0aW9uIiwiZHVyYXRpb24iLCJ0IiwiaW5wdXQiLCJ2YWx1ZSIsIm9uQ2hhbmdlIiwidGFyZ2V0IiwicGxhY2Vob2xkZXIiLCJkaXNhYmxlZCIsImgzIiwidW5kZWZpbmVkIiwidmlzaWJsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsUUFBUSxFQUFFQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsTUFBTSxRQUFRLFFBQVE7QUFDakUsU0FBU0MsUUFBUSxRQUFRLGlDQUFpQztBQUMxRCxTQUFTQyxXQUFXLFFBQVEsZ0JBQWdCO0FBRTVDLFNBQVNDLFVBQVUsRUFBRUMsV0FBVyxFQUFFQyxHQUFHLEVBQUVDLElBQUksRUFBRUMsT0FBTyxRQUFzQixlQUFlO0FBQ3pGLFNBQVNDLGVBQWVDLEtBQUssUUFBUSxjQUFjO0FBQ25ELFNBQVNDLE1BQU0sRUFBRUMsZUFBZSxRQUFRLGdCQUFnQjtBQWdCeEQsT0FBTyxTQUFTQyxlQUFlLEVBQUVDLFdBQVcsRUFBdUI7O0lBQ2pFLE1BQU0sQ0FBQ0MsU0FBU0MsV0FBVyxHQUFHbEIsU0FBdUIsRUFBRTtJQUN2RCxNQUFNLENBQUNtQixTQUFTQyxXQUFXLEdBQUdwQixTQUFTO0lBQ3ZDLE1BQU0sQ0FBQ3FCLFFBQVFDLFVBQVUsR0FBR3RCLFNBQWtDLENBQUM7SUFDL0QsTUFBTSxDQUFDdUIsZ0JBQWdCQyxrQkFBa0IsR0FBR3hCLFNBQXdCO0lBRXBFLE1BQU15QixrQkFBa0J0QixPQUFPO0lBRS9CLE1BQU11QixlQUFleEIsWUFBWTtRQUMvQixJQUFJO1lBQ0YsTUFBTSxFQUFFeUIsSUFBSSxFQUFFQyxLQUFLLEVBQUUsR0FBRyxNQUFNeEIsU0FDM0J5QixJQUFJLENBQUMsV0FDTEMsTUFBTSxDQUFDLEtBQ1BDLEtBQUssQ0FBQztZQUNULElBQUlILE9BQU8sTUFBTUE7WUFDakJWLFdBQVcsQUFBQ1MsQ0FBQUEsUUFBUSxFQUFFLEFBQUQsRUFBR0ssR0FBRyxDQUFDQyxDQUFBQSxJQUFNLENBQUE7b0JBQ2hDLEdBQUdBLENBQUM7b0JBQ0pDLE1BQU1ELEVBQUVDLElBQUk7Z0JBQ2QsQ0FBQTtRQUNGLEVBQUUsT0FBTTtZQUNOdEIsTUFBTWdCLEtBQUssQ0FBQztRQUNkLFNBQVU7WUFDUixJQUFJLENBQUNILGdCQUFnQlUsT0FBTyxFQUFFO2dCQUM1QmYsV0FBVztnQkFDWEssZ0JBQWdCVSxPQUFPLEdBQUc7WUFDNUI7UUFDRjtJQUNGLEdBQUcsRUFBRTtJQUVMbEMsVUFBVTtRQUFReUI7SUFBZ0IsR0FBRztRQUFDQTtLQUFhO0lBRW5ELE1BQU1VLGVBQWUsQ0FBQ0MsVUFBa0JDO1FBQ3RDcEIsV0FBV3FCLENBQUFBLE9BQVFBLEtBQUtQLEdBQUcsQ0FBQ0MsQ0FBQUEsSUFBS0EsRUFBRUksUUFBUSxLQUFLQSxXQUFXO29CQUFFLEdBQUdKLENBQUM7b0JBQUUsR0FBR0ssT0FBTztnQkFBQyxJQUFJTDtJQUNwRjtJQUVBLE1BQU1PLGVBQWUsT0FBT0M7UUFDMUIsTUFBTUMsYUFBYSxDQUFDRCxPQUFPRSxPQUFPO1FBQ2xDUCxhQUFhSyxPQUFPSixRQUFRLEVBQUU7WUFBRU0sU0FBU0Q7UUFBVztRQUNwRCxJQUFJO1lBQ0YsTUFBTSxFQUFFZCxLQUFLLEVBQUUsR0FBRyxNQUFNeEIsU0FDckJ5QixJQUFJLENBQUMsV0FDTGUsTUFBTSxDQUFDO2dCQUFFRCxTQUFTRDtnQkFBWUcsWUFBWSxJQUFJQyxPQUFPQyxXQUFXO1lBQUcsR0FDbkVDLEVBQUUsQ0FBQyxNQUFNUCxPQUFPUSxFQUFFO1lBQ3JCLElBQUlyQixPQUFPLE1BQU1BO1lBQ2pCaEIsTUFBTXNDLE9BQU8sQ0FBQ1IsYUFBYSxDQUFDLE9BQU8sRUFBRUQsT0FBT0osUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFSSxPQUFPSixRQUFRLENBQUMsWUFBWSxDQUFDO1FBQzNHLEVBQUUsT0FBTTtZQUNORCxhQUFhSyxPQUFPSixRQUFRLEVBQUU7Z0JBQUVNLFNBQVMsQ0FBQ0Q7WUFBVztZQUNyRDlCLE1BQU1nQixLQUFLLENBQUM7UUFDZDtJQUNGO0lBRUEsTUFBTXVCLGFBQWEsT0FBT1Y7UUFDeEJuQixVQUFVaUIsQ0FBQUEsT0FBUyxDQUFBO2dCQUFFLEdBQUdBLElBQUk7Z0JBQUUsQ0FBQ0UsT0FBT0osUUFBUSxDQUFDLEVBQUU7WUFBSyxDQUFBO1FBQ3RELElBQUk7WUFDRixNQUFNLEVBQUVULEtBQUssRUFBRSxHQUFHLE1BQU14QixTQUNyQnlCLElBQUksQ0FBQyxXQUNMZSxNQUFNLENBQUM7Z0JBQ05WLE1BQU1PLE9BQU9QLElBQUk7Z0JBQ2pCa0IsT0FBT1gsT0FBT1csS0FBSztnQkFDbkJDLFVBQVVaLE9BQU9ZLFFBQVE7Z0JBQ3pCQyxNQUFNYixPQUFPYSxJQUFJO2dCQUNqQlQsWUFBWSxJQUFJQyxPQUFPQyxXQUFXO1lBQ3BDLEdBQ0NDLEVBQUUsQ0FBQyxNQUFNUCxPQUFPUSxFQUFFO1lBQ3JCLElBQUlyQixPQUFPLE1BQU1BO1lBQ2pCaEIsTUFBTXNDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRVQsT0FBT0osUUFBUSxDQUFDLE9BQU8sQ0FBQztRQUNsRCxFQUFFLE9BQU07WUFDTnpCLE1BQU1nQixLQUFLLENBQUM7UUFDZDtRQUNBTixVQUFVaUIsQ0FBQUEsT0FBUyxDQUFBO2dCQUFFLEdBQUdBLElBQUk7Z0JBQUUsQ0FBQ0UsT0FBT0osUUFBUSxDQUFDLEVBQUU7WUFBTSxDQUFBO0lBQ3pEO0lBRUEsTUFBTWtCLGFBQStEO1FBQ25FZCxRQUFRO1lBQUVlLE9BQU87WUFBZUMsT0FBTztRQUFLO1FBQzVDQyxPQUFPO1lBQUVGLE9BQU87WUFBa0JDLE9BQU87UUFBSztRQUM5Q0UsT0FBTztZQUFFSCxPQUFPO1lBQWlCQyxPQUFPO1FBQU07SUFDaEQ7SUFFQSxJQUFJdEMsU0FBUztRQUNYLHFCQUNFLFFBQUN5QztZQUFJQyxXQUFVO3NCQUNiLGNBQUEsUUFBQ0Q7Z0JBQUlDLFdBQVU7O2tDQUNiLFFBQUNuRDt3QkFBUW1ELFdBQVU7Ozs7OztrQ0FDbkIsUUFBQ0M7d0JBQUtELFdBQVU7a0NBQVU7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBSWxDO0lBRUEscUJBQ0UsUUFBQ0Q7UUFBSUMsV0FBVTs7MEJBQ2IsUUFBQ0Q7Z0JBQUlDLFdBQVU7O2tDQUNiLFFBQUNFO3dCQUFHRixXQUFVOzswQ0FDWixRQUFDckQ7Z0NBQUlxRCxXQUFVOzs7Ozs7NEJBQXlCOzs7Ozs7O2tDQUUxQyxRQUFDQzt3QkFBS0QsV0FBVTtrQ0FBaUU7Ozs7Ozs7Ozs7OzswQkFLbkYsUUFBQ0Q7Z0JBQUlDLFdBQVU7MEJBQ1o1QyxRQUFRZSxHQUFHLENBQUMsQ0FBQ1MsdUJBQ1osUUFBQ21CO3dCQUVDQyxXQUFXLENBQUMsb0NBQW9DLEVBQzlDcEIsT0FBT0UsT0FBTyxHQUFHLG1DQUFtQyx5QkFDcEQ7OzBDQUdGLFFBQUNpQjtnQ0FDQ0MsV0FBVTtnQ0FDVkcsU0FBUyxJQUFNeEMsa0JBQWtCRCxtQkFBbUJrQixPQUFPSixRQUFRLEdBQUcsT0FBT0ksT0FBT0osUUFBUTs7a0RBRTVGLFFBQUN1Qjt3Q0FBSUMsV0FBVTs7MERBQ2IsUUFBQ0M7Z0RBQUtELFdBQVU7MERBQVdOLFVBQVUsQ0FBQ2QsT0FBT1AsSUFBSSxDQUFDLEVBQUV1QixTQUFTOzs7Ozs7MERBQzdELFFBQUNHOztrRUFDQyxRQUFDSzt3REFBRUosV0FBVTs7NERBQXdDOzREQUMzQ3BCLE9BQU9KLFFBQVE7NERBQUM7NERBQUlrQixVQUFVLENBQUNkLE9BQU9QLElBQUksQ0FBQyxFQUFFc0IsU0FBU2YsT0FBT1AsSUFBSTs7Ozs7OztrRUFFM0UsUUFBQytCO3dEQUFFSixXQUFVO2tFQUNWcEIsT0FBT1csS0FBSyxJQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7a0RBSXZCLFFBQUNRO3dDQUFJQyxXQUFVO2tEQUNiLGNBQUEsUUFBQ0s7NENBQ0NGLFNBQVMsQ0FBQ0c7Z0RBQVFBLEVBQUVDLGVBQWU7Z0RBQUk1QixhQUFhQzs0Q0FBUzs0Q0FDN0RvQixXQUFXLENBQUMseUZBQXlGLEVBQ25HcEIsT0FBT0UsT0FBTyxHQUNWLCtCQUNBLHFDQUNKO3NEQUVERixPQUFPRSxPQUFPLGlCQUFHOztrRUFBRSxRQUFDcEM7d0RBQVlzRCxXQUFVOzs7Ozs7b0RBQWdCOzs2RUFBUzs7a0VBQUUsUUFBQ3ZEO3dEQUFXdUQsV0FBVTs7Ozs7O29EQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7OzswQ0FNbEgsUUFBQy9DOzBDQUNFUyxtQkFBbUJrQixPQUFPSixRQUFRLGtCQUNqQyxRQUFDeEIsT0FBTytDLEdBQUc7b0NBQ1RTLFNBQVM7d0NBQUVDLFFBQVE7d0NBQUdDLFNBQVM7b0NBQUU7b0NBQ2pDQyxTQUFTO3dDQUFFRixRQUFRO3dDQUFRQyxTQUFTO29DQUFFO29DQUN0Q0UsTUFBTTt3Q0FBRUgsUUFBUTt3Q0FBR0MsU0FBUztvQ0FBRTtvQ0FDOUJHLFlBQVk7d0NBQUVDLFVBQVU7b0NBQUk7b0NBQzVCZCxXQUFVOzhDQUVWLGNBQUEsUUFBQ0Q7d0NBQUlDLFdBQVU7OzBEQUViLFFBQUNEOztrRUFDQyxRQUFDSjt3REFBTUssV0FBVTtrRUFBeUQ7Ozs7OztrRUFDMUUsUUFBQ0Q7d0RBQUlDLFdBQVU7a0VBQ1osQUFBQzs0REFBQzs0REFBVTs0REFBUzt5REFBUSxDQUFXN0IsR0FBRyxDQUFDLENBQUM0QyxrQkFDNUMsUUFBQ1Y7Z0VBRUNGLFNBQVMsSUFBTTVCLGFBQWFLLE9BQU9KLFFBQVEsRUFBRTt3RUFBRUgsTUFBTTBDO29FQUFFO2dFQUN2RGYsV0FBVyxDQUFDLDJFQUEyRSxFQUNyRnBCLE9BQU9QLElBQUksS0FBSzBDLElBQ1osOENBQ0EsdUVBQ0o7O29FQUVEckIsVUFBVSxDQUFDcUIsRUFBRSxDQUFDbkIsS0FBSztvRUFBQztvRUFBRUYsVUFBVSxDQUFDcUIsRUFBRSxDQUFDcEIsS0FBSzs7K0RBUnJDb0I7Ozs7Ozs7Ozs7Ozs7Ozs7MERBZWIsUUFBQ2hCOztrRUFDQyxRQUFDSjt3REFBTUssV0FBVTtrRUFBaUQ7Ozs7OztrRUFDbEUsUUFBQ2dCO3dEQUNDM0MsTUFBSzt3REFDTDRDLE9BQU9yQyxPQUFPVyxLQUFLO3dEQUNuQjJCLFVBQVUsQ0FBQ1osSUFBTS9CLGFBQWFLLE9BQU9KLFFBQVEsRUFBRTtnRUFBRWUsT0FBT2UsRUFBRWEsTUFBTSxDQUFDRixLQUFLOzREQUFDO3dEQUN2RWpCLFdBQVU7d0RBQ1ZvQixhQUFZOzs7Ozs7Ozs7Ozs7MERBS2hCLFFBQUNyQjs7a0VBQ0MsUUFBQ0o7d0RBQU1LLFdBQVU7a0VBQWlEOzs7Ozs7a0VBQ2xFLFFBQUNnQjt3REFDQzNDLE1BQUs7d0RBQ0w0QyxPQUFPckMsT0FBT1ksUUFBUTt3REFDdEIwQixVQUFVLENBQUNaLElBQU0vQixhQUFhSyxPQUFPSixRQUFRLEVBQUU7Z0VBQUVnQixVQUFVYyxFQUFFYSxNQUFNLENBQUNGLEtBQUs7NERBQUM7d0RBQzFFakIsV0FBVTt3REFDVm9CLGFBQVk7Ozs7Ozs7Ozs7OzswREFLaEIsUUFBQ3JCOztrRUFDQyxRQUFDSjt3REFBTUssV0FBVTtrRUFBaUQ7Ozs7OztrRUFDbEUsUUFBQ0Q7d0RBQUlDLFdBQVU7OzBFQUNiLFFBQUNnQjtnRUFDQzNDLE1BQUs7Z0VBQ0w0QyxPQUFPckMsT0FBT2EsSUFBSTtnRUFDbEJ5QixVQUFVLENBQUNaLElBQU0vQixhQUFhSyxPQUFPSixRQUFRLEVBQUU7d0VBQUVpQixNQUFNYSxFQUFFYSxNQUFNLENBQUNGLEtBQUs7b0VBQUM7Z0VBQ3RFakIsV0FBVTtnRUFDVm9CLGFBQVk7Ozs7Ozs0REFFYmpFLDZCQUNDLFFBQUNrRDtnRUFDQ2hDLE1BQUs7Z0VBQ0w4QixTQUFTLElBQU01QixhQUFhSyxPQUFPSixRQUFRLEVBQUU7d0VBQUVpQixNQUFNLENBQUMsYUFBYSxFQUFFdEMsYUFBYTtvRUFBQztnRUFDbkY2QyxXQUFVOztvRUFDWDtvRUFDRzdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OzBEQU9WLFFBQUNrRDtnREFDQ0YsU0FBUyxJQUFNYixXQUFXVjtnREFDMUJ5QyxVQUFVN0QsTUFBTSxDQUFDb0IsT0FBT0osUUFBUSxDQUFDO2dEQUNqQ3dCLFdBQVU7O29EQUVUeEMsTUFBTSxDQUFDb0IsT0FBT0osUUFBUSxDQUFDLGlCQUFHLFFBQUMzQjt3REFBUW1ELFdBQVU7Ozs7OzZFQUE0QixRQUFDcEQ7d0RBQUtvRCxXQUFVOzs7Ozs7b0RBQ3pGeEMsTUFBTSxDQUFDb0IsT0FBT0osUUFBUSxDQUFDLEdBQUcsZ0JBQWdCOzs7Ozs7OzBEQUk3QyxRQUFDdUI7O2tFQUNDLFFBQUNKO3dEQUFNSyxXQUFVO2tFQUF1RDs7Ozs7O29EQUN2RXBCLE9BQU9QLElBQUksS0FBSyx3QkFDZixRQUFDMEI7d0RBQUlDLFdBQVU7OzBFQUNiLFFBQUNEO2dFQUFJQyxXQUFVOztrRkFDYixRQUFDQzt3RUFBS0QsV0FBVTtrRkFBVzs7Ozs7O2tGQUMzQixRQUFDc0I7d0VBQUd0QixXQUFVO2tGQUFxQ3BCLE9BQU9XLEtBQUssSUFBSTs7Ozs7O2tGQUNuRSxRQUFDYTt3RUFBRUosV0FBVTtrRkFBaUNwQixPQUFPWSxRQUFRLElBQUk7Ozs7OztvRUFDaEVaLE9BQU9hLElBQUksa0JBQ1YsUUFBQ007d0VBQUlDLFdBQVU7a0ZBQWlIOzs7Ozs7Ozs7Ozs7MEVBS3BJLFFBQUNJO2dFQUFFSixXQUFVOzBFQUFpRDs7Ozs7Ozs7Ozs7NkVBR2hFLFFBQUN4RDt3REFDQytDLE9BQU9YLE9BQU9XLEtBQUssSUFBSWdDO3dEQUN2Qi9CLFVBQVVaLE9BQU9ZLFFBQVEsSUFBSStCO3dEQUM3QjlCLE1BQU1iLE9BQU9hLElBQUksSUFBSThCO3dEQUNyQkMsU0FBUzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBakpsQjVDLE9BQU9RLEVBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7QUE4SjFCO0dBclFnQmxDO0tBQUFBIn0=