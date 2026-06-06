"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGoogleAuth } from "@/context/GoogleAuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production-341d.up.railway.app";

const quickLinks = [
  { name: "Beranda", href: "/" },
  { name: "Waktu Sholat", href: "/#waktu-sholat" },
  { name: "Jadwal Operasional", href: "/#jadwal-operasional" },
  { name: "Berita Terbaru", href: "/#berita-dan-artikel" },
];

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface OperationalHour {
  id: number;
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface Kegiatan {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

interface Artikel {
  id: number;
  title: string;
  summary: string | null;
  content: string;
  imageUrl: string | null;
  status: string;
  author: { name: string };
  createdAt: string;
}

interface Toast {
  title: string;
  subtitle: string;
  success: boolean;
}

const PRAYER_LABELS = [
  { key: "Fajr", label: "Subuh", icon: "/images/Icon1.png" },
  { key: "Dhuhr", label: "Dzuhur", icon: "/images/Icon2.png" },
  { key: "Asr", label: "Ashar", icon: "/images/Icon3.png" },
  { key: "Maghrib", label: "Maghrib", icon: "/images/Icon4.png" },
  { key: "Isha", label: "Isya", icon: "/images/Icon5.png" },
];

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];

const formatTime = (timeStr: string) => {
  if (!timeStr) return "--:--";
  return timeStr.slice(0, 5);
};

const formatJam = (iso: string): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

const formatTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const getNextPrayer = (times: PrayerTimes, now: Date) => {
  const prayers = [
    { label: "Subuh", time: times.Fajr },
    { label: "Dzuhur", time: times.Dhuhr },
    { label: "Ashar", time: times.Asr },
    { label: "Maghrib", time: times.Maghrib },
    { label: "Isya", time: times.Isha },
  ];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  for (const prayer of prayers) {
    const [h, m] = prayer.time.split(":").map(Number);
    const prayerMinutes = h * 60 + m;
    if (prayerMinutes > currentMinutes) {
      const diff = prayerMinutes - currentMinutes;
      return { label: prayer.label, time: formatTime(prayer.time), diff: `${diff} m lagi` };
    }
  }
  return { label: "Subuh", time: formatTime(times.Fajr), diff: "Besok" };
};

const getHijriDate = () => {
  try {
    return new Intl.DateTimeFormat("id-ID-u-ca-islamic", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
};

const NEARBY_MOSQUES = [
  {
    name: "Masjid Ansor",
    rating: 4.4,
    desc: "Masjid komunitas di distrik Brigittenau",
    address: "Masjid komunitas di distrik Brigittenau",
    distance: "0.3 km",
    image: "images/ansor.png",
  },
  {
    name: "Masjid Ar-Rasheed",
    rating: 4.9,
    desc: "Masjid sunnah yang tenang dan ramah",
    address: "Hellwagstraße 3/2, 1200 Wien",
    distance: "0.7 km",
    image: "images/rasheed.png",
  },
  {
    name: "Ridvan Moschee Camii",
    rating: 4.6,
    desc: "Masjid Turki buka setiap hari 04.20–22.00",
    address: "Dresdner Str. 51, 1200 Wien",
    distance: "0.7 km",
    image: "images/ridvan.png",
  },
];

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken, googleUser, loginWithGoogle, logout, isLoading } = useGoogleAuth();

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loadingPrayer, setLoadingPrayer] = useState(true);
  const [opSchedule, setOpSchedule] = useState<OperationalHour[]>([]);
  const [loadingOp, setLoadingOp] = useState(true);
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([]);
  const [loadingKegiatan, setLoadingKegiatan] = useState(true);
  const [artikel, setArtikel] = useState<Artikel[]>([]);
  const [loadingArtikel, setLoadingArtikel] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((title: string, subtitle: string, success: boolean) => {
    setToast({ title, subtitle, success });
    setToastVisible(true); 
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (searchParams.get("loginRequired") === "true" && !accessToken) {
      showToast("Login Diperlukan", "Silakan klik tombol Masuk dengan Google.", false);
    }
  }, [searchParams, accessToken, showToast]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const fetchPrayer = async () => {
      try {
        const today = new Date();
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}?city=Vienna&country=Austria&method=3`
        );
        const json = await res.json();
        setPrayerTimes(json.data.timings);
      } catch {
        setPrayerTimes({ Fajr: "04:32", Dhuhr: "11:55", Asr: "15:12", Maghrib: "17:48", Isha: "19:02" });
      } finally {
        setLoadingPrayer(false);
      }
    };
    fetchPrayer();
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/operational-hours`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => setOpSchedule(json.data || []))
      .catch(() => {})
      .finally(() => setLoadingOp(false));
  }, []);

  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activities`, { credentials: "include" });
        const json = await res.json();
        setKegiatan((json.data || []).slice(0, 6));
      } catch (err) {
        console.error("Gagal fetch kegiatan:", err);
      } finally {
        setLoadingKegiatan(false);
      }
    };
    fetchKegiatan();
  }, []);

  useEffect(() => {
    const fetchArtikel = async () => {
      try {
        const res = await fetch(`${API_URL}/api/news`, { credentials: "include" });
        const json = await res.json();
        const published = (json.data || []).filter((a: Artikel) => a.status === "PUBLISHED");
        setArtikel(published.slice(0, 5));
      } catch (err) {
        console.error("Gagal fetch artikel:", err);
      } finally {
        setLoadingArtikel(false);
      }
    };
    fetchArtikel();
  }, []);

  useEffect(() => {
    if (!accessToken || loadingKegiatan) return;
    const refreshKegiatan = async () => {
      try {
        const res = await fetch(`${API_URL}/api/activities`, { credentials: "include" });
        const json = await res.json();
        setKegiatan((json.data || []).slice(0, 6));
      } catch (err) {
        console.error("Gagal refresh kegiatan:", err);
      }
    };
    refreshKegiatan();
  }, [accessToken, loadingKegiatan]);

  const joinAndAddToCalendar = async (item: Kegiatan) => {
    if (!accessToken) {
      loginWithGoogle();
      return;
    }

    setAddingId(item.id);
    try {
      const joinRes = await fetch(`${API_URL}/api/activities/${item.id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!joinRes.ok && joinRes.status !== 409) {
        const errData = await joinRes.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal bergabung ke kegiatan");
      }

      const start =
        new Date(item.startTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const end =
        new Date(item.endTime).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      const calendarUrl =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${encodeURIComponent(item.title)}` +
        `&dates=${start}/${end}` +
        `&details=${encodeURIComponent(item.description)}` +
        `&location=${encodeURIComponent("Masjid As-Salam, Rauscherstraße 7, 1200 Wien")}`;

      window.open(calendarUrl, "_blank");

      const alreadyJoined = joinRes.status === 409;
      showToast(
        alreadyJoined ? "Sudah Terdaftar" : "Berhasil Bergabung!",
        alreadyJoined
          ? `Kamu sudah terdaftar di ${item.title}. Kalender tetap dibuka.`
          : `${item.title} berhasil dicatat dan ditambahkan ke Google Calendar kamu.`,
        true
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Silakan coba lagi.";
      showToast("Gagal Bergabung", message, false);
    } finally {
      setAddingId(null);
    }
  };

  const handleAdminClick = () => {
    if (isLoading) return;
    if (!googleUser) {
      loginWithGoogle();
      return;
    }
    if (googleUser.role === "ADMIN") {
      router.push("/admin/panel");
    } else {
      showToast("Akses Ditolak", "Akun Anda tidak memiliki hak akses admin.", false);
    }
  };

  const clockStr = mounted ? now.toTimeString().slice(0, 8).replace(/:/g, ".") : "--:--:--";
  const dateStr = mounted
    ? now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";
  const hijriStr = mounted ? getHijriDate() : "";
  const nowMinutes = mounted ? now.getHours() * 60 + now.getMinutes() : 0;
  const todayName = mounted ? dayNames[now.getDay()] : "";
  const nextPrayer = mounted && prayerTimes ? getNextPrayer(prayerTimes, now) : null;
  const todaySchedule = opSchedule.find((s) => s.day === todayName);

  let isMasjidOpen = false;
  if (mounted && todaySchedule && !todaySchedule.isClosed) {
    const [oh, om] = todaySchedule.open.split(":").map(Number);
    const [ch, cm] = todaySchedule.close.split(":").map(Number);
    isMasjidOpen = nowMinutes >= oh * 60 + om && nowMinutes < ch * 60 + cm;
  }

  const featuredArtikel = artikel[0] ?? null;
  const otherArtikel = artikel.slice(1, 5);

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col">
      {/* ── TOAST ── */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
            toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden min-w-[300px] max-w-sm">
            <div className="flex items-center gap-3 px-5 py-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  toast.success ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {toast.success ? (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <p className="text-sm font-bold text-gray-800">{toast.title}</p>
                <p className={`text-xs leading-snug ${toast.success ? "text-green-600" : "text-red-500"}`}>
                  {toast.subtitle}
                </p>
              </div>
              <button
                onClick={() => {
                  setToastVisible(false);
                  setTimeout(() => setToast(null), 300);
                }}
                className="text-gray-300 hover:text-gray-500 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-1 bg-gray-100">
              <div
                className={`h-full ${toast.success ? "bg-green-500" : "bg-red-500"}`}
                style={{ animation: "shrinkBar 3s linear forwards" }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shrinkBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="relative w-full flex flex-col" style={{ minHeight: "480px" }}>
        <img src="images/foto1.jpeg" alt="Masjid As-Salam" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20" />
        <div className="relative z-10 flex w-full max-w-6xl mx-auto px-6 py-4 mt-5 rounded-3xl bg-white/10 items-center justify-center">
          <div className="flex items-center gap-8">
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
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 sm:px-16 pb-16 pt-8 max-w-2xl ml-8 sm:ml-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-0.5 bg-green-400" />
            <span className="text-green-300 text-xs font-semibold tracking-widest uppercase">
              Masjid Indonesia di Wina, Austria
            </span>
          </div>
          <h1 className="text-white text-4xl sm:text-5xl font-extrabold leading-tight mb-3 drop-shadow">
            Masjid As-Salam
          </h1>
          <p className="text-green-300 text-base font-bold mb-4">Merajut Ukhuwah, Menebarkan Kedamaian.</p>
          <p className="text-white text-2xl mb-4 leading-loose">بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ</p>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm">
            Selamat datang di <span className="font-bold text-white">Masjid As-Salam</span>, satu-satunya masjid
            komunitas Indonesia di Vienna.
          </p>
        </div>
      </div>

      {/* ── JADWAL SHOLAT ── */}
      <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <section id="waktu-sholat" />
          <p className="text-[#22C55E] text-xs font-bold tracking-widest uppercase">Jadwal Sholat</p>
          <h2 className="text-gray-800 text-2xl font-bold">Waktu Sholat Hari Ini</h2>
        </div>
        <div className="bg-[#22C55E] rounded-2xl px-5 py-5 flex items-center justify-between gap-4 shadow-md">
          <div className="bg-green-300/30 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20">
            <p className="text-green-100 text-[10px]">Tanggal</p>
            <p className="text-white text-xs font-semibold">{dateStr}</p>
            <p className="text-green-200 text-xs">{hijriStr}</p>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l3 3" />
            </svg>
            <span className="text-white text-2xl font-bold tracking-widest">{clockStr}</span>
          </div>
          {nextPrayer && (
            <div className="bg-green-300/30 backdrop-blur-md rounded-xl px-3 py-2 text-right border border-white/20">
              <p className="text-green-100 text-[10px]">Sholat Berikutnya</p>
              <p className="text-white text-sm font-bold">
                {nextPrayer.label} - {nextPrayer.time}
              </p>
              <p className="text-green-200 text-[10px]">{nextPrayer.diff}</p>
            </div>
          )}
        </div>
        {loadingPrayer ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-3">
            {PRAYER_LABELS.map((p) => {
              const timeVal = prayerTimes ? formatTime(prayerTimes[p.key as keyof PrayerTimes]) : "--:--";
              const [h, m] = timeVal.split(":").map(Number);
              const pMin = h * 60 + m;
              const isNext = nextPrayer?.label === p.label;
              const isPast = mounted && pMin < nowMinutes && !isNext;
              return (
                <div
                  key={p.key}
                  className={`flex flex-col items-center gap-2 rounded-2xl py-4 px-3 shadow-sm transition ${
                    isNext ? "bg-green-500 text-white" : isPast ? "bg-white text-gray-300" : "bg-white text-gray-700"
                  }`}
                >
                  <img src={p.icon} alt={p.label} className="w-10 h-10 object-contain" />
                  <span className={`text-xs font-semibold ${isNext ? "text-white" : isPast ? "text-gray-300" : "text-gray-500"}`}>
                    {p.label}
                  </span>
                  <span className={`text-sm font-bold ${isNext ? "text-white" : isPast ? "text-gray-300" : "text-gray-800"}`}>
                    {timeVal}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── JADWAL OPERASIONAL ── */}
      <section className="bg-white w-full">
        <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1">
            <section id="jadwal-operasional" />
            <p className="text-green-600 text-xs font-bold tracking-widest uppercase">Jadwal Operasional</p>
            <h2 className="text-gray-800 text-2xl font-bold">Jam Buka Masjid</h2>
          </div>
          <div className="flex justify-center">
            <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold ${isMasjidOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${isMasjidOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              {isMasjidOpen ? "Masjid Saat Ini Buka" : "Masjid Saat Ini Tutup"}
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-green-400 px-5 py-4">
              <h3 className="text-white font-bold text-base">Jadwal Operasional Mingguan</h3>
            </div>
            {loadingOp ? (
              <div className="bg-white p-10 text-center">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
              </div>
            ) : opSchedule.length === 0 ? (
              <div className="bg-white p-10 text-center text-gray-400 text-sm">Jadwal belum tersedia.</div>
            ) : (
              opSchedule.map((item, idx) => {
                const isToday = mounted && item.day === todayName;
                return (
                  <div key={item.id} className={`flex items-center justify-between px-5 py-4 ${isToday ? "bg-green-50" : "bg-white"} ${idx < opSchedule.length - 1 ? "border-b border-gray-100" : ""}`}>
                    <div className="flex items-center gap-2">
                      {isToday && <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />}
                      <span className={`text-sm ${isToday ? "font-bold text-gray-800" : "text-gray-600"}`}>{item.day}</span>
                      {isToday && <span className="text-[10px] bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full">HARI INI</span>}
                    </div>
                    {item.isClosed ? (
                      <span className="text-sm font-semibold text-red-500">Tutup</span>
                    ) : (
                      <span className={`text-sm font-semibold ${isToday ? "text-green-600" : "text-green-500"}`}>
                        {item.open?.slice(0, 5)} – {item.close?.slice(0, 5)}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── KEGIATAN MASJID ── */}
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <p className="text-green-600 text-xs font-bold tracking-widest uppercase">Kegiatan Masjid</p>
          <h2 className="text-gray-800 text-2xl font-bold">Program dan Kegiatan</h2>
        </div>
        <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm text-center max-w-md mx-auto w-full">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
            </svg>
          </div>
          <p className="font-bold text-gray-800">Sinkronkan ke Google Calendar</p>
          <p className="text-xs text-green-600 leading-relaxed max-w-xs">
            Masuk dengan akun Google untuk ikut kegiatan masjid dan menambahkannya ke kalender Anda secara otomatis.
          </p>
          {googleUser ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-full px-4 py-2 w-full justify-center">
              <img src={googleUser.picture} alt={googleUser.name} className="w-6 h-6 rounded-full" />
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800">{googleUser.name}</p>
                <p className="text-[10px] text-gray-500">{googleUser.email}</p>
              </div>
              <button onClick={logout} className="text-[10px] text-red-400 hover:text-red-600 ml-2 font-semibold">Keluar</button>
            </div>
          ) : (
            <button
              onClick={() => loginWithGoogle()}
              className="flex items-center gap-2 border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Masuk dengan Google
            </button>
          )}
        </div>

        {loadingKegiatan ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kegiatan.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
                <h3 className="font-bold text-sm text-gray-800">{item.title}</h3>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l3 3" />
                  </svg>
                  {formatJam(item.startTime)} - {formatJam(item.endTime)}
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {new Date(item.startTime).toLocaleDateString("id-ID", { weekday: "long", timeZone: "UTC" })}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Deskripsi</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{item.description}</p>
                </div>
                {accessToken ? (
                  <button
                    onClick={() => joinAndAddToCalendar(item)}
                    disabled={addingId === item.id}
                    className="mt-auto w-full text-white text-xs font-semibold rounded-full py-2 transition flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-60"
                  >
                    {addingId === item.id ? (
                      <>
                        <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
                        </svg>
                        Ikut Kegiatan
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => loginWithGoogle()}
                    className="mt-auto w-full text-white text-xs font-semibold rounded-full py-2 transition flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
                    </svg>
                    Buat Pengingat
                  </button>
                )}
              </div>
            ))}
            {Array.from({ length: Math.max(0, 6 - kegiatan.length) }).map((_, i) => (
              <div key={`empty-k-${i}`} className="bg-white border border-gray-100 rounded-2xl min-h-[180px]" />
            ))}
          </div>
        )}
        <div className="flex justify-center">
          <button
            onClick={() => router.push("/user/kegiatan-masjid")}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-6 py-3 rounded-full transition shadow-sm"
          >
            Lihat Semua Kegiatan
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── BERITA DAN ARTIKEL ── */}
      <section className="bg-white w-full">
        <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1">
            <section id="berita-dan-artikel" />
            <p className="text-green-600 text-xs font-bold tracking-widest uppercase">Berita dan Artikel</p>
            <h2 className="text-gray-800 text-2xl font-bold">Kabar Terbaru dari Masjid</h2>
          </div>
          {loadingArtikel ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {featuredArtikel && (
                <div
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row cursor-pointer hover:shadow-md transition"
                  onClick={() => router.push(`/user/berita-dan-artikel/${featuredArtikel.id}`)}
                >
                  {featuredArtikel.imageUrl && (
                    <img src={featuredArtikel.imageUrl} alt={featuredArtikel.title} className="w-full sm:w-64 h-52 sm:h-auto object-cover flex-shrink-0" />
                  )}
                  <div className="p-6 flex flex-col gap-2 justify-center">
                    <h3 className="text-lg font-bold text-gray-800 leading-snug">{featuredArtikel.title}</h3>
                    <p className="text-xs text-gray-400">{formatTanggal(featuredArtikel.createdAt)}</p>
                    {featuredArtikel.summary && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-4">{featuredArtikel.summary}</p>
                    )}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {otherArtikel.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition"
                    onClick={() => router.push(`/user/berita-dan-artikel/${item.id}`)}
                  >
                    {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-28 object-cover" />}
                    <div className="p-3 flex flex-col gap-1">
                      <h3 className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">{item.title}</h3>
                      <p className="text-[10px] text-gray-400">{formatTanggal(item.createdAt)}</p>
                      {item.summary && <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">{item.summary}</p>}
                    </div>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, 4 - otherArtikel.length) }).map((_, i) => (
                  <div key={`empty-a-${i}`} className="bg-white border border-gray-100 rounded-2xl min-h-[160px]" />
                ))}
              </div>
            </>
          )}
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/user/berita-dan-artikel")}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-6 py-3 rounded-full transition shadow-sm"
            >
              Lihat Semua Berita dan Artikel
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── LOKASI MASJID ── */}
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <p className="text-green-600 text-xs font-bold tracking-widest uppercase">Lokasi Masjid</p>
          <h2 className="text-gray-800 text-2xl font-bold">Temukan Kami</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 rounded-2xl overflow-hidden shadow-sm min-h-[280px] relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d395.08417811206493!2d16.373427959571636!3d48.22974577423544!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDjCsDEzJzQ3LjYiTiAxNsKwMjInMjQuMSJF!5e0!3m2!1sen!2sid!4v1779199933120!5m2!1sen!2sid"
              width="100%" height="100%"
              style={{ border: 0, minHeight: "280px" }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
            />
            <a
              href="https://maps.app.goo.gl/kQbPzPgabaKvMwMj9"
              target="_blank" rel="noopener noreferrer"
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-white transition shadow"
            >
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Buka di Google Maps
            </a>
          </div>
          <div className="flex flex-col gap-4 w-full sm:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">
              <h3 className="font-bold text-gray-800 text-sm">Informasi Kontak</h3>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Rauscherstraße 7/Hoftrakt, 1200 Wien, Austria</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>(255) 352-3258</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@wapena.org</span>
              </div>
            </div>
            <div className="bg-green-600 rounded-2xl p-5 flex flex-col gap-3">
              <h3 className="font-bold text-white text-sm">Petunjuk Arah</h3>
              <div className="flex flex-col gap-2 text-xs text-green-100">
                <p><span className="font-bold text-white">U-Bahn U6</span> — Stasiun Dresdner Straße, jalan kaki ±7 menit</p>
                <p><span className="font-bold text-white">Tram 2</span> — Halte Gaußplatz, jalan kaki ±5 menit</p>
                <p><span className="font-bold text-white">Bus 11A</span> — Halte Rauscherstraße (dekat masjid)</p>
                <p>Parkir tersedia di sekitar Rauscherstraße dan Adalbert-Stifter-Straße</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MASJID TERDEKAT ── */}
      <section className="bg-white w-full">
        <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1">
            <p className="text-green-600 text-xs font-bold tracking-widest uppercase">Masjid Terdekat</p>
            <h2 className="text-gray-800 text-2xl font-bold">Masjid Lain di Sekitar</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {NEARBY_MOSQUES.map((mosque) => (
              <div key={mosque.name} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative">
                  <img src={mosque.image} alt={mosque.name} className="w-full h-44 object-cover" />
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {mosque.distance}
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-1.5">
                  <h3 className="text-sm font-bold text-gray-800">{mosque.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs text-gray-500">{mosque.rating}</span>
                  </div>
                  <p className="text-xs text-green-600 font-medium">{mosque.desc}</p>
                  <div className="flex items-start gap-1 text-xs text-gray-500 mt-1">
                    <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{mosque.address}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full bg-green-900 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 0v9m0-9C9 6 7 9 7 12m5-9c3 3 5 6 5 9" />
                </svg>
                <span className="text-white text-lg font-bold">Wapena</span>
              </div>
              <p className="text-green-200 text-sm">Warga Pengajian Austria</p>
              <p className="text-green-200 text-sm leading-relaxed">Forum Saling Asih &amp; Asuh Komunitas<br />Muslim Indonesia di Austria</p>
              <p className="text-sm">
                <span className="text-green-400 font-semibold">Address: </span>
                <span className="text-green-200">Masjid As-Salam, Malfattigasse 18 – Lantai Dasar, 1120 Wina</span>
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-green-400 font-bold text-sm mb-1">Quick Links</h3>
              {quickLinks.map((link) => (
                <span key={link.href} className="text-green-200 text-sm cursor-pointer hover:text-white transition" onClick={() => router.push(link.href)}>
                  {link.name}
                </span>
              ))}
            </div>
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
        <div className="border-t border-green-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[#FFFFFF4D] text-xs">Copyright © 2020 Wapena. All Rights Reserved.</p>
            <button
              onClick={handleAdminClick}
              disabled={isLoading}
              className="text-[#FFFFFF4D] text-xs flex items-center gap-1 hover:text-white transition disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-3 h-3 border border-white/30 border-t-white/80 rounded-full animate-spin inline-block" />
              ) : (
                <img src="/images/admin-icon.png" alt="Admin Icon" className="w-3 h-3 inline-block" />
              )}
              Admin
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}