export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  count: number;
}

export interface Fundraiser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  isVerified: boolean;
  institution?: string;
  totalCampaigns: number;
  totalFundsRaised: number;
  bio: string;
  joinedDate: string;
}

export interface CampaignUpdate {
  id: string;
  campaignId: string;
  title: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  authorName: string;
}

export interface TransparencyReport {
  id: string;
  campaignId: string;
  title: string;
  amountUsed: number;
  disbursementDate: string;
  description: string;
  beneficiaries: string;
  photoUrls: string[];
  status: "published" | "pending_review" | "draft";
  reviewedAt?: string;
}

export interface Prayer {
  id: string;
  donationId: string;
  donorName: string;
  isAnonymous: boolean;
  message: string;
  amount: number;
  isAmountHidden: boolean;
  createdAt: string;
  likes: number;
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  story: string;
  coverImageUrl: string;
  galleryUrls: string[];
  categoryId: string;
  categoryName: string;
  beneficiaryLocation: string;
  targetAmount: number;
  collectedAmount: number;
  donorCount: number;
  deadline: string;
  status: "draft" | "pending_review" | "active" | "rejected" | "completed" | "closed";
  isUrgent: boolean;
  fundraiser: Fundraiser;
  createdAt: string;
  publishedAt: string;
  updates: CampaignUpdate[];
  transparencyReports: TransparencyReport[];
  prayers: Prayer[];
}

export interface DonationTransaction {
  id: string;
  donationCode: string;
  campaignId: string;
  campaignTitle: string;
  campaignSlug: string;
  donorId: string;
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  uniqueCode: number;
  totalTransfer: number;
  bankDestination: string;
  isAnonymous: boolean;
  isAmountHidden: boolean;
  prayerMessage?: string;
  proofUrl?: string;
  status: "pending" | "waiting_verification" | "verified" | "rejected" | "expired";
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  expiresAt: string;
  createdAt: string;
}

export interface IdentityVerification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  idType: "ktp" | "sim" | "passport";
  idNumberMasked: string;
  fullNameOnId: string;
  address: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  idPhotoUrl: string;
  selfiePhotoUrl: string;
  status: "pending" | "verified" | "rejected";
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  withdrawalCode: string;
  campaignId: string;
  campaignTitle: string;
  fundraiserId: string;
  fundraiserName: string;
  requestedAmount: number;
  purposeDescription: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  status: "pending" | "approved" | "rejected" | "transferred";
  rejectionReason?: string;
  transferProofUrl?: string;
  transferredAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: "admin" | "fundraiser" | "donor";
  action: "create" | "update" | "delete" | "approve" | "reject" | "verify" | "publish";
  entityType: "campaign" | "donation" | "withdrawal" | "transparency_report" | "user" | "identity";
  entityId: string;
  description: string;
  beforeData?: Record<string, unknown>;
  afterData?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export const DUMMY_CATEGORIES: Category[] = [
  {
    id: "cat-1",
    name: "Kesehatan & Medis",
    slug: "kesehatan",
    iconName: "HeartPulse",
    description: "Bantuan biaya operasi, obat, dan perawatan pasien darurat dhuafa",
    count: 24,
  },
  {
    id: "cat-2",
    name: "Pendidikan & Sekolah",
    slug: "pendidikan",
    iconName: "GraduationCap",
    description: "Beasiswa anak yatim, renovasi gedung sekolah rusak, buku & fasilitas",
    count: 18,
  },
  {
    id: "cat-3",
    name: "Bencana Alam",
    slug: "bencana-alam",
    iconName: "Flame",
    description: "Bantuan darurat logistik, tenda, obat-obatan dan pemulihan pasca gempa/banjir",
    count: 9,
  },
  {
    id: "cat-4",
    name: "Panti Asuhan & Yatim",
    slug: "panti-asuhan",
    iconName: "Home",
    description: "Biaya kebutuhan makan pokok, pakaian, dan pembinaan anak yatim piatu",
    count: 15,
  },
  {
    id: "cat-5",
    name: "Rumah Ibadah & Pesantren",
    slug: "rumah-ibadah",
    iconName: "Landmark",
    description: "Pembangunan, renovasi masjid pelosok, sarana wudhu, dan santri penghafal Quran",
    count: 12,
  },
  {
    id: "cat-6",
    name: "Difabel & Lansia",
    slug: "difabel",
    iconName: "Accessibility",
    description: "Penyediaan kursi roda, alat bantu dengar, dan santunan lansia terlantar",
    count: 11,
  },
  {
    id: "cat-7",
    name: "Kemanusiaan Umum",
    slug: "kemanusiaan",
    iconName: "Users",
    description: "Paket sembako dhuafa, bantuan modal usaha mikro mustahik, air bersih",
    count: 20,
  },
  {
    id: "cat-8",
    name: "Peduli Lingkungan",
    slug: "lingkungan",
    iconName: "Trees",
    description: "Penanaman pohon mangrove penahan abrasi, konservasi mata air desa",
    count: 6,
  },
];

