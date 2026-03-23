"use client";
import AdminLayout from "@/components/admin/admin-layout";
import BeritaDanArtikel from "@/components/admin/berita-dan-artikel/page";

export default function Page() {
  return (
    <AdminLayout title="Berita dan Artikel">
      <BeritaDanArtikel />
    </AdminLayout>
  );
}