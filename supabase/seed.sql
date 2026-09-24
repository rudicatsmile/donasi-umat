-- =====================================================
-- SEED DATA DONASIUMAT
-- =====================================================

-- 1. Insert Categories
insert into public.categories (id, name, slug, icon_name, description) values
  ('c1111111-1111-1111-1111-111111111111', 'Kesehatan & Medis', 'kesehatan', 'HeartPulse', 'Bantuan biaya operasi, obat, dan perawatan pasien darurat dhuafa'),
  ('c2222222-2222-2222-2222-222222222222', 'Pendidikan & Sekolah', 'pendidikan', 'GraduationCap', 'Beasiswa anak yatim, renovasi gedung sekolah rusak, buku & fasilitas'),
  ('c3333333-3333-3333-3333-333333333333', 'Bencana Alam', 'bencana-alam', 'Flame', 'Bantuan darurat logistik, tenda, obat-obatan dan pemulihan pasca gempa/banjir'),
  ('c4444444-4444-4444-4444-444444444444', 'Panti Asuhan & Yatim', 'panti-asuhan', 'Home', 'Biaya kebutuhan makan pokok, pakaian, dan pembinaan anak yatim piatu'),
  ('c5555555-5555-5555-5555-555555555555', 'Rumah Ibadah & Pesantren', 'rumah-ibadah', 'Landmark', 'Pembangunan, renovasi masjid pelosok, sarana wudhu, dan santri penghafal Quran'),
  ('c6666666-6666-6666-6666-666666666666', 'Difabel & Lansia', 'difabel', 'Accessibility', 'Penyediaan kursi roda, alat bantu dengar, dan santunan lansia terlantar'),
  ('c7777777-7777-7777-7777-777777777777', 'Kemanusiaan Umum', 'kemanusiaan', 'Users', 'Paket sembako dhuafa, bantuan modal usaha mikro mustahik, air bersih'),
  ('c8888888-8888-8888-8888-888888888888', 'Peduli Lingkungan', 'lingkungan', 'Trees', 'Penanaman pohon mangrove penahan abrasi, konservasi mata air desa')
on conflict (slug) do nothing;

-- 2. Insert Platform Settings Default
insert into public.platform_settings (key, value) values
  ('bank_transfer_official', '{
    "bank_name": "BCA",
    "account_number": "1234567890",
    "account_holder": "Yayasan DonasiUmat Indonesia"
  }'::jsonb),
  ('whatsapp_templates', '{
    "donation_verified": "Halo Sahabat Umat, donasi Anda sebesar {{amount}} untuk kampanye {{campaign_title}} telah diverifikasi. Terima kasih atas kebaikannya. — DonasiUmat",
    "campaign_update_posted": "Sahabat Umat, penggalang kampanye {{campaign_title}} yang Anda dukung baru saja mengunggah kabar perkembangan terbaru: {{update_title}}. Cek selengkapnya di aplikasi DonasiUmat."
  }'::jsonb)
on conflict (key) do nothing;
