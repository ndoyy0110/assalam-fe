"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://assalam-be-production.up.railway.app";

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

const PRAYER_LABELS = [
  { key: "Fajr",    label: "Subuh",   icon: "🌅" },
  { key: "Dhuhr",   label: "Dzuhur",  icon: "☀️" },
  { key: "Asr",     label: "Ashar",   icon: "⛅" },
  { key: "Maghrib", label: "Maghrib", icon: "🌇" },
  { key: "Isha",    label: "Isya",    icon: "🌙" },
];

const formatTime = (timeStr: string) => {
  if (!timeStr) return "--:--";
  return timeStr.slice(0, 5);
};

const getNextPrayer = (times: PrayerTimes, now: Date) => {
  const prayers = [
    { label: "Subuh",   time: times.Fajr },
    { label: "Dzuhur",  time: times.Dhuhr },
    { label: "Ashar",   time: times.Asr },
    { label: "Maghrib", time: times.Maghrib },
    { label: "Isya",    time: times.Isha },
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
      day: "numeric", month: "long", year: "numeric",
    }).format(new Date());
  } catch {
    return "";
  }
};

export default function HomePage() {
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loadingPrayer, setLoadingPrayer] = useState(true);
  const [opSchedule, setOpSchedule] = useState<OperationalHour[]>([]);
  const [loadingOp, setLoadingOp] = useState(true);

  // Jam berjalan
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch jadwal sholat
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

  // Fetch jadwal operasional dari API
  useEffect(() => {
    fetch(`${API_URL}/api/operational-hours`)
      .then((r) => r.json())
      .then((json) => setOpSchedule(json.data || []))
      .catch(() => {})
      .finally(() => setLoadingOp(false));
  }, []);

  const clockStr = now.toTimeString().slice(0, 8).replace(/:/g, ".");
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const hijriStr = getHijriDate();
  const nextPrayer = prayerTimes ? getNextPrayer(prayerTimes, now) : null;

  // Status buka/tutup berdasarkan data API
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu"];
  const todayName = dayNames[now.getDay()];
  const todaySchedule = opSchedule.find((s) => s.day === todayName);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  let isMasjidOpen = false;
  if (todaySchedule && !todaySchedule.isClosed) {
    const [oh, om] = todaySchedule.open.split(":").map(Number);
    const [ch, cm] = todaySchedule.close.split(":").map(Number);
    isMasjidOpen = nowMinutes >= oh * 60 + om && nowMinutes < ch * 60 + cm;
  }

  return (
    <div className="min-h-screen bg-[#e8f5e9] flex flex-col">

      {/* ── HERO SECTION ── */}
      <div className="relative w-full min-h-[480px] flex flex-col">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Blue_Mosque_2.jpg/1280px-Blue_Mosque_2.jpg"
          alt="Masjid As-Salam"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/20" />

        {/* NAV */}
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

        {/* HERO CONTENT */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 sm:px-12 pb-12 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-0.5 bg-green-400" />
            <span className="text-green-300 text-xs font-semibold tracking-widest uppercase">
              Masjid Indonesia di Wina, Austria
            </span>
          </div>
          <h1 className="text-white text-4xl sm:text-5xl font-extrabold leading-tight mb-3 drop-shadow">
            Masjid As-Salam
          </h1>
          <p className="text-green-300 text-base font-bold mb-4">
            Merajut Ukhuwah, Menebarkan Kedamaian.
          </p>
          <p className="text-white text-2xl mb-4 leading-loose">
            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
          </p>
          <p className="text-white/80 text-sm leading-relaxed max-w-sm">
            Selamat datang di <span className="font-bold text-white">Masjid As-Salam</span>, satu-satunya
            masjid komunitas Indonesia di Vienna. Pusat ibadah, silaturahmi, dan kegiatan
            keislaman bagi warga Muslim Indonesia yang bermukim di Austria.
          </p>
        </div>
      </div>

      {/* ── JADWAL SHOLAT ── */}
      <div className="w-full max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <p className="text-green-600 text-xs font-bold tracking-widest uppercase">Jadwal Sholat</p>
          <h2 className="text-gray-800 text-2xl font-bold">Waktu Sholat Hari Ini</h2>
        </div>

        {/* Card jam & next prayer */}
        <div className="bg-green-600 rounded-2xl px-5 py-5 flex items-center justify-between gap-4 shadow-md">
          <div className="flex flex-col gap-0.5">
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
            <div className="bg-green-500 rounded-xl px-3 py-2 text-right">
              <p className="text-green-100 text-[10px]">Sholat Berikutnya</p>
              <p className="text-white text-sm font-bold">{nextPrayer.label} - {nextPrayer.time}</p>
              <p className="text-green-200 text-[10px]">{nextPrayer.diff}</p>
            </div>
          )}
        </div>

        {/* Grid waktu sholat */}
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
              const isPast = pMin < nowMinutes && !isNext;
              return (
                <div
                  key={p.key}
                  className={`flex flex-col items-center gap-1 rounded-2xl py-4 px-2 shadow-sm transition ${
                    isNext ? "bg-green-500 text-white" : isPast ? "bg-white text-gray-300" : "bg-white text-gray-700"
                  }`}
                >
                  <span className="text-xl">{p.icon}</span>
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
      <div className="w-full max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
        <div className="text-center flex flex-col gap-1">
          <p className="text-green-600 text-xs font-bold tracking-widest uppercase">Jadwal Operasional</p>
          <h2 className="text-gray-800 text-2xl font-bold">Jam Buka Masjid</h2>
        </div>

        {/* Status buka/tutup */}
        <div className="flex justify-center">
          <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold ${
            isMasjidOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}>
            <span className={`w-2.5 h-2.5 rounded-full ${isMasjidOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            {isMasjidOpen ? "Masjid Saat Ini Buka" : "Masjid Saat Ini Tutup"}
          </div>
        </div>

        {/* Tabel jadwal */}
        <div className="rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-green-400 px-5 py-4">
            <h3 className="text-white font-bold text-base">Jadwal Operasional Mingguan</h3>
          </div>

          {loadingOp ? (
            <div className="bg-white p-10 text-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full" />
            </div>
          ) : opSchedule.length === 0 ? (
            <div className="bg-white p-10 text-center text-gray-400 text-sm">
              Jadwal belum tersedia.
            </div>
          ) : (
            opSchedule.map((item, idx) => {
              const isToday = item.day === todayName;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    isToday ? "bg-green-50" : "bg-white"
                  } ${idx < opSchedule.length - 1 ? "border-b border-gray-100" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {isToday && <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />}
                    <span className={`text-sm ${isToday ? "font-bold text-gray-800" : "text-gray-600"}`}>
                      {item.day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full">
                        HARI INI
                      </span>
                    )}
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

      {/* FOOTER */}
      <footer className="w-full bg-green-900 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9zm0 0v9m0-9C9 6 7 9 7 12m5-9c3 3 5 6 5 9" />
                </svg>
                <span className="text-white text-lg font-bold">Wapena</span>
              </div>
              <p className="text-green-200 text-sm">Warga Pengajian Austria</p>
              <p className="text-green-200 text-sm leading-relaxed">
                Forum Saling Asih & Asuh Komunitas<br />Muslim Indonesia di Austria
              </p>
              <p className="text-sm">
                <span className="text-green-400 font-semibold">Address: </span>
                <span className="text-green-200">Masjid As-Salam, Malfattigasse 18 – Lantai Dasar, 1120 Wina</span>
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="text-green-400 font-bold text-sm mb-1">Quick Links</h3>
              {["Beranda", "Waktu Sholat", "Jadwal Operasional", "Tentang Kami", "Berita Terbaru", "Galeri Foto"].map((link) => (
                <span key={link} className="text-green-200 text-sm cursor-pointer hover:text-white transition">{link}</span>
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