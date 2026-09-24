-- ==============================================================================
-- DONASIUMAT: UNIFIED DATABASE MIGRATION & SEED SCRIPT
-- Project Ref: kgtjqdujfaljbrretjkx
-- ==============================================================================

-- 0. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. PROFILES (Users Profile linked with auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone_wa text,                             -- format +62
  avatar_url text,
  role text not null default 'donor'
    check (role in ('donor', 'fundraiser', 'admin')),
  is_verified boolean not null default false,
  suspended_at timestamptz,
  suspended_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 2. IDENTITY_VERIFICATIONS (Tier 1 KYC Fundraiser)
-- ==============================================================================
create table if not exists public.identity_verifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  id_type text not null check (id_type in ('ktp', 'sim', 'passport')),
  id_number_hash text not null,             -- hashed (bcrypt/aes)
  id_number_masked text not null,           -- contoh: 3201****1234
  full_name_on_id text not null,
  address text not null,
  bank_name text not null,
  bank_account_number text not null,
  bank_account_holder text not null,
  id_photo_url text not null,               -- storage path verification-docs
  selfie_photo_url text not null,
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_identity_user on public.identity_verifications(user_id);
create index if not exists idx_identity_status on public.identity_verifications(status);

-- ==============================================================================
-- 3. CATEGORIES
-- ==============================================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  icon_name text,                           -- nama icon Lucide
  description text,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. CAMPAIGNS (Tier 2 Fundraiser)
-- ==============================================================================
create table if not exists public.campaigns (
  id uuid primary key default uuid_generate_v4(),
  fundraiser_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid references public.categories(id),
  title text not null,
  slug text not null unique,
  short_description text,
  story text not null,
  cover_image_url text not null,
  gallery_urls text[] not null default array[]::text[],
  beneficiary_location text not null,       -- Kabupaten/Kota, Provinsi
  target_amount bigint not null check (target_amount >= 1000000),
  collected_amount bigint not null default 0,
  donor_count integer not null default 0,
  deadline date not null,
  status text not null default 'pending_review'
    check (status in ('draft', 'pending_review', 'active', 'rejected', 'completed', 'closed')),
  rejection_reason text,
  is_urgent boolean not null default false,
  published_at timestamptz,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_campaign_fundraiser on public.campaigns(fundraiser_id);
create index if not exists idx_campaign_category on public.campaigns(category_id);
create index if not exists idx_campaign_status on public.campaigns(status);
create index if not exists idx_campaign_slug on public.campaigns(slug);

-- ==============================================================================
-- 5. CAMPAIGN_UPDATES (Kabar Terbaru)
-- ==============================================================================
create table if not exists public.campaign_updates (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  title text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);
create index if not exists idx_update_campaign on public.campaign_updates(campaign_id);

-- ==============================================================================
-- 6. DONATIONS (Manual Transfer & Online)
-- ==============================================================================
create table if not exists public.donations (
  id uuid primary key default uuid_generate_v4(),
  donation_code text not null unique,       -- contoh: DON-2024-0912
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  donor_id uuid not null references public.profiles(id),
  amount bigint not null check (amount >= 10000),
  unique_code integer not null default 0,   -- contoh: 123
  total_transfer bigint not null,           -- amount + unique_code
  bank_destination text not null,
  is_anonymous boolean not null default false,
  is_amount_hidden boolean not null default false,
  prayer_message text,                      -- doa/pesan donatur
  proof_url text,                           -- storage path payment-proofs
  status text not null default 'pending'
    check (status in ('pending', 'waiting_verification', 'verified', 'rejected', 'expired')),
  rejection_reason text,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_donation_campaign on public.donations(campaign_id);
create index if not exists idx_donation_donor on public.donations(donor_id);
create index if not exists idx_donation_status on public.donations(status);

-- ==============================================================================
-- 7. TRANSPARENCY_REPORTS (LPJ / Laporan Penyaluran)
-- ==============================================================================
create table if not exists public.transparency_reports (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  title text not null,
  amount_used bigint not null,
  disbursement_date date not null,
  description text not null,
  beneficiaries text,
  photo_urls text[] not null default array[]::text[],
  status text not null default 'pending_review'
    check (status in ('draft', 'pending_review', 'published', 'rejected')),
  rejection_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_transparency_campaign on public.transparency_reports(campaign_id);

-- ==============================================================================
-- 8. WITHDRAWALS (Pencairan Dana)
-- ==============================================================================
create table if not exists public.withdrawals (
  id uuid primary key default uuid_generate_v4(),
  withdrawal_code text not null unique,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  fundraiser_id uuid not null references public.profiles(id),
  requested_amount bigint not null check (requested_amount >= 100000),
  purpose_description text not null,
  bank_name text not null,
  bank_account_number text not null,
  bank_account_holder text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'transferred')),
  rejection_reason text,
  transfer_proof_url text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  transferred_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_withdrawal_campaign on public.withdrawals(campaign_id);

-- ==============================================================================
-- 9. NOTIFICATIONS
-- ==============================================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  link_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notification_user on public.notifications(user_id, is_read);

-- ==============================================================================
-- 10. WHATSAPP_LOGS
-- ==============================================================================
create table if not exists public.whatsapp_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  phone_wa text not null,
  template_key text not null,
  payload jsonb not null,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed')),
  retry_count integer not null default 0,
  provider_response jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 11. AUDIT_LOGS (Immutable)
-- ==============================================================================
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id),
  actor_role text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  description text,
  before_data jsonb,
  after_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_entity on public.audit_logs(entity_type, entity_id);
create index if not exists idx_audit_actor on public.audit_logs(actor_id);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);

-- ==============================================================================
-- 12. PLATFORM_SETTINGS
-- ==============================================================================
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 13. SEDEKAH_SUBUH_PLEDGES (Fase 4 - Saldo Komitmen Harian)
-- ==============================================================================
create table if not exists public.sedekah_subuh_pledges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  daily_amount integer not null default 10000 check (daily_amount >= 1000),
  balance integer not null default 0 check (balance >= 0),
  preferred_category varchar(50) default 'all',
  prayer_message text,
  is_active boolean not null default true,
  last_disbursed_at timestamptz,
  total_days_donated integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_single_pledge unique (user_id)
);
create index if not exists idx_pledges_active on public.sedekah_subuh_pledges(is_active, balance);

