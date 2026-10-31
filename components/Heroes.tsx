"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { GitHubStats } from "@/lib/github";
import { useT } from "@/lib/i18n";
import { ghUrl, LINES, site, type HeroStyle } from "@/lib/site";
import { useTheme } from "@/lib/theme";
import { ArrowIcon, DownloadIcon, GitHubIcon, MicIcon, StarIcon } from "./icons";

/**
 * Replays LINES one character every 38 ms, holds each finished line for
 * 28 ticks, then moves on. `mic` is true while the pilot's line is typing.
 * Lives here rather than in Site so only the hero re-renders at 26 Hz.
 */
function useRadio() {
  const [s, setS] = useState({ line: 0, n: 0, mic: false });
  useEffect(() => {
    const t = setInterval(() => setS(({ line, n }) => {
      const full = LINES[line][1];
      if (n < full.length) return { line, n: n + 1, mic: line % 2 === 0 };
      if (n < full.length + 28) return { line, n: n + 1, mic: false };
      return { line: (line + 1) % LINES.length, n: 0, mic: false };
    }), 38);
    return () => clearInterval(t);
  }, []);
  return s;
}

/** The last three lines of the exchange so far, the current one still typing. */
function transcript(line: number, n: number) {
  return LINES.slice(0, line + 1).map(([, txt], i) => {
    const you = i % 2 === 0, cur = i === line;
    return { you, cur, text: cur ? txt.slice(0, n) : txt };
  }).slice(-3);
}

/** Types a word, holds it, deletes it, and goes on to the next controller. */
function useTypedWord(WORDS: string[]) {
  const [s, setS] = useState({ tw: 0, tc: 0, del: false });
  useEffect(() => {
    let t: number;
    const step = (cur: typeof s) => {
      const w = Array.from(WORDS[cur.tw]);
      let next: typeof s, wait: number;
      if (!cur.del && cur.tc < w.length) { next = { ...cur, tc: cur.tc + 1 }; wait = 70 + Math.random() * 60; }
      else if (!cur.del) { next = { ...cur, del: true }; wait = 1800; }
      else if (cur.tc > 0) { next = { ...cur, tc: cur.tc - 1 }; wait = 35; }
      else { next = { tw: (cur.tw + 1) % WORDS.length, tc: 0, del: false }; wait = 300; }
      setS(next);
      t = window.setTimeout(() => step(next), wait);
    };
    t = window.setTimeout(() => step({ tw: 0, tc: 0, del: false }), 600);
    return () => clearTimeout(t);
    // Starts again from the first word when the language changes.
  }, [WORDS]);
  // By code point, so a character is never cut in half.
  return Array.from(WORDS[s.tw] ?? "").slice(0, s.tc).join("");
}

function Ctas({ gh, primary = "light", ghostDark = false }: { gh: GitHubStats; primary?: "light" | "accent"; ghostDark?: boolean }) {
  const { t } = useT();
  return (
    <div className="btn-row" style={{ alignItems: "center" }}>
      <a href={gh.downloadUrl} className={`btn btn-${primary}`}>
        {t("cta.download_free")}{primary === "accent" && <DownloadIcon />}
      </a>
      <a href={ghUrl} className={`btn btn-ghost${ghostDark ? " dark" : ""}`}><StarIcon />{t("cta.star_github")}</a>
    </div>
  );
}

function Video({ style }: { style: CSSProperties }) {
  const [failed, setFailed] = useState(false);
  if (!site.heroVideo || failed) return null;
  return <video src={site.heroVideo} autoPlay muted loop playsInline onError={() => setFailed(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }} />;
}

const PLANE = "M9 4v-2L1 -3V-8.5a1.5 1.5 0 0 0-3 0V-3L-10 2v2L-2 1.5V7L-4 8.5V10L-.5 9 3 10V8.5L1 7V1.5z";
// path, stroke, dash, draw duration, draw delay, plane colour, label, fly period, fly delay
const ROUTES: [string, string, string, number, number, string, string, number, number][] = [
  ["M-60 620 C 300 420, 700 560, 1120 220 S 1500 60, 1560 -20", "color-mix(in oklch, var(--accent) 70%, transparent)", "6 10", 3, 1.2, "var(--accent)", "BAW172 · FL380", 16, 1.4],
  ["M-40 180 C 360 260, 520 40, 980 120 S 1400 360, 1520 300", "rgba(94,234,212,.6)", "4 10", 3.4, 1.8, "#5EEAD4", "IBE2107 · FL350", 22, 3],
  ["M200 860 C 420 540, 760 700, 1000 480 S 1300 240, 1500 160", "rgba(167,139,250,.55)", "3 9", 3.8, 2.2, "#A78BFA", "EZY6723 · FL240", 19, 5],
];

