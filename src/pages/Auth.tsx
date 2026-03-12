import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/Auth.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/Auth.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useRef = __vite__cjsImport3_react["useRef"]; const useCallback = __vite__cjsImport3_react["useCallback"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { supabase } from "/src/integrations/supabase/client.ts";
import { useAuth } from "/src/hooks/useAuth.tsx";
import { ThemeToggle } from "/src/components/ThemeToggle.tsx";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { appToast } from "/src/lib/toast.tsx";
import { Navigate } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { ArrowLeft, Mail, Lock, User, Download, Smartphone, CheckCircle } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { Link } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { SplashScreen } from "/src/components/SplashScreen.tsx";
import logo from "/src/assets/recargas-brasil-logo.jpeg?import";
function translateAuthError(msg) {
    const map = {
        "Invalid login credentials": "E-mail ou senha incorretos",
        "Email not confirmed": "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
        "User already registered": "Este e-mail já está cadastrado",
        "Password should be at least 6 characters": "A senha deve ter no mínimo 6 caracteres",
        "Signup requires a valid password": "Informe uma senha válida",
        "User not found": "Usuário não encontrado",
        "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",
        "For security purposes, you can only request this once every 60 seconds": "Por segurança, aguarde 60 segundos antes de tentar novamente."
    };
    for (const [en, pt] of Object.entries(map)){
        if (msg.includes(en)) return pt;
    }
    return msg || "Erro na autenticação";
}
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 60000;
export default function Auth() {
    _s();
    const { user, role, loading } = useAuth();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState(()=>localStorage.getItem("rememberedEmail") || "");
    const [password, setPassword] = useState("");
    const [nome, setNome] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [rememberMe, setRememberMe] = useState(()=>localStorage.getItem("rememberMe") === "true");
    const [phase, setPhase] = useState("form");
    const [destination, setDestination] = useState("/painel");
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockedUntil, setLockedUntil] = useState(null);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const cooldownRef = useRef(null);
    const startCooldown = useCallback(()=>{
        const until = Date.now() + COOLDOWN_MS;
        setLockedUntil(until);
        setCooldownRemaining(Math.ceil(COOLDOWN_MS / 1000));
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(()=>{
            const remaining = Math.ceil((until - Date.now()) / 1000);
            if (remaining <= 0) {
                clearInterval(cooldownRef.current);
                cooldownRef.current = null;
                setLockedUntil(null);
                setFailedAttempts(0);
                setCooldownRemaining(0);
            } else {
                setCooldownRemaining(remaining);
            }
        }, 1000);
    }, []);
    const isLocked = lockedUntil !== null && Date.now() < lockedUntil;
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSubmitting, setForgotSubmitting] = useState(false);
    const [forgotSent, setForgotSent] = useState(false);
    // Splash → done after 1.5s
    useEffect(()=>{
        if (phase === "splash") {
            const timer = setTimeout(()=>setPhase("done"), 1500);
            return ()=>clearTimeout(timer);
        }
    }, [
        phase
    ]);
    // Redirect if already logged in (but not if we're mid-login)
    if (!loading && user && phase === "form" && !submitting) {
        const dest = role === "admin" ? "/principal" : "/painel";
        return /*#__PURE__*/ _jsxDEV(Navigate, {
            to: dest,
            replace: true
        }, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 89,
            columnNumber: 12
        }, this);
    }
    if (phase === "done") {
        return /*#__PURE__*/ _jsxDEV(Navigate, {
            to: destination,
            replace: true
        }, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 93,
            columnNumber: 12
        }, this);
    }
    if (phase === "splash") {
        return /*#__PURE__*/ _jsxDEV(SplashScreen, {}, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 97,
            columnNumber: 12
        }, this);
    }
    const handleForgotPassword = async (e)=>{
        e.preventDefault();
        if (!forgotEmail.trim()) return;
        setForgotSubmitting(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (error) throw error;
            setForgotSent(true);
            appToast.emailSent("E-mail de recuperação enviado!");
        } catch (err) {
            appToast.error(translateAuthError(err.message));
        } finally{
            setForgotSubmitting(false);
        }
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (isLogin && isLocked) {
            appToast.blocked(`Muitas tentativas. Aguarde ${cooldownRemaining}s`);
            return;
        }
        setSubmitting(true);
        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) {
                    const newAttempts = failedAttempts + 1;
                    setFailedAttempts(newAttempts);
                    if (newAttempts >= MAX_ATTEMPTS) {
                        startCooldown();
                        appToast.blocked(`Bloqueado por 60 segundos após ${MAX_ATTEMPTS} tentativas`);
                    }
                    throw error;
                }
                setFailedAttempts(0);
                // Save or clear remembered email
                if (rememberMe) {
                    localStorage.setItem("rememberMe", "true");
                    localStorage.setItem("rememberedEmail", email);
                } else {
                    localStorage.removeItem("rememberMe");
                    localStorage.removeItem("rememberedEmail");
                }
                // Clean up any legacy stored password
                localStorage.removeItem("rememberedPass");
                const { data: { session: freshSession } } = await supabase.auth.getSession();
                const userId = freshSession?.user?.id || "";
                if (!userId) {
                    appToast.error("Erro ao obter sessão");
                    setSubmitting(false);
                    return;
                }
                // Retry role check to handle race condition with trigger
                const rolePriority = [
                    "admin",
                    "revendedor",
                    "cliente",
                    "usuario",
                    "user"
                ];
                let resolvedRole = null;
                for(let i = 0; i < 3; i++){
                    const { data, error } = await supabase.from("user_roles").select("role, created_at").eq("user_id", userId).order("created_at", {
                        ascending: false
                    });
                    if (error) throw error;
                    if (data && data.length > 0) {
                        const roles = data.map((r)=>r.role);
                        resolvedRole = rolePriority.find((r)=>roles.includes(r)) || roles[0] || null;
                        break;
                    }
                    if (i < 2) await new Promise((r)=>setTimeout(r, 1000));
                }
                if (!resolvedRole) {
                    await supabase.auth.signOut();
                    appToast.authError("Sua conta ainda não possui um cargo atribuído. Aguarde a aprovação ou contate o administrador.");
                    setSubmitting(false);
                    return;
                }
                setDestination(resolvedRole === "admin" ? "/principal" : "/painel");
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            nome
                        },
                        emailRedirectTo: window.location.origin
                    }
                });
                if (error) throw error;
                setDestination("/painel");
            }
            if (!isLogin) appToast.success("Conta criada com sucesso!");
            setPhase("splash");
        } catch (err) {
            const msg = translateAuthError(err.message);
            appToast.authError(msg);
            setSubmitting(false);
        }
    };
    if (loading) {
        return /*#__PURE__*/ _jsxDEV(SplashScreen, {}, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 200,
            columnNumber: 12
        }, this);
    }
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "min-h-screen flex items-center justify-center px-4 relative overflow-hidden",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"
            }, void 0, false, {
                fileName: "/dev-server/src/pages/Auth.tsx",
                lineNumber: 206,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "absolute top-4 right-4 z-10",
                children: /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                    fileName: "/dev-server/src/pages/Auth.tsx",
                    lineNumber: 209,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/Auth.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "w-full max-w-sm",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "text-center mb-10",
                        children: [
                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                initial: {
                                    scale: 0.8,
                                    opacity: 0
                                },
                                animate: {
                                    scale: 1,
                                    opacity: 1
                                },
                                transition: {
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20
                                },
                                className: "w-20 h-20 rounded-2xl overflow-hidden shadow-2xl border border-border/50 ring-1 ring-primary/20 mx-auto mb-4",
                                children: /*#__PURE__*/ _jsxDEV("img", {
                                    src: logo,
                                    alt: "Recargas Brasil",
                                    className: "w-full h-full object-cover"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 221,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/Auth.tsx",
                                lineNumber: 215,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("h1", {
                                className: "font-display text-2xl font-bold shimmer-letters",
                                children: [
                                    "Recargas ",
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "brasil-word",
                                        children: "Brasil"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/Auth.tsx",
                                        lineNumber: 224,
                                        columnNumber: 22
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/Auth.tsx",
                                lineNumber: 223,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-muted-foreground text-xs mt-2 tracking-wide uppercase",
                                children: "Sistema de recargas para revendedores"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/Auth.tsx",
                                lineNumber: 226,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/Auth.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                        children: phase === "form" && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0,
                                y: 20
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0,
                                y: -20,
                                transition: {
                                    duration: 0.3
                                }
                            },
                            transition: {
                                duration: 0.4
                            },
                            className: "rounded-2xl border border-border bg-card p-6 relative shadow-lg",
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex mb-6 rounded-xl overflow-hidden bg-muted/50 p-1",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("button", {
                                            type: "button",
                                            onClick: ()=>setIsLogin(true),
                                            disabled: submitting,
                                            className: `flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                                            children: "Entrar"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 244,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("button", {
                                            type: "button",
                                            onClick: ()=>setIsLogin(false),
                                            disabled: submitting,
                                            className: `flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${!isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
                                            children: "Cadastrar"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 256,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 243,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("form", {
                                    onSubmit: handleSubmit,
                                    className: "space-y-4",
                                    children: [
                                        !isLogin && /*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("label", {
                                                    className: "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5",
                                                    children: "Nome"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 274,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "relative",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(User, {
                                                            className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                                            lineNumber: 276,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("input", {
                                                            type: "text",
                                                            value: nome,
                                                            onChange: (e)=>setNome(e.target.value),
                                                            required: !isLogin,
                                                            className: "w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm",
                                                            placeholder: "Seu nome completo"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                                            lineNumber: 277,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 275,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 273,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("label", {
                                                    className: "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5",
                                                    children: "E-mail"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 289,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "relative",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(Mail, {
                                                            className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                                            lineNumber: 291,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("input", {
                                                            type: "email",
                                                            value: email,
                                                            onChange: (e)=>setEmail(e.target.value),
                                                            required: true,
                                                            className: "w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm",
                                                            placeholder: "seu@email.com"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                                            lineNumber: 292,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 290,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 288,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("label", {
                                                    className: "block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5",
                                                    children: "Senha"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 303,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "relative",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(Lock, {
                                                            className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                                            lineNumber: 305,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("input", {
                                                            type: "password",
                                                            value: password,
                                                            onChange: (e)=>setPassword(e.target.value),
                                                            required: true,
                                                            minLength: 6,
                                                            className: "w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm",
                                                            placeholder: "Mínimo 6 caracteres"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                                            lineNumber: 306,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 304,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 302,
                                            columnNumber: 17
                                        }, this),
                                        isLogin && /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center justify-between",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("label", {
                                                    className: "flex items-center gap-2 cursor-pointer select-none",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("input", {
                                                            type: "checkbox",
                                                            checked: rememberMe,
                                                            onChange: (e)=>setRememberMe(e.target.checked),
                                                            className: "w-4 h-4 rounded border-border bg-muted/50 text-primary focus:ring-primary/30 accent-primary"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                                            lineNumber: 321,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "text-xs text-muted-foreground",
                                                            children: "Lembrar-me"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                                            lineNumber: 327,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 320,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    type: "button",
                                                    onClick: ()=>{
                                                        setPhase("forgot");
                                                        setForgotEmail(email);
                                                        setForgotSent(false);
                                                    },
                                                    className: "text-xs text-primary hover:underline font-medium",
                                                    children: "Esqueci minha senha"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 329,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 319,
                                            columnNumber: 19
                                        }, this),
                                        isLocked && /*#__PURE__*/ _jsxDEV("div", {
                                            className: "text-center py-2 px-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium",
                                            children: [
                                                "🔒 Bloqueado — tente novamente em ",
                                                cooldownRemaining,
                                                "s"
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 340,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("button", {
                                            type: "submit",
                                            disabled: submitting || isLocked,
                                            className: "w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 glow-primary",
                                            children: submitting ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 345,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 271,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, "card", true, {
                            fileName: "/dev-server/src/pages/Auth.tsx",
                            lineNumber: 234,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/Auth.tsx",
                        lineNumber: 232,
                        columnNumber: 9
                    }, this),
                    phase === "form" && /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: 10
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: 0.6,
                            type: "spring",
                            stiffness: 200
                        },
                        className: "mt-4",
                        children: /*#__PURE__*/ _jsxDEV(Link, {
                            to: "/instalar",
                            className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 active:scale-[0.98]",
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0",
                                    children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                        animate: {
                                            y: [
                                                0,
                                                -2,
                                                0
                                            ]
                                        },
                                        transition: {
                                            repeat: Infinity,
                                            duration: 2,
                                            ease: "easeInOut"
                                        },
                                        children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                            className: "w-5 h-5 text-primary"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 374,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/Auth.tsx",
                                        lineNumber: 370,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 369,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex-1 min-w-0",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-sm font-semibold text-foreground",
                                            children: "Instalar App no celular"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 378,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-[11px] text-muted-foreground",
                                            children: "Acesse mais rápido direto da tela inicial"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 379,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 377,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                    animate: {
                                        x: [
                                            0,
                                            3,
                                            0
                                        ]
                                    },
                                    transition: {
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "easeInOut"
                                    },
                                    children: /*#__PURE__*/ _jsxDEV(Download, {
                                        className: "w-4 h-4 text-muted-foreground"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/Auth.tsx",
                                        lineNumber: 385,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 381,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/Auth.tsx",
                            lineNumber: 365,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/Auth.tsx",
                        lineNumber: 359,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                        children: phase === "forgot" && /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0,
                                y: 20
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            exit: {
                                opacity: 0,
                                y: -20
                            },
                            className: "rounded-2xl border border-border bg-card p-6 shadow-lg",
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "text-center mb-5",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3",
                                            children: /*#__PURE__*/ _jsxDEV(Mail, {
                                                className: "h-5 w-5 text-primary"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/Auth.tsx",
                                                lineNumber: 403,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 402,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("h2", {
                                            className: "text-lg font-bold text-foreground",
                                            children: "Recuperar Senha"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 405,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-xs text-muted-foreground mt-1",
                                            children: forgotSent ? "Verifique seu e-mail para redefinir a senha" : "Digite seu e-mail para receber o link de recuperação"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 406,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 401,
                                    columnNumber: 15
                                }, this),
                                !forgotSent ? /*#__PURE__*/ _jsxDEV("form", {
                                    onSubmit: handleForgotPassword,
                                    className: "space-y-4",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(Mail, {
                                                    className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 416,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("input", {
                                                    type: "email",
                                                    value: forgotEmail,
                                                    onChange: (e)=>setForgotEmail(e.target.value),
                                                    required: true,
                                                    className: "w-full pl-10 pr-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all text-sm",
                                                    placeholder: "seu@email.com",
                                                    autoFocus: true
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                                    lineNumber: 417,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 415,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("button", {
                                            type: "submit",
                                            disabled: forgotSubmitting,
                                            className: "w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 glow-primary",
                                            children: forgotSubmitting ? "Enviando..." : "Enviar link"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 427,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 414,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                    className: "text-center py-4",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(motion.div, {
                                            initial: {
                                                scale: 0
                                            },
                                            animate: {
                                                scale: 1
                                            },
                                            transition: {
                                                type: "spring",
                                                damping: 10
                                            },
                                            className: "w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto mb-3",
                                            children: /*#__PURE__*/ _jsxDEV(CheckCircle, {
                                                className: "h-6 w-6 text-primary"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/Auth.tsx",
                                                lineNumber: 443,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 437,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-sm text-muted-foreground",
                                            children: "E-mail enviado com sucesso!"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 445,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 436,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ _jsxDEV("button", {
                                    onClick: ()=>{
                                        setPhase("form");
                                        setForgotSent(false);
                                    },
                                    className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-4 mx-auto transition-colors font-medium",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                            className: "h-3.5 w-3.5"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/Auth.tsx",
                                            lineNumber: 453,
                                            columnNumber: 17
                                        }, this),
                                        "Voltar ao login"
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/Auth.tsx",
                                    lineNumber: 449,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, "forgot", true, {
                            fileName: "/dev-server/src/pages/Auth.tsx",
                            lineNumber: 394,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/Auth.tsx",
                        lineNumber: 392,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/Auth.tsx",
                lineNumber: 212,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/Auth.tsx",
        lineNumber: 204,
        columnNumber: 5
    }, this);
}
_s(Auth, "FSoh1/gFIg4gTyeQvfq13EOcfJw=", false, function() {
    return [
        useAuth,
        useNavigate
    ];
});
_c = Auth;
var _c;
$RefreshReg$(_c, "Auth");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/Auth.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/Auth.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1dGgudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VSZWYsIHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZU5hdmlnYXRlIH0gZnJvbSBcInJlYWN0LXJvdXRlci1kb21cIjtcbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSBcIkAvaW50ZWdyYXRpb25zL3N1cGFiYXNlL2NsaWVudFwiO1xuaW1wb3J0IHsgdXNlQXV0aCB9IGZyb20gXCJAL2hvb2tzL3VzZUF1dGhcIjtcbmltcG9ydCB7IFRoZW1lVG9nZ2xlIH0gZnJvbSBcIkAvY29tcG9uZW50cy9UaGVtZVRvZ2dsZVwiO1xuaW1wb3J0IHsgbW90aW9uLCBBbmltYXRlUHJlc2VuY2UgfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IHsgYXBwVG9hc3QgfSBmcm9tIFwiQC9saWIvdG9hc3RcIjtcbmltcG9ydCB7IE5hdmlnYXRlIH0gZnJvbSBcInJlYWN0LXJvdXRlci1kb21cIjtcbmltcG9ydCB7IEFycm93TGVmdCwgTWFpbCwgTG9jaywgVXNlciwgRG93bmxvYWQsIFNtYXJ0cGhvbmUsIENoZWNrQ2lyY2xlIH0gZnJvbSBcImx1Y2lkZS1yZWFjdFwiO1xuaW1wb3J0IHsgTGluayB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XG5pbXBvcnQgeyBTcGxhc2hTY3JlZW4gfSBmcm9tIFwiQC9jb21wb25lbnRzL1NwbGFzaFNjcmVlblwiO1xuaW1wb3J0IGxvZ28gZnJvbSBcIkAvYXNzZXRzL3JlY2FyZ2FzLWJyYXNpbC1sb2dvLmpwZWdcIjtcblxudHlwZSBMb2dpblBoYXNlID0gXCJmb3JtXCIgfCBcImZvcmdvdFwiIHwgXCJzcGxhc2hcIiB8IFwiZG9uZVwiO1xuXG5mdW5jdGlvbiB0cmFuc2xhdGVBdXRoRXJyb3IobXNnOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBtYXA6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gICAgXCJJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzXCI6IFwiRS1tYWlsIG91IHNlbmhhIGluY29ycmV0b3NcIixcbiAgICBcIkVtYWlsIG5vdCBjb25maXJtZWRcIjogXCJFLW1haWwgYWluZGEgbsOjbyBjb25maXJtYWRvLiBWZXJpZmlxdWUgc3VhIGNhaXhhIGRlIGVudHJhZGEuXCIsXG4gICAgXCJVc2VyIGFscmVhZHkgcmVnaXN0ZXJlZFwiOiBcIkVzdGUgZS1tYWlsIGrDoSBlc3TDoSBjYWRhc3RyYWRvXCIsXG4gICAgXCJQYXNzd29yZCBzaG91bGQgYmUgYXQgbGVhc3QgNiBjaGFyYWN0ZXJzXCI6IFwiQSBzZW5oYSBkZXZlIHRlciBubyBtw61uaW1vIDYgY2FyYWN0ZXJlc1wiLFxuICAgIFwiU2lnbnVwIHJlcXVpcmVzIGEgdmFsaWQgcGFzc3dvcmRcIjogXCJJbmZvcm1lIHVtYSBzZW5oYSB2w6FsaWRhXCIsXG4gICAgXCJVc2VyIG5vdCBmb3VuZFwiOiBcIlVzdcOhcmlvIG7Do28gZW5jb250cmFkb1wiLFxuICAgIFwiRW1haWwgcmF0ZSBsaW1pdCBleGNlZWRlZFwiOiBcIk11aXRhcyB0ZW50YXRpdmFzLiBBZ3VhcmRlIGFsZ3VucyBtaW51dG9zLlwiLFxuICAgIFwiRm9yIHNlY3VyaXR5IHB1cnBvc2VzLCB5b3UgY2FuIG9ubHkgcmVxdWVzdCB0aGlzIG9uY2UgZXZlcnkgNjAgc2Vjb25kc1wiOiBcIlBvciBzZWd1cmFuw6dhLCBhZ3VhcmRlIDYwIHNlZ3VuZG9zIGFudGVzIGRlIHRlbnRhciBub3ZhbWVudGUuXCIsXG4gIH07XG4gIGZvciAoY29uc3QgW2VuLCBwdF0gb2YgT2JqZWN0LmVudHJpZXMobWFwKSkge1xuICAgIGlmIChtc2cuaW5jbHVkZXMoZW4pKSByZXR1cm4gcHQ7XG4gIH1cbiAgcmV0dXJuIG1zZyB8fCBcIkVycm8gbmEgYXV0ZW50aWNhw6fDo29cIjtcbn1cblxuY29uc3QgTUFYX0FUVEVNUFRTID0gNTtcbmNvbnN0IENPT0xET1dOX01TID0gNjBfMDAwO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBdXRoKCkge1xuICBjb25zdCB7IHVzZXIsIHJvbGUsIGxvYWRpbmcgfSA9IHVzZUF1dGgoKTtcbiAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xuICBjb25zdCBbaXNMb2dpbiwgc2V0SXNMb2dpbl0gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW2VtYWlsLCBzZXRFbWFpbF0gPSB1c2VTdGF0ZSgoKSA9PiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInJlbWVtYmVyZWRFbWFpbFwiKSB8fCBcIlwiKTtcbiAgY29uc3QgW3Bhc3N3b3JkLCBzZXRQYXNzd29yZF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW25vbWUsIHNldE5vbWVdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtzdWJtaXR0aW5nLCBzZXRTdWJtaXR0aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3JlbWVtYmVyTWUsIHNldFJlbWVtYmVyTWVdID0gdXNlU3RhdGUoKCkgPT4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJyZW1lbWJlck1lXCIpID09PSBcInRydWVcIik7XG4gIGNvbnN0IFtwaGFzZSwgc2V0UGhhc2VdID0gdXNlU3RhdGU8TG9naW5QaGFzZT4oXCJmb3JtXCIpO1xuICBjb25zdCBbZGVzdGluYXRpb24sIHNldERlc3RpbmF0aW9uXSA9IHVzZVN0YXRlKFwiL3BhaW5lbFwiKTtcblxuICBjb25zdCBbZmFpbGVkQXR0ZW1wdHMsIHNldEZhaWxlZEF0dGVtcHRzXSA9IHVzZVN0YXRlKDApO1xuICBjb25zdCBbbG9ja2VkVW50aWwsIHNldExvY2tlZFVudGlsXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbY29vbGRvd25SZW1haW5pbmcsIHNldENvb2xkb3duUmVtYWluaW5nXSA9IHVzZVN0YXRlKDApO1xuICBjb25zdCBjb29sZG93blJlZiA9IHVzZVJlZjxSZXR1cm5UeXBlPHR5cGVvZiBzZXRJbnRlcnZhbD4gfCBudWxsPihudWxsKTtcblxuICBjb25zdCBzdGFydENvb2xkb3duID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xuICAgIGNvbnN0IHVudGlsID0gRGF0ZS5ub3coKSArIENPT0xET1dOX01TO1xuICAgIHNldExvY2tlZFVudGlsKHVudGlsKTtcbiAgICBzZXRDb29sZG93blJlbWFpbmluZyhNYXRoLmNlaWwoQ09PTERPV05fTVMgLyAxMDAwKSk7XG4gICAgaWYgKGNvb2xkb3duUmVmLmN1cnJlbnQpIGNsZWFySW50ZXJ2YWwoY29vbGRvd25SZWYuY3VycmVudCk7XG4gICAgY29vbGRvd25SZWYuY3VycmVudCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGNvbnN0IHJlbWFpbmluZyA9IE1hdGguY2VpbCgodW50aWwgLSBEYXRlLm5vdygpKSAvIDEwMDApO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwKSB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwoY29vbGRvd25SZWYuY3VycmVudCEpO1xuICAgICAgICBjb29sZG93blJlZi5jdXJyZW50ID0gbnVsbDtcbiAgICAgICAgc2V0TG9ja2VkVW50aWwobnVsbCk7XG4gICAgICAgIHNldEZhaWxlZEF0dGVtcHRzKDApO1xuICAgICAgICBzZXRDb29sZG93blJlbWFpbmluZygwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldENvb2xkb3duUmVtYWluaW5nKHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgfSwgMTAwMCk7XG4gIH0sIFtdKTtcblxuICBjb25zdCBpc0xvY2tlZCA9IGxvY2tlZFVudGlsICE9PSBudWxsICYmIERhdGUubm93KCkgPCBsb2NrZWRVbnRpbDtcblxuICBjb25zdCBbZm9yZ290RW1haWwsIHNldEZvcmdvdEVtYWlsXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbZm9yZ290U3VibWl0dGluZywgc2V0Rm9yZ290U3VibWl0dGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtmb3Jnb3RTZW50LCBzZXRGb3Jnb3RTZW50XSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAvLyBTcGxhc2gg4oaSIGRvbmUgYWZ0ZXIgMS41c1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChwaGFzZSA9PT0gXCJzcGxhc2hcIikge1xuICAgICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHNldFBoYXNlKFwiZG9uZVwiKSwgMTUwMCk7XG4gICAgICByZXR1cm4gKCkgPT4gY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB9XG4gIH0sIFtwaGFzZV0pO1xuXG4gIC8vIFJlZGlyZWN0IGlmIGFscmVhZHkgbG9nZ2VkIGluIChidXQgbm90IGlmIHdlJ3JlIG1pZC1sb2dpbilcbiAgaWYgKCFsb2FkaW5nICYmIHVzZXIgJiYgcGhhc2UgPT09IFwiZm9ybVwiICYmICFzdWJtaXR0aW5nKSB7XG4gICAgY29uc3QgZGVzdCA9IHJvbGUgPT09IFwiYWRtaW5cIiA/IFwiL3ByaW5jaXBhbFwiIDogXCIvcGFpbmVsXCI7XG4gICAgcmV0dXJuIDxOYXZpZ2F0ZSB0bz17ZGVzdH0gcmVwbGFjZSAvPjtcbiAgfVxuXG4gIGlmIChwaGFzZSA9PT0gXCJkb25lXCIpIHtcbiAgICByZXR1cm4gPE5hdmlnYXRlIHRvPXtkZXN0aW5hdGlvbn0gcmVwbGFjZSAvPjtcbiAgfVxuXG4gIGlmIChwaGFzZSA9PT0gXCJzcGxhc2hcIikge1xuICAgIHJldHVybiA8U3BsYXNoU2NyZWVuIC8+O1xuICB9XG5cbiAgY29uc3QgaGFuZGxlRm9yZ290UGFzc3dvcmQgPSBhc3luYyAoZTogUmVhY3QuRm9ybUV2ZW50KSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICghZm9yZ290RW1haWwudHJpbSgpKSByZXR1cm47XG4gICAgc2V0Rm9yZ290U3VibWl0dGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5yZXNldFBhc3N3b3JkRm9yRW1haWwoZm9yZ290RW1haWwsIHtcbiAgICAgICAgcmVkaXJlY3RUbzogYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0vcmVzZXQtcGFzc3dvcmRgLFxuICAgICAgfSk7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICAgICAgc2V0Rm9yZ290U2VudCh0cnVlKTtcbiAgICAgIGFwcFRvYXN0LmVtYWlsU2VudChcIkUtbWFpbCBkZSByZWN1cGVyYcOnw6NvIGVudmlhZG8hXCIpO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBhcHBUb2FzdC5lcnJvcih0cmFuc2xhdGVBdXRoRXJyb3IoZXJyLm1lc3NhZ2UpKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0Rm9yZ290U3VibWl0dGluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVN1Ym1pdCA9IGFzeW5jIChlOiBSZWFjdC5Gb3JtRXZlbnQpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgaWYgKGlzTG9naW4gJiYgaXNMb2NrZWQpIHtcbiAgICAgIGFwcFRvYXN0LmJsb2NrZWQoYE11aXRhcyB0ZW50YXRpdmFzLiBBZ3VhcmRlICR7Y29vbGRvd25SZW1haW5pbmd9c2ApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzZXRTdWJtaXR0aW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBpZiAoaXNMb2dpbikge1xuICAgICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25JbldpdGhQYXNzd29yZCh7IGVtYWlsLCBwYXNzd29yZCB9KTtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgY29uc3QgbmV3QXR0ZW1wdHMgPSBmYWlsZWRBdHRlbXB0cyArIDE7XG4gICAgICAgICAgc2V0RmFpbGVkQXR0ZW1wdHMobmV3QXR0ZW1wdHMpO1xuICAgICAgICAgIGlmIChuZXdBdHRlbXB0cyA+PSBNQVhfQVRURU1QVFMpIHtcbiAgICAgICAgICAgIHN0YXJ0Q29vbGRvd24oKTtcbiAgICAgICAgICAgIGFwcFRvYXN0LmJsb2NrZWQoYEJsb3F1ZWFkbyBwb3IgNjAgc2VndW5kb3MgYXDDs3MgJHtNQVhfQVRURU1QVFN9IHRlbnRhdGl2YXNgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgc2V0RmFpbGVkQXR0ZW1wdHMoMCk7XG4gICAgICAgIC8vIFNhdmUgb3IgY2xlYXIgcmVtZW1iZXJlZCBlbWFpbFxuICAgICAgICBpZiAocmVtZW1iZXJNZSkge1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwicmVtZW1iZXJNZVwiLCBcInRydWVcIik7XG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJyZW1lbWJlcmVkRW1haWxcIiwgZW1haWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwicmVtZW1iZXJNZVwiKTtcbiAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInJlbWVtYmVyZWRFbWFpbFwiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDbGVhbiB1cCBhbnkgbGVnYWN5IHN0b3JlZCBwYXNzd29yZFxuICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInJlbWVtYmVyZWRQYXNzXCIpO1xuICAgICAgICBjb25zdCB7IGRhdGE6IHsgc2Vzc2lvbjogZnJlc2hTZXNzaW9uIH0gfSA9IGF3YWl0IHN1cGFiYXNlLmF1dGguZ2V0U2Vzc2lvbigpO1xuICAgICAgICBjb25zdCB1c2VySWQgPSBmcmVzaFNlc3Npb24/LnVzZXI/LmlkIHx8IFwiXCI7XG4gICAgICAgIGlmICghdXNlcklkKSB7IGFwcFRvYXN0LmVycm9yKFwiRXJybyBhbyBvYnRlciBzZXNzw6NvXCIpOyBzZXRTdWJtaXR0aW5nKGZhbHNlKTsgcmV0dXJuOyB9XG4gICAgICAgIC8vIFJldHJ5IHJvbGUgY2hlY2sgdG8gaGFuZGxlIHJhY2UgY29uZGl0aW9uIHdpdGggdHJpZ2dlclxuICAgICAgICBjb25zdCByb2xlUHJpb3JpdHkgPSBbXCJhZG1pblwiLCBcInJldmVuZGVkb3JcIiwgXCJjbGllbnRlXCIsIFwidXN1YXJpb1wiLCBcInVzZXJcIl07XG4gICAgICAgIGxldCByZXNvbHZlZFJvbGU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgICAgIC5mcm9tKFwidXNlcl9yb2xlc1wiKVxuICAgICAgICAgICAgLnNlbGVjdChcInJvbGUsIGNyZWF0ZWRfYXRcIilcbiAgICAgICAgICAgIC5lcShcInVzZXJfaWRcIiwgdXNlcklkKVxuICAgICAgICAgICAgLm9yZGVyKFwiY3JlYXRlZF9hdFwiLCB7IGFzY2VuZGluZzogZmFsc2UgfSk7XG5cbiAgICAgICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuXG4gICAgICAgICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCByb2xlcyA9IGRhdGEubWFwKChyKSA9PiByLnJvbGUpO1xuICAgICAgICAgICAgcmVzb2x2ZWRSb2xlID0gcm9sZVByaW9yaXR5LmZpbmQoKHIpID0+IHJvbGVzLmluY2x1ZGVzKHIpKSB8fCByb2xlc1swXSB8fCBudWxsO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGkgPCAyKSBhd2FpdCBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXJlc29sdmVkUm9sZSkge1xuICAgICAgICAgIGF3YWl0IHN1cGFiYXNlLmF1dGguc2lnbk91dCgpO1xuICAgICAgICAgIGFwcFRvYXN0LmF1dGhFcnJvcihcIlN1YSBjb250YSBhaW5kYSBuw6NvIHBvc3N1aSB1bSBjYXJnbyBhdHJpYnXDrWRvLiBBZ3VhcmRlIGEgYXByb3Zhw6fDo28gb3UgY29udGF0ZSBvIGFkbWluaXN0cmFkb3IuXCIpO1xuICAgICAgICAgIHNldFN1Ym1pdHRpbmcoZmFsc2UpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldERlc3RpbmF0aW9uKHJlc29sdmVkUm9sZSA9PT0gXCJhZG1pblwiID8gXCIvcHJpbmNpcGFsXCIgOiBcIi9wYWluZWxcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLnNpZ25VcCh7XG4gICAgICAgICAgZW1haWwsXG4gICAgICAgICAgcGFzc3dvcmQsXG4gICAgICAgICAgb3B0aW9uczogeyBkYXRhOiB7IG5vbWUgfSwgZW1haWxSZWRpcmVjdFRvOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICAgICAgICBzZXREZXN0aW5hdGlvbihcIi9wYWluZWxcIik7XG4gICAgICB9XG4gICAgICBpZiAoIWlzTG9naW4pIGFwcFRvYXN0LnN1Y2Nlc3MoXCJDb250YSBjcmlhZGEgY29tIHN1Y2Vzc28hXCIpO1xuICAgICAgc2V0UGhhc2UoXCJzcGxhc2hcIik7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIGNvbnN0IG1zZyA9IHRyYW5zbGF0ZUF1dGhFcnJvcihlcnIubWVzc2FnZSk7XG4gICAgICBhcHBUb2FzdC5hdXRoRXJyb3IobXNnKTtcbiAgICAgIHNldFN1Ym1pdHRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBpZiAobG9hZGluZykge1xuICAgIHJldHVybiA8U3BsYXNoU2NyZWVuIC8+O1xuICB9XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBweC00IHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgey8qIEFtYmllbnQgZ2xvdyAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTEvNCBsZWZ0LTEvMiAtdHJhbnNsYXRlLXgtMS8yIC10cmFuc2xhdGUteS0xLzIgdy1bNjAwcHhdIGgtWzYwMHB4XSByb3VuZGVkLWZ1bGwgYmctcHJpbWFyeS81IGJsdXItWzEyMHB4XSBwb2ludGVyLWV2ZW50cy1ub25lXCIgLz5cbiAgICAgIFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtNCByaWdodC00IHotMTBcIj5cbiAgICAgICAgPFRoZW1lVG9nZ2xlIC8+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgbWF4LXctc21cIj5cbiAgICAgICAgey8qIExvZ28gKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgbWItMTBcIj5cbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgaW5pdGlhbD17eyBzY2FsZTogMC44LCBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICBhbmltYXRlPXt7IHNjYWxlOiAxLCBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMjAwLCBkYW1waW5nOiAyMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy0yMCBoLTIwIHJvdW5kZWQtMnhsIG92ZXJmbG93LWhpZGRlbiBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIHJpbmctMSByaW5nLXByaW1hcnkvMjAgbXgtYXV0byBtYi00XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8aW1nIHNyYz17bG9nb30gYWx0PVwiUmVjYXJnYXMgQnJhc2lsXCIgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBvYmplY3QtY292ZXJcIiAvPlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtMnhsIGZvbnQtYm9sZCBzaGltbWVyLWxldHRlcnNcIj5cbiAgICAgICAgICAgIFJlY2FyZ2FzIDxzcGFuIGNsYXNzTmFtZT1cImJyYXNpbC13b3JkXCI+QnJhc2lsPC9zcGFuPlxuICAgICAgICAgIDwvaDE+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRleHQteHMgbXQtMiB0cmFja2luZy13aWRlIHVwcGVyY2FzZVwiPlxuICAgICAgICAgICAgU2lzdGVtYSBkZSByZWNhcmdhcyBwYXJhIHJldmVuZGVkb3Jlc1xuICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgey8qIEZvcm0gQ2FyZCAqL31cbiAgICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgICB7cGhhc2UgPT09IFwiZm9ybVwiICYmIChcbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGtleT1cImNhcmRcIlxuICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHk6IC0yMCwgdHJhbnNpdGlvbjogeyBkdXJhdGlvbjogMC4zIH0gfX1cbiAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC40IH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItYm9yZGVyIGJnLWNhcmQgcC02IHJlbGF0aXZlIHNoYWRvdy1sZ1wiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHsvKiBUYWJzICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggbWItNiByb3VuZGVkLXhsIG92ZXJmbG93LWhpZGRlbiBiZy1tdXRlZC81MCBwLTFcIj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldElzTG9naW4odHJ1ZSl9XG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17c3VibWl0dGluZ31cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtMSBweS0yIHRleHQtc20gZm9udC1zZW1pYm9sZCByb3VuZGVkLWxnIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTIwMCAke1xuICAgICAgICAgICAgICAgICAgICBpc0xvZ2luXG4gICAgICAgICAgICAgICAgICAgICAgPyBcImJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgc2hhZG93LXNtXCJcbiAgICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOnRleHQtZm9yZWdyb3VuZFwiXG4gICAgICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICBFbnRyYXJcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldElzTG9naW4oZmFsc2UpfVxuICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3N1Ym1pdHRpbmd9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4LTEgcHktMiB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgcm91bmRlZC1sZyB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0yMDAgJHtcbiAgICAgICAgICAgICAgICAgICAgIWlzTG9naW5cbiAgICAgICAgICAgICAgICAgICAgICA/IFwiYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBzaGFkb3ctc21cIlxuICAgICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6dGV4dC1mb3JlZ3JvdW5kXCJcbiAgICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIENhZGFzdHJhclxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICB7LyogRm9ybSAqL31cbiAgICAgICAgICAgICAgPGZvcm0gb25TdWJtaXQ9e2hhbmRsZVN1Ym1pdH0gY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICAgICAgeyFpc0xvZ2luICYmIChcbiAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXhzIGZvbnQtc2VtaWJvbGQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBtYi0xLjVcIj5Ob21lPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxVc2VyIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMyB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgaC00IHctNCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e25vbWV9XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldE5vbWUoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWQ9eyFpc0xvZ2lufVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHBsLTEwIHByLTMgcHktMi41IHJvdW5kZWQteGwgYmctbXV0ZWQvNTAgYm9yZGVyIGJvcmRlci1ib3JkZXIgdGV4dC1mb3JlZ3JvdW5kIHBsYWNlaG9sZGVyOnRleHQtbXV0ZWQtZm9yZWdyb3VuZC82MCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctcHJpbWFyeS8zMCBmb2N1czpib3JkZXItcHJpbWFyeS80MCB0cmFuc2l0aW9uLWFsbCB0ZXh0LXNtXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2V1IG5vbWUgY29tcGxldG9cIlxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LW11dGVkLWZvcmVncm91bmQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIG1iLTEuNVwiPkUtbWFpbDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlXCI+XG4gICAgICAgICAgICAgICAgICAgIDxNYWlsIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMyB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgaC00IHctNCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiZW1haWxcIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtlbWFpbH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KGUpID0+IHNldEVtYWlsKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBwbC0xMCBwci0zIHB5LTIuNSByb3VuZGVkLXhsIGJnLW11dGVkLzUwIGJvcmRlciBib3JkZXItYm9yZGVyIHRleHQtZm9yZWdyb3VuZCBwbGFjZWhvbGRlcjp0ZXh0LW11dGVkLWZvcmVncm91bmQvNjAgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXByaW1hcnkvMzAgZm9jdXM6Ym9yZGVyLXByaW1hcnkvNDAgdHJhbnNpdGlvbi1hbGwgdGV4dC1zbVwiXG4gICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJzZXVAZW1haWwuY29tXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgbWItMS41XCI+U2VuaGE8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8TG9jayBjbGFzc05hbWU9XCJhYnNvbHV0ZSBsZWZ0LTMgdG9wLTEvMiAtdHJhbnNsYXRlLXktMS8yIGgtNCB3LTQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17cGFzc3dvcmR9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRQYXNzd29yZChlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg9ezZ9XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHBsLTEwIHByLTMgcHktMi41IHJvdW5kZWQteGwgYmctbXV0ZWQvNTAgYm9yZGVyIGJvcmRlci1ib3JkZXIgdGV4dC1mb3JlZ3JvdW5kIHBsYWNlaG9sZGVyOnRleHQtbXV0ZWQtZm9yZWdyb3VuZC82MCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctcHJpbWFyeS8zMCBmb2N1czpib3JkZXItcHJpbWFyeS80MCB0cmFuc2l0aW9uLWFsbCB0ZXh0LXNtXCJcbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIk3DrW5pbW8gNiBjYXJhY3RlcmVzXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAge2lzTG9naW4gJiYgKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIGN1cnNvci1wb2ludGVyIHNlbGVjdC1ub25lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17cmVtZW1iZXJNZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0UmVtZW1iZXJNZShlLnRhcmdldC5jaGVja2VkKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctNCBoLTQgcm91bmRlZCBib3JkZXItYm9yZGVyIGJnLW11dGVkLzUwIHRleHQtcHJpbWFyeSBmb2N1czpyaW5nLXByaW1hcnkvMzAgYWNjZW50LXByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5MZW1icmFyLW1lPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBzZXRQaGFzZShcImZvcmdvdFwiKTsgc2V0Rm9yZ290RW1haWwoZW1haWwpOyBzZXRGb3Jnb3RTZW50KGZhbHNlKTsgfX1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtcHJpbWFyeSBob3Zlcjp1bmRlcmxpbmUgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgRXNxdWVjaSBtaW5oYSBzZW5oYVxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgICAgICB7aXNMb2NrZWQgJiYgKFxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS0yIHB4LTMgcm91bmRlZC14bCBiZy1kZXN0cnVjdGl2ZS8xMCBib3JkZXIgYm9yZGVyLWRlc3RydWN0aXZlLzIwIHRleHQtZGVzdHJ1Y3RpdmUgdGV4dC1zbSBmb250LW1lZGl1bVwiPlxuICAgICAgICAgICAgICAgICAgICDwn5SSIEJsb3F1ZWFkbyDigJQgdGVudGUgbm92YW1lbnRlIGVtIHtjb29sZG93blJlbWFpbmluZ31zXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuXG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17c3VibWl0dGluZyB8fCBpc0xvY2tlZH1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweS0yLjUgcm91bmRlZC14bCBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGZvbnQtc2VtaWJvbGQgdGV4dC1zbSBob3ZlcjpicmlnaHRuZXNzLTExMCB0cmFuc2l0aW9uLWFsbCBkaXNhYmxlZDpvcGFjaXR5LTUwIGdsb3ctcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3N1Ym1pdHRpbmcgPyBcIkFndWFyZGUuLi5cIiA6IGlzTG9naW4gPyBcIkVudHJhclwiIDogXCJDcmlhciBjb250YVwifVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG5cbiAgICAgICAgey8qIEluc3RhbGwgQXBwIEJ1dHRvbiAqL31cbiAgICAgICAge3BoYXNlID09PSBcImZvcm1cIiAmJiAoXG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMTAgfX1cbiAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC42LCB0eXBlOiBcInNwcmluZ1wiLCBzdGlmZm5lc3M6IDIwMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwibXQtNFwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgdG89XCIvaW5zdGFsYXJcIlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyByb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLWJvcmRlciBiZy1jYXJkIHAtNCBzaGFkb3ctbGcgaG92ZXI6Ym9yZGVyLXByaW1hcnkvNDAgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwIGhvdmVyOnNoYWRvdy14bCBob3ZlcjpzaGFkb3ctcHJpbWFyeS81IGFjdGl2ZTpzY2FsZS1bMC45OF1cIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTAgaC0xMCByb3VuZGVkLXhsIGJnLXByaW1hcnkvMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgc2hyaW5rLTBcIj5cbiAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyB5OiBbMCwgLTIsIDBdIH19XG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHJlcGVhdDogSW5maW5pdHksIGR1cmF0aW9uOiAyLCBlYXNlOiBcImVhc2VJbk91dFwiIH19XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPFNtYXJ0cGhvbmUgY2xhc3NOYW1lPVwidy01IGgtNSB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xIG1pbi13LTBcIj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+SW5zdGFsYXIgQXBwIG5vIGNlbHVsYXI8L3A+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+QWNlc3NlIG1haXMgcsOhcGlkbyBkaXJldG8gZGEgdGVsYSBpbmljaWFsPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICBhbmltYXRlPXt7IHg6IFswLCAzLCAwXSB9fVxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDEuNSwgZWFzZTogXCJlYXNlSW5PdXRcIiB9fVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPERvd25sb2FkIGNsYXNzTmFtZT1cInctNCBoLTQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgKX1cblxuICAgICAgICB7LyogRm9yZ290IFBhc3N3b3JkIFBhbmVsICovfVxuICAgICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICAgIHtwaGFzZSA9PT0gXCJmb3Jnb3RcIiAmJiAoXG4gICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICBrZXk9XCJmb3Jnb3RcIlxuICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHk6IC0yMCB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLWJvcmRlciBiZy1jYXJkIHAtNiBzaGFkb3ctbGdcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIG1iLTVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTIgaC0xMiByb3VuZGVkLTJ4bCBiZy1wcmltYXJ5LzEwIGJvcmRlciBib3JkZXItcHJpbWFyeS8yMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBteC1hdXRvIG1iLTNcIj5cbiAgICAgICAgICAgICAgICAgIDxNYWlsIGNsYXNzTmFtZT1cImgtNSB3LTUgdGV4dC1wcmltYXJ5XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+UmVjdXBlcmFyIFNlbmhhPC9oMj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtdC0xXCI+XG4gICAgICAgICAgICAgICAgICB7Zm9yZ290U2VudFxuICAgICAgICAgICAgICAgICAgICA/IFwiVmVyaWZpcXVlIHNldSBlLW1haWwgcGFyYSByZWRlZmluaXIgYSBzZW5oYVwiXG4gICAgICAgICAgICAgICAgICAgIDogXCJEaWdpdGUgc2V1IGUtbWFpbCBwYXJhIHJlY2ViZXIgbyBsaW5rIGRlIHJlY3VwZXJhw6fDo29cIn1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHshZm9yZ290U2VudCA/IChcbiAgICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17aGFuZGxlRm9yZ290UGFzc3dvcmR9IGNsYXNzTmFtZT1cInNwYWNlLXktNFwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICA8TWFpbCBjbGFzc05hbWU9XCJhYnNvbHV0ZSBsZWZ0LTMgdG9wLTEvMiAtdHJhbnNsYXRlLXktMS8yIGgtNCB3LTQgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImVtYWlsXCJcbiAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17Zm9yZ290RW1haWx9XG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRGb3Jnb3RFbWFpbChlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcGwtMTAgcHItMyBweS0yLjUgcm91bmRlZC14bCBiZy1tdXRlZC81MCBib3JkZXIgYm9yZGVyLWJvcmRlciB0ZXh0LWZvcmVncm91bmQgcGxhY2Vob2xkZXI6dGV4dC1tdXRlZC1mb3JlZ3JvdW5kLzYwIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1wcmltYXJ5LzMwIGZvY3VzOmJvcmRlci1wcmltYXJ5LzQwIHRyYW5zaXRpb24tYWxsIHRleHQtc21cIlxuICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwic2V1QGVtYWlsLmNvbVwiXG4gICAgICAgICAgICAgICAgICAgICAgYXV0b0ZvY3VzXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtmb3Jnb3RTdWJtaXR0aW5nfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktMi41IHJvdW5kZWQteGwgYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBmb250LXNlbWlib2xkIHRleHQtc20gaG92ZXI6YnJpZ2h0bmVzcy0xMTAgdHJhbnNpdGlvbi1hbGwgZGlzYWJsZWQ6b3BhY2l0eS01MCBnbG93LXByaW1hcnlcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7Zm9yZ290U3VibWl0dGluZyA/IFwiRW52aWFuZG8uLi5cIiA6IFwiRW52aWFyIGxpbmtcIn1cbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHB5LTRcIj5cbiAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgc2NhbGU6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIGRhbXBpbmc6IDEwIH19XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctMTIgaC0xMiByb3VuZGVkLTJ4bCBiZy1wcmltYXJ5LzE1IGJvcmRlciBib3JkZXItcHJpbWFyeS8yMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBteC1hdXRvIG1iLTNcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8Q2hlY2tDaXJjbGUgY2xhc3NOYW1lPVwiaC02IHctNiB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5FLW1haWwgZW52aWFkbyBjb20gc3VjZXNzbyE8L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHsgc2V0UGhhc2UoXCJmb3JtXCIpOyBzZXRGb3Jnb3RTZW50KGZhbHNlKTsgfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOnRleHQtZm9yZWdyb3VuZCBtdC00IG14LWF1dG8gdHJhbnNpdGlvbi1jb2xvcnMgZm9udC1tZWRpdW1cIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPEFycm93TGVmdCBjbGFzc05hbWU9XCJoLTMuNSB3LTMuNVwiIC8+XG4gICAgICAgICAgICAgICAgVm9sdGFyIGFvIGxvZ2luXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICl9XG4gICAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJ1c2VSZWYiLCJ1c2VDYWxsYmFjayIsInVzZUVmZmVjdCIsInVzZU5hdmlnYXRlIiwic3VwYWJhc2UiLCJ1c2VBdXRoIiwiVGhlbWVUb2dnbGUiLCJtb3Rpb24iLCJBbmltYXRlUHJlc2VuY2UiLCJhcHBUb2FzdCIsIk5hdmlnYXRlIiwiQXJyb3dMZWZ0IiwiTWFpbCIsIkxvY2siLCJVc2VyIiwiRG93bmxvYWQiLCJTbWFydHBob25lIiwiQ2hlY2tDaXJjbGUiLCJMaW5rIiwiU3BsYXNoU2NyZWVuIiwibG9nbyIsInRyYW5zbGF0ZUF1dGhFcnJvciIsIm1zZyIsIm1hcCIsImVuIiwicHQiLCJPYmplY3QiLCJlbnRyaWVzIiwiaW5jbHVkZXMiLCJNQVhfQVRURU1QVFMiLCJDT09MRE9XTl9NUyIsIkF1dGgiLCJ1c2VyIiwicm9sZSIsImxvYWRpbmciLCJuYXZpZ2F0ZSIsImlzTG9naW4iLCJzZXRJc0xvZ2luIiwiZW1haWwiLCJzZXRFbWFpbCIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJwYXNzd29yZCIsInNldFBhc3N3b3JkIiwibm9tZSIsInNldE5vbWUiLCJzdWJtaXR0aW5nIiwic2V0U3VibWl0dGluZyIsInJlbWVtYmVyTWUiLCJzZXRSZW1lbWJlck1lIiwicGhhc2UiLCJzZXRQaGFzZSIsImRlc3RpbmF0aW9uIiwic2V0RGVzdGluYXRpb24iLCJmYWlsZWRBdHRlbXB0cyIsInNldEZhaWxlZEF0dGVtcHRzIiwibG9ja2VkVW50aWwiLCJzZXRMb2NrZWRVbnRpbCIsImNvb2xkb3duUmVtYWluaW5nIiwic2V0Q29vbGRvd25SZW1haW5pbmciLCJjb29sZG93blJlZiIsInN0YXJ0Q29vbGRvd24iLCJ1bnRpbCIsIkRhdGUiLCJub3ciLCJNYXRoIiwiY2VpbCIsImN1cnJlbnQiLCJjbGVhckludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJyZW1haW5pbmciLCJpc0xvY2tlZCIsImZvcmdvdEVtYWlsIiwic2V0Rm9yZ290RW1haWwiLCJmb3Jnb3RTdWJtaXR0aW5nIiwic2V0Rm9yZ290U3VibWl0dGluZyIsImZvcmdvdFNlbnQiLCJzZXRGb3Jnb3RTZW50IiwidGltZXIiLCJzZXRUaW1lb3V0IiwiY2xlYXJUaW1lb3V0IiwiZGVzdCIsInRvIiwicmVwbGFjZSIsImhhbmRsZUZvcmdvdFBhc3N3b3JkIiwiZSIsInByZXZlbnREZWZhdWx0IiwidHJpbSIsImVycm9yIiwiYXV0aCIsInJlc2V0UGFzc3dvcmRGb3JFbWFpbCIsInJlZGlyZWN0VG8iLCJ3aW5kb3ciLCJsb2NhdGlvbiIsIm9yaWdpbiIsImVtYWlsU2VudCIsImVyciIsIm1lc3NhZ2UiLCJoYW5kbGVTdWJtaXQiLCJibG9ja2VkIiwic2lnbkluV2l0aFBhc3N3b3JkIiwibmV3QXR0ZW1wdHMiLCJzZXRJdGVtIiwicmVtb3ZlSXRlbSIsImRhdGEiLCJzZXNzaW9uIiwiZnJlc2hTZXNzaW9uIiwiZ2V0U2Vzc2lvbiIsInVzZXJJZCIsImlkIiwicm9sZVByaW9yaXR5IiwicmVzb2x2ZWRSb2xlIiwiaSIsImZyb20iLCJzZWxlY3QiLCJlcSIsIm9yZGVyIiwiYXNjZW5kaW5nIiwibGVuZ3RoIiwicm9sZXMiLCJyIiwiZmluZCIsIlByb21pc2UiLCJzaWduT3V0IiwiYXV0aEVycm9yIiwic2lnblVwIiwib3B0aW9ucyIsImVtYWlsUmVkaXJlY3RUbyIsInN1Y2Nlc3MiLCJkaXYiLCJjbGFzc05hbWUiLCJpbml0aWFsIiwic2NhbGUiLCJvcGFjaXR5IiwiYW5pbWF0ZSIsInRyYW5zaXRpb24iLCJ0eXBlIiwic3RpZmZuZXNzIiwiZGFtcGluZyIsImltZyIsInNyYyIsImFsdCIsImgxIiwic3BhbiIsInAiLCJ5IiwiZXhpdCIsImR1cmF0aW9uIiwiYnV0dG9uIiwib25DbGljayIsImRpc2FibGVkIiwiZm9ybSIsIm9uU3VibWl0IiwibGFiZWwiLCJpbnB1dCIsInZhbHVlIiwib25DaGFuZ2UiLCJ0YXJnZXQiLCJyZXF1aXJlZCIsInBsYWNlaG9sZGVyIiwibWluTGVuZ3RoIiwiY2hlY2tlZCIsImRlbGF5IiwicmVwZWF0IiwiSW5maW5pdHkiLCJlYXNlIiwieCIsImgyIiwiYXV0b0ZvY3VzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxRQUFRLEVBQUVDLE1BQU0sRUFBRUMsV0FBVyxFQUFFQyxTQUFTLFFBQVEsUUFBUTtBQUNqRSxTQUFTQyxXQUFXLFFBQVEsbUJBQW1CO0FBQy9DLFNBQVNDLFFBQVEsUUFBUSxpQ0FBaUM7QUFDMUQsU0FBU0MsT0FBTyxRQUFRLGtCQUFrQjtBQUMxQyxTQUFTQyxXQUFXLFFBQVEsMkJBQTJCO0FBQ3ZELFNBQVNDLE1BQU0sRUFBRUMsZUFBZSxRQUFRLGdCQUFnQjtBQUN4RCxTQUFTQyxRQUFRLFFBQVEsY0FBYztBQUN2QyxTQUFTQyxRQUFRLFFBQVEsbUJBQW1CO0FBQzVDLFNBQVNDLFNBQVMsRUFBRUMsSUFBSSxFQUFFQyxJQUFJLEVBQUVDLElBQUksRUFBRUMsUUFBUSxFQUFFQyxVQUFVLEVBQUVDLFdBQVcsUUFBUSxlQUFlO0FBQzlGLFNBQVNDLElBQUksUUFBUSxtQkFB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