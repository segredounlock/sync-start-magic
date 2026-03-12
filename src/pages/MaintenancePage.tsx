import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/MaintenancePage.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/MaintenancePage.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
import { motion } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { Construction, Bot, ArrowRight, Wrench, Clock } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
export default function MaintenancePage() {
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "min-h-screen bg-background flex items-center justify-center px-4 py-12 overflow-hidden relative",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "absolute inset-0 pointer-events-none overflow-hidden",
                children: [
                    /*#__PURE__*/ _jsxDEV(motion.div, {
                        className: "absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl",
                        animate: {
                            scale: [
                                1,
                                1.2,
                                1
                            ],
                            opacity: [
                                0.3,
                                0.5,
                                0.3
                            ]
                        },
                        transition: {
                            duration: 6,
                            repeat: Infinity
                        }
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                        lineNumber: 9,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV(motion.div, {
                        className: "absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-warning/5 blur-3xl",
                        animate: {
                            scale: [
                                1.2,
                                1,
                                1.2
                            ],
                            opacity: [
                                0.2,
                                0.4,
                                0.2
                            ]
                        },
                        transition: {
                            duration: 8,
                            repeat: Infinity
                        }
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                        lineNumber: 14,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                lineNumber: 8,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(motion.div, {
                initial: {
                    opacity: 0,
                    y: 30
                },
                animate: {
                    opacity: 1,
                    y: 0
                },
                transition: {
                    duration: 0.7
                },
                className: "relative z-10 max-w-lg w-full text-center space-y-8",
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
                            stiffness: 200,
                            delay: 0.2
                        },
                        className: "mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-warning/20 to-primary/20 flex items-center justify-center shadow-2xl shadow-warning/10",
                        children: /*#__PURE__*/ _jsxDEV(Construction, {
                            className: "h-12 w-12 text-warning"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                        lineNumber: 28,
                        columnNumber: 9
                    }, this),
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
                            delay: 0.4
                        },
                        children: /*#__PURE__*/ _jsxDEV("h1", {
                            className: "text-3xl sm:text-4xl font-extrabold text-foreground mb-2",
                            children: "🚧 Estamos em Manutenção"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                            lineNumber: 43,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                        lineNumber: 38,
                        columnNumber: 9
                    }, this),
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
                            delay: 0.5
                        },
                        className: "space-y-4",
                        children: [
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-muted-foreground text-base leading-relaxed",
                                children: "Nosso site está passando por uma atualização para melhorar sua experiência. Em breve estaremos de volta com melhorias e novas funcionalidades."
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                lineNumber: 55,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-muted-foreground text-sm",
                                children: "Agradecemos sua compreensão e pedimos um pouco de paciência. 🙏"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                lineNumber: 59,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
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
                            delay: 0.6
                        },
                        className: "flex items-center justify-center gap-6 py-4",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Wrench, {
                                        className: "h-4 w-4 text-warning animate-pulse"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                        lineNumber: 72,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-xs text-muted-foreground",
                                        children: "Site em atualização"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                        lineNumber: 73,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                lineNumber: 71,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Clock, {
                                        className: "h-4 w-4 text-primary"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                        lineNumber: 76,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "text-xs text-muted-foreground",
                                        children: "Volta em breve"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                        lineNumber: 77,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                        lineNumber: 65,
                        columnNumber: 9
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
                            delay: 0.7
                        },
                        className: "rounded-2xl border border-border bg-card/60 backdrop-blur-lg p-6 space-y-4 shadow-xl",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center justify-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Bot, {
                                        className: "h-5 w-5 text-[hsl(199,89%,48%)]"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                        lineNumber: 89,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "font-bold text-foreground",
                                        children: "Bot do Telegram"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                        lineNumber: 90,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-success/15 text-success",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "w-1.5 h-1.5 rounded-full bg-success animate-pulse"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                                lineNumber: 92,
                                                columnNumber: 15
                                            }, this),
                                            "ONLINE"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                        lineNumber: 91,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                lineNumber: 88,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("p", {
                                className: "text-sm text-muted-foreground leading-relaxed",
                                children: "Enquanto finalizamos as atualizações do site, nosso bot no Telegram continua funcionando normalmente."
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                lineNumber: 97,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("a", {
                                href: "https://t.me/RecargasBrasilBot",
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[hsl(199,89%,48%)] text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[hsl(199,89%,48%)]/20",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(Bot, {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                        lineNumber: 107,
                                        columnNumber: 13
                                    }, this),
                                    "Acessar nosso Bot no Telegram",
                                    /*#__PURE__*/ _jsxDEV(ArrowRight, {
                                        className: "h-4 w-4"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                        lineNumber: 109,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV(motion.p, {
                        initial: {
                            opacity: 0
                        },
                        animate: {
                            opacity: 1
                        },
                        transition: {
                            delay: 0.9
                        },
                        className: "text-xs text-muted-foreground/60",
                        children: [
                            "© ",
                            new Date().getFullYear(),
                            " Recargas Brasil · Todos os direitos reservados"
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/MaintenancePage.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/MaintenancePage.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
}
_c = MaintenancePage;
var _c;
$RefreshReg$(_c, "MaintenancePage");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/MaintenancePage.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/MaintenancePage.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1haW50ZW5hbmNlUGFnZS50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbW90aW9uIH0gZnJvbSBcImZyYW1lci1tb3Rpb25cIjtcbmltcG9ydCB7IENvbnN0cnVjdGlvbiwgQm90LCBBcnJvd1JpZ2h0LCBXcmVuY2gsIENsb2NrIH0gZnJvbSBcImx1Y2lkZS1yZWFjdFwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBNYWludGVuYW5jZVBhZ2UoKSB7XG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctYmFja2dyb3VuZCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBweC00IHB5LTEyIG92ZXJmbG93LWhpZGRlbiByZWxhdGl2ZVwiPlxuICAgICAgey8qIEFuaW1hdGVkIGJhY2tncm91bmQgZWxlbWVudHMgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgcG9pbnRlci1ldmVudHMtbm9uZSBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMS80IGxlZnQtMS80IHctOTYgaC05NiByb3VuZGVkLWZ1bGwgYmctcHJpbWFyeS81IGJsdXItM3hsXCJcbiAgICAgICAgICBhbmltYXRlPXt7IHNjYWxlOiBbMSwgMS4yLCAxXSwgb3BhY2l0eTogWzAuMywgMC41LCAwLjNdIH19XG4gICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogNiwgcmVwZWF0OiBJbmZpbml0eSB9fVxuICAgICAgICAvPlxuICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIGJvdHRvbS0xLzQgcmlnaHQtMS80IHctODAgaC04MCByb3VuZGVkLWZ1bGwgYmctd2FybmluZy81IGJsdXItM3hsXCJcbiAgICAgICAgICBhbmltYXRlPXt7IHNjYWxlOiBbMS4yLCAxLCAxLjJdLCBvcGFjaXR5OiBbMC4yLCAwLjQsIDAuMl0gfX1cbiAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiA4LCByZXBlYXQ6IEluZmluaXR5IH19XG4gICAgICAgIC8+XG4gICAgICA8L2Rpdj5cblxuICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAzMCB9fVxuICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMC43IH19XG4gICAgICAgIGNsYXNzTmFtZT1cInJlbGF0aXZlIHotMTAgbWF4LXctbGcgdy1mdWxsIHRleHQtY2VudGVyIHNwYWNlLXktOFwiXG4gICAgICA+XG4gICAgICAgIHsvKiBJY29uICovfVxuICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgIGluaXRpYWw9e3sgc2NhbGU6IDAgfX1cbiAgICAgICAgICBhbmltYXRlPXt7IHNjYWxlOiAxIH19XG4gICAgICAgICAgdHJhbnNpdGlvbj17eyB0eXBlOiBcInNwcmluZ1wiLCBzdGlmZm5lc3M6IDIwMCwgZGVsYXk6IDAuMiB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cIm14LWF1dG8gdy0yNCBoLTI0IHJvdW5kZWQtM3hsIGJnLWdyYWRpZW50LXRvLWJyIGZyb20td2FybmluZy8yMCB0by1wcmltYXJ5LzIwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNoYWRvdy0yeGwgc2hhZG93LXdhcm5pbmcvMTBcIlxuICAgICAgICA+XG4gICAgICAgICAgPENvbnN0cnVjdGlvbiBjbGFzc05hbWU9XCJoLTEyIHctMTIgdGV4dC13YXJuaW5nXCIgLz5cbiAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgIHsvKiBUaXRsZSAqL31cbiAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDEwIH19XG4gICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC40IH19XG4gICAgICAgID5cbiAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC0zeGwgc206dGV4dC00eGwgZm9udC1leHRyYWJvbGQgdGV4dC1mb3JlZ3JvdW5kIG1iLTJcIj5cbiAgICAgICAgICAgIPCfmqcgRXN0YW1vcyBlbSBNYW51dGVuw6fDo29cbiAgICAgICAgICA8L2gxPlxuICAgICAgICA8L21vdGlvbi5kaXY+XG5cbiAgICAgICAgey8qIE1lc3NhZ2UgKi99XG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAxMCB9fVxuICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuNSB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cInNwYWNlLXktNFwiXG4gICAgICAgID5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LW11dGVkLWZvcmVncm91bmQgdGV4dC1iYXNlIGxlYWRpbmctcmVsYXhlZFwiPlxuICAgICAgICAgICAgTm9zc28gc2l0ZSBlc3TDoSBwYXNzYW5kbyBwb3IgdW1hIGF0dWFsaXphw6fDo28gcGFyYSBtZWxob3JhciBzdWEgZXhwZXJpw6puY2lhLlxuICAgICAgICAgICAgRW0gYnJldmUgZXN0YXJlbW9zIGRlIHZvbHRhIGNvbSBtZWxob3JpYXMgZSBub3ZhcyBmdW5jaW9uYWxpZGFkZXMuXG4gICAgICAgICAgPC9wPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZCB0ZXh0LXNtXCI+XG4gICAgICAgICAgICBBZ3JhZGVjZW1vcyBzdWEgY29tcHJlZW5zw6NvIGUgcGVkaW1vcyB1bSBwb3VjbyBkZSBwYWNpw6puY2lhLiDwn5mPXG4gICAgICAgICAgPC9wPlxuICAgICAgICA8L21vdGlvbi5kaXY+XG5cbiAgICAgICAgey8qIFN0YXR1cyBpbmRpY2F0b3JzICovfVxuICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMTAgfX1cbiAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjYgfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtNiBweS00XCJcbiAgICAgICAgPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgIDxXcmVuY2ggY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LXdhcm5pbmcgYW5pbWF0ZS1wdWxzZVwiIC8+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlNpdGUgZW0gYXR1YWxpemHDp8Ojbzwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICA8Q2xvY2sgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5Wb2x0YSBlbSBicmV2ZTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgIHsvKiBUZWxlZ3JhbSBDYXJkICovfVxuICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMjAgfX1cbiAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICB0cmFuc2l0aW9uPXt7IGRlbGF5OiAwLjcgfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJyb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLWJvcmRlciBiZy1jYXJkLzYwIGJhY2tkcm9wLWJsdXItbGcgcC02IHNwYWNlLXktNCBzaGFkb3cteGxcIlxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgPEJvdCBjbGFzc05hbWU9XCJoLTUgdy01IHRleHQtW2hzbCgxOTksODklLDQ4JSldXCIgLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj5Cb3QgZG8gVGVsZWdyYW08L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsIHRleHQtWzEwcHhdIGZvbnQtYm9sZCBiZy1zdWNjZXNzLzE1IHRleHQtc3VjY2Vzc1wiPlxuICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3LTEuNSBoLTEuNSByb3VuZGVkLWZ1bGwgYmctc3VjY2VzcyBhbmltYXRlLXB1bHNlXCIgLz5cbiAgICAgICAgICAgICAgT05MSU5FXG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBsZWFkaW5nLXJlbGF4ZWRcIj5cbiAgICAgICAgICAgIEVucXVhbnRvIGZpbmFsaXphbW9zIGFzIGF0dWFsaXphw6fDtWVzIGRvIHNpdGUsIG5vc3NvIGJvdCBubyBUZWxlZ3JhbSBjb250aW51YSBmdW5jaW9uYW5kbyBub3JtYWxtZW50ZS5cbiAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICA8YVxuICAgICAgICAgICAgaHJlZj1cImh0dHBzOi8vdC5tZS9SZWNhcmdhc0JyYXNpbEJvdFwiXG4gICAgICAgICAgICB0YXJnZXQ9XCJfYmxhbmtcIlxuICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgcHgtNiBweS0zIHJvdW5kZWQteGwgYmctW2hzbCgxOTksODklLDQ4JSldIHRleHQtd2hpdGUgZm9udC1ib2xkIHRleHQtc20gaG92ZXI6b3BhY2l0eS05MCB0cmFuc2l0aW9uLW9wYWNpdHkgc2hhZG93LWxnIHNoYWRvdy1baHNsKDE5OSw4OSUsNDglKV0vMjBcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxCb3QgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+XG4gICAgICAgICAgICBBY2Vzc2FyIG5vc3NvIEJvdCBubyBUZWxlZ3JhbVxuICAgICAgICAgICAgPEFycm93UmlnaHQgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+XG4gICAgICAgICAgPC9hPlxuICAgICAgICA8L21vdGlvbi5kaXY+XG5cbiAgICAgICAgey8qIEZvb3RlciAqL31cbiAgICAgICAgPG1vdGlvbi5wXG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxIH19XG4gICAgICAgICAgdHJhbnNpdGlvbj17eyBkZWxheTogMC45IH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQvNjBcIlxuICAgICAgICA+XG4gICAgICAgICAgwqkge25ldyBEYXRlKCkuZ2V0RnVsbFllYXIoKX0gUmVjYXJnYXMgQnJhc2lsIMK3IFRvZG9zIG9zIGRpcmVpdG9zIHJlc2VydmFkb3NcbiAgICAgICAgPC9tb3Rpb24ucD5cbiAgICAgIDwvbW90aW9uLmRpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJtb3Rpb24iLCJDb25zdHJ1Y3Rpb24iLCJCb3QiLCJBcnJvd1JpZ2h0IiwiV3JlbmNoIiwiQ2xvY2siLCJNYWludGVuYW5jZVBhZ2UiLCJkaXYiLCJjbGFzc05hbWUiLCJhbmltYXRlIiwic2NhbGUiLCJvcGFjaXR5IiwidHJhbnNpdGlvbiIsImR1cmF0aW9uIiwicmVwZWF0IiwiSW5maW5pdHkiLCJpbml0aWFsIiwieSIsInR5cGUiLCJzdGlmZm5lc3MiLCJkZWxheSIsImgxIiwicCIsInNwYW4iLCJhIiwiaHJlZiIsInRhcmdldCIsInJlbCIsIkRhdGUiLCJnZXRGdWxsWWVhciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxNQUFNLFFBQVEsZ0JBQWdCO0FBQ3ZDLFNBQVNDLFlBQVksRUFBRUMsR0FBRyxFQUFFQyxVQUFVLEVBQUVDLE1BQU0sRUFBRUMsS0FBSyxRQUFRLGVBQWU7QUFFNUUsZUFBZSxTQUFTQztJQUN0QixxQkFDRSxRQUFDQztRQUFJQyxXQUFVOzswQkFFYixRQUFDRDtnQkFBSUMsV0FBVTs7a0NBQ2IsUUFBQ1IsT0FBT08sR0FBRzt3QkFDVEMsV0FBVTt3QkFDVkMsU0FBUzs0QkFBRUMsT0FBTztnQ0FBQztnQ0FBRztnQ0FBSzs2QkFBRTs0QkFBRUMsU0FBUztnQ0FBQztnQ0FBSztnQ0FBSzs2QkFBSTt3QkFBQzt3QkFDeERDLFlBQVk7NEJBQUVDLFVBQVU7NEJBQUdDLFFBQVFDO3dCQUFTOzs7Ozs7a0NBRTlDLFFBQUNmLE9BQU9PLEdBQUc7d0JBQ1RDLFdBQVU7d0JBQ1ZDLFNBQVM7NEJBQUVDLE9BQU87Z0NBQUM7Z0NBQUs7Z0NBQUc7NkJBQUk7NEJBQUVDLFNBQVM7Z0NBQUM7Z0NBQUs7Z0NBQUs7NkJBQUk7d0JBQUM7d0JBQzFEQyxZQUFZOzRCQUFFQyxVQUFVOzRCQUFHQyxRQUFRQzt3QkFBUzs7Ozs7Ozs7Ozs7OzBCQUloRCxRQUFDZixPQUFPTyxHQUFHO2dCQUNUUyxTQUFTO29CQUFFTCxTQUFTO29CQUFHTSxHQUFHO2dCQUFHO2dCQUM3QlIsU0FB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