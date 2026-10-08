"use client";
import { cardClass, primaryButtonClass } from "@/csmju";
import { useBrowserLocation } from "@/lib/browser-location";
import { loginHref } from "@/lib/sign-in";

export default function SignInAgain() {
  const location = useBrowserLocation();
  const value = location ? new URL(location).searchParams.get("next") : null;
  const next =
    value?.startsWith("/") && !value.startsWith("//") && !value.startsWith("/auth/")
      ? value
      : "/map";
  return (
    <section
      className={`${cardClass} mx-auto max-w-xl space-y-4 p-6`}
      role="alert"
    >
      <h1 className="text-xl font-semibold">กรุณาเข้าสู่ระบบอีกครั้ง</h1>
      <p>
        ไม่สามารถต่ออายุการเข้าสู่ระบบได้ กรุณาเปิดด้วย localhost ที่ตรงกับ
        callback ที่ลงทะเบียนไว้ แล้วลองอีกครั้ง
      </p>
      <a className={`${primaryButtonClass} inline-flex`} href={loginHref(next)}>
        เข้าสู่ระบบผ่าน Core Hub
      </a>
    </section>
  );
}
