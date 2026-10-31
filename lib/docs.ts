/**
 * The documentation, ported from `WilcoATC Docs.dc.html`. Written in English
 * only for now: the page chrome is translated (messages/*.json), the guides
 * are not. Each page is served at /docs/<id>; the first one is also /docs.
 */

export type Block =
  | { h: string }
  | { p: string }
  | { steps: string[] }
  | { tip: string }
  | { code: string }
  /** A radio exchange: who speaks, then what they say. */
  | { say: ["you" | "atc", string][] };

export type DocPage = { id: string; title: string; updated: string; lead: string; blocks: Block[] };
export type DocSection = { name: string; pages: DocPage[] };

export const DOCS: DocSection[] = [
  {
    name: "Getting started",
    pages: [
      {
        id: "install", title: "Install WilcoATC", updated: "2026-10-28",
        lead: "Five minutes from download to your first call. WilcoATC runs next to Microsoft Flight Simulator 2024 on the same PC — no account, no subscription.",
        blocks: [
          { h: "Before you start" },
          { p: "You need Windows 10 or 11, MSFS 2024 (Steam or Microsoft Store) and a microphone. About 1.2 GB of free disk space covers the app and the English voice pack." },
          { h: "Install" },
          { steps: [
            "Download the latest WilcoATC-Setup.exe from GitHub Releases or Flightsim.to.",
            "Run the installer. Windows SmartScreen may warn you because the app is new — click More info, then Run anyway.",
            "Launch WilcoATC. The setup assistant asks for your callsign, SimBrief username, ATC languages and push-to-talk key.",
            "Start MSFS 2024. The status dot in WilcoATC turns green when the simulator is connected.",
          ] },
          { tip: "Install WilcoATC outside your MSFS Community folder. It is a standalone app, not an add-on package." },
          { h: "Updating" },
          { p: "WilcoATC checks for a new version at launch and shows it in the changelog. Your settings and downloaded languages are kept between versions." },
        ],
      },
      {
        id: "first-flight", title: "Your first flight", updated: "2026-10-21",
        lead: "A complete walk-through from the gate at London Stansted to takeoff, so you know what to say and when.",
        blocks: [
          { h: "Load your flight" },
          { p: "Spawn at a gate with engines off. In WilcoATC, open Comms and import your plan in the flight strip. The badge switches from “no flight” to “preflight” when it is ready." },
          { h: "Call delivery" },
          { p: "Hold your push-to-talk key, say who you are calling, who you are and what you want. Release when you are done." },
          { say: [
            ["you", "Stansted Delivery, easy four two kilo, request IFR clearance to Paris."],
            ["atc", "Easy four two kilo, cleared to Paris via the CLN1E departure, runway 04, squawk 4571."],
            ["you", "Cleared to Paris, CLN1E, runway 04, squawk 4571, easy four two kilo."],
          ] },
          { tip: "You don’t need perfect phraseology. “Delivery, EZY42K, can I have my clearance to Paris?” works too — the controller understands plain English." },
          { h: "Pushback, taxi, takeoff" },
          { p: "After the clearance, the controller hands you to Ground for push and taxi, then Tower for takeoff. Each handoff tunes the next frequency automatically unless you turned that off in Settings." },
        ],
      },
      {
        id: "vfr", title: "Your first VFR flight", updated: "2026-10-31",
        lead: "No clearance, no route, just a look out of the window. A short hop from Cambridge to Duxford in a Cessna 172, with every call you need on the way.",
        blocks: [
          { h: "Set up the flight" },
          { p: "Spawn at a parking spot at Cambridge (EGSC) with the engine off. In the flight strip, choose Type it myself, enter your callsign and aircraft, set departure EGSC and destination EGSU, and pick VFR as the flight rules. There is nothing to import: a VFR flight needs no SimBrief plan." },
          { tip: "Pick a registration as your callsign, like G-WILC. The controller reads it back the way it is said on the radio: Golf Whiskey India Lima Charlie, then Golf Lima Charlie once you have been shortened." },
          { h: "Taxi" },
          { p: "There is no clearance to ask for. Listen to the ATIS if the airport has one, then call Ground with who you are, where you are, where you are going and the information you have." },
          { say: [
            ["you", "Cambridge Ground, Golf Whiskey India Lima Charlie, Cessna 172 at the flying club, VFR to Duxford, information Bravo, request taxi."],
            ["atc", "Golf Lima Charlie, taxi holding point Alpha, runway 23, QNH 1018."],
            ["you", "Taxi holding point Alpha, runway 23, QNH 1018, Golf Lima Charlie."],
          ] },
          { h: "Take off" },
          { p: "Do your run-up at the holding point, then tell Tower you are ready and which way you will leave." },
          { say: [
            ["you", "Golf Lima Charlie, ready for departure, leaving to the southwest."],
            ["atc", "Golf Lima Charlie, runway 23, cleared for takeoff, wind 240 degrees 8 knots."],
            ["you", "Cleared for takeoff runway 23, Golf Lima Charlie."],
          ] },
          { h: "En route" },
          { p: "Once you leave the zone, Tower lets you go and you are on your own. You can stay with no one, or ask a nearby unit for a basic service so someone knows you are there." },
          { say: [
            ["you", "Golf Lima Charlie, request basic service, Cessna 172 from Cambridge to Duxford, 2,000 feet on QNH 1018."],
            ["atc", "Golf Lima Charlie, basic service, report approaching Duxford."],
          ] },
          { tip: "Under VFR you choose your own heading and altitude. Stay clear of cloud, keep the ground in sight and fly your plan in the simulator; the controller does not vector you." },
          { h: "Join and land" },
          { p: "About ten miles out, call the destination with your position and intentions. You will be told how to join the circuit; report each position you are asked for." },
          { say: [
            ["you", "Duxford Information, Golf Whiskey India Lima Charlie, Cessna 172, five miles northeast, 2,000 feet, inbound for landing."],
            ["atc", "Golf Lima Charlie, runway 24, left hand, QFE 1014, report downwind."],
            ["you", "Golf Lima Charlie, downwind."],
            ["you", "Golf Lima Charlie, final."],
            ["atc", "Golf Lima Charlie, land at your discretion, wind 250 degrees 7 knots."],
          ] },
          { p: "Once you are down and off the runway, report vacated. That is the whole flight." },
        ],
      },
    ],
  },
  {
    name: "Setup",
    pages: [
      {
        id: "simbrief", title: "Import from SimBrief", updated: "2026-10-30",
        lead: "WilcoATC reads your latest SimBrief plan so the controller already knows your callsign, aircraft, route and cruise level.",
        blocks: [
          { h: "Find your SimBrief username" },
          { steps: [
            "Log in on simbrief.com.",
            "Open Account settings. Your username and your Pilot ID (a number) are both at the top.",
            "Paste either one in WilcoATC → Settings → SimBrief.",
          ] },
          { h: "Import the plan" },
          { p: "Generate your flight on SimBrief first — WilcoATC always loads the most recent one. Then click Import from SimBrief in the flight strip, or Load latest flight in Settings." },
          { tip: "Changed your plan after importing? Hit Reload in the flight strip. Nothing updates on its own." },
          { h: "No SimBrief?" },
          { p: "Choose Type it myself in the flight strip and fill in callsign, aircraft, departure and destination. The controller will give you a standard departure." },
        ],
      },
      {
        id: "ptt", title: "Push to talk", updated: "2026-10-03",
        lead: "The one setting that makes the biggest difference. WilcoATC only listens while you hold the key.",
        blocks: [
          { h: "Assign a key or button" },
          { steps: [
            "Open Settings → Push to talk.",
            "Click Change, then press the key or joystick button you want.",
            "Hold it and say “radio check” — the level meter should move.",
          ] },
          { tip: "Pick a button on your yoke or throttle. You will be calling Ground while taxiing, with your hands busy." },
          { h: "Avoid clipped calls" },
          { p: "Press, wait half a second, then speak. Keep holding until your last word is finished. Most “say again” replies come from releasing too early." },
        ],
      },
      {
        id: "languages", title: "ATC languages", updated: "2026-10-12",
        lead: "Fly with controllers in English, French, German, Spanish or Italian. English is always included.",
        blocks: [
          { h: "Add a language" },
          { steps: [
            "Open Settings → Languages.",
            "Select the flags you want — each pack is about 230 MB.",
            "Click Download. Packs install in the background; you can keep flying.",
          ] },
          { h: "How languages are used" },
          { p: "By default WilcoATC uses the local language below 10,000 ft when the airport supports it, and English above. You can force one language for the whole flight in Settings." },
          { code: "Settings → Languages → Language rule\n  Auto (local on ground, English en-route)\n  Always English\n  Always local" },
        ],
      },
    ],
  },
  {
    name: "Troubleshooting",
    pages: [
      {
        id: "not-heard", title: "The controller doesn’t hear me", updated: "2026-10-25",
        lead: "Nine times out of ten it is the microphone input or the push-to-talk key. Check these in order.",
        blocks: [
          { steps: [
            "Settings → Audio: make sure the right microphone is selected, not “Default”.",
            "Hold push to talk and watch the level meter. No movement means Windows is blocking the mic — allow it in Windows Privacy → Microphone.",
            "Check the status dot on Comms is green. Orange means MSFS isn’t connected yet.",
            "Still nothing? Export logs from Settings → About and attach them to a GitHub issue.",
          ] },
          { tip: "Headset with a mute switch? It is usually the mute switch." },
        ],
      },
      {
        id: "plan-missing", title: "My flight plan didn’t import", updated: "2026-10-30",
        lead: "If the flight strip still says “no flight” after importing, one of these is the cause.",
        blocks: [
          { h: "Common causes" },
          { steps: [
            "The username is wrong — use exactly what is shown in your SimBrief account settings.",
            "You haven’t generated a plan yet. WilcoATC loads the latest generated plan, not a draft.",
            "You generated a new plan after importing. Click Reload in the flight strip.",
          ] },
          { h: "Check from the browser" },
          { p: "Open this link with your username. If it shows your flight, WilcoATC can read it too." },
          { code: "https://www.simbrief.com/api/xml.fetcher.php?username=YOUR_NAME&json=1" },
        ],
      },
    ],
  },
  {
    name: "Contributing",
    pages: [
      {
        id: "build", title: "Build from source", updated: "2026-09-30",
        lead: "WilcoATC is MIT-licensed. Here is how to run it locally and send your first pull request.",
        blocks: [
          { code: "git clone https://github.com/GGTNT/WilcoATC.git\ncd WilcoATC\nnpm install\nnpm run dev" },
          { p: "The dev build connects to MSFS like the release does. Keep the simulator open in windowed mode to iterate faster." },
          { h: "Before opening a pull request" },
          { steps: [
            "Open an issue first for anything bigger than a bug fix.",
            "Run npm test — phraseology tests must pass.",
            "Describe how you tested it in the PR, ideally with a short clip.",
          ] },
        ],
      },
    ],
  },
];

/** Every page in reading order, each with the name of its section. */
export const PAGES = DOCS.flatMap(s => s.pages.map(p => ({ ...p, section: s.name })));

export const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const docHref = (id: string) => (id === PAGES[0].id ? "/docs" : `/docs/${id}`);
