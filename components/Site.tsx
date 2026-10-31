"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import type { GitHubStats } from "@/lib/github";
import { I18nProvider } from "@/lib/i18n";
import { site } from "@/lib/site";
import Cursor from "./Cursor";
import Loader from "./Loader";
import Nav from "./Nav";
import Hero from "./Heroes";
import { Cta, Faq, Features, Footer, HowItWorks, OpenSource, Reviews } from "./Sections";

// colour, left, top, size, drift period, drift delay
const LIGHTS: [string, string, string, number, string, number][] = [
  ["var(--c4)", "-8%", "-4%", 560, "18s", 0],
  ["var(--c2)", "72%", "-6%", 520, "22s", -6],
  ["var(--c3)", "-12%", "38%", 600, "26s", -12],
  ["var(--c4)", "78%", "48%", 480, "20s", -4],
  ["var(--c1)", "40%", "72%", 640, "30s", -9],
  ["var(--c3)", "-6%", "86%", 500, "24s", -3],
];

function Lights() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {LIGHTS.map(([c, left, top, s, d, delay], i) => {
        // Alternate lights lean opposite ways, and the later ones further, for parallax.
        const k = (i % 2 ? -1 : 1) * (1.2 + i * 0.5);
        return (
          <div key={i} style={{ position: "absolute", left, top, width: s, height: s, transform: `translate(calc((var(--mx) - 50) * ${k}px), calc((var(--my) - 50) * ${k * 0.8}px))`, transition: "transform .9s cubic-bezier(.2,.8,.2,1)", willChange: "transform" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: `radial-gradient(circle, ${c} 0%, transparent 65%)`, opacity: 0.22, filter: "blur(40px)", animation: `drift ${d} ease-in-out ${delay}s infinite`, mixBlendMode: "screen" }} />
          </div>
        );
      })}
    </div>
  );
}

export default function Site({ gh }: { gh: GitHubStats }) {
  const root = useRef<HTMLDivElement>(null);

  // The pointer and scroll position go straight into CSS variables, not React
  // state: the lights, the glow and the hero scene read them, and nothing re-renders.
  useEffect(() => {
    const el = root.current!;
    const onScroll = () => el.style.setProperty("--sy", String(Math.max(0, window.scrollY)));
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(2));
      el.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(2));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <I18nProvider>
    <div ref={root} className="site" style={{ "--accent": site.accent } as CSSProperties}>
      <Loader seconds={site.loaderSeconds} />
      {site.lights && <Lights />}
      <div className="cursor-glow" />
      <Cursor />
      <div className="grid-floor" />
      <Nav download={gh.downloadUrl} />
      <Hero style={site.heroStyle} gh={gh} />
      <HowItWorks />
      <Features />
      <Reviews />
      <OpenSource gh={gh} />
      <Faq license={gh.license} />
      <Cta gh={gh} />
      <Footer gh={gh} />
    </div>
    </I18nProvider>
  );
}
