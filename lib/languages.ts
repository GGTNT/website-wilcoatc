/**
 * The 41 languages the WilcoATC panel ships (wilcoatc/web/static/i18n), so a
 * pilot reads the website in the same language as the program. Each is named
 * in itself, and given the flag of the country most associated with it --
 * a flag is a country, not a language, so this is a visual cue only.
 * flagcdn has no Catalan or Galician flag: Catalan gets Andorra's (its one
 * official language), Galician Spain's.
 */

export type Language = { code: string; name: string; flag: string; rtl?: boolean };

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "gb" },
  { code: "ar", name: "العربية", flag: "sa", rtl: true },
  { code: "bg", name: "Български", flag: "bg" },
  { code: "ca", name: "Català", flag: "ad" },
  { code: "cs", name: "Čeština", flag: "cz" },
  { code: "da", name: "Dansk", flag: "dk" },
  { code: "de", name: "Deutsch", flag: "de" },
  { code: "el", name: "Ελληνικά", flag: "gr" },
  { code: "es", name: "Español", flag: "es" },
  { code: "et", name: "Eesti", flag: "ee" },
  { code: "fa", name: "فارسی", flag: "ir", rtl: true },
  { code: "fi", name: "Suomi", flag: "fi" },
  { code: "fr", name: "Français", flag: "fr" },
  { code: "gl", name: "Galego", flag: "es" },
  { code: "he", name: "עברית", flag: "il", rtl: true },
  { code: "hi", name: "हिन्दी", flag: "in" },
  { code: "hr", name: "Hrvatski", flag: "hr" },
  { code: "hu", name: "Magyar", flag: "hu" },
  { code: "id", name: "Bahasa Indonesia", flag: "id" },
  { code: "it", name: "Italiano", flag: "it" },
  { code: "ja", name: "日本語", flag: "jp" },
  { code: "ko", name: "한국어", flag: "kr" },
  { code: "lt", name: "Lietuvių", flag: "lt" },
  { code: "lv", name: "Latviešu", flag: "lv" },
  { code: "ms", name: "Bahasa Melayu", flag: "my" },
  { code: "nb", name: "Norsk bokmål", flag: "no" },
  { code: "nl", name: "Nederlands", flag: "nl" },
  { code: "pl", name: "Polski", flag: "pl" },
  { code: "pt", name: "Português", flag: "pt" },
  { code: "ro", name: "Română", flag: "ro" },
  { code: "ru", name: "Русский", flag: "ru" },
  { code: "sk", name: "Slovenčina", flag: "sk" },
  { code: "sl", name: "Slovenščina", flag: "si" },
  { code: "sr", name: "Српски", flag: "rs" },
  { code: "sv", name: "Svenska", flag: "se" },
  { code: "th", name: "ไทย", flag: "th" },
  { code: "tr", name: "Türkçe", flag: "tr" },
  { code: "uk", name: "Українська", flag: "ua" },
  { code: "vi", name: "Tiếng Việt", flag: "vn" },
  { code: "zh-Hans", name: "简体中文", flag: "cn" },
  { code: "zh-Hant", name: "繁體中文", flag: "tw" },
];

export const flagUrl = (c: string) => `https://flagcdn.com/w80/${c}.png`;

/** The best of ours for a browser tag such as "pt-BR", "zh-TW" or "nn". */
export function matchLanguage(tag: string): string | null {
  const t = tag.toLowerCase();
  if (t.startsWith("zh")) return /hant|tw|hk|mo/.test(t) ? "zh-Hant" : "zh-Hans";
  if (t === "no" || t.startsWith("nb") || t.startsWith("nn")) return "nb";
  const base = t.split("-")[0];
  return LANGUAGES.find(l => l.code === base)?.code ?? null;
}
