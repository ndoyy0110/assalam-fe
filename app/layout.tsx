import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAuthProvider } from "@/context/GoogleAuthContext";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Assalam",
  description: "Assalam Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <GoogleAuthProvider>
            {children}
          </GoogleAuthProvider>
        </GoogleOAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}