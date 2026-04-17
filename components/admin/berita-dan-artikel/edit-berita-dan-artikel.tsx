"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production.up.railway.app";

interface NewsDetail {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  imageUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
}

export default function EditBeritaArtikel() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ 
    title: "", 
    summary: "", 
    content: "" });
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [gambar, setGambar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID artikel tidak ditemukan.");
      setLoading(false);
      return;
    }
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/news/${id}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Gagal mengambil data");
        const d: NewsDetail = json.data;
        setForm({ title: d.title, summary: d.summary || "", content: d.content });
        setStatus(d.status);
        setPreview(d.imageUrl || null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleGambarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGambar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (newStatus?: "DRAFT" | "PUBLISHED") => {
    if (!form.title.trim() || !form.content.trim()) {
      setError("Judul dan konten wajib diisi!");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("summary", form.summary);
      formData.append("content", form.content);
      formData.append("status", newStatus || status);
      if (gambar) formData.append("image", gambar);

      const res = await fetch(`${API_URL}/api/news/${id}`, {
        method: "PUT",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan");

      router.push("/admin/berita-dan-artikel");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
      <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
      <p className="text-sm">Memuat artikel...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#e8f5e9] px-6 py-8 flex flex-col gap-5">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold text-red-400">✕</button>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Judul Artikel dan Berita</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
        {gambar && <span className="text-xs text-gray-400 mt-0.5">{gambar.name}</span>}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Ringkasan</label>
        <textarea
          rows={4}
          value={form.summary}
          onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-700">Konten Artikel</label>
        <textarea
          rows={8}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
        />
      </div>

      <div className="flex justify-end gap-4 mt-2">
        <button
          onClick={() => router.back()}
          disabled={saving}
          className="px-8 py-2.5 rounded-full text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 transition border border-gray-200 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}