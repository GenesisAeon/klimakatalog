import { CLUSTERS, type ClusterId } from "./cascade";
import type { ClimatePackage, ThemeId } from "./types";

export type CatalogFilters = {
  query: string;
  theme: ThemeId | "alle";
  cluster: ClusterId | "alle";
  selected: string;
  bridge: "alle" | "ohne";
};

export const EMPTY_FILTERS: CatalogFilters = {
  query: "",
  theme: "alle",
  cluster: "alle",
  selected: "",
  bridge: "alle",
};

export const CLUSTER_IDS = CLUSTERS.map((c) => c.id);

export function filterPackages(
  packages: ClimatePackage[],
  filters: CatalogFilters,
): ClimatePackage[] {
  const q = filters.query.trim().toLowerCase();
  const clusterMembers =
    filters.cluster === "alle"
      ? null
      : new Set(CLUSTERS.find((c) => c.id === filters.cluster)?.packageNames ?? []);
  return packages.filter((pkg) => {
    if (filters.theme !== "alle" && !pkg.themes.includes(filters.theme)) return false;
    if (clusterMembers && !clusterMembers.has(pkg.name)) return false;
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
