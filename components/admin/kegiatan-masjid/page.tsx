"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production.up.railway.app";

type Kegiatan = {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};

const ITEMS_PER_PAGE = 6;

// Konsisten pakai UTC agar cocok dengan data yang dikirim sebagai UTC
const formatJam = (iso: string): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}.${m}`;
};

const formatTanggal = (iso: string): string => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

export default function KegiatanMasjid() {
  const router = useRouter();
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchKegiatan();
  }, []);

  const fetchKegiatan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/activities`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengambil data");
      setData(json.data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengambil data";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/activities/${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menghapus");
      setData((prev) => prev.filter((d) => d.id !== deleteId));
      setDeleteId(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus";
      setError(message);
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE) || 1;
  const paginated = data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const slots = [...paginated, ...Array(ITEMS_PER_PAGE - paginated.length).fill(null)];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
      <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
      <p className="text-sm">Memuat kegiatan...</p>
    </div>
  );

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold">✕</button>
        </div>
      )}

      <div className="mb-5">
        <button
          onClick={() => router.push("/admin/kegiatan-masjid/add")}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition"
        >
          + Tambah Kegiatan Masjid
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((item, idx) =>
          item ? (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-sm md:text-base text-gray-800">{item.title}</h3>

              <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {formatJam(item.startTime)} - {formatJam(item.endTime)}
              </div>

              <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatTanggal(item.startTime)}
                {formatTanggal(item.endTime) !== formatTanggal(item.startTime)
                  ? ` s/d ${formatTanggal(item.endTime)}`
                  : ""}
              </div>

              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1">Deskripsi</p>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-3">{item.description}</p>
              </div>

              <div className="flex gap-2 mt-auto pt-2">
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="flex-1 bg-white border border-gray-300 rounded-full px-3 py-1.5 flex items-center justify-center gap-1 text-red-500 text-xs font-semibold hover:bg-red-50 transition"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" /><path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Hapus
                </button>
                <button
                  onClick={() => router.push(`/admin/kegiatan-masjid/edit/${item.id}`)}
                  className="flex-1 bg-[#BBF7D0] rounded-full px-3 py-1.5 flex items-center justify-center gap-1 text-green-600 text-xs font-semibold hover:bg-green-300 transition"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <div key={`empty-${idx}`} className="border border-gray-200 rounded-xl bg-white min-h-[180px]" />
          )
        )}
      </div>

      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`w-7 h-7 rounded-full text-xs font-bold ${
              page === i + 1 ? "bg-green-500 text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
        >
          ›
        </button>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-8 py-8 w-[800px] max-w-[90%] h-[450px] text-center shadow-lg flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-7 p-4">Hapus Kegiatan Masjid?</h2>
            <p className="text-sm font-semibold text-gray-800 mb-7 p-4">
              Kegiatan yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
            </p>
            <div className="flex gap-3 p-4">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-4 rounded-full bg-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-400 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-4 rounded-full bg-[#D4183D] text-white text-sm font-semibold hover:bg-red-500 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}