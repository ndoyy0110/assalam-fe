"use client";
import AdminLayout from "@/components/admin/admin-layout";
import JadwalOperasional from "@/components/admin/jadwal-operasional";

export default function Page() {
  return (
    <AdminLayout title="Jadwal Operasional">
      <JadwalOperasional />
    </AdminLayout>
  );
}