const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgtjqdujfaljbrretjkx.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndGpxZHVqZmFsamJycmV0amt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDIwMTk1NSwiZXhwIjoyMTA1Nzc3OTU1fQ.MlSUeOIltv_91kBGUjbIZitKuW_FvcFvhQFI7PwE90M';

const supabase = createClient(url, key);

const categories = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Kesehatan & Medis',
    slug: 'kesehatan',
    icon_name: 'HeartPulse',
    description: 'Bantuan biaya operasi, obat, dan perawatan pasien darurat dhuafa'
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Pendidikan & Sekolah',
    slug: 'pendidikan',
    icon_name: 'GraduationCap',
    description: 'Beasiswa anak yatim, renovasi gedung sekolah rusak, buku & fasilitas'
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Bencana Alam',
    slug: 'bencana-alam',
    icon_name: 'Flame',
    description: 'Bantuan darurat logistik, tenda, obat-obatan dan pemulihan pasca gempa/banjir'
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    name: 'Panti Asuhan & Yatim',
    slug: 'panti-asuhan',
    icon_name: 'Home',
    description: 'Biaya kebutuhan makan pokok, pakaian, dan pembinaan anak yatim piatu'
  },
  {
    id: 'c5555555-5555-5555-5555-555555555555',
    name: 'Rumah Ibadah & Pesantren',
    slug: 'rumah-ibadah',
    icon_name: 'Landmark',
    description: 'Pembangunan, renovasi masjid pelosok, sarana wudhu, dan santri penghafal Quran'
  },
  {
    id: 'c6666666-6666-6666-6666-666666666666',
    name: 'Difabel & Lansia',
    slug: 'difabel',
    icon_name: 'Accessibility',
    description: 'Penyediaan kursi roda, alat bantu dengar, dan santunan lansia terlantar'
  },
  {
    id: 'c7777777-7777-7777-7777-777777777777',
    name: 'Kemanusiaan Umum',
    slug: 'kemanusiaan',
    icon_name: 'Users',
    description: 'Paket sembako dhuafa, bantuan modal usaha mikro mustahik, air bersih'
  },
  {
    id: 'c8888888-8888-8888-8888-888888888888',
    name: 'Peduli Lingkungan',
    slug: 'lingkungan',
    icon_name: 'Trees',
    description: 'Penanaman pohon mangrove penahan abrasi, konservasi mata air desa'
  }
];

const platformSettings = [
  {
    key: 'bank_transfer_official',
    value: {
      bank_name: 'BCA',
      account_number: '1234567890',
      account_holder: 'Yayasan DonasiUmat Indonesia'
    }
  },
  {
    key: 'whatsapp_templates',
    value: {
      donation_verified: 'Halo Sahabat Umat, donasi Anda sebesar {{amount}} untuk kampanye {{campaign_title}} telah diverifikasi. Terima kasih atas kebaikannya. — DonasiUmat',
      campaign_update_posted: 'Sahabat Umat, penggalang kampanye {{campaign_title}} yang Anda dukung baru saja mengunggah kabar perkembangan terbaru: {{update_title}}. Cek selengkapnya di aplikasi DonasiUmat.'
    }
  }
];

const bucketsToCreate = [
  { id: 'campaign-images', public: true },
  { id: 'avatars', public: true },
  { id: 'transparency-reports', public: true },
  { id: 'verification-docs', public: false },
  { id: 'payment-proofs', public: false }
];

async function seed() {
  console.log('🌱 Menjalankan Seeding Database DonasiUmat...');

  // 1. Categories
  const { data: catRes, error: catErr } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'slug' })
    .select();
  if (catErr) {
    console.error('❌ Gagal seed categories:', catErr.message);
  } else {
    console.log(`✅ Berhasil seed ${catRes.length} kategori.`);
  }

  // 2. Platform Settings
  const { data: setRes, error: setErr } = await supabase
    .from('platform_settings')
    .upsert(platformSettings, { onConflict: 'key' })
    .select();
  if (setErr) {
    console.error('❌ Gagal seed platform_settings:', setErr.message);
  } else {
    console.log(`✅ Berhasil seed ${setRes.length} platform settings.`);
  }

  // 3. Storage Buckets
  console.log('\n📦 Memastikan Storage Buckets siap...');
  for (const b of bucketsToCreate) {
    const { error: bErr } = await supabase.storage.createBucket(b.id, {
      public: b.public
    });
    if (bErr) {
      if (bErr.message.includes('already exists') || bErr.message.includes('Duplicate')) {
        console.log(`ℹ️ Bucket [${b.id}] sudah ada.`);
      } else {
        console.log(`⚠️ Bucket [${b.id}]: ${bErr.message}`);
      }
    } else {
      console.log(`✅ Bucket [${b.id}] berhasil dibuat (public: ${b.public}).`);
    }
  }

  console.log('\n🎉 PROSES SEED SELESAI!');
}

seed();
