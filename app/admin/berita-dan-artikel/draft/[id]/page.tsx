import AdminLayout from "@/components/admin/admin-layout";
import EditDraftBeritaDanArtikel from "@/components/admin/berita-dan-artikel/draft-berita-dan-artikel";

export default function Page() {
  return (
    <AdminLayout title="Edit Draft Berita dan Artikel">
      <EditDraftBeritaDanArtikel />
    </AdminLayout>
  );
}