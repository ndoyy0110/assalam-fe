import AdminLayout from "@/components/admin/admin-layout";
import EditKegiatanMasjid from "@/components/admin/kegiatan-masjid/edit/page";

export default function Page() {
  return (
    <AdminLayout title="Perbarui Kegiatan Masjid">
      <EditKegiatanMasjid />
    </AdminLayout>
  );
}