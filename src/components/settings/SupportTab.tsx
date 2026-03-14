import { useEffect, useState } from "react";
import { HeadphonesIcon, Info, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";

interface SupportTabProps {
  userId: string;
}

export function SupportTab({ userId }: SupportTabProps) {
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("reseller_config")
        .select("value")
        .eq("user_id", userId)
        .eq("key", "custom_support_enabled")
        .maybeSingle();
      if (data?.value === "true") setEnabled(true);
      setLoading(false);
    })();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase
        .from("reseller_config")
        .upsert(
          { user_id: userId, key: "custom_support_enabled", value: enabled ? "true" : "false" },
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
          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform ${enabled ? "translate-x-5.5 left-auto right-0.5" : "left-0.5"}`} />
        </button>
      </div>

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
