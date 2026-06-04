import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import ThemeInitScript from "@/components/ThemeInitScript";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";
import { Providers } from "./providers";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Splash - An Engine For Cross Border Payment",
  description: "The Stripe of SEA. Cross-border settlement on Sui.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable} h-full font-sans antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full splash-page-bg text-[#326273]">
        <ThemeInitScript />
        <ThemeProvider>
          <Providers>{children}</Providers>
          <FloatingThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
