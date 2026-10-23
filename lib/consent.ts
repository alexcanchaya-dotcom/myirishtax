/** Cookie/ads consent stored in localStorage. Nothing is stored unless the banner is shown and clicked. */
export type Consent = 'granted' | 'denied';
export const CONSENT_KEY = 'mit-ads-consent';
export const CONSENT_EVENT = 'mit-consent-change';

export function readConsent(): Consent | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

export function writeConsent(v: Consent) {
  try {
    window.localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* private mode: choice lasts for this page only */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v }));
}

/** For useSyncExternalStore: re-reads consent when the banner writes it or another tab changes it. */
export function subscribeConsent(cb: () => void) {
  window.addEventListener(CONSENT_EVENT, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(CONSENT_EVENT, cb);
    window.removeEventListener('storage', cb);
  };
}
