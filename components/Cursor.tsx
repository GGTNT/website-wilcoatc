"use client";

import { useEffect, useRef } from "react";

// What counts as something to press; a text field keeps the system's I-beam.
const PRESSABLE = "a, button, summary, label, select, [role='button'], [role='tab']";
const TYPING = "input:not([type='checkbox']):not([type='radio']):not([type='range']), textarea, [contenteditable='true']";

/**
 * A dot in place of the pointer with a ring round it that trails a little
 * behind; over anything that can be pressed the ring grows and turns the
 * accent's blue. Only with a mouse: a finger has no pointer
 * to replace, and the system cursor is kept until the first move, so a page
 * that never sees one never loses it.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const el = dot.current!, rg = ring.current!;
    const html = document.documentElement;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // The dot is where the click lands, so only the ring is allowed to lag.
    let x = -100, y = -100, rx = x, ry = y, frame = 0;
    const follow = () => {
      rx += (x - rx) * 0.22;
      ry += (y - ry) * 0.22;
      rg.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = Math.abs(x - rx) + Math.abs(y - ry) > 0.1 ? requestAnimationFrame(follow) : 0;
    };
    const setState = (state: string) => { el.dataset.state = state; rg.dataset.state = state; };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      html.classList.add("dot-cursor");
      if (el.dataset.state === "hidden") { rx = e.clientX; ry = e.clientY; }
      x = e.clientX; y = e.clientY;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (still) { rx = x; ry = y; rg.style.transform = el.style.transform; }
      else if (!frame) frame = requestAnimationFrame(follow);
      const target = e.target as Element | null;
      const typing = !!target?.closest?.(TYPING);
      setState(typing ? "hidden" : target?.closest?.(PRESSABLE) ? "hover" : "idle");
    };
    const leave = () => setState("hidden");
    const down = () => { rg.dataset.down = "true"; };
    const up = () => { delete rg.dataset.down; };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
      cancelAnimationFrame(frame);
      html.classList.remove("dot-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" data-state="hidden" aria-hidden><span /></div>
      <div ref={dot} className="cursor-dot" data-state="hidden" aria-hidden><span /></div>
    </>
  );
}
