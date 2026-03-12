import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/RecargaPublica.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/RecargaPublica.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"];
import { useSearchParams, useParams } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { supabase } from "/src/integrations/supabase/client.ts";
import { ThemeToggle } from "/src/components/ThemeToggle.tsx";
import { AnimatedPage, AnimatedCard } from "/src/components/AnimatedPage.tsx";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { Smartphone, Zap, Shield, Send, MessageCircle } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
export default function RecargaPublica() {
    _s();
    const [searchParams] = useSearchParams();
    const { slug } = useParams();
    const refParam = searchParams.get("ref") || searchParams.get("revendedor");
    const [revendedor, setRevendedor] = useState(null);
    const [operadoras, setOperadoras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Form state
    const [step, setStep] = useState("landing");
    const [telefone, setTelefone] = useState("");
    const [selectedOp, setSelectedOp] = useState("");
    const [selectedValor, setSelectedValor] = useState(null);
    const [sending, setSending] = useState(false);
    const [resultMsg, setResultMsg] = useState("");
    const [priceMap, setPriceMap] = useState({});
    useEffect(()=>{
        if (!slug && !refParam) {
            setError("Link de recarga inválido. Entre em contato com o revendedor.");
            setLoading(false);
            return;
        }
        loadData();
    }, [
        slug,
        refParam
    ]);
    const loadData = async ()=>{
        try {
            let revendedorId = refParam;
            // Resolve slug to user ID
            if (slug && !revendedorId) {
                const { data: profileBySlug } = await supabase.from("profiles").select("id").eq("slug", slug).maybeSingle();
                if (!profileBySlug) {
                    setError("Loja não encontrada. Verifique o link.");
                    setLoading(false);
                    return;
                }
                revendedorId = profileBySlug.id;
            }
            if (!revendedorId) {
                setError("Link de recarga inválido.");
                setLoading(false);
                return;
            }
            const [{ data: profile }, { data: role }, { data: ops }, { data: resellerPricing }, { data: globalPricing }] = await Promise.all([
                supabase.from("profiles").select("id, nome, telegram_username, whatsapp_number, active, store_name, store_logo_url, store_primary_color, store_secondary_color").eq("id", revendedorId).single(),
                supabase.from("user_roles").select("role").eq("user_id", revendedorId).eq("role", "revendedor").maybeSingle(),
                supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
                supabase.from("reseller_pricing_rules").select("*").eq("user_id", revendedorId),
                supabase.from("pricing_rules").select("*")
            ]);
            if (!profile || !role) {
                setError("Revendedor não encontrado ou inválido.");
                setLoading(false);
                return;
            }
            if (!profile.active) {
                setError("Este revendedor está temporariamente inativo.");
                setLoading(false);
                return;
            }
            // Build price map: reseller pricing takes precedence over global
            const pm = {};
            // First load global prices
            (globalPricing || []).forEach((r)=>{
                const precoFinal = r.tipo_regra === "fixo" ? Number(r.regra_valor) : Number(r.valor_recarga) * (1 + Number(r.regra_valor) / 100);
                if (precoFinal > 0) pm[`${r.operadora_id}-${r.valor_recarga}`] = precoFinal;
            });
            // Override with reseller-specific prices
            (resellerPricing || []).forEach((r)=>{
                const precoFinal = r.tipo_regra === "fixo" ? Number(r.regra_valor) : Number(r.valor_recarga) * (1 + Number(r.regra_valor) / 100);
                if (precoFinal > 0) pm[`${r.operadora_id}-${r.valor_recarga}`] = precoFinal;
            });
            setPriceMap(pm);
            setRevendedor(profile);
            setOperadoras((ops || []).map((o)=>({
                    ...o,
                    valores: o.valores || []
                })));
        } catch  {
            setError("Erro ao carregar dados.");
        }
        setLoading(false);
    };
    const currentOp = operadoras.find((o)=>o.nome === selectedOp);
    const fmt = (v)=>v.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    const getPrice = (opId, faceValue)=>priceMap[`${opId}-${faceValue}`] || faceValue;
    // Custom branding
    const brandColor = revendedor?.store_primary_color || undefined;
    const brandBg = revendedor?.store_secondary_color || undefined;
    const brandName = revendedor?.store_name || "Recargas Brasil";
    const brandLogo = revendedor?.store_logo_url || null;
    const handleSubmit = async ()=>{
        if (!telefone.trim() || !selectedValor || !revendedor?.id) return;
        setSending(true);
        try {
            const { data: saldoData } = await supabase.from("saldos").select("valor").eq("user_id", revendedor.id).eq("tipo", "revenda").single();
            const saldo = Number(saldoData?.valor) || 0;
            if (saldo < selectedValor) {
                if (revendedor?.whatsapp_number) {
                    setResultMsg("Saldo insuficiente do revendedor. Redirecionando para WhatsApp...");
                    setTimeout(()=>window.open(revendedor.whatsapp_number, "_blank"), 1500);
                } else if (revendedor?.telegram_username) {
                    setResultMsg("Saldo insuficiente do revendedor. Redirecionando para Telegram...");
                    setTimeout(()=>window.open(revendedor.telegram_username, "_blank"), 1500);
                } else {
                    setResultMsg("Revendedor sem saldo disponível. Tente novamente mais tarde.");
                }
                setStep("done");
                setSending(false);
                return;
            }
            const { error: recError } = await supabase.from("recargas").insert({
                user_id: revendedor.id,
                telefone: telefone.trim(),
                operadora: selectedOp || null,
                valor: selectedValor,
                custo: selectedValor,
                status: "completed"
            });
            if (recError) throw recError;
            const newSaldo = saldo - selectedValor;
            await supabase.from("saldos").update({
                valor: newSaldo
            }).eq("user_id", revendedor.id).eq("tipo", "revenda");
            supabase.functions.invoke("telegram-notify", {
                body: {
                    type: "recarga_completed",
                    user_id: revendedor.id,
                    data: {
                        telefone: telefone.trim(),
                        operadora: selectedOp || null,
                        valor: selectedValor,
                        novo_saldo: newSaldo
                    }
                }
            }).catch(()=>{});
            setResultMsg(`Recarga de ${fmt(selectedValor)} realizada com sucesso para ${telefone}!`);
            setStep("done");
        } catch (err) {
            setResultMsg(err.message || "Erro ao processar recarga.");
            setStep("done");
        }
        setSending(false);
    };
    if (loading) {
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
                fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                lineNumber: 190,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
            lineNumber: 189,
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
                        fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                        lineNumber: 203,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-muted-foreground",
                        children: error
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                        lineNumber: 204,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                lineNumber: 202,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
            lineNumber: 201,
            columnNumber: 7
        }, this);
    }
    // Apply custom CSS vars for branding
    const customStyle = {
        ...brandBg ? {
            backgroundColor: brandBg
        } : {}
    };
    const btnStyle = brandColor ? {
        backgroundColor: brandColor,
        color: "#fff"
    } : {};
    const btnActiveStyle = (active)=>active && brandColor ? {
            backgroundColor: brandColor,
            color: "#fff",
            borderColor: brandColor
        } : {};
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "min-h-screen relative",
        style: customStyle,
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "absolute top-4 right-4 z-20",
                children: /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                    lineNumber: 228,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                lineNumber: 227,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(AnimatedPage, {
                className: "flex items-center justify-center min-h-screen px-4 py-8",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "w-full max-w-lg",
                    children: [
                        /*#__PURE__*/ _jsxDEV(motion.div, {
                            className: "text-center mb-8",
                            initial: {
                                opacity: 0,
                                y: -20
                            },
                            animate: {
                                opacity: 1,
                                y: 0
                            },
                            transition: {
                                delay: 0.1
                            },
                            children: [
                                brandLogo ? /*#__PURE__*/ _jsxDEV("img", {
                                    src: brandLogo,
                                    alt: brandName,
                                    className: "h-14 mx-auto mb-2 rounded-xl object-contain"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                    lineNumber: 241,
                                    columnNumber: 15
                                }, this) : null,
                                /*#__PURE__*/ _jsxDEV("h1", {
                                    className: "font-display text-3xl font-bold",
                                    style: brandBg ? {
                                        color: "#fff"
                                    } : undefined,
                                    children: brandName.includes(" ") ? /*#__PURE__*/ _jsxDEV(_Fragment, {
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
                                                fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                lineNumber: 247,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ _jsxDEV("span", {
                                        style: brandColor ? {
                                            color: brandColor
                                        } : undefined,
                                        className: !brandColor ? "text-primary glow-text" : undefined,
                                        children: brandName
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                        lineNumber: 252,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                    lineNumber: 243,
                                    columnNumber: 13
                                }, this),
                                revendedor?.nome && !revendedor.store_name && /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-sm text-muted-foreground mt-1",
                                    children: [
                                        "Revendedor: ",
                                        revendedor.nome
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                    lineNumber: 258,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                            lineNumber: 234,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                            mode: "wait",
                            children: [
                                step === "landing" && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        scale: 0.95
                                    },
                                    animate: {
                                        opacity: 1,
                                        scale: 1
                                    },
                                    exit: {
                                        opacity: 0,
                                        scale: 0.95
                                    },
                                    className: "glass-modal rounded-xl p-8 text-center",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("h2", {
                                            className: "font-display text-2xl font-bold text-foreground mb-2",
                                            children: [
                                                "Recarga de Celular ",
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    style: brandColor ? {
                                                        color: brandColor
                                                    } : undefined,
                                                    className: !brandColor ? "text-primary" : undefined,
                                                    children: "na Hora"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 273,
                                                    columnNumber: 38
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 272,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-muted-foreground mb-6",
                                            children: "Escolha sua operadora, o valor e recarregue instantaneamente."
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 275,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex justify-center gap-3 mb-8 flex-wrap",
                                            children: [
                                                {
                                                    icon: Smartphone,
                                                    text: "Todas as operadoras"
                                                },
                                                {
                                                    icon: Zap,
                                                    text: "Instantâneo"
                                                },
                                                {
                                                    icon: Shield,
                                                    text: "Seguro"
                                                }
                                            ].map((item, i)=>/*#__PURE__*/ _jsxDEV(motion.span, {
                                                    initial: {
                                                        opacity: 0,
                                                        y: 10
                                                    },
                                                    animate: {
                                                        opacity: 1,
                                                        y: 0
                                                    },
                                                    transition: {
                                                        delay: 0.3 + i * 0.1
                                                    },
                                                    className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium text-foreground",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV(item.icon, {
                                                            className: "h-3.5 w-3.5",
                                                            style: brandColor ? {
                                                                color: brandColor
                                                            } : undefined
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 291,
                                                            columnNumber: 23
                                                        }, this),
                                                        item.text
                                                    ]
                                                }, item.text, true, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 284,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 278,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV(motion.button, {
                                            whileHover: {
                                                scale: 1.02
                                            },
                                            whileTap: {
                                                scale: 0.98
                                            },
                                            onClick: ()=>setStep("form"),
                                            className: `w-full py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`,
                                            style: btnStyle,
                                            children: "Fazer recarga agora"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 296,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, "landing", true, {
                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                    lineNumber: 265,
                                    columnNumber: 15
                                }, this),
                                step === "form" && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        x: 40
                                    },
                                    animate: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    exit: {
                                        opacity: 0,
                                        x: -40
                                    },
                                    className: "glass-modal rounded-xl p-6",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("h2", {
                                            className: "font-display text-lg font-semibold text-foreground mb-4",
                                            children: "Dados da Recarga"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 317,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("label", {
                                                            className: "block text-sm font-medium text-foreground mb-1",
                                                            children: "Telefone *"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 320,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("input", {
                                                            type: "tel",
                                                            value: telefone,
                                                            onChange: (e)=>setTelefone(e.target.value),
                                                            maxLength: 15,
                                                            className: "w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                            placeholder: "(11) 99999-9999"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 321,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("label", {
                                                            className: "block text-sm font-medium text-foreground mb-1",
                                                            children: "Operadora"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 331,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("select", {
                                                            value: selectedOp,
                                                            onChange: (e)=>{
                                                                setSelectedOp(e.target.value);
                                                                setSelectedValor(null);
                                                            },
                                                            className: "w-full px-3 py-2.5 rounded-lg glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("option", {
                                                                    value: "",
                                                                    children: "Selecione..."
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                                    lineNumber: 337,
                                                                    columnNumber: 23
                                                                }, this),
                                                                operadoras.map((op)=>/*#__PURE__*/ _jsxDEV("option", {
                                                                        value: op.nome,
                                                                        children: op.nome
                                                                    }, op.id, false, {
                                                                        fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                                        lineNumber: 339,
                                                                        columnNumber: 25
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 332,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 330,
                                                    columnNumber: 19
                                                }, this),
                                                currentOp && currentOp.valores.length > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("label", {
                                                            className: "block text-sm font-medium text-foreground mb-2",
                                                            children: "Valor"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 345,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "grid grid-cols-3 gap-2",
                                                            children: currentOp.valores.map((v, i)=>{
                                                                const displayPrice = getPrice(currentOp.id, v);
                                                                const hasCustomPrice = displayPrice !== v;
                                                                return /*#__PURE__*/ _jsxDEV(motion.button, {
                                                                    initial: {
                                                                        opacity: 0,
                                                                        scale: 0.9
                                                                    },
                                                                    animate: {
                                                                        opacity: 1,
                                                                        scale: 1
                                                                    },
                                                                    transition: {
                                                                        delay: i * 0.05
                                                                    },
                                                                    whileHover: {
                                                                        scale: 1.05
                                                                    },
                                                                    whileTap: {
                                                                        scale: 0.95
                                                                    },
                                                                    type: "button",
                                                                    onClick: ()=>setSelectedValor(v),
                                                                    className: `py-2.5 rounded-lg text-sm font-bold border transition-all ${selectedValor === v ? !brandColor ? "bg-primary text-primary-foreground border-primary glow-primary" : "text-white" : "border-border text-foreground hover:bg-muted glass"}`,
                                                                    style: btnActiveStyle(selectedValor === v),
                                                                    children: [
                                                                        fmt(displayPrice),
                                                                        hasCustomPrice && /*#__PURE__*/ _jsxDEV("span", {
                                                                            className: "block text-[10px] font-normal opacity-70",
                                                                            children: [
                                                                                "Recarga ",
                                                                                fmt(v)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                                            lineNumber: 368,
                                                                            columnNumber: 50
                                                                        }, this)
                                                                    ]
                                                                }, v, true, {
                                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                                    lineNumber: 351,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 346,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 344,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex gap-3 pt-2",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: ()=>setStep("landing"),
                                                            className: "flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors",
                                                            children: "Voltar"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 376,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV(motion.button, {
                                                            whileHover: {
                                                                scale: 1.02
                                                            },
                                                            whileTap: {
                                                                scale: 0.98
                                                            },
                                                            onClick: ()=>{
                                                                if (!telefone.trim() || !selectedValor) return;
                                                                setStep("confirm");
                                                            },
                                                            disabled: !telefone.trim() || !selectedValor,
                                                            className: `flex-1 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`,
                                                            style: btnStyle,
                                                            children: "Continuar"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 382,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 375,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 318,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, "form", true, {
                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                    lineNumber: 310,
                                    columnNumber: 15
                                }, this),
                                step === "confirm" && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        x: 40
                                    },
                                    animate: {
                                        opacity: 1,
                                        x: 0
                                    },
                                    exit: {
                                        opacity: 0,
                                        x: -40
                                    },
                                    className: "glass-modal rounded-xl p-6",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("h2", {
                                            className: "font-display text-lg font-semibold text-foreground mb-4",
                                            children: "Confirmar Recarga"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 409,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "space-y-3 mb-6",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex justify-between py-2 border-b border-border",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "text-muted-foreground",
                                                            children: "Telefone"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 412,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "font-mono font-medium text-foreground",
                                                            children: telefone
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 413,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 411,
                                                    columnNumber: 19
                                                }, this),
                                                selectedOp && /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex justify-between py-2 border-b border-border",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "text-muted-foreground",
                                                            children: "Operadora"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 417,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "font-medium text-foreground",
                                                            children: selectedOp
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 418,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 416,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex justify-between py-2",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "text-muted-foreground",
                                                            children: "Valor da Recarga"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 422,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "text-xl font-bold",
                                                            style: brandColor ? {
                                                                color: brandColor
                                                            } : undefined,
                                                            children: selectedValor && currentOp ? fmt(getPrice(currentOp.id, selectedValor)) : selectedValor ? fmt(selectedValor) : "—"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                            lineNumber: 423,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 421,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 410,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex gap-3",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setStep("form"),
                                                    className: "flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors",
                                                    children: "Voltar"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV(motion.button, {
                                                    whileHover: {
                                                        scale: 1.02
                                                    },
                                                    whileTap: {
                                                        scale: 0.98
                                                    },
                                                    onClick: handleSubmit,
                                                    disabled: sending,
                                                    className: `flex-1 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`,
                                                    style: btnStyle,
                                                    children: sending ? /*#__PURE__*/ _jsxDEV(motion.div, {
                                                        animate: {
                                                            rotate: 360
                                                        },
                                                        transition: {
                                                            repeat: Infinity,
                                                            duration: 1,
                                                            ease: "linear"
                                                        },
                                                        className: "h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                        lineNumber: 444,
                                                        columnNumber: 23
                                                    }, this) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV(Send, {
                                                                className: "h-4 w-4"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                                lineNumber: 447,
                                                                columnNumber: 25
                                                            }, this),
                                                            " Confirmar"
                                                        ]
                                                    }, void 0, true)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                    lineNumber: 435,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 428,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, "confirm", true, {
                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                    lineNumber: 402,
                                    columnNumber: 15
                                }, this),
                                step === "done" && /*#__PURE__*/ _jsxDEV(motion.div, {
                                    initial: {
                                        opacity: 0,
                                        scale: 0.9
                                    },
                                    animate: {
                                        opacity: 1,
                                        scale: 1
                                    },
                                    className: "glass-modal rounded-xl p-8 text-center",
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
                                                stiffness: 300,
                                                damping: 15,
                                                delay: 0.2
                                            },
                                            className: "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4",
                                            style: brandColor ? {
                                                backgroundColor: `${brandColor}22`
                                            } : undefined,
                                            children: resultMsg.includes("sucesso") ? /*#__PURE__*/ _jsxDEV(Zap, {
                                                className: "h-8 w-8",
                                                style: brandColor ? {
                                                    color: brandColor
                                                } : undefined
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                lineNumber: 471,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ _jsxDEV(Shield, {
                                                className: "h-8 w-8 text-warning"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                                lineNumber: 473,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 463,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-foreground font-medium mb-6",
                                            children: resultMsg
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 476,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("button", {
                                            onClick: ()=>{
                                                setStep("landing");
                                                setTelefone("");
                                                setSelectedOp("");
                                                setSelectedValor(null);
                                            },
                                            className: `px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity ${!brandColor ? "bg-primary text-primary-foreground" : ""}`,
                                            style: btnStyle,
                                            children: "Nova Recarga"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                            lineNumber: 477,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, "done", true, {
                                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                                    lineNumber: 457,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                            lineNumber: 262,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                    lineNumber: 232,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                lineNumber: 231,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                children: [
                    revendedor?.telegram_username && /*#__PURE__*/ _jsxDEV(motion.a, {
                        href: revendedor.telegram_username,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        initial: {
                            scale: 0,
                            opacity: 0
                        },
                        animate: {
                            scale: 1,
                            opacity: 1
                        },
                        exit: {
                            scale: 0,
                            opacity: 0
                        },
                        transition: {
                            delay: 0.8,
                            type: "spring",
                            stiffness: 300
                        },
                        whileHover: {
                            scale: 1.15
                        },
                        whileTap: {
                            scale: 0.9
                        },
                        className: "fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
                        style: {
                            background: "linear-gradient(135deg, #0088cc, #0077b5)"
                        },
                        children: /*#__PURE__*/ _jsxDEV(Send, {
                            className: "h-6 w-6 text-white"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                            lineNumber: 507,
                            columnNumber: 13
                        }, this)
                    }, "telegram", false, {
                        fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                        lineNumber: 493,
                        columnNumber: 11
                    }, this),
                    revendedor?.whatsapp_number && /*#__PURE__*/ _jsxDEV(motion.a, {
                        href: revendedor.whatsapp_number,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        initial: {
                            scale: 0,
                            opacity: 0
                        },
                        animate: {
                            scale: 1,
                            opacity: 1
                        },
                        exit: {
                            scale: 0,
                            opacity: 0
                        },
                        transition: {
                            delay: 1,
                            type: "spring",
                            stiffness: 300
                        },
                        whileHover: {
                            scale: 1.15
                        },
                        whileTap: {
                            scale: 0.9
                        },
                        className: "fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg",
                        style: {
                            background: "linear-gradient(135deg, #25D366, #128C7E)"
                        },
                        children: /*#__PURE__*/ _jsxDEV(MessageCircle, {
                            className: "h-6 w-6 text-white"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                            lineNumber: 525,
                            columnNumber: 13
                        }, this)
                    }, "whatsapp", false, {
                        fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                        lineNumber: 511,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/RecargaPublica.tsx",
                lineNumber: 491,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/RecargaPublica.tsx",
        lineNumber: 225,
        columnNumber: 5
    }, this);
}
_s(RecargaPublica, "dPP3gGmEl1H+OZAjNKtIr/ZdfTM=", false, function() {
    return [
        useSearchParams,
        useParams
    ];
});
_c = RecargaPublica;
var _c;
$RefreshReg$(_c, "RecargaPublica");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/RecargaPublica.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/RecargaPublica.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlY2FyZ2FQdWJsaWNhLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyB1c2VTZWFyY2hQYXJhbXMsIHVzZVBhcmFtcyB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XG5pbXBvcnQgeyBzdXBhYmFzZSB9IGZyb20gXCJAL2ludGVncmF0aW9ucy9zdXBhYmFzZS9jbGllbnRcIjtcbmltcG9ydCB7IFRoZW1lVG9nZ2xlIH0gZnJvbSBcIkAvY29tcG9uZW50cy9UaGVtZVRvZ2dsZVwiO1xuaW1wb3J0IHsgQW5pbWF0ZWRQYWdlLCBBbmltYXRlZENhcmQgfSBmcm9tIFwiQC9jb21wb25lbnRzL0FuaW1hdGVkUGFnZVwiO1xuaW1wb3J0IHsgbW90aW9uLCBBbmltYXRlUHJlc2VuY2UgfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IHsgU21hcnRwaG9uZSwgWmFwLCBTaGllbGQsIFNlbmQsIE1lc3NhZ2VDaXJjbGUgfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5cbmludGVyZmFjZSBPcGVyYWRvcmEge1xuICBpZDogc3RyaW5nO1xuICBub21lOiBzdHJpbmc7XG4gIHZhbG9yZXM6IG51bWJlcltdO1xufVxuXG5pbnRlcmZhY2UgUHJpY2VNYXAge1xuICBba2V5OiBzdHJpbmddOiBudW1iZXI7IC8vIFwib3BlcmFkb3JhSWQtdmFsb3JcIiA9PiBwcmXDp28gZmluYWwgcGFyYSBvIGNsaWVudGVcbn1cblxuaW50ZXJmYWNlIFJldmVuZGVkb3JJbmZvIHtcbiAgaWQ6IHN0cmluZztcbiAgbm9tZTogc3RyaW5nIHwgbnVsbDtcbiAgdGVsZWdyYW1fdXNlcm5hbWU6IHN0cmluZyB8IG51bGw7XG4gIHdoYXRzYXBwX251bWJlcjogc3RyaW5nIHwgbnVsbDtcbiAgYWN0aXZlOiBib29sZWFuO1xuICBzdG9yZV9uYW1lOiBzdHJpbmcgfCBudWxsO1xuICBzdG9yZV9sb2dvX3VybDogc3RyaW5nIHwgbnVsbDtcbiAgc3RvcmVfcHJpbWFyeV9jb2xvcjogc3RyaW5nIHwgbnVsbDtcbiAgc3RvcmVfc2Vjb25kYXJ5X2NvbG9yOiBzdHJpbmcgfCBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBSZWNhcmdhUHVibGljYSgpIHtcbiAgY29uc3QgW3NlYXJjaFBhcmFtc10gPSB1c2VTZWFyY2hQYXJhbXMoKTtcbiAgY29uc3QgeyBzbHVnIH0gPSB1c2VQYXJhbXM8eyBzbHVnOiBzdHJpbmcgfT4oKTtcbiAgY29uc3QgcmVmUGFyYW0gPSBzZWFyY2hQYXJhbXMuZ2V0KFwicmVmXCIpIHx8IHNlYXJjaFBhcmFtcy5nZXQoXCJyZXZlbmRlZG9yXCIpO1xuXG4gIGNvbnN0IFtyZXZlbmRlZG9yLCBzZXRSZXZlbmRlZG9yXSA9IHVzZVN0YXRlPFJldmVuZGVkb3JJbmZvIHwgbnVsbD4obnVsbCk7XG4gIGNvbnN0IFtvcGVyYWRvcmFzLCBzZXRPcGVyYWRvcmFzXSA9IHVzZVN0YXRlPE9wZXJhZG9yYVtdPihbXSk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuXG4gIC8vIEZvcm0gc3RhdGVcbiAgY29uc3QgW3N0ZXAsIHNldFN0ZXBdID0gdXNlU3RhdGU8XCJsYW5kaW5nXCIgfCBcImZvcm1cIiB8IFwiY29uZmlybVwiIHwgXCJkb25lXCI+KFwibGFuZGluZ1wiKTtcbiAgY29uc3QgW3RlbGVmb25lLCBzZXRUZWxlZm9uZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW3NlbGVjdGVkT3AsIHNldFNlbGVjdGVkT3BdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtzZWxlY3RlZFZhbG9yLCBzZXRTZWxlY3RlZFZhbG9yXSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbc2VuZGluZywgc2V0U2VuZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtyZXN1bHRNc2csIHNldFJlc3VsdE1zZ10gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW3ByaWNlTWFwLCBzZXRQcmljZU1hcF0gPSB1c2VTdGF0ZTxQcmljZU1hcD4oe30pO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFzbHVnICYmICFyZWZQYXJhbSkge1xuICAgICAgc2V0RXJyb3IoXCJMaW5rIGRlIHJlY2FyZ2EgaW52w6FsaWRvLiBFbnRyZSBlbSBjb250YXRvIGNvbSBvIHJldmVuZGVkb3IuXCIpO1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGxvYWREYXRhKCk7XG4gIH0sIFtzbHVnLCByZWZQYXJhbV0pO1xuXG4gIGNvbnN0IGxvYWREYXRhID0gYXN5bmMgKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBsZXQgcmV2ZW5kZWRvcklkID0gcmVmUGFyYW07XG5cbiAgICAgIC8vIFJlc29sdmUgc2x1ZyB0byB1c2VyIElEXG4gICAgICBpZiAoc2x1ZyAmJiAhcmV2ZW5kZWRvcklkKSB7XG4gICAgICAgIGNvbnN0IHsgZGF0YTogcHJvZmlsZUJ5U2x1ZyB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgICAuZnJvbShcInByb2ZpbGVzXCIpXG4gICAgICAgICAgLnNlbGVjdChcImlkXCIpXG4gICAgICAgICAgLmVxKFwic2x1Z1wiLCBzbHVnKVxuICAgICAgICAgIC5tYXliZVNpbmdsZSgpO1xuICAgICAgICBpZiAoIXByb2ZpbGVCeVNsdWcpIHtcbiAgICAgICAgICBzZXRFcnJvcihcIkxvamEgbsOjbyBlbmNvbnRyYWRhLiBWZXJpZmlxdWUgbyBsaW5rLlwiKTtcbiAgICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV2ZW5kZWRvcklkID0gcHJvZmlsZUJ5U2x1Zy5pZDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFyZXZlbmRlZG9ySWQpIHtcbiAgICAgICAgc2V0RXJyb3IoXCJMaW5rIGRlIHJlY2FyZ2EgaW52w6FsaWRvLlwiKTtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgW3sgZGF0YTogcHJvZmlsZSB9LCB7IGRhdGE6IHJvbGUgfSwgeyBkYXRhOiBvcHMgfSwgeyBkYXRhOiByZXNlbGxlclByaWNpbmcgfSwgeyBkYXRhOiBnbG9iYWxQcmljaW5nIH1dID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBzdXBhYmFzZS5mcm9tKFwicHJvZmlsZXNcIikuc2VsZWN0KFwiaWQsIG5vbWUsIHRlbGVncmFtX3VzZXJuYW1lLCB3aGF0c2FwcF9udW1iZXIsIGFjdGl2ZSwgc3RvcmVfbmFtZSwgc3RvcmVfbG9nb191cmwsIHN0b3JlX3ByaW1hcnlfY29sb3IsIHN0b3JlX3NlY29uZGFyeV9jb2xvclwiKS5lcShcImlkXCIsIHJldmVuZGVkb3JJZCkuc2luZ2xlKCksXG4gICAgICAgIHN1cGFiYXNlLmZyb20oXCJ1c2VyX3JvbGVzXCIpLnNlbGVjdChcInJvbGVcIikuZXEoXCJ1c2VyX2lkXCIsIHJldmVuZGVkb3JJZCkuZXEoXCJyb2xlXCIsIFwicmV2ZW5kZWRvclwiKS5tYXliZVNpbmdsZSgpLFxuICAgICAgICBzdXBhYmFzZS5mcm9tKFwib3BlcmFkb3Jhc1wiKS5zZWxlY3QoXCIqXCIpLmVxKFwiYXRpdm9cIiwgdHJ1ZSkub3JkZXIoXCJub21lXCIpLFxuICAgICAgICBzdXBhYmFzZS5mcm9tKFwicmVzZWxsZXJfcHJpY2luZ19ydWxlc1wiKS5zZWxlY3QoXCIqXCIpLmVxKFwidXNlcl9pZFwiLCByZXZlbmRlZG9ySWQpLFxuICAgICAgICBzdXBhYmFzZS5mcm9tKFwicHJpY2luZ19ydWxlc1wiKS5zZWxlY3QoXCIqXCIpLFxuICAgICAgXSk7XG5cbiAgICAgIGlmICghcHJvZmlsZSB8fCAhcm9sZSkge1xuICAgICAgICBzZXRFcnJvcihcIlJldmVuZGVkb3IgbsOjbyBlbmNvbnRyYWRvIG91IGludsOhbGlkby5cIik7XG4gICAgICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIShwcm9maWxlIGFzIGFueSkuYWN0aXZlKSB7XG4gICAgICAgIHNldEVycm9yKFwiRXN0ZSByZXZlbmRlZG9yIGVzdMOhIHRlbXBvcmFyaWFtZW50ZSBpbmF0aXZvLlwiKTtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gQnVpbGQgcHJpY2UgbWFwOiByZXNlbGxlciBwcmljaW5nIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBnbG9iYWxcbiAgICAgIGNvbnN0IHBtOiBQcmljZU1hcCA9IHt9O1xuICAgICAgLy8gRmlyc3QgbG9hZCBnbG9iYWwgcHJpY2VzXG4gICAgICAoZ2xvYmFsUHJpY2luZyB8fCBbXSkuZm9yRWFjaCgocjogYW55KSA9PiB7XG4gICAgICAgIGNvbnN0IHByZWNvRmluYWwgPSByLnRpcG9fcmVncmEgPT09IFwiZml4b1wiID8gTnVtYmVyKHIucmVncmFfdmFsb3IpIDogTnVtYmVyKHIudmFsb3JfcmVjYXJnYSkgKiAoMSArIE51bWJlcihyLnJlZ3JhX3ZhbG9yKSAvIDEwMCk7XG4gICAgICAgIGlmIChwcmVjb0ZpbmFsID4gMCkgcG1bYCR7ci5vcGVyYWRvcmFfaWR9LSR7ci52YWxvcl9yZWNhcmdhfWBdID0gcHJlY29GaW5hbDtcbiAgICAgIH0pO1xuICAgICAgLy8gT3ZlcnJpZGUgd2l0aCByZXNlbGxlci1zcGVjaWZpYyBwcmljZXNcbiAgICAgIChyZXNlbGxlclByaWNpbmcgfHwgW10pLmZvckVhY2goKHI6IGFueSkgPT4ge1xuICAgICAgICBjb25zdCBwcmVjb0ZpbmFsID0gci50aXBvX3JlZ3JhID09PSBcImZpeG9cIiA/IE51bWJlcihyLnJlZ3JhX3ZhbG9yKSA6IE51bWJlcihyLnZhbG9yX3JlY2FyZ2EpICogKDEgKyBOdW1iZXIoci5yZWdyYV92YWxvcikgLyAxMDApO1xuICAgICAgICBpZiAocHJlY29GaW5hbCA+IDApIHBtW2Ake3Iub3BlcmFkb3JhX2lkfS0ke3IudmFsb3JfcmVjYXJnYX1gXSA9IHByZWNvRmluYWw7XG4gICAgICB9KTtcbiAgICAgIHNldFByaWNlTWFwKHBtKTtcblxuICAgICAgc2V0UmV2ZW5kZWRvcihwcm9maWxlIGFzIGFueSBhcyBSZXZlbmRlZG9ySW5mbyk7XG4gICAgICBzZXRPcGVyYWRvcmFzKChvcHMgfHwgW10pLm1hcChvID0+ICh7IC4uLm8sIHZhbG9yZXM6IChvLnZhbG9yZXMgYXMgdW5rbm93biBhcyBudW1iZXJbXSkgfHwgW10gfSkpKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHNldEVycm9yKFwiRXJybyBhbyBjYXJyZWdhciBkYWRvcy5cIik7XG4gICAgfVxuICAgIHNldExvYWRpbmcoZmFsc2UpO1xuICB9O1xuXG4gIGNvbnN0IGN1cnJlbnRPcCA9IG9wZXJhZG9yYXMuZmluZChvID0+IG8ubm9tZSA9PT0gc2VsZWN0ZWRPcCk7XG4gIGNvbnN0IGZtdCA9ICh2OiBudW1iZXIpID0+IHYudG9Mb2NhbGVTdHJpbmcoXCJwdC1CUlwiLCB7IHN0eWxlOiBcImN1cnJlbmN5XCIsIGN1cnJlbmN5OiBcIkJSTFwiIH0pO1xuICBjb25zdCBnZXRQcmljZSA9IChvcElkOiBzdHJpbmcsIGZhY2VWYWx1ZTogbnVtYmVyKSA9PiBwcmljZU1hcFtgJHtvcElkfS0ke2ZhY2VWYWx1ZX1gXSB8fCBmYWNlVmFsdWU7XG5cbiAgLy8gQ3VzdG9tIGJyYW5kaW5nXG4gIGNvbnN0IGJyYW5kQ29sb3IgPSByZXZlbmRlZG9yPy5zdG9yZV9wcmltYXJ5X2NvbG9yIHx8IHVuZGVmaW5lZDtcbiAgY29uc3QgYnJhbmRCZyA9IHJldmVuZGVkb3I/LnN0b3JlX3NlY29uZGFyeV9jb2xvciB8fCB1bmRlZmluZWQ7XG4gIGNvbnN0IGJyYW5kTmFtZSA9IHJldmVuZGVkb3I/LnN0b3JlX25hbWUgfHwgXCJSZWNhcmdhcyBCcmFzaWxcIjtcbiAgY29uc3QgYnJhbmRMb2dvID0gcmV2ZW5kZWRvcj8uc3RvcmVfbG9nb191cmwgfHwgbnVsbDtcblxuICBjb25zdCBoYW5kbGVTdWJtaXQgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCF0ZWxlZm9uZS50cmltKCkgfHwgIXNlbGVjdGVkVmFsb3IgfHwgIXJldmVuZGVkb3I/LmlkKSByZXR1cm47XG4gICAgc2V0U2VuZGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhOiBzYWxkb0RhdGEgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oXCJzYWxkb3NcIikuc2VsZWN0KFwidmFsb3JcIikuZXEoXCJ1c2VyX2lkXCIsIHJldmVuZGVkb3IuaWQpLmVxKFwidGlwb1wiLCBcInJldmVuZGFcIikuc2luZ2xlKCk7XG4gICAgICBjb25zdCBzYWxkbyA9IE51bWJlcihzYWxkb0RhdGE/LnZhbG9yKSB8fCAwO1xuXG4gICAgICBpZiAoc2FsZG8gPCBzZWxlY3RlZFZhbG9yKSB7XG4gICAgICAgIGlmIChyZXZlbmRlZG9yPy53aGF0c2FwcF9udW1iZXIpIHtcbiAgICAgICAgICBzZXRSZXN1bHRNc2coXCJTYWxkbyBpbnN1ZmljaWVudGUgZG8gcmV2ZW5kZWRvci4gUmVkaXJlY2lvbmFuZG8gcGFyYSBXaGF0c0FwcC4uLlwiKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHdpbmRvdy5vcGVuKHJldmVuZGVkb3Iud2hhdHNhcHBfbnVtYmVyISwgXCJfYmxhbmtcIiksIDE1MDApO1xuICAgICAgICB9IGVsc2UgaWYgKHJldmVuZGVkb3I/LnRlbGVncmFtX3VzZXJuYW1lKSB7XG4gICAgICAgICAgc2V0UmVzdWx0TXNnKFwiU2FsZG8gaW5zdWZpY2llbnRlIGRvIHJldmVuZGVkb3IuIFJlZGlyZWNpb25hbmRvIHBhcmEgVGVsZWdyYW0uLi5cIik7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB3aW5kb3cub3BlbihyZXZlbmRlZG9yLnRlbGVncmFtX3VzZXJuYW1lISwgXCJfYmxhbmtcIiksIDE1MDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldFJlc3VsdE1zZyhcIlJldmVuZGVkb3Igc2VtIHNhbGRvIGRpc3BvbsOtdmVsLiBUZW50ZSBub3ZhbWVudGUgbWFpcyB0YXJkZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgc2V0U3RlcChcImRvbmVcIik7XG4gICAgICAgIHNldFNlbmRpbmcoZmFsc2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHsgZXJyb3I6IHJlY0Vycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKFwicmVjYXJnYXNcIikuaW5zZXJ0KHtcbiAgICAgICAgdXNlcl9pZDogcmV2ZW5kZWRvci5pZCxcbiAgICAgICAgdGVsZWZvbmU6IHRlbGVmb25lLnRyaW0oKSxcbiAgICAgICAgb3BlcmFkb3JhOiBzZWxlY3RlZE9wIHx8IG51bGwsXG4gICAgICAgIHZhbG9yOiBzZWxlY3RlZFZhbG9yLFxuICAgICAgICBjdXN0bzogc2VsZWN0ZWRWYWxvcixcbiAgICAgICAgc3RhdHVzOiBcImNvbXBsZXRlZFwiLFxuICAgICAgfSk7XG4gICAgICBpZiAocmVjRXJyb3IpIHRocm93IHJlY0Vycm9yO1xuXG4gICAgICBjb25zdCBuZXdTYWxkbyA9IHNhbGRvIC0gc2VsZWN0ZWRWYWxvcjtcbiAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oXCJzYWxkb3NcIikudXBkYXRlKHsgdmFsb3I6IG5ld1NhbGRvIH0pLmVxKFwidXNlcl9pZFwiLCByZXZlbmRlZG9yLmlkKS5lcShcInRpcG9cIiwgXCJyZXZlbmRhXCIpO1xuXG4gICAgICBzdXBhYmFzZS5mdW5jdGlvbnMuaW52b2tlKFwidGVsZWdyYW0tbm90aWZ5XCIsIHtcbiAgICAgICAgYm9keToge1xuICAgICAgICAgIHR5cGU6IFwicmVjYXJnYV9jb21wbGV0ZWRcIixcbiAgICAgICAgICB1c2VyX2lkOiByZXZlbmRlZG9yLmlkLFxuICAgICAgICAgIGRhdGE6IHsgdGVsZWZvbmU6IHRlbGVmb25lLnRyaW0oKSwgb3BlcmFkb3JhOiBzZWxlY3RlZE9wIHx8IG51bGwsIHZhbG9yOiBzZWxlY3RlZFZhbG9yLCBub3ZvX3NhbGRvOiBuZXdTYWxkbyB9LFxuICAgICAgICB9LFxuICAgICAgfSkuY2F0Y2goKCkgPT4ge30pO1xuXG4gICAgICBzZXRSZXN1bHRNc2coYFJlY2FyZ2EgZGUgJHtmbXQoc2VsZWN0ZWRWYWxvcil9IHJlYWxpemFkYSBjb20gc3VjZXNzbyBwYXJhICR7dGVsZWZvbmV9IWApO1xuICAgICAgc2V0U3RlcChcImRvbmVcIik7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIHNldFJlc3VsdE1zZyhlcnIubWVzc2FnZSB8fCBcIkVycm8gYW8gcHJvY2Vzc2FyIHJlY2FyZ2EuXCIpO1xuICAgICAgc2V0U3RlcChcImRvbmVcIik7XG4gICAgfVxuICAgIHNldFNlbmRpbmcoZmFsc2UpO1xuICB9O1xuXG4gIGlmIChsb2FkaW5nKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgYW5pbWF0ZT17eyByb3RhdGU6IDM2MCB9fVxuICAgICAgICAgIHRyYW5zaXRpb249e3sgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDEsIGVhc2U6IFwibGluZWFyXCIgfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJoLTggdy04IGJvcmRlci00IGJvcmRlci1wcmltYXJ5IGJvcmRlci10LXRyYW5zcGFyZW50IHJvdW5kZWQtZnVsbFwiXG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB4LTRcIj5cbiAgICAgICAgPEFuaW1hdGVkQ2FyZCBjbGFzc05hbWU9XCJnbGFzcy1tb2RhbCByb3VuZGVkLXhsIHAtOCBtYXgtdy1tZCB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZGVzdHJ1Y3RpdmUgbWItM1wiPkFjZXNzbyBOZWdhZG88L2gxPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPntlcnJvcn08L3A+XG4gICAgICAgIDwvQW5pbWF0ZWRDYXJkPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIC8vIEFwcGx5IGN1c3RvbSBDU1MgdmFycyBmb3IgYnJhbmRpbmdcbiAgY29uc3QgY3VzdG9tU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XG4gICAgLi4uKGJyYW5kQmcgPyB7IGJhY2tncm91bmRDb2xvcjogYnJhbmRCZyB9IDoge30pLFxuICB9O1xuXG4gIGNvbnN0IGJ0blN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0gYnJhbmRDb2xvclxuICAgID8geyBiYWNrZ3JvdW5kQ29sb3I6IGJyYW5kQ29sb3IsIGNvbG9yOiBcIiNmZmZcIiB9XG4gICAgOiB7fTtcblxuICBjb25zdCBidG5BY3RpdmVTdHlsZSA9IChhY3RpdmU6IGJvb2xlYW4pOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0+XG4gICAgYWN0aXZlICYmIGJyYW5kQ29sb3JcbiAgICAgID8geyBiYWNrZ3JvdW5kQ29sb3I6IGJyYW5kQ29sb3IsIGNvbG9yOiBcIiNmZmZcIiwgYm9yZGVyQ29sb3I6IGJyYW5kQ29sb3IgfVxuICAgICAgOiB7fTtcblxuICByZXR1cm4gKFxuICAgIDxkaXYgY2xhc3NOYW1lPVwibWluLWgtc2NyZWVuIHJlbGF0aXZlXCIgc3R5bGU9e2N1c3RvbVN0eWxlfT5cbiAgICAgIHsvKiBIZWFkZXIgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC00IHJpZ2h0LTQgei0yMFwiPlxuICAgICAgICA8VGhlbWVUb2dnbGUgLz5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8QW5pbWF0ZWRQYWdlIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG1pbi1oLXNjcmVlbiBweC00IHB5LThcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgbWF4LXctbGdcIj5cbiAgICAgICAgICB7LyogTG9nbyAqL31cbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgbWItOFwiXG4gICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IC0yMCB9fVxuICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjEgfX1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7YnJhbmRMb2dvID8gKFxuICAgICAgICAgICAgICA8aW1nIHNyYz17YnJhbmRMb2dvfSBhbHQ9e2JyYW5kTmFtZX0gY2xhc3NOYW1lPVwiaC0xNCBteC1hdXRvIG1iLTIgcm91bmRlZC14bCBvYmplY3QtY29udGFpblwiIC8+XG4gICAgICAgICAgICApIDogbnVsbH1cbiAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC0zeGwgZm9udC1ib2xkXCIgc3R5bGU9e2JyYW5kQmcgPyB7IGNvbG9yOiBcIiNmZmZcIiB9IDogdW5kZWZpbmVkfT5cbiAgICAgICAgICAgICAge2JyYW5kTmFtZS5pbmNsdWRlcyhcIiBcIikgPyAoXG4gICAgICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgICAgIHticmFuZE5hbWUuc3BsaXQoXCIgXCIpLnNsaWNlKDAsIC0xKS5qb2luKFwiIFwiKX17XCIgXCJ9XG4gICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17YnJhbmRDb2xvciA/IHsgY29sb3I6IGJyYW5kQ29sb3IgfSA6IHVuZGVmaW5lZH0gY2xhc3NOYW1lPXshYnJhbmRDb2xvciA/IFwidGV4dC1wcmltYXJ5IGdsb3ctdGV4dFwiIDogdW5kZWZpbmVkfT5cbiAgICAgICAgICAgICAgICAgICAge2JyYW5kTmFtZS5zcGxpdChcIiBcIikuc2xpY2UoLTEpfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXticmFuZENvbG9yID8geyBjb2xvcjogYnJhbmRDb2xvciB9IDogdW5kZWZpbmVkfSBjbGFzc05hbWU9eyFicmFuZENvbG9yID8gXCJ0ZXh0LXByaW1hcnkgZ2xvdy10ZXh0XCIgOiB1bmRlZmluZWR9PlxuICAgICAgICAgICAgICAgICAge2JyYW5kTmFtZX1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2gxPlxuICAgICAgICAgICAge3JldmVuZGVkb3I/Lm5vbWUgJiYgIXJldmVuZGVkb3Iuc3RvcmVfbmFtZSAmJiAoXG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG10LTFcIj5SZXZlbmRlZG9yOiB7cmV2ZW5kZWRvci5ub21lfTwvcD5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgICAgPEFuaW1hdGVQcmVzZW5jZSBtb2RlPVwid2FpdFwiPlxuICAgICAgICAgICAgey8qIExhbmRpbmcgKi99XG4gICAgICAgICAgICB7c3RlcCA9PT0gXCJsYW5kaW5nXCIgJiYgKFxuICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgIGtleT1cImxhbmRpbmdcIlxuICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH19XG4gICAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45NSB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdsYXNzLW1vZGFsIHJvdW5kZWQteGwgcC04IHRleHQtY2VudGVyXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC0yeGwgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZCBtYi0yXCI+XG4gICAgICAgICAgICAgICAgICBSZWNhcmdhIGRlIENlbHVsYXIgPHNwYW4gc3R5bGU9e2JyYW5kQ29sb3IgPyB7IGNvbG9yOiBicmFuZENvbG9yIH0gOiB1bmRlZmluZWR9IGNsYXNzTmFtZT17IWJyYW5kQ29sb3IgPyBcInRleHQtcHJpbWFyeVwiIDogdW5kZWZpbmVkfT5uYSBIb3JhPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1iLTZcIj5cbiAgICAgICAgICAgICAgICAgIEVzY29saGEgc3VhIG9wZXJhZG9yYSwgbyB2YWxvciBlIHJlY2FycmVndWUgaW5zdGFudGFuZWFtZW50ZS5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktY2VudGVyIGdhcC0zIG1iLTggZmxleC13cmFwXCI+XG4gICAgICAgICAgICAgICAgICB7W1xuICAgICAgICAgICAgICAgICAgICB7IGljb246IFNtYXJ0cGhvbmUsIHRleHQ6IFwiVG9kYXMgYXMgb3BlcmFkb3Jhc1wiIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgaWNvbjogWmFwLCB0ZXh0OiBcIkluc3RhbnTDom5lb1wiIH0sXG4gICAgICAgICAgICAgICAgICAgIHsgaWNvbjogU2hpZWxkLCB0ZXh0OiBcIlNlZ3Vyb1wiIH0sXG4gICAgICAgICAgICAgICAgICBdLm1hcCgoaXRlbSwgaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8bW90aW9uLnNwYW5cbiAgICAgICAgICAgICAgICAgICAgICBrZXk9e2l0ZW0udGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDEwIH19XG4gICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC4zICsgaSAqIDAuMSB9fVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHB4LTMgcHktMS41IHJvdW5kZWQtZnVsbCBnbGFzcyB0ZXh0LXhzIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8aXRlbS5pY29uIGNsYXNzTmFtZT1cImgtMy41IHctMy41XCIgc3R5bGU9e2JyYW5kQ29sb3IgPyB7IGNvbG9yOiBicmFuZENvbG9yIH0gOiB1bmRlZmluZWR9IC8+XG4gICAgICAgICAgICAgICAgICAgICAge2l0ZW0udGV4dH1cbiAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uc3Bhbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uXG4gICAgICAgICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHNjYWxlOiAxLjAyIH19XG4gICAgICAgICAgICAgICAgICB3aGlsZVRhcD17eyBzY2FsZTogMC45OCB9fVxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U3RlcChcImZvcm1cIil9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B3LWZ1bGwgcHktMyByb3VuZGVkLWxnIGZvbnQtYm9sZCB0ZXh0LWxnIGhvdmVyOm9wYWNpdHktOTAgdHJhbnNpdGlvbi1vcGFjaXR5ICR7IWJyYW5kQ29sb3IgPyBcImJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgZ2xvdy1wcmltYXJ5XCIgOiBcIlwifWB9XG4gICAgICAgICAgICAgICAgICBzdHlsZT17YnRuU3R5bGV9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgRmF6ZXIgcmVjYXJnYSBhZ29yYVxuICAgICAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgey8qIEZvcm0gKi99XG4gICAgICAgICAgICB7c3RlcCA9PT0gXCJmb3JtXCIgJiYgKFxuICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgIGtleT1cImZvcm1cIlxuICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeDogNDAgfX1cbiAgICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHg6IDAgfX1cbiAgICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHg6IC00MCB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdsYXNzLW1vZGFsIHJvdW5kZWQteGwgcC02XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC1sZyBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZCBtYi00XCI+RGFkb3MgZGEgUmVjYXJnYTwvaDI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZCBtYi0xXCI+VGVsZWZvbmUgKjwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZWxcIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt0ZWxlZm9uZX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRUZWxlZm9uZShlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgbWF4TGVuZ3RoPXsxNX1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yLjUgcm91bmRlZC1sZyBnbGFzcy1pbnB1dCB0ZXh0LWZvcmVncm91bmQgcGxhY2Vob2xkZXI6dGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1yaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIigxMSkgOTk5OTktOTk5OVwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZCBtYi0xXCI+T3BlcmFkb3JhPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXtzZWxlY3RlZE9wfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IHsgc2V0U2VsZWN0ZWRPcChlLnRhcmdldC52YWx1ZSk7IHNldFNlbGVjdGVkVmFsb3IobnVsbCk7IH19XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTMgcHktMi41IHJvdW5kZWQtbGcgZ2xhc3MtaW5wdXQgdGV4dC1mb3JlZ3JvdW5kIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1yaW5nXCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5TZWxlY2lvbmUuLi48L29wdGlvbj5cbiAgICAgICAgICAgICAgICAgICAgICB7b3BlcmFkb3Jhcy5tYXAob3AgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e29wLmlkfSB2YWx1ZT17b3Aubm9tZX0+e29wLm5vbWV9PC9vcHRpb24+XG4gICAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7Y3VycmVudE9wICYmIGN1cnJlbnRPcC52YWxvcmVzLmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZCBtYi0yXCI+VmFsb3I8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMyBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2N1cnJlbnRPcC52YWxvcmVzLm1hcCgodiwgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkaXNwbGF5UHJpY2UgPSBnZXRQcmljZShjdXJyZW50T3AuaWQsIHYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNDdXN0b21QcmljZSA9IGRpc3BsYXlQcmljZSAhPT0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt2fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45IH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiBpICogMC4wNSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGVIb3Zlcj17eyBzY2FsZTogMS4wNSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2VsZWN0ZWRWYWxvcih2KX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHB5LTIuNSByb3VuZGVkLWxnIHRleHQtc20gZm9udC1ib2xkIGJvcmRlciB0cmFuc2l0aW9uLWFsbCAke1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZFZhbG9yID09PSB2XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAoIWJyYW5kQ29sb3IgPyBcImJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgYm9yZGVyLXByaW1hcnkgZ2xvdy1wcmltYXJ5XCIgOiBcInRleHQtd2hpdGVcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiYm9yZGVyLWJvcmRlciB0ZXh0LWZvcmVncm91bmQgaG92ZXI6YmctbXV0ZWQgZ2xhc3NcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17YnRuQWN0aXZlU3R5bGUoc2VsZWN0ZWRWYWxvciA9PT0gdil9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2ZtdChkaXNwbGF5UHJpY2UpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge2hhc0N1c3RvbVByaWNlICYmIDxzcGFuIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtWzEwcHhdIGZvbnQtbm9ybWFsIG9wYWNpdHktNzBcIj5SZWNhcmdhIHtmbXQodil9PC9zcGFuPn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KX1cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC0zIHB0LTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFN0ZXAoXCJsYW5kaW5nXCIpfVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBweS0yLjUgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWJvcmRlciB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbSBmb250LW1lZGl1bSBob3ZlcjpiZy1tdXRlZCB0cmFuc2l0aW9uLWNvbG9yc1wiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICBWb2x0YXJcbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgd2hpbGVIb3Zlcj17eyBzY2FsZTogMS4wMiB9fVxuICAgICAgICAgICAgICAgICAgICAgIHdoaWxlVGFwPXt7IHNjYWxlOiAwLjk4IH19XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCF0ZWxlZm9uZS50cmltKCkgfHwgIXNlbGVjdGVkVmFsb3IpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldFN0ZXAoXCJjb25maXJtXCIpO1xuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9eyF0ZWxlZm9uZS50cmltKCkgfHwgIXNlbGVjdGVkVmFsb3J9XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleC0xIHB5LTIuNSByb3VuZGVkLWxnIHRleHQtc20gZm9udC1ib2xkIGhvdmVyOm9wYWNpdHktOTAgZGlzYWJsZWQ6b3BhY2l0eS00MCB0cmFuc2l0aW9uLW9wYWNpdHkgJHshYnJhbmRDb2xvciA/IFwiYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBnbG93LXByaW1hcnlcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17YnRuU3R5bGV9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICBDb250aW51YXJcbiAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICAgICl9XG5cbiAgICAgICAgICAgIHsvKiBDb25maXJtICovfVxuICAgICAgICAgICAge3N0ZXAgPT09IFwiY29uZmlybVwiICYmIChcbiAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICBrZXk9XCJjb25maXJtXCJcbiAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHg6IDQwIH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB4OiAwIH19XG4gICAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCB4OiAtNDAgfX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJnbGFzcy1tb2RhbCByb3VuZGVkLXhsIHAtNlwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtbGcgZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmQgbWItNFwiPkNvbmZpcm1hciBSZWNhcmdhPC9oMj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMyBtYi02XCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIHB5LTIgYm9yZGVyLWIgYm9yZGVyLWJvcmRlclwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5UZWxlZm9uZTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1tb25vIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZFwiPnt0ZWxlZm9uZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIHtzZWxlY3RlZE9wICYmIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBweS0yIGJvcmRlci1iIGJvcmRlci1ib3JkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5PcGVyYWRvcmE8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kXCI+e3NlbGVjdGVkT3B9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIHB5LTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+VmFsb3IgZGEgUmVjYXJnYTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14bCBmb250LWJvbGRcIiBzdHlsZT17YnJhbmRDb2xvciA/IHsgY29sb3I6IGJyYW5kQ29sb3IgfSA6IHVuZGVmaW5lZH0+XG4gICAgICAgICAgICAgICAgICAgICAge3NlbGVjdGVkVmFsb3IgJiYgY3VycmVudE9wID8gZm10KGdldFByaWNlKGN1cnJlbnRPcC5pZCwgc2VsZWN0ZWRWYWxvcikpIDogc2VsZWN0ZWRWYWxvciA/IGZtdChzZWxlY3RlZFZhbG9yKSA6IFwi4oCUXCJ9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBnYXAtM1wiPlxuICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTdGVwKFwiZm9ybVwiKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIHB5LTIuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItYm9yZGVyIHRleHQtZm9yZWdyb3VuZCB0ZXh0LXNtIGZvbnQtbWVkaXVtIGhvdmVyOmJnLW11dGVkIHRyYW5zaXRpb24tY29sb3JzXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgVm9sdGFyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgc2NhbGU6IDEuMDIgfX1cbiAgICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTggfX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlU3VibWl0fVxuICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17c2VuZGluZ31cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleC0xIHB5LTIuNSByb3VuZGVkLWxnIHRleHQtc20gZm9udC1ib2xkIGhvdmVyOm9wYWNpdHktOTAgZGlzYWJsZWQ6b3BhY2l0eS01MCB0cmFuc2l0aW9uLW9wYWNpdHkgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgJHshYnJhbmRDb2xvciA/IFwiYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBnbG93LXByaW1hcnlcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgc3R5bGU9e2J0blN0eWxlfVxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7c2VuZGluZyA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdiBhbmltYXRlPXt7IHJvdGF0ZTogMzYwIH19IHRyYW5zaXRpb249e3sgcmVwZWF0OiBJbmZpbml0eSwgZHVyYXRpb246IDEsIGVhc2U6IFwibGluZWFyXCIgfX0gY2xhc3NOYW1lPVwiaC00IHctNCBib3JkZXItMiBib3JkZXItd2hpdGUgYm9yZGVyLXQtdHJhbnNwYXJlbnQgcm91bmRlZC1mdWxsXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgICAgICAgPFNlbmQgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IENvbmZpcm1hclxuICAgICAgICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uYnV0dG9uPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICApfVxuXG4gICAgICAgICAgICB7LyogRG9uZSAqL31cbiAgICAgICAgICAgIHtzdGVwID09PSBcImRvbmVcIiAmJiAoXG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAga2V5PVwiZG9uZVwiXG4gICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45IH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdsYXNzLW1vZGFsIHJvdW5kZWQteGwgcC04IHRleHQtY2VudGVyXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IHNjYWxlOiAwIH19XG4gICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IHNjYWxlOiAxIH19XG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAxNSwgZGVsYXk6IDAuMiB9fVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy0xNiBoLTE2IHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBteC1hdXRvIG1iLTRcIlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e2JyYW5kQ29sb3IgPyB7IGJhY2tncm91bmRDb2xvcjogYCR7YnJhbmRDb2xvcn0yMmAgfSA6IHVuZGVmaW5lZH1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7cmVzdWx0TXNnLmluY2x1ZGVzKFwic3VjZXNzb1wiKSA/IChcbiAgICAgICAgICAgICAgICAgICAgPFphcCBjbGFzc05hbWU9XCJoLTggdy04XCIgc3R5bGU9e2JyYW5kQ29sb3IgPyB7IGNvbG9yOiBicmFuZENvbG9yIH0gOiB1bmRlZmluZWR9IC8+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8U2hpZWxkIGNsYXNzTmFtZT1cImgtOCB3LTggdGV4dC13YXJuaW5nXCIgLz5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtZm9yZWdyb3VuZCBmb250LW1lZGl1bSBtYi02XCI+e3Jlc3VsdE1zZ308L3A+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4geyBzZXRTdGVwKFwibGFuZGluZ1wiKTsgc2V0VGVsZWZvbmUoXCJcIik7IHNldFNlbGVjdGVkT3AoXCJcIik7IHNldFNlbGVjdGVkVmFsb3IobnVsbCk7IH19XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2BweC02IHB5LTIuNSByb3VuZGVkLWxnIGZvbnQtbWVkaXVtIGhvdmVyOm9wYWNpdHktOTAgdHJhbnNpdGlvbi1vcGFjaXR5ICR7IWJyYW5kQ29sb3IgPyBcImJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmRcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgICAgIHN0eWxlPXtidG5TdHlsZX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICBOb3ZhIFJlY2FyZ2FcbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L0FuaW1hdGVkUGFnZT5cblxuICAgICAgey8qIEZsb2F0aW5nIGNvbnRhY3RzICovfVxuICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAge3JldmVuZGVkb3I/LnRlbGVncmFtX3VzZXJuYW1lICYmIChcbiAgICAgICAgICA8bW90aW9uLmFcbiAgICAgICAgICAgIGtleT1cInRlbGVncmFtXCJcbiAgICAgICAgICAgIGhyZWY9e3JldmVuZGVkb3IudGVsZWdyYW1fdXNlcm5hbWV9XG4gICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICBpbml0aWFsPXt7IHNjYWxlOiAwLCBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICBhbmltYXRlPXt7IHNjYWxlOiAxLCBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgICBleGl0PXt7IHNjYWxlOiAwLCBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjgsIHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwIH19XG4gICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHNjYWxlOiAxLjE1IH19XG4gICAgICAgICAgICB3aGlsZVRhcD17eyBzY2FsZTogMC45IH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJmaXhlZCBib3R0b20tMjQgcmlnaHQtNSB6LTQwIHctMTQgaC0xNCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgc2hhZG93LWxnXCJcbiAgICAgICAgICAgIHN0eWxlPXt7IGJhY2tncm91bmQ6IFwibGluZWFyLWdyYWRpZW50KDEzNWRlZywgIzAwODhjYywgIzAwNzdiNSlcIiB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxTZW5kIGNsYXNzTmFtZT1cImgtNiB3LTYgdGV4dC13aGl0ZVwiIC8+XG4gICAgICAgICAgPC9tb3Rpb24uYT5cbiAgICAgICAgKX1cbiAgICAgICAge3JldmVuZGVkb3I/LndoYXRzYXBwX251bWJlciAmJiAoXG4gICAgICAgICAgPG1vdGlvbi5hXG4gICAgICAgICAgICBrZXk9XCJ3aGF0c2FwcFwiXG4gICAgICAgICAgICBocmVmPXtyZXZlbmRlZG9yLndoYXRzYXBwX251bWJlcn1cbiAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCJcbiAgICAgICAgICAgIGluaXRpYWw9e3sgc2NhbGU6IDAsIG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgIGFuaW1hdGU9e3sgc2NhbGU6IDEsIG9wYWNpdHk6IDEgfX1cbiAgICAgICAgICAgIGV4aXQ9e3sgc2NhbGU6IDAsIG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDEsIHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwIH19XG4gICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHNjYWxlOiAxLjE1IH19XG4gICAgICAgICAgICB3aGlsZVRhcD17eyBzY2FsZTogMC45IH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJmaXhlZCBib3R0b20tNSByaWdodC01IHotNDAgdy0xNCBoLTE0IHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaGFkb3ctbGdcIlxuICAgICAgICAgICAgc3R5bGU9e3sgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMjVEMzY2LCAjMTI4QzdFKVwiIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgPE1lc3NhZ2VDaXJjbGUgY2xhc3NOYW1lPVwiaC02IHctNiB0ZXh0LXdoaXRlXCIgLz5cbiAgICAgICAgICA8L21vdGlvbi5hPlxuICAgICAgICApfVxuICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG4gICAgPC9kaXY+XG4gICk7XG59Il0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVN0YXRlIiwidXNlU2VhcmNoUGFyYW1zIiwidXNlUGFyYW1zIiwic3VwYWJhc2UiLCJUaGVtZVRvZ2dsZSIsIkFuaW1hdGVkUGFnZSIsIkFuaW1hdGVkQ2FyZCIsIm1vdGlvbiIsIkFuaW1hdGVQcmVzZW5jZSIsIlNtYXJ0cGhvbmUiLCJaYXAiLCJTaGllbGQiLCJTZW5kIiwiTWVzc2FnZUNpcmNsZSIsIlJlY2FyZ2FQdWJsaWNhIiwic2VhcmNoUGFyYW1zIiwic2x1ZyIsInJlZlBhcmFtIiwiZ2V0IiwicmV2ZW5kZWRvciIsInNldFJldmVuZGVkb3IiLCJvcGVyYWRvcmFzIiwic2V0T3BlcmFkb3JhcyIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiZXJyb3IiLCJzZXRFcnJvciIsInN0ZXAiLCJzZXRTdGVwIiwidGVsZWZvbmUiLCJzZXRUZWxlZm9uZSIsInNlbGVjdGVkT3AiLCJzZXRTZWxlY3RlZE9wIiwic2VsZWN0ZWRWYWxvciIsInNldFNlbGVjdGVkVmFsb3IiLCJzZW5kaW5nIiwic2V0U2VuZGluZyIsInJlc3VsdE1zZyIsInNldFJlc3VsdE1zZyIsInByaWNlTWFwIiwic2V0UHJpY2VNYXAiLCJsb2FkRGF0YSIsInJldmVuZGVkb3JJZCIsImRhdGEiLCJwcm9maWxlQnlTbHVnIiwiZnJvbSIsInNlbGVjdCIsImVxIiwibWF5YmVTaW5nbGUiLCJpZCIsInByb2ZpbGUiLCJyb2xlIiwib3BzIiwicmVzZWxsZXJQcmljaW5nIiwiZ2xvYmFsUHJpY2luZyIsIlByb21pc2UiLCJhbGwiLCJzaW5nbGUiLCJvcmRlciIsImFjdGl2ZSIsInBtIiwiZm9yRWFjaCIsInIiLCJwcmVjb0ZpbmFsIiwidGlwb19yZWdyYSIsIk51bWJlciIsInJlZ3JhX3ZhbG9yIiwidmFsb3JfcmVjYXJnYSIsIm9wZXJhZG9yYV9pZCIsIm1hcCIsIm8iLCJ2YWxvcmVzIiwiY3VycmVudE9wIiwiZmluZCIsIm5vbWUiLCJmbXQiLCJ2IiwidG9Mb2NhbGVTdHJpbmciLCJzdHlsZSIsImN1cnJlbmN5IiwiZ2V0UHJpY2UiLCJvcElkIiwiZmFjZVZhbHVlIiwiYnJhbmRDb2xvciIsInN0b3JlX3ByaW1hcnlfY29sb3IiLCJ1bmRlZmluZWQiLCJicmFuZEJnIiwic3RvcmVfc2Vjb25kYXJ5X2NvbG9yIiwiYnJhbmROYW1lIiwic3RvcmVfbmFtZSIsImJyYW5kTG9nbyIsInN0b3JlX2xvZ29fdXJsIiwiaGFuZGxlU3VibWl0IiwidHJpbSIsInNhbGRvRGF0YSIsInNhbGRvIiwidmFsb3IiLCJ3aGF0c2FwcF9udW1iZXIiLCJzZXRUaW1lb3V0Iiwid2luZG93Iiwib3BlbiIsInRlbGVncmFtX3VzZXJuYW1lIiwicmVjRXJyb3IiLCJpbnNlcnQiLCJ1c2VyX2lkIiwib3BlcmFkb3JhIiwiY3VzdG8iLCJzdGF0dXMiLCJuZXdTYWxkbyIsInVwZGF0ZSIsImZ1bmN0aW9ucyIsImludm9rZSIsImJvZHkiLCJ0eXBlIiwibm92b19zYWxkbyIsImNhdGNoIiwiZXJyIiwibWVzc2FnZSIsImRpdiIsImNsYXNzTmFtZSIsImFuaW1hdGUiLCJyb3RhdGUiLCJ0cmFuc2l0aW9uIiwicmVwZWF0IiwiSW5maW5pdHkiLCJkdXJhdGlvbiIsImVhc2UiLCJoMSIsInAiLCJjdXN0b21TdHlsZSIsImJhY2tncm91bmRDb2xvciIsImJ0blN0eWxlIiwiY29sb3IiLCJidG5BY3RpdmVTdHlsZSIsImJvcmRlckNvbG9yIiwiaW5pdGlhbCIsIm9wYWNpdHkiLCJ5IiwiZGVsYXkiLCJpbWciLCJzcmMiLCJhbHQiLCJpbmNsdWRlcyIsInNwbGl0Iiwic2xpY2UiLCJqb2luIiwic3BhbiIsIm1vZGUiLCJzY2FsZSIsImV4aXQiLCJoMiIsImljb24iLCJ0ZXh0IiwiaXRlbSIsImkiLCJidXR0b24iLCJ3aGlsZUhvdmVyIiwid2hpbGVUYXAiLCJvbkNsaWNrIiwieCIsImxhYmVsIiwiaW5wdXQiLCJ2YWx1ZSIsIm9uQ2hhbmdlIiwiZSIsInRhcmdldCIsIm1heExlbmd0aCIsInBsYWNlaG9sZGVyIiwib3B0aW9uIiwib3AiLCJsZW5ndGgiLCJkaXNwbGF5UHJpY2UiLCJoYXNDdXN0b21QcmljZSIsImRpc2FibGVkIiwic3RpZmZuZXNzIiwiZGFtcGluZyIsImEiLCJocmVmIiwicmVsIiwiYmFja2dyb3VuZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsU0FBUyxFQUFFQyxRQUFRLFFBQVEsUUFBUTtBQUM1QyxTQUFTQyxlQUFlLEVBQUVDLFNBQVMsUUFBUSxtQkFBbUI7QUFDOUQsU0FBU0MsUUFBUSxRQUFRLGlDQUFpQztBQUMxRCxTQUFTQyxXQUFXLFFBQVEsMkJBQTJCO0FBQ3ZELFNBQVNDLFlBQVksRUFBRUMsWUFBWSxRQUFRLDRCQUE0QjtBQUN2RSxTQUFTQyxNQUFNLEVBQUVDLGVBQWUsUUFBUSxnQkFBZ0I7QUFDeEQsU0FBU0MsVUFBVSxFQUFFQyxHQUFHLEVBQUVDLE1BQU0sRUFBRUMsSUFBSSxFQUFFQyxhQUFhLFFBQVEsZUFBZTtBQXdCNUUsZUFBZSxTQUFTQzs7SUFDdEIsTUFBTSxDQUFDQyxhQUFhLEdBQUdkO0lBQ3ZCLE1BQU0sRUFBRWUsSUFBSSxFQUFFLEdBQUdkO0lBQ2pCLE1BQU1lLFdBQVdGLGFBQWFHLEdBQUcsQ0FBQyxVQUFVSCxhQUFhRyxHQUFHLENBQUM7SUFFN0QsTUFBTSxDQUFDQyxZQUFZQyxjQUFjLEdBQUdwQixTQUFnQztJQUNwRSxNQUFNLENBQUNxQixZQUFZQyxjQUFjLEdBQUd0QixTQUFzQixFQUFFO0lBQzVELE1BQU0sQ0FBQ3VCLFNBQVNDLFdBQVcsR0FBR3hCLFNBQVM7SUFDdkMsTUFBTSxDQUFDeUIsT0FBT0MsU0FBUyxHQUFHMUIsU0FBd0I7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