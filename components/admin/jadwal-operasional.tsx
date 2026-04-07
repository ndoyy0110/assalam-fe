"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://assalam-be-production.up.railway.app";

interface OperationalHour {
  id: number;
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface DaySchedule extends OperationalHour {
  editing: boolean;
}

const DEFAULT_DAYS: Omit<OperationalHour, "id">[] = [
  { day: "Senin",   open: "04:00", close: "21:00", isClosed: false },
  { day: "Selasa",  open: "04:00", close: "21:00", isClosed: false },
  { day: "Rabu",    open: "04:00", close: "21:00", isClosed: false },
  { day: "Kamis",   open: "04:00", close: "21:00", isClosed: false },
  { day: "Jum'at",  open: "04:00", close: "21:00", isClosed: false },
  { day: "Sabtu",   open: "04:00", close: "21:00", isClosed: false },
  { day: "Minggu",  open: "04:00", close: "21:00", isClosed: false },
];

export default function JadwalOperasional() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  // ─── GET ──────────────────────────────────────────────────────────────────
  const fetchSchedule = async (isAfterSeed = false) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${API_URL}/api/operational-hours`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || "Gagal mengambil data");

      if (json.data && json.data.length > 0) {
        setSchedule(
          json.data.map((item: OperationalHour) => ({ ...item, editing: false }))
        );
      } else if (!isAfterSeed) {
        // Hanya seed sekali, tidak rekursif
        await seedDefaultData();
      } else {
        // Seed gagal / DB tetap kosong → pakai data lokal
        setSchedule(
          DEFAULT_DAYS.map((d, i) => ({ ...d, id: i + 1, editing: false }))
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal mengambil data";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // ─── POST (seed jika DB kosong) ───────────────────────────────────────────
  const seedDefaultData = async () => {
    try {
      for (const d of DEFAULT_DAYS) {
        await fetch(`${API_URL}/api/operational-hours`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(d),
        });
      }
      // Fetch ulang sekali, tandai sudah post-seed agar tidak loop
      await fetchSchedule(true);
    } catch {
      setSchedule(
        DEFAULT_DAYS.map((d, i) => ({ ...d, id: i + 1, editing: false }))
      );
    }
  };

  // ─── PUT toggle isClosed ──────────────────────────────────────────────────
  const toggleDay = async (index: number) => {
    const day = schedule[index];
    const newIsClosed = !day.isClosed;

    // Optimistic update
    setSchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, isClosed: newIsClosed } : d))
    );

    try {
      const res = await fetch(`${API_URL}/api/operational-hours/${day.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isClosed: newIsClosed }),
      });
      if (!res.ok) throw new Error("Gagal update");
    } catch {
      // Rollback jika gagal
      setSchedule((prev) =>
        prev.map((d, i) => (i === index ? { ...d, isClosed: day.isClosed } : d))
      );
      setError("Gagal mengubah status hari. Coba lagi.");
    }
  };

  const toggleEdit = (index: number) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, editing: !d.editing } : d))
    );
  };

  const updateTime = (index: number, field: "open" | "close", value: string) => {
    setSchedule((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    );
  };

  // ─── PUT simpan jam ───────────────────────────────────────────────────────
  const saveEdit = async (index: number) => {
    const day = schedule[index];
    setSaving(index);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/operational-hours/${day.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          open: day.open,
          close: day.close,
          isClosed: day.isClosed,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan");

      setSchedule((prev) =>
        prev.map((d, i) => (i === index ? { ...d, editing: false } : d))
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan";
      setError(message);
    } finally {
      setSaving(null);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg border">
        <div className="bg-[#22C55E] text-white px-6 py-4 flex items-center gap-2">
          <Clock size={20} />
          <h2 className="text-lg font-semibold">Jadwal Mingguan</h2>
        </div>
        <div className="bg-white p-10 text-center text-gray-400">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mb-2" />
          <p>Memuat jadwal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg border">

      {/* HEADER */}
      <div className="bg-[#22C55E] text-white px-6 py-4 flex items-center gap-2">
        <Clock size={20} />
        <h2 className="text-lg font-semibold">Jadwal Mingguan</h2>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 text-red-600 text-sm flex justify-between items-center">
          <span>⚠️ {error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-white">
        {schedule.map((day, index) => (
          <div key={day.id} className="border-b">

            {/* ROW */}
            <div className="flex items-center justify-between px-6 py-4">

              <div className="w-32 font-medium">{day.day}</div>

              <div className="flex-1 text-end pr-4">
                {!day.isClosed ? (
                  <span className="text-[#16A34A]">
                    {day.open?.replace(":", ".")} - {day.close?.replace(":", ".")}
                  </span>
                ) : (
                  <span className="text-[#D4183D]">Tutup</span>
                )}
              </div>

              {/* Toggle */}
              <div className="mr-6">
                <button
                  onClick={() => toggleDay(index)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                    !day.isClosed ? "bg-[#16A34A]" : "bg-gray-400"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      !day.isClosed ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              <button
                onClick={() => toggleEdit(index)}
                className="bg-[#BBF7D0] text-[#14532D] px-4 py-2 rounded-lg font-medium hover:bg-green-300"
              >
                Edit
              </button>
            </div>

            {/* FORM EDIT */}
            {day.editing && (
              <div className="px-6 pb-6 grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-500">Jam Buka</label>
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => updateTime(index, "open", e.target.value)}
                    className="w-full mt-2 bg-green-100 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Jam Tutup</label>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => updateTime(index, "close", e.target.value)}
                    className="w-full mt-2 bg-green-100 rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-2 flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => toggleEdit(index)}
                    className="text-gray-500 hover:bg-gray-300 px-5 py-2 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => saveEdit(index)}
                    disabled={saving === index}
                    className="bg-[#16A34A] text-white px-5 py-2 rounded-lg hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving === index && (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    )}
                    {saving === index ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}