export const DUMMY_FUNDRAISERS: Fundraiser[] = [
  {
    id: "usr-f1",
    username: "relawanpeduli",
    fullName: "Ustadz H. Ahmad Syafi'i",
    institution: "Yayasan Sahabat Insan Amanah",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    totalCampaigns: 7,
    totalFundsRaised: 285400000,
    bio: "Penyalur amanah masyarakat untuk santunan yatim dan renovasi sarana ibadah di pedalaman Jawa Barat.",
    joinedDate: "2023-04-12",
  },
  {
    id: "usr-f2",
    username: "dokterkeliling",
    fullName: "dr. Nurul Annisa",
    institution: "Komunitas Medis Peduli Pelosok",
    avatarUrl: "https://images.unsplash.com/photo-1594824813580-0a25691e843c?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    totalCampaigns: 12,
    totalFundsRaised: 420800000,
    bio: "Dokter umum aktif membantu pendampingan pengobatan anak-anak kurang mampu dengan penyakit kronis.",
    joinedDate: "2022-11-05",
  },
  {
    id: "usr-f3",
    username: "pedulitidung",
    fullName: "Bambang Sudarmono, S.Pd",
    institution: "Forum Guru Peduli Pesisir",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    isVerified: true,
    totalCampaigns: 4,
    totalFundsRaised: 142000000,
    bio: "Pengabdi pendidikan kepulauan, memperjuangkan ruang kelas yang layak dan aman bagi anak nelayan.",
    joinedDate: "2023-08-19",
  },
];

