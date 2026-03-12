import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/ResetPassword.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/ResetPassword.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { supabase } from "/src/integrations/supabase/client.ts";
import { ThemeToggle } from "/src/components/ThemeToggle.tsx";
import { motion } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { styledToast as toast } from "/src/lib/toast.tsx";
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { Lock, ArrowLeft, CheckCircle } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
export default function ResetPassword() {
    _s();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isRecovery, setIsRecovery] = useState(false);
    useEffect(()=>{
        // Check if this is a recovery session from email link
        const hash = window.location.hash;
        if (hash.includes("type=recovery")) {
            setIsRecovery(true);
        }
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event)=>{
            if (event === "PASSWORD_RECOVERY") {
                setIsRecovery(true);
            }
        });
        return ()=>subscription.unsubscribe();
    }, []);
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }
        if (password.length < 6) {
            toast.error("A senha deve ter no mínimo 6 caracteres");
            return;
        }
        setSubmitting(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password
            });
            if (error) throw error;
            setSuccess(true);
            toast.success("Senha alterada com sucesso!");
            setTimeout(()=>navigate("/login"), 2000);
        } catch (err) {
            toast.error(err.message || "Erro ao alterar senha");
        } finally{
            setSubmitting(false);
        }
    };
    if (!isRecovery) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen flex items-center justify-center px-4",
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "absolute top-4 right-4",
                    children: /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                        lineNumber: 61,
                        columnNumber: 49
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ResetPassword.tsx",
                    lineNumber: 61,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "text-center space-y-4",
                    children: [
                        /*#__PURE__*/ _jsxDEV(Lock, {
                            className: "h-12 w-12 text-muted-foreground mx-auto"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/ResetPassword.tsx",
                            lineNumber: 63,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("p", {
                            className: "text-muted-foreground",
                            children: "Link de recuperação inválido ou expirado."
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/ResetPassword.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("button", {
                            onClick: ()=>navigate("/login"),
                            className: "text-primary underline text-sm",
                            children: "Voltar ao login"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/ResetPassword.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/ResetPassword.tsx",
                    lineNumber: 62,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/pages/ResetPassword.tsx",
            lineNumber: 60,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "min-h-screen flex items-center justify-center px-4 relative overflow-hidden",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "absolute top-4 right-4",
                children: /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                    fileName: "/dev-server/src/pages/ResetPassword.tsx",
                    lineNumber: 75,
                    columnNumber: 47
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "w-full max-w-md",
                children: [
                    /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            opacity: 0,
                            y: 20
                        },
                        animate: {
                            opacity: 1,
                            y: 0
                        },
                        className: "text-center mb-8",
                        children: /*#__PURE__*/ _jsxDEV("h1", {
                            className: "font-display text-3xl font-bold shimmer-letters",
                            children: [
                                "Recargas ",
                                /*#__PURE__*/ _jsxDEV("span", {
                                    className: "brasil-word",
                                    children: "Brasil"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                    lineNumber: 84,
                                    columnNumber: 22
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ResetPassword.tsx",
                            lineNumber: 83,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                        lineNumber: 78,
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
                            delay: 0.1
                        },
                        className: "glass-modal rounded-xl p-6",
                        children: [
                            success ? /*#__PURE__*/ _jsxDEV("div", {
                                className: "text-center py-6 space-y-3",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(CheckCircle, {
                                        className: "h-12 w-12 text-primary mx-auto"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                        lineNumber: 96,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "font-bold text-foreground",
                                        children: "Senha alterada!"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                        lineNumber: 97,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("p", {
                                        className: "text-sm text-muted-foreground",
                                        children: "Redirecionando para o login..."
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                        lineNumber: 98,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                lineNumber: 95,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "text-center mb-6",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV(Lock, {
                                                className: "h-8 w-8 text-primary mx-auto mb-2"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                lineNumber: 103,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("h2", {
                                                className: "text-lg font-bold text-foreground",
                                                children: "Nova Senha"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                lineNumber: 104,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-sm text-muted-foreground",
                                                children: "Digite sua nova senha abaixo"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                lineNumber: 105,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                        lineNumber: 102,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("form", {
                                        onSubmit: handleSubmit,
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                                        children: "Nova senha"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                        type: "password",
                                                        value: password,
                                                        onChange: (e)=>setPassword(e.target.value),
                                                        required: true,
                                                        minLength: 6,
                                                        className: "w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                        placeholder: "Mínimo 6 caracteres"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                        lineNumber: 111,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                lineNumber: 109,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("label", {
                                                        className: "block text-sm font-medium text-foreground mb-1.5",
                                                        children: "Confirmar senha"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                        lineNumber: 122,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("input", {
                                                        type: "password",
                                                        value: confirmPassword,
                                                        onChange: (e)=>setConfirmPassword(e.target.value),
                                                        required: true,
                                                        minLength: 6,
                                                        className: "w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                                                        placeholder: "Repita a senha"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                        lineNumber: 123,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                lineNumber: 121,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                type: "submit",
                                                disabled: submitting,
                                                className: "w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 glow-primary",
                                                children: submitting ? "Aguarde..." : "Alterar Senha"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                                lineNumber: 133,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                        lineNumber: 108,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true),
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: ()=>navigate("/login"),
                                className: "flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mt-4 mx-auto transition-colors",
                                children: [
                                    /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                        className: "h-3.5 w-3.5"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                        lineNumber: 148,
                                        columnNumber: 13
                                    }, this),
                                    " Voltar ao login"
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                                lineNumber: 144,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/ResetPassword.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/ResetPassword.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/ResetPassword.tsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(ResetPassword, "R8ZDoRIvJ/M2niCK+siwWcLRmTM=", false, function() {
    return [
        useNavigate
    ];
});
_c = ResetPassword;
var _c;
$RefreshReg$(_c, "ResetPassword");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/ResetPassword.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/ResetPassword.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJlc2V0UGFzc3dvcmQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHN1cGFiYXNlIH0gZnJvbSBcIkAvaW50ZWdyYXRpb25zL3N1cGFiYXNlL2NsaWVudFwiO1xuaW1wb3J0IHsgVGhlbWVUb2dnbGUgfSBmcm9tIFwiQC9jb21wb25lbnRzL1RoZW1lVG9nZ2xlXCI7XG5pbXBvcnQgeyBtb3Rpb24gfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IHsgc3R5bGVkVG9hc3QgYXMgdG9hc3QgfSBmcm9tIFwiQC9saWIvdG9hc3RcIjtcbmltcG9ydCB7IHVzZU5hdmlnYXRlIH0gZnJvbSBcInJlYWN0LXJvdXRlci1kb21cIjtcbmltcG9ydCB7IExvY2ssIEFycm93TGVmdCwgQ2hlY2tDaXJjbGUgfSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIFJlc2V0UGFzc3dvcmQoKSB7XG4gIGNvbnN0IG5hdmlnYXRlID0gdXNlTmF2aWdhdGUoKTtcbiAgY29uc3QgW3Bhc3N3b3JkLCBzZXRQYXNzd29yZF0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW2NvbmZpcm1QYXNzd29yZCwgc2V0Q29uZmlybVBhc3N3b3JkXSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbc3VibWl0dGluZywgc2V0U3VibWl0dGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtzdWNjZXNzLCBzZXRTdWNjZXNzXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzUmVjb3ZlcnksIHNldElzUmVjb3ZlcnldID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgLy8gQ2hlY2sgaWYgdGhpcyBpcyBhIHJlY292ZXJ5IHNlc3Npb24gZnJvbSBlbWFpbCBsaW5rXG4gICAgY29uc3QgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLmluY2x1ZGVzKFwidHlwZT1yZWNvdmVyeVwiKSkge1xuICAgICAgc2V0SXNSZWNvdmVyeSh0cnVlKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGRhdGE6IHsgc3Vic2NyaXB0aW9uIH0gfSA9IHN1cGFiYXNlLmF1dGgub25BdXRoU3RhdGVDaGFuZ2UoKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoZXZlbnQgPT09IFwiUEFTU1dPUkRfUkVDT1ZFUllcIikge1xuICAgICAgICBzZXRJc1JlY292ZXJ5KHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuICgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9LCBbXSk7XG5cbiAgY29uc3QgaGFuZGxlU3VibWl0ID0gYXN5bmMgKGU6IFJlYWN0LkZvcm1FdmVudCkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBpZiAocGFzc3dvcmQgIT09IGNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgdG9hc3QuZXJyb3IoXCJBcyBzZW5oYXMgbsOjbyBjb2luY2lkZW1cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChwYXNzd29yZC5sZW5ndGggPCA2KSB7XG4gICAgICB0b2FzdC5lcnJvcihcIkEgc2VuaGEgZGV2ZSB0ZXIgbm8gbcOtbmltbyA2IGNhcmFjdGVyZXNcIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0U3VibWl0dGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC51cGRhdGVVc2VyKHsgcGFzc3dvcmQgfSk7XG4gICAgICBpZiAoZXJyb3IpIHRocm93IGVycm9yO1xuICAgICAgc2V0U3VjY2Vzcyh0cnVlKTtcbiAgICAgIHRvYXN0LnN1Y2Nlc3MoXCJTZW5oYSBhbHRlcmFkYSBjb20gc3VjZXNzbyFcIik7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IG5hdmlnYXRlKFwiL2xvZ2luXCIpLCAyMDAwKTtcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgdG9hc3QuZXJyb3IoZXJyLm1lc3NhZ2UgfHwgXCJFcnJvIGFvIGFsdGVyYXIgc2VuaGFcIik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldFN1Ym1pdHRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBpZiAoIWlzUmVjb3ZlcnkpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcHgtNFwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC00IHJpZ2h0LTRcIj48VGhlbWVUb2dnbGUgLz48L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBzcGFjZS15LTRcIj5cbiAgICAgICAgICA8TG9jayBjbGFzc05hbWU9XCJoLTEyIHctMTIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIG14LWF1dG9cIiAvPlxuICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPkxpbmsgZGUgcmVjdXBlcmHDp8OjbyBpbnbDoWxpZG8gb3UgZXhwaXJhZG8uPC9wPlxuICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gbmF2aWdhdGUoXCIvbG9naW5cIil9IGNsYXNzTmFtZT1cInRleHQtcHJpbWFyeSB1bmRlcmxpbmUgdGV4dC1zbVwiPlxuICAgICAgICAgICAgVm9sdGFyIGFvIGxvZ2luXG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgcHgtNCByZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTQgcmlnaHQtNFwiPjxUaGVtZVRvZ2dsZSAvPjwvZGl2PlxuXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBtYXgtdy1tZFwiPlxuICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogMjAgfX1cbiAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBtYi04XCJcbiAgICAgICAgPlxuICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgdGV4dC0zeGwgZm9udC1ib2xkIHNoaW1tZXItbGV0dGVyc1wiPlxuICAgICAgICAgICAgUmVjYXJnYXMgPHNwYW4gY2xhc3NOYW1lPVwiYnJhc2lsLXdvcmRcIj5CcmFzaWw8L3NwYW4+XG4gICAgICAgICAgPC9oMT5cbiAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAyMCB9fVxuICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgIHRyYW5zaXRpb249e3sgZGVsYXk6IDAuMSB9fVxuICAgICAgICAgIGNsYXNzTmFtZT1cImdsYXNzLW1vZGFsIHJvdW5kZWQteGwgcC02XCJcbiAgICAgICAgPlxuICAgICAgICAgIHtzdWNjZXNzID8gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS02IHNwYWNlLXktM1wiPlxuICAgICAgICAgICAgICA8Q2hlY2tDaXJjbGUgY2xhc3NOYW1lPVwiaC0xMiB3LTEyIHRleHQtcHJpbWFyeSBteC1hdXRvXCIgLz5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPlNlbmhhIGFsdGVyYWRhITwvcD5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5SZWRpcmVjaW9uYW5kbyBwYXJhIG8gbG9naW4uLi48L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApIDogKFxuICAgICAgICAgICAgPD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBtYi02XCI+XG4gICAgICAgICAgICAgICAgPExvY2sgY2xhc3NOYW1lPVwiaC04IHctOCB0ZXh0LXByaW1hcnkgbXgtYXV0byBtYi0yXCIgLz5cbiAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+Tm92YSBTZW5oYTwvaDI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5EaWdpdGUgc3VhIG5vdmEgc2VuaGEgYWJhaXhvPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8Zm9ybSBvblN1Ym1pdD17aGFuZGxlU3VibWl0fSBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kIG1iLTEuNVwiPk5vdmEgc2VuaGE8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwYXNzd29yZFwiXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlPXtwYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRQYXNzd29yZChlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgIG1pbkxlbmd0aD17Nn1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIHB4LTMgcHktMi41IHJvdW5kZWQtbGcgZ2xhc3MtaW5wdXQgdGV4dC1mb3JlZ3JvdW5kIHBsYWNlaG9sZGVyOnRleHQtbXV0ZWQtZm9yZWdyb3VuZCBmb2N1czpvdXRsaW5lLW5vbmUgZm9jdXM6cmluZy0yIGZvY3VzOnJpbmctcmluZ1wiXG4gICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiTcOtbmltbyA2IGNhcmFjdGVyZXNcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cImJsb2NrIHRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1mb3JlZ3JvdW5kIG1iLTEuNVwiPkNvbmZpcm1hciBzZW5oYTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e2NvbmZpcm1QYXNzd29yZH1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRDb25maXJtUGFzc3dvcmQoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICAgICAgICBtaW5MZW5ndGg9ezZ9XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweC0zIHB5LTIuNSByb3VuZGVkLWxnIGdsYXNzLWlucHV0IHRleHQtZm9yZWdyb3VuZCBwbGFjZWhvbGRlcjp0ZXh0LW11dGVkLWZvcmVncm91bmQgZm9jdXM6b3V0bGluZS1ub25lIGZvY3VzOnJpbmctMiBmb2N1czpyaW5nLXJpbmdcIlxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlJlcGl0YSBhIHNlbmhhXCJcbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgdHlwZT1cInN1Ym1pdFwiXG4gICAgICAgICAgICAgICAgICBkaXNhYmxlZD17c3VibWl0dGluZ31cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBweS0yLjUgcm91bmRlZC1sZyBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kIGZvbnQtbWVkaXVtIGhvdmVyOm9wYWNpdHktOTAgdHJhbnNpdGlvbi1vcGFjaXR5IGRpc2FibGVkOm9wYWNpdHktNTAgZ2xvdy1wcmltYXJ5XCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7c3VibWl0dGluZyA/IFwiQWd1YXJkZS4uLlwiIDogXCJBbHRlcmFyIFNlbmhhXCJ9XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZm9ybT5cbiAgICAgICAgICAgIDwvPlxuICAgICAgICAgICl9XG5cbiAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZShcIi9sb2dpblwiKX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xIHRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIGhvdmVyOnRleHQtZm9yZWdyb3VuZCBtdC00IG14LWF1dG8gdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxBcnJvd0xlZnQgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjVcIiAvPiBWb2x0YXIgYW8gbG9naW5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gICk7XG59XG4iXSwibmFtZXMiOlsidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJzdXBhYmFzZSIsIlRoZW1lVG9nZ2xlIiwibW90aW9uIiwic3R5bGVkVG9hc3QiLCJ0b2FzdCIsInVzZU5hdmlnYXRlIiwiTG9jayIsIkFycm93TGVmdCIsIkNoZWNrQ2lyY2xlIiwiUmVzZXRQYXNzd29yZCIsIm5hdmlnYXRlIiwicGFzc3dvcmQiLCJzZXRQYXNzd29yZCIsImNvbmZpcm1QYXNzd29yZCIsInNldENvbmZpcm1QYXNzd29yZCIsInN1Ym1pdHRpbmciLCJzZXRTdWJtaXR0aW5nIiwic3VjY2VzcyIsInNldFN1Y2Nlc3MiLCJpc1JlY292ZXJ5Iiwic2V0SXNSZWNvdmVyeSIsImhhc2giLCJ3aW5kb3ciLCJsb2NhdGlvbiIsImluY2x1ZGVzIiwiZGF0YSIsInN1YnNjcmlwdGlvbiIsImF1dGgiLCJvbkF1dGhTdGF0ZUNoYW5nZSIsImV2ZW50IiwidW5zdWJzY3JpYmUiLCJoYW5kbGVTdWJtaXQiLCJlIiwicHJldmVudERlZmF1bHQiLCJlcnJvciIsImxlbmd0aCIsInVwZGF0ZVVzZXIiLCJzZXRUaW1lb3V0IiwiZXJyIiwibWVzc2FnZSIsImRpdiIsImNsYXNzTmFtZSIsInAiLCJidXR0b24iLCJvbkNsaWNrIiwiaW5pdGlhbCIsIm9wYWNpdHkiLCJ5IiwiYW5pbWF0ZSIsImgxIiwic3BhbiIsInRyYW5zaXRpb24iLCJkZWxheSIsImgyIiwiZm9ybSIsIm9uU3VibWl0IiwibGFiZWwiLCJpbnB1dCIsInR5cGUiLCJ2YWx1ZSIsIm9uQ2hhbmdlIiwidGFyZ2V0IiwicmVxdWlyZWQiLCJtaW5MZW5ndGgiLCJwbGFjZWhvbGRlciIsImRpc2FibGVkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxRQUFRLEVBQUVDLFNBQVMsUUFBUSxRQUFRO0FBQzVDLFNBQVNDLFFBQVEsUUFBUSxpQ0FBaUM7QUFDMUQsU0FBU0MsV0FBVyxRQUFRLDJCQUEyQjtBQUN2RCxTQUFTQyxNQUFNLFFBQVEsZ0JBQWdCO0FBQ3ZDLFNBQVNDLGVBQWVD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