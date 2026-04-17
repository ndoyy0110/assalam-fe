"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://assalam-be-production.up.railway.app";

export default function AddBeritaArtikel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    content: "",
  });

  const [gambar, setGambar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGambarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGambar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Judul dan konten wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("summary", form.summary);
      formData.append("content", form.content);
      formData.append("status", status);
      formData.append("authorId", "1"); // WAJIB (sementara hardcode)

      if (gambar) {
        formData.append("image", gambar);
      }

      const res = await fetch(`${API_URL}/api/news`, {
        method: "POST",
        body: formData,
      });

      // 🔥 safety parsing
      let json;
      try {
        json = await res.json();
      } catch {
        throw new Error("Response bukan JSON");
      }

      if (!res.ok) {
        throw new Error(json?.message || "Gagal menyimpan");
      }

      router.push("/admin/berita-dan-artikel");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8f5e9] px-6 py-8 flex flex-col gap-5">
      {/* ERROR */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="font-bold text-red-400"
          >
            ✕
          </button>
        </div>
      )}

      {/* JUDUL */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          Judul Artikel dan Berita
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) =>
            setForm((f) => ({ ...f, title: e.target.value }))
          }
          placeholder="Masukkan judul"
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
        />
      </div>

      {/* GAMBAR */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          Gambar
        </label>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border border-gray-200 rounded-lg h-28 flex items-center justify-center cursor-pointer hover:border-green-400 transition overflow-hidden"
        >
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              <span className="text-xs">
                Klik untuk unggah gambar
              </span>
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
          <span className="text-xs text-gray-400 mt-0.5">
            {gambar.name}
          </span>
        )}
      </div>

      {/* RINGKASAN */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          Ringkasan
        </label>
        <textarea
          rows={4}
          value={form.summary}
          onChange={(e) =>
            setForm((f) => ({ ...f, summary: e.target.value }))
          }
          placeholder="Masukkan ringkasan singkat"
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
        />
      </div>

      {/* KONTEN */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">
          Konten Artikel
        </label>
        <textarea
          rows={8}
          value={form.content}
          onChange={(e) =>
            setForm((f) => ({ ...f, content: e.target.value }))
          }
          placeholder="Masukkan konten artikel"
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
        />
      </div>

      {/* BUTTON */}
      <div className="flex justify-end gap-4 mt-2">
        <button
          onClick={() => handleSubmit("DRAFT")}
          disabled={loading}
          className="px-8 py-2.5 rounded-full text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 transition border border-gray-200 shadow-sm disabled:opacity-50"
        >
          Simpan Draft
        </button>

        <button
          onClick={() => handleSubmit("PUBLISHED")}
          disabled={loading}
          className="px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition shadow-sm disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          )}
          {loading ? "Menyimpan..." : "Tambah Berita dan Artikel"}
        </button>
      </div>
    </div>
  );
}