import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Zap, Clock, AlertTriangle, Loader2, Play } from 'lucide-react';

interface BroadcastProgressData {
  id: string;
  notification_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  total_users: number;
  sent_count: number;
  failed_count: number;
  blocked_count: number;
  current_batch: number;
  total_batches: number;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  speed_per_second: number;
  estimated_completion: string | null;
}

interface BroadcastProgressProps {
  progressId: string;
  notificationTitle?: string;
  onComplete?: () => void;
  onResume?: (progressId: string) => Promise<void>;
}

export function BroadcastProgress({ progressId, notificationTitle, onComplete, onResume }: BroadcastProgressProps) {
  const [progress, setProgress] = useState<BroadcastProgressData | null>(null);
  const [resuming, setResuming] = useState(false);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data } = await supabase
        .from('broadcast_progress' as any)
        .select('*')
        .eq('id', progressId)
        .single();
      if (data) {
        const d = data as any as BroadcastProgressData;
        setProgress(d);
        // If broadcast already finished while user was away, notify
        if (d.status === 'completed' || d.status === 'failed') {
          onComplete?.();
        }
      }
    };

    fetchProgress();

    const channel = supabase
      .channel(`broadcast-progress-${progressId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'broadcast_progress',
        filter: `id=eq.${progressId}`,
      }, (payload) => {
        const newData = payload.new as any as BroadcastProgressData;
        setProgress(newData);
        if (newData.status === 'completed' || newData.status === 'failed') {
          onComplete?.();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [progressId, onComplete]);

  const handleResume = async () => {
    if (!onResume || !progress) return;
    setResuming(true);
    try { await onResume(progress.id); } finally { setResuming(false); }
  };

  if (!progress) {
    return (
      <div className="glass-modal rounded-xl p-4 flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  const percentage = progress.total_users > 0
    ? Math.round(((progress.sent_count + progress.failed_count) / progress.total_users) * 100)
    : 0;

  const canResume = ['cancelled', 'failed'].includes(progress.status) &&
    (progress.sent_count + progress.failed_count) < progress.total_users;

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    running: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-green-500/20 text-green-400',
    failed: 'bg-red-500/20 text-red-400',
    cancelled: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <div className="glass-modal rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/30">
        <div className="flex items-center gap-2">
          {progress.status === 'running' && <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />}
          {progress.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {progress.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
          {progress.status === 'cancelled' && <AlertTriangle className="w-5 h-5 text-orange-500" />}
          {progress.status === 'pending' && <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />}
          <span className="font-medium text-sm text-foreground">{notificationTitle || 'Broadcast'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[progress.status] || ''}`}>
            {progress.status === "pending" ? "Aguardando" : progress.status === "running" ? "Enviando" : progress.status === "completed" ? "Concluído" : progress.status === "failed" ? "Falhou" : progress.status === "cancelled" ? "Cancelado" : progress.status}
          </span>
          {canResume && onResume && (
            <button
              onClick={handleResume}
              disabled={resuming}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50"
            >
              {resuming ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Play className="w-3 h-3" /> Retomar</>}
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span>{percentage}%</span>
          </div>
          <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 rounded-lg bg-green-500/10">
            <div className="text-lg font-bold text-green-500">{progress.sent_count}</div>
            <div className="text-[10px] text-muted-foreground">Enviados</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-500/10">
            <div className="text-lg font-bold text-red-500">{progress.failed_count}</div>
            <div className="text-[10px] text-muted-foreground">Falhas</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-500/10">
            <div className="text-lg font-bold text-orange-500">{progress.blocked_count}</div>
            <div className="text-[10px] text-muted-foreground">Bloqueados</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-primary/10">
            <div className="text-lg font-bold text-primary">{progress.total_users}</div>
            <div className="text-[10px] text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Speed info */}
        {progress.status === 'running' && (
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/30 pt-3">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>{progress.speed_per_second} msg/s</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Batch {progress.current_batch}/{progress.total_batches}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {progress.error_message && (
          <div className="text-xs p-2 rounded-lg bg-red-500/10 text-red-400">
            {progress.error_message}
          </div>
        )}
      </div>
    </div>
  );
}
