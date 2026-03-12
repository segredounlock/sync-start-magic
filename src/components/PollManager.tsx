import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/PollManager.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/PollManager.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"]; const useCallback = __vite__cjsImport3_react["useCallback"]; const useRef = __vite__cjsImport3_react["useRef"];
import { supabase } from "/src/integrations/supabase/client.ts";
import { useAuth } from "/src/hooks/useAuth.tsx";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { BarChart3, Plus, Trash2, ToggleLeft, ToggleRight, Eye, Loader2, X } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { styledToast as toast } from "/src/lib/toast.tsx";
import { formatTimeBR, formatDateFullBR } from "/src/lib/timezone.ts";
export function PollManager() {
    _s();
    const { user } = useAuth();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState([
        "",
        ""
    ]);
    const [creating, setCreating] = useState(false);
    const [selectedPoll, setSelectedPoll] = useState(null);
    const [pollVotes, setPollVotes] = useState([]);
    const initialLoadDone = useRef(false);
    const fetchPolls = useCallback(async ()=>{
        try {
            const { data, error } = await supabase.from("polls").select("*").order("created_at", {
                ascending: false
            });
            if (error) throw error;
            if (data) {
                const pollIds = data.map((p)=>p.id);
                const { data: allVotes } = await supabase.from("poll_votes").select("poll_id, option_index").in("poll_id", pollIds);
                const votesMap = {};
                (allVotes || []).forEach((v)=>{
                    if (!votesMap[v.poll_id]) votesMap[v.poll_id] = {};
                    votesMap[v.poll_id][v.option_index] = (votesMap[v.poll_id][v.option_index] || 0) + 1;
                });
                setPolls(data.map((p)=>{
                    const baseOptions = p.options || [];
                    const pollVotesMap = votesMap[p.id] || {};
                    const enrichedOptions = baseOptions.map((opt, i)=>({
                            ...opt,
                            votes: pollVotesMap[i] || 0
                        }));
                    const totalReal = Object.values(pollVotesMap).reduce((s, v)=>s + v, 0);
                    return {
                        id: p.id,
                        question: p.question,
                        options: enrichedOptions,
                        active: p.active,
                        total_votes: totalReal,
                        created_at: p.created_at,
                        expires_at: p.expires_at
                    };
                }));
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro ao carregar enquetes");
        } finally{
            if (!initialLoadDone.current) {
                setLoading(false);
                initialLoadDone.current = true;
            }
        }
    }, []);
    useEffect(()=>{
        fetchPolls();
    }, [
        fetchPolls
    ]);
    // Realtime updates for votes
    useEffect(()=>{
        const channel = supabase.channel("poll-manager-realtime").on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "poll_votes"
        }, (payload)=>{
            const vote = payload.new;
            setPolls((prev)=>prev.map((p)=>{
                    if (p.id !== vote.poll_id) return p;
                    const newOpts = [
                        ...p.options
                    ];
                    if (newOpts[vote.option_index]) {
                        newOpts[vote.option_index] = {
                            ...newOpts[vote.option_index],
                            votes: (newOpts[vote.option_index].votes || 0) + 1
                        };
                    }
                    return {
                        ...p,
                        options: newOpts,
                        total_votes: p.total_votes + 1
                    };
                }));
            // Update selected poll detail
            if (selectedPoll?.id === vote.poll_id) {
                setPollVotes((prev)=>[
                        ...prev,
                        {
                            option_index: vote.option_index,
                            created_at: vote.created_at
                        }
                    ]);
                setSelectedPoll((prev)=>{
                    if (!prev) return prev;
                    const newOpts = [
                        ...prev.options
                    ];
                    if (newOpts[vote.option_index]) {
                        newOpts[vote.option_index] = {
                            ...newOpts[vote.option_index],
                            votes: (newOpts[vote.option_index].votes || 0) + 1
                        };
                    }
                    return {
                        ...prev,
                        options: newOpts,
                        total_votes: prev.total_votes + 1
                    };
                });
            }
        }).on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "polls"
        }, ()=>{
            fetchPolls();
        }).subscribe();
        return ()=>{
            supabase.removeChannel(channel);
        };
    }, [
        selectedPoll?.id,
        fetchPolls
    ]);
    const handleCreate = async ()=>{
        const trimmedQ = question.trim();
        const trimmedOpts = options.map((o)=>o.trim()).filter((o)=>o.length > 0);
        if (!trimmedQ) {
            toast.error("Digite a pergunta");
            return;
        }
        if (trimmedOpts.length < 2) {
            toast.error("Mínimo 2 opções");
            return;
        }
        if (!user?.id) return;
        setCreating(true);
        const optionsData = trimmedOpts.map((label)=>({
                label,
                votes: 0
            }));
        const { error } = await supabase.from("polls").insert({
            question: trimmedQ,
            options: optionsData,
            created_by: user.id,
            active: false
        });
        if (error) {
            toast.error("Erro: " + error.message);
        } else {
            toast.success("Enquete criada!");
            setQuestion("");
            setOptions([
                "",
                ""
            ]);
            setShowCreate(false);
            fetchPolls();
        }
        setCreating(false);
    };
    const toggleActive = async (poll)=>{
        // If activating, deactivate all others first
        if (!poll.active) {
            await supabase.from("polls").update({
                active: false
            }).neq("id", poll.id);
        }
        const { error } = await supabase.from("polls").update({
            active: !poll.active
        }).eq("id", poll.id);
        if (error) toast.error("Erro: " + error.message);
        else {
            toast.success(poll.active ? "Enquete desativada" : "Enquete ativada!");
            fetchPolls();
        }
    };
    const deletePoll = async (id)=>{
        const { error } = await supabase.from("polls").delete().eq("id", id);
        if (error) toast.error("Erro: " + error.message);
        else {
            toast.success("Enquete excluída");
            fetchPolls();
            if (selectedPoll?.id === id) setSelectedPoll(null);
        }
    };
    const viewPollDetails = async (poll)=>{
        setSelectedPoll(poll);
        const { data } = await supabase.from("poll_votes").select("option_index, created_at").eq("poll_id", poll.id).order("created_at", {
            ascending: false
        });
        setPollVotes(data || []);
    };
    const totalVotes = (poll)=>poll.options.reduce((s, o)=>s + (o.votes || 0), 0);
    return /*#__PURE__*/ _jsxDEV(motion.div, {
        initial: {
            opacity: 0,
            y: 16
        },
        animate: {
            opacity: 1,
            y: 0
        },
        className: "space-y-6",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        children: [
                            /*#__PURE__*/ _jsxDEV("h2", {
                                className: "text-2xl font-extrabold text-foreground flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(BarChart3, {
                                        className: "h-6 w-6 text-primary"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 183,
                                        columnNumber: 13
                                    }, this),
                                    " Enquetes"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 182,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-sm text-muted-foreground mt-1",
                                children: "Crie enquetes e acompanhe a votação em tempo real."
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 185,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/PollManager.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("button", {
                        onClick: ()=>setShowCreate(true),
                        className: "flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-primary text-sm",
                        children: [
                            /*#__PURE__*/ _jsxDEV(Plus, {
                                className: "w-4 h-4"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 191,
                                columnNumber: 11
                            }, this),
                            " Nova Enquete"
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/PollManager.tsx",
                        lineNumber: 187,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/PollManager.tsx",
                lineNumber: 180,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                children: showCreate && /*#__PURE__*/ _jsxDEV("div", {
                    className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4",
                    onClick: ()=>setShowCreate(false),
                    children: /*#__PURE__*/ _jsxDEV(motion.div, {
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
                        className: "glass-modal rounded-2xl p-6 w-full max-w-md",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center justify-between mb-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("h3", {
                                        className: "text-lg font-bold text-foreground",
                                        children: "Nova Enquete"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 207,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>setShowCreate(false),
                                        className: "p-1 rounded-md hover:bg-muted/50 text-muted-foreground",
                                        children: /*#__PURE__*/ _jsxDEV(X, {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/PollManager.tsx",
                                            lineNumber: 208,
                                            columnNumber: 129
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 208,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 206,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("label", {
                                                className: "block text-sm font-medium text-foreground mb-1",
                                                children: "Pergunta"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 213,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("input", {
                                                value: question,
                                                onChange: (e)=>setQuestion(e.target.value),
                                                className: "w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                                                placeholder: "Ex: Qual operadora você mais usa?",
                                                maxLength: 200
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 214,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 212,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("label", {
                                                className: "block text-sm font-medium text-foreground mb-2",
                                                children: "Opções"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 224,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "space-y-2",
                                                children: options.map((opt, i)=>/*#__PURE__*/ _jsxDEV("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("input", {
                                                                value: opt,
                                                                onChange: (e)=>{
                                                                    const newOpts = [
                                                                        ...options
                                                                    ];
                                                                    newOpts[i] = e.target.value;
                                                                    setOptions(newOpts);
                                                                },
                                                                className: "flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50",
                                                                placeholder: `Opção ${i + 1}`,
                                                                maxLength: 100
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                                lineNumber: 228,
                                                                columnNumber: 25
                                                            }, this),
                                                            options.length > 2 && /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>setOptions(options.filter((_, j)=>j !== i)),
                                                                className: "p-1.5 text-destructive hover:bg-destructive/10 rounded-lg",
                                                                children: /*#__PURE__*/ _jsxDEV(Trash2, {
                                                                    className: "h-3.5 w-3.5"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                                                    lineNumber: 241,
                                                                    columnNumber: 29
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                                lineNumber: 240,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, i, true, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 227,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 225,
                                                columnNumber: 19
                                            }, this),
                                            options.length < 6 && /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>setOptions([
                                                        ...options,
                                                        ""
                                                    ]),
                                                className: "mt-2 text-xs text-primary font-medium flex items-center gap-1 hover:underline",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(Plus, {
                                                        className: "h-3 w-3"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 249,
                                                        columnNumber: 23
                                                    }, this),
                                                    " Adicionar opção"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 248,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 223,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: handleCreate,
                                        disabled: creating,
                                        className: "w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2",
                                        children: [
                                            creating ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                className: "h-4 w-4 animate-spin"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 259,
                                                columnNumber: 31
                                            }, this) : /*#__PURE__*/ _jsxDEV(BarChart3, {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 259,
                                                columnNumber: 78
                                            }, this),
                                            creating ? "Criando..." : "Criar Enquete"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 254,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 211,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/PollManager.tsx",
                        lineNumber: 199,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/components/PollManager.tsx",
                    lineNumber: 198,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/components/PollManager.tsx",
                lineNumber: 196,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                children: selectedPoll && /*#__PURE__*/ _jsxDEV("div", {
                    className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4",
                    onClick: ()=>setSelectedPoll(null),
                    children: /*#__PURE__*/ _jsxDEV(motion.div, {
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
                        className: "glass-modal rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto",
                        onClick: (e)=>e.stopPropagation(),
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center justify-between mb-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("h3", {
                                        className: "text-lg font-bold text-foreground",
                                        children: "Resultados"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 280,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>setSelectedPoll(null),
                                        className: "p-1 rounded-md hover:bg-muted/50 text-muted-foreground",
                                        children: /*#__PURE__*/ _jsxDEV(X, {
                                            className: "h-4 w-4"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/PollManager.tsx",
                                            lineNumber: 281,
                                            columnNumber: 130
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 281,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 279,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "font-semibold text-foreground mb-4",
                                children: selectedPoll.question
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 284,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "space-y-3 mb-4",
                                children: selectedPoll.options.map((opt, i)=>{
                                    const tv = totalVotes(selectedPoll);
                                    const pct = tv > 0 ? Math.round((opt.votes || 0) / tv * 100) : 0;
                                    return /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex justify-between text-sm mb-1",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "font-medium text-foreground",
                                                        children: opt.label
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 293,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-muted-foreground",
                                                        children: [
                                                            opt.votes || 0,
                                                            " (",
                                                            pct,
                                                            "%)"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 294,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 292,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "h-3 bg-muted/40 rounded-full overflow-hidden",
                                                children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                    initial: {
                                                        width: 0
                                                    },
                                                    animate: {
                                                        width: `${pct}%`
                                                    },
                                                    transition: {
                                                        duration: 0.8,
                                                        ease: "easeOut"
                                                    },
                                                    className: "h-full bg-primary rounded-full"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                                    lineNumber: 297,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 296,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 291,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 286,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "text-center text-sm font-semibold text-foreground",
                                children: [
                                    "Total: ",
                                    totalVotes(selectedPoll),
                                    " votos"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 309,
                                columnNumber: 15
                            }, this),
                            pollVotes.length > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                className: "mt-4 pt-4 border-t border-border",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("h4", {
                                        className: "text-xs font-semibold text-muted-foreground uppercase mb-2",
                                        children: "Últimos votos"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 315,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "space-y-1 max-h-32 overflow-y-auto",
                                        children: pollVotes.slice(0, 20).map((v, i)=>/*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex justify-between text-xs text-muted-foreground",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        children: selectedPoll.options[v.option_index]?.label || `Opção ${v.option_index + 1}`
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 319,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        children: formatTimeBR(v.created_at)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 320,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, i, true, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 318,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 316,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 314,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/PollManager.tsx",
                        lineNumber: 272,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/components/PollManager.tsx",
                    lineNumber: 271,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/components/PollManager.tsx",
                lineNumber: 269,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ _jsxDEV("div", {
                className: "text-center py-8 text-muted-foreground",
                children: "Carregando..."
            }, void 0, false, {
                fileName: "/dev-server/src/components/PollManager.tsx",
                lineNumber: 333,
                columnNumber: 9
            }, this) : polls.length === 0 ? /*#__PURE__*/ _jsxDEV("div", {
                className: "text-center py-12 text-muted-foreground",
                children: [
                    /*#__PURE__*/ _jsxDEV(BarChart3, {
                        className: "h-12 w-12 mx-auto mb-3 opacity-30"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/PollManager.tsx",
                        lineNumber: 336,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-sm",
                        children: "Nenhuma enquete criada ainda."
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/PollManager.tsx",
                        lineNumber: 337,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/PollManager.tsx",
                lineNumber: 335,
                columnNumber: 9
            }, this) : /*#__PURE__*/ _jsxDEV("div", {
                className: "space-y-4",
                children: polls.map((poll, pollIdx)=>{
                    const tv = totalVotes(poll);
                    const maxVotes = Math.max(...poll.options.map((o)=>o.votes || 0), 1);
                    const winnerIdx = poll.options.reduce((best, o, i, arr)=>(o.votes || 0) > (arr[best].votes || 0) ? i : best, 0);
                    return /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: 12
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        transition: {
                            delay: pollIdx * 0.05
                        },
                        className: "glass-card rounded-xl overflow-hidden",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "p-4 pb-3",
                                children: /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex items-start justify-between gap-3",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex-1 min-w-0",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex items-center gap-2 mb-2",
                                                    children: [
                                                        poll.active ? /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "px-2.5 py-1 rounded-full bg-success/15 text-success text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "w-1.5 h-1.5 rounded-full bg-success animate-pulse"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                                                    lineNumber: 360,
                                                                    columnNumber: 29
                                                                }, this),
                                                                "Ativa"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/components/PollManager.tsx",
                                                            lineNumber: 359,
                                                            columnNumber: 27
                                                        }, this) : /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "px-2.5 py-1 rounded-full bg-muted/60 text-muted-foreground text-[10px] font-bold uppercase tracking-wider",
                                                            children: "Inativa"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/PollManager.tsx",
                                                            lineNumber: 364,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("span", {
                                                            className: "text-[10px] text-muted-foreground",
                                                            children: formatDateFullBR(poll.created_at)
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/components/PollManager.tsx",
                                                            lineNumber: 368,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                                    lineNumber: 357,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("p", {
                                                    className: "font-bold text-foreground text-sm leading-snug",
                                                    children: poll.question
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                                    lineNumber: 372,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/PollManager.tsx",
                                            lineNumber: 356,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center gap-1 shrink-0",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>viewPollDetails(poll),
                                                    title: "Ver resultados",
                                                    className: "p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors",
                                                    children: /*#__PURE__*/ _jsxDEV(Eye, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 378,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                                    lineNumber: 376,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>toggleActive(poll),
                                                    title: poll.active ? "Desativar" : "Ativar",
                                                    className: `p-2 rounded-lg transition-colors ${poll.active ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted/50"}`,
                                                    children: poll.active ? /*#__PURE__*/ _jsxDEV(ToggleRight, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 382,
                                                        columnNumber: 40
                                                    }, this) : /*#__PURE__*/ _jsxDEV(ToggleLeft, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 382,
                                                        columnNumber: 78
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                                    lineNumber: 380,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>{
                                                        if (confirm("Excluir esta enquete?")) deletePoll(poll.id);
                                                    },
                                                    title: "Excluir",
                                                    className: "p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors",
                                                    children: /*#__PURE__*/ _jsxDEV(Trash2, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 386,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                                    lineNumber: 384,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/PollManager.tsx",
                                            lineNumber: 375,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                    lineNumber: 355,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 354,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "px-4 pb-4 space-y-2",
                                children: poll.options.map((opt, i)=>{
                                    const pct = tv > 0 ? Math.round((opt.votes || 0) / tv * 100) : 0;
                                    const isWinner = tv > 0 && i === winnerIdx;
                                    return /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center justify-between text-xs mb-1",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: `font-medium truncate mr-2 ${isWinner ? "text-primary" : "text-foreground"}`,
                                                        children: opt.label
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 400,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-muted-foreground tabular-nums shrink-0",
                                                        children: [
                                                            opt.votes || 0,
                                                            " ",
                                                            /*#__PURE__*/ _jsxDEV("span", {
                                                                className: "opacity-60",
                                                                children: [
                                                                    "(",
                                                                    pct,
                                                                    "%)"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                                lineNumber: 404,
                                                                columnNumber: 46
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                                        lineNumber: 403,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 399,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "h-2.5 bg-muted/30 rounded-full overflow-hidden",
                                                children: /*#__PURE__*/ _jsxDEV(motion.div, {
                                                    initial: {
                                                        width: 0
                                                    },
                                                    animate: {
                                                        width: `${pct}%`
                                                    },
                                                    transition: {
                                                        duration: 0.6,
                                                        ease: "easeOut",
                                                        delay: i * 0.1
                                                    },
                                                    className: `h-full rounded-full ${isWinner ? "bg-primary" : "bg-primary/40"}`
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/PollManager.tsx",
                                                    lineNumber: 408,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/PollManager.tsx",
                                                lineNumber: 407,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 398,
                                        columnNumber: 23
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 393,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "px-4 py-2.5 border-t border-border/40 bg-muted/10 flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-xs text-muted-foreground",
                                        children: [
                                            poll.options.length,
                                            " opções"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 422,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-xs font-semibold text-foreground tabular-nums",
                                        children: [
                                            tv,
                                            " voto",
                                            tv !== 1 ? "s" : ""
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/PollManager.tsx",
                                        lineNumber: 425,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/PollManager.tsx",
                                lineNumber: 421,
                                columnNumber: 17
                            }, this)
                        ]
                    }, poll.id, true, {
                        fileName: "/dev-server/src/components/PollManager.tsx",
                        lineNumber: 346,
                        columnNumber: 15
                    }, this);
                })
            }, void 0, false, {
                fileName: "/dev-server/src/components/PollManager.tsx",
                lineNumber: 340,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/PollManager.tsx",
        lineNumber: 178,
        columnNumber: 5
    }, this);
}
_s(PollManager, "NEJGw5spmn5MIL0fAXk4K7FhiS0=", false, function() {
    return [
        useAuth
    ];
});
_c = PollManager;
var _c;
$RefreshReg$(_c, "PollManager");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/PollManager.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/PollManager.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBvbGxNYW5hZ2VyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjaywgdXNlUmVmIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBzdXBhYmFzZSB9IGZyb20gXCJAL2ludGVncmF0aW9ucy9zdXBhYmFzZS9jbGllbnRcIjtcbmltcG9ydCB7IHVzZUF1dGggfSBmcm9tIFwiQC9ob29rcy91c2VBdXRoXCI7XG5pbXBvcnQgeyBtb3Rpb24sIEFuaW1hdGVQcmVzZW5jZSB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5pbXBvcnQgeyBCYXJDaGFydDMsIFBsdXMsIFRyYXNoMiwgVG9nZ2xlTGVmdCwgVG9nZ2xlUmlnaHQsIEV5ZSwgTG9hZGVyMiwgWCB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcbmltcG9ydCB7IHN0eWxlZFRvYXN0IGFzIHRvYXN0IH0gZnJvbSBcIkAvbGliL3RvYXN0XCI7XG5pbXBvcnQgeyBmb3JtYXRUaW1lQlIsIGZvcm1hdERhdGVGdWxsQlIgfSBmcm9tIFwiQC9saWIvdGltZXpvbmVcIjtcblxuaW50ZXJmYWNlIFBvbGxPcHRpb24ge1xuICBsYWJlbDogc3RyaW5nO1xuICB2b3RlczogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgUG9sbCB7XG4gIGlkOiBzdHJpbmc7XG4gIHF1ZXN0aW9uOiBzdHJpbmc7XG4gIG9wdGlvbnM6IFBvbGxPcHRpb25bXTtcbiAgYWN0aXZlOiBib29sZWFuO1xuICB0b3RhbF92b3RlczogbnVtYmVyO1xuICBjcmVhdGVkX2F0OiBzdHJpbmc7XG4gIGV4cGlyZXNfYXQ6IHN0cmluZyB8IG51bGw7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQb2xsTWFuYWdlcigpIHtcbiAgY29uc3QgeyB1c2VyIH0gPSB1c2VBdXRoKCk7XG4gIGNvbnN0IFtwb2xscywgc2V0UG9sbHNdID0gdXNlU3RhdGU8UG9sbFtdPihbXSk7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbc2hvd0NyZWF0ZSwgc2V0U2hvd0NyZWF0ZV0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtxdWVzdGlvbiwgc2V0UXVlc3Rpb25dID0gdXNlU3RhdGUoXCJcIik7XG4gIGNvbnN0IFtvcHRpb25zLCBzZXRPcHRpb25zXSA9IHVzZVN0YXRlKFtcIlwiLCBcIlwiXSk7XG4gIGNvbnN0IFtjcmVhdGluZywgc2V0Q3JlYXRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2VsZWN0ZWRQb2xsLCBzZXRTZWxlY3RlZFBvbGxdID0gdXNlU3RhdGU8UG9sbCB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbcG9sbFZvdGVzLCBzZXRQb2xsVm90ZXNdID0gdXNlU3RhdGU8eyBvcHRpb25faW5kZXg6IG51bWJlcjsgY3JlYXRlZF9hdDogc3RyaW5nIH1bXT4oW10pO1xuXG4gIGNvbnN0IGluaXRpYWxMb2FkRG9uZSA9IHVzZVJlZihmYWxzZSk7XG5cbiAgY29uc3QgZmV0Y2hQb2xscyA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgLmZyb20oXCJwb2xsc1wiKVxuICAgICAgICAuc2VsZWN0KFwiKlwiKVxuICAgICAgICAub3JkZXIoXCJjcmVhdGVkX2F0XCIsIHsgYXNjZW5kaW5nOiBmYWxzZSB9KTtcbiAgICAgIGlmIChlcnJvcikgdGhyb3cgZXJyb3I7XG4gICAgICBpZiAoZGF0YSkge1xuICAgICAgICBjb25zdCBwb2xsSWRzID0gZGF0YS5tYXAocCA9PiBwLmlkKTtcbiAgICAgICAgY29uc3QgeyBkYXRhOiBhbGxWb3RlcyB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgICAuZnJvbShcInBvbGxfdm90ZXNcIilcbiAgICAgICAgICAuc2VsZWN0KFwicG9sbF9pZCwgb3B0aW9uX2luZGV4XCIpXG4gICAgICAgICAgLmluKFwicG9sbF9pZFwiLCBwb2xsSWRzKTtcblxuICAgICAgICBjb25zdCB2b3Rlc01hcDogUmVjb3JkPHN0cmluZywgUmVjb3JkPG51bWJlciwgbnVtYmVyPj4gPSB7fTtcbiAgICAgICAgKGFsbFZvdGVzIHx8IFtdKS5mb3JFYWNoKCh2OiBhbnkpID0+IHtcbiAgICAgICAgICBpZiAoIXZvdGVzTWFwW3YucG9sbF9pZF0pIHZvdGVzTWFwW3YucG9sbF9pZF0gPSB7fTtcbiAgICAgICAgICB2b3Rlc01hcFt2LnBvbGxfaWRdW3Yub3B0aW9uX2luZGV4XSA9ICh2b3Rlc01hcFt2LnBvbGxfaWRdW3Yub3B0aW9uX2luZGV4XSB8fCAwKSArIDE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNldFBvbGxzKGRhdGEubWFwKHAgPT4ge1xuICAgICAgICAgIGNvbnN0IGJhc2VPcHRpb25zID0gKHAub3B0aW9ucyBhcyBhbnkgYXMgUG9sbE9wdGlvbltdKSB8fCBbXTtcbiAgICAgICAgICBjb25zdCBwb2xsVm90ZXNNYXAgPSB2b3Rlc01hcFtwLmlkXSB8fCB7fTtcbiAgICAgICAgICBjb25zdCBlbnJpY2hlZE9wdGlvbnMgPSBiYXNlT3B0aW9ucy5tYXAoKG9wdCwgaSkgPT4gKHsgLi4ub3B0LCB2b3RlczogcG9sbFZvdGVzTWFwW2ldIHx8IDAgfSkpO1xuICAgICAgICAgIGNvbnN0IHRvdGFsUmVhbCA9IE9iamVjdC52YWx1ZXMocG9sbFZvdGVzTWFwKS5yZWR1Y2UoKHMsIHYpID0+IHMgKyB2LCAwKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgaWQ6IHAuaWQsXG4gICAgICAgICAgICBxdWVzdGlvbjogcC5xdWVzdGlvbixcbiAgICAgICAgICAgIG9wdGlvbnM6IGVucmljaGVkT3B0aW9ucyxcbiAgICAgICAgICAgIGFjdGl2ZTogcC5hY3RpdmUsXG4gICAgICAgICAgICB0b3RhbF92b3RlczogdG90YWxSZWFsLFxuICAgICAgICAgICAgY3JlYXRlZF9hdDogcC5jcmVhdGVkX2F0LFxuICAgICAgICAgICAgZXhwaXJlc19hdDogcC5leHBpcmVzX2F0LFxuICAgICAgICAgIH07XG4gICAgICAgIH0pKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIHRvYXN0LmVycm9yKFwiRXJybyBhbyBjYXJyZWdhciBlbnF1ZXRlc1wiKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKCFpbml0aWFsTG9hZERvbmUuY3VycmVudCkge1xuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcbiAgICAgICAgaW5pdGlhbExvYWREb25lLmN1cnJlbnQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfSwgW10pO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7IGZldGNoUG9sbHMoKTsgfSwgW2ZldGNoUG9sbHNdKTtcblxuICAvLyBSZWFsdGltZSB1cGRhdGVzIGZvciB2b3Rlc1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNoYW5uZWwgPSBzdXBhYmFzZVxuICAgICAgLmNoYW5uZWwoXCJwb2xsLW1hbmFnZXItcmVhbHRpbWVcIilcbiAgICAgIC5vbihcInBvc3RncmVzX2NoYW5nZXNcIiwgeyBldmVudDogXCJJTlNFUlRcIiwgc2NoZW1hOiBcInB1YmxpY1wiLCB0YWJsZTogXCJwb2xsX3ZvdGVzXCIgfSwgKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3Qgdm90ZSA9IHBheWxvYWQubmV3IGFzIGFueTtcbiAgICAgICAgc2V0UG9sbHMocHJldiA9PiBwcmV2Lm1hcChwID0+IHtcbiAgICAgICAgICBpZiAocC5pZCAhPT0gdm90ZS5wb2xsX2lkKSByZXR1cm4gcDtcbiAgICAgICAgICBjb25zdCBuZXdPcHRzID0gWy4uLnAub3B0aW9uc107XG4gICAgICAgICAgaWYgKG5ld09wdHNbdm90ZS5vcHRpb25faW5kZXhdKSB7XG4gICAgICAgICAgICBuZXdPcHRzW3ZvdGUub3B0aW9uX2luZGV4XSA9IHsgLi4ubmV3T3B0c1t2b3RlLm9wdGlvbl9pbmRleF0sIHZvdGVzOiAobmV3T3B0c1t2b3RlLm9wdGlvbl9pbmRleF0udm90ZXMgfHwgMCkgKyAxIH07XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB7IC4uLnAsIG9wdGlvbnM6IG5ld09wdHMsIHRvdGFsX3ZvdGVzOiBwLnRvdGFsX3ZvdGVzICsgMSB9O1xuICAgICAgICB9KSk7XG4gICAgICAgIC8vIFVwZGF0ZSBzZWxlY3RlZCBwb2xsIGRldGFpbFxuICAgICAgICBpZiAoc2VsZWN0ZWRQb2xsPy5pZCA9PT0gdm90ZS5wb2xsX2lkKSB7XG4gICAgICAgICAgc2V0UG9sbFZvdGVzKHByZXYgPT4gWy4uLnByZXYsIHsgb3B0aW9uX2luZGV4OiB2b3RlLm9wdGlvbl9pbmRleCwgY3JlYXRlZF9hdDogdm90ZS5jcmVhdGVkX2F0IH1dKTtcbiAgICAgICAgICBzZXRTZWxlY3RlZFBvbGwocHJldiA9PiB7XG4gICAgICAgICAgICBpZiAoIXByZXYpIHJldHVybiBwcmV2O1xuICAgICAgICAgICAgY29uc3QgbmV3T3B0cyA9IFsuLi5wcmV2Lm9wdGlvbnNdO1xuICAgICAgICAgICAgaWYgKG5ld09wdHNbdm90ZS5vcHRpb25faW5kZXhdKSB7XG4gICAgICAgICAgICAgIG5ld09wdHNbdm90ZS5vcHRpb25faW5kZXhdID0geyAuLi5uZXdPcHRzW3ZvdGUub3B0aW9uX2luZGV4XSwgdm90ZXM6IChuZXdPcHRzW3ZvdGUub3B0aW9uX2luZGV4XS52b3RlcyB8fCAwKSArIDEgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IC4uLnByZXYsIG9wdGlvbnM6IG5ld09wdHMsIHRvdGFsX3ZvdGVzOiBwcmV2LnRvdGFsX3ZvdGVzICsgMSB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLm9uKFwicG9zdGdyZXNfY2hhbmdlc1wiLCB7IGV2ZW50OiBcIipcIiwgc2NoZW1hOiBcInB1YmxpY1wiLCB0YWJsZTogXCJwb2xsc1wiIH0sICgpID0+IHtcbiAgICAgICAgZmV0Y2hQb2xscygpO1xuICAgICAgfSlcbiAgICAgIC5zdWJzY3JpYmUoKTtcbiAgICByZXR1cm4gKCkgPT4geyBzdXBhYmFzZS5yZW1vdmVDaGFubmVsKGNoYW5uZWwpOyB9O1xuICB9LCBbc2VsZWN0ZWRQb2xsPy5pZCwgZmV0Y2hQb2xsc10pO1xuXG4gIGNvbnN0IGhhbmRsZUNyZWF0ZSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB0cmltbWVkUSA9IHF1ZXN0aW9uLnRyaW0oKTtcbiAgICBjb25zdCB0cmltbWVkT3B0cyA9IG9wdGlvbnMubWFwKG8gPT4gby50cmltKCkpLmZpbHRlcihvID0+IG8ubGVuZ3RoID4gMCk7XG4gICAgaWYgKCF0cmltbWVkUSkgeyB0b2FzdC5lcnJvcihcIkRpZ2l0ZSBhIHBlcmd1bnRhXCIpOyByZXR1cm47IH1cbiAgICBpZiAodHJpbW1lZE9wdHMubGVuZ3RoIDwgMikgeyB0b2FzdC5lcnJvcihcIk3DrW5pbW8gMiBvcMOnw7Vlc1wiKTsgcmV0dXJuOyB9XG4gICAgaWYgKCF1c2VyPy5pZCkgcmV0dXJuO1xuXG4gICAgc2V0Q3JlYXRpbmcodHJ1ZSk7XG4gICAgY29uc3Qgb3B0aW9uc0RhdGEgPSB0cmltbWVkT3B0cy5tYXAobGFiZWwgPT4gKHsgbGFiZWwsIHZvdGVzOiAwIH0pKTtcbiAgICBjb25zdCB7IGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKFwicG9sbHNcIikuaW5zZXJ0KHtcbiAgICAgIHF1ZXN0aW9uOiB0cmltbWVkUSxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnNEYXRhIGFzIGFueSxcbiAgICAgIGNyZWF0ZWRfYnk6IHVzZXIuaWQsXG4gICAgICBhY3RpdmU6IGZhbHNlLFxuICAgIH0pO1xuICAgIGlmIChlcnJvcikgeyB0b2FzdC5lcnJvcihcIkVycm86IFwiICsgZXJyb3IubWVzc2FnZSk7IH1cbiAgICBlbHNlIHtcbiAgICAgIHRvYXN0LnN1Y2Nlc3MoXCJFbnF1ZXRlIGNyaWFkYSFcIik7XG4gICAgICBzZXRRdWVzdGlvbihcIlwiKTtcbiAgICAgIHNldE9wdGlvbnMoW1wiXCIsIFwiXCJdKTtcbiAgICAgIHNldFNob3dDcmVhdGUoZmFsc2UpO1xuICAgICAgZmV0Y2hQb2xscygpO1xuICAgIH1cbiAgICBzZXRDcmVhdGluZyhmYWxzZSk7XG4gIH07XG5cbiAgY29uc3QgdG9nZ2xlQWN0aXZlID0gYXN5bmMgKHBvbGw6IFBvbGwpID0+IHtcbiAgICAvLyBJZiBhY3RpdmF0aW5nLCBkZWFjdGl2YXRlIGFsbCBvdGhlcnMgZmlyc3RcbiAgICBpZiAoIXBvbGwuYWN0aXZlKSB7XG4gICAgICBhd2FpdCBzdXBhYmFzZS5mcm9tKFwicG9sbHNcIikudXBkYXRlKHsgYWN0aXZlOiBmYWxzZSB9KS5uZXEoXCJpZFwiLCBwb2xsLmlkKTtcbiAgICB9XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbShcInBvbGxzXCIpLnVwZGF0ZSh7IGFjdGl2ZTogIXBvbGwuYWN0aXZlIH0pLmVxKFwiaWRcIiwgcG9sbC5pZCk7XG4gICAgaWYgKGVycm9yKSB0b2FzdC5lcnJvcihcIkVycm86IFwiICsgZXJyb3IubWVzc2FnZSk7XG4gICAgZWxzZSB7XG4gICAgICB0b2FzdC5zdWNjZXNzKHBvbGwuYWN0aXZlID8gXCJFbnF1ZXRlIGRlc2F0aXZhZGFcIiA6IFwiRW5xdWV0ZSBhdGl2YWRhIVwiKTtcbiAgICAgIGZldGNoUG9sbHMoKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgZGVsZXRlUG9sbCA9IGFzeW5jIChpZDogc3RyaW5nKSA9PiB7XG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbShcInBvbGxzXCIpLmRlbGV0ZSgpLmVxKFwiaWRcIiwgaWQpO1xuICAgIGlmIChlcnJvcikgdG9hc3QuZXJyb3IoXCJFcnJvOiBcIiArIGVycm9yLm1lc3NhZ2UpO1xuICAgIGVsc2UgeyB0b2FzdC5zdWNjZXNzKFwiRW5xdWV0ZSBleGNsdcOtZGFcIik7IGZldGNoUG9sbHMoKTsgaWYgKHNlbGVjdGVkUG9sbD8uaWQgPT09IGlkKSBzZXRTZWxlY3RlZFBvbGwobnVsbCk7IH1cbiAgfTtcblxuICBjb25zdCB2aWV3UG9sbERldGFpbHMgPSBhc3luYyAocG9sbDogUG9sbCkgPT4ge1xuICAgIHNldFNlbGVjdGVkUG9sbChwb2xsKTtcbiAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbShcInBvbGxfdm90ZXNcIilcbiAgICAgIC5zZWxlY3QoXCJvcHRpb25faW5kZXgsIGNyZWF0ZWRfYXRcIilcbiAgICAgIC5lcShcInBvbGxfaWRcIiwgcG9sbC5pZClcbiAgICAgIC5vcmRlcihcImNyZWF0ZWRfYXRcIiwgeyBhc2NlbmRpbmc6IGZhbHNlIH0pO1xuICAgIHNldFBvbGxWb3RlcyhkYXRhIHx8IFtdKTtcbiAgfTtcblxuICBjb25zdCB0b3RhbFZvdGVzID0gKHBvbGw6IFBvbGwpID0+IHBvbGwub3B0aW9ucy5yZWR1Y2UoKHMsIG8pID0+IHMgKyAoby52b3RlcyB8fCAwKSwgMCk7XG5cbiAgcmV0dXJuIChcbiAgICA8bW90aW9uLmRpdiBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDE2IH19IGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fSBjbGFzc05hbWU9XCJzcGFjZS15LTZcIj5cbiAgICAgIHsvKiBIZWFkZXIgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgc206ZmxleC1yb3cgc206aXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtNFwiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWV4dHJhYm9sZCB0ZXh0LWZvcmVncm91bmQgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgIDxCYXJDaGFydDMgY2xhc3NOYW1lPVwiaC02IHctNiB0ZXh0LXByaW1hcnlcIiAvPiBFbnF1ZXRlc1xuICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmQgbXQtMVwiPkNyaWUgZW5xdWV0ZXMgZSBhY29tcGFuaGUgYSB2b3Rhw6fDo28gZW0gdGVtcG8gcmVhbC48L3A+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd0NyZWF0ZSh0cnVlKX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweC00IHB5LTIuNSByb3VuZGVkLXhsIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgZm9udC1zZW1pYm9sZCBob3ZlcjpvcGFjaXR5LTkwIHRyYW5zaXRpb24tb3BhY2l0eSBnbG93LXByaW1hcnkgdGV4dC1zbVwiXG4gICAgICAgID5cbiAgICAgICAgICA8UGx1cyBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz4gTm92YSBFbnF1ZXRlXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG5cbiAgICAgIHsvKiBDcmVhdGUgTW9kYWwgKi99XG4gICAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAgICB7c2hvd0NyZWF0ZSAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC0wIGJnLWJsYWNrLzYwIGJhY2tkcm9wLWJsdXItc20gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgei1bNzBdIHAtNFwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dDcmVhdGUoZmFsc2UpfT5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjk1IH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdsYXNzLW1vZGFsIHJvdW5kZWQtMnhsIHAtNiB3LWZ1bGwgbWF4LXctbWRcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXtlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCl9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIG1iLTRcIj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+Tm92YSBFbnF1ZXRlPC9oMz5cbiAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHNldFNob3dDcmVhdGUoZmFsc2UpfSBjbGFzc05hbWU9XCJwLTEgcm91bmRlZC1tZCBob3ZlcjpiZy1tdXRlZC81MCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj48WCBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz48L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kIG1iLTFcIj5QZXJndW50YTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3F1ZXN0aW9ufVxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17ZSA9PiBzZXRRdWVzdGlvbihlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweC0zIHB5LTIuNSByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItaW5wdXQgYmctYmFja2dyb3VuZCB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbSBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctcHJpbWFyeS81MFwiXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRXg6IFF1YWwgb3BlcmFkb3JhIHZvY8OqIG1haXMgdXNhP1wiXG4gICAgICAgICAgICAgICAgICAgIG1heExlbmd0aD17MjAwfVxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwiYmxvY2sgdGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LWZvcmVncm91bmQgbWItMlwiPk9ww6fDtWVzPC9sYWJlbD5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICAgICAgICAgIHtvcHRpb25zLm1hcCgob3B0LCBpKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9e29wdH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e2UgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5ld09wdHMgPSBbLi4ub3B0aW9uc107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3T3B0c1tpXSA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldE9wdGlvbnMobmV3T3B0cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBweC0zIHB5LTIgcm91bmRlZC1sZyBib3JkZXIgYm9yZGVyLWlucHV0IGJnLWJhY2tncm91bmQgdGV4dC1mb3JlZ3JvdW5kIHRleHQtc20gZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXByaW1hcnkvNTBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17YE9ww6fDo28gJHtpICsgMX1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgICBtYXhMZW5ndGg9ezEwMH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICB7b3B0aW9ucy5sZW5ndGggPiAyICYmIChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRPcHRpb25zKG9wdGlvbnMuZmlsdGVyKChfLCBqKSA9PiBqICE9PSBpKSl9IGNsYXNzTmFtZT1cInAtMS41IHRleHQtZGVzdHJ1Y3RpdmUgaG92ZXI6YmctZGVzdHJ1Y3RpdmUvMTAgcm91bmRlZC1sZ1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxUcmFzaDIgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICB7b3B0aW9ucy5sZW5ndGggPCA2ICYmIChcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXRPcHRpb25zKFsuLi5vcHRpb25zLCBcIlwiXSl9IGNsYXNzTmFtZT1cIm10LTIgdGV4dC14cyB0ZXh0LXByaW1hcnkgZm9udC1tZWRpdW0gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgaG92ZXI6dW5kZXJsaW5lXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPFBsdXMgY2xhc3NOYW1lPVwiaC0zIHctM1wiIC8+IEFkaWNpb25hciBvcMOnw6NvXG4gICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZUNyZWF0ZX1cbiAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtjcmVhdGluZ31cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweS0yLjUgcm91bmRlZC14bCBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGZvbnQtc2VtaWJvbGQgdGV4dC1zbSBob3ZlcjpvcGFjaXR5LTkwIHRyYW5zaXRpb24tYWxsIGRpc2FibGVkOm9wYWNpdHktNTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTJcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtjcmVhdGluZyA/IDxMb2FkZXIyIGNsYXNzTmFtZT1cImgtNCB3LTQgYW5pbWF0ZS1zcGluXCIgLz4gOiA8QmFyQ2hhcnQzIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPn1cbiAgICAgICAgICAgICAgICAgIHtjcmVhdGluZyA/IFwiQ3JpYW5kby4uLlwiIDogXCJDcmlhciBFbnF1ZXRlXCJ9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG5cbiAgICAgIHsvKiBQb2xsIERldGFpbCBNb2RhbCAqL31cbiAgICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICAgIHtzZWxlY3RlZFBvbGwgJiYgKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay82MCBiYWNrZHJvcC1ibHVyLXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHotWzcwXSBwLTRcIiBvbkNsaWNrPXsoKSA9PiBzZXRTZWxlY3RlZFBvbGwobnVsbCl9PlxuICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC45NSB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxIH19XG4gICAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZ2xhc3MtbW9kYWwgcm91bmRlZC0yeGwgcC02IHctZnVsbCBtYXgtdy1tZCBtYXgtaC1bODB2aF0gb3ZlcmZsb3cteS1hdXRvXCJcbiAgICAgICAgICAgICAgb25DbGljaz17ZSA9PiBlLnN0b3BQcm9wYWdhdGlvbigpfVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi00XCI+XG4gICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPlJlc3VsdGFkb3M8L2gzPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0U2VsZWN0ZWRQb2xsKG51bGwpfSBjbGFzc05hbWU9XCJwLTEgcm91bmRlZC1tZCBob3ZlcjpiZy1tdXRlZC81MCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj48WCBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz48L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwiZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmQgbWItNFwiPntzZWxlY3RlZFBvbGwucXVlc3Rpb259PC9wPlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0zIG1iLTRcIj5cbiAgICAgICAgICAgICAgICB7c2VsZWN0ZWRQb2xsLm9wdGlvbnMubWFwKChvcHQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHR2ID0gdG90YWxWb3RlcyhzZWxlY3RlZFBvbGwpO1xuICAgICAgICAgICAgICAgICAgY29uc3QgcGN0ID0gdHYgPiAwID8gTWF0aC5yb3VuZCgoKG9wdC52b3RlcyB8fCAwKSAvIHR2KSAqIDEwMCkgOiAwO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9PlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gdGV4dC1zbSBtYi0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJmb250LW1lZGl1bSB0ZXh0LWZvcmVncm91bmRcIj57b3B0LmxhYmVsfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPntvcHQudm90ZXMgfHwgMH0gKHtwY3R9JSk8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTMgYmctbXV0ZWQvNDAgcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyB3aWR0aDogMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IHdpZHRoOiBgJHtwY3R9JWAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC44LCBlYXNlOiBcImVhc2VPdXRcIiB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJoLWZ1bGwgYmctcHJpbWFyeSByb3VuZGVkLWZ1bGxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH0pfVxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHRleHQtc20gZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgICAgICBUb3RhbDoge3RvdGFsVm90ZXMoc2VsZWN0ZWRQb2xsKX0gdm90b3NcbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAge3BvbGxWb3Rlcy5sZW5ndGggPiAwICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm10LTQgcHQtNCBib3JkZXItdCBib3JkZXItYm9yZGVyXCI+XG4gICAgICAgICAgICAgICAgICA8aDQgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCB1cHBlcmNhc2UgbWItMlwiPsOabHRpbW9zIHZvdG9zPC9oND5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0xIG1heC1oLTMyIG92ZXJmbG93LXktYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICB7cG9sbFZvdGVzLnNsaWNlKDAsIDIwKS5tYXAoKHYsIGkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gdGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPntzZWxlY3RlZFBvbGwub3B0aW9uc1t2Lm9wdGlvbl9pbmRleF0/LmxhYmVsIHx8IGBPcMOnw6NvICR7di5vcHRpb25faW5kZXggKyAxfWB9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2Zvcm1hdFRpbWVCUih2LmNyZWF0ZWRfYXQpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cbiAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxuXG4gICAgICB7LyogUG9sbHMgTGlzdCAqL31cbiAgICAgIHtsb2FkaW5nID8gKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHB5LTggdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+Q2FycmVnYW5kby4uLjwvZGl2PlxuICAgICAgKSA6IHBvbGxzLmxlbmd0aCA9PT0gMCA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS0xMiB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICA8QmFyQ2hhcnQzIGNsYXNzTmFtZT1cImgtMTIgdy0xMiBteC1hdXRvIG1iLTMgb3BhY2l0eS0zMFwiIC8+XG4gICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbVwiPk5lbmh1bWEgZW5xdWV0ZSBjcmlhZGEgYWluZGEuPC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICkgOiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAge3BvbGxzLm1hcCgocG9sbCwgcG9sbElkeCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHYgPSB0b3RhbFZvdGVzKHBvbGwpO1xuICAgICAgICAgICAgY29uc3QgbWF4Vm90ZXMgPSBNYXRoLm1heCguLi5wb2xsLm9wdGlvbnMubWFwKG8gPT4gby52b3RlcyB8fCAwKSwgMSk7XG4gICAgICAgICAgICBjb25zdCB3aW5uZXJJZHggPSBwb2xsLm9wdGlvbnMucmVkdWNlKChiZXN0LCBvLCBpLCBhcnIpID0+IChvLnZvdGVzIHx8IDApID4gKGFycltiZXN0XS52b3RlcyB8fCAwKSA/IGkgOiBiZXN0LCAwKTtcbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAga2V5PXtwb2xsLmlkfVxuICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMTIgfX1cbiAgICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiBwb2xsSWR4ICogMC4wNSB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImdsYXNzLWNhcmQgcm91bmRlZC14bCBvdmVyZmxvdy1oaWRkZW5cIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgey8qIFBvbGwgSGVhZGVyICovfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC00IHBiLTNcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1zdGFydCBqdXN0aWZ5LWJldHdlZW4gZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4LTEgbWluLXctMFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgbWItMlwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge3BvbGwuYWN0aXZlID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJweC0yLjUgcHktMSByb3VuZGVkLWZ1bGwgYmctc3VjY2Vzcy8xNSB0ZXh0LXN1Y2Nlc3MgdGV4dC1bMTBweF0gZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInctMS41IGgtMS41IHJvdW5kZWQtZnVsbCBiZy1zdWNjZXNzIGFuaW1hdGUtcHVsc2VcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEF0aXZhXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInB4LTIuNSBweS0xIHJvdW5kZWQtZnVsbCBiZy1tdXRlZC82MCB0ZXh0LW11dGVkLWZvcmVncm91bmQgdGV4dC1bMTBweF0gZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEluYXRpdmFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICB7Zm9ybWF0RGF0ZUZ1bGxCUihwb2xsLmNyZWF0ZWRfYXQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbSBsZWFkaW5nLXNudWdcIj57cG9sbC5xdWVzdGlvbn08L3A+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgc2hyaW5rLTBcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHZpZXdQb2xsRGV0YWlscyhwb2xsKX0gdGl0bGU9XCJWZXIgcmVzdWx0YWRvc1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwLTIgcm91bmRlZC1sZyBob3ZlcjpiZy1tdXRlZC81MCB0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6dGV4dC1mb3JlZ3JvdW5kIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8RXllIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gdG9nZ2xlQWN0aXZlKHBvbGwpfSB0aXRsZT17cG9sbC5hY3RpdmUgPyBcIkRlc2F0aXZhclwiIDogXCJBdGl2YXJcIn1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YHAtMiByb3VuZGVkLWxnIHRyYW5zaXRpb24tY29sb3JzICR7cG9sbC5hY3RpdmUgPyBcInRleHQtc3VjY2VzcyBob3ZlcjpiZy1zdWNjZXNzLzEwXCIgOiBcInRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3ZlcjpiZy1tdXRlZC81MFwifWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAge3BvbGwuYWN0aXZlID8gPFRvZ2dsZVJpZ2h0IGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPiA6IDxUb2dnbGVMZWZ0IGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPn1cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IHsgaWYgKGNvbmZpcm0oXCJFeGNsdWlyIGVzdGEgZW5xdWV0ZT9cIikpIGRlbGV0ZVBvbGwocG9sbC5pZCk7IH19IHRpdGxlPVwiRXhjbHVpclwiXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwLTIgcm91bmRlZC1sZyBob3ZlcjpiZy1kZXN0cnVjdGl2ZS8xMCB0ZXh0LW11dGVkLWZvcmVncm91bmQgaG92ZXI6dGV4dC1kZXN0cnVjdGl2ZSB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRyYXNoMiBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIHsvKiBPcHRpb25zIGJyZWFrZG93biAqL31cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB4LTQgcGItNCBzcGFjZS15LTJcIj5cbiAgICAgICAgICAgICAgICAgIHtwb2xsLm9wdGlvbnMubWFwKChvcHQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcGN0ID0gdHYgPiAwID8gTWF0aC5yb3VuZCgoKG9wdC52b3RlcyB8fCAwKSAvIHR2KSAqIDEwMCkgOiAwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpc1dpbm5lciA9IHR2ID4gMCAmJiBpID09PSB3aW5uZXJJZHg7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gdGV4dC14cyBtYi0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YGZvbnQtbWVkaXVtIHRydW5jYXRlIG1yLTIgJHtpc1dpbm5lciA/IFwidGV4dC1wcmltYXJ5XCIgOiBcInRleHQtZm9yZWdyb3VuZFwifWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtvcHQubGFiZWx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRhYnVsYXItbnVtcyBzaHJpbmstMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtvcHQudm90ZXMgfHwgMH0gPHNwYW4gY2xhc3NOYW1lPVwib3BhY2l0eS02MFwiPih7cGN0fSUpPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC0yLjUgYmctbXV0ZWQvMzAgcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgd2lkdGg6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IHdpZHRoOiBgJHtwY3R9JWAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjYsIGVhc2U6IFwiZWFzZU91dFwiLCBkZWxheTogaSAqIDAuMSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGgtZnVsbCByb3VuZGVkLWZ1bGwgJHtpc1dpbm5lciA/IFwiYmctcHJpbWFyeVwiIDogXCJiZy1wcmltYXJ5LzQwXCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICB7LyogRm9vdGVyICovfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtNCBweS0yLjUgYm9yZGVyLXQgYm9yZGVyLWJvcmRlci80MCBiZy1tdXRlZC8xMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgIHtwb2xsLm9wdGlvbnMubGVuZ3RofSBvcMOnw7Vlc1xuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZCB0YWJ1bGFyLW51bXNcIj5cbiAgICAgICAgICAgICAgICAgICAge3R2fSB2b3Rve3R2ICE9PSAxID8gXCJzXCIgOiBcIlwifVxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICl9XG4gICAgPC9tb3Rpb24uZGl2PlxuICApO1xufVxuIl0sIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlQ2FsbGJhY2siLCJ1c2VSZWYiLCJzdXBhYmFzZSIsInVzZUF1dGgiLCJtb3Rpb24iLCJBbmltYXRlUHJlc2VuY2UiLCJCYXJDaGFydDMiLCJQbHVzIiwiVHJhc2gyIiwiVG9nZ2xlTGVmdCIsIlRvZ2dsZVJpZ2h0IiwiRXllIiwiTG9hZGVyMiIsIlgiLCJzdHlsZWRUb2FzdCIsInRvYXN0IiwiZm9ybWF0VGltZUJSIiwiZm9ybWF0RGF0ZUZ1bGxCUiIsIlBvbGxNYW5hZ2VyIiwidXNlciIsInBvbGxzIiwic2V0UG9sbHMiLCJsb2FkaW5nIiwic2V0TG9hZGluZyIsInNob3dDcmVhdGUiLCJzZXRTaG93Q3JlYXRlIiwicXVlc3Rpb24iLCJzZXRRdWVzdGlvbiIsIm9wdGlvbnMiLCJzZXRPcHRpb25zIiwiY3JlYXRpbmciLCJzZXRDcmVhdGluZyIsInNlbGVjdGVkUG9sbCIsInNldFNlbGVjdGVkUG9sbCIsInBvbGxWb3RlcyIsInNldFBvbGxWb3RlcyIsImluaXRpYWxMb2FkRG9uZSIsImZldGNoUG9sbHMiLCJkYXRhIiwiZXJyb3IiLCJmcm9tIiwic2VsZWN0Iiwib3JkZXIiLCJhc2NlbmRpbmciLCJwb2xsSWRzIiwibWFwIiwicCIsImlkIiwiYWxsVm90ZXMiLCJpbiIsInZvdGVzTWFwIiwiZm9yRWFjaCIsInYiLCJwb2xsX2lkIiwib3B0aW9uX2luZGV4IiwiYmFzZU9wdGlvbnMiLCJwb2xsVm90ZXNNYXAiLCJlbnJpY2hlZE9wdGlvbnMiLCJvcHQiLCJpIiwidm90ZXMiLCJ0b3RhbFJlYWwiLCJPYmplY3QiLCJ2YWx1ZXMiLCJyZWR1Y2UiLCJzIiwiYWN0aXZlIiwidG90YWxfdm90ZXMiLCJjcmVhdGVkX2F0IiwiZXhwaXJlc19hdCIsImVyciIsImNvbnNvbGUiLCJjdXJyZW50IiwiY2hhbm5lbCIsIm9uIiwiZXZlbnQiLCJzY2hlbWEiLCJ0YWJsZSIsInBheWxvYWQiLCJ2b3RlIiwibmV3IiwicHJldiIsIm5ld09wdHMiLCJzdWJzY3JpYmUiLCJyZW1vdmVDaGFubmVsIiwiaGFuZGxlQ3JlYXRlIiwidHJpbW1lZFEiLCJ0cmltIiwidHJpbW1lZE9wdHMiLCJvIiwiZmlsdGVyIiwibGVuZ3RoIiwib3B0aW9uc0RhdGEiLCJsYWJlbCIsImluc2VydCIsImNyZWF0ZWRfYnkiLCJtZXNzYWdlIiwic3VjY2VzcyIsInRvZ2dsZUFjdGl2ZSIsInBvbGwiLCJ1cGRhdGUiLCJuZXEiLCJlcSIsImRlbGV0ZVBvbGwiLCJkZWxldGUiLCJ2aWV3UG9sbERldGFpbHMiLCJ0b3RhbFZvdGVzIiwiZGl2IiwiaW5pdGlhbCIsIm9wYWNpdHkiLCJ5IiwiYW5pbWF0ZSIsImNsYXNzTmFtZSIsImgyIiwiYnV0dG9uIiwib25DbGljayIsInNjYWxlIiwiZXhpdCIsImUiLCJzdG9wUHJvcGFnYXRpb24iLCJoMyIsImlucHV0IiwidmFsdWUiLCJvbkNoYW5nZSIsInRhcmdldCIsInBsYWNlaG9sZGVyIiwibWF4TGVuZ3RoIiwiXyIsImoiLCJkaXNhYmxlZCIsInR2IiwicGN0IiwiTWF0aCIsInJvdW5kIiwic3BhbiIsIndpZHRoIiwidHJhbnNpdGlvbiIsImR1cmF0aW9uIiwiZWFzZSIsImg0Iiwic2xpY2UiLCJwb2xsSWR4IiwibWF4Vm90ZXMiLCJtYXgiLCJ3aW5uZXJJZHgiLCJiZXN0IiwiYXJyIiwiZGVsYXkiLCJ0aXRsZSIsImNvbmZpcm0iLCJpc1dpbm5lciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsUUFBUSxFQUFFQyxTQUFTLEVBQUVDLFdBQVcsRUFBRUMsTUFBTSxRQUFRLFFBQVE7QUFDakUsU0FBU0MsUUFBUSxRQUFRLGlDQUFpQztBQUMxRCxTQUFTQyxPQUFPLFFBQVEsa0JBQWtCO0FBQzFDLFNBQVNDLE1BQU0sRUFBRUMsZUFBZSxRQUFRLGdCQUFnQjtBQUN4RCxTQUFTQyxTQUFTLEVBQUVDLElBQUksRUFBRUMsTUFBTSxFQUFFQyxVQUFVLEVBQUVDLFdBQVcsRUFBRUMsR0FBRyxFQUFFQyxPQUFPLEVBQUVDLENBQUMsUUFBUSxlQUFlO0FBQ2pHLFNBQVNDLGVBQWVDLEtBQUssUUFBUSxjQUFjO0FBQ25ELFNBQVNDLFlBQVksRUFBRUMsZ0JBQWdCLFFBQVEsaUJBQWlCO0FBaUJo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