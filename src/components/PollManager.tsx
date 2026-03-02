import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Plus, Trash2, ToggleLeft, ToggleRight, Eye, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface PollOption {
  label: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  active: boolean;
  total_votes: number;
  created_at: string;
  expires_at: string | null;
}

export function PollManager() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [creating, setCreating] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [pollVotes, setPollVotes] = useState<{ option_index: number; created_at: string }[]>([]);

  const fetchPolls = useCallback(async () => {
    setLoading(true);
    // Admin can see all polls - use service role via direct query
    const { data, error } = await supabase
      .from("polls")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setPolls(data.map(p => ({
        id: p.id,
        question: p.question,
        options: (p.options as any) || [],
        active: p.active,
        total_votes: p.total_votes || 0,
        created_at: p.created_at,
        expires_at: p.expires_at,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPolls(); }, [fetchPolls]);

  // Realtime updates for votes
  useEffect(() => {
    const channel = supabase
      .channel("poll-manager-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "poll_votes" }, (payload) => {
        const vote = payload.new as any;
        setPolls(prev => prev.map(p => {
          if (p.id !== vote.poll_id) return p;
          const newOpts = [...p.options];
          if (newOpts[vote.option_index]) {
            newOpts[vote.option_index] = { ...newOpts[vote.option_index], votes: (newOpts[vote.option_index].votes || 0) + 1 };
          }
          return { ...p, options: newOpts, total_votes: p.total_votes + 1 };
        }));
        // Update selected poll detail
        if (selectedPoll?.id === vote.poll_id) {
          setPollVotes(prev => [...prev, { option_index: vote.option_index, created_at: vote.created_at }]);
          setSelectedPoll(prev => {
            if (!prev) return prev;
            const newOpts = [...prev.options];
            if (newOpts[vote.option_index]) {
              newOpts[vote.option_index] = { ...newOpts[vote.option_index], votes: (newOpts[vote.option_index].votes || 0) + 1 };
            }
            return { ...prev, options: newOpts, total_votes: prev.total_votes + 1 };
          });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "polls" }, () => {
        fetchPolls();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedPoll?.id, fetchPolls]);

  const handleCreate = async () => {
    const trimmedQ = question.trim();
    const trimmedOpts = options.map(o => o.trim()).filter(o => o.length > 0);
    if (!trimmedQ) { toast.error("Digite a pergunta"); return; }
    if (trimmedOpts.length < 2) { toast.error("Mínimo 2 opções"); return; }
    if (!user?.id) return;

    setCreating(true);
    const optionsData = trimmedOpts.map(label => ({ label, votes: 0 }));
    const { error } = await supabase.from("polls").insert({
      question: trimmedQ,
      options: optionsData as any,
      created_by: user.id,
      active: false,
    });
    if (error) { toast.error("Erro: " + error.message); }
    else {
      toast.success("Enquete criada!");
      setQuestion("");
      setOptions(["", ""]);
      setShowCreate(false);
      fetchPolls();
    }
    setCreating(false);
  };

  const toggleActive = async (poll: Poll) => {
    // If activating, deactivate all others first
    if (!poll.active) {
      await supabase.from("polls").update({ active: false }).neq("id", poll.id);
    }
    const { error } = await supabase.from("polls").update({ active: !poll.active }).eq("id", poll.id);
    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success(poll.active ? "Enquete desativada" : "Enquete ativada!");
      fetchPolls();
    }
  };

  const deletePoll = async (id: string) => {
    const { error } = await supabase.from("polls").delete().eq("id", id);
    if (error) toast.error("Erro: " + error.message);
    else { toast.success("Enquete excluída"); fetchPolls(); if (selectedPoll?.id === id) setSelectedPoll(null); }
  };

  const viewPollDetails = async (poll: Poll) => {
    setSelectedPoll(poll);
    const { data } = await supabase
      .from("poll_votes")
      .select("option_index, created_at")
      .eq("poll_id", poll.id)
      .order("created_at", { ascending: false });
    setPollVotes(data || []);
  };

  const totalVotes = (poll: Poll) => poll.options.reduce((s, o) => s + (o.votes || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" /> Enquetes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Crie enquetes e acompanhe a votação em tempo real.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity glow-primary text-sm"
        >
          <Plus className="w-4 h-4" /> Nova Enquete
        </button>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl p-6 w-full max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Nova Enquete</h3>
                <button onClick={() => setShowCreate(false)} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Pergunta</label>
                  <input
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Qual operadora você mais usa?"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Opções</label>
                  <div className="space-y-2">
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={opt}
                          onChange={e => {
                            const newOpts = [...options];
                            newOpts[i] = e.target.value;
                            setOptions(newOpts);
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder={`Opção ${i + 1}`}
                          maxLength={100}
                        />
                        {options.length > 2 && (
                          <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {options.length < 6 && (
                    <button onClick={() => setOptions([...options, ""])} className="mt-2 text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                      <Plus className="h-3 w-3" /> Adicionar opção
                    </button>
                  )}
                </div>

                <button
                  onClick={handleCreate}
                  disabled={creating}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                  {creating ? "Criando..." : "Criar Enquete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Poll Detail Modal */}
      <AnimatePresence>
        {selectedPoll && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedPoll(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-modal rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">Resultados</h3>
                <button onClick={() => setSelectedPoll(null)} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>

              <p className="font-semibold text-foreground mb-4">{selectedPoll.question}</p>

              <div className="space-y-3 mb-4">
                {selectedPoll.options.map((opt, i) => {
                  const tv = totalVotes(selectedPoll);
                  const pct = tv > 0 ? Math.round(((opt.votes || 0) / tv) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-foreground">{opt.label}</span>
                        <span className="text-muted-foreground">{opt.votes || 0} ({pct}%)</span>
                      </div>
                      <div className="h-3 bg-muted/40 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center text-sm font-semibold text-foreground">
                Total: {totalVotes(selectedPoll)} votos
              </div>

              {pollVotes.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Últimos votos</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {pollVotes.slice(0, 20).map((v, i) => (
                      <div key={i} className="flex justify-between text-xs text-muted-foreground">
                        <span>{selectedPoll.options[v.option_index]?.label || `Opção ${v.option_index + 1}`}</span>
                        <span>{new Date(v.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Polls List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : polls.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma enquete criada ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {polls.map(poll => {
            const tv = totalVotes(poll);
            return (
              <div key={poll.id} className="glass-card rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {poll.active && (
                        <span className="px-2 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-bold uppercase tracking-wider">Ativa</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(poll.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="font-semibold text-foreground text-sm truncate">{poll.question}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {poll.options.length} opções • {tv} voto{tv !== 1 ? "s" : ""}
                    </p>

                    {/* Mini bar chart */}
                    <div className="flex items-center gap-1 mt-2">
                      {poll.options.map((opt, i) => {
                        const pct = tv > 0 ? ((opt.votes || 0) / tv) * 100 : 0;
                        return (
                          <div key={i} className="flex-1" title={`${opt.label}: ${opt.votes || 0}`}>
                            <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                              <div className="h-full bg-primary/70 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => viewPollDetails(poll)} title="Ver resultados"
                      className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button onClick={() => toggleActive(poll)} title={poll.active ? "Desativar" : "Ativar"}
                      className={`p-2 rounded-lg transition-colors ${poll.active ? "text-success hover:bg-success/10" : "text-muted-foreground hover:bg-muted/50"}`}>
                      {poll.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </button>
                    <button onClick={() => deletePoll(poll.id)} title="Excluir"
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
