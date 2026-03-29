/**
 * Coleta avançada de fingerprint do dispositivo para anti-fraude.
 * Gera um hash único baseado em 25+ propriedades do navegador/dispositivo.
 */

export interface DeviceFingerprint {
  fingerprint_hash: string;
  user_agent: string;
  platform: string;
  screen_resolution: string;
  timezone: string;
  language: string;
  canvas_hash: string;
  webgl_renderer: string;
  installed_plugins: string;
  touch_support: boolean;
  device_memory: number | null;
  hardware_concurrency: number | null;
  color_depth: number;
  pixel_ratio: number;
  latitude: number | null;
  longitude: number | null;
  geolocation_accuracy: number | null;
  raw_data: Record<string, any>;
}

/** Simple hash function (djb2) for generating fingerprint */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Cwm fjord bank glyphs vext quiz", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("Cwm fjord bank glyphs vext quiz", 4, 17);

    // Additional shapes for stronger fingerprint
    ctx.beginPath();
    ctx.arc(50, 25, 10, 0, Math.PI * 2);
    ctx.fillStyle = "#f0f";
    ctx.fill();

    return hashString(canvas.toDataURL());
  } catch {
    return "canvas-error";
  }
}

function getWebGLFingerprint(): { renderer: string; vendor: string; extensions: string; params: string } {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return { renderer: "no-webgl", vendor: "", extensions: "", params: "" };

    const glCtx = gl as WebGLRenderingContext;
    const debugInfo = glCtx.getExtension("WEBGL_debug_renderer_info");
    
    const renderer = debugInfo 
      ? glCtx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) 
      : "unknown";
    const vendor = debugInfo 
      ? glCtx.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) 
      : "unknown";

    // Collect WebGL extensions
    const extensions = (glCtx.getSupportedExtensions() || []).sort().join(",");

    // Collect key WebGL parameters
    const params = [
      glCtx.getParameter(glCtx.MAX_TEXTURE_SIZE),
      glCtx.getParameter(glCtx.MAX_RENDERBUFFER_SIZE),
      glCtx.getParameter(glCtx.MAX_VIEWPORT_DIMS),
      glCtx.getParameter(glCtx.MAX_VERTEX_ATTRIBS),
      glCtx.getParameter(glCtx.MAX_VERTEX_UNIFORM_VECTORS),
      glCtx.getParameter(glCtx.MAX_FRAGMENT_UNIFORM_VECTORS),
      glCtx.getParameter(glCtx.ALIASED_LINE_WIDTH_RANGE),
      glCtx.getParameter(glCtx.ALIASED_POINT_SIZE_RANGE),
    ].map(v => String(v)).join("|");

    return { renderer: `${vendor}~${renderer}`, vendor, extensions: hashString(extensions), params };
  } catch {
    return { renderer: "webgl-error", vendor: "", extensions: "", params: "" };
  }
}

function getPlugins(): string {
  try {
    if (!navigator.plugins || navigator.plugins.length === 0) return "none";
    return Array.from(navigator.plugins)
      .map((p) => p.name)
      .sort()
      .join(",");
  } catch {
    return "error";
  }
}

/** Audio context fingerprint — highly unique across devices */
function getAudioFingerprint(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) { resolve("no-audio"); return; }

      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();
      const scriptProcessor = ctx.createScriptProcessor(4096, 1, 1);

      gain.gain.value = 0; // silent
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(10000, ctx.currentTime);

      oscillator.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(0);

      const timeout = setTimeout(() => {
        cleanup();
        resolve("audio-timeout");
      }, 1000);

      scriptProcessor.onaudioprocess = (event) => {
        clearTimeout(timeout);
        const output = event.inputBuffer.getChannelData(0);
        let sum = 0;
        for (let i = 0; i < output.length; i++) {
          sum += Math.abs(output[i]);
        }
        cleanup();
        resolve(hashString(sum.toString()));
      };

      function cleanup() {
        try {
          oscillator.stop();
          scriptProcessor.disconnect();
          analyser.disconnect();
          gain.disconnect();
          ctx.close();
        } catch { /* ignore */ }
      }
    } catch {
      resolve("audio-error");
    }
  });
}

