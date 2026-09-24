export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone_wa: string | null;
          avatar_url: string | null;
          role: "donor" | "fundraiser" | "admin";
          is_verified: boolean;
          suspended_at: string | null;
          suspended_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone_wa?: string | null;
          avatar_url?: string | null;
          role?: "donor" | "fundraiser" | "admin";
          is_verified?: boolean;
          suspended_at?: string | null;
          suspended_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone_wa?: string | null;
          avatar_url?: string | null;
          role?: "donor" | "fundraiser" | "admin";
          is_verified?: boolean;
          suspended_at?: string | null;
          suspended_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon_name: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon_name?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon_name?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          fundraiser_id: string;
          category_id: string | null;
          title: string;
          slug: string;
          short_description: string | null;
          story: string;
          cover_image_url: string;
          gallery_urls: string[];
          beneficiary_location: string;
          target_amount: number;
          collected_amount: number;
          donor_count: number;
          deadline: string;
          status: "draft" | "pending_review" | "active" | "rejected" | "completed" | "closed";
          rejection_reason: string | null;
          is_urgent: boolean;
          published_at: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fundraiser_id: string;
          category_id?: string | null;
          title: string;
          slug: string;
          short_description?: string | null;
          story: string;
          cover_image_url: string;
          gallery_urls?: string[];
          beneficiary_location: string;
          target_amount: number;
          collected_amount?: number;
          donor_count?: number;
          deadline: string;
          status?: "draft" | "pending_review" | "active" | "rejected" | "completed" | "closed";
          rejection_reason?: string | null;
          is_urgent?: boolean;
          published_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          fundraiser_id?: string;
          category_id?: string | null;
          title?: string;
          slug?: string;
          short_description?: string | null;
          story?: string;
          cover_image_url?: string;
          gallery_urls?: string[];
          beneficiary_location?: string;
          target_amount?: number;
          collected_amount?: number;
          donor_count?: number;
          deadline?: string;
          status?: "draft" | "pending_review" | "active" | "rejected" | "completed" | "closed";
          rejection_reason?: string | null;
          is_urgent?: boolean;
          published_at?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      campaign_updates: {
        Row: {
          id: string;
          campaign_id: string;
          author_id: string;
          title: string;
          content: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          author_id: string;
          title: string;
          content: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          author_id?: string;
          title?: string;
          content?: string;
          image_url?: string | null;
          created_at?: string;
        };
      };
      donations: {
        Row: {
          id: string;
          donation_code: string;
          campaign_id: string;
          donor_id: string;
          amount: number;
          unique_code: number;
          total_transfer: number;
          bank_destination: string;
          is_anonymous: boolean;
          is_amount_hidden: boolean;
          prayer_message: string | null;
          proof_url: string | null;
          status: "pending" | "waiting_verification" | "verified" | "rejected" | "expired";
          rejection_reason: string | null;
          verified_by: string | null;
          verified_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          donation_code: string;
          campaign_id: string;
          donor_id: string;
          amount: number;
          unique_code?: number;
          total_transfer: number;
          bank_destination: string;
          is_anonymous?: boolean;
          is_amount_hidden?: boolean;
          prayer_message?: string | null;
          proof_url?: string | null;
          status?: "pending" | "waiting_verification" | "verified" | "rejected" | "expired";
          rejection_reason?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          donation_code?: string;
          campaign_id?: string;
          donor_id?: string;
          amount?: number;
          unique_code?: number;
          total_transfer?: number;
          bank_destination?: string;
          is_anonymous?: boolean;
          is_amount_hidden?: boolean;
          prayer_message?: string | null;
          proof_url?: string | null;
          status?: "pending" | "waiting_verification" | "verified" | "rejected" | "expired";
          rejection_reason?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
      };
      transparency_reports: {
        Row: {
          id: string;
          campaign_id: string;
          author_id: string;
          title: string;
          amount_used: number;
          disbursement_date: string;
          description: string;
          beneficiaries: string | null;
          photo_urls: string[];
          status: "draft" | "pending_review" | "published" | "rejected";
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          author_id: string;
          title: string;
          amount_used: number;
          disbursement_date: string;
          description: string;
          beneficiaries?: string | null;
          photo_urls?: string[];
          status?: "draft" | "pending_review" | "published" | "rejected";
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          campaign_id?: string;
          author_id?: string;
          title?: string;
          amount_used?: number;
          disbursement_date?: string;
          description?: string;
          beneficiaries?: string | null;
          photo_urls?: string[];
          status?: "draft" | "pending_review" | "published" | "rejected";
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
      withdrawals: {
        Row: {
          id: string;
          withdrawal_code: string;
          campaign_id: string;
          fundraiser_id: string;
          requested_amount: number;
          purpose_description: string;
          bank_name: string;
          bank_account_number: string;
          bank_account_holder: string;
          status: "pending" | "approved" | "rejected" | "transferred";
          rejection_reason: string | null;
          transfer_proof_url: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          transferred_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          withdrawal_code: string;
          campaign_id: string;
          fundraiser_id: string;
          requested_amount: number;
          purpose_description: string;
          bank_name: string;
          bank_account_number: string;
          bank_account_holder: string;
          status?: "pending" | "approved" | "rejected" | "transferred";
          rejection_reason?: string | null;
          transfer_proof_url?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          transferred_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          withdrawal_code?: string;
          campaign_id?: string;
          fundraiser_id?: string;
          requested_amount?: number;
          purpose_description?: string;
          bank_name?: string;
          bank_account_number?: string;
          bank_account_holder?: string;
          status?: "pending" | "approved" | "rejected" | "transferred";
          rejection_reason?: string | null;
          transfer_proof_url?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          transferred_at?: string | null;
          created_at?: string;
        };
      };
      identity_verifications: {
        Row: {
          id: string;
          user_id: string;
          id_type: "ktp" | "sim" | "passport";
          id_number_hash: string;
          id_number_masked: string;
          full_name_on_id: string;
          address: string;
          bank_name: string;
          bank_account_number: string;
          bank_account_holder: string;
          id_photo_url: string;
          selfie_photo_url: string;
          status: "pending" | "verified" | "rejected";
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          id_type: "ktp" | "sim" | "passport";
          id_number_hash: string;
          id_number_masked: string;
          full_name_on_id: string;
          address: string;
          bank_name: string;
          bank_account_number: string;
          bank_account_holder: string;
          id_photo_url: string;
          selfie_photo_url: string;
          status?: "pending" | "verified" | "rejected";
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          id_type?: "ktp" | "sim" | "passport";
          id_number_hash?: string;
          id_number_masked?: string;
          full_name_on_id?: string;
          address?: string;
          bank_name?: string;
          bank_account_number?: string;
          bank_account_holder?: string;
          id_photo_url?: string;
          selfie_photo_url?: string;
          status?: "pending" | "verified" | "rejected";
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link_url: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          link_url?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_role: string;
          action: string;
          entity_type: string;
          entity_id: string;
          description: string | null;
          before_data: Json | null;
          after_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_role: string;
          action: string;
          entity_type: string;
          entity_id: string;
          description?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_role?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          description?: string | null;
          before_data?: Json | null;
          after_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      platform_settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
