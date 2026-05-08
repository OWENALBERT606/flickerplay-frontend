import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "FlickerPlay | Every frame, your way.",
    template: "%s | FlickerPlay",
  },
  description: "Stream unlimited movies, TV series, and documentaries in HD quality. Watch anywhere, anytime on FlickerPlay - your ultimate destination for entertainment.",
  keywords: ["movies", "streaming", "TV series", "documentaries", "watch online", "HD movies", "free streaming"],
  authors: [{ name: "FlickerPlay" }],
  creator: "FlickerPlay",
  publisher: "FlickerPlay",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FlickerPlay",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "FlickerPlay",
    title: "FlickerPlay | Every frame, your way.",
    description: "Stream unlimited movies, TV series, and documentaries in HD quality.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "FlickerPlay" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlickerPlay | Every frame, your way.",
    description: "Stream unlimited movies, TV series, and documentaries in HD quality.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Toaster position="top-center" richColors />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}