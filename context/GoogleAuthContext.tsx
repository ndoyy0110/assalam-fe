"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useGoogleLogin } from "@react-oauth/google";

interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

interface GoogleAuthContextType {
  googleToken: string | null;
  googleUser: GoogleUser | null;
  loginWithGoogle: () => void;
  logout: () => void;
}

const GoogleAuthContext = createContext<GoogleAuthContextType>({
  googleToken: null,
  googleUser: null,
  loginWithGoogle: () => {},
  logout: () => {},
});

function GoogleAuthProviderInner({ children }: { children: ReactNode }) {
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      const token = response.access_token;
      setGoogleToken(token);
      try {
        const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userInfo = await userRes.json();
        setGoogleUser({ name: userInfo.name, email: userInfo.email, picture: userInfo.picture });
      } catch {
        // ignore
      }
    },
    onError: () => {},
    scope: "https://www.googleapis.com/auth/calendar.events",
  });

  const logout = () => {
    setGoogleToken(null);
    setGoogleUser(null);
  };

  return (
    <GoogleAuthContext.Provider value={{ googleToken, googleUser, loginWithGoogle, logout }}>
      {children}
    </GoogleAuthContext.Provider>
  );
}

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  return <GoogleAuthProviderInner>{children}</GoogleAuthProviderInner>;
}

export const useGoogleAuth = () => useContext(GoogleAuthContext);