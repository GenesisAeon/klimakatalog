import type { CitationReference } from "./types";

function unquote(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function normalizeDoi(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/[).,;]+$/, "");
}

function foldedBlock(text: string, key: string): string | null {
  const re = new RegExp(`^${key}:\\s*[>|]\\s*\\n((?:[ \\t]+.*\\n)+)`, "m");
  const match = text.match(re);
  if (!match?.[1]) return null;
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^[ \t]+/, "").trimEnd())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function scalar(text: string, key: string): string | null {
  const folded = foldedBlock(text, key);
  if (folded) return folded;
  const re = new RegExp(`^${key}:\\s*(.+)$`, "m");
  const match = text.match(re);
  if (!match?.[1] || match[1].trim() === ">" || match[1].trim() === "|") return null;
  return unquote(match[1]);
}

function list(text: string, key: string): string[] {
  const re = new RegExp(`^${key}:\\n((?:[ \\t]+- .*(?:\\n|$))+)` , "m");
  const match = text.match(re);
  if (!match?.[1]) return [];
  return match[1]
    .split("\n")
    .map((line) => line.replace(/^[ \t]+-\s*/, "").trim())
    .filter(Boolean)
    .map(unquote);
}

/** Top-level CITATION.cff `doi:` plus `identifiers` entries of type doi. */
export function extractSelfDoiFromCff(text: string): string | null {
  const top = scalar(text, "doi");
  if (top) return normalizeDoi(top);

  const identStart = text.search(/^identifiers:/m);
  if (identStart < 0) return null;
  const rest = text.slice(identStart);
  const match = rest.match(/type:\s*doi\b[\s\S]{0,240}?value:\s*"?([0-9][^\s"]+)"?/i);
  return match?.[1] ? normalizeDoi(match[1]) : null;
}

export function parseReferences(text: string): CitationReference[] {
  const refs: CitationReference[] = [];
  const blocks = text.split(/\n(?=[ \t]+- type:)/);
  for (const block of blocks.slice(1)) {
    const foldedTitle = block.match(/title:\s*[>|]\s*\n((?:[ \t]+.+\n?)+)/);
    const quotedTitle = block.match(/title:\s*"([^"]+)"/);
    const plainTitle = block.match(/title:\s*(.+)/);
    const title = foldedTitle
      ? foldedTitle[1]
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .join(" ")
      : quotedTitle?.[1] || (plainTitle?.[1] && !/^[>|]\s*$/.test(plainTitle[1]) ? plainTitle[1] : "");
    const doiMatch = block.match(/doi:\s*"?([0-9][^\s"]+)"?/);
    const year = block.match(/year:\s*"?(\d{4})"?/)?.[1];
    const journal = block.match(/journal:\s*"([^"]+)"/)?.[1] || block.match(/journal:\s*(.+)/)?.[1];
    const cleanTitle = title ? unquote(title).replace(/\s+/g, " ").trim() : "";
    const doi = doiMatch?.[1] ? normalizeDoi(doiMatch[1]) : undefined;
    if (!cleanTitle && !doi) continue;
    refs.push({
      title: cleanTitle,
      doi,
      year,
      journal: journal ? unquote(journal) : undefined,
    });
  }
  return refs;
}

export function extractReferenceDois(text: string): string[] {
  return [...new Set(parseReferences(text).flatMap((ref) => (ref.doi ? [ref.doi] : [])))];
}

/** @deprecated Mixes package + paper DOIs — use extractSelfDoiFromCff + extractReferenceDois. */
export function extractDois(text: string): string[] {
  const found = text.match(/\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi) ?? [];
  return [...new Set(found.map((doi) => normalizeDoi(doi)))];
}

export function parseZenodoJson(text: string): string | null {
  try {
    const data = JSON.parse(text) as {
      doi?: unknown;
      prereserve_doi?: { doi?: unknown } | string;
    };
    if (typeof data.doi === "string" && data.doi.trim()) return normalizeDoi(data.doi);
    const pre = data.prereserve_doi;
    if (typeof pre === "string" && pre.trim()) return normalizeDoi(pre);
    if (pre && typeof pre === "object" && typeof pre.doi === "string" && pre.doi.trim()) {
      return normalizeDoi(pre.doi);
    }
    return null;
  } catch {
    return null;
  }
}

export function parseCitationCff(text: string) {
  const title = scalar(text, "title") ?? "";
  const version = scalar(text, "version") ?? "";
  const abstract = scalar(text, "abstract") ?? "";
  const keywords = list(text, "keywords");
  const references = parseReferences(text);
  const selfDoi = extractSelfDoiFromCff(text);
  const dois = extractReferenceDois(text);
  const blob = `${abstract}\n${keywords.join(" ")}\n${text.slice(0, 800)}`;
  const noUtacBridge = /no UTAC|ohne UTAC|deliberately no UTAC|NO UTAC/i.test(blob);
  return {
    title,
    version,
    abstract: abstract.replace(/\s+/g, " ").trim(),
    keywords,
    selfDoi,
    dois,
    references,
    noUtacBridge,
  };
}

export function excerptMarkdown(markdown: string, maxChars = 2800): string {
  const withoutImages = markdown.replace(/!\[[^\]]*]\([^)]*\)/g, "");
  if (withoutImages.length <= maxChars) return withoutImages.trim();
  return `${withoutImages.slice(0, maxChars).trimEnd()}\n\n…`;
}

export function displayTitle(name: string, title: string): string {
  const normalized = title.trim();
  if (
    normalized &&
    normalized.toLowerCase() !== name.toLowerCase() &&
    !normalized.toLowerCase().startsWith(name.toLowerCase())
  ) {
    return normalized;
  }
  return name
    .replace(/-utac$/i, "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function doiHref(doi: string): string {
  return `https://doi.org/${normalizeDoi(doi)}`;
}

export function packageCode(n: number | null): string {
  if (n == null) return "—";
  return `P${n}`;
}

export function formatFetchedAt(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
  }).format(date);
}
