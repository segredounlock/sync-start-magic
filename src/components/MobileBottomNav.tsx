import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/components/MobileBottomNav.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/components/MobileBottomNav.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"];
import { MoreHorizontal, X, LogOut } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { ThemeToggle } from "/src/components/ThemeToggle.tsx";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
export function MobileBottomNav({ items, activeKey, onSelect, mainCount = 4, userLabel, userRole, userAvatarUrl, onSignOut, panelLinks }) {
    _s();
    const navigate = useNavigate();
    const mainItems = items.slice(0, mainCount);
    const moreItems = items.slice(mainCount);
    const hasMore = moreItems.length > 0;
    const [moreOpen, setMoreOpen] = useState(false);
    const handleSelect = (key)=>{
        onSelect(key);
        setMoreOpen(false);
    };
    const isActiveInMore = moreItems.some((i)=>i.key === activeKey);
    return /*#__PURE__*/ _jsxDEV(_Fragment, {
        children: [
            /*#__PURE__*/ _jsxDEV("nav", {
                className: "fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)]",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "flex items-center justify-around h-16",
                    children: [
                        mainItems.map((item)=>{
                            const isActive = activeKey === item.key;
                            return /*#__PURE__*/ _jsxDEV(motion.button, {
                                onClick: ()=>handleSelect(item.key),
                                className: `flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[56px] touch-manipulation transition-colors ${isActive ? "" : "opacity-50"}`,
                                whileTap: {
                                    scale: 0.9
                                },
                                children: [
                                    /*#__PURE__*/ _jsxDEV(motion.div, {
                                        animate: {
                                            y: [
                                                0,
                                                -2,
                                                0
                                            ]
                                        },
                                        transition: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        },
                                        children: /*#__PURE__*/ _jsxDEV(item.icon, {
                                            className: `h-6 w-6 ${item.color || "text-primary"}`
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                            lineNumber: 79,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                        lineNumber: 75,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("span", {
                                        className: `text-xs font-semibold ${item.color || "text-primary"}`,
                                        children: item.label
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                        lineNumber: 81,
                                        columnNumber: 17
                                    }, this),
                                    isActive && /*#__PURE__*/ _jsxDEV(motion.div, {
                                        className: "w-1.5 h-1.5 rounded-full bg-primary",
                                        initial: {
                                            scale: 0
                                        },
                                        animate: {
                                            scale: 1
                                        },
                                        layoutId: "nav-dot"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                        lineNumber: 85,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, item.key, true, {
                                fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                lineNumber: 67,
                                columnNumber: 15
                            }, this);
                        }),
                        hasMore && /*#__PURE__*/ _jsxDEV("button", {
                            onClick: ()=>setMoreOpen(true),
                            className: `flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-[56px] touch-manipulation transition-colors ${isActiveInMore ? "" : "opacity-50"}`,
                            children: [
                                /*#__PURE__*/ _jsxDEV(MoreHorizontal, {
                                    className: "h-6 w-6 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                    lineNumber: 103,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("span", {
                                    className: "text-xs font-semibold text-muted-foreground",
                                    children: "Mais"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                    lineNumber: 104,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                            lineNumber: 97,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                children: moreOpen && /*#__PURE__*/ _jsxDEV(_Fragment, {
                    children: [
                        /*#__PURE__*/ _jsxDEV(motion.div, {
                            className: "fixed inset-0 bg-black/50 z-[60] md:hidden",
                            onClick: ()=>setMoreOpen(false),
                            initial: {
                                opacity: 0
                            },
                            animate: {
                                opacity: 1
                            },
                            exit: {
                                opacity: 0
                            }
                        }, void 0, false, {
                            fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                            lineNumber: 114,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ _jsxDEV(motion.div, {
                            className: "fixed inset-x-0 bottom-0 z-[61] md:hidden rounded-t-2xl bg-background border-t border-border shadow-2xl pb-[env(safe-area-inset-bottom)]",
                            initial: {
                                y: "100%"
                            },
                            animate: {
                                y: 0
                            },
                            exit: {
                                y: "100%"
                            },
                            transition: {
                                type: "spring",
                                damping: 28,
                                stiffness: 300
                            },
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex justify-center pt-3 pb-2",
                                    children: /*#__PURE__*/ _jsxDEV("div", {
                                        className: "w-9 h-1 rounded-full bg-muted-foreground/20"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                        lineNumber: 129,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                    lineNumber: 128,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex items-center justify-between px-5 pb-3",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("h2", {
                                            className: "text-base font-bold text-foreground",
                                            children: "Menu"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                            lineNumber: 133,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                    lineNumber: 135,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("button", {
                                                    onClick: ()=>setMoreOpen(false),
                                                    className: "w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive hover:bg-destructive/20 transition-colors",
                                                    children: /*#__PURE__*/ _jsxDEV(X, {
                                                        className: "h-4 w-4"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                        lineNumber: 140,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                    lineNumber: 136,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                            lineNumber: 134,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                    lineNumber: 132,
                                    columnNumber: 15
                                }, this),
                                userLabel && /*#__PURE__*/ _jsxDEV("div", {
                                    className: "mx-4 mb-3 p-3 rounded-xl bg-muted/40",
                                    children: /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            userAvatarUrl ? /*#__PURE__*/ _jsxDEV("img", {
                                                src: userAvatarUrl,
                                                alt: "Avatar",
                                                className: "w-9 h-9 rounded-full object-cover shrink-0",
                                                referrerPolicy: "no-referrer",
                                                onError: (e)=>{
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling && e.target.nextElementSibling.style.removeProperty('display');
                                                }
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                lineNumber: 149,
                                                columnNumber: 23
                                            }, this) : null,
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary",
                                                style: userAvatarUrl ? {
                                                    display: 'none'
                                                } : {},
                                                children: (userLabel[0] || "U").toUpperCase()
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                lineNumber: 151,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "min-w-0",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-sm font-semibold text-foreground truncate",
                                                        children: userLabel
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                        lineNumber: 155,
                                                        columnNumber: 23
                                                    }, this),
                                                    userRole && /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-[11px] text-muted-foreground",
                                                        children: userRole
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                        lineNumber: 156,
                                                        columnNumber: 36
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                lineNumber: 154,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                        lineNumber: 147,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                    lineNumber: 146,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "px-4 pb-3 grid grid-cols-3 gap-2",
                                    children: moreItems.map((item)=>{
                                        const isActive = activeKey === item.key;
                                        return /*#__PURE__*/ _jsxDEV(motion.button, {
                                            onClick: ()=>handleSelect(item.key),
                                            className: `flex flex-col items-center justify-center gap-2 py-4 rounded-xl transition-colors ${isActive ? "bg-primary/10 text-primary" : "bg-muted/30 text-foreground"}`,
                                            initial: {
                                                opacity: 0,
                                                scale: 0.8
                                            },
                                            animate: {
                                                opacity: 1,
                                                scale: 1
                                            },
                                            transition: {
                                                delay: 0.05 * moreItems.indexOf(item),
                                                type: "spring",
                                                stiffness: 300,
                                                damping: 20
                                            },
                                            whileTap: {
                                                scale: 0.9
                                            },
                                            children: [
                                                /*#__PURE__*/ _jsxDEV(motion.div, {
                                                    animate: {
                                                        y: [
                                                            0,
                                                            -3,
                                                            0
                                                        ]
                                                    },
                                                    transition: {
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: 0.1 * moreItems.indexOf(item)
                                                    },
                                                    children: /*#__PURE__*/ _jsxDEV(item.icon, {
                                                        className: `h-5 w-5 ${item.color || "text-primary"}`
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                        lineNumber: 181,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                    lineNumber: 177,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("span", {
                                                    className: "text-[11px] font-semibold",
                                                    children: item.label
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                    lineNumber: 183,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, item.key, true, {
                                            fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                            lineNumber: 166,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                    lineNumber: 162,
                                    columnNumber: 15
                                }, this),
                                panelLinks && panelLinks.length > 0 && /*#__PURE__*/ _jsxDEV("div", {
                                    className: "px-4 pb-2 space-y-0.5",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("p", {
                                            className: "text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold px-1 mb-1",
                                            children: "Ir para"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                            lineNumber: 191,
                                            columnNumber: 19
                                        }, this),
                                        panelLinks.map((link)=>/*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>{
                                                    navigate(link.path);
                                                    setMoreOpen(false);
                                                },
                                                className: "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/30 transition-colors",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV(link.icon, {
                                                        className: `h-4 w-4 ${link.color}`
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                        lineNumber: 198,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        children: link.label
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                        lineNumber: 199,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, link.path, true, {
                                                fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                lineNumber: 193,
                                                columnNumber: 21
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                    lineNumber: 190,
                                    columnNumber: 17
                                }, this),
                                onSignOut && /*#__PURE__*/ _jsxDEV("div", {
                                    className: "px-4 pb-5 pt-2",
                                    children: /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: onSignOut,
                                        className: "w-full py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold flex items-center justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(LogOut, {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                                lineNumber: 211,
                                                columnNumber: 21
                                            }, this),
                                            " Sair"
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                        lineNumber: 207,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                                    lineNumber: 206,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                            lineNumber: 121,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "/dev-server/src/components/MobileBottomNav.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
_s(MobileBottomNav, "Q+d9hTjMxy07dGIHPtyC8xUUn9M=", false, function() {
    return [
        useNavigate
    ];
});
_c = MobileBottomNav;
var _c;
$RefreshReg$(_c, "MobileBottomNav");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/components/MobileBottomNav.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/components/MobileBottomNav.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1vYmlsZUJvdHRvbU5hdi50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IE1vcmVIb3Jpem9udGFsLCBYLCBMb2dPdXQgfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5pbXBvcnQgeyBMdWNpZGVJY29uIH0gZnJvbSBcImx1Y2lkZS1yZWFjdFwiO1xuaW1wb3J0IHsgVGhlbWVUb2dnbGUgfSBmcm9tIFwiQC9jb21wb25lbnRzL1RoZW1lVG9nZ2xlXCI7XG5pbXBvcnQgeyBtb3Rpb24sIEFuaW1hdGVQcmVzZW5jZSB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5pbXBvcnQgeyB1c2VOYXZpZ2F0ZSB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgTmF2SXRlbSB7XG4gIGtleTogc3RyaW5nO1xuICBsYWJlbDogc3RyaW5nO1xuICBpY29uOiBMdWNpZGVJY29uO1xuICBjb2xvcj86IHN0cmluZztcbiAgYW5pbWF0aW9uPzogXCJwdWxzZVwiIHwgXCJib3VuY2VcIiB8IFwic3BpblwiIHwgXCJ3aWdnbGVcIiB8IFwiZmxvYXRcIjtcbiAgaGlnaGxpZ2h0ZWQ/OiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgUGFuZWxMaW5rIHtcbiAgbGFiZWw6IHN0cmluZztcbiAgcGF0aDogc3RyaW5nO1xuICBpY29uOiBMdWNpZGVJY29uO1xuICBjb2xvcjogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgTW9iaWxlQm90dG9tTmF2UHJvcHMge1xuICBpdGVtczogTmF2SXRlbVtdO1xuICBhY3RpdmVLZXk6IHN0cmluZztcbiAgb25TZWxlY3Q6IChrZXk6IHN0cmluZykgPT4gdm9pZDtcbiAgbWFpbkNvdW50PzogbnVtYmVyO1xuICB1c2VyTGFiZWw/OiBzdHJpbmc7XG4gIHVzZXJSb2xlPzogc3RyaW5nO1xuICB1c2VyQXZhdGFyVXJsPzogc3RyaW5nIHwgbnVsbDtcbiAgb25TaWduT3V0PzogKCkgPT4gdm9pZDtcbiAgcGFuZWxMaW5rcz86IFBhbmVsTGlua1tdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gTW9iaWxlQm90dG9tTmF2KHtcbiAgaXRlbXMsXG4gIGFjdGl2ZUtleSxcbiAgb25TZWxlY3QsXG4gIG1haW5Db3VudCA9IDQsXG4gIHVzZXJMYWJlbCxcbiAgdXNlclJvbGUsXG4gIHVzZXJBdmF0YXJVcmwsXG4gIG9uU2lnbk91dCxcbiAgcGFuZWxMaW5rcyxcbn06IE1vYmlsZUJvdHRvbU5hdlByb3BzKSB7XG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcbiAgY29uc3QgbWFpbkl0ZW1zID0gaXRlbXMuc2xpY2UoMCwgbWFpbkNvdW50KTtcbiAgY29uc3QgbW9yZUl0ZW1zID0gaXRlbXMuc2xpY2UobWFpbkNvdW50KTtcbiAgY29uc3QgaGFzTW9yZSA9IG1vcmVJdGVtcy5sZW5ndGggPiAwO1xuICBjb25zdCBbbW9yZU9wZW4sIHNldE1vcmVPcGVuXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICBjb25zdCBoYW5kbGVTZWxlY3QgPSAoa2V5OiBzdHJpbmcpID0+IHtcbiAgICBvblNlbGVjdChrZXkpO1xuICAgIHNldE1vcmVPcGVuKGZhbHNlKTtcbiAgfTtcblxuICBjb25zdCBpc0FjdGl2ZUluTW9yZSA9IG1vcmVJdGVtcy5zb21lKGkgPT4gaS5rZXkgPT09IGFjdGl2ZUtleSk7XG5cbiAgcmV0dXJuIChcbiAgICA8PlxuICAgICAgPG5hdiBjbGFzc05hbWU9XCJmaXhlZCBib3R0b20tMCBsZWZ0LTAgcmlnaHQtMCB6LTUwIG1kOmhpZGRlbiBiZy1jYXJkLzk1IGJhY2tkcm9wLWJsdXIteGwgYm9yZGVyLXQgYm9yZGVyLWJvcmRlci81MCBwYi1bZW52KHNhZmUtYXJlYS1pbnNldC1ib3R0b20pXVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYXJvdW5kIGgtMTZcIj5cbiAgICAgICAgICB7bWFpbkl0ZW1zLm1hcCgoaXRlbSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNBY3RpdmUgPSBhY3RpdmVLZXkgPT09IGl0ZW0ua2V5O1xuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgPG1vdGlvbi5idXR0b25cbiAgICAgICAgICAgICAgICBrZXk9e2l0ZW0ua2V5fVxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVNlbGVjdChpdGVtLmtleSl9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTEgZmxleC0xIGgtZnVsbCBtaW4tdy1bNTZweF0gdG91Y2gtbWFuaXB1bGF0aW9uIHRyYW5zaXRpb24tY29sb3JzICR7XG4gICAgICAgICAgICAgICAgICBpc0FjdGl2ZSA/IFwiXCIgOiBcIm9wYWNpdHktNTBcIlxuICAgICAgICAgICAgICAgIH1gfVxuICAgICAgICAgICAgICAgIHdoaWxlVGFwPXt7IHNjYWxlOiAwLjkgfX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAgICBhbmltYXRlPXt7IHk6IFswLCAtMiwgMF0gfX1cbiAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDIsIHJlcGVhdDogSW5maW5pdHksIGVhc2U6IFwiZWFzZUluT3V0XCIgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8aXRlbS5pY29uIGNsYXNzTmFtZT17YGgtNiB3LTYgJHtpdGVtLmNvbG9yIHx8IFwidGV4dC1wcmltYXJ5XCJ9YH0gLz5cbiAgICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPXtgdGV4dC14cyBmb250LXNlbWlib2xkICR7aXRlbS5jb2xvciB8fCBcInRleHQtcHJpbWFyeVwifWB9PlxuICAgICAgICAgICAgICAgICAge2l0ZW0ubGFiZWx9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIHtpc0FjdGl2ZSAmJiAoXG4gICAgICAgICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LTEuNSBoLTEuNSByb3VuZGVkLWZ1bGwgYmctcHJpbWFyeVwiXG4gICAgICAgICAgICAgICAgICAgIGluaXRpYWw9e3sgc2NhbGU6IDAgfX1cbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICAgICAgICBsYXlvdXRJZD1cIm5hdi1kb3RcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L21vdGlvbi5idXR0b24+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pfVxuXG4gICAgICAgICAge2hhc01vcmUgJiYgKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRNb3JlT3Blbih0cnVlKX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTEgZmxleC0xIGgtZnVsbCBtaW4tdy1bNTZweF0gdG91Y2gtbWFuaXB1bGF0aW9uIHRyYW5zaXRpb24tY29sb3JzICR7XG4gICAgICAgICAgICAgICAgaXNBY3RpdmVJbk1vcmUgPyBcIlwiIDogXCJvcGFjaXR5LTUwXCJcbiAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxNb3JlSG9yaXpvbnRhbCBjbGFzc05hbWU9XCJoLTYgdy02IHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiIC8+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1zZW1pYm9sZCB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5NYWlzPC9zcGFuPlxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L25hdj5cblxuICAgICAgey8qIEJvdHRvbSBTaGVldCAqL31cbiAgICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICAgIHttb3JlT3BlbiAmJiAoXG4gICAgICAgICAgPD5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZpeGVkIGluc2V0LTAgYmctYmxhY2svNTAgei1bNjBdIG1kOmhpZGRlblwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vcmVPcGVuKGZhbHNlKX1cbiAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSB9fVxuICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAgfX1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmaXhlZCBpbnNldC14LTAgYm90dG9tLTAgei1bNjFdIG1kOmhpZGRlbiByb3VuZGVkLXQtMnhsIGJnLWJhY2tncm91bmQgYm9yZGVyLXQgYm9yZGVyLWJvcmRlciBzaGFkb3ctMnhsIHBiLVtlbnYoc2FmZS1hcmVhLWluc2V0LWJvdHRvbSldXCJcbiAgICAgICAgICAgICAgaW5pdGlhbD17eyB5OiBcIjEwMCVcIiB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IHk6IDAgfX1cbiAgICAgICAgICAgICAgZXhpdD17eyB5OiBcIjEwMCVcIiB9fVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIGRhbXBpbmc6IDI4LCBzdGlmZm5lc3M6IDMwMCB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1jZW50ZXIgcHQtMyBwYi0yXCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTkgaC0xIHJvdW5kZWQtZnVsbCBiZy1tdXRlZC1mb3JlZ3JvdW5kLzIwXCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNSBwYi0zXCI+XG4gICAgICAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtYmFzZSBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+TWVudTwvaDI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgICAgPFRoZW1lVG9nZ2xlIC8+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldE1vcmVPcGVuKGZhbHNlKX1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy04IGgtOCByb3VuZGVkLWZ1bGwgYmctZGVzdHJ1Y3RpdmUvMTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdGV4dC1kZXN0cnVjdGl2ZSBob3ZlcjpiZy1kZXN0cnVjdGl2ZS8yMCB0cmFuc2l0aW9uLWNvbG9yc1wiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxYIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHt1c2VyTGFiZWwgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXgtNCBtYi0zIHAtMyByb3VuZGVkLXhsIGJnLW11dGVkLzQwXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICAgIHt1c2VyQXZhdGFyVXJsID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxpbWcgc3JjPXt1c2VyQXZhdGFyVXJsfSBhbHQ9XCJBdmF0YXJcIiBjbGFzc05hbWU9XCJ3LTkgaC05IHJvdW5kZWQtZnVsbCBvYmplY3QtY292ZXIgc2hyaW5rLTBcIiByZWZlcnJlclBvbGljeT1cIm5vLXJlZmVycmVyXCIgb25FcnJvcj17KGUpID0+IHsgKGUudGFyZ2V0IGFzIEhUTUxJbWFnZUVsZW1lbnQpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7IChlLnRhcmdldCBhcyBIVE1MSW1hZ2VFbGVtZW50KS5uZXh0RWxlbWVudFNpYmxpbmcgJiYgKChlLnRhcmdldCBhcyBIVE1MSW1hZ2VFbGVtZW50KS5uZXh0RWxlbWVudFNpYmxpbmcgYXMgSFRNTEVsZW1lbnQpLnN0eWxlLnJlbW92ZVByb3BlcnR5KCdkaXNwbGF5Jyk7IH19IC8+XG4gICAgICAgICAgICAgICAgICAgICkgOiBudWxsfVxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctOSBoLTkgcm91bmRlZC1mdWxsIGJnLXByaW1hcnkvMTUgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdGV4dC1zbSBmb250LWJvbGQgdGV4dC1wcmltYXJ5XCIgc3R5bGU9e3VzZXJBdmF0YXJVcmwgPyB7IGRpc3BsYXk6ICdub25lJyB9IDoge319PlxuICAgICAgICAgICAgICAgICAgICAgIHsodXNlckxhYmVsWzBdIHx8IFwiVVwiKS50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtaW4tdy0wXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LXNlbWlib2xkIHRleHQtZm9yZWdyb3VuZCB0cnVuY2F0ZVwiPnt1c2VyTGFiZWx9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgIHt1c2VyUm9sZSAmJiA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj57dXNlclJvbGV9PC9wPn1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cblxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB4LTQgcGItMyBncmlkIGdyaWQtY29scy0zIGdhcC0yXCI+XG4gICAgICAgICAgICAgICAge21vcmVJdGVtcy5tYXAoKGl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGlzQWN0aXZlID0gYWN0aXZlS2V5ID09PSBpdGVtLmtleTtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAga2V5PXtpdGVtLmtleX1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBoYW5kbGVTZWxlY3QoaXRlbS5rZXkpfVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHB5LTQgcm91bmRlZC14bCB0cmFuc2l0aW9uLWNvbG9ycyAke1xuICAgICAgICAgICAgICAgICAgICAgICAgaXNBY3RpdmUgPyBcImJnLXByaW1hcnkvMTAgdGV4dC1wcmltYXJ5XCIgOiBcImJnLW11dGVkLzMwIHRleHQtZm9yZWdyb3VuZFwiXG4gICAgICAgICAgICAgICAgICAgICAgfWB9XG4gICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCBzY2FsZTogMC44IH19XG4gICAgICAgICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuMDUgKiBtb3JlSXRlbXMuaW5kZXhPZihpdGVtKSwgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiAzMDAsIGRhbXBpbmc6IDIwIH19XG4gICAgICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOSB9fVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgeTogWzAsIC0zLCAwXSB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbj17eyBkdXJhdGlvbjogMiwgcmVwZWF0OiBJbmZpbml0eSwgZWFzZTogXCJlYXNlSW5PdXRcIiwgZGVsYXk6IDAuMSAqIG1vcmVJdGVtcy5pbmRleE9mKGl0ZW0pIH19XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGl0ZW0uaWNvbiBjbGFzc05hbWU9e2BoLTUgdy01ICR7aXRlbS5jb2xvciB8fCBcInRleHQtcHJpbWFyeVwifWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIGZvbnQtc2VtaWJvbGRcIj57aXRlbS5sYWJlbH08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHtwYW5lbExpbmtzICYmIHBhbmVsTGlua3MubGVuZ3RoID4gMCAmJiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJweC00IHBiLTIgc3BhY2UteS0wLjVcIj5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LW11dGVkLWZvcmVncm91bmQvNTAgZm9udC1zZW1pYm9sZCBweC0xIG1iLTFcIj5JciBwYXJhPC9wPlxuICAgICAgICAgICAgICAgICAge3BhbmVsTGlua3MubWFwKChsaW5rKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICBrZXk9e2xpbmsucGF0aH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7IG5hdmlnYXRlKGxpbmsucGF0aCk7IHNldE1vcmVPcGVuKGZhbHNlKTsgfX1cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgcHgtMyBweS0yLjUgcm91bmRlZC14bCB0ZXh0LXNtIGZvbnQtbWVkaXVtIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBob3ZlcjpiZy1tdXRlZC8zMCB0cmFuc2l0aW9uLWNvbG9yc1wiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICA8bGluay5pY29uIGNsYXNzTmFtZT17YGgtNCB3LTQgJHtsaW5rLmNvbG9yfWB9IC8+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4+e2xpbmsubGFiZWx9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApfVxuXG4gICAgICAgICAgICAgIHtvblNpZ25PdXQgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicHgtNCBwYi01IHB0LTJcIj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17b25TaWduT3V0fVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHktMi41IHJvdW5kZWQteGwgYmctZGVzdHJ1Y3RpdmUvMTAgdGV4dC1kZXN0cnVjdGl2ZSB0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTJcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8TG9nT3V0IGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPiBTYWlyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICA8Lz5cbiAgICAgICAgKX1cbiAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxuICAgIDwvPlxuICApO1xufVxuIl0sIm5hbWVzIjpbInVzZVN0YXRlIiwiTW9yZUhvcml6b250YWwiLCJYIiwiTG9nT3V0IiwiVGhlbWVUb2dnbGUiLCJtb3Rpb24iLCJBbmltYXRlUHJlc2VuY2UiLCJ1c2VOYXZpZ2F0ZSIsIk1vYmlsZUJvdHRvbU5hdiIsIml0ZW1zIiwiYWN0aXZlS2V5Iiwib25TZWxlY3QiLCJtYWluQ291bnQiLCJ1c2VyTGFiZWwiLCJ1c2VyUm9sZSIsInVzZXJBdmF0YXJVcmwiLCJvblNpZ25PdXQiLCJwYW5lbExpbmtzIiwibmF2aWdhdGUiLCJtYWluSXRlbXMiLCJzbGljZSIsIm1vcmVJdGVtcyIsImhhc01vcmUiLCJsZW5ndGgiLCJtb3JlT3BlbiIsInNldE1vcmVPcGVuIiwiaGFuZGxlU2VsZWN0Iiwia2V5IiwiaXNBY3RpdmVJbk1vcmUiLCJzb21lIiwiaSIsIm5hdiIsImNsYXNzTmFtZSIsImRpdiIsIm1hcCIsIml0ZW0iLCJpc0FjdGl2ZSIsImJ1dHRvbiIsIm9uQ2xpY2siLCJ3aGlsZVRhcCIsInNjYWxlIiwiYW5pbWF0ZSIsInkiLCJ0cmFuc2l0aW9uIiwiZHVyYXRpb24iLCJyZXBlYXQiLCJJbmZpbml0eSIsImVhc2UiLCJpY29uIiwiY29sb3IiLCJzcGFuIiwibGFiZWwiLCJpbml0aWFsIiwibGF5b3V0SWQiLCJvcGFjaXR5IiwiZXhpdCIsInR5cGUiLCJkYW1waW5nIiwic3RpZmZuZXNzIiwiaDIiLCJpbWciLCJzcmMiLCJhbHQiLCJyZWZlcnJlclBvbGljeSIsIm9uRXJyb3IiLCJlIiwidGFyZ2V0Iiwic3R5bGUiLCJkaXNwbGF5IiwibmV4dEVsZW1lbnRTaWJsaW5nIiwicmVtb3ZlUHJvcGVydHkiLCJ0b1VwcGVyQ2FzZSIsInAiLCJkZWxheSIsImluZGV4T2YiLCJsaW5rIiwicGF0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsUUFBUSxRQUFRLFFBQVE7QUFDakMsU0FBU0MsY0FBYyxFQUFFQyxDQUFDLEVBQUVDLE1BQU0sUUFBUSxlQUFlO0FBRXpELFNBQVNDLFdBQVcsUUFBUSwyQkFBMkI7QUFDdkQsU0FBU0MsTUFBTSxFQUFFQyxlQUFlLFFBQVEsZ0JBQWdCO0FBQ3hELFNBQVNDLFdBQVcsUUFBUSxtQkFBbUI7QUE4Qi9DLE9BQU8sU0FBU0MsZ0JBQWdCLEVBQzlCQyxLQUFLLEVBQ0xDLFNBQVMsRUFDVEMsUUFBUSxFQUNSQyxZQUFZLENBQUMsRUFDYkMsU0FBUyxFQUNUQyxRQUFRLEVBQ1JDLGFBQWEsRUFDYkMsU0FBUyxFQUNUQyxVQUFVLEVBQ1c7O0lBQ3JCLE1BQU1DLFdBQVdYO0lBQ2pCLE1BQU1ZLFlBQVlWLE1BQU1XLEtBQUssQ0FBQyxHQUFHUjtJQUNqQyxNQUFNUyxZQUFZWixNQUFNVyxLQUFLLENBQUNSO0lBQzlCLE1BQU1VLFVBQVVELFVBQVVFLE1BQU0sR0FBRztJQUNuQyxNQUFNLENBQUNDLFVBQVVDLFlBQVksR0FBR3pCLFNBQVM7SUFFekMsTUFBTTBCLGVBQWUsQ0FBQ0M7UUFDcEJoQixTQUFTZ0I7UUFDVEYsWUFBWTtJQUNkO0lBRUEsTUFBTUcsaUJBQWlCUCxVQUFV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