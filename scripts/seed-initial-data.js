const { createClient } = require('@supabase/supabase-js');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgtjqdujfaljbrretjkx.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndGpxZHVqZmFsamJycmV0amt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDIwMTk1NSwiZXhwIjoyMTA1Nzc3OTU1fQ.MlSUeOIltv_91kBGUjbIZitKuW_FvcFvhQFI7PwE90M';

const supabase = createClient(url, key);

async function main() {
  console.log('🚀 Seeding Initial Real Data into Supabase...');

  const { data: profiles } = await supabase.from('profiles').select('id, email');
  const fundraiserId = profiles.find(p => p.email === 'ahmad.syafii@sahabatinsan.id')?.id || '1bfce920-2748-42c7-9a62-bbe7151457b3';
  const donorId = profiles.find(p => p.email === 'dimas.nugraha@gmail.com')?.id || 'da95d08f-872f-4280-8f69-c86a1d589c51';
  console.log('✅ Fundraiser User ID:', fundraiserId);
  console.log('✅ Donor User ID:', donorId);

  // Set verified on fundraiser profile
  await supabase.from('profiles').update({ is_verified: true }).eq('id', fundraiserId);

  // 3. Insert Initial Campaigns
  const campaigns = [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      fundraiser_id: fundraiserId,
      category_id: 'c1111111-1111-1111-1111-111111111111', // Kesehatan
      title: 'Bantu Pengobatan Bu Siti, Janda Tunanetra di Bandung Berjuang Melawan Tumor',
      slug: 'bantu-pengobatan-bu-siti-bandung',
      short_description: 'Bu Siti (54 th) tunanetra sebatang kara harus segera menjalani operasi pengangkatan tumor di lehernya.',
      story: 'Bu Siti (54 tahun) adalah seorang janda tunanetra yang hidup sebatang kara di sebuah kontrakan petak berukuran 3x3 meter di Babakan Ciparay, Kota Bandung. Sehari-hari beliau bertahan hidup dari belas kasih para tetangga dan sesekali memijat panggilan jika ada warga yang membutuhkan.\n\nNamun, sejak 5 bulan lalu, muncul benjolan di leher sebelah kanannya yang kian hari kian membesar hingga berukuran sebesar bola tenis. Rasa sakit berdenyut tiada henti kerap membuat Bu Siti demam menggigil dan sulit menelan makanan.\n\nPemeriksaan terakhir di RSUD Al Ihsan Bandung mendiagnosis adanya tumor jinak yang sudah mulai menekan saluran napas dan saraf leher. Dokter menyarankan operasi pengangkatan segera sebelum tumor semakin membesar dan berisiko komplikasi berbahaya.',
      cover_image_url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80'
      ],
      beneficiary_location: 'Kota Bandung, Jawa Barat',
      target_amount: 45000000,
      collected_amount: 38750000,
      donor_count: 264,
      deadline: '2026-10-15',
      status: 'active',
      is_urgent: true,
      published_at: '2026-08-02T10:00:00Z'
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      fundraiser_id: fundraiserId,
      category_id: 'c2222222-2222-2222-2222-222222222222', // Pendidikan
      title: 'Renovasi Ruang Kelas SDN 004 Pulau Tidung Kepulauan Seribu yang Ambruk',
      slug: 'renovasi-ruang-kelas-sdn-004-pulau-tidung',
      short_description: 'Bantu 78 murid pulau belajar di bawah atap yang aman tanpa rasa takut tertimpa plafon lapuk.',
      story: 'SDN 004 Pulau Tidung merupakan satu-satunya tumpuan sekolah dasar bagi anak-anak nelayan di sisi barat pulau. Pada bulan lalu, angin kencang disertai hujan lebat merusak atap dua ruang kelas utama hingga plafonnya runtuh dan kuda-kuda kayu lapuk patah.',
      cover_image_url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80'
      ],
      beneficiary_location: 'Kepulauan Seribu, DKI Jakarta',
      target_amount: 60000000,
      collected_amount: 43250000,
      donor_count: 192,
      deadline: '2026-10-28',
      status: 'active',
      is_urgent: false,
      published_at: '2026-08-11T09:00:00Z'
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      fundraiser_id: fundraiserId,
      category_id: 'c3333333-3333-3333-3333-333333333333', // Bencana Alam
      title: 'Darurat Banjir Bandang Pekalongan: Bantu 200 Keluarga Kehilangan Rumah',
      slug: 'darurat-banjir-bandang-pekalongan',
      short_description: 'Banjir luapan sungai menyapu permukiman warga. Ratusan anak dan lansia mengungsi tanpa alas tidur.',
      story: 'Hujan deras dengan intensitas ekstrem di hulu sungai menyebabkan banjir bandang melanda pemukiman warga di pesisir Pekalongan. Ketinggian air mencapai 1,8 meter merendam ratusan rumah, menghanyutkan perabotan, cadangan beras, dan perlengkapan sekolah anak-anak.',
      cover_image_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
      gallery_urls: [
        'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80'
      ],
      beneficiary_location: 'Pekalongan, Jawa Tengah',
      target_amount: 100000000,
      collected_amount: 89400000,
      donor_count: 438,
      deadline: '2026-10-05',
      status: 'active',
      is_urgent: true,
      published_at: '2026-09-02T08:00:00Z'
    }
  ];

  for (const c of campaigns) {
    const { error: cErr } = await supabase.from('campaigns').upsert(c, { onConflict: 'slug' });
    if (cErr) console.error('Campaign error:', c.slug, cErr.message);
    else console.log('✅ Campaign ready:', c.slug);
  }

  // 4. Insert Initial Real Donations
  const donations = [
    {
      id: 'd1111111-1111-1111-1111-111111111111',
      donation_code: 'DON-2026-0912',
      campaign_id: 'a1111111-1111-1111-1111-111111111111',
      donor_id: donorId,
      amount: 100000,
      unique_code: 123,
      total_transfer: 100123,
      bank_destination: 'BCA (1234567890 a.n Yayasan DonasiUmat)',
      is_anonymous: false,
      is_amount_hidden: false,
      prayer_message: 'Semoga lekas sembuh ya Bu Siti, Allah angkat penyakitnya dan beri keberkahan selalu. Aamiin.',
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      status: 'verified',
      expires_at: '2026-10-01T00:00:00Z',
      verified_at: '2026-09-23T15:30:00Z'
    },
    {
      id: 'd2222222-2222-2222-2222-222222222222',
      donation_code: 'DON-2026-0915',
      campaign_id: 'a3333333-3333-3333-3333-333333333333',
      donor_id: donorId,
      amount: 250000,
      unique_code: 456,
      total_transfer: 250456,
      bank_destination: 'BCA (1234567890 a.n Yayasan DonasiUmat)',
      is_anonymous: false,
      is_amount_hidden: false,
      prayer_message: 'Semoga saudara-saudara di Pekalongan diberi ketabahan dan kekuatan menghadapi ujian ini.',
      proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=80',
      status: 'waiting_verification',
      expires_at: '2026-10-02T10:00:00Z'
    },
    {
      id: 'd3333333-3333-3333-3333-333333333333',
      donation_code: 'DON-2026-0918',
      campaign_id: 'a2222222-2222-2222-2222-222222222222',
      donor_id: donorId,
      amount: 500000,
      unique_code: 789,
      total_transfer: 500789,
      bank_destination: 'BCA (1234567890 a.n Yayasan DonasiUmat)',
      is_anonymous: true,
      is_amount_hidden: false,
      prayer_message: 'Bismillah berkah untuk adik-adik di Pulau Tidung.',
      status: 'pending',
      expires_at: '2026-10-03T12:00:00Z'
    }
  ];

  for (const d of donations) {
    const { error: dErr } = await supabase.from('donations').upsert(d, { onConflict: 'donation_code' });
    if (dErr) console.error('Donation error:', d.donation_code, dErr.message);
    else console.log('✅ Donation ready:', d.donation_code, `(status: ${d.status})`);
  }

  console.log('\n🎉 INITIAL REAL DATA SEEDED SUCCESSFULLY!');
}

main();
