-- =====================================================
-- DONASIUMAT DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Standardized schema strictly based on PRD Bab 10
-- =====================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================
-- 1. PROFILES
-- =====================================================
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

-- =====================================================
-- 2. IDENTITY_VERIFICATIONS (Tier 1)
-- =====================================================
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

-- =====================================================
-- 3. CATEGORIES
-- =====================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  icon_name text,                           -- nama icon Lucide
  description text,
  created_at timestamptz not null default now()
);

-- =====================================================
-- 4. CAMPAIGNS (Tier 2)
-- =====================================================
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

-- =====================================================
-- 5. CAMPAIGN_UPDATES (Kabar Terbaru)
-- =====================================================
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

-- =====================================================
-- 6. DONATIONS (Transfer Manual)
-- =====================================================
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
  prayer_message text,                      -- doa/pesan donatur (maks 500)
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

-- =====================================================
-- 7. TRANSPARENCY_REPORTS
-- =====================================================
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

-- =====================================================
-- 8. WITHDRAWALS (Pencairan Dana)
-- =====================================================
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
  transfer_proof_url text,                  -- bukti transfer dari admin
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  transferred_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_withdrawal_campaign on public.withdrawals(campaign_id);

-- =====================================================
-- 9. NOTIFICATIONS
-- =====================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,                       -- campaign_update | donation_verified | dst.
  title text not null,
  message text not null,
  link_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_notification_user on public.notifications(user_id, is_read);

-- =====================================================
-- 10. WHATSAPP_LOGS
-- =====================================================
create table if not exists public.whatsapp_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  phone_wa text not null,
  template_key text not null,               -- donation_verified | identity_approved | dst.
  payload jsonb not null,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed')),
  retry_count integer not null default 0,
  provider_response jsonb,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

-- =====================================================
-- 11. AUDIT_LOGS (Immutable)
-- =====================================================
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id),
  actor_role text not null,
  action text not null,                     -- create | update | delete | approve | reject | verify | publish
  entity_type text not null,                -- campaign | donation | withdrawal | transparency_report | user | identity
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

-- =====================================================
-- 12. PLATFORM_SETTINGS
-- =====================================================
create table if not exists public.platform_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- =====================================================
-- Triggers: updated_at
-- =====================================================
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

-- =====================================================
-- Auth Hook: Auto create Profile on user signup
-- =====================================================
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

-- Trigger to execute on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================
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

-- PROFILES RLS
create policy "profiles_public_read" on public.profiles
  for select using (true);
create policy "profiles_user_update_own" on public.profiles
  for update using (auth.uid() = id);

-- CATEGORIES RLS (Public Read, Admin All)
create policy "categories_public_read" on public.categories
  for select using (true);

-- CAMPAIGNS RLS
create policy "campaigns_public_read_active" on public.campaigns
  for select using (status in ('active', 'completed', 'closed') or auth.uid() = fundraiser_id);
create policy "campaigns_fundraiser_insert" on public.campaigns
  for insert with check (auth.uid() = fundraiser_id);
create policy "campaigns_fundraiser_update_own" on public.campaigns
  for update using (auth.uid() = fundraiser_id);

-- CAMPAIGN UPDATES RLS
create policy "updates_public_read" on public.campaign_updates
  for select using (true);
create policy "updates_author_insert" on public.campaign_updates
  for insert with check (auth.uid() = author_id);

-- DONATIONS RLS
create policy "donations_donor_read_own" on public.donations
  for select using (auth.uid() = donor_id);
create policy "donations_fundraiser_read_campaign" on public.donations
  for select using (
    exists (select 1 from public.campaigns c where c.id = campaign_id and c.fundraiser_id = auth.uid())
  );
create policy "donations_insert_authenticated" on public.donations
  for insert with check (auth.uid() = donor_id);

-- TRANSPARENCY REPORTS RLS
create policy "transparency_public_read_published" on public.transparency_reports
  for select using (status = 'published' or auth.uid() = author_id);
create policy "transparency_fundraiser_insert" on public.transparency_reports
  for insert with check (auth.uid() = author_id);

-- WITHDRAWALS RLS
create policy "withdrawals_fundraiser_read_own" on public.withdrawals
  for select using (auth.uid() = fundraiser_id);
create policy "withdrawals_fundraiser_insert" on public.withdrawals
  for insert with check (auth.uid() = fundraiser_id);

-- NOTIFICATIONS RLS
create policy "notifications_user_read_own" on public.notifications
  for select using (auth.uid() = user_id);
create policy "notifications_user_update_own" on public.notifications
  for update using (auth.uid() = user_id);

-- IDENTITY VERIFICATIONS RLS
create policy "identity_user_read_own" on public.identity_verifications
  for select using (auth.uid() = user_id);
create policy "identity_user_insert" on public.identity_verifications
  for insert with check (auth.uid() = user_id);

-- AUDIT LOGS RLS (Admin Only)
create policy "audit_logs_admin_read" on public.audit_logs
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- PLATFORM SETTINGS RLS
create policy "platform_settings_public_read" on public.platform_settings
  for select using (true);