export const DUMMY_CAMPAIGNS: Campaign[] = [
  {
    id: "kmp-1",
    slug: "bantu-pengobatan-bu-siti-bandung",
    title: "Bantu Pengobatan Bu Siti, Janda Tunanetra di Bandung Berjuang Melawan Tumor",
    shortDescription: "Bu Siti (54 th) tunanetra sebatang kara harus segera menjalani operasi pengangkatan tumor di lehernya.",
    story: `Bu Siti (54 tahun) adalah seorang janda tunanetra yang hidup sebatang kara di sebuah kontrakan petak berukuran 3x3 meter di Babakan Ciparay, Kota Bandung. Sehari-hari beliau bertahan hidup dari belas kasih para tetangga dan sesekali memijat panggilan jika ada warga yang membutuhkan.

Namun, sejak 5 bulan lalu, muncul benjolan di leher sebelah kanannya yang kian hari kian membesar hingga berukuran sebesar bola tenis. Rasa sakit berdenyut tiada henti kerap membuat Bu Siti demam menggigil dan sulit menelan makanan.

Pemeriksaan terakhir di RSUD Al Ihsan Bandung mendiagnosis adanya tumor jinak yang sudah mulai menekan saluran napas dan saraf leher. Dokter menyarankan operasi pengangkatan segera sebelum tumor semakin membesar dan berisiko komplikasi berbahaya.

Biaya pengobatan, obat-obatan di luar tanggungan BPJS, biaya sewa ambulans ke rumah sakit, serta kebutuhan nutrisi pemulihan pasca operasi membutuhkan dana sebesar Rp 45.000.000. Mari ulurkan tangan kita bersama meringankan beban Bu Siti agar beliau bisa kembali tersenyum tanpa menahan rasa sakit.`,
    coverImageUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&auto=format&fit=crop&q=80",
    ],
    categoryId: "cat-1",
    categoryName: "Kesehatan & Medis",
    beneficiaryLocation: "Kota Bandung, Jawa Barat",
    targetAmount: 45000000,
    collectedAmount: 38750000,
    donorCount: 264,
    deadline: "2026-10-15",
    status: "active",
    isUrgent: true,
    fundraiser: DUMMY_FUNDRAISERS[1],
    createdAt: "2026-08-01",
    publishedAt: "2026-08-02",
    updates: [
      {
        id: "upd-101",
        campaignId: "kmp-1",
        title: "Alhamdulillah, Bu Siti Telah Menjalani Pemeriksaan Darah Lengkap",
        content: "Salam Sahabat Umat, kami ingin menyampaikan bahwa berkat donasi tahap pertama, Bu Siti telah selesai menjalani serangkaian tes laboratorium dan rontgen toraks. Kondisi gula darah stabil dan siap dijadwalkan masuk ruang rawat inap minggu depan. Terima kasih atas doa dan kebaikan Anda semua!",
        imageUrl: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80",
        createdAt: "2026-09-18",
        authorName: "dr. Nurul Annisa",
      },
    ],
    transparencyReports: [
      {
        id: "tr-101",
        campaignId: "kmp-1",
        title: "Penyaluran Tahap 1: Pembayaran Obat & Biaya Pra-Operasi",
        amountUsed: 12500000,
        disbursementDate: "2026-09-16",
        description: "Dana disalurkan untuk pelunasan biaya obat non-BPJS, transport ambulans rawat jalan 4x pulang-pergi, serta paket nutrisi penunjang daya tahan tubuh Bu Siti.",
        beneficiaries: "Ibu Siti (Pasien)",
        photoUrls: [
          "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
        ],
        status: "published",
        reviewedAt: "2026-09-17",
      },
    ],
    prayers: [
      {
        id: "pry-1",
        donationId: "don-1",
        donorName: "Dimas Nugraha",
        isAnonymous: false,
        message: "Semoga lekas sembuh ya Bu Siti, Allah angkat penyakitnya dan beri keberkahan selalu. Aamiin ya Rabbal Alamin.",
        amount: 100000,
        isAmountHidden: false,
        createdAt: "2026-09-23T14:20:00Z",
        likes: 12,
      },
      {
        id: "pry-2",
        donationId: "don-2",
        donorName: "Hamba Allah",
        isAnonymous: true,
        message: "Bismillah semoga lancar operasinya Bu Siti. Sedikit rezeki dari kami, semoga bermanfaat.",
        amount: 250000,
        isAmountHidden: false,
        createdAt: "2026-09-22T09:15:00Z",
        likes: 8,
      },
      {
        id: "pry-3",
        donationId: "don-3",
        donorName: "Ibu Retno Wulandari",
        isAnonymous: false,
        message: "Semoga jadi amal jariyah untuk keluarga kami. Tetap semangat Bu Siti, banyak yang mendoakan!",
        amount: 500000,
        isAmountHidden: false,
        createdAt: "2026-09-21T18:40:00Z",
        likes: 19,
      },
    ],
  },
  {
    id: "kmp-2",
    slug: "renovasi-ruang-kelas-sdn-004-pulau-tidung",
    title: "Renovasi Ruang Kelas SDN 004 Pulau Tidung Kepulauan Seribu yang Ambruk Diterjang Angin",
    shortDescription: "Bantu 78 murid pulau belajar di bawah atap yang aman tanpa rasa takut tertimpa plafon lapuk.",
    story: `SDN 004 Pulau Tidung merupakan satu-satunya tumpuan sekolah dasar bagi anak-anak nelayan di sisi barat pulau. Pada bulan lalu, angin kencang disertai hujan lebat merusak atap dua ruang kelas utama hingga plafonnya runtuh dan kuda-kuda kayu lapuk patah.

Kini, murid-murid terpaksa belajar berdesakan di musala sekolah dengan alas karpet tipis. Saat hujan turun, kegiatan belajar mengajar harus dihentikan total karena tempias air membanjiri ruangan.

Bantuan renovasi ini akan digunakan untuk mengganti rangka atap baja ringan tahan karat air laut, plafon gypsum tahan lembap, perbaikan dinding yang retak, dan pengadaan meja kursi baru. Mari bersama kembalikan senyum semangat anak-anak pesisir untuk meraih cita-cita!`,
    coverImageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
    ],
    categoryId: "cat-2",
    categoryName: "Pendidikan & Sekolah",
    beneficiaryLocation: "Kepulauan Seribu, DKI Jakarta",
    targetAmount: 60000000,
    collectedAmount: 43250000,
    donorCount: 192,
    deadline: "2026-10-28",
    status: "active",
    isUrgent: false,
    fundraiser: DUMMY_FUNDRAISERS[2],
    createdAt: "2026-08-10",
    publishedAt: "2026-08-11",
    updates: [],
    transparencyReports: [],
    prayers: [
      {
        id: "pry-201",
        donationId: "don-201",
        donorName: "Sinta Maharani",
        isAnonymous: false,
        message: "Semangat adik-adik di Pulau Tidung! Belajar yang rajin ya nak, kelak jadi kebanggaan orang tua.",
        amount: 150000,
        isAmountHidden: false,
        createdAt: "2026-09-20T11:00:00Z",
        likes: 5,
      },
    ],
  },
  {
    id: "kmp-3",
    slug: "darurat-banjir-bandang-pekalongan",
    title: "Darurat Banjir Bandang Pekalongan: Bantu 200 Keluarga Kehilangan Rumah & Pakaian",
    shortDescription: "Banjir luapan sungai menyapu permukiman warga. Ratusan anak dan lansia mengungsi tanpa alas tidur memadai.",
    story: `Hujan deras dengan intensitas ekstrem di hulu sungai menyebabkan banjir bandang melanda pemukiman warga di pesisir Pekalongan. Ketinggian air mencapai 1,8 meter merendam ratusan rumah, menghanyutkan perabotan, cadangan beras, dan perlengkapan sekolah anak-anak.

Sebanyak lebih dari 200 keluarga saat ini bertahan di posko pengungsian balai desa dengan logistik yang sangat terbatas. Mereka membutuhkan air bersih, makanan siap saji, popok bayi, selimut tebal, pakaian layak pakai, dan paket obat-obatan anti-gatal pasca banjir.

Donasi Anda akan disalurkan langsung oleh tim relawan di lapangan untuk memenuhi kebutuhan darurat dapur umum dan paket sanitasi warga terdampak.`,
    coverImageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
    ],
    categoryId: "cat-3",
    categoryName: "Bencana Alam",
    beneficiaryLocation: "Pekalongan, Jawa Tengah",
    targetAmount: 100000000,
    collectedAmount: 89400000,
    donorCount: 438,
    deadline: "2026-10-05",
    status: "active",
    isUrgent: true,
    fundraiser: DUMMY_FUNDRAISERS[0],
    createdAt: "2026-09-01",
    publishedAt: "2026-09-02",
    updates: [
      {
        id: "upd-301",
        campaignId: "kmp-3",
        title: "Distribusi 500 Paket Nasi Hangat & Air Bersih di Posko Balai Desa",
        content: "Alhamdulillah sore tadi tim relawan berhasil mendistribusikan 500 porsi makan malam hangat dan 100 galon air bersih untuk warga di Posko Pengungsian 1 dan 2. Terima kasih para Sahabat Umat atas gerak cepat bantuannya.",
        imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
        createdAt: "2026-09-22",
        authorName: "Ustadz H. Ahmad Syafi'i",
      },
    ],
    transparencyReports: [
      {
        id: "tr-301",
        campaignId: "kmp-3",
        title: "Laporan Belanja Logistik Dapur Umum Tahap 1",
        amountUsed: 25000000,
        disbursementDate: "2026-09-20",
        description: "Pembelian 1 ton beras, 150 karton mie instan, 80 karton biskuit balita, serta perlengkapan kompor gas dapur darurat.",
        beneficiaries: "200 Kepala Keluarga Pengungsi",
        photoUrls: [
          "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=80",
        ],
        status: "published",
        reviewedAt: "2026-09-21",
      },
    ],
    prayers: [
      {
        id: "pry-301",
        donationId: "don-301",
        donorName: "Aussie Hidayat",
        isAnonymous: false,
        message: "Semoga banjir segera surut dan keluarga di Pekalongan diberikan ketabahan dan kesehatan. Semangat!",
        amount: 300000,
        isAmountHidden: false,
        createdAt: "2026-09-23T08:12:00Z",
        likes: 14,
      },
    ],
  },
  {
    id: "kmp-4",
    slug: "pengobatan-kanker-darah-adik-rizky-semarang",
    title: "Pengobatan Kanker Darah Adik Rizky (7 Tahun), Ayah Penarik Becak Butuh Bantuan Kita",
    shortDescription: "Rizky harus menjalani kemoterapi rutin 3 minggu sekali demi sembuh dari Leukemia Limfoblastik Akut.",
    story: `Adik Rizky (7 tahun) adalah putra bungsu dari Bapak Sukirno, seorang penarik becak kayuh di kawasan Stasiun Poncol Semarang. Di usianya yang seharusnya riang bermain bola bersama teman sebaya, Rizky terbaring lemah di bangsal hematologi RSUP Dr. Kariadi Semarang setelah didiagnosis mengidap Leukemia Limfoblastik Akut (kanker darah).

Meskipun sebagian tindakan medis ditanggung BPJS, biaya transfusi trombosit steril berkala, pembelian obat kemoterapi pendukung, infus khusus, serta biaya akomodasi selama berbulan-bulan di rumah sakit sangat melampaui kemampuan ayahnya yang berpenghasilan tak menentu sekitar Rp 35.000 per hari.

Mari kita hadir bersama menjadi perpanjangan tangan kebaikan untuk memperjuangkan masa depan Adik Rizky agar bisa sembuh dan bersekolah kembali.`,
    coverImageUrl: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&auto=format&fit=crop&q=80",
    ],
    categoryId: "cat-1",
    categoryName: "Kesehatan & Medis",
    beneficiaryLocation: "Kota Semarang, Jawa Tengah",
    targetAmount: 75000000,
    collectedAmount: 54100000,
    donorCount: 326,
    deadline: "2026-10-20",
    status: "active",
    isUrgent: true,
    fundraiser: DUMMY_FUNDRAISERS[1],
    createdAt: "2026-08-15",
    publishedAt: "2026-08-16",
    updates: [],
    transparencyReports: [],
    prayers: [],
  },
  {
    id: "kmp-5",
    slug: "wakaf-al-quran-500-santri-yatim-lombok",
    title: "Wakaf Al-Quran & Kitab Kuning untuk 500 Santri Yatim Penghafal Quran di Lombok Timur",
    shortDescription: "Sediakan mushaf Al-Quran hafalan standar dan kitab penunjang bagi santri pelosok Nusa Tenggara Barat.",
    story: `Di lereng Gunung Rinjani, Lombok Timur, terdapat pondok pesantren rintisan yang menampung lebih dari 500 santri yatim dan dhuafa secara cuma-cuma. Mereka memiliki semangat yang luar biasa dalam menghafal kalam ilahi.

Namun, keterbatasan fasilitas membuat 1 mushaf Al-Quran harus dipakai bergantian oleh 3 hingga 4 santri. Banyak lembaran mushaf yang sudah sobek dan menguning karena telah digunakan selama bertahun-tahun.

Melalui program wakaf ini, kami mengajak Sahabat Umat menghadiahkan mushaf Al-Quran hafalan baru berkualitas dan kitab terjemahan agar proses belajar mereka semakin lancar dan berkah. Setiap huruf yang mereka lafalkan insyaAllah mengalirkan pahala jariyah tiada putus.`,
    coverImageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80",
    ],
    categoryId: "cat-5",
    categoryName: "Rumah Ibadah & Pesantren",
    beneficiaryLocation: "Lombok Timur, Nusa Tenggara Barat",
    targetAmount: 25000000,
    collectedAmount: 25000000,
    donorCount: 168,
    deadline: "2026-09-10",
    status: "completed",
    isUrgent: false,
    fundraiser: DUMMY_FUNDRAISERS[0],
    createdAt: "2026-07-20",
    publishedAt: "2026-07-21",
    updates: [
      {
        id: "upd-501",
        campaignId: "kmp-5",
        title: "Penyerahan 500 Mushaf Al-Quran & Doa Bersama Santri",
        content: "Alhamdulillah target telah tercapai 100%! Seluruh 500 mushaf Al-Quran telah diserahkan langsung kepada para santri di Pondok Pesantren Baitul Yatim Lombok Timur. Jazakumullah khairan katsiran kepada seluruh donatur.",
        imageUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80",
        createdAt: "2026-09-12",
        authorName: "Ustadz H. Ahmad Syafi'i",
      },
    ],
    transparencyReports: [
      {
        id: "tr-501",
        campaignId: "kmp-5",
        title: "Laporan Lengkap Pembelian & Ekspedisi Mushaf Al-Quran",
        amountUsed: 25000000,
        disbursementDate: "2026-09-11",
        description: "Pengadaan 500 mushaf Al-Quran hafalan standar Kemenag RI (@Rp 45.000) dan ongkos kirim ekspedisi Surabaya - Lombok Timur.",
        beneficiaries: "500 Santri Yatim & Dhuafa",
        photoUrls: [
          "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800&auto=format&fit=crop&q=80",
        ],
        status: "published",
        reviewedAt: "2026-09-13",
      },
    ],
    prayers: [],
  },
  {
    id: "kmp-6",
    slug: "bantu-kursi-roda-veteran-yogyakarta",
    title: "Bantu Kursi Roda & Alat Bantu Dengar untuk 30 Veteran & Lansia Dhuafa di Yogyakarta",
    shortDescription: "Beri kemudahan mobilitas bagi para pejuang lansia agar dapat kembali beribadah dan bersosialisasi.",
    story: `Puluhan lansia dhuafa dan mantan pejuang kemerdekaan di pelosok Gunungkidul dan Bantul kini mengalami keterbatasan gerak karena penyakit stroke, kelumpuhan, dan penurunan fungsi pendengaran.

Sebagian besar dari mereka hanya bisa berbaring di tempat tidur kayu sederhana tanpa bisa keluar rumah menikmati udara segar atau beribadah ke musala desa.

Program ini bertujuan membagikan 30 unit kursi roda ergonomis standar medis dan 20 alat bantu dengar digital agar para orang tua kita tercinta dapat kembali tersenyum dan menjalani hari-hari tua dengan lebih bermartabat.`,
    coverImageUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800&auto=format&fit=crop&q=80",
    ],
    categoryId: "cat-6",
    categoryName: "Difabel & Lansia",
    beneficiaryLocation: "Bantul & Gunungkidul, D.I. Yogyakarta",
    targetAmount: 35000000,
    collectedAmount: 19800000,
    donorCount: 112,
    deadline: "2026-11-01",
    status: "active",
    isUrgent: false,
    fundraiser: DUMMY_FUNDRAISERS[2],
    createdAt: "2026-08-25",
    publishedAt: "2026-08-26",
    updates: [],
    transparencyReports: [],
    prayers: [],
  },
];

