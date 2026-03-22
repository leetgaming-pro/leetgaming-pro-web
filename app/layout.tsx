import RootLayout from '@/components/default-layout/default-layout';
export { metadata, viewport } from '@/components/default-layout/default-layout';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout>
      <div>
        {children}
      </div>
    </RootLayout>
  );
}