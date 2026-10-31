// Every catalogue in messages/ must have exactly English's keys, the same
// {placeholders}, nothing blank, and five words for the typed headline; and
// every language offered in the picker must have a catalogue.
// Run with `npm run check:i18n`.
import { readdirSync, readFileSync } from "node:fs";

const dir = new URL("../messages/", import.meta.url);
const read = f => JSON.parse(readFileSync(new URL(f, dir), "utf8"));
const en = read("en.json");
const holes = s => (s.match(/\{\w+\}/g) || []).sort().join();
const problems = [];

const files = readdirSync(dir).filter(f => f.endsWith(".json") && f !== "en.json");
for (const f of files) {
  let c;
  try { c = read(f); } catch (e) { problems.push(`${f}: not valid JSON (${e.message})`); continue; }
  for (const k of Object.keys(en)) {
    if (!(k in c)) problems.push(`${f}: missing ${k}`);
    else if (typeof c[k] !== "string" || !c[k].trim()) problems.push(`${f}: blank ${k}`);
    // A typography script once turned "?" into U+0001 across a whole catalogue; it draws as a box.
    else if (/[\u0000-\u001f]/.test(c[k])) problems.push(`${f}: ${k} contains a control character`);
    else if (holes(c[k]) !== holes(en[k])) problems.push(`${f}: ${k} has ${holes(c[k]) || "no placeholders"}, English has ${holes(en[k])}`);
  }
  for (const k of Object.keys(c)) if (!(k in en)) problems.push(`${f}: unknown key ${k}`);
  if (c["hero_product.words"] && c["hero_product.words"].split("|").length !== 5) problems.push(`${f}: hero_product.words needs five words`);
}

const offered = [...readFileSync(new URL("../lib/languages.ts", import.meta.url), "utf8").matchAll(/code: "([\w-]+)"/g)].map(m => m[1]);
for (const code of offered) if (code !== "en" && !files.includes(`${code}.json`)) problems.push(`no catalogue for ${code}, which the picker offers`);

if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`${files.length + 1} catalogues, ${Object.keys(en).length} keys each: ok`);
