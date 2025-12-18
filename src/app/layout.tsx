import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { cookies } from 'next/headers';
import { PaletteScript } from "@/components/layout/palette-script";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Dashboard Starter Kit",
  description: "A modern, production-ready Next.js dashboard starter kit",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const palette = cookieStore.get('ui.palette')?.value || 'ocean';

  return (
    <html suppressHydrationWarning data-palette={palette}>
      <head>
        <PaletteScript />
      </head>
      <body className={outfit.variable} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
