import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free, Pro & Agency Plans",
  description:
    "Simple pricing for startup founders. Start free with 3 design audits per month. Upgrade to Pro for unlimited audits, PDF exports, and weekly re-scans from $15/mo. Pay by card, PayPal, or GCash.",
  alternates: { canonical: "/pricing" },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
