const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

const getHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
});

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
  },

  post: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
  },

  put: async <T>(endpoint: string, body: unknown): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<T>;
  },

  delete: async <T>(endpoint: string): Promise<T | null> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.status === 204 ? null : (res.json() as Promise<T>);
  },
};