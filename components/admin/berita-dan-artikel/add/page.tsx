"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AddBeritaArtikel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    judul: "",
    ringkasan: "",
    konten: "",
  });
  const [gambar, setGambar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleGambarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGambar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveDraft = () => {
    // TODO: simpan sebagai draft
    console.log("Draft:", { ...form, gambar });
    router.back();
  };

  const handleTambah = () => {
    // TODO: publish ke API
    console.log("Publish:", { ...form, gambar });
    router.back();
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9] px-6 py-8 flex flex-col gap-5">

      {/* Judul */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          Judul Artikel dan Berita
        </label>
        <input
          type="text"
          value={form.judul}
          onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
        />
      </div>

      {/* Gambar */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Gambar</label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border border-gray-200 rounded-lg h-28 flex items-center justify-center cursor-pointer hover:border-green-400 transition overflow-hidden relative"
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <span className="text-xs">Klik untuk unggah gambar</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleGambarChange}
          className="hidden"
        />
        {gambar && (
          <span className="text-xs text-gray-400 mt-0.5">{gambar.name}</span>
        )}
      </div>

      {/* Ringkasan */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Ringkasan</label>
        <textarea
          rows={4}
          value={form.ringkasan}
          onChange={(e) => setForm((f) => ({ ...f, ringkasan: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
        />
      </div>

      {/* Konten Artikel */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Konten Artikel</label>
        <textarea
          rows={5}
          value={form.konten}
          onChange={(e) => setForm((f) => ({ ...f, konten: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-4 mt-2">
        <button
          onClick={handleSaveDraft}
          className="px-8 py-2.5 rounded-full text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 transition border border-gray-200 shadow-sm"
        >
          Simpan Draft
        </button>
        <button
          onClick={handleTambah}
          className="px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition shadow-sm"
        >
          Tambah Berita dan Artikel
        </button>
      </div>
    </div>
  );
}