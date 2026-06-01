// lib/auth.js

const AUTH_SERVER =
  process.env.NEXT_PUBLIC_AUTH_SERVER ||
  "https://afeka-trails-2026-cd9x.onrender.com";
export async function register(firstName, lastName, email, password) {
  const res = await fetch(`${AUTH_SERVER}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, email, password })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Register failed');
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${AUTH_SERVER}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

/** Save tokens in localStorage (client-side only, no cookies) */
export function saveTokens(accessToken, refreshToken, user) {
  localStorage.setItem('accessToken', accessToken || '');
  localStorage.setItem('refreshToken', refreshToken || '');
  localStorage.setItem('user', JSON.stringify(user || null));
}

export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

export function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

export function logout() {
  clearTokens();
}

/**
 * authFetch — fetch wrapper that adds:
 * - x-access-token
 * - x-user-id
 * - x-user-fullname
 * and retries once after silentRefresh on 401.
 *
 * Use this for ALL API calls instead of plain fetch().
 */
export async function authFetch(url, options = {}) {
  const buildHeaders = (tokenOverride) => {
    const token = tokenOverride ?? getAccessToken();
    const user = getUser(); // expected: { id, fullName, email }

    return {
      ...(options.headers || {}),
      'Content-Type': 'application/json',

      // token header (your style)
      ...(token ? { 'x-access-token': token } : {}),

      // user headers (needed by /api/trails/save and similar)
      ...(user?.id ? { 'x-user-id': user.id } : {}),
      ...(user?.fullName ? { 'x-user-fullname': user.fullName } : {})
    };
  };

  let res = await fetch(url, { ...options, headers: buildHeaders() });

  // Token expired / unauthorized — try silent refresh once, then retry
  if (res.status === 401) {
    const refreshed = await silentRefresh();
    if (!refreshed) {
      clearTokens();
      window.location.href = '/login'; // ✅ fixed path
      return res;
    }

    // retry once with new token
    res = await fetch(url, { ...options, headers: buildHeaders(getAccessToken()) });
  }

  return res;
}

/**
 * Silent refresh — runs in background, user doesn't notice.
 */
export async function silentRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${AUTH_SERVER}/api/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!res.ok) return false;

    const data = await res.json().catch(() => ({}));
    const currentUser = getUser(); // keep existing user
    saveTokens(data.accessToken, data.refreshToken, currentUser);

    return true;
  } catch {
    return false;
  }
}

/** Schedule silent refresh once per day */
export function scheduleSilentRefresh() {
  const intervalId = setInterval(silentRefresh, 24 * 60 * 60 * 1000);
  return () => clearInterval(intervalId);
}