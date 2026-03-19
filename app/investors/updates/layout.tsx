import type { Metadata } from "next";
import { metadataBase } from "@/lib/metadata-base";
import { getTierOneLocale } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";

const metadataCopy = {
  "en-US": {
    title: "Investor Updates — LeetGaming.PRO | Esports Competition Platform",
    description:
      "Latest updates, milestones, and announcements for LeetGaming.PRO investors and stakeholders.",
    ogTitle: "Investor Updates — LeetGaming.PRO",
    ogDescription: "Latest investor updates and milestone announcements",
  },
  "pt-BR": {
    title:
      "Atualizações para investidores — LeetGaming.PRO | Plataforma de competições esports",
    description:
      "Últimas atualizações, marcos e anúncios para investidores e stakeholders da LeetGaming.PRO.",
    ogTitle: "Atualizações para investidores — LeetGaming.PRO",
    ogDescription:
      "Últimas atualizações para investidores e anúncios de marcos",
  },
  "es-ES": {
    title:
      "Actualizaciones para inversores — LeetGaming.PRO | Plataforma de competición esports",
    description:
      "Últimas actualizaciones, hitos y anuncios para inversores y stakeholders de LeetGaming.PRO.",
    ogTitle: "Actualizaciones para inversores — LeetGaming.PRO",
    ogDescription:
      "Últimas actualizaciones para inversores y anuncios de hitos",
  },
  "es-LA": {
    title:
      "Actualizaciones para inversionistas — LeetGaming.PRO | Plataforma de competencias esports",
    description:
      "Últimas actualizaciones, hitos y anuncios para inversionistas y stakeholders de LeetGaming.PRO.",
    ogTitle: "Actualizaciones para inversionistas — LeetGaming.PRO",
    ogDescription:
      "Últimas actualizaciones para inversionistas y anuncios de hitos",
  },
  "zh-CN": {
    title: "投资者更新 — LeetGaming.PRO | 电竞竞技平台",
    description:
      "LeetGaming.PRO 面向投资者和利益相关方的最新进展、里程碑与公告。",
    ogTitle: "投资者更新 — LeetGaming.PRO",
    ogDescription: "最新投资者更新与里程碑公告",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = getTierOneLocale(await getServerLocale());
  const copy = metadataCopy[locale];

  return {
    metadataBase,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      type: "website",
      images: [
        { url: "/investors/og-investors.png", width: 1200, height: 630 },
      ],
    },
    robots: "index, follow",
  };
}

export default function InvestorUpdatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
