"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

// The server has no browser URL. React reads the client snapshot after hydration.
export function useBrowserLocation() {
  return useSyncExternalStore(subscribe, () => window.location.href, () => "");
}