export const DUMMY_TRANSACTIONS: DonationTransaction[] = [
  {
    id: "tx-1",
    donationCode: "DON-2024-0912",
    campaignId: "kmp-1",
    campaignTitle: "Bantu Pengobatan Bu Siti, Janda Tunanetra di Bandung Berjuang Melawan Tumor",
    campaignSlug: "bantu-pengobatan-bu-siti-bandung",
    donorId: "usr-d1",
    donorName: "Dimas Nugraha",
    donorEmail: "dimas.nugraha@gmail.com",
    donorPhone: "+6281234567890",
    amount: 100000,
    uniqueCode: 123,
    totalTransfer: 100123,
    bankDestination: "BCA (1234567890 a.n Yayasan DonasiUmat)",
    isAnonymous: false,
    isAmountHidden: false,
    prayerMessage: "Semoga lekas sembuh ya Bu Siti, Allah angkat penyakitnya dan beri keberkahan selalu. Aamiin ya Rabbal Alamin.",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
    status: "verified",
    verifiedAt: "2026-09-23T15:30:00Z",
    verifiedBy: "Admin Ayu",
    expiresAt: "2026-09-24T14:20:00Z",
    createdAt: "2026-09-23T14:20:00Z",
  },
  {
    id: "tx-2",
    donationCode: "DON-2024-0915",
    campaignId: "kmp-3",
    campaignTitle: "Darurat Banjir Bandang Pekalongan: Bantu 200 Keluarga Kehilangan Rumah & Pakaian",
    campaignSlug: "darurat-banjir-bandang-pekalongan",
    donorId: "usr-d2",
    donorName: "Sinta Maharani",
    donorEmail: "sinta.maharani@gmail.com",
    donorPhone: "+6281398765432",
    amount: 250000,
    uniqueCode: 456,
    totalTransfer: 250456,
    bankDestination: "Mandiri (1370012345678 a.n Yayasan DonasiUmat)",
    isAnonymous: false,
    isAmountHidden: false,
    prayerMessage: "Semoga saudara-saudara di Pekalongan diberi ketabahan dan kekuatan menghadapi ujian ini.",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
    status: "waiting_verification",
    expiresAt: "2026-09-25T10:00:00Z",
    createdAt: "2026-09-24T06:15:00Z",
  },
  {
    id: "tx-3",
    donationCode: "DON-2024-0916",
    campaignId: "kmp-4",
    campaignTitle: "Pengobatan Kanker Darah Adik Rizky (7 Tahun), Ayah Penarik Becak Butuh Bantuan Kita",
    campaignSlug: "pengobatan-kanker-darah-adik-rizky-semarang",
    donorId: "usr-d3",
    donorName: "Hamba Allah",
    donorEmail: "hamba.allah99@gmail.com",
    donorPhone: "+6281987654321",
    amount: 500000,
    uniqueCode: 789,
    totalTransfer: 500789,
    bankDestination: "BNI (0987654321 a.n Yayasan DonasiUmat)",
    isAnonymous: true,
    isAmountHidden: false,
    prayerMessage: "Bismillah lekas pulih adik Rizky tersayang.",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
    status: "waiting_verification",
    expiresAt: "2026-09-25T11:30:00Z",
    createdAt: "2026-09-24T07:45:00Z",
  },
  {
    id: "tx-4",
    donationCode: "DON-2024-0901",
    campaignId: "kmp-2",
    campaignTitle: "Renovasi Ruang Kelas SDN 004 Pulau Tidung Kepulauan Seribu",
    campaignSlug: "renovasi-ruang-kelas-sdn-004-pulau-tidung",
    donorId: "usr-d4",
    donorName: "PT. Sumber Rejeki Abadi",
    donorEmail: "csr@sumberrejeki.co.id",
    donorPhone: "+628112345678",
    amount: 5000000,
    uniqueCode: 102,
    totalTransfer: 5000102,
    bankDestination: "BCA (1234567890 a.n Yayasan DonasiUmat)",
    isAnonymous: false,
    isAmountHidden: false,
    prayerMessage: "Program CSR Pendidikan untuk generasi penerus bangsa di kepulauan.",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
    status: "verified",
    verifiedAt: "2026-09-20T16:00:00Z",
    verifiedBy: "Admin Rizky",
    expiresAt: "2026-09-21T10:00:00Z",
    createdAt: "2026-09-20T09:30:00Z",
  },
  {
    id: "tx-5",
    donationCode: "DON-2024-0899",
    campaignId: "kmp-1",
    campaignTitle: "Bantu Pengobatan Bu Siti, Janda Tunanetra di Bandung",
    campaignSlug: "bantu-pengobatan-bu-siti-bandung",
    donorId: "usr-d5",
    donorName: "Fajar Pratama",
    donorEmail: "fajar.pratama@gmail.com",
    donorPhone: "+6281765432109",
    amount: 50000,
    uniqueCode: 334,
    totalTransfer: 50334,
    bankDestination: "BRI (012301000123501 a.n Yayasan DonasiUmat)",
    isAnonymous: false,
    isAmountHidden: false,
    prayerMessage: "Semoga berkah.",
    proofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
    status: "rejected",
    rejectionReason: "Nominal pada mutasi bank tidak sesuai dengan total transfer (kode unik tidak tertera).",
    verifiedAt: "2026-09-19T14:00:00Z",
    verifiedBy: "Admin Ayu",
    expiresAt: "2026-09-20T12:00:00Z",
    createdAt: "2026-09-19T11:00:00Z",
  },
];

