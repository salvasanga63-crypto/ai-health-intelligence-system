export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000/api';
export const DEMO_TOKEN = 'health-platform-demo-session';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('health_platform_token');
}

export function setToken(token) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('health_platform_token', token);
}

export function removeToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('health_platform_token');
}

export function startDemoSession() {
  setToken(DEMO_TOKEN);
}

export async function authFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
  }

  return response;
}

export async function loginRequest(username, password, biometric_token = null) {
  return fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, biometric_token }),
  });
}

export async function registerRequest(payload) {
  return fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function sendVerificationEmail(email) {
  return fetch(`${API_BASE}/auth/send-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmailCode(email, code) {
  return fetch(`${API_BASE}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
}

export async function checkStaffId(staffId) {
  return fetch(`${API_BASE}/auth/check-staff-id?staff_id=${encodeURIComponent(staffId)}`);
}

export async function getProfile() {
  if (getToken() === DEMO_TOKEN) {
    return { username: 'demo', first_name: 'Demo Staff', role: 'staff' };
  }
  const response = await authFetch('/auth/me');
  if (!response.ok) return null;
  return response.json();
}
