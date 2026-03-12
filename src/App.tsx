import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/App.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/App.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$(), _s1 = $RefreshSig$();
import { Routes, Route } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { AuthProvider, useAuth } from "/src/hooks/useAuth.tsx";
import { ThemeProvider } from "/src/hooks/useTheme.tsx";
import { ProtectedRoute } from "/src/components/ProtectedRoute.tsx";
import __vite__cjsImport7_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const lazy = __vite__cjsImport7_react["lazy"]; const Suspense = __vite__cjsImport7_react["Suspense"]; const useEffect = __vite__cjsImport7_react["useEffect"]; const useState = __vite__cjsImport7_react["useState"];
import { SplashScreen } from "/src/components/SplashScreen.tsx";
import { supabase } from "/src/integrations/supabase/client.ts";
import Auth from "/src/pages/Auth.tsx?t=1773284427489";
import RecargaPublica from "/src/pages/RecargaPublica.tsx";
import TelegramMiniApp from "/src/pages/TelegramMiniApp.tsx";
import NotFound from "/src/pages/NotFound.tsx";
import LandingPage from "/src/pages/LandingPage.tsx";
import ClientePortal from "/src/pages/ClientePortal.tsx";
import ResetPassword from "/src/pages/ResetPassword.tsx";
import MaintenancePage from "/src/pages/MaintenancePage.tsx";
import InstallApp from "/src/pages/InstallApp.tsx";
import SeasonalEffects from "/src/components/SeasonalEffects.tsx";
import PullToRefresh from "/src/components/PullToRefresh.tsx";
import { useCacheCleanup } from "/src/hooks/useCacheCleanup.ts";
const AdminDashboard = /*#__PURE__*/ lazy(_c = ()=>import("/src/pages/AdminDashboard.tsx"));
_c1 = AdminDashboard;
const RevendedorPainel = /*#__PURE__*/ lazy(_c2 = ()=>import("/src/pages/RevendedorPainel.tsx"));
_c3 = RevendedorPainel;
const Principal = /*#__PURE__*/ lazy(_c4 = ()=>import("/src/pages/Principal.tsx?t=1773286296660"));
_c5 = Principal;
const ChatApp = /*#__PURE__*/ lazy(_c6 = ()=>import("/src/pages/ChatApp.tsx"));
_c7 = ChatApp;
const UserProfile = /*#__PURE__*/ lazy(_c8 = ()=>import("/src/pages/UserProfile.tsx"));
_c9 = UserProfile;
function MaintenanceGuard({ children }) {
    _s();
    const { user, role } = useAuth();
    const [maintenance, setMaintenance] = useState(null);
    useEffect(()=>{
        let mounted = true;
        const timeout = setTimeout(()=>{
            if (mounted && maintenance === null) setMaintenance(false);
        }, 5000);
        const check = async ()=>{
            try {
                const { data, error } = await supabase.rpc("get_maintenance_mode");
                if (!mounted) return;
                if (error) {
                    setMaintenance(false);
                    return;
                }
                setMaintenance(data === true);
            } catch  {
                if (mounted) setMaintenance(false);
            }
        };
        check();
        // Listen for realtime changes
        const channel = supabase.channel("maintenance-mode").on("postgres_changes", {
            event: "*",
            schema: "public",
            table: "system_config",
            filter: "key=eq.maintenanceMode"
        }, (payload)=>{
            if (mounted) setMaintenance(payload.new?.value === "true");
        }).subscribe();
        return ()=>{
            mounted = false;
            clearTimeout(timeout);
            supabase.removeChannel(channel);
        };
    }, []);
    // Still loading
    if (maintenance === null) return /*#__PURE__*/ _jsxDEV(SplashScreen, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 61,
        columnNumber: 36
    }, this);
    // Maintenance ON but user is admin → let through
    if (maintenance && role === "admin") return /*#__PURE__*/ _jsxDEV(_Fragment, {
        children: children
    }, void 0, false);
    // Maintenance ON → show page
    if (maintenance) return /*#__PURE__*/ _jsxDEV(MaintenancePage, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 67,
        columnNumber: 27
    }, this);
    return /*#__PURE__*/ _jsxDEV(_Fragment, {
        children: children
    }, void 0, false);
}
_s(MaintenanceGuard, "VHNIscWJJQ3NIf+PteSIcj1v/wU=", false, function() {
    return [
        useAuth
    ];
});
_c10 = MaintenanceGuard;
function App() {
    _s1();
    useCacheCleanup();
    return /*#__PURE__*/ _jsxDEV(ThemeProvider, {
        children: /*#__PURE__*/ _jsxDEV(AuthProvider, {
            children: [
                /*#__PURE__*/ _jsxDEV(SeasonalEffects, {}, void 0, false, {
                    fileName: "/dev-server/src/App.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV(PullToRefresh, {}, void 0, false, {
                    fileName: "/dev-server/src/App.tsx",
                    lineNumber: 79,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV(MaintenanceGuard, {
                    children: /*#__PURE__*/ _jsxDEV(Routes, {
                        children: [
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/",
                                element: /*#__PURE__*/ _jsxDEV(LandingPage, {}, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 82,
                                    columnNumber: 38
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/login",
                                element: /*#__PURE__*/ _jsxDEV(Auth, {}, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 83,
                                    columnNumber: 43
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 83,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/recarga",
                                element: /*#__PURE__*/ _jsxDEV(RecargaPublica, {}, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 84,
                                    columnNumber: 45
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 84,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/reset-password",
                                element: /*#__PURE__*/ _jsxDEV(ResetPassword, {}, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 85,
                                    columnNumber: 52
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/loja/:slug",
                                element: /*#__PURE__*/ _jsxDEV(ClientePortal, {}, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 86,
                                    columnNumber: 48
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 86,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/miniapp",
                                element: /*#__PURE__*/ _jsxDEV(TelegramMiniApp, {}, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 87,
                                    columnNumber: 45
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 87,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/instalar",
                                element: /*#__PURE__*/ _jsxDEV(InstallApp, {}, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 88,
                                    columnNumber: 46
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 88,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/admin",
                                element: /*#__PURE__*/ _jsxDEV(ProtectedRoute, {
                                    allowedRoles: [
                                        "admin",
                                        "revendedor"
                                    ],
                                    children: /*#__PURE__*/ _jsxDEV(Suspense, {
                                        fallback: /*#__PURE__*/ _jsxDEV(SplashScreen, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 93,
                                            columnNumber: 39
                                        }, this),
                                        children: /*#__PURE__*/ _jsxDEV(AdminDashboard, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 94,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/App.tsx",
                                        lineNumber: 93,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 92,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 89,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/principal",
                                element: /*#__PURE__*/ _jsxDEV(ProtectedRoute, {
                                    allowedRoles: [
                                        "admin"
                                    ],
                                    children: /*#__PURE__*/ _jsxDEV(Suspense, {
                                        fallback: /*#__PURE__*/ _jsxDEV(SplashScreen, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 103,
                                            columnNumber: 39
                                        }, this),
                                        children: /*#__PURE__*/ _jsxDEV(Principal, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 104,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/App.tsx",
                                        lineNumber: 103,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 102,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 99,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/painel",
                                element: /*#__PURE__*/ _jsxDEV(ProtectedRoute, {
                                    children: /*#__PURE__*/ _jsxDEV(Suspense, {
                                        fallback: /*#__PURE__*/ _jsxDEV(SplashScreen, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 113,
                                            columnNumber: 39
                                        }, this),
                                        children: /*#__PURE__*/ _jsxDEV(RevendedorPainel, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 114,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/App.tsx",
                                        lineNumber: 113,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 112,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 109,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/chat",
                                element: /*#__PURE__*/ _jsxDEV(ProtectedRoute, {
                                    children: /*#__PURE__*/ _jsxDEV(Suspense, {
                                        fallback: /*#__PURE__*/ _jsxDEV(SplashScreen, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 123,
                                            columnNumber: 39
                                        }, this),
                                        children: /*#__PURE__*/ _jsxDEV(ChatApp, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 124,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/App.tsx",
                                        lineNumber: 123,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 122,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 119,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "/perfil/:userId",
                                element: /*#__PURE__*/ _jsxDEV(ProtectedRoute, {
                                    children: /*#__PURE__*/ _jsxDEV(Suspense, {
                                        fallback: /*#__PURE__*/ _jsxDEV(SplashScreen, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 133,
                                            columnNumber: 39
                                        }, this),
                                        children: /*#__PURE__*/ _jsxDEV(UserProfile, {}, void 0, false, {
                                            fileName: "/dev-server/src/App.tsx",
                                            lineNumber: 134,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/App.tsx",
                                        lineNumber: 133,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 132,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 129,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ _jsxDEV(Route, {
                                path: "*",
                                element: /*#__PURE__*/ _jsxDEV(NotFound, {}, void 0, false, {
                                    fileName: "/dev-server/src/App.tsx",
                                    lineNumber: 139,
                                    columnNumber: 38
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/App.tsx",
                                lineNumber: 139,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/App.tsx",
                        lineNumber: 81,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/App.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/App.tsx",
            lineNumber: 77,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 76,
        columnNumber: 5
    }, this);
}
_s1(App, "kS6GoUUuORwLUIP1FGAhiwOQ8r0=", false, function() {
    return [
        useCacheCleanup
    ];
});
_c11 = App;
export default App;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10, _c11;
$RefreshReg$(_c, "AdminDashboard$lazy");
$RefreshReg$(_c1, "AdminDashboard");
$RefreshReg$(_c2, "RevendedorPainel$lazy");
$RefreshReg$(_c3, "RevendedorPainel");
$RefreshReg$(_c4, "Principal$lazy");
$RefreshReg$(_c5, "Principal");
$RefreshReg$(_c6, "ChatApp$lazy");
$RefreshReg$(_c7, "ChatApp");
$RefreshReg$(_c8, "UserProfile$lazy");
$RefreshReg$(_c9, "UserProfile");
$RefreshReg$(_c10, "MaintenanceGuard");
$RefreshReg$(_c11, "App");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/App.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/App.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFwcC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUm91dGVzLCBSb3V0ZSwgTmF2aWdhdGUgfSBmcm9tIFwicmVhY3Qtcm91dGVyLWRvbVwiO1xuaW1wb3J0IHsgQXV0aFByb3ZpZGVyLCB1c2VBdXRoIH0gZnJvbSBcIkAvaG9va3MvdXNlQXV0aFwiO1xuaW1wb3J0IHsgVGhlbWVQcm92aWRlciB9IGZyb20gXCJAL2hvb2tzL3VzZVRoZW1lXCI7XG5pbXBvcnQgeyBQcm90ZWN0ZWRSb3V0ZSB9IGZyb20gXCJAL2NvbXBvbmVudHMvUHJvdGVjdGVkUm91dGVcIjtcbmltcG9ydCB7IGxhenksIFN1c3BlbnNlLCB1c2VFZmZlY3QsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBTcGxhc2hTY3JlZW4gfSBmcm9tIFwiQC9jb21wb25lbnRzL1NwbGFzaFNjcmVlblwiO1xuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tIFwiQC9pbnRlZ3JhdGlvbnMvc3VwYWJhc2UvY2xpZW50XCI7XG5pbXBvcnQgQXV0aCBmcm9tIFwiQC9wYWdlcy9BdXRoXCI7XG5pbXBvcnQgUmVjYXJnYVB1YmxpY2EgZnJvbSBcIkAvcGFnZXMvUmVjYXJnYVB1YmxpY2FcIjtcbmltcG9ydCBUZWxlZ3JhbU1pbmlBcHAgZnJvbSBcIkAvcGFnZXMvVGVsZWdyYW1NaW5pQXBwXCI7XG5pbXBvcnQgTm90Rm91bmQgZnJvbSBcIkAvcGFnZXMvTm90Rm91bmRcIjtcbmltcG9ydCBMYW5kaW5nUGFnZSBmcm9tIFwiQC9wYWdlcy9MYW5kaW5nUGFnZVwiO1xuaW1wb3J0IENsaWVudGVQb3J0YWwgZnJvbSBcIkAvcGFnZXMvQ2xpZW50ZVBvcnRhbFwiO1xuaW1wb3J0IFJlc2V0UGFzc3dvcmQgZnJvbSBcIkAvcGFnZXMvUmVzZXRQYXNzd29yZFwiO1xuaW1wb3J0IE1haW50ZW5hbmNlUGFnZSBmcm9tIFwiQC9wYWdlcy9NYWludGVuYW5jZVBhZ2VcIjtcbmltcG9ydCBJbnN0YWxsQXBwIGZyb20gXCJAL3BhZ2VzL0luc3RhbGxBcHBcIjtcbmltcG9ydCBTZWFzb25hbEVmZmVjdHMgZnJvbSBcIkAvY29tcG9uZW50cy9TZWFzb25hbEVmZmVjdHNcIjtcbmltcG9ydCBQdWxsVG9SZWZyZXNoIGZyb20gXCJAL2NvbXBvbmVudHMvUHVsbFRvUmVmcmVzaFwiO1xuaW1wb3J0IHsgdXNlQ2FjaGVDbGVhbnVwIH0gZnJvbSBcIkAvaG9va3MvdXNlQ2FjaGVDbGVhbnVwXCI7XG5cbmNvbnN0IEFkbWluRGFzaGJvYXJkID0gbGF6eSgoKSA9PiBpbXBvcnQoXCJAL3BhZ2VzL0FkbWluRGFzaGJvYXJkXCIpKTtcbmNvbnN0IFJldmVuZGVkb3JQYWluZWwgPSBsYXp5KCgpID0+IGltcG9ydChcIkAvcGFnZXMvUmV2ZW5kZWRvclBhaW5lbFwiKSk7XG5jb25zdCBQcmluY2lwYWwgPSBsYXp5KCgpID0+IGltcG9ydChcIkAvcGFnZXMvUHJpbmNpcGFsXCIpKTtcbmNvbnN0IENoYXRBcHAgPSBsYXp5KCgpID0+IGltcG9ydChcIkAvcGFnZXMvQ2hhdEFwcFwiKSk7XG5jb25zdCBVc2VyUHJvZmlsZSA9IGxhenkoKCkgPT4gaW1wb3J0KFwiQC9wYWdlcy9Vc2VyUHJvZmlsZVwiKSk7XG5cbmZ1bmN0aW9uIE1haW50ZW5hbmNlR3VhcmQoeyBjaGlsZHJlbiB9OiB7IGNoaWxkcmVuOiBSZWFjdC5SZWFjdE5vZGUgfSkge1xuICBjb25zdCB7IHVzZXIsIHJvbGUgfSA9IHVzZUF1dGgoKTtcbiAgY29uc3QgW21haW50ZW5hbmNlLCBzZXRNYWludGVuYW5jZV0gPSB1c2VTdGF0ZTxib29sZWFuIHwgbnVsbD4obnVsbCk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBsZXQgbW91bnRlZCA9IHRydWU7XG4gICAgY29uc3QgdGltZW91dCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgaWYgKG1vdW50ZWQgJiYgbWFpbnRlbmFuY2UgPT09IG51bGwpIHNldE1haW50ZW5hbmNlKGZhbHNlKTtcbiAgICB9LCA1MDAwKTtcblxuICAgIGNvbnN0IGNoZWNrID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBkYXRhLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UucnBjKFwiZ2V0X21haW50ZW5hbmNlX21vZGVcIiBhcyBhbnkpO1xuICAgICAgICBpZiAoIW1vdW50ZWQpIHJldHVybjtcbiAgICAgICAgaWYgKGVycm9yKSB7IHNldE1haW50ZW5hbmNlKGZhbHNlKTsgcmV0dXJuOyB9XG4gICAgICAgIHNldE1haW50ZW5hbmNlKGRhdGEgPT09IHRydWUpO1xuICAgICAgfSBjYXRjaCB7XG4gICAgICAgIGlmIChtb3VudGVkKSBzZXRNYWludGVuYW5jZShmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjaGVjaygpO1xuXG4gICAgLy8gTGlzdGVuIGZvciByZWFsdGltZSBjaGFuZ2VzXG4gICAgY29uc3QgY2hhbm5lbCA9IHN1cGFiYXNlXG4gICAgICAuY2hhbm5lbChcIm1haW50ZW5hbmNlLW1vZGVcIilcbiAgICAgIC5vbihcInBvc3RncmVzX2NoYW5nZXNcIiwgeyBldmVudDogXCIqXCIsIHNjaGVtYTogXCJwdWJsaWNcIiwgdGFibGU6IFwic3lzdGVtX2NvbmZpZ1wiLCBmaWx0ZXI6IFwia2V5PWVxLm1haW50ZW5hbmNlTW9kZVwiIH0sIChwYXlsb2FkOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKG1vdW50ZWQpIHNldE1haW50ZW5hbmNlKHBheWxvYWQubmV3Py52YWx1ZSA9PT0gXCJ0cnVlXCIpO1xuICAgICAgfSlcbiAgICAgIC5zdWJzY3JpYmUoKTtcblxuICAgIHJldHVybiAoKSA9PiB7IG1vdW50ZWQgPSBmYWxzZTsgY2xlYXJUaW1lb3V0KHRpbWVvdXQpOyBzdXBhYmFzZS5yZW1vdmVDaGFubmVsKGNoYW5uZWwpOyB9O1xuICB9LCBbXSk7XG5cbiAgLy8gU3RpbGwgbG9hZGluZ1xuICBpZiAobWFpbnRlbmFuY2UgPT09IG51bGwpIHJldHVybiA8U3BsYXNoU2NyZWVuIC8+O1xuXG4gIC8vIE1haW50ZW5hbmNlIE9OIGJ1dCB1c2VyIGlzIGFkbWluIOKGkiBsZXQgdGhyb3VnaFxuICBpZiAobWFpbnRlbmFuY2UgJiYgcm9sZSA9PT0gXCJhZG1pblwiKSByZXR1cm4gPD57Y2hpbGRyZW59PC8+O1xuXG4gIC8vIE1haW50ZW5hbmNlIE9OIOKGkiBzaG93IHBhZ2VcbiAgaWYgKG1haW50ZW5hbmNlKSByZXR1cm4gPE1haW50ZW5hbmNlUGFnZSAvPjtcblxuICByZXR1cm4gPD57Y2hpbGRyZW59PC8+O1xufVxuXG5mdW5jdGlvbiBBcHAoKSB7XG4gIHVzZUNhY2hlQ2xlYW51cCgpO1xuXG4gIHJldHVybiAoXG4gICAgPFRoZW1lUHJvdmlkZXI+XG4gICAgICA8QXV0aFByb3ZpZGVyPlxuICAgICAgICA8U2Vhc29uYWxFZmZlY3RzIC8+XG4gICAgICAgIDxQdWxsVG9SZWZyZXNoIC8+XG4gICAgICAgIDxNYWludGVuYW5jZUd1YXJkPlxuICAgICAgICAgIDxSb3V0ZXM+XG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cIi9cIiBlbGVtZW50PXs8TGFuZGluZ1BhZ2UgLz59IC8+XG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cIi9sb2dpblwiIGVsZW1lbnQ9ezxBdXRoIC8+fSAvPlxuICAgICAgICAgICAgPFJvdXRlIHBhdGg9XCIvcmVjYXJnYVwiIGVsZW1lbnQ9ezxSZWNhcmdhUHVibGljYSAvPn0gLz5cbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL3Jlc2V0LXBhc3N3b3JkXCIgZWxlbWVudD17PFJlc2V0UGFzc3dvcmQgLz59IC8+XG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cIi9sb2phLzpzbHVnXCIgZWxlbWVudD17PENsaWVudGVQb3J0YWwgLz59IC8+XG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cIi9taW5pYXBwXCIgZWxlbWVudD17PFRlbGVncmFtTWluaUFwcCAvPn0gLz5cbiAgICAgICAgICAgIDxSb3V0ZSBwYXRoPVwiL2luc3RhbGFyXCIgZWxlbWVudD17PEluc3RhbGxBcHAgLz59IC8+XG4gICAgICAgICAgICA8Um91dGVcbiAgICAgICAgICAgICAgcGF0aD1cIi9hZG1pblwiXG4gICAgICAgICAgICAgIGVsZW1lbnQ9e1xuICAgICAgICAgICAgICAgIDxQcm90ZWN0ZWRSb3V0ZSBhbGxvd2VkUm9sZXM9e1tcImFkbWluXCIsIFwicmV2ZW5kZWRvclwiXX0+XG4gICAgICAgICAgICAgICAgICA8U3VzcGVuc2UgZmFsbGJhY2s9ezxTcGxhc2hTY3JlZW4gLz59PlxuICAgICAgICAgICAgICAgICAgICA8QWRtaW5EYXNoYm9hcmQgLz5cbiAgICAgICAgICAgICAgICAgIDwvU3VzcGVuc2U+XG4gICAgICAgICAgICAgICAgPC9Qcm90ZWN0ZWRSb3V0ZT5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxSb3V0ZVxuICAgICAgICAgICAgICBwYXRoPVwiL3ByaW5jaXBhbFwiXG4gICAgICAgICAgICAgIGVsZW1lbnQ9e1xuICAgICAgICAgICAgICAgIDxQcm90ZWN0ZWRSb3V0ZSBhbGxvd2VkUm9sZXM9e1tcImFkbWluXCJdfT5cbiAgICAgICAgICAgICAgICAgIDxTdXNwZW5zZSBmYWxsYmFjaz17PFNwbGFzaFNjcmVlbiAvPn0+XG4gICAgICAgICAgICAgICAgICAgIDxQcmluY2lwYWwgLz5cbiAgICAgICAgICAgICAgICAgIDwvU3VzcGVuc2U+XG4gICAgICAgICAgICAgICAgPC9Qcm90ZWN0ZWRSb3V0ZT5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxSb3V0ZVxuICAgICAgICAgICAgICBwYXRoPVwiL3BhaW5lbFwiXG4gICAgICAgICAgICAgIGVsZW1lbnQ9e1xuICAgICAgICAgICAgICAgIDxQcm90ZWN0ZWRSb3V0ZT5cbiAgICAgICAgICAgICAgICAgIDxTdXNwZW5zZSBmYWxsYmFjaz17PFNwbGFzaFNjcmVlbiAvPn0+XG4gICAgICAgICAgICAgICAgICAgIDxSZXZlbmRlZG9yUGFpbmVsIC8+XG4gICAgICAgICAgICAgICAgICA8L1N1c3BlbnNlPlxuICAgICAgICAgICAgICAgIDwvUHJvdGVjdGVkUm91dGU+XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Um91dGVcbiAgICAgICAgICAgICAgcGF0aD1cIi9jaGF0XCJcbiAgICAgICAgICAgICAgZWxlbWVudD17XG4gICAgICAgICAgICAgICAgPFByb3RlY3RlZFJvdXRlPlxuICAgICAgICAgICAgICAgICAgPFN1c3BlbnNlIGZhbGxiYWNrPXs8U3BsYXNoU2NyZWVuIC8+fT5cbiAgICAgICAgICAgICAgICAgICAgPENoYXRBcHAgLz5cbiAgICAgICAgICAgICAgICAgIDwvU3VzcGVuc2U+XG4gICAgICAgICAgICAgICAgPC9Qcm90ZWN0ZWRSb3V0ZT5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxSb3V0ZVxuICAgICAgICAgICAgICBwYXRoPVwiL3BlcmZpbC86dXNlcklkXCJcbiAgICAgICAgICAgICAgZWxlbWVudD17XG4gICAgICAgICAgICAgICAgPFByb3RlY3RlZFJvdXRlPlxuICAgICAgICAgICAgICAgICAgPFN1c3BlbnNlIGZhbGxiYWNrPXs8U3BsYXNoU2NyZWVuIC8+fT5cbiAgICAgICAgICAgICAgICAgICAgPFVzZXJQcm9maWxlIC8+XG4gICAgICAgICAgICAgICAgICA8L1N1c3BlbnNlPlxuICAgICAgICAgICAgICAgIDwvUHJvdGVjdGVkUm91dGU+XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8Um91dGUgcGF0aD1cIipcIiBlbGVtZW50PXs8Tm90Rm91bmQgLz59IC8+XG4gICAgICAgICAgPC9Sb3V0ZXM+XG4gICAgICAgIDwvTWFpbnRlbmFuY2VHdWFyZD5cbiAgICAgIDwvQXV0aFByb3ZpZGVyPlxuICAgIDwvVGhlbWVQcm92aWRlcj5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwO1xuIl0sIm5hbWVzIjpbIlJvdXRlcyIsIlJvdXRlIiwiQXV0aFByb3ZpZGVyIiwidXNlQXV0aCIsIlRoZW1lUHJvdmlkZXIiLCJQcm90ZWN0ZWRSb3V0ZSIsImxhenkiLCJTdXNwZW5zZSIsInVzZUVmZmVjdCIsInVzZVN0YXRlIiwiU3BsYXNoU2NyZWVuIiwic3VwYWJhc2UiLCJBdXRoIiwiUmVjYXJnYVB1YmxpY2EiLCJUZWxlZ3JhbU1pbmlBcHAiLCJOb3RGb3VuZCIsIkxhbmRpbmdQYWdlIiwiQ2xpZW50ZVBvcnRhbCIsIlJlc2V0UGFzc3dvcmQiLCJNYWludGVuYW5jZVBhZ2UiLCJJbnN0YWxsQXBwIiwiU2Vhc29uYWxFZmZlY3RzIiwiUHVsbFRvUmVmcmVzaCIsInVzZUNhY2hlQ2xlYW51cCIsIkFkbWluRGFzaGJvYXJkIiwiUmV2ZW5kZWRvclBhaW5lbCIsIlByaW5jaXBhbCIsIkNoYXRBcHAiLCJVc2VyUHJvZmlsZSIsIk1haW50ZW5hbmNlR3VhcmQiLCJjaGlsZHJlbiIsInVzZXIiLCJyb2xlIiwibWFpbnRlbmFuY2UiLCJzZXRNYWludGVuYW5jZSIsIm1vdW50ZWQiLCJ0aW1lb3V0Iiwic2V0VGltZW91dCIsImNoZWNrIiwiZGF0YSIsImVycm9yIiwicnBjIiwiY2hhbm5lbCIsIm9uIiwiZXZlbnQiLCJzY2hlbWEiLCJ0YWJsZSIsImZpbHRlciIsInBheWxvYWQiLCJuZXciLCJ2YWx1ZSIsInN1YnNjcmliZSIsImNsZWFyVGltZW91dCIsInJlbW92ZUNoYW5uZWwiLCJBcHAiLCJwYXRoIiwiZWxlbWVudCIsImFsbG93ZWRSb2xlcyIsImZhbGxiYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxNQUFNLEVBQUVDLEtBQUssUUFBa0IsbUJBQW1CO0FBQzNELFNBQVNDLFlBQVksRUFBRUMsT0FBTyxRQUFRLGtCQUFrQjtBQUN4RCxTQUFTQyxhQUFhLFFBQVEsbUJBQW1CO0FBQ2pELFNBQVNDLGNBQWMsUUFBUSw4QkFB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