/** Hero A: flight paths over a mouse-tilted scene, and a live transmission strip. */
function SceneHero({ gh }: { gh: GitHubStats }) {
  const { t } = useT();
  const { line, n, mic } = useRadio();
  const [speaker, full] = LINES[line];
  const isYou = line % 2 === 0;
  const pill: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700 };
  const word = (text: string, delay: number, last = false, style?: CSSProperties) =>
    <span key={text + delay} className="hero-word" style={{ animationDelay: `${delay}s`, ...(last ? { marginInlineEnd: 0 } : {}), ...style }}>{text}</span>;
  // Each word rises 120 ms after the one before it.
  const words = (text: string, delay: number, last = true) => {
    const w = text.split(" ").filter(Boolean);
    return w.map((x, i) => word(x, delay + i * .12, last && i === w.length - 1));
  };
  const line2 = t("hero_scene.line2");

  return (
    <section id="top" style={{ position: "relative", minHeight: "calc(100vh - 80px)", overflow: "hidden", perspective: 1200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {site.heroVideo && <>
        <Video style={{ transform: "translateY(calc(var(--sy) * 0.25px)) scale(1.06)", filter: "saturate(.8) brightness(.55)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgb(var(--bgrgb) / .55), rgb(var(--bgrgb) / .25) 40%, rgb(var(--bgrgb) / .92) 100%), radial-gradient(70% 60% at 30% 50%, rgb(var(--bgrgb) / .5), transparent)" }} />
      </>}
      <div style={{ position: "absolute", inset: "-10% 0 0", pointerEvents: "none", opacity: .55, background: "conic-gradient(from 180deg at 50% 30%, transparent, color-mix(in oklch, var(--accent) 35%, transparent), transparent 30%, #5EEAD455 45%, transparent 55%, #A78BFA55 70%, transparent)", filter: "blur(70px)", animation: "aurora 22s ease-in-out infinite", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: "translateY(calc(var(--sy) * 0.35px)) rotateX(calc((var(--my) - 50) * -0.06deg)) rotateY(calc((var(--mx) - 50) * 0.08deg))", transition: "transform .6s cubic-bezier(.2,.8,.2,1)", pointerEvents: "none", opacity: "calc(1 - var(--sy) / 700)" }}>
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          {ROUTES.map(([d, stroke, dash, dur, delay], i) => (
            <path key={i} d={d} fill="none" stroke={stroke} strokeWidth={i ? 1 : 1.2} strokeDasharray={dash} pathLength={1} style={{ strokeDashoffset: 1, animation: `draw ${dur}s ease-out ${delay}s both` }} />
          ))}
          {ROUTES.map(([d, , , , , colour, label, period, delay], i) => (
            <g key={i} style={{ offsetPath: `path('${d}')`, offsetRotate: "auto 90deg", animation: `fly ${period}s linear ${delay}s infinite` } as CSSProperties}>
              {i === 0 && <circle r="14" fill="color-mix(in oklch, var(--accent) 30%, transparent)" />}
              <path d={PLANE} fill={colour} transform={i === 0 ? "scale(1.1)" : undefined} />
              <text x={i ? 14 : 16} y={i ? -8 : -10} fontFamily="var(--mono)" fontSize={i ? 10 : 11} style={{ fill: i ? "rgb(var(--fgrgb) / .75)" : "rgb(var(--fgrgb) / .85)" }}>{label}</text>
            </g>
          ))}
        </svg>
        <div style={{ position: "absolute", top: "-20%", bottom: "-20%", left: 0, width: 160, background: "linear-gradient(90deg, transparent, color-mix(in oklch, var(--accent) 22%, transparent), transparent)", animation: "beam 7s ease-in-out 2s infinite", mixBlendMode: "screen" }} />
      </div>

      <div style={{ position: "relative", maxWidth: 1120, width: "100%", margin: "0 auto", padding: "56px 20px 24px", display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ flex: "1 1 440px", minWidth: 0, maxWidth: 760, display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, animation: "fadeup .8s ease .2s both" }}>
            <a href={ghUrl} className="glass-dark" style={{ ...pill, gap: 10, padding: "8px 14px 8px 10px" }}><GitHubIcon size={16} />{t("hero_scene.badge", { license: gh.license })}</a>
            <span className="glass-dark" style={pill}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5EEAD4", boxShadow: "0 0 12px #5EEAD4" }} />Microsoft Flight Simulator 2024</span>
          </div>
          <h1 style={{ margin: 0, maxWidth: "100%", fontSize: "clamp(52px, 8vw, 124px)", fontWeight: 800, letterSpacing: "-0.05em", lineHeight: .9, textWrap: "balance", filter: "drop-shadow(0 20px 60px rgb(var(--sh) / .6))" }}>
            <span style={{ display: "block", color: "rgb(var(--fgrgb) / 0.5)" }}>{words(t("hero_scene.line1"), .3)}</span>
            <span style={{ display: "block" }}>{words(line2, .75, false)}{word(t("hero_scene.line2_accent"), .75 + .12 * line2.split(" ").filter(Boolean).length, true, { color: "var(--accent)", textShadow: "0 0 60px color-mix(in oklch, var(--accent) 70%, transparent)" })}</span>
          </h1>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, animation: "fadeup .9s ease 1.3s both" }}>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "rgb(var(--fgrgb) / 0.75)", textWrap: "pretty", maxWidth: "46ch" }}>{t("hero_scene.lead")}</p>
            <Ctas gh={gh} primary="accent" ghostDark />
          </div>
        </div>

        {/* Transmission strip */}
        <div style={{ position: "relative", marginTop: 10, borderRadius: 24, background: "rgb(var(--bgrgb) / 0.5)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgb(var(--glass) / 0.14)", boxShadow: "0 30px 80px rgb(var(--sh) / 0.5), inset 0 1px 0 rgb(var(--glass) / 0.14)", overflow: "hidden", display: "grid", gridTemplateColumns: "auto minmax(0,1fr)", alignItems: "center", animation: "fadeup .9s ease 1.6s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 22px", borderRight: "1px solid rgb(var(--glass) / 0.08)", background: "rgb(var(--sh) / 0.2)", height: "100%" }}>
            <div style={{ position: "relative", width: 52, height: 52, borderRadius: "50%", display: "grid", placeItems: "center", background: mic ? "var(--accent)" : "rgb(var(--glass) / 0.18)", color: "var(--ink)", boxShadow: "0 0 0 8px color-mix(in oklch, var(--accent) 18%, transparent)", transition: "background .3s" }}>
              <span style={{ position: "absolute", inset: -3, borderRadius: "50%", border: "2px solid var(--accent)", animation: "pulse 1.8s ease-out infinite" }} />
              <MicIcon />
            </div>
            <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "rgb(var(--fgrgb) / 0.55)", lineHeight: 1.4, minWidth: 64 }}>
              {t(mic ? "hero_scene.transmitting" : n < full.length ? "hero_scene.receiving" : "hero_scene.standby")}
            </div>
          </div>
          <div dir="ltr" lang="en" style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 6, minHeight: 112, justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: isYou ? "var(--accent)" : "rgb(var(--fgrgb) / 0.6)", fontWeight: 800 }}>
              {speaker}
              <span style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 14 }}>
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i} style={{ width: 3, height: 4 + ((n * 7 + i * 13) % 11), borderRadius: 2, background: isYou && n < full.length ? "var(--accent)" : "rgb(var(--fgrgb) / 0.35)", transition: "height .12s" }} />
                ))}
              </span>
              <span style={{ marginLeft: "auto", fontFamily: "var(--mono)", letterSpacing: 0, color: "rgb(var(--fgrgb) / 0.5)", fontWeight: 600 }}>121.955</span>
            </div>
            <div style={{ fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 600, lineHeight: 1.35, letterSpacing: "-0.01em", minHeight: "2.7em", textWrap: "pretty" }}>
              {full.slice(0, n)}
              <span style={{ display: "inline-block", width: 2, height: "1em", marginLeft: 3, background: "var(--accent)", verticalAlign: "-0.15em", opacity: n < full.length ? 1 : 0 }} />
            </div>
          </div>
        </div>
        <a href="#how" style={{ alignSelf: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 6, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: "rgb(var(--fgrgb) / 0.5)", animation: "fadeup 1s ease 2.8s both" }}>
          <span style={{ width: 22, height: 34, borderRadius: 999, border: "1.5px solid rgb(var(--glass) / 0.3)", display: "flex", justifyContent: "center", paddingTop: 6 }}>
            <span style={{ width: 3, height: 7, borderRadius: 2, background: "var(--accent)", animation: "scrolldot 1.6s ease-in-out infinite" }} />
          </span>
          {t("hero_scene.scroll")}
        </a>
      </div>
    </section>
  );
}

