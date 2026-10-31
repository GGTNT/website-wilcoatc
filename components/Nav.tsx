"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { flagUrl, LANGUAGES } from "@/lib/languages";
import { useTheme } from "@/lib/theme";
import { MODULES, site } from "@/lib/site";
import { ChevronIcon, CoffeeIcon, DiscordIcon, DownloadIcon, MoonIcon, SunIcon } from "./icons";
import Logo from "./Logo";

const LINKS = [["#how", "nav.how"], ["#features", "nav.features"], ["#reviews", "nav.reviews"], ["#pricing", "nav.oss"], ["#faq", "nav.faq"], ["/docs", "nav.docs"]] as const;

/** The home page's anchors, made to work from another page by `home`, its path ("" on the home page). */
const to = (home: string, href: string) => (href.startsWith("#") ? home + href : href);

/** Calls `close` on a press outside `ref` or on Escape, while `open`. */
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const out = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) close(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("pointerdown", out);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", out); document.removeEventListener("keydown", esc); };
  }, [open, close, ref]);
}

/** "Features", opening on hover or a press onto the six things the program does. */
function FeaturesMenu({ home }: { home: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  // A mouse has already opened it by the time it clicks, so a toggle would shut it.
  const hovering = useRef(false);
  useDismiss(open, () => setOpen(false), box);
  const hover = (inside: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    hovering.current = inside;
    setOpen(inside);
  };
  return (
    <div ref={box} className="features-menu" onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
      <button className="nav-link nav-drop" onClick={() => setOpen(o => hovering.current || !o)} aria-expanded={open} aria-controls="features-list">
        {t("nav.features")}<ChevronIcon />
      </button>
      {open && (
        <div id="features-list" className="drop-menu">
          {MODULES.map(m => (
            <a key={m} href={`${home}#feature-${m}`} className="drop-item" onClick={() => setOpen(false)}>
              <span className="drop-title">{t(`module.${m}.t`)}</span>
              <span className="drop-desc">{t(`module.${m}.d`)}</span>
            </a>
          ))}
          <a href={`${home}#features`} className="drop-all" onClick={() => setOpen(false)}>{t("nav.features_all")}</a>
        </div>
      )}
    </div>
  );
}

/** Light or dark. The layout's script applies the saved choice before the first paint; this only flips it. */
function ThemeToggle() {
  const { t } = useT();
  const [theme, setTheme] = useTheme();
  const dark = theme === "dark";
  const label = t(dark ? "nav.theme_light" : "nav.theme_dark");
  return <button className="icon-btn" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={label} title={label}>{dark ? <SunIcon /> : <MoonIcon />}</button>;
}

function LanguagePicker() {
  const { lang, setLang, t } = useT();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const box = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), box);
  const cur = LANGUAGES.find(l => l.code === lang) ?? LANGUAGES[0];
  // Forty-one names do not fit on a phone without a way to narrow them.
  const needle = q.trim().toLowerCase();
  const shown = needle ? LANGUAGES.filter(l => l.name.toLowerCase().includes(needle) || l.code.toLowerCase().startsWith(needle)) : LANGUAGES;

  return (
    <div ref={box} className="lang-picker">
      <button className="icon-btn" onClick={() => { setOpen(o => !o); setQ(""); }} aria-label={t("nav.language")} aria-expanded={open} title={cur.name}>
        <img src={flagUrl(cur.flag)} alt={cur.name} style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", boxShadow: "0 0 0 1.5px rgb(var(--glass) / 0.35)" }} />
      </button>
      {open && (
        <div className="lang-menu" role="dialog" aria-label={t("nav.language")}>
          <input className="lang-search" value={q} onChange={e => setQ(e.target.value)} placeholder={t("nav.language")} aria-label={t("nav.language")} />
          <div className="lang-list">
            {shown.map(l => (
              <button key={l.code} lang={l.code} dir={l.rtl ? "rtl" : "ltr"} className="lang-item" aria-current={l.code === lang} onClick={() => { setLang(l.code); setOpen(false); }}>
                <img src={flagUrl(l.flag)} alt="" loading="lazy" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flex: "none" }} />
                <span>{l.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Nav({ download, home = "", current }: { download: string; home?: string; current?: string }) {
  const { t } = useT();
  const [menu, setMenu] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useDismiss(menu, () => setMenu(false), wrap);

  return (
    <div className="nav-wrap" ref={wrap}>
      <nav className="nav">
        <a href={home || "#top"} style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={() => setMenu(false)}>
          <Logo size={26} />
          <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em" }}>WilcoATC</span>
        </a>
        <div className="nav-links">
          {LINKS.map(([href, key]) => href === "#features"
            ? <FeaturesMenu key={href} home={home} />
            : <a key={href} href={to(home, href)} className="nav-link" aria-current={href === current ? "page" : undefined}>{t(key)}</a>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "none" }}>
          <ThemeToggle />
          <LanguagePicker />
          <a href={site.coffee} className="icon-btn ring-btn" aria-label="Buy Me a Coffee" title="Buy Me a Coffee"><CoffeeIcon /></a>
          <a href={site.discord} className="icon-btn ring-btn" aria-label="Discord" title="Discord"><DiscordIcon /></a>
          <button className="icon-btn burger" onClick={() => setMenu(m => !m)} aria-expanded={menu} aria-controls="mobile-menu" aria-label={t(menu ? "nav.menu_close" : "nav.menu_open")}>
            <span className="burger-lines" data-open={menu} aria-hidden><span /><span /><span /></span>
          </button>
        </div>
      </nav>
      <div id="mobile-menu" className="mobile-menu" data-open={menu} hidden={!menu}>
        {LINKS.map(([href, key]) => (
          <div key={href} style={{ display: "contents" }}>
            <a href={to(home, href)} className="mobile-link" aria-current={href === current ? "page" : undefined} onClick={() => setMenu(false)}>{t(key)}</a>
            {href === "#features" && MODULES.map(m => (
              <a key={m} href={`${home}#feature-${m}`} className="mobile-link mobile-sub" onClick={() => setMenu(false)}>{t(`module.${m}.t`)}</a>
            ))}
          </div>
        ))}
        <a href={download} className="btn btn-light" style={{ justifyContent: "center", marginTop: 8 }} onClick={() => setMenu(false)}>
          {t("cta.download_free")}<DownloadIcon />
        </a>
      </div>
    </div>
  );
}
