import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout - LeetGaming Pro',
  description: 'Complete your subscription to LeetGaming Pro',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}
