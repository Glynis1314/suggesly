export const AUTH_STORAGE_KEY = 'suggesly-auth';

export function readStoredUser() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Unable to read auth session', error);
    return null;
  }
}

export function saveSession(user) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function updateSession(updates) {
  if (typeof window === 'undefined') return null;
  const current = readStoredUser() || {};
  const next = { ...current, ...updates };
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isAuthenticated() {
  return Boolean(readStoredUser());
}
