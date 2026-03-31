"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddKegiatanMasjid() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    waktuMulai: "",
    waktuSelesai: "",
    deskripsi: "",
  });

  const handleSave = () => {
    // TODO: simpan data ke API/database
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Form Card */}
      <div className="bg-[#e8f5e9] rounded-t-3xl -mt-5 flex-1 px-6 py-8 flex flex-col gap-5">

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

        {/* Tanggal Dimulai & Selesai */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Tanggal Kegiatan Dimulai</label>
            <input
              type="date"
              value={form.tanggalMulai}
              onChange={(e) => setForm((f) => ({ ...f, tanggalMulai: e.target.value }))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Tanggal Kegiatan Selesai</label>
            <input
              type="date"
              value={form.tanggalSelesai}
              onChange={(e) => setForm((f) => ({ ...f, tanggalSelesai: e.target.value }))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
            />
          </div>
        </div>

        {/* Waktu Dimulai & Selesai */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Waktu Kegiatan Dimulai</label>
            <input
              type="time"
              value={form.waktuMulai}
              onChange={(e) => setForm((f) => ({ ...f, waktuMulai: e.target.value }))}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-green-400 transition"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm font-semibold text-gray-700">Waktu Kegiatan Selesai</label>
            <input
              type="time"
              value={form.waktuSelesai}
              onChange={(e) => setForm((f) => ({ ...f, waktuSelesai: e.target.value }))}
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
        <div className="flex justify-end gap-4 mt-2">
          <button
            onClick={() => router.back()}
            className="px-8 py-2.5 rounded-full text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 transition border border-gray-200"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-green-500 hover:bg-green-600 transition"
          >
            Simpan Perubahan
          </button>
        </div>

      </div>
    </div>
  );
}