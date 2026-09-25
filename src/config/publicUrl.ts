import firebaseConfig from '../../firebase-applet-config.json';

/**
 * Public production domain configuration for customer QR codes.
 * Ensures scanning QR codes on mobile smartphones routes to the active deployed app.
 */

// Deployed Firebase Hosting URL for this project
export const DEFAULT_FIREBASE_HOSTING_URL = `https://${firebaseConfig.projectId}.web.app`;
export const FIREBASE_APP_URL = `https://${firebaseConfig.projectId}.firebaseapp.com`;

export const DEFAULT_PLACEHOLDER_BASE_URL = DEFAULT_FIREBASE_HOSTING_URL;

const STORAGE_KEY = 'namma_theatre_public_base_url_v1';
const QR_ROUTE_KEY = 'namma_theatre_qr_route_v1';

/**
 * Returns the verified public base URL.
 * Priority order:
 * 1. Admin UI override saved in localStorage (e.g. custom domain or Firebase Hosting)
 * 2. Active window location where the app is currently running and verified to serve
 * 3. Vite environment variable: VITE_PUBLIC_BASE_URL
 * 4. Default Firebase Hosting URL: https://<projectId>.web.app
 */
export function getPublicBaseUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored.trim()) {
        return stored.trim().replace(/\/+$/, '');
      }
    } catch {
      // ignore
    }

    // Use current active origin where the application is live and running
    try {
      const origin = window.location.origin;
      if (origin && origin !== 'null') {
        return origin.replace(/\/+$/, '');
      }
    } catch {
      // ignore
    }
  }

  // Check Vite environment variable safely
  const envUrl =
    typeof import.meta !== 'undefined' && import.meta.env
      ? import.meta.env.VITE_PUBLIC_BASE_URL
      : undefined;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return DEFAULT_FIREBASE_HOSTING_URL;
}

/**
 * Updates the custom public base URL in localStorage.
 */
export function setCustomPublicBaseUrl(url: string): void {
  if (typeof window !== 'undefined') {
    try {
      const clean = url.trim().replace(/\/+$/, '');
      if (clean) {
        localStorage.setItem(STORAGE_KEY, clean);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Resets the base URL back to default.
 */
export function resetCustomPublicBaseUrl(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

/**
 * Gets the preferred QR route prefix ('/menu' or '/me').
 */
export function getQrRoutePrefix(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(QR_ROUTE_KEY);
      if (stored === '/me' || stored === '/menu') {
        return stored;
      }
    } catch {
      // ignore
    }
  }
  return '/menu';
}

/**
 * Sets the preferred QR route prefix ('/menu' or '/me').
 */
export function setQrRoutePrefix(prefix: '/menu' | '/me'): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(QR_ROUTE_KEY, prefix);
    } catch {
      // ignore
    }
  }
}

/**
 * Checks whether a URL is an internal development URL requiring developer cookies.
 */
export function isDevelopmentUrl(url: string): boolean {
  if (!url) return false;
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes(':3000') ||
    url.includes(':5173')
  );
}

/**
 * Builds the required QR destination URL:
 * FORMAT: {BASE_URL}{ROUTE_PREFIX}?seat={SEAT}&screen={SCREEN}
 * e.g. https://domain/menu?seat=B12&screen=1 or https://domain/me?seat=B12&screen=1
 */
export function buildQrDestinationUrl(
  seat: string,
  screen: string = '1',
  customBaseUrl?: string,
  routePrefix: string = '/menu'
): string {
  const base = (customBaseUrl || getPublicBaseUrl()).trim().replace(/\/+$/, '');
  const cleanSeat = (seat || 'B12').trim().toUpperCase();
  const cleanScreen = (screen || '1').trim() || '1';
  const prefix = routePrefix.startsWith('/') ? routePrefix : `/${routePrefix}`;

  return `${base}${prefix}?seat=${encodeURIComponent(cleanSeat)}&screen=${encodeURIComponent(cleanScreen)}`;
}
