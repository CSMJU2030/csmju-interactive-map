"use client";
import { cardClass, primaryButtonClass } from "@/csmju";
import { useEffect, useState } from "react";
import { loginHref } from "@/lib/sign-in";

export default function SignInAgain() {
  const [next, setNext] = useState("/map");
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("next");
    if (
      value?.startsWith("/") &&
      !value.startsWith("//") &&
      !value.startsWith("/auth/")
    )
      setNext(value);
  }, []);
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
