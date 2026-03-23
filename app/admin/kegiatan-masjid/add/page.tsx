import AdminLayout from "@/components/admin/admin-layout";
import AddKegiatanMasjid from "@/components/admin/kegiatan-masjid/add/page";

export default function AddPage() {
  return (
    <AdminLayout title="Tambah Kegiatan Masjid">
      <AddKegiatanMasjid />
    </AdminLayout>
  );
}