import AdminLayout from "@/components/admin/admin-layout";
import EditBeritaDanArtikel from "@/components/admin/berita-dan-artikel/edit-berita-dan-artikel";

export default function Page() {
  return (
    <AdminLayout title="Perbarui Berita dan Artikel">
      <EditBeritaDanArtikel />
    </AdminLayout>
  );
}