/** Detect available fonts by measuring rendered text width differences */
function getFontFingerprint(): string {
  try {
    const testFonts = [
      "monospace", "sans-serif", "serif",
      "Arial", "Arial Black", "Comic Sans MS", "Courier New", "Georgia",
      "Impact", "Lucida Console", "Palatino Linotype", "Tahoma",
      "Times New Roman", "Trebuchet MS", "Verdana",
      "Roboto", "Open Sans", "Segoe UI", "Helvetica", "Ubuntu",
      "Consolas", "Calibri", "Cambria",
    ];

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-ctx";

    const baseFonts = ["monospace", "sans-serif", "serif"];
    const testString = "mmmmmmmmmmlli1|!@#$%^&*()_+";
    const baseWidths: Record<string, number> = {};

    for (const base of baseFonts) {
      ctx.font = `72px ${base}`;
      baseWidths[base] = ctx.measureText(testString).width;
    }

    const detected: string[] = [];
    for (const font of testFonts) {
      if (baseFonts.includes(font)) continue;
      for (const base of baseFonts) {
        ctx.font = `72px '${font}', ${base}`;
        const width = ctx.measureText(testString).width;
        if (width !== baseWidths[base]) {
          detected.push(font);
          break;
        }
      }
    }

    return hashString(detected.sort().join(","));
  } catch {
    return "font-error";
  }
}

/** Get battery info if available */
async function getBatteryInfo(): Promise<{ charging: boolean | null; level: number | null }> {
  try {
    const nav = navigator as any;
    if (!nav.getBattery) return { charging: null, level: null };
    const battery = await nav.getBattery();
    return { charging: battery.charging, level: battery.level };
  } catch {
    return { charging: null, level: null };
  }
}

/** Count media devices (cameras, microphones) without requiring permission */
async function getMediaDeviceCount(): Promise<{ audioinput: number; videoinput: number; audiooutput: number }> {
  try {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return { audioinput: 0, videoinput: 0, audiooutput: 0 };
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      audioinput: devices.filter(d => d.kind === "audioinput").length,
      videoinput: devices.filter(d => d.kind === "videoinput").length,
      audiooutput: devices.filter(d => d.kind === "audiooutput").length,
    };
  } catch {
    return { audioinput: 0, videoinput: 0, audiooutput: 0 };
  }
}

/** Storage quota estimation — unique fingerprint signal */
async function getStorageEstimate(): Promise<{ quota: number | null; usage: number | null }> {
  try {
    if (!navigator.storage?.estimate) return { quota: null, usage: null };
    const est = await navigator.storage.estimate();
    return { quota: est.quota ?? null, usage: est.usage ?? null };
  } catch {
    return { quota: null, usage: null };
  }
}

/** Detect ad blocker presence */
function detectAdBlocker(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const testAd = document.createElement("div");
      testAd.innerHTML = "&nbsp;";
      testAd.className = "adsbox ad-placement ad-banner";
      testAd.style.cssText = "position:absolute;top:-999px;left:-999px;width:1px;height:1px;";
      document.body.appendChild(testAd);
      
      requestAnimationFrame(() => {
        const blocked = testAd.offsetHeight === 0 || testAd.clientHeight === 0;
        document.body.removeChild(testAd);
        resolve(blocked);
      });
    } catch {
      resolve(false);
    }
  });
}

/** Get Speech Synthesis voices — varies by OS/browser */
function getSpeechVoicesHash(): string {
  try {
    const voices = speechSynthesis?.getVoices?.() || [];
    if (voices.length === 0) return "no-voices";
    return hashString(voices.map(v => `${v.name}|${v.lang}|${v.localService}`).sort().join(","));
  } catch {
    return "voice-error";
  }
}

