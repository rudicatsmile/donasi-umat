import { notFound } from "next/navigation";
import { getCampaignBySlug, getCampaignUpdates } from "@/lib/data/campaigns";
import { getDonationsByCampaign } from "@/lib/data/donations";
import { getTransparencyReports } from "@/lib/data/transparency";
import { CampaignDetailContent } from "@/components/campaign/campaign-detail-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) {
    return { title: "Kampanye Tidak Ditemukan | DonasiUmat" };
  }

  return {
    title: `${campaign.title} | DonasiUmat`,
    description: campaign.shortDescription || campaign.story.slice(0, 150),
    openGraph: {
      title: campaign.title,
      description: campaign.shortDescription,
      images: [campaign.coverImageUrl],
    },
  };
}

export default async function CampaignDetailPage(props: PageProps) {
  const params = await props.params;
  const campaign = await getCampaignBySlug(params.slug);

  if (!campaign) {
    notFound();
  }

  const [updates, donations, reports] = await Promise.all([
    getCampaignUpdates(campaign.id),
    getDonationsByCampaign(campaign.id),
    getTransparencyReports(campaign.id),
  ]);

  const campaignJsonLd = {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: campaign.title,
    description: campaign.shortDescription || campaign.story.slice(0, 160),
    image: campaign.coverImageUrl,
    recipient: {
      "@type": "Person",
      name: campaign.fundraiser.fullName,
    },
    startTime: campaign.createdAt,
    endTime: campaign.deadline,
    target: `https://donasiumat.id/donasi/${campaign.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(campaignJsonLd) }}
      />
      <CampaignDetailContent
        campaign={campaign}
        updates={updates}
        donations={donations}
        reports={reports}
      />
    </>
  );
}
