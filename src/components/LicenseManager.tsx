import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { styledToast as toast } from "@/lib/toast";
import { confirm } from "@/lib/confirm";
import {
  KeyRound, Plus, Copy, ToggleLeft, ToggleRight, Trash2, RefreshCw,
  Shield, Clock, Globe, Users, CheckCircle2, XCircle, Loader2, Eye, EyeOff,
} from "lucide-react";
import { formatFullDateTimeBR } from "@/lib/timezone";

interface License {
  id: string;
  license_key: string;
  mirror_name: string;
  mirror_domain: string | null;
  expires_at: string;
  is_active: boolean;
  max_users: number;
  features: string[];
  last_heartbeat_at: string | null;
  created_at: string;
}

const MASTER_DOMAINS = ["recargasbrasill.com"];

function isMasterDomain(): boolean {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase();
  return MASTER_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`));
}

function LicenseManagerContent() {

  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Form state
  const [formName, setFormName] = useState("");
  const [formDomain, setFormDomain] = useState("");
  const [formExpDays, setFormExpDays] = useState(30);
  

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setLicenses(data as License[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLicenses(); }, [fetchLicenses]);

  const handleCreate = async () => {
    if (!formName.trim()) { toast.error("Nome do espelho é obrigatório"); return; }
    if (!formDomain.trim()) { toast.error("Domínio é obrigatório — a licença só funciona para este domínio"); return; }
    setCreating(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + formExpDays);

      const { data, error } = await supabase.functions.invoke("license-generate", {
        body: {
          mirror_name: formName.trim(),
          mirror_domain: formDomain.trim(),
          expires_at: expiresAt.toISOString(),
          max_users: 999999,
          features: ["all"],
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Licença criada com sucesso!");
      setShowForm(false);
      setFormName("");
      setFormDomain("");
      setFormExpDays(30);
      
      fetchLicenses();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar licença");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    const action = currentActive ? "revogar" : "reativar";
    const ok = await confirm(`Deseja ${action} esta licença?`, { title: action === "revogar" ? "Revogar Licença" : "Reativar Licença", destructive: action === "revogar" });
    if (!ok) return;

    const { error } = await (supabase as any)
      .from("licenses")
      .update({ is_active: !currentActive })
      .eq("id", id);

    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success(`Licença ${action === "revogar" ? "revogada" : "reativada"}`);
    fetchLicenses();
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm("Excluir permanentemente esta licença?", { title: "Excluir Licença", destructive: true });
    if (!ok) return;

    const { error } = await (supabase as any).from("licenses").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Licença excluída");
    fetchLicenses();
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Chave copiada!");
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getHeartbeatStatus = (heartbeat: string | null) => {
    if (!heartbeat) return { label: "Nunca conectou", color: "text-muted-foreground" };
    const diff = Date.now() - new Date(heartbeat).getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 12) return { label: "Online", color: "text-emerald-500" };
    if (hours < 48) return { label: "Offline recente", color: "text-yellow-500" };
    return { label: "Offline", color: "text-destructive" };
  };

  const isExpired = (exp: string) => new Date(exp) < new Date();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Licenças de Espelhos</h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {licenses.filter(l => l.is_active && !isExpired(l.expires_at)).length} ativas
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchLicenses} className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Nova Licença
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Gerar Nova Licença</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Nome do Espelho *</label>
              <input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                placeholder="Ex: Cliente João"
              />
            </div>
            <div>
              <label className="text-xs text-foreground font-medium mb-1 block">Domínio <span className="text-destructive">*</span></label>
              <input
                required
                value={formDomain}
                onChange={e => setFormDomain(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
                placeholder="Ex: app.cliente.com"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Validade (dias)</label>
              <input
                type="number"
                value={formExpDays}
                onChange={e => setFormExpDays(Number(e.target.value))}
                min={1}
                max={3650}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Máx. Usuários</label>
              <input
                type="number"
                value={formMaxUsers}
                onChange={e => setFormMaxUsers(Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm text-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Gerar Licença
            </button>
          </div>
        </div>
      )}

      {/* Licenses List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : licenses.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Nenhuma licença criada ainda
        </div>
      ) : (
        <div className="space-y-3">
          {licenses.map(lic => {
            const heartbeat = getHeartbeatStatus(lic.last_heartbeat_at);
            const expired = isExpired(lic.expires_at);
            const keyVisible = visibleKeys.has(lic.id);

            return (
              <div
                key={lic.id}
                className={`bg-card border rounded-2xl p-4 space-y-3 ${
                  !lic.is_active ? "border-destructive/30 opacity-70" :
                  expired ? "border-yellow-500/30" :
                  "border-border"
                }`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{lic.mirror_name}</span>
                      {!lic.is_active && (
                        <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">REVOGADA</span>
                      )}
                      {lic.is_active && expired && (
                        <span className="text-[10px] bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full font-semibold">EXPIRADA</span>
                      )}
                      {lic.is_active && !expired && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-semibold">ATIVA</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      {lic.mirror_domain && (
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{lic.mirror_domain}</span>
                      )}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />Máx {lic.max_users}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Exp: {new Date(lic.expires_at).toLocaleDateString("pt-BR")}</span>
                      <span className={`flex items-center gap-1 ${heartbeat.color}`}>
                        {heartbeat.label === "Online" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {heartbeat.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggle(lic.id, lic.is_active)}
                      className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      title={lic.is_active ? "Revogar" : "Reativar"}
                    >
                      {lic.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-muted-foreground" />}
                    </button>
                    <button
                      onClick={() => handleDelete(lic.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>

                {/* License key */}
                <div className="flex items-center gap-2 bg-muted/30 rounded-xl px-3 py-2">
                  <KeyRound className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <code className="text-xs text-muted-foreground flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
                    {keyVisible ? lic.license_key : `${lic.license_key.slice(0, 20)}...${lic.license_key.slice(-10)}`}
                  </code>
                  <button onClick={() => toggleKeyVisibility(lic.id)} className="p-1 hover:bg-muted rounded transition-colors">
                    {keyVisible ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                  </button>
                  <button onClick={() => copyKey(lic.license_key)} className="p-1 hover:bg-muted rounded transition-colors">
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>

                {/* Last heartbeat */}
                {lic.last_heartbeat_at && (
                  <p className="text-[10px] text-muted-foreground">
                    Último heartbeat: {formatFullDateTimeBR(lic.last_heartbeat_at)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary" /> Como funciona
        </h4>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Gere uma licença e envie a <b>chave</b> ao operador do espelho</li>
          <li>No espelho, o admin salva a chave em <b>Configurações → Licença</b></li>
          <li>O espelho valida a cada 6h contra seu servidor — sem licença válida, fica bloqueado</li>
          <li>Você pode <b>revogar instantaneamente</b> qualquer licença a qualquer momento</li>
          <li>O domínio (se definido) impede que a chave seja usada em outro site</li>
        </ul>
      </div>
    </div>
  );
}

export default function LicenseManager() {
  if (!isMasterDomain()) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <Shield className="w-12 h-12 text-muted-foreground/50" />
        <h2 className="text-lg font-bold text-foreground">Recurso Indisponível</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          O gerenciamento de licenças está disponível apenas no servidor principal.
        </p>
      </div>
    );
  }
  return <LicenseManagerContent />;
}