export const DUMMY_IDENTITIES: IdentityVerification[] = [
  {
    id: "id-1",
    userId: "usr-f4",
    userName: "Hendra Gunawan",
    userEmail: "hendra.gunawan@pedulisesama.org",
    userPhone: "+6285211223344",
    idType: "ktp",
    idNumberMasked: "3201********0004",
    fullNameOnId: "HENDRA GUNAWAN",
    address: "Jl. R.E. Martadinata No. 45, RT 02/RW 04, Citarum, Bandung Wetan, Kota Bandung, Jawa Barat",
    bankName: "BCA",
    bankAccountNumber: "0351234567",
    bankAccountHolder: "HENDRA GUNAWAN",
    idPhotoUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    selfiePhotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
    status: "pending",
    createdAt: "2026-09-23T16:20:00Z",
  },
  {
    id: "id-2",
    userId: "usr-f1",
    userName: "Ustadz H. Ahmad Syafi'i",
    userEmail: "ahmad.syafii@sahabatinsan.id",
    userPhone: "+6281233445566",
    idType: "ktp",
    idNumberMasked: "3273********0001",
    fullNameOnId: "AHMAD SYAFI'I",
    address: "Komplek Pesantren Al-Hidayah, Desa Sukamaju, Kec. Cililin, Kab. Bandung Barat",
    bankName: "Mandiri",
    bankAccountNumber: "1310019283746",
    bankAccountHolder: "YAYASAN SAHABAT INSAN AMANAH",
    idPhotoUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
    selfiePhotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    status: "verified",
    reviewedBy: "Admin Rizky",
    reviewedAt: "2026-04-12T10:00:00Z",
    createdAt: "2026-04-11T14:00:00Z",
  },
];

