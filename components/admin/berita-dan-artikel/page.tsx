"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StatusType = "Diterbitkan" | "Draft";

interface Artikel {
  id: number;
  judul: string;
  status: StatusType;
  penulis: string;
  tanggal: string;
  deskripsi: string;
  gambar: string;
}

const DUMMY_DATA: Artikel[] = [
  {
    id: 1,
    judul: "Masjid: Lebih dari Sekadar Tempat Ibadah",
    status: "Diterbitkan",
    penulis: "Admin",
    tanggal: "25 Maret 2026",
    deskripsi:
      "Artikel ini membahas peran komprehensif masjid dalam agama Islam. Tidak hanya sebagai pusat ibadah dan spiritualitas, masjid juga berperan sebagai pilar penting dalam pendidikan, kegiatan sosial, dan penguatan tali persaudaraan (ukhuwah) di tengah masyarakat.",
    gambar:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Blue_Mosque_2.jpg/1280px-Blue_Mosque_2.jpg",
  },
  {
    id: 2,
    judul: "Masjid di Era Modern: Mempertahankan Tradisi di Tengah Arus Digitalisasi",
    status: "Draft",
    penulis: "Admin",
    tanggal: "29 Maret 2026",
    deskripsi:
      "Artikel ini menyoroti bagaimana masjid beradaptasi di era modern dan teknologi. Meskipun fungsi utamanya sebagai pusat ibadah tetap teguh, masjid kini secara aktif memanfaatkan kemajuan digital untuk menyebarkan dakwah, mengelola dana sosial umat, dan merangkul generasi muda tanpa kehilangan nilai-nilai keislamannya.",
    gambar:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Sultan_Ahmed_mosq.jpg/1280px-Sultan_Ahmed_mosq.jpg",
  },
  {
    id: 3,
    judul: "",
    status: "Draft",
    penulis: "",
    tanggal: "",
    deskripsi: "",
    gambar: "",
  },
];

const ITEMS_PER_PAGE = 3;

const StatusBadge = ({ status }: { status: StatusType }) => (
  <span
    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
      status === "Diterbitkan"
        ? "bg-green-100 text-green-700"
        : "bg-gray-200 text-gray-600"
    }`}
  >
    {status}
  </span>
);

export default function BeritaArtikelPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Artikel[]>(DUMMY_DATA);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; status: StatusType } | null>(null);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const paginated = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const confirmDelete = () => {
    setData((prev) => prev.filter((a) => a.id !== deleteTarget?.id));
    setDeleteTarget(null);
  };

  const isDraft = deleteTarget?.status === "Draft";

  return (
    <div className="min-h-screen bg-[#e8f5e9] px-6 py-6 flex flex-col gap-5">

      {/* Tambah Button */}
      <div>
        <button
          onClick={() => router.push("/admin/berita-dan-artikel/add")}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition shadow-sm"
        >
          Tambah Berita dan Artikel
        </button>
      </div>

      {/* Article Cards */}
      <div className="flex flex-col gap-4">
        {paginated.map((artikel) => (
          <div
            key={artikel.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm flex"
            style={{ minHeight: "140px" }}
          >
            {/* Gambar */}
            <div className="w-44 min-w-[11rem] bg-gray-100 flex-shrink-0">
              {artikel.gambar && (
                <img
                  src={artikel.gambar}
                  alt={artikel.judul}
                  className="w-full h-full object-cover"
                  style={{ minHeight: "140px" }}
                />
              )}
            </div>

            {/* Konten */}
            <div className="flex flex-col justify-between flex-1 px-5 py-4">
              {artikel.judul ? (
                <>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-bold text-gray-800 leading-snug">
                      {artikel.judul}
                    </h2>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={artikel.status} />
                      <span className="text-[11px] text-gray-400">
                        Oleh: {artikel.penulis}
                      </span>
                      <span className="text-[11px] text-gray-400">|</span>
                      <span className="text-[11px] text-gray-400">
                        {artikel.tanggal}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mt-1 line-clamp-3">
                      {artikel.deskripsi}
                    </p>
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
                      onClick={() => router.push(`/admin/berita-dan-artikel/${artikel.id}`)}
                      className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-medium transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Lihat
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition text-sm"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold transition ${
              currentPage === page
                ? "bg-green-500 text-white shadow"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition text-sm"
        >
          ›
        </button>
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
                className="flex-1 py-4 rounded-full bg-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-400 transition"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className={`flex-1 py-4 rounded-full text-white text-sm font-semibold transition ${
                  isDraft
                    ? "bg-[#D4183D] hover:bg-red-600"
                    : "bg-[#D4183D] hover:bg-red-600"
                }`}
              >
                {isDraft ? "Ya, Hapus Draft" : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}