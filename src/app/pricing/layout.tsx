"use client";

import { useTheme } from "next-themes";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {

    let { theme } = useTheme();
  
    if (theme === null || theme === undefined || !theme || theme === "system") {
      theme = "dark";
    }

  return (
      <div 
      style={{
        backgroundImage: `url('/blur-glow-pry-gh.svg')`,
        backgroundSize: "cover",
        backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.5)" : "",
      }} 
      >
        {children}
      </div>
  );
}