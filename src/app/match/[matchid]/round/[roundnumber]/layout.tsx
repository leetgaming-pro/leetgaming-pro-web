import RootLayout from '@/components/default-layout/default-layout';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootLayout>
      <div>
        {/* 
          TODO: add filter sidebar / drawer
        */}
        {children}
      </div>
    </RootLayout>
  );
}