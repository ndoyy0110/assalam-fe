import AdminLayout from "@/components/admin/admin-layout";
import EditKegiatanMasjid from "@/components/admin/kegiatan-masjid/edit-kegiatan-masjid";

export default function Page() {
  return (
    <AdminLayout title="Perbarui Kegiatan Masjid">
      <EditKegiatanMasjid />
    </AdminLayout>
  );
}