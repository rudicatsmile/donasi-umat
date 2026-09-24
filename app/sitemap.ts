import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { DUMMY_CAMPAIGNS } from "@/lib/dummy-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://donasiumat.id";

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kampanye`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sedekah-subuh`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/zakat`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/kontak`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/syarat-ketentuan`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic campaign routes
  let campaignRoutes: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const { data: dbCampaigns } = await supabase
      .from("campaigns")
      .select("slug, updated_at, created_at")
      .eq("status", "active");

    const campaignList = dbCampaigns && dbCampaigns.length > 0
      ? dbCampaigns
      : DUMMY_CAMPAIGNS.filter((c) => c.status === "active").map((c) => ({
          slug: c.slug,
          updated_at: c.createdAt,
          created_at: c.createdAt,
        }));

    campaignRoutes = campaignList.map((c: any) => ({
      url: `${baseUrl}/kampanye/${c.slug}`,
      lastModified: new Date(c.updated_at || c.created_at || Date.now()),
      changeFrequency: "daily",
      priority: 0.8,
    }));
  } catch (err) {
    console.warn("Failed to generate campaign sitemap dynamic list:", err);
    campaignRoutes = DUMMY_CAMPAIGNS.map((c) => ({
      url: `${baseUrl}/kampanye/${c.slug}`,
      lastModified: new Date(c.createdAt),
      changeFrequency: "daily",
      priority: 0.8,
    }));
  }

  return [...staticRoutes, ...campaignRoutes];
}
