import { Fira_Code as FontMono, Inter as FontSans, Press_Start_2P, Kode_Mono, Quicksand, Saira_Condensed, Six_Caps, Economica, Big_Shoulders_Display, Electrolize } from "next/font/google"

export const fontSans = FontSans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
})

export const fontMono = FontMono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
})

fontSans.className = "font-sans antialiased"

export const pressStart2P = fontSans

export const sairaCondensed = Saira_Condensed({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-saira-condensed",
})

export const sixCaps = Six_Caps({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-six-caps",
})

export const economica = Economica({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-economica",
})


export const bigShouldersDisplay = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-big-shoulders-display",
})

export const electrolize = Electrolize({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-electrolize",
})

electrolize.className = String(electrolize)

// Quicksand({
//   subsets: ["latin-ext"],
//   weight: "400",
// })

// export const kodeMono =
// }) //Kode_Mono({ subsets: ['latin'], weight: "400" });//Press_Start_2P({ subsets: ['cyrillic'], weight: "400" }); 

// export const kodeMono = Kode_Mono({ subsets: ['latin'], weight: "400" });