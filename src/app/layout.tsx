import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";

import "@/app/globals.css";
import { ThemeHydrator } from "@/components/theme-hydrator";

export const metadata: Metadata = {
  metadataBase: new URL("https://unisurvive.local"),
  title: {
    default: "UniSurvive",
    template: "%s | UniSurvive"
  },
  description: "Jegyzetek, ZH tippek, tárgytapasztalatok és túlélő infók magyar egyetemistáknak egy helyen.",
  icons: {
    icon: [
      { url: "/startlogo.png?v=2", sizes: "512x512", type: "image/png" },
      { url: "/icon.png?v=2", sizes: "512x512", type: "image/png" }
    ],
    shortcut: ["/startlogo.png?v=2"],
    apple: [{ url: "/apple-icon.png?v=2", sizes: "512x512", type: "image/png" }]
  }
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="hu"
      suppressHydrationWarning
      style={
        {
          ["--font-heading" as string]: "'Space Grotesk', sans-serif",
          ["--font-body" as string]: "'Manrope', sans-serif"
        } as CSSProperties
      }
    >
      <body className="font-sans">
        <ThemeHydrator />
        {children}
      </body>
    </html>
  );
}
