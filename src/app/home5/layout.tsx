import ConsoleLayout from '@/components/console-layout/session-console-layout'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConsoleLayout>
      <div>
        {children}
      </div>
    </ConsoleLayout>
  );
}