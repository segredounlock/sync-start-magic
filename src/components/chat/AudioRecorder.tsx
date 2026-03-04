import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Mic, Square, Send, Trash2, Loader2 } from "lucide-react";

interface AudioRecorderProps {
  onSend: (audioUrl: string) => void;
  onCancel: () => void;
  onTypingPing?: () => void;
}

export function AudioRecorder({ onSend, onCancel, onTypingPing }: AudioRecorderProps) {
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
        mediaRecorder.current.stop();
      }
      // Always stop all mic tracks on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 48000, channelCount: 1 },
      });
      streamRef.current = stream;
      
      // Try higher quality codec first, fallback to default
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 128000 });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start(100);
      mediaRecorder.current = recorder;
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);

      // Ping typing indicator every 2.5s to keep "gravando áudio" visible
      if (onTypingPing) {
        onTypingPing();
        const pingInterval = setInterval(() => onTypingPing(), 2500);
        recorder.addEventListener("stop", () => clearInterval(pingInterval), { once: true });
      }
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
    setUploadProgress(0);

    // Simulate progress while uploading
    const progressInterval = setInterval(() => {
      setUploadProgress(p => {
        if (p >= 90) return 90;
        return p + 5;
      });
    }, 200);

    try {
      const fileName = `${user.id}/${Date.now()}.webm`;
      
      // Upload with 30s timeout to prevent hanging at 90%
      const uploadPromise = supabase.storage.from("chat-audio").upload(fileName, audioBlob, { contentType: "audio/webm" });
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Upload timeout (30s)")), 30000)
      );
      
      const { error } = await Promise.race([uploadPromise, timeoutPromise]);
      
      clearInterval(progressInterval);
      
      if (error) {
        console.error("Audio upload error:", error);
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      setUploadProgress(100);

      const { data: urlData } = supabase.storage.from("chat-audio").getPublicUrl(fileName);

      // Brief delay to show 100% then send
      await new Promise(resolve => setTimeout(resolve, 300));
      onSend(urlData.publicUrl);
    } catch (err: any) {
      console.error("Audio upload exception:", err?.message || err);
      clearInterval(progressInterval);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Waveform bars animation
  const bars = Array.from({ length: 20 }, (_, i) => i);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="flex flex-col border-t border-border bg-card/80 backdrop-blur-sm"
    >
      {/* Upload progress bar */}
      {uploading && (
        <div className="h-1 bg-muted/50 overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${uploadProgress}%` }}
            transition={{ ease: "easeOut" }}
          />
        </div>
      )}

      <div className="flex items-center gap-3 px-4 py-3">
        {/* Cancel / Delete */}
        <button
          onClick={() => { stopRecording(); onCancel(); }}
          disabled={uploading}
          className="p-2.5 rounded-xl hover:bg-destructive/10 transition-colors disabled:opacity-40"
        >
          <Trash2 className="h-5 w-5 text-destructive" />
        </button>

        <div className="flex-1 flex items-center gap-3 min-w-0">
          {/* Visual waveform */}
          {recording && (
            <div className="flex items-center gap-[2px] h-6">
              {bars.map(i => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-full bg-primary"
                  animate={{
                    height: [4, 10 + Math.random() * 14, 4],
                  }}
                  transition={{
                    duration: 0.6 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay: i * 0.04,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Audio preview when stopped */}
          {!recording && audioUrl && (
            <audio src={audioUrl} controls className="h-8 flex-1 max-w-[200px]" style={{ minWidth: 0 }} />
          )}

          {/* Recording indicator */}
          {recording && (
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2.5 h-2.5 rounded-full bg-destructive shrink-0"
            />
          )}

          <span className="text-sm font-mono text-foreground tabular-nums shrink-0">{fmtDuration(duration)}</span>

          {uploading && (
            <span className="text-xs text-primary font-medium shrink-0 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Enviando {uploadProgress}%
            </span>
          )}
          {!uploading && recording && <span className="text-xs text-destructive font-medium shrink-0">Gravando...</span>}
          {!uploading && !recording && audioBlob && <span className="text-xs text-muted-foreground shrink-0">Pronto</span>}
        </div>

        {recording ? (
          <button onClick={stopRecording} className="p-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors">
            <Square className="h-5 w-5 text-destructive" />
          </button>
        ) : audioBlob ? (
          <button
            onClick={handleSend}
            disabled={uploading}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:brightness-110 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        ) : null}
      </div>
    </motion.div>
  );
}
