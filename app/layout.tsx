import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
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
  icons: {
    icon: "/splash-icon.png",
  },
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
      <body className="min-h-full bg-[#F6F0ED] text-[#326273]">
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
