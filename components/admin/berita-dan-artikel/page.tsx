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

const ITEMS_PER_PAGE = 3;

const StatusBadge = ({ status }: { status: StatusType }) => (
  <span
    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
      status === "PUBLISHED"
        ? "bg-green-100 text-green-700"
        : "bg-gray-200 text-gray-600"
    }`}
  >
    {status === "PUBLISHED" ? "Diterbitkan" : "Draft"}
  </span>
);

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
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; status: StatusType } | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/news/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menghapus");
      setData((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE) || 1;
  const paginated = data.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const isDraft = deleteTarget?.status === "DRAFT";

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
      <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
      <p className="text-sm">Memuat berita...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e8f5e9] px-6 py-6 flex flex-col gap-5">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold text-red-400">✕</button>
        </div>
      )}

      <div>
        <button
          onClick={() => router.push("/admin/berita-dan-artikel/add")}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-sm"
        >
          Tambah Berita dan Artikel
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {paginated.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 text-sm">
            Belum ada berita atau artikel.
          </div>
        ) : (
          paginated.map((artikel) => (
            <div
              key={artikel.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm flex"
              style={{ minHeight: "140px" }}
            >
              {/* Gambar */}
              <div className="w-44 min-w-[11rem] bg-gray-100 flex-shrink-0">
                {artikel.imageUrl && (
                  <img
                    src={artikel.imageUrl}
                    alt={artikel.title}
                    className="w-full h-full object-cover"
                    style={{ minHeight: "140px" }}
                  />
                )}
              </div>

              {/* Konten */}
              <div className="flex flex-col justify-between flex-1 px-5 py-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-sm font-bold text-gray-800 leading-snug">
                    {artikel.title}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={artikel.status} />
                    <span className="text-[11px] text-gray-400">
                      Oleh: {artikel.author?.name || "Admin"}
                    </span>
                    <span className="text-[11px] text-gray-400">|</span>
                    <span className="text-[11px] text-gray-400">
                      {formatTanggal(artikel.createdAt)}
                    </span>
                  </div>
                  {artikel.summary && (
                    <p className="text-xs text-gray-500 leading-relaxed mt-1 line-clamp-3">
                      {artikel.summary}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-3">
                  <button
                    onClick={() => setDeleteTarget({ id: artikel.id, status: artikel.status })}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                  <button
                    onClick={() => router.push(`/admin/berita-dan-artikel/edit/${artikel.id}`)}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button
                  onClick={() => router.push(`/admin/berita-dan-artikel/view/${artikel.id}`)}  
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-2">
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

      {/* Modal Konfirmasi Hapus */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-8 py-8 w-[800px] max-w-[90%] h-[450px] text-center shadow-lg flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-snug">
              {isDraft ? "Hapus Draft?" : "Hapus Berita dan Artikel?"}
            </h2>
            <p className="text-sm font-semibold text-gray-500 mb-7 leading-relaxed px-4">
              {isDraft
                ? "Draft yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?"
                : "Berita dan Artikel yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?"}
            </p>
            <div className="flex gap-3 px-4">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-4 rounded-full bg-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-400 disabled:opacity-50 transition"
              >Batal</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-4 rounded-full bg-[#D4183D] text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {deleting && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                {deleting ? "Menghapus..." : isDraft ? "Ya, Hapus Draft" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}