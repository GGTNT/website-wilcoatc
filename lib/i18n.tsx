"use client";

/**
 * The page's language. English is bundled and rendered on the server; the
 * other catalogues are loaded on demand, one chunk each, so a visitor
 * downloads only the language they read. The choice is remembered in
 * localStorage, and the first visit follows the browser's own languages.
 * The loader covers the page for its first seconds, which hides the switch
 * from English on a first visit.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import en from "@/messages/en.json";
import { LANGUAGES, matchLanguage } from "./languages";

type Catalogue = Record<string, string>;
const KEY = "wilcoatc.lang";

const load = (code: string): Promise<Catalogue> =>
  code === "en" ? Promise.resolve(en) : import(`@/messages/${code}.json`).then(m => m.default);

type Ctx = { lang: string; setLang: (code: string) => void; t: (key: keyof typeof en, params?: Record<string, string | number>) => string };
const I18n = createContext<Ctx | null>(null);

type Key = keyof typeof en;

/** `title` and `description` name the catalogue entries for the page's <title> and description. */
export function I18nProvider({ children, title = "meta.title", description = "meta.description" }: { children: React.ReactNode; title?: Key; description?: Key }) {
  const [lang, setLangState] = useState("en");
  const [cat, setCat] = useState<Catalogue>(en);

  const apply = useCallback((code: string) => {
    load(code).then(c => {
      setCat(c);
      setLangState(code);
      const html = document.documentElement;
      html.lang = code;
      html.dir = LANGUAGES.find(l => l.code === code)?.rtl ? "rtl" : "ltr";
    }).catch(() => {});
  }, []);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem(KEY); } catch {}
    const pick = (saved && LANGUAGES.some(l => l.code === saved) ? saved : null)
      ?? navigator.languages.map(matchLanguage).find(Boolean)
      ?? "en";
    if (pick !== "en") apply(pick);
  }, [apply]);

  const setLang = useCallback((code: string) => {
    try { localStorage.setItem(KEY, code); } catch {}
    apply(code);
  }, [apply]);

  const t = useCallback<Ctx["t"]>((key, params) => {
    // A key missing from a catalogue falls back to English rather than showing the key.
    let s = cat[key] ?? en[key];
    if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  }, [cat]);

  // Rendered here rather than in the layout's metadata, which Next would put
  // back in English after every switch; React hoists both into <head>.
  return (
    <I18n.Provider value={{ lang, setLang, t }}>
      <title>{t(title)}</title>
      <meta name="description" content={t(description)} />
      {children}
    </I18n.Provider>
  );
}

export function useT() {
  const c = useContext(I18n);
  if (!c) throw new Error("useT outside I18nProvider");
  return c;
}
