"use client";
import AdminLayout from "@/components/user/user-layout";
import BeritaDanArtikel from "@/components/user/berita-dan-artikel/page";

export default function Page() {
  return (
    <AdminLayout title="Berita dan Artikel">
      <BeritaDanArtikel />
    </AdminLayout>
  );
}