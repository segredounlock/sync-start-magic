import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/ChatApp.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/ChatApp.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"];
var _s = $RefreshSig$();
import { useAuth } from "/src/hooks/useAuth.tsx";
import { useConversations } from "/src/hooks/useChat.ts";
import { supabase } from "/src/integrations/supabase/client.ts";
import { usePresenceTracker } from "/src/hooks/usePresence.ts";
import { ConversationList } from "/src/components/chat/ConversationList.tsx";
import { ChatWindow } from "/src/components/chat/ChatWindow.tsx";
import { NewChatModal } from "/src/components/chat/NewChatModal.tsx";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { MessageCircle, ArrowLeft, Plus } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import __vite__cjsImport12_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useState = __vite__cjsImport12_react["useState"]; const useEffect = __vite__cjsImport12_react["useEffect"];
import { useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
export default function ChatApp() {
    _s();
    const navigate = useNavigate();
    const { user } = useAuth();
    usePresenceTracker();
    const { conversations, loading, startConversation, clearUnread } = useConversations();
    const [activeConversationId, setActiveConversationId] = useState(null);
    const handleSelectConversation = (id)=>{
        setActiveConversationId(id);
        clearUnread(id);
    };
    const [showNewChat, setShowNewChat] = useState(false);
    const [chatEnabled, setChatEnabled] = useState(true);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
    useEffect(()=>{
        const handleResize = ()=>setIsMobileView(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return ()=>window.removeEventListener("resize", handleResize);
    }, []);
    // Block pinch-zoom inside chat
    useEffect(()=>{
        const preventZoom = (e)=>{
            if (e.touches.length > 1) e.preventDefault();
        };
        document.addEventListener("touchmove", preventZoom, {
            passive: false
        });
        return ()=>document.removeEventListener("touchmove", preventZoom);
    }, []);
    useEffect(()=>{
        supabase.rpc("get_chat_enabled").then(({ data })=>{
            setChatEnabled(data === true);
        });
    }, []);
    const activeConversation = conversations.find((c)=>c.id === activeConversationId);
    const isGroupChat = activeConversation?.type === 'group';
    const handleStartChat = async (userId)=>{
        try {
            const convId = await startConversation(userId);
            if (convId) setActiveConversationId(convId);
            setShowNewChat(false);
        } catch (err) {
            console.error(err);
        }
    };
    const { role } = useAuth();
    if (!chatEnabled && role !== 'admin') {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen bg-background flex flex-col items-center justify-center px-4",
            children: [
                /*#__PURE__*/ _jsxDEV("div", {
                    className: "w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-4",
                    children: /*#__PURE__*/ _jsxDEV(MessageCircle, {
                        className: "h-8 w-8 text-muted-foreground"
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                        lineNumber: 67,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                    lineNumber: 66,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV("h3", {
                    className: "text-lg font-bold text-foreground mb-2",
                    children: "Chat Desativado"
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV("p", {
                    className: "text-sm text-muted-foreground",
                    children: "O chat está temporariamente indisponível."
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                    lineNumber: 70,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV("button", {
                    onClick: ()=>navigate(-1),
                    className: "mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium",
                    children: "Voltar"
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                    lineNumber: 71,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/pages/ChatApp.tsx",
            lineNumber: 65,
            columnNumber: 7
        }, this);
    }
    // Mobile: full screen chat experience
    if (isMobileView) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "h-[100dvh] bg-background flex flex-col overflow-hidden",
            style: {
                touchAction: "pan-y",
                userSelect: "none",
                WebkitUserSelect: "none"
            },
            children: [
                /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                    mode: "wait",
                    children: activeConversationId ? /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            x: "100%"
                        },
                        animate: {
                            x: 0
                        },
                        exit: {
                            x: "100%"
                        },
                        transition: {
                            type: "spring",
                            damping: 25,
                            stiffness: 200
                        },
                        className: "flex-1 flex flex-col min-h-0",
                        children: /*#__PURE__*/ _jsxDEV(ChatWindow, {
                            conversationId: activeConversationId,
                            otherUser: activeConversation?.other_user,
                            isGroup: isGroupChat,
                            isBlocked: !!activeConversation?.is_blocked,
                            groupName: activeConversation?.name || undefined,
                            groupIcon: activeConversation?.icon,
                            onBack: ()=>setActiveConversationId(null)
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/ChatApp.tsx",
                            lineNumber: 85,
                            columnNumber: 15
                        }, this)
                    }, "chat", false, {
                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                        lineNumber: 84,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            x: "-100%"
                        },
                        animate: {
                            x: 0
                        },
                        exit: {
                            x: "-100%"
                        },
                        transition: {
                            type: "spring",
                            damping: 25,
                            stiffness: 200
                        },
                        className: "flex-1 flex flex-col min-h-0",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("button", {
                                                onClick: ()=>navigate(-1),
                                                className: "p-2 rounded-xl hover:bg-muted/50 transition-colors",
                                                children: /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                                    className: "h-5 w-5 text-muted-foreground"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                    lineNumber: 101,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                lineNumber: 100,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center",
                                                        children: /*#__PURE__*/ _jsxDEV(MessageCircle, {
                                                            className: "h-4 w-4 text-primary"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                            lineNumber: 105,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                        lineNumber: 104,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("h2", {
                                                                className: "text-base font-bold text-foreground",
                                                                children: "Bate-papo"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                                lineNumber: 108,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("p", {
                                                                className: "text-[10px] text-muted-foreground",
                                                                children: [
                                                                    conversations.length,
                                                                    " conversas"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                                lineNumber: 109,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                        lineNumber: 107,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                lineNumber: 103,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                                        lineNumber: 99,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>setShowNewChat(true),
                                        className: "p-3 min-w-[44px] min-h-[44px] rounded-xl bg-primary/10 hover:bg-primary/20 active:bg-primary/30 transition-colors flex items-center justify-center",
                                        style: {
                                            touchAction: "manipulation"
                                        },
                                        children: /*#__PURE__*/ _jsxDEV(Plus, {
                                            className: "h-5 w-5 text-primary"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/ChatApp.tsx",
                                            lineNumber: 114,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                                        lineNumber: 113,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                lineNumber: 98,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV(ConversationList, {
                                conversations: conversations,
                                loading: loading,
                                activeId: activeConversationId,
                                onSelect: handleSelectConversation
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                lineNumber: 117,
                                columnNumber: 15
                            }, this)
                        ]
                    }, "list", true, {
                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                        lineNumber: 96,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this),
                showNewChat && /*#__PURE__*/ _jsxDEV(NewChatModal, {
                    onClose: ()=>setShowNewChat(false),
                    onSelectUser: handleStartChat
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                    lineNumber: 126,
                    columnNumber: 25
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/pages/ChatApp.tsx",
            lineNumber: 81,
            columnNumber: 7
        }, this);
    }
    // Desktop: full screen side-by-side
    return /*#__PURE__*/ _jsxDEV("div", {
        className: "h-[100dvh] bg-background flex flex-col overflow-hidden",
        style: {
            touchAction: "pan-y",
            userSelect: "none",
            WebkitUserSelect: "none"
        },
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex items-center justify-between px-6 py-3 border-b border-border bg-card/80 backdrop-blur-sm",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ _jsxDEV("button", {
                                onClick: ()=>navigate(-1),
                                className: "p-2 rounded-xl hover:bg-muted/50 transition-colors",
                                children: /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                    className: "h-5 w-5 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                                    lineNumber: 138,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center",
                                        children: /*#__PURE__*/ _jsxDEV(MessageCircle, {
                                            className: "h-5 w-5 text-primary"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/ChatApp.tsx",
                                            lineNumber: 142,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                                        lineNumber: 141,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("h1", {
                                                className: "text-lg font-bold text-foreground",
                                                children: "Bate-papo"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                lineNumber: 145,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-[10px] text-muted-foreground",
                                                children: [
                                                    conversations.length,
                                                    " conversas"
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                                lineNumber: 146,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                                        lineNumber: 144,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("button", {
                        onClick: ()=>setShowNewChat(true),
                        className: "flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors text-primary text-sm font-medium",
                        children: [
                            /*#__PURE__*/ _jsxDEV(Plus, {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/ChatApp.tsx",
                                lineNumber: 151,
                                columnNumber: 11
                            }, this),
                            "Nova conversa"
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                        lineNumber: 150,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/ChatApp.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "flex-1 flex overflow-hidden",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "w-[360px] flex flex-col border-r border-border bg-card/50",
                        children: /*#__PURE__*/ _jsxDEV(ConversationList, {
                            conversations: conversations,
                            loading: loading,
                            activeId: activeConversationId,
                            onSelect: handleSelectConversation
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/ChatApp.tsx",
                            lineNumber: 160,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "flex-1 flex flex-col min-h-0",
                        children: activeConversationId ? /*#__PURE__*/ _jsxDEV(ChatWindow, {
                            conversationId: activeConversationId,
                            otherUser: activeConversation?.other_user,
                            isGroup: isGroupChat,
                            isBlocked: !!activeConversation?.is_blocked,
                            groupName: activeConversation?.name || undefined,
                            groupIcon: activeConversation?.icon
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/ChatApp.tsx",
                            lineNumber: 171,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ _jsxDEV("div", {
                            className: "flex-1 flex flex-col items-center justify-center text-center px-4",
                            children: [
                                /*#__PURE__*/ _jsxDEV("div", {
                                    className: "w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4",
                                    children: /*#__PURE__*/ _jsxDEV(MessageCircle, {
                                        className: "h-10 w-10 text-primary"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                                        lineNumber: 182,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                                    lineNumber: 181,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("h3", {
                                    className: "text-lg font-bold text-foreground mb-2",
                                    children: "Selecione uma conversa"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                                    lineNumber: 184,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-sm text-muted-foreground",
                                    children: "Escolha uma conversa ao lado ou inicie uma nova"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/ChatApp.tsx",
                                    lineNumber: 185,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "/dev-server/src/pages/ChatApp.tsx",
                            lineNumber: 180,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "/dev-server/src/pages/ChatApp.tsx",
                        lineNumber: 169,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/ChatApp.tsx",
                lineNumber: 157,
                columnNumber: 7
            }, this),
            showNewChat && /*#__PURE__*/ _jsxDEV(NewChatModal, {
                onClose: ()=>setShowNewChat(false),
                onSelectUser: handleStartChat
            }, void 0, false, {
                fileName: "/dev-server/src/pages/ChatApp.tsx",
                lineNumber: 191,
                columnNumber: 23
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/ChatApp.tsx",
        lineNumber: 133,
        columnNumber: 5
    }, this);
}
_s(ChatApp, "dxk9pxOMvNJ5rDDePDXA2JYzBpc=", false, function() {
    return [
        useNavigate,
        useAuth,
        usePresenceTracker,
        useConversations,
        useAuth
    ];
});
_c = ChatApp;
var _c;
$RefreshReg$(_c, "ChatApp");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/ChatApp.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/ChatApp.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNoYXRBcHAudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVzZUF1dGggfSBmcm9tIFwiQC9ob29rcy91c2VBdXRoXCI7XG5pbXBvcnQgeyB1c2VDb252ZXJzYXRpb25zLCBHRU5FUkFMX0NIQVRfSUQgfSBmcm9tIFwiQC9ob29rcy91c2VDaGF0XCI7XG5pbXBvcnQgeyBzdXBhYmFzZSB9IGZyb20gXCJAL2ludGVncmF0aW9ucy9zdXBhYmFzZS9jbGllbnRcIjtcbmltcG9ydCB7IHVzZVByZXNlbmNlVHJhY2tlciB9IGZyb20gXCJAL2hvb2tzL3VzZVByZXNlbmNlXCI7XG5pbXBvcnQgeyBDb252ZXJzYXRpb25MaXN0IH0gZnJvbSBcIkAvY29tcG9uZW50cy9jaGF0L0NvbnZlcnNhdGlvbkxpc3RcIjtcbmltcG9ydCB7IENoYXRXaW5kb3cgfSBmcm9tIFwiQC9jb21wb25lbnRzL2NoYXQvQ2hhdFdpbmRvd1wiO1xuaW1wb3J0IHsgTmV3Q2hhdE1vZGFsIH0gZnJvbSBcIkAvY29tcG9uZW50cy9jaGF0L05ld0NoYXRNb2RhbFwiO1xuaW1wb3J0IHsgbW90aW9uLCBBbmltYXRlUHJlc2VuY2UgfSBmcm9tIFwiZnJhbWVyLW1vdGlvblwiO1xuaW1wb3J0IHsgTWVzc2FnZUNpcmNsZSwgQXJyb3dMZWZ0LCBQbHVzLCBVc2VycyB9IGZyb20gXCJsdWNpZGUtcmVhY3RcIjtcbmltcG9ydCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IHVzZU5hdmlnYXRlIH0gZnJvbSBcInJlYWN0LXJvdXRlci1kb21cIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ2hhdEFwcCgpIHtcbiAgY29uc3QgbmF2aWdhdGUgPSB1c2VOYXZpZ2F0ZSgpO1xuICBjb25zdCB7IHVzZXIgfSA9IHVzZUF1dGgoKTtcbiAgdXNlUHJlc2VuY2VUcmFja2VyKCk7XG4gIGNvbnN0IHsgY29udmVyc2F0aW9ucywgbG9hZGluZywgc3RhcnRDb252ZXJzYXRpb24sIGNsZWFyVW5yZWFkIH0gPSB1c2VDb252ZXJzYXRpb25zKCk7XG4gIGNvbnN0IFthY3RpdmVDb252ZXJzYXRpb25JZCwgc2V0QWN0aXZlQ29udmVyc2F0aW9uSWRdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbCk7XG5cbiAgY29uc3QgaGFuZGxlU2VsZWN0Q29udmVyc2F0aW9uID0gKGlkOiBzdHJpbmcpID0+IHtcbiAgICBzZXRBY3RpdmVDb252ZXJzYXRpb25JZChpZCk7XG4gICAgY2xlYXJVbnJlYWQoaWQpO1xuICB9O1xuICBjb25zdCBbc2hvd05ld0NoYXQsIHNldFNob3dOZXdDaGF0XSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2NoYXRFbmFibGVkLCBzZXRDaGF0RW5hYmxlZF0gPSB1c2VTdGF0ZSh0cnVlKTtcbiAgY29uc3QgW2lzTW9iaWxlVmlldywgc2V0SXNNb2JpbGVWaWV3XSA9IHVzZVN0YXRlKHdpbmRvdy5pbm5lcldpZHRoIDwgNzY4KTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGhhbmRsZVJlc2l6ZSA9ICgpID0+IHNldElzTW9iaWxlVmlldyh3aW5kb3cuaW5uZXJXaWR0aCA8IDc2OCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgaGFuZGxlUmVzaXplKTtcbiAgICByZXR1cm4gKCkgPT4gd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgaGFuZGxlUmVzaXplKTtcbiAgfSwgW10pO1xuXG4gIC8vIEJsb2NrIHBpbmNoLXpvb20gaW5zaWRlIGNoYXRcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBwcmV2ZW50Wm9vbSA9IChlOiBUb3VjaEV2ZW50KSA9PiB7XG4gICAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA+IDEpIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9O1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgcHJldmVudFpvb20sIHsgcGFzc2l2ZTogZmFsc2UgfSk7XG4gICAgcmV0dXJuICgpID0+IGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ0b3VjaG1vdmVcIiwgcHJldmVudFpvb20pO1xuICB9LCBbXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzdXBhYmFzZS5ycGMoXCJnZXRfY2hhdF9lbmFibGVkXCIgYXMgYW55KVxuICAgICAgLnRoZW4oKHsgZGF0YSB9KSA9PiB7IHNldENoYXRFbmFibGVkKGRhdGEgPT09IHRydWUpOyB9KTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGFjdGl2ZUNvbnZlcnNhdGlvbiA9IGNvbnZlcnNhdGlvbnMuZmluZChjID0+IGMuaWQgPT09IGFjdGl2ZUNvbnZlcnNhdGlvbklkKTtcbiAgY29uc3QgaXNHcm91cENoYXQgPSBhY3RpdmVDb252ZXJzYXRpb24/LnR5cGUgPT09ICdncm91cCc7XG5cbiAgY29uc3QgaGFuZGxlU3RhcnRDaGF0ID0gYXN5bmMgKHVzZXJJZDogc3RyaW5nKSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbnZJZCA9IGF3YWl0IHN0YXJ0Q29udmVyc2F0aW9uKHVzZXJJZCk7XG4gICAgICBpZiAoY29udklkKSBzZXRBY3RpdmVDb252ZXJzYXRpb25JZChjb252SWQpO1xuICAgICAgc2V0U2hvd05ld0NoYXQoZmFsc2UpO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHsgcm9sZSB9ID0gdXNlQXV0aCgpO1xuXG4gIGlmICghY2hhdEVuYWJsZWQgJiYgcm9sZSAhPT0gJ2FkbWluJykge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1iYWNrZ3JvdW5kIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHB4LTRcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTE2IGgtMTYgcm91bmRlZC0yeGwgYmctbXV0ZWQvNTAgYm9yZGVyIGJvcmRlci1ib3JkZXIgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWItNFwiPlxuICAgICAgICAgIDxNZXNzYWdlQ2lyY2xlIGNsYXNzTmFtZT1cImgtOCB3LTggdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmQgbWItMlwiPkNoYXQgRGVzYXRpdmFkbzwvaDM+XG4gICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+TyBjaGF0IGVzdMOhIHRlbXBvcmFyaWFtZW50ZSBpbmRpc3BvbsOtdmVsLjwvcD5cbiAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZSgtMSl9IGNsYXNzTmFtZT1cIm10LTQgcHgtNCBweS0yIHJvdW5kZWQteGwgYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCB0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgVm9sdGFyXG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIC8vIE1vYmlsZTogZnVsbCBzY3JlZW4gY2hhdCBleHBlcmllbmNlXG4gIGlmIChpc01vYmlsZVZpZXcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLVsxMDBkdmhdIGJnLWJhY2tncm91bmQgZmxleCBmbGV4LWNvbCBvdmVyZmxvdy1oaWRkZW5cIiBzdHlsZT17eyB0b3VjaEFjdGlvbjogXCJwYW4teVwiLCB1c2VyU2VsZWN0OiBcIm5vbmVcIiwgV2Via2l0VXNlclNlbGVjdDogXCJub25lXCIgfX0+XG4gICAgICAgIDxBbmltYXRlUHJlc2VuY2UgbW9kZT1cIndhaXRcIj5cbiAgICAgICAgICB7YWN0aXZlQ29udmVyc2F0aW9uSWQgPyAoXG4gICAgICAgICAgICA8bW90aW9uLmRpdiBrZXk9XCJjaGF0XCIgaW5pdGlhbD17eyB4OiBcIjEwMCVcIiB9fSBhbmltYXRlPXt7IHg6IDAgfX0gZXhpdD17eyB4OiBcIjEwMCVcIiB9fSB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIGRhbXBpbmc6IDI1LCBzdGlmZm5lc3M6IDIwMCB9fSBjbGFzc05hbWU9XCJmbGV4LTEgZmxleCBmbGV4LWNvbCBtaW4taC0wXCI+XG4gICAgICAgICAgICAgIDxDaGF0V2luZG93XG4gICAgICAgICAgICAgICAgY29udmVyc2F0aW9uSWQ9e2FjdGl2ZUNvbnZlcnNhdGlvbklkfVxuICAgICAgICAgICAgICAgIG90aGVyVXNlcj17YWN0aXZlQ29udmVyc2F0aW9uPy5vdGhlcl91c2VyfVxuICAgICAgICAgICAgICAgIGlzR3JvdXA9e2lzR3JvdXBDaGF0fVxuICAgICAgICAgICAgICAgIGlzQmxvY2tlZD17ISFhY3RpdmVDb252ZXJzYXRpb24/LmlzX2Jsb2NrZWR9XG4gICAgICAgICAgICAgICAgZ3JvdXBOYW1lPXthY3RpdmVDb252ZXJzYXRpb24/Lm5hbWUgfHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICAgIGdyb3VwSWNvbj17YWN0aXZlQ29udmVyc2F0aW9uPy5pY29ufVxuICAgICAgICAgICAgICAgIG9uQmFjaz17KCkgPT4gc2V0QWN0aXZlQ29udmVyc2F0aW9uSWQobnVsbCl9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxtb3Rpb24uZGl2IGtleT1cImxpc3RcIiBpbml0aWFsPXt7IHg6IFwiLTEwMCVcIiB9fSBhbmltYXRlPXt7IHg6IDAgfX0gZXhpdD17eyB4OiBcIi0xMDAlXCIgfX0gdHJhbnNpdGlvbj17eyB0eXBlOiBcInNwcmluZ1wiLCBkYW1waW5nOiAyNSwgc3RpZmZuZXNzOiAyMDAgfX0gY2xhc3NOYW1lPVwiZmxleC0xIGZsZXggZmxleC1jb2wgbWluLWgtMFwiPlxuICAgICAgICAgICAgICB7LyogSGVhZGVyICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBweC00IHB5LTMgYm9yZGVyLWIgYm9yZGVyLWJvcmRlciBiZy1jYXJkLzgwIGJhY2tkcm9wLWJsdXItc21cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKC0xKX0gY2xhc3NOYW1lPVwicC0yIHJvdW5kZWQteGwgaG92ZXI6YmctbXV0ZWQvNTAgdHJhbnNpdGlvbi1jb2xvcnNcIj5cbiAgICAgICAgICAgICAgICAgICAgPEFycm93TGVmdCBjbGFzc05hbWU9XCJoLTUgdy01IHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiIC8+XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTggaC04IHJvdW5kZWQtZnVsbCBiZy1wcmltYXJ5LzE1IGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VDaXJjbGUgY2xhc3NOYW1lPVwiaC00IHctNCB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC1iYXNlIGZvbnQtYm9sZCB0ZXh0LWZvcmVncm91bmRcIj5CYXRlLXBhcG88L2gyPlxuICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPntjb252ZXJzYXRpb25zLmxlbmd0aH0gY29udmVyc2FzPC9wPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0U2hvd05ld0NoYXQodHJ1ZSl9IGNsYXNzTmFtZT1cInAtMyBtaW4tdy1bNDRweF0gbWluLWgtWzQ0cHhdIHJvdW5kZWQteGwgYmctcHJpbWFyeS8xMCBob3ZlcjpiZy1wcmltYXJ5LzIwIGFjdGl2ZTpiZy1wcmltYXJ5LzMwIHRyYW5zaXRpb24tY29sb3JzIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIgc3R5bGU9e3sgdG91Y2hBY3Rpb246IFwibWFuaXB1bGF0aW9uXCIgfX0+XG4gICAgICAgICAgICAgICAgICA8UGx1cyBjbGFzc05hbWU9XCJoLTUgdy01IHRleHQtcHJpbWFyeVwiIC8+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8Q29udmVyc2F0aW9uTGlzdFxuICAgICAgICAgICAgICAgIGNvbnZlcnNhdGlvbnM9e2NvbnZlcnNhdGlvbnN9XG4gICAgICAgICAgICAgICAgbG9hZGluZz17bG9hZGluZ31cbiAgICAgICAgICAgICAgICBhY3RpdmVJZD17YWN0aXZlQ29udmVyc2F0aW9uSWR9XG4gICAgICAgICAgICAgICAgb25TZWxlY3Q9e2hhbmRsZVNlbGVjdENvbnZlcnNhdGlvbn1cbiAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICApfVxuICAgICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAge3Nob3dOZXdDaGF0ICYmIDxOZXdDaGF0TW9kYWwgb25DbG9zZT17KCkgPT4gc2V0U2hvd05ld0NoYXQoZmFsc2UpfSBvblNlbGVjdFVzZXI9e2hhbmRsZVN0YXJ0Q2hhdH0gLz59XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbiAgLy8gRGVza3RvcDogZnVsbCBzY3JlZW4gc2lkZS1ieS1zaWRlXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJoLVsxMDBkdmhdIGJnLWJhY2tncm91bmQgZmxleCBmbGV4LWNvbCBvdmVyZmxvdy1oaWRkZW5cIiBzdHlsZT17eyB0b3VjaEFjdGlvbjogXCJwYW4teVwiLCB1c2VyU2VsZWN0OiBcIm5vbmVcIiwgV2Via2l0VXNlclNlbGVjdDogXCJub25lXCIgfX0+XG4gICAgICB7LyogVG9wIGJhciAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHB4LTYgcHktMyBib3JkZXItYiBib3JkZXItYm9yZGVyIGJnLWNhcmQvODAgYmFja2Ryb3AtYmx1ci1zbVwiPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZSgtMSl9IGNsYXNzTmFtZT1cInAtMiByb3VuZGVkLXhsIGhvdmVyOmJnLW11dGVkLzUwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICA8QXJyb3dMZWZ0IGNsYXNzTmFtZT1cImgtNSB3LTUgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctOSBoLTkgcm91bmRlZC1mdWxsIGJnLXByaW1hcnkvMTUgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgPE1lc3NhZ2VDaXJjbGUgY2xhc3NOYW1lPVwiaC01IHctNSB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kXCI+QmF0ZS1wYXBvPC9oMT5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+e2NvbnZlcnNhdGlvbnMubGVuZ3RofSBjb252ZXJzYXM8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gc2V0U2hvd05ld0NoYXQodHJ1ZSl9IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB4LTQgcHktMiByb3VuZGVkLXhsIGJnLXByaW1hcnkvMTAgaG92ZXI6YmctcHJpbWFyeS8yMCB0cmFuc2l0aW9uLWNvbG9ycyB0ZXh0LXByaW1hcnkgdGV4dC1zbSBmb250LW1lZGl1bVwiPlxuICAgICAgICAgIDxQbHVzIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPlxuICAgICAgICAgIE5vdmEgY29udmVyc2FcbiAgICAgICAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cblxuICAgICAgey8qIENvbnRlbnQgKi99XG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMSBmbGV4IG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICB7LyogTGVmdDogQ29udmVyc2F0aW9uIGxpc3QgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1bMzYwcHhdIGZsZXggZmxleC1jb2wgYm9yZGVyLXIgYm9yZGVyLWJvcmRlciBiZy1jYXJkLzUwXCI+XG4gICAgICAgICAgPENvbnZlcnNhdGlvbkxpc3RcbiAgICAgICAgICAgIGNvbnZlcnNhdGlvbnM9e2NvbnZlcnNhdGlvbnN9XG4gICAgICAgICAgICBsb2FkaW5nPXtsb2FkaW5nfVxuICAgICAgICAgICAgYWN0aXZlSWQ9e2FjdGl2ZUNvbnZlcnNhdGlvbklkfVxuICAgICAgICAgICAgb25TZWxlY3Q9e2hhbmRsZVNlbGVjdENvbnZlcnNhdGlvbn1cbiAgICAgICAgICAvPlxuICAgICAgICA8L2Rpdj5cblxuICAgICAgICB7LyogUmlnaHQ6IENoYXQgd2luZG93ICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMSBmbGV4IGZsZXgtY29sIG1pbi1oLTBcIj5cbiAgICAgICAgICB7YWN0aXZlQ29udmVyc2F0aW9uSWQgPyAoXG4gICAgICAgICAgICA8Q2hhdFdpbmRvd1xuICAgICAgICAgICAgICBjb252ZXJzYXRpb25JZD17YWN0aXZlQ29udmVyc2F0aW9uSWR9XG4gICAgICAgICAgICAgIG90aGVyVXNlcj17YWN0aXZlQ29udmVyc2F0aW9uPy5vdGhlcl91c2VyfVxuICAgICAgICAgICAgICBpc0dyb3VwPXtpc0dyb3VwQ2hhdH1cbiAgICAgICAgICAgICAgaXNCbG9ja2VkPXshIWFjdGl2ZUNvbnZlcnNhdGlvbj8uaXNfYmxvY2tlZH1cbiAgICAgICAgICAgICAgZ3JvdXBOYW1lPXthY3RpdmVDb252ZXJzYXRpb24/Lm5hbWUgfHwgdW5kZWZpbmVkfVxuICAgICAgICAgICAgICBncm91cEljb249e2FjdGl2ZUNvbnZlcnNhdGlvbj8uaWNvbn1cbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgKSA6IChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleC0xIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQtY2VudGVyIHB4LTRcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTIwIGgtMjAgcm91bmRlZC0yeGwgYmctcHJpbWFyeS8xMCBib3JkZXIgYm9yZGVyLXByaW1hcnkvMjAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgbWItNFwiPlxuICAgICAgICAgICAgICAgIDxNZXNzYWdlQ2lyY2xlIGNsYXNzTmFtZT1cImgtMTAgdy0xMCB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZCBtYi0yXCI+U2VsZWNpb25lIHVtYSBjb252ZXJzYTwvaDM+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+RXNjb2xoYSB1bWEgY29udmVyc2EgYW8gbGFkbyBvdSBpbmljaWUgdW1hIG5vdmE8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICApfVxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuXG4gICAgICB7c2hvd05ld0NoYXQgJiYgPE5ld0NoYXRNb2RhbCBvbkNsb3NlPXsoKSA9PiBzZXRTaG93TmV3Q2hhdChmYWxzZSl9IG9uU2VsZWN0VXNlcj17aGFuZGxlU3RhcnRDaGF0fSAvPn1cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdLCJuYW1lcyI6WyJ1c2VBdXRoIiwidXNlQ29udmVyc2F0aW9ucyIsInN1cGFiYXNlIiwidXNlUHJlc2VuY2VUcmFja2VyIiwiQ29udmVyc2F0aW9uTGlzdCIsIkNoYXRXaW5kb3ciLCJOZXdDaGF0TW9kYWwiLCJtb3Rpb24iLCJBbmltYXRlUHJlc2VuY2UiLCJNZXNzYWdlQ2lyY2xlIiwiQXJyb3dMZWZ0IiwiUGx1cyIsInVzZVN0YXRlIiwidXNlRWZmZWN0IiwidXNlTmF2aWdhdGUiLCJDaGF0QXBwIiwibmF2aWdhdGUiLCJ1c2VyIiwiY29udmVyc2F0aW9ucyIsImxvYWRpbmciLCJzdGFydENvbnZlcnNhdGlvbiIsImNsZWFyVW5yZWFkIiwiYWN0aXZlQ29udmVyc2F0aW9uSWQiLCJzZXRBY3RpdmVDb252ZXJzYXRpb25JZCIsImhhbmRsZVNlbGVjdENvbnZlcnNhdGlvbiIsImlkIiwic2hvd05ld0NoYXQiLCJzZXRTaG93TmV3Q2hhdCIsImNoYXRFbmFibGVkIiwic2V0Q2hhdEVuYWJsZWQiLCJpc01vYmlsZVZpZXciLCJzZXRJc01vYmlsZVZpZXciLCJ3aW5kb3ciLCJpbm5lcldpZHRoIiwiaGFuZGxlUmVzaXplIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJwcmV2ZW50Wm9vbSIsImUiLCJ0b3VjaGVzIiwibGVuZ3RoIiwicHJldmVudERlZmF1bHQiLCJkb2N1bWVudCIsInBhc3NpdmUiLCJycGMiLCJ0aGVuIiwiZGF0YSIsImFjdGl2ZUNvbnZlcnNhdGlvbiIsImZpbmQiLCJjIiwiaXNHcm91cENoYXQiLCJ0eXBlIiwiaGFuZGxlU3RhcnRDaGF0IiwidXNlcklkIiwiY29udklkIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwicm9sZSIsImRpdiIsImNsYXNzTmFtZSIsImgzIiwicCIsImJ1dHRvbiIsIm9uQ2xpY2siLCJzdHlsZSIsInRvdWNoQWN0aW9uIiwidXNlclNlbGVjdCIsIldlYmtpdFVzZXJTZWxlY3QiLCJtb2RlIiwiaW5pdGlhbCIsIngiLCJhbmltYXRlIiwiZXhpdCIsInRyYW5zaXRpb24iLCJkYW1waW5nIiwic3RpZmZuZXNzIiwiY29udmVyc2F0aW9uSWQiLCJvdGhlclVzZXIiLCJvdGhlcl91c2VyIiwiaXNHcm91cCIsImlzQmxvY2tlZCIsImlzX2Jsb2NrZWQiLCJncm91cE5hbWUiLCJuYW1lIiwidW5kZWZpbmVkIiwiZ3JvdXBJY29uIiwiaWNvbiIsIm9uQmFjayIsImgyIiwiYWN0aXZlSWQiLCJvblNlbGVjdCIsIm9uQ2xvc2UiLCJvblNlbGVjdFVzZXIiLCJoMSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsU0FBU0EsT0FBTyxRQUFRLGtCQUFrQjtBQUMxQyxTQUFTQyxnQkFBZ0IsUUFBeUIsa0JBQWtCO0FBQ3BFLFNBQVNDLFFBQVEsUUFBUSxpQ0FBaUM7QUFDMUQsU0FBU0Msa0JBQWtCLFFBQVEsc0JBQXNCO0FBQ3pE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