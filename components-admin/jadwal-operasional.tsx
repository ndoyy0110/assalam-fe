"use client";

import { useState } from "react";
import { Clock } from "lucide-react";

interface DaySchedule {
  name: string;
  open?: string;
  close?: string;
  enabled: boolean;
  editing: boolean;
}

const initialDays: DaySchedule[] = [
  { name: "Senin", open: "04:00", close: "21:00", enabled: true, editing: false },
  { name: "Selasa", enabled: false, editing: false },
  { name: "Rabu", open: "04:00", close: "21:00", enabled: true, editing: false },
  { name: "Kamis", open: "04:00", close: "21:00", enabled: true, editing: false },
  { name: "Jum'at", open: "04:00", close: "21:00", enabled: true, editing: false },
  { name: "Sabtu", open: "04:00", close: "21:00", enabled: true, editing: false },
  { name: "Minggu", open: "04:00", close: "21:00", enabled: true, editing: false },
];

export default function JadwalOperasional() {
  const [schedule, setSchedule] = useState(initialDays);

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];

    newSchedule[index] = {
      ...newSchedule[index],
      enabled: !newSchedule[index].enabled,
    };

    setSchedule(newSchedule);
  };

  const toggleEdit = (index: number) => {
    const newSchedule = [...schedule];

    newSchedule[index] = {
      ...newSchedule[index],
      editing: !newSchedule[index].editing,
    };

    setSchedule(newSchedule);
  };

  const updateTime = (
    index: number,
    field: "open" | "close",
    value: string
  ) => {
    const newSchedule = [...schedule];

    newSchedule[index] = {
      ...newSchedule[index],
      [field]: value,
    };

    setSchedule(newSchedule);
  };

  const saveEdit = (index: number) => {
    const newSchedule = [...schedule];

    newSchedule[index] = {
      ...newSchedule[index],
      editing: false,
    };

    setSchedule(newSchedule);
  };

  return (
    <div className="max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg border">

      {/* HEADER */}
      <div className="bg-[#22C55E] text-white px-6 py-4 flex items-center gap-2">
        <Clock size={20} />
        <h2 className="text-lg font-semibold">Jadwal Mingguan</h2>
      </div>

      <div className="bg-white">
        {schedule.map((day, index) => (
          <div key={day.name} className="border-b">

            {/* ROW NORMAL */}
            <div className="flex items-center justify-between px-6 py-4">

              {/* Hari */}
              <div className="w-32 font-medium">{day.name}</div>

              {/* Jam */}
              <div className="flex-1 text-end pr-4">
                {day.enabled ? (
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
                    day.enabled ? "bg-[#16A34A]" : "bg-gray-400"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                      day.enabled ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Tombol Edit */}
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

                {/* Jam Buka */}
                <div>
                  <label className="text-sm text-gray-500">Jam Buka</label>
                  <input
                    type="time"
                    value={day.open || ""}
                    onChange={(e) =>
                      updateTime(index, "open", e.target.value)
                    }
                    className="w-full mt-2 bg-green-100 rounded-lg px-3 py-2"
                  />
                </div>

                {/* Jam Tutup */}
                <div>
                  <label className="text-sm text-gray-500">Jam Tutup</label>
                  <input
                    type="time"
                    value={day.close || ""}
                    onChange={(e) =>
                      updateTime(index, "close", e.target.value)
                    }
                    className="w-full mt-2 bg-green-100 rounded-lg px-3 py-2"
                  />
                </div>

                {/* Button */}
                <div className="col-span-2 flex justify-end gap-4 mt-4">
                  <button
                    onClick={() => toggleEdit(index)}
                    className="text-gray-500 hover:bg-gray-300 px-5 py-2 rounded-lg "
                  >
                    Batal
                  </button>

                  <button
                    onClick={() => saveEdit(index)}
                    className="bg-[#16A34A] text-white px-5 py-2 rounded-lg hover:bg-green-500"
                  >
                    Simpan
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