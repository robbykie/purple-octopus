import type { Metadata } from "next";
import { JetBrains_Mono, Poppins } from "next/font/google";
import { PortfolioProvider } from "@/hooks/usePortfolio";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

// Self-hosted by Next at build time: no runtime request to a font CDN, which
// suits an app whose whole promise is that it looks nothing up about you.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Northstar — Private Wealth",
  description: "A clear view of what you own, where it is, and how it is moving.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${jetbrainsMono.variable}`}>
      <body>
        <PortfolioProvider>
          <AppShell>{children}</AppShell>
        </PortfolioProvider>
      </body>
    </html>
  );
}
