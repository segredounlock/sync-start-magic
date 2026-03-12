import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/AuditTab.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/AuditTab.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"]; const useCallback = __vite__cjsImport3_react["useCallback"];
import { supabase } from "/src/integrations/supabase/client.ts";
import { motion } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { Search, Filter, Calendar, User, RefreshCw, ChevronDown, Shield } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { formatDateTimeBR } from "/src/lib/timezone.ts";
const ACTION_LABELS = {
    block_room: {
        label: "Bloquear Sala",
        color: "bg-red-500/20 text-red-400"
    },
    unblock_room: {
        label: "Desbloquear Sala",
        color: "bg-green-500/20 text-green-400"
    },
    set_privacy: {
        label: "Alterar Privacidade",
        color: "bg-blue-500/20 text-blue-400"
    },
    set_saldo: {
        label: "Definir Saldo",
        color: "bg-yellow-500/20 text-yellow-400"
    },
    add_saldo: {
        label: "Adicionar Saldo",
        color: "bg-green-500/20 text-green-400"
    },
    remove_saldo: {
        label: "Remover Saldo",
        color: "bg-red-500/20 text-red-400"
    },
    set_badge: {
        label: "Atribuir Badge",
        color: "bg-purple-500/20 text-purple-400"
    },
    remove_badge: {
        label: "Remover Badge",
        color: "bg-orange-500/20 text-orange-400"
    },
    remove_role: {
        label: "Remover Cargo",
        color: "bg-red-500/20 text-red-400"
    },
    add_role: {
        label: "Adicionar Cargo",
        color: "bg-green-500/20 text-green-400"
    },
    create_user: {
        label: "Criar Usuário",
        color: "bg-blue-500/20 text-blue-400"
    },
    delete_user: {
        label: "Deletar Usuário",
        color: "bg-red-500/20 text-red-400"
    },
    toggle_role: {
        label: "Alterar Cargo",
        color: "bg-yellow-500/20 text-yellow-400"
    }
};
const TARGET_LABELS = {
    chat_room: "Sala de Chat",
    user: "Usuário",
    saldo: "Saldo",
    profile: "Perfil",
    role: "Cargo"
};
const PER_PAGE = 20;
export default function AuditTab() {
    _s();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [actionFilter, setActionFilter] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [adminFilter, setAdminFilter] = useState("");
    const [admins, setAdmins] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const fetchLogs = useCallback(async (resetPage = true)=>{
        setLoading(true);
        const currentPage = resetPage ? 1 : page;
        if (resetPage) setPage(1);
        try {
            let query = supabase.from("audit_logs").select("*").order("created_at", {
                ascending: false
            }).range((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE - 1);
            if (actionFilter) query = query.eq("action", actionFilter);
            if (adminFilter) query = query.eq("admin_id", adminFilter);
            if (dateFrom) query = query.gte("created_at", new Date(dateFrom).toISOString());
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                query = query.lte("created_at", endDate.toISOString());
            }
            if (search) query = query.or(`target_id.ilike.%${search}%,action.ilike.%${search}%`);
            const { data, error } = await query;
            if (error) throw error;
            const rows = data || [];
            // Fetch admin names
            const adminIds = [
                ...new Set(rows.map((r)=>r.admin_id))
            ];
            if (adminIds.length > 0) {
                const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", adminIds);
                const profileMap = new Map((profiles || []).map((p)=>[
                        p.id,
                        p
                    ]));
                rows.forEach((r)=>{
                    const p = profileMap.get(r.admin_id);
                    if (p) {
                        r.admin_nome = p.nome;
                        r.admin_email = p.email;
                    }
                });
            }
            setLogs(rows);
            setHasMore(rows.length >= PER_PAGE);
        } catch (err) {
            console.error("Erro ao buscar logs:", err);
        } finally{
            setLoading(false);
        }
    }, [
        actionFilter,
        adminFilter,
        dateFrom,
        dateTo,
        search,
        page
    ]);
    const fetchAdmins = useCallback(async ()=>{
        const { data } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
        if (data && data.length > 0) {
            const ids = data.map((d)=>d.user_id);
            const { data: profiles } = await supabase.from("profiles").select("id, nome, email").in("id", ids);
            setAdmins(profiles || []);
        }
    }, []);
    useEffect(()=>{
        fetchLogs(true);
    }, [
        actionFilter,
        adminFilter,
        dateFrom,
        dateTo
    ]);
    useEffect(()=>{
        fetchAdmins();
    }, [
        fetchAdmins
    ]);
    const handleSearch = ()=>fetchLogs(true);
    const loadMore = ()=>{
        setPage((p)=>p + 1);
    };
    useEffect(()=>{
        if (page > 1) fetchLogs(false);
    }, [
        page
    ]);
    const actionLabel = (action)=>ACTION_LABELS[action] || {
            label: action,
            color: "bg-muted text-muted-foreground"
        };
    const targetLabel = (t)=>TARGET_LABELS[t] || t;
    const uniqueActions = [
        ...new Set(logs.map((l)=>l.action))
    ];
    const allActions = Object.keys(ACTION_LABELS);
    return /*#__PURE__*/ _jsxDEV(motion.div, {
        initial: {
            opacity: 0,
            y: 16
        },
        animate: {
            opacity: 1,
            y: 0
        },
        className: "space-y-4",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex items-center justify-between",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV(Shield, {
                                className: "w-5 h-5 text-primary"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 147,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("h2", {
                                className: "text-lg font-bold text-foreground",
                                children: "Log de Auditoria"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("button", {
                        onClick: ()=>fetchLogs(true),
                        className: "p-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors",
                        title: "Atualizar",
                        children: /*#__PURE__*/ _jsxDEV(RefreshCw, {
                            className: `w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`
                        }, void 0, false, {
                            fileName: "/dev-server/src/components/AuditTab.tsx",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/AuditTab.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex gap-2",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "relative flex-1",
                        children: [
                            /*#__PURE__*/ _jsxDEV(Search, {
                                className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 158,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("input", {
                                type: "text",
                                placeholder: "Buscar por ação ou ID...",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                onKeyDown: (e)=>e.key === "Enter" && handleSearch(),
                                className: "w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 159,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("button", {
                        onClick: ()=>setShowFilters(!showFilters),
                        className: `px-3 py-2.5 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-colors ${showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:bg-muted"}`,
                        children: [
                            /*#__PURE__*/ _jsxDEV(Filter, {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 172,
                                columnNumber: 11
                            }, this),
                            "Filtros",
                            /*#__PURE__*/ _jsxDEV(ChevronDown, {
                                className: `w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 174,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 168,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/AuditTab.tsx",
                lineNumber: 156,
                columnNumber: 7
            }, this),
            showFilters && /*#__PURE__*/ _jsxDEV(motion.div, {
                initial: {
                    opacity: 0,
                    height: 0
                },
                animate: {
                    opacity: 1,
                    height: "auto"
                },
                className: "grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-card border border-border",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        children: [
                            /*#__PURE__*/ _jsxDEV("label", {
                                className: "text-xs text-muted-foreground mb-1 block flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Filter, {
                                        className: "w-3 h-3"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 182,
                                        columnNumber: 97
                                    }, this),
                                    " Ação"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 182,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("select", {
                                value: actionFilter,
                                onChange: (e)=>setActionFilter(e.target.value),
                                className: "w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("option", {
                                        value: "",
                                        children: "Todas"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 188,
                                        columnNumber: 15
                                    }, this),
                                    allActions.map((a)=>/*#__PURE__*/ _jsxDEV("option", {
                                            value: a,
                                            children: ACTION_LABELS[a]?.label || a
                                        }, a, false, {
                                            fileName: "/dev-server/src/components/AuditTab.tsx",
                                            lineNumber: 190,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 183,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 181,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        children: [
                            /*#__PURE__*/ _jsxDEV("label", {
                                className: "text-xs text-muted-foreground mb-1 block flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(User, {
                                        className: "w-3 h-3"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 195,
                                        columnNumber: 97
                                    }, this),
                                    " Administrador"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 195,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("select", {
                                value: adminFilter,
                                onChange: (e)=>setAdminFilter(e.target.value),
                                className: "w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("option", {
                                        value: "",
                                        children: "Todos"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 201,
                                        columnNumber: 15
                                    }, this),
                                    admins.map((a)=>/*#__PURE__*/ _jsxDEV("option", {
                                            value: a.id,
                                            children: a.nome || a.email || a.id.slice(0, 8)
                                        }, a.id, false, {
                                            fileName: "/dev-server/src/components/AuditTab.tsx",
                                            lineNumber: 203,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 196,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 194,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "grid grid-cols-2 gap-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                children: [
                                    /*#__PURE__*/ _jsxDEV("label", {
                                        className: "text-xs text-muted-foreground mb-1 block flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(Calendar, {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                                lineNumber: 209,
                                                columnNumber: 99
                                            }, this),
                                            " De"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 209,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("input", {
                                        type: "date",
                                        value: dateFrom,
                                        onChange: (e)=>setDateFrom(e.target.value),
                                        className: "w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 210,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 208,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                children: [
                                    /*#__PURE__*/ _jsxDEV("label", {
                                        className: "text-xs text-muted-foreground mb-1 block flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(Calendar, {
                                                className: "w-3 h-3"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                                lineNumber: 218,
                                                columnNumber: 99
                                            }, this),
                                            " Até"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 218,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("input", {
                                        type: "date",
                                        value: dateTo,
                                        onChange: (e)=>setDateTo(e.target.value),
                                        className: "w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 219,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 217,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 207,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/AuditTab.tsx",
                lineNumber: 180,
                columnNumber: 9
            }, this),
            loading && logs.length === 0 ? /*#__PURE__*/ _jsxDEV("div", {
                className: "space-y-3",
                children: [
                    ...Array(5)
                ].map((_, i)=>/*#__PURE__*/ _jsxDEV("div", {
                        className: "h-20 rounded-xl bg-card border border-border animate-pulse"
                    }, i, false, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 234,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "/dev-server/src/components/AuditTab.tsx",
                lineNumber: 232,
                columnNumber: 9
            }, this) : logs.length === 0 ? /*#__PURE__*/ _jsxDEV("div", {
                className: "text-center py-12 text-muted-foreground",
                children: [
                    /*#__PURE__*/ _jsxDEV(Shield, {
                        className: "w-12 h-12 mx-auto mb-3 opacity-30"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 239,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-sm",
                        children: "Nenhum registro de auditoria encontrado."
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 240,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/AuditTab.tsx",
                lineNumber: 238,
                columnNumber: 9
            }, this) : /*#__PURE__*/ _jsxDEV("div", {
                className: "space-y-2",
                children: [
                    logs.map((log)=>{
                        const al = actionLabel(log.action);
                        return /*#__PURE__*/ _jsxDEV(motion.div, {
                            initial: {
                                opacity: 0,
                                x: -8
                            },
                            animate: {
                                opacity: 1,
                                x: 0
                            },
                            className: "p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors",
                            children: /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-start justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex-1 min-w-0",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-2 flex-wrap mb-1",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: `px-2 py-0.5 rounded-full text-xs font-medium ${al.color}`,
                                                        children: al.label
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                                        lineNumber: 256,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: targetLabel(log.target_type)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                                        lineNumber: 259,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                                lineNumber: 255,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "text-xs text-muted-foreground mt-1",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "font-medium text-foreground",
                                                        children: log.admin_nome || log.admin_email || log.admin_id.slice(0, 8)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                                        lineNumber: 264,
                                                        columnNumber: 23
                                                    }, this),
                                                    log.target_id && /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "ml-1",
                                                        children: [
                                                            "→ ",
                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                className: "font-mono text-[10px] bg-muted px-1 py-0.5 rounded",
                                                                children: [
                                                                    log.target_id.slice(0, 12),
                                                                    "..."
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                                                lineNumber: 266,
                                                                columnNumber: 50
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                                        lineNumber: 266,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                                lineNumber: 263,
                                                columnNumber: 21
                                            }, this),
                                            log.details && Object.keys(log.details).length > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                                className: "mt-1.5 text-[11px] text-muted-foreground bg-muted/50 rounded-lg px-2 py-1 font-mono break-all",
                                                children: Object.entries(log.details).map(([k, v])=>/*#__PURE__*/ _jsxDEV("div", {
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                className: "text-primary/70",
                                                                children: [
                                                                    k,
                                                                    ":"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                                                lineNumber: 272,
                                                                columnNumber: 40
                                                            }, this),
                                                            " ",
                                                            String(v)
                                                        ]
                                                    }, k, true, {
                                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                                        lineNumber: 272,
                                                        columnNumber: 27
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                                lineNumber: 270,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 254,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-[10px] text-muted-foreground whitespace-nowrap",
                                        children: formatDateTimeBR(log.created_at)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/AuditTab.tsx",
                                        lineNumber: 277,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/AuditTab.tsx",
                                lineNumber: 253,
                                columnNumber: 17
                            }, this)
                        }, log.id, false, {
                            fileName: "/dev-server/src/components/AuditTab.tsx",
                            lineNumber: 247,
                            columnNumber: 15
                        }, this);
                    }),
                    hasMore && /*#__PURE__*/ _jsxDEV("button", {
                        onClick: loadMore,
                        disabled: loading,
                        className: "w-full py-2.5 rounded-xl bg-card border border-border text-sm text-muted-foreground hover:bg-muted transition-colors",
                        children: loading ? "Carregando..." : "Carregar mais"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/AuditTab.tsx",
                        lineNumber: 286,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/AuditTab.tsx",
                lineNumber: 243,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/AuditTab.tsx",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
_s(AuditTab, "l+LgazObChS0Izx0mWodeE99ZuM=");
_c = AuditTab;
var _c;
$RefreshReg$(_c, "AuditTab");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/AuditTab.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/AuditTab.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF1ZGl0VGFiLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tIFwiQC9pbnRlZ3JhdGlvbnMvc3VwYWJhc2UvY2xpZW50XCI7XG5pbXBvcnQgeyBtb3Rpb24gfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IHsgU2VhcmNoLCBGaWx0ZXIsIENhbGVuZGFyLCBVc2VyLCBSZWZyZXNoQ3csIENoZXZyb25Eb3duLCBTaGllbGQgfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5pbXBvcnQgeyBmb3JtYXREYXRlVGltZUJSIH0gZnJvbSBcIkAvbGliL3RpbWV6b25lXCI7XG5cbmludGVyZmFjZSBBdWRpdExvZyB7XG4gIGlkOiBzdHJpbmc7XG4gIGFkbWluX2lkOiBzdHJpbmc7XG4gIGFjdGlvbjogc3RyaW5nO1xuICB0YXJnZXRfdHlwZTogc3RyaW5nO1xuICB0YXJnZXRfaWQ6IHN0cmluZyB8IG51bGw7XG4gIGRldGFpbHM6IGFueTtcbiAgY3JlYXRlZF9hdDogc3RyaW5nO1xuICBhZG1pbl9ub21lPzogc3RyaW5nO1xuICBhZG1pbl9lbWFpbD86IHN0cmluZztcbn1cblxuY29uc3QgQUNUSU9OX0xBQkVMUzogUmVjb3JkPHN0cmluZywgeyBsYWJlbDogc3RyaW5nOyBjb2xvcjogc3RyaW5nIH0+ID0ge1xuICBibG9ja19yb29tOiB7IGxhYmVsOiBcIkJsb3F1ZWFyIFNhbGFcIiwgY29sb3I6IFwiYmctcmVkLTUwMC8yMCB0ZXh0LXJlZC00MDBcIiB9LFxuICB1bmJsb2NrX3Jvb206IHsgbGFiZWw6IFwiRGVzYmxvcXVlYXIgU2FsYVwiLCBjb2xvcjogXCJiZy1ncmVlbi01MDAvMjAgdGV4dC1ncmVlbi00MDBcIiB9LFxuICBzZXRfcHJpdmFjeTogeyBsYWJlbDogXCJBbHRlcmFyIFByaXZhY2lkYWRlXCIsIGNvbG9yOiBcImJnLWJsdWUtNTAwLzIwIHRleHQtYmx1ZS00MDBcIiB9LFxuICBzZXRfc2FsZG86IHsgbGFiZWw6IFwiRGVmaW5pciBTYWxkb1wiLCBjb2xvcjogXCJiZy15ZWxsb3ctNTAwLzIwIHRleHQteWVsbG93LTQwMFwiIH0sXG4gIGFkZF9zYWxkbzogeyBsYWJlbDogXCJBZGljaW9uYXIgU2FsZG9cIiwgY29sb3I6IFwiYmctZ3JlZW4tNTAwLzIwIHRleHQtZ3JlZW4tNDAwXCIgfSxcbiAgcmVtb3ZlX3NhbGRvOiB7IGxhYmVsOiBcIlJlbW92ZXIgU2FsZG9cIiwgY29sb3I6IFwiYmctcmVkLTUwMC8yMCB0ZXh0LXJlZC00MDBcIiB9LFxuICBzZXRfYmFkZ2U6IHsgbGFiZWw6IFwiQXRyaWJ1aXIgQmFkZ2VcIiwgY29sb3I6IFwiYmctcHVycGxlLTUwMC8yMCB0ZXh0LXB1cnBsZS00MDBcIiB9LFxuICByZW1vdmVfYmFkZ2U6IHsgbGFiZWw6IFwiUmVtb3ZlciBCYWRnZVwiLCBjb2xvcjogXCJiZy1vcmFuZ2UtNTAwLzIwIHRleHQtb3JhbmdlLTQwMFwiIH0sXG4gIHJlbW92ZV9yb2xlOiB7IGxhYmVsOiBcIlJlbW92ZXIgQ2FyZ29cIiwgY29sb3I6IFwiYmctcmVkLTUwMC8yMCB0ZXh0LXJlZC00MDBcIiB9LFxuICBhZGRfcm9sZTogeyBsYWJlbDogXCJBZGljaW9uYXIgQ2FyZ29cIiwgY29sb3I6IFwiYmctZ3JlZW4tNTAwLzIwIHRleHQtZ3JlZW4tNDAwXCIgfSxcbiAgY3JlYXRlX3VzZXI6IHsgbGFiZWw6IFwiQ3JpYXIgVXN1w6FyaW9cIiwgY29sb3I6IFwiYmctYmx1ZS01MDAvMjAgdGV4dC1ibHVlLTQwMFwiIH0sXG4gIGRlbGV0ZV91c2VyOiB7IGxhYmVsOiBcIkRlbGV0YXIgVXN1w6FyaW9cIiwgY29sb3I6IFwiYmctcmVkLTUwMC8yMCB0ZXh0LXJlZC00MDBcIiB9LFxuICB0b2dnbGVfcm9sZTogeyBsYWJlbDogXCJBbHRlcmFyIENhcmdvXCIsIGNvbG9yOiBcImJnLXllbGxvdy01MDAvMjAgdGV4dC15ZWxsb3ctNDAwXCIgfSxcbn07XG5cbmNvbnN0IFRBUkdFVF9MQUJFTFM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gIGNoYXRfcm9vbTogXCJTYWxhIGRlIENoYXRcIixcbiAgdXNlcjogXCJVc3XDoXJpb1wiLFxuICBzYWxkbzogXCJTYWxkb1wiLFxuICBwcm9maWxlOiBcIlBlcmZpbFwiLFxuICByb2xlOiBcIkNhcmdvXCIsXG59O1xuXG5jb25zdCBQRVJfUEFHRSA9IDIwO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBBdWRpdFRhYigpIHtcbiAgY29uc3QgW2xvZ3MsIHNldExvZ3NdID0gdXNlU3RhdGU8QXVkaXRMb2dbXT4oW10pO1xuICBjb25zdCBbbG9hZGluZywgc2V0TG9hZGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtzZWFyY2gsIHNldFNlYXJjaF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2FjdGlvbkZpbHRlciwgc2V0QWN0aW9uRmlsdGVyXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbZGF0ZUZyb20sIHNldERhdGVGcm9tXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbZGF0ZVRvLCBzZXREYXRlVG9dID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFthZG1pbkZpbHRlciwgc2V0QWRtaW5GaWx0ZXJdID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFthZG1pbnMsIHNldEFkbWluc10gPSB1c2VTdGF0ZTx7IGlkOiBzdHJpbmc7IG5vbWU6IHN0cmluZyB8IG51bGw7IGVtYWlsOiBzdHJpbmcgfCBudWxsIH1bXT4oW10pO1xuICBjb25zdCBbcGFnZSwgc2V0UGFnZV0gPSB1c2VTdGF0ZSgxKTtcbiAgY29uc3QgW2hhc01vcmUsIHNldEhhc01vcmVdID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtzaG93RmlsdGVycywgc2V0U2hvd0ZpbHRlcnNdID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIGNvbnN0IGZldGNoTG9ncyA9IHVzZUNhbGxiYWNrKGFzeW5jIChyZXNldFBhZ2UgPSB0cnVlKSA9PiB7XG4gICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICBjb25zdCBjdXJyZW50UGFnZSA9IHJlc2V0UGFnZSA/IDEgOiBwYWdlO1xuICAgIGlmIChyZXNldFBhZ2UpIHNldFBhZ2UoMSk7XG5cbiAgICB0cnkge1xuICAgICAgbGV0IHF1ZXJ5ID0gKHN1cGFiYXNlLmZyb20oXCJhdWRpdF9sb2dzXCIpIGFzIGFueSlcbiAgICAgICAgLnNlbGVjdChcIipcIilcbiAgICAgICAgLm9yZGVyKFwiY3JlYXRlZF9hdFwiLCB7IGFzY2VuZGluZzogZmFsc2UgfSlcbiAgICAgICAgLnJhbmdlKChjdXJyZW50UGFnZSAtIDEpICogUEVSX1BBR0UsIGN1cnJlbnRQYWdlICogUEVSX1BBR0UgLSAxKTtcblxuICAgICAgaWYgKGFjdGlvbkZpbHRlcikgcXVlcnkgPSBxdWVyeS5lcShcImFjdGlvblwiLCBhY3Rpb25GaWx0ZXIpO1xuICAgICAgaWYgKGFkbWluRmlsdGVyKSBxdWVyeSA9IHF1ZXJ5LmVxKFwiYWRtaW5faWRcIiwgYWRtaW5GaWx0ZXIpO1xuICAgICAgaWYgKGRhdGVGcm9tKSBxdWVyeSA9IHF1ZXJ5Lmd0ZShcImNyZWF0ZWRfYXRcIiwgbmV3IERhdGUoZGF0ZUZyb20pLnRvSVNPU3RyaW5nKCkpO1xuICAgICAgaWYgKGRhdGVUbykge1xuICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoZGF0ZVRvKTtcbiAgICAgICAgZW5kRGF0ZS5zZXRIb3VycygyMywgNTksIDU5LCA5OTkpO1xuICAgICAgICBxdWVyeSA9IHF1ZXJ5Lmx0ZShcImNyZWF0ZWRfYXRcIiwgZW5kRGF0ZS50b0lTT1N0cmluZygpKTtcbiAgICAgIH1cbiAgICAgIGlmIChzZWFyY2gpIHF1ZXJ5ID0gcXVlcnkub3IoYHRhcmdldF9pZC5pbGlrZS4lJHtzZWFyY2h9JSxhY3Rpb24uaWxpa2UuJSR7c2VhcmNofSVgKTtcblxuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgcXVlcnk7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuXG4gICAgICBjb25zdCByb3dzID0gKGRhdGEgfHwgW10pIGFzIEF1ZGl0TG9nW107XG5cbiAgICAgIC8vIEZldGNoIGFkbWluIG5hbWVzXG4gICAgICBjb25zdCBhZG1pbklkcyA9IFsuLi5uZXcgU2V0KHJvd3MubWFwKChyOiBBdWRpdExvZykgPT4gci5hZG1pbl9pZCkpXTtcbiAgICAgIGlmIChhZG1pbklkcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHsgZGF0YTogcHJvZmlsZXMgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgICAgLmZyb20oXCJwcm9maWxlc1wiKVxuICAgICAgICAgIC5zZWxlY3QoXCJpZCwgbm9tZSwgZW1haWxcIilcbiAgICAgICAgICAuaW4oXCJpZFwiLCBhZG1pbklkcyk7XG4gICAgICAgIGNvbnN0IHByb2ZpbGVNYXAgPSBuZXcgTWFwKChwcm9maWxlcyB8fCBbXSkubWFwKChwOiBhbnkpID0+IFtwLmlkLCBwXSkpO1xuICAgICAgICByb3dzLmZvckVhY2goKHI6IEF1ZGl0TG9nKSA9PiB7XG4gICAgICAgICAgY29uc3QgcCA9IHByb2ZpbGVNYXAuZ2V0KHIuYWRtaW5faWQpO1xuICAgICAgICAgIGlmIChwKSB7XG4gICAgICAgICAgICByLmFkbWluX25vbWUgPSBwLm5vbWU7XG4gICAgICAgICAgICByLmFkbWluX2VtYWlsID0gcC5lbWFpbDtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBzZXRMb2dzKHJvd3MpO1xuICAgICAgc2V0SGFzTW9yZShyb3dzLmxlbmd0aCA+PSBQRVJfUEFHRSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJybyBhbyBidXNjYXIgbG9nczpcIiwgZXJyKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9LCBbYWN0aW9uRmlsdGVyLCBhZG1pbkZpbHRlciwgZGF0ZUZyb20sIGRhdGVUbywgc2VhcmNoLCBwYWdlXSk7XG5cbiAgY29uc3QgZmV0Y2hBZG1pbnMgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCAoc3VwYWJhc2UuZnJvbShcInVzZXJfcm9sZXNcIikgYXMgYW55KVxuICAgICAgLnNlbGVjdChcInVzZXJfaWRcIilcbiAgICAgIC5lcShcInJvbGVcIiwgXCJhZG1pblwiKTtcbiAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGlkcyA9IGRhdGEubWFwKChkOiBhbnkpID0+IGQudXNlcl9pZCk7XG4gICAgICBjb25zdCB7IGRhdGE6IHByb2ZpbGVzIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAuZnJvbShcInByb2ZpbGVzXCIpXG4gICAgICAgIC5zZWxlY3QoXCJpZCwgbm9tZSwgZW1haWxcIilcbiAgICAgICAgLmluKFwiaWRcIiwgaWRzKTtcbiAgICAgIHNldEFkbWlucygocHJvZmlsZXMgfHwgW10pIGFzIGFueSk7XG4gICAgfVxuICB9LCBbXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHsgZmV0Y2hMb2dzKHRydWUpOyB9LCBbYWN0aW9uRmlsdGVyLCBhZG1pbkZpbHRlciwgZGF0ZUZyb20sIGRhdGVUb10pO1xuICB1c2VFZmZlY3QoKCkgPT4geyBmZXRjaEFkbWlucygpOyB9LCBbZmV0Y2hBZG1pbnNdKTtcblxuICBjb25zdCBoYW5kbGVTZWFyY2ggPSAoKSA9PiBmZXRjaExvZ3ModHJ1ZSk7XG4gIGNvbnN0IGxvYWRNb3JlID0gKCkgPT4ge1xuICAgIHNldFBhZ2UocCA9PiBwICsgMSk7XG4gIH07XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAocGFnZSA+IDEpIGZldGNoTG9ncyhmYWxzZSk7XG4gIH0sIFtwYWdlXSk7XG5cbiAgY29uc3QgYWN0aW9uTGFiZWwgPSAoYWN0aW9uOiBzdHJpbmcpID0+IEFDVElPTl9MQUJFTFNbYWN0aW9uXSB8fCB7IGxhYmVsOiBhY3Rpb24sIGNvbG9yOiBcImJnLW11dGVkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiIH07XG4gIGNvbnN0IHRhcmdldExhYmVsID0gKHQ6IHN0cmluZykgPT4gVEFSR0VUX0xBQkVMU1t0XSB8fCB0O1xuXG4gIGNvbnN0IHVuaXF1ZUFjdGlvbnMgPSBbLi4ubmV3IFNldChsb2dzLm1hcChsID0+IGwuYWN0aW9uKSldO1xuICBjb25zdCBhbGxBY3Rpb25zID0gT2JqZWN0LmtleXMoQUNUSU9OX0xBQkVMUyk7XG5cbiAgcmV0dXJuIChcbiAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDE2IH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fSBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgIHsvKiBIZWFkZXIgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgPFNoaWVsZCBjbGFzc05hbWU9XCJ3LTUgaC01IHRleHQtcHJpbWFyeVwiIC8+XG4gICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPkxvZyBkZSBBdWRpdG9yaWE8L2gyPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBmZXRjaExvZ3ModHJ1ZSl9IGNsYXNzTmFtZT1cInAtMiByb3VuZGVkLWxnIGJnLWNhcmQgYm9yZGVyIGJvcmRlci1ib3JkZXIgaG92ZXI6YmctbXV0ZWQgdHJhbnNpdGlvbi1jb2xvcnNcIiB0aXRsZT1cIkF0dWFsaXphclwiPlxuICAgICAgICAgIDxSZWZyZXNoQ3cgY2xhc3NOYW1lPXtgdy00IGgtNCB0ZXh0LW11dGVkLWZvcmVncm91bmQgJHtsb2FkaW5nID8gXCJhbmltYXRlLXNwaW5cIiA6IFwiXCJ9YH0gLz5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cblxuICAgICAgey8qIFNlYXJjaCArIEZpbHRlciBUb2dnbGUgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZ2FwLTJcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBmbGV4LTFcIj5cbiAgICAgICAgICA8U2VhcmNoIGNsYXNzTmFtZT1cImFic29sdXRlIGxlZnQtMyB0b3AtMS8yIC10cmFuc2xhdGUteS0xLzIgdy00IGgtNCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIiAvPlxuICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJCdXNjYXIgcG9yIGHDp8OjbyBvdSBJRC4uLlwiXG4gICAgICAgICAgICB2YWx1ZT17c2VhcmNofVxuICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gc2V0U2VhcmNoKGUudGFyZ2V0LnZhbHVlKX1cbiAgICAgICAgICAgIG9uS2V5RG93bj17ZSA9PiBlLmtleSA9PT0gXCJFbnRlclwiICYmIGhhbmRsZVNlYXJjaCgpfVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHBsLTEwIHByLTQgcHktMi41IHJvdW5kZWQteGwgYmctY2FyZCBib3JkZXIgYm9yZGVyLWJvcmRlciB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1wcmltYXJ5LzMwIGZvY3VzOmJvcmRlci1wcmltYXJ5IG91dGxpbmUtbm9uZVwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b25cbiAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRTaG93RmlsdGVycyghc2hvd0ZpbHRlcnMpfVxuICAgICAgICAgIGNsYXNzTmFtZT17YHB4LTMgcHktMi41IHJvdW5kZWQteGwgYm9yZGVyIHRleHQtc20gZm9udC1tZWRpdW0gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNSB0cmFuc2l0aW9uLWNvbG9ycyAke3Nob3dGaWx0ZXJzID8gXCJiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGJvcmRlci1wcmltYXJ5XCIgOiBcImJnLWNhcmQgYm9yZGVyLWJvcmRlciB0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6YmctbXV0ZWRcIn1gfVxuICAgICAgICA+XG4gICAgICAgICAgPEZpbHRlciBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICBGaWx0cm9zXG4gICAgICAgICAgPENoZXZyb25Eb3duIGNsYXNzTmFtZT17YHctMyBoLTMgdHJhbnNpdGlvbi10cmFuc2Zvcm0gJHtzaG93RmlsdGVycyA/IFwicm90YXRlLTE4MFwiIDogXCJcIn1gfSAvPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7LyogRmlsdGVycyBQYW5lbCAqL31cbiAgICAgIHtzaG93RmlsdGVycyAmJiAoXG4gICAgICAgIDxtb3Rpb24uZGl2IGluaXRpYWw9e3sgb3BhY2l0eTogMCwgaGVpZ2h0OiAwIH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgaGVpZ2h0OiBcImF1dG9cIiB9fSBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIHNtOmdyaWQtY29scy0zIGdhcC0zIHAtNCByb3VuZGVkLXhsIGJnLWNhcmQgYm9yZGVyIGJvcmRlci1ib3JkZXJcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1iLTEgYmxvY2sgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIj48RmlsdGVyIGNsYXNzTmFtZT1cInctMyBoLTNcIiAvPiBBw6fDo288L2xhYmVsPlxuICAgICAgICAgICAgPHNlbGVjdFxuICAgICAgICAgICAgICB2YWx1ZT17YWN0aW9uRmlsdGVyfVxuICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRBY3Rpb25GaWx0ZXIoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yIHJvdW5kZWQtbGcgYmctYmFja2dyb3VuZCBib3JkZXIgYm9yZGVyLWJvcmRlciB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Ub2Rhczwvb3B0aW9uPlxuICAgICAgICAgICAgICB7YWxsQWN0aW9ucy5tYXAoYSA9PiAoXG4gICAgICAgICAgICAgICAgPG9wdGlvbiBrZXk9e2F9IHZhbHVlPXthfT57QUNUSU9OX0xBQkVMU1thXT8ubGFiZWwgfHwgYX08L29wdGlvbj5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L3NlbGVjdD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1iLTEgYmxvY2sgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIj48VXNlciBjbGFzc05hbWU9XCJ3LTMgaC0zXCIgLz4gQWRtaW5pc3RyYWRvcjwvbGFiZWw+XG4gICAgICAgICAgICA8c2VsZWN0XG4gICAgICAgICAgICAgIHZhbHVlPXthZG1pbkZpbHRlcn1cbiAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4gc2V0QWRtaW5GaWx0ZXIoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtMyBweS0yIHJvdW5kZWQtbGcgYmctYmFja2dyb3VuZCBib3JkZXIgYm9yZGVyLWJvcmRlciB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxvcHRpb24gdmFsdWU9XCJcIj5Ub2Rvczwvb3B0aW9uPlxuICAgICAgICAgICAgICB7YWRtaW5zLm1hcChhID0+IChcbiAgICAgICAgICAgICAgICA8b3B0aW9uIGtleT17YS5pZH0gdmFsdWU9e2EuaWR9PnthLm5vbWUgfHwgYS5lbWFpbCB8fCBhLmlkLnNsaWNlKDAsIDgpfTwvb3B0aW9uPlxuICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgIDwvc2VsZWN0PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMiBnYXAtMlwiPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG1iLTEgYmxvY2sgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIj48Q2FsZW5kYXIgY2xhc3NOYW1lPVwidy0zIGgtM1wiIC8+IERlPC9sYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgICAgIHZhbHVlPXtkYXRlRnJvbX1cbiAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXREYXRlRnJvbShlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTMgcHktMiByb3VuZGVkLWxnIGJnLWJhY2tncm91bmQgYm9yZGVyIGJvcmRlci1ib3JkZXIgdGV4dC1mb3JlZ3JvdW5kIHRleHQtc21cIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQgbWItMSBibG9jayBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiPjxDYWxlbmRhciBjbGFzc05hbWU9XCJ3LTMgaC0zXCIgLz4gQXTDqTwvbGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIHR5cGU9XCJkYXRlXCJcbiAgICAgICAgICAgICAgICB2YWx1ZT17ZGF0ZVRvfVxuICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXtlID0+IHNldERhdGVUbyhlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTMgcHktMiByb3VuZGVkLWxnIGJnLWJhY2tncm91bmQgYm9yZGVyIGJvcmRlci1ib3JkZXIgdGV4dC1mb3JlZ3JvdW5kIHRleHQtc21cIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICl9XG5cbiAgICAgIHsvKiBMb2dzIExpc3QgKi99XG4gICAgICB7bG9hZGluZyAmJiBsb2dzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTNcIj5cbiAgICAgICAgICB7Wy4uLkFycmF5KDUpXS5tYXAoKF8sIGkpID0+IChcbiAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJoLTIwIHJvdW5kZWQteGwgYmctY2FyZCBib3JkZXIgYm9yZGVyLWJvcmRlciBhbmltYXRlLXB1bHNlXCIgLz5cbiAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogbG9ncy5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgcHktMTIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgPFNoaWVsZCBjbGFzc05hbWU9XCJ3LTEyIGgtMTIgbXgtYXV0byBtYi0zIG9wYWNpdHktMzBcIiAvPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc21cIj5OZW5odW0gcmVnaXN0cm8gZGUgYXVkaXRvcmlhIGVuY29udHJhZG8uPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAge2xvZ3MubWFwKGxvZyA9PiB7XG4gICAgICAgICAgICBjb25zdCBhbCA9IGFjdGlvbkxhYmVsKGxvZy5hY3Rpb24pO1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICBrZXk9e2xvZy5pZH1cbiAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHg6IC04IH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB4OiAwIH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicC0zIHJvdW5kZWQteGwgYmctY2FyZCBib3JkZXIgYm9yZGVyLWJvcmRlciBob3Zlcjpib3JkZXItcHJpbWFyeS8zMCB0cmFuc2l0aW9uLWNvbG9yc1wiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtc3RhcnQganVzdGlmeS1iZXR3ZWVuIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMSBtaW4tdy0wXCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgZmxleC13cmFwIG1iLTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9e2BweC0yIHB5LTAuNSByb3VuZGVkLWZ1bGwgdGV4dC14cyBmb250LW1lZGl1bSAke2FsLmNvbG9yfWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAge2FsLmxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3RhcmdldExhYmVsKGxvZy50YXJnZXRfdHlwZSl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtdC0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kXCI+e2xvZy5hZG1pbl9ub21lIHx8IGxvZy5hZG1pbl9lbWFpbCB8fCBsb2cuYWRtaW5faWQuc2xpY2UoMCwgOCl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIHtsb2cudGFyZ2V0X2lkICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cIm1sLTFcIj7ihpIgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1tb25vIHRleHQtWzEwcHhdIGJnLW11dGVkIHB4LTEgcHktMC41IHJvdW5kZWRcIj57bG9nLnRhcmdldF9pZC5zbGljZSgwLCAxMil9Li4uPC9zcGFuPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAge2xvZy5kZXRhaWxzICYmIE9iamVjdC5rZXlzKGxvZy5kZXRhaWxzKS5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm10LTEuNSB0ZXh0LVsxMXB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmQgYmctbXV0ZWQvNTAgcm91bmRlZC1sZyBweC0yIHB5LTEgZm9udC1tb25vIGJyZWFrLWFsbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge09iamVjdC5lbnRyaWVzKGxvZy5kZXRhaWxzKS5tYXAoKFtrLCB2XSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17a30+PHNwYW4gY2xhc3NOYW1lPVwidGV4dC1wcmltYXJ5LzcwXCI+e2t9Ojwvc3Bhbj4ge1N0cmluZyh2KX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmQgd2hpdGVzcGFjZS1ub3dyYXBcIj5cbiAgICAgICAgICAgICAgICAgICAge2Zvcm1hdERhdGVUaW1lQlIobG9nLmNyZWF0ZWRfYXQpfVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pfVxuXG4gICAgICAgICAge2hhc01vcmUgJiYgKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBvbkNsaWNrPXtsb2FkTW9yZX1cbiAgICAgICAgICAgICAgZGlzYWJsZWQ9e2xvYWRpbmd9XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweS0yLjUgcm91bmRlZC14bCBiZy1jYXJkIGJvcmRlciBib3JkZXItYm9yZGVyIHRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOmJnLW11dGVkIHRyYW5zaXRpb24tY29sb3JzXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAge2xvYWRpbmcgPyBcIkNhcnJlZ2FuZG8uLi5cIiA6IFwiQ2FycmVnYXIgbWFpc1wifVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuICAgIDwvbW90aW9uLmRpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VFZmZlY3QiLCJ1c2VTdGF0ZSIsInVzZUNhbGxiYWNrIiwic3VwYWJhc2UiLCJtb3Rpb24iLCJTZWFyY2giLCJGaWx0ZXIiLCJDYWxlbmRhciIsIlVzZXIiLCJSZWZyZXNoQ3ciLCJDaGV2cm9uRG93biIsIlNoaWVsZCIsImZvcm1hdERhdGVUaW1lQlIiLCJBQ1RJT05fTEFCRUxTIiwiYmxvY2tfcm9vbSIsImxhYmVsIiwiY29sb3IiLCJ1bmJsb2NrX3Jvb20iLCJzZXRfcHJpdmFjeSIsInNldF9zYWxkbyIsImFkZF9zYWxkbyIsInJlbW92ZV9zYWxkbyIsInNldF9iYWRnZSIsInJlbW92ZV9iYWRnZSIsInJlbW92ZV9yb2xlIiwiYWRkX3JvbGUiLCJjcmVhdGVfdXNlciIsImRlbGV0ZV91c2VyIiwidG9nZ2xlX3JvbGUiLCJUQVJHRVRfTEFCRUxTIiwiY2hhdF9yb29tIiwidXNlciIsInNhbGRvIiwicHJvZmlsZSIsInJvbGUiLCJQRVJfUEFHRSIsIkF1ZGl0VGFiIiwibG9ncyIsInNldExvZ3MiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsInNlYXJjaCIsInNldFNlYXJjaCIsImFjdGlvbkZpbHRlciIsInNldEFjdGlvbkZpbHRlciIsImRhdGVGcm9tIiwic2V0RGF0ZUZyb20iLCJkYXRlVG8iLCJzZXREYXRlVG8iLCJhZG1pbkZpbHRlciIsInNldEFkbWluRmlsdGVyIiwiYWRtaW5zIiwic2V0QWRtaW5zIiwicGFnZSIsInNldFBhZ2UiLCJoYXNNb3JlIiwic2V0SGFzTW9yZSIsInNob3dGaWx0ZXJzIiwic2V0U2hvd0ZpbHRlcnMiLCJmZXRjaExvZ3MiLCJyZXNldFBhZ2UiLCJjdXJyZW50UGFnZSIsInF1ZXJ5IiwiZnJvbSIsInNlbGVjdCIsIm9yZGVyIiwiYXNjZW5kaW5nIiwicmFuZ2UiLCJlcSIsImd0ZSIsIkRhdGUiLCJ0b0lTT1N0cmluZyIsImVuZERhdGUiLCJzZXRIb3VycyIsImx0ZSIsIm9yIiwiZGF0YSIsImVycm9yIiwicm93cyIsImFkbWluSWRzIiwiU2V0IiwibWFwIiwiciIsImFkbWluX2lkIiwibGVuZ3RoIiwicHJvZmlsZXMiLCJpbiIsInByb2ZpbGVNYXAiLCJNYXAiLCJwIiwiaWQiLCJmb3JFYWNoIiwiZ2V0IiwiYWRtaW5fbm9tZSIsIm5vbWUiLCJhZG1pbl9lbWFpbCIsImVtYWlsIiwiZXJyIiwiY29uc29sZSIsImZldGNoQWRtaW5zIiwiaWRzIiwiZCIsInVzZXJfaWQiLCJoYW5kbGVTZWFyY2giLCJsb2FkTW9yZSIsImFjdGlvbkxhYmVsIiwiYWN0aW9uIiwidGFyZ2V0TGFiZWwiLCJ0IiwidW5pcXVlQWN0aW9ucyIsImwiLCJhbGxBY3Rpb25zIiwiT2JqZWN0Iiwia2V5cyIsImRpdiIsImluaXRpYWwiLCJvcGFjaXR5IiwieSIsImFuaW1hdGUiLCJjbGFzc05hbWUiLCJoMiIsImJ1dHRvbiIsIm9uQ2xpY2siLCJ0aXRsZSIsImlucHV0IiwidHlwZSIsInBsYWNlaG9sZGVyIiwidmFsdWUiLCJvbkNoYW5nZSIsImUiLCJ0YXJnZXQiLCJvbktleURvd24iLCJrZXkiLCJoZWlnaHQiLCJvcHRpb24iLCJhIiwic2xpY2UiLCJBcnJheSIsIl8iLCJpIiwibG9nIiwiYWwiLCJ4Iiwic3BhbiIsInRhcmdldF90eXBlIiwidGFyZ2V0X2lkIiwiZGV0YWlscyIsImVudHJpZXMiLCJrIiwidiIsIlN0cmluZyIsImNyZWF0ZWRfYXQiLCJkaXNhYmxlZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsU0FBUyxFQUFFQyxRQUFRLEVBQUVDLFdBQVcsUUFBUSxRQUFRO0FBQ3pELFNBQVNDLFFBQVEsUUFBUSxpQ0FBaUM7QUFDMUQsU0FBU0MsTUFBTSxRQUFRLGdCQUFnQjtBQUN2QyxTQUFTQyxNQUFNLEVBQUVDLE1BQU0sRUFBRUMsUUFBUSxFQUFFQyxJQUFJLEVBQUVDLFNBQVMsRUFBRUMsV0FBVyxFQUFFQyxNQUFNLFFBQVEsZUFBZTtBQUM5RixTQUFTQyxnQkFBZ0IsUUFBUSxpQkFBaUI7QUFjbEQsTUFBTUMsZ0JBQWtFO0lBQ3RFQyxZQUFZO1FBQUVD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