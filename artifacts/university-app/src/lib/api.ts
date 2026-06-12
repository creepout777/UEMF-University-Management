const TOKEN_KEY = "uemf_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init.headers ?? {}),
    },
  });
}
