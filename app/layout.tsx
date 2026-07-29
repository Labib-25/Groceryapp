import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/lib/app-state";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0d9488",
};

export const metadata: Metadata = {
  applicationName: "BasketWise",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BasketWise",
  },
  title: "BasketWise — the cheapest way to do your whole shop",
  description:
    "Compare live grocery prices across UK supermarkets, build one list, and find the cheapest practical way to complete your entire shop — not just single bargains.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans min-h-screen flex flex-col">
        <AppStateProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppStateProvider>
      </body>
    </html>
  );
}
