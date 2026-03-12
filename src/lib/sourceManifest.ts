const srcFiles = import.meta.glob([
  '/src/**/*.{tsx,ts,css}',
  '/public/sw-push.js',
], { eager: false });

export function getKnownPaths(): string[] {
  return Object.keys(srcFiles).map(k => k.slice(1)); // strip leading "/"
}
