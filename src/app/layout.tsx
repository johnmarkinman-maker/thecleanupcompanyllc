import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { BUSINESS, SITE_URL } from "@/lib/site";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Post-Construction & Commercial Cleaning | The Cleanup Company",
    template: "%s | The Cleanup Company",
  },
  description:
    "Turnover-ready post-construction and commercial cleaning for general contractors and property managers in Greater Nashville, Middle Tennessee and Central Pennsylvania.",
  applicationName: BUSINESS.name,
  openGraph: {
    type: "website",
    siteName: BUSINESS.name,
    locale: "en_US",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Technician detailing glass in a finished commercial space" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#F5F6F3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${plexMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
