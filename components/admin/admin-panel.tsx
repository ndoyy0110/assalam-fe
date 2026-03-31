"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

const menuItems = [
  {
    label: "Berita dan Artikel",
    href: "/admin/berita-dan-artikel",
    icon: (
      <Image
        src="/images/newspaper.png"
        alt="Berita dan Artikel"
        width={42}
        height={42}
      />
    ),
  },
  {
    label: "Jadwal Operasional",
    href: "/admin/jadwal-operasional",
    icon: (
      <Image
        src="/images/clock.png"
        alt="Jadwal Operasional"
        width={42}
        height={42}
      />
    ),
  },
  {
    label: "Kegiatan Masjid",
    href: "/admin/kegiatan-masjid",
    icon: (
      <Image
        src="/images/calendar.png"
        alt="Kegiatan Masjid"
        width={42}
        height={42}
      />
    ),
  },
];

export default function AdminPanelPage() {
  const router = useRouter();

  return (
    <div className="bg-[#e8f5e9] min-h-screen flex flex-col items-center">

      {/* HEADER */}
      <div className="w-full bg-green-900 flex flex-col items-center pb-10">
        <div className="flex w-full max-w-3xl px-4 sm:px-6 py-4 mt-5 rounded-3xl bg-white/10 items-center justify-end">
          <div className="flex items-center gap-2">
            <span className="text-green-200 text-sm font-medium">Halo, Admin!</span>
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
              A
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <h1 className="text-white text-xl sm:text-2xl font-bold tracking-wide">Admin Panel</h1>
        </div>
      </div>

      {/* MENU GRID */}
      <div className="w-full max-w-4xl px-4 sm:px-6 py-8 flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 w-full max-w-sm sm:max-w-6xl mx-auto">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="bg-white rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full"
            >
              <div className="w-32 h-32 sm:w-30 sm:h-30 rounded-full bg-green-100 flex items-center justify-center">
                {item.icon}
              </div>
              <span className="text-sm font-semibold text-gray-700 text-center leading-snug">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}