import { useEffect, useState } from "react";
import { BarChart3, Info, Loader2, Check, Plus, X, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";

const PIXEL_PLATFORMS = [
  { value: "facebook", label: "Facebook Pixel" },
  { value: "google", label: "Google Ads" },
  { value: "tiktok", label: "TikTok Pixel" },
  { value: "kwai", label: "Kwai Pixel" },
];

const MAX_PIXELS = 5;

interface Pixel {
  platform: string;
  pixelId: string;
}

interface PixelAdsTabProps {
  userId: string;
}

export function PixelAdsTab({ userId }: PixelAdsTabProps) {
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newPlatform, setNewPlatform] = useState("facebook");
  const [newPixelId, setNewPixelId] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("reseller_config")
        .select("value")
        .eq("user_id", userId)
        .eq("key", "tracking_pixels")
        .maybeSingle();
      if (data?.value) {
        try { setPixels(JSON.parse(data.value)); } catch {}
      }
      setLoading(false);
    })();
  }, [userId]);

  const handleAdd = () => {
    if (!newPixelId.trim()) { toast.error("Informe o ID do pixel"); return; }
    if (pixels.length >= MAX_PIXELS) { toast.error(`Máximo de ${MAX_PIXELS} pixels`); return; }
    setPixels([...pixels, { platform: newPlatform, pixelId: newPixelId.trim() }]);
    setNewPixelId("");
    setAdding(false);
  };

  const handleRemove = (index: number) => {
    setPixels(pixels.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase
        .from("reseller_config")
        .upsert(
          { user_id: userId, key: "tracking_pixels", value: JSON.stringify(pixels) },
          { onConflict: "user_id,key" }
        );
      toast.success("Configurações salvas!");
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-primary/20 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Pixel de Rastreamento</h3>
          <p className="text-xs text-muted-foreground">Configure seus pixels para monitorar conversões de anúncios.</p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold text-foreground mb-1">Como funciona?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ao configurar um pixel, o sistema disparará eventos automáticos para a plataforma selecionada sempre que:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc pl-4">
              <li>Um visitante acessar seu link de perfil (<span className="font-mono text-foreground">PageView</span>).</li>
              <li>Um visitante clicar em cadastrar (<span className="font-mono text-foreground">Lead</span>).</li>
              <li>Um novo usuário concluir o registro (<span className="font-mono text-foreground">CompleteRegistration</span>).</li>
              <li>Seus indicados iniciarem um checkout ou compra (<span className="font-mono text-foreground">Purchase</span>).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pixels list */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Meus Pixels Configurados</p>
          <span className="text-xs font-bold text-primary">{pixels.length} / {MAX_PIXELS}</span>
        </div>

        {pixels.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground">
            <QrCode className="h-8 w-8 opacity-30 mb-2" />
            <p className="text-sm">Nenhum pixel adicionado ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pixels.map((pixel, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                <div>
                  <p className="text-xs font-bold text-foreground">{PIXEL_PLATFORMS.find(p => p.value === pixel.platform)?.label || pixel.platform}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{pixel.pixelId}</p>
                </div>
                <button onClick={() => handleRemove(i)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add pixel */}
      {adding ? (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition appearance-none"
            >
              {PIXEL_PLATFORMS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <input
              value={newPixelId}
              onChange={(e) => setNewPixelId(e.target.value)}
              placeholder="ID do Pixel"
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              maxLength={50}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold">Adicionar</button>
            <button onClick={() => { setAdding(false); setNewPixelId(""); }} className="px-4 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-bold">Cancelar</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          disabled={pixels.length >= MAX_PIXELS}
          className="w-full py-3 rounded-xl border border-dashed border-border text-sm font-semibold text-muted-foreground hover:bg-muted/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" /> Adicionar Novo Pixel
        </button>
      )}

      {/* Save */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
