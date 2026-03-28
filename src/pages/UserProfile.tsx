import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserPresence } from "@/hooks/usePresence";

const AVAILABLE_ROLES = [
  { value: "admin", label: "Admin", color: "text-red-400", bg: "bg-red-500/15" },
  { value: "revendedor", label: "Revendedor", color: "text-blue-400", bg: "bg-blue-500/15" },
  { value: "suporte", label: "Suporte", color: "text-amber-400", bg: "bg-amber-500/15" },
  { value: "cliente", label: "Cliente", color: "text-emerald-400", bg: "bg-emerald-500/15" },
  { value: "usuario", label: "Usuário", color: "text-muted-foreground", bg: "bg-muted" },
] as const;
import { motion, AnimatePresence } from "framer-motion";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { AnimatedPage } from "@/components/AnimatedPage";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowLeft, UserPlus, UserMinus, Loader2, Shield, Smartphone,
  TrendingUp, Calendar, Send, MessageCircle, Settings, Camera,
  Pencil, Save, X, Check, ChevronDown,
} from "lucide-react";
import { styledToast as toast } from "@/lib/toast";
import { formatDateTimeBR } from "@/lib/timezone";

interface ProfileData {
  id: string;
  nome: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  slug: string | null;
  verification_badge: string | null;
  created_at: string;
  telegram_username: string | null;
  whatsapp_number: string | null;
  active: boolean;
}

// Helper to detect UUID format
const isUUID = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

function formatLastSeen(isoDate: string): string {
  const now = new Date();
  const seen = new Date(isoDate);
  const diffMs = now.getTime() - seen.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `Ativo há ${diffMin}min`;
  if (diffH < 24) {
    const remainMin = diffMin % 60;
    return remainMin > 0 ? `Ativo há ${diffH}h ${remainMin}min` : `Ativo há ${diffH}h`;
  }
  if (diffD === 1) return "Visto ontem";
  if (diffD < 7) return `Visto há ${diffD} dias`;
  return `Visto em ${seen.toLocaleDateString("pt-BR")}`;
}

