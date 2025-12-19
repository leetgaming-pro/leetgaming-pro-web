import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Status & Platform Overview | LeetGaming.PRO",
  description:
    "Real-time service status, development progress, and roadmap for the LeetGaming.PRO esports platform. Enterprise-grade infrastructure with bank-level security.",
  keywords: [
    "leetgaming",
    "esports",
    "service status",
    "platform status",
    "uptime",
    "infrastructure",
    "development progress",
    "roadmap",
  ],
  openGraph: {
    title: "System Status & Platform Overview | LeetGaming.PRO",
    description:
      "Real-time service status, development progress, and roadmap for the LeetGaming.PRO esports platform.",
    type: "website",
    siteName: "LeetGaming.PRO",
  },
  twitter: {
    card: "summary_large_image",
    title: "System Status & Platform Overview | LeetGaming.PRO",
    description:
      "Real-time service status, development progress, and roadmap for the LeetGaming.PRO esports platform.",
  },
};

export default function ServiceStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

