export type WhatsAppTemplateKey =
  | "donation_instruction"
  | "identity_approved"
  | "identity_rejected"
  | "campaign_published"
  | "campaign_rejected"
  | "donation_verified"
  | "donation_rejected"
  | "withdrawal_approved"
  | "withdrawal_completed"
  | "campaign_update_posted";

export interface WhatsAppTemplateParams {
  recipientName: string;
  campaignTitle?: string;
  campaignSlug?: string;
  amount?: string;
  donationCode?: string;
  uniqueCode?: number | string;
  totalTransfer?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  expiresAt?: string;
  reason?: string;
  updateTitle?: string;
  linkUrl?: string;
}

export function formatWhatsAppMessage(
  key: WhatsAppTemplateKey,
  params: WhatsAppTemplateParams
): string {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "DonasiUmat";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://donasiumat.id";

  switch (key) {
    case "donation_instruction":
      return `*Instruksi Transfer Donasi - ${appName}*

Halo Kak ${params.recipientName}, terima kasih atas kepedulian Anda untuk kampanye:
*\"${params.campaignTitle}\"*

Mohon transfer TEPAT hingga 3 digit terakhir:
*Total Transfer: ${params.totalTransfer || params.amount}*
(Termasuk kode unik verifikasi: *${params.uniqueCode}*)

*Rekening Tujuan:*
Bank: *${params.bankName}*
No. Rekening: *${params.accountNumber}*
Atas Nama: *${params.accountHolder || "Yayasan DonasiUmat"}*

Batas Waktu Transfer: 24 Jam (${params.expiresAt || "sebelum kedaluwarsa"})

Setelah transfer, silakan unggah bukti transfer di:
${params.linkUrl || `${appUrl}/donasi/konfirmasi`}

_Penting: Nominal harus sesuai persis agar verifikasi sistem berjalan otomatis._`;

    case "identity_approved":
      return `*Assalamu'alaikum Wr. Wb. / Salam Sejahtera, Kak ${params.recipientName}*

Selamat! Dokumen verifikasi identitas (KYC Tier 1) Anda telah *DISETUJUI* oleh Tim Kepatuhan ${appName}.

Akun Anda kini telah terverifikasi secara hukum. Anda dapat langsung membuat kampanye galang dana sosial dan mengajukan pencairan dana amanah.

Mulai Galang Dana: ${appUrl}/galang-dana/kampanye-baru

_Pesan otomatis dari Tim Kurator ${appName}_`;

    case "identity_rejected":
      return `*Assalamu'alaikum Kak ${params.recipientName},*

Mohon maaf, pengajuan verifikasi identitas (KYC) Anda belum dapat kami setujui karena alasan berikut:
*"${params.reason || "Kualitas foto dokumen identitas atau selfie tidak cukup jelas / buram."}"*

Silakan perbaiki data dan unggah ulang dokumen yang sah melalui:
${appUrl}/galang-dana/verifikasi-identitas

_Pusat Bantuan & Kepatuhan ${appName}_`;

    case "campaign_published":
      return `*Kabar Gembira dari ${appName}!*

Halo Kak ${params.recipientName}, proposal galang dana Anda:
*\"${params.campaignTitle}\"*
telah resmi disetujui kurator dan *AKTIF* menerima donasi!

Bagikan tautan berikut ke media sosial dan grup keluarga:
${appUrl}/kampanye/${params.campaignSlug}

Semoga ikhtiar kebaikan ini dimudahkan dan mencapai target. Aamiin.`;

    case "campaign_rejected":
      return `*Pemberitahuan Kurasi Kampanye - ${appName}*

Halo Kak ${params.recipientName}, proposal galang dana:
*\"${params.campaignTitle}\"*
memerlukan perbaikan sebelum dapat dipublikasikan.

*Catatan Kurator:*
\"${params.reason || "Mohon lengkapi rincian anggaran biaya dan dokumen pendukung medis/surat keterangan."}\"

Silakan revisi kampanye Anda:
${appUrl}/galang-dana/kampanye-saya`;

    case "donation_verified":
      return `*Alhamdulillah, Donasi Anda Telah Terverifikasi!*

Terima kasih Kak ${params.recipientName}. Donasi Anda sebesar *${params.amount}* untuk kampanye:
*\"${params.campaignTitle}\"*
telah kami verifikasi dan langsung dialokasikan ke saldo kampanye.

Kode Donasi: *${params.donationCode}*

Semoga setiap rupiah yang Anda keluarkan menjadi amal jariyah yang berlipat ganda dan pembawa berkah bagi keluarga. Aamiin ya Rabbal 'Alamin.

Pantau Perkembangan Penyaluran:
${appUrl}/kampanye/${params.campaignSlug}`;

    case "donation_rejected":
      return `*Pemberitahuan Donasi - ${appName}*

Halo Kak ${params.recipientName}, bukti transfer untuk donasi *${params.donationCode}* (${params.amount}) belum dapat kami verifikasi karena:
*\"${params.reason || "Nominal transfer mutasi tidak cocok dengan kode unik transaksi."}\"*

Silakan periksa kembali mutasi Anda atau hubungi layanan admin kami via website.
${appUrl}/dashboard/riwayat-donasi`;

    case "withdrawal_approved":
      return `*Pemberitahuan Pencairan Dana - ${appName}*

Halo Kak ${params.recipientName}, pengajuan pencairan dana sebesar *${params.amount}* untuk kampanye *\"${params.campaignTitle}\"* telah *DISETUJUI* oleh Admin.

Dana sedang diproses untuk transfer manual ke rekening tujuan Anda (${params.bankName} - ${params.accountNumber}). Anda akan menerima bukti transfer segera setelah pengiriman selesai.`;

    case "withdrawal_completed":
      return `*Bukti Transfer Penyaluran Dana Terkirim!*

Halo Kak ${params.recipientName}, dana sebesar *${params.amount}* untuk kampanye *\"${params.campaignTitle}\"* telah berhasil ditransfer ke rekening:
*${params.bankName} - ${params.accountNumber}* (a.n ${params.accountHolder})

*PENTING (Amanah Donatur):*
Sesuai aturan transparansi ${appName}, pencairan berikutnya akan ditangguhkan hingga Anda mengunggah *Laporan Transparansi Berfoto* atas dana yang telah dicairkan ini.

Unggah Laporan Realisasi:
${appUrl}/galang-dana/kampanye-saya`;

    case "campaign_update_posted":
      return `*Kabar Terbaru untuk Sahabat Donatur ${appName}*

Inisiator kampanye *\"${params.campaignTitle}\"* yang Anda dukung baru saja menerbitkan kabar perkembangan terbaru:
*\"${params.updateTitle}\"*

Baca selengkapnya kondisi penerima manfaat:
${appUrl}/kampanye/${params.campaignSlug}

Terima kasih atas kepedulian Anda yang tiada henti.`;

    default:
      return `Pemberitahuan dari ${appName} untuk Kak ${params.recipientName}. Silakan kunjungi ${appUrl} untuk informasi lengkap.`;
  }
}
