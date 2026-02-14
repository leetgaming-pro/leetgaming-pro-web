export default function SubmitReplayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 px-4">
      <div className="w-full max-w-4xl">{children}</div>
    </section>
  );
}
