import { createServerFn } from "@tanstack/react-start";
import { SEED_PACKAGES } from "./seed";
import { parseCitationCff, excerptMarkdown, parseZenodoJson } from "./parse-citation";
import type { CatalogPayload, ClimatePackage, PackageSources, ThemeId } from "./types";
import { THEME_IDS } from "./types";

const GITHUB_REPOS = "https://api.github.com/users/GenesisAeon/repos?per_page=100";
const RAW = "https://raw.githubusercontent.com/GenesisAeon";
const UA = "GenesisAeon-Klimakatalog/1.0";
const LIST_TTL_MS = 5 * 60 * 1000;

type GhRepo = {
  name: string;
  description: string | null;
  html_url: string;
  default_branch: string;
  updated_at: string;
  homepage: string | null;
};

const CLIMATE_HINT =
  /climate|glacier|ocean|permafrost|coral|forest|amazon|amoc|aerosol|methane|hydrolog|wetland|biodivers|pollinator|wildfire|flood|ice.?shelf|snowpack|carbon|adaptation|heatwave|acidification|deoxygenation|tipping|cryospher|enso|el.?nino|peatland|vegetation|invasive|gene.?flow|soil.?moisture/i;

const DENY = new Set([
  "neural-avalanche-utac",
  "ai-emergence-utac",
  "beta-clustering-utac",
  "cygnus-jet-utac",
  "eml-utac-bridge",
  "implosive-backreaction-utac",
  "implosive-origin-utac",
  "sandpile-utac",
  "seismic-utac",
  "solar-flare-utac",
  "utac-core",
  "utac-entropic-gravity",
  "utac-metastable-clusters",
]);

const THEME_KEYS: { id: ThemeId; keys: string[] }[] = [
  { id: "kryosphaere", keys: ["glacier", "ice", "permafrost", "snow", "antarctic", "cryosphere", "paraglacial", "snowpack"] },
  { id: "ozean", keys: ["ocean", "marine", "amoc", "coral", "acidification", "deoxygenation", "heatwave", "enso", "el nino"] },
  { id: "biosphaere", keys: ["amazon", "forest", "vegetation", "biodiversity", "pollinator", "invasive", "gene flow", "ecosystem", "forestry"] },
  { id: "atmosphaere", keys: ["cloud", "aerosol", "methane", "shipping", "sensitivity"] },
  { id: "hydrologie", keys: ["hydrology", "water", "freshwater", "soil-moisture", "soil moisture", "peak-water", "aquifer"] },
  { id: "extreme", keys: ["wildfire", "flood", "extreme", "cascading", "tipping", "hazard", "glof", "bleaching"] },
  { id: "gesellschaft", keys: ["adaptation", "socioeconomic", "governance", "urban", "disease", "migration", "public-health"] },
  { id: "kohlenstoff", keys: ["carbon", "methane", "black-carbon", "albedo", "carbon-sink"] },
];

function githubToken(): string | null {
  return process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null;
}

function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": UA,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = githubToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function rawHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "User-Agent": UA, Accept: "text/plain" };
  const token = githubToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchText(url: string, timeoutMs = 8000): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: rawHeaders() });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function nextLink(header: string | null): string | null {
  if (!header) return null;
  return header.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
}

async function fetchAllRepos(): Promise<GhRepo[] | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const repos = await fetchAllReposOnce();
    if (repos) return repos;
    if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
  }
  return null;
}

async function fetchAllReposOnce(): Promise<GhRepo[] | null> {
  const repos: GhRepo[] = [];
  let url: string | null = GITHUB_REPOS;
  for (let page = 0; page < 5 && url; page++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: apiHeaders() });
      if (!res.ok) {
        console.warn(`[catalog] GitHub API ${res.status}`);
        return repos.length ? repos : null;
      }
      const parsed = (await res.json()) as GhRepo[];
      if (!Array.isArray(parsed)) return null;
      repos.push(...parsed);
      url = nextLink(res.headers.get("link"));
    } catch (err) {
      console.warn("[catalog] GitHub API failed", err instanceof Error ? err.message : err);
      return repos.length ? repos : null;
    } finally {
      clearTimeout(timer);
    }
  }
  return repos;
}

function inferThemes(blob: string): ThemeId[] {
  const lower = blob.toLowerCase();
  const found = THEME_KEYS.filter((t) => t.keys.some((k) => lower.includes(k))).map((t) => t.id);
  return found.length ? found : (["atmosphaere"] as ThemeId[]);
}

function isClimateRepo(name: string, description: string): boolean {
  if (DENY.has(name)) return false;
  if (SEED_PACKAGES.some((p) => p.name === name)) return true;
  const blob = `${name} ${description}`;
  if (name.endsWith("-utac") && CLIMATE_HINT.test(blob)) return true;
  if (name.startsWith("climate-") || name.includes("climate")) return true;
  return false;
}

