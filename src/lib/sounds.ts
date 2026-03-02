/**
 * Global AudioContext singleton – unlocked on first user gesture.
 * This ensures notification sounds work on mobile browsers.
 */
let _ctx: AudioContext | null = null;
let _unlocked = false;

function getAudioContext(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _ctx;
}

/** Call once on any user gesture (click/touch) to unlock audio on mobile */
export function unlockAudio() {
  if (_unlocked) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    // Create a silent buffer to fully unlock iOS Safari
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    _unlocked = true;
  } catch {
    // ignore
  }
}

// Auto-unlock on first user interaction
if (typeof window !== "undefined") {
  const unlock = () => {
    unlockAudio();
    window.removeEventListener("click", unlock, true);
    window.removeEventListener("touchstart", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
  window.addEventListener("click", unlock, true);
  window.addEventListener("touchstart", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

function playNotes(
  notes: Array<{ freq: number; type: OscillatorType; delay: number; duration: number; gain: number }>
) {
  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") ctx.resume();

    notes.forEach(({ freq, type, delay, duration, gain: vol }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    });
  } catch {
    // Silently fail if audio not supported
  }
}

/**
 * Play a short success chime (C5-E5-G5 major chord arpeggio).
 */
export function playSuccessSound() {
  playNotes([
    { freq: 523.25, type: "sine", delay: 0, duration: 0.4, gain: 0.15 },
    { freq: 659.25, type: "sine", delay: 0.12, duration: 0.4, gain: 0.15 },
    { freq: 783.99, type: "sine", delay: 0.24, duration: 0.4, gain: 0.15 },
  ]);
}

/**
 * Bright ascending arpeggio for Web signups (C5-E5-G5).
 */
export function playWebSignupSound() {
  playNotes([
    { freq: 523.25, type: "sine", delay: 0, duration: 0.35, gain: 0.18 },
    { freq: 659.25, type: "sine", delay: 0.1, duration: 0.35, gain: 0.18 },
    { freq: 783.99, type: "sine", delay: 0.2, duration: 0.35, gain: 0.18 },
  ]);
}

/**
 * Robotic "bloop-bloop" for Telegram signups (G3-C4).
 */
export function playTelegramSignupSound() {
  playNotes([
    { freq: 196.0, type: "triangle", delay: 0, duration: 0.3, gain: 0.12 },
    { freq: 261.63, type: "square", delay: 0.15, duration: 0.3, gain: 0.12 },
  ]);
}
