/**
 * Home Layout
 * Simple wrapper - no RootLayout here since it's already in app/layout.tsx
 */
export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
