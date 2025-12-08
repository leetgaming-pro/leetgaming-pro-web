const { nextui } = require('@nextui-org/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'blur-glow-pry-gh' : "url('./blur-glow-pry-gh.svg')",
      },
      colors: {
        // LeetGaming Brand Colors - Single source of truth
        'leet': {
          'navy': '#34445C',
          'navy-dark': '#1e2a38',
          'lime': '#DCFF37',
          'orange': '#FF4654',
          'gold': '#FFC700',
          'cream': '#F5F0E1', // Brand white - use instead of pure white
          'black': '#0a0a0a',
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            background: "#F5F0E1", // Cream background
            foreground: "#34445C", // Navy text
            secondary: "#FF4654",
            primary: {
              foreground: "#F5F0E1", // Cream text on primary
              DEFAULT: "#34445C",
            },
          },
        },
        dark: {
          colors: {
            background: "#0a0a0a", // Rich black
            foreground: "#F5F0E1", // Cream text
            secondary: "#DCFF37",
            primary: {
              foreground: "#34445C", // Navy text on lime
              DEFAULT: "#DCFF37",
            },
          },
        },
      },
    }),
  ],
}
