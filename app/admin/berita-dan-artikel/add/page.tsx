import AdminLayout from "@/components/admin/admin-layout";  
import AddBeritaDanArtikel from "@/components/admin/berita-dan-artikel/add-berita-dan-artikel";

export default function AddPage() {
  return (
    <AdminLayout title="Tambah Berita dan Artikel">
      <AddBeritaDanArtikel />
    </AdminLayout>
  );
}