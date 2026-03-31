import AdminLayout from "@/components/admin/admin-layout";  
import AddBeritaDanArtikel from "@/components/admin/berita-dan-artikel/add/page";

export default function AddPage() {
  return (
    <AdminLayout title="Tambah Berita dan Artikel">
      <AddBeritaDanArtikel />
    </AdminLayout>
  );
}