/** Detect Intl features — varies by OS locale configuration */
function getIntlFingerprint(): string {
  try {
    const parts: string[] = [];
    parts.push(new Intl.DateTimeFormat().resolvedOptions().locale);
    parts.push(new Intl.NumberFormat().resolvedOptions().locale);
    parts.push(String(new Intl.NumberFormat().resolvedOptions().numberingSystem));
    parts.push(String(new Intl.DateTimeFormat().resolvedOptions().calendar));
    if ((Intl as any).ListFormat) parts.push("listformat");
    if ((Intl as any).RelativeTimeFormat) parts.push("relativetime");
    if ((Intl as any).Segmenter) parts.push("segmenter");
    return hashString(parts.join("|"));
  } catch {
    return "intl-error";
  }
}

/** Math precision fingerprint — varies slightly across engines */
function getMathFingerprint(): string {
  try {
    const values = [
      Math.tan(-1e300),
      Math.log(1000),
      Math.pow(Math.PI, -100),
      Math.acos(0.5),
      Math.atan2(1, 1),
      Math.exp(10),
      Math.sinh(1),
      Math.cosh(1),
    ];
    return hashString(values.map(v => v.toString()).join(","));
  } catch {
    return "math-error";
  }
}

interface GeoResult {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  source: "gps" | "ip" | null;
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
}

/** Try GPS with high accuracy first, then fall back to coarse GPS */
function getGeolocation(): Promise<GeoResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null, accuracy: null, source: null, city: null, region: null, country: null, isp: null });
      return;
    }

    let resolved = false;
    const done = (lat: number | null, lng: number | null, accuracy: number | null) => {
      if (resolved) return;
      resolved = true;
      resolve({ lat, lng, accuracy, source: lat ? "gps" : null, city: null, region: null, country: null, isp: null });
    };

    // Global timeout — never hang more than 10s total
    const globalTimeout = setTimeout(() => done(null, null, null), 10000);

    // Try high accuracy first (GPS on mobile)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(globalTimeout);
        done(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      () => {
        // Fallback: try without high accuracy (WiFi/cell tower)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(globalTimeout);
            done(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
          },
          () => {
            clearTimeout(globalTimeout);
            done(null, null, null);
          },
          { timeout: 4000, maximumAge: 600000, enableHighAccuracy: false }
        );
      },
      { timeout: 5000, maximumAge: 60000, enableHighAccuracy: true }
    );
  });
}

