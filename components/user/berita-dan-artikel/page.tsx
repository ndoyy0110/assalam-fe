"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production.up.railway.app";

type StatusType = "PUBLISHED" | "DRAFT";

interface Artikel {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  imageUrl: string | null;
  status: StatusType;
  author: { id: number; name: string };
  createdAt: string;
}

const ITEMS_PER_PAGE = 6;

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

export default function BeritaArtikelPage() {
  const router = useRouter();
  const [data, setData] = useState<Artikel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/news`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengambil data");
      setData(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const published = data.filter((a) => a.status === "PUBLISHED");
  const featured = published[0] ?? null;
  const terbaru = published.slice(1, 3);

  // lainnya diambil dari published agar id-nya valid saat di-view
  const totalPages = Math.ceil(published.length / ITEMS_PER_PAGE) || 1;
  const lainnya = published.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
      <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
      <p className="text-sm">Memuat berita...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e8f5e9] px-4 py-6 flex flex-col gap-8">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold text-red-400">✕</button>
        </div>
      )}

      {/* ── BERITA DAN ARTIKEL TERBARU ── */}
      <section className="flex-1">
        {published.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 text-sm">
            Belum ada berita yang diterbitkan.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">

            {/* Kiri - Featured besar */}
            {featured && (
              <div
                className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition w-full sm:w-1/2 flex-shrink-0"
                onClick={() => router.push(`/user/berita-dan-artikel/view/${featured.id}`)}
              >
                <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                  {featured.imageUrl ? (
                    <img src={featured.imageUrl} alt={featured.title} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="text-base font-bold text-gray-800 leading-snug">{featured.title}</h3>
                  <p className="text-[11px] text-gray-400">{formatTanggal(featured.createdAt)}</p>
                  {featured.summary && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-4">{featured.summary}</p>
                  )}
                </div>
              </div>
            )}

            {/* Kanan  */}
            <div className="flex flex-col gap-4 w-full sm:w-1/2 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1 h-5 bg-[#4ADE80] rounded-full" />
                <h2 className="text-base font-bold text-gray-800">Berita dan Artikel Terbaru</h2>
              </div>

              <div className="flex flex-col gap-4 flex-1">
                {terbaru.map((artikel) => (
                  <div
                    key={artikel.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm flex cursor-pointer hover:shadow-md transition flex-1"
                    onClick={() => router.push(`/user/berita-dan-artikel/view/${artikel.id}`)}
                  >
                    <div className="w-28 sm:w-36 flex-shrink-0 bg-gray-100 overflow-hidden self-stretch">
                      {artikel.imageUrl ? (
                        <img src={artikel.imageUrl} alt={artikel.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 px-3 py-3 flex-1 min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-gray-800 leading-snug line-clamp-3">
                        {artikel.title}
                      </h3>
                      <p className="text-[10px] text-gray-400">{formatTanggal(artikel.createdAt)}</p>
                      {artikel.summary && (
                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-4">{artikel.summary}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Placeholder jika terbaru < 2 agar tinggi tetap konsisten
                {Array.from({ length: Math.max(0, 2 - terbaru.length) }).map((_, i) => (
                  <div key={`ph-${i}`} className="flex-1 bg-white rounded-2xl min-h-[110px]" />
                ))} */}
              </div>
            </div>

          </div>
        )}
      </section>

      {/* ── BERITA DAN ARTIKEL LAINNYA ── */}
      {lainnya.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#4ADE80] rounded-full" />
            <h2 className="text-base font-bold text-gray-800">Berita dan Artikel Lainnya</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {lainnya.map((artikel) => (
              <div
                key={artikel.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition flex flex-col"
                onClick={() => router.push(`/user/berita-dan-artikel/view/${artikel.id}`)}
              >
                <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                  {artikel.imageUrl && (
                    <img src={artikel.imageUrl} alt={artikel.title} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <h3 className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">{artikel.title}</h3>
                  <p className="text-[10px] text-gray-400">{formatTanggal(artikel.createdAt)}</p>
                  {artikel.summary && (
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">{artikel.summary}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition text-sm"
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition ${
                    currentPage === page
                      ? "bg-green-500 text-white shadow"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >{page}</button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition text-sm"
              >›</button>
            </div>
          )}
        </section>
      )}

    </div>
  );
}