"use client";

import JadwalOperasional from "../../components-admin/jadwal-operasional";

export default function AdminJadwalOperasional() {
  return (
    <>
      {/* Header hijau */}
      <div className="min-w-screen h-[350px] bg-green-900 text-white relative flex flex-col items-center pt-10">
        <div className="flex font-semibold w-[1000px] h-[80px] px-6 py-3 rounded-3xl bg-[#D9D9D933] items-center justify-between">
          
          {/* Panah kiri */}
          <div className="flex items-center">
            <img src="/images/panah-kiri.png" alt="Panah Kiri"className="w-[32px] h-[32px]"/>
          </div>

          {/* Profil Admin */}
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-300">Halo, Admin!</div>
            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center">
              <span className="text-white text-sm">A</span>
            </div>
          </div>

        </div>

        <h1 className="text-4xl font-bold mb-6 pt-20">
          Jadwal Operasional
        </h1>
      </div>

      {/* Konten */}
      <div className="w-full bg-white text-black rounded-lg shadow-md p-20">
        <JadwalOperasional />
      </div>
    </>
  );
}