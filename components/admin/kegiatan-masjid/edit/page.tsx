"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditKegiatanMasjid() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    tanggal: "",
    waktu: "",
    deskripsi: "",
  });

  const handleSave = () => {
    // TODO: simpan data ke API/database
    router.back();
  };

  return (
    <div className="w-full max-w-3xl px-4 py-8 mx-auto">
      <div className="bg-[#e8f5e9] rounded-2xl p-8 flex flex-col gap-5">

        {/* Nama Kegiatan */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Nama Kegiatan</label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
          />
        </div>

        {/* Tanggal & Waktu */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Tanggal</label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Waktu</label>
            <input
              type="time"
              value={form.waktu}
              onChange={(e) => setForm((f) => ({ ...f, waktu: e.target.value }))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
          <textarea
            rows={5}
            value={form.deskripsi}
            onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-gray-600 bg-white hover:bg-gray-200 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition"
          >
            Simpan Perubahan
          </button>
        </div>

      </div>
    </div>
  );
}