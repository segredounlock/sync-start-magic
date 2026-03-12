import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/LandingPage.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/LandingPage.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$(), _s1 = $RefreshSig$(), _s2 = $RefreshSig$();
import { motion, useScroll, useTransform, useInView } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { ThemeToggle } from "/src/components/ThemeToggle.tsx";
import __vite__cjsImport6_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useRef = __vite__cjsImport6_react["useRef"]; const useEffect = __vite__cjsImport6_react["useEffect"]; const useState = __vite__cjsImport6_react["useState"];
import { Smartphone, Zap, Shield, Users, TrendingUp, CreditCard, ArrowRight, Globe, Headphones, Sparkles, Activity, Star, MessageCircle, Instagram, Send } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
/* ── Data ── */ const features = [
    {
        icon: Zap,
        title: "Instantânea",
        desc: "Recarga processada em menos de 3 segundos.",
        accent: "from-yellow-400 to-orange-500"
    },
    {
        icon: Shield,
        title: "Blindada",
        desc: "Criptografia ponta-a-ponta. 100% seguro.",
        accent: "from-emerald-400 to-cyan-500"
    },
    {
        icon: TrendingUp,
        title: "Inteligente",
        desc: "Dashboard com métricas em tempo real.",
        accent: "from-violet-400 to-purple-500"
    },
    {
        icon: CreditCard,
        title: "Flexível",
        desc: "PIX, MercadoPago e mais integrados.",
        accent: "from-pink-400 to-rose-500"
    },
    {
        icon: Users,
        title: "Escalável",
        desc: "Gerencie centenas de revendedores.",
        accent: "from-blue-400 to-indigo-500"
    },
    {
        icon: Globe,
        title: "Universal",
        desc: "Desktop, tablet ou celular.",
        accent: "from-teal-400 to-green-500"
    }
];
const operators = [
    "Vivo",
    "Claro",
    "Tim"
];
/* ── Floating Particles ── */ function FloatingParticles() {
    const particles = Array.from({
        length: 20
    }, (_, i)=>({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            duration: Math.random() * 18 + 10,
            delay: Math.random() * 8
        }));
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "absolute inset-0 overflow-hidden pointer-events-none",
        children: particles.map((p)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                className: "absolute rounded-full bg-primary/20",
                style: {
                    width: p.size,
                    height: p.size,
                    left: `${p.x}%`,
                    top: `${p.y}%`
                },
                animate: {
                    y: [
                        0,
                        -50,
                        0
                    ],
                    opacity: [
                        0,
                        0.7,
                        0
                    ]
                },
                transition: {
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeInOut"
                }
            }, p.id, false, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 37,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "/dev-server/src/pages/LandingPage.tsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_c = FloatingParticles;
/* ── Typed Text ── */ function TypedText({ words }) {
    _s();
    const [index, setIndex] = useState(0);
    useEffect(()=>{
        const interval = setInterval(()=>setIndex((p)=>(p + 1) % words.length), 3000);
        return ()=>clearInterval(interval);
    }, [
        words.length
    ]);
    return /*#__PURE__*/ _jsxDEV("span", {
        className: "inline-block min-w-[200px] sm:min-w-[280px]",
        children: /*#__PURE__*/ _jsxDEV(motion.span, {
            initial: {
                opacity: 0,
                y: 20,
                filter: "blur(8px)"
            },
            animate: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)"
            },
            exit: {
                opacity: 0,
                y: -20,
                filter: "blur(8px)"
            },
            transition: {
                duration: 0.5
            },
            className: "bg-gradient-to-r from-primary via-emerald-400 to-primary bg-clip-text text-transparent",
            children: words[index]
        }, words[index], false, {
            fileName: "/dev-server/src/pages/LandingPage.tsx",
            lineNumber: 59,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "/dev-server/src/pages/LandingPage.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(TypedText, "c3fuAdVwNN91t4bNS1qBXl5hAWY=");
_c1 = TypedText;
/* ── Animated Counter (viewport triggered) ── */ function AnimatedNumber({ value, suffix = "" }) {
    _s1();
    const ref = useRef(null);
    const isInView = useInView(ref, {
        once: true
    });
    const [display, setDisplay] = useState(0);
    useEffect(()=>{
        if (!isInView) return;
        const dur = 1200;
        const start = performance.now();
        const tick = (now)=>{
            const p = Math.min((now - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 4);
            setDisplay(Math.round(value * eased));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [
        isInView,
        value
    ]);
    return /*#__PURE__*/ _jsxDEV("span", {
        ref: ref,
        children: [
            display.toLocaleString("pt-BR"),
            suffix
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/LandingPage.tsx",
        lineNumber: 92,
        columnNumber: 10
    }, this);
}
_s1(AnimatedNumber, "jhIrtj0nQXHzV3PCnAtkYHncJUw=", false, function() {
    return [
        useInView
    ];
});
_c2 = AnimatedNumber;
/* ── Phone Frame ── */ function PhoneFrame() {
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "relative mx-auto w-[280px] sm:w-[300px]",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "absolute -inset-8 bg-[radial-gradient(ellipse,hsl(var(--primary)/0.2),transparent_70%)] blur-2xl pointer-events-none"
            }, void 0, false, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 100,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "relative rounded-[2.5rem] border-2 border-border/40 bg-background/80 backdrop-blur-xl p-3 shadow-2xl",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "mx-auto w-24 h-5 rounded-b-2xl bg-border/30 mb-3"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-3 px-1",
                        children: [
                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                initial: {
                                    opacity: 0,
                                    y: 10
                                },
                                animate: {
                                    opacity: 1,
                                    y: 0
                                },
                                transition: {
                                    delay: 0.8
                                },
                                className: "rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-[9px] text-muted-foreground uppercase tracking-widest",
                                        children: "Saldo disponível"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 116,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-2xl font-bold text-primary font-display mt-1",
                                        children: "R$ 2.450,00"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 117,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 110,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "grid grid-cols-2 gap-2",
                                children: [
                                    {
                                        v: "127",
                                        l: "Recargas",
                                        icon: Smartphone
                                    },
                                    {
                                        v: "<3s",
                                        l: "Velocidade",
                                        icon: Zap
                                    }
                                ].map((s, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                                        initial: {
                                            opacity: 0,
                                            y: 10
                                        },
                                        animate: {
                                            opacity: 1,
                                            y: 0
                                        },
                                        transition: {
                                            delay: 1.0 + i * 0.15
                                        },
                                        className: "glass-card rounded-xl p-3 text-center",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(s.icon, {
                                                className: "h-3.5 w-3.5 text-primary mx-auto mb-1 opacity-60"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 133,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-lg font-bold text-foreground font-display",
                                                children: s.v
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 134,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[8px] text-muted-foreground uppercase tracking-wider",
                                                children: s.l
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 135,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, s.l, true, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 126,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 121,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                initial: {
                                    opacity: 0
                                },
                                animate: {
                                    opacity: 1
                                },
                                transition: {
                                    delay: 1.3
                                },
                                className: "space-y-1.5",
                                children: [
                                    {
                                        phone: "(11) 9****-1234",
                                        op: "Vivo",
                                        val: "R$ 20"
                                    },
                                    {
                                        phone: "(21) 9****-5678",
                                        op: "Claro",
                                        val: "R$ 15"
                                    },
                                    {
                                        phone: "(31) 9****-9012",
                                        op: "Tim",
                                        val: "R$ 30"
                                    }
                                ].map((item, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                                        initial: {
                                            opacity: 0,
                                            x: 8
                                        },
                                        animate: {
                                            opacity: 1,
                                            x: 0
                                        },
                                        transition: {
                                            delay: 1.4 + i * 0.1
                                        },
                                        className: "flex items-center justify-between py-2 px-3 rounded-lg glass text-[10px]",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-1.5",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "w-1.5 h-1.5 rounded-full bg-primary"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                        lineNumber: 160,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-foreground font-medium",
                                                        children: item.phone
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                        lineNumber: 161,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-muted-foreground",
                                                        children: item.op
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                        lineNumber: 162,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 159,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "font-bold text-primary",
                                                children: item.val
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 164,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 152,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "mx-auto w-20 h-1 rounded-full bg-border/40 mt-4"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 103,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/LandingPage.tsx",
        lineNumber: 98,
        columnNumber: 5
    }, this);
}
_c3 = PhoneFrame;
/* ══════════════════════════════════════════════════════════
   LANDING PAGE
   ══════════════════════════════════════════════════════════ */ export default function LandingPage() {
    _s2();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef
    });
    const bgY = useTransform(scrollYProgress, [
        0,
        1
    ], [
        "0%",
        "30%"
    ]);
    return /*#__PURE__*/ _jsxDEV("div", {
        ref: containerRef,
        className: "min-h-screen bg-background overflow-x-hidden",
        children: [
            /*#__PURE__*/ _jsxDEV(motion.div, {
                className: "fixed inset-0 pointer-events-none z-0",
                style: {
                    y: bgY
                },
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.10),transparent_60%)]"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(ellipse,hsl(var(--accent)/0.05),transparent_70%)]"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 191,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "absolute bottom-0 left-0 w-[500px] h-[500px] bg-[radial-gradient(ellipse,hsl(var(--primary)/0.05),transparent_70%)]"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 192,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "absolute inset-0 bg-[linear-gradient(hsl(var(--primary)/0.015)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--primary)/0.015)_1px,transparent_1px)] bg-[size:80px_80px]"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 193,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV(FloatingParticles, {}, void 0, false, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 189,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("header", {
                className: "fixed top-0 left-0 right-0 z-50",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "mx-3 sm:mx-6 mt-3",
                    children: /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: -20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            duration: 0.6
                        },
                        className: "max-w-6xl mx-auto glass rounded-2xl px-5 py-2.5 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ _jsxDEV("h1", {
                                className: "font-display text-lg font-bold shimmer-letters tracking-tight",
                                children: [
                                    "Recargas ",
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "brasil-word",
                                        children: "Brasil"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 207,
                                        columnNumber: 24
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 206,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 210,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>navigate("/login"),
                                        className: "px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:scale-105 active:scale-95 transition-all duration-200",
                                        children: "Entrar"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 211,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 209,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 200,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                    lineNumber: 199,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 198,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("section", {
                className: "relative min-h-screen flex items-center z-10 pt-24 pb-16",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center",
                    children: [
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "text-left",
                            children: [
                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        scale: 0.8
                                    },
                                    animate: {
                                        opacity: 1,
                                        scale: 1
                                    },
                                    transition: {
                                        delay: 0.2,
                                        type: "spring",
                                        damping: 15
                                    },
                                    className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 mb-8",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("span", {
                                            className: "w-2 h-2 rounded-full bg-primary animate-pulse"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 233,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("span", {
                                            className: "text-[11px] font-semibold text-primary uppercase tracking-[0.2em]",
                                            children: "Plataforma #1 de Recargas"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 234,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                    lineNumber: 227,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV(motion.h2, {
                                    initial: {
                                        opacity: 0,
                                        y: 50
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    transition: {
                                        duration: 1,
                                        ease: [
                                            0.16,
                                            1,
                                            0.3,
                                            1
                                        ]
                                    },
                                    className: "font-display text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem] font-bold text-foreground leading-[0.95] tracking-tighter",
                                    children: [
                                        "Recargas",
                                        /*#__PURE__*/ _jsxDEV("br", {}, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 246,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV(TypedText, {
                                            words: [
                                                "sem limites",
                                                "instantâneas",
                                                "seguras",
                                                "inteligentes"
                                            ]
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 247,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                    lineNumber: 239,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV(motion.p, {
                                    initial: {
                                        opacity: 0
                                    },
                                    animate: {
                                        opacity: 1
                                    },
                                    transition: {
                                        delay: 0.6
                                    },
                                    className: "text-base sm:text-lg text-muted-foreground max-w-md mt-6 leading-relaxed",
                                    children: [
                                        "Sistema completo para quem vende recargas.",
                                        /*#__PURE__*/ _jsxDEV("br", {
                                            className: "hidden sm:block"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 257,
                                            columnNumber: 15
                                        }, this),
                                        "Rápido, seguro e sem complicação."
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                    lineNumber: 250,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        y: 20
                                    },
                                    animate: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    transition: {
                                        delay: 0.8
                                    },
                                    className: "flex flex-col sm:flex-row items-start gap-4 mt-8",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("button", {
                                            onClick: ()=>navigate("/login"),
                                            className: "group relative px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200 glow-primary rgb-border",
                                            children: /*#__PURE__*/ _jsxDEV("span", {
                                                className: "relative z-10 flex items-center gap-2",
                                                children: [
                                                    "Começar Agora",
                                                    /*#__PURE__*/ _jsxDEV(ArrowRight, {
                                                        className: "h-5 w-5 group-hover:translate-x-1 transition-transform"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                        lineNumber: 273,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 271,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 267,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("button", {
                                            onClick: ()=>navigate("/login"),
                                            className: "px-8 py-4 rounded-2xl glass text-foreground font-semibold text-base hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 border border-border/50",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                    className: "h-5 w-5 text-primary"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                    lineNumber: 280,
                                                    columnNumber: 17
                                                }, this),
                                                " Fazer Recarga"
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 276,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                    lineNumber: 261,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0
                                    },
                                    animate: {
                                        opacity: 1
                                    },
                                    transition: {
                                        delay: 1.2
                                    },
                                    className: "flex items-center gap-3 mt-10",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("span", {
                                            className: "text-[10px] text-muted-foreground/60 uppercase tracking-wider",
                                            children: "Operadoras:"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 291,
                                            columnNumber: 15
                                        }, this),
                                        operators.map((op)=>/*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-xs font-semibold text-muted-foreground/80 px-2.5 py-1 rounded-lg glass-card",
                                                children: op
                                            }, op, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 293,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                    lineNumber: 285,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                            lineNumber: 226,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0,
                                x: 40
                            },
                            animate: {
                                opacity: 1,
                                x: 0
                            },
                            transition: {
                                delay: 0.5,
                                duration: 0.8,
                                ease: [
                                    0.16,
                                    1,
                                    0.3,
                                    1
                                ]
                            },
                            className: "relative flex items-center justify-center",
                            children: /*#__PURE__*/ _jsxDEV(PhoneFrame, {}, void 0, false, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 307,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                            lineNumber: 301,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                    lineNumber: 224,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 223,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("section", {
                className: "relative z-10 py-12",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "max-w-5xl mx-auto px-6",
                    children: /*#__PURE__*/ _jsxDEV("div", {
                        className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                        children: [
                            {
                                value: 999,
                                suffix: "%",
                                label: "Uptime",
                                icon: Activity,
                                display: "99.9%"
                            },
                            {
                                value: 3,
                                suffix: "s",
                                label: "Velocidade",
                                icon: Zap,
                                display: "<3s"
                            },
                            {
                                value: 24,
                                suffix: "/7",
                                label: "Online",
                                icon: Globe,
                                display: "24/7"
                            },
                            {
                                value: 10000,
                                suffix: "+",
                                label: "Recargas",
                                icon: Sparkles,
                                display: "10k+"
                            }
                        ].map((s, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                                initial: {
                                    opacity: 0,
                                    y: 30
                                },
                                whileInView: {
                                    opacity: 1,
                                    y: 0
                                },
                                viewport: {
                                    once: true
                                },
                                transition: {
                                    delay: i * 0.1,
                                    duration: 0.5
                                },
                                className: "glass-card rounded-2xl p-6 text-center group hover:border-primary/30 transition-all duration-300",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all",
                                        children: /*#__PURE__*/ _jsxDEV(s.icon, {
                                            className: "h-5 w-5 text-primary"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 331,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 330,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-3xl sm:text-4xl font-bold text-primary font-display",
                                        children: s.display
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 333,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-[10px] text-muted-foreground mt-2 uppercase tracking-[0.2em]",
                                        children: s.label
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 334,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, s.label, true, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 322,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 315,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                    lineNumber: 314,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 313,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("section", {
                className: "relative z-10 py-24",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "max-w-5xl mx-auto px-6",
                    children: [
                        /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0,
                                y: 20
                            },
                            whileInView: {
                                opacity: 1,
                                y: 0
                            },
                            viewport: {
                                once: true,
                                margin: "-100px"
                            },
                            className: "text-center mb-16",
                            children: [
                                /*#__PURE__*/ _jsxDEV("span", {
                                    className: "text-xs font-semibold text-primary uppercase tracking-[0.25em] mb-4 block",
                                    children: "Funcionalidades"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                    lineNumber: 350,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("h3", {
                                    className: "font-display text-3xl sm:text-5xl font-bold text-foreground leading-tight",
                                    children: [
                                        "Tudo que você precisa.",
                                        /*#__PURE__*/ _jsxDEV("br", {}, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 355,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("span", {
                                            className: "text-muted-foreground",
                                            children: "Nada que você não precisa."
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 356,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                    lineNumber: 353,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                            lineNumber: 344,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5",
                            children: features.map((f, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        y: 30
                                    },
                                    whileInView: {
                                        opacity: 1,
                                        y: 0
                                    },
                                    viewport: {
                                        once: true,
                                        margin: "-50px"
                                    },
                                    transition: {
                                        delay: i * 0.08,
                                        duration: 0.5,
                                        ease: [
                                            0.16,
                                            1,
                                            0.3,
                                            1
                                        ]
                                    },
                                    className: "glass-card rounded-2xl p-7 group hover:border-primary/30 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.15)] hover:-translate-y-1 transition-all duration-300 text-center",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: `w-14 h-14 rounded-2xl bg-gradient-to-br ${f.accent} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`,
                                            children: /*#__PURE__*/ _jsxDEV(f.icon, {
                                                className: "h-6 w-6 text-white"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 371,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 370,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("h4", {
                                            className: "font-display text-xl font-bold text-foreground mb-2",
                                            children: f.title
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 373,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-sm text-muted-foreground leading-relaxed",
                                            children: f.desc
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 374,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, f.title, true, {
                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                    lineNumber: 362,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                            lineNumber: 360,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                    lineNumber: 343,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 342,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("section", {
                className: "relative z-10 pb-32",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "max-w-4xl mx-auto px-6",
                    children: /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            scale: 0.95
                        },
                        whileInView: {
                            opacity: 1,
                            scale: 1
                        },
                        viewport: {
                            once: true
                        },
                        className: "relative rounded-3xl overflow-hidden",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-accent/10"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 391,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(ellipse,hsl(var(--primary)/0.12),transparent_70%)]"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 392,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "absolute bottom-0 left-0 w-60 h-60 bg-[radial-gradient(ellipse,hsl(var(--accent)/0.08),transparent_70%)]"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 393,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "absolute inset-0 glass"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 394,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "relative p-10 sm:p-16 text-center",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(motion.div, {
                                        initial: {
                                            opacity: 0,
                                            scale: 0.5
                                        },
                                        whileInView: {
                                            opacity: 1,
                                            scale: 1
                                        },
                                        viewport: {
                                            once: true
                                        },
                                        transition: {
                                            type: "spring",
                                            damping: 10
                                        },
                                        className: "mb-4",
                                        children: /*#__PURE__*/ _jsxDEV("span", {
                                            className: "font-display text-7xl sm:text-8xl font-bold bg-gradient-to-b from-primary to-primary/40 bg-clip-text text-transparent",
                                            children: /*#__PURE__*/ _jsxDEV(AnimatedNumber, {
                                                value: 10000,
                                                suffix: "+"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 405,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                            lineNumber: 404,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 397,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-sm text-muted-foreground mb-10",
                                        children: "recargas processadas"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 408,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center justify-center gap-1 mb-6",
                                        children: [
                                            [
                                                ...Array(5)
                                            ].map((_, i)=>/*#__PURE__*/ _jsxDEV(Star, {
                                                    className: "h-5 w-5 text-yellow-400 fill-yellow-400"
                                                }, i, false, {
                                                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                    lineNumber: 413,
                                                    columnNumber: 19
                                                }, this)),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-sm text-muted-foreground ml-2",
                                                children: "5.0 · Confiança máxima"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 415,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 411,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("h3", {
                                        className: "font-display text-2xl sm:text-3xl font-bold text-foreground mb-4",
                                        children: "Pronto para começar?"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 418,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-muted-foreground mb-8 max-w-md mx-auto",
                                        children: "Junte-se à maior plataforma de recargas do Brasil. Comece a vender hoje mesmo."
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 421,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex flex-col sm:flex-row items-center justify-center gap-4",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>navigate("/login"),
                                                className: "px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 glow-primary rgb-border",
                                                children: [
                                                    "Criar Conta Grátis ",
                                                    /*#__PURE__*/ _jsxDEV(ArrowRight, {
                                                        className: "h-5 w-5"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                        lineNumber: 430,
                                                        columnNumber: 38
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 426,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-xs text-muted-foreground flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "w-2 h-2 rounded-full bg-primary animate-pulse"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                        lineNumber: 433,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Sem taxas ocultas · Ativação imediata"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 432,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 425,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 396,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 384,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/LandingPage.tsx",
                    lineNumber: 383,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 382,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("footer", {
                className: "relative z-10 border-t border-border/20",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 445,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "max-w-5xl mx-auto px-6 py-12",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("h4", {
                                                className: "font-display text-lg font-bold shimmer-letters tracking-tight mb-3",
                                                children: [
                                                    "Recargas ",
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "brasil-word",
                                                        children: "Brasil"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                        lineNumber: 452,
                                                        columnNumber: 26
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 451,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs text-muted-foreground leading-relaxed max-w-xs",
                                                children: "A plataforma mais rápida e segura para vender recargas de celular no Brasil."
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 454,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 450,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs font-semibold text-foreground uppercase tracking-wider mb-3",
                                                children: "Plataforma"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 461,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("ul", {
                                                className: "space-y-2",
                                                children: [
                                                    "Fazer Recarga",
                                                    "Painel do Revendedor",
                                                    "Suporte"
                                                ].map((l)=>/*#__PURE__*/ _jsxDEV("li", {
                                                        children: /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: ()=>navigate("/login"),
                                                            className: "text-xs text-muted-foreground hover:text-primary transition-colors",
                                                            children: l
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                            lineNumber: 465,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, l, false, {
                                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                        lineNumber: 464,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 462,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 460,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs font-semibold text-foreground uppercase tracking-wider mb-3",
                                                children: "Redes"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 478,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    {
                                                        icon: Instagram,
                                                        label: "Instagram"
                                                    },
                                                    {
                                                        icon: Send,
                                                        label: "Telegram"
                                                    },
                                                    {
                                                        icon: MessageCircle,
                                                        label: "WhatsApp"
                                                    }
                                                ].map((s)=>/*#__PURE__*/ _jsxDEV("button", {
                                                        className: "w-9 h-9 rounded-xl glass-card flex items-center justify-center hover:border-primary/30 hover:scale-110 transition-all",
                                                        "aria-label": s.label,
                                                        children: /*#__PURE__*/ _jsxDEV(s.icon, {
                                                            className: "h-4 w-4 text-muted-foreground"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                            lineNumber: 490,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, s.label, false, {
                                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                        lineNumber: 485,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 479,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 477,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 448,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/20",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(Headphones, {
                                                className: "h-4 w-4 text-primary"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 500,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-[11px] text-muted-foreground",
                                                children: "Suporte 24/7"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                                lineNumber: 501,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 499,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-[11px] text-muted-foreground",
                                        children: [
                                            "© ",
                                            new Date().getFullYear(),
                                            " Recargas Brasil. Todos os direitos reservados."
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                                        lineNumber: 503,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/LandingPage.tsx",
                                lineNumber: 498,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/LandingPage.tsx",
                        lineNumber: 447,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/LandingPage.tsx",
                lineNumber: 443,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/LandingPage.tsx",
        lineNumber: 187,
        columnNumber: 5
    }, this);
}
_s2(LandingPage, "mMWO/HqlvjpORyjucrP/L5FZtEc=", false, function() {
    return [
        useNavigate,
        useScroll,
        useTransform
    ];
});
_c4 = LandingPage;
var _c, _c1, _c2, _c3, _c4;
$RefreshReg$(_c, "FloatingParticles");
$RefreshReg$(_c1, "TypedText");
$RefreshReg$(_c2, "AnimatedNumber");
$RefreshReg$(_c3, "PhoneFrame");
$RefreshReg$(_c4, "LandingPage");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/LandingPage.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/LandingPage.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhbmRpbmdQYWdlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBtb3Rpb24sIHVzZVNjcm9sbCwgdXNlVHJhbnNmb3JtLCB1c2VJblZpZXcgfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IHsgdXNlTmF2aWdhdGUgfSBmcm9tIFwicmVhY3Qtcm91dGVyLWRvbVwiO1xuaW1wb3J0IHsgVGhlbWVUb2dnbGUgfSBmcm9tIFwiQC9jb21wb25lbnRzL1RoZW1lVG9nZ2xlXCI7XG5pbXBvcnQgeyB1c2VSZWYsIHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7XG4gIFNtYXJ0cGhvbmUsIFphcCwgU2hpZWxkLCBVc2VycywgVHJlbmRpbmdVcCwgQ3JlZGl0Q2FyZCxcbiAgQXJyb3dSaWdodCwgR2xvYmUsIEhlYWRwaG9uZXMsIFNwYXJrbGVzLCBBY3Rpdml0eSxcbiAgU3RhciwgTWVzc2FnZUNpcmNsZSwgSW5zdGFncmFtLCBTZW5kLFxufSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5cbi8qIOKUgOKUgCBEYXRhIOKUgOKUgCAqL1xuY29uc3QgZmVhdHVyZXMgPSBbXG4gIHsgaWNvbjogWmFwLCB0aXRsZTogXCJJbnN0YW50w6JuZWFcIiwgZGVzYzogXCJSZWNhcmdhIHByb2Nlc3NhZGEgZW0gbWVub3MgZGUgMyBzZWd1bmRvcy5cIiwgYWNjZW50OiBcImZyb20teWVsbG93LTQwMCB0by1vcmFuZ2UtNTAwXCIgfSxcbiAgeyBpY29uOiBTaGllbGQsIHRpdGxlOiBcIkJsaW5kYWRhXCIsIGRlc2M6IFwiQ3JpcHRvZ3JhZmlhIHBvbnRhLWEtcG9udGEuIDEwMCUgc2VndXJvLlwiLCBhY2NlbnQ6IFwiZnJvbS1lbWVyYWxkLTQwMCB0by1jeWFuLTUwMFwiIH0sXG4gIHsgaWNvbjogVHJlbmRpbmdVcCwgdGl0bGU6IFwiSW50ZWxpZ2VudGVcIiwgZGVzYzogXCJEYXNoYm9hcmQgY29tIG3DqXRyaWNhcyBlbSB0ZW1wbyByZWFsLlwiLCBhY2NlbnQ6IFwiZnJvbS12aW9sZXQtNDAwIHRvLXB1cnBsZS01MDBcIiB9LFxuICB7IGljb246IENyZWRpdENhcmQsIHRpdGxlOiBcIkZsZXjDrXZlbFwiLCBkZXNjOiBcIlBJWCwgTWVyY2Fkb1BhZ28gZSBtYWlzIGludGVncmFkb3MuXCIsIGFjY2VudDogXCJmcm9tLXBpbmstNDAwIHRvLXJvc2UtNTAwXCIgfSxcbiAgeyBpY29uOiBVc2VycywgdGl0bGU6IFwiRXNjYWzDoXZlbFwiLCBkZXNjOiBcIkdlcmVuY2llIGNlbnRlbmFzIGRlIHJldmVuZGVkb3Jlcy5cIiwgYWNjZW50OiBcImZyb20tYmx1ZS00MDAgdG8taW5kaWdvLTUwMFwiIH0sXG4gIHsgaWNvbjogR2xvYmUsIHRpdGxlOiBcIlVuaXZlcnNhbFwiLCBkZXNjOiBcIkRlc2t0b3AsIHRhYmxldCBvdSBjZWx1bGFyLlwiLCBhY2NlbnQ6IFwiZnJvbS10ZWFsLTQwMCB0by1ncmVlbi01MDBcIiB9LFxuXTtcblxuY29uc3Qgb3BlcmF0b3JzID0gW1wiVml2b1wiLCBcIkNsYXJvXCIsIFwiVGltXCJdO1xuXG4vKiDilIDilIAgRmxvYXRpbmcgUGFydGljbGVzIOKUgOKUgCAqL1xuZnVuY3Rpb24gRmxvYXRpbmdQYXJ0aWNsZXMoKSB7XG4gIGNvbnN0IHBhcnRpY2xlcyA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDIwIH0sIChfLCBpKSA9PiAoe1xuICAgIGlkOiBpLFxuICAgIHg6IE1hdGgucmFuZG9tKCkgKiAxMDAsXG4gICAgeTogTWF0aC5yYW5kb20oKSAqIDEwMCxcbiAgICBzaXplOiBNYXRoLnJhbmRvbSgpICogNCArIDEsXG4gICAgZHVyYXRpb246IE1hdGgucmFuZG9tKCkgKiAxOCArIDEwLFxuICAgIGRlbGF5OiBNYXRoLnJhbmRvbSgpICogOCxcbiAgfSkpO1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wIG92ZXJmbG93LWhpZGRlbiBwb2ludGVyLWV2ZW50cy1ub25lXCI+XG4gICAgICB7cGFydGljbGVzLm1hcCgocCkgPT4gKFxuICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgIGtleT17cC5pZH1cbiAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSByb3VuZGVkLWZ1bGwgYmctcHJpbWFyeS8yMFwiXG4gICAgICAgICAgc3R5bGU9e3sgd2lkdGg6IHAuc2l6ZSwgaGVpZ2h0OiBwLnNpemUsIGxlZnQ6IGAke3AueH0lYCwgdG9wOiBgJHtwLnl9JWAgfX1cbiAgICAgICAgICBhbmltYXRlPXt7IHk6IFswLCAtNTAsIDBdLCBvcGFjaXR5OiBbMCwgMC43LCAwXSB9fVxuICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IHAuZHVyYXRpb24sIHJlcGVhdDogSW5maW5pdHksIGRlbGF5OiBwLmRlbGF5LCBlYXNlOiBcImVhc2VJbk91dFwiIH19XG4gICAgICAgIC8+XG4gICAgICApKX1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuLyog4pSA4pSAIFR5cGVkIFRleHQg4pSA4pSAICovXG5mdW5jdGlvbiBUeXBlZFRleHQoeyB3b3JkcyB9OiB7IHdvcmRzOiBzdHJpbmdbXSB9KSB7XG4gIGNvbnN0IFtpbmRleCwgc2V0SW5kZXhdID0gdXNlU3RhdGUoMCk7XG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiBzZXRJbmRleCgocCkgPT4gKHAgKyAxKSAlIHdvcmRzLmxlbmd0aCksIDMwMDApO1xuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgfSwgW3dvcmRzLmxlbmd0aF0pO1xuXG4gIHJldHVybiAoXG4gICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWJsb2NrIG1pbi13LVsyMDBweF0gc206bWluLXctWzI4MHB4XVwiPlxuICAgICAgPG1vdGlvbi5zcGFuXG4gICAgICAgIGtleT17d29yZHNbaW5kZXhdfVxuICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwLCBmaWx0ZXI6IFwiYmx1cig4cHgpXCIgfX1cbiAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwLCBmaWx0ZXI6IFwiYmx1cigwcHgpXCIgfX1cbiAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCB5OiAtMjAsIGZpbHRlcjogXCJibHVyKDhweClcIiB9fVxuICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjUgfX1cbiAgICAgICAgY2xhc3NOYW1lPVwiYmctZ3JhZGllbnQtdG8tciBmcm9tLXByaW1hcnkgdmlhLWVtZXJhbGQtNDAwIHRvLXByaW1hcnkgYmctY2xpcC10ZXh0IHRleHQtdHJhbnNwYXJlbnRcIlxuICAgICAgPlxuICAgICAgICB7d29yZHNbaW5kZXhdfVxuICAgICAgPC9tb3Rpb24uc3Bhbj5cbiAgICA8L3NwYW4+XG4gICk7XG59XG5cbi8qIOKUgOKUgCBBbmltYXRlZCBDb3VudGVyICh2aWV3cG9ydCB0cmlnZ2VyZWQpIOKUgOKUgCAqL1xuZnVuY3Rpb24gQW5pbWF0ZWROdW1iZXIoeyB2YWx1ZSwgc3VmZml4ID0gXCJcIiB9OiB7IHZhbHVlOiBudW1iZXI7IHN1ZmZpeD86IHN0cmluZyB9KSB7XG4gIGNvbnN0IHJlZiA9IHVzZVJlZjxIVE1MU3BhbkVsZW1lbnQ+KG51bGwpO1xuICBjb25zdCBpc0luVmlldyA9IHVzZUluVmlldyhyZWYsIHsgb25jZTogdHJ1ZSB9KTtcbiAgY29uc3QgW2Rpc3BsYXksIHNldERpc3BsYXldID0gdXNlU3RhdGUoMCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIWlzSW5WaWV3KSByZXR1cm47XG4gICAgY29uc3QgZHVyID0gMTIwMDtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IHRpY2sgPSAobm93OiBudW1iZXIpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBNYXRoLm1pbigobm93IC0gc3RhcnQpIC8gZHVyLCAxKTtcbiAgICAgIGNvbnN0IGVhc2VkID0gMSAtIE1hdGgucG93KDEgLSBwLCA0KTtcbiAgICAgIHNldERpc3BsYXkoTWF0aC5yb3VuZCh2YWx1ZSAqIGVhc2VkKSk7XG4gICAgICBpZiAocCA8IDEpIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgICB9O1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aWNrKTtcbiAgfSwgW2lzSW5WaWV3LCB2YWx1ZV0pO1xuXG4gIHJldHVybiA8c3BhbiByZWY9e3JlZn0+e2Rpc3BsYXkudG9Mb2NhbGVTdHJpbmcoXCJwdC1CUlwiKX17c3VmZml4fTwvc3Bhbj47XG59XG5cbi8qIOKUgOKUgCBQaG9uZSBGcmFtZSDilIDilIAgKi9cbmZ1bmN0aW9uIFBob25lRnJhbWUoKSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBteC1hdXRvIHctWzI4MHB4XSBzbTp3LVszMDBweF1cIj5cbiAgICAgIHsvKiBHbG93IGJlaGluZCBwaG9uZSAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgLWluc2V0LTggYmctW3JhZGlhbC1ncmFkaWVudChlbGxpcHNlLGhzbCh2YXIoLS1wcmltYXJ5KS8wLjIpLHRyYW5zcGFyZW50XzcwJSldIGJsdXItMnhsIHBvaW50ZXItZXZlbnRzLW5vbmVcIiAvPlxuXG4gICAgICB7LyogUGhvbmUgYm9keSAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgcm91bmRlZC1bMi41cmVtXSBib3JkZXItMiBib3JkZXItYm9yZGVyLzQwIGJnLWJhY2tncm91bmQvODAgYmFja2Ryb3AtYmx1ci14bCBwLTMgc2hhZG93LTJ4bFwiPlxuICAgICAgICB7LyogTm90Y2ggKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXgtYXV0byB3LTI0IGgtNSByb3VuZGVkLWItMnhsIGJnLWJvcmRlci8zMCBtYi0zXCIgLz5cblxuICAgICAgICB7LyogU2NyZWVuIGNvbnRlbnQgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0zIHB4LTFcIj5cbiAgICAgICAgICB7LyogQmFsYW5jZSBjYXJkICovfVxuICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDEwIH19XG4gICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuOCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicm91bmRlZC0yeGwgYmctZ3JhZGllbnQtdG8tYnIgZnJvbS1wcmltYXJ5LzIwIHRvLXByaW1hcnkvNSBib3JkZXIgYm9yZGVyLXByaW1hcnkvMjAgcC00XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXN0XCI+U2FsZG8gZGlzcG9uw612ZWw8L3A+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1wcmltYXJ5IGZvbnQtZGlzcGxheSBtdC0xXCI+UiQgMi40NTAsMDA8L3A+XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgICAgey8qIE1pbmkgc3RhdHMgKi99XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0yIGdhcC0yXCI+XG4gICAgICAgICAgICB7W1xuICAgICAgICAgICAgICB7IHY6IFwiMTI3XCIsIGw6IFwiUmVjYXJnYXNcIiwgaWNvbjogU21hcnRwaG9uZSB9LFxuICAgICAgICAgICAgICB7IHY6IFwiPDNzXCIsIGw6IFwiVmVsb2NpZGFkZVwiLCBpY29uOiBaYXAgfSxcbiAgICAgICAgICAgIF0ubWFwKChzLCBpKSA9PiAoXG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAga2V5PXtzLmx9XG4gICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDEuMCArIGkgKiAwLjE1IH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLXhsIHAtMyB0ZXh0LWNlbnRlclwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8cy5pY29uIGNsYXNzTmFtZT1cImgtMy41IHctMy41IHRleHQtcHJpbWFyeSBteC1hdXRvIG1iLTEgb3BhY2l0eS02MFwiIC8+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIGZvbnQtZGlzcGxheVwiPntzLnZ9PC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzhweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPntzLmx9PC9wPlxuICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIHsvKiBSZWNlbnQgKi99XG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAxLjMgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInNwYWNlLXktMS41XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICB7W1xuICAgICAgICAgICAgICB7IHBob25lOiBcIigxMSkgOSoqKiotMTIzNFwiLCBvcDogXCJWaXZvXCIsIHZhbDogXCJSJCAyMFwiIH0sXG4gICAgICAgICAgICAgIHsgcGhvbmU6IFwiKDIxKSA5KioqKi01Njc4XCIsIG9wOiBcIkNsYXJvXCIsIHZhbDogXCJSJCAxNVwiIH0sXG4gICAgICAgICAgICAgIHsgcGhvbmU6IFwiKDMxKSA5KioqKi05MDEyXCIsIG9wOiBcIlRpbVwiLCB2YWw6IFwiUiQgMzBcIiB9LFxuICAgICAgICAgICAgXS5tYXAoKGl0ZW0sIGkpID0+IChcbiAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICBrZXk9e2l9XG4gICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB4OiA4IH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB4OiAwIH19XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMS40ICsgaSAqIDAuMSB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweS0yIHB4LTMgcm91bmRlZC1sZyBnbGFzcyB0ZXh0LVsxMHB4XVwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjVcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xLjUgaC0xLjUgcm91bmRlZC1mdWxsIGJnLXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1mb3JlZ3JvdW5kIGZvbnQtbWVkaXVtXCI+e2l0ZW0ucGhvbmV9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+e2l0ZW0ub3B9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXByaW1hcnlcIj57aXRlbS52YWx9PC9zcGFuPlxuICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsvKiBIb21lIGluZGljYXRvciAqL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteC1hdXRvIHctMjAgaC0xIHJvdW5kZWQtZnVsbCBiZy1ib3JkZXIvNDAgbXQtNFwiIC8+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cblxuLyog4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQ4pWQXG4gICBMQU5ESU5HIFBBR0VcbiAgIOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkOKVkCAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gTGFuZGluZ1BhZ2UoKSB7XG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcbiAgY29uc3QgY29udGFpbmVyUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcbiAgY29uc3QgeyBzY3JvbGxZUHJvZ3Jlc3MgfSA9IHVzZVNjcm9sbCh7IHRhcmdldDogY29udGFpbmVyUmVmIH0pO1xuICBjb25zdCBiZ1kgPSB1c2VUcmFuc2Zvcm0oc2Nyb2xsWVByb2dyZXNzLCBbMCwgMV0sIFtcIjAlXCIsIFwiMzAlXCJdKTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgcmVmPXtjb250YWluZXJSZWZ9IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1iYWNrZ3JvdW5kIG92ZXJmbG93LXgtaGlkZGVuXCI+XG4gICAgICB7Lyog4pSA4pSAIEltbWVyc2l2ZSBCRyDilIDilIAgKi99XG4gICAgICA8bW90aW9uLmRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIHBvaW50ZXItZXZlbnRzLW5vbmUgei0wXCIgc3R5bGU9e3sgeTogYmdZIH19PlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC0xLzQgbGVmdC0xLzIgLXRyYW5zbGF0ZS14LTEvMiAtdHJhbnNsYXRlLXktMS8yIHctWzEwMDBweF0gaC1bMTAwMHB4XSBiZy1bcmFkaWFsLWdyYWRpZW50KGVsbGlwc2UsaHNsKHZhcigtLXByaW1hcnkpLzAuMTApLHRyYW5zcGFyZW50XzYwJSldXCIgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctWzYwMHB4XSBoLVs2MDBweF0gYmctW3JhZGlhbC1ncmFkaWVudChlbGxpcHNlLGhzbCh2YXIoLS1hY2NlbnQpLzAuMDUpLHRyYW5zcGFyZW50XzcwJSldXCIgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBib3R0b20tMCBsZWZ0LTAgdy1bNTAwcHhdIGgtWzUwMHB4XSBiZy1bcmFkaWFsLWdyYWRpZW50KGVsbGlwc2UsaHNsKHZhcigtLXByaW1hcnkpLzAuMDUpLHRyYW5zcGFyZW50XzcwJSldXCIgLz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wIGJnLVtsaW5lYXItZ3JhZGllbnQoaHNsKHZhcigtLXByaW1hcnkpLzAuMDE1KV8xcHgsdHJhbnNwYXJlbnRfMXB4KSxsaW5lYXItZ3JhZGllbnQoOTBkZWcsaHNsKHZhcigtLXByaW1hcnkpLzAuMDE1KV8xcHgsdHJhbnNwYXJlbnRfMXB4KV0gYmctW3NpemU6ODBweF84MHB4XVwiIC8+XG4gICAgICAgIDxGbG9hdGluZ1BhcnRpY2xlcyAvPlxuICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICB7Lyog4pSA4pSAIEhlYWRlciDilIDilIAgKi99XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cImZpeGVkIHRvcC0wIGxlZnQtMCByaWdodC0wIHotNTBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJteC0zIHNtOm14LTYgbXQtM1wiPlxuICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IC0yMCB9fVxuICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjYgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1heC13LTZ4bCBteC1hdXRvIGdsYXNzIHJvdW5kZWQtMnhsIHB4LTUgcHktMi41IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImZvbnQtZGlzcGxheSB0ZXh0LWxnIGZvbnQtYm9sZCBzaGltbWVyLWxldHRlcnMgdHJhY2tpbmctdGlnaHRcIj5cbiAgICAgICAgICAgICAgUmVjYXJnYXMgPHNwYW4gY2xhc3NOYW1lPVwiYnJhc2lsLXdvcmRcIj5CcmFzaWw8L3NwYW4+XG4gICAgICAgICAgICA8L2gxPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICA8VGhlbWVUb2dnbGUgLz5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKFwiL2xvZ2luXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInB4LTUgcHktMiByb3VuZGVkLXhsIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgdGV4dC1zbSBmb250LWJvbGQgaG92ZXI6c2NhbGUtMTA1IGFjdGl2ZTpzY2FsZS05NSB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDBcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgRW50cmFyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvaGVhZGVyPlxuXG4gICAgICB7Lyog4pWQ4pWQ4pWQIEhFUk8g4pWQ4pWQ4pWQICovfVxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwicmVsYXRpdmUgbWluLWgtc2NyZWVuIGZsZXggaXRlbXMtY2VudGVyIHotMTAgcHQtMjQgcGItMTZcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy02eGwgbXgtYXV0byBweC02IHctZnVsbCBncmlkIGdyaWQtY29scy0xIGxnOmdyaWQtY29scy0yIGdhcC0xMiBsZzpnYXAtOCBpdGVtcy1jZW50ZXJcIj5cbiAgICAgICAgICB7LyogTGVmdCAqL31cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtbGVmdFwiPlxuICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC44IH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgc2NhbGU6IDEgfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4yLCB0eXBlOiBcInNwcmluZ1wiLCBkYW1waW5nOiAxNSB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtNCBweS0xLjUgcm91bmRlZC1mdWxsIGdsYXNzIGJvcmRlciBib3JkZXItcHJpbWFyeS8yMCBtYi04XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidy0yIGgtMiByb3VuZGVkLWZ1bGwgYmctcHJpbWFyeSBhbmltYXRlLXB1bHNlXCIgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gZm9udC1zZW1pYm9sZCB0ZXh0LXByaW1hcnkgdXBwZXJjYXNlIHRyYWNraW5nLVswLjJlbV1cIj5cbiAgICAgICAgICAgICAgICBQbGF0YWZvcm1hICMxIGRlIFJlY2FyZ2FzXG4gICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cblxuICAgICAgICAgICAgPG1vdGlvbi5oMlxuICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDUwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAxLCBlYXNlOiBbMC4xNiwgMSwgMC4zLCAxXSB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC1bMi41cmVtXSBzbTp0ZXh0LVszLjVyZW1dIGxnOnRleHQtWzQuNXJlbV0gZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZCBsZWFkaW5nLVswLjk1XSB0cmFja2luZy10aWdodGVyXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgUmVjYXJnYXNcbiAgICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICAgIDxUeXBlZFRleHQgd29yZHM9e1tcInNlbSBsaW1pdGVzXCIsIFwiaW5zdGFudMOibmVhc1wiLCBcInNlZ3VyYXNcIiwgXCJpbnRlbGlnZW50ZXNcIl19IC8+XG4gICAgICAgICAgICA8L21vdGlvbi5oMj5cblxuICAgICAgICAgICAgPG1vdGlvbi5wXG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC42IH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtYmFzZSBzbTp0ZXh0LWxnIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtYXgtdy1tZCBtdC02IGxlYWRpbmctcmVsYXhlZFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIFNpc3RlbWEgY29tcGxldG8gcGFyYSBxdWVtIHZlbmRlIHJlY2FyZ2FzLlxuICAgICAgICAgICAgICA8YnIgY2xhc3NOYW1lPVwiaGlkZGVuIHNtOmJsb2NrXCIgLz5cbiAgICAgICAgICAgICAgUsOhcGlkbywgc2VndXJvIGUgc2VtIGNvbXBsaWNhw6fDo28uXG4gICAgICAgICAgICA8L21vdGlvbi5wPlxuXG4gICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjggfX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBzbTpmbGV4LXJvdyBpdGVtcy1zdGFydCBnYXAtNCBtdC04XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKFwiL2xvZ2luXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdyb3VwIHJlbGF0aXZlIHB4LTggcHktNCByb3VuZGVkLTJ4bCBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGZvbnQtYm9sZCB0ZXh0LWJhc2Ugb3ZlcmZsb3ctaGlkZGVuIGhvdmVyOnNjYWxlLTEwNSBhY3RpdmU6c2NhbGUtOTUgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwIGdsb3ctcHJpbWFyeSByZ2ItYm9yZGVyXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInJlbGF0aXZlIHotMTAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgIENvbWXDp2FyIEFnb3JhXG4gICAgICAgICAgICAgICAgICA8QXJyb3dSaWdodCBjbGFzc05hbWU9XCJoLTUgdy01IGdyb3VwLWhvdmVyOnRyYW5zbGF0ZS14LTEgdHJhbnNpdGlvbi10cmFuc2Zvcm1cIiAvPlxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShcIi9sb2dpblwiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC04IHB5LTQgcm91bmRlZC0yeGwgZ2xhc3MgdGV4dC1mb3JlZ3JvdW5kIGZvbnQtc2VtaWJvbGQgdGV4dC1iYXNlIGhvdmVyOnNjYWxlLTEwNSBhY3RpdmU6c2NhbGUtOTUgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGJvcmRlciBib3JkZXItYm9yZGVyLzUwXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxTbWFydHBob25lIGNsYXNzTmFtZT1cImgtNSB3LTUgdGV4dC1wcmltYXJ5XCIgLz4gRmF6ZXIgUmVjYXJnYVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cblxuICAgICAgICAgICAgey8qIFRydXN0OiBvcGVyYXRvcnMgKi99XG4gICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDEuMiB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBtdC0xMFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZC82MCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5PcGVyYWRvcmFzOjwvc3Bhbj5cbiAgICAgICAgICAgICAge29wZXJhdG9ycy5tYXAoKG9wKSA9PiAoXG4gICAgICAgICAgICAgICAgPHNwYW4ga2V5PXtvcH0gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZC84MCBweC0yLjUgcHktMSByb3VuZGVkLWxnIGdsYXNzLWNhcmRcIj5cbiAgICAgICAgICAgICAgICAgIHtvcH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgey8qIFJpZ2h0OiBQaG9uZSBGcmFtZSAqL31cbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB4OiA0MCB9fVxuICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB4OiAwIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjUsIGR1cmF0aW9uOiAwLjgsIGVhc2U6IFswLjE2LCAxLCAwLjMsIDFdIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJyZWxhdGl2ZSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPFBob25lRnJhbWUgLz5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7Lyog4pWQ4pWQ4pWQIFNUQVRTIOKVkOKVkOKVkCAqL31cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInJlbGF0aXZlIHotMTAgcHktMTJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy01eGwgbXgtYXV0byBweC02XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0yIG1kOmdyaWQtY29scy00IGdhcC00XCI+XG4gICAgICAgICAgICB7W1xuICAgICAgICAgICAgICB7IHZhbHVlOiA5OTksIHN1ZmZpeDogXCIlXCIsIGxhYmVsOiBcIlVwdGltZVwiLCBpY29uOiBBY3Rpdml0eSwgZGlzcGxheTogXCI5OS45JVwiIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6IDMsIHN1ZmZpeDogXCJzXCIsIGxhYmVsOiBcIlZlbG9jaWRhZGVcIiwgaWNvbjogWmFwLCBkaXNwbGF5OiBcIjwzc1wiIH0sXG4gICAgICAgICAgICAgIHsgdmFsdWU6IDI0LCBzdWZmaXg6IFwiLzdcIiwgbGFiZWw6IFwiT25saW5lXCIsIGljb246IEdsb2JlLCBkaXNwbGF5OiBcIjI0LzdcIiB9LFxuICAgICAgICAgICAgICB7IHZhbHVlOiAxMDAwMCwgc3VmZml4OiBcIitcIiwgbGFiZWw6IFwiUmVjYXJnYXNcIiwgaWNvbjogU3BhcmtsZXMsIGRpc3BsYXk6IFwiMTBrK1wiIH0sXG4gICAgICAgICAgICBdLm1hcCgocywgaSkgPT4gKFxuICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgIGtleT17cy5sYWJlbH1cbiAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDMwIH19XG4gICAgICAgICAgICAgICAgd2hpbGVJblZpZXc9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICAgIHZpZXdwb3J0PXt7IG9uY2U6IHRydWUgfX1cbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiBpICogMC4xLCBkdXJhdGlvbjogMC41IH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLTJ4bCBwLTYgdGV4dC1jZW50ZXIgZ3JvdXAgaG92ZXI6Ym9yZGVyLXByaW1hcnkvMzAgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xMCBoLTEwIHJvdW5kZWQteGwgYmctcHJpbWFyeS8xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBteC1hdXRvIG1iLTMgZ3JvdXAtaG92ZXI6YmctcHJpbWFyeS8yMCBncm91cC1ob3ZlcjpzY2FsZS0xMTAgdHJhbnNpdGlvbi1hbGxcIj5cbiAgICAgICAgICAgICAgICAgIDxzLmljb24gY2xhc3NOYW1lPVwiaC01IHctNSB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtM3hsIHNtOnRleHQtNHhsIGZvbnQtYm9sZCB0ZXh0LXByaW1hcnkgZm9udC1kaXNwbGF5XCI+e3MuZGlzcGxheX08L3A+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG10LTIgdXBwZXJjYXNlIHRyYWNraW5nLVswLjJlbV1cIj57cy5sYWJlbH08L3A+XG4gICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgey8qIOKVkOKVkOKVkCBGRUFUVVJFUyBHUklEIOKVkOKVkOKVkCAqL31cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInJlbGF0aXZlIHotMTAgcHktMjRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy01eGwgbXgtYXV0byBweC02XCI+XG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMjAgfX1cbiAgICAgICAgICAgIHdoaWxlSW5WaWV3PXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgIHZpZXdwb3J0PXt7IG9uY2U6IHRydWUsIG1hcmdpbjogXCItMTAwcHhcIiB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgbWItMTZcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LXByaW1hcnkgdXBwZXJjYXNlIHRyYWNraW5nLVswLjI1ZW1dIG1iLTQgYmxvY2tcIj5cbiAgICAgICAgICAgICAgRnVuY2lvbmFsaWRhZGVzXG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtM3hsIHNtOnRleHQtNXhsIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmQgbGVhZGluZy10aWdodFwiPlxuICAgICAgICAgICAgICBUdWRvIHF1ZSB2b2PDqiBwcmVjaXNhLlxuICAgICAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+TmFkYSBxdWUgdm9jw6ogbsOjbyBwcmVjaXNhLjwvc3Bhbj5cbiAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIHNtOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy0zIGdhcC01XCI+XG4gICAgICAgICAgICB7ZmVhdHVyZXMubWFwKChmLCBpKSA9PiAoXG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAga2V5PXtmLnRpdGxlfVxuICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMzAgfX1cbiAgICAgICAgICAgICAgICB3aGlsZUluVmlldz17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICAgICAgdmlld3BvcnQ9e3sgb25jZTogdHJ1ZSwgbWFyZ2luOiBcIi01MHB4XCIgfX1cbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiBpICogMC4wOCwgZHVyYXRpb246IDAuNSwgZWFzZTogWzAuMTYsIDEsIDAuMywgMV0gfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJnbGFzcy1jYXJkIHJvdW5kZWQtMnhsIHAtNyBncm91cCBob3Zlcjpib3JkZXItcHJpbWFyeS8zMCBob3ZlcjpzaGFkb3ctWzBfMF8zMHB4Xy0xMHB4X2hzbCh2YXIoLS1wcmltYXJ5KS8wLjE1KV0gaG92ZXI6LXRyYW5zbGF0ZS15LTEgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwIHRleHQtY2VudGVyXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgdy0xNCBoLTE0IHJvdW5kZWQtMnhsIGJnLWdyYWRpZW50LXRvLWJyICR7Zi5hY2NlbnR9IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG14LWF1dG8gbWItNSBzaGFkb3ctbGcgZ3JvdXAtaG92ZXI6c2NhbGUtMTEwIHRyYW5zaXRpb24tdHJhbnNmb3JtIGR1cmF0aW9uLTMwMGB9PlxuICAgICAgICAgICAgICAgICAgPGYuaWNvbiBjbGFzc05hbWU9XCJoLTYgdy02IHRleHQtd2hpdGVcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC14bCBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG1iLTJcIj57Zi50aXRsZX08L2g0PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGxlYWRpbmctcmVsYXhlZFwiPntmLmRlc2N9PC9wPlxuICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIHsvKiDilZDilZDilZAgQ1RBIOKVkOKVkOKVkCAqL31cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInJlbGF0aXZlIHotMTAgcGItMzJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy00eGwgbXgtYXV0byBweC02XCI+XG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgIHdoaWxlSW5WaWV3PXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH19XG4gICAgICAgICAgICB2aWV3cG9ydD17eyBvbmNlOiB0cnVlIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJyZWxhdGl2ZSByb3VuZGVkLTN4bCBvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIHsvKiBNZXNoIGdyYWRpZW50IGJnICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wIGJnLWdyYWRpZW50LXRvLWJyIGZyb20tcHJpbWFyeS8xNSB2aWEtdHJhbnNwYXJlbnQgdG8tYWNjZW50LzEwXCIgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTgwIGgtODAgYmctW3JhZGlhbC1ncmFkaWVudChlbGxpcHNlLGhzbCh2YXIoLS1wcmltYXJ5KS8wLjEyKSx0cmFuc3BhcmVudF83MCUpXVwiIC8+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGJvdHRvbS0wIGxlZnQtMCB3LTYwIGgtNjAgYmctW3JhZGlhbC1ncmFkaWVudChlbGxpcHNlLGhzbCh2YXIoLS1hY2NlbnQpLzAuMDgpLHRyYW5zcGFyZW50XzcwJSldXCIgLz5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQtMCBnbGFzc1wiIC8+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgcC0xMCBzbTpwLTE2IHRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC41IH19XG4gICAgICAgICAgICAgICAgd2hpbGVJblZpZXc9e3sgb3BhY2l0eTogMSwgc2NhbGU6IDEgfX1cbiAgICAgICAgICAgICAgICB2aWV3cG9ydD17eyBvbmNlOiB0cnVlIH19XG4gICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyB0eXBlOiBcInNwcmluZ1wiLCBkYW1waW5nOiAxMCB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm1iLTRcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtN3hsIHNtOnRleHQtOHhsIGZvbnQtYm9sZCBiZy1ncmFkaWVudC10by1iIGZyb20tcHJpbWFyeSB0by1wcmltYXJ5LzQwIGJnLWNsaXAtdGV4dCB0ZXh0LXRyYW5zcGFyZW50XCI+XG4gICAgICAgICAgICAgICAgICA8QW5pbWF0ZWROdW1iZXIgdmFsdWU9ezEwMDAwfSBzdWZmaXg9XCIrXCIgLz5cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbWItMTBcIj5yZWNhcmdhcyBwcm9jZXNzYWRhczwvcD5cblxuICAgICAgICAgICAgICB7LyogVHJ1c3Qgc3RhcnMgKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTEgbWItNlwiPlxuICAgICAgICAgICAgICAgIHtbLi4uQXJyYXkoNSldLm1hcCgoXywgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPFN0YXIga2V5PXtpfSBjbGFzc05hbWU9XCJoLTUgdy01IHRleHQteWVsbG93LTQwMCBmaWxsLXllbGxvdy00MDBcIiAvPlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1sLTJcIj41LjAgwrcgQ29uZmlhbsOnYSBtw6F4aW1hPC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtMnhsIHNtOnRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmQgbWItNFwiPlxuICAgICAgICAgICAgICAgIFByb250byBwYXJhIGNvbWXDp2FyP1xuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgbWItOCBtYXgtdy1tZCBteC1hdXRvXCI+XG4gICAgICAgICAgICAgICAgSnVudGUtc2Ugw6AgbWFpb3IgcGxhdGFmb3JtYSBkZSByZWNhcmdhcyBkbyBCcmFzaWwuIENvbWVjZSBhIHZlbmRlciBob2plIG1lc21vLlxuICAgICAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIHNtOmZsZXgtcm93IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtNFwiPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKFwiL2xvZ2luXCIpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtOCBweS00IHJvdW5kZWQtMnhsIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgZm9udC1ib2xkIGhvdmVyOnNjYWxlLTEwNSBhY3RpdmU6c2NhbGUtOTUgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGdsb3ctcHJpbWFyeSByZ2ItYm9yZGVyXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICBDcmlhciBDb250YSBHcsOhdGlzIDxBcnJvd1JpZ2h0IGNsYXNzTmFtZT1cImgtNSB3LTVcIiAvPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3LTIgaC0yIHJvdW5kZWQtZnVsbCBiZy1wcmltYXJ5IGFuaW1hdGUtcHVsc2VcIiAvPlxuICAgICAgICAgICAgICAgICAgU2VtIHRheGFzIG9jdWx0YXMgwrcgQXRpdmHDp8OjbyBpbWVkaWF0YVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7Lyog4pWQ4pWQ4pWQIEZPT1RFUiDilZDilZDilZAgKi99XG4gICAgICA8Zm9vdGVyIGNsYXNzTmFtZT1cInJlbGF0aXZlIHotMTAgYm9yZGVyLXQgYm9yZGVyLWJvcmRlci8yMFwiPlxuICAgICAgICB7LyogR3JhZGllbnQgZGl2aWRlciAqL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLXB4IGJnLWdyYWRpZW50LXRvLXIgZnJvbS10cmFuc3BhcmVudCB2aWEtcHJpbWFyeS8zMCB0by10cmFuc3BhcmVudFwiIC8+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy01eGwgbXgtYXV0byBweC02IHB5LTEyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIHNtOmdyaWQtY29scy0zIGdhcC04IG1iLTEwXCI+XG4gICAgICAgICAgICB7LyogQnJhbmQgKi99XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDQgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtbGcgZm9udC1ib2xkIHNoaW1tZXItbGV0dGVycyB0cmFja2luZy10aWdodCBtYi0zXCI+XG4gICAgICAgICAgICAgICAgUmVjYXJnYXMgPHNwYW4gY2xhc3NOYW1lPVwiYnJhc2lsLXdvcmRcIj5CcmFzaWw8L3NwYW4+XG4gICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGxlYWRpbmctcmVsYXhlZCBtYXgtdy14c1wiPlxuICAgICAgICAgICAgICAgIEEgcGxhdGFmb3JtYSBtYWlzIHLDoXBpZGEgZSBzZWd1cmEgcGFyYSB2ZW5kZXIgcmVjYXJnYXMgZGUgY2VsdWxhciBubyBCcmFzaWwuXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICB7LyogTGlua3MgKi99XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0zXCI+UGxhdGFmb3JtYTwvcD5cbiAgICAgICAgICAgICAgPHVsIGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICAgIHtbXCJGYXplciBSZWNhcmdhXCIsIFwiUGFpbmVsIGRvIFJldmVuZGVkb3JcIiwgXCJTdXBvcnRlXCJdLm1hcCgobCkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGxpIGtleT17bH0+XG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShcIi9sb2dpblwiKX1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3Zlcjp0ZXh0LXByaW1hcnkgdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge2x9XG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICB7LyogU29jaWFsICovfVxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItM1wiPlJlZGVzPC9wPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgICAgIHsgaWNvbjogSW5zdGFncmFtLCBsYWJlbDogXCJJbnN0YWdyYW1cIiB9LFxuICAgICAgICAgICAgICAgICAgeyBpY29uOiBTZW5kLCBsYWJlbDogXCJUZWxlZ3JhbVwiIH0sXG4gICAgICAgICAgICAgICAgICB7IGljb246IE1lc3NhZ2VDaXJjbGUsIGxhYmVsOiBcIldoYXRzQXBwXCIgfSxcbiAgICAgICAgICAgICAgICBdLm1hcCgocykgPT4gKFxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBrZXk9e3MubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctOSBoLTkgcm91bmRlZC14bCBnbGFzcy1jYXJkIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGhvdmVyOmJvcmRlci1wcmltYXJ5LzMwIGhvdmVyOnNjYWxlLTExMCB0cmFuc2l0aW9uLWFsbFwiXG4gICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9e3MubGFiZWx9XG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzLmljb24gY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7LyogQm90dG9tIGJhciAqL31cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtNCBwdC02IGJvcmRlci10IGJvcmRlci1ib3JkZXIvMjBcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgPEhlYWRwaG9uZXMgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5TdXBvcnRlIDI0Lzc8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgICDCqSB7bmV3IERhdGUoKS5nZXRGdWxsWWVhcigpfSBSZWNhcmdhcyBCcmFzaWwuIFRvZG9zIG9zIGRpcmVpdG9zIHJlc2VydmFkb3MuXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9mb290ZXI+XG4gICAgPC9kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOlsibW90aW9uIiwidXNlU2Nyb2xsIiwidXNlVHJhbnNmb3JtIiwidXNlSW5WaWV3IiwidXNlTmF2aWdhdGUiLCJUaGVtZVRvZ2dsZSIsInVzZVJlZiIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiU21hcnRwaG9uZSIsIlphcCIsIlNoaWVsZCIsIlVzZXJzIiwiVHJlbmRpbmdVcCIsIkNyZWRpdENhcmQiLCJBcnJvd1JpZ2h0IiwiR2xvYmUiLCJIZWFkcGhvbmVzIiwiU3BhcmtsZXMiLCJBY3Rpdml0eSIsIlN0YXIiLCJNZXNzYWdlQ2lyY2xlIiwiSW5zdGFncmFtIiwiU2VuZCIsImZlYXR1cmVzIiwiaWNvbiIsInRpdGxlIiwiZGVzYyIsImFjY2VudCIsIm9wZXJhdG9ycyIsIkZsb2F0aW5nUGFydGljbGVzIiwicGFydGljbGVzIiwiQXJyYXkiLCJmcm9tIiwibGVuZ3RoIiwiXyIsImkiLCJpZCIsIngiLCJNYXRoIiwicmFuZG9tIiwieSIsInNpemUiLCJkdXJhdGlvbiIsImRlbGF5IiwiZGl2IiwiY2xhc3NOYW1lIiwibWFwIiwicCIsInN0eWxlIiwid2lkdGgiLCJoZWlnaHQiLCJsZWZ0IiwidG9wIiwiYW5pbWF0ZSIsIm9wYWNpdHkiLCJ0cmFuc2l0aW9uIiwicmVwZWF0IiwiSW5maW5pdHkiLCJlYXNlIiwiVHlwZWRUZXh0Iiwid29yZHMiLCJpbmRleCIsInNldEluZGV4IiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNsZWFySW50ZXJ2YWwiLCJzcGFuIiwiaW5pdGlhbCIsImZpbHRlciIsImV4aXQiLCJBbmltYXRlZE51bWJlciIsInZhbHVlIiwic3VmZml4IiwicmVmIiwiaXNJblZpZXciLCJvbmNlIiwiZGlzcGxheSIsInNldERpc3BsYXkiLCJkdXIiLCJzdGFydCIsInBlcmZvcm1hbmNlIiwibm93IiwidGljayIsIm1pbiIsImVhc2VkIiwicG93Iiwicm91bmQiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ0b0xvY2FsZVN0cmluZyIsIlBob25lRnJhbWUiLCJ2IiwibCIsInMiLCJwaG9uZSIsIm9wIiwidmFsIiwiaXRlbSIsIkxhbmRpbmdQYWdlIiwibmF2aWdhdGUiLCJjb250YWluZXJSZWYiLCJzY3JvbGxZUHJvZ3Jlc3MiLCJ0YXJnZXQiLCJiZ1kiLCJoZWFkZXIiLCJoMSIsImJ1dHRvbiIsIm9uQ2xpY2siLCJzZWN0aW9uIiwic2NhbGUiLCJ0eXBlIiwiZGFtcGluZyIsImgyIiwiYnIiLCJsYWJlbCIsIndoaWxlSW5WaWV3Iiwidmlld3BvcnQiLCJtYXJnaW4iLCJoMyIsImYiLCJoNCIsImZvb3RlciIsInVsIiwibGkiLCJhcmlhLWxhYmVsIiwiRGF0ZSIsImdldEZ1bGxZZWFyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsWUFBWSxFQUFFQyxTQUFTLFFBQVEsZ0JBQWdCO0FBQzNFLFNBQVNDLFdBQVcsUUFBUSxtQkFBbUI7QUFDL0MsU0FBU0MsV0FBVyxRQUFRLDJCQUEyQjtBQUN2RCxTQUFTQyxNQUFNLEVBQUVDLFNBQVMsRUFBRUMsUUFBUSxRQUFRLFFBQVE7QUFDcEQsU0FDRUMsVUFBVSxFQUFFQyxHQUFHLEVBQUVDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxVQUFVLEVBQUVDLFVBQVUsRUFDdERDLFVBQVUsRUFBRUMsS0FBSyxFQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsUUFBUSxFQUNqREMsSUFBSSxFQUFFQyxhQUFhLEVBQUVDLFNBQVMsRUFBRUMsSUFBSSxRQUMvQixlQUFlO0FBRXRCLGNBQWMsR0FDZCxNQUFNQyxXQUFXO0lBQ2Y7UUFBRUMsTUFBTWY7UUFBS2dCLE9B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