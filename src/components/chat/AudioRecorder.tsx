import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Mic, Square, Send, Trash2 } from "lucide-react";

interface AudioRecorderProps {
  onSend: (audioUrl: string) => void;
  onCancel: () => void;
}

export function AudioRecorder({ onSend, onCancel }: AudioRecorderProps) {
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000 },
      });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(100);
      mediaRecorder.current = recorder;
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (err) {
      console.error("Mic error:", err);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  };

  const handleSend = async () => {
    if (!audioBlob || !user) return;
    setUploading(true);
    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      const { error } = await supabase.storage.from("chat-audio").upload(fileName, audioBlob, { contentType: "audio/webm" });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("chat-audio").getPublicUrl(fileName);
      onSend(urlData.publicUrl);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="flex items-center gap-3 px-4 py-3 border-t border-border bg-card/80 backdrop-blur-sm"
    >
      <button onClick={() => { stopRecording(); onCancel(); }} className="p-2.5 rounded-xl hover:bg-destructive/10 transition-colors">
        <Trash2 className="h-5 w-5 text-destructive" />
      </button>

      <div className="flex-1 flex items-center gap-3">
        {recording && (
          <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-3 h-3 rounded-full bg-destructive" />
        )}
        <span className="text-sm font-mono text-foreground">{fmtDuration(duration)}</span>
        {recording && <span className="text-xs text-muted-foreground">Gravando...</span>}
        {!recording && audioBlob && <span className="text-xs text-muted-foreground">Pronto para enviar</span>}
      </div>

      {recording ? (
        <button onClick={stopRecording} className="p-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors">
          <Square className="h-5 w-5 text-destructive" />
        </button>
      ) : audioBlob ? (
        <button onClick={handleSend} disabled={uploading} className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50">
          {uploading ? (
            <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      ) : null}
    </motion.div>
  );
}
