import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});
const noto = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ระบบแผนที่สาขาแบบ Interactive · CSMJU",
    template: "%s · ระบบแผนที่สาขาแบบ Interactive · CSMJU",
  },
  description:
    "ระบบแผนที่สาขาแบบ Interactive ภายใต้ CSMJU2030 Unified Ecosystem",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="th"
      className={`${jakarta.variable} ${noto.variable} h-full antialiased`}
    >
      <body className="min-h-screen font-body text-body-md text-on-surface">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
