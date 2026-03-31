"use client";

import { useRouter, useParams } from "next/navigation";

const DUMMY_DATA = [
  {
    id: 1,
    judul: "Masjid: Lebih dari Sekadar Tempat Ibadah",
    status: "Diterbitkan",
    penulis: "Admin",
    tanggal: "29 Maret 2026",
    konten: `Bagi umat Islam, masjid adalah tempat suci yang menjadi jantung kehidupan spiritual sekaligus oase ketenangan di tengah hiruk-pikuk dunia, yang secara harfiah dari bahasa Arab berarti "tempat sujud". Fungsi esensialnya memang sebagai sarana pelaksanaan ibadah, khususnya salat berjamaah lima waktu dan salat Jumat, di mana segala perbedaan pangkat, status sosial, ekonomi, hingga latar belakang ras seketika dileburkan.

Di tempat ini, semua jemaah berdiri sejajar dan merapatkan barisan dalam satu saf yang kokoh menghadap kiblat, menyimbolkan kesetaraan mutlak di hadapan Sang Pencipta. Namun, jika ditelisik lebih jauh, peran masjid sesungguhnya jauh melampaui batas ibadah ritual semata. Meneladani sejarah peradaban Islam, masjid difungsikan sebagai denyut nadi kegiatan masyarakat.

Tempat ini menjadi tonggak utama pendidikan melalui penyelenggaraan majelis taklim, madrasah, dan diskusi keagamaan yang mencerahkan. Lebih dari itu, masjid hadir sebagai pusat pemberdayaan ekonomi umat lewat pengelolaan zakat, infak, dan sedekah untuk membantu yang membutuhkan, serta menjadi ruang inklusif untuk musyawarah warga, penyelesaian masalah komunitas, hingga tempat perlindungan dan posko bantuan darurat tatkala terjadi bencana.

Dari segi fisik, bangunan masjid yang umumnya dihiasi dengan kubah megah, menara yang menjulang tinggi, serta ukiran kaligrafi yang sarat makna, turut menjadi representasi keindahan seni arsitektur Islam yang dirancang untuk menciptakan suasana syahdu sekaligus mengingatkan manusia akan kebesaran Tuhan. Pada akhirnya, masjid menjelma sebagai institusi yang sangat vital; sebuah wadah komprehensif yang tidak hanya memfasilitasi kekhusyukan hubungan vertikal antara manusia dengan Tuhannya (Hablum Minallah), tetapi juga terus merawat keharmonisan, kepedulian sosial, dan solidaritas horizontal antar sesama manusia (Hablum Minannas).`,
    gambar:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Blue_Mosque_2.jpg/1280px-Blue_Mosque_2.jpg",
  },
  {
    id: 2,
    judul: "Masjid di Era Modern: Mempertahankan Tradisi di Tengah Arus Digitalisasi",
    status: "Draft",
    penulis: "Admin",
    tanggal: "29 Maret 2026",
    konten: `Artikel ini menyoroti bagaimana masjid beradaptasi di era modern dan teknologi. Meskipun fungsi utamanya sebagai pusat ibadah tetap teguh, masjid kini secara aktif memanfaatkan kemajuan digital untuk menyebarkan dakwah, mengelola dana sosial umat, dan merangkul generasi muda tanpa kehilangan nilai-nilai keislamannya.`,
    gambar:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Sultan_Ahmed_mosq.jpg/1280px-Sultan_Ahmed_mosq.jpg",
  },
];

export default function ViewBeritaArtikel() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const artikel = DUMMY_DATA.find((d) => d.id === id);

  if (!artikel) {
    return (
      <div className="min-h-screen bg-[#e8f5e9] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Artikel tidak ditemukan.</p>
      </div>
    );
  }

  const paragraphs = artikel.konten.split("\n\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Hero Section with image + overlay */}
      <div className="relative w-full" style={{ minHeight: "320px" }}>
        {/* Background image */}
        <img
          src={artikel.gambar}
          alt={artikel.judul}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Dark gradient overlay — stronger at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            Halo, Admin!
            <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title & meta over image */}
        <div className="relative z-10 px-5 pb-8 pt-16 flex flex-col gap-2">
          <h1 className="text-white text-2xl font-bold leading-snug drop-shadow">
            {artikel.judul}
          </h1>
          <p className="text-white/80 text-xs">
            {artikel.tanggal} &nbsp;|&nbsp; Oleh: {artikel.penulis}
          </p>
        </div>
      </div>

      {/* Content area — white card overlapping hero */}
      <div className="bg-white rounded-t-3xl -mt-4 flex-1 px-5 py-7 flex flex-col gap-4">
        {paragraphs.map((para, idx) => (
          <p key={idx} className="text-sm text-gray-700 leading-relaxed text-justify">
            {para}
          </p>
        ))}
      </div>
    </div>
  );
}