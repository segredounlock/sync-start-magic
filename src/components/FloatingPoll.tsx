import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/FloatingPoll.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/FloatingPoll.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"]; const useCallback = __vite__cjsImport3_react["useCallback"];
import { supabase } from "/src/integrations/supabase/client.ts";
import { useAuth } from "/src/hooks/useAuth.tsx";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { BarChart3, X, Check, ChevronUp } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
export function FloatingPoll() {
    _s();
    const { user } = useAuth();
    const [poll, setPoll] = useState(null);
    const [voted, setVoted] = useState(false);
    const [votedIndex, setVotedIndex] = useState(null);
    const [voting, setVoting] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const fetchActivePoll = useCallback(async ()=>{
        const { data } = await supabase.from("polls").select("*").eq("active", true).order("created_at", {
            ascending: false
        }).limit(1);
        if (data && data.length > 0) {
            const p = data[0];
            const baseOptions = p.options || [];
            // Count real votes using security definer function (works for all users)
            const { data: voteCounts } = await supabase.rpc("get_poll_vote_counts", {
                _poll_id: p.id
            });
            const counts = {};
            let totalReal = 0;
            (voteCounts || []).forEach((v)=>{
                counts[v.option_index] = Number(v.vote_count) || 0;
                totalReal += Number(v.vote_count) || 0;
            });
            const enrichedOptions = baseOptions.map((opt, i)=>({
                    ...opt,
                    votes: counts[i] || 0
                }));
            setPoll({
                id: p.id,
                question: p.question,
                options: enrichedOptions,
                total_votes: totalReal,
                expires_at: p.expires_at
            });
            setDismissed(false);
            // Check if user already voted
            if (user?.id) {
                const { data: voteData } = await supabase.from("poll_votes").select("option_index").eq("poll_id", p.id).eq("user_id", user.id).maybeSingle();
                if (voteData) {
                    setVoted(true);
                    setVotedIndex(voteData.option_index);
                } else {
                    setVoted(false);
                    setVotedIndex(null);
                }
            }
        } else {
            setPoll(null);
        }
    }, [
        user?.id
    ]);
    useEffect(()=>{
        fetchActivePoll();
    }, [
        fetchActivePoll
    ]);
    // Realtime: listen for poll changes and new votes
    useEffect(()=>{
        const pollChannel = supabase.channel("floating-poll-updates").on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "polls"
        }, ()=>{
            fetchActivePoll();
        }).on("postgres_changes", {
            event: "INSERT",
            schema: "public",
            table: "poll_votes"
        }, (payload)=>{
            // Update vote counts in real-time
            const newVote = payload.new;
            if (poll && newVote.poll_id === poll.id) {
                setPoll((prev)=>{
                    if (!prev) return prev;
                    const newOptions = [
                        ...prev.options
                    ];
                    if (newOptions[newVote.option_index]) {
                        newOptions[newVote.option_index] = {
                            ...newOptions[newVote.option_index],
                            votes: (newOptions[newVote.option_index].votes || 0) + 1
                        };
                    }
                    return {
                        ...prev,
                        options: newOptions,
                        total_votes: prev.total_votes + 1
                    };
                });
            }
        }).subscribe();
        return ()=>{
            supabase.removeChannel(pollChannel);
        };
    }, [
        poll?.id,
        fetchActivePoll
    ]);
    const handleVote = async (index)=>{
        if (!user?.id || !poll || voted || voting) return;
        setVoting(true);
        try {
            const { error } = await supabase.from("poll_votes").insert({
                poll_id: poll.id,
                user_id: user.id,
                option_index: index
            });
            if (error) {
                if (error.message.includes("duplicate")) {
                    setVoted(true);
                    setVotedIndex(index);
                }
                return;
            }
            setVoted(true);
            setVotedIndex(index);
            // Update local count
            setPoll((prev)=>{
                if (!prev) return prev;
                const newOptions = [
                    ...prev.options
                ];
                if (newOptions[index]) {
                    newOptions[index] = {
                        ...newOptions[index],
                        votes: (newOptions[index].votes || 0) + 1
                    };
                }
                return {
                    ...prev,
                    options: newOptions,
                    total_votes: prev.total_votes + 1
                };
            });
        } catch  {}
        setVoting(false);
    };
    if (!poll || dismissed) return null;
    const totalVotes = poll.options.reduce((sum, o)=>sum + (o.votes || 0), 0);
    return /*#__PURE__*/ _jsxDEV(AnimatePresence, {
        children: /*#__PURE__*/ _jsxDEV(motion.div, {
            initial: {
                opacity: 0,
                y: 80,
                scale: 0.9
            },
            animate: {
                opacity: 1,
                y: 0,
                scale: 1
            },
            exit: {
                opacity: 0,
                y: 80,
                scale: 0.9
            },
            className: "fixed bottom-20 right-4 z-30 w-[calc(100%-2rem)] max-w-xs",
            children: minimized ? /*#__PURE__*/ _jsxDEV("button", {
                onClick: ()=>setMinimized(false),
                className: "ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card glow-primary text-sm font-semibold text-foreground shadow-lg",
                children: [
                    /*#__PURE__*/ _jsxDEV(BarChart3, {
                        className: "h-4 w-4 text-primary"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                        lineNumber: 168,
                        columnNumber: 13
                    }, this),
                    "Enquete",
                    /*#__PURE__*/ _jsxDEV(ChevronUp, {
                        className: "h-3.5 w-3.5 text-muted-foreground"
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                        lineNumber: 170,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/FloatingPoll.tsx",
                lineNumber: 164,
                columnNumber: 11
            }, this) : /*#__PURE__*/ _jsxDEV("div", {
                className: "glass-modal rounded-2xl p-4 shadow-2xl border border-primary/20",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-start justify-between mb-3",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "p-1.5 rounded-lg bg-primary/15",
                                        children: /*#__PURE__*/ _jsxDEV(BarChart3, {
                                            className: "h-4 w-4 text-primary"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                            lineNumber: 178,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                        lineNumber: 177,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-xs font-semibold text-primary uppercase tracking-wider",
                                        children: "Enquete"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                        lineNumber: 180,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                lineNumber: 176,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-1",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>setMinimized(true),
                                        className: "p-1 rounded-md hover:bg-muted/50 text-muted-foreground",
                                        children: /*#__PURE__*/ _jsxDEV(ChevronUp, {
                                            className: "h-3.5 w-3.5 rotate-180"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                            lineNumber: 184,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                        lineNumber: 183,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>setDismissed(true),
                                        className: "p-1 rounded-md hover:bg-destructive/15 text-destructive",
                                        children: /*#__PURE__*/ _jsxDEV(X, {
                                            className: "h-3.5 w-3.5"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                            lineNumber: 187,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                        lineNumber: 186,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                lineNumber: 182,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                        lineNumber: 175,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-sm font-bold text-foreground mb-3 leading-snug",
                        children: poll.question
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                        lineNumber: 193,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-2",
                        children: poll.options.map((opt, i)=>{
                            const pct = totalVotes > 0 ? Math.round((opt.votes || 0) / totalVotes * 100) : 0;
                            const isMyVote = votedIndex === i;
                            return /*#__PURE__*/ _jsxDEV("button", {
                                onClick: ()=>handleVote(i),
                                disabled: voted || voting,
                                className: `w-full relative rounded-xl text-left text-sm transition-all overflow-hidden ${voted ? "cursor-default" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"} ${isMyVote ? "ring-2 ring-primary/50" : ""}`,
                                children: [
                                    voted && /*#__PURE__*/ _jsxDEV(motion.div, {
                                        initial: {
                                            width: 0
                                        },
                                        animate: {
                                            width: `${pct}%`
                                        },
                                        transition: {
                                            duration: 0.6,
                                            ease: "easeOut"
                                        },
                                        className: `absolute inset-y-0 left-0 rounded-xl ${isMyVote ? "bg-primary/20" : "bg-muted/60"}`
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                        lineNumber: 214,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: `relative flex items-center justify-between px-3 py-2.5 rounded-xl border ${voted ? "border-border/50" : "border-border hover:border-primary/40 bg-muted/30"}`,
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: `font-medium ${isMyVote ? "text-primary" : "text-foreground"}`,
                                                children: [
                                                    isMyVote && /*#__PURE__*/ _jsxDEV(Check, {
                                                        className: "h-3.5 w-3.5 inline mr-1.5"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                                        lineNumber: 225,
                                                        columnNumber: 38
                                                    }, this),
                                                    opt.label
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                                lineNumber: 224,
                                                columnNumber: 23
                                            }, this),
                                            voted && /*#__PURE__*/ _jsxDEV("span", {
                                                className: "text-xs font-semibold text-muted-foreground ml-2 shrink-0",
                                                children: [
                                                    pct,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                                lineNumber: 229,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                        lineNumber: 221,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, i, true, {
                                fileName: "/dev-server/src/components/FloatingPoll.tsx",
                                lineNumber: 202,
                                columnNumber: 19
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                        lineNumber: 196,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        className: "text-[10px] text-muted-foreground mt-2.5 text-center",
                        children: [
                            totalVotes,
                            " voto",
                            totalVotes !== 1 ? "s" : "",
                            voted && " • Obrigado pelo seu voto!"
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/FloatingPoll.tsx",
                        lineNumber: 238,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/FloatingPoll.tsx",
                lineNumber: 173,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/components/FloatingPoll.tsx",
            lineNumber: 157,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "/dev-server/src/components/FloatingPoll.tsx",
        lineNumber: 156,
        columnNumber: 5
    }, this);
}
_s(FloatingPoll, "aoZ9+gCXvop+i4HuxXhmvR04z3c=", false, function() {
    return [
        useAuth
    ];
});
_c = FloatingPoll;
var _c;
$RefreshReg$(_c, "FloatingPoll");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/FloatingPoll.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/FloatingPoll.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb2F0aW5nUG9sbC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCwgdXNlQ2FsbGJhY2sgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSBcIkAvaW50ZWdyYXRpb25zL3N1cGFiYXNlL2NsaWVudFwiO1xuaW1wb3J0IHsgdXNlQXV0aCB9IGZyb20gXCJAL2hvb2tzL3VzZUF1dGhcIjtcbmltcG9ydCB7IG1vdGlvbiwgQW5pbWF0ZVByZXNlbmNlIH0gZnJvbSBcImZyYW1lci1tb3Rpb25cIjtcbmltcG9ydCB7IEJhckNoYXJ0MywgWCwgQ2hlY2ssIENoZXZyb25VcCB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcblxuaW50ZXJmYWNlIFBvbGxPcHRpb24ge1xuICBsYWJlbDogc3RyaW5nO1xuICB2b3RlczogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgUG9sbCB7XG4gIGlkOiBzdHJpbmc7XG4gIHF1ZXN0aW9uOiBzdHJpbmc7XG4gIG9wdGlvbnM6IFBvbGxPcHRpb25bXTtcbiAgdG90YWxfdm90ZXM6IG51bWJlcjtcbiAgZXhwaXJlc19hdDogc3RyaW5nIHwgbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEZsb2F0aW5nUG9sbCgpIHtcbiAgY29uc3QgeyB1c2VyIH0gPSB1c2VBdXRoKCk7XG4gIGNvbnN0IFtwb2xsLCBzZXRQb2xsXSA9IHVzZVN0YXRlPFBvbGwgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3ZvdGVkLCBzZXRWb3RlZF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFt2b3RlZEluZGV4LCBzZXRWb3RlZEluZGV4XSA9IHVzZVN0YXRlPG51bWJlciB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbdm90aW5nLCBzZXRWb3RpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbbWluaW1pemVkLCBzZXRNaW5pbWl6ZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbZGlzbWlzc2VkLCBzZXREaXNtaXNzZWRdID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIGNvbnN0IGZldGNoQWN0aXZlUG9sbCA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbShcInBvbGxzXCIpXG4gICAgICAuc2VsZWN0KFwiKlwiKVxuICAgICAgLmVxKFwiYWN0aXZlXCIsIHRydWUpXG4gICAgICAub3JkZXIoXCJjcmVhdGVkX2F0XCIsIHsgYXNjZW5kaW5nOiBmYWxzZSB9KVxuICAgICAgLmxpbWl0KDEpO1xuXG4gICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICBjb25zdCBwID0gZGF0YVswXTtcbiAgICAgIGNvbnN0IGJhc2VPcHRpb25zID0gKHAub3B0aW9ucyBhcyBhbnkgYXMgUG9sbE9wdGlvbltdKSB8fCBbXTtcblxuICAgICAgLy8gQ291bnQgcmVhbCB2b3RlcyB1c2luZyBzZWN1cml0eSBkZWZpbmVyIGZ1bmN0aW9uICh3b3JrcyBmb3IgYWxsIHVzZXJzKVxuICAgICAgY29uc3QgeyBkYXRhOiB2b3RlQ291bnRzIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAucnBjKFwiZ2V0X3BvbGxfdm90ZV9jb3VudHNcIiwgeyBfcG9sbF9pZDogcC5pZCB9KTtcblxuICAgICAgY29uc3QgY291bnRzOiBSZWNvcmQ8bnVtYmVyLCBudW1iZXI+ID0ge307XG4gICAgICBsZXQgdG90YWxSZWFsID0gMDtcbiAgICAgICh2b3RlQ291bnRzIHx8IFtdKS5mb3JFYWNoKCh2OiBhbnkpID0+IHtcbiAgICAgICAgY291bnRzW3Yub3B0aW9uX2luZGV4XSA9IE51bWJlcih2LnZvdGVfY291bnQpIHx8IDA7XG4gICAgICAgIHRvdGFsUmVhbCArPSBOdW1iZXIodi52b3RlX2NvdW50KSB8fCAwO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGVucmljaGVkT3B0aW9ucyA9IGJhc2VPcHRpb25zLm1hcCgob3B0LCBpKSA9PiAoe1xuICAgICAgICAuLi5vcHQsXG4gICAgICAgIHZvdGVzOiBjb3VudHNbaV0gfHwgMCxcbiAgICAgIH0pKTtcblxuICAgICAgc2V0UG9sbCh7XG4gICAgICAgIGlkOiBwLmlkLFxuICAgICAgICBxdWVzdGlvbjogcC5xdWVzdGlvbixcbiAgICAgICAgb3B0aW9uczogZW5yaWNoZWRPcHRpb25zLFxuICAgICAgICB0b3RhbF92b3RlczogdG90YWxSZWFsLFxuICAgICAgICBleHBpcmVzX2F0OiBwLmV4cGlyZXNfYXQsXG4gICAgICB9KTtcbiAgICAgIHNldERpc21pc3NlZChmYWxzZSk7XG5cbiAgICAgIC8vIENoZWNrIGlmIHVzZXIgYWxyZWFkeSB2b3RlZFxuICAgICAgaWYgKHVzZXI/LmlkKSB7XG4gICAgICAgIGNvbnN0IHsgZGF0YTogdm90ZURhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgICAgLmZyb20oXCJwb2xsX3ZvdGVzXCIpXG4gICAgICAgICAgLnNlbGVjdChcIm9wdGlvbl9pbmRleFwiKVxuICAgICAgICAgIC5lcShcInBvbGxfaWRcIiwgcC5pZClcbiAgICAgICAgICAuZXEoXCJ1c2VyX2lkXCIsIHVzZXIuaWQpXG4gICAgICAgICAgLm1heWJlU2luZ2xlKCk7XG4gICAgICAgIGlmICh2b3RlRGF0YSkge1xuICAgICAgICAgIHNldFZvdGVkKHRydWUpO1xuICAgICAgICAgIHNldFZvdGVkSW5kZXgodm90ZURhdGEub3B0aW9uX2luZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRWb3RlZChmYWxzZSk7XG4gICAgICAgICAgc2V0Vm90ZWRJbmRleChudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzZXRQb2xsKG51bGwpO1xuICAgIH1cbiAgfSwgW3VzZXI/LmlkXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBmZXRjaEFjdGl2ZVBvbGwoKTtcbiAgfSwgW2ZldGNoQWN0aXZlUG9sbF0pO1xuXG4gIC8vIFJlYWx0aW1lOiBsaXN0ZW4gZm9yIHBvbGwgY2hhbmdlcyBhbmQgbmV3IHZvdGVzXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcG9sbENoYW5uZWwgPSBzdXBhYmFzZVxuICAgICAgLmNoYW5uZWwoXCJmbG9hdGluZy1wb2xsLXVwZGF0ZXNcIilcbiAgICAgIC5vbihcInBvc3RncmVzX2NoYW5nZXNcIiwgeyBldmVudDogXCIqXCIsIHNjaGVtYTogXCJwdWJsaWNcIiwgdGFibGU6IFwicG9sbHNcIiB9LCAoKSA9PiB7XG4gICAgICAgIGZldGNoQWN0aXZlUG9sbCgpO1xuICAgICAgfSlcbiAgICAgIC5vbihcInBvc3RncmVzX2NoYW5nZXNcIiwgeyBldmVudDogXCJJTlNFUlRcIiwgc2NoZW1hOiBcInB1YmxpY1wiLCB0YWJsZTogXCJwb2xsX3ZvdGVzXCIgfSwgKHBheWxvYWQpID0+IHtcbiAgICAgICAgLy8gVXBkYXRlIHZvdGUgY291bnRzIGluIHJlYWwtdGltZVxuICAgICAgICBjb25zdCBuZXdWb3RlID0gcGF5bG9hZC5uZXcgYXMgYW55O1xuICAgICAgICBpZiAocG9sbCAmJiBuZXdWb3RlLnBvbGxfaWQgPT09IHBvbGwuaWQpIHtcbiAgICAgICAgICBzZXRQb2xsKHByZXYgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcmV2KSByZXR1cm4gcHJldjtcbiAgICAgICAgICAgIGNvbnN0IG5ld09wdGlvbnMgPSBbLi4ucHJldi5vcHRpb25zXTtcbiAgICAgICAgICAgIGlmIChuZXdPcHRpb25zW25ld1ZvdGUub3B0aW9uX2luZGV4XSkge1xuICAgICAgICAgICAgICBuZXdPcHRpb25zW25ld1ZvdGUub3B0aW9uX2luZGV4XSA9IHtcbiAgICAgICAgICAgICAgICAuLi5uZXdPcHRpb25zW25ld1ZvdGUub3B0aW9uX2luZGV4XSxcbiAgICAgICAgICAgICAgICB2b3RlczogKG5ld09wdGlvbnNbbmV3Vm90ZS5vcHRpb25faW5kZXhdLnZvdGVzIHx8IDApICsgMSxcbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IC4uLnByZXYsIG9wdGlvbnM6IG5ld09wdGlvbnMsIHRvdGFsX3ZvdGVzOiBwcmV2LnRvdGFsX3ZvdGVzICsgMSB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnN1YnNjcmliZSgpO1xuXG4gICAgcmV0dXJuICgpID0+IHsgc3VwYWJhc2UucmVtb3ZlQ2hhbm5lbChwb2xsQ2hhbm5lbCk7IH07XG4gIH0sIFtwb2xsPy5pZCwgZmV0Y2hBY3RpdmVQb2xsXSk7XG5cbiAgY29uc3QgaGFuZGxlVm90ZSA9IGFzeW5jIChpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgaWYgKCF1c2VyPy5pZCB8fCAhcG9sbCB8fCB2b3RlZCB8fCB2b3RpbmcpIHJldHVybjtcbiAgICBzZXRWb3RpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHsgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oXCJwb2xsX3ZvdGVzXCIpLmluc2VydCh7XG4gICAgICAgIHBvbGxfaWQ6IHBvbGwuaWQsXG4gICAgICAgIHVzZXJfaWQ6IHVzZXIuaWQsXG4gICAgICAgIG9wdGlvbl9pbmRleDogaW5kZXgsXG4gICAgICB9KTtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IubWVzc2FnZS5pbmNsdWRlcyhcImR1cGxpY2F0ZVwiKSkge1xuICAgICAgICAgIHNldFZvdGVkKHRydWUpO1xuICAgICAgICAgIHNldFZvdGVkSW5kZXgoaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHNldFZvdGVkKHRydWUpO1xuICAgICAgc2V0Vm90ZWRJbmRleChpbmRleCk7XG4gICAgICAvLyBVcGRhdGUgbG9jYWwgY291bnRcbiAgICAgIHNldFBvbGwocHJldiA9PiB7XG4gICAgICAgIGlmICghcHJldikgcmV0dXJuIHByZXY7XG4gICAgICAgIGNvbnN0IG5ld09wdGlvbnMgPSBbLi4ucHJldi5vcHRpb25zXTtcbiAgICAgICAgaWYgKG5ld09wdGlvbnNbaW5kZXhdKSB7XG4gICAgICAgICAgbmV3T3B0aW9uc1tpbmRleF0gPSB7IC4uLm5ld09wdGlvbnNbaW5kZXhdLCB2b3RlczogKG5ld09wdGlvbnNbaW5kZXhdLnZvdGVzIHx8IDApICsgMSB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7IC4uLnByZXYsIG9wdGlvbnM6IG5ld09wdGlvbnMsIHRvdGFsX3ZvdGVzOiBwcmV2LnRvdGFsX3ZvdGVzICsgMSB9O1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCB7IC8qICovIH1cbiAgICBzZXRWb3RpbmcoZmFsc2UpO1xuICB9O1xuXG4gIGlmICghcG9sbCB8fCBkaXNtaXNzZWQpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IHRvdGFsVm90ZXMgPSBwb2xsLm9wdGlvbnMucmVkdWNlKChzdW0sIG8pID0+IHN1bSArIChvLnZvdGVzIHx8IDApLCAwKTtcblxuICByZXR1cm4gKFxuICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICA8bW90aW9uLmRpdlxuICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDgwLCBzY2FsZTogMC45IH19XG4gICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCwgc2NhbGU6IDEgfX1cbiAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwLCB5OiA4MCwgc2NhbGU6IDAuOSB9fVxuICAgICAgICBjbGFzc05hbWU9XCJmaXhlZCBib3R0b20tMjAgcmlnaHQtNCB6LTMwIHctW2NhbGMoMTAwJS0ycmVtKV0gbWF4LXcteHNcIlxuICAgICAgPlxuICAgICAgICB7bWluaW1pemVkID8gKFxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1pbmltaXplZChmYWxzZSl9XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJtbC1hdXRvIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB4LTQgcHktMi41IHJvdW5kZWQteGwgZ2xhc3MtY2FyZCBnbG93LXByaW1hcnkgdGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZCBzaGFkb3ctbGdcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxCYXJDaGFydDMgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgRW5xdWV0ZVxuICAgICAgICAgICAgPENoZXZyb25VcCBjbGFzc05hbWU9XCJoLTMuNSB3LTMuNSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIiAvPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICApIDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtbW9kYWwgcm91bmRlZC0yeGwgcC00IHNoYWRvdy0yeGwgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwXCI+XG4gICAgICAgICAgICB7LyogSGVhZGVyICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLXN0YXJ0IGp1c3RpZnktYmV0d2VlbiBtYi0zXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMS41IHJvdW5kZWQtbGcgYmctcHJpbWFyeS8xNVwiPlxuICAgICAgICAgICAgICAgICAgPEJhckNoYXJ0MyBjbGFzc05hbWU9XCJoLTQgdy00IHRleHQtcHJpbWFyeVwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtcHJpbWFyeSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5FbnF1ZXRlPC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0TWluaW1pemVkKHRydWUpfSBjbGFzc05hbWU9XCJwLTEgcm91bmRlZC1tZCBob3ZlcjpiZy1tdXRlZC81MCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5cbiAgICAgICAgICAgICAgICAgIDxDaGV2cm9uVXAgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjUgcm90YXRlLTE4MFwiIC8+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBzZXREaXNtaXNzZWQodHJ1ZSl9IGNsYXNzTmFtZT1cInAtMSByb3VuZGVkLW1kIGhvdmVyOmJnLWRlc3RydWN0aXZlLzE1IHRleHQtZGVzdHJ1Y3RpdmVcIj5cbiAgICAgICAgICAgICAgICAgIDxYIGNsYXNzTmFtZT1cImgtMy41IHctMy41XCIgLz5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIFF1ZXN0aW9uICovfVxuICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG1iLTMgbGVhZGluZy1zbnVnXCI+e3BvbGwucXVlc3Rpb259PC9wPlxuXG4gICAgICAgICAgICB7LyogT3B0aW9ucyAqL31cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICAgIHtwb2xsLm9wdGlvbnMubWFwKChvcHQsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBwY3QgPSB0b3RhbFZvdGVzID4gMCA/IE1hdGgucm91bmQoKChvcHQudm90ZXMgfHwgMCkgLyB0b3RhbFZvdGVzKSAqIDEwMCkgOiAwO1xuICAgICAgICAgICAgICAgIGNvbnN0IGlzTXlWb3RlID0gdm90ZWRJbmRleCA9PT0gaTtcblxuICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIGtleT17aX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gaGFuZGxlVm90ZShpKX1cbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3ZvdGVkIHx8IHZvdGluZ31cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdy1mdWxsIHJlbGF0aXZlIHJvdW5kZWQteGwgdGV4dC1sZWZ0IHRleHQtc20gdHJhbnNpdGlvbi1hbGwgb3ZlcmZsb3ctaGlkZGVuICR7XG4gICAgICAgICAgICAgICAgICAgICAgdm90ZWRcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJjdXJzb3ItZGVmYXVsdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwiY3Vyc29yLXBvaW50ZXIgaG92ZXI6c2NhbGUtWzEuMDJdIGFjdGl2ZTpzY2FsZS1bMC45OF1cIlxuICAgICAgICAgICAgICAgICAgICB9ICR7aXNNeVZvdGUgPyBcInJpbmctMiByaW5nLXByaW1hcnkvNTBcIiA6IFwiXCJ9YH1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgey8qIEJhY2tncm91bmQgYmFyICovfVxuICAgICAgICAgICAgICAgICAgICB7dm90ZWQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsPXt7IHdpZHRoOiAwIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IHdpZHRoOiBgJHtwY3R9JWAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDAuNiwgZWFzZTogXCJlYXNlT3V0XCIgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGFic29sdXRlIGluc2V0LXktMCBsZWZ0LTAgcm91bmRlZC14bCAke2lzTXlWb3RlID8gXCJiZy1wcmltYXJ5LzIwXCIgOiBcImJnLW11dGVkLzYwXCJ9YH1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YHJlbGF0aXZlIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweC0zIHB5LTIuNSByb3VuZGVkLXhsIGJvcmRlciAke1xuICAgICAgICAgICAgICAgICAgICAgIHZvdGVkID8gXCJib3JkZXItYm9yZGVyLzUwXCIgOiBcImJvcmRlci1ib3JkZXIgaG92ZXI6Ym9yZGVyLXByaW1hcnkvNDAgYmctbXV0ZWQvMzBcIlxuICAgICAgICAgICAgICAgICAgICB9YH0+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgZm9udC1tZWRpdW0gJHtpc015Vm90ZSA/IFwidGV4dC1wcmltYXJ5XCIgOiBcInRleHQtZm9yZWdyb3VuZFwifWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAge2lzTXlWb3RlICYmIDxDaGVjayBjbGFzc05hbWU9XCJoLTMuNSB3LTMuNSBpbmxpbmUgbXItMS41XCIgLz59XG4gICAgICAgICAgICAgICAgICAgICAgICB7b3B0LmxhYmVsfVxuICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICB7dm90ZWQgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LXNlbWlib2xkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtbC0yIHNocmluay0wXCI+e3BjdH0lPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgey8qIEZvb3RlciAqL31cbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBtdC0yLjUgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAge3RvdGFsVm90ZXN9IHZvdG97dG90YWxWb3RlcyAhPT0gMSA/IFwic1wiIDogXCJcIn1cbiAgICAgICAgICAgICAge3ZvdGVkICYmIFwiIOKAoiBPYnJpZ2FkbyBwZWxvIHNldSB2b3RvIVwifVxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgPC9tb3Rpb24uZGl2PlxuICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxuICApO1xufVxuIl0sIm5hbWVzIjpbInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlQ2FsbGJhY2siLCJzdXBhYmFzZSIsInVzZUF1dGgiLCJtb3Rpb24iLCJBbmltYXRlUHJlc2VuY2UiLCJCYXJDaGFydDMiLCJYIiwiQ2hlY2siLCJDaGV2cm9uVXAiLCJGbG9hdGluZ1BvbGwiLCJ1c2VyIiwicG9sbCIsInNldFBvbGwiLCJ2b3RlZCIsInNldFZvdGVkIiwidm90ZWRJbmRleCIsInNldFZvdGVkSW5kZXgiLCJ2b3RpbmciLCJzZXRWb3RpbmciLCJtaW5pbWl6ZWQiLCJzZXRNaW5pbWl6ZWQiLCJkaXNtaXNzZWQiLCJzZXREaXNtaXNzZWQiLCJmZXRjaEFjdGl2ZVBvbGwiLCJkYXRhIiwiZnJvbSIsInNlbGVjdCIsImVxIiwib3JkZXIiLCJhc2NlbmRpbmciLCJsaW1pdCIsImxlbmd0aCIsInAiLCJiYXNlT3B0aW9ucyIsIm9wdGlvbnMiLCJ2b3RlQ291bnRzIiwicnBjIiwiX3BvbGxfaWQiLCJpZCIsImNvdW50cyIsInRvdGFsUmVhbCIsImZvckVhY2giLCJ2Iiwib3B0aW9uX2luZGV4IiwiTnVtYmVyIiwidm90ZV9jb3VudCIsImVucmljaGVkT3B0aW9ucyIsIm1hcCIsIm9wdCIsImkiLCJ2b3RlcyIsInF1ZXN0aW9uIiwidG90YWxfdm90ZXMiLCJleHBpcmVzX2F0Iiwidm90ZURhdGEiLCJtYXliZVNpbmdsZSIsInBvbGxDaGFubmVsIiwiY2hhbm5lbCIsIm9uIiwiZXZlbnQiLCJzY2hlbWEiLCJ0YWJsZSIsInBheWxvYWQiLCJuZXdWb3RlIiwibmV3IiwicG9sbF9pZCIsInByZXYiLCJuZXdPcHRpb25zIiwic3Vic2NyaWJlIiwicmVtb3ZlQ2hhbm5lbCIsImhhbmRsZVZvdGUiLCJpbmRleCIsImVycm9yIiwiaW5zZXJ0IiwidXNlcl9pZCIsIm1lc3NhZ2UiLCJpbmNsdWRlcyIsInRvdGFsVm90ZXMiLCJyZWR1Y2UiLCJzdW0iLCJvIiwiZGl2IiwiaW5pdGlhbCIsIm9wYWNpdHkiLCJ5Iiwic2NhbGUiLCJhbmltYXRlIiwiZXhpdCIsImNsYXNzTmFtZSIsImJ1dHRvbiIsIm9uQ2xpY2siLCJzcGFuIiwicGN0IiwiTWF0aCIsInJvdW5kIiwiaXNNeVZvdGUiLCJkaXNhYmxlZCIsIndpZHRoIiwidHJhbnNpdGlvbiIsImR1cmF0aW9uIiwiZWFzZSIsImxhYmVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxRQUFRLEVBQUVDLFNBQVMsRUFBRUMsV0FBVyxRQUFRLFFBQVE7QUFDekQsU0FBU0MsUUFBUSxRQUFRLGlDQUFpQztBQUMxRCxTQUFTQyxPQUFPLFFBQVEsa0JBQWtCO0FBQzFDLFNBQVNDLE1BQU0sRUFBRUMsZUFBZSxRQUFRLGdCQUFnQjtBQUN4RCxTQUFTQyxTQUFTLEVBQUVDLENBQUMsRUFBRUMsS0FBSyxFQUFFQyxTQUFTLFFBQVEsZUFBZTtBQWU5RCxPQUFPLFNBQVNDOztJQUNkLE1BQU0sRUFBRUMsSUFBSSxFQUFFLEdBQUdSO0lBQ2pCLE1BQU0sQ0FBQ1MsTUFBTUMsUUFBUSxHQUFHZCxTQUFzQjtJQUM5QyxNQUFNLENBQUNlLE9BQU9DLFNBQVMsR0FBR2hCLFNBQVM7SUFDbkMsTUFB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