"use client";
import { useEffect, type RefObject } from "react";

/** Supply the drawer keyboard behavior missing from the unchanged shared template. */
export function useShellAccessibility(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const aside = root.current?.querySelector("aside");
    const main = root.current?.querySelector("main");
    const opener = root.current?.querySelector<HTMLButtonElement>(
      'button[aria-label="เปิดเมนู"]',
    );
    const closer = aside?.querySelector<HTMLButtonElement>(
      'button[aria-label="ปิดเมนู"]',
    );
    if (!aside || !main || !opener || !closer) return;
    const media = window.matchMedia("(min-width: 768px)");
    let open = false;
    const items = () =>
      Array.from(
        aside.querySelectorAll<HTMLElement>("a[href],button:not(:disabled)"),
      ).filter(
        (item) =>
          item.getClientRects().length &&
          getComputedStyle(item).display !== "none",
      );
    const sync = () => {
      const next = !media.matches && aside.classList.contains("translate-x-0");
      aside.inert = !media.matches && !next;
      main.inert = next;
      opener.setAttribute("aria-expanded", String(next));
      if (next) {
        aside.setAttribute("role", "dialog");
        aside.setAttribute("aria-modal", "true");
        aside.setAttribute("aria-label", "เมนูหลัก");
      } else {
        aside.removeAttribute("role");
        aside.removeAttribute("aria-modal");
        aside.removeAttribute("aria-label");
      }
      if (next && !open) items()[0]?.focus();
      if (!next && open) opener.focus();
      open = next;
    };
    const key = (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        closer.click();
        return;
      }
      if (event.key !== "Tab") return;
      const list = items(),
        first = list[0],
        last = list.at(-1);
      if (!aside.contains(document.activeElement)) {
        event.preventDefault();
        first?.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const observer = new MutationObserver(sync);
    observer.observe(aside, { attributes: true, attributeFilter: ["class"] });
    media.addEventListener("change", sync);
    document.addEventListener("keydown", key);
    sync();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("keydown", key);
      aside.inert = false;
      main.inert = false;
    };
  }, [root]);
}
