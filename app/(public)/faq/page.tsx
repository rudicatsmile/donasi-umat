"use client";

import * as React from "react";
import Link from "next/link";
import { HelpCircle, Search, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_SECTIONS = [
  {
    category: "Untuk Donatur",
    items: [
      {
        q: "Bagaimana cara kerja metode pembayaran transfer manual di DonasiUmat?",
        a: "Saat berdonasi, sistem akan menampilkan nominal donasi yang ditambahkan dengan 3-digit kode unik acak (misal Rp 100.123). Anda mentransfer tepat sejumlah total tersebut ke salah satu rekening resmi yayasan (BCA, Mandiri, BNI, BRI, BSI), lalu mengunggah foto bukti transfer. Tim admin kami akan mencocokkan mutasi bank dan memverifikasi donasi maksimal 1x24 jam.",
      },
      {
        q: "Mengapa saya harus mentransfer sesuai kode unik (3 digit terakhir)?",
        a: "Kode unik berfungsi sebagai penanda transaksi otomatis di mutasi rekening yayasan, memastikan dana Anda teralokasikan secara presisi ke kampanye yang Anda pilih tanpa tertukar dengan donasi orang lain yang bernominal sama.",
      },
      {
        q: "Apakah saya bisa berdonasi tanpa memperlihatkan nama saya (anonim)?",
        a: "Bisa. Pada formulir donasi, cukup centang opsi 'Sembunyikan nama saya'. Nama Anda akan ditampilkan di daftar donatur publik sebagai 'Hamba Allah'.",
      },
      {
        q: "Bagaimana jika bukti transfer saya belum diverifikasi setelah lebih dari 24 jam?",
        a: "Jika bukti transfer Anda belum diverifikasi setelah 1x24 jam, Anda dapat menghubungi WhatsApp layanan donatur di +62 812-3456-7890 dengan menyertakan kode donasi (contoh: #DON-2024-xxxx) untuk dicek secara prioritas oleh tim verifikator.",
      },
    ],
  },
  {
    category: "Untuk Penggalang Dana",
    items: [
      {
        q: "Apa saja syarat untuk membuat kampanye galang dana di DonasiUmat?",
        a: "Penggalang dana wajib memiliki akun terdaftar dan menyelesaikan Verifikasi Identitas Tier 1 dengan mengunggah foto KTP/SIM/Paspor asli yang masih berlaku, foto selfie memegang identitas, serta buku tabungan atas nama pemohon. Setelah disetujui admin, tombol pembuatan kampanye baru akan aktif.",
      },
      {
        q: "Berapa lama proses persetujuan kampanye baru oleh admin?",
        a: "Proses review kampanye memakan waktu rata-rata 1x24 jam kerja. Tim kurator akan memeriksa keabsahan cerita, bukti foto medis/surat keterangan rumah sakit, serta rincian penggunaan target dana.",
      },
      {
        q: "Kapan penggalang dana dapat mengajukan pencairan dana?",
        a: "Pencairan dana dapat diajukan kapan saja selama kampanye berstatus aktif dan saldo donasi terverifikasi mencukupi minimal Rp 100.000. Untuk pencairan kedua dan seterusnya, penggalang wajib telah mengunggah minimal 1 Laporan Transparansi Penyaluran Dana dari pencairan sebelumnya.",
      },
    ],
  },
  {
    category: "Keamanan & Transparansi",
    items: [
      {
        q: "Apakah data identitas KTP penggalang aman dan dirahasiakan?",
        a: "Sangat aman. Dokumen identitas disimpan dalam bucket privat Supabase yang terlindungi Row Level Security (RLS) dan hanya dapat diakses sementara oleh admin berwenang via signed URL berdurasi 5 menit. Nomor KTP disamarkan (masking) sehingga tidak dapat dilihat oleh publik.",
      },
      {
        q: "Apa itu fitur Laporan Transparansi Penyaluran Dana?",
        a: "Laporan transparansi adalah bentuk pertanggungjawaban terbuka di mana penggalang dana mengunggah jumlah dana yang telah dibelanjakan, nama penerima manfaat, dan foto-foto kuitansi/dokumentasi penyerahan bantuan secara nyata.",
      },
      {
        q: "Apakah setiap aksi di DonasiUmat tercatat dalam audit log?",
        a: "Ya. Setiap aksi penting mulai dari pembuatan kampanye, persetujuan verifikasi, unggah bukti transfer, hingga pencairan dana tercatat secara otomatis di tabel audit log yang bersifat kekal (immutable) demi menjamin transparansi tanpa celah manipulasi.",
      },
    ],
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredSections = FAQ_SECTIONS.map((sec) => ({
    ...sec,
    items: sec.items.filter(
      (item) =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((sec) => sec.items.length > 0);

  return (
    <div className="py-12 lg:py-20 space-y-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="default" className="text-xs">Pusat Bantuan & Edukasi</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Temukan jawaban cepat seputar tata cara donasi, verifikasi identitas, kode unik, dan keamanan platform.
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto pt-2">
            <Search className="absolute left-3.5 top-5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari pertanyaan, misal: kode unik, KTP, pencairan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Accordion Group by Category */}
        <div className="space-y-10">
          {filteredSections.map((sec, sIdx) => (
            <div key={sec.category} className="rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <h2 className="font-heading font-bold text-lg text-foreground border-b border-border pb-3">
                {sec.category}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {sec.items.map((item, idx) => (
                  <AccordionItem key={idx} value={`item-${sIdx}-${idx}`}>
                    <AccordionTrigger className="text-sm text-left">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-white space-y-3">
              <HelpCircle className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-foreground">Tidak ada pertanyaan yang sesuai dengan &ldquo;{searchTerm}&rdquo;</p>
              <p className="text-xs text-muted-foreground">Coba gunakan kata kunci lain atau hubungi tim bantuan kami.</p>
              <Button variant="outline" size="sm" onClick={() => setSearchTerm("")}>
                Tampilkan Semua Pertanyaan
              </Button>
            </div>
          )}
        </div>

        {/* Footer CS Box */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-6 sm:p-8 text-center space-y-3">
          <h3 className="font-heading font-bold text-lg text-emerald-950">
            Pertanyaan Anda Belum Terjawab di Sini?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-800/80 max-w-md mx-auto">
            Tim Layanan Donatur siap menjawab kebutuhan spesifik Anda setiap hari kerja.
          </p>
          <div className="flex justify-center gap-3 pt-1">
            <Link href="/kontak">
              <Button className="font-bold">Hubungi Tim Layanan</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
