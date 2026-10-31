"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { DOCS, PAGES, docHref, slug, type Block, type DocPage } from "@/lib/docs";
import type { GitHubStats } from "@/lib/github";
import { I18nProvider, useT } from "@/lib/i18n";
import { ghUrl, site } from "@/lib/site";
import Cursor from "./Cursor";
import Nav from "./Nav";
import { Footer } from "./Sections";

function Sidebar({ id }: { id: string }) {
  const { t } = useT();
  const [q, setQ] = useState("");
  // The whole page is searched, not only its title, so "squawk" finds the first flight.
  const needle = q.trim().toLowerCase();
  const match = (p: DocPage) => !needle || JSON.stringify([p.title, p.lead, p.blocks]).toLowerCase().includes(needle);
  const sections = DOCS.map(s => ({ name: s.name, pages: s.pages.filter(match) })).filter(s => s.pages.length);

  return (
    <aside className="docs-side">
      <label className="docs-search">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden style={{ flex: "none", opacity: 0.55 }}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t("docs.search")} aria-label={t("docs.search")} />
      </label>
      <nav lang="en" style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {sections.map(s => (
          <div key={s.name} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span className="docs-label" style={{ padding: "0 12px 6px" }}>{s.name}</span>
            {s.pages.map(p => (
              <Link key={p.id} href={docHref(p.id)} className="docs-item" aria-current={p.id === id ? "page" : undefined}>
                <span aria-hidden />{p.title}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      {!sections.length && <span style={{ padding: "0 12px", fontSize: 13, color: "rgb(var(--fgrgb) / 0.55)" }}>{t("docs.no_results", { q: q.trim() })}</span>}
    </aside>
  );
}

function Code({ code }: { code: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  return (
    <div className="docs-code">
      <pre>{code}</pre>
      <button onClick={() => navigator.clipboard?.writeText(code).then(() => setCopied(true), () => {})}>{t(copied ? "docs.copied" : "docs.copy")}</button>
    </div>
  );
}

function Render({ b }: { b: Block }) {
  const { t } = useT();
  if ("h" in b) return <h2 id={slug(b.h)} className="docs-h2">{b.h}</h2>;
  if ("p" in b) return <p className="docs-p">{b.p}</p>;
  if ("code" in b) return <Code code={b.code} />;
  if ("tip" in b) return <div className="docs-tip"><span aria-hidden>i</span><span>{b.tip}</span></div>;
  if ("steps" in b) return (
    <ol className="docs-steps">
      {b.steps.map((s, i) => <li key={i}><span aria-hidden>{i + 1}</span><span>{s}</span></li>)}
    </ol>
  );
  return (
    <div className="docs-say">
      {b.say.map(([who, line], i) => (
        <div key={i} data-who={who}>
          <div><span>{t(who === "you" ? "docs.you" : "docs.atc")}</span><span>{line}</span></div>
        </div>
      ))}
    </div>
  );
}

function Article({ id }: { id: string }) {
  const { lang, t } = useT();
  const i = PAGES.findIndex(p => p.id === id), page = PAGES[i], prev = PAGES[i - 1], next = PAGES[i + 1];
  // Dates are kept as ISO days and said in the reader's language; UTC so no time zone moves the day.
  const updated = new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${page.updated}T00:00:00Z`));

  return (
    <article key={id} className="docs-article">
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "rgb(var(--fgrgb) / 0.55)" }}>
        <span>{t("nav.docs")}</span><span aria-hidden>/</span><span lang="en" style={{ color: "var(--accent)" }}>{page.section}</span>
      </div>
      {lang !== "en" && <p className="docs-note">{t("docs.english_only")}</p>}
      <div lang="en" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <h1 className="docs-h1">{page.title}</h1>
          <p className="docs-lead">{page.lead}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {page.blocks.map((b, j) => <Render key={j} b={b} />)}
        </div>
      </div>
      <div className="docs-meta">
        <span>{t("docs.updated", { date: updated })}</span>
        <a href={`${ghUrl}/edit/main/docs/${page.id}.md`}>{t("docs.edit")}</a>
      </div>
      <div className="docs-pager">
        {prev && <Link href={docHref(prev.id)}><span>{t("docs.prev")}</span><span lang="en">{prev.title}</span></Link>}
        {next && <Link href={docHref(next.id)} data-next><span>{t("docs.next")}</span><span lang="en">{next.title}</span></Link>}
      </div>
    </article>
  );
}

function Toc({ id }: { id: string }) {
  const { t } = useT();
  const heads = PAGES.find(p => p.id === id)!.blocks.flatMap(b => ("h" in b ? [b.h] : []));
  return (
    <nav className="docs-toc" aria-label={t("docs.on_page")}>
      {heads.length > 0 && <span className="docs-label">{t("docs.on_page")}</span>}
      {heads.map(h => <a key={h} href={`#${slug(h)}`} lang="en">{h}</a>)}
      <div className="docs-help">
        <span style={{ fontSize: 13, fontWeight: 800 }}>{t("docs.stuck_t")}</span>
        <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgb(var(--fgrgb) / 0.62)" }}>{t("docs.stuck_d")}</span>
        <a href={site.discord} style={{ fontSize: 12.5, fontWeight: 800, color: "var(--accent)" }}>{t("docs.stuck_cta")}</a>
      </div>
    </nav>
  );
}

export default function Docs({ id, gh }: { id: string; gh: GitHubStats }) {
  return (
    <I18nProvider title="docs.meta_title" description="docs.meta_description">
    <div className="site" style={{ "--accent": site.accent } as CSSProperties}>
      <div className="docs-glow" aria-hidden><span /><span /><span /></div>
      <Cursor />
      <Nav download={gh.downloadUrl} home="/" current="/docs" />
      <div className="docs-layout">
        <Sidebar id={id} />
        <Article id={id} />
        <Toc id={id} />
      </div>
      <Footer gh={gh} home="/" />
    </div>
    </I18nProvider>
  );
}
