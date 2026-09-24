const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgtjqdujfaljbrretjkx.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndGpxZHVqZmFsamJycmV0amt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDIwMTk1NSwiZXhwIjoyMTA1Nzc3OTU1fQ.MlSUeOIltv_91kBGUjbIZitKuW_FvcFvhQFI7PwE90M';

const supabase = createClient(url, key);

const expectedTables = [
  'profiles',
  'identity_verifications',
  'categories',
  'campaigns',
  'campaign_updates',
  'donations',
  'transparency_reports',
  'withdrawals',
  'notifications',
  'whatsapp_logs',
  'audit_logs',
  'platform_settings',
  'sedekah_subuh_pledges',
  'zakat_records'
];

async function verify() {
  console.log('🔍 Memverifikasi Database Supabase DonasiUmat...\n');
  let successCount = 0;

  for (const table of expectedTables) {
    const { data, error } = await supabase.from(table).select().limit(1);
    if (error && error.code === 'PGRST205') {
      console.log(`❌ [${table}]: Belum dibuat`);
    } else if (error) {
      console.log(`⚠️ [${table}]: ${error.message}`);
    } else {
      console.log(`✅ [${table}]: Aktif & Siap`);
      successCount++;
    }
  }

  // Check categories seed
  const { data: catData } = await supabase.from('categories').select('name, slug');
  if (catData && catData.length > 0) {
    console.log(`\n🌱 Seed Categories: ${catData.length} kategori berhasil terisi:`);
    catData.forEach(c => console.log(`   - ${c.name} (slug: ${c.slug})`));
  }

  // Check platform_settings
  const { data: settingsData } = await supabase.from('platform_settings').select('key');
  if (settingsData && settingsData.length > 0) {
    console.log(`🌱 Seed Settings: ${settingsData.length} pengaturan platform terpasang.`);
  }

  // Check Storage Buckets
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  if (buckets) {
    console.log(`\n📦 Storage Buckets: ${buckets.length} bucket terdeteksi:`);
    buckets.forEach(b => console.log(`   - ${b.id} (public: ${b.public})`));
  }

  console.log(`\n========================================`);
  console.log(`Hasil: ${successCount}/${expectedTables.length} tabel siap digunakan!`);
  if (successCount === expectedTables.length) {
    console.log('🎉 SELURUH SKEMA & SEED BERHASIL AKTIF 100%!');
  } else {
    console.log('⚠️ Silakan jalankan file SQL migrasi di Supabase SQL Editor.');
  }
}

verify();
