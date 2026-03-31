"use client";

import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const router = useRouter();

  return (
    <div className="bg-[#e8f5e9] min-h-screen flex flex-col items-center">

      {/* HEADER */}
      <div className="w-full bg-green-900 flex flex-col items-center pb-10 pt-0">
        <div className="flex w-full max-w-3xl px-6 py-4 mt-5 rounded-3xl bg-white/10 items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition"
          >
            <img
              src="/images/panah-kiri.png"
              alt="Kembali"
              className="w-5 h-5"
            />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-green-200 text-sm font-medium">Halo, Admin!</span>
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </div>

        {/* JUDUL */}
        {title && (
          <div className="mt-8 text-center">
            <h1 className="text-white text-2xl font-bold tracking-wide">{title}</h1>
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl px-4 py-8">
        {children}
      </div>

    </div>
  );
}