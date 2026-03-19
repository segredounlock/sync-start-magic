import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { VerificationBadge, BadgeType, BADGE_CONFIG } from "@/components/VerificationBadge";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet, History, Send, Landmark, Smartphone, Shield, Activity,
  CheckCircle2, Loader2, Camera, Pencil, Calendar, Clock,
  X, Check, ChevronDown, ChevronUp, Lock, LogOut, User,
  Key, QrCode, BarChart3, HeadphonesIcon, Bell, Globe, Copy, ExternalLink,
} from "lucide-react";
import { styledToast as toast } from "@/lib/toast";
import type { Recarga } from "@/types";
import { PixKeyTab } from "@/components/settings/PixKeyTab";
import { PixelAdsTab } from "@/components/settings/PixelAdsTab";
import { SupportTab } from "@/components/settings/SupportTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";

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
  recargasHoje: number;
  totalRecargas: number;
  selectTab: (tab: any) => void;
  navigate: (path: string) => void;
}

type SettingsSubTab = "perfil" | "seguranca" | "pix" | "pixel" | "suporte" | "notificacoes";

const subTabs: { key: SettingsSubTab; label: string; icon: React.ElementType }[] = [
  { key: "perfil", label: "Meu Perfil", icon: User },
  { key: "seguranca", label: "Segurança", icon: Shield },
  { key: "pix", label: "Chave PIX", icon: QrCode },
  { key: "pixel", label: "Pixel Ads", icon: BarChart3 },
  { key: "suporte", label: "Suporte", icon: HeadphonesIcon },
  { key: "notificacoes", label: "Notificações", icon: Bell },
];

