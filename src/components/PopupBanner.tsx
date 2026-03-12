import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/PopupBanner.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/PopupBanner.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { X, ExternalLink } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import __vite__cjsImport5_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport5_react["useState"]; const useEffect = __vite__cjsImport5_react["useEffect"];
export function PopupBanner({ title = "🎉 Novidade!", subtitle = "Confira as novidades da plataforma!", visible = true, link, onClose }) {
    _s();
    const [open, setOpen] = useState(false);
    useEffect(()=>{
        if (visible) {
            const timer = setTimeout(()=>setOpen(true), 600);
            return ()=>clearTimeout(timer);
        }
        setOpen(false);
    }, [
        visible
    ]);
    if (!visible) return null;
    const handleClose = ()=>{
        setOpen(false);
        setTimeout(()=>onClose?.(), 300);
    };
    const handleClick = ()=>{
        if (link) window.open(link, "_blank", "noopener,noreferrer");
    };
    const floatingEmojis = [
        "🎉",
        "🔥",
        "⭐",
        "💎",
        "🚀"
    ];
    return /*#__PURE__*/ _jsxDEV(AnimatePresence, {
        children: open && /*#__PURE__*/ _jsxDEV(_Fragment, {
            children: [
                /*#__PURE__*/ _jsxDEV(motion.div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-[70]",
                    onClick: handleClose
                }, void 0, false, {
                    fileName: "/dev-server/src/components/PopupBanner.tsx",
                    lineNumber: 48,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ _jsxDEV(motion.div, {
                    initial: {
                        opacity: 0,
                        scale: 0.8,
                        y: 40
                    },
                    animate: {
                        opacity: 1,
                        scale: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        scale: 0.8,
                        y: 40
                    },
                    transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                    },
                    className: "fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none",
                    children: /*#__PURE__*/ _jsxDEV("div", {
                        className: "relative w-full max-w-sm rounded-2xl border border-primary/20 bg-card shadow-2xl overflow-hidden pointer-events-auto",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/PopupBanner.tsx",
                                lineNumber: 66,
                                columnNumber: 15
                            }, this),
                            floatingEmojis.map((emoji, i)=>/*#__PURE__*/ _jsxDEV(motion.span, {
                                    className: "absolute text-2xl select-none pointer-events-none opacity-15",
                                    style: {
                                        top: `${10 + i * 20 % 70}%`,
                                        left: `${5 + i * 25 % 85}%`
                                    },
                                    animate: {
                                        y: [
                                            0,
                                            -12,
                                            0
                                        ],
                                        rotate: [
                                            0,
                                            i % 2 === 0 ? 15 : -15,
                                            0
                                        ]
                                    },
                                    transition: {
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: i * 0.4
                                    },
                                    children: emoji
                                }, i, false, {
                                    fileName: "/dev-server/src/components/PopupBanner.tsx",
                                    lineNumber: 70,
                                    columnNumber: 17
                                }, this)),
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: handleClose,
                                className: "absolute top-3 right-3 z-10 p-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors",
                                children: /*#__PURE__*/ _jsxDEV(X, {
                                    className: "h-4 w-4"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/PopupBanner.tsx",
                                    lineNumber: 97,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/PopupBanner.tsx",
                                lineNumber: 93,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "relative px-6 py-8 text-center space-y-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(motion.div, {
                                        animate: {
                                            scale: [
                                                1,
                                                1.15,
                                                1
                                            ]
                                        },
                                        transition: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        },
                                        className: "w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center mx-auto",
                                        children: /*#__PURE__*/ _jsxDEV("span", {
                                            className: "text-3xl",
                                            children: "📢"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/PopupBanner.tsx",
                                            lineNumber: 108,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PopupBanner.tsx",
                                        lineNumber: 103,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("h3", {
                                        className: "text-lg font-bold text-foreground leading-tight",
                                        children: title
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PopupBanner.tsx",
                                        lineNumber: 111,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-sm text-muted-foreground leading-relaxed",
                                        children: subtitle
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/PopupBanner.tsx",
                                        lineNumber: 114,
                                        columnNumber: 17
                                    }, this),
                                    link && /*#__PURE__*/ _jsxDEV(motion.button, {
                                        whileHover: {
                                            scale: 1.03
                                        },
                                        whileTap: {
                                            scale: 0.97
                                        },
                                        onClick: handleClick,
                                        className: "inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(ExternalLink, {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/PopupBanner.tsx",
                                                lineNumber: 125,
                                                columnNumber: 21
                                            }, this),
                                            "Acessar agora"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/PopupBanner.tsx",
                                        lineNumber: 119,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/components/PopupBanner.tsx",
                                lineNumber: 101,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV(motion.div, {
                                initial: {
                                    scaleX: 0
                                },
                                animate: {
                                    scaleX: 1
                                },
                                transition: {
                                    duration: 0.8,
                                    delay: 0.3,
                                    ease: "easeOut"
                                },
                                className: "h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40 origin-left"
                            }, void 0, false, {
                                fileName: "/dev-server/src/components/PopupBanner.tsx",
                                lineNumber: 132,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/components/PopupBanner.tsx",
                        lineNumber: 64,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/components/PopupBanner.tsx",
                    lineNumber: 57,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "/dev-server/src/components/PopupBanner.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_s(PopupBanner, "e27cRtNMdAs0U0o1oHlS6A8OEBo=");
_c = PopupBanner;
var _c;
$RefreshReg$(_c, "PopupBanner");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/PopupBanner.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/PopupBanner.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBvcHVwQmFubmVyLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBtb3Rpb24sIEFuaW1hdGVQcmVzZW5jZSB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5pbXBvcnQgeyBYLCBFeHRlcm5hbExpbmsgfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSBcInJlYWN0XCI7XG5cbmludGVyZmFjZSBQb3B1cEJhbm5lclByb3BzIHtcbiAgdGl0bGU/OiBzdHJpbmc7XG4gIHN1YnRpdGxlPzogc3RyaW5nO1xuICB2aXNpYmxlPzogYm9vbGVhbjtcbiAgbGluaz86IHN0cmluZztcbiAgb25DbG9zZT86ICgpID0+IHZvaWQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBQb3B1cEJhbm5lcih7XG4gIHRpdGxlID0gXCLwn46JIE5vdmlkYWRlIVwiLFxuICBzdWJ0aXRsZSA9IFwiQ29uZmlyYSBhcyBub3ZpZGFkZXMgZGEgcGxhdGFmb3JtYSFcIixcbiAgdmlzaWJsZSA9IHRydWUsXG4gIGxpbmssXG4gIG9uQ2xvc2UsXG59OiBQb3B1cEJhbm5lclByb3BzKSB7XG4gIGNvbnN0IFtvcGVuLCBzZXRPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gc2V0T3Blbih0cnVlKSwgNjAwKTtcbiAgICAgIHJldHVybiAoKSA9PiBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIH1cbiAgICBzZXRPcGVuKGZhbHNlKTtcbiAgfSwgW3Zpc2libGVdKTtcblxuICBpZiAoIXZpc2libGUpIHJldHVybiBudWxsO1xuXG4gIGNvbnN0IGhhbmRsZUNsb3NlID0gKCkgPT4ge1xuICAgIHNldE9wZW4oZmFsc2UpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4gb25DbG9zZT8uKCksIDMwMCk7XG4gIH07XG5cbiAgY29uc3QgaGFuZGxlQ2xpY2sgPSAoKSA9PiB7XG4gICAgaWYgKGxpbmspIHdpbmRvdy5vcGVuKGxpbmssIFwiX2JsYW5rXCIsIFwibm9vcGVuZXIsbm9yZWZlcnJlclwiKTtcbiAgfTtcblxuICBjb25zdCBmbG9hdGluZ0Vtb2ppcyA9IFtcIvCfjolcIiwgXCLwn5SlXCIsIFwi4q2QXCIsIFwi8J+SjlwiLCBcIvCfmoBcIl07XG5cbiAgcmV0dXJuIChcbiAgICA8QW5pbWF0ZVByZXNlbmNlPlxuICAgICAge29wZW4gJiYgKFxuICAgICAgICA8PlxuICAgICAgICAgIHsvKiBCYWNrZHJvcCAqL31cbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX1cbiAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCBiZy1ibGFjay81MCBiYWNrZHJvcC1ibHVyLXNtIHotWzcwXVwiXG4gICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVDbG9zZX1cbiAgICAgICAgICAvPlxuXG4gICAgICAgICAgey8qIFBvcHVwICovfVxuICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjgsIHk6IDQwIH19XG4gICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHNjYWxlOiAxLCB5OiAwIH19XG4gICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjgsIHk6IDQwIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAyNSB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCB6LVs3MF0gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcC00IHBvaW50ZXItZXZlbnRzLW5vbmVcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgdy1mdWxsIG1heC13LXNtIHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItcHJpbWFyeS8yMCBiZy1jYXJkIHNoYWRvdy0yeGwgb3ZlcmZsb3ctaGlkZGVuIHBvaW50ZXItZXZlbnRzLWF1dG9cIj5cbiAgICAgICAgICAgICAgey8qIEJhY2tncm91bmQgZ3JhZGllbnQgKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgaW5zZXQtMCBiZy1ncmFkaWVudC10by1iciBmcm9tLXByaW1hcnkvMTAgdmlhLWJhY2tncm91bmQgdG8tYWNjZW50LzEwXCIgLz5cblxuICAgICAgICAgICAgICB7LyogRmxvYXRpbmcgZW1vamlzICovfVxuICAgICAgICAgICAgICB7ZmxvYXRpbmdFbW9qaXMubWFwKChlbW9qaSwgaSkgPT4gKFxuICAgICAgICAgICAgICAgIDxtb3Rpb24uc3BhblxuICAgICAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdGV4dC0yeGwgc2VsZWN0LW5vbmUgcG9pbnRlci1ldmVudHMtbm9uZSBvcGFjaXR5LTE1XCJcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogYCR7MTAgKyAoaSAqIDIwKSAlIDcwfSVgLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBgJHs1ICsgKGkgKiAyNSkgJSA4NX0lYCxcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICBhbmltYXRlPXt7XG4gICAgICAgICAgICAgICAgICAgIHk6IFswLCAtMTIsIDBdLFxuICAgICAgICAgICAgICAgICAgICByb3RhdGU6IFswLCBpICUgMiA9PT0gMCA/IDE1IDogLTE1LCAwXSxcbiAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7XG4gICAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiAzICsgaSAqIDAuNSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0OiBJbmZpbml0eSxcbiAgICAgICAgICAgICAgICAgICAgZWFzZTogXCJlYXNlSW5PdXRcIixcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IGkgKiAwLjQsXG4gICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtlbW9qaX1cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5zcGFuPlxuICAgICAgICAgICAgICApKX1cblxuICAgICAgICAgICAgICB7LyogQ2xvc2UgYnV0dG9uICovfVxuICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlQ2xvc2V9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTMgcmlnaHQtMyB6LTEwIHAtMS41IHJvdW5kZWQtZnVsbCBiZy1kZXN0cnVjdGl2ZS8xMCBob3ZlcjpiZy1kZXN0cnVjdGl2ZS8yMCB0ZXh0LWRlc3RydWN0aXZlIHRyYW5zaXRpb24tY29sb3JzXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxYIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgICAgICA8L2J1dHRvbj5cblxuICAgICAgICAgICAgICB7LyogQ29udGVudCAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBweC02IHB5LTggdGV4dC1jZW50ZXIgc3BhY2UteS00XCI+XG4gICAgICAgICAgICAgICAgey8qIEFuaW1hdGVkIGljb24gKi99XG4gICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgc2NhbGU6IFsxLCAxLjE1LCAxXSB9fVxuICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMiwgcmVwZWF0OiBJbmZpbml0eSwgZWFzZTogXCJlYXNlSW5PdXRcIiB9fVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy0xNiBoLTE2IHJvdW5kZWQtMnhsIGJnLXByaW1hcnkvMTUgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG14LWF1dG9cIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtM3hsXCI+8J+Tojwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIGxlYWRpbmctdGlnaHRcIj5cbiAgICAgICAgICAgICAgICAgIHt0aXRsZX1cbiAgICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGxlYWRpbmctcmVsYXhlZFwiPlxuICAgICAgICAgICAgICAgICAge3N1YnRpdGxlfVxuICAgICAgICAgICAgICAgIDwvcD5cblxuICAgICAgICAgICAgICAgIHtsaW5rICYmIChcbiAgICAgICAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgc2NhbGU6IDEuMDMgfX1cbiAgICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTcgfX1cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17aGFuZGxlQ2xpY2t9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBweC02IHB5LTIuNSByb3VuZGVkLXhsIGJnLXByaW1hcnkgdGV4dC1wcmltYXJ5LWZvcmVncm91bmQgZm9udC1zZW1pYm9sZCB0ZXh0LXNtIHNoYWRvdy1sZyBob3ZlcjpzaGFkb3cteGwgdHJhbnNpdGlvbi1zaGFkb3dcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8RXh0ZXJuYWxMaW5rIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICBBY2Vzc2FyIGFnb3JhXG4gICAgICAgICAgICAgICAgICA8L21vdGlvbi5idXR0b24+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgey8qIEJvdHRvbSBhY2NlbnQgYmFyICovfVxuICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgc2NhbGVYOiAwIH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBzY2FsZVg6IDEgfX1cbiAgICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAwLjgsIGRlbGF5OiAwLjMsIGVhc2U6IFwiZWFzZU91dFwiIH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaC0xIGJnLWdyYWRpZW50LXRvLXIgZnJvbS1wcmltYXJ5LzQwIHZpYS1wcmltYXJ5IHRvLXByaW1hcnkvNDAgb3JpZ2luLWxlZnRcIlxuICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICA8Lz5cbiAgICAgICl9XG4gICAgPC9BbmltYXRlUHJlc2VuY2U+XG4gICk7XG59XG4iXSwibmFtZXMiOlsibW90aW9uIiwiQW5pbWF0ZVByZXNlbmNlIiwiWCIsIkV4dGVybmFsTGluayIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwiUG9wdXBCYW5uZXIiLCJ0aXRsZSIsInN1YnRpdGxlIiwidmlzaWJsZSIsImxpbmsiLCJvbkNsb3NlIiwib3BlbiIsInNldE9wZW4iLCJ0aW1lciIsInNldFRpbWVvdXQiLCJjbGVhclRpbWVvdXQiLCJoYW5kbGVDbG9zZSIsImhhbmRsZUNsaWNrIiwid2luZG93IiwiZmxvYXRpbmdFbW9qaXMiLCJkaXYiLCJpbml0aWFsIiwib3BhY2l0eSIsImFuaW1hdGUiLCJleGl0IiwiY2xhc3NOYW1lIiwib25DbGljayIsInNjYWxlIiwieSIsInRyYW5zaXRpb24iLCJ0eXBlIiwic3RpZmZuZXNzIiwiZGFtcGluZyIsIm1hcCIsImVtb2ppIiwiaSIsInNwYW4iLCJzdHlsZSIsInRvcCIsImxlZnQiLCJyb3RhdGUiLCJkdXJhdGlvbiIsInJlcGVhdCIsIkluZmluaXR5IiwiZWFzZSIsImRlbGF5IiwiYnV0dG9uIiwiaDMiLCJwIiwid2hpbGVIb3ZlciIsIndoaWxlVGFwIiwic2NhbGVYIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxNQUFNLEVBQUVDLGVBQWUsUUFBUSxnQkFBZ0I7QUFDeEQsU0FBU0MsQ0FBQyxFQUFFQyxZQUFZLFFBQVEsZUFBZTtBQUMvQyxTQUFTQyxRQUFRLEVBQUVDLFNBQVMsUUFBUSxRQUFRO0FBVTVDLE9BQU8sU0FBU0MsWUFBWSxFQUMxQkMsUUFBUSxjQUFjLEVBQ3RCQyxXQUFXLHFDQUFxQyxFQUNoREMsVUFBVSxJQUFJLEVBQ2RDLElBQUksRUFDSkMsT0FBTyxFQUNVOztJQUNqQixNQUFNLENBQUNDLE1BQU1DLFFBQVEsR0FBR1QsU0FBUztJQUVqQ0MsVUFBVTtRQUNSLElBQUlJLFNBQVM7WUFDWCxNQUFNSyxRQUFRQyxXQUFXLElBQU1GLFFBQVEsT0FBTztZQUM5QyxPQUFPLElBQU1HLGFBQWFGO1FBQzVCO1FBQ0FELFFBQVE7SUFDVixHQUFHO1FBQUNKO0tBQVE7SUFFWixJQUFJLENBQUNBLFNBQVMsT0FBTztJQUVyQixNQUFNUSxjQUFjO1FBQ2xCSixRQUFRO1FBQ1JFLFdBQVcsSUFBTUosYUFBYTtJQUNoQztJQUVBLE1BQU1PLGNBQWM7UUFDbEIsSUFBSVIsTUFBTVMsT0FBT1AsSUFBSSxDQUFDRixNQUFNLFVBQVU7SUFDeEM7SUFFQSxNQUFNVSxpQkFBaUI7UUFBQztRQUFNO1FBQU07UUFBSztRQUFNO0tBQUs7SUFFcEQscUJBQ0UsUUFBQ25CO2tCQUNFVyxzQkFDQzs7OEJBRUUsUUFBQ1osT0FBT3FCLEdBQUc7b0JBQ1RDLFNBQVM7d0JBQUVDLFNBQVM7b0JBQUU7b0JBQ3RCQyxTQUFTO3dCQUFFRCxTQUFTO29CQUFFO29CQUN0QkUsTUFBTTt3QkFBRUYsU0FBUztvQkFBRTtvQkFDbkJHLFdBQVU7b0JBQ1ZDLFNBQVNWOzs7Ozs7OEJBSVgsUUFBQ2pCLE9BQU9xQixHQUFHO29CQUNUQyxTQUFTO3dCQUFFQyxTQUFTO3dCQUFHSyxPQUFPO3dCQUFLQyxHQUFHO29CQUFHO29CQUN6Q0wsU0FBUzt3QkFBRUQsU0FBUzt3QkFBR0ssT0FBTzt3QkFBR0MsR0FBRztvQkFBRTtvQkFDdENKLE1BQU07d0JBQUVGLFNBQVM7d0JBQUdLLE9BQU87d0JBQUtDLEdBQUc7b0JBQUc7b0JBQ3RDQyxZQUFZO3dCQUFFQyxNQUFNO3dCQUFVQyxXQUFXO3dCQUFLQyxTQUFTO29CQUFHO29CQUMxRFAsV0FBVTs4QkFFVixjQUFBLFFBQUNMO3dCQUFJSyxXQUFVOzswQ0FFYixRQUFDTDtnQ0FBSUssV0FBVTs7Ozs7OzRCQUdkTixlQUFlYyxHQUFHLENBQUMsQ0FBQ0MsT0FBT0Msa0JBQzFCLFFBQUNwQyxPQUFPcUMsSUFBSTtvQ0FFVlgsV0FBVTtvQ0FDVlksT0FBTzt3Q0FDTEMsS0FBSyxHQUFHLEtBQUssQUFBQ0gsSUFBSSxLQUFNLEdBQUcsQ0FBQyxDQUFDO3dDQUM3QkksTUFBTSxHQUFHLElBQUksQUFBQ0osSUFBSSxLQUFNLEdBQUcsQ0FBQyxDQUFDO29DQUMvQjtvQ0FDQVosU0FBUzt3Q0FDUEssR0FBRzs0Q0FBQzs0Q0FBRyxDQUFDOzRDQUFJO3lDQUFFO3dDQUNkWSxRQUFROzRDQUFDOzRDQUFHTCxJQUFJLE1BQU0sSUFBSSxLQUFLLENBQUM7NENBQUk7eUNBQUU7b0NBQ3hDO29DQUNBTixZQUFZO3dDQUNWWSxVQUFVLElBQUlOLElBQUk7d0NBQ2xCTyxRQUFRQzt3Q0FDUkMsTUFBTTt3Q0FDTkMsT0FBT1YsSUFBSTtvQ0FDYjs4Q0FFQ0Q7bUNBakJJQzs7Ozs7MENBc0JULFFBQUNXO2dDQUNDcEIsU0FBU1Y7Z0NBQ1RTLFdBQVU7MENBRVYsY0FBQSxRQUFDeEI7b0NBQUV3QixXQUFVOzs7Ozs7Ozs7OzswQ0FJZixRQUFDTDtnQ0FBSUssV0FBVTs7a0RBRWIsUUFBQzFCLE9BQU9xQixHQUFHO3dDQUNURyxTQUFTOzRDQUFFSSxPQUFPO2dEQUFDO2dEQUFHO2dEQUFNOzZDQUFFO3dDQUFDO3dDQUMvQkUsWUFBWTs0Q0FBRVksVUFBVTs0Q0FBR0MsUUFBUUM7NENBQVVDLE1BQU07d0NBQVk7d0NBQy9EbkIsV0FBVTtrREFFVixjQUFBLFFBQUNXOzRDQUFLWCxXQUFVO3NEQUFXOzs7Ozs7Ozs7OztrREFHN0IsUUFBQ3NCO3dDQUFHdEIsV0FBVTtrREFDWG5COzs7Ozs7a0RBRUgsUUFBQzBDO3dDQUFFdkIsV0FBVTtrREFDVmxCOzs7Ozs7b0NBR0ZFLHNCQUNDLFFBQUNWLE9BQU8rQyxNQUFNO3dDQUNaRyxZQUFZOzRDQUFFdEIsT0FBTzt3Q0FBSzt3Q0FDMUJ1QixVQUFVOzRDQUFFdkIsT0FBTzt3Q0FBSzt3Q0FDeEJELFNBQVNUO3dDQUNUUSxXQUFVOzswREFFVixRQUFDdkI7Z0RBQWF1QixXQUFVOzs7Ozs7NENBQVk7Ozs7Ozs7Ozs7Ozs7MENBTzFDLFFBQUMxQixPQUFPcUIsR0FBRztnQ0FDVEMsU0FBUztvQ0FBRThCLFFBQVE7Z0NBQUU7Z0NBQ3JCNUIsU0FBUztvQ0FBRTRCLFFBQVE7Z0NBQUU7Z0NBQ3JCdEIsWUFBWTtvQ0FBRVksVUFBVTtvQ0FBS0ksT0FBTztvQ0FBS0QsTUFBTTtnQ0FBVTtnQ0FDekRuQixXQUFVOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFRMUI7R0FuSWdCcEI7S0FBQUEifQ==