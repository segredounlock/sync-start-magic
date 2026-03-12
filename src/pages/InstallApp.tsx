import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/InstallApp.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/InstallApp.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { motion } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { Download, Smartphone, Share, Plus, Check, ArrowLeft, Apple, Monitor } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { Link } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import logo from "/src/assets/recargas-brasil-logo.jpeg?import";
export default function InstallApp() {
    _s();
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const [installing, setInstalling] = useState(false);
    useEffect(()=>{
        // Check if already installed
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
        setIsInstalled(isStandalone);
        // Detect platform
        const ua = navigator.userAgent;
        setIsIOS(/iPad|iPhone|iPod/.test(ua) && !window.MSStream);
        setIsAndroid(/Android/.test(ua));
        // Capture install prompt (Chrome/Edge/Samsung)
        const handler = (e)=>{
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener("beforeinstallprompt", handler);
        // Listen for successful install
        window.addEventListener("appinstalled", ()=>setIsInstalled(true));
        return ()=>window.removeEventListener("beforeinstallprompt", handler);
    }, []);
    const handleInstall = async ()=>{
        if (!deferredPrompt) return;
        setInstalling(true);
        try {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") setIsInstalled(true);
        } finally{
            setDeferredPrompt(null);
            setInstalling(false);
        }
    };
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "min-h-screen bg-background text-foreground",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border/50",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "flex items-center gap-3 px-4 py-3 max-w-lg mx-auto",
                    children: [
                        /*#__PURE__*/ _jsxDEV(Link, {
                            to: "/",
                            className: "p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors",
                            children: /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 63,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                            lineNumber: 62,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("h1", {
                            className: "text-lg font-bold",
                            children: "Instalar App"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/InstallApp.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/InstallApp.tsx",
                lineNumber: 60,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "max-w-lg mx-auto px-4 py-8 space-y-8",
                children: [
                    /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        className: "text-center space-y-4",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-primary/20",
                                children: /*#__PURE__*/ _jsxDEV("img", {
                                    src: logo,
                                    alt: "Recargas Brasil",
                                    className: "w-full h-full object-cover"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/InstallApp.tsx",
                                    lineNumber: 77,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                children: [
                                    /*#__PURE__*/ _jsxDEV("h2", {
                                        className: "text-2xl font-bold",
                                        children: "Recargas Brasil"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 80,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-muted-foreground mt-1",
                                        children: "Instale na tela inicial do seu celular"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 81,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 79,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    isInstalled && /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            scale: 0.95
                        },
                        animate: {
                            opacity: 1,
                            scale: 1
                        },
                        className: "bg-primary/10 border border-primary/30 rounded-2xl p-6 text-center space-y-3",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "w-14 h-14 mx-auto rounded-full bg-primary/20 flex items-center justify-center",
                                children: /*#__PURE__*/ _jsxDEV(Check, {
                                    className: "w-7 h-7 text-primary"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/InstallApp.tsx",
                                    lineNumber: 95,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 94,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("h3", {
                                className: "text-lg font-bold text-primary",
                                children: "App já instalado!"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-sm text-muted-foreground",
                                children: "O Recargas Brasil já está na sua tela inicial. Abra pelo ícone do app."
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                        lineNumber: 89,
                        columnNumber: 11
                    }, this),
                    !isInstalled && deferredPrompt && /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: 10
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: handleInstall,
                                disabled: installing,
                                className: "w-full py-4 px-6 bg-primary text-primary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-primary/25 hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Download, {
                                        className: "w-6 h-6"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 116,
                                        columnNumber: 15
                                    }, this),
                                    installing ? "Instalando..." : "Instalar App"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-xs text-center text-muted-foreground",
                                children: "Toque para adicionar à tela inicial do seu celular"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 119,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                        lineNumber: 106,
                        columnNumber: 11
                    }, this),
                    !isInstalled && /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: 10
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.1
                        },
                        className: "grid grid-cols-2 gap-3",
                        children: [
                            {
                                icon: Smartphone,
                                label: "Tela cheia",
                                desc: "Sem barra do navegador"
                            },
                            {
                                icon: Download,
                                label: "Acesso rápido",
                                desc: "Direto da tela inicial"
                            },
                            {
                                icon: Monitor,
                                label: "Funciona offline",
                                desc: "Cache inteligente"
                            },
                            {
                                icon: Check,
                                label: "Notificações",
                                desc: "Alertas em tempo real"
                            }
                        ].map((item, i)=>/*#__PURE__*/ _jsxDEV("div", {
                                className: "bg-card border border-border/50 rounded-xl p-4 space-y-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(item.icon, {
                                        className: "w-5 h-5 text-primary"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 140,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "font-semibold text-sm",
                                        children: item.label
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 141,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-xs text-muted-foreground",
                                        children: item.desc
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 142,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 139,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this),
                    !isInstalled && isIOS && /*#__PURE__*/ _jsxDEV(motion.div, {
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
                        className: "bg-card border border-border/50 rounded-2xl p-6 space-y-5",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "w-10 h-10 rounded-xl bg-muted flex items-center justify-center",
                                        children: /*#__PURE__*/ _jsxDEV(Apple, {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                            lineNumber: 158,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("h3", {
                                                className: "font-bold",
                                                children: "Instalar no iPhone"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 161,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "Siga os passos abaixo"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 162,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 160,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "space-y-5",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Step, {
                                        number: 1,
                                        icon: /*#__PURE__*/ _jsxDEV(Share, {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                            lineNumber: 167,
                                            columnNumber: 38
                                        }, this),
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                children: "Na barra inferior do Safari, toque no botão:"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 168,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "inline-flex items-center justify-center w-10 h-10 bg-[#007AFF] rounded-xl mx-1 align-middle shadow-md",
                                                children: /*#__PURE__*/ _jsxDEV("svg", {
                                                    width: "22",
                                                    height: "22",
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "white",
                                                    strokeWidth: "2",
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("path", {
                                                            d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                            lineNumber: 171,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("polyline", {
                                                            points: "16 6 12 2 8 6"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                            lineNumber: 172,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("line", {
                                                            x1: "12",
                                                            y1: "2",
                                                            x2: "12",
                                                            y2: "15"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                            lineNumber: 173,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                    lineNumber: 170,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 169,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-xs text-muted-foreground block mt-1",
                                                children: "(ícone de compartilhar do Safari)"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 176,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(Step, {
                                        number: 2,
                                        icon: /*#__PURE__*/ _jsxDEV(Plus, {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                            lineNumber: 178,
                                            columnNumber: 38
                                        }, this),
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                children: "Role o menu para baixo e toque em:"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 179,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "flex items-center gap-2 mt-2 bg-muted/60 border border-border/50 rounded-xl px-3 py-2.5 text-foreground text-sm font-medium",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "inline-flex items-center justify-center w-7 h-7 bg-muted rounded-lg shrink-0",
                                                        children: /*#__PURE__*/ _jsxDEV(Plus, {
                                                            className: "w-4 h-4"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                            lineNumber: 182,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                        lineNumber: 181,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Adicionar à Tela de Início"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 180,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 178,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(Step, {
                                        number: 3,
                                        icon: /*#__PURE__*/ _jsxDEV(Check, {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                            lineNumber: 187,
                                            columnNumber: 38
                                        }, this),
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                children: "No canto superior direito, toque em:"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 188,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "inline-flex items-center justify-center mt-2 bg-[#007AFF] text-white text-sm font-semibold rounded-lg px-4 py-1.5 shadow-sm",
                                                children: "Adicionar"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 189,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 187,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 166,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "bg-warning/10 border border-warning/20 rounded-xl p-3",
                                children: /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-xs text-warning-foreground/80",
                                    children: [
                                        "⚠️ Use o ",
                                        /*#__PURE__*/ _jsxDEV("strong", {
                                            children: "Safari"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                            lineNumber: 197,
                                            columnNumber: 26
                                        }, this),
                                        " para instalar no iPhone. Outros navegadores não suportam esta função no iOS."
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/InstallApp.tsx",
                                    lineNumber: 196,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                        lineNumber: 150,
                        columnNumber: 11
                    }, this),
                    !isInstalled && isAndroid && !deferredPrompt && /*#__PURE__*/ _jsxDEV(motion.div, {
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
                        className: "bg-card border border-border/50 rounded-2xl p-6 space-y-5",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "w-10 h-10 rounded-xl bg-muted flex items-center justify-center",
                                        children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                            lineNumber: 213,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 212,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("h3", {
                                                className: "font-bold",
                                                children: "Instalar no Android"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 216,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "Siga os passos abaixo"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 217,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 215,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 211,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Step, {
                                        number: 1,
                                        icon: /*#__PURE__*/ _jsxDEV("span", {
                                            className: "text-xs",
                                            children: "⋮"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                            lineNumber: 222,
                                            columnNumber: 38
                                        }, this),
                                        children: [
                                            "Toque no menu ",
                                            /*#__PURE__*/ _jsxDEV("strong", {
                                                children: "três pontos"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 223,
                                                columnNumber: 31
                                            }, this),
                                            " (⋮) no canto superior do Chrome"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 222,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(Step, {
                                        number: 2,
                                        icon: /*#__PURE__*/ _jsxDEV(Download, {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                            lineNumber: 225,
                                            columnNumber: 38
                                        }, this),
                                        children: [
                                            "Toque em ",
                                            /*#__PURE__*/ _jsxDEV("strong", {
                                                children: '"Instalar app"'
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 226,
                                                columnNumber: 26
                                            }, this),
                                            " ou ",
                                            /*#__PURE__*/ _jsxDEV("strong", {
                                                children: '"Adicionar à tela inicial"'
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 226,
                                                columnNumber: 61
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 225,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV(Step, {
                                        number: 3,
                                        icon: /*#__PURE__*/ _jsxDEV(Check, {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/InstallApp.tsx",
                                            lineNumber: 228,
                                            columnNumber: 38
                                        }, this),
                                        children: [
                                            "Confirme tocando em ",
                                            /*#__PURE__*/ _jsxDEV("strong", {
                                                children: '"Instalar"'
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                                lineNumber: 229,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                                        lineNumber: 228,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 221,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                        lineNumber: 205,
                        columnNumber: 11
                    }, this),
                    !isInstalled && !isIOS && !isAndroid && !deferredPrompt && /*#__PURE__*/ _jsxDEV(motion.div, {
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
                        className: "bg-card border border-border/50 rounded-2xl p-6 text-center space-y-3",
                        children: [
                            /*#__PURE__*/ _jsxDEV(Monitor, {
                                className: "w-8 h-8 mx-auto text-muted-foreground"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 243,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("h3", {
                                className: "font-bold",
                                children: "Acesse pelo celular"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 244,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-sm text-muted-foreground",
                                children: "Para instalar o app, abra este site no navegador do seu celular (Chrome no Android ou Safari no iPhone)."
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/InstallApp.tsx",
                                lineNumber: 245,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/InstallApp.tsx",
                        lineNumber: 237,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/InstallApp.tsx",
                lineNumber: 69,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/InstallApp.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(InstallApp, "u4VTxd2Q1tcG0pk+B+uAvM5W7JQ=");
_c = InstallApp;
function Step({ number, icon, children }) {
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "flex items-start gap-3",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 text-xs font-bold",
                children: number
            }, void 0, false, {
                fileName: "/dev-server/src/pages/InstallApp.tsx",
                lineNumber: 258,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("p", {
                className: "text-sm text-muted-foreground leading-relaxed pt-0.5",
                children: children
            }, void 0, false, {
                fileName: "/dev-server/src/pages/InstallApp.tsx",
                lineNumber: 261,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/InstallApp.tsx",
        lineNumber: 257,
        columnNumber: 5
    }, this);
}
_c1 = Step;
var _c, _c1;
$RefreshReg$(_c, "InstallApp");
$RefreshReg$(_c1, "Step");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/InstallApp.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/InstallApp.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3RhbGxBcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IG1vdGlvbiB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5pbXBvcnQgeyBEb3dubG9hZCwgU21hcnRwaG9uZSwgU2hhcmUsIFBsdXMsIENoZWNrLCBBcnJvd0xlZnQsIEFwcGxlLCBNb25pdG9yIH0gZnJvbSBcImx1Y2lkZS1yZWFjdFwiO1xuaW1wb3J0IHsgTGluayB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XG5pbXBvcnQgbG9nbyBmcm9tIFwiQC9hc3NldHMvcmVjYXJnYXMtYnJhc2lsLWxvZ28uanBlZ1wiO1xuXG5pbnRlcmZhY2UgQmVmb3JlSW5zdGFsbFByb21wdEV2ZW50IGV4dGVuZHMgRXZlbnQge1xuICBwcm9tcHQ6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIHVzZXJDaG9pY2U6IFByb21pc2U8eyBvdXRjb21lOiBcImFjY2VwdGVkXCIgfCBcImRpc21pc3NlZFwiIH0+O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBJbnN0YWxsQXBwKCkge1xuICBjb25zdCBbZGVmZXJyZWRQcm9tcHQsIHNldERlZmVycmVkUHJvbXB0XSA9IHVzZVN0YXRlPEJlZm9yZUluc3RhbGxQcm9tcHRFdmVudCB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbaXNJbnN0YWxsZWQsIHNldElzSW5zdGFsbGVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzSU9TLCBzZXRJc0lPU10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtpc0FuZHJvaWQsIHNldElzQW5kcm9pZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtpbnN0YWxsaW5nLCBzZXRJbnN0YWxsaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIC8vIENoZWNrIGlmIGFscmVhZHkgaW5zdGFsbGVkXG4gICAgY29uc3QgaXNTdGFuZGFsb25lID1cbiAgICAgIHdpbmRvdy5tYXRjaE1lZGlhKFwiKGRpc3BsYXktbW9kZTogc3RhbmRhbG9uZSlcIikubWF0Y2hlcyB8fFxuICAgICAgKG5hdmlnYXRvciBhcyBhbnkpLnN0YW5kYWxvbmUgPT09IHRydWU7XG4gICAgc2V0SXNJbnN0YWxsZWQoaXNTdGFuZGFsb25lKTtcblxuICAgIC8vIERldGVjdCBwbGF0Zm9ybVxuICAgIGNvbnN0IHVhID0gbmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgICBzZXRJc0lPUygvaVBhZHxpUGhvbmV8aVBvZC8udGVzdCh1YSkgJiYgISh3aW5kb3cgYXMgYW55KS5NU1N0cmVhbSk7XG4gICAgc2V0SXNBbmRyb2lkKC9BbmRyb2lkLy50ZXN0KHVhKSk7XG5cbiAgICAvLyBDYXB0dXJlIGluc3RhbGwgcHJvbXB0IChDaHJvbWUvRWRnZS9TYW1zdW5nKVxuICAgIGNvbnN0IGhhbmRsZXIgPSAoZTogRXZlbnQpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNldERlZmVycmVkUHJvbXB0KGUgYXMgQmVmb3JlSW5zdGFsbFByb21wdEV2ZW50KTtcbiAgICB9O1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiYmVmb3JlaW5zdGFsbHByb21wdFwiLCBoYW5kbGVyKTtcblxuICAgIC8vIExpc3RlbiBmb3Igc3VjY2Vzc2Z1bCBpbnN0YWxsXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJhcHBpbnN0YWxsZWRcIiwgKCkgPT4gc2V0SXNJbnN0YWxsZWQodHJ1ZSkpO1xuXG4gICAgcmV0dXJuICgpID0+IHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwiYmVmb3JlaW5zdGFsbHByb21wdFwiLCBoYW5kbGVyKTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGhhbmRsZUluc3RhbGwgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFkZWZlcnJlZFByb21wdCkgcmV0dXJuO1xuICAgIHNldEluc3RhbGxpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGRlZmVycmVkUHJvbXB0LnByb21wdCgpO1xuICAgICAgY29uc3QgeyBvdXRjb21lIH0gPSBhd2FpdCBkZWZlcnJlZFByb21wdC51c2VyQ2hvaWNlO1xuICAgICAgaWYgKG91dGNvbWUgPT09IFwiYWNjZXB0ZWRcIikgc2V0SXNJbnN0YWxsZWQodHJ1ZSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldERlZmVycmVkUHJvbXB0KG51bGwpO1xuICAgICAgc2V0SW5zdGFsbGluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctYmFja2dyb3VuZCB0ZXh0LWZvcmVncm91bmRcIj5cbiAgICAgIHsvKiBIZWFkZXIgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInN0aWNreSB0b3AtMCB6LTUwIGJnLWNhcmQvODAgYmFja2Ryb3AtYmx1ci14bCBib3JkZXItYiBib3JkZXItYm9yZGVyLzUwXCI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtNCBweS0zIG1heC13LWxnIG14LWF1dG9cIj5cbiAgICAgICAgICA8TGluayB0bz1cIi9cIiBjbGFzc05hbWU9XCJwLTIgLW1sLTIgcm91bmRlZC14bCBob3ZlcjpiZy1tdXRlZC81MCB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgPEFycm93TGVmdCBjbGFzc05hbWU9XCJ3LTUgaC01XCIgLz5cbiAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgPGgxIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkXCI+SW5zdGFsYXIgQXBwPC9oMT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy1sZyBteC1hdXRvIHB4LTQgcHktOCBzcGFjZS15LThcIj5cbiAgICAgICAgey8qIEhlcm8gKi99XG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAyMCB9fVxuICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHNwYWNlLXktNFwiXG4gICAgICAgID5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMjQgaC0yNCBteC1hdXRvIHJvdW5kZWQtMnhsIG92ZXJmbG93LWhpZGRlbiBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIHJpbmctMSByaW5nLXByaW1hcnkvMjBcIj5cbiAgICAgICAgICAgIDxpbWcgc3JjPXtsb2dvfSBhbHQ9XCJSZWNhcmdhcyBCcmFzaWxcIiBjbGFzc05hbWU9XCJ3LWZ1bGwgaC1mdWxsIG9iamVjdC1jb3ZlclwiIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJvbGRcIj5SZWNhcmdhcyBCcmFzaWw8L2gyPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG10LTFcIj5cbiAgICAgICAgICAgICAgSW5zdGFsZSBuYSB0ZWxhIGluaWNpYWwgZG8gc2V1IGNlbHVsYXJcbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgIHsvKiBBbHJlYWR5IGluc3RhbGxlZCAqL31cbiAgICAgICAge2lzSW5zdGFsbGVkICYmIChcbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45NSB9fVxuICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYmctcHJpbWFyeS8xMCBib3JkZXIgYm9yZGVyLXByaW1hcnkvMzAgcm91bmRlZC0yeGwgcC02IHRleHQtY2VudGVyIHNwYWNlLXktM1wiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTE0IGgtMTQgbXgtYXV0byByb3VuZGVkLWZ1bGwgYmctcHJpbWFyeS8yMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgICAgICAgICA8Q2hlY2sgY2xhc3NOYW1lPVwidy03IGgtNyB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1wcmltYXJ5XCI+QXBwIGrDoSBpbnN0YWxhZG8hPC9oMz5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgIE8gUmVjYXJnYXMgQnJhc2lsIGrDoSBlc3TDoSBuYSBzdWEgdGVsYSBpbmljaWFsLiBBYnJhIHBlbG8gw61jb25lIGRvIGFwcC5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIEluc3RhbGwgYnV0dG9uIChBbmRyb2lkL0Nocm9tZSkgKi99XG4gICAgICAgIHshaXNJbnN0YWxsZWQgJiYgZGVmZXJyZWRQcm9tcHQgJiYgKFxuICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDEwIH19XG4gICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInNwYWNlLXktNFwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVJbnN0YWxsfVxuICAgICAgICAgICAgICBkaXNhYmxlZD17aW5zdGFsbGluZ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB5LTQgcHgtNiBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIHJvdW5kZWQtMnhsIGZvbnQtYm9sZCB0ZXh0LWxnIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0zIHNoYWRvdy1sZyBzaGFkb3ctcHJpbWFyeS8yNSBob3ZlcjpicmlnaHRuZXNzLTExMCB0cmFuc2l0aW9uLWFsbCBhY3RpdmU6c2NhbGUtWzAuOThdIGRpc2FibGVkOm9wYWNpdHktNTBcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8RG93bmxvYWQgY2xhc3NOYW1lPVwidy02IGgtNlwiIC8+XG4gICAgICAgICAgICAgIHtpbnN0YWxsaW5nID8gXCJJbnN0YWxhbmRvLi4uXCIgOiBcIkluc3RhbGFyIEFwcFwifVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtY2VudGVyIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgICBUb3F1ZSBwYXJhIGFkaWNpb25hciDDoCB0ZWxhIGluaWNpYWwgZG8gc2V1IGNlbHVsYXJcbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIEJlbmVmaXRzICovfVxuICAgICAgICB7IWlzSW5zdGFsbGVkICYmIChcbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjEgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTIgZ2FwLTNcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtbXG4gICAgICAgICAgICAgIHsgaWNvbjogU21hcnRwaG9uZSwgbGFiZWw6IFwiVGVsYSBjaGVpYVwiLCBkZXNjOiBcIlNlbSBiYXJyYSBkbyBuYXZlZ2Fkb3JcIiB9LFxuICAgICAgICAgICAgICB7IGljb246IERvd25sb2FkLCBsYWJlbDogXCJBY2Vzc28gcsOhcGlkb1wiLCBkZXNjOiBcIkRpcmV0byBkYSB0ZWxhIGluaWNpYWxcIiB9LFxuICAgICAgICAgICAgICB7IGljb246IE1vbml0b3IsIGxhYmVsOiBcIkZ1bmNpb25hIG9mZmxpbmVcIiwgZGVzYzogXCJDYWNoZSBpbnRlbGlnZW50ZVwiIH0sXG4gICAgICAgICAgICAgIHsgaWNvbjogQ2hlY2ssIGxhYmVsOiBcIk5vdGlmaWNhw6fDtWVzXCIsIGRlc2M6IFwiQWxlcnRhcyBlbSB0ZW1wbyByZWFsXCIgfSxcbiAgICAgICAgICAgIF0ubWFwKChpdGVtLCBpKSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJiZy1jYXJkIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIHJvdW5kZWQteGwgcC00IHNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICAgIDxpdGVtLmljb24gY2xhc3NOYW1lPVwidy01IGgtNSB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGQgdGV4dC1zbVwiPntpdGVtLmxhYmVsfTwvcD5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPntpdGVtLmRlc2N9PC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgKX1cblxuICAgICAgICB7LyogaU9TIEluc3RydWN0aW9ucyAqL31cbiAgICAgICAgeyFpc0luc3RhbGxlZCAmJiBpc0lPUyAmJiAoXG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMTAgfX1cbiAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4yIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJiZy1jYXJkIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIHJvdW5kZWQtMnhsIHAtNiBzcGFjZS15LTVcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEwIGgtMTAgcm91bmRlZC14bCBiZy1tdXRlZCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgIDxBcHBsZSBjbGFzc05hbWU9XCJ3LTUgaC01XCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cImZvbnQtYm9sZFwiPkluc3RhbGFyIG5vIGlQaG9uZTwvaDM+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5TaWdhIG9zIHBhc3NvcyBhYmFpeG88L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS01XCI+XG4gICAgICAgICAgICAgIDxTdGVwIG51bWJlcj17MX0gaWNvbj17PFNoYXJlIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPn0+XG4gICAgICAgICAgICAgICAgPHNwYW4+TmEgYmFycmEgaW5mZXJpb3IgZG8gU2FmYXJpLCB0b3F1ZSBubyBib3TDo286PC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB3LTEwIGgtMTAgYmctWyMwMDdBRkZdIHJvdW5kZWQteGwgbXgtMSBhbGlnbi1taWRkbGUgc2hhZG93LW1kXCI+XG4gICAgICAgICAgICAgICAgICA8c3ZnIHdpZHRoPVwiMjJcIiBoZWlnaHQ9XCIyMlwiIHZpZXdCb3g9XCIwIDAgMjQgMjRcIiBmaWxsPVwibm9uZVwiIHN0cm9rZT1cIndoaXRlXCIgc3Ryb2tlV2lkdGg9XCIyXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlTGluZWpvaW49XCJyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTQgMTJ2OGEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJ2LThcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8cG9seWxpbmUgcG9pbnRzPVwiMTYgNiAxMiAyIDggNlwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxsaW5lIHgxPVwiMTJcIiB5MT1cIjJcIiB4Mj1cIjEyXCIgeTI9XCIxNVwiIC8+XG4gICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQgYmxvY2sgbXQtMVwiPijDrWNvbmUgZGUgY29tcGFydGlsaGFyIGRvIFNhZmFyaSk8L3NwYW4+XG4gICAgICAgICAgICAgIDwvU3RlcD5cbiAgICAgICAgICAgICAgPFN0ZXAgbnVtYmVyPXsyfSBpY29uPXs8UGx1cyBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz59PlxuICAgICAgICAgICAgICAgIDxzcGFuPlJvbGUgbyBtZW51IHBhcmEgYmFpeG8gZSB0b3F1ZSBlbTo8L3NwYW4+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgbXQtMiBiZy1tdXRlZC82MCBib3JkZXIgYm9yZGVyLWJvcmRlci81MCByb3VuZGVkLXhsIHB4LTMgcHktMi41IHRleHQtZm9yZWdyb3VuZCB0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdy03IGgtNyBiZy1tdXRlZCByb3VuZGVkLWxnIHNocmluay0wXCI+XG4gICAgICAgICAgICAgICAgICAgIDxQbHVzIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgQWRpY2lvbmFyIMOgIFRlbGEgZGUgSW7DrWNpb1xuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9TdGVwPlxuICAgICAgICAgICAgICA8U3RlcCBudW1iZXI9ezN9IGljb249ezxDaGVjayBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz59PlxuICAgICAgICAgICAgICAgIDxzcGFuPk5vIGNhbnRvIHN1cGVyaW9yIGRpcmVpdG8sIHRvcXVlIGVtOjwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbXQtMiBiZy1bIzAwN0FGRl0gdGV4dC13aGl0ZSB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgcm91bmRlZC1sZyBweC00IHB5LTEuNSBzaGFkb3ctc21cIj5cbiAgICAgICAgICAgICAgICAgIEFkaWNpb25hclxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9TdGVwPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2FybmluZy8xMCBib3JkZXIgYm9yZGVyLXdhcm5pbmcvMjAgcm91bmRlZC14bCBwLTNcIj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXdhcm5pbmctZm9yZWdyb3VuZC84MFwiPlxuICAgICAgICAgICAgICAgIOKaoO+4jyBVc2UgbyA8c3Ryb25nPlNhZmFyaTwvc3Ryb25nPiBwYXJhIGluc3RhbGFyIG5vIGlQaG9uZS4gT3V0cm9zIG5hdmVnYWRvcmVzIG7Do28gc3Vwb3J0YW0gZXN0YSBmdW7Dp8OjbyBubyBpT1MuXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgKX1cblxuICAgICAgICB7LyogQW5kcm9pZCBJbnN0cnVjdGlvbnMgKHdoZW4gbm8gcHJvbXB0IGF2YWlsYWJsZSkgKi99XG4gICAgICAgIHshaXNJbnN0YWxsZWQgJiYgaXNBbmRyb2lkICYmICFkZWZlcnJlZFByb21wdCAmJiAoXG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMTAgfX1cbiAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4yIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJiZy1jYXJkIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIHJvdW5kZWQtMnhsIHAtNiBzcGFjZS15LTVcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEwIGgtMTAgcm91bmRlZC14bCBiZy1tdXRlZCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgIDxTbWFydHBob25lIGNsYXNzTmFtZT1cInctNSBoLTVcIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1ib2xkXCI+SW5zdGFsYXIgbm8gQW5kcm9pZDwvaDM+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5TaWdhIG9zIHBhc3NvcyBhYmFpeG88L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICAgIDxTdGVwIG51bWJlcj17MX0gaWNvbj17PHNwYW4gY2xhc3NOYW1lPVwidGV4dC14c1wiPuKLrjwvc3Bhbj59PlxuICAgICAgICAgICAgICAgIFRvcXVlIG5vIG1lbnUgPHN0cm9uZz50csOqcyBwb250b3M8L3N0cm9uZz4gKOKLrikgbm8gY2FudG8gc3VwZXJpb3IgZG8gQ2hyb21lXG4gICAgICAgICAgICAgIDwvU3RlcD5cbiAgICAgICAgICAgICAgPFN0ZXAgbnVtYmVyPXsyfSBpY29uPXs8RG93bmxvYWQgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+fT5cbiAgICAgICAgICAgICAgICBUb3F1ZSBlbSA8c3Ryb25nPlwiSW5zdGFsYXIgYXBwXCI8L3N0cm9uZz4gb3UgPHN0cm9uZz5cIkFkaWNpb25hciDDoCB0ZWxhIGluaWNpYWxcIjwvc3Ryb25nPlxuICAgICAgICAgICAgICA8L1N0ZXA+XG4gICAgICAgICAgICAgIDxTdGVwIG51bWJlcj17M30gaWNvbj17PENoZWNrIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPn0+XG4gICAgICAgICAgICAgICAgQ29uZmlybWUgdG9jYW5kbyBlbSA8c3Ryb25nPlwiSW5zdGFsYXJcIjwvc3Ryb25nPlxuICAgICAgICAgICAgICA8L1N0ZXA+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIERlc2t0b3AgZmFsbGJhY2sgKi99XG4gICAgICAgIHshaXNJbnN0YWxsZWQgJiYgIWlzSU9TICYmICFpc0FuZHJvaWQgJiYgIWRlZmVycmVkUHJvbXB0ICYmIChcbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjIgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJnLWNhcmQgYm9yZGVyIGJvcmRlci1ib3JkZXIvNTAgcm91bmRlZC0yeGwgcC02IHRleHQtY2VudGVyIHNwYWNlLXktM1wiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPE1vbml0b3IgY2xhc3NOYW1lPVwidy04IGgtOCBteC1hdXRvIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiIC8+XG4gICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1ib2xkXCI+QWNlc3NlIHBlbG8gY2VsdWxhcjwvaDM+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgICBQYXJhIGluc3RhbGFyIG8gYXBwLCBhYnJhIGVzdGUgc2l0ZSBubyBuYXZlZ2Fkb3IgZG8gc2V1IGNlbHVsYXIgKENocm9tZSBubyBBbmRyb2lkIG91IFNhZmFyaSBubyBpUGhvbmUpLlxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xufVxuXG5mdW5jdGlvbiBTdGVwKHsgbnVtYmVyLCBpY29uLCBjaGlsZHJlbiB9OiB7IG51bWJlcjogbnVtYmVyOyBpY29uOiBSZWFjdC5SZWFjdE5vZGU7IGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGUgfSkge1xuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1zdGFydCBnYXAtM1wiPlxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTcgaC03IHJvdW5kZWQtZnVsbCBiZy1wcmltYXJ5LzE1IHRleHQtcHJpbWFyeSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaHJpbmstMCB0ZXh0LXhzIGZvbnQtYm9sZFwiPlxuICAgICAgICB7bnVtYmVyfVxuICAgICAgPC9kaXY+XG4gICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBsZWFkaW5nLXJlbGF4ZWQgcHQtMC41XCI+e2NoaWxkcmVufTwvcD5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZUVmZmVjdCIsIm1vdGlvbiIsIkRvd25sb2FkIiwiU21hcnRwaG9uZSIsIlNoYXJlIiwiUGx1cyIsIkNoZWNrIiwiQXJyb3dMZWZ0IiwiQXBwbGUiLCJNb25pdG9yIiwiTGluayIsImxvZ28iLCJJbnN0YWxsQXBwIiwiZGVmZXJyZWRQcm9tcHQiLCJzZXREZWZlcnJlZFByb21wdCIsImlzSW5zdGFsbGVkIiwic2V0SXNJbnN0YWxsZWQiLCJpc0lPUyIsInNldElzSU9TIiwiaXNBbmRyb2lkIiwic2V0SXNBbmRyb2lkIiwiaW5zdGFsbGluZyIsInNldEluc3RhbGxpbmciLCJpc1N0YW5kYWxvbmUiLCJ3aW5kb3ciLCJtYXRjaE1lZGlhIiwibWF0Y2hlcyIsIm5hdmlnYXRvciIsInN0YW5kYWxvbmUiLCJ1YSIsInVzZXJBZ2VudCIsInRlc3QiLCJNU1N0cmVhbSIsImhhbmRsZXIiLCJlIiwicHJldmVudERlZmF1bHQiLCJhZGRFdmVudExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImhhbmRsZUluc3RhbGwiLCJwcm9tcHQiLCJvdXRjb21lIiwidXNlckNob2ljZSIsImRpdiIsImNsYXNzTmFtZSIsInRvIiwiaDEiLCJpbml0aWFsIiwib3BhY2l0eSIsInkiLCJhbmltYXRlIiwiaW1nIiwic3JjIiwiYWx0IiwiaDIiLCJwIiwic2NhbGUiLCJoMyIsImJ1dHRvbiIsIm9uQ2xpY2siLCJkaXNhYmxlZCIsInRyYW5zaXRpb24iLCJkZWxheSIsImljb24iLCJsYWJlbCIsImRlc2MiLCJtYXAiLCJpdGVtIiwiaSIsIlN0ZXAiLCJudW1iZXIiLCJzcGFuIiwic3ZnIiwid2lkdGgiLCJoZWlnaHQiLCJ2aWV3Qm94IiwiZmlsbCIsInN0cm9rZSIsInN0cm9rZVdpZHRoIiwic3Ryb2tlTGluZWNhcCIsInN0cm9rZUxpbmVqb2luIiwicGF0aCIsImQiLCJwb2x5bGluZSIsInBvaW50cyIsImxpbmUiLCJ4MSIsInkxIiwieDIiLCJ5MiIsInN0cm9uZyIsImNoaWxkcmVuIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxRQUFRLEVBQUVDLFNBQVMsUUFBUSxRQUFRO0FBQzVDLFNBQVNDLE1BQU0sUUFBUSxnQkFBZ0I7QUFDdkMsU0FBU0MsUUFBUSxFQUFFQyxVQUFVLEVBQUVDLEtBQUssRUFBRUMsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLFNBQVMsRUFBRUMsS0FBSyxFQUFFQyxPQUFPLFFBQVEsZUFBZTtBQUNuRyxTQUFTQyxJQUFJLFFBQVEsbUJBQW1CO0FBQ3hDLE9BQU9DLFVBQVUscUNBQXFDO0FBT3RELGVBQWUsU0FBU0M7O0lBQ3RCLE1BQU0sQ0FBQ0MsZ0JBQWdCQyxrQkFBa0IsR0FBR2YsU0FBMEM7SUFDdEYsTUFBTSxDQUFDZ0IsYUFBYUMsZUFBZSxHQUFHakIsU0FBUztJQUMvQyxNQUFNLENBQUNrQixPQUFPQyxTQUFTLEdBQUduQixTQUFTO0lBQ25DLE1BQU0sQ0FBQ29CLFdBQVdDLGFBQWEsR0FBR3JCLFNBQVM7SUFDM0MsTUFBTSxDQUFDc0IsWUFBWUMsY0FBYyxHQUFHdkIsU0FBUztJQUU3Q0MsVUFBVTtRQUNSLDZCQUE2QjtRQUM3QixNQUFNdUIsZUFDSkMsT0FBT0MsVUFBVSxDQUFDLDhCQUE4QkMsT0FBTyxJQUN2RCxBQUFDQyxVQUFrQkMsVUFBVSxLQUFLO1FB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