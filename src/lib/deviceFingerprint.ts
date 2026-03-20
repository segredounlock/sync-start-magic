/**
 * Coleta silenciosa de fingerprint do dispositivo para anti-fraude.
 * Gera um hash único baseado em múltiplas propriedades do navegador/dispositivo.
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
    hash = hash & hash; // Convert to 32bit integer
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

    return hashString(canvas.toDataURL());
  } catch {
    return "canvas-error";
  }
}

function getWebGLRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) return "no-webgl";

    const debugInfo = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return "no-debug-info";

    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    return `${vendor}~${renderer}`;
  } catch {
    return "webgl-error";
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

function getGeolocation(): Promise<{ lat: number | null; lng: number | null; accuracy: number | null }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null, accuracy: null });
      return;
    }

    // Timeout rápido — não travar o login
    const timeout = setTimeout(() => resolve({ lat: null, lng: null, accuracy: null }), 5000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeout);
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => {
        clearTimeout(timeout);
        resolve({ lat: null, lng: null, accuracy: null });
      },
      { timeout: 4000, maximumAge: 300000 }
    );
  });
}

export async function collectFingerprint(): Promise<DeviceFingerprint> {
  const nav = navigator as any;

  const canvasHash = getCanvasFingerprint();
  const webglRenderer = getWebGLRenderer();
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

  // Componentes para gerar o hash principal
  const components = [
    navigator.userAgent,
    platform,
    screenRes,
    tz,
    lang,
    canvasHash,
    webglRenderer,
    String(colorDepth),
    String(pixelRatio),
    String(hardwareConcurrency),
    String(deviceMemory),
    String(touchSupport),
  ];

  const fingerprintHash = hashString(components.join("|||"));

  // Tenta geolocalização em paralelo (não-bloqueante)
  const geo = await getGeolocation();

  // Dados extras para análise forense
  const rawData: Record<string, any> = {
    doNotTrack: nav.doNotTrack,
    cookieEnabled: navigator.cookieEnabled,
    maxTouchPoints: navigator.maxTouchPoints,
    pdfViewerEnabled: nav.pdfViewerEnabled,
    connectionType: nav.connection?.effectiveType,
    downlink: nav.connection?.downlink,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    availScreen: `${screen.availWidth}x${screen.availHeight}`,
  };

  return {
    fingerprint_hash: fingerprintHash,
    user_agent: navigator.userAgent,
    platform,
    screen_resolution: screenRes,
    timezone: tz,
    language: lang,
    canvas_hash: canvasHash,
    webgl_renderer: webglRenderer,
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
