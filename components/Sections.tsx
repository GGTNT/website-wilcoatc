"use client";

import { useMemo, useState, type CSSProperties } from "react";
import type { GitHubStats } from "@/lib/github";
import { useT } from "@/lib/i18n";
import { ghUrl, MODULES, reviews, site } from "@/lib/site";
import { DownloadIcon } from "./icons";
import Logo from "./Logo";

function Head({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ maxWidth: "60ch" }}>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="h2">{title}</h2>
    </div>
  );
}

export function HowItWorks() {
  const { t } = useT();
  return (
    <section id="how" className="section">
      <Head eyebrow={t("how.eyebrow")} title={t("how.title")} />
      <div className="auto-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
        {([1, 2, 3] as const).map(i => (
          <div key={i} className="card glass">
            <div className="step-n">0{i}</div>
            <div className="card-title">{t(`how.${i}.t`)}</div>
            <p className="body">{t(`how.${i}.d`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const BLIPS: [string, string, string, string][] = [
  ["22%", "26%", "#5EEAD4", "EGSL"],
  ["38%", "14%", "var(--accent)", "RYR3306"],
  ["10%", "46%", "rgb(var(--fgrgb) / 0.7)", "GB-0829"],
];

export function Features() {
  const { t } = useT();
  return (
    <section id="features" className="section">
      <Head eyebrow={t("features.eyebrow")} title={t("features.title")} />
      <div className="auto-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div className="airspace glass">
          {/* The scope is a picture of a place, so it is not mirrored in a right-to-left language. */}
          <div dir="ltr" style={{ position: "absolute", inset: 0 }}>
            <div className="ring" style={{ right: "-6%", top: "-20%", width: 420 }} />
            <div className="ring" style={{ right: "3%", top: "-4%", width: 280, borderColor: "rgb(var(--glass) / 0.1)" }} />
            <div className="radar-sweep" />
            {BLIPS.map(([right, top, dot, label], i) => (
              // The grey one is unidentified VFR traffic: no glow.
              <div key={label} className="blip" style={{ right, top, "--dot": dot } as CSSProperties}>
                <span style={i === 2 ? { boxShadow: "none" } : undefined} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div style={{ maxWidth: "40ch", position: "relative" }}>
            <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: "-0.01em" }}>{t("features.airspace.t")}</div>
            <p className="body" style={{ marginTop: 8 }}>{t("features.airspace.d")}</p>
          </div>
        </div>
        {([1, 2, 3, 4] as const).map(i => (
          <div key={i} className="card glass" style={{ gap: 12 }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>{t(`features.${i}.k`)}</div>
            <div className="card-title">{t(`features.${i}.t`)}</div>
            <p className="body">{t(`features.${i}.d`)}</p>
          </div>
        ))}
      </div>
      <h3 className="modules-title">{t("modules.title")}</h3>
      <div className="auto-grid" style={{ marginTop: 20, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        {MODULES.map(m => (
          <div key={m} id={`feature-${m}`} className="card glass module">
            <div className="card-title">{t(`module.${m}.t`)}</div>
            <p className="body">{t(`module.${m}.d`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

type Review = (typeof reviews)[number];

/**
 * A Flightsim.to comment, shown in the reader's language. The reviewer wrote
 * it in English, so it says so and can show their own words.
 */
function ReviewCard({ review: [name, [n, unit], original, c], index, ago }: { review: Review; index: number; ago: Intl.RelativeTimeFormat }) {
  const { t, lang } = useT();
  const [showOriginal, setShowOriginal] = useState(false);
  const translated = lang !== "en";
  const asWritten = !translated || showOriginal;
  // Every third card is tinted in its reviewer's colour, to break up the wall.
  const tint = index % 3 === 1;
  return (
    <div className="review glass" style={tint ? { background: `color-mix(in oklch, ${c} 12%, rgb(var(--glass) / 0.04))`, borderColor: `color-mix(in oklch, ${c} 30%, transparent)` } : undefined}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div className="avatar" style={{ background: c }}>{name[0].toUpperCase()}</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{name}</div>
          <div style={{ fontSize: 12, color: "rgb(var(--fgrgb) / 0.6)" }}>{ago.format(n, unit)}</div>
        </div>
      </div>
      <p lang={asWritten ? "en" : lang} dir={asWritten ? "ltr" : undefined} style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: "rgb(var(--fgrgb) / 0.88)", textWrap: "pretty", textAlign: "start" }}>
        “{asWritten ? original : t(`review.${index + 1}` as "review.1")}”
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span className="tag">{t("reviews.tag")}</span>
        {translated && (
          <button className="review-toggle" onClick={() => setShowOriginal(o => !o)} aria-pressed={showOriginal}>
            {showOriginal ? t("reviews.show_translation") : `${t("reviews.translated")} · ${t("reviews.show_original")}`}
          </button>
        )}
      </div>
    </div>
  );
}

export function Reviews() {
  const { t, lang } = useT();
  const nf = useMemo(() => new Intl.NumberFormat(lang, { maximumFractionDigits: 1 }), [lang]);
  const compact = useMemo(() => new Intl.NumberFormat(lang, { notation: "compact" }), [lang]);
  const pct = useMemo(() => new Intl.NumberFormat(lang, { style: "percent" }), [lang]);
  const ago = useMemo(() => new Intl.RelativeTimeFormat(lang, { numeric: "auto" }), [lang]);
  return (
    <section id="reviews" className="section">
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 20 }}>
        <div style={{ maxWidth: "60ch" }}>
          <div className="eyebrow">{t("reviews.eyebrow")}</div>
          <h2 className="h2">{t("reviews.title", { rating: nf.format(4.8) })}</h2>
          <p style={{ margin: "10px 0 0", fontSize: 15, color: "rgb(var(--fgrgb) / 0.65)" }}>{t("reviews.lead")}</p>
        </div>
        <div className="glass" style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 22px", borderRadius: 20 }}>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.04em", fontFamily: "var(--mono)", lineHeight: 1, color: "var(--accent)" }}>{nf.format(4.8)}</div>
          <div>
            <div style={{ fontSize: 16, letterSpacing: 2, color: "#FFD166" }} aria-label={t("reviews.stars")}>★★★★★</div>
            <div style={{ marginTop: 4, fontSize: 12, color: "rgb(var(--fgrgb) / 0.6)" }}>{t("reviews.count", { reviews: nf.format(12), downloads: compact.format(2000) })}</div>
            <div dir="ltr" style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontFamily: "var(--mono)", color: "rgb(var(--fgrgb) / 0.6)" }}>
              {([["5★", .75], ["4★", .25]] as const).map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span>{k}</span><span className="bar"><span style={{ width: `${v * 100}%` }} /></span><span>{pct.format(v)}</span>
                </div>
              ))}
            </div>
            <a href={site.flightsim} className="foot-link" style={{ display: "inline-block", marginTop: 10, fontSize: 12, fontWeight: 700 }}>{t("reviews.see")}</a>
          </div>
        </div>
      </div>
      <div className="reviews">
        {reviews.map((r, i) => <ReviewCard key={r[0]} review={r} index={i} ago={ago} />)}
      </div>
    </section>
  );
}

export function OpenSource({ gh }: { gh: GitHubStats }) {
  const { t } = useT();
  const stats = [
    { v: gh.stars, t: t("oss.stars.t"), d: t("oss.stars.d") },
    { v: gh.contributors, t: t("oss.contributors.t"), d: gh.commits ? t("oss.contributors.commits", { n: gh.commits }) : t("oss.contributors.d") },
    { v: "5", t: t("oss.languages.t"), d: t("oss.languages.d") },
    { v: gh.license, t: t("oss.license.t"), d: t("oss.license.d") },
  ];
  return (
    <section id="pricing" className="section">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, alignItems: "stretch" }}>
        <div className="accent-panel" style={{ padding: 32, borderRadius: 26, display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="eyebrow" style={{ color: "var(--fg)", opacity: .8 }}>{t("oss.eyebrow")}</div>
          <h2 className="h2" style={{ margin: 0, lineHeight: 1.05 }}>{t("oss.title")}</h2>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: "rgb(var(--fgrgb) / 0.78)", textWrap: "pretty" }}>{t("oss.body", { license: gh.license })}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
            <a href={gh.downloadUrl} className="btn btn-light" style={{ minHeight: 46, padding: "0 20px", fontSize: 14 }}>{t("cta.download_free")}</a>
            <a href={ghUrl} className="btn btn-ghost" style={{ minHeight: 46, padding: "0 20px", fontSize: 14, background: "rgb(var(--bgrgb) / 0.35)", borderColor: "rgb(var(--glass) / 0.18)" }}>{t("oss.source")}</a>
          </div>
        </div>
        <div className="oss-stats">
          {stats.map(o => (
            <div key={o.t} className="glass" style={{ padding: 22, borderRadius: 22, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", fontFamily: "var(--mono)", lineHeight: 1 }}>{o.v}</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{o.t}</div>
              <div style={{ fontSize: 12, lineHeight: 1.45, color: "rgb(var(--fgrgb) / 0.6)" }}>{o.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Faq({ license }: { license: string }) {
  const { t } = useT();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="section" style={{ maxWidth: 760 }}>
      <div className="eyebrow">{t("faq.eyebrow")}</div>
      <h2 className="h2" style={{ marginBottom: 28 }}>{t("faq.title")}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {([1, 2, 3, 4, 5] as const).map((k, i) => (
          <div key={k} className="faq-item glass" data-open={open === i} style={{ boxShadow: "none" }}>
            <button className="faq-q" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
              {t(`faq.${k}.q`)}
              <span className="faq-plus">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
              </span>
            </button>
            {open === i && <p style={{ margin: 0, padding: "0 20px 18px", fontSize: 14, lineHeight: 1.6, color: "rgb(var(--fgrgb) / 0.7)", textWrap: "pretty" }}>{t(`faq.${k}.a`, { license })}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function Cta({ gh }: { gh: GitHubStats }) {
  const { t } = useT();
  const releaseLine = [gh.release ?? t("cta.from_source"), gh.releaseSize, "Windows 10/11 x64"].filter(Boolean).join(" · ");
  return (
    <section className="section" style={{ paddingTop: 60 }}>
      <div className="accent-panel" style={{ position: "relative", overflow: "hidden", padding: "48px 32px", borderRadius: 30, textAlign: "center", boxShadow: "0 30px 80px rgb(var(--sh) / 0.45), inset 0 1px 0 rgb(var(--glass) / 0.2)" }}>
        <h2 style={{ margin: 0, fontSize: "clamp(30px, 4.5vw, 46px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05 }}>{t("cta.title")}</h2>
        <p style={{ margin: "12px auto 26px", maxWidth: "46ch", fontSize: 16, lineHeight: 1.55, color: "rgb(var(--fgrgb) / 0.75)", textWrap: "pretty" }}>{t("cta.body")}</p>
        <a href={gh.downloadUrl} className="btn btn-light">{t("cta.windows")}<DownloadIcon /></a>
        <div style={{ marginTop: 14, fontSize: 12, color: "rgb(var(--fgrgb) / 0.6)", fontFamily: "var(--mono)" }}>{releaseLine}</div>
      </div>
    </section>
  );
}

export function Footer({ gh, home = "" }: { gh: GitHubStats; home?: string }) {
  const { t } = useT();
  const cols: [string, [string, string][]][] = [
    [t("footer.product"), [[`${home}#how`, t("nav.how")], [`${home}#features`, t("nav.features")], [`${home}#reviews`, t("nav.reviews")], [`${home}#faq`, t("nav.faq")], ["/docs", t("nav.docs")]]],
    [t("footer.get_it"), [[gh.downloadUrl, t("footer.download")], [site.flightsim, "Flightsim.to"], [`${ghUrl}/blob/main/PATCH-NOTES.md`, t("footer.changelog")]]],
    [t("footer.oss"), [[ghUrl, "GitHub"], [`${ghUrl}/issues`, t("footer.bug")], [`${ghUrl}/pulls`, t("footer.contribute")]]],
  ];
  return (
    <footer style={{ position: "relative", marginTop: 60, borderTop: "1px solid rgb(var(--glass) / 0.08)", background: "rgb(var(--bgrgb) / 0.55)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: "50%", bottom: -260, width: 900, height: 420, transform: "translateX(-50%)", background: "radial-gradient(closest-side, color-mix(in oklch, var(--accent) 30%, transparent), transparent)", pointerEvents: "none" }} />
      <div style={{ position: "relative", maxWidth: 1120, margin: "0 auto", padding: "56px 20px 28px", display: "flex", flexDirection: "column", gap: 48 }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 320 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}><Logo size={30} /><span style={{ fontSize: 18, fontWeight: 800 }}>WilcoATC</span></div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "rgb(var(--fgrgb) / 0.6)", textWrap: "pretty" }}>{t("footer.tagline")}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgb(var(--fgrgb) / 0.55)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", flex: "none" }} /><span>{t("footer.licence", { license: gh.license })}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px 56px" }}>
            {cols.map(([head, links]) => (
              <div key={head} className="foot-col">
                <span>{head}</span>
                {links.map(([href, label]) => <a key={href} href={href} className="foot-link">{label}</a>)}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, paddingTop: 22, borderTop: "1px solid rgb(var(--glass) / 0.08)", fontSize: 12, color: "rgb(var(--fgrgb) / 0.5)" }}>
          <span>{t("footer.copyright")}</span>
          <span style={{ fontFamily: "var(--mono)" }}>{t("footer.signoff")}</span>
        </div>
      </div>
    </footer>
  );
}
