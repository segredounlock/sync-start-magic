/**
 * Utilitário central para reconhecimento dinâmico de domínio.
 * Substitui o domínio hardcoded por window.location.origin,
 * permitindo white-label e múltiplos domínios.
 */

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://recargasbrasill.com'; // fallback SSR/edge
}

export function buildUrl(path: string): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Substitui domínios lovable.app em URLs por domínio atual.
 * Útil para sanitizar URLs inseridas pelo usuário.
 */
export function fixExternalUrl(url: string): string {
  return url.replace(/https?:\/\/[^/]*lovable\.app/gi, getBaseUrl());
}
