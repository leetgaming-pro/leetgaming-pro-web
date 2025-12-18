import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coaching Marketplace | LeetGaming.PRO",
  description:
    "Find expert coaches to improve your game. Browse verified coaches, book sessions, and level up your skills.",
};

export default function CoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
