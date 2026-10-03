import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/app-shell';

export const metadata: Metadata = {
  title: {
    default: 'ระบบแผนที่สาขาแบบ Interactive · CSMJU',
    template: '%s · ระบบแผนที่สาขาแบบ Interactive · CSMJU',
  },
  description: 'ระบบแผนที่สาขาแบบ Interactive ภายใต้ CSMJU2030 Unified Ecosystem',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className="min-h-screen font-sans antialiased text-slate-800">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
