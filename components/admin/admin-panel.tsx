"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://assalam-be-production.up.railway.app";

const menuItems = [
  {
    label: "Berita dan Artikel",
    href: "/admin/berita-dan-artikel",
    icon: (
      <Image src="/images/newspaper.png" alt="Berita dan Artikel" width={42} height={42} />
    ),
  },
  {
    label: "Jadwal Operasional",
    href: "/admin/jadwal-operasional",
    icon: (
      <Image src="/images/clock.png" alt="Jadwal Operasional" width={42} height={42} />
    ),
  },
  {
    label: "Kegiatan Masjid",
    href: "/admin/kegiatan-masjid",
    icon: (
      <Image src="/images/calendar.png" alt="Kegiatan Masjid" width={42} height={42} />
    ),
  },
];

interface Stats {
  totalArtikel: number;
  dipublikasi: number;
  totalKegiatan: number;
}

export default function AdminPanelPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ totalArtikel: 0, dipublikasi: 0, totalKegiatan: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [resNews, resActivity, resVisitors] = await Promise.all([
          fetch(`${API_URL}/api/news`),
          fetch(`${API_URL}/api/activities`),
          fetch("/api/visitors"),
        ]);

        const jsonNews = await resNews.json();
        const jsonActivity = await resActivity.json();
        const jsonVisitors = await resVisitors.json();

        const news = jsonNews.data || [];
        const activities = jsonActivity.data || [];

        setStats({
          totalArtikel: news.length,
          dipublikasi: news.filter((n: { status: string }) => n.status === "PUBLISHED").length,
          totalKegiatan: activities.length,
        });

        setVisitors(jsonVisitors.visitors ?? null);
      } catch {
        // biarkan default
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const formatVisitors = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

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

      <div className="w-full max-w-lg px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* ── MENU UTAMA ── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">Menu Utama</p>
          <div className="grid grid-cols-3 gap-3">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="bg-white rounded-2xl py-5 px-3 flex flex-col items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full"
              >
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center leading-snug">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── STATISTIK RINGKAS ── */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">Statistik Ringkas</p>
          <div className="grid grid-cols-2 gap-3">

            {/* Total Artikel */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Image src="/images/newspaper.png" alt="Artikel" width={20} height={20} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-7 w-10 bg-gray-200 rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">{stats.totalArtikel}</p>
              )}
              <p className="text-sm text-gray-600 font-medium">Total Artikel</p>
              {!loadingStats && (
                <p className="text-xs text-green-600 font-semibold">
                  {stats.dipublikasi} dipublikasi
                </p>
              )}
            </div>

            {/* Jadwal Operasional */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Image src="/images/clock.png" alt="Jadwal" width={20} height={20} />
              </div>
              <div className="h-7" />
              <p className="text-sm text-gray-600 font-medium">Jadwal Operasional</p>
              <p className="text-xs text-green-600 font-semibold">Setiap hari buka</p>
            </div>

            {/* Kegiatan Masjid */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Image src="/images/calendar.png" alt="Kegiatan" width={20} height={20} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-7 w-10 bg-gray-200 rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">{stats.totalKegiatan}</p>
              )}
              <p className="text-sm text-gray-600 font-medium">Kegiatan Masjid</p>
            </div>

            {/* Pengunjung Bulan Ini - dari Vercel Analytics */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4-4a4 4 0 100-8 4 4 0 000 8zm6 0a3 3 0 100-6 3 3 0 000 6zM3 17a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-7 w-16 bg-gray-200 rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">
                  {visitors !== null ? formatVisitors(visitors) : "—"}
                </p>
              )}
              <p className="text-sm text-gray-600 font-medium">Pengunjung Bulan Ini</p>
              {!loadingStats && visitors !== null && (
                <p className="text-xs text-green-600 font-semibold">via Vercel Analytics</p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}