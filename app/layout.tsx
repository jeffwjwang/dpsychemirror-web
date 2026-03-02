import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { MobileShell } from "@/components/layout/MobileShell";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PsycheMirror · 灵魂之镜",
  description: "你的数字自体生成器：在四个维度中解码潜意识与行为偏好。",
  applicationName: "PsycheMirror",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PsycheMirror",
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
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
