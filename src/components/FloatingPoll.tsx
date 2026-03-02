import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, X, Check, ChevronUp } from "lucide-react";

interface PollOption {
  label: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  total_votes: number;
  expires_at: string | null;
}

export function FloatingPoll() {
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [voted, setVoted] = useState(false);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fetchActivePoll = useCallback(async () => {
    const { data } = await supabase
      .from("polls")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      const p = data[0];
      setPoll({
        id: p.id,
        question: p.question,
        options: (p.options as any) || [],
        total_votes: p.total_votes || 0,
        expires_at: p.expires_at,
      });
      setDismissed(false);

      // Check if user already voted
      if (user?.id) {
        const { data: voteData } = await supabase
          .from("poll_votes")
          .select("option_index")
          .eq("poll_id", p.id)
          .eq("user_id", user.id)
          .maybeSingle();
        if (voteData) {
          setVoted(true);
          setVotedIndex(voteData.option_index);
        } else {
          setVoted(false);
          setVotedIndex(null);
        }
      }
    } else {
      setPoll(null);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchActivePoll();
  }, [fetchActivePoll]);

  // Realtime: listen for poll changes and new votes
  useEffect(() => {
    const pollChannel = supabase
      .channel("floating-poll-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "polls" }, () => {
        fetchActivePoll();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "poll_votes" }, (payload) => {
        // Update vote counts in real-time
        const newVote = payload.new as any;
        if (poll && newVote.poll_id === poll.id) {
          setPoll(prev => {
            if (!prev) return prev;
            const newOptions = [...prev.options];
            if (newOptions[newVote.option_index]) {
              newOptions[newVote.option_index] = {
                ...newOptions[newVote.option_index],
                votes: (newOptions[newVote.option_index].votes || 0) + 1,
              };
            }
            return { ...prev, options: newOptions, total_votes: prev.total_votes + 1 };
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(pollChannel); };
  }, [poll?.id, fetchActivePoll]);

  const handleVote = async (index: number) => {
    if (!user?.id || !poll || voted || voting) return;
    setVoting(true);
    try {
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: poll.id,
        user_id: user.id,
        option_index: index,
      });
      if (error) {
        if (error.message.includes("duplicate")) {
          setVoted(true);
          setVotedIndex(index);
        }
        return;
      }
      setVoted(true);
      setVotedIndex(index);
      // Update local count
      setPoll(prev => {
        if (!prev) return prev;
        const newOptions = [...prev.options];
        if (newOptions[index]) {
          newOptions[index] = { ...newOptions[index], votes: (newOptions[index].votes || 0) + 1 };
        }
        return { ...prev, options: newOptions, total_votes: prev.total_votes + 1 };
      });
    } catch { /* */ }
    setVoting(false);
  };

  if (!poll || dismissed) return null;

  const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes || 0), 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.9 }}
        className="fixed bottom-20 right-4 z-30 w-[calc(100%-2rem)] max-w-xs"
      >
        {minimized ? (
          <button
            onClick={() => setMinimized(false)}
            className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card glow-primary text-sm font-semibold text-foreground shadow-lg"
          >
            <BarChart3 className="h-4 w-4 text-primary" />
            Enquete
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        ) : (
          <div className="glass-modal rounded-2xl p-4 shadow-2xl border border-primary/20">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/15">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Enquete</span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setMinimized(true)} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground">
                  <ChevronUp className="h-3.5 w-3.5 rotate-180" />
                </button>
                <button onClick={() => setDismissed(true)} className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Question */}
            <p className="text-sm font-bold text-foreground mb-3 leading-snug">{poll.question}</p>

            {/* Options */}
            <div className="space-y-2">
              {poll.options.map((opt, i) => {
                const pct = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                const isMyVote = votedIndex === i;

                return (
                  <button
                    key={i}
                    onClick={() => handleVote(i)}
                    disabled={voted || voting}
                    className={`w-full relative rounded-xl text-left text-sm transition-all overflow-hidden ${
                      voted
                        ? "cursor-default"
                        : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    } ${isMyVote ? "ring-2 ring-primary/50" : ""}`}
                  >
                    {/* Background bar */}
                    {voted && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`absolute inset-y-0 left-0 rounded-xl ${isMyVote ? "bg-primary/20" : "bg-muted/60"}`}
                      />
                    )}
                    <div className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl border ${
                      voted ? "border-border/50" : "border-border hover:border-primary/40 bg-muted/30"
                    }`}>
                      <span className={`font-medium ${isMyVote ? "text-primary" : "text-foreground"}`}>
                        {isMyVote && <Check className="h-3.5 w-3.5 inline mr-1.5" />}
                        {opt.label}
                      </span>
                      {voted && (
                        <span className="text-xs font-semibold text-muted-foreground ml-2 shrink-0">{pct}%</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <p className="text-[10px] text-muted-foreground mt-2.5 text-center">
              {totalVotes} voto{totalVotes !== 1 ? "s" : ""}
              {voted && " • Obrigado pelo seu voto!"}
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