/** Hero B: the exchange set large, as a transcript. */
function TranscriptHero({ gh }: { gh: GitHubStats }) {
  const { t } = useT();
  const { line, n } = useRadio();
  return (
    <section id="top" style={{ position: "relative", maxWidth: 1120, margin: "0 auto", padding: "72px 20px 56px", minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 48 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: 16, paddingBottom: 18, borderBottom: "1px solid rgb(var(--glass) / 0.1)", fontSize: 13, fontWeight: 600, color: "rgb(var(--fgrgb) / 0.55)" }}>
        <span>{t("hero_transcript.station")}</span><span>{t("hero_transcript.meta")}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {transcript(line, n).map((x, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "minmax(90px, 140px) minmax(0,1fr)", gap: 24, alignItems: "baseline" }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: x.you ? "var(--accent)" : "rgb(var(--fgrgb) / 0.45)" }}>{t(x.you ? "radio.you" : "radio.delivery")}</div>
            <div dir="ltr" lang="en" style={{ fontSize: "clamp(26px, 3.8vw, 50px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.12, color: x.cur ? "var(--fg)" : "rgb(var(--fgrgb) / 0.32)", textWrap: "pretty" }}>{x.text}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 24 }}>
        <h1 style={{ margin: 0, fontSize: "clamp(18px, 2vw, 22px)", fontWeight: 600, lineHeight: 1.45, color: "rgb(var(--fgrgb) / 0.75)", maxWidth: "42ch", textWrap: "pretty" }}>{t("hero_transcript.title")}</h1>
        <Ctas gh={gh} />
      </div>
    </section>
  );
}

/**
 * The app's Communications screen, in the reader's theme. The screenshots are
 * public/app-screenshot.png and public/app-screenshot-dark.png; while either is
 * missing, a live mock of the panel stands in.
 */
function Shot() {
  const { t } = useT();
  const { line, n } = useRadio();
  const [theme] = useTheme();
  const src = theme === "dark" ? "/app-screenshot-dark.png" : "/app-screenshot.png";
  const [failed, setFailed] = useState<string[]>([]);
  // One that failed before hydration fired its error before React listened, hence the ref's check too.
  const fail = () => setFailed(f => (f.includes(src) ? f : [...f, src]));
  if (!failed.includes(src)) return (
    <div style={{ position: "relative", width: "100%", maxWidth: 1180, height: "clamp(260px, 42vw, 560px)", animation: "fadeup 1s ease .3s both" }}>
      <div style={{ position: "absolute", left: "8%", right: "8%", top: -30, height: 200, zIndex: -1, background: "radial-gradient(closest-side, color-mix(in oklch, var(--accent) 45%, transparent), transparent)", filter: "blur(30px)" }} />
      <div style={{ height: "100%", overflow: "hidden", padding: "10px 10px 0", borderRadius: "24px 24px 0 0", background: "var(--surface)", border: "1px solid color-mix(in oklch, var(--accent) 28%, var(--surface))", borderBottom: 0, boxShadow: "0 -10px 60px color-mix(in oklch, var(--accent) 22%, transparent)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <img src={src} alt={t("hero_product.shot_alt")} onError={fail} ref={el => { if (el?.complete && !el.naturalWidth) fail(); }} style={{ display: "block", width: "100%", height: "auto", borderRadius: "16px 16px 0 0" }} />
      </div>
    </div>
  );
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 880 }}>
      <div style={{ position: "absolute", inset: "-60px -40px", zIndex: -1, background: "radial-gradient(40% 50% at 25% 40%, color-mix(in oklch, var(--accent) 55%, transparent), transparent 70%), radial-gradient(35% 45% at 80% 65%, rgba(94,234,212,0.28), transparent 70%)", filter: "blur(30px)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 22, padding: "clamp(20px, 3vw, 32px)", borderRadius: 28, background: "rgb(255 255 255 / calc(0.06 * var(--cardk)))", border: "1px solid rgb(var(--glass) / 0.14)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 30px 80px rgb(var(--sh) / 0.45)", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 0 4px rgba(52,211,153,0.18)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{t("station.delivery")}</span>
              <span style={{ fontSize: 12, color: "rgb(var(--fgrgb) / 0.55)" }}>EZY42K · EGSS → LFPG</span>
            </div>
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 700, letterSpacing: "-0.02em" }}>121.955</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 210, justifyContent: "flex-end" }}>
          {transcript(line, n).map((x, i) => (
            <div key={i} style={{ display: "flex", justifyContent: x.you ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: 4, padding: "12px 16px", borderRadius: 18, background: x.you ? "color-mix(in oklch, var(--accent) 38%, rgb(var(--glass) / 0.04))" : "rgb(var(--glass) / 0.06)", border: "1px solid rgb(var(--glass) / 0.1)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: x.you ? "var(--accent)" : "rgb(var(--fgrgb) / 0.45)" }}>{t(x.you ? "radio.you" : "radio.delivery")}</span>
                <span dir="ltr" lang="en" style={{ fontSize: "clamp(14px, 1.6vw, 17px)", fontWeight: 500, lineHeight: 1.45, textWrap: "pretty" }}>{x.text}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, paddingTop: 18, borderTop: "1px solid rgb(var(--glass) / 0.1)" }}>
          <span style={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: "50%", background: "var(--accent)", color: "#fff", flex: "none" }}><MicIcon stroke={2} /></span>
          <span style={{ fontSize: 13, color: "rgb(var(--fgrgb) / 0.6)" }}>{t("hero_product.ptt")}</span>
        </div>
      </div>
    </div>
  );
}

/** Hero C (the design's default): a typed headline over the app itself. */
function ProductHero({ gh }: { gh: GitHubStats }) {
  const { t } = useT();
  const wordList = t("hero_product.words");
  const typed = useTypedWord(useMemo(() => wordList.split("|"), [wordList]));
  const [before, after = ""] = t("hero_product.title").split("{word}");
  return (
    <section id="top" style={{ position: "relative", marginTop: -92, padding: "160px 20px 0", overflow: "hidden", isolation: "isolate" }}>
      <div aria-hidden style={{ position: "absolute", left: "50%", top: 120, width: 1300, height: 1300, transform: "translateX(-50%)", borderRadius: "50%", zIndex: -1, background: "radial-gradient(closest-side, color-mix(in oklch, var(--accent) 34%, transparent), color-mix(in oklch, var(--accent) 10%, transparent) 70%, transparent)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", left: "50%", top: 60, width: 1100, height: 1100, transform: "translateX(-50%)", borderRadius: "50%", zIndex: -1, border: "1px solid color-mix(in oklch, var(--accent) 18%, transparent)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", left: -180, top: 380, width: 520, height: 520, borderRadius: "50%", zIndex: -1, background: "radial-gradient(closest-side, rgba(136,192,208,0.45), transparent)", filter: "blur(20px)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", right: -160, top: 200, width: 460, height: 460, borderRadius: "50%", zIndex: -1, background: "radial-gradient(closest-side, rgba(208,135,112,0.22), transparent)", filter: "blur(20px)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: -1, pointerEvents: "none", background: "radial-gradient(480px circle at calc(var(--mx) * 1%) calc(var(--my) * 1%), color-mix(in oklch, var(--accent) 16%, transparent), transparent 70%)" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 56, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 26, maxWidth: 920, animation: "fadeup .8s ease .1s both" }}>
          <a href="/docs/languages" className="news-pill">
            <span>{t("hero_product.new")}</span>{t("hero_product.news")}<ArrowIcon />
          </a>
          <h1 style={{ margin: 0, fontSize: "clamp(44px, 7vw, 92px)", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1.02, textWrap: "balance" }}>
            {before}<span style={{ whiteSpace: "nowrap" }}><span className="grad-text">{typed}</span><span className="type-caret" /></span>{after}<br />{t("hero_product.title2")}
          </h1>
          <p style={{ margin: 0, fontSize: "clamp(16px, 1.6vw, 19px)", lineHeight: 1.6, color: "rgb(var(--fgrgb) / 0.68)", maxWidth: "62ch", textWrap: "pretty" }}>{t("hero_product.lead")}</p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            <a href={gh.downloadUrl} className="btn btn-accent btn-square"><DownloadIcon size={18} stroke={2.2} />{t("cta.download_free")}</a>
            <a href={ghUrl} className="btn btn-grad btn-square"><StarIcon />{t("cta.star_github")}</a>
          </div>
        </div>
        <Shot />
      </div>
    </section>
  );
}

/** Hero D: the name knocked out of the page, the video showing through. */
function WordmarkHero({ gh }: { gh: GitHubStats }) {
  const { t } = useT();
  const big: CSSProperties = { fontSize: "21vw", fontWeight: 800, letterSpacing: "-0.06em", lineHeight: .82, color: "#fff", textAlign: "center", userSelect: "none" };
  return (
    <section id="top" style={{ position: "relative", minHeight: "calc(100vh - 80px)", overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center", isolation: "isolate" }}>
      <Video style={{ zIndex: -2 }} />
      <div style={{ position: "absolute", inset: 0, zIndex: -1, background: "#070a12", mixBlendMode: "multiply" }} />
      <div dir="ltr" style={{ position: "relative", padding: "0 2vw", mixBlendMode: "screen", background: "#070a12" }}>
        <div style={big}>WILCO</div>
        <div style={big}>ATC</div>
      </div>
      <div style={{ position: "relative", maxWidth: 1200, width: "100%", margin: "36px auto 0", padding: "0 20px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <h1 style={{ margin: 0, fontSize: "clamp(17px, 1.8vw, 21px)", fontWeight: 600, lineHeight: 1.45, color: "rgb(var(--fgrgb) / 0.78)", maxWidth: "40ch", textWrap: "pretty" }}>{t("hero_wordmark.title")}</h1>
        <Ctas gh={gh} />
      </div>
    </section>
  );
}

type StripKey = "callsign" | "type" | "dep" | "dest" | "sid" | "squawk" | "rfl";
const STRIP_A: [StripKey, string][] = [["callsign", "EZY42K"], ["type", "A20N/M"], ["dep", "EGSS"], ["dest", "LFPG"], ["sid", "UTAV 1R"], ["squawk", "4721"], ["rfl", "FL350"]];
const STRIP_B: [StripKey, string][] = [["callsign", "BAW9MT"], ["type", "B77W/H"], ["dep", "EGLL"], ["dest", "KJFK"], ["squawk", "6604"]];

/** Hero E: a paper flight strip whose clearance box fills in as Delivery speaks. */
function StripHero({ gh }: { gh: GitHubStats }) {
  const { t } = useT();
  const { line, n } = useRadio();
  const c = LINES[1][1];
  const clearance = line >= 1 ? c : c.slice(0, Math.max(0, n - 1)) || t("hero_strip.awaiting");
  const cells = (rows: [StripKey, string][]) => rows.map(([k, v]) => <div key={k} className="strip-cell"><span>{t(`strip.${k}`)}</span><span>{v}</span></div>);
  return (
    <section id="top" style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "80px 20px 64px", minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column", justifyContent: "center", gap: 56 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 760 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "rgb(var(--fgrgb) / 0.6)" }}>{t("hero_strip.kicker")}</span>
        <h1 style={{ margin: 0, fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1, textWrap: "balance" }}>{t("hero_strip.title")}</h1>
      </div>
      <div dir="ltr" style={{ display: "flex", flexDirection: "column", gap: 10, transform: "rotate(-1.2deg)" }}>
        <div className="strip" style={{ background: "#EDEFF3", boxShadow: "0 24px 60px rgb(var(--sh) / 0.45)", borderLeft: "14px solid var(--accent)" }}>
          {cells(STRIP_A)}
          <div style={{ flex: "1 0 220px", display: "flex", flexDirection: "column", gap: 4, padding: "12px 16px" }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(20,24,34,0.5)" }}>{t("hero_strip.clearance")}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#141822", lineHeight: 1.35 }}>{clearance}</span>
          </div>
        </div>
        <div className="strip" style={{ background: "#D9DDE4", opacity: .55, borderLeft: "14px solid rgba(20,24,34,0.35)", marginLeft: "6%" }}>{cells(STRIP_B)}</div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.55, color: "rgb(var(--fgrgb) / 0.72)", maxWidth: "48ch", textWrap: "pretty" }}>{t("hero_strip.lead")}</p>
        <Ctas gh={gh} />
      </div>
    </section>
  );
}

const HEROES = { scene: SceneHero, transcript: TranscriptHero, product: ProductHero, wordmark: WordmarkHero, strip: StripHero };

export default function Hero({ style, gh }: { style: HeroStyle; gh: GitHubStats }) {
  const H = HEROES[style];
  return <H gh={gh} />;
}
