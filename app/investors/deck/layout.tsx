import type { Metadata } from "next";
import { metadataBase } from "@/lib/metadata-base";
import { getTierOneLocale } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";

const metadataCopy = {
  "en-US": {
    title: "Pitch Deck — LeetGaming.PRO | Esports Competition Platform",
    description:
      "Interactive investor deck for LeetGaming.PRO — the esports competition platform combining replay analysis, verified scores, matchmaking, tournaments, and prize distribution for 63M+ players.",
    ogTitle: "Pitch Deck — LeetGaming.PRO",
    ogDescription:
      "Interactive investor pitch deck for LeetGaming.PRO and its verified score intelligence infrastructure.",
  },
  "pt-BR": {
    title: "Pitch deck — LeetGaming.PRO | Plataforma de competições esports",
    description:
      "Pitch deck interativo da LeetGaming.PRO — plataforma de competições esports que combina análise de replay, pontuações verificadas, matchmaking, torneios e distribuição de prêmios para mais de 63M de jogadores.",
    ogTitle: "Pitch deck — LeetGaming.PRO",
    ogDescription:
      "Pitch deck interativo para investidores da LeetGaming.PRO e sua infraestrutura de pontuação verificada.",
  },
  "es-ES": {
    title: "Pitch deck — LeetGaming.PRO | Plataforma de competición esports",
    description:
      "Pitch deck interactivo de LeetGaming.PRO, la plataforma de competición esports que combina análisis de replay, puntuaciones verificadas, matchmaking, torneos y distribución de premios para más de 63M de jugadores.",
    ogTitle: "Pitch deck — LeetGaming.PRO",
    ogDescription:
      "Pitch deck interactivo para inversores sobre LeetGaming.PRO y su infraestructura de puntuación verificada.",
  },
  "es-LA": {
    title: "Pitch deck — LeetGaming.PRO | Plataforma de competencias esports",
    description:
      "Pitch deck interactivo de LeetGaming.PRO, la plataforma de competencias esports que combina análisis de replay, puntuaciones verificadas, matchmaking, torneos y distribución de premios para más de 63M de jugadores.",
    ogTitle: "Pitch deck — LeetGaming.PRO",
    ogDescription:
      "Pitch deck interactivo para inversionistas sobre LeetGaming.PRO y su infraestructura de puntuación verificada.",
  },
  "zh-CN": {
    title: "投资者演示文稿 — LeetGaming.PRO | 电竞竞技平台",
    description:
      "LeetGaming.PRO 互动式投资者演示文稿：展示集回放分析、经验证比分、匹配、赛事与奖金分发于一体的电竞竞技平台，覆盖 6300 多万玩家。",
    ogTitle: "投资者演示文稿 — LeetGaming.PRO",
    ogDescription:
      "LeetGaming.PRO 及其经验证比分基础设施的互动式投资者演示文稿。",
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
    twitter: {
      card: "summary_large_image",
      title: copy.ogTitle,
      description: copy.ogDescription,
    },
    robots: "index, follow",
  };
}

export default function PitchDeckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
