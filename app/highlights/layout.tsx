"use client";

/**
 * Highlights Layout
 * Provides a minimal dark container for the highlights showcase
 */

export default function HighlightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] via-[#121212] to-[#0a0a0a]">
      {children}
    </div>
  );
}