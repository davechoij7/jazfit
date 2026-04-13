import type { Metadata, Viewport } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JazFit",
  description: "Your smart workout companion",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JazFit",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FBF0F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${dmSans.variable} ${dmSerifDisplay.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-dvh flex flex-col font-sans">
        <div
          aria-hidden="true"
          className="fixed inset-0"
          style={{
            zIndex: -1,
            backgroundImage:
              "linear-gradient(rgba(251,240,240,0.45),rgba(251,240,240,0.45)),url('/background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {children}
      </body>
    </html>
  );
}
