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
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors text-left ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : hasTelegram
                    ? "border-border hover:border-primary/50 hover:bg-muted/30"
                    : "border-border opacity-50 cursor-not-allowed"
              }`}
            >
              {admin.avatar_url ? (
                <img src={admin.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {admin.nome || "Sem nome"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                  <AtSign className="h-3 w-3 shrink-0" />
                  {admin.email || "—"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <SendIcon className="h-3 w-3 shrink-0" />
                  {hasTelegram
                    ? `@${admin.telegram_username || admin.telegram_id}`
                    : "Telegram não configurado"
                  }
                </p>
              </div>

              {isSelected && (
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