export const DUMMY_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: "wd-1",
    withdrawalCode: "WD-2024-0041",
    campaignId: "kmp-1",
    campaignTitle: "Bantu Pengobatan Bu Siti, Janda Tunanetra di Bandung",
    fundraiserId: "usr-f2",
    fundraiserName: "dr. Nurul Annisa",
    requestedAmount: 15000000,
    purposeDescription: "Biaya persiapan tindakan operasi tumor dan pembayaran deposit kamar rawat inap bedah di RSUD Al Ihsan.",
    bankName: "BCA",
    bankAccountNumber: "2330918273",
    bankAccountHolder: "NURUL ANNISA",
    status: "approved",
    transferProofUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80",
    transferredAt: "2026-09-23T11:00:00Z",
    createdAt: "2026-09-22T08:30:00Z",
  },
  {
    id: "wd-2",
    withdrawalCode: "WD-2024-0042",
    campaignId: "kmp-3",
    campaignTitle: "Darurat Banjir Bandang Pekalongan: Bantu 200 Keluarga",
    fundraiserId: "usr-f1",
    fundraiserName: "Ustadz H. Ahmad Syafi'i",
    requestedAmount: 30000000,
    purposeDescription: "Pembelian sembako tahap 2, tenda darurat 10 unit, dan 200 paket selimut warga lansia terdampak banjir.",
    bankName: "Mandiri",
    bankAccountNumber: "1310019283746",
    bankAccountHolder: "YAYASAN SAHABAT INSAN AMANAH",
    status: "pending",
    createdAt: "2026-09-24T05:00:00Z",
  },
];

