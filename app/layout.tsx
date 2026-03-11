import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Parker — Luxury Rentals at Yonge + Eglinton, Toronto",
  description:
    "Parker is a 38-storey luxury rental tower at Yonge + Eglinton in Toronto. 349 suites, LIDO infinity pool, Nordic spa, 9' ceilings, KitchenAid® appliances. Represented by Team Nagpal.",
  openGraph: {
    title: "Parker — Luxury Rentals at Yonge + Eglinton",
    description: "Forget what you know about rental living.",
    siteName: "Parker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${cormorant.variable} ${jakarta.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
