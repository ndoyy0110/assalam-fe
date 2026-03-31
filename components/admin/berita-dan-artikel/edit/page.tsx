"use client";

import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

const DUMMY_DATA = [
  { id: 1, judul: "Masjid: Lebih dari Sekadar Tempat Ibadah", ringkasan: "Peran komprehensif masjid dalam agama Islam.", konten: "Artikel ini membahas peran komprehensif masjid dalam agama Islam. Tidak hanya sebagai pusat ibadah dan spiritualitas, masjid juga berperan sebagai pilar penting dalam pendidikan, kegiatan sosial, dan penguatan tali persaudaraan (ukhuwah) di tengah masyarakat.", gambar: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Blue_Mosque_2.jpg/1280px-Blue_Mosque_2.jpg" },
  { id: 2, judul: "Masjid di Era Modern: Mempertahankan Tradisi di Tengah Arus Digitalisasi", ringkasan: "Masjid beradaptasi di era modern dan teknologi.", konten: "Artikel ini menyoroti bagaimana masjid beradaptasi di era modern dan teknologi.", gambar: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Sultan_Ahmed_mosq.jpg/1280px-Sultan_Ahmed_mosq.jpg" },
];

export default function EditBeritaArtikel() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const existing = DUMMY_DATA.find((d) => d.id === id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    judul: existing?.judul ?? "",
    ringkasan: existing?.ringkasan ?? "",
    konten: existing?.konten ?? "",
  });
  const [preview, setPreview] = useState<string | null>(existing?.gambar ?? null);

  const handleGambarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9] px-6 py-8 flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Judul Artikel dan Berita</label>
        <input
          type="text"
          value={form.judul}
          onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Gambar</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border border-gray-200 rounded-lg h-28 flex items-center justify-center cursor-pointer hover:border-green-400 transition overflow-hidden"
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-xs">Klik untuk unggah gambar</span>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleGambarChange} className="hidden" />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Ringkasan</label>
        <textarea
          rows={4}
          value={form.ringkasan}
          onChange={(e) => setForm((f) => ({ ...f, ringkasan: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Konten Artikel</label>
        <textarea
          rows={5}
          value={form.konten}
          onChange={(e) => setForm((f) => ({ ...f, konten: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
        />
      </div>

      <div className="flex justify-end gap-4 mt-2">
        <button
          onClick={() => router.back()}
          className="px-8 py-2.5 rounded-full text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 transition border border-gray-200"
        >
          Batal
        </button>
        <button
          onClick={() => router.back()}
          className="px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition"
        >
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}