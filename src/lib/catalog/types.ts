export const THEME_IDS = [
  "kryosphaere",
  "ozean",
  "biosphaere",
  "atmosphaere",
  "hydrologie",
  "extreme",
  "gesellschaft",
  "kohlenstoff",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export type ClimatePackage = {
  name: string;
  title: string;
  packageNumber: number | null;
  version: string;
  released: string;
  license: string;
  branch: string;
  abstract: string;
  keywords: string[];
  dois: string[];
  selfDoi: string | null;
  themes: ThemeId[];
  noUtacBridge: boolean;
  htmlUrl: string;
  citationUrl: string;
  readmeUrl: string;
  updatedAt?: string;
  live?: boolean;
};

export type CitationReference = {
  title: string;
  doi?: string;
  year?: string;
  journal?: string;
};

export type PackageSources = {
  name: string;
  branch: string;
  citationRaw: string | null;
  abstract: string;
  keywords: string[];
  dois: string[];
  selfDoi: string | null;
  references: CitationReference[];
  version: string;
  title: string;
  noUtacBridge: boolean;
  readme: string | null;
  disclaimer: string | null;
  hasWhitepaper: boolean;
  whitepaperUrl: string | null;
  fetchedAt: string;
  source: "live" | "seed";
};

export type CatalogPayload = {
  source: "github" | "seed";
  fetchedAt: string;
  packages: ClimatePackage[];
  liveCount: number;
  error?: string;
};
