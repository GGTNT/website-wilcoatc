/**
 * The repository numbers the page shows. The design fetched them in every
 * visitor's browser, which spends GitHub's 60-an-hour anonymous limit per
 * visitor; here the server fetches them and Next caches the answer for an
 * hour. Every figure has a fallback, so an offline build still renders.
 */
import { ghUrl, site } from "./site";

export type GitHubStats = {
  stars: string;
  contributors: string;
  commits: number | null;
  license: string;
  /** Tag and installer size of the latest release; null when there is none. */
  release: string | null;
  releaseSize: string | null;
  downloadUrl: string;
};

const API = `https://api.github.com/repos/${site.repo}`;

async function get(url: string) {
  const r = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: 3600 },
  });
  if (!r.ok) throw new Error(String(r.status));
  return r;
}

/** One item per page, so the "last" page number in the Link header is the count. */
async function count(url: string) {
  const r = await get(url);
  const m = (r.headers.get("Link") || "").match(/page=(\d+)>; rel="last"/);
  return m ? +m[1] : ((await r.json()) as unknown[]).length;
}

const fmt = (n: number | undefined) =>
  n == null ? "—" : n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);

export async function loadGitHub(): Promise<GitHubStats> {
  const g: {
    stars?: number; contributors?: number; commits?: number; license?: string;
    release?: string; releaseSize?: string; releaseUrl?: string;
  } = {};
  await Promise.all([
    get(API).then(r => r.json()).then(d => {
      g.stars = d.stargazers_count;
      const id = d.license?.spdx_id;
      if (id && id !== "NOASSERTION") g.license = id;
    }).catch(() => {}),
    count(`${API}/contributors?per_page=1&anon=1`).then(n => { g.contributors = n; }).catch(() => {}),
    count(`${API}/commits?per_page=1`).then(n => { g.commits = n; }).catch(() => {}),
    get(`${API}/releases/latest`).then(r => r.json()).then(d => {
      const a = (d.assets || [])[0];
      g.release = d.tag_name;
      g.releaseSize = a ? Math.round(a.size / 1048576) + " MB" : undefined;
      g.releaseUrl = a ? a.browser_download_url : d.html_url;
    }).catch(() => {}),
  ]);
  return {
    stars: fmt(g.stars ?? 4),
    contributors: fmt(g.contributors ?? 1),
    commits: g.commits ?? null,
    license: g.license ?? "MIT",
    release: g.release ?? null,
    releaseSize: g.releaseSize ?? null,
    downloadUrl: g.releaseUrl ?? `${ghUrl}/releases/latest`,
  };
}