-- ==============================================================================
-- 14. ZAKAT_RECORDS (Fase 4 - Kalkulator & BSZ Bukti Setor Zakat)
-- ==============================================================================
create table if not exists public.zakat_records (
  id uuid primary key default gen_random_uuid(),
  bsz_number varchar(50) unique not null,
  user_id uuid references public.profiles(id) on delete set null,
  muzakki_name varchar(255) not null,
  muzakki_phone varchar(50),
  muzakki_email varchar(255),
  zakat_type varchar(50) not null check (zakat_type in ('penghasilan', 'maal', 'emas')),
  gross_amount bigint not null,
  nisab_reference bigint not null,
  zakat_due_amount bigint not null,
  campaign_id uuid references public.campaigns(id) on delete set null,
  status varchar(50) not null default 'verified',
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists idx_zakat_user on public.zakat_records(user_id);
create index if not exists idx_zakat_bsz on public.zakat_records(bsz_number);

-- ==============================================================================
-- 15. TRIGGERS & FUNCTIONS
-- ==============================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists trg_campaigns_updated on public.campaigns;
create trigger trg_campaigns_updated before update on public.campaigns
  for each row execute procedure public.set_updated_at();

-- Auth Hook: Auto create Profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone_wa, role, is_verified)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Sahabat Umat'),
    new.email,
    new.raw_user_meta_data->>'phone_wa',
    coalesce(new.raw_user_meta_data->>'role', 'donor'),
    false
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.identity_verifications enable row level security;
alter table public.categories enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_updates enable row level security;
alter table public.donations enable row level security;
alter table public.transparency_reports enable row level security;
alter table public.withdrawals enable row level security;
alter table public.notifications enable row level security;
alter table public.whatsapp_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.platform_settings enable row level security;
alter table public.sedekah_subuh_pledges enable row level security;
alter table public.zakat_records enable row level security;

-- PROFILES
drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles for select using (true);

drop policy if exists "profiles_user_update_own" on public.profiles;
create policy "profiles_user_update_own" on public.profiles for update using (auth.uid() = id);

-- CATEGORIES
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories for select using (true);

-- CAMPAIGNS
drop policy if exists "campaigns_public_read_active" on public.campaigns;
create policy "campaigns_public_read_active" on public.campaigns
  for select using (status in ('active', 'completed', 'closed') or auth.uid() = fundraiser_id);

drop policy if exists "campaigns_fundraiser_insert" on public.campaigns;
create policy "campaigns_fundraiser_insert" on public.campaigns
  for insert with check (auth.uid() = fundraiser_id);

drop policy if exists "campaigns_fundraiser_update_own" on public.campaigns;
create policy "campaigns_fundraiser_update_own" on public.campaigns
  for update using (auth.uid() = fundraiser_id);

-- CAMPAIGN UPDATES
drop policy if exists "updates_public_read" on public.campaign_updates;
create policy "updates_public_read" on public.campaign_updates for select using (true);

