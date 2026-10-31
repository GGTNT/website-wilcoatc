/**
 * The knobs the design exposed as props, and the content that is not
 * translated (the words are in messages/*.json). Ported from `WilcoATC Website.dc.html`.
 */

export type HeroStyle = "scene" | "transcript" | "product" | "wordmark" | "strip";

export const site = {
  heroStyle: "product" as HeroStyle,
  accent: "#5B8DEF",
  lights: true,
  /** A looping clip behind the "scene" and "wordmark" heroes; empty for none. */
  heroVideo: "",
  /** How long the split-flap loader runs before it wipes away; 0 skips it. */
  loaderSeconds: 3.4,
  repo: "GGTNT/WilcoATC",
  flightsim: "https://flightsim.to/addon/112213/wilcoatc",
  discord: "https://discord.gg/z4GgaS6Nnk",
  coffee: "https://buymeacoffee.com/tnt0532",
};

/**
 * What the program does besides the controller, in the order the Features
 * menu lists them; each is a card in the Features section at `#feature-<id>`.
 */
export const MODULES = ["atc", "cabin", "copilot", "checklists", "traffic", "ground"] as const;

export const ghUrl = `https://github.com/${site.repo}`;

/**
 * The exchange every hero replays: pilot on the even lines, Delivery on the
 * odd. Left in English in every language: it is what is said on the radio.
 */
export const LINES: [string, string][] = [
  ["YOU · EZY42K", "Stansted Delivery, Easy four two kilo, stand 34, information Kilo, request clearance to Charles de Gaulle."],
  ["STANSTED DELIVERY", "Easy four two kilo, cleared to Charles de Gaulle via UTAVA 1R departure, squawk 4721."],
  ["YOU · EZY42K", "Cleared to Charles de Gaulle via UTAVA 1R, squawk 4721, Easy four two kilo."],
  ["STANSTED DELIVERY", "Readback correct. Contact Ground 121.730 when ready for push."],
];

/**
 * Flightsim.to comments as their authors wrote them, in English; the
 * translations are `review.1`..`review.9` in messages/, in this order. The
 * age is kept as a number and a unit so Intl.RelativeTimeFormat can say it
 * in the reader's language.
 */
export const reviews: [name: string, age: [number, Intl.RelativeTimeFormatUnit], text: string, colour: string][] = [
  ["harrazlikesa320n", [-24, "day"], "this is some best atc ive had because im broke", "#FB7185"],
  ["imnot_deiu", [-2, "month"], "Honestly GREAT for a freeware addon. It feels like an upgraded version of Pilot2ATC, with a pretty good ATC experience and lots of useful features.", "#F59E0B"],
  ["Judgegiuls", [-1, "month"], "Great tool to start with, especially since the MSFS 2024 default ATC still isn’t working properly on approach. One of the best alternatives. Awesome, thank you!", "#5EEAD4"],
  ["bennet727", [-23, "day"], "so cool danke!!!!!!!!!!!!!!!!!", "#A78BFA"],
  ["MStacey", [-2, "month"], "amazing best free ATC mod. Is there any chance of adding accents in the future when you get time? 5 stars", "#38BDF8"],
  ["martininsull", [-14, "day"], "I appreciate what you are doing. Thank you for taking the time and effort to produce something for everyone and for no reward!", "#34D399"],
  ["anonymf877", [-3, "day"], "just try WilcoATC and this is a great apps. keep the great job", "#F472B6"],
  ["pitsas", [-1, "month"], "arrivals work, and also this is an alpha version and 100% free", "#C4B5FD"],
  ["oldpat", [-4, "day"], "Very nice. Thank you", "#E2E8F0"],
];
