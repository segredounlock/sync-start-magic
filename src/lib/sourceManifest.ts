const srcFiles = import.meta.glob([
  '/src/**/*.{tsx,ts,css}',
  '/supabase/functions/**/*.{ts,tsx}',
  '/supabase/functions/_shared/**/*.{ts,tsx}',
  '/public/sw-push.js',
], { eager: false });

export function getKnownPaths(): string[] {
  return Object.keys(srcFiles).map(k => k.slice(1)); // strip leading "/"
}
