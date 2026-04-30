import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RepuMint — Get More Reviews, Protect Your Reputation",
    template: "%s | RepuMint",
  },
  description:
    "Send review requests after every visit. Happy customers go to Google, Yelp, or Facebook. Unhappy ones go to a private form — you get notified instantly. Built for local businesses.",
  keywords: ["reputation management", "review generation", "Google reviews", "local business", "review requests", "sentiment filter", "Yelp reviews"],
  authors: [{ name: "RepuMint" }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://repumint.com"
  ),
  openGraph: {
    type: "website",
    siteName: "RepuMint",
    title: "RepuMint — Get More Reviews, Protect Your Reputation",
    description: "Send review requests after every visit. Happy customers go to Google, Yelp, or Facebook. Unhappy ones stay private.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepuMint",
    description: "Turn happy customers into 5-star reviews.",
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1B3E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full`}>
      <body className="min-h-full antialiased">{children}</body>
    </html>
  );
}
