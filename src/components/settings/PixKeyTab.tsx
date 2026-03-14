import { useEffect, useState } from "react";
import { QrCode, Info, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";

const PIX_VALIDATORS: Record<string, { regex: RegExp; mask?: (v: string) => string; placeholder: string; maxLen: number; label: string }> = {
  cpf: {
    regex: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    mask: (v) => v.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14),
    placeholder: "000.000.000-00",
    maxLen: 14,
    label: "CPF inválido (ex: 000.000.000-00)",
  },
  cnpj: {
    regex: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
    mask: (v) => v.replace(/\D/g, "").replace(/(\d{2})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1/$2").replace(/(\d{4})(\d{1,2})$/, "$1-$2").slice(0, 18),
    placeholder: "00.000.000/0000-00",
    maxLen: 18,
    label: "CNPJ inválido (ex: 00.000.000/0000-00)",
  },
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    placeholder: "seu@email.com",
    maxLen: 100,
    label: "E-mail inválido",
  },
  telefone: {
    regex: /^\+?\d{10,13}$/,
    mask: (v) => v.replace(/[^\d+]/g, "").slice(0, 14),
    placeholder: "+5511999999999",
    maxLen: 14,
    label: "Telefone inválido (ex: +5511999999999)",
  },
  aleatoria: {
    regex: /^[a-f0-9-]{32,36}$/i,
    placeholder: "Chave aleatória",
    maxLen: 36,
    label: "Chave aleatória inválida",
  },
};
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "email", label: "E-mail" },
  { value: "telefone", label: "Telefone" },
  { value: "aleatoria", label: "Aleatória" },
];

interface PixKeyTabProps {
  userId: string;
}

export function PixKeyTab({ userId }: PixKeyTabProps) {
  const [keyType, setKeyType] = useState("cpf");
  const [keyValue, setKeyValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("reseller_config")
        .select("key, value")
        .eq("user_id", userId)
        .in("key", ["pix_key_type", "pix_key_value"]);
      if (data) {
        for (const row of data) {
          if (row.key === "pix_key_type" && row.value) setKeyType(row.value);
          if (row.key === "pix_key_value" && row.value) setKeyValue(row.value);
        }
      }
      setLoading(false);
    })();
  }, [userId]);

  const handleSave = async () => {
    if (!keyValue.trim()) {
      toast.error("Informe a chave PIX");
      return;
    }
    setSaving(true);
    try {
      for (const { key, value } of [
        { key: "pix_key_type", value: keyType },
        { key: "pix_key_value", value: keyValue.trim() },
      ]) {
        await supabase
          .from("reseller_config")
          .upsert({ user_id: userId, key, value }, { onConflict: "user_id,key" });
      }
      toast.success("Chave PIX salva!");
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
      {/* Left column */}
      <div className="space-y-4">
        {/* Info card */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Para que serve?</h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Esta chave PIX será usada para transferir suas comissões acumuladas para sua conta bancária quando você solicitar um saque.
          </p>
        </div>

        {/* Current PIX card */}
        <div className="bg-card rounded-2xl border border-border p-5 bg-gradient-to-br from-foreground/[0.03] to-transparent">
          <h3 className="text-sm font-bold text-foreground mb-2">PIX</h3>
          <p className="text-xs text-muted-foreground">
            {keyValue ? (
              <span className="font-mono">{keyValue}</span>
            ) : (
              "Nenhuma chave configurada"
            )}
          </p>
        </div>
      </div>

      {/* Right column: Form */}
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <h3 className="text-base font-bold text-foreground">Configurar Chave</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Tipo de Chave</label>
            <div className="relative">
              <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition appearance-none"
              >
                {PIX_KEY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Chave PIX</label>
            <input
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder="Digite sua chave aqui"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              maxLength={100}
            />
          </div>
        </div>

        <div className="border-t border-border pt-4 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Salvar Chave PIX
          </button>
        </div>
      </div>
    </div>
  );
}