drop policy if exists "updates_author_insert" on public.campaign_updates;
create policy "updates_author_insert" on public.campaign_updates
  for insert with check (auth.uid() = author_id);

-- DONATIONS
drop policy if exists "donations_donor_read_own" on public.donations;
create policy "donations_donor_read_own" on public.donations
  for select using (auth.uid() = donor_id);

drop policy if exists "donations_fundraiser_read_campaign" on public.donations;
create policy "donations_fundraiser_read_campaign" on public.donations
  for select using (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.fundraiser_id = auth.uid())
  );

drop policy if exists "donations_insert_authenticated" on public.donations;
create policy "donations_insert_authenticated" on public.donations
  for insert with check (auth.uid() = donor_id);

-- TRANSPARENCY REPORTS
drop policy if exists "transparency_public_read_published" on public.transparency_reports;
create policy "transparency_public_read_published" on public.transparency_reports
  for select using (status = 'published' or auth.uid() = author_id);

drop policy if exists "transparency_fundraiser_insert" on public.transparency_reports;
create policy "transparency_fundraiser_insert" on public.transparency_reports
  for insert with check (auth.uid() = author_id);

-- WITHDRAWALS
drop policy if exists "withdrawals_fundraiser_read_own" on public.withdrawals;
create policy "withdrawals_fundraiser_read_own" on public.withdrawals
  for select using (auth.uid() = fundraiser_id);

drop policy if exists "withdrawals_fundraiser_insert" on public.withdrawals;
create policy "withdrawals_fundraiser_insert" on public.withdrawals
  for insert with check (auth.uid() = fundraiser_id);

-- NOTIFICATIONS
drop policy if exists "notifications_user_read_own" on public.notifications;
create policy "notifications_user_read_own" on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists "notifications_user_update_own" on public.notifications;
create policy "notifications_user_update_own" on public.notifications
  for update using (auth.uid() = user_id);

-- IDENTITY VERIFICATIONS
drop policy if exists "identity_user_read_own" on public.identity_verifications;
create policy "identity_user_read_own" on public.identity_verifications
  for select using (auth.uid() = user_id);

drop policy if exists "identity_user_insert" on public.identity_verifications;
create policy "identity_user_insert" on public.identity_verifications
  for insert with check (auth.uid() = user_id);

-- AUDIT LOGS
drop policy if exists "audit_logs_admin_read" on public.audit_logs;
create policy "audit_logs_admin_read" on public.audit_logs
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- PLATFORM SETTINGS
drop policy if exists "platform_settings_public_read" on public.platform_settings;
create policy "platform_settings_public_read" on public.platform_settings
  for select using (true);

-- SEDEKAH SUBUH PLEDGES
drop policy if exists "Users can manage own pledge" on public.sedekah_subuh_pledges;
create policy "Users can manage own pledge" on public.sedekah_subuh_pledges
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ZAKAT RECORDS
drop policy if exists "Public can view valid BSZ" on public.zakat_records;
create policy "Public can view valid BSZ" on public.zakat_records
  for select using (true);

drop policy if exists "Authenticated users can insert zakat records" on public.zakat_records;
create policy "Authenticated users can insert zakat records" on public.zakat_records
  for insert with check (true);

-- ==============================================================================
-- 17. STORAGE BUCKETS SETUP
-- ==============================================================================
insert into storage.buckets (id, name, public)
values 
  ('campaign-images', 'campaign-images', true),
  ('avatars', 'avatars', true),
  ('transparency-reports', 'transparency-reports', true),
  ('verification-docs', 'verification-docs', false),
  ('payment-proofs', 'payment-proofs', false)
on conflict (id) do update set public = excluded.public;

-- Storage RLS: Public Read for Public Buckets
drop policy if exists "Public Access for Public Buckets" on storage.objects;
create policy "Public Access for Public Buckets" on storage.objects
  for select using (bucket_id in ('campaign-images', 'avatars', 'transparency-reports'));

-- Storage RLS: Authenticated Upload
drop policy if exists "Authenticated users can upload objects" on storage.objects;
create policy "Authenticated users can upload objects" on storage.objects
  for insert with check (auth.role() = 'authenticated');

-- Storage RLS: Owner update/delete
drop policy if exists "Users can update own objects" on storage.objects;
create policy "Users can update own objects" on storage.objects
  for update using (auth.uid() = owner);

drop policy if exists "Users can delete own objects" on storage.objects;
create policy "Users can delete own objects" on storage.objects
  for delete using (auth.uid() = owner);

-- ==============================================================================
-- 18. SEED DATA (Categories & Platform Settings)
-- ==============================================================================
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

-- ==============================================================================
-- SELESAI: Migration & Seed Sukses Terpasang
-- ==============================================================================