export default function UserProfile() {
  const { userId: paramId } = useParams<{ userId: string }>();
  const { user, role: myRole } = useAuth();
  const navigate = useNavigate();

  const [resolvedId, setResolvedId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [recargasCount, setRecargasCount] = useState(0);
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const { isOnline: presenceOnline, lastSeen } = useUserPresence(resolvedId ?? undefined);
  const [avatarError, setAvatarError] = useState(false);

  // Edit mode (only for own profile)
  const isOwnProfile = user?.id === resolvedId;
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Follower list modal
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<{ id: string; nome: string | null; avatar_url: string | null; slug: string | null }[]>([]);
  const [followingList, setFollowingList] = useState<{ id: string; nome: string | null; avatar_url: string | null; slug: string | null }[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // Resolve slug → UUID
  useEffect(() => {
    if (!paramId) return;
    if (isUUID(paramId)) {
      setResolvedId(paramId);
    } else {
      // It's a slug, resolve to UUID
      supabase.from("profiles_public").select("id").eq("slug", paramId).maybeSingle().then(({ data }) => {
        if (data?.id) {
          setResolvedId(data.id);
        } else {
          setResolvedId(null);
          setLoading(false);
        }
      });
    }
  }, [paramId]);

  const loadProfile = useCallback(async () => {
    if (!resolvedId) return;
    setLoading(true);
    try {
      const [{ data: profileData }, { data: counts }, recargaResult, { data: followData }, { data: roleRows }] = await Promise.all([
        supabase.from("profiles_public").select("id, nome, avatar_url, bio, slug, verification_badge, created_at, active").eq("id", resolvedId).single(),
        supabase.rpc("get_follow_counts", { _user_id: resolvedId }),
        supabase.rpc("get_user_recargas_count" as any, { _user_id: resolvedId }),
        user?.id && user.id !== resolvedId
          ? supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", resolvedId).maybeSingle()
          : Promise.resolve({ data: null }),
        supabase.from("user_roles").select("role").eq("user_id", resolvedId),
      ]);

      if (profileData) {
        setProfile(profileData as any);
        setBioText((profileData as any).bio || "");
        if ((profileData as any).slug && paramId && isUUID(paramId)) {
          navigate(`/perfil/${(profileData as any).slug}`, { replace: true });
        }
      }
      if (counts && Array.isArray(counts) && counts.length > 0) {
        setFollowersCount(Number(counts[0].followers_count) || 0);
        setFollowingCount(Number(counts[0].following_count) || 0);
      }
      setRecargasCount(Number(recargaResult.data) || 0);
      setIsFollowing(!!followData);
      // Resolve role with priority
      const roles = (roleRows as any[] || []).map((r: any) => r.role);
      const priority = ["admin", "revendedor", "suporte", "cliente", "usuario"];
      const topRole = priority.find(r => roles.includes(r)) || "usuario";
      setProfileRole(topRole);
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  }, [resolvedId, user?.id, paramId, navigate]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleFollow = async () => {
    if (!user || !resolvedId || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", resolvedId);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
        toast.success("Deixou de seguir");
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: resolvedId } as any);
        setIsFollowing(true);
        setFollowersCount((c) => c + 1);
        toast.success("Seguindo!");
      }
    } catch {
      toast.error("Erro ao atualizar");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveBio = async () => {
    if (!user) return;
    setSavingBio(true);
    try {
      await supabase.from("profiles").update({ bio: bioText.trim() } as any).eq("id", user.id);
      setProfile((p) => p ? { ...p, bio: bioText.trim() } : p);
      setEditingBio(false);
      toast.success("Bio atualizada!");
    } catch {
      toast.error("Erro ao salvar bio");
    } finally {
      setSavingBio(false);
    }
  };

  const handleChangeRole = async (newRole: string) => {
    if (!resolvedId || changingRole || newRole === profileRole) return;
    setChangingRole(true);
    setShowRoleDropdown(false);
    try {
      // Remove old role first, then add new
      if (profileRole && profileRole !== "usuario") {
        await supabase.functions.invoke("admin-toggle-role", {
          body: { user_id: resolvedId, role: profileRole, action: "remove" },
        });
      }
      if (newRole !== "usuario") {
        const res = await supabase.functions.invoke("admin-toggle-role", {
          body: { user_id: resolvedId, role: newRole, action: "add" },
        });
        if (res.error) throw new Error(res.error.message);
        const data = res.data as any;
        if (data?.error) throw new Error(data.error);
      }
      setProfileRole(newRole);
      toast.success(`Cargo alterado para ${AVAILABLE_ROLES.find(r => r.value === newRole)?.label || newRole}`);
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar cargo");
    } finally {
      setChangingRole(false);
    }
  };

  const loadFollowersList = async () => {
    setListLoading(true);
    setShowFollowers(true);
    try {
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", resolvedId!);
      if (data && data.length > 0) {
        const ids = data.map((d: any) => d.follower_id);
        const { data: profiles } = await supabase
          .from("profiles_public")
          .select("id, nome, avatar_url, slug")
          .in("id", ids);
        setFollowersList((profiles as any) || []);
      } else {
        setFollowersList([]);
      }
    } catch { setFollowersList([]); }
    finally { setListLoading(false); }
  };

  const loadFollowingList = async () => {
    setListLoading(true);
    setShowFollowing(true);
    try {
      const { data } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", resolvedId!);
      if (data && data.length > 0) {
        const ids = data.map((d: any) => d.following_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nome, avatar_url, slug")
          .in("id", ids);
        setFollowingList((profiles as any) || []);
      } else {
        setFollowingList([]);
      }
    } catch { setFollowingList([]); }
    finally { setListLoading(false); }
  };

  const userInitial = (profile?.nome || profile?.email || "U")[0]?.toUpperCase() || "U";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Perfil não encontrado</p>
        <button onClick={() => navigate(-1)} className="text-primary font-semibold">Voltar</button>
      </div>
    );
  }

  return (
    <AnimatedPage className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <p className="font-display font-bold text-foreground text-sm truncate max-w-[200px]">
            {profile.nome || "Perfil"}
          </p>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto pb-20">
        {/* Cover gradient - taller on desktop */}
        <div className="h-32 md:h-44 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>

        {/* Desktop: horizontal card layout */}
        <div className="relative -mt-16 md:-mt-20 z-10 px-4 md:px-6">
          {/* Main profile card */}
          <div className="glass-card rounded-2xl md:rounded-3xl p-5 md:p-8 border border-border/50">
            {/* Top row: Avatar + Info + Actions (side by side on desktop) */}
            <div className="flex flex-col md:flex-row md:items-start md:gap-8">
              {/* Avatar */}
              <div className="relative flex-shrink-0 mx-auto md:mx-0">
                {profile.avatar_url && !avatarError ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-[104px] h-[104px] md:w-[130px] md:h-[130px] rounded-full object-cover ring-[3px] ring-background shadow-2xl"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-[104px] h-[104px] md:w-[130px] md:h-[130px] rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-3xl md:text-4xl ring-[3px] ring-background shadow-2xl">
                    {userInitial}
                  </div>
                )}
                {/* Online/Last seen indicator */}
                {presenceOnline ? (
                  <div className="absolute -bottom-1 -right-1 md:bottom-1 md:right-1 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full pl-1 pr-2 py-0.5 ring-1 ring-border/30">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">Online</span>
                  </div>
                ) : lastSeen ? (
                  <div className="absolute -bottom-1 -right-1 md:bottom-1 md:right-1 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full pl-1 pr-2 py-0.5 ring-1 ring-border/30">
                    <span className="inline-flex rounded-full h-2.5 w-2.5 bg-muted-foreground/40" />
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">{formatLastSeen(lastSeen)}</span>
                  </div>
                ) : null}
              </div>

              {/* Info column */}
              <div className="flex-1 mt-4 md:mt-1 text-center md:text-left">
                {/* Name + badge */}
                <div className="flex items-center gap-1.5 justify-center md:justify-start">
                  <h1 className={`font-display text-xl md:text-2xl font-bold uppercase ${profileRole === "admin" || profile.verification_badge ? "shimmer-letters" : "text-foreground"}`}>
                    {profile.nome || "Usuário"}
                  </h1>
                  <VerificationBadge badge={profile.verification_badge as BadgeType} size="md" />
                </div>

                {/* Role badge / selector (admin only) */}
                {profileRole && (
                  <div className="relative flex justify-center md:justify-start mt-1.5">
                    {myRole === "admin" && !isOwnProfile ? (
                      <button
                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                        disabled={changingRole}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-border/50 hover:border-primary/30 transition-all ${AVAILABLE_ROLES.find(r => r.value === profileRole)?.bg || "bg-muted"} ${AVAILABLE_ROLES.find(r => r.value === profileRole)?.color || "text-muted-foreground"}`}
                      >
                        {changingRole ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
                        {AVAILABLE_ROLES.find(r => r.value === profileRole)?.label || profileRole}
                        <ChevronDown className={`h-3 w-3 transition-transform ${showRoleDropdown ? "rotate-180" : ""}`} />
                      </button>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${AVAILABLE_ROLES.find(r => r.value === profileRole)?.bg || "bg-muted"} ${AVAILABLE_ROLES.find(r => r.value === profileRole)?.color || "text-muted-foreground"}`}>
                        <Shield className="h-3 w-3" />
                        {AVAILABLE_ROLES.find(r => r.value === profileRole)?.label || profileRole}
                      </span>
                    )}
                    {/* Dropdown */}
                    <AnimatePresence>
                      {showRoleDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: -8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -8, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full mt-1 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[160px]"
                          >
                            {AVAILABLE_ROLES.map((r) => (
                              <button
                                key={r.value}
                                onClick={() => handleChangeRole(r.value)}
                                className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted/50 ${profileRole === r.value ? "bg-primary/10 text-primary" : "text-foreground"}`}
                              >
                                <Shield className={`h-3.5 w-3.5 ${r.color}`} />
                                {r.label}
                                {profileRole === r.value && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                {/* Bio */}
                <div className="mt-1.5 md:mt-2 md:max-w-md">
                  {editingBio ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        maxLength={160}
                        placeholder="Escreva sua bio..."
                        className="flex-1 px-3 py-1.5 rounded-lg glass-input text-sm text-foreground border border-border text-center md:text-left"
                        autoFocus
                      />
                      <button onClick={handleSaveBio} disabled={savingBio} className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                        {savingBio ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </button>
                      <button onClick={() => { setEditingBio(false); setBioText(profile.bio || ""); }} className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <p
                      className={`text-xs md:text-sm ${profile.bio ? "text-muted-foreground" : "text-muted-foreground/40 italic"} ${isOwnProfile ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                      onClick={() => isOwnProfile && setEditingBio(true)}
                    >
                      {profile.bio || (isOwnProfile ? "Toque para adicionar bio" : "Sem bio")}
                      {isOwnProfile && !editingBio && <Pencil className="h-2.5 w-2.5 inline ml-1 opacity-40" />}
                    </p>
                  )}
                </div>

                {/* Stats row - desktop inline */}
                <div className="flex items-center gap-4 md:gap-6 justify-center md:justify-start mt-4">
                  <button onClick={loadFollowersList} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity group">
                    <span className="font-display text-lg md:text-xl font-bold text-foreground tabular-nums group-hover:text-primary transition-colors">{followersCount}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground font-medium">Seguidores</span>
                  </button>
                  <div className="w-px h-4 bg-border" />
                  <button onClick={loadFollowingList} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity group">
                    <span className="font-display text-lg md:text-xl font-bold text-foreground tabular-nums group-hover:text-primary transition-colors">{followingCount}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground font-medium">Seguindo</span>
                  </button>
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-primary" />
                    <span className="font-display text-lg md:text-xl font-bold text-primary tabular-nums">{recargasCount}</span>
                    <span className="text-[10px] md:text-xs text-muted-foreground">recargas</span>
                  </div>
                </div>

                {/* Action buttons - desktop: right-aligned row */}
                <div className="flex gap-3 mt-5 md:mt-6 md:max-w-sm">
                  {!isOwnProfile ? (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`flex-1 py-2.5 md:py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                          isFollowing
                            ? "glass-card text-foreground border border-border hover:bg-muted/50"
                            : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                        }`}
                      >
                        {followLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isFollowing ? (
                          <><UserMinus className="h-4 w-4" /> Seguindo</>
                        ) : (
                          <><UserPlus className="h-4 w-4" /> Seguir</>
                        )}
                      </motion.button>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => navigate("/chat")}
                        className="px-5 py-2.5 md:py-3 rounded-xl glass-card text-foreground font-bold text-sm flex items-center gap-2 border border-border hover:bg-muted/50 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" /> Chat
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => navigate("/painel")}
                      className="flex-1 py-2.5 md:py-3 rounded-xl glass-card text-foreground font-bold text-sm flex items-center justify-center gap-2 border border-border hover:bg-muted/50 transition-colors"
                    >
                      <Settings className="h-4 w-4" /> Editar Perfil
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info cards - grid on desktop */}
          <div className="mt-4 md:mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {/* Member since */}
            <div className="glass-card rounded-2xl p-4 md:p-5 flex items-center gap-3 border border-border/50 hover:border-primary/20 transition-colors">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/15 flex items-center justify-center">
                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Membro desde</p>
                <p className="font-semibold text-foreground text-sm md:text-base">{formatDateTimeBR(profile.created_at)}</p>
              </div>
            </div>

            {/* Integrations */}
            {(profile.telegram_username || profile.whatsapp_number) && (
              <div className="glass-card rounded-2xl p-4 md:p-5 space-y-3 border border-border/50 hover:border-primary/20 transition-colors">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Contato</p>
                {profile.telegram_username && (
                  <a
                    href={`https://t.me/${profile.telegram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:bg-muted/30 rounded-xl p-2 -mx-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0088cc, #0077b5)" }}>
                      <Send className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm text-foreground">@{profile.telegram_username}</span>
                  </a>
                )}
                {profile.whatsapp_number && (
                  <a
                    href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 hover:bg-muted/30 rounded-xl p-2 -mx-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{profile.whatsapp_number}</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Followers/Following Modal */}
      <AnimatePresence>
        {(showFollowers || showFollowing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => { setShowFollowers(false); setShowFollowing(false); }}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[70vh] bg-background rounded-t-2xl sm:rounded-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-bold text-foreground">
                  {showFollowers ? "Seguidores" : "Seguindo"}
                </h3>
                <button onClick={() => { setShowFollowers(false); setShowFollowing(false); }} className="p-1.5 rounded-lg hover:bg-muted/50">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[55vh] p-2">
                {listLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
                ) : (showFollowers ? followersList : followingList).length === 0 ? (
                  <p className="text-center text-muted-foreground text-sm py-8">Nenhum usuário encontrado</p>
                ) : (
                  (showFollowers ? followersList : followingList).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setShowFollowers(false); setShowFollowing(false); navigate(`/perfil/${u.slug || u.id}`); }}
                      className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-muted/30 transition-colors"
                    >
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                          {(u.nome || "U")[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="font-semibold text-foreground text-sm">{u.nome || "Usuário"}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
