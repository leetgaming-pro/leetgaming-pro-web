import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Investor Updates — LeetGaming.PRO | Esports Competition Platform",
  description:
    "Latest updates, milestones, and announcements for LeetGaming.PRO investors and stakeholders.",
  openGraph: {
    title: "Investor Updates — LeetGaming.PRO",
    description: "Latest investor updates and milestone announcements",
    type: "website",
    images: [{ url: "/investors/og-investors.png", width: 1200, height: 630 }],
  },
  robots: "index, follow",
};

export default function InvestorUpdatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
