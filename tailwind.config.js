const { nextui } = require('@nextui-org/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'blur-glow-pry-gh' : "url('./blur-glow-pry-gh.svg')",
      }
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            // background: "#FFFFFF", // or DEFAULT
            // foreground: "#11181C", // or 50 to 900 DEFAULT
            secondary: "#FF4654",
            // primary: "#34445C",

            // primary: "#34445C",
            // foreground: "#34445C",

            primary: {
              // ... 50 to 900
              foreground: "#F2F2F2",
              DEFAULT: "#34445C",
            },

            // foreground: "rgb(33, 62, 105)",
            // primary: {
              //... 50 to 900
              // foreground: "#34445C",
              // DEFAULT: "#006FEE",
            // },
            // ... rest of the colors
          },
        },
        dark: {
          colors: {
            // background: "#000000", // or DEFAULT
            // foreground: "#ECEDEE", // or 50 to 900 DEFAULT
            // secondary: "#FFC700",
            secondary: "#DCFF37",
            // primary: "#DCFF37",
            primary: {
              // ... 50 to 900
              foreground: "#333",
              DEFAULT: "#DCFF37",
            },
          },
          // ... rest of the colors
        },
      },
    }),
  ],
}
