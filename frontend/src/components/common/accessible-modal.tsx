"use client";
import { useEffect, useRef } from "react";
import { ConfirmDeleteModal } from "@/csmju";
export function DeleteDialog(
  props: React.ComponentProps<typeof ConfirmDeleteModal>,
) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const original =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const background: Array<{ element: HTMLElement; inert: boolean }> = [];
    let branch: HTMLElement | null = root.current;
    while (branch?.parentElement) {
      for (const sibling of Array.from(branch.parentElement.children)) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          background.push({ element: sibling, inert: sibling.inert });
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
    }
    const elements = () =>
      Array.from(
        root.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]',
        ) ?? [],
      );
    elements()[0]?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const list = elements();
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      for (const item of background) item.element.inert = item.inert;
      original?.focus();
    };
  }, []);
  return (
    <div
      ref={root}
      className="[&_button]:min-h-11 [&_button]:min-w-11 [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-primary-container"
    >
      <ConfirmDeleteModal {...props} />
    </div>
  );
}
