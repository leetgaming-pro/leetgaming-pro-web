import { Metadata } from "next";

export const metadata: Metadata = {
	title: "For Investors — LeetGaming.PRO | Esports Competition Platform",
	description:
		"Invest in the all-in-one esports competition platform. Replay analysis, skill-based matchmaking, tournaments, and transparent prize distribution for 63M+ competitive FPS players. $21.9B TAM.",
	openGraph: {
		title: "For Investors — LeetGaming.PRO",
		description:
			"The all-in-one esports platform: Compete · Analyze · Earn. $21.9B total addressable market, 63M+ competitive FPS players.",
		type: "website",
		images: [
			{
				url: "/investors/og-investors.png",
				width: 1200,
				height: 630,
				alt: "LeetGaming.PRO Investment Opportunity",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "For Investors — LeetGaming.PRO",
		description:
			"The all-in-one esports platform: Compete · Analyze · Earn. $21.9B TAM.",
	},
	robots: "index, follow",
};

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
