import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | DonasiUmat",
    default: "DonasiUmat — Berbagi Mudah, Amanah Terjaga",
  },
  description:
    "Platform crowdfunding sosial dan galang dana online terpercaya berbasis komunitas dengan verifikasi berlapis, transparansi penyaluran dana berfoto, dan amanah terjaga.",
  keywords: [
    "donasi online",
    "galang dana",
    "crowdfunding indonesia",
    "sedekah online",
    "infaq",
    "bantuan sosial",
    "donasi yatim",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
