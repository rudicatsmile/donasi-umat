-- Migration: 20260924_pledges_and_zakat.sql
-- Description: Adds tables for Sedekah Subuh Pledge (Pre-Funded Balance) and Zakat Distribution

-- 1. Table: sedekah_subuh_pledges
CREATE TABLE IF NOT EXISTS public.sedekah_subuh_pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_amount INTEGER NOT NULL DEFAULT 10000 CHECK (daily_amount >= 1000),
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
    preferred_category VARCHAR(50) DEFAULT 'all',
    prayer_message TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_disbursed_at TIMESTAMPTZ,
    total_days_donated INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT user_single_pledge UNIQUE (user_id)
);

-- 2. Table: zakat_records (for tracking official BSZ - Bukti Setor Zakat)
CREATE TABLE IF NOT EXISTS public.zakat_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bsz_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    muzakki_name VARCHAR(255) NOT NULL,
    muzakki_phone VARCHAR(50),
    muzakki_email VARCHAR(255),
    zakat_type VARCHAR(50) NOT NULL CHECK (zakat_type IN ('penghasilan', 'maal', 'emas')),
    gross_amount BIGINT NOT NULL,
    nisab_reference BIGINT NOT NULL,
    zakat_due_amount BIGINT NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'verified',
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pledges_active ON public.sedekah_subuh_pledges(is_active, balance);
CREATE INDEX IF NOT EXISTS idx_zakat_user ON public.zakat_records(user_id);
CREATE INDEX IF NOT EXISTS idx_zakat_bsz ON public.zakat_records(bsz_number);

-- RLS
ALTER TABLE public.sedekah_subuh_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zakat_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own pledge"
ON public.sedekah_subuh_pledges FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view valid BSZ"
ON public.zakat_records FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert zakat records"
ON public.zakat_records FOR INSERT
WITH CHECK (true);
