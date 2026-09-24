import { getCampaigns, getCategories } from "@/lib/data/campaigns";
import { Badge } from "@/components/ui/badge";
import { CampaignListContent } from "@/components/campaign/campaign-list-content";

export const metadata = {
  title: "Katalog Kampanye Kebaikan | DonasiUmat",
  description: "Daftar program galang dana terverifikasi, amanah, dan transparan di DonasiUmat.",
};

export default async function CampaignListPage() {
  const [campaigns, categories] = await Promise.all([
    getCampaigns(),
    getCategories(),
  ]);

  return (
    <div className="py-10 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="default" className="text-xs">Katalog Kampanye Kebaikan</Badge>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Pilih & Bantu Saudara Kita Hari Ini
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Temukan kampanye terverifikasi yang membutuhkan dukungan doa dan donasi Anda. Seluruh penyaluran dipantau transparan.
          </p>
        </div>

        {/* Interactive Filtered List */}
        <CampaignListContent initialCampaigns={campaigns} categories={categories} />
      </div>
    </div>
  );
}