export const DUMMY_AUDIT_LOGS: AuditLog[] = [
  {
    id: "aud-1",
    actorId: "usr-a1",
    actorName: "Admin Ayu",
    actorRole: "admin",
    action: "verify",
    entityType: "donation",
    entityId: "tx-1",
    description: "Memverifikasi bukti transfer donasi #DON-2024-0912 sebesar Rp 100.123 untuk kampanye Bantu Pengobatan Bu Siti",
    ipAddress: "103.144.20.12",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
    createdAt: "2026-09-23T15:30:00Z",
  },
  {
    id: "aud-2",
    actorId: "usr-a2",
    actorName: "Admin Rizky",
    actorRole: "admin",
    action: "approve",
    entityType: "campaign",
    entityId: "kmp-1",
    description: "Menyetujui & mempublikasikan kampanye #KMP-2024-001 'Bantu Pengobatan Bu Siti, Janda Tunanetra di Bandung'",
    ipAddress: "103.144.20.15",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
    createdAt: "2026-08-02T10:15:00Z",
  },
  {
    id: "aud-3",
    actorId: "usr-a2",
    actorName: "Admin Rizky",
    actorRole: "admin",
    action: "approve",
    entityType: "withdrawal",
    entityId: "wd-1",
    description: "Menyetujui permohonan pencairan dana #WD-2024-0041 sebesar Rp 15.000.000 dan mengunggah bukti transfer bank",
    ipAddress: "103.144.20.15",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0.0.0",
    createdAt: "2026-09-23T11:00:00Z",
  },
  {
    id: "aud-4",
    actorId: "usr-f1",
    actorName: "Ustadz H. Ahmad Syafi'i",
    actorRole: "fundraiser",
    action: "create",
    entityType: "transparency_report",
    entityId: "tr-301",
    description: "Mengunggah Laporan Transparansi Penyaluran Dana Tahap 1 untuk kampanye Banjir Bandang Pekalongan",
    ipAddress: "182.253.110.8",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15",
    createdAt: "2026-09-20T17:30:00Z",
  },
];

