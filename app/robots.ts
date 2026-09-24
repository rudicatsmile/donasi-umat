import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://donasiumat.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/kampanye",
          "/kampanye/",
          "/tentang-kami",
          "/kontak",
          "/syarat-ketentuan",
          "/kebijakan-privasi",
          "/penggalang/",
        ],
        disallow: [
          "/admin/",
          "/dashboard/",
          "/galang-dana/",
          "/donasi/instruksi/",
          "/api/",
          "/auth/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/galang-dana/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
