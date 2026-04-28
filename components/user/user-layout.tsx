"use client";

import { useRouter } from "next/navigation";

export default function UserLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const router = useRouter();

  return (
    <div className="bg-[#e8f5e9] min-h-screen flex flex-col items-center">

      {/* HEADER */}
      <div className="w-full bg-[#14532D] flex flex-col items-center pb-10 pt-0">
        <div className="relative z-10 flex w-full max-w-6xl mx-auto px-6 py-4 mt-5 rounded-3xl bg-[#D9D9D933] items-center justify-center">
          <div className="flex text-center items-center gap-8">
            <span
              className="text-white text-sm font-bold cursor-pointer hover:text-green-300 transition"
              onClick={() => router.push("/user/berita-dan-artikel")}
            >
              BERITA DAN ARTIKEL
            </span>
            <span
              className="text-white text-sm font-bold cursor-pointer hover:text-green-300 transition"
              onClick={() => router.push("/user/kegiatan-masjid")}
            >
              KEGIATAN MASJID
            </span>
          </div>
        </div>

        {/* JUDUL */}
        {title && (
          <div className="mt-16 mb-8 text-center">
            <h1 className="text-white text-2xl font-bold tracking-wide">{title}</h1>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="w-full max-w-3xl px-4 py-8 mt-16 flex-1">
        {children}
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-green-900 mt-12">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

            {/* Kolom 1 - Brand */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 0v9m0-9C9 6 7 9 7 12m5-9c3 3 5 6 5 9" />
                </svg>
                <span className="text-white text-lg font-bold">Wapena</span>
              </div>
              <p className="text-green-200 text-sm leading-relaxed">Warga Pengajian Austria</p>
              <p className="text-green-200 text-sm leading-relaxed">
                Forum Saling Asih & Asuh Komunitas<br />Muslim Indonesia di Austria
              </p>
              <p className="text-sm leading-relaxed">
                <span className="text-green-400 font-semibold">Address: </span>
                <span className="text-green-200">Masjid As-Salam, Malfattigasse 18 – Lantai Dasar, 1120 Wina</span>
              </p>
            </div>

            {/* Kolom 2 - Quick Links */}
            <div className="flex flex-col gap-3">
              <h3 className="text-green-400 font-bold text-sm mb-1">Quick Links</h3>
              {["Beranda", "Waktu Sholat", "Jadwal Operasional", "Tentang Kami", "Berita Terbaru", "Galeri Foto"].map((link) => (
                <span
                  key={link}
                  className="text-green-200 text-sm cursor-pointer hover:text-white transition"
                >
                  {link}
                </span>
              ))}
            </div>

            {/* Kolom 3 - Kontak */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-green-400 font-bold text-sm mb-1">Phone</h3>
                <p className="text-green-200 text-sm">(255) 352-6258</p>
              </div>
              <div>
                <h3 className="text-green-400 font-bold text-sm mb-1">Email</h3>
                <p className="text-green-200 text-sm">info@wapena.org</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[#FFFFFF4D] text-xs">Copyright © 2020 Wapena. All Rights Reserved.</p>
            <p className="text-[#FFFFFF4D] text-xs flex items-center gap-1">
              Dibuat dengan
              <svg className="w-3 h-3 text-red-400 fill-red-400" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              untuk umat
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}