export function ProfileTab({
  user, role, avatarUrl, avatarError, setAvatarError, userLabel, userInitial,
  profileNome, setProfileNome, saldo, loading, fmt, telegramLinked,
  telegramUsername, whatsappNumber, uploadingAvatar, handleAvatarUpload,
  recargas, recargasHoje, totalRecargas, selectTab, navigate,
}: ProfileTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SettingsSubTab>("perfil");
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
  const [slug, setSlug] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugText, setSlugText] = useState("");
  const [savingSlug, setSavingSlug] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailText, setEmailText] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [nomeText, setNomeText] = useState("");

  const recargasCompleted = recargas.filter((r) => r.status === "completed").length;

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      const [{ data: counts }, { data: profile }] = await Promise.all([
        supabase.rpc("get_follow_counts", { _user_id: user.id }),
        supabase.from("profiles").select("bio, verification_badge, slug, nome, email, referral_code").eq("id", user.id).single(),
      ]);
      if (counts && Array.isArray(counts) && counts.length > 0) {
        setFollowersCount(Number(counts[0].followers_count) || 0);
        setFollowingCount(Number(counts[0].following_count) || 0);
      }
      if (profile) {
        setBio((profile as any).bio || "");
        setBioText((profile as any).bio || "");
        setBadge(((profile as any).verification_badge as BadgeType) || null);
        setSlug((profile as any).slug || "");
        setSlugText((profile as any).slug || "");
        setReferralCode((profile as any).referral_code || "");
        setNomeText((profile as any).nome || profileNome || "");
        setEmailText(user?.email || "");
      }
    };
    load();
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const updates: any = {};
      if (nomeText.trim() && nomeText.trim() !== profileNome) {
        updates.nome = nomeText.trim();
        setProfileNome(nomeText.trim());
      }
      if (slugText.trim() !== slug) {
        const cleanSlug = slugText.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");
        updates.slug = cleanSlug || null;
        setSlugText(cleanSlug);
      }
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
        if (error) throw error;
        if (updates.nome) setProfileNome(updates.nome);
        if (updates.slug !== undefined) setSlug(updates.slug || "");
      }
      // Handle email change
      if (emailText.trim() && emailText.trim() !== user.email) {
        const { error } = await supabase.auth.updateUser({ email: emailText.trim() });
        if (error) throw error;
        toast.success("Alterações salvas! Verifique o novo e-mail para confirmação.");
      } else {
        toast.success("Alterações salvas!");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar");
    } finally {
      setSavingProfile(false);
    }
  };

  const loadFollowersList = async () => {
    setListLoading(true); setShowFollowers(true);
    try {
      const { data } = await supabase.from("follows").select("follower_id").eq("following_id", user.id);
      if (data && data.length > 0) {
        const ids = data.map((d: any) => d.follower_id);
        const { data: profiles } = await supabase.from("profiles").select("id, nome, avatar_url, slug").in("id", ids);
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
        const { data: profiles } = await supabase.from("profiles").select("id, nome, avatar_url, slug").in("id", ids);
        setFollowingList((profiles as any) || []);
      } else { setFollowingList([]); }
    } catch { setFollowingList([]); }
    finally { setListLoading(false); }
  };

  const roleLabel = role === "admin" ? "Administrador" : role === "revendedor" ? "Revendedor" : role === "cliente" ? "Cliente" : "Usuário";
  const roleColor = role === "admin" ? "bg-primary/15 text-primary" : role === "revendedor" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações da Conta</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus dados pessoais, segurança e preferências.</p>
      </div>

      {/* Sub-tabs */}
      <div className="bg-muted/30 rounded-xl p-1 flex gap-0.5 overflow-x-auto no-scrollbar">
        {subTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveSubTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeSubTab === key
                ? "bg-background text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeSubTab === "perfil" && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
              {/* Left: Profile card */}
              <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center text-center">
                <label className="relative cursor-pointer group">
                  {avatarUrl && !avatarError ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold text-3xl ring-4 ring-primary/20">
                      {userInitial}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background">
                    {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </div>
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                </label>

                <h2 className="text-lg font-bold text-foreground mt-3 flex items-center gap-1.5">
                  {userLabel}
                  <VerificationBadge badge={badge} size="md" />
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  {user?.email}
                  {badge && <CheckCircle2 className="h-3 w-3 text-success" />}
                </p>
                <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${roleColor}`}>
                  {roleLabel}
                </span>

                {/* Badge display only */}
                {badge && <VerificationBadge badge={badge} size="md" />}

                {/* Stats */}
                <div className="flex items-center gap-0 mt-5 w-full">
                  <button onClick={loadFollowersList} className="flex-1 flex flex-col items-center py-2 rounded-l-xl hover:bg-muted/30 transition-colors border border-border/50">
                    <span className="text-lg font-bold text-foreground tabular-nums">{followersCount}</span>
                    <span className="text-[10px] text-muted-foreground">Seguidores</span>
                  </button>
                  <div className="flex-1 flex flex-col items-center py-2 border-y border-border/50">
                    <span className="text-lg font-bold text-foreground tabular-nums">{recargasCompleted}</span>
                    <span className="text-[10px] text-muted-foreground">Recargas</span>
                  </div>
                  <button onClick={loadFollowingList} className="flex-1 flex flex-col items-center py-2 rounded-r-xl hover:bg-muted/30 transition-colors border border-border/50">
                    <span className="text-lg font-bold text-foreground tabular-nums">{followingCount}</span>
                    <span className="text-[10px] text-muted-foreground">Seguindo</span>
                  </button>
                </div>
              </div>

              {/* Right: Edit form */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-primary" />
                  <h3 className="text-base font-bold text-foreground">Editar Informações</h3>
                </div>

                {/* Nome */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Nome Completo</label>
                  <input
                    value={nomeText}
                    onChange={(e) => setNomeText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    placeholder="Seu nome"
                    maxLength={100}
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">E-mail de Contato</label>
                  <input
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    placeholder="seu@email.com"
                    type="email"
                  />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Nota: Alterar o e-mail exigirá uma nova verificação.
                  </p>
                </div>

                {/* Slug / Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Nome de Usuário <span className="text-muted-foreground font-normal">(URL do seu perfil)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                    <input
                      value={slugText}
                      onChange={(e) => setSlugText(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                      placeholder="seu.nome"
                      maxLength={30}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Apenas letras minúsculas, números, pontos e sublinhados.
                  </p>
                </div>

                {/* Perfil Público */}
                {(slug || referralCode) && (
                  <div className="bg-muted/30 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-foreground">Perfil Público</span>
                    </div>

                    {/* Link da Loja */}
                    {slug && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">
                          Seus clientes podem ver seus produtos neste link.
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-xs text-muted-foreground truncate font-mono">
                            https://recargasbrasill.com/p/{slug}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://recargasbrasill.com/loja/${slug}`);
                              toast.success("Link copiado!");
                            }}
                            className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Copiar link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <a
                            href={`/loja/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Abrir perfil"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Link de Indicação */}
                    {referralCode && (
                      <div className="space-y-1.5">
                        <p className="text-xs text-muted-foreground">
                          Compartilhe este link para convidar novos membros para sua rede.
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-xs text-muted-foreground truncate font-mono">
                            https://recargasbrasill.com/registrar?ref={referralCode}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`https://recargasbrasill.com/registrar?ref=${referralCode}`);
                              toast.success("Link de indicação copiado!");
                            }}
                            className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Copiar link de indicação"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Seu código: <span className="font-bold text-foreground">{referralCode}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-border pt-4 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingProfile && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "seguranca" && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <h3 className="text-base font-bold text-foreground">Segurança</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Alterar Senha</p>
                      <p className="text-xs text-muted-foreground">Enviaremos um e-mail para redefinição</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!user?.email) return;
                      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
                      if (error) toast.error("Erro ao enviar e-mail");
                      else toast.success("E-mail de redefinição enviado!");
                    }}
                    className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
                  >
                    Redefinir
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">Telegram</p>
                      <p className="text-xs text-muted-foreground">
                        {telegramLinked ? `Vinculado${telegramUsername ? ` (@${telegramUsername})` : ""}` : "Não configurado"}
                      </p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-bold ${telegramLinked ? "text-success" : "text-muted-foreground"}`}>
                    {telegramLinked ? <><CheckCircle2 className="h-3.5 w-3.5" /> Ativo</> : "Inativo"}
                  </span>
                </div>

                {whatsappNumber && (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">WhatsApp</p>
                        <p className="text-xs text-muted-foreground">{whatsappNumber}</p>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Abrir
                    </a>
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <button
                    onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
                    className="w-full py-3 rounded-xl bg-destructive/10 text-destructive text-sm font-bold flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sair da conta
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "pix" && user && <PixKeyTab userId={user.id} />}

          {activeSubTab === "pixel" && user && <PixelAdsTab userId={user.id} />}

          {activeSubTab === "suporte" && user && <SupportTab userId={user.id} />}

          {activeSubTab === "notificacoes" && user && (
            <NotificationsTab userId={user.id} telegramLinked={telegramLinked} telegramUsername={telegramUsername} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Followers/Following modal */}
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
                      onClick={() => { setShowFollowers(false); setShowFollowing(false); navigate(`/perfil/${(u as any).slug || u.id}`); }}
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
