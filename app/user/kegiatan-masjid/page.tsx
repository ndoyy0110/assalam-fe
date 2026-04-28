"use client";
import UserLayout from "@/components/user/user-layout";
import KegiatanMasjid from "@/components/user/kegiatan-masjid/page";

export default function Page() {
  return (
    <UserLayout title="Kegiatan Masjid">
      <KegiatanMasjid />
    </UserLayout>
  );
}