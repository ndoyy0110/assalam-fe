"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production.up.railway.app";

export default function AddKegiatanMasjid() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (
      !form.title.trim() ||
      !form.startDate ||
      !form.endDate ||
      !form.startTime ||
      !form.endTime ||
      !form.description.trim()
    ) {
      setError("Semua kolom wajib diisi!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // BE butuh field terpisah: startDate, startTime, endDate, endTime
      const body = {
        title: form.title,
        description: form.description,
        startDate: form.startDate,   // "YYYY-MM-DD"
        startTime: form.startTime,   // "HH:mm"
        endDate: form.endDate,       // "YYYY-MM-DD"
        endTime: form.endTime,       // "HH:mm"
      };

      const res = await fetch(`${API_URL}/api/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan");

      router.push("/admin/kegiatan-masjid");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-[#e8f5e9] rounded-t-3xl -mt-5 flex-1 px-6 py-8 flex flex-col gap-5">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="font-bold text-red-400">✕</button>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Nama Kegiatan</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Masukkan nama kegiatan"
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Tanggal Kegiatan Dimulai</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Tanggal Kegiatan Selesai</label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Waktu Kegiatan Dimulai</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Waktu Kegiatan Selesai</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Masukkan deskripsi kegiatan"
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
          />
        </div>

        <div className="flex justify-end gap-4 mt-2">
          <button
            onClick={() => router.back()}
            disabled={loading}
            className="px-8 py-2.5 rounded-full text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 transition border border-gray-200 disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>

      </div>
    </div>
  );
}