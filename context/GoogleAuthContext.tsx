"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production-341d.up.railway.app";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: {
        initialize: (config: object) => void;
        renderButton: (el: HTMLElement, config: object) => void;
        disableAutoSelect: () => void;
      };
      oauth2?: {
        initTokenClient: (config: {
          client_id: string;
          scope: string;
          callback: (response: { access_token?: string; error?: string }) => void;
        }) => { requestAccessToken: () => void };
      };
    };
  };
};

interface GoogleUser {
  id: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
  picture?: string;
}

interface GoogleAuthContextType {
  googleUser: GoogleUser | null;
  accessToken: string | null;
  googleCalendarToken: string | null;
  requestCalendarToken: () => void;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

let memoryAccessToken: string | null = null;
let memoryCalendarToken: string | null = null;

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [googleCalendarToken, setGoogleCalendarToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("accessToken");
      const savedUser = localStorage.getItem("googleUser");
      if (savedToken && savedUser) {
        memoryAccessToken = savedToken;
        setGoogleUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Restore session error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("googleUser");
      memoryAccessToken = null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    try {
      const loginRes = await fetch(`${API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken: response.credential }),
      });
      const data = await loginRes.json();
      if (!data.success) throw new Error(data.message);

      const user: GoogleUser = data.data.user;
      const token: string = data.data.accessToken;

      memoryAccessToken = token;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("googleUser", JSON.stringify(user));
      setGoogleUser(user);

      if (user.role === "ADMIN") {
        window.location.href = "/admin/panel";
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error instanceof Error ? error.message : "Login gagal");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initGoogle = () => {
      const win = window as GoogleWindow;
      win.google?.accounts?.id?.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      const container = document.getElementById("g_id_signin_container");
      if (container) {
        win.google?.accounts?.id?.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          locale: "id",
        });
      }
    };

    const win = window as GoogleWindow;
    if (win.google?.accounts?.id) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    }
  }, [handleCredentialResponse]);

  const loginWithGoogle = () => {
    const btn = document
      .getElementById("g_id_signin_container")
      ?.querySelector("div[role=button]") as HTMLElement | null;

    if (btn) {
      btn.click();
    } else {
      alert("Google Sign In belum siap, coba lagi.");
    }
  };

  // ── Request Google OAuth token khusus Calendar scope ──
  const requestCalendarToken = useCallback(() => {
    const win = window as GoogleWindow;
    const tokenClient = win.google?.accounts?.oauth2?.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/calendar.events",
      callback: (response) => {
        if (response.access_token) {
          memoryCalendarToken = response.access_token;
          setGoogleCalendarToken(response.access_token);
        } else {
          console.error("Calendar token error:", response.error);
        }
      },
    });
    tokenClient?.requestAccessToken();
  }, []);

  const logout = async () => {
    try {
      if (memoryAccessToken) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${memoryAccessToken}` },
          credentials: "include",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      memoryAccessToken = null;
      memoryCalendarToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("googleUser");
      setGoogleUser(null);
      setGoogleCalendarToken(null);
      const win = window as GoogleWindow;
      win.google?.accounts?.id?.disableAutoSelect();
      window.location.href = "/";
    }
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        googleUser,
        accessToken: memoryAccessToken,
        googleCalendarToken,
        requestCalendarToken,
        loginWithGoogle,
        logout,
        isLoading,
      }}
    >
      {children}
      <div
        id="g_id_signin_container"
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      />
    </GoogleAuthContext.Provider>
  );
}

export function useGoogleAuth() {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) throw new Error("useGoogleAuth must be used within a GoogleAuthProvider");
  return context;
}

export const getAccessToken = () => memoryAccessToken;
export const getCalendarToken = () => memoryCalendarToken;