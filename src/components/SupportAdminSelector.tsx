import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { invalidateSupportAdminCache } from "@/hooks/useSupportAdminId";
import { Shield, Check, Loader2, User, AtSign, Send as SendIcon } from "lucide-react";

interface AdminProfile {
  id: string;
  nome: string | null;
  email: string | null;
  telegram_id: number | null;
  telegram_username: string | null;
  avatar_url: string | null;
}

export function SupportAdminSelector() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch all admin user IDs
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      const adminIds = (roles || []).map(r => r.user_id);

      if (adminIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email, telegram_id, telegram_username, avatar_url")
        .in("id", adminIds);

      setAdmins(profiles || []);

      // Get current selection
      const { data: config } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "supportAdminUserId")
        .maybeSingle();

      if (config?.value) setSelectedUserId(config.value);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSelect = async (admin: AdminProfile) => {
    if (!admin.telegram_id) {
      toast.error("Este admin não tem Telegram ID configurado no perfil.");
      return;
    }

    setSaving(true);
    try {
      await supabase.from("system_config").upsert(
        { key: "supportAdminUserId", value: admin.id, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      await supabase.from("system_config").upsert(
        { key: "supportAdminTelegramId", value: String(admin.telegram_id), updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

      setSelectedUserId(admin.id);
      invalidateSupportAdminCache();
      toast.success(`Admin de suporte definido: ${admin.nome || admin.email}`);
    } catch {
      toast.error("Erro ao salvar");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden mb-4">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2.5">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Admin Responsável pelo Suporte</span>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-[11px] text-muted-foreground mb-3">
          Selecione qual administrador receberá as notificações de suporte via Telegram.
        </p>

        {admins.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum administrador encontrado.</p>
        )}

        {admins.map(admin => {
          const isSelected = selectedUserId === admin.id;
          const hasTelegram = !!admin.telegram_id;

          return (
            <button
              key={admin.id}
              onClick={() => handleSelect(admin)}
              disabled={saving || isSelected}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
                  : hasTelegram
                    ? "border-border/60 hover:border-primary/50 hover:bg-muted/30"
                    : "border-border/40 opacity-40 cursor-not-allowed"
              }`}
            >
              {admin.avatar_url ? (
                <img src={admin.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-offset-1 ring-offset-card ring-border" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0 ring-2 ring-offset-1 ring-offset-card ring-border">
                  <User className="h-4.5 w-4.5 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-sm font-bold text-foreground truncate">
                  {admin.nome || "Sem nome"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1.5">
                  <AtSign className="h-3 w-3 shrink-0 text-primary/60" />
                  <span className="font-medium">{admin.email || "—"}</span>
                </p>
                <p className="text-[11px] truncate flex items-center gap-1.5">
                  <SendIcon className="h-3 w-3 shrink-0 text-primary/60" />
                  <span className={hasTelegram ? "font-medium text-foreground/80" : "text-destructive/70 font-medium"}>
                    {hasTelegram
                      ? `@${admin.telegram_username || admin.telegram_id}`
                      : "⚠ Telegram não configurado"
                    }
                  </span>
                </p>
              </div>

              <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                isSelected ? "bg-primary" : "bg-muted/50 border border-border"
              }`}>
                {isSelected
                  ? <Check className="h-4 w-4 text-primary-foreground" />
                  : <div className="w-2.5 h-2.5 rounded-full bg-border" />
                }
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
