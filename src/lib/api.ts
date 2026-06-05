const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://assalam-be-production-341d.up.railway.app";

let accessToken: string | null = null;

// Response type generic
interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// 🔥 FIX: type untuk refresh response
interface RefreshData {
  accessToken: string;
}

// Function untuk refresh token
export async function refreshToken(): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    const data: ApiResponse<RefreshData> = await res.json();

    if (!data.success) {
      throw new Error(data.message || "Refresh token gagal");
    }

    accessToken = data.data?.accessToken || null;

    if (!accessToken) {
      throw new Error("Access token tidak ditemukan");
    }

    return accessToken;
  } catch (error: unknown) {
    accessToken = null;
    throw error;
  }
}

// Main API caller
export async function apiCall<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 403) {
    try {
      const newToken = await refreshToken();

      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Content-Type", "application/json");
      retryHeaders.set("Authorization", `Bearer ${newToken}`);

      res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });
    } catch (refreshError: unknown) {
      accessToken = null;
      throw new Error("Sesi berakhir, silakan login ulang");
    }
  }

  const data: ApiResponse<T> = await res.json();

  if (!data.success) {
    throw new Error(data.message || "Request gagal");
  }

  return data;
}

export function setAccessToken(token: string) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}