function mergeLive(seed: ClimatePackage[], remote: GhRepo[]): ClimatePackage[] {
  const byName = new Map(seed.map((p) => [p.name, { ...p }]));
  for (const repo of remote) {
    if (!isClimateRepo(repo.name, repo.description ?? "")) continue;
    const existing = byName.get(repo.name);
    if (existing) {
      existing.updatedAt = repo.updated_at;
      existing.live = true;
      existing.branch = repo.default_branch || existing.branch;
      existing.htmlUrl = repo.html_url;
      byName.set(repo.name, existing);
      continue;
    }
    const description = repo.description ?? "";
    byName.set(repo.name, {
      name: repo.name,
      title: repo.name,
      packageNumber: null,
      version: "",
      released: "",
      license: "",
      branch: repo.default_branch || "main",
      abstract: description,
      keywords: [],
      dois: [],
      selfDoi: null,
      themes: inferThemes(`${repo.name} ${description}`).filter((id): id is ThemeId =>
        (THEME_IDS as readonly string[]).includes(id),
      ),
      noUtacBridge: /no UTAC|ohne UTAC|deliberately no/i.test(description),
      htmlUrl: repo.html_url,
      citationUrl: `${RAW}/${repo.name}/${repo.default_branch || "main"}/CITATION.cff`,
      readmeUrl: `${RAW}/${repo.name}/${repo.default_branch || "main"}/README.md`,
      updatedAt: repo.updated_at,
      live: true,
    });
  }
  return [...byName.values()].sort((a, b) => {
    const an = a.packageNumber ?? 9999;
    const bn = b.packageNumber ?? 9999;
    if (an !== bn) return an - bn;
    return a.name.localeCompare(b.name);
  });
}

let listCache: { at: number; payload: CatalogPayload } | null = null;

export const listClimatePackages = createServerFn({ method: "GET" }).handler(
  async (): Promise<CatalogPayload> => {
    const now = Date.now();
    if (listCache && now - listCache.at < LIST_TTL_MS) {
      return listCache.payload;
    }
    const fetchedAt = new Date().toISOString();
    const remote = await fetchAllRepos();
    if (!remote) {
      return (
        listCache?.payload ?? {
          source: "seed",
          fetchedAt,
          packages: SEED_PACKAGES,
          liveCount: 0,
          error: "GitHub nicht erreichbar — lokaler CITATION.cff-Kern.",
        }
      );
    }
    const packages = mergeLive(SEED_PACKAGES, remote);
    const payload: CatalogPayload = {
      source: "github",
      fetchedAt,
      packages,
      liveCount: packages.filter((p) => p.live).length,
    };
    listCache = { at: now, payload };
    return payload;
  },
);

async function readRaw(name: string, branch: string, file: string): Promise<string | null> {
  return fetchText(`${RAW}/${name}/${branch}/${file}`, 8000);
}

export const fetchPackageSources = createServerFn({ method: "GET" })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }): Promise<PackageSources> => {
    const seed = SEED_PACKAGES.find((p) => p.name === data.name);
    const branches = [...new Set([seed?.branch, "main", "master"].filter(Boolean))] as string[];

    let citationRaw: string | null = null;
    let readme: string | null = null;
    let disclaimer: string | null = null;
    let whitepaper: string | null = null;
    let zenodoRaw: string | null = null;
    let usedBranch = seed?.branch ?? "main";

    for (const branch of branches) {
      if (!citationRaw) {
        const text = await readRaw(data.name, branch, "CITATION.cff");
        if (text && text.startsWith("cff-version")) {
          citationRaw = text;
          usedBranch = branch;
        }
      }
    }

    const extras = await Promise.all([
      readRaw(data.name, usedBranch, "README.md"),
      readRaw(data.name, usedBranch, "DISCLAIMER.md"),
      readRaw(data.name, usedBranch, "WHITEPAPER.md"),
      readRaw(data.name, usedBranch, ".zenodo.json"),
    ]);
    readme = extras[0];
    disclaimer = extras[1];
    whitepaper = extras[2];
    zenodoRaw = extras[3];

    if (!readme || !disclaimer || !whitepaper) {
      for (const branch of branches.filter((b) => b !== usedBranch)) {
        if (!readme) readme = await readRaw(data.name, branch, "README.md");
        if (!disclaimer) disclaimer = await readRaw(data.name, branch, "DISCLAIMER.md");
        if (!whitepaper) whitepaper = await readRaw(data.name, branch, "WHITEPAPER.md");
        if (!zenodoRaw) zenodoRaw = await readRaw(data.name, branch, ".zenodo.json");
      }
    }

    const parsed = citationRaw ? parseCitationCff(citationRaw) : null;
    const zenodoDoi = zenodoRaw ? parseZenodoJson(zenodoRaw) : null;
    const live = Boolean(citationRaw || readme);
    const hasWhitepaper = Boolean(whitepaper && whitepaper.length > 20);

    return {
      name: data.name,
      branch: usedBranch,
      citationRaw,
      abstract: parsed?.abstract || seed?.abstract || "",
      keywords: parsed?.keywords.length ? parsed.keywords : (seed?.keywords ?? []),
      dois: parsed?.dois.length ? parsed.dois : (seed?.dois ?? []),
      selfDoi: zenodoDoi || parsed?.selfDoi || seed?.selfDoi || null,
      references: parsed?.references ?? [],
      version: parsed?.version || seed?.version || "",
      title: parsed?.title || seed?.title || data.name,
      noUtacBridge: parsed?.noUtacBridge || seed?.noUtacBridge || /no UTAC/i.test(disclaimer ?? ""),
      readme: readme ? excerptMarkdown(readme) : null,
      disclaimer: disclaimer ? excerptMarkdown(disclaimer, 1800) : null,
      hasWhitepaper,
      whitepaperUrl: hasWhitepaper
        ? `https://github.com/GenesisAeon/${data.name}/blob/${usedBranch}/WHITEPAPER.md`
        : null,
      fetchedAt: new Date().toISOString(),
      source: live ? "live" : "seed",
    };
  });
