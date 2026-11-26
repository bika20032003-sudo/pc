/**
 * Unified Authenticated API Client for Ministry of Interior System.
 * Ensures all requests carry the active JWT Bearer token (moi_token) cleanly.
 */

export function getAuthToken() {
  try {
    if (!sessionStorage.getItem('moi_session_active')) return '';
    return localStorage.getItem('moi_token') || '';
  } catch (_) {
    return '';
  }
}

export function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders
  };
}

export async function apiFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  return fetch(url, {
    ...options,
    headers
  });
}

export async function sha256Hex(text) {
  if (typeof crypto !== 'undefined' && crypto.subtle && typeof TextEncoder !== 'undefined') {
    const data = new TextEncoder().encode(String(text));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return '';
}
