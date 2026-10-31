"use client";

/**
 * The page's theme lives on <html data-theme>, set before the first paint by
 * the script in app/layout.tsx. This reads it as React state and follows it
 * when it changes; the server, which cannot know the choice, assumes light.
 */
import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const KEY = "wilcoatc.theme";

const subscribe = (cb: () => void) => {
  const o = new MutationObserver(cb);
  o.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => o.disconnect();
};
const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore<Theme>(subscribe, read, () => "light");
  const set = (t: Theme) => {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(KEY, t); } catch {}
  };
  return [theme, set];
}
