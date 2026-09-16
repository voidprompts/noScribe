import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Upgrade your DesignCheck AI plan. Pay by card, PayPal, or GCash.",
  robots: { index: false },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
