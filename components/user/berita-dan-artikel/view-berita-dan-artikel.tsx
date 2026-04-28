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

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

export default function ViewBeritaArtikel() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [artikel, setArtikel] = useState<NewsDetail | null>(null);
  const [related, setRelated] = useState<NewsDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      setError("ID artikel tidak ditemukan.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const [resDetail, resAll] = await Promise.all([
          fetch(`${API_URL}/api/news/${id}`),
          fetch(`${API_URL}/api/news`),
        ]);
        const jsonDetail = await resDetail.json();
        const jsonAll = await resAll.json();
        if (!resDetail.ok) throw new Error(jsonDetail.message || "Gagal mengambil data");
        setArtikel(jsonDetail.data);
        const others = (jsonAll.data || [])
          .filter((a: NewsDetail) => String(a.id) !== String(id) && a.status === "PUBLISHED")
          .slice(0, 4);
        setRelated(others);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
        <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
        <p className="text-sm">Memuat artikel...</p>
      </div>
    );
  }

  if (error || !artikel) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <p className="text-gray-500 text-sm">{error || "Artikel tidak ditemukan."}</p>
      </div>
    );
  }

  const paragraphs = artikel.content.split("\n\n").filter(Boolean);
  const tanggal = formatTanggal(artikel.createdAt);
  const pageUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="min-h-screen bg-[#e8f5e9] flex flex-col">

      {/* HERO */}
      <div className="relative w-full" style={{ minHeight: "420px" }}>
        {artikel.imageUrl && (
          <img
            src={artikel.imageUrl}
            alt={artikel.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

        {/* HEADER NAV */}
        <div className="relative z-10 flex w-full max-w-6xl mx-auto px-6 py-4 mt-5 rounded-3xl bg-white/10 backdrop-blur-xs items-center justify-center">
          <div className="flex items-center gap-8">
            <span
              className="text-white text-sm font-bold cursor-pointer hover:text-green-300 transition"
              onClick={() => router.push("/user/berita-dan-artikel")}
            >
              BERITA DAN ARTIKEL
            </span>
            <span
              className="text-white text-sm font-bold cursor-pointer hover:text-green-300 transition"
              onClick={() => router.push("/user/kegiatan-masjid")}
            >
              KEGIATAN MASJID
            </span>
          </div>
        </div>

        {/* JUDUL & META */}
        <div className="relative z-10 max-w-3xl mx-auto px-6 pb-8 pt-16 flex flex-col gap-2 text-center items-center">
          <h1 className="text-white text-2xl font-bold leading-snug drop-shadow">
            {artikel.title}
          </h1>
          <p className="text-white/80 text-xs">
            {tanggal} &nbsp;|&nbsp; Oleh: {artikel.author?.name || "Admin"}
          </p>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 mb-8 flex flex-col lg:flex-row gap-6">

        {/* KIRI - Konten Artikel */}
        <div className="flex-1 flex flex-col gap-4">

          {/* Card konten */}
          <div className="bg-white rounded-3xl px-6 py-7 flex flex-col gap-4 shadow-sm flex-1">

            {/* Paragraf konten */}
            <div className="flex flex-col gap-4 flex-1">
              {paragraphs.map((para, idx) => (
                <p key={idx} className="text-sm text-gray-700 leading-relaxed text-justify">
                  {para}
                </p>
              ))}
            </div>

            {/* Share  */}
            <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-100 mt-auto">
              <span className="text-sm text-gray-500 font-medium">Bagikan:</span>

              {/* WhatsApp */}
              
                <a href={`https://wa.me/?text=${encodeURIComponent(artikel.title + " " + pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center hover:bg-green-600 transition"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>

              {/* Facebook */}
              
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              {/* Twitter/X */}
              
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(artikel.title)}&url=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-black flex items-center justify-center hover:bg-gray-800 transition"
              >
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.735-8.835L1.254 2.25H8.08l4.259 5.632 5.905-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Copy Link */}
              <button
                onClick={handleCopy}
                title={copied ? "Tersalin!" : "Salin tautan"}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
              >
                {copied ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* KANAN  */}
        {related.length > 0 && (
          <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-8">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 bg-green-500 rounded-full" />
              <h2 className="text-sm font-bold text-gray-800">Berita dan Artikel Lainnya</h2>
            </div>
            {related.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition"
                onClick={() => router.push(`/user/berita-dan-artikel/view/${item.id}`)}
              >
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-28 object-cover" />
                )}
                <div className="p-3 flex flex-col gap-1">
                  <h3 className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-gray-400">{formatTanggal(item.createdAt)}</p>
                </div>
              </div>
            ))}
            {/* Tombol Kembali */}
            <button
                onClick={() => router.push("/user/berita-dan-artikel")}
                className="self-end text-xs text-[white] font-semibold border bg-[#22C55E] border-green-500 rounded-full min-w-full px-5 py-2 hover:bg-green-400 transition"
            >
                Kembali ke Daftar Berita dan Artikel
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-green-900">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

            {/* Kolom 1 - Brand */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 0v9m0-9C9 6 7 9 7 12m5-9c3 3 5 6 5 9" />
                </svg>
                <span className="text-white text-lg font-bold">Wapena</span>
              </div>
              <p className="text-green-200 text-sm leading-relaxed">Warga Pengajian Austria</p>
              <p className="text-green-200 text-sm leading-relaxed">
                Forum Saling Asih & Asuh Komunitas<br />Muslim Indonesia di Austria
              </p>
              <p className="text-sm leading-relaxed">
                <span className="text-green-400 font-semibold">Address: </span>
                <span className="text-green-200">Masjid As-Salam, Malfattigasse 18 – Lantai Dasar, 1120 Wina</span>
              </p>
            </div>

            {/* Kolom 2 - Quick Links */}
            <div className="flex flex-col gap-3">
              <h3 className="text-green-400 font-bold text-sm mb-1">Quick Links</h3>
              {["Beranda", "Waktu Sholat", "Jadwal Operasional", "Tentang Kami", "Berita Terbaru", "Galeri Foto"].map((link) => (
                <span key={link} className="text-green-200 text-sm cursor-pointer hover:text-white transition">
                  {link}
                </span>
              ))}
            </div>

            {/* Kolom 3 - Kontak */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-green-400 font-bold text-sm mb-1">Phone</h3>
                <p className="text-green-200 text-sm">(255) 352-6258</p>
              </div>
              <div>
                <h3 className="text-green-400 font-bold text-sm mb-1">Email</h3>
                <p className="text-green-200 text-sm">info@wapena.org</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[#FFFFFF4D] text-xs">Copyright © 2020 Wapena. All Rights Reserved.</p>
            <p className="text-[#FFFFFF4D] text-xs flex items-center gap-1">
              Dibuat dengan
              <svg className="w-3 h-3 text-red-400 fill-red-400" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              untuk umat
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}