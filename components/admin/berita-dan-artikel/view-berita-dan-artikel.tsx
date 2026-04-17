"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://assalam-be-production.up.railway.app";

interface NewsDetail {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  imageUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  author: { name: string };
  createdAt: string;
}

export default function ViewBeritaArtikel() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [artikel, setArtikel] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID artikel tidak ditemukan.");
      setLoading(false);
      return;
    }

    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_URL}/api/news/${id}`);
        const json = await res.json();

        if (!res.ok)
          throw new Error(json.message || "Gagal mengambil data");

        setArtikel(json.data);
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Gagal mengambil data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetch_();
  }, [id]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
        <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
        <p className="text-sm">Memuat artikel...</p>
      </div>
    );

  if (error || !artikel)
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <p className="text-gray-500 text-sm">
          {error || "Artikel tidak ditemukan."}
        </p>
      </div>
    );

  const paragraphs = artikel.content.split("\n\n").filter(Boolean);

  const tanggal = new Date(artikel.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white flex flex-col ">
      <div className="relative w-full" style={{ minHeight: "320px" }}>
        {artikel.imageUrl && (
          <img
            src={artikel.imageUrl}
            alt={artikel.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition"
          >
            ←
          </button>
        </div>

        <div className="relative z-10 px-5 pb-8 pt-16 flex flex-col gap-2 text-center item-center">
          <h1 className="text-white text-2xl font-bold leading-snug drop-shadow">
            {artikel.title}
          </h1>
          <p className="text-white/80 text-xs">
            {tanggal} &nbsp;|&nbsp; Oleh:{" "}
            {artikel.author?.name || "Admin"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-t-3xl -mt-4 flex-1 px-5 py-7 flex flex-col gap-4 ">
        {paragraphs.map((para, idx) => (
          <p
            key={idx}
            className="text-sm text-gray-700 leading-relaxed text-justify"
          >
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}