export async function collectFingerprint(): Promise<DeviceFingerprint> {
  const nav = navigator as any;

  const canvasHash = getCanvasFingerprint();
  const webgl = getWebGLFingerprint();
  const plugins = getPlugins();
  const screenRes = `${screen.width}x${screen.height}`;
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const lang = navigator.language;
  const platform = nav.platform || nav.userAgentData?.platform || "unknown";
  const touchSupport = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const deviceMemory = nav.deviceMemory ?? null;
  const hardwareConcurrency = navigator.hardwareConcurrency ?? null;
  const colorDepth = screen.colorDepth;
  const pixelRatio = window.devicePixelRatio || 1;
  const fontHash = getFontFingerprint();
  const mathHash = getMathFingerprint();
  const intlHash = getIntlFingerprint();
  const voicesHash = getSpeechVoicesHash();

  // Parallel async collections (non-blocking)
  const [audioHash, geo, battery, mediaDevices, storageEst, adBlocker] = await Promise.all([
    getAudioFingerprint(),
    getGeolocation(),
    getBatteryInfo(),
    getMediaDeviceCount(),
    getStorageEstimate(),
    detectAdBlocker(),
  ]);

  // Componentes para gerar o hash principal (25+ signals)
  const components = [
    navigator.userAgent,
    platform,
    screenRes,
    tz,
    lang,
    canvasHash,
    webgl.renderer,
    String(colorDepth),
    String(pixelRatio),
    String(hardwareConcurrency),
    String(deviceMemory),
    String(touchSupport),
    audioHash,
    fontHash,
    mathHash,
    intlHash,
    webgl.extensions,
    webgl.params,
    String(navigator.maxTouchPoints),
    String(screen.availWidth) + "x" + String(screen.availHeight),
  ];

  const fingerprintHash = hashString(components.join("|||"));

  // Dados extras para análise forense (armazenados no raw_data)
  const rawData: Record<string, any> = {
    // Connection
    doNotTrack: nav.doNotTrack,
    cookieEnabled: navigator.cookieEnabled,
    connectionType: nav.connection?.effectiveType || null,
    connectionDownlink: nav.connection?.downlink || null,
    connectionRtt: nav.connection?.rtt || null,
    connectionSaveData: nav.connection?.saveData || false,

    // Screen & window
    maxTouchPoints: navigator.maxTouchPoints,
    screenOrientation: screen.orientation?.type || null,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    availScreen: `${screen.availWidth}x${screen.availHeight}`,
    outerSize: `${window.outerWidth}x${window.outerHeight}`,
    screenIsExtended: (screen as any).isExtended || false,

    // Browser features
    pdfViewerEnabled: nav.pdfViewerEnabled ?? null,
    webdriver: nav.webdriver || false,
    languages: navigator.languages?.join(",") || lang,
    hardwareConcurrency,
    deviceMemory,

    // Advanced fingerprints
    audioHash,
    fontHash,
    mathHash,
    intlHash,
    voicesHash,
    webglExtensionsHash: webgl.extensions,
    webglParams: webgl.params,
    webglVendor: webgl.vendor,

    // Battery
    batteryCharging: battery.charging,
    batteryLevel: battery.level,

    // Media devices (count only, no permission needed)
    audioInputDevices: mediaDevices.audioinput,
    videoInputDevices: mediaDevices.videoinput,
    audioOutputDevices: mediaDevices.audiooutput,

    // Storage
    storageQuota: storageEst.quota,
    storageUsage: storageEst.usage,

    // Privacy signals
    adBlockerDetected: adBlocker,

    // Performance
    jsHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || null,
    usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || null,

    // Timing
    timezoneOffset: new Date().getTimezoneOffset(),

    // UserAgentData (modern browsers)
    uaBrands: nav.userAgentData?.brands?.map((b: any) => `${b.brand}/${b.version}`).join(",") || null,
    uaMobile: nav.userAgentData?.mobile ?? null,
    uaPlatform: nav.userAgentData?.platform || null,

    // Geolocation source info
    geo_source: geo.source,
    gps_lat: geo.lat,
    gps_lon: geo.lng,
    gps_accuracy_meters: geo.accuracy,
  };

  return {
    fingerprint_hash: fingerprintHash,
    user_agent: navigator.userAgent,
    platform,
    screen_resolution: screenRes,
    timezone: tz,
    language: lang,
    canvas_hash: canvasHash,
    webgl_renderer: webgl.renderer,
    installed_plugins: plugins,
    touch_support: touchSupport,
    device_memory: deviceMemory,
    hardware_concurrency: hardwareConcurrency,
    color_depth: colorDepth,
    pixel_ratio: pixelRatio,
    latitude: geo.lat,
    longitude: geo.lng,
    geolocation_accuracy: geo.accuracy,
    raw_data: rawData,
  };
}

/**
 * Captura silenciosa de selfie via câmera frontal.
 * Retorna base64 JPEG ou null se falhar/negar.
 */
export async function captureLoginSelfie(): Promise<string | null> {
  try {
    if (!navigator.mediaDevices?.getUserMedia) return null;

    // Check camera permission before prompting
    try {
      const perm = await navigator.permissions.query({ name: "camera" as PermissionName });
      if (perm.state === "denied") return null;
      if (perm.state === "prompt" && localStorage.getItem("selfie_camera_declined")) return null;
    } catch {
      // permissions API not supported — check localStorage fallback
      if (localStorage.getItem("selfie_camera_declined")) return null;
    }

    const stream = await Promise.race([
      navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 320 }, height: { ideal: 240 } },
        audio: false,
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
    ]);

    const video = document.createElement("video");
    video.srcObject = stream;
    video.setAttribute("playsinline", "true");
    video.muted = true;
    await video.play();

    // Wait a moment for camera to adjust exposure
    await new Promise((r) => setTimeout(r, 500));

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      stream.getTracks().forEach((t) => t.stop());
      return null;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    stream.getTracks().forEach((t) => t.stop());

    // Convert to base64 JPEG
    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    return dataUrl.split(",")[1] || null; // return only base64 part
  } catch {
    return null;
  }
}
