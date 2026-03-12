import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/BroadcastForm.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/BroadcastForm.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useRef = __vite__cjsImport3_react["useRef"];
import { supabase } from "/src/integrations/supabase/client.ts";
import { styledToast as toast } from "/src/lib/toast.tsx";
import { Loader2, Send, Image, Plus, Trash2, Link, Upload, X, Sparkles, Tag, TrendingUp } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
const MESSAGE_EFFECTS = [
    {
        id: 'none',
        label: 'Sem efeito',
        emoji: '❌'
    },
    {
        id: '5046509860389126442',
        label: 'Confete',
        emoji: '🎉'
    },
    {
        id: '5159385139981059251',
        label: 'Corações',
        emoji: '❤️'
    },
    {
        id: '5107584321108051014',
        label: 'Joinha',
        emoji: '👍'
    },
    {
        id: '5104841245755180586',
        label: 'Fogo',
        emoji: '🔥'
    }
];
const TEMPLATES = [
    {
        key: 'promo',
        label: 'Promoção',
        emoji: '🏷️',
        color: 'bg-green-600/80',
        title: '🎉 Promoção Especial!',
        message: 'Aproveite 20% de desconto em todos os planos! Use o cupom PROMO20. Válido até domingo!'
    },
    {
        key: 'novidade',
        label: 'Novidade',
        emoji: '✨',
        color: 'bg-purple-600/80',
        title: '✨ Novidade!',
        message: 'Temos novidades incríveis para você! Confira as últimas atualizações.'
    },
    {
        key: 'aviso',
        label: 'Aviso',
        emoji: '🔔',
        color: 'bg-yellow-600/80',
        title: '⚠️ Aviso Importante',
        message: 'Atenção! Informamos que haverá uma manutenção programada.'
    },
    {
        key: 'comunicado',
        label: 'Comunicado',
        emoji: '📢',
        color: 'bg-blue-600/80',
        title: '📢 Comunicado Oficial',
        message: 'Comunicamos a todos os nossos clientes sobre as seguintes mudanças.'
    }
];
const BATCH_SIZE = 25;
export function BroadcastForm({ userCount, sending, onSubmit, onClose }) {
    _s();
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        image_url: null,
        buttons: [],
        message_effect_id: null
    });
    const [enableImage, setEnableImage] = useState(false);
    const [enableButtons, setEnableButtons] = useState(false);
    const [selectedEffect, setSelectedEffect] = useState('none');
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);
    const handleAddButton = ()=>{
        if (formData.buttons.length < 2) {
            setFormData({
                ...formData,
                buttons: [
                    ...formData.buttons,
                    {
                        text: '',
                        url: ''
                    }
                ]
            });
        }
    };
    const handleRemoveButton = (index)=>{
        setFormData({
            ...formData,
            buttons: formData.buttons.filter((_, i)=>i !== index)
        });
    };
    const handleTemplate = (tpl)=>{
        setFormData({
            ...formData,
            title: tpl.title,
            message: tpl.message
        });
    };
    const handleImageUpload = async (e)=>{
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
            toast.error('Imagem inválida ou maior que 5MB');
            return;
        }
        setUploadingImage(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Não autenticado');
            const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from('broadcast-images').upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('broadcast-images').getPublicUrl(fileName);
            setFormData({
                ...formData,
                image_url: publicUrl
            });
        } catch (error) {
            toast.error('Erro ao enviar imagem: ' + error.message);
        } finally{
            setUploadingImage(false);
        }
    };
    const handleSubmit = (e)=>{
        e.preventDefault();
        const validButtons = formData.buttons.filter((b)=>b.text.trim() && b.url.trim());
        onSubmit({
            ...formData,
            image_url: enableImage ? formData.image_url : null,
            buttons: enableButtons ? validButtons : [],
            message_effect_id: selectedEffect !== 'none' ? selectedEffect : null
        });
    };
    const totalBatches = Math.ceil(userCount / BATCH_SIZE);
    const estimatedSeconds = Math.ceil(userCount / BATCH_SIZE * 1.1);
    const speedPerSecond = BATCH_SIZE;
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "space-y-5",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ _jsxDEV("label", {
                        className: "flex items-center gap-2 text-sm font-medium text-muted-foreground",
                        children: [
                            /*#__PURE__*/ _jsxDEV(Tag, {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 110,
                                columnNumber: 11
                            }, this),
                            " Templates Prontos"
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 109,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "grid grid-cols-2 gap-2",
                        children: TEMPLATES.map((tpl)=>/*#__PURE__*/ _jsxDEV("button", {
                                type: "button",
                                onClick: ()=>handleTemplate(tpl),
                                className: `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-80 ${tpl.color}`,
                                children: [
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        children: tpl.emoji
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 120,
                                        columnNumber: 15
                                    }, this),
                                    " ",
                                    tpl.label
                                ]
                            }, tpl.key, true, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 114,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 112,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-xs text-muted-foreground text-center",
                        children: "Ou crie uma mensagem personalizada abaixo"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                lineNumber: 108,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("form", {
                onSubmit: handleSubmit,
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-1.5",
                        children: [
                            /*#__PURE__*/ _jsxDEV("label", {
                                className: "block text-sm font-medium text-foreground",
                                children: "Título da Notificação"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("input", {
                                value: formData.title,
                                onChange: (e)=>setFormData({
                                        ...formData,
                                        title: e.target.value
                                    }),
                                placeholder: "🎉 Promoção Especial!",
                                required: true,
                                className: "w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-1.5",
                        children: [
                            /*#__PURE__*/ _jsxDEV("label", {
                                className: "block text-sm font-medium text-foreground",
                                children: "Mensagem"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("textarea", {
                                value: formData.message,
                                onChange: (e)=>setFormData({
                                        ...formData,
                                        message: e.target.value
                                    }),
                                placeholder: "Aproveite 20% de desconto em todos os planos! Use o cupom PROMO20. Válido até domingo!",
                                rows: 4,
                                required: true,
                                className: "w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex flex-wrap gap-3",
                        children: [
                            /*#__PURE__*/ _jsxDEV("button", {
                                type: "button",
                                onClick: ()=>setEnableImage(!enableImage),
                                className: `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${enableImage ? 'bg-primary/20 text-primary border border-primary/30' : 'glass text-muted-foreground hover:text-foreground'}`,
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Image, {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 162,
                                        columnNumber: 13
                                    }, this),
                                    " Imagem"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 155,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("button", {
                                type: "button",
                                onClick: ()=>{
                                    setEnableButtons(!enableButtons);
                                    if (!enableButtons && formData.buttons.length === 0) handleAddButton();
                                },
                                className: `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${enableButtons ? 'bg-primary/20 text-primary border border-primary/30' : 'glass text-muted-foreground hover:text-foreground'}`,
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Link, {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 174,
                                        columnNumber: 13
                                    }, this),
                                    " Botões"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 164,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 154,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-1.5",
                        children: [
                            /*#__PURE__*/ _jsxDEV("label", {
                                className: "flex items-center gap-2 text-sm font-medium text-foreground",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Sparkles, {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 181,
                                        columnNumber: 13
                                    }, this),
                                    " Efeito Visual da Mensagem"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 180,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex flex-wrap gap-2",
                                children: MESSAGE_EFFECTS.map((effect)=>/*#__PURE__*/ _jsxDEV("button", {
                                        type: "button",
                                        onClick: ()=>setSelectedEffect(effect.id),
                                        className: `flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${selectedEffect === effect.id ? 'border-primary ring-2 ring-primary/30 bg-primary/10' : 'border-border/50 glass hover:border-border'}`,
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                children: effect.emoji
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 195,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-xs",
                                                children: effect.label
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 196,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, effect.id, true, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 185,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 183,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 179,
                        columnNumber: 9
                    }, this),
                    enableImage && /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-2 p-3 rounded-lg glass border border-border/50",
                        children: formData.image_url ? /*#__PURE__*/ _jsxDEV("div", {
                            className: "relative inline-block",
                            children: [
                                /*#__PURE__*/ _jsxDEV("img", {
                                    src: formData.image_url,
                                    alt: "Preview",
                                    className: "max-h-32 rounded-lg"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                    lineNumber: 207,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ _jsxDEV("button", {
                                    type: "button",
                                    onClick: ()=>setFormData({
                                            ...formData,
                                            image_url: null
                                        }),
                                    className: "absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full",
                                    children: /*#__PURE__*/ _jsxDEV(X, {
                                        className: "w-3 h-3"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 213,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                    lineNumber: 208,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/components/BroadcastForm.tsx",
                            lineNumber: 206,
                            columnNumber: 15
                        }, this) : /*#__PURE__*/ _jsxDEV("div", {
                            className: "flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ _jsxDEV("input", {
                                    ref: fileInputRef,
                                    type: "file",
                                    accept: "image/*",
                                    onChange: handleImageUpload,
                                    className: "hidden"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                    lineNumber: 218,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ _jsxDEV("button", {
                                    type: "button",
                                    onClick: ()=>fileInputRef.current?.click(),
                                    disabled: uploadingImage,
                                    className: "flex items-center gap-2 px-3 py-2 rounded-lg glass text-sm hover:bg-muted/50 transition-colors disabled:opacity-50",
                                    children: [
                                        uploadingImage ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                            className: "w-4 h-4 animate-spin"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                            lineNumber: 225,
                                            columnNumber: 37
                                        }, this) : /*#__PURE__*/ _jsxDEV(Upload, {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                            lineNumber: 225,
                                            columnNumber: 84
                                        }, this),
                                        uploadingImage ? 'Enviando...' : 'Escolher Imagem'
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                    lineNumber: 219,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ _jsxDEV("span", {
                                    className: "text-xs text-muted-foreground",
                                    children: "Máx. 5MB"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                    lineNumber: 228,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/components/BroadcastForm.tsx",
                            lineNumber: 217,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 204,
                        columnNumber: 11
                    }, this),
                    enableButtons && /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-3 p-3 rounded-lg glass border border-border/50",
                        children: [
                            formData.buttons.map((button, index)=>/*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex gap-2 items-start",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex-1 space-y-2",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("input", {
                                                    value: button.text,
                                                    onChange: (e)=>{
                                                        const nb = [
                                                            ...formData.buttons
                                                        ];
                                                        nb[index].text = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            buttons: nb
                                                        });
                                                    },
                                                    placeholder: "Texto do botão",
                                                    className: "w-full px-3 py-2 rounded-lg glass-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                    lineNumber: 240,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("input", {
                                                    value: button.url,
                                                    onChange: (e)=>{
                                                        const nb = [
                                                            ...formData.buttons
                                                        ];
                                                        nb[index].url = e.target.value;
                                                        setFormData({
                                                            ...formData,
                                                            buttons: nb
                                                        });
                                                    },
                                                    placeholder: "https://exemplo.com",
                                                    type: "url",
                                                    className: "w-full px-3 py-2 rounded-lg glass-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                            lineNumber: 239,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("button", {
                                            type: "button",
                                            onClick: ()=>handleRemoveButton(index),
                                            className: "p-2 text-muted-foreground hover:text-destructive transition-colors",
                                            children: /*#__PURE__*/ _jsxDEV(Trash2, {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 263,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                            lineNumber: 262,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, index, true, {
                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                    lineNumber: 238,
                                    columnNumber: 15
                                }, this)),
                            formData.buttons.length < 2 && /*#__PURE__*/ _jsxDEV("button", {
                                type: "button",
                                onClick: handleAddButton,
                                className: "w-full flex items-center justify-center gap-2 py-2 rounded-lg glass text-sm text-muted-foreground hover:text-foreground transition-colors",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Plus, {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 269,
                                        columnNumber: 17
                                    }, this),
                                    " Adicionar Botão"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 268,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 236,
                        columnNumber: 11
                    }, this),
                    (formData.title || formData.message) && /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-1.5",
                        children: [
                            /*#__PURE__*/ _jsxDEV("label", {
                                className: "text-sm font-medium text-muted-foreground",
                                children: "Prévia no Telegram:"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 278,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "p-4 rounded-xl bg-[#1a2332] border border-border/30",
                                children: [
                                    formData.image_url && enableImage && /*#__PURE__*/ _jsxDEV("img", {
                                        src: formData.image_url,
                                        alt: "",
                                        className: "w-full max-h-40 object-cover rounded-lg mb-3"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 281,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-sm font-bold text-white",
                                        children: [
                                            "📢 ",
                                            formData.title || 'Título'
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 283,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-sm text-gray-300 mt-1 whitespace-pre-wrap",
                                        children: formData.message || 'Sua mensagem aqui...'
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 284,
                                        columnNumber: 15
                                    }, this),
                                    enableButtons && formData.buttons.filter((b)=>b.text).length > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                        className: "mt-3 flex gap-2",
                                        children: formData.buttons.filter((b)=>b.text).map((b, i)=>/*#__PURE__*/ _jsxDEV("span", {
                                                className: "px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-medium",
                                                children: b.text
                                            }, i, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 288,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 286,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 279,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 277,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV("label", {
                                className: "flex items-center gap-2 text-sm font-medium text-muted-foreground",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(TrendingUp, {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 299,
                                        columnNumber: 13
                                    }, this),
                                    " Estimativa de envio"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 298,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "grid grid-cols-2 gap-x-6 gap-y-1 text-sm",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex justify-between",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-muted-foreground",
                                                children: "Destinatários:"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 303,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "font-bold text-primary",
                                                children: userCount
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 304,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 302,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex justify-between",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-muted-foreground",
                                                children: "Velocidade:"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 307,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "font-bold text-foreground",
                                                children: [
                                                    "~",
                                                    speedPerSecond,
                                                    " msg/s"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 308,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 306,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex justify-between",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-muted-foreground",
                                                children: "Tempo estimado:"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 311,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "font-bold text-foreground",
                                                children: [
                                                    "~",
                                                    estimatedSeconds,
                                                    "s"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 312,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 310,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex justify-between",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-muted-foreground",
                                                children: "Batches:"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 315,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "font-bold text-foreground",
                                                children: totalBatches
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                                lineNumber: 316,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                        lineNumber: 314,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                lineNumber: 301,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 297,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("button", {
                        type: "submit",
                        disabled: sending || !formData.title || !formData.message,
                        className: "w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 glow-primary text-sm",
                        children: sending ? /*#__PURE__*/ _jsxDEV(_Fragment, {
                            children: [
                                /*#__PURE__*/ _jsxDEV(Loader2, {
                                    className: "w-4 h-4 animate-spin"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                    lineNumber: 328,
                                    columnNumber: 15
                                }, this),
                                " Enviando..."
                            ]
                        }, void 0, true) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                            children: [
                                /*#__PURE__*/ _jsxDEV(Send, {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BroadcastForm.tsx",
                                    lineNumber: 330,
                                    columnNumber: 15
                                }, this),
                                " Enviar para ",
                                userCount,
                                " usuários"
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/BroadcastForm.tsx",
                        lineNumber: 322,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/BroadcastForm.tsx",
                lineNumber: 127,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/BroadcastForm.tsx",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
_s(BroadcastForm, "xYaBkLQSlDjmi4MpgnS/eewO+oI=");
_c = BroadcastForm;
var _c;
$RefreshReg$(_c, "BroadcastForm");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/BroadcastForm.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/BroadcastForm.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyb2FkY2FzdEZvcm0udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBzdXBhYmFzZSB9IGZyb20gJ0AvaW50ZWdyYXRpb25zL3N1cGFiYXNlL2NsaWVudCc7XG5pbXBvcnQgeyBzdHlsZWRUb2FzdCBhcyB0b2FzdCB9IGZyb20gXCJAL2xpYi90b2FzdFwiO1xuaW1wb3J0IHsgTG9hZGVyMiwgU2VuZCwgSW1hZ2UsIFBsdXMsIFRyYXNoMiwgTGluaywgVXBsb2FkLCBYLCBTcGFya2xlcywgVGFnLCBaYXAsIEJlbGwsIE1lZ2FwaG9uZSwgVHJlbmRpbmdVcCB9IGZyb20gJ2x1Y2lkZS1yZWFjdCc7XG5cbmludGVyZmFjZSBCcm9hZGNhc3RCdXR0b24ge1xuICB0ZXh0OiBzdHJpbmc7XG4gIHVybDogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgQnJvYWRjYXN0Rm9ybURhdGEge1xuICB0aXRsZTogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIGltYWdlX3VybDogc3RyaW5nIHwgbnVsbDtcbiAgYnV0dG9uczogQnJvYWRjYXN0QnV0dG9uW107XG4gIG1lc3NhZ2VfZWZmZWN0X2lkOiBzdHJpbmcgfCBudWxsO1xufVxuXG5pbnRlcmZhY2UgQnJvYWRjYXN0Rm9ybVByb3BzIHtcbiAgdXNlckNvdW50OiBudW1iZXI7XG4gIHNlbmRpbmc6IGJvb2xlYW47XG4gIG9uU3VibWl0OiAoZGF0YTogQnJvYWRjYXN0Rm9ybURhdGEpID0+IHZvaWQ7XG4gIG9uQ2xvc2U/OiAoKSA9PiB2b2lkO1xufVxuXG5jb25zdCBNRVNTQUdFX0VGRkVDVFMgPSBbXG4gIHsgaWQ6ICdub25lJywgbGFiZWw6ICdTZW0gZWZlaXRvJywgZW1vamk6ICfinYwnIH0sXG4gIHsgaWQ6ICc1MDQ2NTA5ODYwMzg5MTI2NDQyJywgbGFiZWw6ICdDb25mZXRlJywgZW1vamk6ICfwn46JJyB9LFxuICB7IGlkOiAnNTE1OTM4NTEzOTk4MTA1OTI1MScsIGxhYmVsOiAnQ29yYcOnw7VlcycsIGVtb2ppOiAn4p2k77iPJyB9LFxuICB7IGlkOiAnNTEwNzU4NDMyMTEwODA1MTAxNCcsIGxhYmVsOiAnSm9pbmhhJywgZW1vamk6ICfwn5GNJyB9LFxuICB7IGlkOiAnNTEwNDg0MTI0NTc1NTE4MDU4NicsIGxhYmVsOiAnRm9nbycsIGVtb2ppOiAn8J+UpScgfSxcbl07XG5cbmNvbnN0IFRFTVBMQVRFUyA9IFtcbiAgeyBrZXk6ICdwcm9tbycsIGxhYmVsOiAnUHJvbW/Dp8OjbycsIGVtb2ppOiAn8J+Pt++4jycsIGNvbG9yOiAnYmctZ3JlZW4tNjAwLzgwJywgdGl0bGU6ICfwn46JIFByb21vw6fDo28gRXNwZWNpYWwhJywgbWVzc2FnZTogJ0Fwcm92ZWl0ZSAyMCUgZGUgZGVzY29udG8gZW0gdG9kb3Mgb3MgcGxhbm9zISBVc2UgbyBjdXBvbSBQUk9NTzIwLiBWw6FsaWRvIGF0w6kgZG9taW5nbyEnIH0sXG4gIHsga2V5OiAnbm92aWRhZGUnLCBsYWJlbDogJ05vdmlkYWRlJywgZW1vamk6ICfinKgnLCBjb2xvcjogJ2JnLXB1cnBsZS02MDAvODAnLCB0aXRsZTogJ+KcqCBOb3ZpZGFkZSEnLCBtZXNzYWdlOiAnVGVtb3Mgbm92aWRhZGVzIGluY3LDrXZlaXMgcGFyYSB2b2PDqiEgQ29uZmlyYSBhcyDDumx0aW1hcyBhdHVhbGl6YcOnw7Vlcy4nIH0sXG4gIHsga2V5OiAnYXZpc28nLCBsYWJlbDogJ0F2aXNvJywgZW1vamk6ICfwn5SUJywgY29sb3I6ICdiZy15ZWxsb3ctNjAwLzgwJywgdGl0bGU6ICfimqDvuI8gQXZpc28gSW1wb3J0YW50ZScsIG1lc3NhZ2U6ICdBdGVuw6fDo28hIEluZm9ybWFtb3MgcXVlIGhhdmVyw6EgdW1hIG1hbnV0ZW7Dp8OjbyBwcm9ncmFtYWRhLicgfSxcbiAgeyBrZXk6ICdjb211bmljYWRvJywgbGFiZWw6ICdDb211bmljYWRvJywgZW1vamk6ICfwn5OiJywgY29sb3I6ICdiZy1ibHVlLTYwMC84MCcsIHRpdGxlOiAn8J+ToiBDb211bmljYWRvIE9maWNpYWwnLCBtZXNzYWdlOiAnQ29tdW5pY2Ftb3MgYSB0b2RvcyBvcyBub3Nzb3MgY2xpZW50ZXMgc29icmUgYXMgc2VndWludGVzIG11ZGFuw6dhcy4nIH0sXG5dO1xuXG5jb25zdCBCQVRDSF9TSVpFID0gMjU7XG5cbmV4cG9ydCBmdW5jdGlvbiBCcm9hZGNhc3RGb3JtKHsgdXNlckNvdW50LCBzZW5kaW5nLCBvblN1Ym1pdCwgb25DbG9zZSB9OiBCcm9hZGNhc3RGb3JtUHJvcHMpIHtcbiAgY29uc3QgW2Zvcm1EYXRhLCBzZXRGb3JtRGF0YV0gPSB1c2VTdGF0ZTxCcm9hZGNhc3RGb3JtRGF0YT4oe1xuICAgIHRpdGxlOiAnJywgbWVzc2FnZTogJycsIGltYWdlX3VybDogbnVsbCwgYnV0dG9uczogW10sIG1lc3NhZ2VfZWZmZWN0X2lkOiBudWxsLFxuICB9KTtcbiAgY29uc3QgW2VuYWJsZUltYWdlLCBzZXRFbmFibGVJbWFnZV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtlbmFibGVCdXR0b25zLCBzZXRFbmFibGVCdXR0b25zXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3NlbGVjdGVkRWZmZWN0LCBzZXRTZWxlY3RlZEVmZmVjdF0gPSB1c2VTdGF0ZSgnbm9uZScpO1xuICBjb25zdCBbdXBsb2FkaW5nSW1hZ2UsIHNldFVwbG9hZGluZ0ltYWdlXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgZmlsZUlucHV0UmVmID0gdXNlUmVmPEhUTUxJbnB1dEVsZW1lbnQ+KG51bGwpO1xuXG4gIGNvbnN0IGhhbmRsZUFkZEJ1dHRvbiA9ICgpID0+IHtcbiAgICBpZiAoZm9ybURhdGEuYnV0dG9ucy5sZW5ndGggPCAyKSB7XG4gICAgICBzZXRGb3JtRGF0YSh7IC4uLmZvcm1EYXRhLCBidXR0b25zOiBbLi4uZm9ybURhdGEuYnV0dG9ucywgeyB0ZXh0OiAnJywgdXJsOiAnJyB9XSB9KTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlUmVtb3ZlQnV0dG9uID0gKGluZGV4OiBudW1iZXIpID0+IHtcbiAgICBzZXRGb3JtRGF0YSh7IC4uLmZvcm1EYXRhLCBidXR0b25zOiBmb3JtRGF0YS5idXR0b25zLmZpbHRlcigoXywgaSkgPT4gaSAhPT0gaW5kZXgpIH0pO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVRlbXBsYXRlID0gKHRwbDogdHlwZW9mIFRFTVBMQVRFU1swXSkgPT4ge1xuICAgIHNldEZvcm1EYXRhKHsgLi4uZm9ybURhdGEsIHRpdGxlOiB0cGwudGl0bGUsIG1lc3NhZ2U6IHRwbC5tZXNzYWdlIH0pO1xuICB9O1xuXG4gIGNvbnN0IGhhbmRsZUltYWdlVXBsb2FkID0gYXN5bmMgKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XG4gICAgY29uc3QgZmlsZSA9IGUudGFyZ2V0LmZpbGVzPy5bMF07XG4gICAgaWYgKCFmaWxlKSByZXR1cm47XG4gICAgaWYgKCFmaWxlLnR5cGUuc3RhcnRzV2l0aCgnaW1hZ2UvJykgfHwgZmlsZS5zaXplID4gNSAqIDEwMjQgKiAxMDI0KSB7XG4gICAgICB0b2FzdC5lcnJvcignSW1hZ2VtIGludsOhbGlkYSBvdSBtYWlvciBxdWUgNU1CJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNldFVwbG9hZGluZ0ltYWdlKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGRhdGE6IHsgdXNlciB9IH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmdldFVzZXIoKTtcbiAgICAgIGlmICghdXNlcikgdGhyb3cgbmV3IEVycm9yKCdOw6NvIGF1dGVudGljYWRvJyk7XG4gICAgICBjb25zdCBmaWxlTmFtZSA9IGAke3VzZXIuaWR9LyR7RGF0ZS5ub3coKX0uJHtmaWxlLm5hbWUuc3BsaXQoJy4nKS5wb3AoKX1gO1xuICAgICAgY29uc3QgeyBlcnJvcjogdXBsb2FkRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLnN0b3JhZ2UuZnJvbSgnYnJvYWRjYXN0LWltYWdlcycpLnVwbG9hZChmaWxlTmFtZSwgZmlsZSk7XG4gICAgICBpZiAodXBsb2FkRXJyb3IpIHRocm93IHVwbG9hZEVycm9yO1xuICAgICAgY29uc3QgeyBkYXRhOiB7IHB1YmxpY1VybCB9IH0gPSBzdXBhYmFzZS5zdG9yYWdlLmZyb20oJ2Jyb2FkY2FzdC1pbWFnZXMnKS5nZXRQdWJsaWNVcmwoZmlsZU5hbWUpO1xuICAgICAgc2V0Rm9ybURhdGEoeyAuLi5mb3JtRGF0YSwgaW1hZ2VfdXJsOiBwdWJsaWNVcmwgfSk7XG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgdG9hc3QuZXJyb3IoJ0Vycm8gYW8gZW52aWFyIGltYWdlbTogJyArIGVycm9yLm1lc3NhZ2UpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRVcGxvYWRpbmdJbWFnZShmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IGhhbmRsZVN1Ym1pdCA9IChlOiBSZWFjdC5Gb3JtRXZlbnQpID0+IHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgY29uc3QgdmFsaWRCdXR0b25zID0gZm9ybURhdGEuYnV0dG9ucy5maWx0ZXIoYiA9PiBiLnRleHQudHJpbSgpICYmIGIudXJsLnRyaW0oKSk7XG4gICAgb25TdWJtaXQoe1xuICAgICAgLi4uZm9ybURhdGEsXG4gICAgICBpbWFnZV91cmw6IGVuYWJsZUltYWdlID8gZm9ybURhdGEuaW1hZ2VfdXJsIDogbnVsbCxcbiAgICAgIGJ1dHRvbnM6IGVuYWJsZUJ1dHRvbnMgPyB2YWxpZEJ1dHRvbnMgOiBbXSxcbiAgICAgIG1lc3NhZ2VfZWZmZWN0X2lkOiBzZWxlY3RlZEVmZmVjdCAhPT0gJ25vbmUnID8gc2VsZWN0ZWRFZmZlY3QgOiBudWxsLFxuICAgIH0pO1xuICB9O1xuXG4gIGNvbnN0IHRvdGFsQmF0Y2hlcyA9IE1hdGguY2VpbCh1c2VyQ291bnQgLyBCQVRDSF9TSVpFKTtcbiAgY29uc3QgZXN0aW1hdGVkU2Vjb25kcyA9IE1hdGguY2VpbCgodXNlckNvdW50IC8gQkFUQ0hfU0laRSkgKiAxLjEpO1xuICBjb25zdCBzcGVlZFBlclNlY29uZCA9IEJBVENIX1NJWkU7XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNVwiPlxuICAgICAgey8qIFRlbXBsYXRlcyAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgIDxUYWcgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+IFRlbXBsYXRlcyBQcm9udG9zXG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtMlwiPlxuICAgICAgICAgIHtURU1QTEFURVMubWFwKCh0cGwpID0+IChcbiAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAga2V5PXt0cGwua2V5fVxuICAgICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlVGVtcGxhdGUodHBsKX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtNCBweS0yLjUgcm91bmRlZC1sZyB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtd2hpdGUgdHJhbnNpdGlvbi1hbGwgaG92ZXI6b3BhY2l0eS04MCAke3RwbC5jb2xvcn1gfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8c3Bhbj57dHBsLmVtb2ppfTwvc3Bhbj4ge3RwbC5sYWJlbH1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICkpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQgdGV4dC1jZW50ZXJcIj5PdSBjcmllIHVtYSBtZW5zYWdlbSBwZXJzb25hbGl6YWRhIGFiYWl4bzwvcD5cbiAgICAgIDwvZGl2PlxuXG4gICAgICA8Zm9ybSBvblN1Ym1pdD17aGFuZGxlU3VibWl0fSBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgey8qIFRpdGxlICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMS41XCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kXCI+VMOtdHVsbyBkYSBOb3RpZmljYcOnw6NvPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS50aXRsZX1cbiAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0Rm9ybURhdGEoeyAuLi5mb3JtRGF0YSwgdGl0bGU6IGUudGFyZ2V0LnZhbHVlIH0pfVxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCLwn46JIFByb21vw6fDo28gRXNwZWNpYWwhXCJcbiAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yLjUgcm91bmRlZC1sZyBnbGFzcy1pbnB1dCB0ZXh0LWZvcmVncm91bmQgcGxhY2Vob2xkZXI6dGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1yaW5nXCJcbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7LyogTWVzc2FnZSAqL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTEuNVwiPlxuICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJibG9jayB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtZm9yZWdyb3VuZFwiPk1lbnNhZ2VtPC9sYWJlbD5cbiAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgIHZhbHVlPXtmb3JtRGF0YS5tZXNzYWdlfVxuICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRGb3JtRGF0YSh7IC4uLmZvcm1EYXRhLCBtZXNzYWdlOiBlLnRhcmdldC52YWx1ZSB9KX1cbiAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiQXByb3ZlaXRlIDIwJSBkZSBkZXNjb250byBlbSB0b2RvcyBvcyBwbGFub3MhIFVzZSBvIGN1cG9tIFBST01PMjAuIFbDoWxpZG8gYXTDqSBkb21pbmdvIVwiXG4gICAgICAgICAgICByb3dzPXs0fVxuICAgICAgICAgICAgcmVxdWlyZWRcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweC0zIHB5LTIuNSByb3VuZGVkLWxnIGdsYXNzLWlucHV0IHRleHQtZm9yZWdyb3VuZCBwbGFjZWhvbGRlcjp0ZXh0LW11dGVkLWZvcmVncm91bmQgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXJpbmcgcmVzaXplLXlcIlxuICAgICAgICAgIC8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsvKiBGZWF0dXJlIHRvZ2dsZXMgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXdyYXAgZ2FwLTNcIj5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICB0eXBlPVwiYnV0dG9uXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEVuYWJsZUltYWdlKCFlbmFibGVJbWFnZSl9XG4gICAgICAgICAgICBjbGFzc05hbWU9e2BmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweC0zIHB5LTIgcm91bmRlZC1sZyB0ZXh0LXNtIHRyYW5zaXRpb24tY29sb3JzICR7XG4gICAgICAgICAgICAgIGVuYWJsZUltYWdlID8gJ2JnLXByaW1hcnkvMjAgdGV4dC1wcmltYXJ5IGJvcmRlciBib3JkZXItcHJpbWFyeS8zMCcgOiAnZ2xhc3MgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOnRleHQtZm9yZWdyb3VuZCdcbiAgICAgICAgICAgIH1gfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxJbWFnZSBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz4gSW1hZ2VtXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgIHNldEVuYWJsZUJ1dHRvbnMoIWVuYWJsZUJ1dHRvbnMpO1xuICAgICAgICAgICAgICBpZiAoIWVuYWJsZUJ1dHRvbnMgJiYgZm9ybURhdGEuYnV0dG9ucy5sZW5ndGggPT09IDApIGhhbmRsZUFkZEJ1dHRvbigpO1xuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB4LTMgcHktMiByb3VuZGVkLWxnIHRleHQtc20gdHJhbnNpdGlvbi1jb2xvcnMgJHtcbiAgICAgICAgICAgICAgZW5hYmxlQnV0dG9ucyA/ICdiZy1wcmltYXJ5LzIwIHRleHQtcHJpbWFyeSBib3JkZXIgYm9yZGVyLXByaW1hcnkvMzAnIDogJ2dsYXNzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3Zlcjp0ZXh0LWZvcmVncm91bmQnXG4gICAgICAgICAgICB9YH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICA8TGluayBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz4gQm90w7Vlc1xuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7LyogTWVzc2FnZSBFZmZlY3RzICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMS41XCI+XG4gICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICA8U3BhcmtsZXMgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+IEVmZWl0byBWaXN1YWwgZGEgTWVuc2FnZW1cbiAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LXdyYXAgZ2FwLTJcIj5cbiAgICAgICAgICAgIHtNRVNTQUdFX0VGRkVDVFMubWFwKChlZmZlY3QpID0+IChcbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIGtleT17ZWZmZWN0LmlkfVxuICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNlbGVjdGVkRWZmZWN0KGVmZmVjdC5pZCl9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtMyBweS0yIHJvdW5kZWQtbGcgYm9yZGVyIHRleHQtc20gdHJhbnNpdGlvbi1hbGwgJHtcbiAgICAgICAgICAgICAgICAgIHNlbGVjdGVkRWZmZWN0ID09PSBlZmZlY3QuaWRcbiAgICAgICAgICAgICAgICAgICAgPyAnYm9yZGVyLXByaW1hcnkgcmluZy0yIHJpbmctcHJpbWFyeS8zMCBiZy1wcmltYXJ5LzEwJ1xuICAgICAgICAgICAgICAgICAgICA6ICdib3JkZXItYm9yZGVyLzUwIGdsYXNzIGhvdmVyOmJvcmRlci1ib3JkZXInXG4gICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3Bhbj57ZWZmZWN0LmVtb2ppfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzXCI+e2VmZmVjdC5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsvKiBJbWFnZSB1cGxvYWQgKi99XG4gICAgICAgIHtlbmFibGVJbWFnZSAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTIgcC0zIHJvdW5kZWQtbGcgZ2xhc3MgYm9yZGVyIGJvcmRlci1ib3JkZXIvNTBcIj5cbiAgICAgICAgICAgIHtmb3JtRGF0YS5pbWFnZV91cmwgPyAoXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgaW5saW5lLWJsb2NrXCI+XG4gICAgICAgICAgICAgICAgPGltZyBzcmM9e2Zvcm1EYXRhLmltYWdlX3VybH0gYWx0PVwiUHJldmlld1wiIGNsYXNzTmFtZT1cIm1heC1oLTMyIHJvdW5kZWQtbGdcIiAvPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJidXR0b25cIlxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0Rm9ybURhdGEoeyAuLi5mb3JtRGF0YSwgaW1hZ2VfdXJsOiBudWxsIH0pfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgLXRvcC0yIC1yaWdodC0yIHAtMSBiZy1kZXN0cnVjdGl2ZSB0ZXh0LWRlc3RydWN0aXZlLWZvcmVncm91bmQgcm91bmRlZC1mdWxsXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8WCBjbGFzc05hbWU9XCJ3LTMgaC0zXCIgLz5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgPGlucHV0IHJlZj17ZmlsZUlucHV0UmVmfSB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiBvbkNoYW5nZT17aGFuZGxlSW1hZ2VVcGxvYWR9IGNsYXNzTmFtZT1cImhpZGRlblwiIC8+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBmaWxlSW5wdXRSZWYuY3VycmVudD8uY2xpY2soKX1cbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXt1cGxvYWRpbmdJbWFnZX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB4LTMgcHktMiByb3VuZGVkLWxnIGdsYXNzIHRleHQtc20gaG92ZXI6YmctbXV0ZWQvNTAgdHJhbnNpdGlvbi1jb2xvcnMgZGlzYWJsZWQ6b3BhY2l0eS01MFwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3VwbG9hZGluZ0ltYWdlID8gPExvYWRlcjIgY2xhc3NOYW1lPVwidy00IGgtNCBhbmltYXRlLXNwaW5cIiAvPiA6IDxVcGxvYWQgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+fVxuICAgICAgICAgICAgICAgICAge3VwbG9hZGluZ0ltYWdlID8gJ0VudmlhbmRvLi4uJyA6ICdFc2NvbGhlciBJbWFnZW0nfVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+TcOheC4gNU1CPC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIEJ1dHRvbnMgKi99XG4gICAgICAgIHtlbmFibGVCdXR0b25zICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMyBwLTMgcm91bmRlZC1sZyBnbGFzcyBib3JkZXIgYm9yZGVyLWJvcmRlci81MFwiPlxuICAgICAgICAgICAge2Zvcm1EYXRhLmJ1dHRvbnMubWFwKChidXR0b24sIGluZGV4KSA9PiAoXG4gICAgICAgICAgICAgIDxkaXYga2V5PXtpbmRleH0gY2xhc3NOYW1lPVwiZmxleCBnYXAtMiBpdGVtcy1zdGFydFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xIHNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtidXR0b24udGV4dH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmIgPSBbLi4uZm9ybURhdGEuYnV0dG9uc107XG4gICAgICAgICAgICAgICAgICAgICAgbmJbaW5kZXhdLnRleHQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICBzZXRGb3JtRGF0YSh7IC4uLmZvcm1EYXRhLCBidXR0b25zOiBuYiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJUZXh0byBkbyBib3TDo29cIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yIHJvdW5kZWQtbGcgZ2xhc3MtaW5wdXQgdGV4dC1mb3JlZ3JvdW5kIHRleHQtc20gcGxhY2Vob2xkZXI6dGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGZvY3VzOm91dGxpbmUtbm9uZSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1yaW5nXCJcbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2J1dHRvbi51cmx9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5iID0gWy4uLmZvcm1EYXRhLmJ1dHRvbnNdO1xuICAgICAgICAgICAgICAgICAgICAgIG5iW2luZGV4XS51cmwgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICBzZXRGb3JtRGF0YSh7IC4uLmZvcm1EYXRhLCBidXR0b25zOiBuYiB9KTtcbiAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJodHRwczovL2V4ZW1wbG8uY29tXCJcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInVybFwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweC0zIHB5LTIgcm91bmRlZC1sZyBnbGFzcy1pbnB1dCB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbSBwbGFjZWhvbGRlcjp0ZXh0LW11dGVkLWZvcmVncm91bmQgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXJpbmdcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBoYW5kbGVSZW1vdmVCdXR0b24oaW5kZXgpfSBjbGFzc05hbWU9XCJwLTIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOnRleHQtZGVzdHJ1Y3RpdmUgdHJhbnNpdGlvbi1jb2xvcnNcIj5cbiAgICAgICAgICAgICAgICAgIDxUcmFzaDIgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICB7Zm9ybURhdGEuYnV0dG9ucy5sZW5ndGggPCAyICYmIChcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17aGFuZGxlQWRkQnV0dG9ufSBjbGFzc05hbWU9XCJ3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgcHktMiByb3VuZGVkLWxnIGdsYXNzIHRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOnRleHQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgICAgIDxQbHVzIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPiBBZGljaW9uYXIgQm90w6NvXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgICB7LyogUHJldmlldyAqL31cbiAgICAgICAgeyhmb3JtRGF0YS50aXRsZSB8fCBmb3JtRGF0YS5tZXNzYWdlKSAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTEuNVwiPlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+UHLDqXZpYSBubyBUZWxlZ3JhbTo8L2xhYmVsPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTQgcm91bmRlZC14bCBiZy1bIzFhMjMzMl0gYm9yZGVyIGJvcmRlci1ib3JkZXIvMzBcIj5cbiAgICAgICAgICAgICAge2Zvcm1EYXRhLmltYWdlX3VybCAmJiBlbmFibGVJbWFnZSAmJiAoXG4gICAgICAgICAgICAgICAgPGltZyBzcmM9e2Zvcm1EYXRhLmltYWdlX3VybH0gYWx0PVwiXCIgY2xhc3NOYW1lPVwidy1mdWxsIG1heC1oLTQwIG9iamVjdC1jb3ZlciByb3VuZGVkLWxnIG1iLTNcIiAvPlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXdoaXRlXCI+8J+ToiB7Zm9ybURhdGEudGl0bGUgfHwgJ1TDrXR1bG8nfTwvcD5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LWdyYXktMzAwIG10LTEgd2hpdGVzcGFjZS1wcmUtd3JhcFwiPntmb3JtRGF0YS5tZXNzYWdlIHx8ICdTdWEgbWVuc2FnZW0gYXF1aS4uLid9PC9wPlxuICAgICAgICAgICAgICB7ZW5hYmxlQnV0dG9ucyAmJiBmb3JtRGF0YS5idXR0b25zLmZpbHRlcihiID0+IGIudGV4dCkubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC0zIGZsZXggZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgIHtmb3JtRGF0YS5idXR0b25zLmZpbHRlcihiID0+IGIudGV4dCkubWFwKChiLCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGtleT17aX0gY2xhc3NOYW1lPVwicHgtMyBweS0xLjUgcm91bmRlZC1sZyBiZy1ibHVlLTUwMC8yMCB0ZXh0LWJsdWUtNDAwIHRleHQteHMgZm9udC1tZWRpdW1cIj57Yi50ZXh0fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIEVzdGltYXRlcyAqL31cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTJcIj5cbiAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgIDxUcmVuZGluZ1VwIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPiBFc3RpbWF0aXZhIGRlIGVudmlvXG4gICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTIgZ2FwLXgtNiBnYXAteS0xIHRleHQtc21cIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+RGVzdGluYXTDoXJpb3M6PC9zcGFuPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1wcmltYXJ5XCI+e3VzZXJDb3VudH08L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+VmVsb2NpZGFkZTo8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj5+e3NwZWVkUGVyU2Vjb25kfSBtc2cvczwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5UZW1wbyBlc3RpbWFkbzo8L3NwYW4+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj5+e2VzdGltYXRlZFNlY29uZHN9czwvc3Bhbj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5CYXRjaGVzOjwvc3Bhbj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPnt0b3RhbEJhdGNoZXN9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsvKiBTdWJtaXQgKi99XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICB0eXBlPVwic3VibWl0XCJcbiAgICAgICAgICBkaXNhYmxlZD17c2VuZGluZyB8fCAhZm9ybURhdGEudGl0bGUgfHwgIWZvcm1EYXRhLm1lc3NhZ2V9XG4gICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB5LTMgcm91bmRlZC14bCBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGZvbnQtc2VtaWJvbGQgaG92ZXI6b3BhY2l0eS05MCB0cmFuc2l0aW9uLW9wYWNpdHkgZGlzYWJsZWQ6b3BhY2l0eS01MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBnbG93LXByaW1hcnkgdGV4dC1zbVwiXG4gICAgICAgID5cbiAgICAgICAgICB7c2VuZGluZyA/IChcbiAgICAgICAgICAgIDw+PExvYWRlcjIgY2xhc3NOYW1lPVwidy00IGgtNCBhbmltYXRlLXNwaW5cIiAvPiBFbnZpYW5kby4uLjwvPlxuICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICA8PjxTZW5kIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPiBFbnZpYXIgcGFyYSB7dXNlckNvdW50fSB1c3XDoXJpb3M8Lz5cbiAgICAgICAgICApfVxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VTdGF0ZSIsInVzZVJlZiIsInN1cGFiYXNlIiwic3R5bGVkVG9hc3QiLCJ0b2FzdCIsIkxvYWRlcjIiLCJTZW5kIiwiSW1hZ2UiLCJQbHVzIiwiVHJhc2gyIiwiTGluayIsIlVwbG9hZCIsIlgiLCJTcGFya2xlcyIsIlRhZyIsIlRyZW5kaW5nVXAiLCJNRVNTQUdFX0VGRkVDVFMiLCJpZCIsImxhYmVsIiwiZW1vamkiLCJURU1QTEFURVMiLCJrZXkiLCJjb2xvciIsInRpdGxlIiwibWVzc2FnZSIsIkJBVENIX1NJWkUiLCJCcm9hZGNhc3RGb3JtIiwidXNlckNvdW50Iiwic2VuZGluZyIsIm9uU3VibWl0Iiwib25DbG9zZSIsImZvcm1EYXRhIiwic2V0Rm9ybURhdGEiLCJpbWFnZV91cmwiLCJidXR0b25zIiwibWVzc2FnZV9lZmZlY3RfaWQiLCJlbmFibGVJbWFnZSIsInNldEVuYWJsZUltYWdlIiwiZW5hYmxlQnV0dG9ucyIsInNldEVuYWJsZUJ1dHRvbnMiLCJzZWxlY3RlZEVmZmVjdCIsInNldFNlbGVjdGVkRWZmZWN0IiwidXBsb2FkaW5nSW1hZ2UiLCJzZXRVcGxvYWRpbmdJbWFnZSIsImZpbGVJbnB1dFJlZiIsImhhbmRsZUFkZEJ1dHRvbiIsImxlbmd0aCIsInRleHQiLCJ1cmwiLCJoYW5kbGVSZW1vdmVCdXR0b24iLCJpbmRleCIsImZpbHRlciIsIl8iLCJpIiwiaGFuZGxlVGVtcGxhdGUiLCJ0cGwiLCJoYW5kbGVJbWFnZVVwbG9hZCIsImUiLCJmaWxlIiwidGFyZ2V0IiwiZmlsZXMiLCJ0eXBlIiwic3RhcnRzV2l0aCIsInNpemUiLCJlcnJvciIsImRhdGEiLCJ1c2VyIiwiYXV0aCIsImdldFVzZXIiLCJFcnJvciIsImZpbGVOYW1lIiwiRGF0ZSIsIm5vdyIsIm5hbWUiLCJzcGxpdCIsInBvcCIsInVwbG9hZEVycm9yIiwic3RvcmFnZSIsImZyb20iLCJ1cGxvYWQiLCJwdWJsaWNVcmwiLCJnZXRQdWJsaWNVcmwiLCJoYW5kbGVTdWJtaXQiLCJwcmV2ZW50RGVmYXVsdCIsInZhbGlkQnV0dG9ucyIsImIiLCJ0cmltIiwidG90YWxCYXRjaGVzIiwiTWF0aCIsImNlaWwiLCJlc3RpbWF0ZWRTZWNvbmRzIiwic3BlZWRQZXJTZWNvbmQiLCJkaXYiLCJjbGFzc05hbWUiLCJtYXAiLCJidXR0b24iLCJvbkNsaWNrIiwic3BhbiIsInAiLCJmb3JtIiwiaW5wdXQiLCJ2YWx1ZSIsIm9uQ2hhbmdlIiwicGxhY2Vob2xkZXIiLCJyZXF1aXJlZCIsInRleHRhcmVhIiwicm93cyIsImVmZmVjdCIsImltZyIsInNyYyIsImFsdCIsInJlZiIsImFjY2VwdCIs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