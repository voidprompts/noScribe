import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "DesignCheck AI — Free Instant Website Design Audit (Brand + Accessibility)",
    template: "%s | DesignCheck AI",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "website design audit",
    "accessibility checker",
    "WCAG audit tool",
    "brand consistency checker",
    "website accessibility test",
    "AI design review",
    "landing page audit",
    "startup website checker",
    "free design audit",
    "UX audit tool",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "DesignCheck AI — Instant Brand & Accessibility Design Audits",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DesignCheck AI — instant brand and accessibility audits with scored reports",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DesignCheck AI — Instant Brand & Accessibility Design Audits",
    description:
      "Paste a URL, get a scored design audit with WCAG fixes in 30 seconds. Free for founders.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#app`,
      name: SITE_NAME,
      applicationCategory: "DesignApplication",
      operatingSystem: "Web",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      image: `${SITE_URL}/og-image.png`,
      offers: [
        {
          "@type": "Offer",
          name: "Free",
          price: "0",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "15",
          priceCurrency: "USD",
          description: "Unlimited audits, PDF exports, weekly re-scans",
        },
        {
          "@type": "Offer",
          name: "Agency",
          price: "39",
          priceCurrency: "USD",
          description: "Team seats, white-label reports, API access",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "312",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/og-image.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#org` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
