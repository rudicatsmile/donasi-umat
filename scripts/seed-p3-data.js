const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kgtjqdujfaljbrretjkx.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtndGpxZHVqZmFsamJycmV0amt4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDIwMTk1NSwiZXhwIjoyMTA1Nzc3OTU1fQ.MlSUeOIltv_91kBGUjbIZitKuW_FvcFvhQFI7PwE90M';

const supabase = createClient(url, key);

function hashSha256(text) {
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}

async function main() {
  console.log('🚀 Seeding Priority 3 Data into Supabase...');

  // 1. Create extra auth users & profiles if not exists
  const extraUsers = [
    {
      email: 'nurul.annisa@dokterkeliling.org',
      password: 'Password123!',
      full_name: 'dr. Nurul Annisa',
      phone_wa: '+6281987654321',
      role: 'fundraiser',
      is_verified: true,
      suspended_at: null,
      suspended_reason: null,
    },
    {
      email: 'fajar.pratama@gmail.com',
      password: 'Password123!',
      full_name: 'Fajar Pratama',
      phone_wa: '+6281765432109',
      role: 'donor',
      is_verified: false,
      suspended_at: '2026-04-12T08:00:00Z',
      suspended_reason: 'Indikasi aktivitas transfer mencurigakan',
    },
    {
      email: 'siti.aminah@gmail.com',
      password: 'Password123!',
      full_name: 'Siti Aminah, S.Pd',
      phone_wa: '+6281399887766',
      role: 'donor',
      is_verified: false,
      suspended_at: null,
      suspended_reason: null,
    }
  ];

  for (const u of extraUsers) {
    let userId;
    const { data: existingUser } = await supabase.from('profiles').select('id').eq('email', u.email).single();
    if (existingUser) {
      userId = existingUser.id;
      console.log(`👤 Profile already exists: ${u.email} (${userId})`);
      await supabase.from('profiles').update({
        full_name: u.full_name,
        phone_wa: u.phone_wa,
        role: u.role,
        is_verified: u.is_verified,
        suspended_at: u.suspended_at,
        suspended_reason: u.suspended_reason,
      }).eq('id', userId);
    } else {
      const { data: authCreated, error: authErr } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.full_name },
      });
      if (authErr) {
        console.warn(`Auth user creation notice for ${u.email}:`, authErr.message);
        // check if auth user exists
        const { data: userList } = await supabase.auth.admin.listUsers();
        const found = userList?.users?.find(x => x.email === u.email);
        userId = found?.id;
      } else {
        userId = authCreated.user.id;
      }

      if (userId) {
        await supabase.from('profiles').upsert({
          id: userId,
          email: u.email,
          full_name: u.full_name,
          phone_wa: u.phone_wa,
          role: u.role,
          is_verified: u.is_verified,
          suspended_at: u.suspended_at,
          suspended_reason: u.suspended_reason,
        });
        console.log(`✅ Created profile: ${u.email} (${userId})`);
      }
    }
  }

  // Retrieve key profile IDs
  const { data: allProfiles } = await supabase.from('profiles').select('id, email, full_name');
  const adminProfile = allProfiles.find(p => p.email === 'admin.rizky@donasiumat.id');
  const ahmadProfile = allProfiles.find(p => p.email === 'ahmad.syafii@sahabatinsan.id');
  const sitiProfile = allProfiles.find(p => p.email === 'siti.aminah@gmail.com');
  const dimasProfile = allProfiles.find(p => p.email === 'dimas.nugraha@gmail.com');

  console.log('Admin Profile ID:', adminProfile?.id);
  console.log('Ahmad Profile ID:', ahmadProfile?.id);
  console.log('Siti Profile ID:', sitiProfile?.id);
  console.log('Dimas Profile ID:', dimasProfile?.id);

  // 2. Seed Identity Verifications (Tier 1)
  if (ahmadProfile) {
    const { data: existingAhmadKyc } = await supabase.from('identity_verifications').select('id').eq('user_id', ahmadProfile.id).single();
    if (!existingAhmadKyc) {
      const { data: kyc1, error: kyc1Err } = await supabase.from('identity_verifications').insert({
        user_id: ahmadProfile.id,
        id_type: 'ktp',
        id_number_hash: hashSha256('3273010508820001'),
        id_number_masked: '327301******0001',
        full_name_on_id: "AHMAD SYAFI'I",
        address: 'Komplek Pesantren Al-Hidayah, Desa Sukamaju, Kec. Cililin, Kab. Bandung Barat',
        bank_name: 'Bank Mandiri',
        bank_account_number: '1310019283746',
        bank_account_holder: 'YAYASAN SAHABAT INSAN AMANAH',
        id_photo_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        selfie_photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
        status: 'verified',
        reviewed_by: adminProfile?.id || null,
        reviewed_at: '2026-08-01T10:00:00Z',
      }).select().single();
      console.log('✅ Seeded Verified KYC for Ahmad Syafi\'i:', kyc1?.id, kyc1Err?.message);
    }
  }

  if (sitiProfile) {
    const { data: existingSitiKyc } = await supabase.from('identity_verifications').select('id').eq('user_id', sitiProfile.id).single();
    if (!existingSitiKyc) {
      const { data: kyc2, error: kyc2Err } = await supabase.from('identity_verifications').insert({
        user_id: sitiProfile.id,
        id_type: 'ktp',
        id_number_hash: hashSha256('3174052309850002'),
        id_number_masked: '317405******0002',
        full_name_on_id: 'SITI AMINAH',
        address: 'Jl. Tebet Barat Dalam No. 14, RT 05/RW 03, Jakarta Selatan',
        bank_name: 'Bank Syariah Indonesia (BSI)',
        bank_account_number: '7123456789',
        bank_account_holder: 'SITI AMINAH',
        id_photo_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        selfie_photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
      }).select().single();
      console.log('✅ Seeded Pending KYC for Siti Aminah:', kyc2?.id, kyc2Err?.message);
    }
  }

  // 3. Seed Notifications for Donor Dimas Nugraha
  if (dimasProfile) {
    const notifs = [
      {
        user_id: dimasProfile.id,
        type: 'donation_verified',
        title: 'Donasi Anda Telah Berhasil Diverifikasi!',
        message: 'Halo Dimas Nugraha, donasi Anda sebesar Rp 100.123 untuk kampanye "Bantu Pengobatan Bu Siti" telah diverifikasi oleh admin. Terima kasih atas kebaikan Anda.',
        link_url: '/kampanye/bantu-pengobatan-bu-siti-bandung',
        is_read: false,
      },
      {
        user_id: dimasProfile.id,
        type: 'campaign_update',
        title: 'Kabar Terbaru dari Kampanye "Bantu Pengobatan Bu Siti"',
        message: 'Penggalang Ustadz H. Ahmad Syafi\'i baru saja mengunggah kabar perkembangan: Bu Siti Telah Menjalani Pemeriksaan Darah Lengkap.',
        link_url: '/kampanye/bantu-pengobatan-bu-siti-bandung',
        is_read: false,
      },
      {
        user_id: dimasProfile.id,
        type: 'campaign_target',
        title: 'Kampanye "Renovasi Ruang Kelas SDN 004" Terus Bertumbuh!',
        message: 'Alhamdulillah! Kampanye yang Anda dukung telah mengumpulkan lebih dari 70% target dana renovasi.',
        link_url: '/kampanye/renovasi-ruang-kelas-sdn-004-pulau-tidung',
        is_read: true,
      }
    ];

    const { data: existingNotifs } = await supabase.from('notifications').select('id').eq('user_id', dimasProfile.id);
    if (!existingNotifs || existingNotifs.length === 0) {
      await supabase.from('notifications').insert(notifs);
      console.log('✅ Seeded 3 Notifications for Dimas Nugraha');
    }
  }

  // 4. Ensure Donations have prayer messages for Dimas Nugraha
  if (dimasProfile) {
    const { data: donations } = await supabase.from('donations').select('id, prayer_message').eq('donor_id', dimasProfile.id);
    if (donations && donations.length > 0) {
      await supabase.from('donations').update({
        prayer_message: 'Semoga lekas sembuh ya Bu Siti, Allah angkat penyakitnya dan beri kelapangan rezeki untuk keluarga. Aamiin ya Rabbal Alamin.',
      }).eq('id', donations[0].id);

      if (donations.length > 1) {
        await supabase.from('donations').update({
          prayer_message: 'Semangat belajar untuk adik-adik di Pulau Tidung, raih cita-cita setinggi langit!',
        }).eq('id', donations[1].id);
      }
      console.log(`✅ Updated prayer messages on ${donations.length} donations for Dimas Nugraha`);
    }
  }

  console.log('🎉 Priority 3 Seed Completed Successfully!');
}

main().catch(console.error);
