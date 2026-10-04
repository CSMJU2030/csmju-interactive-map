"use client";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useShellAccessibility } from "./use-shell-accessibility";
import {
  CsmjuAppShell,
  cardClass,
  secondaryButtonClass,
  primaryButtonClass,
  type NavItem,
} from "@/csmju";
import { CurrentUserProvider, useCurrentUser } from "@/lib/current-user";
import { loginHref } from "@/lib/sign-in";
import { LoadingState } from "@/components/common/ui-feedback";
const nav: NavItem[] = [
  {
    href: "/map",
    label: "แผนที่ Interactive",
    labelEn: "Map",
    icon: "meeting-room",
  },
  {
    href: "/locations",
    label: "สถานที่ทั้งหมด",
    labelEn: "Locations",
    icon: "description",
  },
  {
    href: "/personnel",
    label: "คณาจารย์และเจ้าหน้าที่",
    labelEn: "Personnel",
    icon: "group",
  },
  {
    href: "/about",
    label: "เกี่ยวกับระบบ",
    labelEn: "About",
    icon: "description",
  },
  {
    href: "/admin",
    label: "จัดการแผนที่",
    labelEn: "Administration",
    icon: "settings",
  },
];
const roles = {
  student: "นักศึกษา",
  alumni: "ศิษย์เก่า",
  staff: "บุคลากร/อาจารย์",
  lecturer: "บุคลากร/อาจารย์",
  guest: "ผู้เยี่ยมชม",
  admin: "ผู้ดูแลระบบ",
};
function ShellContent({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useShellAccessibility(root);
  const pathname = usePathname();
  const { user, canManage, loading } = useCurrentUser();
  const publicPage = pathname === "/about" || pathname === "/signin-again";
  return (
    <div
      ref={root}
      className="[&_button]:min-h-11 [&_button]:min-w-11 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-primary-container [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-primary-container [&_input]:focus-visible:outline-2 [&_input]:focus-visible:outline-primary-container [&_select]:focus-visible:outline-2 [&_select]:focus-visible:outline-primary-container"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface-container-lowest focus:p-4"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <CsmjuAppShell
        displayName="แผนที่ CSMJU"
        nav={nav.filter(
          (item) => canManage || !["/admin", "/personnel"].includes(item.href),
        )}
        user={{
          initials: user?.email.slice(0, 2).toUpperCase() ?? "CS",
          roleLabel: user ? roles[user.coreRole] : "ยังไม่ได้เข้าสู่ระบบ",
        }}
      >
        <a
          href={
            process.env.NEXT_PUBLIC_CORE_HUB_WEB_URL ??
            "https://csmju2030.jowave.com"
          }
          className={`${secondaryButtonClass} inline-flex min-h-11 items-center`}
        >
          กลับหน้าหลัก Core Hub
        </a>
        {loading ? (
          <LoadingState />
        ) : user || publicPage ? (
          children
        ) : (
          <section className={`${cardClass} mx-auto max-w-xl space-y-4 p-6`}>
            <h1 className="font-display text-headline-md">
              แผนที่สาขาวิทยาการคอมพิวเตอร์
            </h1>
            <p className="text-body-md">
              เข้าสู่ระบบผ่าน Core Hub เพื่อดูแผนที่และข้อมูลห้อง
            </p>
            <a
              href={loginHref(pathname)}
              className={`${primaryButtonClass} min-h-11`}
            >
              เข้าสู่ระบบผ่าน Core Hub
            </a>
          </section>
        )}
      </CsmjuAppShell>
    </div>
  );
}
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CurrentUserProvider>
      <ShellContent>{children}</ShellContent>
    </CurrentUserProvider>
  );
}
