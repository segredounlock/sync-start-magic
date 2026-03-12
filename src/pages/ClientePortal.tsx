import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/ClientePortal.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/ClientePortal.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"];
import { useParams, useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { supabase } from "/src/integrations/supabase/client.ts";
import { useAuth } from "/src/hooks/useAuth.tsx";
import { ThemeToggle } from "/src/components/ThemeToggle.tsx";
import { AnimatedPage, AnimatedCard } from "/src/components/AnimatedPage.tsx";
import { motion } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { Smartphone, Zap, Shield, LogIn, UserPlus, Loader2, ArrowRight, CheckCircle, Headphones, TrendingUp, CreditCard, Globe } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { styledToast as toast } from "/src/lib/toast.tsx";
import RevendedorPainel from "/src/pages/RevendedorPainel.tsx";
const storeFeatures = [
    {
        icon: Smartphone,
        title: "Todas as Operadoras",
        desc: "Recargas para Vivo, Claro, Tim, Oi e muito mais."
    },
    {
        icon: Zap,
        title: "Recarga Instantânea",
        desc: "Crédito adicionado em segundos, sem complicação."
    },
    {
        icon: Shield,
        title: "100% Seguro",
        desc: "Seus dados protegidos com criptografia de ponta."
    },
    {
        icon: CreditCard,
        title: "Pagamento Fácil",
        desc: "PIX, cartão e outros métodos disponíveis."
    },
    {
        icon: TrendingUp,
        title: "Melhores Preços",
        desc: "Valores competitivos e promoções exclusivas."
    },
    {
        icon: Globe,
        title: "Acesse de Qualquer Lugar",
        desc: "Faça recargas pelo celular, tablet ou computador."
    }
];
const storeStats = [
    {
        value: "99.9%",
        label: "Uptime"
    },
    {
        value: "<3s",
        label: "Tempo de Recarga"
    },
    {
        value: "24/7",
        label: "Disponibilidade"
    },
    {
        value: "100%",
        label: "Digital"
    }
];
export default function ClientePortal() {
    _s();
    const { slug } = useParams();
    const { user, role, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [resellerInfo, setResellerInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    // Auth form
    const [authMode, setAuthMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nome, setNome] = useState("");
    const [submitting, setSubmitting] = useState(false);
    useEffect(()=>{
        if (!slug) {
            setError("Link inválido.");
            setLoading(false);
            return;
        }
        loadReseller();
    }, [
        slug
    ]);
    const loadReseller = async ()=>{
        try {
            // First get profile by slug
            const { data: profile } = await supabase.from("profiles").select("id, nome, store_name, store_logo_url, store_primary_color, store_secondary_color, active").eq("slug", slug).maybeSingle();
            if (!profile) {
                setError("Loja não encontrada. Verifique o link.");
                setLoading(false);
                return;
            }
            if (!profile.active) {
                setError("Esta loja está temporariamente inativa.");
                setLoading(false);
                return;
            }
            // Verify role in parallel-ready fashion (already have profile.id)
            const { data: roleData } = await supabase.from("user_roles").select("role").eq("user_id", profile.id).eq("role", "revendedor").maybeSingle();
            if (!roleData) {
                setError("Loja não encontrada.");
                setLoading(false);
                return;
            }
            setResellerInfo(profile);
        } catch  {
            setError("Erro ao carregar dados da loja.");
        }
        setLoading(false);
    };
    const handleLogin = async (e)=>{
        e.preventDefault();
        if (!email || !password) {
            toast.error("Preencha todos os campos");
            return;
        }
        setSubmitting(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            toast.success("Login realizado!");
        } catch (err) {
            toast.error(err.message || "Erro ao fazer login");
        }
        setSubmitting(false);
    };
    const handleRegister = async (e)=>{
        e.preventDefault();
        if (!email || !password || !nome.trim()) {
            toast.error("Preencha todos os campos");
            return;
        }
        if (password.length < 6) {
            toast.error("Senha deve ter no mínimo 6 caracteres");
            return;
        }
        if (!resellerInfo) return;
        setSubmitting(true);
        try {
            const { data, error } = await supabase.functions.invoke("client-register", {
                body: {
                    email,
                    password,
                    nome: nome.trim(),
                    reseller_id: resellerInfo.id
                }
            });
            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            const { error: loginErr } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (loginErr) throw loginErr;
            toast.success("Conta criada com sucesso!");
        } catch (err) {
            toast.error(err.message || "Erro ao criar conta");
        }
        setSubmitting(false);
    };
    // Loading state
    if (loading || authLoading) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen flex items-center justify-center",
            children: /*#__PURE__*/ _jsxDEV(motion.div, {
                animate: {
                    rotate: 360
                },
                transition: {
                    repeat: Infinity,
                    duration: 1,
                    ease: "linear"
                },
                className: "h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
            }, void 0, false, {
                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                lineNumber: 149,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/pages/ClientePortal.tsx",
            lineNumber: 148,
            columnNumber: 7
        }, this);
    }
    if (error) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen flex items-center justify-center px-4",
            children: /*#__PURE__*/ _jsxDEV(AnimatedCard, {
                className: "glass-modal rounded-xl p-8 max-w-md text-center",
                children: [
                    /*#__PURE__*/ _jsxDEV("h1", {
                        className: "font-display text-2xl font-bold text-destructive mb-3",
                        children: "Acesso Negado"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 162,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-muted-foreground",
                        children: error
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 163,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                lineNumber: 161,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/pages/ClientePortal.tsx",
            lineNumber: 160,
            columnNumber: 7
        }, this);
    }
    if (!resellerInfo) return null;
    // If user is logged in → show the panel
    if (user && role === "cliente") {
        return /*#__PURE__*/ _jsxDEV(RevendedorPainel, {
            resellerId: resellerInfo.id,
            resellerBranding: {
                name: resellerInfo.store_name || resellerInfo.nome || "Recargas",
                logoUrl: resellerInfo.store_logo_url,
                primaryColor: resellerInfo.store_primary_color,
                secondaryColor: resellerInfo.store_secondary_color
            }
        }, void 0, false, {
            fileName: "/dev-server/src/pages/ClientePortal.tsx",
            lineNumber: 174,
            columnNumber: 7
        }, this);
    }
    // If user is logged in but NOT as cliente
    if (user && role !== "cliente") {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen flex items-center justify-center px-4",
            children: /*#__PURE__*/ _jsxDEV(AnimatedCard, {
                className: "glass-modal rounded-xl p-8 max-w-md text-center",
                children: [
                    /*#__PURE__*/ _jsxDEV("h1", {
                        className: "font-display text-xl font-bold text-foreground mb-3",
                        children: "Área do Cliente"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 191,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-muted-foreground mb-4",
                        children: [
                            "Você está logado como ",
                            role === "admin" ? "administrador" : "revendedor",
                            ". Esta área é exclusiva para clientes."
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 192,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("a", {
                        href: role === "admin" ? "/admin" : "/painel",
                        className: "text-primary font-semibold hover:underline",
                        children: "Ir para seu painel →"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 195,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                lineNumber: 190,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/pages/ClientePortal.tsx",
            lineNumber: 189,
            columnNumber: 7
        }, this);
    }
    // Branding
    const brandColor = resellerInfo.store_primary_color || undefined;
    const brandName = resellerInfo.store_name || "Recargas Brasil";
    const brandLogo = resellerInfo.store_logo_url || null;
    const btnStyle = brandColor ? {
        backgroundColor: brandColor,
        color: "#fff"
    } : {};
    const accentColor = brandColor || "hsl(var(--primary))";
    const renderBrandName = ()=>{
        if (brandName.includes(" ")) {
            return /*#__PURE__*/ _jsxDEV(_Fragment, {
                children: [
                    brandName.split(" ").slice(0, -1).join(" "),
                    " ",
                    /*#__PURE__*/ _jsxDEV("span", {
                        style: brandColor ? {
                            color: brandColor
                        } : undefined,
                        className: !brandColor ? "text-primary glow-text" : undefined,
                        children: brandName.split(" ").slice(-1)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 219,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true);
        }
        return /*#__PURE__*/ _jsxDEV("span", {
            style: brandColor ? {
                color: brandColor
            } : undefined,
            className: !brandColor ? "text-primary glow-text" : undefined,
            children: brandName
        }, void 0, false, {
            fileName: "/dev-server/src/pages/ClientePortal.tsx",
            lineNumber: 226,
            columnNumber: 7
        }, this);
    };
    // ===== AUTH SCREEN =====
    if (showAuth) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen relative",
            children: [
                /*#__PURE__*/ _jsxDEV("header", {
                    className: "glass-header px-6 py-4 sticky top-0 z-50",
                    children: /*#__PURE__*/ _jsxDEV("div", {
                        className: "max-w-6xl mx-auto flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: ()=>setShowAuth(false),
                                className: "flex items-center gap-2",
                                children: [
                                    brandLogo && /*#__PURE__*/ _jsxDEV("img", {
                                        src: brandLogo,
                                        alt: brandName,
                                        className: "h-8 rounded-lg object-contain"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 239,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("h1", {
                                        className: "font-display text-xl font-bold text-foreground",
                                        children: renderBrandName()
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 240,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                lineNumber: 238,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                lineNumber: 242,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 237,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                    lineNumber: 236,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV(AnimatedPage, {
                    className: "flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8",
                    children: /*#__PURE__*/ _jsxDEV("div", {
                        className: "w-full max-w-md",
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
                                className: "text-center mb-8",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("h2", {
                                        className: "font-display text-2xl font-bold text-foreground mb-2",
                                        children: authMode === "login" ? "Bem-vindo de volta!" : "Crie sua conta"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 253,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-muted-foreground text-sm",
                                        children: authMode === "login" ? "Faça login para acessar suas recargas" : "Cadastre-se para começar a recarregar"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 256,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                lineNumber: 248,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                initial: {
                                    opacity: 0,
                                    scale: 0.95
                                },
                                animate: {
                                    opacity: 1,
                                    scale: 1
                                },
                                className: "glass-modal rounded-xl p-6",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex mb-6 bg-muted/30 rounded-lg p-1",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>setAuthMode("login"),
                                                className: `flex-1 py-2.5 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${authMode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(LogIn, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                        lineNumber: 275,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Entrar"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                lineNumber: 267,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>setAuthMode("register"),
                                                className: `flex-1 py-2.5 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${authMode === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(UserPlus, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                        lineNumber: 285,
                                                        columnNumber: 19
                                                    }, this),
                                                    " Cadastrar"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                lineNumber: 277,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 266,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("form", {
                                        onSubmit: authMode === "login" ? handleLogin : handleRegister,
                                        className: "space-y-4",
                                        children: [
                                            authMode === "register" && /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-sm font-medium text-foreground mb-1",
                                                        children: "Nome"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                        lineNumber: 292,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                        type: "text",
                                                        value: nome,
                                                        onChange: (e)=>setNome(e.target.value),
                                                        required: true,
                                                        className: "w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                        placeholder: "Seu nome completo"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                        lineNumber: 293,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                lineNumber: 291,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-sm font-medium text-foreground mb-1",
                                                        children: "E-mail"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                        lineNumber: 304,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                        type: "email",
                                                        value: email,
                                                        onChange: (e)=>setEmail(e.target.value),
                                                        required: true,
                                                        className: "w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                        placeholder: "seu@email.com"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                        lineNumber: 305,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                lineNumber: 303,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-sm font-medium text-foreground mb-1",
                                                        children: "Senha"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                        lineNumber: 315,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                        type: "password",
                                                        value: password,
                                                        onChange: (e)=>setPassword(e.target.value),
                                                        required: true,
                                                        minLength: 6,
                                                        className: "w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                        placeholder: "Mínimo 6 caracteres"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                lineNumber: 314,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV(motion.button, {
                                                whileHover: {
                                                    scale: 1.02
                                                },
                                                whileTap: {
                                                    scale: 0.98
                                                },
                                                type: "submit",
                                                disabled: submitting,
                                                className: `w-full py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`,
                                                style: btnStyle,
                                                children: submitting ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                    className: "h-5 w-5 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                    lineNumber: 335,
                                                    columnNumber: 21
                                                }, this) : authMode === "login" ? /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(LogIn, {
                                                            className: "h-5 w-5"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                            lineNumber: 337,
                                                            columnNumber: 23
                                                        }, this),
                                                        " Entrar"
                                                    ]
                                                }, void 0, true) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(UserPlus, {
                                                            className: "h-5 w-5"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                            lineNumber: 339,
                                                            columnNumber: 23
                                                        }, this),
                                                        " Criar Conta"
                                                    ]
                                                }, void 0, true)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                lineNumber: 326,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 289,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                lineNumber: 261,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(motion.button, {
                                initial: {
                                    opacity: 0
                                },
                                animate: {
                                    opacity: 1
                                },
                                transition: {
                                    delay: 0.3
                                },
                                onClick: ()=>setShowAuth(false),
                                className: "w-full mt-4 text-center text-sm text-muted-foreground hover:text-foreground transition-colors",
                                children: "← Voltar para a página inicial"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                lineNumber: 345,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 247,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                    lineNumber: 246,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/pages/ClientePortal.tsx",
            lineNumber: 235,
            columnNumber: 7
        }, this);
    }
    // ===== LANDING PAGE =====
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "min-h-screen",
        children: [
            /*#__PURE__*/ _jsxDEV("header", {
                className: "glass-header px-6 py-4 sticky top-0 z-50",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "max-w-6xl mx-auto flex items-center justify-between",
                    children: [
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "flex items-center gap-3",
                            children: [
                                brandLogo && /*#__PURE__*/ _jsxDEV("img", {
                                    src: brandLogo,
                                    alt: brandName,
                                    className: "h-8 rounded-lg object-contain"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 367,
                                    columnNumber: 27
                                }, this),
                                /*#__PURE__*/ _jsxDEV("h1", {
                                    className: "font-display text-xl font-bold text-foreground",
                                    children: renderBrandName()
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 368,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 366,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 371,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("button", {
                                    onClick: ()=>setShowAuth(true),
                                    className: `px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity ${!brandColor ? "bg-primary text-primary-foreground" : ""}`,
                                    style: btnStyle,
                                    children: "Entrar"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 372,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 370,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                    lineNumber: 365,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                lineNumber: 364,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("section", {
                className: "max-w-6xl mx-auto px-6 pt-20 pb-16 text-center",
                children: /*#__PURE__*/ _jsxDEV(motion.div, {
                    initial: {
                        opacity: 0,
                        y: 30
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        duration: 0.6
                    },
                    children: [
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-6",
                            style: brandColor ? {
                                color: brandColor
                            } : undefined,
                            children: [
                                /*#__PURE__*/ _jsxDEV(Zap, {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 391,
                                    columnNumber: 13
                                }, this),
                                " Recargas Rápidas e Seguras"
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 390,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("h2", {
                            className: "font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6",
                            children: [
                                "Recargas de Celular",
                                " ",
                                /*#__PURE__*/ _jsxDEV("span", {
                                    style: brandColor ? {
                                        color: brandColor
                                    } : undefined,
                                    className: !brandColor ? "text-primary glow-text" : "",
                                    children: "Rápidas e Seguras"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 395,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 393,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("p", {
                            className: "text-lg text-muted-foreground max-w-2xl mx-auto mb-10",
                            children: "Recarregue seu celular de forma rápida, segura e com os melhores preços. Todas as operadoras disponíveis."
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 399,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "flex flex-col sm:flex-row items-center justify-center gap-4",
                            children: [
                                /*#__PURE__*/ _jsxDEV(motion.button, {
                                    whileHover: {
                                        scale: 1.03
                                    },
                                    whileTap: {
                                        scale: 0.97
                                    },
                                    onClick: ()=>{
                                        setAuthMode("register");
                                        setShowAuth(true);
                                    },
                                    className: `px-8 py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity flex items-center gap-2 ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`,
                                    style: btnStyle,
                                    children: [
                                        "Começar Agora ",
                                        /*#__PURE__*/ _jsxDEV(ArrowRight, {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                            lineNumber: 410,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 403,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV(motion.button, {
                                    whileHover: {
                                        scale: 1.03
                                    },
                                    whileTap: {
                                        scale: 0.97
                                    },
                                    onClick: ()=>{
                                        setAuthMode("login");
                                        setShowAuth(true);
                                    },
                                    className: "px-8 py-3.5 rounded-xl glass text-foreground font-semibold text-base hover:border-primary/40 transition-colors flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(LogIn, {
                                            className: "h-5 w-5"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                            lineNumber: 418,
                                            columnNumber: 15
                                        }, this),
                                        " Já tenho conta"
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 412,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 402,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                    lineNumber: 385,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                lineNumber: 384,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("section", {
                className: "max-w-4xl mx-auto px-6 pb-16",
                children: /*#__PURE__*/ _jsxDEV(motion.div, {
                    initial: {
                        opacity: 0,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        y: 0
                    },
                    transition: {
                        delay: 0.3,
                        duration: 0.5
                    },
                    className: "grid grid-cols-2 md:grid-cols-4 gap-4",
                    children: storeStats.map((s, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0,
                                scale: 0.9
                            },
                            animate: {
                                opacity: 1,
                                scale: 1
                            },
                            transition: {
                                delay: 0.4 + i * 0.1
                            },
                            className: "glass-card rounded-xl p-5 text-center",
                            children: [
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-3xl font-bold",
                                    children: /*#__PURE__*/ _jsxDEV("span", {
                                        style: brandColor ? {
                                            color: brandColor
                                        } : undefined,
                                        className: !brandColor ? "text-primary glow-text" : undefined,
                                        children: s.value
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 441,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 440,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-sm text-muted-foreground mt-1",
                                    children: s.label
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 445,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, s.label, true, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 433,
                            columnNumber: 13
                        }, this))
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                    lineNumber: 426,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                lineNumber: 425,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("section", {
                className: "max-w-6xl mx-auto px-6 pb-20",
                children: [
                    /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0
                        },
                        whileInView: {
                            opacity: 1
                        },
                        viewport: {
                            once: true
                        },
                        className: "text-center mb-12",
                        children: [
                            /*#__PURE__*/ _jsxDEV("h3", {
                                className: "font-display text-3xl font-bold text-foreground mb-3",
                                children: "Tudo que você precisa"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                lineNumber: 459,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-muted-foreground",
                                children: "Recarregue com facilidade e segurança."
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                lineNumber: 462,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 453,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-5",
                        children: storeFeatures.map((f, i)=>/*#__PURE__*/ _jsxDEV(motion.div, {
                                initial: {
                                    opacity: 0,
                                    y: 20
                                },
                                whileInView: {
                                    opacity: 1,
                                    y: 0
                                },
                                viewport: {
                                    once: true
                                },
                                transition: {
                                    delay: i * 0.08
                                },
                                className: "glass-card rounded-xl p-6 group",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: `w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${!brandColor ? "bg-primary/10" : ""}`,
                                        style: brandColor ? {
                                            backgroundColor: `${brandColor}18`
                                        } : undefined,
                                        children: /*#__PURE__*/ _jsxDEV(f.icon, {
                                            className: `h-6 w-6 ${!brandColor ? "text-primary" : ""}`,
                                            style: brandColor ? {
                                                color: brandColor
                                            } : undefined
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                            lineNumber: 479,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 475,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("h4", {
                                        className: "font-display text-lg font-bold text-foreground mb-2",
                                        children: f.title
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 481,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-sm text-muted-foreground leading-relaxed",
                                        children: f.desc
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                        lineNumber: 482,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, f.title, true, {
                                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                lineNumber: 467,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ClientePortal.tsx",
                        lineNumber: 465,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                lineNumber: 452,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("section", {
                className: "max-w-4xl mx-auto px-6 pb-20",
                children: /*#__PURE__*/ _jsxDEV(motion.div, {
                    initial: {
                        opacity: 0,
                        y: 20
                    },
                    whileInView: {
                        opacity: 1,
                        y: 0
                    },
                    viewport: {
                        once: true
                    },
                    className: "glass-card rounded-2xl p-10 text-center relative overflow-hidden",
                    children: [
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "absolute inset-0 pointer-events-none",
                            style: brandColor ? {
                                background: `linear-gradient(135deg, ${brandColor}08, transparent)`
                            } : {
                                background: "linear-gradient(135deg, hsl(var(--primary) / 0.05), transparent)"
                            }
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 496,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "relative",
                            children: [
                                /*#__PURE__*/ _jsxDEV("h3", {
                                    className: "font-display text-3xl font-bold text-foreground mb-4",
                                    children: "Pronto para recarregar?"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 498,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-muted-foreground mb-8 max-w-lg mx-auto",
                                    children: "Crie sua conta gratuitamente e comece a fazer recargas agora mesmo."
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 501,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex flex-col sm:flex-row items-center justify-center gap-4",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(motion.button, {
                                            whileHover: {
                                                scale: 1.03
                                            },
                                            whileTap: {
                                                scale: 0.97
                                            },
                                            onClick: ()=>{
                                                setAuthMode("register");
                                                setShowAuth(true);
                                            },
                                            className: `px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`,
                                            style: btnStyle,
                                            children: [
                                                "Criar Conta ",
                                                /*#__PURE__*/ _jsxDEV(ArrowRight, {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                    lineNumber: 512,
                                                    columnNumber: 29
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                            lineNumber: 505,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center gap-4 text-sm text-muted-foreground",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(CheckCircle, {
                                                            className: "h-4 w-4 text-success"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                            lineNumber: 515,
                                                            columnNumber: 59
                                                        }, this),
                                                        " Grátis"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                    lineNumber: 515,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "flex items-center gap-1",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(CheckCircle, {
                                                            className: "h-4 w-4 text-success"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                            lineNumber: 516,
                                                            columnNumber: 59
                                                        }, this),
                                                        " Sem taxas ocultas"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                                    lineNumber: 516,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                            lineNumber: 514,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 504,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 497,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                    lineNumber: 490,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                lineNumber: 489,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("footer", {
                className: "glass-header px-6 py-8",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4",
                    children: [
                        /*#__PURE__*/ _jsxDEV("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ _jsxDEV(Headphones, {
                                    className: `h-5 w-5 ${!brandColor ? "text-primary" : ""}`,
                                    style: brandColor ? {
                                        color: brandColor
                                    } : undefined
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 527,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ _jsxDEV("span", {
                                    className: "text-sm text-muted-foreground",
                                    children: "Suporte disponível 24/7"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                                    lineNumber: 528,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 526,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("p", {
                            className: "text-sm text-muted-foreground",
                            children: [
                                "© ",
                                new Date().getFullYear(),
                                " ",
                                brandName,
                                ". Todos os direitos reservados."
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ClientePortal.tsx",
                            lineNumber: 530,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/ClientePortal.tsx",
                    lineNumber: 525,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/ClientePortal.tsx",
                lineNumber: 524,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/ClientePortal.tsx",
        lineNumber: 362,
        columnNumber: 5
    }, this);
}
_s(ClientePortal, "Wlah56zEHOorxIHp3CX+iEwPiPI=", false, function() {
    return [
        useParams,
        useAuth,
        useNavigate
    ];
});
_c = ClientePortal;
var _c;
$RefreshReg$(_c, "ClientePortal");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/ClientePortal.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/ClientePortal.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNsaWVudGVQb3J0YWwudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZVBhcmFtcywgdXNlTmF2aWdhdGUgfSBmcm9tIFwicmVhY3Qtcm91dGVyLWRvbVwiO1xuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tIFwiQC9pbnRlZ3JhdGlvbnMvc3VwYWJhc2UvY2xpZW50XCI7XG5pbXBvcnQgeyB1c2VBdXRoIH0gZnJvbSBcIkAvaG9va3MvdXNlQXV0aFwiO1xuaW1wb3J0IHsgVGhlbWVUb2dnbGUgfSBmcm9tIFwiQC9jb21wb25lbnRzL1RoZW1lVG9nZ2xlXCI7XG5pbXBvcnQgeyBBbmltYXRlZFBhZ2UsIEFuaW1hdGVkQ2FyZCB9IGZyb20gXCJAL2NvbXBvbmVudHMvQW5pbWF0ZWRQYWdlXCI7XG5pbXBvcnQgeyBtb3Rpb24sIEFuaW1hdGVQcmVzZW5jZSB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5pbXBvcnQge1xuICBTbWFydHBob25lLCBaYXAsIFNoaWVsZCwgTG9nSW4sIFVzZXJQbHVzLCBMb2FkZXIyLFxuICBBcnJvd1JpZ2h0LCBDaGVja0NpcmNsZSwgSGVhZHBob25lcywgVHJlbmRpbmdVcCwgQ3JlZGl0Q2FyZCwgR2xvYmUsXG59IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcbmltcG9ydCB7IHN0eWxlZFRvYXN0IGFzIHRvYXN0IH0gZnJvbSBcIkAvbGliL3RvYXN0XCI7XG5pbXBvcnQgUmV2ZW5kZWRvclBhaW5lbCBmcm9tIFwiLi9SZXZlbmRlZG9yUGFpbmVsXCI7XG5cbmludGVyZmFjZSBSZXNlbGxlckluZm8ge1xuICBpZDogc3RyaW5nO1xuICBub21lOiBzdHJpbmcgfCBudWxsO1xuICBzdG9yZV9uYW1lOiBzdHJpbmcgfCBudWxsO1xuICBzdG9yZV9sb2dvX3VybDogc3RyaW5nIHwgbnVsbDtcbiAgc3RvcmVfcHJpbWFyeV9jb2xvcjogc3RyaW5nIHwgbnVsbDtcbiAgc3RvcmVfc2Vjb25kYXJ5X2NvbG9yOiBzdHJpbmcgfCBudWxsO1xuICBhY3RpdmU6IGJvb2xlYW47XG59XG5cbmNvbnN0IHN0b3JlRmVhdHVyZXMgPSBbXG4gIHsgaWNvbjogU21hcnRwaG9uZSwgdGl0bGU6IFwiVG9kYXMgYXMgT3BlcmFkb3Jhc1wiLCBkZXNjOiBcIlJlY2FyZ2FzIHBhcmEgVml2bywgQ2xhcm8sIFRpbSwgT2kgZSBtdWl0byBtYWlzLlwiIH0sXG4gIHsgaWNvbjogWmFwLCB0aXRsZTogXCJSZWNhcmdhIEluc3RhbnTDom5lYVwiLCBkZXNjOiBcIkNyw6lkaXRvIGFkaWNpb25hZG8gZW0gc2VndW5kb3MsIHNlbSBjb21wbGljYcOnw6NvLlwiIH0sXG4gIHsgaWNvbjogU2hpZWxkLCB0aXRsZTogXCIxMDAlIFNlZ3Vyb1wiLCBkZXNjOiBcIlNldXMgZGFkb3MgcHJvdGVnaWRvcyBjb20gY3JpcHRvZ3JhZmlhIGRlIHBvbnRhLlwiIH0sXG4gIHsgaWNvbjogQ3JlZGl0Q2FyZCwgdGl0bGU6IFwiUGFnYW1lbnRvIEbDoWNpbFwiLCBkZXNjOiBcIlBJWCwgY2FydMOjbyBlIG91dHJvcyBtw6l0b2RvcyBkaXNwb27DrXZlaXMuXCIgfSxcbiAgeyBpY29uOiBUcmVuZGluZ1VwLCB0aXRsZTogXCJNZWxob3JlcyBQcmXDp29zXCIsIGRlc2M6IFwiVmFsb3JlcyBjb21wZXRpdGl2b3MgZSBwcm9tb8Onw7VlcyBleGNsdXNpdmFzLlwiIH0sXG4gIHsgaWNvbjogR2xvYmUsIHRpdGxlOiBcIkFjZXNzZSBkZSBRdWFscXVlciBMdWdhclwiLCBkZXNjOiBcIkZhw6dhIHJlY2FyZ2FzIHBlbG8gY2VsdWxhciwgdGFibGV0IG91IGNvbXB1dGFkb3IuXCIgfSxcbl07XG5cbmNvbnN0IHN0b3JlU3RhdHMgPSBbXG4gIHsgdmFsdWU6IFwiOTkuOSVcIiwgbGFiZWw6IFwiVXB0aW1lXCIgfSxcbiAgeyB2YWx1ZTogXCI8M3NcIiwgbGFiZWw6IFwiVGVtcG8gZGUgUmVjYXJnYVwiIH0sXG4gIHsgdmFsdWU6IFwiMjQvN1wiLCBsYWJlbDogXCJEaXNwb25pYmlsaWRhZGVcIiB9LFxuICB7IHZhbHVlOiBcIjEwMCVcIiwgbGFiZWw6IFwiRGlnaXRhbFwiIH0sXG5dO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBDbGllbnRlUG9ydGFsKCkge1xuICBjb25zdCB7IHNsdWcgfSA9IHVzZVBhcmFtczx7IHNsdWc6IHN0cmluZyB9PigpO1xuICBjb25zdCB7IHVzZXIsIHJvbGUsIGxvYWRpbmc6IGF1dGhMb2FkaW5nIH0gPSB1c2VBdXRoKCk7XG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcblxuICBjb25zdCBbcmVzZWxsZXJJbmZvLCBzZXRSZXNlbGxlckluZm9dID0gdXNlU3RhdGU8UmVzZWxsZXJJbmZvIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbc2hvd0F1dGgsIHNldFNob3dBdXRoXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAvLyBBdXRoIGZvcm1cbiAgY29uc3QgW2F1dGhNb2RlLCBzZXRBdXRoTW9kZV0gPSB1c2VTdGF0ZTxcImxvZ2luXCIgfCBcInJlZ2lzdGVyXCI+KFwibG9naW5cIik7XG4gIGNvbnN0IFtlbWFpbCwgc2V0RW1haWxdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtwYXNzd29yZCwgc2V0UGFzc3dvcmRdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtub21lLCBzZXROb21lXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbc3VibWl0dGluZywgc2V0U3VibWl0dGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXNsdWcpIHtcbiAgICAgIHNldEVycm9yKFwiTGluayBpbnbDoWxpZG8uXCIpO1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvYWRSZXNlbGxlcigpO1xuICB9LCBbc2x1Z10pO1xuXG4gIGNvbnN0IGxvYWRSZXNlbGxlciA9IGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgLy8gRmlyc3QgZ2V0IHByb2ZpbGUgYnkgc2x1Z1xuICAgICAgY29uc3QgeyBkYXRhOiBwcm9maWxlIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAuZnJvbShcInByb2ZpbGVzXCIpXG4gICAgICAgIC5zZWxlY3QoXCJpZCwgbm9tZSwgc3RvcmVfbmFtZSwgc3RvcmVfbG9nb191cmwsIHN0b3JlX3ByaW1hcnlfY29sb3IsIHN0b3JlX3NlY29uZGFyeV9jb2xvciwgYWN0aXZlXCIpXG4gICAgICAgIC5lcShcInNsdWdcIiwgc2x1ZyEpXG4gICAgICAgIC5tYXliZVNpbmdsZSgpO1xuXG4gICAgICBpZiAoIXByb2ZpbGUpIHtcbiAgICAgICAgc2V0RXJyb3IoXCJMb2phIG7Do28gZW5jb250cmFkYS4gVmVyaWZpcXVlIG8gbGluay5cIik7XG4gICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmICghcHJvZmlsZS5hY3RpdmUpIHtcbiAgICAgICAgc2V0RXJyb3IoXCJFc3RhIGxvamEgZXN0w6EgdGVtcG9yYXJpYW1lbnRlIGluYXRpdmEuXCIpO1xuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBWZXJpZnkgcm9sZSBpbiBwYXJhbGxlbC1yZWFkeSBmYXNoaW9uIChhbHJlYWR5IGhhdmUgcHJvZmlsZS5pZClcbiAgICAgIGNvbnN0IHsgZGF0YTogcm9sZURhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKFwidXNlcl9yb2xlc1wiKVxuICAgICAgICAuc2VsZWN0KFwicm9sZVwiKVxuICAgICAgICAuZXEoXCJ1c2VyX2lkXCIsIHByb2ZpbGUuaWQpXG4gICAgICAgIC5lcShcInJvbGVcIiwgXCJyZXZlbmRlZG9yXCIpXG4gICAgICAgIC5tYXliZVNpbmdsZSgpO1xuXG4gICAgICBpZiAoIXJvbGVEYXRhKSB7XG4gICAgICAgIHNldEVycm9yKFwiTG9qYSBuw6NvIGVuY29udHJhZGEuXCIpO1xuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZXRSZXNlbGxlckluZm8ocHJvZmlsZSBhcyBSZXNlbGxlckluZm8pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgc2V0RXJyb3IoXCJFcnJvIGFvIGNhcnJlZ2FyIGRhZG9zIGRhIGxvamEuXCIpO1xuICAgIH1cbiAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgfTtcblxuICBjb25zdCBoYW5kbGVMb2dpbiA9IGFzeW5jIChlOiBSZWFjdC5Gb3JtRXZlbnQpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQpIHsgdG9hc3QuZXJyb3IoXCJQcmVlbmNoYSB0b2RvcyBvcyBjYW1wb3NcIik7IHJldHVybjsgfVxuICAgIHNldFN1Ym1pdHRpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnbkluV2l0aFBhc3N3b3JkKHsgZW1haWwsIHBhc3N3b3JkIH0pO1xuICAgICAgaWYgKGVycm9yKSB0aHJvdyBlcnJvcjtcbiAgICAgIHRvYXN0LnN1Y2Nlc3MoXCJMb2dpbiByZWFsaXphZG8hXCIpO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICB0b2FzdC5lcnJvcihlcnIubWVzc2FnZSB8fCBcIkVycm8gYW8gZmF6ZXIgbG9naW5cIik7XG4gICAgfVxuICAgIHNldFN1Ym1pdHRpbmcoZmFsc2UpO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVJlZ2lzdGVyID0gYXN5bmMgKGU6IFJlYWN0LkZvcm1FdmVudCkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCB8fCAhbm9tZS50cmltKCkpIHsgdG9hc3QuZXJyb3IoXCJQcmVlbmNoYSB0b2RvcyBvcyBjYW1wb3NcIik7IHJldHVybjsgfVxuICAgIGlmIChwYXNzd29yZC5sZW5ndGggPCA2KSB7IHRvYXN0LmVycm9yKFwiU2VuaGEgZGV2ZSB0ZXIgbm8gbcOtbmltbyA2IGNhcmFjdGVyZXNcIik7IHJldHVybjsgfVxuICAgIGlmICghcmVzZWxsZXJJbmZvKSByZXR1cm47XG4gICAgc2V0U3VibWl0dGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnVuY3Rpb25zLmludm9rZShcImNsaWVudC1yZWdpc3RlclwiLCB7XG4gICAgICAgIGJvZHk6IHsgZW1haWwsIHBhc3N3b3JkLCBub21lOiBub21lLnRyaW0oKSwgcmVzZWxsZXJfaWQ6IHJlc2VsbGVySW5mby5pZCB9LFxuICAgICAgfSk7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICAgICAgaWYgKGRhdGE/LmVycm9yKSB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvcik7XG5cbiAgICAgIGNvbnN0IHsgZXJyb3I6IGxvZ2luRXJyIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25JbldpdGhQYXNzd29yZCh7IGVtYWlsLCBwYXNzd29yZCB9KTtcbiAgICAgIGlmIChsb2dpbkVycikgdGhyb3cgbG9naW5FcnI7XG4gICAgICB0b2FzdC5zdWNjZXNzKFwiQ29udGEgY3JpYWRhIGNvbSBzdWNlc3NvIVwiKTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgdG9hc3QuZXJyb3IoZXJyLm1lc3NhZ2UgfHwgXCJFcnJvIGFvIGNyaWFyIGNvbnRhXCIpO1xuICAgIH1cbiAgICBzZXRTdWJtaXR0aW5nKGZhbHNlKTtcbiAgfTtcblxuICAvLyBMb2FkaW5nIHN0YXRlXG4gIGlmIChsb2FkaW5nIHx8IGF1dGhMb2FkaW5nKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgYW5pbWF0ZT17eyByb3RhdGU6IDM2MCB9fVxuICAgICAgICAgIHRyYW5zaXRpb249e3sgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDEsIGVhc2U6IFwibGluZWFyXCIgfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJoLTggdy04IGJvcmRlci00IGJvcmRlci1wcmltYXJ5IGJvcmRlci10LXRyYW5zcGFyZW50IHJvdW5kZWQtZnVsbFwiXG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB4LTRcIj5cbiAgICAgICAgPEFuaW1hdGVkQ2FyZCBjbGFzc05hbWU9XCJnbGFzcy1tb2RhbCByb3VuZGVkLXhsIHAtOCBtYXgtdy1tZCB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZGVzdHJ1Y3RpdmUgbWItM1wiPkFjZXNzbyBOZWdhZG88L2gxPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPntlcnJvcn08L3A+XG4gICAgICAgIDwvQW5pbWF0ZWRDYXJkPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGlmICghcmVzZWxsZXJJbmZvKSByZXR1cm4gbnVsbDtcblxuICAvLyBJZiB1c2VyIGlzIGxvZ2dlZCBpbiDihpIgc2hvdyB0aGUgcGFuZWxcbiAgaWYgKHVzZXIgJiYgcm9sZSA9PT0gXCJjbGllbnRlXCIpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFJldmVuZGVkb3JQYWluZWxcbiAgICAgICAgcmVzZWxsZXJJZD17cmVzZWxsZXJJbmZvLmlkfVxuICAgICAgICByZXNlbGxlckJyYW5kaW5nPXt7XG4gICAgICAgICAgbmFtZTogcmVzZWxsZXJJbmZvLnN0b3JlX25hbWUgfHwgcmVzZWxsZXJJbmZvLm5vbWUgfHwgXCJSZWNhcmdhc1wiLFxuICAgICAgICAgIGxvZ29Vcmw6IHJlc2VsbGVySW5mby5zdG9yZV9sb2dvX3VybCxcbiAgICAgICAgICBwcmltYXJ5Q29sb3I6IHJlc2VsbGVySW5mby5zdG9yZV9wcmltYXJ5X2NvbG9yLFxuICAgICAgICAgIHNlY29uZGFyeUNvbG9yOiByZXNlbGxlckluZm8uc3RvcmVfc2Vjb25kYXJ5X2NvbG9yLFxuICAgICAgICB9fVxuICAgICAgLz5cbiAgICApO1xuICB9XG5cbiAgLy8gSWYgdXNlciBpcyBsb2dnZWQgaW4gYnV0IE5PVCBhcyBjbGllbnRlXG4gIGlmICh1c2VyICYmIHJvbGUgIT09IFwiY2xpZW50ZVwiKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB4LTRcIj5cbiAgICAgICAgPEFuaW1hdGVkQ2FyZCBjbGFzc05hbWU9XCJnbGFzcy1tb2RhbCByb3VuZGVkLXhsIHAtOCBtYXgtdy1tZCB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC14bCBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG1iLTNcIj7DgXJlYSBkbyBDbGllbnRlPC9oMT5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgbWItNFwiPlxuICAgICAgICAgICAgVm9jw6ogZXN0w6EgbG9nYWRvIGNvbW8ge3JvbGUgPT09IFwiYWRtaW5cIiA/IFwiYWRtaW5pc3RyYWRvclwiIDogXCJyZXZlbmRlZG9yXCJ9LiBFc3RhIMOhcmVhIMOpIGV4Y2x1c2l2YSBwYXJhIGNsaWVudGVzLlxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8YSBocmVmPXtyb2xlID09PSBcImFkbWluXCIgPyBcIi9hZG1pblwiIDogXCIvcGFpbmVsXCJ9IGNsYXNzTmFtZT1cInRleHQtcHJpbWFyeSBmb250LXNlbWlib2xkIGhvdmVyOnVuZGVybGluZVwiPlxuICAgICAgICAgICAgSXIgcGFyYSBzZXUgcGFpbmVsIOKGklxuICAgICAgICAgIDwvYT5cbiAgICAgICAgPC9BbmltYXRlZENhcmQ+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgLy8gQnJhbmRpbmdcbiAgY29uc3QgYnJhbmRDb2xvciA9IHJlc2VsbGVySW5mby5zdG9yZV9wcmltYXJ5X2NvbG9yIHx8IHVuZGVmaW5lZDtcbiAgY29uc3QgYnJhbmROYW1lID0gcmVzZWxsZXJJbmZvLnN0b3JlX25hbWUgfHwgXCJSZWNhcmdhcyBCcmFzaWxcIjtcbiAgY29uc3QgYnJhbmRMb2dvID0gcmVzZWxsZXJJbmZvLnN0b3JlX2xvZ29fdXJsIHx8IG51bGw7XG5cbiAgY29uc3QgYnRuU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSBicmFuZENvbG9yXG4gICAgPyB7IGJhY2tncm91bmRDb2xvcjogYnJhbmRDb2xvciwgY29sb3I6IFwiI2ZmZlwiIH1cbiAgICA6IHt9O1xuXG4gIGNvbnN0IGFjY2VudENvbG9yID0gYnJhbmRDb2xvciB8fCBcImhzbCh2YXIoLS1wcmltYXJ5KSlcIjtcblxuICBjb25zdCByZW5kZXJCcmFuZE5hbWUgPSAoKSA9PiB7XG4gICAgaWYgKGJyYW5kTmFtZS5pbmNsdWRlcyhcIiBcIikpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDw+XG4gICAgICAgICAge2JyYW5kTmFtZS5zcGxpdChcIiBcIikuc2xpY2UoMCwgLTEpLmpvaW4oXCIgXCIpfXtcIiBcIn1cbiAgICAgICAgICA8c3BhbiBzdHlsZT17YnJhbmRDb2xvciA/IHsgY29sb3I6IGJyYW5kQ29sb3IgfSA6IHVuZGVmaW5lZH0gY2xhc3NOYW1lPXshYnJhbmRDb2xvciA/IFwidGV4dC1wcmltYXJ5IGdsb3ctdGV4dFwiIDogdW5kZWZpbmVkfT5cbiAgICAgICAgICAgIHticmFuZE5hbWUuc3BsaXQoXCIgXCIpLnNsaWNlKC0xKX1cbiAgICAgICAgICA8L3NwYW4+XG4gICAgICAgIDwvPlxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIChcbiAgICAgIDxzcGFuIHN0eWxlPXticmFuZENvbG9yID8geyBjb2xvcjogYnJhbmRDb2xvciB9IDogdW5kZWZpbmVkfSBjbGFzc05hbWU9eyFicmFuZENvbG9yID8gXCJ0ZXh0LXByaW1hcnkgZ2xvdy10ZXh0XCIgOiB1bmRlZmluZWR9PlxuICAgICAgICB7YnJhbmROYW1lfVxuICAgICAgPC9zcGFuPlxuICAgICk7XG4gIH07XG5cbiAgLy8gPT09PT0gQVVUSCBTQ1JFRU4gPT09PT1cbiAgaWYgKHNob3dBdXRoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIHJlbGF0aXZlXCI+XG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwiZ2xhc3MtaGVhZGVyIHB4LTYgcHktNCBzdGlja3kgdG9wLTAgei01MFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWF4LXctNnhsIG14LWF1dG8gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFNob3dBdXRoKGZhbHNlKX0gY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAge2JyYW5kTG9nbyAmJiA8aW1nIHNyYz17YnJhbmRMb2dvfSBhbHQ9e2JyYW5kTmFtZX0gY2xhc3NOYW1lPVwiaC04IHJvdW5kZWQtbGcgb2JqZWN0LWNvbnRhaW5cIiAvPn1cbiAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImZvbnQtZGlzcGxheSB0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57cmVuZGVyQnJhbmROYW1lKCl9PC9oMT5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPFRoZW1lVG9nZ2xlIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvaGVhZGVyPlxuXG4gICAgICAgIDxBbmltYXRlZFBhZ2UgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWluLWgtW2NhbGMoMTAwdmgtNjRweCldIHB4LTQgcHktOFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIG1heC13LW1kXCI+XG4gICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBtYi04XCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cImZvbnQtZGlzcGxheSB0ZXh0LTJ4bCBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG1iLTJcIj5cbiAgICAgICAgICAgICAgICB7YXV0aE1vZGUgPT09IFwibG9naW5cIiA/IFwiQmVtLXZpbmRvIGRlIHZvbHRhIVwiIDogXCJDcmllIHN1YSBjb250YVwifVxuICAgICAgICAgICAgICA8L2gyPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgdGV4dC1zbVwiPlxuICAgICAgICAgICAgICAgIHthdXRoTW9kZSA9PT0gXCJsb2dpblwiID8gXCJGYcOnYSBsb2dpbiBwYXJhIGFjZXNzYXIgc3VhcyByZWNhcmdhc1wiIDogXCJDYWRhc3RyZS1zZSBwYXJhIGNvbWXDp2FyIGEgcmVjYXJyZWdhclwifVxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJnbGFzcy1tb2RhbCByb3VuZGVkLXhsIHAtNlwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBtYi02IGJnLW11dGVkLzMwIHJvdW5kZWQtbGcgcC0xXCI+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QXV0aE1vZGUoXCJsb2dpblwiKX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtMSBweS0yLjUgcm91bmRlZC1tZCB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvbi1hbGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgJHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aE1vZGUgPT09IFwibG9naW5cIlxuICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1iYWNrZ3JvdW5kIHRleHQtZm9yZWdyb3VuZCBzaGFkb3ctc21cIlxuICAgICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6dGV4dC1mb3JlZ3JvdW5kXCJcbiAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxMb2dJbiBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz4gRW50cmFyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0QXV0aE1vZGUoXCJyZWdpc3RlclwiKX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtMSBweS0yLjUgcm91bmRlZC1tZCB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdHJhbnNpdGlvbi1hbGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgJHtcbiAgICAgICAgICAgICAgICAgICAgYXV0aE1vZGUgPT09IFwicmVnaXN0ZXJcIlxuICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1iYWNrZ3JvdW5kIHRleHQtZm9yZWdyb3VuZCBzaGFkb3ctc21cIlxuICAgICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6dGV4dC1mb3JlZ3JvdW5kXCJcbiAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxVc2VyUGx1cyBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz4gQ2FkYXN0cmFyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxmb3JtIG9uU3VibWl0PXthdXRoTW9kZSA9PT0gXCJsb2dpblwiID8gaGFuZGxlTG9naW4gOiBoYW5kbGVSZWdpc3Rlcn0gY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICAgICAge2F1dGhNb2RlID09PSBcInJlZ2lzdGVyXCIgJiYgKFxuICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kIG1iLTFcIj5Ob21lPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtub21lfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IHNldE5vbWUoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTMgcHktMi41IHJvdW5kZWQtbGcgZ2xhc3MtaW5wdXQgdGV4dC1mb3JlZ3JvdW5kIHBsYWNlaG9sZGVyOnRleHQtbXV0ZWQtZm9yZWdyb3VuZCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctcmluZ1wiXG4gICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZXUgbm9tZSBjb21wbGV0b1wiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWZvcmVncm91bmQgbWItMVwiPkUtbWFpbDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2VtYWlsfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRFbWFpbChlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweC0zIHB5LTIuNSByb3VuZGVkLWxnIGdsYXNzLWlucHV0IHRleHQtZm9yZWdyb3VuZCBwbGFjZWhvbGRlcjp0ZXh0LW11dGVkLWZvcmVncm91bmQgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXJpbmdcIlxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cInNldUBlbWFpbC5jb21cIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kIG1iLTFcIj5TZW5oYTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3Bhc3N3b3JkfVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRQYXNzd29yZChlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aD17Nn1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTMgcHktMi41IHJvdW5kZWQtbGcgZ2xhc3MtaW5wdXQgdGV4dC1mb3JlZ3JvdW5kIHBsYWNlaG9sZGVyOnRleHQtbXV0ZWQtZm9yZWdyb3VuZCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctcmluZ1wiXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTcOtbmltbyA2IGNhcmFjdGVyZXNcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8bW90aW9uLmJ1dHRvblxuICAgICAgICAgICAgICAgICAgd2hpbGVIb3Zlcj17eyBzY2FsZTogMS4wMiB9fVxuICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTggfX1cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3N1Ym1pdHRpbmd9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgcHktMyByb3VuZGVkLWxnIGZvbnQtYm9sZCB0ZXh0LWxnIGhvdmVyOm9wYWNpdHktOTAgdHJhbnNpdGlvbi1vcGFjaXR5IGRpc2FibGVkOm9wYWNpdHktNTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgJHshYnJhbmRDb2xvciA/IFwiYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBnbG93LXByaW1hcnlcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgICAgIHN0eWxlPXtidG5TdHlsZX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7c3VibWl0dGluZyA/IChcbiAgICAgICAgICAgICAgICAgICAgPExvYWRlcjIgY2xhc3NOYW1lPVwiaC01IHctNSBhbmltYXRlLXNwaW5cIiAvPlxuICAgICAgICAgICAgICAgICAgKSA6IGF1dGhNb2RlID09PSBcImxvZ2luXCIgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+PExvZ0luIGNsYXNzTmFtZT1cImgtNSB3LTVcIiAvPiBFbnRyYXI8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgIDw+PFVzZXJQbHVzIGNsYXNzTmFtZT1cImgtNSB3LTVcIiAvPiBDcmlhciBDb250YTwvPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5idXR0b24+XG4gICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cblxuICAgICAgICAgICAgPG1vdGlvbi5idXR0b25cbiAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjMgfX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd0F1dGgoZmFsc2UpfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgbXQtNCB0ZXh0LWNlbnRlciB0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3Zlcjp0ZXh0LWZvcmVncm91bmQgdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICDihpAgVm9sdGFyIHBhcmEgYSBww6FnaW5hIGluaWNpYWxcbiAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9BbmltYXRlZFBhZ2U+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgLy8gPT09PT0gTEFORElORyBQQUdFID09PT09XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW5cIj5cbiAgICAgIHsvKiBIZWFkZXIgKi99XG4gICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cImdsYXNzLWhlYWRlciBweC02IHB5LTQgc3RpY2t5IHRvcC0wIHotNTBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy02eGwgbXgtYXV0byBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICB7YnJhbmRMb2dvICYmIDxpbWcgc3JjPXticmFuZExvZ299IGFsdD17YnJhbmROYW1lfSBjbGFzc05hbWU9XCJoLTggcm91bmRlZC1sZyBvYmplY3QtY29udGFpblwiIC8+fVxuICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImZvbnQtZGlzcGxheSB0ZXh0LXhsIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj57cmVuZGVyQnJhbmROYW1lKCl9PC9oMT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICA8VGhlbWVUb2dnbGUgLz5cbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd0F1dGgodHJ1ZSl9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHB4LTUgcHktMiByb3VuZGVkLWxnIHRleHQtc20gZm9udC1zZW1pYm9sZCBob3ZlcjpvcGFjaXR5LTkwIHRyYW5zaXRpb24tb3BhY2l0eSAkeyFicmFuZENvbG9yID8gXCJiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kXCIgOiBcIlwifWB9XG4gICAgICAgICAgICAgIHN0eWxlPXtidG5TdHlsZX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgRW50cmFyXG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAgey8qIEhlcm8gKi99XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJtYXgtdy02eGwgbXgtYXV0byBweC02IHB0LTIwIHBiLTE2IHRleHQtY2VudGVyXCI+XG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAzMCB9fVxuICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDAuNiB9fVxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtNCBweS0xLjUgcm91bmRlZC1mdWxsIGdsYXNzIHRleHQtc20gZm9udC1tZWRpdW0gbWItNlwiIHN0eWxlPXticmFuZENvbG9yID8geyBjb2xvcjogYnJhbmRDb2xvciB9IDogdW5kZWZpbmVkfT5cbiAgICAgICAgICAgIDxaYXAgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IFJlY2FyZ2FzIFLDoXBpZGFzIGUgU2VndXJhc1xuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC00eGwgc206dGV4dC01eGwgbGc6dGV4dC02eGwgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZCBsZWFkaW5nLXRpZ2h0IG1iLTZcIj5cbiAgICAgICAgICAgIFJlY2FyZ2FzIGRlIENlbHVsYXJ7XCIgXCJ9XG4gICAgICAgICAgICA8c3BhbiBzdHlsZT17YnJhbmRDb2xvciA/IHsgY29sb3I6IGJyYW5kQ29sb3IgfSA6IHVuZGVmaW5lZH0gY2xhc3NOYW1lPXshYnJhbmRDb2xvciA/IFwidGV4dC1wcmltYXJ5IGdsb3ctdGV4dFwiIDogXCJcIn0+XG4gICAgICAgICAgICAgIFLDoXBpZGFzIGUgU2VndXJhc1xuICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1sZyB0ZXh0LW11dGVkLWZvcmVncm91bmQgbWF4LXctMnhsIG14LWF1dG8gbWItMTBcIj5cbiAgICAgICAgICAgIFJlY2FycmVndWUgc2V1IGNlbHVsYXIgZGUgZm9ybWEgcsOhcGlkYSwgc2VndXJhIGUgY29tIG9zIG1lbGhvcmVzIHByZcOnb3MuIFRvZGFzIGFzIG9wZXJhZG9yYXMgZGlzcG9uw612ZWlzLlxuICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC00XCI+XG4gICAgICAgICAgICA8bW90aW9uLmJ1dHRvblxuICAgICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHNjYWxlOiAxLjAzIH19XG4gICAgICAgICAgICAgIHdoaWxlVGFwPXt7IHNjYWxlOiAwLjk3IH19XG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHsgc2V0QXV0aE1vZGUoXCJyZWdpc3RlclwiKTsgc2V0U2hvd0F1dGgodHJ1ZSk7IH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17YHB4LTggcHktMy41IHJvdW5kZWQteGwgZm9udC1zZW1pYm9sZCB0ZXh0LWJhc2UgaG92ZXI6b3BhY2l0eS05MCB0cmFuc2l0aW9uLW9wYWNpdHkgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgJHshYnJhbmRDb2xvciA/IFwiYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBnbG93LXByaW1hcnlcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgc3R5bGU9e2J0blN0eWxlfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICBDb21lw6dhciBBZ29yYSA8QXJyb3dSaWdodCBjbGFzc05hbWU9XCJoLTUgdy01XCIgLz5cbiAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uXG4gICAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgc2NhbGU6IDEuMDMgfX1cbiAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTcgfX1cbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBzZXRBdXRoTW9kZShcImxvZ2luXCIpOyBzZXRTaG93QXV0aCh0cnVlKTsgfX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtOCBweS0zLjUgcm91bmRlZC14bCBnbGFzcyB0ZXh0LWZvcmVncm91bmQgZm9udC1zZW1pYm9sZCB0ZXh0LWJhc2UgaG92ZXI6Ym9yZGVyLXByaW1hcnkvNDAgdHJhbnNpdGlvbi1jb2xvcnMgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8TG9nSW4gY2xhc3NOYW1lPVwiaC01IHctNVwiIC8+IErDoSB0ZW5obyBjb250YVxuICAgICAgICAgICAgPC9tb3Rpb24uYnV0dG9uPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICA8L3NlY3Rpb24+XG5cbiAgICAgIHsvKiBTdGF0cyAqL31cbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cIm1heC13LTR4bCBteC1hdXRvIHB4LTYgcGItMTZcIj5cbiAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19XG4gICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4zLCBkdXJhdGlvbjogMC41IH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMiBtZDpncmlkLWNvbHMtNCBnYXAtNFwiXG4gICAgICAgID5cbiAgICAgICAgICB7c3RvcmVTdGF0cy5tYXAoKHMsIGkpID0+IChcbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGtleT17cy5sYWJlbH1cbiAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45IH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgc2NhbGU6IDEgfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC40ICsgaSAqIDAuMSB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJnbGFzcy1jYXJkIHJvdW5kZWQteGwgcC01IHRleHQtY2VudGVyXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC0zeGwgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e2JyYW5kQ29sb3IgPyB7IGNvbG9yOiBicmFuZENvbG9yIH0gOiB1bmRlZmluZWR9IGNsYXNzTmFtZT17IWJyYW5kQ29sb3IgPyBcInRleHQtcHJpbWFyeSBnbG93LXRleHRcIiA6IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgICAgICB7cy52YWx1ZX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbXQtMVwiPntzLmxhYmVsfTwvcD5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7LyogRmVhdHVyZXMgKi99XG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJtYXgtdy02eGwgbXgtYXV0byBweC02IHBiLTIwXCI+XG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgd2hpbGVJblZpZXc9e3sgb3BhY2l0eTogMSB9fVxuICAgICAgICAgIHZpZXdwb3J0PXt7IG9uY2U6IHRydWUgfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBtYi0xMlwiXG4gICAgICAgID5cbiAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmQgbWItM1wiPlxuICAgICAgICAgICAgVHVkbyBxdWUgdm9jw6ogcHJlY2lzYVxuICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+UmVjYXJyZWd1ZSBjb20gZmFjaWxpZGFkZSBlIHNlZ3VyYW7Dp2EuPC9wPlxuICAgICAgICA8L21vdGlvbi5kaXY+XG5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIHNtOmdyaWQtY29scy0yIGxnOmdyaWQtY29scy0zIGdhcC01XCI+XG4gICAgICAgICAge3N0b3JlRmVhdHVyZXMubWFwKChmLCBpKSA9PiAoXG4gICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICBrZXk9e2YudGl0bGV9XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMjAgfX1cbiAgICAgICAgICAgICAgd2hpbGVJblZpZXc9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICB2aWV3cG9ydD17eyBvbmNlOiB0cnVlIH19XG4gICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IGkgKiAwLjA4IH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdsYXNzLWNhcmQgcm91bmRlZC14bCBwLTYgZ3JvdXBcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdy0xMiBoLTEyIHJvdW5kZWQtbGcgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWItNCB0cmFuc2l0aW9uLWNvbG9ycyAkeyFicmFuZENvbG9yID8gXCJiZy1wcmltYXJ5LzEwXCIgOiBcIlwifWB9XG4gICAgICAgICAgICAgICAgc3R5bGU9e2JyYW5kQ29sb3IgPyB7IGJhY2tncm91bmRDb2xvcjogYCR7YnJhbmRDb2xvcn0xOGAgfSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxmLmljb24gY2xhc3NOYW1lPXtgaC02IHctNiAkeyFicmFuZENvbG9yID8gXCJ0ZXh0LXByaW1hcnlcIiA6IFwiXCJ9YH0gc3R5bGU9e2JyYW5kQ29sb3IgPyB7IGNvbG9yOiBicmFuZENvbG9yIH0gOiB1bmRlZmluZWR9IC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8aDQgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtbGcgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZCBtYi0yXCI+e2YudGl0bGV9PC9oND5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbGVhZGluZy1yZWxheGVkXCI+e2YuZGVzY308L3A+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICB7LyogQ1RBICovfVxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwibWF4LXctNHhsIG14LWF1dG8gcHgtNiBwYi0yMFwiPlxuICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMjAgfX1cbiAgICAgICAgICB3aGlsZUluVmlldz17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgdmlld3BvcnQ9e3sgb25jZTogdHJ1ZSB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cImdsYXNzLWNhcmQgcm91bmRlZC0yeGwgcC0xMCB0ZXh0LWNlbnRlciByZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wIHBvaW50ZXItZXZlbnRzLW5vbmVcIiBzdHlsZT17YnJhbmRDb2xvciA/IHsgYmFja2dyb3VuZDogYGxpbmVhci1ncmFkaWVudCgxMzVkZWcsICR7YnJhbmRDb2xvcn0wOCwgdHJhbnNwYXJlbnQpYCB9IDogeyBiYWNrZ3JvdW5kOiBcImxpbmVhci1ncmFkaWVudCgxMzVkZWcsIGhzbCh2YXIoLS1wcmltYXJ5KSAvIDAuMDUpLCB0cmFuc3BhcmVudClcIiB9fSAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmVcIj5cbiAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC0zeGwgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZCBtYi00XCI+XG4gICAgICAgICAgICAgIFByb250byBwYXJhIHJlY2FycmVnYXI/XG4gICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1iLTggbWF4LXctbGcgbXgtYXV0b1wiPlxuICAgICAgICAgICAgICBDcmllIHN1YSBjb250YSBncmF0dWl0YW1lbnRlIGUgY29tZWNlIGEgZmF6ZXIgcmVjYXJnYXMgYWdvcmEgbWVzbW8uXG4gICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC00XCI+XG4gICAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uXG4gICAgICAgICAgICAgICAgd2hpbGVIb3Zlcj17eyBzY2FsZTogMS4wMyB9fVxuICAgICAgICAgICAgICAgIHdoaWxlVGFwPXt7IHNjYWxlOiAwLjk3IH19XG4gICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBzZXRBdXRoTW9kZShcInJlZ2lzdGVyXCIpOyBzZXRTaG93QXV0aCh0cnVlKTsgfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BweC04IHB5LTMuNSByb3VuZGVkLXhsIGZvbnQtc2VtaWJvbGQgaG92ZXI6b3BhY2l0eS05MCB0cmFuc2l0aW9uLW9wYWNpdHkgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgJHshYnJhbmRDb2xvciA/IFwiYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBnbG93LXByaW1hcnlcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgICBzdHlsZT17YnRuU3R5bGV9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICBDcmlhciBDb250YSA8QXJyb3dSaWdodCBjbGFzc05hbWU9XCJoLTUgdy01XCIgLz5cbiAgICAgICAgICAgICAgPC9tb3Rpb24uYnV0dG9uPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC00IHRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIj48Q2hlY2tDaXJjbGUgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LXN1Y2Nlc3NcIiAvPiBHcsOhdGlzPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCI+PENoZWNrQ2lyY2xlIGNsYXNzTmFtZT1cImgtNCB3LTQgdGV4dC1zdWNjZXNzXCIgLz4gU2VtIHRheGFzIG9jdWx0YXM8L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgey8qIEZvb3RlciAqL31cbiAgICAgIDxmb290ZXIgY2xhc3NOYW1lPVwiZ2xhc3MtaGVhZGVyIHB4LTYgcHktOFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1heC13LTZ4bCBteC1hdXRvIGZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtNFwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgIDxIZWFkcGhvbmVzIGNsYXNzTmFtZT17YGgtNSB3LTUgJHshYnJhbmRDb2xvciA/IFwidGV4dC1wcmltYXJ5XCIgOiBcIlwifWB9IHN0eWxlPXticmFuZENvbG9yID8geyBjb2xvcjogYnJhbmRDb2xvciB9IDogdW5kZWZpbmVkfSAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5TdXBvcnRlIGRpc3BvbsOtdmVsIDI0Lzc8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgIMKpIHtuZXcgRGF0ZSgpLmdldEZ1bGxZZWFyKCl9IHticmFuZE5hbWV9LiBUb2RvcyBvcyBkaXJlaXRvcyByZXNlcnZhZG9zLlxuICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Zvb3Rlcj5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsInVzZVBhcmFtcyIsInVzZU5hdmlnYXRlIiwic3VwYWJhc2UiLCJ1c2VBdXRoIiwiVGhlbWVUb2dnbGUiLCJBbmltYXRlZFBhZ2UiLCJBbmltYXRlZENhcmQiLCJtb3Rpb24iLCJTbWFydHBob25lIiwiWmFwIiwiU2hpZWxkIiwiTG9nSW4iLCJVc2VyUGx1cyIsIkxvYWRlcjIiLCJBcnJvd1JpZ2h0IiwiQ2hlY2tDaXJjbGUiLCJIZWFkcGhvbmVzIiwiVHJlbmRpbmdVcCIsIkNyZWRpdENhcmQiLCJHbG9iZSIsInN0eWxlZFRvYXN0IiwidG9hc3QiLCJSZXZlbmRlZG9yUGFpbmVsIiwic3RvcmVGZWF0dXJlcyIsImljb24iLCJ0aXRsZSIsImRlc2MiLCJzdG9yZVN0YXRzIiwidmFsdWUiLCJsYWJlbCIsIkNsaWVudGVQb3J0YWwiLCJzbHVnIiwidXNlciIsInJvbGUiLCJsb2FkaW5nIiwiYXV0aExvYWRpbmciLCJuYXZpZ2F0ZSIsInJlc2VsbGVySW5mbyIsInNldFJlc2VsbGVySW5mbyIsInNldExvYWRpbmciLCJlcnJvciIsInNldEVycm9yIiwic2hvd0F1dGgiLCJzZXRTaG93QXV0aCIsImF1dGhNb2RlIiwic2V0QXV0aE1vZGUiLCJlbWFpbCIsInNldEVtYWlsIiwicGFzc3dvcmQiLCJzZXRQYXNzd29yZCIsIm5vbWUiLCJzZXROb21lIiwic3VibWl0dGluZyIsInNldFN1Ym1pdHRpbmciLCJsb2FkUmVzZWxsZXIiLCJkYXRhIiwicHJvZmlsZSIsImZyb20iLCJzZWxlY3QiLCJlcSIsIm1heWJlU2luZ2xlIiwiYWN0aXZlIiwicm9sZURhdGEiLCJpZCIsImhhbmRsZUxvZ2luIiwiZSIsInByZXZlbnREZWZhdWx0IiwiYXV0aCIsInNpZ25JbldpdGhQYXNzd29yZCIsInN1Y2Nlc3MiLCJlcnIiLCJtZXNzYWdlIiwiaGFuZGxlUmVnaXN0ZXIiLCJ0cmltIiwibGVuZ3RoIiwiZnVuY3Rpb25zIiwiaW52b2tlIiwiYm9keSIsInJlc2VsbGVyX2lkIiwiRXJyb3IiLCJsb2dpbkVyciIsImRpdiIsImNsYXNzTmFtZSIsImFuaW1hdGUiLCJyb3RhdGUiLCJ0cmFuc2l0aW9uIiwicmVwZWF0IiwiSW5maW5pdHkiLCJkdXJhdGlvbiIsImVhc2UiLCJoMSIsInAiLCJyZXNlbGxlcklkIiwicmVzZWxsZXJCcmFuZGluZyIsIm5hbWUiLCJzdG9yZV9uYW1lIiwibG9nb1VybCIsInN0b3JlX2xvZ29fdXJsIiwicHJpbWFyeUNvbG9yIiwic3RvcmVfcHJpbWFyeV9jb2xvciIsInNlY29uZGFyeUNvbG9yIiwic3RvcmVfc2Vjb25kYXJ5X2NvbG9yIiwiYSIsImhyZWYiLCJicmFuZENvbG9yIiwidW5kZWZpbmVkIiwiYnJhbmROYW1lIiwiYnJhbmRMb2dvIiwiYnRuU3R5bGUiLCJiYWNrZ3JvdW5kQ29sb3IiLCJjb2xvciIsImFjY2VudENvbG9yIiwicmVuZGVyQnJhbmROYW1lIiwiaW5jbHVkZXMiLCJzcGxpdCIsInNsaWNlIiwiam9pbiIsInNwYW4iLCJzdHlsZSIsImhlYWRlciIsImJ1dHRvbiIsIm9uQ2xpY2siLCJpbWciLCJzcmMiLCJhbHQiLCJpbml0aWFsIiwib3BhY2l0eSIsInkiLCJoMiIsInNjYWxlIiwiZm9ybSIsIm9uU3VibWl0IiwiaW5wdXQiLCJ0eXBlIiwib25DaGFuZ2UiLCJ0YXJnZXQiLCJyZXF1aXJlZCIsInBsYWNlaG9sZGVyIiwibWluTGVuZ3RoIiwid2hpbGVIb3ZlciIsIndoaWxlVGFwIiwiZGlzYWJsZWQiLCJkZWxheSIsInNlY3Rpb24iLCJtYXAiLCJzIiwiaSIsIndoaWxlSW5WaWV3Iiwidmlld3BvcnQiLCJvbmNlIiwiaDMiLCJmIiwiaDQiLCJiYWNrZ3JvdW5kIiwiZm9vdGVyIiwiRGF0ZSIsImdldEZ1bGxZZWFyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxTQUFTLEVBQUVDLFFBQVEsUUFBUSxRQUFRO0FBQzVDLFNBQVNDLFNBQVMsRUFBRUMsV0FBVyxRQUFRLG1CQUFtQjtBQUMxRCxTQUFTQyxRQUFRLFFBQVEsaUNBQWlDO0FBQzFELFNBQVNDLE9BQU8sUUFBUSxrQkFBa0I7QUFDMUMsU0FBU0MsV0FBVyxRQUFRLDJCQUEyQjtBQUN2RCxTQUFTQyxZQUFZLEVBQUVDLFlBQVksUUFBUSw0QkFBNEI7QUFDdkUsU0FBU0MsTUFBTSxRQUF5QixnQkFBZ0I7QUFDeEQsU0FDRUMsVUFBVSxFQUFFQyxHQUFHLEVBQUVDLE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxRQUFRLEVBQUVDLE9BQU8sRUFDakRDLFVBQVUsRUFBRUMsV0FBVyxFQUFFQyxVQUFVLEVBQUVDLFVBQVUsRUFBRUMsVUFBVSxFQUFFQyxLQUFLLFFBQzdELGVBQWU7QUFDdEIsU0FBU0MsZUFBZUMsS0FBSyxRQUFRLGNBQWM7QUFDbkQsT0FBT0Msc0JBQXNCLHFCQUFxQjtBQVlsRCxNQUFNQyxnQkFBZ0I7SUFDcEI7UUFBRUMsTUFBTWhCO1FBQVlpQixPQUFPO1FBQXVCQyxNQUFNO0lBQW1EO0lBQzNHO1FBQUVGLE1BQU1mO1FBQUtnQixPQUFPO1FBQXVCQyxNQUFNO0lBQW1EO0lBQ3BHO1FBQUVGLE1BQU1kO1FBQVFlLE9BQU87UUFBZUMsTUFBTTtJQUFtRDtJQUMvRjtRQUFFRixNQUFNTjtRQUFZTyxPQUFPO1FBQW1CQyxNQUFNO0lBQTRDO0lBQ2hHO1FBQUVGLE1BQU1QO1FBQVlRLE9BQU87UUFBbUJDLE1BQU07SUFBK0M7SUFDbkc7UUFBRUYsTUFBTUw7UUFBT00sT0FBTztRQUE0QkMsTUFBTTtJQUFvRDtDQUM3RztBQUVELE1BQU1DLGFBQWE7SUFDakI7UUFBRUMsT0FBTztRQUFTQyxP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