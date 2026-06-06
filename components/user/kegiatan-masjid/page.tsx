"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGoogleAuth } from "@/context/GoogleAuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production-341d.up.railway.app";

type Kegiatan = {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
};

interface Toast {
  title: string;
  subtitle: string;
  success: boolean;
}

const ITEMS_PER_PAGE = 6;

const formatJam = (iso: string): string => {
  if (!iso) return "-";
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}.${m}`;
};

const formatTanggal = (iso: string): string => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
};

export default function KegiatanMasjid() {
  const router = useRouter();
  const { accessToken, googleUser, loginWithGoogle, logout } = useGoogleAuth();

  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((title: string, subtitle: string, success: boolean) => {
    setToast({ title, subtitle, success });
    setToastVisible(true);
  }, []);

  const fetchKegiatan = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/activities`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengambil data");
      setData(json.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  let cancelled = false;

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/activities`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal mengambil data");
      if (!cancelled) setData(json.data || []);
    } catch (err: unknown) {
      if (!cancelled) setError(err instanceof Error ? err.message : "Gagal mengambil data");
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  load();
  return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const addToCalendar = useCallback(async (item: Kegiatan) => {
    if (!accessToken) {
      router.push("/?loginRequired=true");
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
  }, [accessToken, router, showToast]);

  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE) || 1;
  const paginated = data.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
      <div className="animate-spin w-7 h-7 border-2 border-green-500 border-t-transparent rounded-full" />
      <p className="text-sm">Memuat kegiatan...</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-[600px]">

      {/* ── TOAST ── */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
          toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <div className="bg-white rounded-2xl shadow-2xl border border-[#22C55E4D] overflow-hidden min-w-[300px] max-w-sm">
            <div className="flex items-center gap-3 px-5 py-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                toast.success ? "bg-[#22C55E]" : "bg-red-500"
              }`}>
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
                <p className="text-sm font-bold text-[#14532D]">{toast.title}</p>
                <p className={`text-xs leading-snug ${toast.success ? "text-[#16A34A]" : "text-red-500"}`}>
                  {toast.subtitle}
                </p>
              </div>
              <button
                onClick={() => { setToastVisible(false); setTimeout(() => setToast(null), 300); }}
                className="text-gray-300 hover:text-gray-500 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-1 bg-gray-100">
              <div
                className={`h-full ${toast.success ? "bg-[#22C55E]" : "bg-red-500"}`}
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

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Card login jika belum login */}
      {!accessToken && (
        <div className="mb-4 bg-white rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />
              </svg>
            </div>
            <p className="text-xs text-gray-600">
              <span className="font-semibold text-gray-800">Login</span> untuk ikut kegiatan dan tambahkan ke Google Calendar
            </p>
          </div>
          <button
            onClick={() => loginWithGoogle()}
            className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Masuk dengan Google
          </button>
        </div>
      )}

      {/* Grid kegiatan */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 content-start">
        {paginated.length === 0 ? (
          <div className="col-span-3 flex items-center justify-center py-20 text-gray-400 text-sm">
            Belum ada kegiatan masjid.
          </div>
        ) : (
          paginated.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2 bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="font-bold text-sm md:text-base text-gray-800">{item.title}</h3>

              <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {formatJam(item.startTime)} - {formatJam(item.endTime)}
              </div>

              <div className="flex items-center gap-1 text-gray-500 text-xs md:text-sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatTanggal(item.startTime)}
                {formatTanggal(item.endTime) !== formatTanggal(item.startTime)
                  ? ` s/d ${formatTanggal(item.endTime)}`
                  : ""}
              </div>

              <div>
                <p className="text-xs md:text-sm font-semibold text-gray-600 mb-1">Deskripsi</p>
                <p className="text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-3">{item.description}</p>
              </div>

              <div className="flex gap-2 mt-auto pt-2">
                <button
                  onClick={() => addToCalendar(item)}
                  disabled={addingId === item.id}
                  className="flex-1 bg-[#22C55E] rounded-full px-3 py-1.5 flex items-center justify-center gap-1 text-white text-xs font-semibold hover:bg-green-400 disabled:opacity-60 transition"
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
                      {accessToken ? "Ikut Kegiatan" : "Buat Pengingat"}
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
        >‹</button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`w-7 h-7 rounded-full text-xs font-bold ${
              page === i + 1 ? "bg-green-500 text-white" : "text-gray-500 hover:bg-gray-100"
            }`}
          >{i + 1}</button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30"
        >›</button>
      </div>
    </div>
  );
}