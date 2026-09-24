import { PublicNavbar } from "@/components/layouts/public-navbar";
import { PublicFooter } from "@/components/layouts/public-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://donasiumat.id/#organization",
        name: "DonasiUmat",
        url: "https://donasiumat.id",
        logo: {
          "@type": "ImageObject",
          url: "https://donasiumat.id/images/donasiumat-logo.png",
          caption: "DonasiUmat Logo",
        },
        description: "Platform Galang Dana & Donasi Online Terpercaya dengan Transparansi 100% dan Verifikasi Bertingkat.",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+62-812-3456-7890",
          contactType: "customer service",
          areaServed: "ID",
          availableLanguage: ["id", "en"],
        },
        sameAs: [
          "https://instagram.com/donasiumat",
          "https://facebook.com/donasiumat",
          "https://twitter.com/donasiumat",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://donasiumat.id/#website",
        url: "https://donasiumat.id",
        name: "DonasiUmat",
        publisher: {
          "@id": "https://donasiumat.id/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: "https://donasiumat.id/kampanye?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
