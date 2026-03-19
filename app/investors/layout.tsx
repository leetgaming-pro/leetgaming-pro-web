import { Metadata } from "next";
import { metadataBase } from "@/lib/metadata-base";
import { getTierOneLocale } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";

const metadataCopy = {
  "en-US": {
    title: "For Investors — LeetGaming.PRO | Esports Competition Platform",
    description:
      "Invest in the all-in-one esports competition platform. Replay analysis, skill-based matchmaking, tournaments, and transparent prize distribution for 63M+ competitive FPS players. $21.9B TAM.",
    ogTitle: "For Investors — LeetGaming.PRO",
    ogDescription:
      "The all-in-one esports platform: Compete · Analyze · Earn. $21.9B total addressable market, 63M+ competitive FPS players.",
    imageAlt: "LeetGaming.PRO Investment Opportunity",
  },
  "pt-BR": {
    title:
      "Para investidores — LeetGaming.PRO | Plataforma de competições esports",
    description:
      "Invista na plataforma completa de competições esports. Análise de replay, matchmaking por habilidade, torneios e distribuição transparente de prêmios para 63M+ jogadores competitivos de FPS. TAM de $21,9B.",
    ogTitle: "Para investidores — LeetGaming.PRO",
    ogDescription:
      "A plataforma completa de esports: Competir · Analisar · Ganhar. Mercado endereçável total de $21,9B e mais de 63M de jogadores competitivos.",
    imageAlt: "Oportunidade de investimento da LeetGaming.PRO",
  },
  "es-ES": {
    title:
      "Para inversores — LeetGaming.PRO | Plataforma de competición esports",
    description:
      "Invierte en la plataforma integral de competición esports. Análisis de replay, matchmaking por habilidad, torneos y distribución transparente de premios para más de 63M de jugadores competitivos de FPS. TAM de $21,9B.",
    ogTitle: "Para inversores — LeetGaming.PRO",
    ogDescription:
      "La plataforma integral de esports: Competir · Analizar · Ganar. Mercado total direccionable de $21,9B y más de 63M de jugadores competitivos.",
    imageAlt: "Oportunidad de inversión de LeetGaming.PRO",
  },
  "es-LA": {
    title:
      "Para inversionistas — LeetGaming.PRO | Plataforma de competencias esports",
    description:
      "Invierte en la plataforma integral de competencias esports. Análisis de replay, matchmaking por habilidad, torneos y distribución transparente de premios para más de 63M de jugadores competitivos de FPS. TAM de $21.9B.",
    ogTitle: "Para inversionistas — LeetGaming.PRO",
    ogDescription:
      "La plataforma integral de esports: Competir · Analizar · Ganar. Mercado total direccionable de $21.9B y más de 63M de jugadores competitivos.",
    imageAlt: "Oportunidad de inversión de LeetGaming.PRO",
  },
  "zh-CN": {
    title: "投资者页面 — LeetGaming.PRO | 电竞竞技平台",
    description:
      "投资于一体化电竞竞技平台。面向 6300 多万竞技 FPS 玩家，提供回放分析、基于技能的匹配、赛事与透明奖金分发。总可服务市场达 $21.9B。",
    ogTitle: "投资者页面 — LeetGaming.PRO",
    ogDescription:
      "一体化电竞平台：竞争 · 分析 · 收益。总可服务市场 $21.9B，覆盖 6300 多万竞技 FPS 玩家。",
    imageAlt: "LeetGaming.PRO 投资机会",
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
        {
          url: "/investors/og-investors.png",
          width: 1200,
          height: 630,
          alt: copy.imageAlt,
        },
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

export default function InvestorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center w-full">
      <div className="w-full">{children}</div>
    </section>
  );
}
