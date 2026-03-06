import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge, BadgeType } from "@/components/VerificationBadge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, History, Send, Landmark, Smartphone, Shield, Activity,
  CheckCircle2, Loader2, Camera, Pencil, Calendar,
  X, Check, ChevronDown, ChevronUp, Lock, LogOut,
} from "lucide-react";
import { styledToast as toast } from "@/lib/toast";
import type { Recarga } from "@/types";

interface ProfileTabProps {
  user: any;
  role: string | null;
  avatarUrl: string | null;
  avatarError: boolean;
  setAvatarError: (v: boolean) => void;
  userLabel: string;
  userInitial: string;
  profileNome: string;
  setProfileNome: (v: string) => void;
  saldo: number;
  loading: boolean;
  fmt: (v: number) => string;
  telegramLinked: boolean;
  telegramUsername: string;
  whatsappNumber: string;
  uploadingAvatar: boolean;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  recargas: Recarga[];
  selectTab: (tab: any) => void;
  navigate: (path: string) => void;
}

export function ProfileTab({
  user, role, avatarUrl, avatarError, setAvatarError, userLabel, userInitial,
  profileNome, setProfileNome, saldo, loading, fmt, telegramLinked,
  telegramUsername, whatsappNumber, uploadingAvatar, handleAvatarUpload,
  recargas, selectTab, navigate,
}: ProfileTabProps) {
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const [savingBio, setSavingBio] = useState(false);
  const [editingNome, setEditingNome] = useState(false);
  const [badge, setBadge] = useState<BadgeType>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersList, setFollowersList] = useState<{ id: string; nome: string | null; avatar_url: string | null }[]>([]);
  const [followingList, setFollowingList] = useState<{ id: string; nome: string | null; avatar_url: string | null }[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  const recargasCompleted = recargas.filter((r) => r.status === "completed").length;

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const [{ data: counts }, { data: profile }] = await Promise.all([
        supabase.rpc("get_follow_counts", { _user_id: user.id }),
        supabase.from("profiles").select("bio, verification_badge, created_at").eq("id", user.id).single(),
      ]);
      if (counts && Array.isArray(counts) && counts.length > 0) {
        setFollowersCount(Number(counts[0].followers_count) || 0);
        setFollowingCount(Number(counts[0].following_count) || 0);
      }
      if (profile) {
        setBio((profile as any).bio || "");
        setBioText((profile as any).bio || "");
        setBadge(((profile as any).verification_badge as BadgeType) || null);
      }
    };
    load();
  }, [user?.id]);

  const handleSaveBio = async () => {
    if (!user) return;
    setSavingBio(true);
    try {
      await supabase.from("profiles").update({ bio: bioText.trim() } as any).eq("id", user.id);
      setBio(bioText.trim());
      setEditingBio(false);
      toast.success("Bio atualizada!");
    } catch { toast.error("Erro ao salvar bio"); }
    finally { setSavingBio(false); }
  };

  const handleSaveNome = async () => {
    if (!user || !profileNome.trim()) { toast.error("Informe um nome válido"); return; }
    try {
      const { error } = await supabase.from("profiles").update({ nome: profileNome.trim() } as any).eq("id", user.id);
      if (error) throw error;
      setEditingNome(false);
      toast.success("Nome atualizado!");
    } catch { toast.error("Erro ao salvar nome"); }
  };

  const loadFollowersList = async () => {
    setListLoading(true); setShowFollowers(true);
    try {
      const { data } = await supabase.from("follows").select("follower_id").eq("following_id", user.id);
      if (data && data.length > 0) {
        const ids = data.map((d: any) => d.follower_id);
        const { data: profiles } = await supabase.from("profiles").select("id, nome, avatar_url").in("id", ids);
        setFollowersList((profiles as any) || []);
      } else { setFollowersList([]); }
    } catch { setFollowersList([]); }
    finally { setListLoading(false); }
  };

  const loadFollowingList = async () => {
    setListLoading(true); setShowFollowing(true);
    try {
      const { data } = await supabase.from("follows").select("following_id").eq("follower_id", user.id);
      if (data && data.length > 0) {
        const ids = data.map((d: any) => d.following_id);
        const { data: profiles } = await supabase.from("profiles").select("id, nome, avatar_url").in("id", ids);
        setFollowingList((profiles as any) || []);
      } else { setFollowingList([]); }
    } catch { setFollowingList([]); }
    finally { setListLoading(false); }
  };

  const roleLabel = role === "admin" ? "Administrador" : role === "revendedor" ? "Revendedor" : role === "cliente" ? "Cliente" : "Usuário";
  const roleColor = role === "admin" ? "bg-primary/15 text-primary" : role === "revendedor" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-0 pb-4">
      {/* Cover gradient - more dramatic */}
      <div className="h-28 rounded-t-2xl bg-gradient-to-br from-primary/40 via-primary/15 to-transparent relative -mx-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.2),transparent_70%)]" />
      </div>

      {/* Profile header */}
      <div className="flex flex-col items-center -mt-16 relative z-10 px-4">
        {/* Avatar */}
        <label className="relative cursor-pointer group">
          {avatarUrl && !avatarError ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-[104px] h-[104px] rounded-full object-cover ring-[3px] ring-background shadow-2xl"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="w-[104px] h-[104px] rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-3xl ring-[3px] ring-background shadow-2xl">
              {userInitial}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {uploadingAvatar ? <Loader2 className="h-5 w-5 text-white animate-spin" /> : <Camera className="h-5 w-5 text-white" />}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg border-2 border-background">
            <Camera className="h-3 w-3" />
          </div>
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
        </label>

        {/* Name + badge */}
        <div className="flex items-center gap-1.5 mt-3">
          {editingNome ? (
            <div className="flex items-center gap-2">
              <input
                value={profileNome}
                onChange={(e) => setProfileNome(e.target.value)}
                className="px-3 py-1 rounded-lg glass-input text-sm text-foreground border border-border text-center font-bold uppercase"
                maxLength={100}
                autoFocus
              />
              <button onClick={handleSaveNome} className="p-1.5 rounded-lg bg-primary text-primary-foreground"><Check className="h-4 w-4" /></button>
              <button onClick={() => setEditingNome(false)} className="p-1.5 rounded-lg bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <button onClick={() => setEditingNome(true)} className="flex items-center gap-1.5 group">
              <h1 className="font-display text-xl font-bold text-foreground uppercase">{userLabel}</h1>
              <VerificationBadge badge={badge} size="md" />
              {role === "admin" && (
                <svg className="h-5 w-5 text-primary flex-shrink-0 animate-[spin-wobble_3s_ease-in-out_infinite]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L14.09 8.26L21 9.27L16.18 13.14L17.64 20.02L12 16.77L6.36 20.02L7.82 13.14L3 9.27L9.91 8.26L12 2Z" />
                  <path d="M9.5 12.5L11 14L14.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              )}
              <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Email + role */}
        <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        <span className={`inline-block mt-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleColor}`}>
          {roleLabel}
        </span>

        {/* Bio */}
        <div className="mt-2 px-4 text-center w-full max-w-xs">
          {editingBio ? (
            <div className="flex items-center gap-2">
              <input
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                maxLength={160}
                placeholder="Escreva sua bio..."
                className="flex-1 px-3 py-1.5 rounded-lg glass-input text-xs text-foreground border border-border text-center"
                autoFocus
              />
              <button onClick={handleSaveBio} disabled={savingBio} className="p-1.5 rounded-lg bg-primary text-primary-foreground">
                {savingBio ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => { setEditingBio(false); setBioText(bio); }} className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <p
              className={`text-xs cursor-pointer hover:text-foreground transition-colors ${bio ? "text-muted-foreground" : "text-muted-foreground/40 italic"}`}
              onClick={() => setEditingBio(true)}
            >
              {bio || "Toque para adicionar bio"}
              <Pencil className="h-2.5 w-2.5 inline ml-1 opacity-40" />
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-0 mt-5 w-full max-w-xs">
          <button onClick={loadFollowersList} className="flex-1 flex flex-col items-center py-2 rounded-l-xl hover:bg-muted/30 transition-colors border border-border/50">
            <span className="font-display text-lg font-bold text-foreground tabular-nums">{followersCount}</span>
            <span className="text-[10px] text-muted-foreground font-medium">Seguidores</span>
          </button>
          <div className="flex-1 flex flex-col items-center py-2 border-y border-border/50">
            <span className="font-display text-lg font-bold text-foreground tabular-nums">{recargasCompleted}</span>
            <span className="text-[10px] text-muted-foreground font-medium">Recargas</span>
          </div>
          <button onClick={loadFollowingList} className="flex-1 flex flex-col items-center py-2 rounded-r-xl hover:bg-muted/30 transition-colors border border-border/50">
            <span className="font-display text-lg font-bold text-foreground tabular-nums">{followingCount}</span>
            <span className="text-[10px] text-muted-foreground font-medium">Seguindo</span>
          </button>
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-3 gap-2 mt-5 px-1">
        <button onClick={() => selectTab("historico")} className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-muted/40 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <History className="h-4 w-4 text-primary" />
          </div>
          <span className="text-[11px] font-semibold text-foreground">Histórico</span>
        </button>
        <button onClick={() => selectTab("extrato")} className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-muted/40 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
            <Landmark className="h-4 w-4 text-success" />
          </div>
          <span className="text-[11px] font-semibold text-foreground">Depósitos</span>
        </button>
        <button onClick={() => selectTab("addSaldo")} className="glass-card rounded-xl p-3 flex flex-col items-center gap-1.5 hover:bg-muted/40 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-accent" />
          </div>
          <span className="text-[11px] font-semibold text-foreground">Saldo</span>
        </button>
      </div>

      {/* Saldo card - compact */}
      <div className="glass-card rounded-xl p-3.5 mx-1 mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Saldo Disponível</p>
            <p className="text-lg font-bold text-foreground tabular-nums">{loading ? "..." : fmt(saldo)}</p>
          </div>
        </div>
        <button onClick={() => selectTab("addSaldo")} className="px-3 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors">
          Depositar
        </button>
      </div>

      {/* Collapsible extras */}
      <div className="mx-1 mt-3">
        <button
          onClick={() => setShowExtras(!showExtras)}
          className="w-full glass-card rounded-xl p-3 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Configurações & Integrações</span>
          </div>
          {showExtras ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </button>

        <AnimatePresence>
          {showExtras && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pt-2">
                {/* Telegram integration */}
                <div className="glass-card rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0088cc, #0077b5)" }}>
                    <Send className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-xs">Telegram</p>
                    <p className="text-[10px] text-muted-foreground">{telegramLinked ? "Conta vinculada" : "Não configurado"}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-bold ${telegramLinked ? "text-success" : "text-muted-foreground"}`}>
                    {telegramLinked ? <><CheckCircle2 className="h-3 w-3" /> Ativo</> : "Inativo"}
                  </span>
                </div>

                {/* Contact links */}
                {(telegramUsername || whatsappNumber) && (
                  <div className="glass-card rounded-xl p-2.5 space-y-1">
                    {telegramUsername && (
                      <a href={`https://t.me/${telegramUsername}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                        <Send className="h-3 w-3" /> @{telegramUsername}
                      </a>
                    )}
                    {whatsappNumber && (
                      <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                        <Smartphone className="h-3 w-3" /> {whatsappNumber}
                      </a>
                    )}
                  </div>
                )}

                {/* Security */}
                <div className="glass-card rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">Segurança</span>
                  </div>
                  <button onClick={async () => {
                    if (!user?.email) return;
                    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
                    if (error) toast.error("Erro ao enviar e-mail");
                    else toast.success("E-mail de redefinição enviado!");
                  }} className="text-[11px] font-semibold text-primary hover:underline">
                    Alterar Senha
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
                  className="w-full glass-card rounded-xl p-3 flex items-center gap-2 hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-xs font-semibold text-destructive">Sair da conta</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
                <h3 className="font-bold text-foreground text-sm">{showFollowers ? "Seguidores" : "Seguindo"}</h3>
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
    </motion.div>
  );
}
