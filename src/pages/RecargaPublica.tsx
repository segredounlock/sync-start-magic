import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnimatedPage, AnimatedCard } from "@/components/AnimatedPage";
import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, Zap, Shield, Send, MessageCircle } from "lucide-react";

interface Operadora {
  id: string;
  nome: string;
  valores: number[];
}

interface PriceMap {
  [key: string]: number; // "operadoraId-valor" => preço final para o cliente
}

interface RevendedorInfo {
  id: string;
  nome: string | null;
  telegram_username: string | null;
  whatsapp_number: string | null;
  active: boolean;
  store_name: string | null;
  store_logo_url: string | null;
  store_primary_color: string | null;
  store_secondary_color: string | null;
}

export default function RecargaPublica() {
  const [searchParams] = useSearchParams();
  const { slug } = useParams<{ slug: string }>();
  const refParam = searchParams.get("ref") || searchParams.get("revendedor");

  const [revendedor, setRevendedor] = useState<RevendedorInfo | null>(null);
  const [operadoras, setOperadoras] = useState<Operadora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [step, setStep] = useState<"landing" | "form" | "confirm" | "done">("landing");
  const [telefone, setTelefone] = useState("");
  const [selectedOp, setSelectedOp] = useState("");
  const [selectedValor, setSelectedValor] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [priceMap, setPriceMap] = useState<PriceMap>({});

  useEffect(() => {
    if (!slug && !refParam) {
      setError("Link de recarga inválido. Entre em contato com o revendedor.");
      setLoading(false);
      return;
    }
    loadData();
  }, [slug, refParam]);

  const loadData = async () => {
    try {
      let revendedorId = refParam;

      // Resolve slug to user ID
      if (slug && !revendedorId) {
        const { data: profileBySlug } = await supabase
          .from("profiles")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();
        if (!profileBySlug) {
          setError("Loja não encontrada. Verifique o link.");
          setLoading(false);
          return;
        }
        revendedorId = profileBySlug.id;
      }

      if (!revendedorId) {
        setError("Link de recarga inválido.");
        setLoading(false);
        return;
      }

      const [{ data: profile }, { data: role }, { data: ops }, { data: resellerPricing }, { data: globalPricing }] = await Promise.all([
        supabase.from("profiles").select("id, nome, telegram_username, whatsapp_number, active, store_name, store_logo_url, store_primary_color, store_secondary_color").eq("id", revendedorId).single(),
        supabase.from("user_roles").select("role").eq("user_id", revendedorId).eq("role", "revendedor").maybeSingle(),
        supabase.from("operadoras").select("*").eq("ativo", true).order("nome"),
        supabase.from("reseller_pricing_rules").select("*").eq("user_id", revendedorId),
        supabase.from("pricing_rules").select("*"),
      ]);

      if (!profile || !role) {
        setError("Revendedor não encontrado ou inválido.");
        setLoading(false);
        return;
      }
      if (!(profile as any).active) {
        setError("Este revendedor está temporariamente inativo.");
        setLoading(false);
        return;
      }

      // Build price map: reseller pricing takes precedence over global
      const pm: PriceMap = {};
      // First load global prices
      (globalPricing || []).forEach((r: any) => {
        const precoFinal = r.tipo_regra === "fixo" ? Number(r.regra_valor) : Number(r.valor_recarga) * (1 + Number(r.regra_valor) / 100);
        if (precoFinal > 0) pm[`${r.operadora_id}-${r.valor_recarga}`] = precoFinal;
      });
      // Override with reseller-specific prices
      (resellerPricing || []).forEach((r: any) => {
        const precoFinal = r.tipo_regra === "fixo" ? Number(r.regra_valor) : Number(r.valor_recarga) * (1 + Number(r.regra_valor) / 100);
        if (precoFinal > 0) pm[`${r.operadora_id}-${r.valor_recarga}`] = precoFinal;
      });
      setPriceMap(pm);

      setRevendedor(profile as any as RevendedorInfo);
      setOperadoras((ops || []).map(o => ({ ...o, valores: (o.valores as unknown as number[]) || [] })));
    } catch {
      setError("Erro ao carregar dados.");
    }
    setLoading(false);
  };

  const currentOp = operadoras.find(o => o.nome === selectedOp);
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const getPrice = (opId: string, faceValue: number) => priceMap[`${opId}-${faceValue}`] || faceValue;

  // Custom branding
  const brandColor = revendedor?.store_primary_color || undefined;
  const brandBg = revendedor?.store_secondary_color || undefined;
  const brandName = revendedor?.store_name || "Recargas Brasil";
  const brandLogo = revendedor?.store_logo_url || null;

  const handleSubmit = async () => {
    if (!telefone.trim() || !selectedValor || !revendedor?.id) return;
    setSending(true);
    try {
      const { data: saldoData } = await supabase.from("saldos").select("valor").eq("user_id", revendedor.id).eq("tipo", "revenda").single();
      const saldo = Number(saldoData?.valor) || 0;

      if (saldo < selectedValor) {
        if (revendedor?.whatsapp_number) {
          setResultMsg("Saldo insuficiente do revendedor. Redirecionando para WhatsApp...");
          setTimeout(() => window.open(revendedor.whatsapp_number!, "_blank"), 1500);
        } else if (revendedor?.telegram_username) {
          setResultMsg("Saldo insuficiente do revendedor. Redirecionando para Telegram...");
          setTimeout(() => window.open(revendedor.telegram_username!, "_blank"), 1500);
        } else {
          setResultMsg("Revendedor sem saldo disponível. Tente novamente mais tarde.");
        }
        setStep("done");
        setSending(false);
        return;
      }

      const { error: recError } = await supabase.from("recargas").insert({
        user_id: revendedor.id,
        telefone: telefone.trim(),
        operadora: selectedOp || null,
        valor: selectedValor,
        custo: selectedValor,
        status: "completed",
      });
      if (recError) throw recError;

      const newSaldo = saldo - selectedValor;
      await supabase.from("saldos").update({ valor: newSaldo }).eq("user_id", revendedor.id).eq("tipo", "revenda");

      supabase.functions.invoke("telegram-notify", {
        body: {
          type: "recarga_completed",
          user_id: revendedor.id,
          data: { telefone: telefone.trim(), operadora: selectedOp || null, valor: selectedValor, novo_saldo: newSaldo },
        },
      }).catch(() => {});

      setResultMsg(`Recarga de ${fmt(selectedValor)} realizada com sucesso para ${telefone}!`);
      setStep("done");
    } catch (err: any) {
      setResultMsg(err.message || "Erro ao processar recarga.");
      setStep("done");
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <AnimatedCard className="glass-modal rounded-xl p-8 max-w-md text-center">
          <h1 className="font-display text-2xl font-bold text-destructive mb-3">Acesso Negado</h1>
          <p className="text-muted-foreground">{error}</p>
        </AnimatedCard>
      </div>
    );
  }

  // Apply custom CSS vars for branding
  const customStyle: React.CSSProperties = {
    ...(brandBg ? { backgroundColor: brandBg } : {}),
  };

  const btnStyle: React.CSSProperties = brandColor
    ? { backgroundColor: brandColor, color: "#fff" }
    : {};

  const btnActiveStyle = (active: boolean): React.CSSProperties =>
    active && brandColor
      ? { backgroundColor: brandColor, color: "#fff", borderColor: brandColor }
      : {};

  return (
    <div className="min-h-screen relative" style={customStyle}>
      {/* Header */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <AnimatedPage className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {brandLogo ? (
              <img src={brandLogo} alt={brandName} className="h-14 mx-auto mb-2 rounded-xl object-contain" />
            ) : null}
            <h1 className="font-display text-3xl font-bold" style={brandBg ? { color: "#fff" } : undefined}>
              {brandName.includes(" ") ? (
                <>
                  {brandName.split(" ").slice(0, -1).join(" ")}{" "}
                  <span style={brandColor ? { color: brandColor } : undefined} className={!brandColor ? "text-primary glow-text" : undefined}>
                    {brandName.split(" ").slice(-1)}
                  </span>
                </>
              ) : (
                <span style={brandColor ? { color: brandColor } : undefined} className={!brandColor ? "text-primary glow-text" : undefined}>
                  {brandName}
                </span>
              )}
            </h1>
            {revendedor?.nome && !revendedor.store_name && (
              <p className="text-sm text-muted-foreground mt-1">Revendedor: {revendedor.nome}</p>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Landing */}
            {step === "landing" && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-modal rounded-xl p-8 text-center"
              >
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Recarga de Celular <span style={brandColor ? { color: brandColor } : undefined} className={!brandColor ? "text-primary" : undefined}>na Hora</span>
                </h2>
                <p className="text-muted-foreground mb-6">
                  Escolha sua operadora, o valor e recarregue instantaneamente.
                </p>
                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                  {[
                    { icon: Smartphone, text: "Todas as operadoras" },
                    { icon: Zap, text: "Instantâneo" },
                    { icon: Shield, text: "Seguro" },
                  ].map((item, i) => (
                    <motion.span
                      key={item.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-medium text-foreground"
                    >
                      <item.icon className="h-3.5 w-3.5" style={brandColor ? { color: brandColor } : undefined} />
                      {item.text}
                    </motion.span>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("form")}
                  className={`w-full py-3 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`}
                  style={btnStyle}
                >
                  Fazer recarga agora
                </motion.button>
              </motion.div>
            )}

            {/* Form */}
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="glass-modal rounded-xl p-6"
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Dados da Recarga</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Telefone *</label>
                    <input
                      type="tel"
                      value={telefone}
                      onChange={e => setTelefone(e.target.value)}
                      maxLength={15}
                      className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Operadora</label>
                    <select
                      value={selectedOp}
                      onChange={e => { setSelectedOp(e.target.value); setSelectedValor(null); }}
                      className="w-full px-3 py-2.5 rounded-lg glass-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Selecione...</option>
                      {operadoras.map(op => (
                        <option key={op.id} value={op.nome}>{op.nome}</option>
                      ))}
                    </select>
                  </div>
                  {currentOp && currentOp.valores.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Valor</label>
                      <div className="grid grid-cols-3 gap-2">
                        {currentOp.valores.map((v, i) => {
                          const displayPrice = getPrice(currentOp.id, v);
                          const hasCustomPrice = displayPrice !== v;
                          return (
                            <motion.button
                              key={v}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.05 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              type="button"
                              onClick={() => setSelectedValor(v)}
                              className={`py-2.5 rounded-lg text-sm font-bold border transition-all ${
                                selectedValor === v
                                  ? (!brandColor ? "bg-primary text-primary-foreground border-primary glow-primary" : "text-white")
                                  : "border-border text-foreground hover:bg-muted glass"
                              }`}
                              style={btnActiveStyle(selectedValor === v)}
                            >
                              {fmt(displayPrice)}
                              {hasCustomPrice && <span className="block text-[10px] font-normal opacity-70">Recarga {fmt(v)}</span>}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep("landing")}
                      className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Voltar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (!telefone.trim() || !selectedValor) return;
                        setStep("confirm");
                      }}
                      disabled={!telefone.trim() || !selectedValor}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-opacity ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`}
                      style={btnStyle}
                    >
                      Continuar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Confirm */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="glass-modal rounded-xl p-6"
              >
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Confirmar Recarga</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Telefone</span>
                    <span className="font-mono font-medium text-foreground">{telefone}</span>
                  </div>
                  {selectedOp && (
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Operadora</span>
                      <span className="font-medium text-foreground">{selectedOp}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Valor da Recarga</span>
                    <span className="text-xl font-bold" style={brandColor ? { color: brandColor } : undefined}>
                      {selectedValor && currentOp ? fmt(getPrice(currentOp.id, selectedValor)) : selectedValor ? fmt(selectedValor) : "—"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("form")}
                    className="flex-1 py-2.5 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Voltar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={sending}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 ${!brandColor ? "bg-primary text-primary-foreground glow-primary" : ""}`}
                    style={btnStyle}
                  >
                    {sending ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Confirmar
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Done */}
            {step === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-modal rounded-xl p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.2 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={brandColor ? { backgroundColor: `${brandColor}22` } : undefined}
                >
                  {resultMsg.includes("sucesso") ? (
                    <Zap className="h-8 w-8" style={brandColor ? { color: brandColor } : undefined} />
                  ) : (
                    <Shield className="h-8 w-8 text-warning" />
                  )}
                </motion.div>
                <p className="text-foreground font-medium mb-6">{resultMsg}</p>
                <button
                  onClick={() => { setStep("landing"); setTelefone(""); setSelectedOp(""); setSelectedValor(null); }}
                  className={`px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity ${!brandColor ? "bg-primary text-primary-foreground" : ""}`}
                  style={btnStyle}
                >
                  Nova Recarga
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnimatedPage>

      {/* Floating contacts */}
      <AnimatePresence>
        {revendedor?.telegram_username && (
          <motion.a
            key="telegram"
            href={revendedor.telegram_username}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #0088cc, #0077b5)" }}
          >
            <Send className="h-6 w-6 text-white" />
          </motion.a>
        )}
        {revendedor?.whatsapp_number && (
          <motion.a
            key="whatsapp"
            href={revendedor.whatsapp_number}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 1, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}