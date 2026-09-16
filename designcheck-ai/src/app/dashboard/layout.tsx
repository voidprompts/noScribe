import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Your Audit History",
  description:
    "Track every design audit you run: scores over time, open critical issues, and full report history.",
  robots: { index: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
