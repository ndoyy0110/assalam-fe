"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useGoogleAuth } from "@/context/GoogleAuthContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production-341d.up.railway.app";

const menuItems = [
  {
    label: "Berita dan Artikel",
    href: "/admin/berita-dan-artikel",
    icon: <Image src="/images/newspaper.png" alt="Berita dan Artikel" width={42} height={42} />,
  },
  {
    label: "Jadwal Operasional",
    href: "/admin/jadwal-operasional",
    icon: <Image src="/images/clock.png" alt="Jadwal Operasional" width={42} height={42} />,
  },
  {
    label: "Kegiatan Masjid",
    href: "/admin/kegiatan-masjid",
    icon: <Image src="/images/calendar.png" alt="Kegiatan Masjid" width={42} height={42} />,
  },
];

interface Stats {
  dipublikasi: number;
  draft: number;
  totalKegiatan: number;
  kegiatanMendatang: number;
  hariBuka: number;
  hariTutup: string[];
}

export default function AdminPanelPage() {
  const router = useRouter();
  const { googleUser, logout, isLoading } = useGoogleAuth();

  const [stats, setStats] = useState<Stats>({
    dipublikasi: 0,
    draft: 0,
    totalKegiatan: 0,
    kegiatanMendatang: 0,
    hariBuka: 7,
    hariTutup: [],
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [visitors, setVisitors] = useState<number | null>(null);

  /**
   * Guard: Tunggu auth selesai loading, lalu cek role.
   * - Belum login          → redirect ke /
   * - Login tapi bukan ADMIN → redirect ke /
   * - Login sebagai ADMIN  → lanjut render halaman
   */
  useEffect(() => {
    // Jangan redirect selama auth masih loading
    if (isLoading) return;

    if (!googleUser) {
      router.replace("/");
      return;
    }

    if (googleUser.role !== "ADMIN") {
      router.replace("/");
    }
  }, [googleUser, isLoading, router]);

  useEffect(() => {
    // Jangan fetch stats sebelum auth selesai atau jika bukan ADMIN
    if (isLoading || !googleUser || googleUser.role !== "ADMIN") return;

    const fetchStats = async () => {
      try {
        const [resNews, resActivity, resOpHours, resVisitors] = await Promise.all([
          fetch(`${API_URL}/api/news`),
          fetch(`${API_URL}/api/activities`),
          fetch(`${API_URL}/api/operational-hours`),
          fetch("/api/visitors"),
        ]);

        const jsonNews = await resNews.json();
        const jsonActivity = await resActivity.json();
        const jsonOpHours = await resOpHours.json();
        const jsonVisitors = await resVisitors.json();

        const news = jsonNews.data || [];
        const activities = jsonActivity.data || [];
        const opHours = jsonOpHours.data || [];

        const now = new Date();
        const kegiatanMendatang = activities.filter(
          (a: { endTime: string }) => new Date(a.endTime) >= now
        ).length;

        const hariTutup: string[] = opHours
          .filter((h: { isClosed: boolean }) => h.isClosed)
          .map((h: { day: string }) => h.day);

        setStats({
          dipublikasi: news.filter((n: { status: string }) => n.status === "PUBLISHED").length,
          draft: news.filter((n: { status: string }) => n.status === "DRAFT").length,
          totalKegiatan: activities.length,
          kegiatanMendatang,
          hariBuka: 7 - hariTutup.length,
          hariTutup,
        });

        setVisitors(jsonVisitors.visitors ?? null);
      } catch {
        // biarkan default
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [googleUser, isLoading]);

  const formatVisitors = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Tampilkan loading screen selama auth masih dicek
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
          <p className="text-green-700 text-sm font-medium">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Jika bukan ADMIN, jangan render apapun (useEffect akan redirect)
  if (!googleUser || googleUser.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="bg-[#e8f5e9] min-h-screen flex flex-col items-center">
      {/* ── HEADER ── */}
      <div className="w-full bg-green-900 flex flex-col items-center pb-10">
        <div className="flex w-full max-w-6xl px-4 sm:px-6 py-4 mt-5 rounded-3xl bg-white/10 items-center justify-end">
          <div className="flex items-center gap-3">
            <span className="text-green-200 text-sm font-medium">
              Halo, {googleUser?.name ?? "Admin"}!
            </span>
            {googleUser?.picture ? (
              <img
                src={googleUser.picture}
                alt={googleUser.name}
                className="w-8 h-8 rounded-full border-2 border-white/30 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
            )}
            <button
              onClick={async () => {
                await logout();
                router.replace("/");
              }}
              className="text-xs text-green-300 hover:text-white transition font-semibold ml-1"
            >
              Keluar
            </button>
          </div>
        </div>
        <div className="mt-8 text-center">
          <h1 className="text-white text-xl sm:text-2xl font-bold tracking-wide">Admin Panel</h1>
        </div>
      </div>

      <div className="w-full max-w-6xl px-4 sm:px-6 py-8 flex flex-col gap-6">
        {/* ── MENU UTAMA ── */}
        <div>
          <p className="text-sm font-bold text-[#14532D] mb-3">Menu Utama</p>
          <div className="grid grid-cols-3 gap-3">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className="aspect-square bg-white rounded-2xl p-3 flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
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
          <p className="text-sm font-bold text-[#14532D] mb-3">Statistik Ringkas</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Berita dan Artikel */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm cursor-pointer hover:shadow-md transition">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Image src="/images/newspaper.png" alt="Artikel" width={32} height={32} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-7 w-10 bg-gray-200 rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">{stats.dipublikasi}</p>
              )}
              <p className="text-sm text-gray-600 font-medium">Artikel Dipublikasi</p>
              {!loadingStats && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    {stats.dipublikasi} diterbitkan
                  </span>
                  {stats.draft > 0 && (
                    <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                      {stats.draft} draft
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Jadwal Operasional */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm cursor-pointer hover:shadow-md transition">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Image src="/images/clock.png" alt="Jadwal" width={32} height={32} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-7 w-10 bg-gray-200 rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">
                  {stats.hariBuka}
                  <span className="text-sm font-normal text-gray-400 ml-1">hari/minggu</span>
                </p>
              )}
              <p className="text-sm text-gray-600 font-medium">Jadwal Operasional</p>
              {!loadingStats &&
                (stats.hariTutup.length === 0 ? (
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full w-fit">
                    Buka setiap hari
                  </span>
                ) : (
                  <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full w-fit">
                    Tutup: {stats.hariTutup.join(", ")}
                  </span>
                ))}
            </div>

            {/* Kegiatan Masjid */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm cursor-pointer hover:shadow-md transition">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Image src="/images/calendar.png" alt="Kegiatan" width={32} height={32} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-7 w-10 bg-gray-200 rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">{stats.totalKegiatan}</p>
              )}
              <p className="text-sm text-gray-600 font-medium">Kegiatan Masjid</p>
              {!loadingStats && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">
                    {stats.kegiatanMendatang} mendatang
                  </span>
                  {stats.totalKegiatan - stats.kegiatanMendatang > 0 && (
                    <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                      {stats.totalKegiatan - stats.kegiatanMendatang} selesai
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Pengunjung Bulan Ini */}
            <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                <Image src="/images/pengunjung.png" alt="Pengunjung" width={32} height={32} />
              </div>
              {loadingStats ? (
                <div className="animate-pulse h-7 w-16 bg-gray-200 rounded" />
              ) : (
                <p className="text-2xl font-bold text-gray-800">
                  {visitors !== null ? formatVisitors(visitors) : "—"}
                </p>
              )}
              <p className="text-sm text-gray-600 font-medium">Pengunjung Bulan Ini</p>
              {!loadingStats &&
                (visitors !== null ? (
                  <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full w-fit">
                    via Vercel Analytics
                  </span>
                ) : (
                  <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                    Belum ada data
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}