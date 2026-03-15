import { useEffect, useState, useCallback } from "react";
import { HeadphonesIcon, Info, Loader2, Check, Plus, Trash2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";

interface SupportChannel {
  label: string;
  icon: string;
  link: string;
  showInBubble?: boolean;
}

const ICON_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp", emoji: "💬" },
  { value: "telegram", label: "Telegram", emoji: "✈️" },
  { value: "email", label: "E-mail", emoji: "📧" },
  { value: "telefone", label: "Telefone", emoji: "📞" },
  { value: "link", label: "Link Geral", emoji: "🔗" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
];

const MAX_CHANNELS = 3;

interface SupportTabProps {
  userId: string;
}

export function SupportTab({ userId }: SupportTabProps) {
  const [enabled, setEnabled] = useState(false);
  const [channels, setChannels] = useState<SupportChannel[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    const { data } = await supabase
      .from("reseller_config")
      .select("key, value")
      .eq("user_id", userId)
      .in("key", ["custom_support_enabled", "support_channels"]);

    if (data) {
      for (const row of data) {
        if (row.key === "custom_support_enabled") setEnabled(row.value === "true");
        if (row.key === "support_channels") {
          try {
            setChannels(JSON.parse(row.value || "[]"));
          } catch {
            setChannels([]);
          }
        }
      }
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const addChannel = () => {
    if (channels.length >= MAX_CHANNELS) {
      toast.error(`Máximo de ${MAX_CHANNELS} canais.`);
      return;
    }
    setChannels((prev) => [
      ...prev,
      { label: "", icon: "whatsapp", link: "", showInBubble: prev.length === 0 },
    ]);
  };

  const removeChannel = (idx: number) => {
    setChannels((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // Ensure at least one has showInBubble if any exist
      if (next.length > 0 && !next.some((c) => c.showInBubble)) {
        next[0].showInBubble = true;
      }
      return next;
    });
  };

  const updateChannel = (idx: number, field: keyof SupportChannel, value: string | boolean) => {
    setChannels((prev) =>
      prev.map((ch, i) => {
        if (i !== idx) {
          // If setting showInBubble on one, turn off others
          if (field === "showInBubble" && value === true) return { ...ch, showInBubble: false };
          return ch;
        }
        return { ...ch, [field]: value };
      })
    );
  };

  const handleSave = async () => {
    // Validate channels
    for (const ch of channels) {
      if (!ch.label.trim()) {
        toast.error("Preencha o nome/contato de todos os canais.");
        return;
      }
      if (!ch.link.trim()) {
        toast.error("Preencha o link de todos os canais.");
        return;
      }
      if (ch.link.length > 500) {
        toast.error("Link muito longo (máx 500 caracteres).");
        return;
      }
    }

    setSaving(true);
    try {
      const upserts = [
        { user_id: userId, key: "custom_support_enabled", value: enabled ? "true" : "false" },
        { user_id: userId, key: "support_channels", value: JSON.stringify(channels) },
      ];
      const { error } = await supabase
        .from("reseller_config")
        .upsert(upserts, { onConflict: "user_id,key" });
      if (error) throw error;
      toast.success("Configurações de suporte salvas!");
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
          <HeadphonesIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Configurações de Suporte</h3>
          <p className="text-xs text-muted-foreground">Defina como seus indicados devem entrar em contato com você.</p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ao ativar o suporte personalizado, seus indicados (e os indicados deles, caso não configurem o próprio suporte)
            verão os <strong className="text-foreground">seus contatos</strong> em vez dos contatos do sistema.
          </p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border">
        <div>
          <p className="text-sm font-bold text-foreground">Ativar Meu Suporte Personalizado</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
            Interrompe a dissipação do suporte acima
          </p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative w-12 h-7 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"}`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
              enabled ? "translate-x-5.5 left-auto right-0.5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {/* Channels */}
      {enabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Meus Canais de Atendimento
            </p>
            <span className="text-xs text-muted-foreground">
              {channels.length} / {MAX_CHANNELS}
            </span>
          </div>

          {channels.map((ch, idx) => (
            <div key={idx} className="border border-border rounded-xl p-4 space-y-3 relative">
              {/* Bubble badge */}
              {ch.showInBubble && (
                <span className="absolute -top-2.5 left-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> Exibido no balão
                </span>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
                {/* Label */}
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Nome / Contato
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={ch.label}
                    onChange={(e) => updateChannel(idx, "label", e.target.value)}
                    placeholder="Ex: 91980586638"
                  />
                </div>

                {/* Icon select */}
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Ícone
                  </label>
                  <select
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 min-w-[140px]"
                    value={ch.icon}
                    onChange={(e) => updateChannel(idx, "icon", e.target.value)}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.emoji} {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  Link Completo (com https://)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    maxLength={500}
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={ch.link}
                    onChange={(e) => updateChannel(idx, "link", e.target.value)}
                    placeholder="https://wa.me/5591980586638"
                  />
                  <button
                    onClick={() => removeChannel(idx)}
                    className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                    title="Remover canal"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Show in bubble toggle */}
              {!ch.showInBubble && (
                <button
                  onClick={() => updateChannel(idx, "showInBubble", true)}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  Definir como canal do balão
                </button>
              )}
            </div>
          ))}

          {/* Add channel */}
          {channels.length < MAX_CHANNELS && (
            <button
              onClick={addChannel}
              className="w-full py-3 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> Adicionar Novo Canal
            </button>
          )}
        </div>
      )}

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}
