import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Started | LeetGaming',
  description: 'Set up your LeetGaming account and start your competitive gaming journey',
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