export const OFFICIAL_BANK_ACCOUNTS = [
  {
    bankName: "BCA",
    accountNumber: "1234567890",
    accountHolder: "Yayasan DonasiUmat Indonesia",
    badge: "Otomatis Dicek",
  },
  {
    bankName: "Bank Mandiri",
    accountNumber: "1370012345678",
    accountHolder: "Yayasan DonasiUmat Indonesia",
    badge: "Konfirmasi Cepat",
  },
  {
    bankName: "BNI",
    accountNumber: "0987654321",
    accountHolder: "Yayasan DonasiUmat Indonesia",
    badge: "Konfirmasi Cepat",
  },
  {
    bankName: "BRI",
    accountNumber: "012301000123501",
    accountHolder: "Yayasan DonasiUmat Indonesia",
    badge: "Konfirmasi Cepat",
  },
  {
    bankName: "Bank Syariah Indonesia (BSI)",
    accountNumber: "7123456789",
    accountHolder: "Yayasan DonasiUmat Indonesia",
    badge: "Syariah",
  },
];

export const PLATFORM_STATISTICS = {
  totalDonationDisbursed: 2845000000,
  totalCampaignsFunded: 418,
  totalVerifiedDonors: 32650,
  transparencyRate: "100%",
  verificationAvgHours: "4.2 Jam",
};
