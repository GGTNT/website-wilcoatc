import { useId } from "react";

/** The app icon: Nord blobs behind a white aeroplane, as in the desktop panel. */
export default function Logo({ size }: { size: number }) {
  // Two logos on one page must not share clip/filter ids.
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} aria-label="WilcoATC" style={{ flex: "none", display: "block" }}>
      <defs>
        <clipPath id={`${id}c`}><rect width="512" height="512" rx="128" /></clipPath>
        <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="60" /></filter>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".14" />
          <stop offset=".5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="512" height="512" fill="#2E3440" />
        <g filter={`url(#${id}b)`}>
          <circle cx="90" cy="80" r="190" fill="#5E81AC" />
          <circle cx="450" cy="200" r="170" fill="#88C0D0" opacity=".75" />
          <circle cx="230" cy="480" r="180" fill="#81A1C1" opacity=".8" />
          <circle cx="470" cy="500" r="110" fill="#D08770" opacity=".45" />
        </g>
        <rect width="512" height="512" fill={`url(#${id}g)`} />
        <g transform="translate(256 262) rotate(-45) scale(.6) translate(-256 -256)">
          <path fill="#ECEFF4" d="M256 16 C270 16 282 40 284 80 L286 190 L470 320 L470 352 L286 300 L282 410 L340 455 L340 478 L280 462 L272 490 C266 500 246 500 240 490 L232 462 L172 478 L172 455 L230 410 L226 300 L42 352 L42 320 L226 190 L228 80 C230 40 242 16 256 16 Z" />
        </g>
      </g>
      <rect x="3" y="3" width="506" height="506" rx="125" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="6" />
    </svg>
  );
}
