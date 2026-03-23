"use client";
import AdminLayout from "@/components/admin/admin-layout";
import KegiatanMasjid from "@/components/admin/kegiatan-masjid/page";

export default function Page() {
  return (
    <AdminLayout title="Kegiatan Masjid">
      <KegiatanMasjid />
    </AdminLayout>
  );
}