import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/BroadcastProgress.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/BroadcastProgress.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"];
import { supabase } from "/src/integrations/supabase/client.ts";
import { CheckCircle, XCircle, Zap, Clock, AlertTriangle, Loader2, Play } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
export function BroadcastProgress({ progressId, notificationTitle, onComplete, onResume }) {
    _s();
    const [progress, setProgress] = useState(null);
    const [resuming, setResuming] = useState(false);
    useEffect(()=>{
        const fetchProgress = async ()=>{
            const { data } = await supabase.from('broadcast_progress').select('*').eq('id', progressId).single();
            if (data) setProgress(data);
        };
        fetchProgress();
        const channel = supabase.channel(`broadcast-progress-${progressId}`).on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'broadcast_progress',
            filter: `id=eq.${progressId}`
        }, (payload)=>{
            const newData = payload.new;
            setProgress(newData);
            if (newData.status === 'completed' || newData.status === 'failed') {
                onComplete?.();
            }
        }).subscribe();
        return ()=>{
            supabase.removeChannel(channel);
        };
    }, [
        progressId,
        onComplete
    ]);
    const handleResume = async ()=>{
        if (!onResume || !progress) return;
        setResuming(true);
        try {
            await onResume(progress.id);
        } finally{
            setResuming(false);
        }
    };
    if (!progress) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "glass-modal rounded-xl p-4 flex items-center gap-2",
            children: [
                /*#__PURE__*/ _jsxDEV(Loader2, {
                    className: "w-4 h-4 animate-spin"
                }, void 0, false, {
                    fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV("span", {
                    className: "text-sm",
                    children: "Carregando..."
                }, void 0, false, {
                    fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/components/BroadcastProgress.tsx",
            lineNumber: 72,
            columnNumber: 7
        }, this);
    }
    const percentage = progress.total_users > 0 ? Math.round((progress.sent_count + progress.failed_count) / progress.total_users * 100) : 0;
    const canResume = [
        'cancelled',
        'failed'
    ].includes(progress.status) && progress.sent_count + progress.failed_count < progress.total_users;
    const statusColors = {
        pending: 'bg-yellow-500/20 text-yellow-400',
        running: 'bg-blue-500/20 text-blue-400',
        completed: 'bg-green-500/20 text-green-400',
        failed: 'bg-red-500/20 text-red-400',
        cancelled: 'bg-orange-500/20 text-orange-400'
    };
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "glass-modal rounded-xl overflow-hidden",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "p-4 flex items-center justify-between border-b border-border/30",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center gap-2",
                        children: [
                            progress.status === 'running' && /*#__PURE__*/ _jsxDEV("div", {
                                className: "w-3 h-3 bg-blue-500 rounded-full animate-pulse"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 99,
                                columnNumber: 45
                            }, this),
                            progress.status === 'completed' && /*#__PURE__*/ _jsxDEV(CheckCircle, {
                                className: "w-5 h-5 text-green-500"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 100,
                                columnNumber: 47
                            }, this),
                            progress.status === 'failed' && /*#__PURE__*/ _jsxDEV(XCircle, {
                                className: "w-5 h-5 text-red-500"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 101,
                                columnNumber: 44
                            }, this),
                            progress.status === 'cancelled' && /*#__PURE__*/ _jsxDEV(AlertTriangle, {
                                className: "w-5 h-5 text-orange-500"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 102,
                                columnNumber: 47
                            }, this),
                            progress.status === 'pending' && /*#__PURE__*/ _jsxDEV(Loader2, {
                                className: "w-5 h-5 animate-spin text-yellow-500"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 103,
                                columnNumber: 45
                            }, this),
                            /*#__PURE__*/ _jsxDEV("span", {
                                className: "font-medium text-sm text-foreground",
                                children: notificationTitle || 'Broadcast'
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 104,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV("span", {
                                className: `px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[progress.status] || ''}`,
                                children: progress.status === "pending" ? "Aguardando" : progress.status === "running" ? "Enviando" : progress.status === "completed" ? "Concluído" : progress.status === "failed" ? "Falhou" : progress.status === "cancelled" ? "Cancelado" : progress.status
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 107,
                                columnNumber: 11
                            }, this),
                            canResume && onResume && /*#__PURE__*/ _jsxDEV("button", {
                                onClick: handleResume,
                                disabled: resuming,
                                className: "flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50",
                                children: resuming ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                    className: "w-3 h-3 animate-spin"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                    lineNumber: 116,
                                    columnNumber: 27
                                }, this) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                    children: [
                                        /*#__PURE__*/ _jsxDEV(Play, {
                                            className: "w-3 h-3"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                            lineNumber: 116,
                                            columnNumber: 76
                                        }, this),
                                        " Retomar"
                                    ]
                                }, void 0, true)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 111,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "p-4 space-y-4",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "space-y-1.5",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex justify-between text-xs text-muted-foreground",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        children: "Progresso"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 126,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        children: [
                                            percentage,
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 127,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "h-3 rounded-full bg-muted/50 overflow-hidden",
                                children: /*#__PURE__*/ _jsxDEV("div", {
                                    className: "h-full rounded-full bg-primary transition-all duration-500 ease-out",
                                    style: {
                                        width: `${percentage}%`
                                    }
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                    lineNumber: 130,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 129,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                        lineNumber: 124,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "grid grid-cols-4 gap-2",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "text-center p-2 rounded-lg bg-green-500/10",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-lg font-bold text-green-500",
                                        children: progress.sent_count
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 140,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-[10px] text-muted-foreground",
                                        children: "Enviados"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 141,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "text-center p-2 rounded-lg bg-red-500/10",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-lg font-bold text-red-500",
                                        children: progress.failed_count
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 144,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-[10px] text-muted-foreground",
                                        children: "Falhas"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 145,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "text-center p-2 rounded-lg bg-orange-500/10",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-lg font-bold text-orange-500",
                                        children: progress.blocked_count
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 148,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-[10px] text-muted-foreground",
                                        children: "Bloqueados"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 149,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 147,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "text-center p-2 rounded-lg bg-primary/10",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-lg font-bold text-primary",
                                        children: progress.total_users
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 152,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-[10px] text-muted-foreground",
                                        children: "Total"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 153,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 151,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this),
                    progress.status === 'running' && /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-3",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Zap, {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 161,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        children: [
                                            progress.speed_per_second,
                                            " msg/s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 160,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Clock, {
                                        className: "w-3.5 h-3.5"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 165,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        children: [
                                            "Batch ",
                                            progress.current_batch,
                                            "/",
                                            progress.total_batches
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                        lineNumber: 166,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                                lineNumber: 164,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                        lineNumber: 159,
                        columnNumber: 11
                    }, this),
                    progress.error_message && /*#__PURE__*/ _jsxDEV("div", {
                        className: "text-xs p-2 rounded-lg bg-red-500/10 text-red-400",
                        children: progress.error_message
                    }, void 0, false, {
                        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                        lineNumber: 173,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/components/BroadcastProgress.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/components/BroadcastProgress.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_s(BroadcastProgress, "4qfbwGNoZvaw+6SSTmBYnWoPjYA=");
_c = BroadcastProgress;
var _c;
$RefreshReg$(_c, "BroadcastProgress");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/BroadcastProgress.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/BroadcastProgress.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJyb2FkY2FzdFByb2dyZXNzLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tICdAL2ludGVncmF0aW9ucy9zdXBhYmFzZS9jbGllbnQnO1xuaW1wb3J0IHsgQ2hlY2tDaXJjbGUsIFhDaXJjbGUsIFphcCwgQ2xvY2ssIEFsZXJ0VHJpYW5nbGUsIExvYWRlcjIsIFBsYXkgfSBmcm9tICdsdWNpZGUtcmVhY3QnO1xuXG5pbnRlcmZhY2UgQnJvYWRjYXN0UHJvZ3Jlc3NEYXRhIHtcbiAgaWQ6IHN0cmluZztcbiAgbm90aWZpY2F0aW9uX2lkOiBzdHJpbmc7XG4gIHN0YXR1czogJ3BlbmRpbmcnIHwgJ3J1bm5pbmcnIHwgJ2NvbXBsZXRlZCcgfCAnZmFpbGVkJyB8ICdjYW5jZWxsZWQnO1xuICB0b3RhbF91c2VyczogbnVtYmVyO1xuICBzZW50X2NvdW50OiBudW1iZXI7XG4gIGZhaWxlZF9jb3VudDogbnVtYmVyO1xuICBibG9ja2VkX2NvdW50OiBudW1iZXI7XG4gIGN1cnJlbnRfYmF0Y2g6IG51bWJlcjtcbiAgdG90YWxfYmF0Y2hlczogbnVtYmVyO1xuICBzdGFydGVkX2F0OiBzdHJpbmcgfCBudWxsO1xuICBjb21wbGV0ZWRfYXQ6IHN0cmluZyB8IG51bGw7XG4gIGVycm9yX21lc3NhZ2U6IHN0cmluZyB8IG51bGw7XG4gIHNwZWVkX3Blcl9zZWNvbmQ6IG51bWJlcjtcbiAgZXN0aW1hdGVkX2NvbXBsZXRpb246IHN0cmluZyB8IG51bGw7XG59XG5cbmludGVyZmFjZSBCcm9hZGNhc3RQcm9ncmVzc1Byb3BzIHtcbiAgcHJvZ3Jlc3NJZDogc3RyaW5nO1xuICBub3RpZmljYXRpb25UaXRsZT86IHN0cmluZztcbiAgb25Db21wbGV0ZT86ICgpID0+IHZvaWQ7XG4gIG9uUmVzdW1lPzogKHByb2dyZXNzSWQ6IHN0cmluZykgPT4gUHJvbWlzZTx2b2lkPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEJyb2FkY2FzdFByb2dyZXNzKHsgcHJvZ3Jlc3NJZCwgbm90aWZpY2F0aW9uVGl0bGUsIG9uQ29tcGxldGUsIG9uUmVzdW1lIH06IEJyb2FkY2FzdFByb2dyZXNzUHJvcHMpIHtcbiAgY29uc3QgW3Byb2dyZXNzLCBzZXRQcm9ncmVzc10gPSB1c2VTdGF0ZTxCcm9hZGNhc3RQcm9ncmVzc0RhdGEgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW3Jlc3VtaW5nLCBzZXRSZXN1bWluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmZXRjaFByb2dyZXNzID0gYXN5bmMgKCkgPT4ge1xuICAgICAgY29uc3QgeyBkYXRhIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAuZnJvbSgnYnJvYWRjYXN0X3Byb2dyZXNzJyBhcyBhbnkpXG4gICAgICAgIC5zZWxlY3QoJyonKVxuICAgICAgICAuZXEoJ2lkJywgcHJvZ3Jlc3NJZClcbiAgICAgICAgLnNpbmdsZSgpO1xuICAgICAgaWYgKGRhdGEpIHNldFByb2dyZXNzKGRhdGEgYXMgYW55IGFzIEJyb2FkY2FzdFByb2dyZXNzRGF0YSk7XG4gICAgfTtcblxuICAgIGZldGNoUHJvZ3Jlc3MoKTtcblxuICAgIGNvbnN0IGNoYW5uZWwgPSBzdXBhYmFzZVxuICAgICAgLmNoYW5uZWwoYGJyb2FkY2FzdC1wcm9ncmVzcy0ke3Byb2dyZXNzSWR9YClcbiAgICAgIC5vbigncG9zdGdyZXNfY2hhbmdlcycsIHtcbiAgICAgICAgZXZlbnQ6ICdVUERBVEUnLFxuICAgICAgICBzY2hlbWE6ICdwdWJsaWMnLFxuICAgICAgICB0YWJsZTogJ2Jyb2FkY2FzdF9wcm9ncmVzcycsXG4gICAgICAgIGZpbHRlcjogYGlkPWVxLiR7cHJvZ3Jlc3NJZH1gLFxuICAgICAgfSwgKHBheWxvYWQpID0+IHtcbiAgICAgICAgY29uc3QgbmV3RGF0YSA9IHBheWxvYWQubmV3IGFzIGFueSBhcyBCcm9hZGNhc3RQcm9ncmVzc0RhdGE7XG4gICAgICAgIHNldFByb2dyZXNzKG5ld0RhdGEpO1xuICAgICAgICBpZiAobmV3RGF0YS5zdGF0dXMgPT09ICdjb21wbGV0ZWQnIHx8IG5ld0RhdGEuc3RhdHVzID09PSAnZmFpbGVkJykge1xuICAgICAgICAgIG9uQ29tcGxldGU/LigpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnN1YnNjcmliZSgpO1xuXG4gICAgcmV0dXJuICgpID0+IHsgc3VwYWJhc2UucmVtb3ZlQ2hhbm5lbChjaGFubmVsKTsgfTtcbiAgfSwgW3Byb2dyZXNzSWQsIG9uQ29tcGxldGVdKTtcblxuICBjb25zdCBoYW5kbGVSZXN1bWUgPSBhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFvblJlc3VtZSB8fCAhcHJvZ3Jlc3MpIHJldHVybjtcbiAgICBzZXRSZXN1bWluZyh0cnVlKTtcbiAgICB0cnkgeyBhd2FpdCBvblJlc3VtZShwcm9ncmVzcy5pZCk7IH0gZmluYWxseSB7IHNldFJlc3VtaW5nKGZhbHNlKTsgfVxuICB9O1xuXG4gIGlmICghcHJvZ3Jlc3MpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1tb2RhbCByb3VuZGVkLXhsIHAtNCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICA8TG9hZGVyMiBjbGFzc05hbWU9XCJ3LTQgaC00IGFuaW1hdGUtc3BpblwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc21cIj5DYXJyZWdhbmRvLi4uPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGNvbnN0IHBlcmNlbnRhZ2UgPSBwcm9ncmVzcy50b3RhbF91c2VycyA+IDBcbiAgICA/IE1hdGgucm91bmQoKChwcm9ncmVzcy5zZW50X2NvdW50ICsgcHJvZ3Jlc3MuZmFpbGVkX2NvdW50KSAvIHByb2dyZXNzLnRvdGFsX3VzZXJzKSAqIDEwMClcbiAgICA6IDA7XG5cbiAgY29uc3QgY2FuUmVzdW1lID0gWydjYW5jZWxsZWQnLCAnZmFpbGVkJ10uaW5jbHVkZXMocHJvZ3Jlc3Muc3RhdHVzKSAmJlxuICAgIChwcm9ncmVzcy5zZW50X2NvdW50ICsgcHJvZ3Jlc3MuZmFpbGVkX2NvdW50KSA8IHByb2dyZXNzLnRvdGFsX3VzZXJzO1xuXG4gIGNvbnN0IHN0YXR1c0NvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICBwZW5kaW5nOiAnYmcteWVsbG93LTUwMC8yMCB0ZXh0LXllbGxvdy00MDAnLFxuICAgIHJ1bm5pbmc6ICdiZy1ibHVlLTUwMC8yMCB0ZXh0LWJsdWUtNDAwJyxcbiAgICBjb21wbGV0ZWQ6ICdiZy1ncmVlbi01MDAvMjAgdGV4dC1ncmVlbi00MDAnLFxuICAgIGZhaWxlZDogJ2JnLXJlZC01MDAvMjAgdGV4dC1yZWQtNDAwJyxcbiAgICBjYW5jZWxsZWQ6ICdiZy1vcmFuZ2UtNTAwLzIwIHRleHQtb3JhbmdlLTQwMCcsXG4gIH07XG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImdsYXNzLW1vZGFsIHJvdW5kZWQteGwgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICB7LyogSGVhZGVyICovfVxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTQgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGJvcmRlci1iIGJvcmRlci1ib3JkZXIvMzBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgIHtwcm9ncmVzcy5zdGF0dXMgPT09ICdydW5uaW5nJyAmJiA8ZGl2IGNsYXNzTmFtZT1cInctMyBoLTMgYmctYmx1ZS01MDAgcm91bmRlZC1mdWxsIGFuaW1hdGUtcHVsc2VcIiAvPn1cbiAgICAgICAgICB7cHJvZ3Jlc3Muc3RhdHVzID09PSAnY29tcGxldGVkJyAmJiA8Q2hlY2tDaXJjbGUgY2xhc3NOYW1lPVwidy01IGgtNSB0ZXh0LWdyZWVuLTUwMFwiIC8+fVxuICAgICAgICAgIHtwcm9ncmVzcy5zdGF0dXMgPT09ICdmYWlsZWQnICYmIDxYQ2lyY2xlIGNsYXNzTmFtZT1cInctNSBoLTUgdGV4dC1yZWQtNTAwXCIgLz59XG4gICAgICAgICAge3Byb2dyZXNzLnN0YXR1cyA9PT0gJ2NhbmNlbGxlZCcgJiYgPEFsZXJ0VHJpYW5nbGUgY2xhc3NOYW1lPVwidy01IGgtNSB0ZXh0LW9yYW5nZS01MDBcIiAvPn1cbiAgICAgICAgICB7cHJvZ3Jlc3Muc3RhdHVzID09PSAncGVuZGluZycgJiYgPExvYWRlcjIgY2xhc3NOYW1lPVwidy01IGgtNSBhbmltYXRlLXNwaW4gdGV4dC15ZWxsb3ctNTAwXCIgLz59XG4gICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1tZWRpdW0gdGV4dC1zbSB0ZXh0LWZvcmVncm91bmRcIj57bm90aWZpY2F0aW9uVGl0bGUgfHwgJ0Jyb2FkY2FzdCd9PC9zcGFuPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT17YHB4LTIgcHktMC41IHJvdW5kZWQtZnVsbCB0ZXh0LXhzIGZvbnQtbWVkaXVtICR7c3RhdHVzQ29sb3JzW3Byb2dyZXNzLnN0YXR1c10gfHwgJyd9YH0+XG4gICAgICAgICAgICB7cHJvZ3Jlc3Muc3RhdHVzID09PSBcInBlbmRpbmdcIiA/IFwiQWd1YXJkYW5kb1wiIDogcHJvZ3Jlc3Muc3RhdHVzID09PSBcInJ1bm5pbmdcIiA/IFwiRW52aWFuZG9cIiA6IHByb2dyZXNzLnN0YXR1cyA9PT0gXCJjb21wbGV0ZWRcIiA/IFwiQ29uY2x1w61kb1wiIDogcHJvZ3Jlc3Muc3RhdHVzID09PSBcImZhaWxlZFwiID8gXCJGYWxob3VcIiA6IHByb2dyZXNzLnN0YXR1cyA9PT0gXCJjYW5jZWxsZWRcIiA/IFwiQ2FuY2VsYWRvXCIgOiBwcm9ncmVzcy5zdGF0dXN9XG4gICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgIHtjYW5SZXN1bWUgJiYgb25SZXN1bWUgJiYgKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVSZXN1bWV9XG4gICAgICAgICAgICAgIGRpc2FibGVkPXtyZXN1bWluZ31cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgcHgtMiBweS0xIHJvdW5kZWQtbGcgdGV4dC14cyBiZy1wcmltYXJ5LzIwIHRleHQtcHJpbWFyeSBob3ZlcjpiZy1wcmltYXJ5LzMwIHRyYW5zaXRpb24tY29sb3JzIGRpc2FibGVkOm9wYWNpdHktNTBcIlxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICB7cmVzdW1pbmcgPyA8TG9hZGVyMiBjbGFzc05hbWU9XCJ3LTMgaC0zIGFuaW1hdGUtc3BpblwiIC8+IDogPD48UGxheSBjbGFzc05hbWU9XCJ3LTMgaC0zXCIgLz4gUmV0b21hcjwvPn1cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICl9XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC00IHNwYWNlLXktNFwiPlxuICAgICAgICB7LyogUHJvZ3Jlc3MgYmFyICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMS41XCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiB0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgPHNwYW4+UHJvZ3Jlc3NvPC9zcGFuPlxuICAgICAgICAgICAgPHNwYW4+e3BlcmNlbnRhZ2V9JTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtMyByb3VuZGVkLWZ1bGwgYmctbXV0ZWQvNTAgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImgtZnVsbCByb3VuZGVkLWZ1bGwgYmctcHJpbWFyeSB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi01MDAgZWFzZS1vdXRcIlxuICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogYCR7cGVyY2VudGFnZX0lYCB9fVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgey8qIFN0YXRzIGdyaWQgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtNCBnYXAtMlwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgcC0yIHJvdW5kZWQtbGcgYmctZ3JlZW4tNTAwLzEwXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIHRleHQtZ3JlZW4tNTAwXCI+e3Byb2dyZXNzLnNlbnRfY291bnR9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPkVudmlhZG9zPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBwLTIgcm91bmRlZC1sZyBiZy1yZWQtNTAwLzEwXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIHRleHQtcmVkLTUwMFwiPntwcm9ncmVzcy5mYWlsZWRfY291bnR9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPkZhbGhhczwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgcC0yIHJvdW5kZWQtbGcgYmctb3JhbmdlLTUwMC8xMFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtYm9sZCB0ZXh0LW9yYW5nZS01MDBcIj57cHJvZ3Jlc3MuYmxvY2tlZF9jb3VudH08L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+QmxvcXVlYWRvczwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgcC0yIHJvdW5kZWQtbGcgYmctcHJpbWFyeS8xMFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtYm9sZCB0ZXh0LXByaW1hcnlcIj57cHJvZ3Jlc3MudG90YWxfdXNlcnN9PC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlRvdGFsPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsvKiBTcGVlZCBpbmZvICovfVxuICAgICAgICB7cHJvZ3Jlc3Muc3RhdHVzID09PSAncnVubmluZycgJiYgKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGJvcmRlci10IGJvcmRlci1ib3JkZXIvMzAgcHQtM1wiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41XCI+XG4gICAgICAgICAgICAgIDxaYXAgY2xhc3NOYW1lPVwidy0zLjUgaC0zLjVcIiAvPlxuICAgICAgICAgICAgICA8c3Bhbj57cHJvZ3Jlc3Muc3BlZWRfcGVyX3NlY29uZH0gbXNnL3M8L3NwYW4+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNVwiPlxuICAgICAgICAgICAgICA8Q2xvY2sgY2xhc3NOYW1lPVwidy0zLjUgaC0zLjVcIiAvPlxuICAgICAgICAgICAgICA8c3Bhbj5CYXRjaCB7cHJvZ3Jlc3MuY3VycmVudF9iYXRjaH0ve3Byb2dyZXNzLnRvdGFsX2JhdGNoZXN9PC9zcGFuPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAgey8qIEVycm9yICovfVxuICAgICAgICB7cHJvZ3Jlc3MuZXJyb3JfbWVzc2FnZSAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHAtMiByb3VuZGVkLWxnIGJnLXJlZC01MDAvMTAgdGV4dC1yZWQtNDAwXCI+XG4gICAgICAgICAgICB7cHJvZ3Jlc3MuZXJyb3JfbWVzc2FnZX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICApO1xufVxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVN0YXRlIiwic3VwYWJhc2UiLCJDaGVja0NpcmNsZSIsIlhDaXJjbGUiLCJaYXAiLCJDbG9jayIsIkFsZXJ0VHJpYW5nbGUiLCJMb2FkZXIyIiwiUGxheSIsIkJyb2FkY2FzdFByb2dyZXNzIiwicHJvZ3Jlc3NJZCIsIm5vdGlmaWNhdGlvblRpdGxlIiwib25Db21wbGV0ZSIsIm9uUmVzdW1lIiwicHJvZ3Jlc3MiLCJzZXRQcm9ncmVzcyIsInJlc3VtaW5nIiwic2V0UmVzdW1pbmciLCJmZXRjaFByb2dyZXNzIiwiZGF0YSIsImZyb20iLCJzZWxlY3QiLCJlcSIsInNpbmdsZSIsImNoYW5uZWwiLCJvbiIsImV2ZW50Iiwic2NoZW1hIiwidGFibGUiLCJmaWx0ZXIiLCJwYXlsb2FkIiwibmV3RGF0YSIsIm5ldyIsInN0YXR1cyIsInN1YnNjcmliZSIsInJlbW92ZUNoYW5uZWwiLCJoYW5kbGVSZXN1bWUiLCJpZCIsImRpdiIsImNsYXNzTmFtZSIsInNwYW4iLCJwZXJjZW50YWdlIiwidG90YWxfdXNlcnMiLCJNYXRoIiwicm91bmQiLCJzZW50X2NvdW50IiwiZmFpbGVkX2NvdW50IiwiY2FuUmVzdW1lIiwiaW5jbHVkZXMiLCJzdGF0dXNDb2xvcnMiLCJwZW5kaW5nIiwicnVubmluZyIsImNvbXBsZXRlZCIsImZhaWxlZCIsImNhbmNlbGxlZCIsImJ1dHRvbiIsIm9uQ2xpY2siLCJkaXNhYmxlZCIsInN0eWxlIiwid2lkdGgiLCJibG9ja2VkX2NvdW50Iiwic3BlZWRfcGVyX3NlY29uZCIsImN1cnJlbnRfYmF0Y2giLCJ0b3RhbF9iYXRjaGVzIiwiZXJyb3JfbWVzc2FnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsU0FBUyxFQUFFQyxRQUFRLFFBQVEsUUFBUTtBQUM1QyxTQUFTQyxRQUFRLFFBQVEsaUNBQWlDO0FBQzFELFNBQVNDLFdBQVcsRUFBRUMsT0FBTyxFQUFFQyxHQUFHLEVBQUVDLEtBQUssRUFBRUMsYUFBYSxFQUFFQyxPQUFPLEVBQUVDLElBQUksUUFBUSxlQUFlO0FBMEI5RixPQUFPLFNBQVNDLGtCQUFrQixFQUFFQyxVQUFVLEVBQUVDLGlCQUFpQixFQUFFQyxVQUFVLEVBQUVDLFFBQVEsRUFBMEI7O0lBQy9HLE1BQU0sQ0FBQ0MsVUFBVUMsWUFBWSxHQUFHZixTQUF1QztJQUN2RSxNQUFNLENBQUNnQixVQUFVQyxZQUFZLEdBQUdqQixTQUFTO0lBRXpDRCxVQUFVO1FBQ1IsTUFBTW1CLGdCQUFnQjtZQUNwQixNQUFNLEVBQUVDLElBQUksRUFBRSxHQUFHLE1BQU1sQixTQUNwQm1CLElBQUksQ0FBQyxzQkFDTEMsTUFBTSxDQUFDLEtBQ1BDLEVBQUUsQ0FBQyxNQUFNWixZQUNUYSxNQUFNO1lBQ1QsSUFBSUosTUFBTUosWUFBWUk7UUFDeEI7UUFFQUQ7UUFFQSxNQUFNTSxVQUFVdkIsU0FDYnVCLE9BQU8sQ0FBQyxDQUFDLG1CQUFtQixFQUFFZCxZQUFZLEVBQzFDZSxFQUFFLENBQUMsb0JBQW9CO1lBQ3RCQyxPQUFPO1lBQ1BD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