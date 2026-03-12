import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/pages/UserProfile.tsx");import * as RefreshRuntime from "/@react-refresh";
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
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("/dev-server/src/pages/UserProfile.tsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}

import __vite__cjsImport2_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=fb1d4910"; const _jsxDEV = __vite__cjsImport2_react_jsxDevRuntime["jsxDEV"]; const _Fragment = __vite__cjsImport2_react_jsxDevRuntime["Fragment"];
var _s = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=b874473c"; const useEffect = __vite__cjsImport3_react["useEffect"]; const useState = __vite__cjsImport3_react["useState"]; const useCallback = __vite__cjsImport3_react["useCallback"];
import { useParams, useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=9abf96c4";
import { supabase } from "/src/integrations/supabase/client.ts";
import { useAuth } from "/src/hooks/useAuth.tsx";
import { motion, AnimatePresence } from "/node_modules/.vite/deps/framer-motion.js?v=0eb59201";
import { VerificationBadge } from "/src/components/VerificationBadge.tsx";
import { AnimatedPage } from "/src/components/AnimatedPage.tsx";
import { ThemeToggle } from "/src/components/ThemeToggle.tsx";
import { ArrowLeft, UserPlus, UserMinus, Loader2, Smartphone, TrendingUp, Calendar, Send, MessageCircle, Settings, Pencil, X, Check } from "/node_modules/.vite/deps/lucide-react.js?v=1627e724";
import { styledToast as toast } from "/src/lib/toast.tsx";
import { formatDateTimeBR } from "/src/lib/timezone.ts";
export default function UserProfile() {
    _s();
    const { userId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [recargasCount, setRecargasCount] = useState(0);
    const [profileRole, setProfileRole] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    // Edit mode (only for own profile)
    const isOwnProfile = user?.id === userId;
    const [editingBio, setEditingBio] = useState(false);
    const [bioText, setBioText] = useState("");
    const [savingBio, setSavingBio] = useState(false);
    // Follower list modal
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [followersList, setFollowersList] = useState([]);
    const [followingList, setFollowingList] = useState([]);
    const [listLoading, setListLoading] = useState(false);
    const loadProfile = useCallback(async ()=>{
        if (!userId) return;
        setLoading(true);
        try {
            const [{ data: profileData }, { data: counts }, recargaResult, { data: followData }, { data: roleData }] = await Promise.all([
                supabase.from("profiles").select("id, nome, email, avatar_url, bio, verification_badge, created_at, telegram_username, whatsapp_number, active").eq("id", userId).single(),
                supabase.rpc("get_follow_counts", {
                    _user_id: userId
                }),
                supabase.from("recargas").select("id", {
                    count: "exact",
                    head: true
                }).eq("user_id", userId).eq("status", "completed"),
                user?.id && user.id !== userId ? supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", userId).maybeSingle() : Promise.resolve({
                    data: null
                }),
                supabase.rpc("has_role", {
                    _user_id: userId,
                    _role: "admin"
                })
            ]);
            if (profileData) {
                setProfile(profileData);
                setBioText(profileData.bio || "");
            }
            if (counts && Array.isArray(counts) && counts.length > 0) {
                setFollowersCount(Number(counts[0].followers_count) || 0);
                setFollowingCount(Number(counts[0].following_count) || 0);
            }
            setRecargasCount(Number(recargaResult.count) || 0);
            setIsFollowing(!!followData);
            if (roleData === true) setProfileRole("admin");
        } catch (e) {
            console.error("Error loading profile:", e);
        } finally{
            setLoading(false);
        }
    }, [
        userId,
        user?.id
    ]);
    useEffect(()=>{
        loadProfile();
    }, [
        loadProfile
    ]);
    const handleFollow = async ()=>{
        if (!user || !userId || followLoading) return;
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
                setIsFollowing(false);
                setFollowersCount((c)=>Math.max(0, c - 1));
                toast.success("Deixou de seguir");
            } else {
                await supabase.from("follows").insert({
                    follower_id: user.id,
                    following_id: userId
                });
                setIsFollowing(true);
                setFollowersCount((c)=>c + 1);
                toast.success("Seguindo!");
            }
        } catch  {
            toast.error("Erro ao atualizar");
        } finally{
            setFollowLoading(false);
        }
    };
    const handleSaveBio = async ()=>{
        if (!user) return;
        setSavingBio(true);
        try {
            await supabase.from("profiles").update({
                bio: bioText.trim()
            }).eq("id", user.id);
            setProfile((p)=>p ? {
                    ...p,
                    bio: bioText.trim()
                } : p);
            setEditingBio(false);
            toast.success("Bio atualizada!");
        } catch  {
            toast.error("Erro ao salvar bio");
        } finally{
            setSavingBio(false);
        }
    };
    const loadFollowersList = async ()=>{
        setListLoading(true);
        setShowFollowers(true);
        try {
            const { data } = await supabase.from("follows").select("follower_id").eq("following_id", userId);
            if (data && data.length > 0) {
                const ids = data.map((d)=>d.follower_id);
                const { data: profiles } = await supabase.from("profiles").select("id, nome, avatar_url").in("id", ids);
                setFollowersList(profiles || []);
            } else {
                setFollowersList([]);
            }
        } catch  {
            setFollowersList([]);
        } finally{
            setListLoading(false);
        }
    };
    const loadFollowingList = async ()=>{
        setListLoading(true);
        setShowFollowing(true);
        try {
            const { data } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
            if (data && data.length > 0) {
                const ids = data.map((d)=>d.following_id);
                const { data: profiles } = await supabase.from("profiles").select("id, nome, avatar_url").in("id", ids);
                setFollowingList(profiles || []);
            } else {
                setFollowingList([]);
            }
        } catch  {
            setFollowingList([]);
        } finally{
            setListLoading(false);
        }
    };
    const userInitial = (profile?.nome || profile?.email || "U")[0]?.toUpperCase() || "U";
    if (loading) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen bg-background flex items-center justify-center",
            children: /*#__PURE__*/ _jsxDEV(Loader2, {
                className: "h-8 w-8 text-primary animate-spin"
            }, void 0, false, {
                fileName: "/dev-server/src/pages/UserProfile.tsx",
                lineNumber: 178,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "/dev-server/src/pages/UserProfile.tsx",
            lineNumber: 177,
            columnNumber: 7
        }, this);
    }
    if (!profile) {
        return /*#__PURE__*/ _jsxDEV("div", {
            className: "min-h-screen bg-background flex flex-col items-center justify-center gap-4",
            children: [
                /*#__PURE__*/ _jsxDEV("p", {
                    className: "text-muted-foreground",
                    children: "Perfil não encontrado"
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                    lineNumber: 186,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ _jsxDEV("button", {
                    onClick: ()=>navigate(-1),
                    className: "text-primary font-semibold",
                    children: "Voltar"
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                    lineNumber: 187,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "/dev-server/src/pages/UserProfile.tsx",
            lineNumber: 185,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ _jsxDEV(AnimatedPage, {
        className: "min-h-screen bg-background",
        children: [
            /*#__PURE__*/ _jsxDEV("div", {
                className: "sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50",
                children: /*#__PURE__*/ _jsxDEV("div", {
                    className: "max-w-2xl mx-auto flex items-center justify-between px-4 h-14",
                    children: [
                        /*#__PURE__*/ _jsxDEV("button", {
                            onClick: ()=>navigate(-1),
                            className: "p-2 rounded-xl hover:bg-muted/50 transition-colors",
                            children: /*#__PURE__*/ _jsxDEV(ArrowLeft, {
                                className: "h-5 w-5 text-foreground"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                lineNumber: 198,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                            lineNumber: 197,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV("p", {
                            className: "font-display font-bold text-foreground text-sm truncate max-w-[200px]",
                            children: profile.nome || "Perfil"
                        }, void 0, false, {
                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                            lineNumber: 200,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ _jsxDEV(ThemeToggle, {}, void 0, false, {
                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                            lineNumber: 203,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                    lineNumber: 196,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/UserProfile.tsx",
                lineNumber: 195,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV("div", {
                className: "max-w-2xl mx-auto pb-20",
                children: [
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "h-32 md:h-44 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent relative overflow-hidden",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                lineNumber: 210,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                lineNumber: 211,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                        lineNumber: 209,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ _jsxDEV("div", {
                        className: "relative -mt-16 md:-mt-20 z-10 px-4 md:px-6",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 border border-border/50",
                                children: /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex flex-col md:flex-row md:items-start md:gap-8",
                                    children: [
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "relative flex-shrink-0 mx-auto md:mx-0",
                                            children: [
                                                profile.avatar_url && !avatarError ? /*#__PURE__*/ _jsxDEV("img", {
                                                    src: profile.avatar_url,
                                                    alt: "Avatar",
                                                    className: "w-[104px] h-[104px] md:w-[130px] md:h-[130px] rounded-full object-cover ring-[3px] ring-background shadow-2xl",
                                                    referrerPolicy: "no-referrer",
                                                    crossOrigin: "anonymous",
                                                    onError: ()=>setAvatarError(true)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                    lineNumber: 223,
                                                    columnNumber: 19
                                                }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "w-[104px] h-[104px] md:w-[130px] md:h-[130px] rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-3xl md:text-4xl ring-[3px] ring-background shadow-2xl",
                                                    children: userInitial
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                    lineNumber: 232,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "absolute bottom-1 right-1 md:bottom-2 md:right-2 w-4 h-4 md:w-5 md:h-5 bg-success rounded-full ring-2 ring-background"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                    lineNumber: 236,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                            lineNumber: 221,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ _jsxDEV("div", {
                                            className: "flex-1 mt-4 md:mt-1 text-center md:text-left",
                                            children: [
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex items-center gap-1.5 justify-center md:justify-start",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("h1", {
                                                            className: `font-display text-xl md:text-2xl font-bold uppercase ${profileRole === "admin" || profile.verification_badge ? "shimmer-letters" : "text-foreground"}`,
                                                            children: profile.nome || "Usuário"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                            lineNumber: 243,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV(VerificationBadge, {
                                                            badge: profile.verification_badge,
                                                            size: "md"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                            lineNumber: 246,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                    lineNumber: 242,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "mt-1.5 md:mt-2 md:max-w-md",
                                                    children: editingBio ? /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "flex items-center gap-2 mt-1",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV("input", {
                                                                value: bioText,
                                                                onChange: (e)=>setBioText(e.target.value),
                                                                maxLength: 160,
                                                                placeholder: "Escreva sua bio...",
                                                                className: "flex-1 px-3 py-1.5 rounded-lg glass-input text-sm text-foreground border border-border text-center md:text-left",
                                                                autoFocus: true
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                lineNumber: 253,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: handleSaveBio,
                                                                disabled: savingBio,
                                                                className: "p-1.5 rounded-lg bg-primary text-primary-foreground",
                                                                children: savingBio ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                                    className: "h-4 w-4 animate-spin"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 262,
                                                                    columnNumber: 38
                                                                }, this) : /*#__PURE__*/ _jsxDEV(Check, {
                                                                    className: "h-4 w-4"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 262,
                                                                    columnNumber: 85
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                lineNumber: 261,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV("button", {
                                                                onClick: ()=>{
                                                                    setEditingBio(false);
                                                                    setBioText(profile.bio || "");
                                                                },
                                                                className: "p-1.5 rounded-lg bg-muted text-muted-foreground",
                                                                children: /*#__PURE__*/ _jsxDEV(X, {
                                                                    className: "h-4 w-4"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 265,
                                                                    columnNumber: 25
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                lineNumber: 264,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                        lineNumber: 252,
                                                        columnNumber: 21
                                                    }, this) : /*#__PURE__*/ _jsxDEV("p", {
                                                        className: `text-xs md:text-sm ${profile.bio ? "text-muted-foreground" : "text-muted-foreground/40 italic"} ${isOwnProfile ? "cursor-pointer hover:text-foreground transition-colors" : ""}`,
                                                        onClick: ()=>isOwnProfile && setEditingBio(true),
                                                        children: [
                                                            profile.bio || (isOwnProfile ? "Toque para adicionar bio" : "Sem bio"),
                                                            isOwnProfile && !editingBio && /*#__PURE__*/ _jsxDEV(Pencil, {
                                                                className: "h-2.5 w-2.5 inline ml-1 opacity-40"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                lineNumber: 274,
                                                                columnNumber: 55
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                        lineNumber: 269,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                    lineNumber: 250,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex items-center gap-4 md:gap-6 justify-center md:justify-start mt-4",
                                                    children: [
                                                        /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: loadFollowersList,
                                                            className: "flex items-center gap-1.5 hover:opacity-80 transition-opacity group",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "font-display text-lg md:text-xl font-bold text-foreground tabular-nums group-hover:text-primary transition-colors",
                                                                    children: followersCount
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 282,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "text-[10px] md:text-xs text-muted-foreground font-medium",
                                                                    children: "Seguidores"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 283,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                            lineNumber: 281,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "w-px h-4 bg-border"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                            lineNumber: 285,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("button", {
                                                            onClick: loadFollowingList,
                                                            className: "flex items-center gap-1.5 hover:opacity-80 transition-opacity group",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "font-display text-lg md:text-xl font-bold text-foreground tabular-nums group-hover:text-primary transition-colors",
                                                                    children: followingCount
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 287,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "text-[10px] md:text-xs text-muted-foreground font-medium",
                                                                    children: "Seguindo"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 288,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                            lineNumber: 286,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "w-px h-4 bg-border"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                            lineNumber: 290,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ _jsxDEV("div", {
                                                            className: "flex items-center gap-1.5",
                                                            children: [
                                                                /*#__PURE__*/ _jsxDEV(TrendingUp, {
                                                                    className: "h-3.5 w-3.5 text-primary"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 292,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "font-display text-lg md:text-xl font-bold text-primary tabular-nums",
                                                                    children: recargasCount
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 293,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ _jsxDEV("span", {
                                                                    className: "text-[10px] md:text-xs text-muted-foreground",
                                                                    children: "recargas"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 294,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                            lineNumber: 291,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                    lineNumber: 280,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ _jsxDEV("div", {
                                                    className: "flex gap-3 mt-5 md:mt-6 md:max-w-sm",
                                                    children: !isOwnProfile ? /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV(motion.button, {
                                                                whileTap: {
                                                                    scale: 0.95
                                                                },
                                                                whileHover: {
                                                                    scale: 1.02
                                                                },
                                                                onClick: handleFollow,
                                                                disabled: followLoading,
                                                                className: `flex-1 py-2.5 md:py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${isFollowing ? "glass-card text-foreground border border-border hover:bg-muted/50" : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"}`,
                                                                children: followLoading ? /*#__PURE__*/ _jsxDEV(Loader2, {
                                                                    className: "h-4 w-4 animate-spin"
                                                                }, void 0, false, {
                                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                    lineNumber: 314,
                                                                    columnNumber: 27
                                                                }, this) : isFollowing ? /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV(UserMinus, {
                                                                            className: "h-4 w-4"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                            lineNumber: 316,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        " Seguindo"
                                                                    ]
                                                                }, void 0, true) : /*#__PURE__*/ _jsxDEV(_Fragment, {
                                                                    children: [
                                                                        /*#__PURE__*/ _jsxDEV(UserPlus, {
                                                                            className: "h-4 w-4"
                                                                        }, void 0, false, {
                                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                            lineNumber: 318,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        " Seguir"
                                                                    ]
                                                                }, void 0, true)
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                lineNumber: 302,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ _jsxDEV(motion.button, {
                                                                whileTap: {
                                                                    scale: 0.95
                                                                },
                                                                whileHover: {
                                                                    scale: 1.02
                                                                },
                                                                onClick: ()=>navigate("/chat"),
                                                                className: "px-5 py-2.5 md:py-3 rounded-xl glass-card text-foreground font-bold text-sm flex items-center gap-2 border border-border hover:bg-muted/50 transition-colors",
                                                                children: [
                                                                    /*#__PURE__*/ _jsxDEV(MessageCircle, {
                                                                        className: "h-4 w-4"
                                                                    }, void 0, false, {
                                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                        lineNumber: 327,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    " Chat"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                lineNumber: 321,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true) : /*#__PURE__*/ _jsxDEV(motion.button, {
                                                        whileTap: {
                                                            scale: 0.95
                                                        },
                                                        whileHover: {
                                                            scale: 1.02
                                                        },
                                                        onClick: ()=>navigate("/painel"),
                                                        className: "flex-1 py-2.5 md:py-3 rounded-xl glass-card text-foreground font-bold text-sm flex items-center justify-center gap-2 border border-border hover:bg-muted/50 transition-colors",
                                                        children: [
                                                            /*#__PURE__*/ _jsxDEV(Settings, {
                                                                className: "h-4 w-4"
                                                            }, void 0, false, {
                                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                                lineNumber: 337,
                                                                columnNumber: 23
                                                            }, this),
                                                            " Editar Perfil"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                        lineNumber: 331,
                                                        columnNumber: 21
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                    lineNumber: 299,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                            lineNumber: 240,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                    lineNumber: 219,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                lineNumber: 217,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("div", {
                                        className: "glass-card rounded-2xl p-4 md:p-5 flex items-center gap-3 border border-border/50 hover:border-primary/20 transition-colors",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                className: "w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/15 flex items-center justify-center",
                                                children: /*#__PURE__*/ _jsxDEV(Calendar, {
                                                    className: "h-5 w-5 md:h-6 md:w-6 text-primary"
                                                }, void 0, false, {
                                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                    lineNumber: 350,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                lineNumber: 349,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("div", {
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "text-xs text-muted-foreground",
                                                        children: "Membro desde"
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                        lineNumber: 353,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("p", {
                                                        className: "font-semibold text-foreground text-sm md:text-base",
                                                        children: formatDateTimeBR(profile.created_at)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                        lineNumber: 354,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                lineNumber: 352,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                        lineNumber: 348,
                                        columnNumber: 13
                                    }, this),
                                    (profile.telegram_username || profile.whatsapp_number) && /*#__PURE__*/ _jsxDEV("div", {
                                        className: "glass-card rounded-2xl p-4 md:p-5 space-y-3 border border-border/50 hover:border-primary/20 transition-colors",
                                        children: [
                                            /*#__PURE__*/ _jsxDEV("p", {
                                                className: "text-xs text-muted-foreground uppercase tracking-wider font-semibold",
                                                children: "Contato"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                lineNumber: 361,
                                                columnNumber: 17
                                            }, this),
                                            profile.telegram_username && /*#__PURE__*/ _jsxDEV("a", {
                                                href: `https://t.me/${profile.telegram_username}`,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                className: "flex items-center gap-3 hover:bg-muted/30 rounded-xl p-2 -mx-2 transition-colors",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "w-8 h-8 rounded-lg flex items-center justify-center",
                                                        style: {
                                                            background: "linear-gradient(135deg, #0088cc, #0077b5)"
                                                        },
                                                        children: /*#__PURE__*/ _jsxDEV(Send, {
                                                            className: "h-4 w-4 text-white"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                            lineNumber: 370,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                        lineNumber: 369,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-sm text-foreground",
                                                        children: [
                                                            "@",
                                                            profile.telegram_username
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                        lineNumber: 372,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                lineNumber: 363,
                                                columnNumber: 19
                                            }, this),
                                            profile.whatsapp_number && /*#__PURE__*/ _jsxDEV("a", {
                                                href: `https://wa.me/${profile.whatsapp_number.replace(/\D/g, "")}`,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                className: "flex items-center gap-3 hover:bg-muted/30 rounded-xl p-2 -mx-2 transition-colors",
                                                children: [
                                                    /*#__PURE__*/ _jsxDEV("div", {
                                                        className: "w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center",
                                                        children: /*#__PURE__*/ _jsxDEV(Smartphone, {
                                                            className: "h-4 w-4 text-success"
                                                        }, void 0, false, {
                                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                            lineNumber: 383,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                        lineNumber: 382,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ _jsxDEV("span", {
                                                        className: "text-sm text-foreground",
                                                        children: profile.whatsapp_number
                                                    }, void 0, false, {
                                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                        lineNumber: 385,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                lineNumber: 376,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                        lineNumber: 360,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                lineNumber: 346,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                        lineNumber: 215,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "/dev-server/src/pages/UserProfile.tsx",
                lineNumber: 207,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ _jsxDEV(AnimatePresence, {
                children: (showFollowers || showFollowing) && /*#__PURE__*/ _jsxDEV(motion.div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    className: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center",
                    onClick: ()=>{
                        setShowFollowers(false);
                        setShowFollowing(false);
                    },
                    children: /*#__PURE__*/ _jsxDEV(motion.div, {
                        initial: {
                            y: 100,
                            opacity: 0
                        },
                        animate: {
                            y: 0,
                            opacity: 1
                        },
                        exit: {
                            y: 100,
                            opacity: 0
                        },
                        onClick: (e)=>e.stopPropagation(),
                        className: "w-full max-w-md max-h-[70vh] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden",
                        children: [
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "flex items-center justify-between p-4 border-b border-border",
                                children: [
                                    /*#__PURE__*/ _jsxDEV("h3", {
                                        className: "font-bold text-foreground",
                                        children: showFollowers ? "Seguidores" : "Seguindo"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                        lineNumber: 412,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>{
                                            setShowFollowers(false);
                                            setShowFollowing(false);
                                        },
                                        className: "p-1.5 rounded-lg hover:bg-muted/50",
                                        children: /*#__PURE__*/ _jsxDEV(X, {
                                            className: "h-5 w-5 text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "/dev-server/src/pages/UserProfile.tsx",
                                            lineNumber: 416,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                        lineNumber: 415,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                lineNumber: 411,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ _jsxDEV("div", {
                                className: "overflow-y-auto max-h-[55vh] p-2",
                                children: listLoading ? /*#__PURE__*/ _jsxDEV("div", {
                                    className: "flex justify-center p-8",
                                    children: /*#__PURE__*/ _jsxDEV(Loader2, {
                                        className: "h-6 w-6 text-primary animate-spin"
                                    }, void 0, false, {
                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                        lineNumber: 421,
                                        columnNumber: 60
                                    }, this)
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                    lineNumber: 421,
                                    columnNumber: 19
                                }, this) : (showFollowers ? followersList : followingList).length === 0 ? /*#__PURE__*/ _jsxDEV("p", {
                                    className: "text-center text-muted-foreground text-sm py-8",
                                    children: "Nenhum usuário encontrado"
                                }, void 0, false, {
                                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                                    lineNumber: 423,
                                    columnNumber: 19
                                }, this) : (showFollowers ? followersList : followingList).map((u)=>/*#__PURE__*/ _jsxDEV("button", {
                                        onClick: ()=>{
                                            setShowFollowers(false);
                                            setShowFollowing(false);
                                            navigate(`/perfil/${u.id}`);
                                        },
                                        className: "flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted/30 transition-colors",
                                        children: [
                                            u.avatar_url ? /*#__PURE__*/ _jsxDEV("img", {
                                                src: u.avatar_url,
                                                alt: "",
                                                className: "w-10 h-10 rounded-full object-cover"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                lineNumber: 432,
                                                columnNumber: 25
                                            }, this) : /*#__PURE__*/ _jsxDEV("div", {
                                                className: "w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold",
                                                children: (u.nome || "U")[0]?.toUpperCase()
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                lineNumber: 434,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ _jsxDEV("span", {
                                                className: "font-semibold text-foreground text-sm",
                                                children: u.nome || "Usuário"
                                            }, void 0, false, {
                                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                                lineNumber: 438,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, u.id, true, {
                                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                                        lineNumber: 426,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "/dev-server/src/pages/UserProfile.tsx",
                                lineNumber: 419,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "/dev-server/src/pages/UserProfile.tsx",
                        lineNumber: 404,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "/dev-server/src/pages/UserProfile.tsx",
                    lineNumber: 397,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "/dev-server/src/pages/UserProfile.tsx",
                lineNumber: 395,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "/dev-server/src/pages/UserProfile.tsx",
        lineNumber: 193,
        columnNumber: 5
    }, this);
}
_s(UserProfile, "CGwDUEGOCiS12L7qV7XmXU6Pt4w=", false, function() {
    return [
        useParams,
        useAuth,
        useNavigate
    ];
});
_c = UserProfile;
var _c;
$RefreshReg$(_c, "UserProfile");


if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("/dev-server/src/pages/UserProfile.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("/dev-server/src/pages/UserProfile.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlVzZXJQcm9maWxlLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyB1c2VFZmZlY3QsIHVzZVN0YXRlLCB1c2VDYWxsYmFjayB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgdXNlUGFyYW1zLCB1c2VOYXZpZ2F0ZSB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XG5pbXBvcnQgeyBzdXBhYmFzZSB9IGZyb20gXCJAL2ludGVncmF0aW9ucy9zdXBhYmFzZS9jbGllbnRcIjtcbmltcG9ydCB7IHVzZUF1dGggfSBmcm9tIFwiQC9ob29rcy91c2VBdXRoXCI7XG5pbXBvcnQgeyBtb3Rpb24sIEFuaW1hdGVQcmVzZW5jZSB9IGZyb20gXCJmcmFtZXItbW90aW9uXCI7XG5pbXBvcnQgeyBWZXJpZmljYXRpb25CYWRnZSwgQmFkZ2VUeXBlIH0gZnJvbSBcIkAvY29tcG9uZW50cy9WZXJpZmljYXRpb25CYWRnZVwiO1xuaW1wb3J0IHsgQW5pbWF0ZWRQYWdlIH0gZnJvbSBcIkAvY29tcG9uZW50cy9BbmltYXRlZFBhZ2VcIjtcbmltcG9ydCB7IFRoZW1lVG9nZ2xlIH0gZnJvbSBcIkAvY29tcG9uZW50cy9UaGVtZVRvZ2dsZVwiO1xuaW1wb3J0IHtcbiAgQXJyb3dMZWZ0LCBVc2VyUGx1cywgVXNlck1pbnVzLCBMb2FkZXIyLCBTaGllbGQsIFNtYXJ0cGhvbmUsXG4gIFRyZW5kaW5nVXAsIENhbGVuZGFyLCBTZW5kLCBNZXNzYWdlQ2lyY2xlLCBTZXR0aW5ncywgQ2FtZXJhLFxuICBQZW5jaWwsIFNhdmUsIFgsIENoZWNrLFxufSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5pbXBvcnQgeyBzdHlsZWRUb2FzdCBhcyB0b2FzdCB9IGZyb20gXCJAL2xpYi90b2FzdFwiO1xuaW1wb3J0IHsgZm9ybWF0RGF0ZVRpbWVCUiB9IGZyb20gXCJAL2xpYi90aW1lem9uZVwiO1xuXG5pbnRlcmZhY2UgUHJvZmlsZURhdGEge1xuICBpZDogc3RyaW5nO1xuICBub21lOiBzdHJpbmcgfCBudWxsO1xuICBlbWFpbDogc3RyaW5nIHwgbnVsbDtcbiAgYXZhdGFyX3VybDogc3RyaW5nIHwgbnVsbDtcbiAgYmlvOiBzdHJpbmcgfCBudWxsO1xuICB2ZXJpZmljYXRpb25fYmFkZ2U6IHN0cmluZyB8IG51bGw7XG4gIGNyZWF0ZWRfYXQ6IHN0cmluZztcbiAgdGVsZWdyYW1fdXNlcm5hbWU6IHN0cmluZyB8IG51bGw7XG4gIHdoYXRzYXBwX251bWJlcjogc3RyaW5nIHwgbnVsbDtcbiAgYWN0aXZlOiBib29sZWFuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBVc2VyUHJvZmlsZSgpIHtcbiAgY29uc3QgeyB1c2VySWQgfSA9IHVzZVBhcmFtczx7IHVzZXJJZDogc3RyaW5nIH0+KCk7XG4gIGNvbnN0IHsgdXNlciB9ID0gdXNlQXV0aCgpO1xuICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKCk7XG5cbiAgY29uc3QgW3Byb2ZpbGUsIHNldFByb2ZpbGVdID0gdXNlU3RhdGU8UHJvZmlsZURhdGEgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtmb2xsb3dlcnNDb3VudCwgc2V0Rm9sbG93ZXJzQ291bnRdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtmb2xsb3dpbmdDb3VudCwgc2V0Rm9sbG93aW5nQ291bnRdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtyZWNhcmdhc0NvdW50LCBzZXRSZWNhcmdhc0NvdW50XSA9IHVzZVN0YXRlKDApO1xuICBjb25zdCBbcHJvZmlsZVJvbGUsIHNldFByb2ZpbGVSb2xlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbaXNGb2xsb3dpbmcsIHNldElzRm9sbG93aW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2ZvbGxvd0xvYWRpbmcsIHNldEZvbGxvd0xvYWRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbYXZhdGFyRXJyb3IsIHNldEF2YXRhckVycm9yXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICAvLyBFZGl0IG1vZGUgKG9ubHkgZm9yIG93biBwcm9maWxlKVxuICBjb25zdCBpc093blByb2ZpbGUgPSB1c2VyPy5pZCA9PT0gdXNlcklkO1xuICBjb25zdCBbZWRpdGluZ0Jpbywgc2V0RWRpdGluZ0Jpb10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtiaW9UZXh0LCBzZXRCaW9UZXh0XSA9IHVzZVN0YXRlKFwiXCIpO1xuICBjb25zdCBbc2F2aW5nQmlvLCBzZXRTYXZpbmdCaW9dID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIC8vIEZvbGxvd2VyIGxpc3QgbW9kYWxcbiAgY29uc3QgW3Nob3dGb2xsb3dlcnMsIHNldFNob3dGb2xsb3dlcnNdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbc2hvd0ZvbGxvd2luZywgc2V0U2hvd0ZvbGxvd2luZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtmb2xsb3dlcnNMaXN0LCBzZXRGb2xsb3dlcnNMaXN0XSA9IHVzZVN0YXRlPHsgaWQ6IHN0cmluZzsgbm9tZTogc3RyaW5nIHwgbnVsbDsgYXZhdGFyX3VybDogc3RyaW5nIHwgbnVsbCB9W10+KFtdKTtcbiAgY29uc3QgW2ZvbGxvd2luZ0xpc3QsIHNldEZvbGxvd2luZ0xpc3RdID0gdXNlU3RhdGU8eyBpZDogc3RyaW5nOyBub21lOiBzdHJpbmcgfCBudWxsOyBhdmF0YXJfdXJsOiBzdHJpbmcgfCBudWxsIH1bXT4oW10pO1xuICBjb25zdCBbbGlzdExvYWRpbmcsIHNldExpc3RMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICBjb25zdCBsb2FkUHJvZmlsZSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXVzZXJJZCkgcmV0dXJuO1xuICAgIHNldExvYWRpbmcodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IFt7IGRhdGE6IHByb2ZpbGVEYXRhIH0sIHsgZGF0YTogY291bnRzIH0sIHJlY2FyZ2FSZXN1bHQsIHsgZGF0YTogZm9sbG93RGF0YSB9LCB7IGRhdGE6IHJvbGVEYXRhIH1dID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICBzdXBhYmFzZS5mcm9tKFwicHJvZmlsZXNcIikuc2VsZWN0KFwiaWQsIG5vbWUsIGVtYWlsLCBhdmF0YXJfdXJsLCBiaW8sIHZlcmlmaWNhdGlvbl9iYWRnZSwgY3JlYXRlZF9hdCwgdGVsZWdyYW1fdXNlcm5hbWUsIHdoYXRzYXBwX251bWJlciwgYWN0aXZlXCIpLmVxKFwiaWRcIiwgdXNlcklkKS5zaW5nbGUoKSxcbiAgICAgICAgc3VwYWJhc2UucnBjKFwiZ2V0X2ZvbGxvd19jb3VudHNcIiwgeyBfdXNlcl9pZDogdXNlcklkIH0pLFxuICAgICAgICBzdXBhYmFzZS5mcm9tKFwicmVjYXJnYXNcIikuc2VsZWN0KFwiaWRcIiwgeyBjb3VudDogXCJleGFjdFwiLCBoZWFkOiB0cnVlIH0pLmVxKFwidXNlcl9pZFwiLCB1c2VySWQpLmVxKFwic3RhdHVzXCIsIFwiY29tcGxldGVkXCIpLFxuICAgICAgICB1c2VyPy5pZCAmJiB1c2VyLmlkICE9PSB1c2VySWRcbiAgICAgICAgICA/IHN1cGFiYXNlLmZyb20oXCJmb2xsb3dzXCIpLnNlbGVjdChcImlkXCIpLmVxKFwiZm9sbG93ZXJfaWRcIiwgdXNlci5pZCkuZXEoXCJmb2xsb3dpbmdfaWRcIiwgdXNlcklkKS5tYXliZVNpbmdsZSgpXG4gICAgICAgICAgOiBQcm9taXNlLnJlc29sdmUoeyBkYXRhOiBudWxsIH0pLFxuICAgICAgICBzdXBhYmFzZS5ycGMoXCJoYXNfcm9sZVwiLCB7IF91c2VyX2lkOiB1c2VySWQsIF9yb2xlOiBcImFkbWluXCIgfSksXG4gICAgICBdKTtcblxuICAgICAgaWYgKHByb2ZpbGVEYXRhKSB7XG4gICAgICAgIHNldFByb2ZpbGUocHJvZmlsZURhdGEgYXMgYW55KTtcbiAgICAgICAgc2V0QmlvVGV4dCgocHJvZmlsZURhdGEgYXMgYW55KS5iaW8gfHwgXCJcIik7XG4gICAgICB9XG4gICAgICBpZiAoY291bnRzICYmIEFycmF5LmlzQXJyYXkoY291bnRzKSAmJiBjb3VudHMubGVuZ3RoID4gMCkge1xuICAgICAgICBzZXRGb2xsb3dlcnNDb3VudChOdW1iZXIoY291bnRzWzBdLmZvbGxvd2Vyc19jb3VudCkgfHwgMCk7XG4gICAgICAgIHNldEZvbGxvd2luZ0NvdW50KE51bWJlcihjb3VudHNbMF0uZm9sbG93aW5nX2NvdW50KSB8fCAwKTtcbiAgICAgIH1cbiAgICAgIHNldFJlY2FyZ2FzQ291bnQoTnVtYmVyKHJlY2FyZ2FSZXN1bHQuY291bnQpIHx8IDApO1xuICAgICAgc2V0SXNGb2xsb3dpbmcoISFmb2xsb3dEYXRhKTtcbiAgICAgIGlmIChyb2xlRGF0YSA9PT0gdHJ1ZSkgc2V0UHJvZmlsZVJvbGUoXCJhZG1pblwiKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgbG9hZGluZyBwcm9maWxlOlwiLCBlKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9LCBbdXNlcklkLCB1c2VyPy5pZF0pO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7IGxvYWRQcm9maWxlKCk7IH0sIFtsb2FkUHJvZmlsZV0pO1xuXG4gIGNvbnN0IGhhbmRsZUZvbGxvdyA9IGFzeW5jICgpID0+IHtcbiAgICBpZiAoIXVzZXIgfHwgIXVzZXJJZCB8fCBmb2xsb3dMb2FkaW5nKSByZXR1cm47XG4gICAgc2V0Rm9sbG93TG9hZGluZyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgaWYgKGlzRm9sbG93aW5nKSB7XG4gICAgICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oXCJmb2xsb3dzXCIpLmRlbGV0ZSgpLmVxKFwiZm9sbG93ZXJfaWRcIiwgdXNlci5pZCkuZXEoXCJmb2xsb3dpbmdfaWRcIiwgdXNlcklkKTtcbiAgICAgICAgc2V0SXNGb2xsb3dpbmcoZmFsc2UpO1xuICAgICAgICBzZXRGb2xsb3dlcnNDb3VudCgoYykgPT4gTWF0aC5tYXgoMCwgYyAtIDEpKTtcbiAgICAgICAgdG9hc3Quc3VjY2VzcyhcIkRlaXhvdSBkZSBzZWd1aXJcIik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhd2FpdCBzdXBhYmFzZS5mcm9tKFwiZm9sbG93c1wiKS5pbnNlcnQoeyBmb2xsb3dlcl9pZDogdXNlci5pZCwgZm9sbG93aW5nX2lkOiB1c2VySWQgfSBhcyBhbnkpO1xuICAgICAgICBzZXRJc0ZvbGxvd2luZyh0cnVlKTtcbiAgICAgICAgc2V0Rm9sbG93ZXJzQ291bnQoKGMpID0+IGMgKyAxKTtcbiAgICAgICAgdG9hc3Quc3VjY2VzcyhcIlNlZ3VpbmRvIVwiKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICAgIHRvYXN0LmVycm9yKFwiRXJybyBhbyBhdHVhbGl6YXJcIik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHNldEZvbGxvd0xvYWRpbmcoZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBoYW5kbGVTYXZlQmlvID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghdXNlcikgcmV0dXJuO1xuICAgIHNldFNhdmluZ0Jpbyh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgc3VwYWJhc2UuZnJvbShcInByb2ZpbGVzXCIpLnVwZGF0ZSh7IGJpbzogYmlvVGV4dC50cmltKCkgfSBhcyBhbnkpLmVxKFwiaWRcIiwgdXNlci5pZCk7XG4gICAgICBzZXRQcm9maWxlKChwKSA9PiBwID8geyAuLi5wLCBiaW86IGJpb1RleHQudHJpbSgpIH0gOiBwKTtcbiAgICAgIHNldEVkaXRpbmdCaW8oZmFsc2UpO1xuICAgICAgdG9hc3Quc3VjY2VzcyhcIkJpbyBhdHVhbGl6YWRhIVwiKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHRvYXN0LmVycm9yKFwiRXJybyBhbyBzYWx2YXIgYmlvXCIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRTYXZpbmdCaW8oZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICBjb25zdCBsb2FkRm9sbG93ZXJzTGlzdCA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRMaXN0TG9hZGluZyh0cnVlKTtcbiAgICBzZXRTaG93Rm9sbG93ZXJzKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKFwiZm9sbG93c1wiKVxuICAgICAgICAuc2VsZWN0KFwiZm9sbG93ZXJfaWRcIilcbiAgICAgICAgLmVxKFwiZm9sbG93aW5nX2lkXCIsIHVzZXJJZCEpO1xuICAgICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGlkcyA9IGRhdGEubWFwKChkOiBhbnkpID0+IGQuZm9sbG93ZXJfaWQpO1xuICAgICAgICBjb25zdCB7IGRhdGE6IHByb2ZpbGVzIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAgIC5mcm9tKFwicHJvZmlsZXNcIilcbiAgICAgICAgICAuc2VsZWN0KFwiaWQsIG5vbWUsIGF2YXRhcl91cmxcIilcbiAgICAgICAgICAuaW4oXCJpZFwiLCBpZHMpO1xuICAgICAgICBzZXRGb2xsb3dlcnNMaXN0KChwcm9maWxlcyBhcyBhbnkpIHx8IFtdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEZvbGxvd2Vyc0xpc3QoW10pO1xuICAgICAgfVxuICAgIH0gY2F0Y2ggeyBzZXRGb2xsb3dlcnNMaXN0KFtdKTsgfVxuICAgIGZpbmFsbHkgeyBzZXRMaXN0TG9hZGluZyhmYWxzZSk7IH1cbiAgfTtcblxuICBjb25zdCBsb2FkRm9sbG93aW5nTGlzdCA9IGFzeW5jICgpID0+IHtcbiAgICBzZXRMaXN0TG9hZGluZyh0cnVlKTtcbiAgICBzZXRTaG93Rm9sbG93aW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGRhdGEgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAgIC5mcm9tKFwiZm9sbG93c1wiKVxuICAgICAgICAuc2VsZWN0KFwiZm9sbG93aW5nX2lkXCIpXG4gICAgICAgIC5lcShcImZvbGxvd2VyX2lkXCIsIHVzZXJJZCEpO1xuICAgICAgaWYgKGRhdGEgJiYgZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGlkcyA9IGRhdGEubWFwKChkOiBhbnkpID0+IGQuZm9sbG93aW5nX2lkKTtcbiAgICAgICAgY29uc3QgeyBkYXRhOiBwcm9maWxlcyB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgICAuZnJvbShcInByb2ZpbGVzXCIpXG4gICAgICAgICAgLnNlbGVjdChcImlkLCBub21lLCBhdmF0YXJfdXJsXCIpXG4gICAgICAgICAgLmluKFwiaWRcIiwgaWRzKTtcbiAgICAgICAgc2V0Rm9sbG93aW5nTGlzdCgocHJvZmlsZXMgYXMgYW55KSB8fCBbXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZXRGb2xsb3dpbmdMaXN0KFtdKTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHsgc2V0Rm9sbG93aW5nTGlzdChbXSk7IH1cbiAgICBmaW5hbGx5IHsgc2V0TGlzdExvYWRpbmcoZmFsc2UpOyB9XG4gIH07XG5cbiAgY29uc3QgdXNlckluaXRpYWwgPSAocHJvZmlsZT8ubm9tZSB8fCBwcm9maWxlPy5lbWFpbCB8fCBcIlVcIilbMF0/LnRvVXBwZXJDYXNlKCkgfHwgXCJVXCI7XG5cbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctYmFja2dyb3VuZCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgICA8TG9hZGVyMiBjbGFzc05hbWU9XCJoLTggdy04IHRleHQtcHJpbWFyeSBhbmltYXRlLXNwaW5cIiAvPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIGlmICghcHJvZmlsZSkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1pbi1oLXNjcmVlbiBiZy1iYWNrZ3JvdW5kIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC00XCI+XG4gICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlBlcmZpbCBuw6NvIGVuY29udHJhZG88L3A+XG4gICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4gbmF2aWdhdGUoLTEpfSBjbGFzc05hbWU9XCJ0ZXh0LXByaW1hcnkgZm9udC1zZW1pYm9sZFwiPlZvbHRhcjwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEFuaW1hdGVkUGFnZSBjbGFzc05hbWU9XCJtaW4taC1zY3JlZW4gYmctYmFja2dyb3VuZFwiPlxuICAgICAgey8qIEhlYWRlciAqL31cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3RpY2t5IHRvcC0wIHotMzAgYmctYmFja2dyb3VuZC84MCBiYWNrZHJvcC1ibHVyLXhsIGJvcmRlci1iIGJvcmRlci1ib3JkZXIvNTBcIj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYXgtdy0yeGwgbXgtYXV0byBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcHgtNCBoLTE0XCI+XG4gICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiBuYXZpZ2F0ZSgtMSl9IGNsYXNzTmFtZT1cInAtMiByb3VuZGVkLXhsIGhvdmVyOmJnLW11dGVkLzUwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICA8QXJyb3dMZWZ0IGNsYXNzTmFtZT1cImgtNSB3LTUgdGV4dC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJmb250LWRpc3BsYXkgZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZCB0ZXh0LXNtIHRydW5jYXRlIG1heC13LVsyMDBweF1cIj5cbiAgICAgICAgICAgIHtwcm9maWxlLm5vbWUgfHwgXCJQZXJmaWxcIn1cbiAgICAgICAgICA8L3A+XG4gICAgICAgICAgPFRoZW1lVG9nZ2xlIC8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwibWF4LXctMnhsIG14LWF1dG8gcGItMjBcIj5cbiAgICAgICAgey8qIENvdmVyIGdyYWRpZW50IC0gdGFsbGVyIG9uIGRlc2t0b3AgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC0zMiBtZDpoLTQ0IGJnLWdyYWRpZW50LXRvLWJyIGZyb20tcHJpbWFyeS8zMCB2aWEtcHJpbWFyeS8xMCB0by10cmFuc3BhcmVudCByZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgYmctW3JhZGlhbC1ncmFkaWVudChlbGxpcHNlX2F0X3RvcF9yaWdodCxoc2wodmFyKC0tcHJpbWFyeSkvMC4xNSksdHJhbnNwYXJlbnRfNzAlKV1cIiAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgYm90dG9tLTAgbGVmdC0wIHJpZ2h0LTAgaC0xNiBiZy1ncmFkaWVudC10by10IGZyb20tYmFja2dyb3VuZCB0by10cmFuc3BhcmVudFwiIC8+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsvKiBEZXNrdG9wOiBob3Jpem9udGFsIGNhcmQgbGF5b3V0ICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIC1tdC0xNiBtZDotbXQtMjAgei0xMCBweC00IG1kOnB4LTZcIj5cbiAgICAgICAgICB7LyogTWFpbiBwcm9maWxlIGNhcmQgKi99XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1jYXJkIHJvdW5kZWQtMnhsIG1kOnJvdW5kZWQtM3hsIHAtNSBtZDpwLTggYm9yZGVyIGJvcmRlci1ib3JkZXIvNTBcIj5cbiAgICAgICAgICAgIHsvKiBUb3Agcm93OiBBdmF0YXIgKyBJbmZvICsgQWN0aW9ucyAoc2lkZSBieSBzaWRlIG9uIGRlc2t0b3ApICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIG1kOmZsZXgtcm93IG1kOml0ZW1zLXN0YXJ0IG1kOmdhcC04XCI+XG4gICAgICAgICAgICAgIHsvKiBBdmF0YXIgKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgZmxleC1zaHJpbmstMCBteC1hdXRvIG1kOm14LTBcIj5cbiAgICAgICAgICAgICAgICB7cHJvZmlsZS5hdmF0YXJfdXJsICYmICFhdmF0YXJFcnJvciA/IChcbiAgICAgICAgICAgICAgICAgIDxpbWdcbiAgICAgICAgICAgICAgICAgICAgc3JjPXtwcm9maWxlLmF2YXRhcl91cmx9XG4gICAgICAgICAgICAgICAgICAgIGFsdD1cIkF2YXRhclwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInctWzEwNHB4XSBoLVsxMDRweF0gbWQ6dy1bMTMwcHhdIG1kOmgtWzEzMHB4XSByb3VuZGVkLWZ1bGwgb2JqZWN0LWNvdmVyIHJpbmctWzNweF0gcmluZy1iYWNrZ3JvdW5kIHNoYWRvdy0yeGxcIlxuICAgICAgICAgICAgICAgICAgICByZWZlcnJlclBvbGljeT1cIm5vLXJlZmVycmVyXCJcbiAgICAgICAgICAgICAgICAgICAgY3Jvc3NPcmlnaW49XCJhbm9ueW1vdXNcIlxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yPXsoKSA9PiBzZXRBdmF0YXJFcnJvcih0cnVlKX1cbiAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1bMTA0cHhdIGgtWzEwNHB4XSBtZDp3LVsxMzBweF0gbWQ6aC1bMTMwcHhdIHJvdW5kZWQtZnVsbCBiZy1ncmFkaWVudC10by1iciBmcm9tLXByaW1hcnkgdG8tcHJpbWFyeS82MCB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBmb250LWJvbGQgdGV4dC0zeGwgbWQ6dGV4dC00eGwgcmluZy1bM3B4XSByaW5nLWJhY2tncm91bmQgc2hhZG93LTJ4bFwiPlxuICAgICAgICAgICAgICAgICAgICB7dXNlckluaXRpYWx9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgYm90dG9tLTEgcmlnaHQtMSBtZDpib3R0b20tMiBtZDpyaWdodC0yIHctNCBoLTQgbWQ6dy01IG1kOmgtNSBiZy1zdWNjZXNzIHJvdW5kZWQtZnVsbCByaW5nLTIgcmluZy1iYWNrZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgey8qIEluZm8gY29sdW1uICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMSBtdC00IG1kOm10LTEgdGV4dC1jZW50ZXIgbWQ6dGV4dC1sZWZ0XCI+XG4gICAgICAgICAgICAgICAgey8qIE5hbWUgKyBiYWRnZSAqL31cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUganVzdGlmeS1jZW50ZXIgbWQ6anVzdGlmeS1zdGFydFwiPlxuICAgICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT17YGZvbnQtZGlzcGxheSB0ZXh0LXhsIG1kOnRleHQtMnhsIGZvbnQtYm9sZCB1cHBlcmNhc2UgJHtwcm9maWxlUm9sZSA9PT0gXCJhZG1pblwiIHx8IHByb2ZpbGUudmVyaWZpY2F0aW9uX2JhZGdlID8gXCJzaGltbWVyLWxldHRlcnNcIiA6IFwidGV4dC1mb3JlZ3JvdW5kXCJ9YH0+XG4gICAgICAgICAgICAgICAgICAgIHtwcm9maWxlLm5vbWUgfHwgXCJVc3XDoXJpb1wifVxuICAgICAgICAgICAgICAgICAgPC9oMT5cbiAgICAgICAgICAgICAgICAgIDxWZXJpZmljYXRpb25CYWRnZSBiYWRnZT17cHJvZmlsZS52ZXJpZmljYXRpb25fYmFkZ2UgYXMgQmFkZ2VUeXBlfSBzaXplPVwibWRcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgey8qIEJpbyAqL31cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm10LTEuNSBtZDptdC0yIG1kOm1heC13LW1kXCI+XG4gICAgICAgICAgICAgICAgICB7ZWRpdGluZ0JpbyA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBtdC0xXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17YmlvVGV4dH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0QmlvVGV4dChlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXhMZW5ndGg9ezE2MH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiRXNjcmV2YSBzdWEgYmlvLi4uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBweC0zIHB5LTEuNSByb3VuZGVkLWxnIGdsYXNzLWlucHV0IHRleHQtc20gdGV4dC1mb3JlZ3JvdW5kIGJvcmRlciBib3JkZXItYm9yZGVyIHRleHQtY2VudGVyIG1kOnRleHQtbGVmdFwiXG4gICAgICAgICAgICAgICAgICAgICAgICBhdXRvRm9jdXNcbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlU2F2ZUJpb30gZGlzYWJsZWQ9e3NhdmluZ0Jpb30gY2xhc3NOYW1lPVwicC0xLjUgcm91bmRlZC1sZyBiZy1wcmltYXJ5IHRleHQtcHJpbWFyeS1mb3JlZ3JvdW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7c2F2aW5nQmlvID8gPExvYWRlcjIgY2xhc3NOYW1lPVwiaC00IHctNCBhbmltYXRlLXNwaW5cIiAvPiA6IDxDaGVjayBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz59XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBvbkNsaWNrPXsoKSA9PiB7IHNldEVkaXRpbmdCaW8oZmFsc2UpOyBzZXRCaW9UZXh0KHByb2ZpbGUuYmlvIHx8IFwiXCIpOyB9fSBjbGFzc05hbWU9XCJwLTEuNSByb3VuZGVkLWxnIGJnLW11dGVkIHRleHQtbXV0ZWQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFggY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPHBcbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2B0ZXh0LXhzIG1kOnRleHQtc20gJHtwcm9maWxlLmJpbyA/IFwidGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgOiBcInRleHQtbXV0ZWQtZm9yZWdyb3VuZC80MCBpdGFsaWNcIn0gJHtpc093blByb2ZpbGUgPyBcImN1cnNvci1wb2ludGVyIGhvdmVyOnRleHQtZm9yZWdyb3VuZCB0cmFuc2l0aW9uLWNvbG9yc1wiIDogXCJcIn1gfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGlzT3duUHJvZmlsZSAmJiBzZXRFZGl0aW5nQmlvKHRydWUpfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge3Byb2ZpbGUuYmlvIHx8IChpc093blByb2ZpbGUgPyBcIlRvcXVlIHBhcmEgYWRpY2lvbmFyIGJpb1wiIDogXCJTZW0gYmlvXCIpfVxuICAgICAgICAgICAgICAgICAgICAgIHtpc093blByb2ZpbGUgJiYgIWVkaXRpbmdCaW8gJiYgPFBlbmNpbCBjbGFzc05hbWU9XCJoLTIuNSB3LTIuNSBpbmxpbmUgbWwtMSBvcGFjaXR5LTQwXCIgLz59XG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICB7LyogU3RhdHMgcm93IC0gZGVza3RvcCBpbmxpbmUgKi99XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNCBtZDpnYXAtNiBqdXN0aWZ5LWNlbnRlciBtZDpqdXN0aWZ5LXN0YXJ0IG10LTRcIj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17bG9hZEZvbGxvd2Vyc0xpc3R9IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgaG92ZXI6b3BhY2l0eS04MCB0cmFuc2l0aW9uLW9wYWNpdHkgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtbGcgbWQ6dGV4dC14bCBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIHRhYnVsYXItbnVtcyBncm91cC1ob3Zlcjp0ZXh0LXByaW1hcnkgdHJhbnNpdGlvbi1jb2xvcnNcIj57Zm9sbG93ZXJzQ291bnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBtZDp0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBmb250LW1lZGl1bVwiPlNlZ3VpZG9yZXM8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1weCBoLTQgYmctYm9yZGVyXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17bG9hZEZvbGxvd2luZ0xpc3R9IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgaG92ZXI6b3BhY2l0eS04MCB0cmFuc2l0aW9uLW9wYWNpdHkgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtbGcgbWQ6dGV4dC14bCBmb250LWJvbGQgdGV4dC1mb3JlZ3JvdW5kIHRhYnVsYXItbnVtcyBncm91cC1ob3Zlcjp0ZXh0LXByaW1hcnkgdHJhbnNpdGlvbi1jb2xvcnNcIj57Zm9sbG93aW5nQ291bnR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBtZDp0ZXh0LXhzIHRleHQtbXV0ZWQtZm9yZWdyb3VuZCBmb250LW1lZGl1bVwiPlNlZ3VpbmRvPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctcHggaC00IGJnLWJvcmRlclwiIC8+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjVcIj5cbiAgICAgICAgICAgICAgICAgICAgPFRyZW5kaW5nVXAgY2xhc3NOYW1lPVwiaC0zLjUgdy0zLjUgdGV4dC1wcmltYXJ5XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1kaXNwbGF5IHRleHQtbGcgbWQ6dGV4dC14bCBmb250LWJvbGQgdGV4dC1wcmltYXJ5IHRhYnVsYXItbnVtc1wiPntyZWNhcmdhc0NvdW50fTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gbWQ6dGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmRcIj5yZWNhcmdhczwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgey8qIEFjdGlvbiBidXR0b25zIC0gZGVza3RvcDogcmlnaHQtYWxpZ25lZCByb3cgKi99XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC0zIG10LTUgbWQ6bXQtNiBtZDptYXgtdy1zbVwiPlxuICAgICAgICAgICAgICAgICAgeyFpc093blByb2ZpbGUgPyAoXG4gICAgICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICAgICAgPG1vdGlvbi5idXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlVGFwPXt7IHNjYWxlOiAwLjk1IH19XG4gICAgICAgICAgICAgICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHNjYWxlOiAxLjAyIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXtoYW5kbGVGb2xsb3d9XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17Zm9sbG93TG9hZGluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YGZsZXgtMSBweS0yLjUgbWQ6cHktMyByb3VuZGVkLXhsIGZvbnQtYm9sZCB0ZXh0LXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHRyYW5zaXRpb24tYWxsICR7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzRm9sbG93aW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcImdsYXNzLWNhcmQgdGV4dC1mb3JlZ3JvdW5kIGJvcmRlciBib3JkZXItYm9yZGVyIGhvdmVyOmJnLW11dGVkLzUwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiYmctcHJpbWFyeSB0ZXh0LXByaW1hcnktZm9yZWdyb3VuZCBob3ZlcjpvcGFjaXR5LTkwIHNoYWRvdy1sZyBzaGFkb3ctcHJpbWFyeS8yMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9YH1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICB7Zm9sbG93TG9hZGluZyA/IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPExvYWRlcjIgY2xhc3NOYW1lPVwiaC00IHctNCBhbmltYXRlLXNwaW5cIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgKSA6IGlzRm9sbG93aW5nID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8PjxVc2VyTWludXMgY2xhc3NOYW1lPVwiaC00IHctNFwiIC8+IFNlZ3VpbmRvPC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8PjxVc2VyUGx1cyBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz4gU2VndWlyPC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgIDwvbW90aW9uLmJ1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICA8bW90aW9uLmJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgc2NhbGU6IDEuMDIgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IG5hdmlnYXRlKFwiL2NoYXRcIil9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC01IHB5LTIuNSBtZDpweS0zIHJvdW5kZWQteGwgZ2xhc3MtY2FyZCB0ZXh0LWZvcmVncm91bmQgZm9udC1ib2xkIHRleHQtc20gZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgYm9yZGVyIGJvcmRlci1ib3JkZXIgaG92ZXI6YmctbXV0ZWQvNTAgdHJhbnNpdGlvbi1jb2xvcnNcIlxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxNZXNzYWdlQ2lyY2xlIGNsYXNzTmFtZT1cImgtNCB3LTRcIiAvPiBDaGF0XG4gICAgICAgICAgICAgICAgICAgICAgPC9tb3Rpb24uYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgIDxtb3Rpb24uYnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgd2hpbGVUYXA9e3sgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHNjYWxlOiAxLjAyIH19XG4gICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gbmF2aWdhdGUoXCIvcGFpbmVsXCIpfVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBweS0yLjUgbWQ6cHktMyByb3VuZGVkLXhsIGdsYXNzLWNhcmQgdGV4dC1mb3JlZ3JvdW5kIGZvbnQtYm9sZCB0ZXh0LXNtIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIGJvcmRlciBib3JkZXItYm9yZGVyIGhvdmVyOmJnLW11dGVkLzUwIHRyYW5zaXRpb24tY29sb3JzXCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIDxTZXR0aW5ncyBjbGFzc05hbWU9XCJoLTQgdy00XCIgLz4gRWRpdGFyIFBlcmZpbFxuICAgICAgICAgICAgICAgICAgICA8L21vdGlvbi5idXR0b24+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgey8qIEluZm8gY2FyZHMgLSBncmlkIG9uIGRlc2t0b3AgKi99XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC00IG1kOm10LTYgZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMiBnYXAtMyBtZDpnYXAtNFwiPlxuICAgICAgICAgICAgey8qIE1lbWJlciBzaW5jZSAqL31cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ2xhc3MtY2FyZCByb3VuZGVkLTJ4bCBwLTQgbWQ6cC01IGZsZXggaXRlbXMtY2VudGVyIGdhcC0zIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIGhvdmVyOmJvcmRlci1wcmltYXJ5LzIwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xMCBoLTEwIG1kOnctMTIgbWQ6aC0xMiByb3VuZGVkLXhsIGJnLXByaW1hcnkvMTUgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICA8Q2FsZW5kYXIgY2xhc3NOYW1lPVwiaC01IHctNSBtZDpoLTYgbWQ6dy02IHRleHQtcHJpbWFyeVwiIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCI+TWVtYnJvIGRlc2RlPC9wPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImZvbnQtc2VtaWJvbGQgdGV4dC1mb3JlZ3JvdW5kIHRleHQtc20gbWQ6dGV4dC1iYXNlXCI+e2Zvcm1hdERhdGVUaW1lQlIocHJvZmlsZS5jcmVhdGVkX2F0KX08L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsvKiBJbnRlZ3JhdGlvbnMgKi99XG4gICAgICAgICAgICB7KHByb2ZpbGUudGVsZWdyYW1fdXNlcm5hbWUgfHwgcHJvZmlsZS53aGF0c2FwcF9udW1iZXIpICYmIChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJnbGFzcy1jYXJkIHJvdW5kZWQtMnhsIHAtNCBtZDpwLTUgc3BhY2UteS0zIGJvcmRlciBib3JkZXItYm9yZGVyLzUwIGhvdmVyOmJvcmRlci1wcmltYXJ5LzIwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LW11dGVkLWZvcmVncm91bmQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIGZvbnQtc2VtaWJvbGRcIj5Db250YXRvPC9wPlxuICAgICAgICAgICAgICAgIHtwcm9maWxlLnRlbGVncmFtX3VzZXJuYW1lICYmIChcbiAgICAgICAgICAgICAgICAgIDxhXG4gICAgICAgICAgICAgICAgICAgIGhyZWY9e2BodHRwczovL3QubWUvJHtwcm9maWxlLnRlbGVncmFtX3VzZXJuYW1lfWB9XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldD1cIl9ibGFua1wiXG4gICAgICAgICAgICAgICAgICAgIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIlxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMyBob3ZlcjpiZy1tdXRlZC8zMCByb3VuZGVkLXhsIHAtMiAtbXgtMiB0cmFuc2l0aW9uLWNvbG9yc1wiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy04IGgtOCByb3VuZGVkLWxnIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCIgc3R5bGU9e3sgYmFja2dyb3VuZDogXCJsaW5lYXItZ3JhZGllbnQoMTM1ZGVnLCAjMDA4OGNjLCAjMDA3N2I1KVwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgIDxTZW5kIGNsYXNzTmFtZT1cImgtNCB3LTQgdGV4dC13aGl0ZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXNtIHRleHQtZm9yZWdyb3VuZFwiPkB7cHJvZmlsZS50ZWxlZ3JhbV91c2VybmFtZX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICB7cHJvZmlsZS53aGF0c2FwcF9udW1iZXIgJiYgKFxuICAgICAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICAgICAgaHJlZj17YGh0dHBzOi8vd2EubWUvJHtwcm9maWxlLndoYXRzYXBwX251bWJlci5yZXBsYWNlKC9cXEQvZywgXCJcIil9YH1cbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIGhvdmVyOmJnLW11dGVkLzMwIHJvdW5kZWQteGwgcC0yIC1teC0yIHRyYW5zaXRpb24tY29sb3JzXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTggaC04IHJvdW5kZWQtbGcgYmctc3VjY2Vzcy8yMCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxTbWFydHBob25lIGNsYXNzTmFtZT1cImgtNCB3LTQgdGV4dC1zdWNjZXNzXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtc20gdGV4dC1mb3JlZ3JvdW5kXCI+e3Byb2ZpbGUud2hhdHNhcHBfbnVtYmVyfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICl9XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG5cbiAgICAgIHsvKiBGb2xsb3dlcnMvRm9sbG93aW5nIE1vZGFsICovfVxuICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAgeyhzaG93Rm9sbG93ZXJzIHx8IHNob3dGb2xsb3dpbmcpICYmIChcbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX1cbiAgICAgICAgICAgIGV4aXQ9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiZml4ZWQgaW5zZXQtMCB6LTUwIGJnLWJsYWNrLzYwIGJhY2tkcm9wLWJsdXItc20gZmxleCBpdGVtcy1lbmQgc206aXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCJcbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHsgc2V0U2hvd0ZvbGxvd2VycyhmYWxzZSk7IHNldFNob3dGb2xsb3dpbmcoZmFsc2UpOyB9fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgeTogMTAwLCBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgeTogMCwgb3BhY2l0eTogMSB9fVxuICAgICAgICAgICAgICBleGl0PXt7IHk6IDEwMCwgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICBvbkNsaWNrPXsoZSkgPT4gZS5zdG9wUHJvcGFnYXRpb24oKX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIG1heC13LW1kIG1heC1oLVs3MHZoXSBiZy1iYWNrZ3JvdW5kIHJvdW5kZWQtdC0yeGwgc206cm91bmRlZC0yeGwgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gcC00IGJvcmRlci1iIGJvcmRlci1ib3JkZXJcIj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtZm9yZWdyb3VuZFwiPlxuICAgICAgICAgICAgICAgICAge3Nob3dGb2xsb3dlcnMgPyBcIlNlZ3VpZG9yZXNcIiA6IFwiU2VndWluZG9cIn1cbiAgICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICAgIDxidXR0b24gb25DbGljaz17KCkgPT4geyBzZXRTaG93Rm9sbG93ZXJzKGZhbHNlKTsgc2V0U2hvd0ZvbGxvd2luZyhmYWxzZSk7IH19IGNsYXNzTmFtZT1cInAtMS41IHJvdW5kZWQtbGcgaG92ZXI6YmctbXV0ZWQvNTBcIj5cbiAgICAgICAgICAgICAgICAgIDxYIGNsYXNzTmFtZT1cImgtNSB3LTUgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kXCIgLz5cbiAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwib3ZlcmZsb3cteS1hdXRvIG1heC1oLVs1NXZoXSBwLTJcIj5cbiAgICAgICAgICAgICAgICB7bGlzdExvYWRpbmcgPyAoXG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1jZW50ZXIgcC04XCI+PExvYWRlcjIgY2xhc3NOYW1lPVwiaC02IHctNiB0ZXh0LXByaW1hcnkgYW5pbWF0ZS1zcGluXCIgLz48L2Rpdj5cbiAgICAgICAgICAgICAgICApIDogKHNob3dGb2xsb3dlcnMgPyBmb2xsb3dlcnNMaXN0IDogZm9sbG93aW5nTGlzdCkubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgdGV4dC1tdXRlZC1mb3JlZ3JvdW5kIHRleHQtc20gcHktOFwiPk5lbmh1bSB1c3XDoXJpbyBlbmNvbnRyYWRvPC9wPlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAoc2hvd0ZvbGxvd2VycyA/IGZvbGxvd2Vyc0xpc3QgOiBmb2xsb3dpbmdMaXN0KS5tYXAoKHUpID0+IChcbiAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgIGtleT17dS5pZH1cbiAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7IHNldFNob3dGb2xsb3dlcnMoZmFsc2UpOyBzZXRTaG93Rm9sbG93aW5nKGZhbHNlKTsgbmF2aWdhdGUoYC9wZXJmaWwvJHt1LmlkfWApOyB9fVxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zIHctZnVsbCBwLTMgcm91bmRlZC14bCBob3ZlcjpiZy1tdXRlZC8zMCB0cmFuc2l0aW9uLWNvbG9yc1wiXG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7dS5hdmF0YXJfdXJsID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9e3UuYXZhdGFyX3VybH0gYWx0PVwiXCIgY2xhc3NOYW1lPVwidy0xMCBoLTEwIHJvdW5kZWQtZnVsbCBvYmplY3QtY292ZXJcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTAgaC0xMCByb3VuZGVkLWZ1bGwgYmctcHJpbWFyeS8yMCB0ZXh0LXByaW1hcnkgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHsodS5ub21lIHx8IFwiVVwiKVswXT8udG9VcHBlckNhc2UoKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZm9udC1zZW1pYm9sZCB0ZXh0LWZvcmVncm91bmQgdGV4dC1zbVwiPnt1Lm5vbWUgfHwgXCJVc3XDoXJpb1wifTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgKX1cbiAgICAgIDwvQW5pbWF0ZVByZXNlbmNlPlxuICAgIDwvQW5pbWF0ZWRQYWdlPlxuICApO1xufVxuIl0sIm5hbWVzIjpbInVzZUVmZmVjdCIsInVzZVN0YXRlIiwidXNlQ2FsbGJhY2siLCJ1c2VQYXJhbXMiLCJ1c2VOYXZpZ2F0ZSIsInN1cGFiYXNlIiwidXNlQXV0aCIsIm1vdGlvbiIsIkFuaW1hdGVQcmVzZW5jZSIsIlZlcmlmaWNhdGlvbkJhZGdlIiwiQW5pbWF0ZWRQYWdlIiwiVGhlbWVUb2dnbGUiLCJBcnJvd0xlZnQiLCJVc2VyUGx1cyIsIlVzZXJNaW51cyIsIkxvYWRlcjIiLCJTbWFydHBob25lIiwiVHJlbmRpbmdVcCIsIkNhbGVuZGFyIiwiU2VuZCIsIk1lc3NhZ2VDaXJjbGUiLCJTZXR0aW5ncyIsIlBlbmNpbCIsIlgiLCJDaGVjayIsInN0eWxlZFRvYXN0IiwidG9hc3QiLCJmb3JtYXREYXRlVGltZUJSIiwiVXNlclByb2ZpbGUiLCJ1c2VySWQiLCJ1c2VyIiwibmF2aWdhdGUiLCJwcm9maWxlIiwic2V0UHJvZmlsZSIsImxvYWRpbmciLCJzZXRMb2FkaW5nIiwiZm9sbG93ZXJzQ291bnQiLCJzZXRGb2xsb3dlcnNDb3VudCIsImZvbGxvd2luZ0NvdW50Iiwic2V0Rm9sbG93aW5nQ291bnQiLCJyZWNhcmdhc0NvdW50Iiwic2V0UmVjYXJnYXNDb3VudCIsInByb2ZpbGVSb2xlIiwic2V0UHJvZmlsZVJvbGUiLCJpc0ZvbGxvd2luZyIsInNldElzRm9sbG93aW5nIiwiZm9sbG93TG9hZGluZyIsInNldEZvbGxvd0xvYWRpbmciLCJhdmF0YXJFcnJvciIsInNldEF2YXRhckVycm9yIiwiaXNPd25Qcm9maWxlIiwiaWQiLCJlZGl0aW5nQmlvIiwic2V0RWRpdGluZ0JpbyIsImJpb1RleHQiLCJzZXRCaW9UZXh0Iiwic2F2aW5nQmlvIiwic2V0U2F2aW5nQmlvIiwic2hvd0ZvbGxvd2VycyIsInNldFNob3dGb2xsb3dlcnMiLCJzaG93Rm9sbG93aW5nIiwic2V0U2hvd0ZvbGxvd2luZyIsImZvbGxvd2Vyc0xpc3QiLCJzZXRGb2xsb3dlcnNMaXN0IiwiZm9sbG93aW5nTGlzdCIsInNldEZvbGxvd2luZ0xpc3QiLCJsaXN0TG9hZGluZyIsInNldExpc3RMb2FkaW5nIiwibG9hZFByb2ZpbGUiLCJkYXRhIiwicHJvZmlsZURhdGEiLCJjb3VudHMiLCJyZWNhcmdhUmVzdWx0IiwiZm9sbG93RGF0YSIsInJvbGVEYXRhIiwiUHJvbWlzZSIsImFsbCIsImZyb20iLCJzZWxlY3QiLCJlcSIsInNpbmdsZSIsInJwYyIsIl91c2VyX2lkIiwiY291bnQiLCJoZWFkIiwibWF5YmVTaW5nbGUiLCJyZXNvbHZlIiwiX3JvbGUiLCJiaW8iLCJBcnJheSIsImlzQXJyYXkiLCJsZW5ndGgiLCJOdW1iZXIiLCJmb2xsb3dlcnNfY291bnQiLCJmb2xsb3dpbmdfY291bnQiLCJlIiwiY29uc29sZSIsImVycm9yIiwiaGFuZGxlRm9sbG93IiwiZGVsZXRlIiwiYyIsIk1hdGgiLCJtYXgiLCJzdWNjZXNzIiwiaW5zZXJ0IiwiZm9sbG93ZXJfaWQiLCJmb2xsb3dpbmdfaWQiLCJoYW5kbGVTYXZlQmlvIiwidXBkYXRlIiwidHJpbSIsInAiLCJsb2FkRm9sbG93ZXJzTGlzdCIsImlkcyIsIm1hcCIsImQiLCJwcm9maWxlcyIsImluIiwibG9hZEZvbGxvd2luZ0xpc3QiLCJ1c2VySW5pdGlhbCIsIm5vbWUiLCJlbWFpbCIsInRvVXBwZXJDYXNlIiwiZGl2IiwiY2xhc3NOYW1lIiwiYnV0dG9uIiwib25DbGljayIsImF2YXRhcl91cmwiLCJpbWciLCJzcmMiLCJhbHQiLCJyZWZlcnJlclBvbGljeSIsImNyb3NzT3JpZ2luIiwib25FcnJvciIsImgxIiwidmVyaWZpY2F0aW9uX2JhZGdlIiwiYmFkZ2UiLCJzaXplIiwiaW5wdXQiLCJ2YWx1ZSIsIm9uQ2hhbmdlIiwidGFyZ2V0IiwibWF4TGVuZ3RoIiwicGxhY2Vob2xkZXIiLCJhdXRvRm9jdXMiLCJkaXNhYmxlZCIsInNwYW4iLCJ3aGlsZVRhcCIsInNjYWxlIiwid2hpbGVIb3ZlciIsImNyZWF0ZWRfYXQiLCJ0ZWxlZ3JhbV91c2VybmFtZSIsIndoYXRzYXBwX251bWJlciIsImEiLCJocmVmIiwicmVsIiwic3R5bGUiLCJiYWNrZ3JvdW5kIiwicmVwbGFjZSIsImluaXRpYWwiLCJvcGFjaXR5IiwiYW5pbWF0ZSIsImV4aXQiLCJ5Iiwic3RvcFByb3BhZ2F0aW9uIiwiaDMiLCJ1Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxTQUFTQSxTQUFTLEVBQUVDLFFBQVEsRUFBRUMsV0FBVyxRQUFRLFFBQVE7QUFDekQsU0FBU0MsU0FBUyxFQUFFQyxXQUFXLFFBQVEsbUJBQW1CO0FBQzFELFNBQVNDLFFBQVEsUUFBUSxpQ0FBaUM7QUFDMUQsU0FBU0MsT0FBTyxRQUFRLGtCQUFrQjtBQUMxQyxTQUFTQyxNQUFNLEVBQUVDLGVBQWUsUUFBUSxnQkFBZ0I7QUFDeEQsU0FBU0MsaUJBQWlCLFFBQW1CLGlDQUFpQztBQUM5RSxTQUFTQyxZQUFZLFFBQVEsNEJBQTRCO0FBQ3pELFNBQVNDLFdBQVcsUUFBUSwyQkFBMkI7QUFDdkQsU0FDRUMsU0FBUyxFQUFFQyxRQUFRLEVBQUVDLFNBQVMsRUFBRUMsT0FBTyxFQUFVQyxVQUFVLEVBQzNEQyxVQUFVLEVBQUVDLFFBQVEsRUFBRUMsSUFBSSxFQUFFQyxhQUFhLEVBQUVDLFFBQVEsRUFDbkRDLE1BQU0sRUFBUUMsQ0FBQyxFQUFFQyxLQUFLLFFBQ2pCLGVBQWU7QUFDdEIsU0FBU0MsZUFBZUMsS0FBSyxRQUFRLGNBQWM7QUFDbkQsU0FBU0MsZ0JBQWdCLFFBQVEsaUJBQWlCO0FBZWxELGVBQWUsU0FBU0M7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