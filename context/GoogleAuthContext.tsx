"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production-341d.up.railway.app";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

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
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(undefined);

let memoryAccessToken: string | null = null;

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.data?.accessToken) {
          memoryAccessToken = data.data.accessToken;
          const savedUser = localStorage.getItem("googleUser");
          if (savedUser) setGoogleUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Check auth error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Handler credential dari Google — dapat ID Token (eyJ...)
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
      memoryAccessToken = data.data.accessToken;
      setGoogleUser(user);
      localStorage.setItem("googleUser", JSON.stringify(user));

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

  // Load Google GSI script & render button di container
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initGoogle = () => {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render tombol Google di container yang visible
      const container = document.getElementById("g_id_signin_container");
      if (container) {
        (window as any).google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
          locale: "id",
        });
      }
    };

    if ((window as any).google?.accounts?.id) {
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

  // loginWithGoogle: klik Google button yang sudah dirender
  const loginWithGoogle = () => {
    const btn = document
      .getElementById("g_id_signin_container")
      ?.querySelector("div[role=button]") as HTMLElement | null;

    if (btn) {
      btn.click(); // ✅ dipanggil langsung dari user gesture → tidak diblokir browser
    } else {
      alert("Google Sign In belum siap, coba lagi.");
    }
  };

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
      setGoogleUser(null);
      localStorage.removeItem("googleUser");
      if ((window as any).google?.accounts?.id) {
        (window as any).google.accounts.id.disableAutoSelect();
      }
      window.location.href = "/";
    }
  };

  return (
    <GoogleAuthContext.Provider
      value={{
        googleUser,
        accessToken: memoryAccessToken,
        loginWithGoogle,
        logout,
        isLoading,
      }}
    >
      {children}
      {/* 
        Google button dirender di sini — HARUS visible agar browser
        menganggap klik sebagai user gesture yang sah.
        Posisi fixed di luar layar agar tidak terlihat user.
      */}
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