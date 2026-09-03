import type { ClimatePackage, ThemeId } from "./types";

export type CatalogFilters = {
  query: string;
  theme: ThemeId | "alle";
  selected: string;
  bridge: "alle" | "ohne";
};

export const EMPTY_FILTERS: CatalogFilters = {
  query: "",
  theme: "alle",
  selected: "",
  bridge: "alle",
};

export function filterPackages(
  packages: ClimatePackage[],
  filters: CatalogFilters,
): ClimatePackage[] {
  const q = filters.query.trim().toLowerCase();
  return packages.filter((pkg) => {
    if (filters.theme !== "alle" && !pkg.themes.includes(filters.theme)) return false;
    if (filters.bridge === "ohne" && !pkg.noUtacBridge) return false;
    if (filters.selected && pkg.name !== filters.selected) return false;
    if (!q) return true;
    const hay = [
      pkg.name,
      pkg.title,
      pkg.abstract,
      pkg.keywords.join(" "),
      pkg.packageNumber != null ? `p${pkg.packageNumber}` : "",
      pkg.dois.join(" "),
      pkg.selfDoi ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}
