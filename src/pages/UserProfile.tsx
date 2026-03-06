import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { AnimatedPage } from "@/components/AnimatedPage";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  ArrowLeft, UserPlus, UserMinus, Loader2, Shield, Smartphone,
  TrendingUp, Calendar, Send, MessageCircle, Settings, Camera,
  Pencil, Save, X, Check,
} from "lucide-react";
import { styledToast as toast } from "@/lib/toast";
import { formatDateTimeBR } from "@/lib/timezone";

interface ProfileData {
  id: string;
  nome: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  verification_badge: string | null;
  created_at: string;
  telegram_username: string | null;
  whatsapp_number: string | null;
  active: boolean;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [recargasCount, setRecargasCount] = useState(0);
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
  const [followersList, setFollowersList] = useState<{ id: string; nome: string | null; avatar_url: string | null }[]>([]);
  const [followingList, setFollowingList] = useState<{ id: string; nome: string | null; avatar_url: string | null }[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [{ data: profileData }, { data: counts }, { data: recargaData }, { data: followData }] = await Promise.all([
        supabase.from("profiles").select("id, nome, email, avatar_url, bio, verification_badge, created_at, telegram_username, whatsapp_number, active").eq("id", userId).single(),
        supabase.rpc("get_follow_counts", { _user_id: userId }),
        supabase.from("recargas").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "completed"),
        user?.id && user.id !== userId
          ? supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", userId).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      if (profileData) {
        setProfile(profileData as any);
        setBioText((profileData as any).bio || "");
      }
      if (counts && Array.isArray(counts) && counts.length > 0) {
        setFollowersCount(Number(counts[0].followers_count) || 0);
        setFollowingCount(Number(counts[0].following_count) || 0);
      }
      setRecargasCount(recargaData ? 0 : 0);
      // Use count from head query
      setRecargasCount(Number((recargaData as any)?.length) || 0);
      setIsFollowing(!!followData);
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  }, [userId, user?.id]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleFollow = async () => {
    if (!user || !userId || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", userId);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
        toast.success("Deixou de seguir");
      } else {
        await supabase.from("follows").insert({ follower_id: user.id, following_id: userId } as any);
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

  const loadFollowersList = async () => {
    setListLoading(true);
    setShowFollowers(true);
    try {
      const { data } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId!);
      if (data && data.length > 0) {
        const ids = data.map((d: any) => d.follower_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nome, avatar_url")
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
        .eq("follower_id", userId!);
      if (data && data.length > 0) {
        const ids = data.map((d: any) => d.following_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nome, avatar_url")
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
        <div className="max-w-lg mx-auto flex items-center justify-between px-4 h-12">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <p className="font-display font-bold text-foreground text-sm truncate max-w-[200px]">
            {profile.nome || "Perfil"}
          </p>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-lg mx-auto pb-20">
        {/* Cover gradient */}
        <div className="h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent relative" />

        {/* Avatar centered - overlapping cover */}
        <div className="flex flex-col items-center -mt-14 relative z-10">
          <div className="relative">
            {profile.avatar_url && !avatarError ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-28 h-28 rounded-full object-cover ring-4 ring-background shadow-xl"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-4xl ring-4 ring-background shadow-xl">
                {userInitial}
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-success rounded-full ring-3 ring-background" />
          </div>

          {/* Name + badge */}
          <div className="flex items-center gap-1.5 mt-3">
            <h1 className="font-display text-xl font-bold text-foreground uppercase">
              {profile.nome || "Usuário"}
            </h1>
            <VerificationBadge badge={profile.verification_badge as BadgeType} size="md" />
          </div>

          {/* Bio */}
          <div className="mt-1 px-6 text-center">
            {editingBio ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  maxLength={160}
                  placeholder="Escreva sua bio..."
                  className="flex-1 px-3 py-1.5 rounded-lg glass-input text-sm text-foreground border border-border text-center"
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
                className={`text-sm ${profile.bio ? "text-muted-foreground" : "text-muted-foreground/50 italic"} ${isOwnProfile ? "cursor-pointer hover:text-foreground transition-colors" : ""}`}
                onClick={() => isOwnProfile && setEditingBio(true)}
              >
                {profile.bio || (isOwnProfile ? "Toque para adicionar bio" : "Sem bio")}
                {isOwnProfile && !editingBio && <Pencil className="h-3 w-3 inline ml-1 opacity-50" />}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-8 mt-5">
            <button onClick={loadFollowersList} className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <span className="font-display text-xl font-bold text-foreground">{followersCount}</span>
              <span className="text-xs text-muted-foreground">Seguidores</span>
            </button>
            <div className="flex flex-col items-center">
              <span className="font-display text-xl font-bold text-foreground">{recargasCount}</span>
              <span className="text-xs text-muted-foreground">Recargas</span>
            </div>
            <button onClick={loadFollowingList} className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <span className="font-display text-xl font-bold text-foreground">{followingCount}</span>
              <span className="text-xs text-muted-foreground">Seguindo</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-5 px-6 w-full">
            {!isOwnProfile ? (
              <>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isFollowing
                      ? "glass-card text-foreground border border-border hover:bg-muted/50"
                      : "bg-primary text-primary-foreground hover:opacity-90"
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
                  onClick={() => navigate("/chat")}
                  className="px-5 py-2.5 rounded-xl glass-card text-foreground font-bold text-sm flex items-center gap-2 border border-border hover:bg-muted/50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Chat
                </motion.button>
              </>
            ) : (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/painel")}
                className="flex-1 py-2.5 rounded-xl glass-card text-foreground font-bold text-sm flex items-center justify-center gap-2 border border-border hover:bg-muted/50 transition-colors"
              >
                <Settings className="h-4 w-4" /> Editar Perfil
              </motion.button>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div className="px-4 mt-6 space-y-3">
          {/* Member since */}
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Membro desde</p>
              <p className="font-semibold text-foreground text-sm">{formatDateTimeBR(profile.created_at)}</p>
            </div>
          </div>

          {/* Integrations */}
          {(profile.telegram_username || profile.whatsapp_number) && (
            <div className="glass-card rounded-2xl p-4 space-y-3">
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
                      onClick={() => { setShowFollowers(false); setShowFollowing(false); navigate(`/perfil/${u.id}`); }}
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
