import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PromoBanner } from "./PromoBanner";
import { PopupBanner } from "./PopupBanner";
import { SlideBanner } from "./SlideBanner";
import { ToggleLeft, ToggleRight, Zap, Save, Loader2, Plus, Trash2, ImagePlus, X } from "lucide-react";
import { styledToast as toast } from "@/lib/toast";
import { motion, AnimatePresence } from "framer-motion";

interface BannerData {
  id: string;
  position: number;
  type: "banner" | "popup" | "slide";
  title: string;
  subtitle: string;
  link: string;
  enabled: boolean;
  icon_url: string;
}

interface BannersManagerProps {
  botUsername?: string | null;
}

export function BannersManager({ botUsername }: BannersManagerProps) {
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [uploadingIcon, setUploadingIcon] = useState<Record<number, boolean>>({});
  const [expandedBanner, setExpandedBanner] = useState<number | null>(null);

  const initialLoadDone = useRef(false);

  const fetchBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("position");
      if (error) throw error;
      setBanners((data || []).map(b => ({
        ...b,
        type: b.type as "banner" | "popup" | "slide",
        icon_url: (b as any).icon_url || "",
      })));
    } catch {
      toast.error("Erro ao carregar banners");
    } finally {
      if (!initialLoadDone.current) {
        setLoading(false);
        initialLoadDone.current = true;
      }
    }
  }, []);

  useEffect(() => { fetchBanners(); }, [fetchBanners]);

  const updateBanner = (position: number, updates: Partial<BannerData>) => {
    setBanners(prev => prev.map(b => b.position === position ? { ...b, ...updates } : b));
  };

  const toggleBanner = async (banner: BannerData) => {
    const newEnabled = !banner.enabled;
    updateBanner(banner.position, { enabled: newEnabled });
    try {
      const { error } = await supabase
        .from("banners")
        .update({ enabled: newEnabled, updated_at: new Date().toISOString() })
        .eq("id", banner.id);
      if (error) throw error;
      toast.success(newEnabled ? `Banner ${banner.position} ativado!` : `Banner ${banner.position} desativado!`);
    } catch {
      updateBanner(banner.position, { enabled: !newEnabled });
      toast.error("Erro ao alterar banner");
    }
  };

  const saveBanner = async (banner: BannerData) => {
    setSaving(prev => ({ ...prev, [banner.position]: true }));
    try {
      const { error } = await supabase
        .from("banners")
        .update({
          type: banner.type,
          title: banner.title,
          subtitle: banner.subtitle,
          link: banner.link,
          icon_url: banner.icon_url || null,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", banner.id);
      if (error) throw error;
      toast.success(`Banner ${banner.position} salvo!`);
    } catch {
      toast.error("Erro ao salvar banner");
    }
    setSaving(prev => ({ ...prev, [banner.position]: false }));
  };

  const handleIconUpload = async (banner: BannerData, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ícone deve ter no máximo 2MB");
      return;
    }
    setUploadingIcon(prev => ({ ...prev, [banner.position]: true }));
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `banner-icons/${banner.id}.${ext}`;
      const { error: upErr } = await supabase.storage.from("broadcast-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("broadcast-images").getPublicUrl(path);
      const url = urlData.publicUrl + "?t=" + Date.now();
      updateBanner(banner.position, { icon_url: url });
      toast.success("Ícone carregado!");
    } catch {
      toast.error("Erro ao carregar ícone");
    } finally {
      setUploadingIcon(prev => ({ ...prev, [banner.position]: false }));
    }
  };

  const typeLabels: Record<string, { label: string; emoji: string }> = {
    banner: { label: "Banner Topo", emoji: "📢" },
    popup: { label: "Pop-up Central", emoji: "💬" },
    slide: { label: "Slide Animado", emoji: "🎞️" },
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando banners...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" /> 📢 Banners Promocionais
        </h4>
        <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-1 rounded-lg">
          Máx. 3 banners
        </span>
      </div>

      <div className="space-y-3">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`rounded-xl border transition-colors ${
              banner.enabled ? "border-primary/30 bg-primary/5" : "border-border bg-card"
            }`}
          >
            {/* Banner header */}
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() => setExpandedBanner(expandedBanner === banner.position ? null : banner.position)}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{typeLabels[banner.type]?.emoji || "📢"}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Banner {banner.position} — {typeLabels[banner.type]?.label || banner.type}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                    {banner.title || "Sem título"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleBanner(banner); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    banner.enabled
                      ? "bg-success/15 text-success"
                      : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {banner.enabled ? <><ToggleRight className="h-3.5 w-3.5" /> On</> : <><ToggleLeft className="h-3.5 w-3.5" /> Off</>}
                </button>
              </div>
            </div>

            {/* Expanded form */}
            <AnimatePresence>
              {expandedBanner === banner.position && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                    {/* Type selector */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tipo do Banner</label>
                      <div className="flex gap-2">
                        {(["banner", "popup", "slide"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => updateBanner(banner.position, { type: t })}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-colors border ${
                              banner.type === t
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-background text-muted-foreground hover:bg-muted/40"
                            }`}
                          >
                            {typeLabels[t].emoji} {typeLabels[t].label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Título</label>
                      <input
                        type="text"
                        value={banner.title}
                        onChange={(e) => updateBanner(banner.position, { title: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="🚀 Título do banner"
                      />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">Subtítulo</label>
                      <input
                        type="text"
                        value={banner.subtitle}
                        onChange={(e) => updateBanner(banner.position, { subtitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="📱 Descrição do banner"
                      />
                    </div>

                    {/* Link */}
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1">🔗 Link</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={banner.link}
                          onChange={(e) => updateBanner(banner.position, { link: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="https://t.me/SeuBotAqui"
                        />
                        {botUsername && (
                          <button
                            type="button"
                            onClick={() => updateBanner(banner.position, { link: `https://t.me/${botUsername}` })}
                            className="px-3 py-2 rounded-md bg-primary/15 text-primary text-xs font-semibold hover:bg-primary/25 transition-colors whitespace-nowrap"
                          >
                            @{botUsername}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={() => saveBanner(banner)}
                      disabled={saving[banner.position]}
                      className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {saving[banner.position] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {saving[banner.position] ? "Salvando..." : "Salvar Banner"}
                    </button>

                    {/* Preview */}
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Pré-visualização</label>
                      {banner.type === "popup" ? (
                        <div className="relative rounded-xl border border-dashed border-primary/30 p-4 bg-muted/20">
                          <div className="rounded-xl border border-primary/20 bg-card p-4 text-center space-y-2 max-w-[240px] mx-auto shadow-lg">
                            <span className="text-2xl">📢</span>
                            <h3 className="text-sm font-bold text-foreground">{banner.title || "Título do Pop-up"}</h3>
                            <p className="text-xs text-muted-foreground">{banner.subtitle || "Subtítulo do pop-up"}</p>
                            {banner.link && (
                              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                                Acessar agora
                              </div>
                            )}
                          </div>
                          <p className="text-center text-xs text-muted-foreground mt-2">Este banner abrirá como pop-up central</p>
                        </div>
                      ) : banner.type === "slide" ? (
                        <SlideBanner
                          slides={[{ title: banner.title || "Título do slide", subtitle: banner.subtitle || "Subtítulo do slide", link: banner.link || undefined }]}
                          visible={true}
                        />
                      ) : (
                        <PromoBanner
                          title={banner.title || undefined}
                          subtitle={banner.subtitle || undefined}
                          link={banner.link || undefined}
                          visible={true}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
