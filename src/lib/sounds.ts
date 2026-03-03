/**
 * Global audio manager for notification sounds.
 * Works around mobile autoplay restrictions by unlocking on first user gesture.
 */
let _ctx: AudioContext | null = null;
let _unlocked = false;
let _listenersAttached = false;
const _pendingPlays: Array<() => void> = [];

function getAudioContext(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return _ctx;
}

function flushPending() {
  if (!_unlocked) return;
  const pending = [..._pendingPlays];
  _pendingPlays.length = 0;
  pending.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore individual failures
    }
  });
}

function detachUnlockListeners() {
  if (!_listenersAttached || typeof window === "undefined") return;
  window.removeEventListener("pointerdown", handleUnlockGesture, true);
  window.removeEventListener("touchstart", handleUnlockGesture, true);
  window.removeEventListener("click", handleUnlockGesture, true);
  window.removeEventListener("keydown", handleUnlockGesture, true);
  _listenersAttached = false;
}

function attachUnlockListeners() {
  if (_listenersAttached || typeof window === "undefined") return;
  window.addEventListener("pointerdown", handleUnlockGesture, true);
  window.addEventListener("touchstart", handleUnlockGesture, true);
  window.addEventListener("click", handleUnlockGesture, true);
  window.addEventListener("keydown", handleUnlockGesture, true);
  _listenersAttached = true;
}

function markUnlockedIfRunning(ctx: AudioContext) {
  if (ctx.state === "running") {
    _unlocked = true;
    detachUnlockListeners();
    flushPending();
  }
}

function unlockWithSilentBuffer(ctx: AudioContext) {
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);
}

function handleUnlockGesture() {
  unlockAudio();
}

/**
 * Try to unlock audio playback capability on mobile.
 * Must be called during a user gesture or by unlock listeners.
 */
export function unlockAudio() {
  if (_unlocked) return;

  try {
    const ctx = getAudioContext();

    // Some browsers need resume first; no await to keep this sync-friendly in gesture handlers.
    if (ctx.state === "suspended") {
      ctx.resume().then(() => {
        try {
          markUnlockedIfRunning(ctx);
        } catch {
          // ignore
        }
      }).catch(() => {
        // ignore
      });
    }

    // iOS/Safari unlock trick
    unlockWithSilentBuffer(ctx);
    markUnlockedIfRunning(ctx);

    // Fallback unlock path using HTMLAudio element (helps on some mobile browsers)
    try {
      const el = new Audio();
      el.muted = true;
      el.play().then(() => {
        el.pause();
      }).catch(() => {
        // ignore
      });
    } catch {
      // ignore
    }

    // Keep listeners if still not unlocked yet.
    if (!_unlocked) attachUnlockListeners();
  } catch {
    attachUnlockListeners();
  }
}

function playNotes(
  notes: Array<{ freq: number; type: OscillatorType; delay: number; duration: number; gain: number }>
) {
  const playNow = () => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

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
  };

  // If not unlocked yet, queue once and ensure gesture listeners are active.
  if (!_unlocked) {
    _pendingPlays.push(playNow);
    attachUnlockListeners();
    return;
  }

  playNow();
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
 * Pix confirmation sound for confirmed deposits.
 * Uses the custom Pix.mp3 file.
 */
let _pixAudio: HTMLAudioElement | null = null;

export function playCashRegisterSound() {
  const playNow = () => {
    try {
      if (!_pixAudio) {
        _pixAudio = new Audio("/sounds/pix.mp3");
        _pixAudio.volume = 0.5;
      }
      _pixAudio.currentTime = 0;
      _pixAudio.play().catch(() => {});
    } catch {}
  };

  if (!_unlocked) {
    _pendingPlays.push(playNow);
    attachUnlockListeners();
    return;
  }
  playNow();
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

// Keep unlock listeners ready globally as soon as module loads.
if (typeof window !== "undefined") {
  attachUnlockListeners();
}
