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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      const adminIds = (roles || []).map(r => r.user_id);

      if (adminIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nome, email, telegram_id, telegram_username, avatar_url")
        .in("id", adminIds);

      setAdmins(profiles || []);

      // Get current multi-selection (comma-separated IDs)
      const { data: configUser } = await supabase
        .from("system_config")
        .select("value")
        .eq("key", "supportAdminUserId")
        .maybeSingle();

      if (configUser?.value) {
        setSelectedIds(configUser.value.split(",").filter(Boolean));
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (admin: AdminProfile) => {
    if (!admin.telegram_id) {
      toast.error("Este admin não tem Telegram ID configurado no perfil.");
      return;
    }

    setSaving(true);
    try {
      const isCurrentlySelected = selectedIds.includes(admin.id);
      let newIds: string[];
      
      if (isCurrentlySelected) {
        // Don't allow deselecting the last one
        if (selectedIds.length <= 1) {
          toast.error("É necessário pelo menos um admin no suporte.");
          setSaving(false);
          return;
        }
        newIds = selectedIds.filter(id => id !== admin.id);
      } else {
        newIds = [...selectedIds, admin.id];
      }

      // Build telegram IDs from selected admins
      const selectedAdmins = admins.filter(a => newIds.includes(a.id));
      const telegramIds = selectedAdmins.map(a => String(a.telegram_id)).join(",");

      await supabase.from("system_config").upsert(
        { key: "supportAdminUserId", value: newIds.join(","), updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
      await supabase.from("system_config").upsert(
        { key: "supportAdminTelegramId", value: telegramIds, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );

      setSelectedIds(newIds);
      invalidateSupportAdminCache();

      if (isCurrentlySelected) {
        toast.success(`${admin.nome || admin.email} removido do suporte`);
      } else {
        toast.success(`${admin.nome || admin.email} adicionado ao suporte`);
      }
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
        <span className="text-sm font-medium text-foreground">Admins Responsáveis pelo Suporte</span>
        {selectedIds.length > 0 && (
          <span className="ml-auto text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <p className="text-[11px] text-muted-foreground mb-3">
          Selecione quais administradores receberão as notificações de suporte via Telegram.
        </p>

        {admins.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Nenhum administrador encontrado.</p>
        )}

        {admins.map(admin => {
          const isSelected = selectedIds.includes(admin.id);
          const hasTelegram = !!admin.telegram_id;

          return (
            <button
              key={admin.id}
              onClick={() => handleToggle(admin)}
              disabled={saving}
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
                  <User className="h-4 w-4 text-muted-foreground" />
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

              <div className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-colors border-2 ${
                isSelected ? "bg-primary border-primary" : "bg-transparent border-border"
              }`}>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
