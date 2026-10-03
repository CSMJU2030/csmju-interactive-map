'use client';

import { Building2, CircleHelp, LayoutDashboard, ListTree, Map, MapPinned, Menu, Settings, UserRoundCog, UsersRound, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { loginHref } from '@/lib/sign-in';
import { CurrentUserProvider, useCurrentUser } from '@/lib/current-user';

const mainNavigation = [
  { href: '/map', label: 'แผนที่ Interactive', icon: Map },
  { href: '/locations', label: 'สถานที่ทั้งหมด', icon: ListTree },
  { href: '/personnel', label: 'คณาจารย์และเจ้าหน้าที่', icon: UsersRound },
  { href: '/about', label: 'เกี่ยวกับ / ช่วยเหลือ', icon: CircleHelp },
];

const adminNavigation = [
  { href: '/admin', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { href: '/admin#manage-locations', label: 'จัดการสถานที่', icon: MapPinned },
  { href: '/admin#manage-lecturers', label: 'อาจารย์', icon: UserRoundCog },
  { href: '/admin#settings', label: 'การตั้งค่า', icon: Settings },
];

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, canManage, loading } = useCurrentUser();
  const isAdminPage = pathname.startsWith('/admin');

  const sidebar = (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-5">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-700 text-white">
          <Building2 size={21} />
        </span>
        <div className="leading-tight">
          <div className="font-bold text-brand-700">CSMJU</div>
          <div className="text-xs text-slate-500">Interactive Map</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label="เมนูหลัก">
        <p className="px-3 pb-2 pt-3 text-xs font-semibold text-slate-400">ระบบแผนที่</p>
        {mainNavigation.filter(item => item.href !== '/personnel' || canManage).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 py-2 font-medium transition ${
                active ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={19} />
              {item.label}
            </Link>
          );
        })}
        {canManage && isAdminPage && (
          <>
            <p className="px-3 pb-2 pt-6 text-xs font-semibold text-slate-400">ผู้ดูแลระบบ</p>
            {adminNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-3 rounded-xl bg-brand-100 px-3 py-2 font-medium text-brand-700"
              >
                <item.icon size={19} />
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>
      {canManage && !isAdminPage && (
        <div className="m-4 rounded-2xl bg-brand-50 p-4 text-sm">
          <p className="font-semibold text-brand-800">สำหรับเจ้าหน้าที่</p>
          <p className="mt-1 text-slate-600">จัดการตำแหน่งและข้อมูลสถานที่</p>
          <Link href="/admin" className="mt-3 inline-flex font-semibold text-brand-700 hover:underline">
            ไปหน้าผู้ดูแล →
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        {sidebar}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-slate-900/30"
            onClick={() => setMobileOpen(false)}
            aria-label="ปิดเมนู"
          />
          <aside className="relative flex h-full w-72 flex-col bg-white shadow-xl">
            <button
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              onClick={() => setMobileOpen(false)}
              aria-label="ปิดเมนู"
            >
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-7">
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="เปิดเมนู"
          >
            <Menu size={22} />
          </button>
          <div className="hidden text-sm text-slate-500 sm:block">CSMJU2030 · Unified Ecosystem</div>
          <div className="ml-auto flex items-center gap-2">
<a href={process.env.NEXT_PUBLIC_CORE_HUB_WEB_URL ?? 'https://csmju2030.jowave.com'} className="button-secondary">กลับ Core Hub</a>
            {user ? <form action="/auth/logout" method="post"><button type="submit" className="button-secondary">ออกจากระบบ</button></form> : <a className="button-primary" href={loginHref(pathname)}>เข้าสู่ระบบ</a>}
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 md:p-7">{loading ? <p role="status">กำลังตรวจสอบการเข้าสู่ระบบ…</p> : user || pathname === '/about' || pathname === '/signin-again' ? children : <section className="card mx-auto max-w-xl space-y-4 p-6"><h1 className="text-xl font-semibold">แผนที่สาขาวิทยาการคอมพิวเตอร์</h1><p>เข้าสู่ระบบผ่าน Core Hub เพื่อดูแผนที่และข้อมูลห้อง</p><a href={loginHref(pathname)} className="button-primary inline-flex">เข้าสู่ระบบผ่าน Core Hub</a></section>}</main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CurrentUserProvider>
      <AppShellContent>{children}</AppShellContent>
    </CurrentUserProvider>
  );
}
