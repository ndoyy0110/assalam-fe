"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Kegiatan = {
  id: number;
  nama: string;
  waktu: string;
  jadwal: string;
  deskripsi: string;
};

const initialData: Kegiatan[] = [
  {
    id: 1,
    nama: "Kajian Rutin Masjid",
    waktu: "05.00 - 06.00",
    jadwal: "Setiap Senin",
    deskripsi:
      "Kajian kitab Al-Quran bersama Ustadz Ahmad setiap hari Senin setelah sholat Subuh. Menggunakan kitab Tafsir Ibnu Katsir dan Tafsir As-Sa'di.",
  },
];

const ITEMS_PER_PAGE = 6;

export default function KegiatanMasjid() {
  const router = useRouter();
  const [data, setData] = useState<Kegiatan[]>(initialData);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE) || 1;
  const paginated = data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  // pad to always show 6 slots
  const slots = [...paginated, ...Array(ITEMS_PER_PAGE - paginated.length).fill(null)];

  const handleDelete = (id: number) => {
  setDeleteId(id);
  };
  const confirmDelete = () => {
  setData((prev) => prev.filter((d) => d.id !== deleteId));
  setDeleteId(null);
};

  return (
    <div>
      {/* Tambah Button */}
      <div className="mb-5">
        <button
          onClick={() => router.push("/admin/kegiatan-masjid/add")}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2 rounded-full transition"
        >
          + Tambah Kegiatan Masjid
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {slots.map((item, idx) =>
          item ? (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-sm md:text-base text-gray-800">{item.nama}</h3>

              <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {item.waktu}
              </div>

              <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {item.jadwal}
              </div>

              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1">Deskripsi</p>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-3 md:line-clamp-4">{item.deskripsi}</p>
              </div>

              <div className="flex gap-2 mt-auto pt-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 bg-white border border-gray-300 rounded-full px-2 md:px-3 py-1.5 flex items-center justify-center gap-1 text-red-500 text-xs md:text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4h6v2" />
                  </svg>
                  Hapus
                </button>
                <button
                  onClick={() => router.push(`/kegiatan/edit/${item.id}`)}
                  className="flex-1 bg-[#BBF7D0] border border-[#BBF7D0] rounded-full px-2 md:px-3 py-1.5 flex items-center justify-center gap-1 text-green-600 text-xs md:text-sm font-semibold hover:bg-green-300 transition"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-4 md:h-4">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <div key={`empty-${idx}`} className="border border-gray-200 rounded-xl bg-white min-h-[180px] md:min-h-[200px]" />
          )
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`w-7 h-7 rounded-full text-xs font-bold transition ${
              page === i + 1 ? "bg-green-500 text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
        >
          ›
        </button>
      </div>
      {/* Modal Konfirmasi Hapus */}
        {deleteId !== null && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl px-8 py-8 w-[800px] max-w-[90%] h-[450px] text-center shadow-lg flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-7 p-4 leading-snug">
              Hapus Kegiatan Masjid?
            </h2>
            <p className="text-sm font-semibold text-gray-800 mb-7 p-4 leading-snug">
              Kegiatan yang dihapus tidak dapat dikembalikan. Yakin ingin melanjutkan?
            </p>
            <div className="flex gap-3 p-4">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-4 rounded-full bg-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-400 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 rounded-full bg-[#D4183D] text-[white] text-sm font-semibold hover:bg-red-500 hover:text-white transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
        )}
    </div>
  );
}