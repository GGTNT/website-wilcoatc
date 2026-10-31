"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

// percent reached, frequency shown, status word
const STEPS = [
  [0, "118.000", "loader.standby"],
  [22, "119.450", "loader.scanning"],
  [48, "121.730", "loader.tuning"],
  [74, "121.955", "loader.calling"],
  [100, "121.955", "loader.on_frequency"],
] as const;
const WORD = "WILCOATC";
const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/** A split-flap board that settles on WILCOATC while the radio tunes, then wipes upward. */
export default function Loader({ seconds }: { seconds: number }) {
  const { t } = useT();
  const [el, setEl] = useState(0);
  const [loaded, setLoaded] = useState(seconds <= 0);

  useEffect(() => {
    if (seconds <= 0) return;
    const dur = seconds * 1000, t0 = performance.now();
    let raf = 0, done = 0;
    const tick = () => {
      const e = performance.now() - t0;
      setEl(e);
      if (e < dur) raf = requestAnimationFrame(tick);
      else done = window.setTimeout(() => setLoaded(true), 350);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); clearTimeout(done); };
  }, [seconds]);

  if (seconds <= 0) return null;
  const load = Math.round(Math.min(1, el / (seconds * 1000)) * 100);
  const [, freq, text] = [...STEPS].reverse().find(s => load >= s[0])!;

  return (
    <div className="loader" aria-hidden={loaded} style={{ clipPath: loaded ? "inset(0 0 100% 0)" : "inset(0 0 0 0)", pointerEvents: loaded ? "none" : "auto" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, padding: 20 }}>
        <div dir="ltr" style={{ display: "flex", gap: 6 }}>
          {WORD.split("").map((ch, i) => {
            // Each tile lands 170 ms after the one before it.
            const set = el >= 350 + i * 170;
            const c = set ? ch : POOL[(Math.floor(el / 70) * 7 + i * 13) % POOL.length];
            return (
              <span key={i} className="tile" style={{ color: set ? "var(--fg)" : "rgb(var(--fgrgb) / 0.4)" }}>
                <span key={set ? "k" : c}>{c}</span>
              </span>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: "100%" }}>
          <div style={{ display: "flex", gap: 14, fontSize: 13, fontWeight: 600, color: "rgb(var(--fgrgb) / 0.5)" }}>
            <span style={{ fontVariantNumeric: "tabular-nums", color: "rgb(var(--fgrgb) / 0.8)" }}>{freq}</span>
            <span>{t("station.delivery")}</span>
            <span>{t(text)}</span>
          </div>
          <div style={{ width: 160, height: 1, background: "rgb(255 255 255 / calc(0.1 * var(--cardk)))" }}>
            <div style={{ height: "100%", width: `${load}%`, background: "rgb(var(--fgrgb) / 0.85)", transition: "width .2s linear" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
