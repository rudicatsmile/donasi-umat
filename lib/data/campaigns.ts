import { createClient } from "@/lib/supabase/server";
import {
  DUMMY_CAMPAIGNS,
  DUMMY_CATEGORIES,
  type Campaign,
  type Category,
  type CampaignUpdate,
} from "@/lib/dummy-data";

export interface GetCampaignsOptions {
  categorySlug?: string;
  isUrgent?: boolean;
  status?: string;
  query?: string;
  limit?: number;
}

export async function getCampaigns(options: GetCampaignsOptions = {}): Promise<Campaign[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("campaigns")
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          icon_name
        ),
        profiles!campaigns_fundraiser_id_fkey (
          id,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .order("created_at", { ascending: false });

    if (options.status) {
      q = q.eq("status", options.status as any);
    } else {
      q = q.eq("status", "active");
    }

    if (options.isUrgent !== undefined) {
      q = q.eq("is_urgent", options.isUrgent);
    }

    if (options.limit) {
      q = q.limit(options.limit);
    }

    const { data, error } = await q;

    if (!error && data && (data as any[]).length > 0) {
      return (data as any[]).map((item: any) => {
        const cat = item.categories;
        const profile = item.profiles;

        return {
          id: item.id,
          slug: item.slug,
          title: item.title,
          shortDescription: item.short_description || "",
          story: item.story,
          coverImageUrl: item.cover_image_url,
          galleryUrls: item.gallery_urls || [],
          categoryId: cat?.id || "cat-1",
          categoryName: cat?.name || "Kemanusiaan",
          beneficiaryLocation: item.beneficiary_location,
          targetAmount: Number(item.target_amount),
          collectedAmount: Number(item.collected_amount || 0),
          donorCount: Number(item.donor_count || 0),
          deadline: item.deadline,
          status: item.status,
          isUrgent: Boolean(item.is_urgent),
          fundraiser: {
            id: profile?.id || item.fundraiser_id,
            username: (profile?.full_name || "inisiator").toLowerCase().replace(/\s+/g, ""),
            fullName: profile?.full_name || "Inisiator Berkah",
            avatarUrl: profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
            isVerified: Boolean(profile?.is_verified),
            institution: "Yayasan Sosial",
            totalCampaigns: 1,
            totalFundsRaised: Number(item.collected_amount || 0),
            bio: "Penggalang dana aktif dan amanah.",
            joinedDate: "2024-01-01",
          },
          createdAt: item.created_at,
          publishedAt: item.published_at || item.created_at,
          updates: [],
          transparencyReports: [],
          prayers: [],
        };
      });
    }
  } catch (err) {
    // Fallback to dummy data
  }

  // Graceful Fallback
  let result = [...DUMMY_CAMPAIGNS];

  if (options.isUrgent !== undefined) {
    result = result.filter((c) => c.isUrgent === options.isUrgent);
  }

  if (options.categorySlug) {
    result = result.filter(
      (c) =>
        c.categoryId === options.categorySlug ||
        c.categoryName.toLowerCase().includes(options.categorySlug!.toLowerCase())
    );
  }

  if (options.query) {
    const qLower = options.query.toLowerCase();
    result = result.filter(
      (c) =>
        c.title.toLowerCase().includes(qLower) ||
        c.shortDescription.toLowerCase().includes(qLower) ||
        c.beneficiaryLocation.toLowerCase().includes(qLower)
    );
  }

  if (options.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select(`
        *,
        categories (
          id,
          name,
          slug,
          icon_name
        ),
        profiles!campaigns_fundraiser_id_fkey (
          id,
          full_name,
          avatar_url,
          is_verified
        )
      `)
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single();

    if (!error && data) {
      const d = data as any;
      const cat = d.categories;
      const profile = d.profiles;

      return {
        id: d.id,
        slug: d.slug,
        title: d.title,
        shortDescription: d.short_description || "",
        story: d.story,
        coverImageUrl: d.cover_image_url,
        galleryUrls: d.gallery_urls || [],
        categoryId: cat?.id || "cat-1",
        categoryName: cat?.name || "Kemanusiaan",
        beneficiaryLocation: d.beneficiary_location,
        targetAmount: Number(d.target_amount),
        collectedAmount: Number(d.collected_amount || 0),
        donorCount: Number(d.donor_count || 0),
        deadline: d.deadline,
        status: d.status,
        isUrgent: Boolean(d.is_urgent),
        fundraiser: {
          id: profile?.id || d.fundraiser_id,
          username: (profile?.full_name || "inisiator").toLowerCase().replace(/\s+/g, ""),
          fullName: profile?.full_name || "Inisiator Berkah",
          avatarUrl: profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
          isVerified: Boolean(profile?.is_verified),
          institution: "Yayasan Sosial",
          totalCampaigns: 1,
          totalFundsRaised: Number(d.collected_amount || 0),
          bio: "Penggalang dana aktif dan amanah.",
          joinedDate: "2024-01-01",
        },
        createdAt: d.created_at,
        publishedAt: d.published_at || d.created_at,
        updates: [],
        transparencyReports: [],
        prayers: [],
      };
    }
  } catch (err) {
    // Fallback to dummy data
  }

  const found = DUMMY_CAMPAIGNS.find((c) => c.slug === slug || c.id === slug);
  return found || null;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && (data as any[]).length > 0) {
      return (data as any[]).map((item: any) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        iconName: item.icon_name || "HeartPulse",
        description: item.description || "",
        count: 0,
      }));
    }
  } catch (err) {
    // Fallback
  }

  return DUMMY_CATEGORIES;
}

export async function getCampaignUpdates(campaignId: string): Promise<CampaignUpdate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("campaign_updates")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (!error && data && (data as any[]).length > 0) {
      return (data as any[]).map((item: any) => ({
        id: item.id,
        campaignId: item.campaign_id,
        title: item.title,
        content: item.content,
        imageUrl: item.image_url || undefined,
        createdAt: item.created_at,
        authorName: "Inisiator Berkah",
      }));
    }
  } catch (err) {
    // Fallback
  }

  const found = DUMMY_CAMPAIGNS.find((c) => c.id === campaignId || c.slug === campaignId);
  return found?.updates || [];
}
