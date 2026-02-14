import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Subscription - LeetGaming Pro',
  description: 'Manage your subscription, billing, and payment history',
};

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
