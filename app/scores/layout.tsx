import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Results | LeetGaming.PRO",
  description: "View match results, scores, verification status, and prize distribution for competitive esports matches.",
};

export default function ScoresLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
