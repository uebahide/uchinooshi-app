import type { Metadata, Viewport } from "next";
import { DM_Mono, M_PLUS_1p, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";

const display = Zen_Maru_Gothic({ weight: ["500", "700", "900"], subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = M_PLUS_1p({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = DM_Mono({ weight: ["500"], subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "推しノート",
  description: "推しのアバターを作って、好きなもの・苦手なもの・性格・誕生日や記念日を記録するノート",
  appleWebApp: { capable: true, title: "推しノート", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#15131f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
